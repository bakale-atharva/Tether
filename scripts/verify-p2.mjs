// Dependency-free unit checks. Intentionally no Vitest or E2E runner.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isVisibleInConversation, replyProblem } from '../convex/lib/content.ts';

test('replies require text and enforce the 280 code-point limit', () => {
  assert.ok(replyProblem(''));
  assert.ok(replyProblem('   \n '));
  assert.equal(replyProblem('hi'), null);
  assert.equal(replyProblem('x'.repeat(280)), null);
  assert.ok(replyProblem('x'.repeat(281)));
  assert.equal(replyProblem('🙂'.repeat(280)), null);
  assert.ok(replyProblem('🙂'.repeat(281)));
  assert.equal(replyProblem(`  ${'x'.repeat(280)}  `), null, 'surrounding whitespace is trimmed');
});

test('deleted messages stay as placeholders only while replies hang beneath them', () => {
  assert.equal(isVisibleInConversation({ deleted: false }), true);
  assert.equal(isVisibleInConversation({ deleted: false, childCount: 0 }), true);
  assert.equal(isVisibleInConversation({ deleted: true }), false);
  assert.equal(isVisibleInConversation({ deleted: true, childCount: 0 }), false);
  assert.equal(isVisibleInConversation({ deleted: true, childCount: 2 }), true);
});
