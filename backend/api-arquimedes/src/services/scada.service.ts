import prisma from './prisma';

// In-memory SCADA live state mapping asset TagId -> Live Telemetry Map
interface LiveState {
  tagId: string;
  assetType: string;
  status: string;
  location: string;
  telemetry: Record<string, number>;
}

let scadaLiveState: Record<string, LiveState> = {};
let breakersState: Record<string, boolean> = {
  "WTG-01": true,
  "WTG-02": true,
  "PV-ARRAY-01": true,
  "PV-ARRAY-02": true,
  "INV-01": true,
  "INV-02": true,
  "TRAFO-01": true
};

let windPitchState: Record<string, number> = {
  "WTG-01": 0,
  "WTG-02": 0
};

// Pedagogical scenarios
let transmissionLineFault = false;
let voltageSagActive = false;

// Internal active alarms list
let activeAlarms: any[] = [];

export class ScadaService {

  // Initialize in-memory live state from database
  async initializeState() {
    const dbAssets = await prisma.scadaAsset.findMany();
    if (dbAssets.length === 0) return;

    dbAssets.forEach(asset => {
      scadaLiveState[asset.tagId] = {
        tagId: asset.tagId,
        assetType: asset.assetType,
        status: asset.status,
        location: asset.location,
        telemetry: {}
      };
    });

    // Populate initial alarms from DB
    const dbAlarms = await prisma.assetAlarm.findMany({
      where: { clearedAt: null }
    });
    activeAlarms = dbAlarms.map(a => ({
      id: a.id,
      assetId: a.assetId,
      alarmCode: a.alarmCode,
      description: a.description,
      severity: a.severity,
      triggeredAt: a.triggeredAt,
      acknowledgedAt: a.acknowledgedAt,
      clearedAt: null,
      priority: 'Hardware',
      isAck: a.acknowledgedAt !== null
    }));
  }

  getLiveState() {
    return Object.values(scadaLiveState);
  }

  getBreakers() {
    return breakersState;
  }

  getPitchAngles() {
    return windPitchState;
  }

  getScenarios() {
    return { transmissionLineFault, voltageSagActive };
  }

  getActiveAlarms() {
    return activeAlarms;
  }

  // Acknowledge alarm (ISA 18.2 compliant)
  async acknowledgeAlarm(alarmId: string, priority: string) {
    const idx = activeAlarms.findIndex(a => a.id === alarmId);
    if (idx !== -1) {
      const ackDate = new Date();
      activeAlarms[idx].acknowledgedAt = ackDate;
      activeAlarms[idx].isAck = true;
      activeAlarms[idx].priority = priority;

      // Sync to database if exists
      try {
        await prisma.assetAlarm.update({
          where: { id: alarmId },
          data: { acknowledgedAt: ackDate }
        });
      } catch (err) {
        // Safe fail
      }
    }
    return activeAlarms;
  }

  // Set control (breakers, pitch angle)
  async adjustControl(tagId: string, parameter: string, value: any) {
    if (parameter === 'BREAKER') {
      breakersState[tagId] = !!value;
      
      // Update asset status online/offline
      if (scadaLiveState[tagId]) {
        if (!value) {
          scadaLiveState[tagId].status = 'OFFLINE';
        } else {
          // If breaker closed, return to normal status (unless it has active critical alarms)
          const hasCriticalAlarm = activeAlarms.some(a => a.assetId === tagId && a.severity === 'CRITICAL');
          scadaLiveState[tagId].status = hasCriticalAlarm ? 'FAULT' : 'ONLINE';
        }
        
        try {
          const dbAsset = await prisma.scadaAsset.findUnique({ where: { tagId } });
          if (dbAsset) {
            await prisma.scadaAsset.update({
              where: { id: dbAsset.id },
              data: { status: scadaLiveState[tagId].status }
            });
          }
        } catch (err) {}
      }
    } 
    else if (parameter === 'PITCH') {
      if (windPitchState[tagId] !== undefined) {
        windPitchState[tagId] = Math.max(0, Math.min(45, parseFloat(value)));
      }
    }
    return { breakersState, windPitchState };
  }

