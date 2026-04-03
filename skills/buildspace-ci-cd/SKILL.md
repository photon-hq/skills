---
name: buildspace-ci-cd
description: >
  Configure and troubleshoot BuildSpace reusable GitHub Actions workflows and blocks for automated releases.
  Covers Rust, TypeScript (single package and monorepo), Go, Swift package, macOS .pkg (binary and payload-only),
  dylib (Xcode and Makefile), generic release, AI-based versioning/release notes, README freshness checks,
  skills documentation checks, labels, permissions, secrets, Homebrew tap updates, Jamf uploads,
  dry-run testing, and custom block composition.
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

Pick exactly one primary workflow based on project type:

| Project type | Workflow file | Trigger |
|---|---|---|
| Rust binary/library | `rust-service-release.yaml` | PR label `release` |
| TypeScript/JavaScript single package | `typescript-service-release.yaml` | PR label `release` |
| TypeScript monorepo (multiple packages) | `typescript-monorepo-release.yaml` | PR label `release` |
| Go binary | `go-service-release.yaml` | PR label `release` |
| Swift macOS `.pkg` (with compiled binary) | `swift-release.yml` | PR label `release` |
| macOS `.pkg` without binary (payload/scripts only) | `pkg-release.yml` | PR label `release` |
| macOS `.pkg` PR build (payload/scripts only) | `pkg-release-pr.yml` | Every PR commit |
| Swift macOS `.pkg` PR build previews | `swift-pkg-pr.yml` | Every PR commit |
| macOS dylib release (Xcode workspace) | `dylib-release.yml` | PR label `release` |
| macOS dylib release (Makefile) | `makefile-dylib-release.yml` | PR label `release` |
| Generic release (version + GitHub Release only) | `release.yaml` | PR label `release` |
| README freshness check on PRs | `check-readme.yaml` | Every PR |
| Skills documentation freshness check on PRs | `check-skills.yaml` | Every PR |

## Required Inputs, Secrets, and Permissions

Always verify these before writing YAML:

1. **Inputs**: service/package names, paths, build command, package lists, Homebrew tap info, Jamf config.
2. **Secrets**:
   - Always required for AI features: `OPENAI_API_KEY`
   - npm publishing: `NPM_TOKEN`
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

## Release Trigger Rules (Important)

BuildSpace is label-gated by default.

- Standard release label: `release`
- Optional prerelease label: `prerelease`
- No label usually means no release job.

Behavior nuance to keep accurate:

- `typescript-monorepo-release` supports prerelease path directly.
- `typescript-service-release`, `rust-service-release`, and `go-service-release` gate release jobs on `release` (or forced input), and treat prerelease as flavor once release is active.
- `swift-release`, `pkg-release`, `dylib-release`, and `makefile-dylib-release` check only `release`.
- `release.yaml` (generic) checks `release` label and supports a `release` boolean input to force.

## Implementation Procedure

When asked to set up BuildSpace in a repo:

1. Detect repo type (Rust, TS single, TS monorepo, Go, Swift, macOS pkg, dylib).
2. Confirm publish targets (GitHub only, npm, crates, Jamf, Homebrew tap).
3. Create a caller workflow in the user repo (`.github/workflows/release.yaml` or `ci.yaml`) with `uses: photon-hq/buildspace/...@v1`.
4. Wire `with:` inputs and `secrets:` exactly for that workflow.
5. Add recommended permissions block.
6. Add `dry-run: true` for first validation run unless the user requests immediate publish.
7. Explain how to trigger (`release` label + merge path, or forced `release: true`).
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
| `labels-to-check` | string | No | `["release", "prerelease"]` | PR labels that trigger releases |
| `prerelease` | boolean | No | `false` | Force prerelease (adds `-rc.N` suffix) |
| `release` | boolean | No | `false` | Force release (bypasses label check) |
| `dry-run` | boolean | No | `false` | Test without actually publishing |
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
| `no-npm-publish` | boolean | No | `false` | Skip npm publishing (GitHub Release only) |
| `working-directory` | string | No | `.` | Directory containing `package.json` |
| `build-command` | string | No | `bun run build` | Build command to run |
| `labels-to-check` | string | No | `["release", "prerelease"]` | PR labels that trigger releases |
| `prerelease` | boolean | No | `false` | Force prerelease |
| `release` | boolean | No | `false` | Force release (bypasses label check) |
| `dry-run` | boolean | No | `false` | Test without actually publishing |

**Secrets:**

| Secret | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | For AI-powered versioning and release notes |
| `NPM_TOKEN` | No | npm auth token (required for publishing) |

### typescript-monorepo-release.yaml

Complete release pipeline for TypeScript monorepos with independently-versioned packages. Detects changed packages, topologically sorts by dependency order, single AI call for all versions/notes, bumps each `package.json`, creates GitHub Release with `release/YYYY-MM-DD.N` tag, publishes to npm in order.

