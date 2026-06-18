import { Request, Response, NextFunction } from 'express';
import { PmsService } from '../services/pms.service';
import { z } from 'zod';

const service = new PmsService();

export class PmsController {
  static async getRooms(req: Request, res: Response, next: NextFunction) {
    try {
      const rooms = await service.getRooms();
      res.json(rooms);
    } catch (err: any) {
      next(err);
    }
  }

  static async getHousekeepingTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const tasks = await service.getHousekeepingTasks();
      res.json(tasks);
    } catch (err: any) {
      next(err);
    }
  }

  static async assignCleaningTask(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        taskId: z.string().min(1, 'taskId es requerido'),
        housekeeperName: z.string().min(1, 'housekeeperName es requerido')
      });
      const parsed = schema.parse(req.body);
      const task = await service.assignCleaningTask(parsed.taskId, parsed.housekeeperName);
      res.json(task);
    } catch (err: any) {
      next(err);
    }
  }

  static async completeCleaningTask(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        taskId: z.string().min(1, 'taskId es requerido')
      });
      const parsed = schema.parse(req.body);
      const room = await service.completeCleaningTask(parsed.taskId);
      res.json(room);
    } catch (err: any) {
      next(err);
    }
  }

  static async getReservations(req: Request, res: Response, next: NextFunction) {
    try {
      const reservations = await service.getReservations();
      res.json(reservations);
    } catch (err: any) {
      next(err);
    }
  }

  static async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        reservationId: z.string().min(1, 'reservationId es requerido'),
        roomId: z.string().min(1, 'roomId es requerido')
      });
      const parsed = schema.parse(req.body);
      const reservation = await service.checkInReservation(parsed.reservationId, parsed.roomId);
      res.json(reservation);
    } catch (err: any) {
      next(err);
    }
  }

  static async checkOut(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        reservationId: z.string().min(1, 'reservationId es requerido')
      });
      const parsed = schema.parse(req.body);
      const reservation = await service.checkOutReservation(parsed.reservationId);
      res.json(reservation);
    } catch (err: any) {
      next(err);
    }
  }

  static async getReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const reviews = await service.getReviews();
      res.json(reviews);
    } catch (err: any) {
      next(err);
    }
  }

  static async submitCrisisDecision(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        decisionIndex: z.coerce.number().int().nonnegative()
      });
      const parsed = schema.parse(req.body);
      const outcome = await service.submitCrisisDecision(parsed.decisionIndex);
      res.json(outcome);
    } catch (err: any) {
      next(err);
    }
  }

  static async getSimulationStatus(req: Request, res: Response, next: NextFunction) {
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
      next(err);
    }
  }

  static async toggleSimulation(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        active: z.boolean()
      });
      const parsed = schema.parse(req.body);
      const result = service.setSimulationActive(parsed.active);
      res.json({ simulationActive: result });
    } catch (err: any) {
      next(err);
    }
  }

  static async setSimulationEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        event: z.string().min(1, 'event es requerido')
      });
      const parsed = schema.parse(req.body);
      const result = service.setActiveEvent(parsed.event);
      res.json({ activeEvent: result });
    } catch (err: any) {
      next(err);
    }
  }

  static async triggerCrisis(req: Request, res: Response, next: NextFunction) {
    try {
      const crisis = service.triggerRandomCrisis();
      res.json(crisis);
    } catch (err: any) {
      next(err);
    }
  }
}
