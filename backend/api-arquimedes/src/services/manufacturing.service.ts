import prisma from './prisma';

let simulationActive = false;
let activeEvent = 'NORMAL'; // 'NORMAL', 'RAW_MATERIAL_DEFECT', 'MACHINE_DECALIBRATION'
let upgradedMachines: Record<string, boolean> = {}; // track preventative maintenance upgrades
let lineBalanced = false; // track if robot arm balance applied

// In-memory runtime values for the machines
const machineStates: Record<
  string,
  {
    status: 'OPERATIONAL' | 'DOWN' | 'DEGRADED';
    temperature: number;
    currentCycleTime: number;
    energyRate: number;
  }
> = {};

export class ManufacturingService {
  // Get active line and machines with current status
  async getLineState() {
    const line = await prisma.assemblyLine.findFirst({
      include: {
        machines: true
      }
    });

    if (!line) return null;

    // Initialize in-memory state for machines if not present
    line.machines.forEach((m) => {
      if (!machineStates[m.id]) {
        machineStates[m.id] = {
          status: 'OPERATIONAL',
          temperature: 45.0 + Math.random() * 5.0,
          currentCycleTime: m.nominalCycleTime,
          energyRate: 1.2
        };
      }
    });

    const machinesWithState = line.machines.map((m) => {
      const state = machineStates[m.id];

      // Dynamic adjustments based on events and upgrades
      let nominal = m.nominalCycleTime;
      if (m.type === 'ROBOTIC_ARM') {
        if (lineBalanced) {
          nominal = 6.0; // Balanced
        } else {
          nominal = 7.5; // Bottleneck trap
        }
      }

      return {
        id: m.id,
        type: m.type,
        sequenceOrder: m.sequenceOrder,
        nominalCycleTime: nominal,
        status: state.status,
        temperature: parseFloat(state.temperature.toFixed(1)),
        currentCycleTime: parseFloat(state.currentCycleTime.toFixed(2)),
        energyRate: parseFloat(state.energyRate.toFixed(3)),
        upgraded: upgradedMachines[m.id] || false
      };
    });

    return {
      id: line.id,
      name: line.name,
      targetUPH: line.targetUPH,
      machines: machinesWithState,
      lineBalanced,
      activeEvent
    };
  }

  // Calculate Overall Equipment Effectiveness (OEE) metrics
  async calculateOeeMetrics() {
    const line = await prisma.assemblyLine.findFirst();
    if (!line) return null;

    // 1. Availability calculation
    // Total scheduled time = last 10 batches * 8 hours = 80 hours = 288,000 seconds
    const scheduledTimeSec = 10 * 8 * 3600;
    const downtimeSum = await prisma.downtimeLog.aggregate({
      _sum: { durationSecs: true }
    });

    let totalDowntimeSec = downtimeSum._sum.durationSecs || 0;

    // Mantenimiento preventivo upgrade reduces downtime by 50%
    const upgradedCount = Object.values(upgradedMachines).filter((v) => v).length;
    if (upgradedCount > 0) {
      totalDowntimeSec = Math.round(totalDowntimeSec * (1 - upgradedCount * 0.12)); // 12% reduction per upgraded machine
    }

    const operatingTimeSec = Math.max(0, scheduledTimeSec - totalDowntimeSec);
    const availability = scheduledTimeSec > 0 ? operatingTimeSec / scheduledTimeSec : 0;

    // 2. Performance calculation
    // Total pieces produced across all batches
    const batchAgg = await prisma.productionBatch.aggregate({
      _sum: { totalProduced: true, defectsFound: true }
    });

    const totalProduced = batchAgg._sum.totalProduced || 0;
    const totalDefects = batchAgg._sum.defectsFound || 0;

    // Ideal cycle time is 6.0 seconds per piece
    const idealCycleTime = 6.0;

    // Performance = (Ideal Time * Total Produced) / Operating Time
    const performance =
      operatingTimeSec > 0 ? (totalProduced * idealCycleTime) / operatingTimeSec : 0;

    // 3. Quality calculation
    // Quality = (Total Produced - Defects) / Total Produced
    const quality = totalProduced > 0 ? (totalProduced - totalDefects) / totalProduced : 0;

    // OEE = Availability * Performance * Quality
    const oee = availability * performance * quality;

    // 4. Six Sigma Control Chart calculations (last 10 batches)
    const batches = await prisma.productionBatch.findMany({
      orderBy: { startTime: 'desc' },
      take: 10
    });

    const controlChartData = batches
      .map((b, idx) => {
        const batchProduced = b.totalProduced;
        const batchDefects = b.defectsFound;
        const defectRate = batchProduced > 0 ? (batchDefects / batchProduced) * 100 : 0;

        // Control limits calculations (based on Seis Sigma p-chart)
        // average defect rate is ~0.5% normally, but spikes with tool wear
        const cl = 0.5;
        const ucl = 2.5;
        const lcl = 0.0;

        return {
          batchId: b.id.substring(0, 5),
          rate: parseFloat(defectRate.toFixed(2)),
          CL: cl,
          UCL: ucl,
          LCL: lcl,
          totalProduced: batchProduced,
          defectsFound: batchDefects
        };
      })
      .reverse();

    return {
      availability: parseFloat((availability * 100).toFixed(1)),
      performance: parseFloat((Math.min(1.0, performance) * 100).toFixed(1)),
      quality: parseFloat((quality * 100).toFixed(1)),
      oee: parseFloat((Math.min(1.0, oee) * 100).toFixed(1)),
      kpis: {
        totalProduced,
        totalDefects,
        scrapRate: parseFloat(((totalDefects / totalProduced) * 100).toFixed(2)),
        yieldRate: parseFloat(((1 - totalDefects / totalProduced) * 100).toFixed(2))
      },
      controlChartData
    };
  }

