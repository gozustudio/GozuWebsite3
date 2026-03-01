# Gozu Website Memory

## Last Updated
- 2026-03-01

## Active Directories
- Project root: `/Users/franciscosanda/Documents/GozuWebsite3`
- Site root: `/Users/franciscosanda/Documents/GozuWebsite3/GozuStudioWebsite`

## Current Server State
- Local server command in use: `python serve_local.py --port 4173`
- Expected local URL: `http://127.0.0.1:4173`

## Implemented Fixes and Adaptations
1. Rebranded major site copy from Terminal/logistics to Gozu Studio/architecture language.
2. Updated services framing to Interiors / Exteriors / Institutional and Systems to Projects.
3. Footer adapted with Gozu logo handling, contact details, and Telegram/Instagram/WhatsApp networks.
4. Review section override points to local asset:
- `/Users/franciscosanda/Documents/GozuWebsite3/GozuStudioWebsite/static/images/Review.jpeg`
5. Added shade overlay in review block for readability.
6. Added wheel-freeze rescue logic around Features steps section in `gozu-footer-overrides.js`.
7. Added desktop pointer-event guard for Features steps text stack in `gozu-footer-overrides.css`.
8. Added app-loader failsafe to prevent persistent white-screen overlays in external deployments.
9. Added hero fallback background styling to avoid black carousel appearance during failed/slow frame loads.
10. Activated external light-preview mode initializer for known preview hosts (Netlify/Vercel/Pages/Cloudflare tunnel/LocalTunnel) to prevent blank hero sequence stalls.
11. Added missing static assets referenced by runtime bundles: `/static/images/blur.png`, `/static/images/gartner.svg`, `/static/favicon-192x192.png`, `/static/favicon-512x512.png` (broken local references reduced to zero).

## Known Issues
1. Temporary tunnels (localtunnel/quick cloud tunnels) can fail or be blocked by enterprise network filters.
2. Drag-and-drop static hosts may not reliably handle the large frame sequence payload (`static/frames/home`, ~157MB).
3. Path-based deployment under `gozustudio.com/option2` will break root-absolute asset URLs unless a reverse proxy rewrite is added.
4. Storyblok CDN API token currently embedded in build returns `401 Unauthorized` in direct API checks, which can break dynamic runtime content hydration on external hosts.
5. Some SEO/schema and internal strings still reference old domain/content artifacts in bundled export.

## Deployment Notes
- Preferred preview publishing model:
1. Host static export on a stable provider (Netlify/Cloudflare Pages/Vercel).
2. Attach custom subdomain `option1.gozustudio.com` via CNAME in domain DNS.
3. Keep `gozustudio.com` production untouched until launch decision.

## Files Most Often Edited
- `/Users/franciscosanda/Documents/GozuWebsite3/GozuStudioWebsite/static/gozu-footer-overrides.js`
- `/Users/franciscosanda/Documents/GozuWebsite3/GozuStudioWebsite/static/gozu-footer-overrides.css`
- `/Users/franciscosanda/Documents/GozuWebsite3/GozuStudioWebsite/index.html`
