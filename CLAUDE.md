# CLAUDE.md

Marketing site for Rivetr. React Router 8 (SSR), Tailwind 4, no UI library.

## Verify

```bash
npm run typecheck
npm run build
```

Then run the built server and check both themes in a browser:

```bash
PORT=3100 ./node_modules/.bin/react-router-serve ./build/server/index.js
```

## Gotchas

- React Router 8 refuses a route action when the `Origin` header does not match the request URL origin. Behind the Rivetr proxy the request URL is rebuilt from `Host` and `X-Forwarded-Proto`, which `react-router-serve` does not trust, so any action POST returns 400 and the root error boundary replaces the page. Keep UI state client-side (see `app/components/theme-toggle.tsx`); if an action is ever required, set `allowedActionOrigins` in `react-router.config.ts`.
- Never regenerate `package-lock.json` with `npm install --package-lock-only` on macOS. It drops the optional Linux native packages and the server build fails with `Missing: @emnapi/... from lock file`. Change dependencies on Linux, or edit the lock's root dependency list only.
- The site deploys from `main` on push. The Dockerfile builds with `npm ci`, so the lockfile must stay in sync with `package.json`.

## Design

Neutral surface stack, one accent (`brand-*`), hairlines instead of cards, mono labels (`.label-mono`). Keep gradients, glows, and entrance animations out.
