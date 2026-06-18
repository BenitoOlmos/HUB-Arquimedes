import { Request, Response, NextFunction } from 'express';
import { ManufacturingService } from '../services/manufacturing.service';
import { z } from 'zod';

const service = new ManufacturingService();

export class ManufacturingController {
  static async getLineState(req: Request, res: Response, next: NextFunction) {
    try {
      const state = await service.getLineState();
      res.json(state);
    } catch (error: any) {
      next(error);
    }
  }

  static async getOeeMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await service.calculateOeeMetrics();
      res.json(metrics);
    } catch (error: any) {
      next(error);
    }
  }

  static async getDowntimeLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await service.getDowntimeLogs();
      res.json(logs);
    } catch (error: any) {
      next(error);
    }
  }

  static async upgradeMachine(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        machineId: z.string().min(1, 'machineId es requerido')
      });
      const parsed = schema.parse(req.body);
      const result = await service.upgradeMachine(parsed.machineId);
      res.json(result);
    } catch (error: any) {
      next(error);
    }
  }

  static async balanceLine(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        balance: z.boolean()
      });
      const parsed = schema.parse(req.body);
      const result = service.setLineBalance(parsed.balance);
      res.json(result);
    } catch (error: any) {
      next(error);
    }
  }

  static async triggerEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        event: z.string().min(1, 'event es requerido')
      });
      const parsed = schema.parse(req.body);
      const result = service.setActiveEvent(parsed.event);
      res.json(result);
    } catch (error: any) {
      next(error);
    }
  }

  static async toggleSimulation(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        active: z.boolean()
      });
      const parsed = schema.parse(req.body);
      const result = service.setSimulationActive(parsed.active);
      res.json(result);
    } catch (error: any) {
      next(error);
    }
  }

  static async getSimulationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const active = service.getSimulationActive();
      const event = service.getActiveEvent();
      res.json({
        simulationActive: active,
        activeEvent: event
      });
    } catch (error: any) {
      next(error);
    }
  }
}
