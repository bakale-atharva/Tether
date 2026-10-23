import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseSearchQuery } from '../convex/lib/search.ts';

test('search trims a submitted query and rejects blank input', () => {
  assert.deepEqual(parseSearchQuery('  coral sky  '), { kind: 'valid', query: 'coral sky' });
  assert.deepEqual(parseSearchQuery(' \n  '), { kind: 'empty' });
});

test('search accepts 100 Unicode characters and rejects 101', () => {
  assert.deepEqual(parseSearchQuery('🙂'.repeat(100)), { kind: 'valid', query: '🙂'.repeat(100) });
  assert.deepEqual(parseSearchQuery('🙂'.repeat(101)), { kind: 'too_long' });
});
