import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Trie } from '../src/index.js';

test('insert and complete on a simple word list', () => {
  const trie = new Trie();
  trie.insert('cat');
  trie.insert('car');
  trie.insert('card');
  trie.insert('care');
  trie.insert('dog');

  assert.deepEqual(trie.complete('ca'), ['car', 'card', 'care', 'cat']);
  assert.deepEqual(trie.complete('car'), ['car', 'card', 'care']);
  assert.deepEqual(trie.complete('do'), ['dog']);
});

test('complete returns empty array when prefix is absent', () => {
  const trie = new Trie();
  trie.insert('cat');
  assert.deepEqual(trie.complete('z'), []);
});

test('complete returns empty array when prefix is a dead end', () => {
  const trie = new Trie();
  trie.insert('apple');
  assert.deepEqual(trie.complete('applx'), []);
});

test('prefix that is itself a word appears in completions', () => {
  const trie = new Trie();
  trie.insert('go');
  trie.insert('gone');
  trie.insert('good');
  assert.deepEqual(trie.complete('go'), ['go', 'gone', 'good']);
});

test('empty prefix matches all stored words', () => {
  const trie = new Trie();
  trie.insert('bat');
  trie.insert('ant');
  assert.deepEqual(trie.complete(''), ['ant', 'bat']);
});

test('limit caps the number of results', () => {
  const trie = new Trie();
  trie.insert('a');
  trie.insert('ab');
  trie.insert('abc');
  trie.insert('abcd');
  assert.deepEqual(trie.complete('a', 2).length, 2);
  assert.deepEqual(trie.complete('a', 2), ['a', 'ab']);
});

test('limit of zero returns empty array', () => {
  const trie = new Trie();
  trie.insert('a');
  assert.deepEqual(trie.complete('a', 0), []);
});

test('inserting the same word twice does not duplicate it', () => {
  const trie = new Trie();
  trie.insert('hello');
  trie.insert('hello');
  assert.deepEqual(trie.complete('he'), ['hello']);
  assert.equal(trie.size(), 1);
});

test('contains returns true only for fully inserted words', () => {
  const trie = new Trie();
  trie.insert('cat');
  assert.equal(trie.contains('cat'), true);
  assert.equal(trie.contains('ca'), false);
  assert.equal(trie.contains('cars'), false);
});

test('contains rejects non-string input', () => {
  const trie = new Trie();
  assert.equal(trie.contains(/** @type {any} */ (123)), false);
});

test('insert rejects non-string input', () => {
  const trie = new Trie();
  assert.throws(() => trie.insert(/** @type {any} */ (123)), TypeError);
});

test('complete rejects non-string prefix', () => {
  const trie = new Trie();
  assert.throws(() => trie.complete(/** @type {any} */ (123)), TypeError);
});

test('complete rejects negative limit', () => {
  const trie = new Trie();
  assert.throws(() => trie.complete('a', -1), TypeError);
});
