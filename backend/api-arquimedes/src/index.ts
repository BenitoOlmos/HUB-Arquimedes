import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pino from 'pino';
import { createServer } from 'http';
import { Server } from 'socket.io';
import partRoutes from './routes/part.routes';
import portRoutes from './routes/port.routes';
import agrotechRoutes from './routes/agrotech.routes';
import fintechRoutes from './routes/fintech.routes';
import scadaRoutes from './routes/scada.routes';
import retailRoutes from './routes/retail.routes';
import mobilityRoutes from './routes/mobility.routes';
import manufacturingRoutes from './routes/manufacturing.routes';
import { PortService } from './services/port.service';
import { AgrotechService } from './services/agrotech.service';
import { FintechService } from './services/fintech.service';
import { ScadaService } from './services/scada.service';
import { RetailService } from './services/retail.service';
import { TrafficService } from './services/traffic.service';
import { ManufacturingService } from './services/manufacturing.service';

// Initialize Pino Logger
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: { colorize: true }
  } : undefined
});

const app = express();
const PORT = process.env.PORT || 20001;

// Create HTTP and Socket.io servers
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

// Security Middlewares
app.use(helmet());

// Configure Rate Limiter: Max 200 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // Elevated for simulation polling / solver scripts
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// CORS setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info({ method: req.method, url: req.url, ip: req.ip }, 'Incoming Request');
  next();
});

// Routes
app.use('/api/parts', partRoutes);
app.use('/api/port', portRoutes);
app.use('/api/agrotech', agrotechRoutes);
app.use('/api/finance', fintechRoutes);
app.use('/api/scada', scadaRoutes);
app.use('/api/retail', retailRoutes);
app.use('/api/mobility', mobilityRoutes);
app.use('/api/manufacturing', manufacturingRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// 404 Route handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Global Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error({ err, url: req.url, method: req.method }, 'Unhandled Exception Occurred');
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    error: message,
    timestamp: new Date().toISOString()
  });
});

// Socket.io Connection handler
io.on('connection', (socket) => {
  logger.info({ socketId: socket.id }, 'WebSockets client connected.');
  
  socket.on('disconnect', () => {
    logger.info({ socketId: socket.id }, 'WebSockets client disconnected.');
  });
});

// Smart Port Simulation Tick Loop
const portService = new PortService();
// 1 tick every 3 seconds advances the simulation by 0.0416 days (1 hour in simulated sea travel)
setInterval(async () => {
  try {
    const timeStepDays = 0.0416; // ~1 simulated hour
    await portService.runSimulationStep(timeStepDays);

    // Broadcast GPS telemetry in real-time
    const state = await portService.getConsolidatedState();
    io.emit('ship-gps-update', state);
  } catch (error) {
    logger.error({ error }, 'Error during simulation tick execution');
  }
}, 3000);

// AgroTech IoT Simulation Tick Loop
const agrotechService = new AgrotechService();
// 1 tick every 3 seconds advances the agricultural simulation by 1 hour (evaluating automated valves and drying rates)
setInterval(async () => {
  try {
    const timeStepHours = 1.0;
    await agrotechService.runSimulationStep(timeStepHours);

    // Broadcast soil/water telemetry details
    const zones = await agrotechService.getZones();
    const kpis = agrotechService.getMetricsKPIs();
    io.emit('agrotech-telemetry-update', { zones, kpis });
  } catch (error) {
    logger.error({ error }, 'Error during AgroTech simulation tick execution');
  }
}, 3000);

