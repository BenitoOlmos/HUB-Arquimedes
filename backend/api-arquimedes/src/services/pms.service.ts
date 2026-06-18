import prisma from './prisma';

let simulationActive = false;
let activeEvent = 'NORMAL'; // 'NORMAL', 'COMPETITOR_WAR' (competidor bajó tarifas), 'HIGH_TURNOVER' (alta rotación)
let activeCrisis: any = null; // Current active Front-desk check-in/out crisis alert
let budgetCredits = 1500;
let reputationScore = 7.8; // Average rating out of 10

// In-memory staff list
const housekeepers = [
  { name: 'Andrés Silva', assignedCredits: 0 },
  { name: 'Marta Díaz', assignedCredits: 0 },
  { name: 'Carlos Pizarro', assignedCredits: 0 }
];

export class PmsService {

  async getRooms() {
    return await prisma.hotelRoom.findMany({
      orderBy: { roomNumber: 'asc' }
    });
  }

  async getHousekeepingTasks() {
    return await prisma.housekeepingTask.findMany({
      include: { room: true },
      orderBy: { room: { roomNumber: 'asc' } }
    });
  }

  async assignCleaningTask(taskId: string, housekeeperName: string) {
    const task = await prisma.housekeepingTask.findUnique({
      where: { id: taskId }
    });
    if (!task) throw new Error('Task not found');

    const updatedTask = await prisma.housekeepingTask.update({
      where: { id: taskId },
      data: {
        assignedTo: housekeeperName,
        status: housekeeperName === 'Unassigned' ? 'PENDING' : 'IN_PROGRESS'
      },
      include: { room: true }
    });

    // Update staff credits
    this.recalculateHousekeeperCredits();

    return updatedTask;
  }

  async completeCleaningTask(taskId: string) {
    const task = await prisma.housekeepingTask.findUnique({
      where: { id: taskId }
    });
    if (!task) throw new Error('Task not found');

    // Update task status to completed
    await prisma.housekeepingTask.update({
      where: { id: taskId },
      data: { status: 'COMPLETED' }
    });

    // Mark the hotel room as INSPECTED (so it is ready for check-in)
    const updatedRoom = await prisma.hotelRoom.update({
      where: { id: task.roomId },
      data: { status: 'INSPECTED' }
    });

    this.recalculateHousekeeperCredits();
    return updatedRoom;
  }

  private async recalculateHousekeeperCredits() {
    const activeTasks = await prisma.housekeepingTask.findMany({
      where: { status: 'IN_PROGRESS' }
    });

    housekeepers.forEach(hk => {
      hk.assignedCredits = activeTasks
        .filter(t => t.assignedTo === hk.name)
        .reduce((sum, t) => sum + t.credits, 0);
    });
  }

  getHousekeepers() {
    return housekeepers;
  }

  async getReservations() {
    return await prisma.hotelReservation.findMany({
      include: { room: true },
      orderBy: { checkInDate: 'asc' },
      take: 80
    });
  }

  async checkInReservation(reservationId: string, roomId: string) {
    const res = await prisma.hotelReservation.findUnique({
      where: { id: reservationId }
    });
    if (!res) throw new Error('Reservation not found');

    const room = await prisma.hotelRoom.findUnique({
      where: { id: roomId }
    });
    if (!room) throw new Error('Room not found');

    if (room.status !== 'INSPECTED' && room.status !== 'CLEAN') {
      // Penalty in reputation if checked into dirty or OOO room
      reputationScore = Math.max(1.0, reputationScore - 0.8);
    }

    // Update reservation status and assign room
    const updatedRes = await prisma.hotelReservation.update({
      where: { id: reservationId },
      data: {
        roomId,
        status: 'CHECKED_IN'
      }
    });

    // Mark room as occupied (we can set to DIRTY once they checkout)
    // For simplicity, occupied rooms can stay CLEAN in the database during stay
    await prisma.hotelRoom.update({
      where: { id: roomId },
      data: { status: 'CLEAN' }
    });

    return updatedRes;
  }

