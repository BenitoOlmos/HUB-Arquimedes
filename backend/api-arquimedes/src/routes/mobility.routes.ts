import { Router } from 'express';
import { MobilityController } from '../controllers/mobility.controller';

const router = Router();

router.get('/routes', MobilityController.getRoutes);
router.get('/intersections', MobilityController.getIntersections);
router.post('/intersections/update', MobilityController.updateIntersection);
router.get('/analytics/od-matrix', MobilityController.getODMatrix);
router.get('/analytics/kpis', MobilityController.getKPIs);
router.get('/simulation/status', MobilityController.getSimulationStatus);
router.post('/simulation/toggle', MobilityController.toggleSimulation);
router.post('/simulation/event', MobilityController.triggerEvent);

export default router;
