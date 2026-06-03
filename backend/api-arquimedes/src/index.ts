import express from 'express';
import cors from 'cors';
import partRoutes from './routes/part.routes';

const app = express();
const PORT = process.env.PORT || 20001;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for demo/testing purposes
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/parts', partRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Centrifugal Pump API is active at http://localhost:${PORT}/api/parts`);
});
