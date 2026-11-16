# Hosted Renovate pilot evidence

Observed 2026-11-16.

## Renovate-managed merge verified

Configuration commit `9374d83139801a0dd01024e5056a21394d1fceb6` enabled
`automerge: true` and `platformAutomerge: false`. GitHub native auto-merge was
disabled; branch protection required the `config` check.

[PR #4](https://github.com/accelerate-toolkit/renovate-config/pull/4) updated
`actions/checkout` to v7. Its [config check](https://github.com/accelerate-toolkit/renovate-config/actions/runs/43859306166)
passed at 11:37:24 UTC. A manual request through the app-owned dependency dashboard
started a subsequent hosted run; no manual GitHub merge was performed.

GitHub records `renovate[bot]` as the merging actor at **11:53:29 UTC**, with merge
commit `8e0d41f21d374d3b456f8d86598727fbb3ea557d`. The
[Mend job](https://developer.mend.io/github/accelerate-toolkit/renovate-config/-/job/1fbc3176-f363-4ce2-884f-edf346537378)
finished with status DONE at 11:53:43 UTC.

This verifies bot-managed merging after passing CI, outside the Monday-before-06:00
creation window. Because the follow-up was manually requested, it does not measure
normal scheduler latency or prove a CI-completion webhook triggers execution.
The Mend job detail page did not expose usable duration/log data during inspection.
This small Actions update does not establish runtime margin for artifact-heavy
consumer updates. Other blocked dependency updates remain separate work.
