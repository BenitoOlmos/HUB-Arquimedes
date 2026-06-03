import prisma from '../services/prisma';

export const findAll = async () => {
  return prisma.pumpPart.findMany({
    orderBy: { name: 'asc' }
  });
};

export const findById = async (id: string) => {
  return prisma.pumpPart.findUnique({
    where: { id }
  });
};

export const updateStatus = async (id: string, status: string) => {
  return prisma.pumpPart.update({
    where: { id },
    data: { status }
  });
};

export const updateLogsAndStatus = async (id: string, maintenanceLogs: string, status?: string) => {
  const updateData: any = { maintenanceLogs };
  if (status) {
    updateData.status = status;
  }
  return prisma.pumpPart.update({
    where: { id },
    data: updateData
  });
};
