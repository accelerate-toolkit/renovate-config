# Shared delivery tooling and organization-wide adoption

Recorded: 2026-11-15. Status: public delivery-tooling repository created and initial
Renovate machinery pushed. The first source release, delivery-tooling v0.1.0, is
published and verified; consumer migration remains pending.
The owner selected one `accelerate-toolkit/delivery-tooling` repository for
Renovate and release automation. This plan hands investigation and implementation
to a session with access to the wider repository estate. Exact interfaces,
migration order and repository coverage must be confirmed there.

The [delivery-tooling repository](https://github.com/accelerate-toolkit/delivery-tooling)
is public. Current execution tracking is maintained in its
[delivery-tooling WIP](https://github.com/accelerate-toolkit/delivery-tooling/blob/main/docs/wip/delivery-tooling/README.md).
The [first source-release evidence](https://github.com/accelerate-toolkit/delivery-tooling/blob/main/docs/evidence/first-source-release/README.md)
records v0.1.0. Application pilots and consumer migration remain pending. This
plan retains the broader agreed requirements; use the WIP for current execution status.

## Renovate execution decision update — 2026-11-16

[ADR 0001](../decisions/0001-hosted-renovate-managed-merging.md) selects the
Mend-hosted app with Renovate-managed merging for the current rollout. Monday's
creation window and subsequent hosted merge runs are separate; see the
[execution design](../design/dependency-updates.md). Hosted adoption does not
require adopting the reusable Actions runner. That runner remains an available
alternative, not a prerequisite for the hosted pilots. The later [grouping decision](../decisions/0002-internal-and-external-update-groups.md)
keeps grouping policy in renovate-config, with delivery-tooling delegating to it.
This supersedes the proposed preset-ownership move below. Release-tooling adoption
remains separate pending work.

This update qualifies the runner-adoption steps below; it does not replace the
broader release requirements or claim completed consumer migration.

## Outcome

Give maintained repositories a consistent dependency-update and SemVer release
process, with reusable, versioned tooling and small consumer configurations.
An eligible reviewed change reaches the default branch, passes the required
checks, and produces a complete, immutable release automatically. Environment
deployment, promotion and product acceptance retain their own workflows.

Renovate and release automation live together because they form a connected
delivery process and share maintenance needs. They remain independently usable:
adopting the Renovate runner does not enable release publication, and release
publication does not run Renovate. Each job receives only its required permissions.

Consumers own their job graph and reuse shared machinery wherever practical.
Share the implementation of release rules and mechanics; let consumers express
how their software gets built and checked. A shared release workflow must not
become a mandatory wrapper around consumer pipelines.

Start with one SemVer stream for delivery-tooling. Additional consumer streams
are supported where independently versioned interfaces already require them.
Do not force existing specification, contract and application versions together.

## Proposed homes and ownership

Create the new repository and preserve `accelerate-toolkit/renovate-config` as
the compatibility entry point during migration. Do not assume a repository rename
and GitHub redirects preserve preset resolution or reusable-workflow references.
Confirm the new repository name is available and its intended visibility before
creation. Shared source and examples must be generic and suitable for publication.

```text
accelerate-toolkit/delivery-tooling/
  default.json                       # Public Renovate preset entry point
  renovate/
    presets/                         # Add specialised presets only when needed
    runner/                          # Runner/tool installation support
  release/
    versioning/                      # Version selection and release notes
    publication/                     # Drafts, tags, manifests, uploads, recovery
  actions/
    release-plan/                    # Composite action over shared planning CLI
    release-verify/                  # Composite action over artifact verification
    release-publish/                 # Composite action over shared publication CLI
  schemas/
    release.schema.json              # Proposed consumer configuration contract
  .github/workflows/
    renovate.yml                     # Reusable workflow_call entry point
    # Optional reusable workflows for self-contained release jobs
    check.yml                        # Tooling's own checks
  tests/
  examples/
    source-only/
    application/
  docs/
  Makefile
```

The tree is a proposed responsibility map, not a prescribed language/framework
or an implemented API. Review existing working release implementations before
choosing a library or extracting reusable code.

| Owner | Responsibility |
| --- | --- |
| Delivery tooling | Shared presets, runner/tool versions, version calculation, notes, artifact verification, publication and recovery. |
| Organization | Repository inventory, bot installation/token scope, organization overrides, scheduling policy and adoption tracking. |
| Consumer | Compatibility boundary, release streams, job graph, build/check/package commands, matrices, runner selection, artifact contents and supported platforms. |
| Agent context | Explain the standard and onboarding process; refer to the executable tooling and its released versions. |
| Product/deployment owner | Pin component releases, configure environments, deploy, assess acceptance and promote. |

Consumers adopt a preset reference and compose shared release machinery into
their own workflows. Build commands, job dependencies, matrices and runner selection
stay in those workflows. Release configuration describes streams, compatibility
rules and expected artifacts; it must not become a second workflow language.
Use documented Make actions where applicable.

Expose shared machinery through CLI commands, including a local, non-publishing
release preview, and composite actions for workflow integration. Reusable workflows
remain an option for self-contained jobs. The typical consumer-owned sequence is:

1. **Plan:** use shared tooling to decide whether a release is needed and calculate
   its version and release notes.
2. **Build and verify:** run consumer-owned checks and packaging jobs, reusing shared
   actions where useful, then verify the expected artifact set.
3. **Publish:** use shared tooling to publish the complete release or safely resume
   interrupted publication.

Pass an explicit release plan between jobs, binding the selected stream, version
and source commit to the resulting artifact manifest. Define and validate this
contract so publication can reject mismatched source, versions or artifacts.

Keep this preset repository independent of APM. Shared tooling must not require
APM merely to run Renovate or publish software. A Renovate runner can optionally
provision pinned APM tooling when a consumer needs it for dependency updates.

## Starting evidence and limitations

Inspection on 2026-11-15 found:

- This repository at `c234300c96b21690a7b26e3a2629bef976f101e7` supplies a preset and
  validation workflow, but no reusable Renovate runner or published releases.
  Its README currently treats versioned releases as optional.
- The public [agent-context release policy](https://github.com/accelerate-toolkit/agent-context/blob/cb3779e390ab859ad74b5ec0109dcce92f151ed4/packages/org-meta-bundle/.apm/instructions/releases.instructions.md)
  already calls for Conventional Commits, automatic SemVer releases after checks,
  immutable tags, recoverable publication and local previews. Its released
  source-package workflow is a useful implementation reference.
- A partial consumer inspection found divergent adoption: tag-triggered releases
  without automatic version selection, automatically created drafts waiting for
  manual publication, duplicated Renovate runners, local configuration exceptions,
  and a runner still targeting a repository's earlier name. Some application
  packaging does not yet deliver all artifacts required by its own design.

These are investigation leads, not an estate-wide audit. Keep private repository
names, findings, account settings and rollout records in the owning private
organization/repositories. Do not copy private implementation or operational data
into public tooling or this plan. Existing working pipelines are references to
assess, not evidence that all shared requirements are already met.

## Investigation in the broader-access session

1. Discover the actual organizations and repositories in scope with the owner’s
   available connections. Access alone does not put an unrelated repository in
   scope. Preserve local edits and read each repository's instructions.
2. Record each repository's purpose, active/archival status, default branch,
   visibility, compatibility boundary, release streams, current tags/releases,
   artifacts, release workflow and latest relevant check results.
3. Inspect Renovate presets, hosted installations and scheduled runners. Confirm
   actual target repositories, credential availability without exposing values,
   grouping/automerge rules, schedules and tools needed for enabled managers.
   Identify duplicate runners and repositories receiving no updates.
4. Compare existing release planners and publishers, including failure/retry
   behaviour. Assess a maintained off-the-shelf implementation before writing a
   new version engine. Reuse proven logic where its licence and interfaces allow.
5. Record conflicting instructions, publication approvals, branch/tag rules and
   Actions policies. Reconcile local opt-outs with the agreed organization-wide
   direction. Source release automation does not change infrastructure apply rules.
6. Classify every in-scope repository as adopting, already conforming, blocked or
   explicitly exempt. Historical archives may retain existing versions with an
   explained exemption; do not invent meaningless compatibility promises for them.

Complete this inventory before selecting pilot repositories and rollout batches.
Retain missing access and unverified settings explicitly; do not claim estate-wide
coverage from the repositories visible in the current workspace.

## Common release behaviour

- Define the supported interface against which each artifact's SemVer is measured.
  Applications, source modules, presets and contracts can have different interfaces.
- Follow the shared Conventional Commit rules: `feat` means minor, `fix`/`perf`
  means patch, and breaking changes mean major. The existing organization rule
  takes breaking changes during `0.x` to `1.0.0`; retain it unless deliberately
  revised. Define initial-release behaviour and preserve legacy tag namespaces.
- Review dependency-update commit classification. A runtime dependency update
  that changes a shipped deliverable must not silently miss a needed release
  because the bot labels every update `chore`; tooling-only updates need not
  automatically release every application.
- Bind checks, packaging, version metadata and publication to the exact source
  commit. Reconcile required checks and direct-default-branch paths explicitly.
- Build and verify the complete artifact set before publishing the release.
  Drafts can stage assets internally; normal operation must not strand releases
  waiting for a manual publish click or expose an incomplete published set.
- Publish source-only deliverables as immutable tagged source when appropriate.
  Applications ship their agreed runtime/module/frontend combination, checksums
  and provenance. A contract edition is not a runtime artifact version.
- Preserve existing tags and published bytes. Resume matching drafts and missing
  uploads safely, reject conflicting tags/assets, and handle concurrent runs.
  Do not silently repoint an existing draft's tag to newer source.
- Test the workflow invocation chain. Events produced using `GITHUB_TOKEN` do not
  generally trigger subsequent workflows; use an explicit supported call/job
  sequence rather than relying on a bot-created tag or release event.
- Keep build execution separate from publication privileges where practical.
  Support fork PR checks without publication credentials and explicit permissions
  for reusable workflows. Never put deployment credentials in this tooling.

## Renovate behaviour and compatibility

- Put generic update policy in shared presets; keep target repositories,
  credentials and organization schedules with the organization/caller.
- Preserve existing approved grouping and automerge behaviour during migration.
  Adoption does not itself authorize enabling automerge or ignoring failed checks.
- Support existing approved hosted or organization-wide runners as well as small
  repository callers. Select one active runner per intended target to avoid overlap.
- Pin tools and shared workflows to verified immutable releases. Ensure invoked
  helper code comes from the same tooling revision as the reusable workflow, not
  accidentally from the consumer checkout or a floating default branch.
- Verify preset-path syntax, inheritance and merge semantics with the actual
  Renovate version. Check dependency extraction across all used managers, including
  executable examples, private modules and optional APM inputs.
- Verify that Renovate can propose updates to the chosen workflow and preset pin
  formats. Add narrowly scoped extraction support only where native support is
  insufficient. A release tag being pinnable does not prove it will be updated.

## Implementation and rollout sequence

1. **Settle the interfaces from the inventory.** Document composable planning,
   verification and publication interfaces, including the release-plan contract
   passed between consumer-owned jobs. Document caller inputs, outputs,
   permissions, configuration schemas, release semantics and compatibility surface.
   Resolve how the shared repository bootstraps its first release and subsequently
   exercises its own tooling without depending on an unpublished version.
2. **Implement and verify delivery-tooling.** Provide an independently callable
   Renovate workflow and release CLI commands/composite actions, with optional
   reusable workflows for self-contained jobs. Include local previews, focused
   tests and generic examples of consumer-owned job graphs.
   Publish the first verified tooling version through the authorized release process.
   Never insert an imagined release version into consumer manifests.
3. **Pilot representative consumers.** Include a source-only deliverable and an
   application with multiple artifacts. Observe a real Renovate PR and a complete
   release from a reviewed eligible change. Fix existing failing checks before
   interpreting failed adoption as a shared-tooling defect or bypassing checks.
4. **Preserve the existing preset address.** First leave its current behaviour
   intact. Prepare and validate a compatibility preset referencing an exact released
   delivery-tooling preset; verify equivalent resolved configuration before switching.
   Remember existing unpinned consumers take changes on their next run. Preserve
   old tags and document migration/rollback before changing that entry point.
5. **Migrate in reviewed batches.** Replace duplicated workflows, adopt the common
   preset with necessary local exceptions, fix stale runner targets, and reconcile
   package/module delivery gaps in their owning repositories. Stop old runners only
   when the replacement is verified. Keep per-repository evidence and blockers.
6. **Update guidance and close coverage.** Publish agent-context guidance changes
   through its normal release process and update consumers through pinned versions.
   Record verified adoption or explicit disposition for every in-scope repository.
   Retire the compatibility entry point only through a later deliberate decision.

## Acceptance and retained evidence

Completion requires observed behaviour, not merely copied workflow files:

- Local preview and tests establish version selection, no-release cases, breaking
  changes, legacy streams, concurrency and interrupted-publication recovery.
- Required checks run against the released source; a failing check blocks release.
- A pilot produces a published release with all required artifacts and valid
  checksums/provenance, or its documented source-only equivalent.
- A consumer can fetch and verify the release using only its immutable references,
  without sibling checkouts or running development environments.
- Renovate extracts representative dependencies, opens the expected PR and follows
  the existing approved merge/check policy. A successful runner exit alone is
  insufficient evidence of dependency updates or correct target selection.
- Existing preset consumers still resolve correctly; the replacement runner does
  not duplicate jobs, and pin updates are demonstrably discoverable by Renovate.
- Rollback can restore a prior consumer tooling pin and known runner configuration
  without deleting or retagging published releases.
- The private rollout inventory accounts for every in-scope repository and records
  outstanding blockers/exemptions, release references and relevant workflow runs.

No infrastructure apply, product deployment or product acceptance is implied by
these checks. On implementation start, move execution tracking to a maintained WIP
home in delivery-tooling and link it here; preserve this plan until that handoff
exists. Keep one current execution tracker rather than divergent copies.

## Next session: start here

Read this repository's `AGENTS.md`, [README](../../README.md), preset and validation
workflow, then perform the broader inventory above. Confirm the repository creation
and visibility approach, choose the reusable implementation and pilots, and make
the organization-wide change through the applicable reviewed workflows. This
plan does not establish estate-wide adoption. The public repository and verified
v0.1.0 source release are published. No consumer migration or deployment has been
performed; current execution and evidence live in the linked delivery-tooling WIP.
