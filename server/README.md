# OpsQuest content server

An optional Node 20+ content service for OpsQuest. The mobile-facing scenario API is deliberately anonymous: a client needs only the server URL. Authentication, RBAC, OIDC, and SAML protect the browser editor and mutation endpoints only.

## Quickstart: SQLite

From `server/`:

```powershell
$env:SESSION_SECRET = "replace-with-a-long-random-secret"
$env:ADMIN_USER = "admin"; $env:ADMIN_PASSWORD = "replace-with-a-strong-password"; npm start
```

In a second terminal, seed the bundled scenarios:

```powershell
npm run seed
```

The database is created at `server/data/opsquest.db`. Open `http://localhost:3000/admin/`. After the first successful boot, remove `ADMIN_PASSWORD` from the runtime environment; bootstrap credentials are used only when the users table is empty.

Install dependencies with `npm install` before the first run. The two commands needed during normal local use are `npm start` and `npm run seed`.

## PostgreSQL

Set `DATABASE_URL` and the same session/bootstrap settings, then run the server:

```powershell
$env:DATABASE_URL = "postgresql://opsquest:password@localhost:5432/opsquest"
$env:SESSION_SECRET = "replace-with-a-long-random-secret"
$env:ADMIN_USER = "admin"; $env:ADMIN_PASSWORD = "replace-with-a-strong-password"; npm start
```

Tables are created automatically on boot in both storage modes. Migrations use idempotent `CREATE TABLE IF NOT EXISTS` statements.

## Configuration

| Variable | Required | Default | Purpose |
|---|---:|---|---|
| `HOST` | No | `0.0.0.0` | Listen address. |
| `PORT` | No | `3000` | HTTP port. |
| `DATABASE_URL` | No | — | PostgreSQL connection URL. When absent, SQLite is used. |
| `SQLITE_PATH` | No | `server/data/opsquest.db` | SQLite database file. Ignored when `DATABASE_URL` is set. |
| `SESSION_SECRET` | Production | Random per boot | HMAC secret for the signed session cookie. If absent, a warning is logged and sessions do not survive restart. |
| `COOKIE_SECURE` | No | Based on `NODE_ENV` | Set to `true` to send auth cookies only over HTTPS, or explicitly `false` for a local HTTP deployment. |
| `NODE_ENV` | No | — | `production` enables secure cookies unless `COOKIE_SECURE` is explicitly set. |
| `ADMIN_USER` | First boot | — | Username for the first local admin, created only when no users exist. |
| `ADMIN_PASSWORD` | First boot | — | Password for the first local admin; minimum eight characters. |
| `OIDC_ISSUER` | OIDC | — | OpenID Provider issuer URL. |
| `OIDC_CLIENT_ID` | OIDC | — | OIDC client ID. |
| `OIDC_CLIENT_SECRET` | OIDC | — | OIDC client secret. |
| `OIDC_REDIRECT_URI` | OIDC | — | Exact callback URL; register `/auth/oidc/callback` with the provider. |
| `OIDC_DEFAULT_ROLE` | No | `viewer` | JIT role when no usable role claim exists. |
| `OIDC_ROLE_CLAIM` | No | — | Claim whose value is `admin`, `editor`, or `viewer`; when set, the role is synchronized on every OIDC login. |
| `SAML_ENTRY_POINT` | SAML | — | Identity provider SSO URL. |
| `SAML_ISSUER` | SAML | — | Service provider entity ID/issuer. |
| `SAML_CERT` | SAML | — | IdP signing certificate PEM. Literal `\n` sequences are accepted. |
| `SAML_CALLBACK_URL` | SAML | — | Public ACS URL ending in `/auth/saml/callback`. |
| `SAML_DEFAULT_ROLE` | No | `viewer` | Role assigned to newly JIT-provisioned SAML users. |

OIDC routes activate only when all four required OIDC variables are set. SAML routes activate only when all four required SAML variables are set. `GET /auth/providers` tells the editor which buttons to show. Missing partial configurations leave that provider disabled.

SSO users are provisioned on first login and keyed by provider subject (`sub`) or SAML `NameID`, not by mutable email address. OIDC claim-based roles are synchronized at every login. SAML roles can be changed by an administrator after provisioning.

## RBAC

| Capability | Anonymous | Viewer | Editor | Admin |
|---|:---:|:---:|:---:|:---:|
| Health, manifest, scenario reads | Yes | Yes | Yes | Yes |
| Open editor and inspect content | No | Yes | Yes | Yes |
| Create/update/delete scenarios | No | No | Yes | Yes |
| List/create/update/delete users | No | No | No | Yes |

