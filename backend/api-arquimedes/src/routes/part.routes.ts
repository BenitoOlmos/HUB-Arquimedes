import { Router } from 'express';
import { getAllParts, getPartById, updatePartStatus, getAvailableModels, addMaintenanceLog } from '../controllers/part.controller';

const router = Router();

router.get('/models', getAvailableModels);
router.get('/', getAllParts);
router.get('/:id', getPartById);
router.put('/:id/status', updatePartStatus);
router.post('/:id/logs', addMaintenanceLog);

export default router;
