---
name: buildspace-ci-cd
description: >
  Configure and troubleshoot BuildSpace reusable GitHub Actions workflows and blocks for automated releases.
  Covers Rust, TypeScript (single package and monorepo), Go, Swift package, macOS .pkg (binary and payload-only),
  dylib (Makefile), generic release, AI-based versioning/release notes, README freshness checks,
  skills documentation checks, labels, permissions, secrets, Homebrew tap updates, Jamf uploads,
  label-free staging and promotion, dry-run testing, and custom block composition.
  Use when users mention BuildSpace, release automation, reusable workflows, GitHub Actions CI/CD,
  or publishing to npm/crates/Homebrew/Jamf.
  Keywords: buildspace, ci/cd, github actions, release automation, reusable workflows, npm, crates,
  homebrew, rust, typescript, go, swift, monorepo, dylib, macOS, pkg, jamf, skills.
license: MIT
metadata:
  author: photon-hq
  version: '2.0.0'
---

# BuildSpace Release Workflows Skill

Use this skill to set up or debug BuildSpace-powered release automation in repositories that use reusable GitHub Actions workflows.

## What BuildSpace Provides

BuildSpace has two layers:

- **Workflows**: full release pipelines under `.github/workflows/*`.
- **Blocks**: reusable composite actions under `.github/blocks/*` for custom pipelines.

Default recommendation: use a prebuilt workflow unless the user explicitly needs custom behavior.

## Workflow Selection

Use stage/promote for supported packages and Swift products:

| Project type | Workflow pair | Trigger |
|---|---|---|
| Owner-scoped npm package on GitHub Packages | `package-stage.yml` + `package-promote.yml` | Push to main stages; dispatch from main and approval promote |
| Scoped or single unscoped public npmjs package | `package-stage.yml` + `package-promote.yml` | Push to main stages; dispatch from main and approval promote |
| Swift executable packaged as macOS `.pkg` | `swift-stage.yml` + `swift-promote.yml` | Push to main stages; dispatch from main and approval promote |
| SwiftPM library | `swift-stage.yml` + `swift-promote.yml`, both with `library: true` | Push to main stages; dispatch from main and approval promote |

