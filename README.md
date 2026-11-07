# Rivetr Website

Marketing site and documentation for [Rivetr](../rivetr), the self-hosted PaaS
in a single binary. It tracks Rivetr 1.0.0.

Built with [React Router 8](https://reactrouter.com/) (framework mode), React
19, Tailwind CSS 4, TypeScript 7, and Vite 8.

## Develop

```bash
npm install
npm run dev          # http://localhost:5173
```

## Verify

```bash
npm run typecheck    # react-router typegen && tsc
npm run build        # production build
```

## Content

All marketing copy and data live in `app/lib/content.ts`. Change it there, not
in the section components.

Documentation pages are Markdown files in `app/content/docs/`. Every file is
imported once in `app/lib/docs-content.ts`, which also builds the docs search
index. The sidebar order lives in `app/lib/docs-nav.ts`. To add a page:

1. Add the Markdown file.
2. Add the import and the `DOCS_CONTENT` entry in `app/lib/docs-content.ts`.
3. Add the page to `DOCS_NAV` in `app/lib/docs-nav.ts`.

The changelog is a copy of the upstream `CHANGELOG.md`, starting at 1.0.0.
Refresh it when a release ships.

## Structure

```
app/
├── root.tsx                  # HTML shell, fonts, meta, nav + footer
├── routes.ts                 # route config
├── app.css                   # Tailwind 4 theme tokens and utilities
├── lib/
│   ├── content.ts            # marketing copy, stats, comparisons
│   ├── docs-nav.ts           # docs sidebar and prev/next order
│   └── icons.ts              # explicit lucide icon map
├── components/
│   ├── ui.tsx                # design primitives (Container, Button, ...)
│   ├── browser-frame.tsx     # screenshot frame
│   ├── markdown.tsx          # Markdown renderer with code copy buttons
│   ├── site-nav.tsx
│   ├── site-footer.tsx
│   └── sections/             # landing sections
├── content/
│   ├── changelog.md
│   └── docs/                 # one Markdown file per docs page
└── routes/
    ├── home.tsx
    ├── features.tsx
    ├── about.tsx
    ├── changelog.tsx
    └── docs*.tsx
```

## Brand

The indigo R mark and screenshots come from the product repository:

- `public/brand/rivetr-mark-128.png` from `frontend/public/brand/rivetr-mark.png`
- `public/screenshots/*.png` from `docs/images/*.png`

Refresh both when the dashboard changes.

## Deploy

`npm run build` produces a standard React Router server build in `build/`.
Serve it with `npm run start`, or use the included Dockerfile (Node 24).
