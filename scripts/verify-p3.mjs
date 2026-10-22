// Dependency-free unit checks. Intentionally no Vitest or E2E runner.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { nextToggledCount } from '../convex/lib/content.ts';

test('like counts move only when the like state changes', () => {
  assert.equal(nextToggledCount(0, false, true), 1);
  assert.equal(nextToggledCount(1, true, false), 0);
  assert.equal(nextToggledCount(4, true, true), 4, 'liking twice is a no-op');
  assert.equal(nextToggledCount(4, false, false), 4, 'unliking a non-liked message is a no-op');
});

test('like counts never go negative', () => {
  assert.equal(nextToggledCount(0, true, false), 0);
});
