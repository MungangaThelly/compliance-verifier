# Cleanup Checklist

After reorganizing the codebase for separate Vercel deployments, please perform these cleanup steps:

## Files to Remove from Root Directory

The following files are now duplicated in the `backend/` folder and should be removed from the root:

- ❌ `server.js` - Now in `backend/server.js`
- ❌ `vercel.json` - Now in `backend/vercel.json`
- ❌ `package.json` (root) - Use `backend/package.json` instead

## Why?

- **Two Separate Vercel Projects**: Frontend (`fro-client/`) and Backend (`backend/`) are deployed as independent projects
- **No Monorepo Root Deploy**: The root is now just a Git repository organizer, not a deployable project
- **Avoid Conflicts**: Root files could confuse Vercel's build process

## Root Directory Should Contain Only:

- `.git/` - Version control
- `.gitignore` - Git exclusions  
- `DEPLOYMENT.md` - Deployment guide
- `CLEANUP_CHECKLIST.md` - This file
- `README.md` - Project overview
- `backend/` - Backend project folder
- `fro-client/` - Frontend project folder

## To Remove Files (Command Line)

```bash
cd c:\Users\Dominus\m2026\compliance-verifier
git rm server.js
git rm vercel.json
git rm package.json
# Remove package-lock.json if it's also at root level
git rm package-lock.json
git commit -m "Clean up: remove root-level deployment files (moved to backend/)"
```

## After Cleanup:

1. Both `backend/` and `fro-client/` have their own independent `package.json`
2. Each folder can be deployed separately
3. Git doesn't track duplicate files
4. Vercel projects are cleanly separated

## Verified Working:

✅ `backend/server.js` - Complete Express API server  
✅ `backend/package.json` - Backend dependencies configured  
✅ `backend/vercel.json` - Routes configured for Vercel  
✅ `fro-client/.env` - Environment variables updated (`VITE_API_BASE_URL`)  
✅ `fro-client/src/api.js` - Correct API endpoints (`/api/csp/scan`, `/api/csp/generate`)  
✅ Root `.gitignore` - Properly excludes node_modules, .env, .vercel  
✅ `DEPLOYMENT.md` - Updated with new folder structure

## Next Steps:

1. Delete root-level duplicate files using Git
2. Deploy backend: `cd backend && vercel --prod`
3. Deploy frontend: `cd fro-client && vercel --prod`
4. Set `VITE_API_BASE_URL` environment variable in frontend Vercel project
5. Test end-to-end CSP scanning and reports
