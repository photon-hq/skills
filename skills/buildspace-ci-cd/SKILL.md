---
name: buildspace-ci-cd
description: >
  Configure and troubleshoot BuildSpace reusable GitHub Actions workflows and blocks for automated releases.
  Covers Rust, TypeScript (single package and monorepo), Go, Swift package pipelines, AI-based versioning/release notes,
  README freshness checks, labels, permissions, secrets, dry-run testing, and custom block composition.
  Use when users mention BuildSpace, release automation, reusable workflows, GitHub Actions CI/CD, or publishing to npm/crates/Homebrew.
  Keywords: buildspace, ci/cd, github actions, release automation, reusable workflows, npm, crates, homebrew, rust, typescript, go, swift, monorepo.
license: MIT
metadata:
  author: photon-hq
  version: '1.0.0'
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

- Rust binary/library: `rust-service-release.yaml`
- TypeScript/JavaScript single package: `typescript-service-release.yaml`
- TypeScript monorepo: `typescript-monorepo-release.yaml`
- Go binary: `go-service-release.yaml`
- Swift `.pkg` release: `swift-release.yml`
- Swift PR preview `.pkg`: `swift-pkg-pr.yml`
- README freshness check on PRs: `check-readme.yaml`

## Required Inputs, Secrets, and Permissions

Always verify these before writing YAML:

1. **Inputs**: service/package names, paths, build command, package lists.
2. **Secrets**:
   - Always required for AI features: `OPENAI_API_KEY`
   - npm publishing: `NPM_TOKEN`
   - crates publishing: `CARGO_REGISTRY_TOKEN`
   - Swift signing: `DEVELOPER_ID_INSTALLER_NAME`
   - Protected-branch pushes (optional): `APP_ID` + `APP_PRIVATE_KEY`
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
- `swift-release` checks only `release`.

## Implementation Procedure

When asked to set up BuildSpace in a repo:

1. Detect repo type (Rust, TS single, TS monorepo, Go, Swift).
2. Confirm publish targets (GitHub only, npm, crates, Jamf, Homebrew tap).
3. Create a caller workflow in the user repo (`.github/workflows/release.yaml` or `ci.yaml`) with `uses: photon-hq/buildspace/...@v1`.
4. Wire `with:` inputs and `secrets:` exactly for that workflow.
5. Add recommended permissions block.
6. Add `dry-run: true` for first validation run unless the user requests immediate publish.
7. Explain how to trigger (`release` label + merge path, or forced `release: true`).
8. For monorepos, validate `packages` JSON and dependency order behavior.

## Monorepo-Specific Guidance

For `typescript-monorepo-release`:

- `packages` input must be a JSON array:
  `[{"name":"pkg","path":"packages/pkg"}]`
- Changed package detection is diffed from last release tag.
- Packages are topologically sorted using local dependency edges.
- Optional `include-dependents: true` pulls downstream packages into release.
- `root-build-command` takes precedence over per-package `build-command`.
- Pre-release npm tag is automatically `beta` when prerelease is active.

## Rust/Go/Swift Notes

- Rust workflow can:
  - cross-build artifacts for Linux/macOS/Windows
  - sync workspace versions
  - publish crates in provided order
  - optionally update Homebrew tap (`tap-repo` + `tap-formula`)
- Go workflow cross-builds artifacts and can also update Homebrew tap.
- Swift release builds/signed `.pkg`, creates GitHub Release, and can upload to Jamf when Jamf inputs/secrets are provided.
- Swift PR workflow posts/upserts a single PR comment and cancels stale in-progress builds for new commits.

## README Check Guidance

Use `check-readme.yaml` for PR docs drift detection:

- `blocking: false` (default): warning comment only.
- `blocking: true`: fails job when README appears stale.
- Requires `OPENAI_API_KEY` and PR write permission for comments.

## Troubleshooting Checklist

If release did not run:

- Confirm PR had expected label before merge.
- Confirm workflow permissions include required scopes.
- Confirm secrets exist at repository level.
- Confirm caller workflow points to correct reusable workflow path.
- For monorepos, confirm `packages` JSON is valid and paths exist.
- For publish failures, test with `dry-run: true` and verify auth token scopes.

## Output Format for Agent Responses

When generating BuildSpace setup instructions, respond with:

1. **Chosen workflow** and why.
2. **Copy-ready YAML** for caller workflow.
3. **Secrets to add**.
4. **How to trigger and verify**.
5. **First-run safe mode** (`dry-run`) recommendation.

Keep recommendations concrete and default to the smallest working setup.
