import assert from 'node:assert/strict';
import { test } from 'node:test';
import { promptProblem, titleProblem, isActive, canRetry, DEFAULT_MODEL, requestFailure, freeModel, FREE_PROVIDER } from '../convex/lib/agentPolicy.ts';

test('private prompts and conversation titles have bounded nonempty text', () => {
  assert.ok(promptProblem('   '));
  assert.ok(promptProblem('x'.repeat(8001)));
  assert.equal(promptProblem('Hello Tether'), null);
  assert.equal(promptProblem('x'.repeat(8000)), null);
  assert.ok(titleProblem(''));
  assert.ok(titleProblem('x'.repeat(81)));
  assert.equal(titleProblem('A private conversation'), null);
});
test('only the latest failed or canceled request can retry', () => {
  for (const status of ['queued', 'running', 'stopping']) {
    assert.equal(isActive(status), true);
    assert.equal(canRetry(status, true), false);
  }
  for (const status of ['failed', 'canceled']) {
    assert.equal(canRetry(status, true), true);
    assert.equal(canRetry(status, false), false);
    assert.equal(isActive(status), false);
  }
  assert.equal(canRetry('complete', true), false);
});
test('provider remains free-only and errors reveal no internal details', () => {
  assert.deepEqual(FREE_PROVIDER, {allow_fallbacks:false,max_price:{prompt:0,completion:0,request:0}});
  const failure = requestFailure(new Error('secret token and provider internals'));
  assert.equal(failure.code, 'PROVIDER_ERROR');
  assert.ok(!failure.message.includes('secret'));
});
test('server model configuration rejects paid models and routers', () => {
  assert.equal(freeModel(undefined), DEFAULT_MODEL);
  assert.equal(freeModel('vendor/model:free'), 'vendor/model:free');
  for (const model of ['openrouter/auto', 'vendor/model', 'vendor/model:free ', '']) {
    assert.throws(() => freeModel(model));
  }
});
