import prisma from './prisma';

export interface AgroEvent {
  type: 'OLA_DE_CALOR' | 'SEQUIA' | 'NORMAL';
  severity: number;
}

let activeAgroEvent: AgroEvent = { type: 'NORMAL', severity: 0 };
let totalWaterUsedLiters = 0;
let cropHealthMultiplier = 1.0; // 1.0 is healthy, drops with stress

export class AgrotechService {

  // Get active agricultural crisis
  getActiveEvent() {
    return activeAgroEvent;
  }

  // Trigger or resolve crisis
  triggerEvent(type: 'OLA_DE_CALOR' | 'SEQUIA' | 'NORMAL', severity: number) {
    activeAgroEvent = { type, severity };
    return activeAgroEvent;
  }

  // Get metrics KPIs
  getMetricsKPIs() {
    return {
      waterConsumed: totalWaterUsedLiters,
      cropHealth: Math.round(cropHealthMultiplier * 100),
      activeEvent: activeAgroEvent.type,
      activeEventSeverity: activeAgroEvent.severity
    };
  }

  // Get all agricultural zones, with their sensors, valves, and latest readings
  async getZones() {
    const zones = await prisma.agroZone.findMany({
      include: {
        sensors: true,
        valves: true
      }
    });

    // Map each sensor to include its current value (latest telemetry reading)
    const enrichedZones = await Promise.all(zones.map(async zone => {
      const enrichedSensors = await Promise.all(zone.sensors.map(async sensor => {
        const latestReading = await prisma.agroTelemetry.findFirst({
          where: { sensorId: sensor.id },
          orderBy: { timestamp: 'desc' }
        });
        return {
          id: sensor.id,
          zoneId: sensor.zoneId,
          type: sensor.type as any,
          isActive: sensor.isActive,
          currentValue: latestReading ? latestReading.value : 0
        };
      }));

      return {
        id: zone.id,
        name: zone.name,
        cropType: zone.cropType,
        sensors: enrichedSensors,
        valves: zone.valves.map(v => ({
          id: v.id,
          name: v.name,
          status: v.status,
          lastActivated: v.lastActivated ? v.lastActivated.toISOString() : null
        }))
      };
    }));

    return enrichedZones;
  }

  // Get aggregated historical data to prevent browser memory leaks
  // Range options: '24h' (grouped by hour), '7d' (grouped by day), '30d' (grouped by day)
  async getHistoricalTelemetry(zoneId: string, sensorType: string, range: '24h' | '7d' | '30d' = '24h') {
    const sensor = await prisma.agroSensor.findFirst({
      where: { zoneId, type: sensorType }
    });
    if (!sensor) return [];

    const now = new Date();
    let cutOffDate = new Date();

    if (range === '24h') {
      cutOffDate.setHours(now.getHours() - 24);
    } else if (range === '7d') {
      cutOffDate.setDate(now.getDate() - 7);
    } else {
      cutOffDate.setDate(now.getDate() - 30);
    }

    // Retrieve raw telemetries in range
    const readings = await prisma.agroTelemetry.findMany({
      where: {
        sensorId: sensor.id,
        timestamp: { gte: cutOffDate }
      },
      orderBy: { timestamp: 'asc' }
    });

    // Aggregate programmatically or by database group-by
    // (programmatic is safer across different timezone behaviors in PostgreSQL/SQLite)
    if (range === '24h') {
      // Group by hour
      const hourlyData: { [key: string]: { sum: number, count: number, timestamp: Date } } = {};
      readings.forEach(r => {
        const d = new Date(r.timestamp);
        d.setMinutes(0, 0, 0); // Round to hour
        const key = d.toISOString();
        if (!hourlyData[key]) {
          hourlyData[key] = { sum: 0, count: 0, timestamp: d };
        }
        hourlyData[key].sum += r.value;
        hourlyData[key].count += 1;
      });

      return Object.values(hourlyData).map(h => ({
        timestamp: h.timestamp.toISOString(),
        value: parseFloat((h.sum / h.count).toFixed(2))
      }));
    } else {
      // Group by day
      const dailyData: { [key: string]: { sum: number, count: number, timestamp: Date } } = {};
      readings.forEach(r => {
        const d = new Date(r.timestamp);
        d.setHours(0, 0, 0, 0); // Round to day
        const key = d.toISOString().split('T')[0];
        if (!dailyData[key]) {
          dailyData[key] = { sum: 0, count: 0, timestamp: d };
        }
        dailyData[key].sum += r.value;
        dailyData[key].count += 1;
      });

      return Object.values(dailyData).map(d => ({
        timestamp: d.timestamp.toISOString().split('T')[0],
        value: parseFloat((d.sum / d.count).toFixed(2))
      }));
    }
  }

  // Irrigation rules manager
  async getRules() {
    return prisma.irrigationRule.findMany();
  }

  async createRule(data: {
    zoneId: string;
    name: string;
    sensorType: string;
    operator: 'LT' | 'GT';
    thresholdValue: number;
    durationMinutes: number;
  }) {
    return prisma.irrigationRule.create({
      data: {
        zoneId: data.zoneId,
        name: data.name,
        sensorType: data.sensorType,
        operator: data.operator,
        thresholdValue: data.thresholdValue,
        durationMinutes: data.durationMinutes,
        isActive: true
      }
    });
  }

  async deleteRule(id: string) {
    return prisma.irrigationRule.delete({
      where: { id }
    });
  }

  // Get historical pest records
  async getHistoricalPests() {
    return prisma.pestHistoricalRecord.findMany({
      orderBy: { outbreakDate: 'desc' }
    });
  }

