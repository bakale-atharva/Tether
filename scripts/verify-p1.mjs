// Dependency-free unit checks. Intentionally no Vitest or E2E runner.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { postProblem, imageProblem, imageBytesMatch, bioProblem } from '../convex/lib/content.ts';

test('posts require content, accept image-only posts, and enforce Unicode character and image limits', () => {
  assert.ok(postProblem('  ', 0));
  assert.equal(postProblem('', 1), null);
  assert.equal(postProblem('x'.repeat(280), 0), null);
  assert.ok(postProblem('x'.repeat(281), 0));
  assert.equal(postProblem('🙂'.repeat(280), 0), null);
  assert.ok(postProblem('🙂'.repeat(281), 0));
  assert.ok(postProblem('hello', 5));
});

test('image validation rejects unsupported, empty, oversized, and spoofed files', () => {
  assert.equal(imageProblem('image/png', 5 * 1024 * 1024), null);
  assert.ok(imageProblem('image/png', 5 * 1024 * 1024 + 1));
  assert.ok(imageProblem('image/svg+xml', 100));
  assert.ok(imageProblem('image/png', 0));
  const png = new Uint8Array([137,80,78,71,13,10,26,10]);
  const ihdr = [0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 0, 0, 0, 0];
  const iend = [0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130];
  const completePng = new Uint8Array([...png, ...ihdr, ...iend]);
  assert.equal(imageBytesMatch('image/png', completePng), true);
  assert.equal(imageBytesMatch('image/jpeg', png), false);
  const completeWebp = new Uint8Array([82, 73, 70, 70, 22, 0, 0, 0, 87, 69, 66, 80, 86, 80, 56, 88, 10, 0, 0, 0, ...new Array(10).fill(0)]);
  assert.equal(imageBytesMatch('image/webp', completeWebp), true);
  assert.equal(imageBytesMatch('image/jpeg', new Uint8Array([255,216,255,224,255,217])), true);
  assert.equal(imageBytesMatch('image/jpeg', new Uint8Array([255,216,255,224])), false);
  assert.equal(imageBytesMatch('image/png', png), false);
  assert.equal(imageBytesMatch('image/webp', new TextEncoder().encode('RIFFabcdWEBP')), false);
  assert.equal(imageBytesMatch('image/png', new TextEncoder().encode('<script>')), false);
});

test('bios support 160 characters and reject larger input', () => {
  assert.equal(bioProblem('x'.repeat(160)), null);
  assert.ok(bioProblem('x'.repeat(161)));
});
