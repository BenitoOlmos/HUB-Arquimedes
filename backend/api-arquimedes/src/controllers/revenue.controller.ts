import { Request, Response, NextFunction } from 'express';
import { RevenueService } from '../services/revenue.service';
import { z } from 'zod';

const service = new RevenueService();

export class RevenueController {
  static async getKpis(req: Request, res: Response, next: NextFunction) {
    try {
      const kpis = await service.getKpis();
      res.json(kpis);
    } catch (err: any) {
      next(err);
    }
  }

  static async getPickupCurve(req: Request, res: Response, next: NextFunction) {
    try {
      const curve = await service.getPickupCurve();
      res.json(curve);
    } catch (err: any) {
      next(err);
    }
  }

  static async getYieldRules(req: Request, res: Response, next: NextFunction) {
    try {
      const rules = service.getYieldRules();
      res.json(rules);
    } catch (err: any) {
      next(err);
    }
  }

  static async setYieldRules(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        rules: z.array(
          z.object({
            id: z.string(),
            occupancyThreshold: z.coerce.number(),
            leadTimeDays: z.coerce.number(),
            priceAdjustmentPercent: z.coerce.number()
          })
        )
      });
      const parsed = schema.parse(req.body);
      const updatedRules = service.setYieldRules(parsed.rules);
      res.json(updatedRules);
    } catch (err: any) {
      next(err);
    }
  }

  static async getOverbookingLimit(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = service.getOverbookingLimit();
      res.json({ overbookingLimitPercent: limit });
    } catch (err: any) {
      next(err);
    }
  }

  static async setOverbookingLimit(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        limitPercent: z.coerce.number().min(0).max(100)
      });
      const parsed = schema.parse(req.body);
      const result = service.setOverbookingLimit(parsed.limitPercent);
      res.json(result);
    } catch (err: any) {
      next(err);
    }
  }

  static async getOverbookingRisk(req: Request, res: Response, next: NextFunction) {
    try {
      const querySchema = z.object({
        currentOccupancy: z.coerce.number().min(0).max(100).optional().default(75)
      });
      const parsed = querySchema.parse(req.query);
      const risk = service.calculateOverbookingRisk(parsed.currentOccupancy);
      res.json(risk);
    } catch (err: any) {
      next(err);
    }
  }

  static async getHistoricalRevenueMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await service.getHistoricalRevenueMetrics();
      res.json(metrics);
    } catch (err: any) {
      next(err);
    }
  }
}
