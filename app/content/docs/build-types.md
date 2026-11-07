# Build types

A build type turns a repository into a container image. Rivetr supports Dockerfile, Nixpacks, Railpack, Cloud Native Buildpacks, static sites and prebuilt images. The build type is set per app on the **Build** tab or through the app API and stored in the database. There is no repository config file for Rivetr itself; each builder reads only its own native file (`Dockerfile`, `nixpacks.toml`, `railpack.toml` or `project.toml`) when present.

## Choosing a build type

| Build type | Dashboard label | API value | Best for |
|---|---|---|---|
| Dockerfile | Dockerfile | `dockerfile` | Repositories with a Dockerfile, or builds that need exact control |
| Nixpacks | Nixpacks | `nixpacks` | Most languages and frameworks with no Dockerfile |
| Railpack | Railpack | `railpack` | Projects that benefit from Railpack caching, or that ship `railpack.toml` |
| Cloud Native Buildpacks | Buildpacks | `cnb` | Paketo or Heroku buildpacks, often Java and .NET |
| Static site | Static | `staticsite` | Sites with no server process |
| Prebuilt image | Docker Registry source | not a build type | Images already built and pushed to a registry |

The API also accepts `static` as an alias for `staticsite`. Use `staticsite` when creating a static app through the API; that is the value the dashboard writes and the value the build pipeline dispatches on. Nixpacks is the default for new Git apps.

## Dockerfile

Rivetr builds the image with the Docker daemon or Podman and passes the configured context.

| Setting | Meaning |
|---|---|
| Dockerfile name | File name to look for. Default `Dockerfile`. |
| Dockerfile path | Full path relative to the repository. Takes precedence over the file name. |
| Target | Multi-stage build target passed as `--target`. |
| Base directory | Build context, for monorepos where the app is in a subdirectory. |
| Custom Docker options | Extra options passed to the build. |
| Inline Dockerfile | A Dockerfile stored in the app settings instead of the repository. |

Dockerfile builds also support **Build Secrets** for BuildKit secrets. They are available only to Dockerfile builds; Nixpacks, Railpack and buildpacks ignore them.

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
EXPOSE 3000
CMD ["npm", "start"]
```

When Rivetr auto-detects a build type for an uploaded archive, it looks for `Dockerfile`, `dockerfile`, `Containerfile` or `containerfile` in the repository root first, then in `docker/`, `.docker/` and `build/`.

## Nixpacks

Nixpacks inspects the repository and generates a build plan for the detected language and framework. Node.js, Python, Go, Rust, Ruby, PHP, Java and static sites are covered without configuration.

On the Build tab you can override three commands:

- Install command
- Build command
- Start command

The repository can also carry a `nixpacks.toml`. Rivetr reads it and merges it with the app settings; app-level command overrides take precedence.

```toml
# nixpacks.toml
[phases.setup]
nixPkgs = ["nodejs_22", "pnpm"]

[phases.install]
cmds = ["pnpm install --frozen-lockfile"]

[phases.build]
cmds = ["pnpm build"]

[start]
cmd = "pnpm start"
```

If detection finds nothing, Nixpacks is still selected with low confidence. A failed detection usually shows up as a missing start command; set one explicitly.

## Railpack

Railpack is Railway's successor to Nixpacks. It detects languages and frameworks, caches dependencies between builds and supports single-page apps. Rivetr starts a BuildKit container automatically if one is not running, because Railpack requires BuildKit.

Railpack reads `railpack.toml` from the repository when present and otherwise detects the project. Rivetr does not add install, build or start overrides on top.

Use Railpack when you want its caching behavior or already maintain a `railpack.toml`. For a standard Node.js or Python app, Nixpacks and Railpack both work; Railpack is the newer builder.

## Cloud Native Buildpacks

Rivetr invokes the Pack CLI with a CNB builder. The builder is chosen from the project files:

| Project | Builder |
|---|---|
| Maven or Gradle (`pom.xml`, `build.gradle`, `build.gradle.kts`) | `paketobuildpacks/builder-jammy-full` |
| .NET (`.csproj`, `.fsproj`) | `paketobuildpacks/builder-jammy-base` |
| Node.js, Python, Go or Ruby | `heroku/builder:24` |
| Anything else | `paketobuildpacks/builder-jammy-base` |

A `project.toml` in the repository selects buildpacks and build-time environment variables:

```toml
# project.toml
[[build.buildpacks]]
id = "paketo-buildpacks/nodejs"

