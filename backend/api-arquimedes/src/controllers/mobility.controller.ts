import { Request, Response } from 'express';
import { TrafficService } from '../services/traffic.service';

const trafficService = new TrafficService();

export class MobilityController {

  static async getRoutes(req: Request, res: Response) {
    try {
      const routes = await trafficService.getRoutes();
      res.json(routes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getIntersections(req: Request, res: Response) {
    try {
      const intersections = await trafficService.getIntersections();
      res.json(intersections);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateIntersection(req: Request, res: Response) {
    try {
      const { id, greenPhase, redPhase, offset } = req.body;
      if (!id || greenPhase === undefined || redPhase === undefined || offset === undefined) {
        return res.status(400).json({ error: "Missing required fields: id, greenPhase, redPhase, offset" });
      }
      const result = await trafficService.updateIntersection(
        id, 
        Number(greenPhase), 
        Number(redPhase), 
        Number(offset)
      );
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getODMatrix(req: Request, res: Response) {
    try {
      const matrix = await trafficService.getODMatrix();
      res.json(matrix);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getKPIs(req: Request, res: Response) {
    try {
      const kpis = await trafficService.getKPIs();
      res.json(kpis);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async triggerEvent(req: Request, res: Response) {
    try {
      const { event } = req.body;
      if (!event) {
        return res.status(400).json({ error: "Missing event string in request body" });
      }
      const result = trafficService.setActiveEvent(event);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async toggleSimulation(req: Request, res: Response) {
    try {
      const { active } = req.body;
      if (active === undefined) {
        return res.status(400).json({ error: "Missing active status boolean in request body" });
      }
      const result = trafficService.setSimulationActive(Boolean(active));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getSimulationStatus(req: Request, res: Response) {
    try {
      const active = trafficService.getSimulationActive();
      const event = trafficService.getActiveEvent();
      res.json({ 
        simulationActive: active,
        activeEvent: event
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
