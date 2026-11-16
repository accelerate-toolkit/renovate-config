# Dependency update execution and merging

The accepted [ADR 0001](../decisions/0001-hosted-renovate-managed-merging.md)
selects hosted Renovate with Renovate-managed squash merging. The shared preset
supplies policy; app installation supplies execution and authentication. Switching
runners does not migrate consumers to the delivery-tooling preset or release APIs.

## Two separate schedules

| Control | Purpose | This repository |
| --- | --- | --- |
| `schedule` and `timezone` | Window for new dependency update branches | Before 06:00 Monday, Europe/London |
| Hosted job scheduler | When Renovate examines the repository and existing PRs | Managed by Mend throughout the week |
| `automergeSchedule` | When eligible PRs may be merged | Default: at any time |

Monday is an update creation window, not a promise that the bot executes at an
exact time and not a restriction on later merges. Existing branch maintenance can
also occur outside that window under Renovate's default `updateNotScheduled`.

The expected sequence is:

1. A hosted run within Monday's window creates an update PR.
2. GitHub Actions runs the repository's checks independently of the hosted job.
3. A subsequent hosted run observes passing checks and an up-to-date, mergeable
   branch, then squash-merges the PR using the app's permissions.
4. If a branch needs rebasing, Renovate updates it and waits for checks on the new
   commit before merging. Failures and manual-edit blocks require intervention.

“Next run” means a subsequent hosted execution, not next Monday. Mend's current
scheduler table lists active repositories every four hours on Community and
onboarded repositories with no Renovate PR merged as daily. Queuing and repository
status affect execution time; this is not a merge-time SLA. The same documentation
also has an older hourly value in its status table: use the scheduler table and
confirm observed timing in the portal rather than promising an exact interval.
Do not rely on an immediate CI-completion webhook to satisfy the merge policy.

Renovate generally merges at most one PR per target branch per run. Multiple PRs
may therefore need multiple runs. Repositories still using a weekly Actions
runner can wait until the next Monday; they do not gain hosted scheduling from a
preset change alone.

## Merge policy and checks

Use `automerge: true`, `automergeType: pr`, `automergeStrategy: squash` and
`platformAutomerge: false`. Keep `ignoreTests: false` for tested repositories.
The shared preset already provides the merge settings; local configuration may
make them explicit. GitHub's native Allow auto-merge setting is not required.
Where branch protection is available, retain required checks. This repository's
`config` check is required on `main`.

Update creation remains Monday-only here. No `automergeSchedule` override is
needed: its default permits merging at any time. Failed checks, conflicting or
outdated branches, missing permissions, required reviews and manual edits can
prevent a merge. Inspect the dependency dashboard and job logs instead of merging
past those failures.

## Runtime and rollout

The Community hosted job timeout is 30 minutes. Waiting for GitHub CI between
Renovate runs does not consume one continuously running hosted job. Each execution
still has its own limit, including extraction, dependency lookup and artifact
regeneration. Target less than 20 minutes on a real update run before expanding
rollout; a quick no-op scan does not establish this margin.

For each repository, verify app access, retire the duplicate scheduled runner,
observe extraction, a real update PR, passing CI and an actual automatic merge.
Record hosted runtime separately from GitHub CI duration. Preserve old bot branch
history before regenerating blocked updates. Closing old PRs and dashboards alone
does not establish that the app has taken ownership; check for blocked or ignored
updates afterward. Retire old secrets only after confirming no remaining users.

This repository has verified a hosted scan, app-created PR, passing CI and an
actual Renovate-managed merge outside its creation window. See the
[pilot evidence](../evidence/hosted-renovate/README.md). The follow-up run was manually
requested, so normal scheduler latency remains unmeasured. Artifact-heavy consumer
runtime verification remains separate. The shared preset remains at this address;
migration to delivery-tooling is a separate rollout.

## Sources

Checked 2026-11-16:

- [Mend hosted job scheduling](https://docs.renovatebot.com/mend-hosted/job-scheduling/)
- [Renovate automerge behavior](https://docs.renovatebot.com/key-concepts/automerge/)
- [Automerge schedule](https://docs.renovatebot.com/configuration-options/#automergeschedule)
- [Updates outside the creation schedule](https://docs.renovatebot.com/configuration-options/#updatenotscheduled)
- [Mend resource tiers](https://docs.mend.io/renovate/latest/mend-renovate-cloud-resource-tiers)
- [GitHub auto-merge availability](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/automatically-merging-a-pull-request)

## Rollout and Actions-minute policy

The owner approved app rollout across both organizations on 2026-11-16. Private
Go-module validation is no longer a rollout prerequisite where current manifests
have no private Go requirements. Reintroduce access verification only if a real
private dependency is added; do not expand app credentials for hypothetical needs.
Other private package managers still need their own access verification.

Use one hosted bot per repository and remove duplicate scheduled Actions runners.
Keep existing PR checks; do not dispatch additional CI merely to demonstrate
onboarding. New consumers group updates into one PR with concurrency one to avoid
unnecessary check runs. Preserve established grouping unless separately reviewed.
No CI workflow is added solely for Renovate. Repositories without CI explicitly
use the owner-approved `ignoreTests: true` policy; repositories with tests keep
waiting for them. Do not use repeated dashboard retries as a polling mechanism.

An administrative rollout commit may skip CI where repository policy permits it
and local targeted validation covers the change. Dependency-update PRs still run
their normal checks. Hosted scans and CI are separate: saving Actions minutes does
not remove hosted job timeouts. Local rollout preparation is not proof that app
access has been expanded or every repository has completed a scan.

## Validator maintenance

Both shared presets use the current `dependencyDashboard` object with `enabled`
and `labels` fields. Keep the pinned local validator compatible with this schema;
the former boolean and `dependencyDashboardLabels` settings require migration and
fail strict validation on newer Renovate releases. See the
[dashboard configuration](https://docs.renovatebot.com/configuration-options/#dependencydashboard).
This migration changes configuration shape, not dashboard or merge policy.
