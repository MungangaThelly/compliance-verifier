import express from "express";
import cors from "cors";
import helmet from "helmet";
import crypto from "crypto";
import puppeteer from "puppeteer";

const app = express();
app.use(express.json());

// ✅ Enable CORS for frontend (supports multiple origins)
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ✅ Middleware to generate nonce per request
app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString("base64");
  next();
});

// ✅ Helmet with CSP disabled for development (backend only affects API responses)
app.use(helmet({
  contentSecurityPolicy: false,
}));

// ✅ Friendly root route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

// ✅ Endpoint to get nonce & CSP string
app.get('/api/csp/generate', (req, res) => {
  try {
    const nonce = res.locals.nonce;
    const csp = `script-src 'nonce-${nonce}' 'strict-dynamic'; object-src 'none';`;
    res.json({ nonce, csp });
  } catch (error) {
    console.error('Nonce generation error:', error);
    res.status(500).json({ error: 'Failed to generate nonce' });
  }
});

// ✅ CSP scan route with optimized Puppeteer usage
app.post('/api/csp/scan', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      error: 'URL is required',
    });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });

    const page = await browser.newPage();

    // Capture CSP header
    let cspHeader = 'Ingen CSP hittades';
    page.on('response', (response) => {
      const contentSecurityPolicy = response.headers()['content-security-policy'];
      if (contentSecurityPolicy) {
        cspHeader = contentSecurityPolicy;
      }
    });

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Calculate risk score
      let riskScore = 100;

      if (!cspHeader || cspHeader === 'Ingen CSP hittades') {
        riskScore -= 50;
      } else {
        const headerLower = cspHeader.toLowerCase();

        if (headerLower.includes('unsafe-inline')) riskScore -= 30;
        if (headerLower.includes('unsafe-eval')) riskScore -= 20;
        if (headerLower.includes('*')) riskScore -= 25;
        if (!headerLower.includes('default-src')) riskScore -= 15;
        if (!headerLower.includes('script-src')) riskScore -= 20;
        if (!headerLower.includes('object-src')) riskScore -= 10;
      }

      riskScore = Math.max(0, Math.min(100, riskScore));

      res.json({
        url,
        cspHeader,
        riskScore,
        timestamp: new Date().toISOString(),
      });
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({
      error: 'Failed to scan website',
      details: error.message,
    });
  }
});

// ✅ Start server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`✅ API running on port ${port}`);
});
