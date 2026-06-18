import { Router } from 'express';
import { PmsController } from '../controllers/pms.controller';

const router = Router();

router.get('/rooms', PmsController.getRooms);
router.get('/housekeeping', PmsController.getHousekeepingTasks);
router.post('/housekeeping/assign', PmsController.assignCleaningTask);
router.post('/housekeeping/complete', PmsController.completeCleaningTask);
router.get('/reservations', PmsController.getReservations);
router.post('/checkin', PmsController.checkIn);
router.post('/checkout', PmsController.checkOut);
router.get('/reviews', PmsController.getReviews);
router.post('/crisis/decision', PmsController.submitCrisisDecision);
router.get('/simulation/status', PmsController.getSimulationStatus);
router.post('/simulation/toggle', PmsController.toggleSimulation);
router.post('/simulation/event', PmsController.setSimulationEvent);
router.post('/simulation/crisis/trigger', PmsController.triggerCrisis);

export default router;
