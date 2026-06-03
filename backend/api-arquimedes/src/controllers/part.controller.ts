import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export const getAvailableModels = async (req: Request, res: Response) => {
  try {
    const modelsDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'models');
    if (!fs.existsSync(modelsDir)) {
      return res.status(200).json(['pump.glb']);
    }
    const files = fs.readdirSync(modelsDir);
    const glbFiles = files.filter(file => file.endsWith('.glb'));
    return res.status(200).json(glbFiles);
  } catch (error) {
    console.error('Error listing models:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAllParts = async (req: Request, res: Response) => {
  try {
    const parts = await prisma.pumpPart.findMany({
      orderBy: { name: 'asc' }
    });
    return res.status(200).json(parts);
  } catch (error) {
    console.error('Error fetching parts:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getPartById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const part = await prisma.pumpPart.findUnique({
      where: { id }
    });
    if (!part) {
      return res.status(404).json({ error: `Part with ID ${id} not found` });
    }
    return res.status(200).json(part);
  } catch (error) {
    console.error(`Error fetching part with ID ${id}:`, error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updatePartStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status || !['Operational', 'Inspect', 'Replace'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value. Must be Operational, Inspect, or Replace' });
  }

  try {
    const updatedPart = await prisma.pumpPart.update({
      where: { id },
      data: { status }
    });
    return res.status(200).json(updatedPart);
  } catch (error) {
    console.error(`Error updating status for part ${id}:`, error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const addMaintenanceLog = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { tech, desc, status } = req.body;

  if (!tech || !desc) {
    return res.status(400).json({ error: 'Technician name and log description are required' });
  }

  try {
    const part = await prisma.pumpPart.findUnique({ where: { id } });
    if (!part) {
      return res.status(404).json({ error: `Part ${id} not found` });
    }

    let logs = [];
    if (part.maintenanceLogs) {
      try {
        logs = JSON.parse(part.maintenanceLogs);
      } catch (e) {
        logs = [];
      }
    }

    const newLog = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      tech,
      desc
    };
    logs.push(newLog);

    const updateData: any = {
      maintenanceLogs: JSON.stringify(logs)
    };
    if (status) {
      updateData.status = status;
    }

    const updatedPart = await prisma.pumpPart.update({
      where: { id },
      data: updateData
    });

    return res.status(200).json(updatedPart);
  } catch (error) {
    console.error(`Error adding maintenance log for part ${id}:`, error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
