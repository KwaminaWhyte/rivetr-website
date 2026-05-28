# Build Types

Rivetr supports five build strategies. You can specify one explicitly in `deploy.toml` or let Rivetr auto-detect the right one from your repository.

---

## Auto-Detection

When no `[build]` section is present in `deploy.toml`, Rivetr scans the repository root in this priority order:

1. `Dockerfile` / `dockerfile` (any case) → **Dockerfile**
2. `nixpacks.toml` → **Nixpacks**
3. `railpack.toml` → **Railpack**
4. `Procfile` → **Heroku/Paketo buildpacks**
5. `index.html` + no server framework → **Static site**
6. Falls back to **Nixpacks** (handles most language ecosystems automatically)

You can override detection at any time by setting `build.type` in `deploy.toml`.

---

## Dockerfile

Use when you have full control over the build and want explicit image construction.

**Detection:** A `Dockerfile` (or `dockerfile`) exists in the repository root (or at the path specified by `build.dockerfile`).

**deploy.toml:**

```toml
[build]
type = "dockerfile"
dockerfile = "./Dockerfile"          # relative to repo root; default is ./Dockerfile
build_args = { NODE_ENV = "production" }
```

**When to use:**
- You need multi-stage builds for smaller images
- You have non-standard build steps (compiled assets, code generation, etc.)
- You want reproducible builds pinned to a specific base image

---

## Nixpacks

[Nixpacks](https://nixpacks.com) auto-generates a Dockerfile from your source code. No configuration needed for most projects.

**Detection:** `nixpacks.toml` present, or chosen as fallback for Node.js, Python, Ruby, Go, Rust, PHP, Java, and more.

**deploy.toml:**

```toml
[build]
type = "nixpacks"
# Optional: override the start command
start_command = "node dist/server.js"
```

**`nixpacks.toml` (optional, in your repo root):**

```toml
[phases.build]
cmds = ["npm run build"]

[start]
cmd = "node dist/server.js"
```

**When to use:**
- You don't want to maintain a Dockerfile
- Your app is a standard Node.js, Python, or Go project

---

## Railpack

[Railpack](https://railpack.io) is a faster alternative to Nixpacks with better caching and smaller output images.

**Detection:** `railpack.toml` present in the repository root.

**deploy.toml:**

```toml
[build]
type = "railpack"
```

**When to use:**
- You want faster builds than Nixpacks
- You need better layer caching for large dependency trees

---

## Heroku / Paketo Buildpacks

Uses the [Cloud Native Buildpacks](https://buildpacks.io/) (`pack` CLI) standard. Compatible with any Heroku-style `Procfile`.

**Detection:** `Procfile` exists in the repository root.

**deploy.toml:**

```toml
[build]
type = "buildpack"
builder = "heroku/builder:24"    # optional; defaults to heroku/builder:24
```

**`Procfile` (in your repo root):**

```
web: node server.js
worker: node worker.js
```

**When to use:**
- You already have a `Procfile` from Heroku
- You prefer the standard buildpacks ecosystem
- You want Paketo buildpacks for Spring Boot, .NET, or other JVM apps

---

## Static Sites

Serves pre-built static files directly from the embedded proxy — no container needed.

**Detection:** Repository contains only static files (`index.html` with no recognized server framework).

**deploy.toml:**

```toml
[build]
type = "static"
publish_dir = "dist"     # directory to serve (relative to repo root)
build_command = "npm run build"   # optional build step before serving
```

**When to use:**
- React/Vue/Svelte SPAs with a `dist/` or `build/` output
- Pure HTML/CSS/JS sites
- Documentation sites built by tools like VitePress, MkDocs, or Hugo

---

## Summary Table

| Build Type | Detection | Needs Docker? | Config file |
|------------|-----------|---------------|-------------|
| Dockerfile | `Dockerfile` exists | Yes | `Dockerfile` |
| Nixpacks | `nixpacks.toml` / fallback | Yes (builds image) | `nixpacks.toml` (optional) |
| Railpack | `railpack.toml` | Yes (builds image) | `railpack.toml` |
| Heroku/Paketo | `Procfile` | Yes (builds image) | `Procfile` |
| Static | No server framework | No | `deploy.toml` |

---

## Resource Limits During Build

Build containers are subject to the limits in `rivetr.toml`:

```toml
[runtime]
build_cpu_limit = "2"       # CPU cores
build_memory_limit = "2g"   # Memory
```

These apply to all build types and prevent runaway builds from exhausting host resources.
