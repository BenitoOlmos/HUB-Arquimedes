import { Router } from 'express';
import { ManufacturingController } from '../controllers/manufacturing.controller';

const router = Router();

router.get('/state', ManufacturingController.getLineState);
router.get('/oee', ManufacturingController.getOeeMetrics);
router.get('/downtime', ManufacturingController.getDowntimeLogs);
router.post('/upgrade', ManufacturingController.upgradeMachine);
router.post('/balance', ManufacturingController.balanceLine);
router.post('/event', ManufacturingController.triggerEvent);
router.post('/simulation/toggle', ManufacturingController.toggleSimulation);
router.get('/simulation/status', ManufacturingController.getSimulationStatus);

export default router;
