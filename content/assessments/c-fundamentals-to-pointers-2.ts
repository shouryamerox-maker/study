import type { AssessmentDefinition } from "../../src/lib/content/assessment-schema";

/**
 * C Programming — Fundamentals to Pointers (Test 2, medium difficulty).
 * Scope: what the C course teaches up to and including pointers (chapters 1–17: fundamentals,
 * operators, conditions, loops, functions, arrays, strings, pointers, pointers with arrays and
 * functions). Excludes dynamic memory, structures, files and the preprocessor.
 * Every program and expected output below was compiled and run with a C compiler.
 * 10 MCQ × 1 + 5 fill-in × 2 + 5 debugging/completion × 3 + 1 program × 15 = 50 marks.
 */

const opt = (a: string, b: string, c: string, d: string) => [
  { id: "a", text: a },
  { id: "b", text: b },
  { id: "c", text: c },
  { id: "d", text: d },
];

const F1 = `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", /* (1) */);
    if (n % 2 /* (2) */ 0)
        printf("Even\\n");
    else
        printf("Odd\\n");
    return 0;
}`;

const F2 = `int factorial(int n) {
    int result = /* (1) */;
    for (int i = 2; i <= n; i++)
        result /* (2) */ i;
    return result;
}
/* factorial(5) must return 120 */`;

const F3 = `void swap(int *x, int *y) {
    int t = /* (1) */;
    *x = *y;
    *y = /* (2) */;
}`;

const F4 = `#include <stdio.h>

int sum(const int *a, int n) {
    int s = 0;
    for (int i = 0; i < n; i++)
        s += /* (1) */;   /* element i, written with pointer notation */
    return s;
}

int main(void) {
    int nums[5] = {3, 1, 4, 1, 5};
    printf("%d\\n", sum(/* (2) */, 5));
    return 0;
}`;

const F5 = `#include <stdio.h>

int length(const char *s) {
    int n = 0;
    while (/* (1) */ != '\\0') {
        n++;
        s++;
    }
    return n;
}

int main(void) {
    printf("%d\\n", length("pointer"));
    return 0;
}`;

const D1_BUGGY = `#include <stdio.h>

int main(void) {
    int n, sum = 0;
    scanf("%d", &n);
    for (int i = 1; i < n; i++)
        sum = i;
    printf("Sum = %d\\n", sum);
    return 0;
}`;
const D1_FIXED = `#include <stdio.h>

int main(void) {
    int n, sum = 0;
    scanf("%d", &n);
    for (int i = 1; i <= n; i++)
        sum += i;
    printf("Sum = %d\\n", sum);
    return 0;
}`;

const D2_BUGGY = `#include <stdio.h>

void addTen(int *p) {
    p = p + 10;
}

int main(void) {
    int x = 5;
    addTen(x);
    printf("%d\\n", x);
    return 0;
}`;
const D2_FIXED = `#include <stdio.h>

void addTen(int *p) {
    *p = *p + 10;
}

int main(void) {
    int x = 5;
    addTen(&x);
    printf("%d\\n", x);
    return 0;
}`;

const D3_STARTER = `#include <stdio.h>

int findMax(const int *a, int n) {
    int max = a[0];
    for (int i = 1; i < n; i++) {
        if (a[i] > max)
            /* missing line */
    }
    return max;
}

int main(void) {
    int values[4] = {4, 9, 2, 7};
    printf("Max = %d\\n", findMax(values, 4));
    return 0;
}`;
const D3_FIXED = `#include <stdio.h>

int findMax(const int *a, int n) {
    int max = a[0];
    for (int i = 1; i < n; i++) {
        if (a[i] > max)
            max = a[i];
    }
    return max;
}

int main(void) {
    int values[4] = {4, 9, 2, 7};
    printf("Max = %d\\n", findMax(values, 4));
    return 0;
}`;

const D4_STARTER = `#include <stdio.h>

void minMax(int a, int b, int *mn, int *mx) {
    if (a < b) {
        *mn = a;
        *mx = b;
    } else {
        /* missing lines */
    }
}

int main(void) {
    int lo, hi;
    minMax(8, 3, &lo, &hi);
    printf("min=%d max=%d\\n", lo, hi);
    return 0;
}`;
const D4_FIXED = `#include <stdio.h>

void minMax(int a, int b, int *mn, int *mx) {
    if (a < b) {
        *mn = a;
        *mx = b;
    } else {
        *mn = b;
        *mx = a;
    }
}

int main(void) {
    int lo, hi;
    minMax(8, 3, &lo, &hi);
    printf("min=%d max=%d\\n", lo, hi);
    return 0;
}`;

