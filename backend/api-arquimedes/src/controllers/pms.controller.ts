import { Request, Response } from 'express';
import { PmsService } from '../services/pms.service';

const service = new PmsService();

export class PmsController {

  static async getRooms(req: Request, res: Response) {
    try {
      const rooms = await service.getRooms();
      res.json(rooms);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getHousekeepingTasks(req: Request, res: Response) {
    try {
      const tasks = await service.getHousekeepingTasks();
      res.json(tasks);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async assignCleaningTask(req: Request, res: Response) {
    try {
      const { taskId, housekeeperName } = req.body;
      if (!taskId || !housekeeperName) {
        return res.status(400).json({ error: 'Missing required parameters: taskId, housekeeperName' });
      }
      const task = await service.assignCleaningTask(taskId, housekeeperName);
      res.json(task);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async completeCleaningTask(req: Request, res: Response) {
    try {
      const { taskId } = req.body;
      if (!taskId) {
        return res.status(400).json({ error: 'Missing required parameter: taskId' });
      }
      const room = await service.completeCleaningTask(taskId);
      res.json(room);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getReservations(req: Request, res: Response) {
    try {
      const reservations = await service.getReservations();
      res.json(reservations);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async checkIn(req: Request, res: Response) {
    try {
      const { reservationId, roomId } = req.body;
      if (!reservationId || !roomId) {
        return res.status(400).json({ error: 'Missing required parameters: reservationId, roomId' });
      }
      const reservation = await service.checkInReservation(reservationId, roomId);
      res.json(reservation);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async checkOut(req: Request, res: Response) {
    try {
      const { reservationId } = req.body;
      if (!reservationId) {
        return res.status(400).json({ error: 'Missing required parameter: reservationId' });
      }
      const reservation = await service.checkOutReservation(reservationId);
      res.json(reservation);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getReviews(req: Request, res: Response) {
    try {
      const reviews = await service.getReviews();
      res.json(reviews);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async submitCrisisDecision(req: Request, res: Response) {
    try {
      const { decisionIndex } = req.body;
      if (decisionIndex === undefined) {
        return res.status(400).json({ error: 'Missing required parameter: decisionIndex' });
      }
      const outcome = await service.submitCrisisDecision(Number(decisionIndex));
      res.json(outcome);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getSimulationStatus(req: Request, res: Response) {
    try {
      const active = service.getSimulationActive();
      const event = service.getActiveEvent();
      const budget = service.getBudgetCredits();
      const reputation = service.getReputationScore();
      const crisis = service.getActiveCrisis();
      
      res.json({
        simulationActive: active,
        activeEvent: event,
        budgetCredits: budget,
        reputationScore: reputation,
        activeCrisis: crisis
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async toggleSimulation(req: Request, res: Response) {
    try {
      const { active } = req.body;
      if (active === undefined) {
        return res.status(400).json({ error: 'Missing parameter: active' });
      }
      const result = service.setSimulationActive(Boolean(active));
      res.json({ simulationActive: result });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async setSimulationEvent(req: Request, res: Response) {
    try {
      const { event } = req.body;
      if (!event) {
        return res.status(400).json({ error: 'Missing parameter: event' });
      }
      const result = service.setActiveEvent(event);
      res.json({ activeEvent: result });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async triggerCrisis(req: Request, res: Response) {
    try {
      const crisis = service.triggerRandomCrisis();
      res.json(crisis);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
