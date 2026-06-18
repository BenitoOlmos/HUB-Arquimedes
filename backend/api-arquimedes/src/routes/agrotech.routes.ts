import { Router } from 'express';
import { AgrotechController } from '../controllers/agrotech.controller';

const router = Router();
const controller = new AgrotechController();

// Basic IoT Zone routes
router.get('/zones', controller.getZones.bind(controller));
router.get('/telemetry/history', controller.getHistoricalTelemetry.bind(controller));

// Rules Engine endpoints
router.get('/rules', controller.getRules.bind(controller));
router.post('/rules', controller.createRule.bind(controller));
router.delete('/rules/:id', controller.deleteRule.bind(controller));

// Valve controls
router.post('/valves/toggle', controller.toggleValve.bind(controller));

// Pests outbreaks
router.get('/pests/history', controller.getHistoricalPests.bind(controller));

// Administrative control
router.post('/events', controller.triggerEvent.bind(controller));
router.get('/kpis', controller.getKPIs.bind(controller));
router.post('/reset', controller.resetSimulation.bind(controller));

export default router;