  // Trigger scenarios
  async triggerScenario(scenario: string, active: boolean) {
    if (scenario === 'LINE_FAULT') {
      transmissionLineFault = active;
      if (active) {
        // Trip main transformer breaker
        breakersState["TRAFO-01"] = false;
        scadaLiveState["TRAFO-01"].status = 'FAULT';
        
        // Spawn alarm
        const alarmId = `alarm-tx-line-${Date.now()}`;
        const newAlarm = {
          id: alarmId,
          assetId: "TRAFO-01",
          alarmCode: "ALM_GRID_TRIP",
          description: "Cortocircuito en Línea de Transmisión Principal. Disyuntor TRAFO-01 abierto por sobrecorriente.",
          severity: "CRITICAL",
          triggeredAt: new Date(),
          acknowledgedAt: null,
          clearedAt: null,
          priority: 'Hardware',
          isAck: false
        };
        activeAlarms.push(newAlarm);
        
        try {
          const dbAsset = await prisma.scadaAsset.findUnique({ where: { tagId: "TRAFO-01" } });
          if (dbAsset) {
            await prisma.assetAlarm.create({
              data: {
                id: alarmId,
                assetId: dbAsset.id,
                alarmCode: "ALM_GRID_TRIP",
                description: newAlarm.description,
                severity: "CRITICAL",
                triggeredAt: newAlarm.triggeredAt
              }
            });
          }
        } catch (err) {}
      } else {
        // Clear transformer grid alarm
        activeAlarms = activeAlarms.filter(a => a.alarmCode !== "ALM_GRID_TRIP");
        breakersState["TRAFO-01"] = true;
        scadaLiveState["TRAFO-01"].status = 'ONLINE';
      }
    } 
    else if (scenario === 'VOLTAGE_SAG') {
      voltageSagActive = active;
      if (active) {
        // Spawn warning alarm
        const alarmId = `alarm-sag-${Date.now()}`;
        const newAlarm = {
          id: alarmId,
          assetId: "TRAFO-01",
          alarmCode: "WRN_VOLT_SAG",
          description: "Caída de tensión de red (Voltage Sag 30%) - compensar reactiva",
          severity: "HIGH",
          triggeredAt: new Date(),
          acknowledgedAt: null,
          clearedAt: null,
          priority: 'Hardware',
          isAck: false
        };
        activeAlarms.push(newAlarm);
      } else {
        activeAlarms = activeAlarms.filter(a => a.alarmCode !== "WRN_VOLT_SAG");
      }
    }
    return { transmissionLineFault, voltageSagActive, activeAlarms };
  }

  // Get historical telemetries for graphs
  async getTelemetryHistory(tagId: string, parameter: string, limit = 50) {
    const dbAsset = await prisma.scadaAsset.findUnique({ where: { tagId } });
    if (!dbAsset) return [];

    return prisma.assetTelemetry.findMany({
      where: {
        assetId: dbAsset.id,
        parameter
      },
      orderBy: { timestamp: 'desc' },
      take: limit
    });
  }

