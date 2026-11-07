# Teams and RBAC

Every app, service, database, project and server is scoped to a team. API tokens belong to a user and can optionally be restricted to one team. Teams are the boundary for authorization: a member's role and per-resource overrides apply only inside that team. The team switcher in the dashboard changes the active team; the API uses the team that owns the resource in the URL.

A new account gets a Personal team and is its owner. Team membership is independent of how a user signs in: OAuth, OIDC SSO, passkeys and passwords authenticate identity, then team membership decides access.

## Preset roles

Five roles ship with Rivetr. Assign one when inviting a member or changing a member's role.

| Role | Abilities | Typical use |
|---|---|---|
| `owner` | All 24 | Full control, including deleting the team |
| `admin` | All except `team.delete` | Manage members, roles, audit and settings |
| `developer` | Read access, full app/service/database lifecycle, projects, secrets, servers, integrations, tokens | Day-to-day engineering |
| `deployer` | Read access, deploy apps/services/databases, manage tokens | CI or release operators |
| `viewer` | Read access to apps, services, databases, projects and servers | Stakeholders and support |

Only the `owner` preset has `team.delete`. A custom role can include it only if its creator holds it. Neither `developer` nor `deployer` can invite members, change roles or read the team audit log; those require `team.manage` or `team.audit`, which `admin` and `owner` hold.

## The 24 abilities

| Resource | Abilities |
|---|---|
| Apps | `apps.read`, `apps.deploy`, `apps.write`, `apps.delete` |
| Services | `services.read`, `services.deploy`, `services.write`, `services.delete` |
| Databases | `databases.read`, `databases.deploy`, `databases.write`, `databases.delete` |
| Projects | `projects.read`, `projects.write`, `projects.delete` |
| Secrets | `env.read_secrets` |
| Servers | `servers.read`, `servers.manage` |
| Integrations | `integrations.manage` |
| Team | `team.manage`, `team.audit`, `team.delete` |
| Instance settings | `settings.manage` |
| API tokens | `tokens.manage` |

`write` covers editing configuration; `deploy` covers triggering, restarting and rolling back deployments. Reading a resource never reveals secret values unless the role also has `env.read_secrets`.

## Custom roles

Create custom roles per team under Team > Roles. A custom role stores a name, an optional description and a list of ability strings. Its stored member value is `custom:<role_id>`. Names cannot collide with the five presets and are limited to 64 characters.

A member who creates a custom role can only grant abilities they already hold. The owner is exempt and can grant anything. This prevents privilege escalation through role creation.

```bash
curl -X POST https://rivetr.example.com/api/teams/TEAM_ID/roles \
  -H "Authorization: Bearer $RIVETR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Release manager",
    "description": "Can deploy and inspect apps",
    "abilities": ["apps.read", "apps.deploy", "services.read", "services.deploy"]
  }'
```

List roles with `GET /api/teams/{id}/roles`, update with `PUT /api/teams/{id}/roles/{role_id}`, delete with `DELETE /api/teams/{id}/roles/{role_id}`.

## Per-member resource overrides

Role abilities can be narrowed or widened for individual resources. An override names a `resource_type`, a `resource_id` and `permission`, either `allow` or `deny`.

- `deny` always wins. A deny on the resource, its owning app or its project blocks access even if the role or another allow says otherwise.
- `allow` only grants a subset: `read`, `deploy` or `write` for apps, services and databases, and `read` or `write` for projects. It cannot grant delete, secret reading, server management, team management or token management.
- Setting overrides requires `team.manage` and the ability to manage the target member. Non-owners cannot set overrides on themselves.

View or replace a member's overrides with `GET` and `PUT /api/teams/{id}/members/{user_id}/permissions`. The PUT body replaces the whole set:

```json
{
  "permissions": [
    { "resource_type": "app", "resource_id": "APP_ID", "permission": "allow" },
    { "resource_type": "database", "resource_id": "DB_ID", "permission": "deny" }
  ]
}
```

Remove one entry with `DELETE /api/teams/{id}/members/{user_id}/permissions/{perm_id}`.

## Sharing apps across teams

App sharing is view-only in 1.0.0. A share lets another team see an app in its dashboard and read its details, but that team cannot deploy, edit, restart or delete it. The owning team keeps full control.

`POST /api/apps/{id}/shares` accepts:

```json
{ "team_id": "OTHER_TEAM_ID", "permission": "view" }
```

Only `view` is accepted. Sharing with the owning team returns an error. List shares with `GET /api/apps/{id}/shares` and revoke with `DELETE /api/apps/{id}/shares/{team_id}`.

## Invitations and membership

Two paths add members:

- Existing accounts: `POST /api/teams/{id}/members` with `{"user_identifier": "dev@example.com", "role": "developer"}`. The identifier can be an email or user ID. An unknown user returns `404`; use the invitations endpoint instead. An existing member returns `409`.
- Email invitations: `POST /api/teams/{id}/invitations` with `{"email": "dev@example.com", "role": "developer"}`. Invitations expire after seven days. A duplicate pending invitation for the same email returns `409`.

