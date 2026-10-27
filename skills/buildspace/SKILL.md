---
name: buildspace
description: >
  BuildSpace release platform: reusable GitHub Actions workflows and blocks for automated releases,
  package publishing (npm, crates, Swift, GitHub Packages), image publishing (Kargo), AI-powered
  versioning, and multi-build staging/promotion pipelines.
  Use when users mention BuildSpace, release automation, reusable workflows, GitHub Actions CI/CD,
  package staging/promotion, image publishing, or publishing to npm/crates/Homebrew/Jamf/GitHub Packages.
  Keywords: buildspace, ci/cd, github actions, release automation, reusable workflows, npm, crates,
  homebrew, rust, typescript, go, swift, monorepo, dylib, macOS, pkg, jamf, skills, kargo,
  package-stage, package-promote, github packages, image publishing, trusted publishing.
license: MIT
metadata:
  author: photon-hq
  version: '1.10.0'
---

# BuildSpace

BuildSpace provides reusable GitHub Actions workflows and composite-action blocks for automated releases. For the full workflow and block reference (inputs, secrets, permissions, troubleshooting), see `skills/buildspace-ci-cd/SKILL.md`.

This document covers changes and capabilities introduced in **v1.10.0**.

## Breaking Changes

### Workflow rename: `npm-stage` / `npm-promote` to `package-stage` / `package-promote`

The `npm-stage` and `npm-promote` workflows have been renamed to `package-stage` and `package-promote`. This is a **breaking workflow name change**. Update all caller workflows:

```yaml
# Before (broken in v1.10.0+)
uses: photon-hq/buildspace/.github/workflows/npm-stage.yaml@v1
uses: photon-hq/buildspace/.github/workflows/npm-promote.yaml@v1

# After
uses: photon-hq/buildspace/.github/workflows/package-stage.yaml@v1
uses: photon-hq/buildspace/.github/workflows/package-promote.yaml@v1
```

## Package Staging and Promotion

`package-stage` and `package-promote` now support multiple package ecosystems beyond npm:

| Ecosystem | Details |
|---|---|
| npm (public) | Trusted publishing support (no `NPM_TOKEN` required for public packages) |
| npm (GitHub Packages) | Publishing to GitHub Packages with pre-install authentication |
| Rust crates (internal) | Internal Rust crate staging and promotion |
| Swift packages | Swift package staging and promotion |

Repositories that publish packages under the `<name>-vX.Y.Z` tag pattern are now supported.

## Multi-Build Release Pipelines

Release workflows can now **stage and promote multiple builds in a single run**, including service images approved by their release controller. This enables atomic releases across multiple artifacts.

## Image Publishing

Image publishing has been enhanced for security and reusability:

- **Kargo support**: shared immutable image publishing for Kargo-based deployments
- **Context inputs**: configurable build context for image workflows
- **Private dependencies**: read-only GitHub App tokens for accessing private dependencies during image builds (replaces broader-scoped tokens)
- **Post-attestation tagging**: images are tagged only after attestation succeeds, ensuring only attested images are referenceable
- **Commit-time labels**: every published image is labeled with its commit time

## AI Versioning Enhancements

AI-powered version computation can now derive the next version from:

- Merged PR metadata and labels (existing)
- **Actual code diffs** between the last release and HEAD (new in v1.10.0)

This reduces version-bump inaccuracy when commit messages don't fully describe the scope of changes.

## Runtime Changes

- **Node.js 24** is now the default runtime for npm publishing workflows (previously Node 20/22).
- Release notes generation runs with **isolated, read-only Codex state** for safer and more reproducible output.

## Swift Release Updates

Swift release workflows (`swift-release.yml`) now support:

- **Prerelease** versions and labels
- Additional inputs for prerelease configuration

## Dependency Validation Improvements

Production dependency checks are more robust:

- pnpm multi-document lockfiles
- Workspace peer dependencies
- Stable peer ranges
- Internal Rust crate resolution
- Toolchain importer pins
- Boot graph dependency validation
- Split lockfiles now require the application root importer, catching invalid dependency layouts earlier

## GitHub Packages

GitHub Packages is now a supported publishing target. Workflows handle authentication before `npm install` to ensure private GitHub Packages dependencies resolve correctly during builds.
