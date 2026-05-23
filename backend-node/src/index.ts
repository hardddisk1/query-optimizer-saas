import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

// Load your environment configurations
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Set up HTTP and WebSocket architectures side-by-side
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:4200', // Allows your Angular dashboard to listen safely
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Track connection telemetry
io.on('connection', (socket) => {
  console.log(`🔌 Dashboard connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`❌ Dashboard disconnected: ${socket.id}`);
  });
});

// Primary Telemetry Ingestion Endpoint called by Java client
app.post('/api/telemetry', async (req, res) => {
  const { query, executionTime, appName } = req.body;

  console.log(`\n==================================================`);
  console.log(`⚠️ [SLOW QUERY INGESTED] Execution Time: ${executionTime}ms`);
  console.log(`📜 Raw SQL: ${query}`);
  console.log(`==================================================`);

  // 1. Immediately emit the pending state to the Angular app live
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
  io.emit('new-query', incomingMetric);

  // Send a quick acknowledgment back to the Java application thread
  res.status(202).json({ status: 'Ingested', message: 'Optimization engine spinning up...' });

  // 2. Wrap AI & DevOps pipeline in an async execution track
  try {
    console.log(`🤖 Contacting AI Tuning Engine for optimization strategies...`);
    
    // Simulate short processing wait for Claude analysis + GitHub dispatch
    await new Promise((resolve) => setTimeout(resolve, 2500));
    
    const suggestedIndex = `CREATE INDEX idx_performance_${Math.floor(Math.random() * 10000)} ON telemetry_table(column);`;
    const mockedPR = `https://github.com/hardddisk1/query-optimizer-saas/pull/${Math.floor(Math.random() * 50) + 1}`;

    console.log(`✨ [AI OPTIMIZATION GENERATED]: ${suggestedIndex}`);
    console.log(`🎉 SUCCESS: Pull Request deployed live! -> ${mockedPR}`);

    // Broadcast the updated solution to the Angular dashboard live!
    const updatedMetric = {
      ...incomingMetric,
      status: 'PR Deployed ✅',
      proposedFix: suggestedIndex,
      prUrl: mockedPR
    };
    io.emit('update-query', updatedMetric);

  } catch (error) {
    console.error('Pipeline Processing Failed:', error);
    io.emit('update-query', {
      ...incomingMetric,
      status: 'Failed ❌',
      proposedFix: 'Error building migration script.'
    });
  }
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Telemetry Ingestion Engine online on port ${PORT}`);
});