# Repository guidance

Run `make` to discover supported actions. Validate changes with `make check`.
Keep this repository independent of APM: do not add APM manifests, locks,
installed skills, or APM installation steps. Rules for consumer APM dependencies
are configuration only and do not create a package dependency.

Use Conventional Commits with a body explaining what changed and why, and
relevant Refs or Fixes footers. Obtain review before committing unless the user
explicitly requests a commit or repository creation and publication.

Keep credentials, runner repository selection, and organization schedules out
of the shared preset. Do not enable automatic merging without explicit approval.
