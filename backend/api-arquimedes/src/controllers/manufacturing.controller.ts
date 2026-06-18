import { Request, Response } from 'express';
import { ManufacturingService } from '../services/manufacturing.service';

const service = new ManufacturingService();

export class ManufacturingController {

  static async getLineState(req: Request, res: Response) {
    try {
      const state = await service.getLineState();
      res.json(state);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getOeeMetrics(req: Request, res: Response) {
    try {
      const metrics = await service.calculateOeeMetrics();
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getDowntimeLogs(req: Request, res: Response) {
    try {
      const logs = await service.getDowntimeLogs();
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async upgradeMachine(req: Request, res: Response) {
    try {
      const { machineId } = req.body;
      if (!machineId) {
        return res.status(400).json({ error: "Missing required parameter: machineId" });
      }
      const result = await service.upgradeMachine(machineId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async balanceLine(req: Request, res: Response) {
    try {
      const { balance } = req.body;
      if (balance === undefined) {
        return res.status(400).json({ error: "Missing balance parameter in request body" });
      }
      const result = service.setLineBalance(Boolean(balance));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async triggerEvent(req: Request, res: Response) {
    try {
      const { event } = req.body;
      if (!event) {
        return res.status(400).json({ error: "Missing event parameter in request body" });
      }
      const result = service.setActiveEvent(event);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async toggleSimulation(req: Request, res: Response) {
    try {
      const { active } = req.body;
      if (active === undefined) {
        return res.status(400).json({ error: "Missing active parameter in request body" });
      }
      const result = service.setSimulationActive(Boolean(active));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getSimulationStatus(req: Request, res: Response) {
    try {
      const active = service.getSimulationActive();
      const event = service.getActiveEvent();
      res.json({
        simulationActive: active,
        activeEvent: event
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
