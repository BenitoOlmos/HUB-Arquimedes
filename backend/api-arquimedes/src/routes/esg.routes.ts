import { Router } from 'express';
import { EsgController } from '../controllers/esg.controller';
import { EmissionsController } from '../controllers/emissions.controller';

const router = Router();

// General ESG telemetry and metadata routes
router.get('/facilities', EsgController.getFacilities);
router.get('/factors', EsgController.getFactors);
router.get('/metrics', EsgController.getMetrics);
router.post('/reset', EsgController.resetSimulation);

// Circular economy toggle routes
router.get('/circular', EsgController.getCircularEconomy);
router.post('/circular', EsgController.setCircularEconomy);

// Teacher/instructor simulation event routes
router.get('/event', EsgController.getActiveEvent);
router.post('/event', EsgController.setActiveEvent);

// Carbon offsetting market routes
router.get('/market', EsgController.getCarbonMarket);
router.post('/market/buy', EsgController.buyCarbonCredits);

// Activity invoice and audit log routes
router.get('/activities', EmissionsController.getActivities);
router.post('/activities/audit', EmissionsController.auditActivity);
router.get('/report/pdf', EmissionsController.downloadPdfReport);

export default router;
