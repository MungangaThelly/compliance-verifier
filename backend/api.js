const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// CORS for frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// API Routes
app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Express API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'compliance-verifier',
    backend: 'running'
  });
});

// Your compliance endpoints
app.post('/api/verify', (req, res) => {
  const { document } = req.body;
  // Add your compliance verification logic here
  res.json({
    verified: true,
    documentId: Date.now().toString(),
    timestamp: new Date().toISOString()
  });
});

// Export for Vercel
module.exports = app;