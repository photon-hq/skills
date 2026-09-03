<!-- openapi-tag: billing -->
# Spectrum API: billing

The current Spectrum API billing surface is read-only. Subscription purchase, upgrade, downgrade, cancellation, quantity changes, checkout, and portal access belong to the Photon Dashboard or CLI billing flow.

## Current endpoint inventory

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/projects/{projectId}/billing/status` | Read the project's current billing status. |
| `GET` | `/projects/{projectId}/billing/subscription` | Read the current subscription record exposed by Spectrum. |

Both endpoints require project Basic authentication. Treat returned customer, subscription, price, and status data as sensitive account information and avoid logging the complete response.

Do not invent `POST`, `PATCH`, or `DELETE` Spectrum billing routes from similarly named CLI commands. For an account-changing request, use `photon billing` or the documented Dashboard billing surface, show the exact tier and quantity, and obtain explicit confirmation immediately before execution.

Read-only requests can be retried with bounded backoff on `429` or transient `5xx` failures. Do not cache billing state longer than the product decision can tolerate.

Official OpenAPI: <https://spectrum.photon.codes/openapi/json>
