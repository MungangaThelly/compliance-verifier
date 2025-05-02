import express from "express";
import cors from "cors";
import helmet from "helmet";
import crypto from "crypto";
import puppeteer from "puppeteer";

const app = express();
app.use(express.json());

// ✅ Fix CORS here
app.use(cors({
  origin: "http://localhost:5173", // allow your dev frontend
  credentials: true,              // only needed if you're using cookies/auth headers
}));

// Apply Helmet for security headers
app.use(helmet());

// Generate CSP with nonce
// Lägg till denna endpoint i din Express-server
app.get('/api/csp/generate', (req, res) => {
  try {
    const nonce = crypto.randomBytes(16).toString('base64');
    res.json({ 
      nonce,
      csp: `script-src 'nonce-${nonce}' 'strict-dynamic'; object-src 'none';`
    });
  } catch (error) {
    console.error('Nonce generation error:', error);
    res.status(500).json({ error: 'Failed to generate nonce' });
  }
});

app.post('/api/csp/scan', async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return res.status(400).json({ error: 'ogiltig eller saknad URL' })};
  
  try {
    const browser = await puppeteer.launch({ headless: true, timeout: 10000 });
    const page = await browser.newPage();
    
    // Navigate to the page and wait for network idle
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Extract CSP from meta tag or headers
    const cspHeader = await page.evaluate(() => {
      const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      return metaCSP ? metaCSP.content : null;
    });

    // If no CSP in meta, check response headers
    const response = await page.goto(url);
    const cspFromHeaders = response.headers()['content-security-policy'];

    await browser.close();

    res.json({
      url,
      cspHeader: cspHeader || cspFromHeaders || 'Ingen CSP hittades',
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
  console.log(`Server running on port ${port}`);
});
