import { Request, Response, NextFunction } from 'express';
import { FintechService } from '../services/fintech.service';
import { z } from 'zod';

const fintechService = new FintechService();

export class FintechController {
  // Fetch accounts list
  async getAccounts(req: Request, res: Response, next: NextFunction) {
    try {
      const accounts = await fintechService.getAccounts();
      res.status(200).json(accounts);
    } catch (error) {
      next(error);
    }
  }

  // Fetch transaction history
  async getTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const transactions = await fintechService.getTransactions(limit);
      res.status(200).json(transactions);
    } catch (error) {
      next(error);
    }
  }

  // Fetch active unresolved AML alerts
  async getAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const alerts = await fintechService.getAlerts();
      res.status(200).json(alerts);
    } catch (error) {
      next(error);
    }
  }

  // Resolve AML alert
  async resolveAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const alert = await fintechService.resolveAlert(id);
      res.status(200).json({ success: true, alert });
    } catch (error) {
      next(error);
    }
  }

  // Freeze/Unfreeze account (SecOps Kill Switch)
  async toggleFreeze(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        accountId: z.string(),
        isFrozen: z.boolean()
      });
      const parsed = schema.parse(req.body);
      const account = await fintechService.toggleAccountFreeze(parsed.accountId, parsed.isFrozen);
      res.status(200).json({ success: true, account });
    } catch (error) {
      next(error);
    }
  }

  // Set ML model student Webhook URL
  async setWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        webhookUrl: z.string().url().nullable()
      });
      const parsed = schema.parse(req.body);
      const result = fintechService.setWebhookUrl(parsed.webhookUrl);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // Get consolidated statistics and ML training evaluation performance
  async getMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const accounts = await fintechService.getAccounts();
      const transactions = await fintechService.getTransactions(10000); // Get all

      const balanceTotal = accounts.reduce((acc, curr) => acc + curr.balance.toNumber(), 0);
      const totalTransacted = transactions.reduce((acc, curr) => acc + curr.amount.toNumber(), 0);

      const fraudCount = transactions.filter((t) => t.isFraud).length;
      const fraudRate = transactions.length > 0 ? (fraudCount / transactions.length) * 100 : 0;

      const evaluation = fintechService.getEvaluationStats();
      const webhookUrl = fintechService.getWebhookUrl();

      res.status(200).json({
        totalTransacted: parseFloat(totalTransacted.toFixed(2)),
        fraudRate: parseFloat(fraudRate.toFixed(2)),
        balanceTotal: parseFloat(balanceTotal.toFixed(2)),
        webhookUrl,
        evaluation
      });
    } catch (error) {
      next(error);
    }
  }

  // Reset/Purge simulation state
  async resetSimulation(req: Request, res: Response, next: NextFunction) {
    try {
      await fintechService.resetSimulation();
      res.status(200).json({ success: true, message: 'Simulation reset complete' });
    } catch (error) {
      next(error);
    }
  }
}
