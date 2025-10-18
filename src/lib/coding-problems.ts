
export interface Problem {
    id: number;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    defaultCode: string;
    testCases: { input: string; expectedOutput: string }[];
}

const javaDefault = `import java.util.*;
import java.io.*;

public class Solution {
    // The main method is for your local testing.
    // The platform will call the specific method you need to implement.
    public static void main(String[] args) {
        // Example for local testing:
        // Solution sol = new Solution();
        // System.out.println(sol.yourMethod());
    }

    // Implement your method here. For example:
    // public String reverseWord(String word) { ... }
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
                title: "Reverse a word using loop",
                description: "Write a program to reverse a word using a loop, without using inbuilt reverse functions.",
                difficulty: 'easy',
                defaultCode: javaDefault,
                testCases: [ { input: 'TEMPLE', expectedOutput: 'ELPMET' } ]
            },
            {
                id: 6,
                title: "Count vowels in a statement",
                description: "Write a program to print the number of vowels in the given statement.",
                difficulty: 'easy',
                defaultCode: javaDefault,
                testCases: [ { input: 'Saveetha School of Engineering', expectedOutput: '12' } ]
            },
            {
                id: 8,
                title: "Find character in a string",
                description: "Write a program that finds whether a given character is present in a string or not. If present, print its first index. Do not use built-in find functions.",
                difficulty: 'easy',
                defaultCode: javaDefault,
                testCases: [
                    { input: 'I am a programmer\np', expectedOutput: 'p is found in string at index: 9' },
                    { input: 'hello world\nz', expectedOutput: 'z is not found in the string.' }
                ]
            },
            {
                id: 10,
                title: "Remove vowels from a string",
                description: "Write a program that accepts a string from a user and displays the same string after removing vowels from it.",
                difficulty: 'easy',
                defaultCode: javaDefault,
                testCases: [ { input: 'we can play the game', expectedOutput: 'w cn ply thgm' } ]
            },
             {
                id: 16,
                title: "Right Triangle Star Pattern",
                description: "Write a program to print a right triangle star pattern for a given number of rows 'n'.",
                difficulty: 'easy',
                defaultCode: javaDefault,
                testCases: [
                    { input: '5', expectedOutput: '    *\n   * *\n  * * *\n * * * *\n* * * * *\n' }
                ]
            },
            {
                id: 28,
                title: "Reverse a number using loop",
                description: "Write a program to reverse a number using a loop. The input will be a single number.",
                difficulty: 'easy',
                defaultCode: javaDefault,
                testCases: [
                    { input: '14567', expectedOutput: '76541' },
                    { input: '-45721', expectedOutput: '-12754' }
                ]
            },
            {
                id: 30,
                title: "Check voting eligibility",
                description: "Write a program to find whether a person is eligible to vote or not. If not eligible, print how many years are left.",
                difficulty: 'easy',
                defaultCode: javaDefault,
                testCases: [
                    { input: '7', expectedOutput: 'You are allowed to vote after 11 years' },
                    { input: '25', expectedOutput: 'Eligible to vote' }
                ]
            },
             {
                id: 33,
                title: "Print Fibonacci series",
                description: "Write a program to print the Fibonacci series up to the nth term.",
                difficulty: 'easy',
                defaultCode: javaDefault,
                testCases: [ { input: '6', expectedOutput: '0\n1\n1\n2\n3\n5\n' } ]
            },
            {
                id: 37,
                title: "Find the factorial of n",
                description: "Write a program to find the factorial of a given number n.",
                difficulty: 'easy',
                defaultCode: javaDefault,
                testCases: [
                    { input: '4', expectedOutput: '24' },
                    { input: '0', expectedOutput: '1' }
                ]
            },
            {
                id: 40,
                title: "Check for Perfect number",
                description: "Write a program to print if the given number is a Perfect number or not. A perfect number is a positive integer that is equal to the sum of its proper divisors.",
                difficulty: 'easy',
                defaultCode: javaDefault,
                testCases: [
                    { input: '6', expectedOutput: 'It’s a Perfect Number' },
                    { input: '17', expectedOutput: 'It’s not a Perfect Number' }
                ]
            },
            {
                id: 43,
                title: "Check for Armstrong number",
                description: "Write a program to find whether the given number is an Armstrong number or not.",
                difficulty: 'easy',
                defaultCode: javaDefault,
                testCases: [
                    { input: '153', expectedOutput: 'Given number is Armstrong number' },
                    { input: '370', expectedOutput: 'Given number is Armstrong number' },
                    { input: '123', expectedOutput: 'Given number is not an Armstrong number' }
                ]
            },
             {
                id: 51,
                title: "Print multiplication table",
                description: "Write a program to print the multiplication table of number M up to N.",
                difficulty: 'easy',
                defaultCode: javaDefault,
                testCases: [
                    { input: '4\n5', expectedOutput: '1x4=4\n2x4=8\n3x4=12\n4x4=16\n5x4=20' }
                ]
            }
        ],
        medium: [
            {
                id: 4,
                title: "Sort a list of names",
                description: "Write a program that would sort a list of names in alphabetical order (Ascending or Descending) based on a user's choice.",
                difficulty: 'medium',
                defaultCode: javaDefault,
                testCases: [ { input: 'Banana\nCarrot\nRadish\nApple\nJack\nA', expectedOutput: 'Apple\nBanana\nCarrot\nJack\nRadish' } ]
            },
             {
                id: 9,
                title: "Arrange letters in reverse alphabetical order",
                description: "Write a program to arrange the letters of a word alphabetically in reverse order.",
                difficulty: 'medium',
                defaultCode: javaDefault,
                testCases: [ { input: 'MOSQUE', expectedOutput: 'USQOME' } ]
            },
            {
                id: 11,
                title: "Matrix Multiplication",
                description: "Write a program for matrix multiplication of two 2x2 matrices.",
                difficulty: 'medium',
                defaultCode: javaDefault,
                testCases: [
                    { input: '[[1,2],[5,3]]\n[[2,3],[4,1]]', expectedOutput: '[[10,5],[22,18]]' }
                ]
            },
            {
                id: 12,
                title: "Matrix Addition",
                description: "Write a program for matrix addition of two 2x2 matrices.",
                difficulty: 'medium',
                defaultCode: javaDefault,
                testCases: [
                    { input: '[[1,2],[5,3]]\n[[2,3],[4,1]]', expectedOutput: '[[3,5],[9,4]]' }
                ]
            },
            {
                id: 13,
                title: "Merge two sorted arrays",
                description: "Write a program to merge two sorted arrays into a single sorted array.",
                difficulty: 'medium',
                defaultCode: javaDefault,
                testCases: [
                    { input: '[1,3,4,5]\n[2,4,6,8]', expectedOutput: '[1,2,3,4,4,5,6,8]' }
                ]
            },
            {
                id: 14,
                title: "Find Mean, Median, and Mode",
                description: "Write a program to find the Mean, Median, and Mode of an array of numbers.",
                difficulty: 'medium',
                defaultCode: javaDefault,
                testCases: [
                    { input: '{16, 18, 27, 16, 23, 21, 19}', expectedOutput: 'Mean = 20\nMedian = 19\nMode = 16' }
                ]
            },
             {
                id: 29,
                title: "Decimal to Binary Reverse",
                description: "Write a program to convert a given decimal to binary, reverse the binary string, and print the new decimal value.",
                difficulty: 'medium',
                defaultCode: javaDefault,
                testCases: [
                    { input: '11', expectedOutput: '13' },
                    { input: '25', expectedOutput: '25' }
                ]
            },
            {
                id: 31,
                title: "Find LCM and GCD",
                description: "Write a program to find the LCM and GCD of two numbers.",
                difficulty: 'medium',
                defaultCode: javaDefault,
                testCases: [
                    { input: '16\n20', expectedOutput: 'LCM = 80\nGCD = 4' }
                ]
            },
            {
                id: 34,
                title: "Even Sum of Fibonacci Series",
                description: "Find the sum of Fibonacci numbers at even indices up to the Nth term.",
                difficulty: 'medium',
                defaultCode: javaDefault,
                testCases: [
                    { input: '4', expectedOutput: '33' }
                ]
            },
            {
                id: 36,
                title: "Print composite numbers in a range",
                description: "Write a program to print all the composite numbers between a and b.",
                difficulty: 'medium',
                defaultCode: javaDefault,
                testCases: [
                    { input: '12\n19', expectedOutput: '14, 15, 16, 18' }
                ]
            },
            {
                id: 39,
                title: "Find the number of factors",
                description: "Write a program to find the number of factors for a given number.",
                difficulty: 'medium',
                defaultCode: javaDefault,
                testCases: [
                    { input: '100', expectedOutput: '9' }
                ]
            }
        ],
        hard: [
            {
                id: 3,
                title: "Validate Username",
                description: "Write a program to check if an entered username is valid by comparing it to a saved username. Get both inputs from the user.",
                difficulty: 'hard',
                defaultCode: javaDefault,
                testCases: [
                    { input: 'admin\nadmin', expectedOutput: 'username is valid' },
                    { input: 'user\nadmin', expectedOutput: 'username is invalid' }
                ]
            },
             {
                id: 48,
                title: "Duplicate Zeros",
                description: "Given a fixed-length integer array arr, duplicate each occurrence of zero, shifting the remaining elements to the right. Elements beyond the original array length are not written.",
                difficulty: 'hard',
                defaultCode: javaDefault,
                testCases: [
                    { input: '[1,0,2,3,0,4,5,0]', expectedOutput: '[1,0,0,2,3,0,0,4]' }
                ]
            },
            {
                id: 49,
                title: "Find Missing Number in Range",
                description: "Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array.",
                difficulty: 'hard',
                defaultCode: javaDefault,
                testCases: [
                    { input: '[3,0,1]', expectedOutput: '2' }
                ]
            },
            {
                id: 50,
                title: "Largest Subarray Sum",
                description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
                difficulty: 'hard',
                defaultCode: javaDefault,
                testCases: [
                    { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6' }
                ]
            },
            {
                id: 52,
                title: "Implement Multiple Threads with Join",
                description: "Write a Java program to implement multiple threads and apply the join() method for one thread. The thread has to be started after 500ms using sleep().",
                difficulty: 'hard',
                defaultCode: javaDefault,
                testCases: []
            },
            {
                id: 54,
                title: "Simple Generics Class for Sorting",
                description: "Create a simple generics class with type parameters for sorting values of different types.",
                difficulty: 'hard',
                defaultCode: javaDefault,
                testCases: []
            },
            {
                id: 56,
                title: "Count Words in a String using HashMap",
                description: "Write a Java Program to count the number of words in a string using a HashMap.",
                difficulty: 'hard',
                defaultCode: javaDefault,
                testCases: []
            }
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
                    { input: '5', expectedOutput: '[[...],[...]]' },
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
                    { input: '15', expectedOutput: '1307674368000' }, 
                    { input: '4', expectedOutput: '24' },
                ] 
            },
        ],
        medium: [],
        hard: []
    }
};
