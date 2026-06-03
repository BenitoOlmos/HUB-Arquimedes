import { Request, Response, NextFunction } from 'express';
import * as partService from '../services/part.service';
import { partStatusSchema, maintenanceLogSchema } from 'shared-schemas';

export const getAvailableModels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const models = partService.getAvailableModels();
    return res.status(200).json(models);
  } catch (error) {
    next(error);
  }
};

export const getAllParts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parts = await partService.getAllParts();
    return res.status(200).json(parts);
  } catch (error) {
    next(error);
  }
};

export const getPartById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    const part = await partService.getPartById(id);
    return res.status(200).json(part);
  } catch (error) {
    next(error);
  }
};

export const updatePartStatus = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  try {
    // Validate request body status using shared Zod schema
    const parsedBody = partStatusSchema.safeParse(req.body.status);
    if (!parsedBody.success) {
      return res.status(400).json({ 
        error: 'Invalid status value. Must be Operational, Inspect, or Replace',
        details: parsedBody.error.errors
      });
    }

    const updatedPart = await partService.updatePartStatus(id, parsedBody.data);
    return res.status(200).json(updatedPart);
  } catch (error) {
    next(error);
  }
};

export const addMaintenanceLog = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    // Validate request body using shared Zod schema
    const parsedBody = maintenanceLogSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: parsedBody.error.errors 
      });
    }

    const { tech, desc, status } = parsedBody.data;
    const updatedPart = await partService.addMaintenanceLog(id, tech, desc, status);
    return res.status(200).json(updatedPart);
  } catch (error) {
    next(error);
  }
};
