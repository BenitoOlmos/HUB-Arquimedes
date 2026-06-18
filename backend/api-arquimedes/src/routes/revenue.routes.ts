import { Router } from 'express';
import { RevenueController } from '../controllers/revenue.controller';

const router = Router();

router.get('/kpis', RevenueController.getKpis);
router.get('/pickup', RevenueController.getPickupCurve);
router.get('/rules', RevenueController.getYieldRules);
router.post('/rules', RevenueController.setYieldRules);
router.get('/overbook/limit', RevenueController.getOverbookingLimit);
router.post('/overbook/limit', RevenueController.setOverbookingLimit);
router.get('/overbook/risk', RevenueController.getOverbookingRisk);
router.get('/metrics/history', RevenueController.getHistoricalRevenueMetrics);

export default router;
