# autocomplete-automation

Builds a trie from a word list and returns matching completions for a given prefix.

## Usage

```js
import { Trie } from 'autocomplete-automation';

const trie = new Trie();
trie.insert('cat');
trie.insert('car');
trie.insert('card');

trie.complete('ca'); // ['car', 'card', 'cat']
trie.complete('car'); // ['car', 'card']
trie.contains('cat'); // true
trie.contains('ca'); // false
trie.size(); // 3
```

## Why this exists

The specific problem: given a fixed set of words, answer "what completes this prefix?" many times without re-scanning the whole list each query. A trie gives O(prefix length + result count) lookups at the cost of O(total characters) memory — the right trade-off when the word set is small and queries are frequent.

## Edge you will hit

- `complete('')` returns every stored word, because the empty string is a prefix of everything.
- `complete` returns the prefix itself in the results when the prefix is also a complete inserted word. If you only want "longer" completions, filter that one out yourself — this library does not guess which you meant.
- Results are returned in lexicographic order. A non-deterministic order would be a bug, not a feature here.
- `limit` is a hard cap; passing `0` gives `[]`.
