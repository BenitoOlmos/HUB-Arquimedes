import { Request, Response } from 'express';
import { EsgService } from '../services/esg.service';

const esgService = new EsgService();

export class EmissionsController {

  static async getActivities(req: Request, res: Response) {
    try {
      const scope = req.query.scope ? Number(req.query.scope) : undefined;
      const facilityId = req.query.facilityId ? String(req.query.facilityId) : undefined;

      const activities = await esgService.getActivities(scope, facilityId);
      res.json(activities);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async auditActivity(req: Request, res: Response) {
    try {
      const { activityId, correctedAmount, correctedUnit } = req.body;
      if (!activityId || correctedAmount === undefined || !correctedUnit) {
        res.status(400).json({ error: 'Faltan parámetros de auditoría (activityId, correctedAmount, correctedUnit).' });
        return;
      }

      const updated = await esgService.auditActivity(activityId, Number(correctedAmount), correctedUnit);
      res.json({ success: true, message: 'Registro de actividad auditado con éxito.', updated });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async downloadPdfReport(req: Request, res: Response) {
    try {
      const metrics = await esgService.getEsgMetrics();
      const activities = await esgService.getActivities();

      const pdfBuffer = await esgService.generatePdfReport(metrics, activities);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=Reporte_Sustentabilidad_GHG.pdf');
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
