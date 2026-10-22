// Dependency-free unit checks. Intentionally no Vitest or E2E runner.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { nextToggledCount } from '../convex/lib/content.ts';
import { AGENT_HANDLE, handleProblem } from '../convex/lib/handles.ts';

test('follower counts move only when the follow state changes', () => {
  assert.equal(nextToggledCount(0, false, true), 1);
  assert.equal(nextToggledCount(3, true, false), 2);
  assert.equal(nextToggledCount(3, true, true), 3, 'following twice is a no-op');
  assert.equal(nextToggledCount(0, true, false), 0, 'never negative');
});

test('nobody can claim the agent handle, in any case', () => {
  assert.equal(handleProblem(AGENT_HANDLE), 'reserved');
  assert.equal(handleProblem('TeThEr'), 'reserved');
});