Invitations are delivered by SMTP when `[email]` is configured. The create response also includes the invitation token, so an administrator can pass the accept link directly. Resend with `POST /api/teams/{id}/invitations/{id}/resend`, revoke with `DELETE`, validate with `GET /api/invitations/{token}` and accept with `POST /api/invitations/{token}/accept`.

Callers can only assign roles at or below their own level; the owner can assign any role. Change a role with `PUT /api/teams/{id}/members/{user_id}` and remove a member with `DELETE`.

## Per-team 2FA requirement

A team can require two-factor authentication for all of its members. Changing the setting requires `team.delete`, which the `owner` preset holds and `admin` does not. The toggle takes no request body:

```bash
curl -X PUT https://rivetr.example.com/api/teams/TEAM_ID/2fa-enforcement \
  -H "Authorization: Bearer $RIVETR_TOKEN"
```

When enforcement is on, a member without TOTP or a passkey is blocked from team resources with the error code `two_factor_required`. Enroll at Account > Security. Passkeys satisfy the requirement the same way TOTP does.

## Audit log

Team audit entries record the actor's user ID, action, resource type and ID, a JSON details object, and a timestamp. They do not include a client IP.

`GET /api/teams/{id}/audit-logs?page=1&per_page=20` requires `team.audit`. `per_page` defaults to 20 and is capped at 100. Entries are retained for 90 days by default (`[data_retention] audit_logs_days`). Membership changes, role and permission changes, invitation activity and team settings changes are recorded.

Instance administrators also have a global audit API at `GET /api/audit`, with `GET /api/audit/actions` and `GET /api/audit/resource-types` for filtering. The global log includes the client IP, resolved through the trusted proxy rules.

## Single sign-on with OIDC

Administrators configure OIDC providers under Settings > Authentication. Login starts at `/api/auth/sso/{provider_id}/login` and completes at the provider's callback. The flow binds the request with a short-lived `rivetr_sso_state` cookie scoped to `/auth/sso`, valid for 10 minutes.

SSO authenticates the user. Access to a team still requires membership. New SSO users are created only when registration is enabled (`registration_enabled` in Advanced settings) and receive a Personal team as owner. Existing users are linked by OIDC subject first, then by email.

## OAuth providers

Rivetr supports GitHub, Google, GitLab, Azure and Bitbucket OAuth login. GitHub, GitLab and Bitbucket can also be configured with `[oauth.github]`, `[oauth.gitlab]` and `[oauth.bitbucket]` in `rivetr.toml`. All providers are configured from the authentication settings page, where each needs a client ID and client secret.

OAuth login uses a `rivetr_oauth_state` cookie to bind the callback to the browser session. Account linking requires a verified email: GitHub's verified addresses, Google's `verified_email`, GitLab's confirmed address, Bitbucket's confirmed flag, and a single-tenant Azure application. An unverified email is not used to take over or link an account.

## Passkeys and TOTP

TOTP enrollment generates 10 single-use recovery codes, stored hashed. A passkey is a WebAuthn credential registered under Account > Security; registration and login challenges expire after five minutes. Either factor satisfies a team's 2FA requirement, and passkey login is a complete second factor on its own.

Disabling TOTP or removing the last passkey can lock a member out of a team that enforces 2FA. Check the team's requirement before removing factors.

## API tokens

API tokens use the `rvt_` prefix and are hashed with SHA-256 at rest. The plaintext value is shown once, on creation or roll. Tokens can have an expiry, be restricted to one team and to specific projects/resources, be paused and resumed, and be rolled with a grace period so the old value keeps working while clients switch. The default roll grace is 60 minutes; the maximum is seven days. Last-used time and a token hint are recorded for auditing.

| Scope | Grants |
|---|---|
| `read` | Read access to resources the token's user can read |
| `deploy` | Trigger, restart, roll back deployments |
| `write` | Create and edit resources |
| `delete` | Delete resources |
| `secrets` | Read secret values |
| `admin` | Every scope |

Omitting `scopes` grants all scopes, matching the pre-scopes behavior. `admin` implies all others. The token still cannot exceed the owning user's team role and overrides.

```bash
curl -X POST https://rivetr.example.com/api/tokens \
  -H "Authorization: Bearer $RIVETR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ci-deploy",
    "scopes": ["read", "deploy"],
    "team_id": "TEAM_ID",
    "expires_at": "2027-01-01T00:00:00Z"
  }'
```

Manage tokens at `POST/GET /api/tokens`, `PATCH/DELETE /api/tokens/{id}`, and `POST /api/tokens/{id}/pause`, `/resume` or `/roll`. Creating and managing tokens requires `tokens.manage`. An instance-level API access policy can also restrict token-authenticated requests to an IP allowlist; it does not affect dashboard sessions.

## Password reset

Users start a reset at `POST /api/auth/forgot-password`. When SMTP is configured, Rivetr emails a single-use link that expires after 30 minutes. Completing the reset at `POST /api/auth/reset-password` revokes every existing session for that user.

If email is unavailable or the administrator is locked out, run `rivetr reset-password <email>` on the server as the service user. It prompts for a new password (minimum 12 characters), deletes the user's sessions, and does not require the API to be running.
