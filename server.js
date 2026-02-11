import express from "express";
import cors from "cors";
import helmet from "helmet";
import crypto from "crypto";
import puppeteer from "puppeteer";

const app = express();
app.use(express.json());

// ✅ Enable CORS for frontend (adjust origin as needed)
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
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

  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Ogiltig eller saknad URL' });
  }

  try {
    const browser = await puppeteer.launch({ headless: true, timeout: 10000 });
    const page = await browser.newPage();

    // Navigate once and capture response
    const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Extract CSP from meta tag
    const cspMeta = await page.evaluate(() => {
      const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      return meta ? meta.content : null;
    });

    // Try to get CSP from headers if not in meta
    const cspHeader = response.headers()['content-security-policy'];

    await browser.close();

    res.json({
      url,
      cspHeader: cspMeta || cspHeader || 'Ingen CSP hittades',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error scanning page:', error);
    res.status(500).json({
      error: `Kunde inte skanna ${url}: ${error.message}`,
    });
  }
});

const port = 3001;
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
