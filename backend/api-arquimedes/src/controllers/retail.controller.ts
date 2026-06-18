import { Request, Response, NextFunction } from 'express';
import { RetailService } from '../services/retail.service';
import { z } from 'zod';

const retailService = new RetailService();

export class RetailController {
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await retailService.getProducts();
      res.json(products);
    } catch (error: any) {
      next(error);
    }
  }

  static async getInventories(req: Request, res: Response, next: NextFunction) {
    try {
      const inventories = await retailService.getStoreInventories();
      res.json(inventories);
    } catch (error: any) {
      next(error);
    }
  }

  static async transferStock(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        productId: z.string().min(1, 'productId es requerido'),
        fromType: z.string().min(1, 'fromType es requerido'),
        toLat: z.coerce.number(),
        toLng: z.coerce.number(),
        qty: z.coerce.number().int().positive('La cantidad a transferir debe ser mayor a 0')
      });
      const parsed = schema.parse(req.body);
      const result = await retailService.transferStock(
        parsed.productId,
        parsed.fromType,
        parsed.toLat,
        parsed.toLng,
        parsed.qty
      );
      res.json(result);
    } catch (error: any) {
      next(error);
    }
  }

  static async getConversionFunnel(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await retailService.getConversionFunnel();
      res.json(data);
    } catch (error: any) {
      next(error);
    }
  }

  static async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const customers = await retailService.getCustomers();
      res.json(customers);
    } catch (error: any) {
      next(error);
    }
  }

  static async getCrmRules(req: Request, res: Response, next: NextFunction) {
    try {
      const rules = retailService.getCrmRules();
      res.json(rules);
    } catch (error: any) {
      next(error);
    }
  }

  static async addCrmRule(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        name: z.string().min(1, 'name es requerido'),
        condition: z.string().min(1, 'condition es requerido'),
        discount: z.string().min(1, 'discount es requerido')
      });
      const parsed = schema.parse(req.body);
      const rules = retailService.addCrmRule(parsed.name, parsed.condition, parsed.discount);
      res.json(rules);
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
      const result = retailService.setBlackFridayActive(parsed.active);
      res.json(result);
    } catch (error: any) {
      next(error);
    }
  }

  static async getSimulationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const active = retailService.getBlackFridayActive();
      res.json({ blackFridayActive: active });
    } catch (error: any) {
      next(error);
    }
  }

  static async exportCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await retailService.getEventsLogs();

      // Build CSV file content
      const headers = ['id', 'sessionId', 'eventType', 'sku', 'productName', 'price', 'timestamp'];
      const csvRows = [];
      csvRows.push(headers.join(','));

      for (const log of logs) {
        const row = [
          log.id,
          log.sessionId,
          log.eventType,
          `"${log.sku.replace(/"/g, '""')}"`,
          `"${log.productName.replace(/"/g, '""')}"`,
          log.price,
          log.timestamp
        ];
        csvRows.push(row.join(','));
      }

      const csvContent = csvRows.join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=retail_events_telemetry.csv');
      res.status(200).send(csvContent);
    } catch (error: any) {
      next(error);
    }
  }
}
