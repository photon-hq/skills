# Photon OAuth 2.1 and OpenID Connect

Use Photon OAuth when an application should act on behalf of a Photon user with explicit, revocable scopes. OAuth tokens call the Dashboard API on `app.photon.codes`. They do **not** replace the project ID and project secret used for the Spectrum API on `spectrum.photon.codes`.

## Endpoints and discovery

| Purpose | URL |
|---|---|
| Issuer | `https://app.photon.codes/api/auth` |
| Authorization | `https://app.photon.codes/api/auth/oauth2/authorize` |
| Token | `https://app.photon.codes/api/auth/oauth2/token` |
| UserInfo | `https://app.photon.codes/api/auth/oauth2/userinfo` |
| Revocation | `https://app.photon.codes/api/auth/oauth2/revoke` |
| Introspection | `https://app.photon.codes/api/auth/oauth2/introspect` |
| JWKS | `https://app.photon.codes/api/auth/jwks` |

Because the issuer contains `/api/auth`, standards-compliant metadata lives at the RFC 8414 path-insertion URLs:

```text
https://app.photon.codes/.well-known/oauth-authorization-server/api/auth
https://app.photon.codes/.well-known/openid-configuration/api/auth
```

Configure one of these explicitly when a library incorrectly appends a well-known path to the issuer or probes the domain root.

## Register an app

Create the application under Dashboard → Developer → Apps. Configure:

- an exact-match redirect URI allowlist;
- a public client for native/browser apps, or a confidential client for server-side apps;
- the maximum set of scopes the app may request; and
- consent-screen name, logo, and homepage.

Confidential client secrets are displayed once and must be kept in a secrets manager. Public clients have no secret.

## Authorization-code requirements

- PKCE with `S256` is required for public and confidential clients.
- Generate and verify a cryptographically random `state`.
- Exchange the authorization code using the same redirect URI and `code_verifier`.
- Treat access tokens as opaque.
- Request `offline_access` only when a refresh token is required.
- Refresh tokens rotate; atomically store the newest token and invalidate the old one.
- Validate an OIDC ID token's EdDSA signature against the Photon JWKS, plus issuer, audience, expiry, and nonce where used.

## Scope families

Identity scopes are `openid`, `profile`, `email`, and `offline_access`. Resource scopes include read/write pairs for projects, members, webhooks, billing, Spectrum configuration, and payments.

Request the least privilege needed. A valid token without the endpoint's required scope receives `403`; missing, expired, or revoked tokens receive `401`.

## Lifetimes and revocation

Access tokens live one hour by default. `billing:write` reduces the lifetime to five minutes, while other `:write` scopes cap it at fifteen minutes; the shortest applicable lifetime wins. Refresh tokens live for thirty days and rotate at every exchange.

Revoke tokens when disconnecting an integration. Users can also withdraw app consent from the Dashboard.

## Current limitations

- The `client_credentials` grant is not supported; every OAuth token represents a user.
- Dynamic client registration is not supported; create apps in the Dashboard.
- Only the `S256` PKCE challenge method is accepted.

For server-to-server project automation without a user consent flow, use the Spectrum API with project credentials and keep them server-side.

Official source: <https://photon.codes/docs/api-reference/oauth>
