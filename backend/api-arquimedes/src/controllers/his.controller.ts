import { Request, Response, NextFunction } from 'express';
import { HisService } from '../services/his.service';
import prisma from '../services/prisma';
import { z } from 'zod';

const service = new HisService();

export class HisController {
  static async getSimulationState(req: Request, res: Response, next: NextFunction) {
    try {
      const state = await service.getSimulationState();
      res.json(state);
    } catch (err: any) {
      next(err);
    }
  }

  static async updateClockSpeed(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        speed: z.number().int().min(0).max(10)
      });
      const parsed = schema.parse(req.body);
      const newSpeed = service.updateClockSpeed(parsed.speed);
      res.json({ clockSpeed: newSpeed });
    } catch (err: any) {
      next(err);
    }
  }

  static async getBeds(req: Request, res: Response, next: NextFunction) {
    try {
      const beds = await service.getBeds();
      res.json(beds);
    } catch (err: any) {
      next(err);
    }
  }

  static async getActiveTriage(req: Request, res: Response, next: NextFunction) {
    try {
      const activeTriage = await service.getActiveTriage();
      res.json(activeTriage);
    } catch (err: any) {
      next(err);
    }
  }

  static async getPatients(req: Request, res: Response, next: NextFunction) {
    try {
      const querySchema = z.object({
        search: z.string().optional().default(''),
        page: z.coerce.number().int().positive().optional().default(1),
        pageSize: z.coerce.number().int().positive().optional().default(15)
      });
      const parsed = querySchema.parse(req.query);
      const skip = (parsed.page - 1) * parsed.pageSize;

      const where: any = {};
      if (parsed.search) {
        where.OR = [
          { fullName: { contains: parsed.search, mode: 'insensitive' } },
          { rut: { contains: parsed.search, mode: 'insensitive' } }
        ];
      }

      const [data, total] = await prisma.$transaction([
        prisma.hisPatient.findMany({
          where,
          skip,
          take: parsed.pageSize,
          orderBy: { fullName: 'asc' }
        }),
        prisma.hisPatient.count({ where })
      ]);

      const mapped = data.map((p) => ({
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

      const totalPages = Math.ceil(total / parsed.pageSize);
      res.json({ data: mapped, total, totalPages });
    } catch (err: any) {
      next(err);
    }
  }

  static async admitPatient(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        rut: z.string().min(1, 'RUT es requerido'),
        symptoms: z.string().min(1, 'Síntomas son requeridos'),
        assignedEsi: z.number().int().min(1).max(5),
        vitals: z.object({
          hr: z.number(),
          bp_sys: z.number(),
          bp_dia: z.number(),
          temp: z.number(),
          sat: z.number()
        })
      });
      const parsed = schema.parse(req.body);
      const triage = await service.admitPatient(
        parsed.rut,
        parsed.symptoms,
        parsed.assignedEsi,
        parsed.vitals
      );
      res.json(triage);
    } catch (err: any) {
      next(err);
    }
  }

  static async transferPatient(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        triageId: z.string().min(1, 'triageId es requerido'),
        bedId: z.string().min(1, 'bedId es requerido')
      });
      const parsed = schema.parse(req.body);
      const result = await service.transferPatientToBed(parsed.triageId, parsed.bedId);
      res.json(result);
    } catch (err: any) {
      next(err);
    }
  }

  static async dischargePatient(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        bedId: z.string().min(1, 'bedId es requerido')
      });
      const parsed = schema.parse(req.body);
      const result = await service.dischargePatient(parsed.bedId);
      res.json(result);
    } catch (err: any) {
      next(err);
    }
  }

  static async getPharmacyInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const querySchema = z.object({
        page: z.coerce.number().int().positive().optional().default(1),
        pageSize: z.coerce.number().int().positive().optional().default(15),
        search: z.string().optional().default(''),
        category: z.string().optional().default('')
      });
      const parsed = querySchema.parse(req.query);

      const result = await service.getPharmacyInventory(
        parsed.page,
        parsed.pageSize,
        parsed.search,
        parsed.category
      );
      res.json(result);
    } catch (err: any) {
      next(err);
    }
  }

  static async buyPharmacySku(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        skuId: z.string().min(1, 'skuId es requerido'),
        quantity: z.number().int().positive('La cantidad debe ser positiva')
      });
      const parsed = schema.parse(req.body);
      const result = await service.buyPharmacySku(parsed.skuId, parsed.quantity);
      res.json(result);
    } catch (err: any) {
      next(err);
    }
  }

  static async getHistoricalAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.getHistoricalAnalytics();
      res.json(result);
    } catch (err: any) {
      next(err);
    }
  }

  static async triggerCrisis(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        type: z.string().min(1, 'El tipo de crisis es requerido')
      });
      const parsed = schema.parse(req.body);
      service.triggerCrisis(parsed.type);
      res.json({ success: true, activeCrises: (await service.getSimulationState()).activeCrises });
    } catch (err: any) {
      next(err);
    }
  }

  static async resolveCrises(req: Request, res: Response, next: NextFunction) {
    try {
      service.resolveCrises();
      res.json({ success: true, activeCrises: [] });
    } catch (err: any) {
      next(err);
    }
  }
}
