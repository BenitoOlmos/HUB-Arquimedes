import { z } from 'zod';

export const partStatusSchema = z.enum(['Operational', 'Inspect', 'Replace']);

export const maintenanceLogSchema = z.object({
  tech: z.string().min(1, "El nombre del técnico es requerido"),
  desc: z.string().min(1, "La descripción del mantenimiento es requerida"),
  status: partStatusSchema.optional()
});

export type PartStatus = z.infer<typeof partStatusSchema>;

export type MaintenanceLogInput = z.infer<typeof maintenanceLogSchema>;

// Smart Port Schema & Interfaces
export const shipDataSchema = z.object({
  id: z.string().optional(),
  imoNumber: z.string().min(5, "El número IMO es inválido"),
  name: z.string().min(1, "El nombre es requerido"),
  capacityTEU: z.number().int().positive(),
  currentLat: z.number(),
  currentLng: z.number(),
  status: z.enum(['EN_RUTA', 'FONDEADO', 'DESCARGANDO', 'RETENIDO']),
  fuelLevel: z.number().min(0).max(100),
  dailyFuelCost: z.number().positive()
});

export const cargoManifestSchema = z.object({
  id: z.string().optional(),
  shipId: z.string().min(1, "ID de buque es requerido"),
  originPort: z.string().min(1, "Puerto de origen es requerido"),
  destPort: z.string().min(1, "Puerto de destino es requerido"),
  contents: z.string().min(1, "Manifiesto de carga detallado requerido"),
  incoterm: z.enum(['FOB', 'CIF', 'EXW', 'DDP', 'CFR']),
  customsStatus: z.enum(['PENDIENTE', 'APROBADO', 'INSPECCION_FISICA', 'RETENIDO']),
  arrivalDate: z.string() // ISO Date String
});

export const weatherEventSchema = z.object({
  id: z.string().optional(),
  eventType: z.enum(['CLIMA', 'HUELGA', 'PIRATERIA']),
  severity: z.number().int().min(1).max(5),
  affectedRegion: z.string().min(1, "Región afectada es requerida"),
  active: z.boolean().default(true)
});

export const irrigationRuleInputSchema = z.object({
  id: z.string().optional(),
  zoneId: z.string().min(1, "ID de zona es requerido"),
  name: z.string().min(1, "Nombre de la regla es requerido"),
  sensorType: z.enum(['SOIL_MOISTURE', 'PH', 'TEMPERATURE', 'RADIATION']),
  operator: z.enum(['LT', 'GT']),
  thresholdValue: z.number(),
  durationMinutes: z.number().int().positive()
});

export type ShipData = z.infer<typeof shipDataSchema>;
export type CargoManifestInput = z.infer<typeof cargoManifestSchema>;
export type WeatherEventInput = z.infer<typeof weatherEventSchema>;
export type IrrigationRuleInput = z.infer<typeof irrigationRuleInputSchema>;

export interface ZoneData {
  id: string;
  name: string;
  cropType: string;
  sensors: SensorData[];
  valves: {
    id: string;
    name: string;
    status: string;
    lastActivated: string | null;
  }[];
}

export interface SensorData {
  id: string;
  zoneId: string;
  type: 'SOIL_MOISTURE' | 'PH' | 'TEMPERATURE' | 'RADIATION';
  isActive: boolean;
  currentValue: number;
}

export interface PestOutbreakPrediction {
  pestName: string;
  probability: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendation: string;
}

export const transactionPayloadSchema = z.object({
  senderId: z.string().min(1, "Sender ID is required"),
  receiverId: z.string().min(1, "Receiver ID is required"),
  amount: z.number().positive("Amount must be positive"),
  ipAddress: z.string().min(1, "IP Address is required"),
  deviceFingerprint: z.string().optional()
});

export type TransactionPayload = z.infer<typeof transactionPayloadSchema>;

export interface AmlAlertData {
  id: string;
  transactionId: string;
  ruleTriggered: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  resolved: boolean;
}

export interface AccountMetrics {
  totalTransacted: number;
  fraudRate: number;
  falsePositiveRate: number;
  blockRate: number;
  balanceTotal: number;
}

// SCADA Renovables Schemas & Types
export const scadaAssetSchema = z.object({
  id: z.string().optional(),
  tagId: z.string().min(1, "El Tag ID es requerido"),
  assetType: z.enum(['SOLAR_PANEL', 'INVERTER', 'WIND_TURBINE', 'TRANSFORMER']),
  status: z.enum(['ONLINE', 'OFFLINE', 'MAINTENANCE', 'FAULT']),
  location: z.string()
});

export const scadaTelemetrySchema = z.object({
  assetId: z.string(),
  parameter: z.enum(['VOLTAGE', 'CURRENT', 'TEMPERATURE', 'RPM', 'WIND_SPEED', 'IRRADIANCE', 'POWER', 'VIBRATION', 'PITCH']),
  value: z.number(),
  timestamp: z.string()
});

