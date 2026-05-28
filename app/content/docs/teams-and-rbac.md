# Teams and RBAC

Rivetr is fully multi-tenant. Every resource (app, database, project) belongs to a team. Access is controlled by role-based access control (RBAC) with four built-in roles and optional per-resource permission overrides.

---

## Teams

A team is the top-level isolation boundary. Members of one team cannot see or interact with resources owned by another team.

### Creating a Team

In the dashboard, click your team name in the top navigation → **New Team**. Or via the API:

```bash
curl -X POST https://your-server/api/teams \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "acme-corp"}'
```

---

## Roles

| Role | Can do |
|------|--------|
| **Owner** | Full access. Delete team, manage billing, assign owners. |
| **Admin** | Manage members, roles, team settings, all resources. Cannot delete the team or assign owner role. |
| **Developer** | Deploy apps, manage env vars, create databases and services. Cannot manage members or team settings. |
| **Viewer** | Read-only access to all resources (logs, stats, deployments). Cannot trigger deploys or modify anything. |

### Assigning a Role

Invite a new member and assign their role in one step:

```bash
curl -X POST https://your-server/api/teams/<team_id>/members \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "role": "developer"}'
```

Update an existing member's role:

```bash
curl -X PUT https://your-server/api/teams/<team_id>/members/<user_id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

---

## Per-Resource Permission Overrides

You can grant a member elevated permissions on a specific resource, for example giving a developer write access to one app but not others.

```bash
# Set overrides for a member on specific resources
curl -X PUT https://your-server/api/teams/<team_id>/members/<user_id>/permissions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '[
    {"resource_type": "app", "resource_id": "<app_id>", "permission": "deploy"}
  ]'

# List a member's overrides
curl https://your-server/api/teams/<team_id>/members/<user_id>/permissions \
  -H "Authorization: Bearer <token>"
```

---

## Team Invitations

Team invitations are sent by email and expire after 7 days.

```bash
# Create an invitation
curl -X POST https://your-server/api/teams/<team_id>/invitations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"email": "bob@example.com", "role": "viewer"}'

# List pending invitations
curl https://your-server/api/teams/<team_id>/invitations \
  -H "Authorization: Bearer <token>"

# Resend an invitation
curl -X POST https://your-server/api/teams/<team_id>/invitations/<inv_id>/resend \
  -H "Authorization: Bearer <token>"

# Accept an invitation (called by the invited user with the token from the email)
curl -X POST https://your-server/api/invitations/<token>/accept \
  -H "Authorization: Bearer <user_token>"
```

SMTP must be configured in `rivetr.toml` for invitation emails to be sent. If SMTP is not set up, share the invitation link manually.

---

## Two-Factor Authentication Enforcement

Owners and admins can require all team members to have 2FA enabled:

```bash
curl -X PUT https://your-server/api/teams/<team_id>/2fa-enforcement \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"required": true}'
```

When enforcement is active, members without 2FA enabled are prompted to set it up on their next login before they can access any team resource.

---

## Audit Logging

Every team operation (member invited, role changed, app deployed, env var updated, etc.) is recorded in the audit log.

```bash
curl "https://your-server/api/teams/<team_id>/audit-logs?limit=50" \
  -H "Authorization: Bearer <token>"
```

Each audit entry contains the acting user, action type, affected resource, timestamp, and the IP address of the request. Audit logs are immutable and cannot be deleted via the API.

Available action types:

```bash
curl https://your-server/api/audit/actions \
  -H "Authorization: Bearer <token>"
```

---

## App Sharing Between Teams

An app owned by one team can be shared with another team (read-only or deploy access):

```bash
# Share an app with another team
curl -X POST https://your-server/api/apps/<app_id>/shares \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"team_id": "<other_team_id>", "access": "deploy"}'

# List shares for an app
curl https://your-server/api/apps/<app_id>/shares \
  -H "Authorization: Bearer <token>"

# Revoke a share
curl -X DELETE https://your-server/api/apps/<app_id>/shares/<team_id> \
  -H "Authorization: Bearer <token>"
```
