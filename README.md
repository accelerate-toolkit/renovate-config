# Renovate configuration

Shared Renovate defaults for Leverage Works and downstream organizations.
This is a standalone configuration repository: it has no dependency on APM or
agent-context, and validation requires only Make and Docker.

## Adopt

Add `renovate.json` to a consuming repository:

```json
{
  "extends": ["github>leverage-works/renovate-config"]
}
```

Renovate reads `default.json` from the default branch on each run. Changes here
apply on the next run; no config files are copied into consumers.

An organization can publish its own preset extending this one, then have its
projects extend that organization preset. Put organization schedules, timezone,
private module settings, and policy overrides there. Projects can add exceptions
in their own config. A Git tag can be appended to a preset reference when a
versioned rollout is required; only reference tags that have been published.

## Defaults

- Renovate's recommended baseline.
- Conventional Commit subjects, dependency labels, and a labelled dashboard.
- Up to five concurrent PRs; Renovate merges dependency PRs using squash.
  Existing status checks must pass. Repositories intentionally without checks
  explicitly set `ignoreTests: true` locally.
- Separate update groups for GitHub Actions, Go modules, Dockerfile images,
  Compose images, Terraform providers, PEP 723 helpers, and APM modules.
- Generated build output and installed agent context excluded from scanning.

No organization-specific update schedule is imposed. This includes major updates;
repository restrictions still apply. Infrastructure merging updates source only:
Terraform applies remain human-operated.

## APM consumers

The APM rule only groups dependencies discovered in consuming repositories.
It does not install or depend on APM in this repository.

Consumers must pin remote APM dependencies to explicit release refs such as
`owner/repository/package#v1.2.3`. Renovate skips entries without a ref. To update
an existing APM lockfile, the consumer's Renovate runner needs the APM CLI in its
execution environment. The shared preset cannot provision that tool.

## Running Renovate

A preset defines update policy; it does not schedule or run the bot. Each
organization supplies its own runner or hosted Renovate installation and
credentials scoped to its repositories. Runner configuration owns repository
selection, authentication, and tool installation. Do not commit credentials here.

This repo's `renovate.json` adopts the shared defaults and tracks the validator
image in the Makefile. A runner must onboard this repo before those updates run.

## Development

Run `make`, then `make check`. CI uses the same pinned Renovate validator image.
The validator checks config schema and migrations; consumer preset resolution
and authenticated update behavior should also be exercised in an org pilot.

Use Conventional Commits. Keep updates to `main` reviewed because unpinned
consumers pick them up automatically. Versioned releases, if introduced, use
Semantic Versioning and immutable tags.

## References

- [Shared presets](https://docs.renovatebot.com/config-presets/)
- [APM manager](https://docs.renovatebot.com/modules/manager/apm/)
- [Config validation](https://docs.renovatebot.com/config-validation/)

## Licence

[MIT](LICENCE).
