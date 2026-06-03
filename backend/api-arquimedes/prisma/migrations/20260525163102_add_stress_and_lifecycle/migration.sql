-- CreateTable
CREATE TABLE "PumpPart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "spanishName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "function" TEXT NOT NULL,
    "maintenanceInterval" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "commonFailures" TEXT NOT NULL,
    "technicianAlert" TEXT NOT NULL,
    "entryDate" TEXT NOT NULL,
    "operatingHours" INTEGER NOT NULL,
    "vibrationHistory" TEXT NOT NULL,
    "stressHistory" TEXT NOT NULL,
    "remainingLife" INTEGER NOT NULL,
    "lifecycleStage" TEXT NOT NULL,
    "installationNotes" TEXT NOT NULL,
    "nextMaintenance" TEXT NOT NULL,
    "maintenanceLogs" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
