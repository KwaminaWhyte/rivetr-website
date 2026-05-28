# Contributing

Contributions are welcome. This page covers prerequisites, development setup, code organization, and the PR process.

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| [Rust](https://rustup.rs/) | 1.75+ | Install via rustup |
| [Node.js](https://nodejs.org/) | 20+ | For frontend development |
| Docker or Podman | Docker 24+ / Podman 4+ | Required for testing deployments |
| Git | Any recent version | |

Optional but recommended:

```bash
cargo install cargo-watch   # auto-reload backend on file changes
```

---

## Development setup

### 1. Clone and configure

```bash
git clone https://github.com/KwaminaWhyte/rivetr.git
cd rivetr
cp rivetr.example.toml rivetr.local.toml
# Edit rivetr.local.toml if needed — defaults work for local dev
```

### 2. Run the backend

```bash
# With auto-reload (recommended)
cargo watch -x "run -- --config rivetr.local.toml"

# Without auto-reload
cargo run -- --config rivetr.local.toml
```

The API and dashboard are served on `http://localhost:8080`.

### 3. Run the frontend dev server

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5173` and proxies `/api/` requests to the backend. Use the Vite URL during development to get hot-module reload.

### 4. Quality checks

Run these before committing:

```bash
# Backend
cargo fmt --check
cargo clippy        # no new warnings allowed
cargo test

# Frontend
cd frontend
npm run lint
npm run build       # ensure production build compiles
```

---

## Code organization

The backend uses a **subdirectory module pattern**. Any file that grows beyond ~1000 lines is split into a directory:

```
src/api/apps.rs   →   src/api/apps/
                          ├── mod.rs     (route registration, re-exports)
                          ├── crud.rs    (list, get, create, update, delete)
                          ├── control.rs (start, stop, restart)
                          └── upload.rs  (ZIP upload deploy flow)
```

### Backend module map

| Directory | Responsibility |
|-----------|---------------|
| `src/api/` | All Axum route handlers, grouped by resource |
| `src/engine/` | Deployment pipeline, container monitor, scheduler |
| `src/runtime/` | Container runtime abstraction (Docker, Podman) |
| `src/proxy/` | Embedded reverse proxy and ACME/TLS |
| `src/db/` | SQLite models, queries, migrations, seeders |
| `src/backup/` | S3-compatible backup and restore |
| `src/logging/` | Log draining to external providers |
| `src/monitoring/` | Uptime tracking, Prometheus metrics |
| `src/notifications/` | Alert channels (Slack, Discord, email, Telegram, etc.) |
| `src/mcp/` | MCP server for AI assistant integration |
| `src/crypto/` | AES-256-GCM encryption utilities |
| `src/cli/` | CLI subcommands (`rivetr backup`, `rivetr restore`) |
| `src/config/` | Configuration parsing (TOML → typed structs) |

### Frontend structure

```
frontend/app/
├── routes/       # Page-level route components
├── components/   # Reusable UI components (shadcn/ui)
├── types/        # TypeScript type definitions
└── lib/          # API client, React Query hooks, utilities
```

---

## Adding a feature

### Backend

1. **Database first** — Add a migration in `migrations/`. Follow the numbered format.
2. **Update models** — Add or edit structs in `src/db/models/` and re-export from `mod.rs`.
3. **Add route handlers** — Create or extend the relevant module in `src/api/`. Register the route in `src/api/mod.rs`.
4. **Wire up state** — If the feature needs shared state, add it to `AppState` in `src/lib.rs`.
5. **Implement for both runtimes** — If adding container operations, implement for both `DockerRuntime` and `PodmanRuntime`.

### Frontend

1. **Add types** — Add interfaces in `frontend/app/types/` and re-export from `types/index.ts`.
2. **Add API calls** — Add fetch calls or React Query hooks in `frontend/app/lib/`.
3. **Add components** — Use shadcn/ui primitives. Keep components small and focused.
4. **Add routes** — New pages go in `frontend/app/routes/`.

### Adding a service template

Templates live in `src/db/seeders/`. Each file covers a category.

1. Find the appropriate category file (or create one if the category doesn't exist).
2. Add a new `ServiceTemplate` entry following the pattern of existing entries.
3. If you create a new category file, import and call it from `src/db/seeders/mod.rs`.
4. Run `cargo test` to verify compilation.

---

## Pull request checklist

- [ ] `cargo fmt --check` passes
- [ ] `cargo clippy` passes with no new warnings
- [ ] `cargo test` passes
- [ ] For frontend changes: `npm run lint` and `npm run build` pass
- [ ] No secrets or credentials committed
- [ ] New public Rust functions have doc comments
- [ ] If user-facing, `README.md` is updated

---

## Branch naming

```
feat/description       # New features
fix/description        # Bug fixes
refactor/description   # Code reorganization
docs/description       # Documentation only
```

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add Telegram notification channel
fix: correct watch path glob matching for nested directories
docs: update contributing guide with frontend patterns
refactor: split src/api/apps.rs into subdirectory module
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`.

---

## Issue labels

| Label | Meaning |
|-------|---------|
| `good first issue` | Self-contained, well-scoped — good starting point |
| `help wanted` | Maintainer could use community input |
| `bug` | Something not working as documented |
| `enhancement` | New feature or improvement |
| `backend` | Rust/server-side change |
| `frontend` | React/TypeScript change |
| `security` | Security-related issue |

---

## Security

Report security vulnerabilities **privately** via [GitHub Security Advisories](https://github.com/KwaminaWhyte/rivetr/security/advisories/new), not as public issues. Never commit secrets or credentials. Use parameterized queries for all database operations. Follow OWASP guidelines for auth or session-related code.

## License

By contributing, you agree your contributions will be licensed under the [MIT License](https://github.com/KwaminaWhyte/rivetr/blob/main/LICENSE).
