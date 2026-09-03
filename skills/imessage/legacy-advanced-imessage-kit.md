# Legacy Advanced iMessage Kit

This file exists only for projects already importing `@photon-ai/advanced-imessage-kit`. New projects must use Spectrum or `@photon-ai/advanced-imessage`.

## Detect legacy usage

Look for the legacy package import, the `SDK(...)` constructor, and configuration keys such as `serverUrl` and `apiKey`. Do not interpret similarly named current credentials as proof of legacy usage.

## Maintenance rule

Keep the existing integration stable. Do not opportunistically rewrite a production integration without explicit migration scope, a parity plan, and rollback coverage.

| Legacy concept | Current direction |
|---|---|
| Legacy package | `@photon-ai/advanced-imessage` |
| `SDK({ serverUrl, apiKey })` | `createClient({ address, token })` |
| Monolithic event/client surface | Current resource namespaces and typed streams |
| New multi-platform feature | Spectrum |

When migration is approved, inventory every method, event, identifier, retry behavior, and deployment dependency before editing code.

Official legacy source: <https://photon.codes/docs/legacy/imessage>
