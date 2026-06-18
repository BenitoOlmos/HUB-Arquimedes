import { Router } from 'express';
import { HisController } from '../controllers/his.controller';

const router = Router();

router.get('/state', HisController.getSimulationState);
router.post('/speed', HisController.updateClockSpeed);
router.get('/beds', HisController.getBeds);
router.get('/triage', HisController.getActiveTriage);
router.get('/patients', HisController.getPatients);
router.post('/triage/admit', HisController.admitPatient);
router.post('/beds/transfer', HisController.transferPatient);
router.post('/beds/discharge', HisController.dischargePatient);
router.get('/pharmacy', HisController.getPharmacyInventory);
router.post('/pharmacy/buy', HisController.buyPharmacySku);
router.get('/history', HisController.getHistoricalAnalytics);
router.post('/crisis/trigger', HisController.triggerCrisis);
router.post('/crisis/resolve', HisController.resolveCrises);

export default router;
