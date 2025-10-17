
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
    public static void main(String[] args) {
        // Your code here
    }
}`;

const pythonDefault = `def solve():
    # Your code here
    pass

solve()
`;

const cppDefault = `#include <iostream>
#include <vector>
#include <string>

int main() {
    // Your code here
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
            { id: 1, title: 'Two Sum', description: 'Given an array of integers, return indices of the two numbers such that they add up to a specific target.', difficulty: 'easy', defaultCode: javaDefault, testCases: [{ input: '9\n2 7 11 15', expectedOutput: '0 1' }] },
            { id: 2, title: 'Reverse a String', description: 'Write a function that reverses a string.', difficulty: 'easy', defaultCode: javaDefault, testCases: [{ input: 'hello', expectedOutput: 'olleh' }] },
        ],
        medium: [
            { id: 3, title: 'Add Two Numbers', description: 'You are given two non-empty linked lists representing two non-negative integers.', difficulty: 'medium', defaultCode: javaDefault, testCases: [] },
        ],
        hard: [
            { id: 4, title: 'Median of Two Sorted Arrays', description: 'Given two sorted arrays, return the median.', difficulty: 'hard', defaultCode: javaDefault, testCases: [] },
        ]
    },
    python: {
        easy: [
            { id: 1, title: 'Check for Palindrome', description: 'Determine if a given string is a palindrome, ignoring case and non-alphanumeric characters.', difficulty: 'easy', defaultCode: pythonDefault, testCases: [{ input: 'A man, a plan, a canal: Panama', expectedOutput: 'true' }] },
            { id: 2, title: 'FizzBuzz', description: 'Print numbers from 1 to n. For multiples of three print "Fizz" instead of the number and for the multiples of five print "Buzz". For numbers which are multiples of both three and five print "FizzBuzz".', difficulty: 'easy', defaultCode: pythonDefault, testCases: [{ input: '15', expectedOutput: '1\n2\nFizz\n4\nBuzz\n...' }] },
        ],
        medium: [
            { id: 3, title: 'Group Anagrams', description: 'Given an array of strings, group anagrams together.', difficulty: 'medium', defaultCode: pythonDefault, testCases: [] },
        ],
        hard: [
             { id: 4, title: 'Largest Rectangle in Histogram', description: 'Given an array of integers representing the histogram\'s bar height where the width of each bar is 1, find the area of the largest rectangle in the histogram.', difficulty: 'hard', defaultCode: pythonDefault, testCases: [] },
        ]
    },
    cpp: {
        easy: [
            { id: 1, title: 'Find Factorial', description: 'Calculate the factorial of a non-negative integer n.', difficulty: 'easy', defaultCode: cppDefault, testCases: [{ input: '5', expectedOutput: '120' }] },
            { id: 2, title: 'Check Prime Number', description: 'Check if a given integer is a prime number.', difficulty: 'easy', defaultCode: cppDefault, testCases: [{ input: '7', expectedOutput: 'true' }] },
        ],
        medium: [
            { id: 3, title: 'Longest Palindromic Substring', description: 'Given a string s, return the longest palindromic substring in s.', difficulty: 'medium', defaultCode: cppDefault, testCases: [] },
        ],
        hard: [
            { id: 4, title: 'N-Queens', description: 'The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other.', difficulty: 'hard', defaultCode: cppDefault, testCases: [] },
        ]
    },
     c: {
        easy: [
            { id: 1, title: 'Find Factorial', description: 'Calculate the factorial of a non-negative integer n.', difficulty: 'easy', defaultCode: cppDefault.replace('iostream', 'stdio.h').replace('std::cout << "Hello from C++/C Sandbox!" << std::endl;', 'printf("Hello from C Sandbox!\\n");'), testCases: [{ input: '5', expectedOutput: '120' }] },
        ],
        medium: [],
        hard: []
    }
};
