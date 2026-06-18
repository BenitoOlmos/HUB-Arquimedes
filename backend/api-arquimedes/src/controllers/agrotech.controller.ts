import { Request, Response, NextFunction } from 'express';
import { AgrotechService } from '../services/agrotech.service';
import { z } from 'zod';

const agrotechService = new AgrotechService();

export class AgrotechController {
  // Fetch zones, sensors, and current readings
  async getZones(req: Request, res: Response, next: NextFunction) {
    try {
      const zones = await agrotechService.getZones();
      res.status(200).json(zones);
    } catch (error) {
      next(error);
    }
  }

  // Fetch aggregated historical telemetry readings
  async getHistoricalTelemetry(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        zoneId: z.string(),
        sensorType: z.enum(['SOIL_MOISTURE', 'PH', 'TEMPERATURE', 'RADIATION']),
        range: z.enum(['24h', '7d', '30d']).default('24h')
      });

      const parsed = schema.parse({
        zoneId: req.query.zoneId,
        sensorType: req.query.sensorType,
        range: req.query.range
      });

      const history = await agrotechService.getHistoricalTelemetry(
        parsed.zoneId,
        parsed.sensorType,
        parsed.range as any
      );

      res.status(200).json(history);
    } catch (error) {
      next(error);
    }
  }

  // Fetch all active rules
  async getRules(req: Request, res: Response, next: NextFunction) {
    try {
      const rules = await agrotechService.getRules();
      res.status(200).json(rules);
    } catch (error) {
      next(error);
    }
  }

  // Create an automatic rule
  async createRule(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        zoneId: z.string(),
        name: z.string().min(1),
        sensorType: z.enum(['SOIL_MOISTURE', 'PH', 'TEMPERATURE', 'RADIATION']),
        operator: z.enum(['LT', 'GT']),
        thresholdValue: z.number(),
        durationMinutes: z.number().int().positive()
      });

      const parsed = schema.parse(req.body);
      const rule = await agrotechService.createRule(parsed);
      res.status(201).json({ success: true, rule });
    } catch (error) {
      next(error);
    }
  }

  // Delete an automatic rule
  async deleteRule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await agrotechService.deleteRule(id);
      res.status(200).json({ success: true, message: 'Rule deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Fetch historical pest outbreaks
  async getHistoricalPests(req: Request, res: Response, next: NextFunction) {
    try {
      const pests = await agrotechService.getHistoricalPests();
      res.status(200).json(pests);
    } catch (error) {
      next(error);
    }
  }

  // Manual valve state toggle
  async toggleValve(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        valveId: z.string(),
        status: z.enum(['ABIERTA', 'CERRADA'])
      });
      const parsed = schema.parse(req.body);
      const valve = await agrotechService.setValveStatus(parsed.valveId, parsed.status);
      res.status(200).json({ success: true, valve });
    } catch (error) {
      next(error);
    }
  }

  // Trigger crisis event (heatwave / drought)
  async triggerEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        eventType: z.enum(['OLA_DE_CALOR', 'SEQUIA', 'NORMAL']),
        severity: z.number().min(0).max(5)
      });
      const parsed = schema.parse(req.body);
      const event = agrotechService.triggerEvent(parsed.eventType, parsed.severity);
      res.status(200).json({ success: true, event });
    } catch (error) {
      next(error);
    }
  }

  // Get KPI KPIs
  async getKPIs(req: Request, res: Response, next: NextFunction) {
    try {
      const kpis = agrotechService.getMetricsKPIs();
      res.status(200).json(kpis);
    } catch (error) {
      next(error);
    }
  }

  // Reset simulation variables
  async resetSimulation(req: Request, res: Response, next: NextFunction) {
    try {
      await agrotechService.resetSimulation();
      res.status(200).json({ success: true, message: 'Simulation reset complete' });
    } catch (error) {
      next(error);
    }
  }
}
