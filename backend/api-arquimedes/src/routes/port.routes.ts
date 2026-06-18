import { Router } from 'express';
import { PortController } from '../controllers/port.controller';

const router = Router();
const controller = new PortController();

// Solver API
router.get('/current-state', controller.getConsolidatedState.bind(controller));

// Ships endpoints
router.get('/ships', controller.getShips.bind(controller));
router.get('/ships/:id', controller.getShipById.bind(controller));
router.post('/reroute', controller.rerouteShip.bind(controller));

// Customs manifestations (Kanban)
router.get('/manifests', controller.getManifests.bind(controller));
router.post('/manifests/:id/status', controller.updateManifestStatus.bind(controller));

// Crisis console endpoints
router.post('/events', controller.triggerGlobalEvent.bind(controller));
router.post('/events/resolve', controller.resolveGlobalEvents.bind(controller));

export default router;