  async checkOutReservation(reservationId: string) {
    const res = await prisma.hotelReservation.findUnique({
      where: { id: reservationId }
    });
    if (!res) throw new Error('Reservation not found');

    // Update reservation status
    const updatedRes = await prisma.hotelReservation.update({
      where: { id: reservationId },
      data: { status: 'CONFIRMED' } // represented as checked out / past
    });

    if (res.roomId) {
      // Mark room as DIRTY upon checkout
      await prisma.hotelRoom.update({
        where: { id: res.roomId },
        data: { status: 'DIRTY' }
      });

      // Create new Housekeeping Task
      const room = await prisma.hotelRoom.findUnique({ where: { id: res.roomId } });
      if (room) {
        await prisma.housekeepingTask.create({
          data: {
            roomId: room.id,
            assignedTo: 'Unassigned',
            status: 'PENDING',
            credits: room.cleaningCredits
          }
        });
      }
    }

    return updatedRes;
  }

  async getReviews() {
    return await prisma.guestReview.findMany({
      orderBy: { date: 'desc' },
      take: 15
    });
  }

  async submitCrisisDecision(decisionIndex: number) {
    if (!activeCrisis) return { success: false, error: 'No active crisis' };

    const option = activeCrisis.options[decisionIndex];
    if (!option) return { success: false, error: 'Invalid decision option' };

    // Apply outcomes
    budgetCredits = Math.max(0, budgetCredits + (option.budgetImpact || 0));
    reputationScore = Math.min(10.0, Math.max(1.0, reputationScore + (option.reputationImpact || 0)));

    // Save review
    if (option.reviewText) {
      await prisma.guestReview.create({
        data: {
          score: Math.round(5 + Math.random() * 5 + (option.reputationImpact * 5)),
          category: 'SERVICE',
          comment: option.reviewText
        }
      });
    }

    activeCrisis = null;

    return {
      success: true,
      budgetCredits,
      reputationScore
    };
  }

  getReputationScore() {
    return parseFloat(reputationScore.toFixed(2));
  }

  getBudgetCredits() {
    return budgetCredits;
  }

  setBudgetCredits(amount: number) {
    budgetCredits = amount;
    return budgetCredits;
  }

  adjustReputationAndBudget(repImpact: number, budgetImpact: number) {
    reputationScore = Math.min(10.0, Math.max(1.0, reputationScore + repImpact));
    budgetCredits = Math.max(0, budgetCredits + budgetImpact);
  }

  getSimulationActive() {
    return simulationActive;
  }

  setSimulationActive(active: boolean) {
    simulationActive = active;
    return simulationActive;
  }

  getActiveEvent() {
    return activeEvent;
  }

  setActiveEvent(event: string) {
    activeEvent = event;
    return activeEvent;
  }

  getActiveCrisis() {
    return activeCrisis;
  }

  setActiveCrisis(crisis: any) {
    activeCrisis = crisis;
    return activeCrisis;
  }