  // Get log of machinery paradas
  async getDowntimeLogs() {
    const logs = await prisma.downtimeLog.findMany({
      include: {
        machine: true
      },
      orderBy: { timestamp: 'desc' },
      take: 15
    });

    return logs.map((l) => ({
      id: l.id,
      machineId: l.machineId,
      machineType: l.machine.type,
      reasonCode: l.reasonCode,
      durationSecs: l.durationSecs,
      timestamp: l.timestamp.toISOString()
    }));
  }

  // Upgrade preventative maintenance for a machine
  async upgradeMachine(machineId: string) {
    upgradedMachines[machineId] = true;

    // Instantly restore machine operational state if it was degraded
    if (machineStates[machineId]) {
      machineStates[machineId].status = 'OPERATIONAL';
      machineStates[machineId].temperature = 42.0;
    }

    return { success: true, upgradedMachines };
  }

  // Perform Assembly Line Balancing (TOC improvement)
  setLineBalance(balance: boolean) {
    lineBalanced = balance;
    return { success: true, lineBalanced };
  }

  setSimulationActive(active: boolean) {
    simulationActive = active;
    return { simulationActive };
  }

  getSimulationActive() {
    return simulationActive;
  }

  setActiveEvent(event: string) {
    activeEvent = event;
    return { activeEvent };
  }

  getActiveEvent() {
    return activeEvent;
  }

  // Simulation tick ( virtual PLC event generator )
  async runSimulationStep() {
    if (!simulationActive) return null;

    const line = await prisma.assemblyLine.findFirst({
      include: { machines: true }
    });

    if (!line) return null;

    // Pick active batch or create one if none exists
    let batch = await prisma.productionBatch.findFirst({
      where: { endTime: null }
    });

    if (!batch) {
      batch = await prisma.productionBatch.create({
        data: {
          lineId: line.id,
          totalProduced: 0,
          defectsFound: 0,
          startTime: new Date()
        }
      });
    }

    const stepTelemetry = [];

    // Advance simulation stats for each machine
    for (const machine of line.machines) {
      const state = machineStates[machine.id] || {
        status: 'OPERATIONAL',
        temperature: 45.0,
        currentCycleTime: machine.nominalCycleTime,
        energyRate: 1.2
      };

      // 1. Calculate actual cycle time based on balance & decailbration events
      let nominal = machine.nominalCycleTime;
      if (machine.type === 'ROBOTIC_ARM') {
        nominal = lineBalanced ? 6.0 : 7.5; // Bottleneck simulation
      }

      let actual = nominal + (Math.random() - 0.5) * 0.4;
      let energy = 1.2;

      // Handle DOWN recovery
      if (state.status === 'DOWN') {
        if (Math.random() < 0.25) {
          state.status = 'OPERATIONAL';
        } else {
          // Stay DOWN
          actual = 0;
          energy = 0.1;
          state.temperature = Math.max(35.0, state.temperature - 2.0);
        }
      }

      // If operational or degraded, run standard simulation
      if (state.status !== 'DOWN') {
        // Decalibration crisis event increases cycle time
        if (activeEvent === 'MACHINE_DECALIBRATION' && machine.sequenceOrder === 1) {
          actual += 2.0;
          state.status = 'DEGRADED';
        } else {
          state.status = 'OPERATIONAL';
        }

        // 2. Temperature fluctuations
        let baseTemp = 45.0;
        if (state.status === 'DEGRADED') baseTemp = 75.0;
        state.temperature = baseTemp + (Math.random() - 0.5) * 4.0;

        // 3. Energy consumption
        // Raw material defect event increases CNC cutting friction -> higher temperature & energy!
        if (activeEvent === 'RAW_MATERIAL_DEFECT' && machine.type === 'CNC') {
          energy = 2.5;
          state.temperature += 15.0;
        }
      }

      state.energyRate = energy;
      state.currentCycleTime = actual;

      machineStates[machine.id] = state;

      // Random breakdown failure check (2% chance per tick)
      // Upgraded machines have a 0.2% chance (preventative maintenance)
      const failChance = upgradedMachines[machine.id] ? 0.002 : 0.02;
      if (Math.random() < failChance && state.status !== 'DOWN') {
        state.status = 'DOWN';
        state.currentCycleTime = 0;
        state.energyRate = 0.1;
        state.temperature = 35.0;

        // Log downtime event in DB
        await prisma.downtimeLog.create({
          data: {
            machineId: machine.id,
            reasonCode: Math.random() < 0.5 ? 'ERR_MATERIAL_JAM' : 'ERR_MOTOR_TEMP',
            durationSecs: 300 + Math.floor(Math.random() * 900)
          }
        });
      }

      // Record telemetry in DB
      const tel = await prisma.machineTelemetry.create({
        data: {
          machineId: machine.id,
          actualCycleTime: parseFloat(actual.toFixed(2)),
          energyConsumed: parseFloat((energy * (actual / 3600)).toFixed(5)) // kWh
        }
      });

      stepTelemetry.push(tel);
    }

    // 4. Update production quantities in the current batch
    let defects = 0;
    if (activeEvent === 'RAW_MATERIAL_DEFECT') {
      defects = Math.random() < 0.4 ? 1 : 0; // high defect rate due to raw material
    } else {
      defects = Math.random() < 0.03 ? 1 : 0; // normal 3% scrap rate
    }

    await prisma.productionBatch.update({
      where: { id: batch.id },
      data: {
        totalProduced: { increment: 10 }, // simulate 10 pieces completed
        defectsFound: { increment: defects }
      }
    });

    return {
      telemetry: stepTelemetry,
      batchId: batch.id,
      defectsFound: defects
    };
  }
}
