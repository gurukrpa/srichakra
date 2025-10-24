Firebase Functions API

This project now exports a Firebase HTTPS function named `api` which serves the Express app with all `/api/**` routes.

Key files
- server/firebase.ts -> Express app adapted for Firebase Functions and exported as `api`.
- firebase.json -> Rewrites `/api/**` to the `api` function.

Build & Deploy
- npm run build (bundles client and two Node bundles: dist/server.js and dist/index.js)
- firebase deploy --only functions,hosting

Notes
- Make sure Blaze plan is enabled (Functions require billing).
- If deploy fails with ESM issues, verify that the dist/index.js exists and is valid.
