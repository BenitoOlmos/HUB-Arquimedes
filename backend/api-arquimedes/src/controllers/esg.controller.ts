import { Request, Response } from 'express';
import { EsgService } from '../services/esg.service';

const esgService = new EsgService();

export class EsgController {

  static async getFacilities(req: Request, res: Response) {
    try {
      const facilities = await esgService.getFacilities();
      res.json(facilities);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getFactors(req: Request, res: Response) {
    try {
      const factors = await esgService.getFactors();
      res.json(factors);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getCarbonMarket(req: Request, res: Response) {
    try {
      const market = await esgService.getCarbonMarket();
      res.json(market);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async buyCarbonCredits(req: Request, res: Response) {
    try {
      const { projectId, tons } = req.body;
      if (!projectId || !tons || tons <= 0) {
        res.status(400).json({ error: 'Faltan parámetros válidos (projectId, tons).' });
        return;
      }
      const result = await esgService.buyCarbonCredits(projectId, Number(tons));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getMetrics(req: Request, res: Response) {
    try {
      const metrics = await esgService.getEsgMetrics();
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async resetSimulation(req: Request, res: Response) {
    try {
      await esgService.resetSimulation();
      const metrics = await esgService.getEsgMetrics();
      res.json({ success: true, message: 'Simulación reiniciada con éxito.', metrics });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async setCircularEconomy(req: Request, res: Response) {
    try {
      const { active } = req.body;
      esgService.setCircularEconomy(Boolean(active));
      res.json({ success: true, active: esgService.getCircularEconomyStatus() });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getCircularEconomy(req: Request, res: Response) {
    try {
      res.json({ active: esgService.getCircularEconomyStatus() });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getActiveEvent(req: Request, res: Response) {
    try {
      res.json({ event: esgService.getEvent() });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async setActiveEvent(req: Request, res: Response) {
    try {
      const { event } = req.body;
      esgService.setEvent(event || 'NORMAL');
      res.json({ success: true, event: esgService.getEvent() });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
