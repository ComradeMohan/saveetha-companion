
export type Solution = {
    lang: 'Java' | 'Python' | 'C#' | 'NOT IN' | 'LEFT JOIN' | 'NOT EXISTS' | 'SQL';
    code: string;
};

export type Problem = {
    id: number;
    title: string;
    description: string;
    category: 'sql' | 'coding';
    tables?: string;
    solutions: Solution[];
};

export const problems: Problem[] = [
    {
        id: 1,
        title: "Male Nurses Born After a Date",
        category: "sql",
        description: "Write an SQL query to display the first name and date of birth of male nurses born after 1-Jan-1982.",
        tables: "Nurse(FirstName, DateOfBirth, Gender)",
        solutions: [
            {
                lang: "SQL",
                code: `SELECT 
    FirstName AS "NURSE FIRST NAME",
    DateOfBirth AS "DATEOFBIRTH"
FROM Nurse
WHERE Gender = 'Male'
  AND DateOfBirth > '1982-01-01';`
            }
        ]
    },
    {
        id: 2,
        title: "Users Who Never Submitted a Ticket",
        category: "sql",
        description: "Return `USER_ID`, `FIRST_NAME`, `LAST_NAME` of users who never submitted a ticket.",
        tables: "Users(User_ID, ...), Tickets(User_ID, ...)",
        solutions: [
            {
                lang: "NOT IN",
                code: `SELECT U.User_ID, U.First_Name, U.Last_Name
FROM Users U
WHERE U.User_ID NOT IN (SELECT T.User_ID FROM Tickets T);`
            },
            {
                lang: "LEFT JOIN",
                code: `SELECT U.User_ID, U.First_Name, U.Last_Name
FROM Users U
LEFT JOIN Tickets T ON U.User_ID = T.User_ID
WHERE T.User_ID IS NULL;`
            },
            {
                lang: "NOT EXISTS",
                code: `SELECT U.User_ID, U.First_Name, U.Last_Name
FROM Users U
WHERE NOT EXISTS (SELECT 1 FROM Tickets T WHERE U.User_ID = T.User_ID);`
            }
        ]
    },
    {
        id: 3,
        title: "Pair Sum Problem",
        category: "coding",
        description: "Given an integer array, form non-overlapping pairs (a, b) where `a` appears before `b` and `a < b`. Return an array of the sums. Each element can be used at most once.",
        solutions: [
            {
                lang: "Java",
                code: `import java.util.*;
public class Solution {
    public int[] findPairSums(int[] A) {
        List<Integer> res = new ArrayList<>();
        boolean[] used = new boolean[A.length];
        for (int i = 0; i < A.length; i++) {
            if (used[i]) continue;
            for (int j = i + 1; j < A.length; j++) {
                if (!used[j] && A[i] < A[j]) {
                    res.add(A[i] + A[j]);
                    used[i] = true;
                    used[j] = true;
                    break;
                }
            }
        }
        return res.stream().mapToInt(i->i).toArray();
    }
}`
            },
            {
                lang: "Python",
                code: `def find_pair_sums(A):
    N = len(A)
    used = [False] * N
    result = []
    for i in range(N):
        if used[i]: continue
        for j in range(i + 1, N):
            if not used[j] and A[i] < A[j]:
                result.append(A[i] + A[j])
                used[i] = True
                used[j] = True
                break
    return result`
            },
            {
                lang: "C#",
                code: `using System.Collections.Generic;
public class Solution {
    public int[] FindPairSums(int[] A) {
        var result = new List<int>();
        var used = new bool[A.Length];
        for (int i = 0; i < A.Length; i++) {
            if (used[i]) continue;
            for (int j = i + 1; j < A.Length; j++) {
                if (!used[j] && A[i] < A[j]) {
                    result.Add(A[i] + A[j]);
                    used[i] = true;
                    used[j] = true;
                    break;
                }
            }
        }
        return result.ToArray();
    }
}`
            }
        ]
    },
    {
        id: 4,
        title: "Count Valid Blocks",
        category: "coding",
        description: "Count consecutive blocks of identical numbers where the length of the block is equal to the number itself.",
        solutions: [
            {
                lang: "Java",
                code: `public class Solution {
    public int countValidBlocks(int[] A) {
        int result = 0, i = 0;
        while (i < A.length) {
            int current = A[i];
            int count = 0;
            int j = i;
            while (j < A.length && A[j] == current) {
                count++;
                j++;
            }
            if (count == current) result++;
            i = j;
        }
        return result;
    }
}`
            },
            {
                lang: "Python",
                code: `def count_valid_blocks(A):
    N = len(A)
    result, i = 0, 0
    while i < N:
        current = A[i]
        count = 0
        j = i
        while j < N and A[j] == current:
            count += 1
            j += 1
        if count == current:
            result += 1
        i = j
    return result`
            },
            {
                lang: "C#",
                code: `public class Solution {
    public int CountValidBlocks(int[] A) {
        int result = 0, i = 0;
        while (i < A.Length) {
            int current = A[i];
            int count = 0;
            int j = i;
            while (j < A.Length && A[j] == current) {
                count++;
                j++;
            }
            if (count == current) result++;
            i = j;
        }
        return result;
    }
}`
            }
        ]
    },
    {
        id: 5,
        title: "Balanced Bloom Sum",
        category: "coding",
        description: "Sum elements `A[i]` only if two conditions are met: (1) The count of elements `< A[i]` before it equals the count of elements `> A[i]` after it. (2) The total frequency of `A[i]` in the array is less than 3.",
        solutions: [
            {
                lang: "Java",
                code: `import java.util.HashMap;
import java.util.Map;
public class Solution {
    public int balancedBloomSum(int[] A) {
        int sum = 0;
        Map<Integer, Integer> freq = new HashMap<>();
        for (int x : A) freq.put(x, freq.getOrDefault(x, 0) + 1);
        for (int i = 0; i < A.length; i++) {
            int lessBefore = 0, greaterAfter = 0;
            for (int j = 0; j < i; j++) if (A[j] < A[i]) lessBefore++;
            for (int j = i + 1; j < A.length; j++) if (A[j] > A[i]) greaterAfter++;
            if (lessBefore == greaterAfter && freq.get(A[i]) < 3) {
                sum += A[i];
            }
        }
        return sum;
    }
}`
            },
            {
                lang: "Python",
                code: `from collections import Counter
def balanced_bloom_sum(A):
    total_sum = 0
    freq = Counter(A)
    for i, val in enumerate(A):
        if freq[val] < 3:
            less_before = sum(1 for j in range(i) if A[j] < val)
            greater_after = sum(1 for j in range(i + 1, len(A)) if A[j] > val)
            if less_before == greater_after:
                total_sum += val
    return total_sum`
            },
            {
                lang: "C#",
                code: `using System.Collections.Generic;
using System.Linq;
public class Solution {
    public int BalancedBloomSum(int[] A) {
        int sum = 0;
        var freq = A.GroupBy(x => x).ToDictionary(g => g.Key, g => g.Count());
        for (int i = 0; i < A.Length; i++) {
            if (freq[A[i]] < 3) {
                int lessBefore = 0;
                for (int j = 0; j < i; j++) if (A[j] < A[i]) lessBefore++;
                int greaterAfter = 0;
                for (int j = i + 1; j < A.Length; j++) if (A[j] > A[i]) greaterAfter++;
                if (lessBefore == greaterAfter) sum += A[i];
            }
        }
        return sum;
    }
}`
            }
        ]
    },
    {
        id: 6,
        title: "Find Smallest and Largest Number",
        category: "coding",
        description: "Finds the minimum and maximum values in a given array of integers.",
        solutions: [
            {
                lang: "Java",
                code: `import java.util.Arrays;
public class ArrayProblems {
    public static void findMinMax(int[] arr) {
        if (arr == null || arr.length == 0) return;
        int min = arr[0], max = arr[0];
        for (int i = 1; i < arr.length; i++) {
            if (arr[i] < min) min = arr[i];
            if (arr[i] > max) max = arr[i];
        }
        // Returns an array or object, depending on requirements
    }
}`
            },
            {
                lang: "Python",
                code: `def find_min_max(arr):
    if not arr: return None, None
    return min(arr), max(arr)`
            },
            {
                lang: "C#",
                code: `using System.Linq;
public class ArrayProblems {
    public static (int, int) FindMinMax(int[] arr) {
        if (arr == null || arr.Length == 0) return (-1, -1);
        return (arr.Min(), arr.Max());
    }
}`
            }
        ]
    },
    {
        id: 7,
        title: "Find Missing Number",
        category: "coding",
        description: "Finds the single missing number in an array of consecutive integers from 1 to N.",
        solutions: [
            {
                lang: "Java",
                code: `public class ArrayProblems {
    public static int findMissingNumber(int[] arr) {
        int n = arr.length + 1;
        int expectedSum = n * (n + 1) / 2;
        int actualSum = 0;
        for (int num : arr) actualSum += num;
        return expectedSum - actualSum;
    }
}`
            },
            {
                lang: "Python",
                code: `def find_missing_number(arr):
    n = len(arr) + 1
    expected_sum = n * (n + 1) // 2
    actual_sum = sum(arr)
    return expected_sum - actual_sum`
            },
            {
                lang: "C#",
                code: `using System.Linq;
public class ArrayProblems {
    public static int FindMissingNumber(int[] arr) {
        int n = arr.Length + 1;
        long expectedSum = (long)n * (n + 1) / 2;
        long actualSum = arr.Sum(x => (long)x);
        return (int)(expectedSum - actualSum);
    }
}`
            }
        ]
    },
    {
        id: 8,
        title: "Find Second Largest Number",
        category: "coding",
        description: "Identifies the second largest value in an array in a single pass.",
        solutions: [
            {
                lang: "Java",
                code: `public class ArrayProblems {
    public static int findSecondLargest(int[] arr) {
        if (arr == null || arr.length < 2) return -1;
        int largest = Integer.MIN_VALUE;
        int secondLargest = Integer.MIN_VALUE;
        for (int num : arr) {
            if (num > largest) {
                secondLargest = largest;
                largest = num;
            } else if (num > secondLargest && num != largest) {
                secondLargest = num;
            }
        }
        return secondLargest;
    }
}`
            },
            {
                lang: "Python",
                code: `def find_second_largest(arr):
    if len(arr) < 2: return None
    largest = float('-inf')
    second_largest = float('-inf')
    for num in arr:
        if num > largest:
            second_largest, largest = largest, num
        elif num > second_largest and num != largest:
            second_largest = num
    return second_largest`
            },
            {
                lang: "C#",
                code: `public class ArrayProblems {
    public static int FindSecondLargest(int[] arr) {
        if (arr == null || arr.Length < 2) return -1;
        int largest = int.MinValue;
        int secondLargest = int.MinValue;
        foreach (int num in arr) {
            if (num > largest) {
                secondLargest = largest;
                largest = num;
            } else if (num > secondLargest && num != largest) {
                secondLargest = num;
            }
        }
        return secondLargest;
    }
}`
            }
        ]
    },
    {
        id: 9,
        title: "Rearrange by Small-Large",
        category: "coding",
        description: "Sorts an array and then creates a new array by alternating the smallest and largest elements.",
        solutions: [
            {
                lang: "Java",
                code: `import java.util.Arrays;
public class ArrayProblems {
    public static int[] arrangeSmallLarge(int[] arr) {
        Arrays.sort(arr);
        int[] result = new int[arr.length];
        int left = 0, right = arr.length - 1;
        for (int i = 0; i < arr.length; i++) {
            if (i % 2 == 0) result[i] = arr[left++];
            else result[i] = arr[right--];
        }
        return result;
    }
}`
            },
            {
                lang: "Python",
                code: `def arrange_small_large(arr):
    arr.sort()
    result = []
    left, right = 0, len(arr) - 1
    while left <= right:
        result.append(arr[left])
        if left != right:
            result.append(arr[right])
        left += 1
        right -= 1
    return result`
            },
            {
                lang: "C#",
                code: `using System;
public class ArrayProblems {
    public static int[] ArrangeSmallLarge(int[] arr) {
        Array.Sort(arr);
        int[] result = new int[arr.Length];
        int left = 0, right = arr.Length - 1;
        for (int i = 0; i < arr.Length; i++) {
            if (i % 2 == 0) result[i] = arr[left++];
            else result[i] = arr[right--];
        }
        return result;
    }
}`
            }
        ]
    },
    {
        id: 10,
        title: "Max Contiguous Subarray Sum",
        category: "coding",
        description: "Finds the maximum sum of a contiguous sub-array (Kadane's algorithm).",
        solutions: [
            {
                lang: "Java",
                code: `public class ArrayProblems {
    public static int maxSubarraySum(int[] arr) {
        int maxSoFar = arr[0];
        int maxEndingHere = arr[0];
        for (int i = 1; i < arr.length; i++) {
            maxEndingHere = Math.max(arr[i], maxEndingHere + arr[i]);
            maxSoFar = Math.max(maxSoFar, maxEndingHere);
        }
        return maxSoFar;
    }
}`
            },
            {
                lang: "Python",
                code: `def max_subarray_sum(arr):
    max_so_far = arr[0]
    max_ending_here = arr[0]
    for num in arr[1:]:
        max_ending_here = max(num, max_ending_here + num)
        max_so_far = max(max_so_far, max_ending_here)
    return max_so_far`
            },
            {
                lang: "C#",
                code: `using System;
public class ArrayProblems {
    public static int MaxSubarraySum(int[] arr) {
        int maxSoFar = arr[0];
        int maxEndingHere = arr[0];
        for (int i = 1; i < arr.Length; i++) {
            maxEndingHere = Math.Max(arr[i], maxEndingHere + arr[i]);
            maxSoFar = Math.Max(maxSoFar, maxEndingHere);
        }
        return maxSoFar;
    }
}`
            }
        ]
    },
    {
        id: 11,
        title: "Most Repeated Number",
        category: "coding",
        description: "Counts frequencies to find the number that appears most often.",
        solutions: [
            {
                lang: "Java",
                code: `import java.util.HashMap;
import java.util.Map;
public class ArrayProblems {
    public static int findMostRepeated(int[] arr) {
        Map<Integer, Integer> freqMap = new HashMap<>();
        for (int num : arr) {
            freqMap.put(num, freqMap.getOrDefault(num, 0) + 1);
        }
        int mostRepeated = -1, maxCount = 0;
        for (Map.Entry<Integer, Integer> entry : freqMap.entrySet()) {
            if (entry.getValue() > maxCount) {
                maxCount = entry.getValue();
                mostRepeated = entry.getKey();
            }
        }
        return mostRepeated;
    }
}`
            },
            {
                lang: "Python",
                code: `from collections import Counter
def find_most_repeated(arr):
    if not arr: return None
    counts = Counter(arr)
    return counts.most_common(1)[0][0]`
            },
            {
                lang: "C#",
                code: `using System.Linq;
public class ArrayProblems {
    public static int FindMostRepeated(int[] arr) {
        if (arr == null || arr.Length == 0) return -1;
        return arr.GroupBy(x => x)
                   .OrderByDescending(g => g.Count())
                   .First().Key;
    }
}`
            }
        ]
    },
    {
        id: 12,
        title: "All Unique Elements",
        category: "coding",
        description: "Uses a set to get a collection of unique numbers.",
        solutions: [
            {
                lang: "Java",
                code: `import java.util.stream.IntStream;
public class ArrayProblems {
    public static int[] getUniqueElements(int[] arr) {
        return IntStream.of(arr).distinct().toArray();
    }
}`
            },
            {
                lang: "Python",
                code: `def get_unique_elements(arr):
    return list(dict.fromkeys(arr)) # Preserves order`
            },
            {
                lang: "C#",
                code: `using System.Linq;
public class ArrayProblems {
    public static int[] GetUniqueElements(int[] arr) {
        return arr.Distinct().ToArray();
    }
}`
            }
        ]
    },
    {
        id: 13,
        title: "Rotate Array by N",
        category: "coding",
        description: "Rotates the array elements by a specified number of positions without creating a new array.",
        solutions: [
            {
                lang: "Java",
                code: `public class ArrayProblems {
    private static void reverse(int[] arr, int start, int end) {
        while (start < end) {
            int temp = arr[start];
            arr[start] = arr[end];
            arr[end] = temp;
            start++;
            end--;
        }
    }
    public static void rotateArray(int[] arr, int n) {
        n %= arr.length;
        if (n < 0) n += arr.length;
        reverse(arr, 0, arr.length - 1);
        reverse(arr, 0, n - 1);
        reverse(arr, n, arr.length - 1);
    }
}`
            },
            {
                lang: "Python",
                code: `def rotate_array(arr, n):
    n %= len(arr)
    arr[:] = arr[-n:] + arr[:-n]
    return arr`
            },
            {
                lang: "C#",
                code: `using System;
public class ArrayProblems {
    private static void Reverse(int[] arr, int start, int end) {
        while (start < end) {
            var temp = arr[start];
            arr[start] = arr[end];
            arr[end] = temp;
            start++; end--;
        }
    }
    public static void RotateArray(int[] arr, int n) {
        n %= arr.Length;
        if (n < 0) n += arr.Length;
        Reverse(arr, 0, arr.Length - 1);
        Reverse(arr, 0, n - 1);
        Reverse(arr, n, arr.Length - 1);
    }
}`
            }
        ]
    },
    {
        id: 14,
        title: "Remove All Duplicates (In-Place)",
        category: "coding",
        description: "Removes duplicates from a sorted array in-place and returns the new length.",
        solutions: [
            {
                lang: "Java",
                code: `public class ArrayProblems {
    public static int removeDuplicates(int[] arr) {
        if (arr.length == 0) return 0;
        int insertIndex = 1;
        for (int i = 1; i < arr.length; i++) {
            if (arr[i] != arr[i - 1]) {
                arr[insertIndex++] = arr[i];
            }
        }
        return insertIndex;
    }
}`
            },
            {
                lang: "Python",
                code: `def remove_duplicates(arr):
    if not arr: return 0
    insert_index = 1
    for i in range(1, len(arr)):
        if arr[i] != arr[i - 1]:
            arr[insert_index] = arr[i]
            insert_index += 1
    return insert_index`
            },
            {
                lang: "C#",
                code: `public class ArrayProblems {
    public static int RemoveDuplicates(int[] arr) {
        if (arr.Length == 0) return 0;
        int insertIndex = 1;
        for (int i = 1; i < arr.Length; i++) {
            if (arr[i] != arr[i - 1]) {
                arr[insertIndex++] = arr[i];
            }
        }
        return insertIndex;
    }
}`
            }
        ]
    },
    {
        id: 15,
        title: "Move All 0s to End",
        category: "coding",
        description: "Moves all zeros to the end of the array while maintaining the relative order of non-zero elements.",
        solutions: [
            {
                lang: "Java",
                code: `public class ArrayProblems {
    public static void moveZeros(int[] arr) {
        int nonZeroIndex = 0;
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] != 0) {
                int temp = arr[nonZeroIndex];
                arr[nonZeroIndex] = arr[i];
                arr[i] = temp;
                nonZeroIndex++;
            }
        }
    }
}`
            },
            {
                lang: "Python",
                code: `def move_zeros(arr):
    non_zero_index = 0
    for i in range(len(arr)):
        if arr[i] != 0:
            arr[non_zero_index], arr[i] = arr[i], arr[non_zero_index]
            non_zero_index += 1`
            },
            {
                lang: "C#",
                code: `public class ArrayProblems {
    public static void MoveZeros(int[] arr) {
        int nonZeroIndex = 0;
        for (int i = 0; i < arr.Length; i++) {
            if (arr[i] != 0) {
                var temp = arr[nonZeroIndex];
                arr[nonZeroIndex] = arr[i];
                arr[i] = temp;
                nonZeroIndex++;
            }
        }
    }
}`
            }
        ]
    }
];

