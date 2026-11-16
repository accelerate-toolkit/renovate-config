import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { applyPackageRules } from '/usr/local/renovate/dist/util/package-rules/index.js';
import { presetSources, resolveConfigPresets } from '/usr/local/renovate/dist/config/presets/index.js';

const root = fileURLToPath(new URL('../', import.meta.url));
// Resolve the exact local presets with Renovate, without fetching unpublished files.
presetSources.github.load = async () => ({ getPreset: async ({ repo, presetName = 'default' }) => {
  assert.equal(repo, 'accelerate-toolkit/renovate-config');
  return JSON.parse(fs.readFileSync(`${root}/${presetName}.json`));
}});
for (const [namespaces, internal] of [
  ['accelerate-toolkit', ['accelerate-toolkit/agent-context/packages/org-meta-bundle']],
  ['accelerate-toolkit|example-org', ['example-org/account', 'example-org/workspace', 'github.com/example-org/library',
    'ghcr.io/example-org/runtime', '@example-org/client', 'git::https://github.com/example-org/module.git']],
]) {
  const { config } = await resolveConfigPresets({ extends: [
    'github>accelerate-toolkit/renovate-config',
    `github>accelerate-toolkit/renovate-config:groups(${namespaces})`,
  ] });
  assert.equal(config.prConcurrentLimit, 2);
  for (const [expected, names] of [['internal', internal], ['external', ['actions/checkout', 'hashicorp/aws', 'renovate', 'example-org-other/account']]]) {
    for (const name of names) {
      for (const updateType of ['major', 'minor', 'patch', 'digest']) {
        const result = await applyPackageRules({ ...config, packageName: name, depName: name, updateType });
        assert.equal(result.groupSlug, `${expected}-dependencies`, `${name} ${updateType}`);
        assert.equal(result.separateMajorMinor, false);
        assert.equal(result.separateMinorPatch, false);
      }
    }
  }
  const result = await applyPackageRules({ ...config, packageName: 'toolkit-alias',
    sourceUrl: 'https://github.com/accelerate-toolkit/example' });
  assert.equal(result.groupSlug, 'internal-dependencies');
}
console.log('Grouping and parameterized preset resolution passed.');
