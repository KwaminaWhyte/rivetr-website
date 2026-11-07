# Compose Services

A service is a Docker Compose stack managed by Rivetr: one compose project, one or more containers, and an optional build pipeline that produces the images those containers run. Services sit next to apps and managed databases in a project.

## What a service is

A service stores a `docker-compose.yml` and deploys it with `docker compose up -d --remove-orphans`. The stack is never taken down during a normal deploy; only containers whose image or configuration changed are recreated.

Services differ from apps:

| | App | Service |
|---|---|---|
| Unit | One container image, optionally replicated | A compose project with several containers |
| Source | Git repo, ZIP upload, or prebuilt image | Compose file, plus optional Git or server-path build |
| Deploy | Build, start, health check, atomic proxy switch | Pull or build images, then `docker compose up -d` |
| Rollback | Previous deployment image | Any deployment, pinned by image digest |
| Operations | App-level start, stop, restart, logs, terminal | Per-container restart, logs, and terminal |
| Preview deployments | Yes | No |

Apps are the better fit for a single web process. Use a service when the application already has a compose file, or when it needs sidecars such as a worker, a queue, or an internal cache.

## Creating a service

Create a service with a compose file, or start from one of the 365 pre-configured templates across 26 categories (AI/ML, analytics, automation, CMS, communication, dev tools, documentation, file and media, monitoring, security, search, project management, and more). Templates fill in the compose content and the environment variables they expect.

Each service belongs to a project and a team. A service can be created without any build configuration; it then deploys by pulling the images named in its compose file.

## The Deploy button

Deploy runs the full pipeline and records a deployment with the trigger, start time, images before and after, and a live log.

1. Rivetr records the deployment and reads the image ID and registry digest of every compose service currently running.
2. If a build source is configured, it fetches the source, builds each configured image as `<repo>:<revision>` and `<repo>:latest`, and pushes both tags.
3. It writes the compose file and the managed `.env`, keeping the previous versions.
4. It runs `docker compose pull --ignore-pull-failures` for every compose service it did not just build.
5. It runs the pre-deploy hooks. A failure stops the deployment here: the previous compose file and `.env` are restored, `<repo>:latest` is pointed back at the running image, and no container is touched.
6. It runs `docker compose up -d --remove-orphans`.
7. It records the new digests, then runs the post-deploy hooks. A post-deploy hook failure is shown on the deployment, but the new containers stay.

Only one deployment per service runs at a time. A second request returns `409`. A deployment that was running when Rivetr restarted is marked failed at startup.

## Build from Git or a server path

A service build source is one of:

| Source | Description |
|---|---|
| `none` | Pull only. No build, no push. |
| `git` | A repository and branch. Git credentials are the GitHub App installation or provider token used by apps, or the global SSH key for SSH URLs. |
| `path` | An absolute directory on the server. |

For each image, configure the target repository (for example `localhost:5000/app`), the Dockerfile, the build context, build arguments, and an optional target stage. Images build in order. Build arguments can use `${TAG}`, `${COMMIT_SHA}`, and `${SHORT_SHA}`.

The revision is the short commit SHA for Git sources. For a path source it is the content of the revision file when set, otherwise the commit of a Git checkout, otherwise a UTC timestamp.

Push is on by default. A local `registry:2` on `localhost:5000` needs no login. Registry credentials are stored encrypted and passed to Docker through a throwaway `DOCKER_CONFIG`.

## Hooks

Pre-deploy and post-deploy hooks run commands inside a compose service:

```
docker compose run --rm -T --no-deps --name <generated> <service> <command>
```

The hook gets that service's image, `env_file`, `environment`, volumes, and networks. The command is passed to the image entrypoint the same way as `docker run <image> <command>`, so use `sh -c "a && b"` when shell features are needed. The default timeout is 600 seconds.

Use a pre-deploy hook for migrations. Rollbacks skip hooks, so a migration is not reversed automatically.

## Rollback

Roll back to any deployment that recorded images. Every compose service whose image differs is pinned to the digest from that deployment, or to the local image ID when the image was never pushed. Unchanged services are not recreated. Pins survive start and restart, and the next regular Deploy clears them so the stack follows its tags again.

## Environment variables

Service variables are stored encrypted. On every start, restart, and deploy, Rivetr writes them to a `.env` file (mode 600, with a `# Managed by Rivetr` header) next to the service's `docker-compose.yml`.

- Compose reads the file for `${VAR}` interpolation.
- A compose service loads it with `env_file: .env`.
- Turn on "Add the .env file to every container" to append it to every compose service's `env_file` list.

An `env_file` that points elsewhere on the server keeps working. A `.env` file Rivetr did not write is never modified.

You can paste an existing `.env` file into the Environment tab. Variables can also reference an external secret manager with `secret://`; see [Secret Managers](/docs/secret-managers).

## Containers

The Containers tab lists every container in the compose project with state, health, CPU, and memory. From there you can restart one container, read its logs, or open `/bin/sh` in it.

## Networking, domains, and limits

By default a service gets a dedicated Docker network named `rivetr-svc-<id-prefix>`, which isolates it from other services. Raw compose mode deploys the file verbatim without network overrides, container name namespacing, or label changes.

Set a service domain and port to route traffic through the embedded proxy and issue a certificate for the domain. To expose a container port directly on the host, enable public access and choose the host port and the container port.

Optional CPU and memory limits apply to every compose service that does not already declare its own. They are injected as top-level `cpus` and `mem_limit` keys in the rendered compose file.

## Auto deploy

Git-sourced services can deploy when a commit is pushed to the tracked branch. The GitHub, GitLab, and Gitea webhook endpoints are the same ones apps use. Auto deploy is not available for path sources.

## API

| Method | Path | Description |
|---|---|---|
| POST | `/api/services/:id/deploy` | Start a deployment (`202`, `409` if one is running) |
| GET | `/api/services/:id/deployments?limit=` | Deployment history, newest first |
| GET | `/api/services/:id/deployments/:deployment_id` | One deployment, including images before and after |
| GET | `/api/services/:id/deployments/:deployment_id/logs` | Stored log lines |
| WS | `/api/services/:id/deployments/:deployment_id/logs/stream?token=` | Live log lines, then `{"type":"end"}` |
| POST | `/api/services/:id/deployments/:deployment_id/rollback` | Redeploy that deployment's images by digest |
| GET, PUT | `/api/services/:id/deploy-config` | Source, images, registry, hooks, auto deploy, `.env` switch |
| GET | `/api/services/:id/containers` | Containers with state, health, CPU, and memory |
| POST | `/api/services/:id/containers/:container/restart` | Restart one container |
| GET | `/api/services/:id/containers/:container/logs?lines=` | Recent log lines |
| WS | `/api/services/:id/containers/:container/terminal?token=` | Shell in one container |
| GET, POST | `/api/services/:id/env-vars` | List (`?reveal=true`) or create variables |
| POST | `/api/services/:id/env-import` | Import a pasted `.env` file |
