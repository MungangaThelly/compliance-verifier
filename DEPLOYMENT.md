# Deploying to Vercel

This guide covers deploying both the frontend and backend to Vercel.

## Prerequisites

- Vercel account ([vercel.com](https://vercel.com))
- Vercel CLI installed: `npm i -g vercel`

## Option 1: Deploy via Vercel Dashboard (Recommended)

### Backend Deployment

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the repository root (`compliance-verifier`)
3. Configure as follows:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (project root)
   - **Build Command**: Leave empty (serverless function)
   - **Output Directory**: Leave empty
4. Add environment variable (you can add this later after frontend is deployed):
   - `FRONTEND_URL` = `https://your-frontend.vercel.app` (add after frontend deployment)
5. Deploy and note the URL (e.g., `https://your-backend.vercel.app`)

### Frontend Deployment

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the repository again
3. Configure as follows:
   - **Framework Preset**: Vite
   - **Root Directory**: `./fro-client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variable:
   - `VITE_API_BASE_URL` = `https://your-backend.vercel.app` (from step 5 above)
5. Deploy

## Option 2: Deploy via CLI

### Backend

```bash
cd compliance-verifier
vercel --prod
```

### Frontend

```bash
cd compliance-verifier/fro-client
vercel --prod
```

When prompted, set the environment variable:
```bash
vercel env add VITE_API_BASE_URL production
# Enter: https://your-backend.vercel.app
```

## Post-Deployment Configuration

### Update Backend CORS

After both are deployed, add the `FRONTEND_URL` environment variable to your backend:

1. Go to Vercel Dashboard → Your Backend Project → Settings → Environment Variables
2. Add: `FRONTEND_URL` = `https://your-frontend.vercel.app`
3. Redeploy the backend

The backend automatically allows CORS for:
- `http://localhost:5173` (development)
- Your production frontend URL (from `FRONTEND_URL` env var)

## CSP Configuration

The frontend includes proper Content Security Policy headers for PDF generation:

- ✅ **index.html**: CSP meta tag with `wasm-unsafe-eval`
- ✅ **vercel.json**: HTTP headers for additional security
- ✅ Allows WebAssembly for @react-pdf/renderer

## Testing Production Build Locally

### Backend
```bash
NODE_ENV=production node server.js
```

### Frontend
```bash
cd fro-client
npm run build
npm run preview
```

## Troubleshooting

### PDF Download Not Working
- Ensure CSP includes `wasm-unsafe-eval` and `unsafe-eval`
- Check browser console for CSP violations
- TXT download works as fallback

### API Connection Issues
- Verify `VITE_API_BASE_URL` environment variable
- Check CORS settings in `server.js`
- Ensure backend is deployed and accessible

### Build Failures
- Clear node_modules: `rm -rf node_modules package-lock.json && npm install`
- Check Vercel build logs for specific errors

## Environment Variables Reference

### Backend (`compliance-verifier`)
- `FRONTEND_URL` = Your frontend URL (e.g., `https://your-frontend.vercel.app`)

### Frontend (`fro-client`)
- `VITE_API_BASE_URL` = Your backend URL (required)

## Security Notes

- CSP allows WebAssembly for PDF generation only
- All other unsafe directives are disabled
- Frame protection enabled
- HTTPS enforced in production
