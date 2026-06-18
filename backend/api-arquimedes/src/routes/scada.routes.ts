import { Router } from 'express';
import { ScadaController } from '../controllers/scada.controller';

const router = Router();
const controller = new ScadaController();

router.get('/assets', controller.getAssets.bind(controller));
router.get('/alarms', controller.getAlarms.bind(controller));
router.post('/alarms/:id/ack', controller.acknowledgeAlarm.bind(controller));
router.get('/history', controller.getHistory.bind(controller));
router.post('/control', controller.controlAsset.bind(controller));
router.post('/scenario', controller.triggerScenario.bind(controller));

export default router;
