import { Router } from 'express';
import { FintechController } from '../controllers/fintech.controller';

const router = Router();
const controller = new FintechController();

// Accounts and core bank metrics
router.get('/accounts', controller.getAccounts.bind(controller));
router.get('/metrics', controller.getMetrics.bind(controller));
router.post('/accounts/freeze', controller.toggleFreeze.bind(controller));

// Transactions feed
router.get('/transactions', controller.getTransactions.bind(controller));

// AML Alerts
router.get('/alerts', controller.getAlerts.bind(controller));
router.post('/alerts/:id/resolve', controller.resolveAlert.bind(controller));

// Webhook for ML modeling
router.post('/webhook', controller.setWebhook.bind(controller));

// Reset simulation variables
router.post('/reset', controller.resetSimulation.bind(controller));

export default router;
