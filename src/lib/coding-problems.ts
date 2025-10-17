
export interface Problem {
    id: number;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    defaultCode: string;
    testCases: { input: string; expectedOutput: string }[];
}

const javaDefault = `import java.util.*;

public class Solution {
    // Your method signature here. For example:
    // public int[] twoSum(int[] nums, int target) { ... }

    public static void main(String[] args) {
        // You can use this for local testing if needed, 
        // but the platform will call your method directly.
    }
}`;

const pythonDefault = `class Solution:
    def solve(self):
        # Your code here
        pass
`;

const cppDefault = `#include <iostream>
#include <vector>
#include <string>

class Solution {
public:
    // Your method signature here. For example:
    // std::vector<int> twoSum(std::vector<int>& nums, int target) { ... }
};

int main() {
    // You can use this for local testing if needed.
    return 0;
}
`;

export const dummyProblemsByLanguage: {
    [key: string]: {
        easy: Problem[];
        medium: Problem[];
        hard: Problem[];
    }
} = {
    java: {
        easy: [
            { 
                id: 1, 
                title: 'Check Palindrome', 
                description: 'Given a string, determine if it is a palindrome, considering only alphanumeric characters and ignoring cases. An empty string is a valid palindrome.', 
                difficulty: 'easy', 
                defaultCode: javaDefault, 
                testCases: [
                    { input: 'A man, a plan, a canal: Panama', expectedOutput: 'true' },
                    { input: 'race a car', expectedOutput: 'false' },
                    { input: ' ', expectedOutput: 'true' },
                    { input: 'No lemon, no melon.', expectedOutput: 'true' },
                    { input: 'Was it a car or a cat I saw?', expectedOutput: 'true' },
                    { input: 'hello', expectedOutput: 'false' },
                    { input: '12321', expectedOutput: 'true' },
                    { input: '12345', expectedOutput: 'false' },
                    { input: 'a', expectedOutput: 'true' },
                    { input: 'ab', expectedOutput: 'false' },
                ] 
            },
        ],
        medium: [
            { 
                id: 2, 
                title: 'Group Anagrams', 
                description: 'Given an array of strings, group the anagrams together. You can return the answer in any order. An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.', 
                difficulty: 'medium', 
                defaultCode: javaDefault, 
                testCases: [
                    { input: '["eat","tea","tan","ate","nat","bat"]', expectedOutput: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
                    { input: '[""]', expectedOutput: '[[""]]' },
                    { input: '["a"]', expectedOutput: '[["a"]]' },
                    { input: '["abc", "acb", "bca"]', expectedOutput: '[["abc", "acb", "bca"]]' },
                    { input: '["listen", "silent", "enlist"]', expectedOutput: '[["listen", "silent", "enlist"]]' },
                    { input: '["a", "b", "c"]', expectedOutput: '[["a"],["b"],["c"]]' },
                    { input: '["", "b", ""]', expectedOutput: '[["",""],["b"]]' },
                    { input: '["ant", "ant"]', expectedOutput: '[["ant", "ant"]]' },
                    { input: '["cinema", "iceman"]', expectedOutput: '[["iceman"],["cinema"]]' }, // Note: order doesn't matter
                    { input: '[]', expectedOutput: '[]' },
                ] 
            },
        ],
        hard: [
            { 
                id: 3, 
                title: 'Largest Rectangle in Histogram', 
                description: 'Given an array of integers representing the histogram\'s bar height where the width of each bar is 1, find the area of the largest rectangle in the histogram.', 
                difficulty: 'hard', 
                defaultCode: javaDefault, 
                testCases: [
                    { input: '[2,1,5,6,2,3]', expectedOutput: '10' },
                    { input: '[2,4]', expectedOutput: '4' },
                    { input: '[0,0,0,0]', expectedOutput: '0' },
                    { input: '[7]', expectedOutput: '7' },
                    { input: '[1,1,1,1,1]', expectedOutput: '5' },
                    { input: '[6, 7, 5, 2, 4, 5, 9, 3]', expectedOutput: '20' },
                    { input: '[4,2,0,3,2,5]', expectedOutput: '6' },
                    { input: '[1,2,3,4,5]', expectedOutput: '9' },
                    { input: '[5,4,3,2,1]', expectedOutput: '9' },
                    { input: '[]', expectedOutput: '0' },
                ] 
            },
        ]
    },
    python: {
        easy: [
            { 
                id: 1, 
                title: 'Two Sum', 
                description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.', 
                difficulty: 'easy', 
                defaultCode: pythonDefault, 
                testCases: [
                    { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]' },
                    { input: '[3,2,4]\n6', expectedOutput: '[1,2]' },
                    { input: '[3,3]\n6', expectedOutput: '[0,1]' },
                    { input: '[-1, -5, 5, 10]\n4', expectedOutput: '[1,2]' },
                    { input: '[10,20,30,40]\n70', expectedOutput: '[2,3]' },
                    { input: '[5,5,5,5]\n10', expectedOutput: '[0,1]' },
                    { input: '[-10,7,19,15]\n9', expectedOutput: '[0,2]' },
                    { input: '[0,4,3,0]\n0', expectedOutput: '[0,3]' },
                    { input: '[100,200,350,400]\n550', expectedOutput: '[1,2]' },
                    { input: '[1,2,3,4,5]\n9', expectedOutput: '[3,4]' },
                ] 
            },
        ],
        medium: [
            { 
                id: 2, 
                title: 'Longest Substring Without Repeating Characters', 
                description: 'Given a string `s`, find the length of the longest substring without repeating characters.', 
                difficulty: 'medium', 
                defaultCode: pythonDefault, 
                testCases: [
                    { input: 'abcabcbb', expectedOutput: '3' },
                    { input: 'bbbbb', expectedOutput: '1' },
                    { input: 'pwwkew', expectedOutput: '3' },
                    { input: '', expectedOutput: '0' },
                    { input: 'a', expectedOutput: '1' },
                    { input: 'au', expectedOutput: '2' },
                    { input: 'dvdf', expectedOutput: '3' },
                    { input: 'anviaj', expectedOutput: '5' },
                    { input: 'ohomm', expectedOutput: '3' },
                    { input: 'abcdefg', expectedOutput: '7' },
                ] 
            },
        ],
        hard: [
            { 
                id: 3, 
                title: 'Trapping Rain Water', 
                description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.', 
                difficulty: 'hard', 
                defaultCode: pythonDefault,
                testCases: [
                    { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6' },
                    { input: '[4,2,0,3,2,5]', expectedOutput: '9' },
                    { input: '[]', expectedOutput: '0' },
                    { input: '[1]', expectedOutput: '0' },
                    { input: '[1,2,3,4,5]', expectedOutput: '0' },
                    { input: '[5,4,3,2,1]', expectedOutput: '0' },
                    { input: '[4,2,3]', expectedOutput: '1' },
                    { input: '[5,2,1,2,1,5]', expectedOutput: '14' },
                    { input: '[5,5,1,7,1,1,5,2,7,6]', expectedOutput: '23' },
                    { input: '[2,0,2]', expectedOutput: '2' },
                ]
            },
        ]
    },
    cpp: {
        easy: [
            { 
                id: 1, 
                title: 'Reverse Integer', 
                description: 'Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2^31, 2^31 - 1], then return 0.', 
                difficulty: 'easy', 
                defaultCode: cppDefault, 
                testCases: [
                    { input: '123', expectedOutput: '321' },
                    { input: '-123', expectedOutput: '-321' },
                    { input: '120', expectedOutput: '21' },
                    { input: '0', expectedOutput: '0' },
                    { input: '1534236469', expectedOutput: '0' },
                    { input: '-2147483648', expectedOutput: '0' },
                    { input: '1', expectedOutput: '1' },
                    { input: '-1', expectedOutput: '-1' },
                    { input: '100', expectedOutput: '1' },
                    { input: '901000', expectedOutput: '109' },
                ] 
            },
        ],
        medium: [
             { 
                id: 2, 
                title: '3Sum', 
                description: 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and nums[i] + nums[j] + nums[k] == 0. Notice that the solution set must not contain duplicate triplets.', 
                difficulty: 'medium', 
                defaultCode: cppDefault,
                testCases: [
                    { input: '[-1,0,1,2,-1,-4]', expectedOutput: '[[-1,-1,2],[-1,0,1]]' },
                    { input: '[0,1,1]', expectedOutput: '[]' },
                    { input: '[0,0,0]', expectedOutput: '[[0,0,0]]' },
                    { input: '[]', expectedOutput: '[]' },
                    { input: '[1,2,3]', expectedOutput: '[]' },
                    { input: '[-2,0,1,1,2]', expectedOutput: '[[-2,0,2],[-2,1,1]]' },
                    { input: '[-1,0,1]', expectedOutput: '[[-1,0,1]]' },
                    { input: '[-5,1,2,3,4]', expectedOutput: '[[-5,1,4],[-5,2,3]]' },
                    { input: '[-1,-1,-1,2]', expectedOutput: '[[-1,-1,2]]' },
                    { input: '[1, -1, -1, 0]', expectedOutput: '[[-1,0,1]]' },
                ]
            },
        ],
        hard: [
            { 
                id: 3, 
                title: 'N-Queens', 
                description: 'The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other. Given an integer n, return all distinct solutions to the n-queens puzzle. You may return the answer in any order. Each solution contains a distinct board configuration of the n-queens\' placement, where \'Q\' and \'.\' both indicate a queen and an empty space, respectively.', 
                difficulty: 'hard', 
                defaultCode: cppDefault,
                testCases: [
                    { input: '4', expectedOutput: '[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]' },
                    { input: '1', expectedOutput: '[["Q"]]' },
                    { input: '2', expectedOutput: '[]' },
                    { input: '3', expectedOutput: '[]' },
                    { input: '5', expectedOutput: '[[...],[...]]' }, // Simplified output for example
                    { input: '6', expectedOutput: '[[...],[...]]' },
                    { input: '7', expectedOutput: '[[...],[...]]' },
                    { input: '8', expectedOutput: '[[...],[...]]' },
                    { input: '9', expectedOutput: '[[...],[...]]' },
                    { input: '0', expectedOutput: '[]' },
                ]
            },
        ]
    },
     c: {
        easy: [
            { 
                id: 1, 
                title: 'Find Factorial', 
                description: 'Calculate the factorial of a non-negative integer n. The factorial of a number n is the product of all positive integers up to n. Factorial of 0 is 1.', 
                difficulty: 'easy', 
                defaultCode: cppDefault.replace('iostream', 'stdio.h').replace('std::cout << "Hello from C++/C Sandbox!" << std::endl;', 'printf("Hello from C Sandbox!\\n");'), 
                testCases: [
                    { input: '5', expectedOutput: '120' },
                    { input: '0', expectedOutput: '1' },
                    { input: '1', expectedOutput: '1' },
                    { input: '10', expectedOutput: '3628800' },
                    { input: '3', expectedOutput: '6' },
                    { input: '7', expectedOutput: '5040' },
                    { input: '12', expectedOutput: '479001600' },
                    { input: '2', expectedOutput: '2' },
                    { input: '15', expectedOutput: '1307674368000' }, // May overflow standard integer types
                    { input: '4', expectedOutput: '24' },
                ] 
            },
        ],
        medium: [],
        hard: []
    }
};