  // Manual override for valves
  async setValveStatus(id: string, status: 'ABIERTA' | 'CERRADA') {
    return prisma.agroValve.update({
      where: { id },
      data: {
        status,
        lastActivated: status === 'ABIERTA' ? new Date() : undefined
      }
    });
  }

  // Reset/Purge simulation state
  async resetSimulation() {
    totalWaterUsedLiters = 0;
    cropHealthMultiplier = 1.0;
    activeAgroEvent = { type: 'NORMAL', severity: 0 };
    await prisma.agroValve.updateMany({
      data: { status: 'CERRADA' }
    });
  }

  // Simulation loop tick (hourStep represents simulated time passing)
  async runSimulationStep(hourStep: number) {
    const zones = await prisma.agroZone.findMany({
      include: { sensors: true, valves: true }
    });
    const rules = await prisma.irrigationRule.findMany({
      where: { isActive: true }
    });

    const now = new Date();

    for (const zone of zones) {
      // 1. Check active valve and calculate water spent
      const valve = zone.valves[0]; // 1 valve per zone
      let isWatering = valve && valve.status === 'ABIERTA';

      // Auto close valve if duration exceeded
      if (isWatering && valve.lastActivated) {
        const elapsedMinutes = (now.getTime() - new Date(valve.lastActivated).getTime()) / 60000;
        // In our simulation scale, 3 seconds = 1 hour (60 mins).
        // So let's check if the valve's programmed duration has elapsed.
        // If elapsedMinutes > ruleDuration (scaled)
        // Let's find matching active rule for this zone
        const matchingRule = rules.find(r => r.zoneId === zone.id);
        if (matchingRule) {
          // Duration in simulated minutes
          // Let's say if it exceeds the duration:
          const simMinutesElapsed = elapsedMinutes * 20; // 1 real min = 20 simulated hours = 1200 sim mins
          if (simMinutesElapsed >= matchingRule.durationMinutes) {
            await prisma.agroValve.update({
              where: { id: valve.id },
              data: { status: 'CERRADA' }
            });
            isWatering = false;
          }
        }
      }

      if (isWatering) {
        // consumes 50 liters of water per simulated hour
        totalWaterUsedLiters += 50 * hourStep;
      }

      // 2. Fetch sensor readings and update
      for (const sensor of zone.sensors) {
        const latestReading = await prisma.agroTelemetry.findFirst({
          where: { sensorId: sensor.id },
          orderBy: { timestamp: 'desc' }
        });

        let currentVal = latestReading ? latestReading.value : 0;

        // Apply environmental simulation
        if (sensor.type === 'RADIATION') {
          // Simulating day cycle
          const hrOfDay = now.getHours();
          if (hrOfDay >= 6 && hrOfDay <= 18) {
            const cycle = Math.sin((hrOfDay - 6) / 12 * Math.PI);
            currentVal = 400 + cycle * 500 + Math.random() * 20;
          } else {
            currentVal = 0;
          }
        } else if (sensor.type === 'TEMPERATURE') {
          const hrOfDay = now.getHours();
          const cycle = Math.sin((hrOfDay - 8) / 24 * 2 * Math.PI);
          let baseTemp = 20 + cycle * 8 + Math.random() * 1.5;

          // Crisis modifiers
          if (activeAgroEvent.type === 'OLA_DE_CALOR') {
            baseTemp += 10 + activeAgroEvent.severity * 2; // severe heat
          }
          currentVal = baseTemp;
        } else if (sensor.type === 'SOIL_MOISTURE') {
          // drying rate
          let dryingRate = 0.15; // 0.15% drop per hour
          if (activeAgroEvent.type === 'OLA_DE_CALOR') {
            dryingRate *= 2.5;
          } else if (activeAgroEvent.type === 'SEQUIA') {
            dryingRate *= 3.0;
          }

          if (isWatering) {
            currentVal += 8.0 * hourStep; // increases by 8% per hour
          } else {
            currentVal -= dryingRate * hourStep;
          }
          currentVal = Math.max(5, Math.min(98, currentVal));

          // Monitor Crop Health based on moisture
          if (currentVal < 20 || currentVal > 90) {
            // stressed plant decays health
            cropHealthMultiplier -= 0.005 * hourStep;
          } else {
            // recovery
            cropHealthMultiplier = Math.min(1.0, cropHealthMultiplier + 0.002 * hourStep);
          }
        } else if (sensor.type === 'PH') {
          // very stable, slight fluctuation if watering
          if (isWatering) {
            currentVal += (6.5 - currentVal) * 0.05 * hourStep; // converges to 6.5 pH
          } else {
            currentVal += (Math.random() - 0.5) * 0.02;
          }
          currentVal = Math.max(4.0, Math.min(9.0, currentVal));
        }

        // Save new telemetry
        await prisma.agroTelemetry.create({
          data: {
            sensorId: sensor.id,
            value: parseFloat(currentVal.toFixed(2)),
            timestamp: now
          }
        });

        // 3. Evaluate rules engine
        // If soil moisture is low, trigger rule
        if (sensor.type === 'SOIL_MOISTURE') {
          const zoneRules = rules.filter(r => r.zoneId === zone.id && r.sensorType === 'SOIL_MOISTURE');
          for (const rule of zoneRules) {
            let matches = false;
            if (rule.operator === 'LT' && currentVal < rule.thresholdValue) {
              matches = true;
            } else if (rule.operator === 'GT' && currentVal > rule.thresholdValue) {
              matches = true;
            }

            if (matches && !isWatering) {
              // Trigger electrovalve open
              await prisma.agroValve.update({
                where: { id: `valve-${zone.id}` },
                data: {
                  status: 'ABIERTA',
                  lastActivated: now
                }
              });
            }
          }
        }
      }
    }
  }
}
