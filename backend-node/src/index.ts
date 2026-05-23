import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Middleware configuration
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST']
}));
app.use(express.json());

// 2. Initialize HTTP server and Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST']
  }
});

// 3. WebSocket event handling
io.on('connection', (socket) => {
  console.log(`🔌 Dashboard connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`❌ Dashboard disconnected: ${socket.id}`);
  });
});

// 4. API endpoint to ingest Java Telemetry
app.post('/api/telemetry', async (req: Request, res: Response) => {
  try {
    const { query, executionTime, appName } = req.body;

    // Validate payload
    if (!query || !executionTime) {
      return res.status(400).json({ error: 'Missing required telemetry fields' });
    }

    console.log(`\n==================================================`);
    console.log(`⚠️ [SLOW QUERY INGESTED] Execution Time: ${executionTime}ms`);
    console.log(`📜 Raw SQL: ${query}`);
    console.log(`==================================================`);

    const incomingMetric = {
      id: Date.now().toString(),
      query,
      executionTime,
      appName: appName || 'Java Client Application',
      status: 'Optimizing...',
      timestamp: new Date().toLocaleTimeString(),
      proposedFix: '',
      prUrl: ''
    };

    // Broadcast initial state to Angular dashboard
    io.emit('new-query', incomingMetric);
    res.status(202).json({ status: 'Ingested', message: 'Optimization engine spinning up...' });

    // Background processing simulation
    processTelemetryBackground(incomingMetric);

  } catch (error) {
    console.error('Ingestion Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 5. Helper function for async logic
async function processTelemetryBackground(metric: any) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 2500));
    
    const updatedMetric = {
      ...metric,
      status: 'PR Deployed ✅',
      proposedFix: `CREATE INDEX idx_perf_${Math.floor(Math.random() * 10000)} ON queries(id);`,
      prUrl: `https://github.com/hardddisk1/query-optimizer-saas/pull/${Math.floor(Math.random() * 50) + 1}`
    };

    io.emit('update-query', updatedMetric);
  } catch (error) {
    console.error('Pipeline Processing Failed:', error);
  }
}

// 6. Start server
httpServer.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Telemetry Ingestion Engine online on port ${PORT}`);
});