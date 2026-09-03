# Choosing an iMessage stack

Make the routing decision before writing code.

| Dimension | Spectrum | Current Advanced iMessage | Open-source iMessage Kit | Legacy compatibility |
|---|---|---|---|---|
| New project | Default | Only for missing low-level features | Local-only use cases | Never |
| Existing project | Use when already on Spectrum | Use when already current | Use when already local | Maintain without opportunistic migration |
| Infrastructure | Managed providers or custom providers | Direct client/server | One Mac | Existing legacy deployment |
| API shape | Unified multi-platform | Platform-specific TypeScript | Local macOS TypeScript | Obsolete constructor/API generation |
| Raw iMessage features | Narrow when exposed | Broadest direct access | Limited by local kit | Do not extend |
| HTTP inbound delivery | Pair with Spectrum Webhooks | Use SDK event streams unless documented otherwise | Local watcher | Keep existing architecture |
| REST management | Pair with Spectrum API | Not a replacement for management API | Not applicable | Not applicable |

Exact routing examples:

- “Build an iMessage and WhatsApp agent” → Spectrum.
- “Read raw Apple message metadata” → Current Advanced iMessage.
- “Automate my own Mac’s Messages app” → Open-source iMessage Kit.
- “Maintain a project importing the legacy Advanced iMessage package” → Legacy compatibility file.

Do not select a stack merely because an older repository already mentions it. Detect imports, runtime, deployment model, and required features first.
