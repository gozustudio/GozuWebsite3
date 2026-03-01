# Gozu Website Agent Rules

## Project Scope
- Working project root: `/Users/franciscosanda/Documents/GozuWebsite3`
- Website static export root: `/Users/franciscosanda/Documents/GozuWebsite3/GozuStudioWebsite`
- Local preview server script: `/Users/franciscosanda/Documents/GozuWebsite3/serve_local.py`
- Local preview URL: `http://127.0.0.1:4173`

## Canonical Brand Rules
1. Brand is `Gozu Studio` (not Terminal).
2. Footer and contact must use:
- Email: `info@gozustudio.com`
- Phone/WhatsApp/Telegram: `+44 07765 577275`
- Instagram: `https://www.instagram.com/gozustudio/`
3. Preferred footer social set: Telegram, Instagram, WhatsApp only.
4. Footer credit text: `Made by GozuStudio`.

## Content Mapping Rules
1. Replace logistics/yard language with architecture/interior-design language.
2. Navigation taxonomy currently adapted to:
- `Projects`
- `Services`
- `Resources`
- `About`
3. Services grouping used in this version:
- Interiors
- Exteriors
- Institutional

## Technical Guardrails
1. The site is static-exported and mostly bundled/minified in `_nuxt`.
2. Prefer non-invasive runtime overrides in:
- `/Users/franciscosanda/Documents/GozuWebsite3/GozuStudioWebsite/static/gozu-footer-overrides.js`
- `/Users/franciscosanda/Documents/GozuWebsite3/GozuStudioWebsite/static/gozu-footer-overrides.css`
3. Keep `index.html` loading those two override files.
4. Do not assume `/Users/franciscosanda/Documents/GozuWebsite2` exists.

## Known Runtime Risks
1. Intermittent desktop wheel-scroll lock around Features steps (`06 Detailed furniture plans`).
2. External preview links can show white screen if app loader overlay gets stuck.
3. Large hero frame sequence in `static/frames/home` (~157 MB, ~987 files) can break or degrade temporary drag-and-drop preview services.
4. Storyblok API access token in exported runtime config may be invalid (`401 Unauthorized`) and can break dynamic content hydration on hosted previews.

## Deployment Guidance
1. For stable feedback links, use a real host + custom subdomain (recommended `option1.gozustudio.com`).
2. Prefer subdomain deployment over path-based deployment (`gozustudio.com/option2`) because the export uses root-absolute asset URLs like `/_nuxt` and `/static`.
3. Avoid temporary tunnel links for stakeholder review.
4. If using static drag-and-drop previews, verify frame assets are fully uploaded and test hero rendering.
5. No extra domain purchase is required for subdomains; DNS just needs a new CNAME record.