Local passwords use Node's built-in `crypto.scrypt`. Sessions are a signed, HTTP-only, same-site cookie with a 12-hour lifetime. They are not JWTs. Run behind HTTPS and set `COOKIE_SECURE=true` outside local development.

## API

| Method | Path | Access | Response / behavior |
|---|---|---|---|
| `GET` | `/health` | Public | `{ ok, storage, scenarios }` |
| `GET` | `/v1/manifest` | Public | Content timestamp and scenario IDs/update timestamps. An empty store uses the Unix epoch as `contentVersion`. |
| `GET` | `/v1/scenarios` | Public | Array of complete schema-v2 scenario bodies. |
| `GET` | `/v1/scenarios/:id` | Public | Complete scenario body, or 404. |
| `POST` | `/auth/login` | Public | Local `{ username, password }` login; sets the session cookie. |
| `POST` | `/auth/logout` | Public | Clears the session cookie. |
| `GET` | `/auth/me` | Signed in | Current user. |
| `GET` | `/auth/providers` | Public | Enabled login-provider flags. |
| `GET` | `/auth/oidc/login` | When enabled | Starts authorization-code + PKCE login. |
| `GET` | `/auth/oidc/callback` | When enabled | Completes OIDC login and JIT provisioning. |
| `GET` | `/auth/saml/login` | When enabled | Starts SAML login. |
| `POST` | `/auth/saml/callback` | When enabled | ACS endpoint; completes login and JIT provisioning. |
| `PUT` | `/v1/scenarios/:id` | Editor+ | Validates and upserts a scenario. Returns warnings (including funnel warnings) without rejecting them. |
| `DELETE` | `/v1/scenarios/:id` | Editor+ | Deletes a scenario. |
| `GET` | `/v1/users` | Admin | Lists users without password hashes. |
| `POST` | `/v1/users` | Admin | Creates a local user from `{ username, displayName, password, role }`. |
| `PATCH` | `/v1/users/:id` | Admin | Changes `role` and/or resets a local `password`. |
| `DELETE` | `/v1/users/:id` | Admin | Deletes a user; self-deletion is rejected. |

Public `GET /v1/*` scenario responses and `/health` include `Access-Control-Allow-Origin: *`, so a mobile or web client can consume content from a user-supplied URL without credentials. User administration remains authenticated despite sharing the `/v1` namespace.

## Content validation and seeding

Writes enforce schema 2, kebab-case IDs, `TKT-####` tickets, enums, required strings and hints, choice scoring fields, exactly one `best` choice per choice node, valid edges, at least one ending, and a graph where every authored path terminates. Authored `maxScore` is rejected. Unreachable nodes, length-tier mismatch, and funnels are warnings. A duplicate ticket already stored under a different scenario ID is rejected.

`npm run seed` reads every `../src/data/scenarios/*.json` file, validates it, and upserts it through the selected database adapter. It does not create a session or call HTTP endpoints.

## Deployment

The published image is `ghcr.io/spillers-technology/opsquest-server`. To run it with a persistent SQLite volume:

```sh
docker run --rm -p 3000:3000 -e SESSION_SECRET=replace-with-a-long-random-secret -e ADMIN_USER=admin -e ADMIN_PASSWORD=replace-with-a-strong-password -e COOKIE_SECURE=false -v opsquest-data:/app/data ghcr.io/spillers-technology/opsquest-server:latest
```

For Docker Compose, create `server/.env` with `SESSION_SECRET`, `ADMIN_USER`, and `ADMIN_PASSWORD`, then start SQLite mode from `server/`:

```sh
docker compose up -d server
```

To use PostgreSQL, also set `POSTGRES_PASSWORD` in `.env`, uncomment the `DATABASE_URL` line in `docker-compose.yml`, and start both profiles:

```sh
docker compose --profile postgres up -d postgres server
```

Seed either storage mode from a repository checkout with `docker compose --profile seed run --rm server-seed`. The seed service mounts the repository's scenario JSON files, which are intentionally not included in the server image.

The Kubernetes manifest contains clearly marked example secrets, a single-replica SQLite PVC, and an example ingress. Replace the `CHANGE-ME` values and host before applying it:

```sh
kubectl apply -f deploy/k8s/opsquest-server.yaml
```

For production, configure `DATABASE_URL` for PostgreSQL instead of using the SQLite PVC. The `.github/workflows/publish-server.yml` workflow publishes Linux AMD64 images to GHCR on `v*` tags, stripping the leading `v` for the version tag and also updating `latest`; it can also be run manually with a version input.

The mobile app only needs the server's public URL. Browser-editor authentication settings do not need to be shipped in the app.
