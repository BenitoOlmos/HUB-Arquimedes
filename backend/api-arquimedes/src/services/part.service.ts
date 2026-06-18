import * as partRepository from '../repositories/part.repository';
import fs from 'fs';
import path from 'path';

export const getAvailableModels = () => {
  // Resolve models folder relative to this file's position in the monorepo structure
  const modelsDir = path.join(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    'frontend',
    'centrifuga-arquimedes',
    'public',
    'models'
  );

  if (!fs.existsSync(modelsDir)) {
    return ['pump.glb'];
  }

  try {
    const files = fs.readdirSync(modelsDir);
    const glbFiles = files.filter((file) => file.endsWith('.glb'));
    return glbFiles.length > 0 ? glbFiles : ['pump.glb'];
  } catch (error) {
    return ['pump.glb'];
  }
};

export const getAllParts = async () => {
  return partRepository.findAll();
};

export const getPartById = async (id: string) => {
  const part = await partRepository.findById(id);
  if (!part) {
    throw new Error(`Part with ID ${id} not found`);
  }
  return part;
};

export const updatePartStatus = async (id: string, status: string) => {
  // Validate that the part exists before updating status
  await getPartById(id);
  return partRepository.updateStatus(id, status);
};

export const addMaintenanceLog = async (
  id: string,
  tech: string,
  desc: string,
  status?: string
) => {
  const part = await getPartById(id);

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

  return partRepository.updateLogsAndStatus(id, JSON.stringify(logs), status);
};