  // Generate a random crisis
  triggerRandomCrisis() {
    const crises = [
      {
        id: 'c1',
        title: 'Sobreventa Crítica (Walk-out)',
        description: 'Llega un huésped VIP (Sra. Larraín) con reserva confirmada, pero no quedan Suites libres. ¿Cómo procedes?',
        options: [
          {
            text: 'Reubicarla en un hotel competidor de 5 estrellas con traslado premium gratis.',
            reputationImpact: 0.2,
            budgetImpact: -300,
            reviewText: 'Tuvieron que reubicarme, pero la atención y la compensación fueron estelares.'
          },
          {
            text: 'Hacerle upgrade a la suite presidencial de servicio interno del hotel (fuera de venta).',
            reputationImpact: 0.5,
            budgetImpact: -100,
            reviewText: '¡Upgrade espectacular! Excelente gestión en Front-Desk.'
          },
          {
            text: 'Pedirle que espere en el lobby ofreciendo un trago de cortesía hasta que salga otro checkout.',
            reputationImpact: -1.2,
            budgetImpact: 0,
            reviewText: 'Pésimo servicio. Me tuvieron esperando 3 horas sin solución.'
          }
        ]
      },
      {
        id: 'c2',
        title: 'Queja por Ruido en Piso 2',
        description: 'La habitación 204 reporta música a alto volumen proveniente de la habitación vecina 205 a las 23:30 hrs.',
        options: [
          {
            text: 'Enviar personal de seguridad para advertir formalmente al huésped de la 205.',
            reputationImpact: 0.1,
            budgetImpact: 0,
            reviewText: 'Controlaron el ruido rápidamente. Se agradece la seguridad.'
          },
          {
            text: 'Ignorar el reclamo y sugerir al huésped que use tapones para oídos.',
            reputationImpact: -1.5,
            budgetImpact: 0,
            reviewText: 'Una vergüenza. La recepción no hizo nada por detener la fiesta.'
          },
          {
            text: 'Mudar al huésped quejoso a una suite ejecutiva desocupada en el piso 3 (Upgrade).',
            reputationImpact: 0.6,
            budgetImpact: -50,
            reviewText: 'Hubo ruido en el piso original, pero me dieron una suite fantástica por la molestia.'
          }
        ]
      }
    ];

    const randomCrisis = crises[Math.floor(Math.random() * crises.length)];
    activeCrisis = randomCrisis;
    return activeCrisis;
  }

  async runSimulationStep() {
    if (!simulationActive) return null;

    // 1. Randomly dirty some cleaned/inspected rooms (5% chance)
    const rooms = await this.getRooms();
    const cleanRooms = rooms.filter(r => r.status === 'CLEAN' || r.status === 'INSPECTED');
    
    for (const room of cleanRooms) {
      if (Math.random() < 0.05) {
        await prisma.hotelRoom.update({
          where: { id: room.id },
          data: { status: 'DIRTY' }
        });

        // Check if housekeeping task already exists
        const exists = await prisma.housekeepingTask.findFirst({
          where: { roomId: room.id, status: { not: 'COMPLETED' } }
        });

        if (!exists) {
          await prisma.housekeepingTask.create({
            data: {
              roomId: room.id,
              assignedTo: 'Unassigned',
              status: 'PENDING',
              credits: room.cleaningCredits
            }
          });
        }
      }
    }

    // 2. Randomly trigger a guest review if housekeeping tasks are delayed or rooms are dirty
    const dirtyRooms = rooms.filter(r => r.status === 'DIRTY');
    if (dirtyRooms.length > 4 && Math.random() < 0.15) {
      const score = Math.floor(2 + Math.random() * 4); // low review score 2-5
      await prisma.guestReview.create({
        data: {
          score,
          category: 'CLEANLINESS',
          comment: `La habitación ${dirtyRooms[0]?.roomNumber || '102'} estaba muy sucia y no tenían toallas limpias.`
        }
      });
      this.adjustReputationAndBudget(-0.2, 0);
    }

    // 3. Randomly trigger front-desk crisis (e.g. 10% chance if no crisis is active)
    if (!activeCrisis && Math.random() < 0.1) {
      this.triggerRandomCrisis();
    }

    // 4. Simulate a guest checking in randomly from confirmed future reservations
    const today = new Date();
    const checkinCandidate = await prisma.hotelReservation.findFirst({
      where: {
        status: 'CONFIRMED',
        checkInDate: { lte: today }
      }
    });

    if (checkinCandidate && Math.random() < 0.2) {
      // Find a clean or inspected room
      const matchedRoom = await prisma.hotelRoom.findFirst({
        where: {
          status: { in: ['CLEAN', 'INSPECTED'] }
        }
      });

      if (matchedRoom) {
        await this.checkInReservation(checkinCandidate.id, matchedRoom.id);
      }
    }

    return { success: true };
  }
}
