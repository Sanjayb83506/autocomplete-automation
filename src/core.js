/**
 * Trie node used for prefix-based autocomplete.
 *
 * Each node holds a map of child characters and a flag marking whether a complete
 * word ends at this node. We use a plain object rather than Map because the key
 * set is small (single UTF-16 code units) and property access is fast enough;
 * Map would add overhead with no real benefit here.
 */
export class TrieNode {
  constructor() {
    /** @type {Record<string, TrieNode>} */
    this.children = {};
    /** @type {boolean} */
    this.isWord = false;
  }
}

/**
 * Trie-based autocomplete index.
 *
 * Insertion is O(L) and prefix lookup is O(L + C) where L is the prefix length
 * and C is the number of characters traversed while collecting completions.
 * Storage is O(N * L_avg) for N words. The trade-off: memory overhead versus
 * fast, allocation-free prefix matching.
 */
export class Trie {
  constructor() {
    /** @type {TrieNode} */
    this.root = new TrieNode();
    /** @type {number} */
    this._size = 0;
  }

  /**
   * @param {string} word
   * @returns {void}
   */
  insert(word) {
    if (typeof word !== 'string') {
      throw new TypeError('word must be a string');
    }
    if (word.length === 0) return;
    let node = this.root;
    for (const ch of word) {
      if (!Object.prototype.hasOwnProperty.call(node.children, ch)) {
        node.children[ch] = new TrieNode();
      }
      node = node.children[ch];
    }
    if (!node.isWord) {
      node.isWord = true;
      this._size += 1;
    }
  }

  /**
   * @param {string} word
   * @returns {boolean}
   */
  contains(word) {
    if (typeof word !== 'string') return false;
    const node = this._findNode(word);
    return node !== null && node.isWord;
  }

  /**
   * Walk to the node representing `prefix`, or null if the prefix is absent.
   * @private
   * @param {string} prefix
   * @returns {TrieNode|null}
   */
  _findNode(prefix) {
    let node = this.root;
    for (const ch of prefix) {
      const child = node.children[ch];
      if (child === undefined) return null;
      node = child;
    }
    return node;
  }

  /**
   * @param {string} prefix
   * @param {number} [limit] Optional cap on results; Infinity when omitted.
   * @returns {string[]}
   */
  complete(prefix, limit = Infinity) {
    if (typeof prefix !== 'string') {
      throw new TypeError('prefix must be a string');
    }
    if (typeof limit !== 'number' || limit < 0) {
      throw new TypeError('limit must be a non-negative number');
    }
    if (limit === 0) return [];

    const start = this._findNode(prefix);
    if (start === null) return [];

    /** @type {string[]} */
    const results = [];
    const stack = [{ node: start, prefix }];

    // DFS with an explicit stack so we avoid call-stack limits on long, narrow
    // branches. If the prefix itself is a complete word it appears first.
    while (stack.length > 0) {
      const { node, prefix: current } = stack.pop();
      if (node.isWord) {
        results.push(current);
        if (results.length >= limit) break;
      }
      const keys = Object.keys(node.children);
      // Sort so traversal order — and therefore result order — is deterministic
      // regardless of V8's key enumeration order.
      keys.sort();
      for (let i = keys.length - 1; i >= 0; i--) {
        const ch = keys[i];
        stack.push({ node: node.children[ch], prefix: current + ch });
      }
    }

    return results;
  }

  /**
   * @returns {number} Number of distinct complete words stored.
   */
  size() {
    return this._size;
  }
}
