import { Request, Response } from 'express';
import { RevenueService } from '../services/revenue.service';

const service = new RevenueService();

export class RevenueController {

  static async getKpis(req: Request, res: Response) {
    try {
      const kpis = await service.getKpis();
      res.json(kpis);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getPickupCurve(req: Request, res: Response) {
    try {
      const curve = await service.getPickupCurve();
      res.json(curve);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getYieldRules(req: Request, res: Response) {
    try {
      const rules = service.getYieldRules();
      res.json(rules);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async setYieldRules(req: Request, res: Response) {
    try {
      const { rules } = req.body;
      if (!rules || !Array.isArray(rules)) {
        return res.status(400).json({ error: 'Missing parameter: rules (array required)' });
      }
      const updatedRules = service.setYieldRules(rules);
      res.json(updatedRules);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getOverbookingLimit(req: Request, res: Response) {
    try {
      const limit = service.getOverbookingLimit();
      res.json({ overbookingLimitPercent: limit });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async setOverbookingLimit(req: Request, res: Response) {
    try {
      const { limitPercent } = req.body;
      if (limitPercent === undefined) {
        return res.status(400).json({ error: 'Missing parameter: limitPercent' });
      }
      const result = service.setOverbookingLimit(Number(limitPercent));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getOverbookingRisk(req: Request, res: Response) {
    try {
      const { currentOccupancy } = req.query;
      const occupancy = currentOccupancy ? Number(currentOccupancy) : 75;
      const risk = service.calculateOverbookingRisk(occupancy);
      res.json(risk);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getHistoricalRevenueMetrics(req: Request, res: Response) {
    try {
      const metrics = await service.getHistoricalRevenueMetrics();
      res.json(metrics);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
