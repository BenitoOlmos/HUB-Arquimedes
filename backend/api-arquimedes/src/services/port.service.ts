import prisma from './prisma';

// Define route segments for interpolation
const PORT_COORDINATES = {
  "Shanghai": { lat: 31.2, lng: 121.5 },
  "Singapore": { lat: 1.3, lng: 103.8 },
  "Rotterdam": { lat: 51.9, lng: 4.4 },
  "Los Angeles": { lat: 33.7, lng: -118.2 },
  "New York": { lat: 40.7, lng: -74.0 },
  "Valparaíso": { lat: -33.0, lng: -71.6 },
  "Cabo": { lat: -33.9, lng: 18.4 } // Cape of Good Hope detour
};

export class PortService {
  
  // Get all ships with their manifests
  async getShips() {
    return prisma.portShip.findMany({
      include: {
        manifests: true
      }
    });
  }

  // Get single ship detail
  async getShipById(id: string) {
    return prisma.portShip.findUnique({
      where: { id },
      include: { manifests: true }
    });
  }

  // Get cargo manifests
  async getManifests() {
    return prisma.cargoManifest.findMany({
      include: { ship: true }
    });
  }

  // Get global events
  async getGlobalEvents() {
    return prisma.globalEvent.findMany({
      where: { active: true }
    });
  }

  // Reroute a ship (mathematical routing detour to avoid crisis region)
  async rerouteShip(shipId: string, routeOption: 'DEFAULT' | 'DETOUR') {
    const ship = await prisma.portShip.findUnique({
      where: { id: shipId }
    });
    if (!ship) throw new Error(`Ship not found: ${shipId}`);

    // If detoured (e.g. going around Cape of Good Hope instead of Suez/Panama),
    // we change its coordinates slightly or increase fuel/daily cost
    const isDetoured = routeOption === 'DETOUR';
    
    // Detoured routes double the remaining distance, increasing daily fuel cost and status
    return prisma.portShip.update({
      where: { id: shipId },
      data: {
        status: isDetoured ? 'EN_RUTA' : 'EN_RUTA', // Keep on route but track detour status
        dailyFuelCost: isDetoured ? ship.dailyFuelCost * 1.35 : ship.dailyFuelCost / 1.35 // Detour is more expensive
      }
    });
  }

  // Update customs manifest status (Kanban)
  async updateManifestStatus(manifestId: string, status: 'PENDIENTE' | 'APROBADO' | 'INSPECCION_FISICA' | 'RETENIDO') {
    return prisma.cargoManifest.update({
      where: { id: manifestId },
      data: { customsStatus: status }
    });
  }

  // Trigger weather or strike event
  async triggerGlobalEvent(eventType: 'CLIMA' | 'HUELGA' | 'PIRATERIA', affectedRegion: string, severity: number) {
    return prisma.globalEvent.create({
      data: {
        eventType,
        severity,
        affectedRegion,
        active: true
      }
    });
  }

  // Resolve all active global events
  async resolveGlobalEvents() {
    return prisma.globalEvent.updateMany({
      where: { active: true },
      data: { active: false }
    });
  }

  // Get consolidated state for student Python/R/Solver scripts
  async getConsolidatedState() {
    const ships = await this.getShips();
    const events = await this.getGlobalEvents();
    
    // Calculate total cost scoring function
    // Score = Sum(Fuel Cost) + Sum(Customs Mismatch Fines) + Opportunity Delay Cost
    let totalFuelCost = 0;
    let totalCustomsFines = 0;
    let delayCost = 0;

    ships.forEach(ship => {
      totalFuelCost += ship.dailyFuelCost * (ship.fuelLevel / 10); // Simulated fuel days
      
      // Calculate customs fines (e.g. $5,000 for each retained/mismatched manifest)
      const retainedCount = ship.manifests.filter(m => m.customsStatus === 'RETENIDO' || m.customsStatus === 'INSPECCION_FISICA').length;
      totalCustomsFines += retainedCount * 5000;

      if (ship.status === 'RETENIDO') {
        delayCost += 15000;
      }
    });

    const totalCostScore = totalFuelCost + totalCustomsFines + delayCost;

    return {
      shipsCount: ships.length,
      activeCrises: events.map(e => `${e.eventType} en ${e.affectedRegion} (Gravedad: ${e.severity})`),
      logisticsCostKPI: totalCostScore,
      fuelSpentTotal: totalFuelCost,
      customsPenalties: totalCustomsFines,
      delayLosses: delayCost,
      ships: ships.map(s => ({
        id: s.id,
        imo: s.imoNumber,
        name: s.name,
        lat: s.currentLat,
        lng: s.currentLng,
        status: s.status,
        capacityTEU: s.capacityTEU,
        fuel: s.fuelLevel,
        dailyCost: s.dailyFuelCost,
        manifestCount: s.manifests.length
      }))
    };
  }

  // GPS Simulation Loop: updates all ship coordinates toward destination
  async runSimulationStep(timeStepDays: number) {
    const ships = await this.getShips();
    const events = await this.getGlobalEvents();

    const isSuezBlocked = events.some(e => e.affectedRegion === 'Canal de Suez' && e.active);
    const isPanamaBlocked = events.some(e => e.affectedRegion === 'Canal de Panamá' && e.active);

    const updatePromises = ships.map(ship => {
      let lat = ship.currentLat;
      let lng = ship.currentLng;
      let status = ship.status;
      let fuel = Math.max(0, ship.fuelLevel - timeStepDays * 2.5); // Consume fuel

      // Basic GPS path interpolation toward destination ports
      // Routes are mapped by ship IMO number pattern
      const index = parseInt(ship.imoNumber.replace('IMO', '')) || 0;
      let destLat = 33.7; // Los Angeles
      let destLng = -118.2;

      if (index % 5 === 0) { // Pacific: Shanghai -> LA
        destLat = 33.7; destLng = -118.2;
      } else if (index % 5 === 1) { // Atlantic: Rotterdam -> NY
        destLat = 40.7; destLng = -74.0;
      } else if (index % 5 === 2) { // South America: Valparaíso -> Shanghai
        destLat = 31.2; destLng = 121.5;
      } else if (index % 5 === 3) { // Europe-Asia via Suez
        destLat = 51.9; destLng = 4.4;
        
        // If Suez is blocked, redirect/anchor ships approaching Suez
        if (isSuezBlocked && lat > 10 && lat < 33 && lng > 30 && lng < 45) {
          status = 'FONDEADO';
        }
      } else { // Oceania: Singapore -> Valparaíso
        destLat = -33.0; destLng = -71.6;
      }

      // If blocked, don't move
      if (status !== 'FONDEADO' && status !== 'RETENIDO') {
        const dLat = destLat - lat;
        const dLng = destLng - lng;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);

        if (dist > 1) {
          // Move toward destination
          const speed = 0.5 * timeStepDays; // Speed factor
          lat += (dLat / dist) * speed;
          lng += (dLng / dist) * speed;
          status = 'EN_RUTA';
        } else {
          status = 'FONDEADO'; // Arrived
        }
      }

      // Check if fuel is empty -> Reroute to anchor
      if (fuel <= 0) {
        status = 'FONDEADO';
      }

      return prisma.portShip.update({
        where: { id: ship.id },
        data: {
          currentLat: parseFloat(lat.toFixed(4)),
          currentLng: parseFloat(lng.toFixed(4)),
          status,
          fuelLevel: parseFloat(fuel.toFixed(1))
        }
      });
    });

    await Promise.all(updatePromises);
  }
}
