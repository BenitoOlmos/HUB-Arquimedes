import { Request, Response, NextFunction } from 'express';
import { PortService } from '../services/port.service';
import { z } from 'zod';

const portService = new PortService();

export class PortController {

  // Get consolidated state for Solver scripts (Python, Excel, Solver)
  async getConsolidatedState(req: Request, res: Response, next: NextFunction) {
    try {
      const state = await portService.getConsolidatedState();
      res.status(200).json(state);
    } catch (error) {
      next(error);
    }
  }

  // Get all cargo ships
  async getShips(req: Request, res: Response, next: NextFunction) {
    try {
      const ships = await portService.getShips();
      res.status(200).json(ships);
    } catch (error) {
      next(error);
    }
  }

  // Get single ship detail
  async getShipById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const ship = await portService.getShipById(id);
      if (!ship) {
        return res.status(404).json({ error: 'Ship not found' });
      }
      res.status(200).json(ship);
    } catch (error) {
      next(error);
    }
  }

  // Reroute a ship
  async rerouteShip(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        shipId: z.string(),
        routeOption: z.enum(['DEFAULT', 'DETOUR'])
      });
      const parsed = schema.parse(req.body);
      const ship = await portService.rerouteShip(parsed.shipId, parsed.routeOption);
      res.status(200).json({ success: true, ship });
    } catch (error) {
      next(error);
    }
  }

  // Get all cargo manifests (Kanban)
  async getManifests(req: Request, res: Response, next: NextFunction) {
    try {
      const manifests = await portService.getManifests();
      res.status(200).json(manifests);
    } catch (error) {
      next(error);
    }
  }

  // Update cargo manifest customs status
  async updateManifestStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const schema = z.object({
        status: z.enum(['PENDIENTE', 'APROBADO', 'INSPECCION_FISICA', 'RETENIDO'])
      });
      const parsed = schema.parse(req.body);
      const manifest = await portService.updateManifestStatus(id, parsed.status);
      res.status(200).json({ success: true, manifest });
    } catch (error) {
      next(error);
    }
  }

  // Trigger weather or strike crisis
  async triggerGlobalEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        eventType: z.enum(['CLIMA', 'HUELGA', 'PIRATERIA']),
        severity: z.number().int().min(1).max(5),
        affectedRegion: z.string()
      });
      const parsed = schema.parse(req.body);
      const event = await portService.triggerGlobalEvent(parsed.eventType, parsed.affectedRegion, parsed.severity);
      res.status(201).json({ success: true, event });
    } catch (error) {
      next(error);
    }
  }

  // Resolve all active global events
  async resolveGlobalEvents(req: Request, res: Response, next: NextFunction) {
    try {
      await portService.resolveGlobalEvents();
      res.status(200).json({ success: true, message: 'All active events resolved' });
    } catch (error) {
      next(error);
    }
  }
}
