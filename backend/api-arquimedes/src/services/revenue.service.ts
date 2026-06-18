import prisma from './prisma';

interface YieldRule {
  id: string;
  occupancyThreshold: number;
  leadTimeDays: number;
  priceAdjustmentPercent: number;
}

// Default dynamic pricing rule
let yieldRules: YieldRule[] = [
  { id: '1', occupancyThreshold: 80, leadTimeDays: 30, priceAdjustmentPercent: 25 }
];

let overbookingLimitPercent = 5; // e.g. oversell up to 5% over capacity

export class RevenueService {

  async getKpis() {
    const roomsCount = await prisma.hotelRoom.count({ where: { status: { not: 'OUT_OF_ORDER' } } });
    const totalRooms = roomsCount || 24;

    const reservations = await prisma.hotelReservation.findMany({
      where: {
        status: { in: ['CHECKED_IN', 'CONFIRMED'] }
      }
    });

    // Calculate dynamic ADR and RevPAR for past reservations
    const pastReservations = reservations.filter(r => r.checkInDate < new Date());
    const totalRevenue = pastReservations.reduce((sum, r) => sum + r.totalPrice, 0);
    
    // Average Daily Rate (ADR)
    const totalNights = pastReservations.length || 1;
    const adr = totalRevenue / totalNights;

    // Room occupancy rate based on rooms count
    const occupiedCount = pastReservations.filter(r => r.status === 'CHECKED_IN').length;
    const occupancyRate = (occupiedCount / totalRooms) * 100;

    // RevPAR
    const revpar = (occupancyRate / 100) * adr;

    // Cost calculations for GOPPAR
    // Standard laundry cost: 12 per checkout. Amenities: 5 per guest checkin.
    const checkoutCount = pastReservations.filter(r => r.status === 'CONFIRMED').length;
    const laundryCost = checkoutCount * 12.0;
    const amenitiesCost = pastReservations.length * 5.0;
    const totalCosts = laundryCost + amenitiesCost;

    const goppar = (totalRevenue - totalCosts) / totalRooms;

    return {
      occupancyRate: parseFloat(Math.min(100, Math.max(10, occupancyRate)).toFixed(1)),
      adr: parseFloat(adr.toFixed(2)),
      revpar: parseFloat(revpar.toFixed(2)),
      goppar: parseFloat(goppar.toFixed(2)),
      financials: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalCosts: parseFloat(totalCosts.toFixed(2)),
        checkins: pastReservations.length,
        checkouts: checkoutCount
      }
    };
  }

  // Returns data for the pick-up pace curve
  async getPickupCurve() {
    // Collect reservations over the next 30 days
    const now = new Date();
    const futureLimit = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const reservations = await prisma.hotelReservation.findMany({
      where: {
        checkInDate: {
          gte: now,
          lte: futureLimit
        },
        status: 'CONFIRMED'
      }
    });

    // Group bookings by lead time (Lead time = checkInDate - bookingDate in days)
    const leadTimeGroups = [
      { name: '30+ días', min: 30, max: 365, count: 0, revenue: 0 },
      { name: '15-29 días', min: 15, max: 29, count: 0, revenue: 0 },
      { name: '7-14 días', min: 7, max: 14, count: 0, revenue: 0 },
      { name: '0-6 días', min: 0, max: 6, count: 0, revenue: 0 }
    ];

    reservations.forEach(r => {
      const diffTime = Math.abs(r.checkInDate.getTime() - r.bookingDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      for (const group of leadTimeGroups) {
        if (diffDays >= group.min && diffDays <= group.max) {
          group.count++;
          group.revenue += r.totalPrice;
          break;
        }
      }
    });

    return leadTimeGroups;
  }

  // Set Yield pricing rules
  setYieldRules(rules: YieldRule[]) {
    yieldRules = rules;
    return yieldRules;
  }

  getYieldRules() {
    return yieldRules;
  }

  // Apply Yield management pricing adjusting base tariffs according to rules
  applyYieldPricing(baseRate: number, currentOccupancy: number, daysToArrival: number): number {
    let finalRate = baseRate;
    
    // Evaluate if any rule applies
    yieldRules.forEach(rule => {
      if (currentOccupancy >= rule.occupancyThreshold && daysToArrival <= rule.leadTimeDays) {
        finalRate = baseRate * (1 + rule.priceAdjustmentPercent / 100);
      }
    });

    return finalRate;
  }

  // Sets the overbooking rate threshold
  setOverbookingLimit(limitPercent: number) {
    overbookingLimitPercent = limitPercent;
    return { overbookingLimitPercent };
  }

  getOverbookingLimit() {
    return overbookingLimitPercent;
  }

  // Calculates overbooking parameters, cancellation probability and risk score of walkouts
  calculateOverbookingRisk(currentOccupancy: number) {
    // Mathematical overbooking model:
    // Historical cancellation/No-show rate is 15%.
    // If overbookingLimit is too high relative to cancel rate, the probability of exceeding physical capacity (24 rooms) increases.
    const cancelRate = 0.15;
    
    // Projected checkins based on current occupancy + overbooked rooms
    const capacity = 24;
    const overbookedRooms = Math.round((overbookingLimitPercent / 100) * capacity);
    const totalBooked = Math.round(capacity * (currentOccupancy / 100)) + overbookedRooms;

    // Expected arrivals = totalBooked * (1 - cancelRate)
    const expectedArrivals = totalBooked * (1 - cancelRate);
    
    // Walkout probability using binomial or simplified heuristics
    let walkoutRisk = 0;
    if (totalBooked > capacity) {
      const overflow = expectedArrivals - capacity;
      if (overflow > 0) {
        walkoutRisk = Math.min(100, (overflow / capacity) * 100 * 5); // amplified risk index
      }
    }

    return {
      totalBooked,
      expectedArrivals: parseFloat(expectedArrivals.toFixed(1)),
      overbookedRooms,
      walkoutRiskPercent: parseFloat(walkoutRisk.toFixed(1)),
      status: walkoutRisk > 60 ? 'HIGH_RISK' : walkoutRisk > 20 ? 'MODERATE_RISK' : 'SAFE'
    };
  }

  // Daily revenue metrics aggregator query for charts
  async getHistoricalRevenueMetrics() {
    return await prisma.revenueMetric.findMany({
      orderBy: { date: 'asc' },
      take: 30
    });
  }
}
