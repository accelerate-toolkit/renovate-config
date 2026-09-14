.DEFAULT_GOAL := help
RENOVATE_IMAGE := ghcr.io/renovatebot/renovate:44.90.2

.PHONY: help check
help: ## List available repository actions.
	@awk 'BEGIN { FS = ":.*##" } /^[[:alnum:]_.-]+:.*##/ { printf "  %-16s %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

check: ## Validate the shared preset and repository config with Renovate.
	docker run --rm -v "$(CURDIR):/work:ro" --entrypoint renovate-config-validator $(RENOVATE_IMAGE) --strict --no-global /work/default.json /work/renovate.json
