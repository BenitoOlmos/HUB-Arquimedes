import { Request, Response, NextFunction } from 'express';
import { EsgService } from '../services/esg.service';
import { z } from 'zod';

const esgService = new EsgService();

export class EsgController {
  static async getFacilities(req: Request, res: Response, next: NextFunction) {
    try {
      const facilities = await esgService.getFacilities();
      res.json(facilities);
    } catch (error: any) {
      next(error);
    }
  }

  static async getFactors(req: Request, res: Response, next: NextFunction) {
    try {
      const factors = await esgService.getFactors();
      res.json(factors);
    } catch (error: any) {
      next(error);
    }
  }

  static async getCarbonMarket(req: Request, res: Response, next: NextFunction) {
    try {
      const market = await esgService.getCarbonMarket();
      res.json(market);
    } catch (error: any) {
      next(error);
    }
  }

  static async buyCarbonCredits(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        projectId: z.string().min(1, 'projectId es requerido'),
        tons: z.number().positive('La cantidad de toneladas debe ser mayor que 0')
      });
      const parsed = schema.parse(req.body);
      const result = await esgService.buyCarbonCredits(parsed.projectId, parsed.tons);
      res.json(result);
    } catch (error: any) {
      next(error);
    }
  }

  static async getMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await esgService.getEsgMetrics();
      res.json(metrics);
    } catch (error: any) {
      next(error);
    }
  }

  static async resetSimulation(req: Request, res: Response, next: NextFunction) {
    try {
      await esgService.resetSimulation();
      const metrics = await esgService.getEsgMetrics();
      res.json({ success: true, message: 'Simulación reiniciada con éxito.', metrics });
    } catch (error: any) {
      next(error);
    }
  }

  static async setCircularEconomy(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        active: z.boolean()
      });
      const parsed = schema.parse(req.body);
      esgService.setCircularEconomy(parsed.active);
      res.json({ success: true, active: esgService.getCircularEconomyStatus() });
    } catch (error: any) {
      next(error);
    }
  }

  static async getCircularEconomy(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ active: esgService.getCircularEconomyStatus() });
    } catch (error: any) {
      next(error);
    }
  }

  static async getActiveEvent(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ event: esgService.getEvent() });
    } catch (error: any) {
      next(error);
    }
  }

  static async setActiveEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        event: z.string().optional().default('NORMAL')
      });
      const parsed = schema.parse(req.body);
      esgService.setEvent(parsed.event);
      res.json({ success: true, event: esgService.getEvent() });
    } catch (error: any) {
      next(error);
    }
  }
}