[[build.env]]
name = "BP_NODE_RUN_SCRIPTS"
value = "build"
```

The installer installs the Pack CLI. If Pack is missing, CNB builds fail before the build starts.

## Static sites

The static builder does not serve files directly from the Rivetr proxy. It builds an NGINX container image containing the generated site, starts that container and routes to it like any other app.

| Setting | Default | Notes |
|---|---|---|
| Publish directory | `dist` | Directory produced by the build, copied into the image |
| SPA mode | on | Unknown paths fall back to `index.html` with `try_files` |
| Node version | 20 | Used when the build runs Node.js |
| Port | 3000 | Internal NGINX port |

Package manager detection uses the lockfile: `bun.lockb`, `pnpm-lock.yaml`, `yarn.lock`, then `package-lock.json`, and falls back to npm. Custom install and build commands, a custom NGINX config and build arguments are available for sites that need them.

Common publish directories:

| Framework | Output |
|---|---|
| Next.js static export | `out` |
| Astro static | `dist` |
| Vite | `dist`, or the custom `outDir` |
| SvelteKit with `adapter-static` | `build` |
| Plain HTML with no `package.json` | `.` |

Astro with SSR and SvelteKit with the Node adapter are not static sites; use Nixpacks or a Dockerfile for those.

## Prebuilt images

A prebuilt image is a deployment source, not a builder. Create the app with **Docker Registry**, enter the image reference (`registry.example.com/team/app:tag`) and set the container port. Rivetr pulls the image and starts it without cloning or building.

To redeploy when a new image is pushed, configure a Docker Hub webhook and use a tag that matches the app's image. See [Webhooks](/docs/webhooks).

## Automatic detection

Automatic build type detection runs for uploaded ZIP archives. It does not run for Git apps: a Git app always uses the build type selected when it was created or last edited.

Detection order:

1. Dockerfile or Containerfile, in the root then `docker/`, `.docker/`, `build/`
2. `docker-compose.yml`, `docker-compose.yaml`, `compose.yml` or `compose.yaml`
3. `railpack.toml`
4. `project.toml` (Cloud Native Buildpacks)
5. `nixpacks.toml`
6. Static framework detection (Next.js export, Astro, Vite, SvelteKit, plain `index.html`)
7. Language files (`package.json`, `requirements.txt`, `go.mod`, `Cargo.toml`, `Gemfile`, and others), which select Nixpacks
8. Fallback: Nixpacks with confidence 0.5

You can override the detected type during upload. The override is stored with the app and used for later deploys.

## Build options

The **Build** tab also controls:

| Option | Default | Effect |
|---|---|---|
| Shallow clone | on | `git clone --depth 1` for faster checkouts |
| Submodules | off | `--recurse-submodules` during clone |
| Git LFS | off | Runs `git lfs pull` after clone |
| Disable cache | off | Builds without the builder cache |
| Inject SOURCE_COMMIT | off | Passes the commit SHA as a build argument |
| Build server | local | Runs the build on a remote build server over SSH |

Builds are capped by `[runtime] build_cpu_limit` (default 2 CPUs) and `build_memory_limit` (default 2 GB). Build logs stream to the deployment page and are retained according to the app's log policy.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Nixpacks build exits with no start command | Detection missed the framework. Set a start command on the Build tab. |
| Static app returns 403 or a directory listing | Publish directory is wrong. Set it to the directory the build actually writes, for example `out` for Next.js export. |
| Railpack fails with a BuildKit error | BuildKit could not start. Check that Docker is running and that the host allows a privileged BuildKit container. |
| Buildpacks fail with `pack` not found | Install the Pack CLI, or re-run the installer. |
| Dockerfile build ignores the path | The file name and path both point somewhere else. The path takes precedence; clear it to use the name. |
| Build runs out of memory | Raise `[runtime] build_memory_limit` or set a larger limit for the app build. |