  // Calculate live values loop (OPC-UA virtual service tick, called every 1-2s)
  async updateTelemetryStep() {
    if (Object.keys(scadaLiveState).length === 0) {
      await this.initializeState();
    }

    const now = new Date();
    const hour = now.getHours();

    // Clima base variables
    const irradiance = (hour >= 6 && hour <= 18) 
      ? Math.sin((hour - 6) / 12 * Math.PI) * 920 + Math.random() * 40 
      : 0;
    
    // Wind curve Weibull approx base
    const baseWind = 7.5 + Math.sin(now.getTime() / 60000) * 3;
    const windSpeed = baseWind + Math.random() * 1.5;

    let totalGeneracionMW = 0;

    // 1. Process Solar Panel arrays
    const solarAssets = ["PV-ARRAY-01", "PV-ARRAY-02"];
    solarAssets.forEach(tag => {
      const state = scadaLiveState[tag];
      if (!state) return;

      const breaker = breakersState[tag];
      const panelTemp = 18 + (irradiance * 0.032) + Math.random() * 2;
      
      // Physical calculation: Solar power
      let powerkW = 0;
      if (breaker && irradiance > 0) {
        powerkW = (irradiance * 8000 * 0.20 * (1 - 0.004 * (panelTemp - 25))) / 1000;
        powerkW = Math.max(0, powerkW);
      }

      const voltage = breaker && irradiance > 0 ? 580 + Math.random() * 30 : 0;
      const current = voltage > 0 ? (powerkW * 1000) / voltage : 0;

      state.telemetry = {
        "IRRADIANCE": parseFloat(irradiance.toFixed(1)),
        "TEMPERATURE": parseFloat(panelTemp.toFixed(1)),
        "POWER": parseFloat((powerkW / 1000).toFixed(3)), // MW
        "VOLTAGE": parseFloat(voltage.toFixed(1)),
        "CURRENT": parseFloat(current.toFixed(1))
      };
    });

    // 2. Process Inverters
    const inverterAssets = ["INV-01", "INV-02"];
    inverterAssets.forEach(tag => {
      const state = scadaLiveState[tag];
      if (!state) return;

      const breaker = breakersState[tag];
      const matchingPV = tag === "INV-01" ? "PV-ARRAY-01" : "PV-ARRAY-02";
      const pvPowerMW = scadaLiveState[matchingPV]?.telemetry["POWER"] || 0;
      const efficiency = 0.982;

      let powerOutMW = breaker ? pvPowerMW * efficiency : 0;
      let temp = 35 + (powerOutMW * 28) + Math.random() * 4;

      // Anomaly: INV-02 has filter clogging -> overtemp
      if (tag === "INV-02" && breaker) {
        temp += 28.5; // Additional heat
        
        // Spawn/Keep active alarm
        if (temp > 82 && !activeAlarms.some(a => a.alarmCode === "ALM_INV_OVERTEMP")) {
          const alarmId = `alarm-inv-${Date.now()}`;
          activeAlarms.push({
            id: alarmId,
            assetId: tag,
            alarmCode: "ALM_INV_OVERTEMP",
            description: "Falla de refrigeración en inversor central - temperatura crítica por filtros tapados",
            severity: "HIGH",
            triggeredAt: now,
            acknowledgedAt: null,
            clearedAt: null,
            priority: 'Hardware',
            isAck: false
          });
          state.status = 'FAULT';
        }
      }

      state.telemetry = {
        "TEMPERATURE": parseFloat(temp.toFixed(1)),
        "POWER": parseFloat(powerOutMW.toFixed(3))
      };
      
      totalGeneracionMW += powerOutMW;
    });

    // 3. Process Wind Turbines
    const windAssets = ["WTG-01", "WTG-02"];
    windAssets.forEach(tag => {
      const state = scadaLiveState[tag];
      if (!state) return;

      const breaker = breakersState[tag];
      const pitch = windPitchState[tag];

      // Physical Cp calculation affected by blade pitch
      const pitchRad = (pitch * Math.PI) / 180;
      const Cp = Math.max(0, 0.40 * Math.cos(pitchRad));
      const sweptArea = 6361; // m2 (radius = 45m)
      
      let powerkW = 0;
      let rpm = 0;
      
      if (breaker && windSpeed >= 3 && windSpeed <= 25) {
        powerkW = 0.5 * 1.225 * sweptArea * Math.pow(windSpeed, 3) * Cp * 0.9 / 1000;
        powerkW = Math.min(2500, powerkW); // clamp to 2.5 MW
        rpm = 8 + (windSpeed * 0.55) * Math.cos(pitchRad) + Math.random();
      }

      let vibration = 1.6 + Math.random() * 0.3;
      if (tag === "WTG-01") {
        vibration += 4.5; // High vibration wear anomaly
        
        // Trigger alarm
        if (vibration > 5.8 && !activeAlarms.some(a => a.alarmCode === "ALM_WTG_VIBRATION")) {
          const alarmId = `alarm-wtg-${Date.now()}`;
          activeAlarms.push({
            id: alarmId,
            assetId: tag,
            alarmCode: "ALM_WTG_VIBRATION",
            description: "Espectro de vibraciones elevado en descansos multiplicadora turbina - anomalía rodamiento",
            severity: "CRITICAL",
            triggeredAt: now,
            acknowledgedAt: null,
            clearedAt: null,
            priority: 'Hardware',
            isAck: false
          });
          state.status = 'FAULT';
        }
      }

      const powerMW = powerkW / 1000;

      state.telemetry = {
        "WIND_SPEED": parseFloat(windSpeed.toFixed(1)),
        "RPM": parseFloat(rpm.toFixed(1)),
        "POWER": parseFloat(powerMW.toFixed(3)),
        "VIBRATION": parseFloat(vibration.toFixed(2)),
        "PITCH": pitch
      };

      totalGeneracionMW += powerMW;
    });

    // 4. Process Transformer & Grid Connection
    const trafoState = scadaLiveState["TRAFO-01"];
    if (trafoState) {
      const breaker = breakersState["TRAFO-01"];
      
      let gridPowerMW = breaker ? totalGeneracionMW * 0.985 : 0; // 1.5% transformer losses
      let voltage = breaker ? 220.0 : 0;
      
      if (voltageSagActive && breaker) {
        voltage = 154.0; // 30% drop
        gridPowerMW = gridPowerMW * 0.9; // Efficiency drop due to reactive surge
      }

      const current = voltage > 0 ? (gridPowerMW * 1000) / (voltage * Math.sqrt(3)) : 0; // kA
      const temp = 30 + (gridPowerMW * 4.2) + Math.random() * 3;

      trafoState.telemetry = {
        "VOLTAGE": parseFloat(voltage.toFixed(1)),
        "CURRENT": parseFloat(current.toFixed(2)),
        "POWER": parseFloat(gridPowerMW.toFixed(3)),
        "TEMPERATURE": parseFloat(temp.toFixed(1))
      };
    }
  }
}