// FinTech Sandbox Simulation Tick Loop
const fintechService = new FintechService();
// 1 tick every 2 seconds generates a simulated banking transaction (calling student webhooks or standard rules)
setInterval(async () => {
  try {
    await fintechService.runSimulationStep();

    // Broadcast live transactions feed, alerts and SecOps accuracy metrics
    const transactions = await fintechService.getTransactions(40);
    const alerts = await fintechService.getAlerts();
    const evalStats = fintechService.getEvaluationStats();
    
    io.emit('fintech-telemetry-update', {
      transactions: transactions.map(t => ({
        id: t.id,
        sender: t.sender.accountNumber,
        receiver: t.receiver.accountNumber,
        amount: t.amount,
        timestamp: t.timestamp,
        ipAddress: t.ipAddress,
        isFlagged: t.isFlagged,
        isFraud: t.isFraud
      })),
      alerts,
      evalStats
    });
  } catch (error) {
    logger.error({ error }, 'Error during FinTech simulation tick execution');
  }
}, 2000);

// SCADA Renovables Simulation Tick Loop
const scadaService = new ScadaService();
// 1 tick every 1.5 seconds (representing OPC-UA virtual server publishing live readings)
setInterval(async () => {
  try {
    await scadaService.updateTelemetryStep();

    const assets = scadaService.getLiveState();
    const alarms = scadaService.getActiveAlarms();
    const scenarios = scadaService.getScenarios();
    const breakers = scadaService.getBreakers();
    const pitch = scadaService.getPitchAngles();

    io.emit('scada-telemetry-update', {
      assets,
      alarms,
      scenarios,
      breakers,
      pitch
    });
  } catch (error) {
    logger.error({ error }, 'Error during SCADA simulation tick execution');
  }
}, 1500);

// Retail Simulation Tick Loop
const retailService = new RetailService();
// 1 tick every 2 seconds (representing real-time user session generation during Black Friday)
setInterval(async () => {
  try {
    if (retailService.getBlackFridayActive()) {
      const stepResult = await retailService.runSimulationStep();
      if (stepResult) {
        const funnel = await retailService.getConversionFunnel();
        const inventories = await retailService.getStoreInventories();
        const customers = await retailService.getCustomers();
        io.emit('retail-telemetry-update', {
          stepResult,
          funnel,
          inventories,
          customers
        });
      }
    }
  } catch (error) {
    logger.error({ error }, 'Error during Retail simulation tick execution');
  }
}, 2000);

// Mobility Simulation Tick Loop
const trafficService = new TrafficService();
// 1 tick every 2.5 seconds (representing active bus position calculations and congestion updates)
setInterval(async () => {
  try {
    if (trafficService.getSimulationActive()) {
      const stepTelemetry = await trafficService.runSimulationStep();
      const kpis = await trafficService.getKPIs();
      const routes = await trafficService.getRoutes();
      const intersections = await trafficService.getIntersections();
      
      io.emit('mobility-telemetry-update', {
        stepTelemetry,
        kpis,
        routes,
        intersections
      });
    }
  } catch (error) {
    logger.error({ error }, 'Error during Mobility simulation tick execution');
  }
}, 2500);

// Start Server
httpServer.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Centrifugal Pump API is active at http://localhost:${PORT}/api/parts`);
  logger.info(`Smart Port Logistics API is active at http://localhost:${PORT}/api/port`);
  logger.info(`Retail Analytics API is active at http://localhost:${PORT}/api/retail`);
  logger.info(`Smart City Mobility API is active at http://localhost:${PORT}/api/mobility`);
  logger.info(`Industry 4.0 Digital Twin API is active at http://localhost:${PORT}/api/manufacturing`);
});

// Manufacturing Simulation Tick Loop
const manufacturingService = new ManufacturingService();
// 1 tick every 2 seconds
setInterval(async () => {
  try {
    if (manufacturingService.getSimulationActive()) {
      const stepResult = await manufacturingService.runSimulationStep();
      if (stepResult) {
        const lineState = await manufacturingService.getLineState();
        const oeeMetrics = await manufacturingService.calculateOeeMetrics();
        const downtimeLogs = await manufacturingService.getDowntimeLogs();
        
        io.emit('manufacturing-telemetry-update', {
          stepResult,
          lineState,
          oeeMetrics,
          downtimeLogs
        });
      }
    }
  } catch (error) {
    logger.error({ error }, 'Error during Manufacturing simulation tick execution');
  }
}, 2000);