export const scadaAlarmSchema = z.object({
  id: z.string(),
  assetId: z.string(),
  alarmCode: z.string(),
  description: z.string(),
  severity: z.enum(['LOW', 'HIGH', 'CRITICAL']),
  triggeredAt: z.string(),
  acknowledgedAt: z.string().nullable(),
  clearedAt: z.string().nullable()
});

export type ScadaAssetInput = z.infer<typeof scadaAssetSchema>;
export type ScadaTelemetryInput = z.infer<typeof scadaTelemetrySchema>;
export type ScadaAlarmInput = z.infer<typeof scadaAlarmSchema>;

// Retail Analytics Engine Schemas & Types
export interface CustomerProfile {
  id: string;
  segment: string;
  lifetimeValue: number;
  ordersCount: number;
  abandonedCount: number;
}

export interface CartEvent {
  id: string;
  sessionId: string;
  eventType: 'PAGE_VIEW' | 'ADD_TO_CART' | 'CART_ABANDONED' | 'PURCHASE';
  sku: string;
  productName: string;
  price: number;
  timestamp: string;
}

export interface DarkStoreInventory {
  id: string;
  sku: string;
  productName: string;
  storeType: 'DARK_STORE' | 'RETAIL_STORE' | 'MAIN_WAREHOUSE';
  lat: number;
  lng: number;
  stockLevel: number;
}

// Smart City Hub Interfaces
export interface BusTelemetryData {
  busId: string;
  plateNumber: string;
  routeCode: string;
  lat: number;
  lng: number;
  speed: number;
  passengerCount: number;
  timestamp: string;
}

export interface BipValidation {
  cardNumber: string;
  stopId: string;
  routeCode: string;
  timestamp: string;
}

export interface TrafficLightPhase {
  id: string;
  name: string;
  lat: number;
  lng: number;
  greenPhase: number;
  redPhase: number;
  offset: number;
}

export interface ODMatrixCell {
  origin: string;
  destination: string;
  count: number;
}

export type ODMatrix = ODMatrixCell[];

// Industry 4.0 Digital Twin Interfaces
export interface CycleTimeEvent {
  machineId: string;
  actualCycleTime: number;
  energyConsumed: number;
  timestamp: string;
}

export interface MachineState {
  id: string;
  type: string;
  sequenceOrder: number;
  nominalCycleTime: number;
  status: 'OPERATIONAL' | 'DOWN' | 'DEGRADED';
  temperature: number;
  currentCycleTime: number;
  energyRate: number;
}

export interface QualityMetrics {
  totalProduced: number;
  defectsFound: number;
  scrapRate: number;
  yieldRate: number;
}

export interface DowntimeLogItem {
  id: string;
  machineId: string;
  reasonCode: string;
  durationSecs: number;
  timestamp: string;
}

// Hospitality ERP Interfaces
export interface HotelRoom {
  id: string;
  roomNumber: string;
  category: 'STANDARD' | 'DELUXE' | 'SUITE';
  status: 'DIRTY' | 'CLEAN' | 'INSPECTED' | 'OUT_OF_ORDER';
  cleaningCredits: number;
}

export interface HotelReservation {
  id: string;
  guestName: string;
  roomId: string | null;
  bookingDate: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW' | 'CHECKED_IN';
  channel: 'DIRECT' | 'OTA' | 'CORPORATE';
}

export interface RevenueMetric {
  id: string;
  date: string;
  occupancyRate: number;
  adr: number;
  revpar: number;
}

export interface GuestReview {
  id: string;
  score: number;
  category: 'CLEANLINESS' | 'SERVICE' | 'VALUE_FOR_MONEY';
  comment: string;
  date: string;
}

export interface HousekeepingTask {
  id: string;
  roomId: string;
  assignedTo: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  credits: number;
  updatedAt: string;
}

// GreenTech ESG Tracker Interfaces
export interface EsgFacility {
  id: string;
  name: string;
  country: string;
  gridFactorId: string;
}

export interface EmissionFactor {
  id: string;
  source: string;
  category: string;
  unit: string;
  co2ePerUnit: number;
  validYear: number;
}

export interface ActivityData {
  id: string;
  facilityId: string;
  scope: number;
  category: string;
  rawAmount: number;
  unit: string;
  factorId: string;
  calculatedCo2e: number;
  proofDocument: string | null;
  timestamp: string;
  facility?: EsgFacility;
  factor?: EmissionFactor;
}

export interface CarbonMarket {
  id: string;
  projectName: string;
  projectType: 'FORESTRY' | 'RENEWABLE' | 'DAC';
  certification: 'VERRA' | 'GOLD_STANDARD';
  pricePerTon: number;
  availableTons: number;
}

export interface EsgMetrics {
  totalScope1: number;
  totalScope2: number;
  totalScope3: number;
  totalEmissions: number;
  targetEmissions: number; // SBTi target for the current period
  offsetEmissions: number; // Compensated emissions through carbon credits
  netEmissions: number; // totalEmissions - offsetEmissions
  budget: number; // Budget left for operations / credits
  auditErrorsCount: number; // Number of uncorrected audit errors (e.g. MJ instead of kWh)
  reputationScore: number; // Client reputation based on Greenwashing/SBTi compliance
  legalFines: number; // Penalties from TCFD compliance failures
}






