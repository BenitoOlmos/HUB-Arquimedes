import { Request, Response } from 'express';
import { RetailService } from '../services/retail.service';

const retailService = new RetailService();

export class RetailController {

  static async getProducts(req: Request, res: Response) {
    try {
      const products = await retailService.getProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getInventories(req: Request, res: Response) {
    try {
      const inventories = await retailService.getStoreInventories();
      res.json(inventories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async transferStock(req: Request, res: Response) {
    try {
      const { productId, fromType, toLat, toLng, qty } = req.body;
      if (!productId || !fromType || toLat === undefined || toLng === undefined || !qty) {
        return res.status(400).json({ error: "Missing required fields: productId, fromType, toLat, toLng, qty" });
      }
      const result = await retailService.transferStock(productId, fromType, Number(toLat), Number(toLng), Number(qty));
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getConversionFunnel(req: Request, res: Response) {
    try {
      const data = await retailService.getConversionFunnel();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getCustomers(req: Request, res: Response) {
    try {
      const customers = await retailService.getCustomers();
      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getCrmRules(req: Request, res: Response) {
    try {
      const rules = retailService.getCrmRules();
      res.json(rules);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async addCrmRule(req: Request, res: Response) {
    try {
      const { name, condition, discount } = req.body;
      if (!name || !condition || !discount) {
        return res.status(400).json({ error: "Missing required fields: name, condition, discount" });
      }
      const rules = retailService.addCrmRule(name, condition, discount);
      res.json(rules);
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
      const result = retailService.setBlackFridayActive(Boolean(active));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getSimulationStatus(req: Request, res: Response) {
    try {
      const active = retailService.getBlackFridayActive();
      res.json({ blackFridayActive: active });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async exportCSV(req: Request, res: Response) {
    try {
      const logs = await retailService.getEventsLogs();
      
      // Build CSV file content
      const headers = ["id", "sessionId", "eventType", "sku", "productName", "price", "timestamp"];
      const csvRows = [];
      csvRows.push(headers.join(","));

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
        csvRows.push(row.join(","));
      }

      const csvContent = csvRows.join("\n");

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=retail_events_telemetry.csv');
      res.status(200).send(csvContent);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