const D5_BUGGY = `#include <stdio.h>

int main(void) {
    int n = 5;
    while (n > 0)
        printf("%d ", n);
        n--;
    printf("Go!\\n");
    return 0;
}`;
const D5_FIXED = `#include <stdio.h>

int main(void) {
    int n = 5;
    while (n > 0) {
        printf("%d ", n);
        n--;
    }
    printf("Go!\\n");
    return 0;
}`;

const P_STARTER = `#include <stdio.h>

#define MAX 20

void swap(int *x, int *y);
void reverse(int *a, int n);
int sumArray(const int *a, int n);

int main(void) {
    /* read n and the numbers, call reverse, print the results */
    return 0;
}
`;

const P_SOLUTION = `#include <stdio.h>

#define MAX 20

void swap(int *x, int *y) {
    int t = *x;
    *x = *y;
    *y = t;
}

void reverse(int *a, int n) {
    int *left = a;
    int *right = a + n - 1;
    while (left < right) {
        swap(left, right);
        left++;
        right--;
    }
}

int sumArray(const int *a, int n) {
    int s = 0;
    for (const int *p = a; p < a + n; p++)
        s += *p;
    return s;
}

void printArray(const int *a, int n) {
    for (int i = 0; i < n; i++) {
        printf("%d", a[i]);
        if (i < n - 1)
            printf(" ");
    }
    printf("\\n");
}

int main(void) {
    int a[MAX], n;
    scanf("%d", &n);
    if (n < 1 || n > MAX) {
        printf("Invalid size\\n");
        return 0;
    }
    for (int i = 0; i < n; i++)
        scanf("%d", &a[i]);
    reverse(a, n);
    printf("Reversed: ");
    printArray(a, n);
    printf("Sum: %d\\n", sumArray(a, n));
    return 0;
}`;

const debugRubric = (find: string, fix: string, works = "Corrected program compiles and prints the expected output") => [
  { criterion: find, marks: 1 },
  { criterion: fix, marks: 1 },
  { criterion: works, marks: 1 },
];

