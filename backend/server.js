import express from "express";
import cors from "cors";
import helmet from "helmet";
import crypto from "crypto";
import axios from "axios"; // Replace puppeteer with axios

const app = express();
app.use(express.json());

// ✅ Enable CORS for frontend
const allowedOrigins = [
  "http://localhost:5173",
  "https://compliance-verifier-cix9.vercel.app",
  "https://compliance-verifier-lezhxxbau-mungangathellys-projects.vercel.app",
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
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

// ✅ Helmet with CSP disabled
app.use(helmet({
  contentSecurityPolicy: false,
}));

// ✅ Health check endpoint (Vercel needs this)
app.get("/api", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "CSP Compliance API is running",
    timestamp: new Date().toISOString(),
  });
});

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

// ✅ Updated CSP scan route - using axios instead of puppeteer
app.post('/api/csp/scan', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      error: 'URL is required',
    });
  }

  try {
    // Make request to get headers
    const response = await axios.get(url, {
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: false, // Don't throw on any status code
      headers: {
        'User-Agent': 'Compliance-Verifier-Bot/1.0'
      }
    });

    // Extract CSP header
    const cspHeader = response.headers['content-security-policy'] || 
                     response.headers['content-security-policy-report-only'] || 
                     'No CSP header found';

    // Calculate risk score
    let riskScore = 100;

    if (!cspHeader || cspHeader === 'No CSP header found') {
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
      statusCode: response.status,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Scan error:', error);
    
    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        error: 'Request timeout',
        details: 'The website took too long to respond'
      });
    }
    
    if (error.response) {
      // The request was made and the server responded with a status code
      return res.status(500).json({
        error: 'Failed to scan website',
        details: `Server responded with status ${error.response.status}`,
        url: url
      });
    } else if (error.request) {
      // The request was made but no response received
      return res.status(500).json({
        error: 'Failed to scan website',
        details: 'No response received from the server',
        url: url
      });
    } else {
      // Something happened in setting up the request
      return res.status(500).json({
        error: 'Failed to scan website',
        details: error.message,
        url: url
      });
    }
  }
});

// ✅ Export for Vercel (IMPORTANT!)
export default app;

// ✅ Only listen locally, not on Vercel
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`✅ API running locally on port ${port}`);
  });
}