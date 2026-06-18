import prisma from './prisma';

let simulationActive = false;
let simulationTimeSec = 0; // Simulated clock seconds
let activeEvent = 'NORMAL'; // 'NORMAL', 'MARATON_ALAMEDA', 'PARTIDO_ESTADIO'

export class TrafficService {
  
  // Get transit routes and active units with coordinates
  async getRoutes() {
    return prisma.transitRoute.findMany({
      include: {
        buses: {
          include: {
            telemetry: {
              orderBy: { timestamp: 'desc' },
              take: 1
            }
          }
        }
      }
    });
  }

  // Get all intersections and their semaphore configurations
  async getIntersections() {
    return prisma.trafficIntersection.findMany();
  }

  // Update green phase, red phase, and offset for a traffic light
  async updateIntersection(id: string, greenPhase: number, redPhase: number, offset: number) {
    return prisma.trafficIntersection.update({
      where: { id },
      data: {
        greenPhase,
        redPhase,
        offset
      }
    });
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

  // Fetch validations and calculate the Origin-Destination matrix from smart card swipes
  async getODMatrix() {
    const validations = await prisma.commuterValidation.findMany({
      orderBy: { timestamp: 'asc' }
    });

    const cardTaps: Record<string, any[]> = {};
    for (const val of validations) {
      if (!cardTaps[val.cardNumber]) {
        cardTaps[val.cardNumber] = [];
      }
      cardTaps[val.cardNumber].push(val);
    }

    const flows: Record<string, { origin: string; destination: string; count: number }> = {};
    for (const taps of Object.values(cardTaps)) {
      if (taps.length >= 2) {
        // First tap is the morning origin, last tap is the evening destination
        const origin = taps[0].stopId.replace('STOP-', '');
        const destination = taps[taps.length - 1].stopId.replace('STOP-', '');
        const key = `${origin}->${destination}`;
        if (!flows[key]) {
          flows[key] = { origin, destination, count: 0 };
        }
        flows[key].count++;
      }
    }

    return Object.values(flows);
  }

  // Calculate urban KPIs (Emissions, commute times, overcrowding)
  async getKPIs() {
    const buses = await prisma.busUnit.findMany({
      include: {
        telemetry: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });

    const intersections = await prisma.trafficIntersection.findMany();

    // 1. Calculate average speed and travel times
    let totalSpeed = 0;
    let count = 0;
    let overcrowdedBuses = 0;

    buses.forEach(b => {
      const tel = b.telemetry[0];
      if (tel) {
        totalSpeed += tel.speed;
        count++;
        if (tel.passengerCount >= b.capacity * 0.9) {
          overcrowdedBuses++;
        }
      }
    });

    const avgSpeed = count > 0 ? totalSpeed / count : 22; // default 22 km/h
    
    // Commute time increases as average speed decreases
    // Nominal time is 35 minutes for 20 km travel at 35 km/h
    const avgCommuteTimeMin = Math.round((20 / avgSpeed) * 60);

    // 2. Evaluate Green Wave synchronization
    // Sincronización penalty: calculate the variance of offsets
    let offsetScore = 100;
    if (intersections.length >= 2) {
      // Ideal offsets increase by 5 seconds per intersection (0, 5, 10, 15) along Alameda
      // We check if the student adjusted them correctly
      const expectedOffsets = [0, 5, 10, 15, 20];
      let diff = 0;
      intersections.forEach((inter, idx) => {
        const expected = expectedOffsets[idx % expectedOffsets.length];
        diff += Math.abs(inter.offset - expected);
      });
      // Offset score drops if offsets are mismatched
      offsetScore = Math.max(20, 100 - diff * 3);
    }

    // 3. CO2 emissions calculation
    // Base emission for 30 buses is 150 kg/hr. 
    // Mismatched offsets (queuing/idling) and crisis events increase emissions.
    let eventPenalty = 0;
    if (activeEvent === 'MARATON_ALAMEDA') eventPenalty = 80;
    else if (activeEvent === 'PARTIDO_ESTADIO') eventPenalty = 30;

    const co2Kg = Math.round(150 + (100 - offsetScore) * 2.5 + eventPenalty);

    return {
      avgSpeed: parseFloat(avgSpeed.toFixed(1)),
      avgCommuteTimeMin,
      overcrowdedBuses,
      co2EmissionsKg: co2Kg,
      greenWaveSyncPct: Math.round(offsetScore),
      activeEvent
    };
  }

  // Simulation tick logic (Theory of Queues and Traffic Congestion modeling)
  async runSimulationStep() {
    if (!simulationActive) return null;

    simulationTimeSec += 300; // Advance simulation clock by 5 minutes per tick

    const buses = await prisma.busUnit.findMany({
      include: {
        route: true,
        telemetry: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });

    const intersections = await prisma.trafficIntersection.findMany();

    const stopPoints: Record<string, { lat: number; lng: number }[]> = {
      "401": [
        { lat: -33.485, lng: -70.757 }, // Maipú
        { lat: -33.453, lng: -70.709 }, // Las Rejas
        { lat: -33.452, lng: -70.692 }, // Gral Velásquez
        { lat: -33.451, lng: -70.678 }, // Estación Central
        { lat: -33.444, lng: -70.647 }, // Santa Lucía
        { lat: -33.424, lng: -70.612 }, // Pedro de Valdivia
        { lat: -33.412, lng: -70.578 }  // Las Condes
      ],
      "210": [
        { lat: -33.451, lng: -70.678 }, // Estación Central
        { lat: -33.444, lng: -70.647 }, // Santa Lucía
        { lat: -33.468, lng: -70.625 }, // Vicuña Mackenna / Ñuble
        { lat: -33.512, lng: -70.598 }, // La Florida
        { lat: -33.595, lng: -70.578 }  // Puente Alto
      ],
      "506": [
        { lat: -33.485, lng: -70.757 }, // Maipú
        { lat: -33.465, lng: -70.698 }, // Cerrillos
        { lat: -33.460, lng: -70.655 }, // Blanco Encalada
        { lat: -33.463, lng: -70.620 }, // Grecia / Ñuñoa
        { lat: -33.475, lng: -70.555 }  // Peñalolén
      ],
      "B02": [
        { lat: -33.375, lng: -70.675 }, // Huechuraba
        { lat: -33.415, lng: -70.665 }, // Independencia
        { lat: -33.444, lng: -70.647 }  // Santa Lucía
      ],
      "104": [
        { lat: -33.424, lng: -70.612 }, // Pedro de Valdivia
        { lat: -33.475, lng: -70.605 }, // Macul
        { lat: -33.525, lng: -70.590 }, // La Florida
        { lat: -33.595, lng: -70.578 }  // Puente Alto
      ]
    };

    const telemetriesToCreate = [];

    for (const bus of buses) {
      const code = bus.route.routeCode;
      let path = stopPoints[code] || [];
      const currentTel = bus.telemetry[0];

      if (!currentTel) continue;

      // Determine next coordinate in route path
      let currentIdx = path.findIndex(p => Math.abs(p.lat - currentTel.lat) < 0.05 && Math.abs(p.lng - currentTel.lng) < 0.05);
      if (currentIdx === -1) currentIdx = 0;
      
      let nextIdx = (currentIdx + 1) % path.length;
      let nextPos = path[nextIdx];

      // Redirection logic for Marathon event (close Santa Lucía & Estación Central)
      if (activeEvent === 'MARATON_ALAMEDA' && (code === '401' || code === '210')) {
        // Divert path to keep moving on alternate coordinates
        nextPos = { lat: nextPos.lat - 0.012, lng: nextPos.lng }; // shift south
      }

      // Check traffic light delay near intersections
      let delayPenalty = 1.0; // multiplier for speed
      let nearIntersection = false;

      for (const inter of intersections) {
        const dist = Math.sqrt(Math.pow(nextPos.lat - inter.lat, 2) + Math.pow(nextPos.lng - inter.lng, 2));
        if (dist < 0.008) {
          nearIntersection = true;
          // Calculate traffic light state at this simulation time
          const totalCycle = inter.greenPhase + inter.redPhase;
          const timeOffset = (simulationTimeSec + inter.offset) % totalCycle;
          
          if (timeOffset >= inter.greenPhase) {
            // Light is RED -> stop or slow down significantly
            delayPenalty = 0.1; 
          } else {
            // Light is GREEN -> check Green Wave offset sync
            // Sincronización score: green lights are aligned. Higher green phase gives more flow.
            const flowMultiplier = inter.greenPhase / 40; // baseline 40s
            delayPenalty = 1.1 * flowMultiplier;
          }
          break;
        }
      }

      // Crisis event penalties
      if (activeEvent === 'MARATON_ALAMEDA') {
        delayPenalty *= 0.4; // general slowdown
      }

      let speed = (25 + Math.random() * 15) * delayPenalty;
      speed = Math.max(5, Math.min(60, speed)); // boundary limits

      // Passenger changes (crisis spikes)
      let passengers = currentTel.passengerCount;
      if (activeEvent === 'PARTIDO_ESTADIO' && code === '104') {
        // heavy boarding near stadium
        passengers = Math.min(bus.capacity, passengers + Math.floor(Math.random() * 15));
      } else {
        // normal boarding variation
        passengers = Math.max(5, Math.min(bus.capacity, passengers + Math.floor(Math.random() * 11) - 5));
      }

      // Calculate travel displacement
      const stepFactor = 0.08; // speed multiplier for coordinate advance
      const latDiff = (nextPos.lat - currentTel.lat) * stepFactor * (speed / 30);
      const lngDiff = (nextPos.lng - currentTel.lng) * stepFactor * (speed / 30);

      const newLat = currentTel.lat + latDiff;
      const newLng = currentTel.lng + lngDiff;

      telemetriesToCreate.push({
        busId: bus.id,
        lat: parseFloat(newLat.toFixed(6)),
        lng: parseFloat(newLng.toFixed(6)),
        speed: parseFloat(speed.toFixed(1)),
        passengerCount: passengers
      });
    }

    // Save telemetries in DB
    const savedTelemetries = [];
    for (const tel of telemetriesToCreate) {
      const t = await prisma.busTelemetry.create({
        data: tel
      });
      savedTelemetries.push(t);
    }

    return savedTelemetries;
  }
}
