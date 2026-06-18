import { Request, Response, NextFunction } from 'express';
import { TrafficService } from '../services/traffic.service';
import { z } from 'zod';

const trafficService = new TrafficService();

export class MobilityController {
  static async getRoutes(req: Request, res: Response, next: NextFunction) {
    try {
      const routes = await trafficService.getRoutes();
      res.json(routes);
    } catch (error: any) {
      next(error);
    }
  }

  static async getIntersections(req: Request, res: Response, next: NextFunction) {
    try {
      const intersections = await trafficService.getIntersections();
      res.json(intersections);
    } catch (error: any) {
      next(error);
    }
  }

  static async updateIntersection(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        id: z.string().min(1, 'id es requerido'),
        greenPhase: z.coerce.number().int().nonnegative(),
        redPhase: z.coerce.number().int().nonnegative(),
        offset: z.coerce.number().int().nonnegative()
      });
      const parsed = schema.parse(req.body);
      const result = await trafficService.updateIntersection(
        parsed.id,
        parsed.greenPhase,
        parsed.redPhase,
        parsed.offset
      );
      res.json(result);
    } catch (error: any) {
      next(error);
    }
  }

  static async getODMatrix(req: Request, res: Response, next: NextFunction) {
    try {
      const matrix = await trafficService.getODMatrix();
      res.json(matrix);
    } catch (error: any) {
      next(error);
    }
  }

  static async getKPIs(req: Request, res: Response, next: NextFunction) {
    try {
      const kpis = await trafficService.getKPIs();
      res.json(kpis);
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
      const result = trafficService.setActiveEvent(parsed.event);
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
      const result = trafficService.setSimulationActive(parsed.active);
      res.json(result);
    } catch (error: any) {
      next(error);
    }
  }

  static async getSimulationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const active = trafficService.getSimulationActive();
      const event = trafficService.getActiveEvent();
      res.json({
        simulationActive: active,
        activeEvent: event
      });
    } catch (error: any) {
      next(error);
    }
  }
}
