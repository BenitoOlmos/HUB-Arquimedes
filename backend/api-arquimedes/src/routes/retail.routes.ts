import { Router } from 'express';
import { RetailController } from '../controllers/retail.controller';

const router = Router();

router.get('/products', RetailController.getProducts);
router.get('/inventories', RetailController.getInventories);
router.post('/inventory/transfer', RetailController.transferStock);
router.get('/analytics/funnel', RetailController.getConversionFunnel);
router.get('/customers', RetailController.getCustomers);
router.get('/crm/rules', RetailController.getCrmRules);
router.post('/crm/rules', RetailController.addCrmRule);
router.get('/analytics/export', RetailController.exportCSV);
router.get('/simulation/status', RetailController.getSimulationStatus);
router.post('/simulation/toggle', RetailController.toggleSimulation);

export default router;