const test: AssessmentDefinition = {
  slug: "c-fundamentals-to-pointers-2",
  courseSlug: "c-programming",
  title: "C Programming — Fundamentals to Pointers (Test 2)",
  description: "Medium-difficulty test on C from the basics through pointers: syntax, data types, operators, conditions, loops, functions, arrays, strings and pointers with arrays and functions.",
  instructions: [
    "This test has **21 questions** in four sections and carries **50 marks**. Time: **75 minutes**.",
    "",
    "- **Section A** (10 marks) and **Section B** (10 marks) are marked automatically.",
    "- **Section C** (15 marks) and **Section D** (15 marks) are marked by your teacher using a rubric. Partial marks are given — a small slip does not cost all the marks.",
    "- In Section B, type only what goes in each blank (for example `&n`). Spaces do not matter.",
    "- Your answers save automatically. You can move between questions and mark questions for review.",
  ].join("\n"),
  durationMinutes: 75,
  attemptLimit: 3,
  resultRelease: "IMMEDIATE",
  showAnswerKey: true,
  assignToAll: true,
  coverage: [
    "introduction",
    "program-structure",
    "variables-constants",
    "data-types",
    "input-output",
    "operators",
    "conditionals",
    "loops",
    "functions",
    "arrays",
    "strings",
    "pointers",
    "pointers-arrays-functions",
  ],
  sections: [
    {
      id: "ct2-sec-a",
      title: "Section A — Multiple choice (10 × 1 mark)",
      instructions: "Choose the single best answer.",
      questions: [
        {
          id: "ct2-a1",
          type: "MCQ",
          marks: 1,
          prompt: "Which of these is a **valid** C identifier?",
          data: { options: opt("`_count`", "`2nd`", "`int`", "`my-var`") },
          answer: { correct: "a" },
          explanation: "Identifiers may start with a letter or underscore. `2nd` starts with a digit, `int` is a keyword and `-` is not allowed.",
        },
        {
          id: "ct2-a2",
          type: "MCQ",
          marks: 1,
          prompt: "What value is stored in `x` after `int x = 10 / 4;`?",
          data: { options: opt("`2.5`", "`2`", "`3`", "`2.0`") },
          answer: { correct: "b" },
          explanation: "Both operands are int, so integer division gives 2 (the fraction is discarded).",
        },
        {
          id: "ct2-a3",
          type: "MCQ",
          marks: 1,
          prompt: "What is the value of the expression `5 % 3 + 2 * 3`?",
          data: { options: opt("`8`", "`12`", "`9`", "`6`") },
          answer: { correct: "a" },
          explanation: "`%` and `*` are evaluated before `+`: 5 % 3 = 2 and 2 * 3 = 6, so 2 + 6 = 8.",
        },
        {
          id: "ct2-a4",
          type: "MCQ",
          marks: 1,
          prompt: "How many times does the body of `for (i = 0; i < 10; i += 3) { … }` execute?",
          data: { options: opt("3", "4", "10", "Infinite") },
          answer: { correct: "b" },
          explanation: "i takes the values 0, 3, 6 and 9 — four iterations. At i = 12 the condition is false.",
        },
        {
          id: "ct2-a5",
          type: "MCQ",
          marks: 1,
          prompt: "In `if (x != 0 && y / x > 1)`, what happens when `x` is `0`?",
          data: {
            options: opt(
              "The program always crashes with a division by zero",
              "`y / x > 1` is not evaluated, because `&&` stops once the left side is false",
              "Both sides are always evaluated",
              "It is a compile-time error",
            ),
          },
          answer: { correct: "b" },
          explanation: "`&&` short-circuits: if the left operand is false the right operand is never evaluated, so no division by zero occurs.",
        },
        {
          id: "ct2-a6",
          type: "MCQ",
          marks: 1,
          prompt: "A function is declared as `void show(int n);`. Which statement is correct?",
          data: {
            options: opt(
              "It returns an int",
              "It returns no value, so `int y = show(3);` is invalid",
              "It cannot take any parameters",
              "It must be called with a pointer",
            ),
          },
          answer: { correct: "b" },
          explanation: "`void` return type means the function returns nothing, so its call cannot be used as a value.",
        },
        {
          id: "ct2-a7",
          type: "MCQ",
          marks: 1,
          prompt: "After `int a = 5; int *p = &a; *p = *p * 2;`, what is the value of `a`?",
          data: { options: opt("`5`", "`10`", "The address of `a`", "`2`") },
          answer: { correct: "b" },
          explanation: "`*p` refers to `a`, so `*p = *p * 2` doubles `a` to 10.",
        },
        {
          id: "ct2-a8",
          type: "MCQ",
          marks: 1,
          prompt: "Given `int arr[4] = {2, 4, 6, 8}; int *p = arr;`, what is the value of `*(p + 3)`?",
          data: { options: opt("`6`", "`8`", "`5`", "`11`") },
          answer: { correct: "b" },
          explanation: "`*(p + 3)` is the same as `arr[3]`, which is 8.",
        },
        {
          id: "ct2-a9",
          type: "MCQ",
          marks: 1,
          prompt: "A function must change the value of an `int` variable belonging to its caller. Its parameter should be of type:",
          data: { options: opt("`int`", "`int *`", "`void`", "`const int`") },
          answer: { correct: "b" },
          explanation: "Passing the variable's address (int *) lets the function modify it through the pointer.",
        },
        {
          id: "ct2-a10",
          type: "MCQ",
          marks: 1,
          prompt: "If `p` points to `arr[0]` of an `int` array, what does `p + 1` point to?",
          data: {
            options: opt(
              "The next byte in memory",
              "The next `int` element, `arr[1]` (the address increases by `sizeof(int)`)",
              "The value `arr[0] + 1`",
              "Nothing — pointer arithmetic is not allowed",
            ),
          },
          answer: { correct: "b" },
          explanation: "Pointer arithmetic moves in units of the pointed-to type, so p + 1 points to the next int element.",
        },
      ],
    },
    {
      id: "ct2-sec-b",
      title: "Section B — Fill in the code (5 × 2 marks)",
      instructions: "Each blank is worth 1 mark. Type exactly what belongs in each numbered blank in the code.",
      questions: [
        {
          id: "ct2-b1",
          type: "FILL_BLANK",
          marks: 2,
          prompt: "The program reads an integer and prints whether it is even or odd. Blank (1): ___ Blank (2): ___",
          code: F1,
          data: { blanks: 2 },
          answer: { accepted: [["&n"], ["=="]] },
          explanation: "`scanf` needs the address `&n`; an even number has remainder 0, tested with `==`.",
        },
        {
          id: "ct2-b2",
          type: "FILL_BLANK",
          marks: 2,
          prompt: "Complete the loop-based factorial function. Blank (1): ___ Blank (2): ___",
          code: F2,
          data: { blanks: 2 },
          answer: { accepted: [["1"], ["*="]] },
          explanation: "The product must start at 1 (not 0), and `result *= i` multiplies it by each i.",
        },
        {
          id: "ct2-b3",
          type: "FILL_BLANK",
          marks: 2,
          prompt: "Complete the swap function so that `swap(&a, &b)` exchanges `a` and `b`. Blank (1): ___ Blank (2): ___",
          code: F3,
          data: { blanks: 2 },
          answer: { accepted: [["*x"], ["t"]] },
          explanation: "Save the value at x (`*x`) in t, copy *y into *x, then put the saved value t into *y.",
        },
        {
          id: "ct2-b4",
          type: "FILL_BLANK",
          marks: 2,
          prompt: "The program prints the sum of the array (14). Blank (1) must use **pointer notation** for element i. Blank (1): ___ Blank (2): ___",
          code: F4,
          data: { blanks: 2 },
          answer: { accepted: [["*(a + i)", "*(i + a)"], ["nums", "&nums[0]"]] },
          explanation: "`*(a + i)` is element i in pointer notation. Passing `nums` passes the address of its first element.",
        },
        {
          id: "ct2-b5",
          type: "FILL_BLANK",
          marks: 2,
          prompt: "The function counts characters in a string by moving a pointer. Blank (1) is the loop test; blank (2) is the number the program prints. Blank (1): ___ Blank (2): ___",
          code: F5,
          data: { blanks: 2 },
          answer: { accepted: [["*s"], ["7"]] },
          explanation: "`*s` is the current character; the loop stops at the terminator '\\0'. \"pointer\" has 7 characters.",
        },
      ],
    },
    {
      id: "ct2-sec-c",
      title: "Section C — Debugging and code completion (5 × 3 marks)",
      instructions: "Explain what is wrong or missing in the explanation box, and submit the corrected/completed program in the code box.",
      questions: [
        {
          id: "ct2-c1",
          type: "DEBUGGING",
          marks: 3,
          prompt: "This program should print the sum of 1 to n. For input `5` it should print `Sum = 15`, but it prints `Sum = 4`. Find and fix the **two** mistakes.",
          code: D1_BUGGY,
          data: { starterCode: D1_BUGGY },
          answer: {
            correctedCode: D1_FIXED,
            tests: [{ stdin: "5", expected: "Sum = 15" }],
            errors: ["The condition `i < n` stops before n — it must be `i <= n`.", "`sum = i` overwrites the total — it must be `sum += i` (or `sum = sum + i`)."],
          },
          rubric: debugRubric("Finds and fixes the loop condition (i <= n)", "Finds and fixes the accumulation (sum += i)"),
        },
        {
          id: "ct2-c2",
          type: "DEBUGGING",
          marks: 3,
          prompt: "`addTen` should add 10 to the caller's variable, so the program prints `15`. Explain the two mistakes and fix them.",
          code: D2_BUGGY,
          data: { starterCode: D2_BUGGY },
          answer: {
            correctedCode: D2_FIXED,
            tests: [{ stdin: "", expected: "15" }],
            errors: [
              "Inside the function, `p = p + 10` changes the pointer itself (where it points), not the value — it must dereference: `*p = *p + 10` (or `*p += 10`).",
              "The call passes the value `x` instead of its address — it must be `addTen(&x)`. (Passing an int where `int *` is expected is a compiler warning/error.)",
            ],
          },
          rubric: debugRubric("Fixes the function to dereference: *p = *p + 10 (or *p += 10)", "Fixes the call to pass the address: addTen(&x)", "Explains why (pointer vs value) and the corrected program prints 15"),
        },
        {
          id: "ct2-c3",
          type: "DEBUGGING",
          marks: 3,
          prompt: "**Complete the missing line** so that `findMax` returns the largest element. The program should print `Max = 9`.",
          code: D3_STARTER,
          data: { starterCode: D3_STARTER },
          answer: {
            correctedCode: D3_FIXED,
            tests: [{ stdin: "", expected: "Max = 9" }],
            errors: ["The missing line is `max = a[i];` (or `max = *(a + i);`), which records the new largest value."],
          },
          rubric: debugRubric("Writes the missing statement max = a[i] (or *(a + i))", "Places it correctly inside the if", "Program compiles and prints Max = 9"),
        },
        {
          id: "ct2-c4",
          type: "DEBUGGING",
          marks: 3,
          prompt: "**Complete the missing lines** in the `else` branch so that `minMax` returns the smaller and larger values through the pointers. The program should print `min=3 max=8`.",
          code: D4_STARTER,
          data: { starterCode: D4_STARTER },
          answer: {
            correctedCode: D4_FIXED,
            tests: [{ stdin: "", expected: "min=3 max=8" }],
            errors: ["The else branch must store `*mn = b;` and `*mx = a;` — writing through the pointers so the caller's lo and hi change."],
          },
          rubric: debugRubric("Writes *mn = b (stores the minimum through the pointer)", "Writes *mx = a (stores the maximum through the pointer)", "Program compiles and prints min=3 max=8"),
        },
        {
          id: "ct2-c5",
          type: "DEBUGGING",
          marks: 3,
          prompt: "This countdown should print `5 4 3 2 1 Go!` but it never stops. Explain why and fix it.",
          code: D5_BUGGY,
          data: { starterCode: D5_BUGGY },
          answer: {
            correctedCode: D5_FIXED,
            tests: [{ stdin: "", expected: "5 4 3 2 1 Go!" }],
            errors: ["Without braces only the `printf` belongs to the `while` loop; `n--` runs after the loop, so n stays 5 and the loop never ends. Add braces around both statements."],
          },
          rubric: debugRubric("Identifies that only printf is inside the loop (missing braces), so n never changes — an infinite loop", "Adds braces around printf and n--"),
        },
      ],
    },
    {
      id: "ct2-sec-d",
      title: "Section D — Programming (15 marks)",
      instructions: "Write a complete C program. You may run it against the sample test if code execution is enabled.",
      questions: [
        {
          id: "ct2-d1",
          type: "CODE_WRITING",
          marks: 15,
          prompt: [
            "**Reverse an array in place using pointers.**",
            "",
            "Write a program that reads an integer `n` (1 ≤ n ≤ 20) and then `n` integers into an array. Use these functions:",
            "",
            "1. `void swap(int *x, int *y)` — swaps the two integers that `x` and `y` point to.",
            "2. `void reverse(int *a, int n)` — reverses the array **in place** by calling `swap` (use pointers or indexes, but the original array must be changed).",
            "3. `int sumArray(const int *a, int n)` — returns the sum of the elements using **pointer arithmetic** (e.g. `*(a + i)` or a moving pointer).",
            "",
            "Print exactly:",
            "",
            "```",
            "Reversed: <elements separated by single spaces>",
            "Sum: <sum>",
            "```",
            "",
            "If `n` is outside 1–20, print `Invalid size` and stop.",
            "",
            "**Sample input**",
            "```",
            "5",
            "1 2 3 4 5",
            "```",
            "**Sample output**",
            "```",
            "Reversed: 5 4 3 2 1",
            "Sum: 15",
            "```",
          ].join("\n"),
          data: {
            starterCode: P_STARTER,
            sampleTests: [{ stdin: "5\n1 2 3 4 5\n", expected: "Reversed: 5 4 3 2 1\nSum: 15" }],
          },
          answer: {
            solutionCode: P_SOLUTION,
            hiddenTests: [
              { stdin: "1\n-7\n", expected: "Reversed: -7\nSum: -7" },
              { stdin: "6\n10 -3 8 0 2 9\n", expected: "Reversed: 9 2 0 8 -3 10\nSum: 26" },
              { stdin: "4\n-1 -2 -3 -4\n", expected: "Reversed: -4 -3 -2 -1\nSum: -10" },
              { stdin: "0\n", expected: "Invalid size" },
            ],
          },
          rubric: [
            { criterion: "Program structure: the three functions defined with the required signatures and called from main; array read correctly", marks: 3 },
            { criterion: "swap exchanges two values through pointers (temporary variable, *x and *y)", marks: 3 },
            { criterion: "reverse changes the original array in place by calling swap on matching pairs (stops at the middle)", marks: 3 },
            { criterion: "sumArray computes the sum using pointer arithmetic", marks: 3 },
            { criterion: "Correct output format, size check (Invalid size) and an overall working program", marks: 3 },
          ],
          explanation: "See the model solution. Partial credit is given per rubric line.",
        },
      ],
    },
  ],
};

export default test;
