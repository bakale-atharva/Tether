import assert from 'node:assert/strict';
import { test } from 'node:test';
import { boundedContext, CONTEXT_BYTES_MAX } from '../convex/lib/agentContext.ts';

const message = (role, content) => ({ role, content });
test('long history keeps current prompt and newest complete exchanges within budget', () => {
  const recent = Array.from({ length: 50 }, (_, i) => [message('user', `${i}: ${'界'.repeat(2000)}`), message('assistant', 'reply'.repeat(500))]).flat();
  const prompt = [message('user', 'current question')];
  const result = boundedContext(recent, prompt);
  assert.deepEqual(result.at(-1), prompt[0]);
  assert.equal(result[0].role, 'user');
  assert.ok(result.some(m => m.content.startsWith('49:')));
  assert.ok(!result.some(m => m.content.startsWith('0:')));
  assert.ok(new TextEncoder().encode(JSON.stringify(result)).byteLength <= CONTEXT_BYTES_MAX);
});
test('oversized historical exchange is dropped intact and leading orphan responses are omitted', () => {
  const prompt = [message('user', '界'.repeat(8000))];
  assert.deepEqual(boundedContext([message('assistant', 'orphan'), message('user', 'x'.repeat(CONTEXT_BYTES_MAX)), message('assistant', 'old')], prompt), prompt);
});
test('short history keeps chronological order and complete exchange content', () => {
  const recent = [message('assistant', 'orphan'), message('user', 'question'), message('assistant', 'answer')];
  const prompt = [message('user', 'next')];
  assert.deepEqual(boundedContext(recent, prompt), [...recent.slice(1), ...prompt]);
});
