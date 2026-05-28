# Rivetr Website

Marketing site for [Rivetr](../rivetr) — the single-binary self-hosted PaaS.

Built with [React Router v7](https://reactrouter.com/) (framework mode), React 19,
Tailwind CSS v4, and TypeScript.

## Develop

```bash
npm install
npm run dev          # http://localhost:5173
```

## Quality

```bash
npm run typecheck    # react-router typegen && tsc
npm run build        # production build
```

## Structure

```
app/
├── root.tsx                 # HTML shell, fonts, meta, nav + footer layout
├── routes.ts                # route config
├── app.css                  # Tailwind v4 theme tokens + custom utilities
├── lib/
│   ├── content.ts           # ALL copy + data (single source of truth)
│   └── icons.ts             # explicit lucide icon map (keeps bundle lean)
├── components/
│   ├── ui.tsx               # design-system primitives (Container, Button, …)
│   ├── icons/github.tsx     # GitHub mark (lucide build here lacks one)
│   ├── site-nav.tsx
│   ├── site-footer.tsx
│   └── sections/            # hero, feature-groups, how-it-works,
│       └── ...              #   stat-strip, compare, faq, cta-install
└── routes/
    ├── home.tsx             # composes the landing sections
    └── features.tsx         # detailed features page
```

To edit copy or stats, change `app/lib/content.ts` — the sections render from it.

## Deploy

Produces a standard React Router server build (`npm run build` → `build/`).
Serve with `npm run start`, or deploy the client output statically and the
server bundle to any Node host.
