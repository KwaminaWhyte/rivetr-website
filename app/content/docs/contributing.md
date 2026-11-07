# Contributing

Rivetr is MIT licensed and open to contributions. This page covers the development setup, the commands CI runs, and the conventions for patches. The repository's `CONTRIBUTING.md` and `SECURITY.md` are the source of truth if they differ from this summary.

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Rust | 1.95+ | Install with rustup |
| Node.js | 22.22+ | React Router 8 requires it |
| Docker or Podman | A current Docker Engine or Podman release | Needed to test deployments |
| Git | Any recent version | |
| `cargo-watch` | Optional | Auto-reload the backend |

You also need ports 8080 for the API and dashboard, and 5173 for the Vite dev server. Ports 80 and 443 are only needed when you test the proxy.

## Development setup

```bash
git clone https://github.com/KwaminaWhyte/rivetr.git
cd rivetr
cp rivetr.example.toml rivetr.local.toml
```

Run the backend in one terminal:

```bash
cargo watch -x "run -- --config rivetr.local.toml"
# or, without auto-reload
cargo run -- --config rivetr.local.toml
```

The backend serves the embedded dashboard and API at `http://localhost:8080`.

Run the frontend in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite serves `http://localhost:5173` and proxies `/api/` to port 8080. Use the Vite URL while working on React so hot module reload works; the backend URL serves the last production build.

## Build and test commands

Run these before opening a pull request. They match CI.

Backend:

```bash
cargo fmt --all -- --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --all-features
cargo build --release
```

The terminal UI is behind a feature flag:

```bash
cargo build --release --features tui
```

Frontend:

```bash
cd frontend
npm ci
npm run typecheck
npm run build
```

`npm run build` produces the client bundle that `postbuild` copies into `static/dist/client`, where `rust-embed` picks it up for the release binary.

## Repository layout

| Path | Contents |
|------|----------|
| `src/api/` | Axum route handlers, grouped by resource |
| `src/engine/` | Deployment pipeline, service deploys, schedulers, builders, server operations |
| `src/runtime/` | `ContainerRuntime` trait, Docker (Bollard) and Podman (CLI) implementations |
| `src/proxy/` | Embedded reverse proxy, ACME/TLS, access logs, traffic analytics |
| `src/db/` | SQLite pool, migration runner, models, service template seeders |
| `src/mcp/` | MCP server and tools |
| `src/settings/`, `src/backup/`, `src/cli/`, `src/tui/` | Instance settings, backups, CLI subcommands, terminal UI |
| `migrations/` | Numbered SQL migrations |
| `frontend/app/` | React Router dashboard source |

For how the components fit together, see `docs/architecture/architecture.md` in the Rivetr repository, especially the source layout section.

## Code style

Rust:

- `rustfmt` with the repository defaults; CI fails on any diff. `clippy` runs with `-D warnings`, so add no new warnings.
- Public functions get doc comments. Use parameterized SQLx queries, never string-built SQL, and validate input through `src/api/validation/`.
- Use `crate::` imports in submodules, not `super::super::`.

A Rust file over roughly 1000 lines becomes a subdirectory module. `mod.rs` holds only declarations, re-exports, and route registration; re-export the public surface so callers do not change when files split. A backend handler expected to pass roughly 500 lines starts as a subdirectory module, and a frontend route over roughly 600 lines extracts its panels into components.

Frontend:

- Shared types live under `frontend/app/types/` and API calls under `frontend/app/lib/`.
- Reuse the primitives in `frontend/app/components/ui/`. Routes live in `frontend/app/routes/` and use React Router file-based routing.

## Database changes

Add schema changes as a new numbered SQL file in `migrations/`. Migrations must be idempotent, because `run_migrations` in `src/db/mod.rs` may run against an existing database. Register the file at the end of `run_migrations`.

Then:

1. Add or update models under `src/db/models/` and re-export them from `src/db/models/mod.rs`.
2. Add route handlers under the matching `src/api/` module, and register the route in that module and in `src/api/mod.rs`. For a route under `/api`, classify its token scope in `src/api/scopes.rs`; a test fails when a route has no entry.
3. Add shared state to `AppState` in `src/lib.rs` if needed. If the feature touches containers, implement it for both `DockerRuntime` and `PodmanRuntime` through the `ContainerRuntime` trait.
4. Run `cargo test --all-features`.

## Adding a service template

The gallery currently holds 365 templates. Templates are seeded from category files under `src/db/seeders/`. To add one:

1. Open the category file that fits, or create a new one.
2. Add a `ServiceTemplate` entry that follows the existing entries, including image, ports, volumes, environment, and metadata.
3. If you created a category file, import and call it from `src/db/seeders/mod.rs`, then run `cargo test` to verify compilation and seeding.

## Pull request checklist

- [ ] `cargo fmt --all -- --check` passes.
- [ ] `cargo clippy --all-targets --all-features -- -D warnings` passes with no new warnings.
- [ ] `cargo test --all-features` passes.
- [ ] For frontend changes, `npm run typecheck` and `npm run build` pass.
- [ ] No secrets, credentials, tokens, or personal data are committed.
- [ ] User-facing changes update `README.md` or the matching page under `docs/reference/`.
- [ ] New API routes have a scope entry and a test.

Keep pull requests focused. Unrelated refactors make review slower.

## Branches and commits

Branch names use a type prefix:

```text
feat/description
fix/description
refactor/description
docs/description
```

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat: add Telegram notification channel
fix: correct watch path glob for nested directories
refactor: split src/api/apps.rs into a subdirectory module
```

Allowed types are `feat`, `fix`, `refactor`, `docs`, `test`, and `chore`.

## Documentation

Product documentation lives in the Rivetr repository: `README.md` for the overview, `docs/reference/` for configuration and feature reference, and `docs/architecture/` for design. Update the relevant file in the same pull request as the code change. This website is maintained separately; note public doc changes in the PR.

## Security

- Report vulnerabilities privately through [GitHub Security Advisories](https://github.com/KwaminaWhyte/rivetr/security/advisories/new). Do not open a public issue.
- Never commit secrets or credentials.
- Use parameterized queries for every database operation.
- Validate input through `src/api/validation/`.
- Follow OWASP guidance for authentication and session code.

See `SECURITY.md` in the Rivetr repository for the full disclosure policy.

## Getting help

Search [existing issues](https://github.com/KwaminaWhyte/rivetr/issues) before opening a new one. For design questions, read `docs/architecture/architecture.md` first, then ask in the issue with the specific component and behavior you are working on.

## License

By contributing, you agree that your changes are licensed under the MIT License.
