// src/data/problems.js
// ─────────────────────────────────────────────────────────────────────────────
// Mock problem data — used until backend is connected
// BACKEND: Replace with API call → GET /api/problems
// ─────────────────────────────────────────────────────────────────────────────

export const PROBLEMS = [
  {
    id: 'selection-sort',
    title: 'Selection Sort',
    difficulty: 'Easy',
    folder: 'Sorting',
    subfolder: 'Algorithms',
    tags: ['Sorting', 'Array'],
  },
  {
    id: 'bubble-sort',
    title: 'Bubble Sort',
    difficulty: 'Easy',
    folder: 'Sorting',
    subfolder: 'Algorithms',
    tags: ['Sorting', 'Array'],
  },
  {
    id: 'merge-sort',
    title: 'Merge Sort',
    difficulty: 'Medium',
    folder: 'Sorting',
    subfolder: 'Algorithms',
    tags: ['Sorting', 'Divide and Conquer'],
  },
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    folder: 'Arrays',
    subfolder: 'Basic',
    tags: ['Array', 'Hash Table'],
  },
  {
    id: 'maximum-subarray',
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    folder: 'Arrays',
    subfolder: 'Intermediate',
    tags: ['Array', 'Dynamic Programming'],
  },
  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    folder: 'Linked Lists',
    subfolder: 'Basic',
    tags: ['Linked List', 'Recursion'],
  },
  {
    id: 'climbing-stairs',
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    folder: 'Dynamic Programming',
    subfolder: 'Fundamentals',
    tags: ['Dynamic Programming', 'Math'],
  },
  {
    id: 'number-of-islands',
    title: 'Number of Islands',
    difficulty: 'Medium',
    folder: 'Graphs',
    subfolder: 'BFS-DFS',
    tags: ['Array', 'DFS', 'BFS'],
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
export const getFolders    = ()          => [...new Set(PROBLEMS.map(p => p.folder))]
export const getSubfolders = (folder)    => [...new Set(PROBLEMS.filter(p => p.folder === folder).map(p => p.subfolder))]
export const getProblems   = (f, sub)    => PROBLEMS.filter(p => p.folder === f && p.subfolder === sub)
export const getProblemById = (id)       => PROBLEMS.find(p => p.id === id) || null