**Inputs:**

| Input | Type | Required | Default | Description |
|---|---|---|---|---|
| `service-name` | string | Yes | — | Display name for the monorepo |
| `packages` | string | Yes | — | JSON array: `[{"name":"pkg","path":"packages/pkg"}]` |
| `bun-version` | string | No | `latest` | Bun version to use |
| `npm-tag` | string | No | `latest` | npm dist-tag |
| `build-command` | string | No | `bun run build` | Per-package build command (ignored if `root-build-command` is set) |
| `root-build-command` | string | No | `""` | Build once at repo root (e.g., `turbo build`) |
| `include-dependents` | boolean | No | `false` | Also release downstream dependents |
| `labels-to-check` | string | No | `["release", "prerelease"]` | PR labels that trigger releases |
| `prerelease` | boolean | No | `false` | Force prerelease |
| `release` | boolean | No | `false` | Force release |
| `dry-run` | boolean | No | `false` | Test without actually publishing |

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
| `labels-to-check` | string | No | `["release", "prerelease"]` | PR labels that trigger releases |
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

### dylib-release.yml

Release pipeline for macOS dynamic libraries built from an Xcode workspace with CocoaPods. Label check, AI version + release notes, install CocoaPods, build dylib (arm64e), create GitHub Release with `.dylib` artifact.

**Inputs:**

| Input | Type | Required | Default | Description |
|---|---|---|---|---|
| `workspace` | string | Yes | — | Path to `.xcworkspace` |
| `scheme` | string | Yes | — | Xcode scheme to build |
| `dylib-name` | string | Yes | — | Name of the output dylib (e.g., `BlueBubblesHelper`) |
| `project-directory` | string | Yes | — | Directory containing the Podfile |

**Secrets:**

| Secret | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | For AI-powered versioning and release notes |

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
| `labels-to-check` | string | No | `["release"]` | JSON array of PR labels to check |
| `release` | boolean | No | `false` | Force release (overrides label) |

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

- `dylib-release.yml` is for projects using an Xcode workspace with CocoaPods. Builds arm64e dylib.
- `makefile-dylib-release.yml` is for projects using a Makefile. Runs `make release` and embeds version.
- Both create a GitHub Release with the `.dylib` as an artifact.

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
| `check-pr-label` | `.github/blocks/check-pr-label/action.yaml` | Check PR labels to decide if release should trigger |
| `comment-on-pr` | `.github/blocks/comment-on-pr/action.yaml` | Post or update a single PR comment (idempotent via `comment-key`) |
| `check-readme` | `.github/blocks/check-readme/action.yaml` | AI-powered README freshness check |
| `check-skills` | `.github/blocks/check-skills/action.yaml` | AI-powered skills documentation freshness check |

### Build Blocks

| Block | Path | Purpose |
|---|---|---|
| `rust-build` | `.github/blocks/rust-build/action.yaml` | Build Rust binary for a target triple |
| `go-build` | `.github/blocks/go-build/action.yaml` | Build Go binary for a target OS/arch |
| `typescript-build` | `.github/blocks/typescript-build/action.yaml` | Build TypeScript project using Bun |
| `swift-build` | `.github/blocks/swift-build/action.yml` | Build Swift binary (SPM, supports `.env` injection) |
| `swift-pkg` | `.github/blocks/swift-pkg/action.yml` | Create macOS `.pkg` from binary and/or payload/scripts |
| `build-dylib` | `.github/blocks/build-dylib/action.yml` | Build macOS dylib from Xcode workspace (arm64e) |
| `build-makefile-dylib` | `.github/blocks/build-makefile-dylib/action.yml` | Build macOS dylib from Makefile |
| `install-cocoapods` | `.github/blocks/install-cocoapods/action.yml` | Cache and install CocoaPods dependencies |

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

- Confirm PR had expected label before merge.
- Confirm workflow permissions include required scopes.
- Confirm secrets exist at repository level.
- Confirm caller workflow points to correct reusable workflow path.
- For monorepos, confirm `packages` JSON is valid and paths exist.
- For publish failures, test with `dry-run: true` and verify auth token scopes.
- For Homebrew tap updates, confirm `APP_ID` + `APP_PRIVATE_KEY` secrets are set and the GitHub App has push access to the tap repo.
- For Jamf uploads, confirm `JAMF_CLIENT_ID` + `JAMF_CLIENT_SECRET` are set and `jamf-url` is a valid Jamf Pro URL.
- For dylib builds, confirm Xcode workspace/scheme or Makefile exists and produces expected output.

## Output Format for Agent Responses

When generating BuildSpace setup instructions, respond with:

1. **Chosen workflow** and why.
2. **Copy-ready YAML** for caller workflow.
3. **Secrets to add** (list exactly which ones and where to get them).
4. **How to trigger and verify**.
5. **First-run safe mode** (`dry-run`) recommendation.

Keep recommendations concrete and default to the smallest working setup.
