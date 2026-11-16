# ADR 0002: Internal and external dependency groups

Status: Accepted; configuration implemented and locally verified.
Date: 2026-11-16.

## Context

Per-manager groups create multiple dependency PRs and repeat CI. A single group
reduces runs but makes component-release adoption wait for unrelated third-party
updates. The owner requested separate internal and external dependency groups.

## Decision

Maintain both groups in this repository's parameterized `groups.json` preset.
Group major, minor, patch and digest updates together within each boundary and
allow two concurrent normal PRs. Consumers identify trusted organization namespaces,
keep their schedules and checks, and remove competing grouping overrides.
The delivery-tooling preset delegates to this repository rather than copying policy.

## Consequences

Each batch shares CI results; one failing dependency blocks its group. Internal
and external batches can progress independently. Merging still happens on later
hosted runs and does not deploy infrastructure. Grouping reduces CI opportunities
but cannot guarantee a fixed number of runs: rebases, post-merge checks and special
update types remain. Existing consumer lockfile-maintenance settings are preserved;
Renovate does not merge that operation into ordinary dependency-update groups.

See the [design](../design/dependency-updates.md) and [adoption guide](../../README.md).
