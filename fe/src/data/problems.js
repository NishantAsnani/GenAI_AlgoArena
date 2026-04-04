// 3-level: Category → Subcategory → Problems
// This is mock data — replace with API calls when backend is ready

export const PROBLEMS = [
  // ── SORTING ──────────────────────────────────────────────────────────────
  {
    id: 'sel-sort',
    folder: 'Sorting',
    subfolder: 'Algorithms',
    title: 'Selection Sort',
    difficulty: 'Easy',
    tags: ['Sorting', 'Array'],
    description: `Given an array of integers \`nums\`, sort the array in non-decreasing order using the **selection sort** algorithm and return the sorted array.

A sorted array in non-decreasing order is an array where each element is greater than or equal to all previous elements in the array.`,
    examples: [
      {
        input: 'nums = [7, 4, 1, 5, 3]',
        output: '[1, 3, 4, 5, 7]',
        explanation: '1 ≤ 3 ≤ 4 ≤ 5 ≤ 7. The array is sorted in non-decreasing order.',
      },
      {
        input: 'nums = [5, 1]',
        output: '[1, 5]',
        explanation: '1 ≤ 5.',
      },
    ],
    constraints: [
      '1 ≤ nums.length ≤ 10⁴',
      '-10⁵ ≤ nums[i] ≤ 10⁵',
    ],
    sampleTestCases: [
      { id: 1, label: 'Case 1', input: '[7, 4, 1, 5, 3]', expected: '[1, 3, 4, 5, 7]' },
      { id: 2, label: 'Case 2', input: '[5, 1]', expected: '[1, 5]' },
    ],
    hiddenTestCases: [
      { id: 3, input: '[1]', expected: '[1]' },
      { id: 4, input: '[3, 2, 1, 0]', expected: '[0, 1, 2, 3]' },
      { id: 5, input: '[1, 1, 1]', expected: '[1, 1, 1]' },
    ],
    starterCode: {
      'C++': `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> selectionSort(vector<int>& nums) {\n        // Write your solution here\n        \n    }\n};`,
      'Python': `from typing import List\n\nclass Solution:\n    def selectionSort(self, nums: List[int]) -> List[int]:\n        # Write your solution here\n        pass`,
      'Java': `import java.util.Arrays;\n\nclass Solution {\n    public int[] selectionSort(int[] nums) {\n        // Write your solution here\n        \n    }\n}`,
      'JavaScript': `/**\n * @param {number[]} nums\n * @return {number[]}\n */\nvar selectionSort = function(nums) {\n    // Write your solution here\n    \n};`,
    },
  },

  {
    id: 'bub-sort',
    folder: 'Sorting',
    subfolder: 'Algorithms',
    title: 'Bubble Sort',
    difficulty: 'Easy',
    tags: ['Sorting', 'Array'],
    description: `Implement the **bubble sort** algorithm to sort an array of integers in non-decreasing order.

Bubble sort works by repeatedly stepping through the list, comparing adjacent elements, and swapping them if they are in the wrong order.`,
    examples: [
      { input: 'nums = [5, 3, 1, 4, 2]', output: '[1, 2, 3, 4, 5]', explanation: 'Sorted using bubble sort.' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁴', '-10⁵ ≤ nums[i] ≤ 10⁵'],
    sampleTestCases: [
      { id: 1, label: 'Case 1', input: '[5, 3, 1, 4, 2]', expected: '[1, 2, 3, 4, 5]' },
      { id: 2, label: 'Case 2', input: '[2, 1]', expected: '[1, 2]' },
    ],
    hiddenTestCases: [
      { id: 3, input: '[1]', expected: '[1]' },
      { id: 4, input: '[10, 9, 8, 7]', expected: '[7, 8, 9, 10]' },
    ],
    starterCode: {
      'C++': `class Solution {\npublic:\n    vector<int> bubbleSort(vector<int>& nums) {\n        \n    }\n};`,
      'Python': `class Solution:\n    def bubbleSort(self, nums):\n        pass`,
      'Java': `class Solution {\n    public int[] bubbleSort(int[] nums) {\n        \n    }\n}`,
      'JavaScript': `var bubbleSort = function(nums) {\n    \n};`,
    },
  },

  {
    id: 'merge-sort',
    folder: 'Sorting',
    subfolder: 'Algorithms',
    title: 'Merge Sort',
    difficulty: 'Medium',
    tags: ['Sorting', 'Divide and Conquer', 'Recursion'],
    description: `Implement the **merge sort** algorithm — a classic divide and conquer sorting algorithm.

Split the array into two halves, recursively sort each half, then merge the two sorted halves together.`,
    examples: [
      { input: 'nums = [8, 3, 5, 1, 9, 2]', output: '[1, 2, 3, 5, 8, 9]', explanation: 'Array divided and merged.' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁵', '-10⁶ ≤ nums[i] ≤ 10⁶'],
    sampleTestCases: [
      { id: 1, label: 'Case 1', input: '[8, 3, 5, 1, 9, 2]', expected: '[1, 2, 3, 5, 8, 9]' },
      { id: 2, label: 'Case 2', input: '[4, 2]', expected: '[2, 4]' },
    ],
    hiddenTestCases: [
      { id: 3, input: '[1]', expected: '[1]' },
      { id: 4, input: '[-3, -1, -2]', expected: '[-3, -2, -1]' },
    ],
    starterCode: {
      'C++': `class Solution {\npublic:\n    vector<int> mergeSort(vector<int>& nums) {\n        \n    }\n};`,
      'Python': `class Solution:\n    def mergeSort(self, nums):\n        pass`,
      'Java': `class Solution {\n    public int[] mergeSort(int[] nums) {\n        \n    }\n}`,
      'JavaScript': `var mergeSort = function(nums) {\n    \n};`,
    },
  },

  // ── ARRAYS ────────────────────────────────────────────────────────────────
  {
    id: 'two-sum',
    folder: 'Arrays',
    subfolder: 'Basic',
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return **indices** of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.`,
    examples: [
      { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9.' },
      { input: 'nums = [3, 2, 4], target = 6', output: '[1, 2]', explanation: 'nums[1] + nums[2] = 2 + 4 = 6.' },
    ],
    constraints: ['2 ≤ nums.length ≤ 10⁴', '-10⁹ ≤ nums[i] ≤ 10⁹', 'Only one valid answer exists.'],
    sampleTestCases: [
      { id: 1, label: 'Case 1', input: 'nums=[2,7,11,15], target=9', expected: '[0,1]' },
      { id: 2, label: 'Case 2', input: 'nums=[3,2,4], target=6', expected: '[1,2]' },
    ],
    hiddenTestCases: [
      { id: 3, input: 'nums=[3,3], target=6', expected: '[0,1]' },
      { id: 4, input: 'nums=[1,5,3,2], target=8', expected: '[1,2]' },
    ],
    starterCode: {
      'C++': `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};`,
      'Python': `class Solution:\n    def twoSum(self, nums, target: int):\n        pass`,
      'Java': `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}`,
      'JavaScript': `var twoSum = function(nums, target) {\n    \n};`,
    },
  },

  {
    id: 'max-sub',
    folder: 'Arrays',
    subfolder: 'Intermediate',
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming', "Kadane's Algorithm"],
    description: `Given an integer array \`nums\`, find the **subarray** with the largest sum, and return its sum.

A subarray is a contiguous non-empty sequence of elements within an array.`,
    examples: [
      { input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]', output: '6', explanation: 'Subarray [4, -1, 2, 1] has the largest sum = 6.' },
      { input: 'nums = [1]', output: '1', explanation: 'Single element.' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁵', '-10⁴ ≤ nums[i] ≤ 10⁴'],
    sampleTestCases: [
      { id: 1, label: 'Case 1', input: '[-2,1,-3,4,-1,2,1,-5,4]', expected: '6' },
      { id: 2, label: 'Case 2', input: '[1]', expected: '1' },
    ],
    hiddenTestCases: [
      { id: 3, input: '[5, 4, -1, 7, 8]', expected: '23' },
      { id: 4, input: '[-1, -2, -3]', expected: '-1' },
    ],
    starterCode: {
      'C++': `class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        \n    }\n};`,
      'Python': `class Solution:\n    def maxSubArray(self, nums) -> int:\n        pass`,
      'Java': `class Solution {\n    public int maxSubArray(int[] nums) {\n        \n    }\n}`,
      'JavaScript': `var maxSubArray = function(nums) {\n    \n};`,
    },
  },

  // ── LINKED LISTS ──────────────────────────────────────────────────────────
  {
    id: 'rev-ll',
    folder: 'Linked Lists',
    subfolder: 'Basic',
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    tags: ['Linked List', 'Recursion'],
    description: `Given the \`head\` of a singly linked list, reverse the list, and return the reversed list.`,
    examples: [
      { input: 'head = [1, 2, 3, 4, 5]', output: '[5, 4, 3, 2, 1]', explanation: 'All nodes reversed.' },
      { input: 'head = [1, 2]', output: '[2, 1]', explanation: 'Two nodes reversed.' },
    ],
    constraints: ['0 ≤ length ≤ 5000', '-5000 ≤ Node.val ≤ 5000'],
    sampleTestCases: [
      { id: 1, label: 'Case 1', input: '[1,2,3,4,5]', expected: '[5,4,3,2,1]' },
      { id: 2, label: 'Case 2', input: '[1,2]', expected: '[2,1]' },
    ],
    hiddenTestCases: [
      { id: 3, input: '[]', expected: '[]' },
      { id: 4, input: '[1]', expected: '[1]' },
    ],
    starterCode: {
      'C++': `class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        \n    }\n};`,
      'Python': `class Solution:\n    def reverseList(self, head):\n        pass`,
      'Java': `class Solution {\n    public ListNode reverseList(ListNode head) {\n        \n    }\n}`,
      'JavaScript': `var reverseList = function(head) {\n    \n};`,
    },
  },

  // ── DYNAMIC PROGRAMMING ───────────────────────────────────────────────────
  {
    id: 'climb-stairs',
    folder: 'Dynamic Programming',
    subfolder: 'Fundamentals',
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    tags: ['Dynamic Programming', 'Math', 'Memoization'],
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb **1** or **2** steps. In how many distinct ways can you climb to the top?`,
    examples: [
      { input: 'n = 2', output: '2', explanation: '(1+1) or (2). Two ways.' },
      { input: 'n = 3', output: '3', explanation: '(1+1+1), (1+2), (2+1). Three ways.' },
    ],
    constraints: ['1 ≤ n ≤ 45'],
    sampleTestCases: [
      { id: 1, label: 'Case 1', input: 'n = 2', expected: '2' },
      { id: 2, label: 'Case 2', input: 'n = 3', expected: '3' },
    ],
    hiddenTestCases: [
      { id: 3, input: 'n = 5', expected: '8' },
      { id: 4, input: 'n = 10', expected: '89' },
    ],
    starterCode: {
      'C++': `class Solution {\npublic:\n    int climbStairs(int n) {\n        \n    }\n};`,
      'Python': `class Solution:\n    def climbStairs(self, n: int) -> int:\n        pass`,
      'Java': `class Solution {\n    public int climbStairs(int n) {\n        \n    }\n}`,
      'JavaScript': `var climbStairs = function(n) {\n    \n};`,
    },
  },

  // ── GRAPHS ────────────────────────────────────────────────────────────────
  {
    id: 'num-islands',
    folder: 'Graphs',
    subfolder: 'BFS / DFS',
    title: 'Number of Islands',
    difficulty: 'Medium',
    tags: ['Graph', 'BFS', 'DFS', 'Matrix'],
    description: `Given an \`m x n\` 2D binary grid \`grid\` which represents a map of \`'1'\`s (land) and \`'0'\`s (water), return the **number of islands**.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.`,
    examples: [
      {
        input: `grid = [\n  ["1","1","1","1","0"],\n  ["1","1","0","1","0"],\n  ["1","1","0","0","0"],\n  ["0","0","0","0","0"]\n]`,
        output: '1',
        explanation: 'All connected 1s form one island.',
      },
    ],
    constraints: ['m == grid.length', 'n == grid[i].length', '1 ≤ m, n ≤ 300', 'grid[i][j] is "0" or "1"'],
    sampleTestCases: [
      { id: 1, label: 'Case 1', input: '[["1","1","0"],["0","1","0"],["0","0","1"]]', expected: '2' },
      { id: 2, label: 'Case 2', input: '[["1","1","1"],["0","1","0"]]', expected: '1' },
    ],
    hiddenTestCases: [
      { id: 3, input: '[["0"]]', expected: '0' },
      { id: 4, input: '[["1"],["1"]]', expected: '1' },
    ],
    starterCode: {
      'C++': `class Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        \n    }\n};`,
      'Python': `class Solution:\n    def numIslands(self, grid) -> int:\n        pass`,
      'Java': `class Solution {\n    public int numIslands(char[][] grid) {\n        \n    }\n}`,
      'JavaScript': `var numIslands = function(grid) {\n    \n};`,
    },
  },
]

// ── Helper utilities ──────────────────────────────────────────────────────────

/** Get unique folder names */
export const getFolders = () => [...new Set(PROBLEMS.map(p => p.folder))]

/** Get subfolders within a folder */
export const getSubfolders = (folder) =>
  [...new Set(PROBLEMS.filter(p => p.folder === folder).map(p => p.subfolder))]

/** Get problems in a specific subfolder */
export const getProblems = (folder, subfolder) =>
  PROBLEMS.filter(p => p.folder === folder && p.subfolder === subfolder)

/** Find problem by ID */
export const getProblemById = (id) => PROBLEMS.find(p => p.id === id)

export const DIFFICULTY_COLORS = {
  Easy: '#22c55e',
  Medium: '#f59e0b',
  Hard: '#ef4444',
}

export const LANGUAGES = ['C++', 'Python', 'Java', 'JavaScript']

export const LANGUAGE_IDS = {
  'C++': 54,
  'Python': 71,
  'Java': 62,
  'JavaScript': 63,
}
