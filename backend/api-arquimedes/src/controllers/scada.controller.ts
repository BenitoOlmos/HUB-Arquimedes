import { Request, Response, NextFunction } from 'express';
import { ScadaService } from '../services/scada.service';
import { z } from 'zod';

const scadaService = new ScadaService();

// Auto initialize live state
scadaService.initializeState().catch((err) => {
  console.error('Error initializing SCADA service state:', err);
});

export class ScadaController {
  // Fetch list of plant assets with their current telemetries
  async getAssets(req: Request, res: Response, next: NextFunction) {
    try {
      const assets = scadaService.getLiveState();
      res.status(200).json(assets);
    } catch (error) {
      next(error);
    }
  }

  // Fetch active unresolved/resolved SCADA alarms (ISA 18.2)
  async getAlarms(req: Request, res: Response, next: NextFunction) {
    try {
      const alarms = scadaService.getActiveAlarms();
      res.status(200).json(alarms);
    } catch (error) {
      next(error);
    }
  }

  // Acknowledge alarm
  async acknowledgeAlarm(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const schema = z.object({
        priority: z.string().min(1)
      });
      const parsed = schema.parse(req.body);
      const alarms = await scadaService.acknowledgeAlarm(id, parsed.priority);
      res.status(200).json({ success: true, alarms });
    } catch (error) {
      next(error);
    }
  }

  // Fetch telemetry historical records for trend lines
  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const tagId = req.query.tagId as string;
      const parameter = req.query.parameter as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      if (!tagId || !parameter) {
        res.status(400).json({ error: 'tagId and parameter are required query strings' });
        return;
      }

      const history = await scadaService.getTelemetryHistory(tagId, parameter, limit);

      // Map database logs to client chart structure
      const formatted = history
        .map((h) => ({
          timestamp: h.timestamp,
          value: h.value
        }))
        .reverse(); // Oldest first for plotting

      res.status(200).json(formatted);
    } catch (error) {
      next(error);
    }
  }

  // Set asset parameter (breakers, pitch angle)
  async controlAsset(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        tagId: z.string(),
        parameter: z.enum(['BREAKER', 'PITCH']),
        value: z.any()
      });
      const parsed = schema.parse(req.body);
      const result = await scadaService.adjustControl(parsed.tagId, parsed.parameter, parsed.value);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  // Trigger docent simulation scenario (Transmission Line Short, Voltage Sag)
  async triggerScenario(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        scenario: z.enum(['LINE_FAULT', 'VOLTAGE_SAG']),
        active: z.boolean()
      });
      const parsed = schema.parse(req.body);
      const result = await scadaService.triggerScenario(parsed.scenario, parsed.active);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}