Follow the [package guide](https://github.com/photon-hq/buildspace#package-stage-and-promote)
or [Swift guide](https://github.com/photon-hq/buildspace#swift-stage-and-promote)
for caller YAML, pack contracts, permissions, and approval settings. Neither pair uses release labels or requires an AI API key.

For npmjs, set `registry: https://registry.npmjs.org` and the exact `package` name in both calls. An unscoped input selects only that package and rejects extra packed names; scoped inputs keep their scope's pack set. Unscoped support requires a reviewed BuildSpace commit containing [#148](https://github.com/photon-hq/buildspace/pull/148); merge that dependency before using it in a caller. GitHub Packages keeps repository-owner-scoped names and uses the automatic `GITHUB_TOKEN`. Public npmjs stage/promote uses trusted publishing and provenance, with no `NPM_TOKEN`; configure the package's trusted publishers for both caller workflow files and their environments as described in the package guide.

The following release workflows remain for compatibility. Keep their gates until each caller has a supported replacement.
Package stage/promote does not replace standalone Rust/Go binaries, crates.io publishing, or independent monorepo versioning.
Swift stage/promote does not replace payload-only packages or Makefile dylibs. PR checks and previews run independently of release labels.

| Project type | Workflow file | Trigger |
|---|---|---|
| Rust binary/library | `rust-service-release.yaml` | PR label `release` or `release: true` |
| TypeScript/JavaScript single package | `typescript-service-release.yaml` | PR label `release` or `release: true` |
| TypeScript monorepo (multiple packages) | `typescript-monorepo-release.yaml` | PR label `release` or `prerelease`, or corresponding input |
| Go binary | `go-service-release.yaml` | PR label `release` or `release: true` |
| Swift macOS `.pkg` (with compiled binary) | `swift-release.yml` | PR label `release` or `prerelease`, or corresponding input |
| macOS `.pkg` without binary (payload/scripts only) | `pkg-release.yml` | PR label `release` |
| macOS `.pkg` PR build (payload/scripts only) | `pkg-release-pr.yml` | Every PR commit |
| Swift macOS `.pkg` PR build previews | `swift-pkg-pr.yml` | Every PR commit |
| macOS dylib release (Makefile) | `makefile-dylib-release.yml` | PR label `release` |
| Generic release (version + GitHub Release only) | `release.yaml` | PR label `release` or `release: true` |
| README freshness check on PRs | `check-readme.yaml` | Every PR |
| Skills documentation freshness check on PRs | `check-skills.yaml` | Every PR |

## Required Inputs, Secrets, and Permissions

Always verify these before writing YAML:

1. **Inputs**: service/package names, paths, build command, package lists, Homebrew tap info, Jamf config.
2. **Secrets**:
   - Always required for AI features: `OPENAI_API_KEY`
   - Legacy token-based npm publishing: `NPM_TOKEN`; single-package TypeScript can opt into `use-oidc: true`, and modern npmjs staging/promotion uses trusted publishing
   - crates publishing: `CARGO_REGISTRY_TOKEN`
   - Swift compile-time env vars: `SECRET_ENV_VARS`
   - Jamf upload: `JAMF_CLIENT_ID` + `JAMF_CLIENT_SECRET`
   - Protected-branch pushes or Homebrew tap updates: `APP_ID` + `APP_PRIVATE_KEY`
   - Skills documentation check (private repos): `SKILLS_REPO_TOKEN`
   - Note: `DEVELOPER_ID_INSTALLER_NAME` is **deprecated and ignored** — packages are always unsigned.
3. **Permissions**:
   - Release/version bump jobs need `contents: write`
   - Label checks need `pull-requests: read`
   - PR commenting needs `pull-requests: write`
   - Public npmjs stage/promote callers need `id-token: write` on both calls
   - GitHub Packages publication needs `packages: write`; follow the chosen workflow's read permissions for verification

## Release Trigger Rules (Important)

### Stage and promote

Merge to main to stage a build without a release label. Promotion verifies the stored candidate and publishes it without rebuilding.
Use the default production environment approval path. The first publishing staging run creates `staging`; environment setup is not a prerequisite for merging the caller. Before the first production promotion, follow the [environment setup instructions on BuildSpace main](https://github.com/photon-hq/buildspace/blob/main/README.md#package-stage-and-promote). With `gh`, `jq`, and a repository administrator's `gh auth login`, run this once per repository:

```bash
script=$(gh api -H 'Accept: application/vnd.github.raw+json' 'repos/photon-hq/buildspace/contents/scripts/setup-release-environments.sh?ref=main') && bash -s -- photon-hq/your-repo <<<"$script"
```

To pin an exact reviewed version, replace `main` with a commit SHA.

Insert `--dry-run` before `photon-hq/your-repo` to preview API writes. The script configures main-only `staging` and `production`, with one to six required production reviewers from CODEOWNERS; append `@username @org/team` to select reviewers explicitly. Private repositories need [GitHub Enterprise for required reviewers](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/review-deployments). A modern stage workflow's `dry-run: true` verifies and packs without publishing.

### Legacy direct release

- Single-package TypeScript, Rust, Go, and generic release require `release` or `release: true`.
- Monorepo and Swift also accept `prerelease` or `prerelease: true` as an entry gate.
- Single-package TypeScript, Rust, and Go use prerelease only as a mode once release is authorized.
- Payload-only packages and Makefile dylibs require the `release` label; they expose no boolean override.
- `release: true` does not bypass a failed checker or override prerelease mode.
- Wrappers use fixed label lists. They no longer accept `labels-to-check`; GitHub rejects callers that still pass it.

Legacy `dry-run` is not a pipeline-wide write prohibition. Version commits, GitHub Releases, and configured Rust Homebrew updates can still write.
`no-npm-publish` disables npmjs publication, not version commits or GitHub Releases.

### Label retirement

Remove obsolete release labels from migration PRs only after queued or active legacy publishing runs that could read them have finished and independent automation no longer needs them. Delete repository label definitions only after default-branch cutover, completed legacy runs, and verification of independent automation.
Disable or update external producers that would recreate a retired label before deleting its definition. Label deletion does not require production promotion.
Retain legacy secrets separately while active consumers or a documented rollback need them. Keep shared compatibility workflows until their callers migrate.
A pinned legacy wrapper can still reference `check-pr-label@main` and other mutable blocks; inspect those transitive references before retiring shared code.
Git tags, GitHub prerelease properties, and registry `staging`/`latest` tags are not obsolete PR labels.

## Implementation Procedure

When asked to set up BuildSpace in a repo:

1. Detect repo type (Rust, TS single, TS monorepo, Go, Swift, macOS pkg, dylib).
2. Confirm publish targets (GitHub only, npm, crates, Jamf, Homebrew tap).
3. Read the chosen workflow at a reviewed commit of main, then pin that SHA in each caller.
4. Wire `with:` inputs and `secrets:` exactly for that workflow.
5. Add recommended permissions block.
6. Validate modern staging with `dry-run: true`. For legacy callers, inspect every write path first; do not treat their dry run as read-only.
7. Explain main staging and approved promotion for modern callers, or the exact label/input gate for a legacy caller.
8. For monorepos, validate `packages` JSON and dependency order behavior.
9. For Homebrew tap updates, wire `tap-repo` and `tap-formula` inputs plus `APP_ID`/`APP_PRIVATE_KEY` secrets.
10. For Jamf uploads, wire `jamf-url` and Jamf secrets.

## Workflow Reference

### rust-service-release.yaml

Complete release pipeline for Rust services: label check, AI version + release notes, cross-build (Linux x64, macOS ARM64, Windows x64), sync workspace crate versions, publish crates to crates.io, create GitHub Release with binaries, optionally update Homebrew tap.

**Inputs:**

| Input | Type | Required | Default | Description |
|---|---|---|---|---|
| `service-name` | string | Yes | — | Display name for the service |
| `binary-name` | string | Yes | — | Name of the binary from `Cargo.toml` |
| `binary-path` | string | No | `""` | Path to crate directory (e.g., `crates/client`) |
| `crates` | string | No | `[]` | JSON array of crate paths to publish in dependency order |
| `build-env` | string | No | `""` | Compile-time env vars (e.g., `BASE_URL=https://...`) |
| `prerelease` | boolean | No | `false` | Force prerelease (adds `-rc.N` suffix) |
| `release` | boolean | No | `false` | Request release; requires a successful checker |
| `dry-run` | boolean | No | `false` | Disable crate publication; version, release, and Homebrew writes can remain |
| `tap-repo` | string | No | `""` | Homebrew tap repository (e.g., `photon-hq/homebrew-photon`). Empty to skip. |
| `tap-formula` | string | No | `""` | Formula name in tap (e.g., `jamf-package-updater`). Required if `tap-repo` is set. |

**Secrets:**

| Secret | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | For AI-powered versioning and release notes |
| `CARGO_REGISTRY_TOKEN` | No | crates.io API token (required for publishing) |
| `APP_ID` | No | GitHub App ID (for protected branches and Homebrew tap updates) |
| `APP_PRIVATE_KEY` | No | GitHub App private key |

### typescript-service-release.yaml

Complete release pipeline for a single TypeScript/JavaScript package: label check, AI version + release notes, bump `package.json`, create GitHub Release, publish to npm.

**Inputs:**

| Input | Type | Required | Default | Description |
|---|---|---|---|---|
| `service-name` | string | Yes | — | Display name for the service |
| `bun-version` | string | No | `latest` | Bun version to use |
| `npm-tag` | string | No | `latest` | npm dist-tag (e.g., `latest`, `beta`, `next`) |
| `no-npm-publish` | boolean | No | `false` | Disable npmjs publishing; GitHub Releases and opted-in GitHub Packages publishing remain |
| `publish-github-packages` | boolean | No | `false` | Also publish to GitHub Packages; needs an owner-scoped package name and caller `packages: write` |
| `use-oidc` | boolean | No | `false` | Prefer npm trusted publishing with caller `id-token: write`; token fallback can be needed if OIDC is unavailable or fails |
| `working-directory` | string | No | `.` | Directory containing `package.json` |
| `build-command` | string | No | `bun run build` | Build command to run |
| `prerelease` | boolean | No | `false` | Force prerelease |
| `release` | boolean | No | `false` | Request release; requires a successful checker |
| `dry-run` | boolean | No | `false` | Disable registry publication; version and release writes can remain |

**Secrets:**

| Secret | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | For AI-powered versioning and release notes |
| `NPM_TOKEN` | No | Token-based npm publication or fallback; not needed when OIDC succeeds |

### typescript-monorepo-release.yaml

Complete release pipeline for TypeScript monorepos with independently-versioned packages. Detects changed packages, topologically sorts by dependency order, single AI call for all versions/notes, bumps each `package.json`, creates GitHub Release with `release/YYYY-MM-DD.N` tag, publishes to npm in order.

**Inputs:**

| Input | Type | Required | Default | Description |
|---|---|---|---|---|
| `service-name` | string | Yes | — | Display name for the monorepo |
| `packages` | string | Yes | — | JSON array: `[{"name":"pkg","path":"packages/pkg"}]` |
| `bun-version` | string | No | `latest` | Bun version to use |
| `npm-tag` | string | No | `latest` | npm dist-tag |
| `publish-github-packages` | boolean | No | `false` | Also publish changed packages to GitHub Packages; needs owner-scoped package names and caller `packages: write` |
| `build-command` | string | No | `bun run build` | Per-package build command (ignored if `root-build-command` is set) |
| `root-build-command` | string | No | `""` | Build once at repo root (e.g., `turbo build`) |
| `include-dependents` | boolean | No | `false` | Also release downstream dependents |
| `prerelease` | boolean | No | `false` | Force prerelease |
| `release` | boolean | No | `false` | Force release |
| `dry-run` | boolean | No | `false` | Disable registry publication; version and release writes can remain |

**Secrets:**

| Secret | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | For AI-powered versioning and release notes |
| `NPM_TOKEN` | Yes | npm authentication token |
| `APP_ID` | No | GitHub App ID (for pushing to protected branches) |
| `APP_PRIVATE_KEY` | No | GitHub App private key |

### go-service-release.yaml

Complete release pipeline for Go binaries: label check, AI version + release notes, cross-compile for macOS (ARM64) and Linux (AMD64), create GitHub Release with binaries, optionally update Homebrew tap.

**Inputs:**

| Input | Type | Required | Default | Description |
|---|---|---|---|---|
| `service-name` | string | Yes | — | Display name for the service |
| `binary-name` | string | Yes | — | Output binary name |
| `go-version` | string | No | `stable` | Go version to use |
| `build-flags` | string | No | `""` | Additional `go build` flags |
| `ldflags` | string | No | `-s -w` | Linker flags |
| `prerelease` | boolean | No | `false` | Force prerelease |
| `release` | boolean | No | `false` | Force release |
| `tap-repo` | string | No | `""` | Homebrew tap repository. Empty to skip. |
| `tap-formula` | string | No | `""` | Formula name in tap. Required if `tap-repo` is set. |

**Secrets:**

| Secret | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | For AI-powered versioning and release notes |
| `APP_ID` | No | GitHub App ID (for Homebrew tap updates) |
| `APP_PRIVATE_KEY` | No | GitHub App private key |

### swift-release.yml

Complete release pipeline for macOS `.pkg` distribution with a compiled Swift binary: label check, AI version + release notes, Swift build, `.pkg` creation (unsigned), GitHub Release, optional Jamf upload.

**Inputs:**

| Input | Type | Required | Default | Description |
|---|---|---|---|---|
| `package-name` | string | Yes | — | Name of the Swift binary / package |
| `identifier` | string | Yes | — | Package identifier (e.g., `com.example.mytool`) |
| `scripts-path` | string | No | `""` | Path to scripts directory with preinstall/postinstall scripts |
| `payload-path` | string | No | `""` | Path to additional payload directory (mirrors install root) |
| `jamf-url` | string | No | `""` | Jamf Pro instance URL (leave empty to skip) |
| `jamf-package-priority` | string | No | `""` | Package priority in Jamf Pro |
| `jamf-package-name` | string | No | `""` | Package name to match in Jamf Pro |

**Secrets:**

| Secret | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | For AI-powered versioning and release notes |
| `SECRET_ENV_VARS` | No | Compile-time env vars written to `.env` |
| `JAMF_CLIENT_ID` | No | Jamf Pro API client ID |
| `JAMF_CLIENT_SECRET` | No | Jamf Pro API client secret |

### pkg-release.yml

Release pipeline for macOS `.pkg` that does **not** contain a compiled binary. Packages payload files and scripts into a `.pkg`, creates GitHub Release, optionally uploads to Jamf. Use instead of `swift-release` when packages only deliver configuration files, LaunchDaemons, scripts, or other non-binary payload.

**Inputs:**

| Input | Type | Required | Default | Description |
|---|---|---|---|---|
| `package-name` | string | Yes | — | Name of the package |
| `identifier` | string | Yes | — | Package identifier (e.g., `com.example.my-config`) |
| `scripts-path` | string | No | `""` | Path to scripts directory with preinstall/postinstall scripts |
| `payload-path` | string | No | `""` | Path to payload directory (mirrors install root) |
| `jamf-url` | string | No | `""` | Jamf Pro instance URL (leave empty to skip) |
| `jamf-package-priority` | string | No | `""` | Package priority in Jamf Pro |
| `jamf-package-name` | string | No | `""` | Package name to match in Jamf Pro |

**Secrets:**

| Secret | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | For AI-powered versioning and release notes |
| `JAMF_CLIENT_ID` | No | Jamf Pro API client ID |
| `JAMF_CLIENT_SECRET` | No | Jamf Pro API client secret |

### pkg-release-pr.yml

Builds a macOS `.pkg` (without a compiled binary) on every PR commit and reports status in the PR as a living comment. Same experience as `swift-pkg-pr` but for payload/scripts-only packages. Stale in-progress builds are automatically cancelled on new commits.

**Inputs:**

| Input | Type | Required | Default | Description |
|---|---|---|---|---|
| `package-name` | string | Yes | — | Name of the package |
| `identifier` | string | Yes | — | Package identifier (e.g., `com.example.my-config`) |
| `scripts-path` | string | No | `""` | Path to scripts directory with preinstall/postinstall scripts |
| `payload-path` | string | No | `""` | Path to payload directory (mirrors install root) |

### swift-pkg-pr.yml

Builds a macOS `.pkg` (with Swift binary) on every PR commit, posts/updates a single PR comment with build status, uploads artifact (7-day retention). Stale in-progress builds are automatically cancelled on new commits.

**Inputs:**

| Input | Type | Required | Default | Description |
|---|---|---|---|---|
| `package-name` | string | Yes | — | Name of the Swift binary / package |
| `identifier` | string | Yes | — | Package identifier (e.g., `com.example.mytool`) |
| `scripts-path` | string | No | `""` | Path to scripts directory with preinstall/postinstall scripts |

**Secrets:**

| Secret | Required | Description |
|---|---|---|
| `SECRET_ENV_VARS` | No | Compile-time env vars written to `.env` |

### makefile-dylib-release.yml

Release pipeline for macOS dynamic libraries built from a Makefile. Label check, AI version + release notes, `make release`, create GitHub Release with `.dylib` artifact.

**Inputs:**

| Input | Type | Required | Default | Description |
|---|---|---|---|---|
| `dylib-name` | string | Yes | — | Name of the output dylib (e.g., `imessage-helper`) |

**Secrets:**

| Secret | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | For AI-powered versioning and release notes |

### release.yaml

Generic release pipeline for projects that only need AI-powered versioning and a GitHub Release (no build step, no package publishing). Useful for configuration repos, documentation repos, or any project that just needs tagged releases.

**Inputs:**

| Input | Type | Required | Default | Description |
|---|---|---|---|---|
| `service-name` | string | Yes | — | Display name for the service |
| `release` | boolean | No | `false` | Request release; requires a successful checker |

**Secrets:**

| Secret | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | For AI-powered versioning and release notes |

### check-readme.yaml

Runs on every PR to check if `README.md` is up to date with the changes. Uses AI to analyze changed files against the README. Posts/removes PR comments automatically.

**Inputs:**

| Input | Type | Required | Default | Description |
|---|---|---|---|---|
| `blocking` | boolean | No | `false` | If `true`, fail the workflow when README is outdated. If `false`, only post a warning comment. |

**Secrets:**

| Secret | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | For AI-powered README analysis |

### check-skills.yaml

Runs on every PR to check if skills documentation (in a separate skills repo) is up to date with the changes. Uses AI to analyze changed files against skill SKILL.md files. Posts/removes PR comments automatically.

**Inputs:**

| Input | Type | Required | Default | Description |
|---|---|---|---|---|
| `fail_on_missing_skills` | boolean | No | `false` | If `true`, fail workflow when skills are outdated. If `false`, only post a warning comment. |
| `skills-repo` | string | No | `photon-hq/skills` | Skills repository to check against (`owner/repo` format) |

**Secrets:**

| Secret | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | For AI-powered skills analysis |
| `SKILLS_REPO_TOKEN` | No | GitHub token for skills repo (defaults to `GITHUB_TOKEN`; use PAT for private repos) |

## Monorepo-Specific Guidance

For `typescript-monorepo-release`:

- `packages` input must be a JSON array:
  `[{"name":"pkg","path":"packages/pkg"}]`
- Changed package detection is diffed from last release tag.
- Packages are topologically sorted using local dependency edges.
- Optional `include-dependents: true` pulls downstream packages into release.
- `root-build-command` takes precedence over per-package `build-command`.
- Pre-release npm tag is automatically `beta` when prerelease is active.
- Uses `release/YYYY-MM-DD.N` date-based tags since there's no single version.

## Rust/Go Notes

- Rust workflow can:
  - cross-build artifacts for Linux x64, macOS ARM64, Windows x64
  - sync workspace versions across all crates
  - publish crates in provided order
  - optionally update Homebrew tap (`tap-repo` + `tap-formula`, requires `APP_ID` + `APP_PRIVATE_KEY`)
- Go workflow:
  - cross-builds for macOS ARM64 and Linux AMD64
  - can also update Homebrew tap (`tap-repo` + `tap-formula`, requires `APP_ID` + `APP_PRIVATE_KEY`)

## Swift / macOS .pkg Notes

- `swift-release` builds the Swift binary, creates an unsigned `.pkg`, creates GitHub Release, and optionally uploads to Jamf.
- `pkg-release` is for `.pkg` packages that contain **no compiled binary** — only payload files and/or scripts.
- `swift-pkg-pr` and `pkg-release-pr` are the PR preview counterparts (build on every commit, comment on PR).
- Packages are **always unsigned** (`DEVELOPER_ID_INSTALLER_NAME` is deprecated and ignored).
- Compile-time env vars are passed via `SECRET_ENV_VARS` secret (written to `.env`).
- Jamf upload is optional — set `jamf-url` input and provide `JAMF_CLIENT_ID` + `JAMF_CLIENT_SECRET` secrets.

## Dylib Notes

- `makefile-dylib-release.yml` is for projects using a Makefile. Runs `make release` and embeds version.
- It creates a GitHub Release with the `.dylib` as an artifact. Xcode dylibs have no current reusable release workflow; review their caller's composition separately.

## README Check Guidance

Use `check-readme.yaml` for PR docs drift detection:

- `blocking: false` (default): warning comment only.
- `blocking: true`: fails job when README appears stale.
- Requires `OPENAI_API_KEY` and PR write permission for comments.

## Skills Check Guidance

Use `check-skills.yaml` for skills documentation drift detection:

- `fail_on_missing_skills: false` (default): warning comment only.
- `fail_on_missing_skills: true`: fails job when skills appear outdated.
- Requires `OPENAI_API_KEY` and PR write permission for comments.
- For private skills repos, provide `SKILLS_REPO_TOKEN` (PAT with repo access).

## Blocks Reference

All blocks live under `.github/blocks/`. Workflows compose these internally — use them directly only for custom pipelines.

### Version & Release Info

| Block | Path | Purpose |
|---|---|---|
| `determine-publish-version` | `.github/blocks/determine-publish-version/action.yaml` | AI-powered next semantic version (standalone, no release notes) |
| `generate-release-info` | `.github/blocks/generate-release-info/action.yaml` | AI-powered version + release notes in one step |
| `create-github-release` | `.github/blocks/create-github-release/action.yaml` | Create GitHub Release with optional artifact attachments |

### Label & PR Interaction

| Block | Path | Purpose |
|---|---|---|
| `check-pr-label` | `.github/blocks/check-pr-label/action.yaml` | Inspect configured PR labels; the caller decides policy |
| `comment-on-pr` | `.github/blocks/comment-on-pr/action.yaml` | Post or update a single PR comment (idempotent via `comment-key`) |
| `check-readme` | `.github/blocks/check-readme/action.yaml` | AI-powered README freshness check |
| `check-skills` | `.github/blocks/check-skills/action.yaml` | AI-powered skills documentation freshness check |

`check-pr-label` accepts only `labels`, a JSON array of arbitrary nonempty names. It returns a JSON string in `outputs.labels` mapping lowercase label names to booleans.
It no longer accepts `default-on-push`. A push or manual run with no matching merged PR returns false for every requested label.
An owning PR with none of the requested labels returns the same result. API errors and ambiguous merged-PR association fail without a label output.
It lowercases names but does not alias `pre release` or `pre-release` to `prerelease`.

### Build Blocks

| Block | Path | Purpose |
|---|---|---|
| `rust-build` | `.github/blocks/rust-build/action.yaml` | Build Rust binary for a target triple |
| `go-build` | `.github/blocks/go-build/action.yaml` | Build Go binary for a target OS/arch |
| `typescript-build` | `.github/blocks/typescript-build/action.yaml` | Build TypeScript project using Bun |
| `swift-build` | `.github/blocks/swift-build/action.yml` | Build Swift binary (SPM, supports `.env` injection) |
| `swift-pkg` | `.github/blocks/swift-pkg/action.yml` | Create macOS `.pkg` from binary and/or payload/scripts |
| `build-makefile-dylib` | `.github/blocks/build-makefile-dylib/action.yml` | Build macOS dylib from Makefile |

### Publish Blocks

| Block | Path | Purpose |
|---|---|---|
| `publish-npm` | `.github/blocks/publish-npm/action.yaml` | Publish single package to npm |
| `publish-npm-packages` | `.github/blocks/publish-npm-packages/action.yaml` | Publish multiple monorepo packages to npm in dependency order |
| `publish-crates` | `.github/blocks/publish-crates/action.yaml` | Publish workspace crates to crates.io in order |
| `bump-npm-version` | `.github/blocks/bump-npm-version/action.yaml` | Bump version in `package.json` and push |
| `bump-monorepo-versions` | `.github/blocks/bump-monorepo-versions/action.yaml` | AI version bump for all changed monorepo packages |
| `sync-crates-version` | `.github/blocks/sync-crates-version/action.yaml` | Set a single version across all Rust workspace crates |
| `update-tap` | `.github/blocks/update-tap/action.yaml` | Update Homebrew tap formula (auto-calculates SHA256 for npm/Go/prebuilt) |
| `detect-changed-packages` | `.github/blocks/detect-changed-packages/action.yaml` | Detect changed monorepo packages and return in topological order |

## Troubleshooting Checklist

If release did not run:

- For modern staging, confirm the main-branch run and its candidate, manifest, and provenance. Labels do not authorize it.
- For promotion, confirm candidate verification, production dependency checks, and required reviewer approval.
- For a legacy caller, confirm its exact label/input gate and that the checker succeeded.
- Check that workflow permissions include required scopes.
- Verify secrets exist at repository level.
- Confirm the caller points to the correct reusable workflow path.
- For monorepos, confirm `packages` JSON is valid and paths exist.
- For modern build failures, use staging dry-run validation. Check registry permissions or trusted publishing for publication failures; dry runs do not test live publishing.
- For Homebrew tap updates, confirm `APP_ID` + `APP_PRIVATE_KEY` secrets are set and the GitHub App has push access to the tap repo.
- For Jamf uploads, confirm `JAMF_CLIENT_ID` + `JAMF_CLIENT_SECRET` are set and `jamf-url` is a valid Jamf Pro URL.
- For Makefile dylib builds, confirm the Makefile exists and produces expected output; Xcode composition needs a separate review.

## Output Format for Agent Responses

When generating BuildSpace setup instructions, respond with:

1. **Chosen workflow** and why.
2. **Copy-ready YAML** for caller workflow.
3. **Secrets to add** (list exactly which ones and where to get them).
4. **How to trigger and verify**.
5. **First-run validation**: modern stage dry run, or an explicit write-risk assessment for legacy workflows.

Keep recommendations concrete and default to the smallest working setup.
