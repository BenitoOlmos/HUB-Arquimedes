import { Request, Response } from 'express';
import { HisService } from '../services/his.service';
import prisma from '../services/prisma';

const service = new HisService();

export class HisController {
  static async getSimulationState(req: Request, res: Response) {
    try {
      const state = await service.getSimulationState();
      res.json(state);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateClockSpeed(req: Request, res: Response) {
    try {
      const { speed } = req.body;
      if (speed === undefined) {
        return res.status(400).json({ error: 'Missing speed parameter' });
      }
      const newSpeed = service.updateClockSpeed(Number(speed));
      res.json({ clockSpeed: newSpeed });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getBeds(req: Request, res: Response) {
    try {
      const beds = await service.getBeds();
      res.json(beds);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getActiveTriage(req: Request, res: Response) {
    try {
      const activeTriage = await service.getActiveTriage();
      res.json(activeTriage);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getPatients(req: Request, res: Response) {
    try {
      const search = (req.query.search as string) || '';
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 15;
      const skip = (page - 1) * pageSize;

      const where: any = {};
      if (search) {
        where.OR = [
          { fullName: { contains: search, mode: 'insensitive' } },
          { rut: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [data, total] = await prisma.$transaction([
        prisma.hisPatient.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { fullName: 'asc' }
        }),
        prisma.hisPatient.count({ where })
      ]);

      const mapped = data.map(p => ({
        id: p.rut,
        rut: p.rut,
        name: p.fullName,
        fullName: p.fullName,
        age: p.age,
        gender: p.gender,
        bloodType: p.bloodType,
        comorbidities: JSON.parse(p.comorbidities || '[]'),
        allergies: JSON.parse(p.allergies || '[]')
      }));

      const totalPages = Math.ceil(total / pageSize);
      res.json({ data: mapped, total, totalPages });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async admitPatient(req: Request, res: Response) {
    try {
      const { rut, symptoms, assignedEsi, vitals } = req.body;
      if (!rut || !symptoms || assignedEsi === undefined || !vitals) {
        return res.status(400).json({ error: 'Missing required parameters: rut, symptoms, assignedEsi, vitals' });
      }
      const triage = await service.admitPatient(rut, symptoms, Number(assignedEsi), vitals);
      res.json(triage);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async transferPatient(req: Request, res: Response) {
    try {
      const { triageId, bedId } = req.body;
      if (!triageId || !bedId) {
        return res.status(400).json({ error: 'Missing required parameters: triageId, bedId' });
      }
      const result = await service.transferPatientToBed(triageId, bedId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async dischargePatient(req: Request, res: Response) {
    try {
      const { bedId } = req.body;
      if (!bedId) {
        return res.status(400).json({ error: 'Missing required parameter: bedId' });
      }
      const result = await service.dischargePatient(bedId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getPharmacyInventory(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 15;
      const search = (req.query.search as string) || '';
      const category = (req.query.category as string) || '';

      const result = await service.getPharmacyInventory(page, pageSize, search, category);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async buyPharmacySku(req: Request, res: Response) {
    try {
      const { skuId, quantity } = req.body;
      if (!skuId || !quantity) {
        return res.status(400).json({ error: 'Missing required parameters: skuId, quantity' });
      }
      const result = await service.buyPharmacySku(skuId, Number(quantity));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getHistoricalAnalytics(req: Request, res: Response) {
    try {
      const result = await service.getHistoricalAnalytics();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async triggerCrisis(req: Request, res: Response) {
    try {
      const { type } = req.body;
      if (!type) {
        return res.status(400).json({ error: 'Missing parameter: type' });
      }
      service.triggerCrisis(type);
      res.json({ success: true, activeCrises: (await service.getSimulationState()).activeCrises });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async resolveCrises(req: Request, res: Response) {
    try {
      service.resolveCrises();
      res.json({ success: true, activeCrises: [] });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
