# ADR 0001: Hosted Renovate with Renovate-managed merging

Status: Accepted; this repository’s managed merge verified, broader rollout incomplete.
Date: 2026-11-16.

## Context

Weekly GitHub Actions runners couple update creation and merge opportunities to
one weekly execution. A PR whose checks finish after that execution can wait until
the following week. Long-lived bot tokens also add expiry and access maintenance.

The desired behavior is to create dependency updates during Monday's update
window, then automatically merge eligible PRs after CI passes, without waiting
until the next Monday. Some consumers use private repositories on GitHub Free;
upgrading the organization's plan is not part of this decision.

## Decision

Use the Mend-hosted Renovate GitHub App for migrated repositories, with one active
runner per repository. Use Renovate-managed squash merging:

```json
{
  "automerge": true,
  "automergeType": "pr",
  "automergeStrategy": "squash",
  "platformAutomerge": false,
  "ignoreTests": false
}
```

Keep update creation schedules local to consumers. Permit merging at any time
(the default `automergeSchedule`), including after Monday's creation window.
Renovate checks existing PRs on subsequent hosted runs and merges eligible ones.
It does not keep the initial job alive waiting for CI, and immediate merging when
CI turns green is not guaranteed. This delay is accepted.

## Alternatives considered

- Weekly self-hosted Actions: retainable during staged migration, but merging may
  wait until the next weekly execution and credentials remain operator-owned.
- GitHub platform auto-merge: reacts to satisfied merge requirements without
  waiting for another Renovate run, but private organization repositories require
  a paid GitHub plan. It does not meet the chosen consistent free-plan setup.
- Frequent self-hosted runs: reduce the delay but retain runner and credential
  maintenance. The hosted app is preferred for this rollout.

## Consequences and verification

Checks and merge restrictions still gate merging. Failed, conflicting or manually
edited updates may remain open for intervention. Existing tests may not be bypassed merely to clear the PR list. For repositories
with no CI, the owner explicitly approved `ignoreTests: true` on 2026-11-16;
no workflow is added solely to satisfy the bot. Track these exceptions locally.
The same decision approved both-organization rollout and retired hypothetical
private-Go validation as a prerequisite where current dependencies are public.

The shared presets already select Renovate-managed merging. This repository's
local automerge enablement is published and an actual bot-managed merge is
[verified](../evidence/hosted-renovate/README.md). Other consumers are not migrated simply by
publishing this decision. Existing private rollout details remain in their owning
repositories, not in this public repository.

See the [dependency update design](../design/dependency-updates.md) for scheduling,
runtime limits, migration checks and sources.
