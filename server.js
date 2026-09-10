const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectToDatabase, closeDatabase } = require('./db');
const scientificRoutes = require('./routes/scientificRoutes');
const aiRoutes = require('./routes/aiRoutes');
const expeditionRoutes = require('./routes/expeditionRoutes');
const outreachRoutes = require('./routes/outreachRoutes');
const stationRoutes = require('./routes/stationRoutes');
const satelliteRoutes = require('./routes/satelliteRoutes');
const mediaRoutes = require('./routes/mediaRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration (allowing React frontend at localhost:5173)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve multimedia assets statically (Person 5 Media)
app.use('/media', express.static(path.join(__dirname, '05_media')));
app.use('/media/images', express.static(path.join(__dirname, '05_media', 'Photos')));
app.use('/media/photos', express.static(path.join(__dirname, '05_media', 'Photos')));
app.use('/media/videos', express.static(path.join(__dirname, '05_media', 'videos')));

// Mount scientific data routes
app.use('/api/v1/scientific', scientificRoutes);

// Mount expeditions data routes
app.use('/api/v1/expeditions', expeditionRoutes);

// Mount outreach and educational trivia routes
app.use('/api/v1/outreach', outreachRoutes);

// Mount Antarctic research stations routes (Person 1)
app.use('/api/v1/stations', stationRoutes);

// Mount satellite cryosphere & sea ice routes (Person 3)
app.use('/api/v1/satellite', satelliteRoutes);

// Mount multimedia gallery routes (Person 5)
app.use('/api/v1/media', mediaRoutes);

// Mount grounded AI query routes
app.use('/api/v1/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Polar Science Hub API',
    timestamp: new Date().toISOString()
  });
});

let server = null;

async function startServer() {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    server = app.listen(PORT, () => {
      console.log(`Polar Science Hub Server running on http://localhost:${PORT}`);
      console.log(`Ocean endpoint:       http://localhost:${PORT}/api/v1/scientific/ocean`);
      console.log(`Ice core endpoint:    http://localhost:${PORT}/api/v1/scientific/ice-core`);
      console.log(`Expeditions endpoint: http://localhost:${PORT}/api/v1/expeditions`);
      console.log(`Outreach endpoint:    http://localhost:${PORT}/api/v1/outreach`);
      console.log(`Stations endpoint:    http://localhost:${PORT}/api/v1/stations`);
      console.log(`Satellite endpoint:   http://localhost:${PORT}/api/v1/satellite/sea-ice`);
      console.log(`Media endpoint:       http://localhost:${PORT}/api/v1/media`);
      console.log(`AI query endpoint:    http://localhost:${PORT}/api/v1/ai/query`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown handlers
process.on('SIGINT', async () => {
  console.log('\nGracefully shutting down...');
  if (server) server.close();
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nGracefully shutting down...');
  if (server) server.close();
  await closeDatabase();
  process.exit(0);
});

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
