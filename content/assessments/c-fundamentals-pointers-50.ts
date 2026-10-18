import type { AssessmentDefinition } from "../../src/lib/content/assessment-schema";

/**
 * C Programming Fundamentals & Pointers — 50 marks.
 * Original questions. Every expected output below was verified by compiling and running
 * the code (see README "Verifying test content").
 *
 * Sections: A 6×1 MCQ · B 10×1 blanks · C 6×2 output · D 3×3 debugging · E 2×4 short · F 1×5 program = 50
 */

const C1 = `#include <stdio.h>

int main(void) {
    int a = 17, b = 5;
    printf("%d %d %d\\n", a / b, a % b, a - b * 2);
    return 0;
}`;

const C2 = `#include <stdio.h>

int main(void) {
    int x = 5;
    int y = x++ + 2;
    int z = ++x * 2;
    printf("x=%d y=%d z=%d\\n", x, y, z);
    return 0;
}`;

const C3 = `#include <stdio.h>

int main(void) {
    int marks = 72;
    if (marks >= 90)
        printf("A\\n");
    else if (marks >= 70)
        printf("B\\n");
    else if (marks >= 50)
        printf("C\\n");
    else
        printf("F\\n");

    switch (marks / 10) {
        case 7:
            printf("seventy");
        case 8:
            printf("-eighty");
            break;
        default:
            printf("other");
    }
    printf("\\n");
    return 0;
}`;

const C4 = `#include <stdio.h>

int main(void) {
    int i, sum = 0;
    for (i = 1; i <= 10; i++) {
        if (i % 2 == 0)
            continue;
        if (i > 7)
            break;
        sum += i;
    }
    printf("sum=%d i=%d\\n", sum, i);
    return 0;
}`;

const C5 = `#include <stdio.h>

int square(int n) {
    return n * n;
}

void change(int n) {
    n = 100;
}

int main(void) {
    int v = 4;
    change(v);
    printf("%d %d\\n", v, square(v + 1));
    return 0;
}`;

const C6 = `#include <stdio.h>

int main(void) {
    int arr[] = {10, 20, 30, 40, 50};
    int *p = arr;
    p += 2;
    printf("%d ", *p);
    printf("%d ", *(p + 1));
    printf("%d ", p[-1]);
    *p = *p + 5;
    printf("%d\\n", arr[2]);
    return 0;
}`;

const D1_BUGGY = `#include <stdio.h>

int main(void) {
    int age;
    printf("Enter your age: ");
    scanf("%d", age);
    printf("You are %f years old\\n", age)
    return 0;
}`;

const D1_FIXED = `#include <stdio.h>

int main(void) {
    int age;
    printf("Enter your age: ");
    scanf("%d", &age);
    printf("You are %d years old\\n", age);
    return 0;
}`;

const D2_BUGGY = `#include <stdio.h>

int main(void) {
    int nums[5] = {4, 8, 15, 16, 23};
    int sum;
    for (int i = 1; i <= 5; i++) {
        sum = sum + nums[i];
    }
    printf("Sum = %d\\n", sum);
    return 0;
}`;

const D2_FIXED = `#include <stdio.h>

int main(void) {
    int nums[5] = {4, 8, 15, 16, 23};
    int sum = 0;
    for (int i = 0; i < 5; i++) {
        sum = sum + nums[i];
    }
    printf("Sum = %d\\n", sum);
    return 0;
}`;

const D3_BUGGY = `#include <stdio.h>

void swap(int a, int b) {
    int temp = a;
    a = b;
    b = temp;
}

int main(void) {
    int x = 3, y = 9;
    swap(x, y);
    printf("x = %d, y = %d\\n", x, y);
    return 0;
}`;

const D3_FIXED = `#include <stdio.h>

void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main(void) {
    int x = 3, y = 9;
    swap(&x, &y);
    printf("x = %d, y = %d\\n", x, y);
    return 0;
}`;

const F_STARTER = `#include <stdio.h>

#define MAX 20

void readArray(int *arr, int n);
void printArray(const int *arr, int n);
void findMinMax(const int *arr, int n, int *min, int *max);
int doubleEvens(int *arr, int n);

int main(void) {
    /* your code here */
    return 0;
}

/* define the four functions below */
`;

const F_SOLUTION = `#include <stdio.h>

#define MAX 20

void readArray(int *arr, int n) {
    for (int i = 0; i < n; i++) {
        scanf("%d", arr + i);
    }
}

void printArray(const int *arr, int n) {
    for (int i = 0; i < n; i++) {
        printf("%d", *(arr + i));
        if (i < n - 1)
            printf(" ");
    }
    printf("\\n");
}

void findMinMax(const int *arr, int n, int *min, int *max) {
    *min = arr[0];
    *max = arr[0];
    for (int i = 1; i < n; i++) {
        if (arr[i] < *min)
            *min = arr[i];
        if (arr[i] > *max)
            *max = arr[i];
    }
}

int doubleEvens(int *arr, int n) {
    int count = 0;
    for (int *p = arr; p < arr + n; p++) {
        if (*p % 2 == 0) {
            *p = *p * 2;
            count++;
        }
    }
    return count;
}

int main(void) {
    int arr[MAX];
    int n, min, max;

    scanf("%d", &n);
    if (n < 1 || n > MAX) {
        printf("Invalid size\\n");
        return 1;
    }
    readArray(arr, n);

    printf("Original: ");
    printArray(arr, n);

    findMinMax(arr, n, &min, &max);
    printf("Min: %d, Max: %d\\n", min, max);

    int doubled = doubleEvens(arr, n);
    printf("Doubled evens: %d\\n", doubled);

    printf("Updated: ");
    printArray(arr, n);
    return 0;
}`;

const opt = (a: string, b: string, c: string, d: string) => [
  { id: "a", text: a },
  { id: "b", text: b },
  { id: "c", text: c },
  { id: "d", text: d },
];

const test: AssessmentDefinition = {
  slug: "c-fundamentals-pointers-50",
  courseSlug: "c-programming",
  title: "C Programming Fundamentals & Pointers — 50 Marks",
  description:
    "A comprehensive assessment of introductory C: program structure, input/output, variables and data types, operators, conditions and loops, functions, arrays, addresses, dereferencing and passing pointers to functions.",
  instructions: [
    "This test has **28 questions** in six sections and carries **50 marks**.",
    "",
    "- Sections A–C are marked automatically. Sections D–F are marked by your teacher using a rubric; partial marks are awarded.",
    "- Your answers are saved automatically as you work. You can move between questions and mark any question for review.",
    "- For output questions, type the output **exactly** as the program prints it, one line per line of output.",
    "- When the timer reaches zero your answers are submitted automatically.",
    "- Results are released by your teacher.",
  ].join("\n"),
  durationMinutes: 90,
  attemptLimit: 1,
  resultRelease: "MANUAL",
  showAnswerKey: true,
  assignToAll: false,
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
    "pointers",
    "pointers-arrays-functions",
  ],
  sections: [
    {
      id: "cf50-sec-a",
      title: "Section A — Multiple choice (6 × 1 mark)",
      instructions: "Choose the single best answer.",
      questions: [
        {
          id: "cf50-a1",
          type: "MCQ",
          marks: 1,
          prompt: "Execution of every C program begins in which function?",
          data: { options: opt("`start()`", "`main()`", "`init()`", "`printf()`") },
          answer: { correct: "b" },
          explanation: "The operating system calls `main()` first; every hosted C program must define it.",
        },
        {
          id: "cf50-a2",
          type: "MCQ",
          marks: 1,
          prompt: "Which `printf()` format specifier prints a value of type `double` in decimal notation?",
          data: { options: opt("`%d`", "`%c`", "`%f`", "`%s`") },
          answer: { correct: "c" },
          explanation: "`%f` prints a floating-point value (a `float` argument is promoted to `double`). `%d` is for `int`, `%c` for a character, `%s` for a string.",
        },
        {
          id: "cf50-a3",
          type: "MCQ",
          marks: 1,
          prompt: "What is the value of the expression `7 / 2` in C?",
          data: { options: opt("`3.5`", "`3`", "`4`", "`3.0`") },
          answer: { correct: "b" },
          explanation: "Both operands are `int`, so integer division is performed and the fractional part is discarded: `7 / 2` is `3`.",
        },
        {
          id: "cf50-a4",
          type: "MCQ",
          marks: 1,
          prompt: "Which loop always executes its body at least once, even if the condition is false at the start?",
          data: { options: opt("`for`", "`while`", "`do-while`", "None of these") },
          answer: { correct: "c" },
          explanation: "A `do-while` loop checks its condition after the body runs, so the body executes at least once.",
        },
        {
          id: "cf50-a5",
          type: "MCQ",
          marks: 1,
          prompt: "Given `int a[5];`, which expression is equivalent to `a[2]`?",
          data: { options: opt("`*a + 2`", "`*(a + 2)`", "`&a + 2`", "`a * 2`") },
          answer: { correct: "b" },
          explanation: "Array indexing is defined as pointer arithmetic: `a[i]` means `*(a + i)`. `*a + 2` adds 2 to the first element's value.",
        },
        {
          id: "cf50-a6",
          type: "MCQ",
          marks: 1,
          prompt: "After `int x = 10; int *p = &x;`, what does the statement `*p = 20;` do?",
          data: {
            options: opt(
              "Makes `p` point to memory address 20",
              "Stores 20 in `x`",
              "Causes a compile-time error",
              "Creates a new variable with the value 20",
            ),
          },
          answer: { correct: "b" },
          explanation: "`*p` refers to the object `p` points to, which is `x`, so assigning to `*p` changes `x` to 20.",
        },
      ],
    },
    {
      id: "cf50-sec-b",
      title: "Section B — Fill in the blanks (10 × 1 mark)",
      instructions: "Type the missing word, symbol or keyword. Spelling and symbols matter; extra spaces and capital letters do not (except where C itself is case-sensitive).",
      questions: [
        {
          id: "cf50-b1",
          type: "FILL_BLANK",
          marks: 1,
          prompt: "To use `printf()` and `scanf()`, a program includes the header file `#include <___>`.",
          data: { blanks: 1 },
          answer: { accepted: [["stdio.h", "<stdio.h>"]] },
          explanation: "`stdio.h` declares the standard input/output functions.",
        },
        {
          id: "cf50-b2",
          type: "FILL_BLANK",
          marks: 1,
          prompt: "The unary operator that gives the memory address of a variable is ___ .",
          data: { blanks: 1 },
          answer: { accepted: [["&", "ampersand", "& operator", "address-of operator", "address of operator"]] },
          explanation: "`&x` evaluates to the address of `x`.",
        },
        {
          id: "cf50-b3",
          type: "FILL_BLANK",
          marks: 1,
          prompt: "The operator used to access the value stored at the address held in a pointer (dereferencing) is ___ .",
          data: { blanks: 1 },
          answer: { accepted: [["*", "asterisk", "* operator", "indirection operator", "dereference operator"]] },
          explanation: "`*p` gives the object that `p` points to.",
        },
        {
          id: "cf50-b4",
          type: "FILL_BLANK",
          marks: 1,
          prompt: "The keyword that sends a value from a function back to its caller is ___ .",
          data: { blanks: 1 },
          answer: { accepted: [["return"]], caseSensitive: true },
          explanation: "`return expression;` ends the function and gives the value to the caller. C keywords are lowercase.",
        },
        {
          id: "cf50-b5",
          type: "FILL_BLANK",
          marks: 1,
          prompt: "The format specifier used with `scanf()` to read a value into a variable of type `int` is ___ .",
          data: { blanks: 1 },
          answer: { accepted: [["%d", "%i"]] },
          explanation: "`%d` (or `%i`) reads a decimal integer into an `int`.",
        },
        {
          id: "cf50-b6",
          type: "FILL_BLANK",
          marks: 1,
          prompt: "Declaring `___ int DAYS = 7;` makes `DAYS` a read-only variable whose value cannot be changed after initialisation.",
          data: { blanks: 1 },
          answer: { accepted: [["const"]], caseSensitive: true },
          explanation: "The `const` qualifier makes the object read-only.",
        },
        {
          id: "cf50-b7",
          type: "FILL_BLANK",
          marks: 1,
          prompt: "The index of the first element of any C array is ___ .",
          data: { blanks: 1 },
          answer: { accepted: [["0", "zero"]] },
          explanation: "C arrays are zero-indexed; the last element of an array of size n has index n − 1.",
        },
        {
          id: "cf50-b8",
          type: "FILL_BLANK",
          marks: 1,
          prompt: "A function that does not return any value is declared with the return type ___ .",
          data: { blanks: 1 },
          answer: { accepted: [["void"]], caseSensitive: true },
          explanation: "`void` means the function returns nothing.",
        },
        {
          id: "cf50-b9",
          type: "FILL_BLANK",
          marks: 1,
          prompt: "The operator that gives the remainder after integer division (e.g. the remainder of 17 divided by 5) is ___ .",
          data: { blanks: 1 },
          answer: { accepted: [["%", "modulus", "modulo", "modulus operator", "modulo operator"]] },
          explanation: "`17 % 5` is `2`.",
        },
        {
          id: "cf50-b10",
          type: "FILL_BLANK",
          marks: 1,
          prompt: "A pointer that does not point to any valid object should be initialised to ___ .",
          data: { blanks: 1 },
          answer: { accepted: [["NULL", "0"]], caseSensitive: true },
          explanation: "`NULL` (defined in `<stdio.h>`, `<stddef.h>` and others) is the null pointer constant. C is case-sensitive, so `null` is not valid.",
        },
      ],
    },
    {
      id: "cf50-sec-c",
      title: "Section C — Predict the output (6 × 2 marks)",
      instructions: "Write exactly what each program prints. Put each line of output on its own line.",
      questions: [
        {
          id: "cf50-c1",
          type: "OUTPUT_PREDICTION",
          marks: 2,
          prompt: "What does this program print?",
          code: C1,
          answer: { expected: "3 2 7" },
          explanation: "`17 / 5` is 3 (integer division), `17 % 5` is 2, and `17 - 5 * 2` is `17 - 10` = 7 because `*` binds tighter than `-`.",
        },
        {
          id: "cf50-c2",
          type: "OUTPUT_PREDICTION",
          marks: 2,
          prompt: "What does this program print?",
          code: C2,
          answer: { expected: "x=7 y=7 z=14" },
          explanation: "`x++ + 2` uses the old value 5, so `y` is 7 and `x` becomes 6. `++x` increments first, so `x` is 7 and `z` is `7 * 2` = 14.",
        },
        {
          id: "cf50-c3",
          type: "OUTPUT_PREDICTION",
          marks: 2,
          prompt: "What does this program print? Pay attention to the `switch`.",
          code: C3,
          answer: { expected: "B\nseventy-eighty" },
          explanation: "72 ≥ 70 prints `B`. `72 / 10` is 7, so `case 7` runs; it has no `break`, so execution falls through into `case 8`, printing `-eighty`, then `break` exits.",
        },
        {
          id: "cf50-c4",
          type: "OUTPUT_PREDICTION",
          marks: 2,
          prompt: "What does this program print?",
          code: C4,
          answer: { expected: "sum=16 i=9" },
          explanation: "Even values are skipped by `continue`. Odd values 1, 3, 5, 7 are added (sum 16). When `i` is 9 the `break` runs, so the loop stops with `i` = 9.",
        },
        {
          id: "cf50-c5",
          type: "OUTPUT_PREDICTION",
          marks: 2,
          prompt: "What does this program print?",
          code: C5,
          answer: { expected: "4 25" },
          explanation: "`change()` receives a copy of `v` (call by value), so `v` stays 4. `square(v + 1)` is `square(5)` = 25.",
        },
        {
          id: "cf50-c6",
          type: "OUTPUT_PREDICTION",
          marks: 2,
          prompt: "What does this program print?",
          code: C6,
          answer: { expected: "30 40 20 35" },
          explanation: "After `p += 2`, `p` points to `arr[2]` (30). `*(p + 1)` is `arr[3]` (40), `p[-1]` is `arr[1]` (20). `*p = *p + 5` changes `arr[2]` to 35.",
        },
      ],
    },
    {
      id: "cf50-sec-d",
      title: "Section D — Debugging (3 × 3 marks)",
      instructions:
        "Each program contains genuine mistakes. In the explanation box, list each mistake and why it is wrong. In the code box, submit the corrected program. Marks are awarded per mistake found and fixed.",
      questions: [
        {
          id: "cf50-d1",
          type: "DEBUGGING",
          marks: 3,
          prompt:
            "This program should read the user's age and print it. It contains **three** mistakes. Find and correct them.\n\nExample: for input `19` the corrected program prints `Enter your age: You are 19 years old`.",
          code: D1_BUGGY,
          data: { starterCode: D1_BUGGY },
          answer: {
            correctedCode: D1_FIXED,
            tests: [{ stdin: "19", expected: "Enter your age: You are 19 years old" }],
            errors: [
              "`scanf(\"%d\", age)` passes the value of `age` instead of its address — must be `&age`.",
              "`%f` is used to print an `int` — must be `%d`.",
              "Missing semicolon at the end of the second `printf` statement.",
            ],
          },
          rubric: [
            { criterion: "Identifies and fixes the missing & in scanf (scanf needs the address of age)", marks: 1 },
            { criterion: "Identifies and fixes the wrong format specifier (%f → %d for an int)", marks: 1 },
            { criterion: "Identifies and fixes the missing semicolon after printf", marks: 1 },
          ],
        },
        {
          id: "cf50-d2",
          type: "DEBUGGING",
          marks: 3,
          prompt:
            "This program should print the sum of the five array elements (`Sum = 66`). It contains **three** mistakes. Find and correct them.",
          code: D2_BUGGY,
          data: { starterCode: D2_BUGGY },
          answer: {
            correctedCode: D2_FIXED,
            tests: [{ stdin: "", expected: "Sum = 66" }],
            errors: [
              "`sum` is used without being initialised — its starting value is indeterminate. Must be `int sum = 0;`.",
              "The loop starts at index 1, so `nums[0]` is never added. Must start at 0.",
              "`i <= 5` reads `nums[5]`, which is outside the array (undefined behaviour). Must be `i < 5`.",
            ],
          },
          rubric: [
            { criterion: "Initialises sum to 0 and explains why an uninitialised variable is wrong", marks: 1 },
            { criterion: "Starts the loop at index 0 (first element is nums[0])", marks: 1 },
            { criterion: "Uses i < 5 to avoid reading past the end of the array", marks: 1 },
          ],
        },
        {
          id: "cf50-d3",
          type: "DEBUGGING",
          marks: 3,
          prompt:
            "This program is meant to swap `x` and `y` using a function, printing `x = 9, y = 3`. Instead it prints `x = 3, y = 9`. Explain why, and correct it so that the swap works **using pointers**.",
          code: D3_BUGGY,
          data: { starterCode: D3_BUGGY },
          answer: {
            correctedCode: D3_FIXED,
            tests: [{ stdin: "", expected: "x = 9, y = 3" }],
            errors: [
              "C passes arguments by value: `swap()` swaps its own copies, so `x` and `y` in `main` are unchanged.",
              "Parameters must be pointers (`int *a, int *b`) and the body must dereference them (`*a`, `*b`).",
              "The call must pass addresses: `swap(&x, &y);`.",
            ],
          },
          rubric: [
            { criterion: "Explains the cause (call by value — the function swaps copies) and changes parameters to int *a, int *b", marks: 1 },
            { criterion: "Dereferences the pointers correctly inside swap (temp = *a; *a = *b; *b = temp;)", marks: 1 },
            { criterion: "Calls swap with addresses: swap(&x, &y)", marks: 1 },
          ],
        },
      ],
    },
    {
      id: "cf50-sec-e",
      title: "Section E — Short answer (2 × 4 marks)",
      instructions: "Answer in your own words. Short code examples are welcome. Partial marks are awarded using the rubric.",
      questions: [
        {
          id: "cf50-e1",
          type: "SHORT_ANSWER",
          marks: 4,
          prompt:
            "Explain the difference between passing a variable **by value** and passing a **pointer** to a function in C. Use a short example to show when a function can and cannot change the caller's variable, and give one practical reason for passing a pointer.",
          answer: {
            modelAnswer:
              "By value: the function receives a copy of the argument; changes to the parameter do not affect the caller's variable (e.g. `void inc(int n){ n++; }` leaves `x` unchanged after `inc(x)`). By pointer: the function receives the address of the caller's variable; dereferencing the pointer reads/writes the original (e.g. `void inc(int *n){ (*n)++; }` with `inc(&x)` increases `x`). Reasons: to modify the caller's variables, to return more than one result (e.g. min and max), or to avoid copying large data such as arrays/structures.",
          },
          rubric: [
            { criterion: "Call by value: the function works on a copy, so the caller's variable is unchanged", marks: 1 },
            { criterion: "Passing a pointer: the address is passed and dereferencing (*p) accesses/changes the original variable", marks: 1 },
            { criterion: "A correct short example contrasting the two (or a clear example of one with the call shown)", marks: 1 },
            { criterion: "A valid practical reason (modify caller's data, return multiple values, avoid copying large data)", marks: 1 },
          ],
        },
        {
          id: "cf50-e2",
          type: "SHORT_ANSWER",
          marks: 4,
          prompt:
            "What is a pointer? Using the code below, explain the meaning of `&` and of `*` (both in the declaration and in the expression) and describe what the program prints and why.",
          code: `int n = 5;\nint *p = &n;\n*p = *p + 1;\nprintf("%d", n);`,
          answer: {
            modelAnswer:
              "A pointer is a variable that stores the memory address of another object. `&n` gives the address of `n`, which is stored in `p`. In the declaration `int *p`, `*` means \"p is a pointer to int\". In `*p = *p + 1`, `*` dereferences p — it reads the int at that address (5), adds 1 and writes 6 back into the same location, which is `n`. So `printf` prints 6.",
          },
          rubric: [
            { criterion: "Defines a pointer as a variable that holds the address of another variable/object", marks: 1 },
            { criterion: "Explains & as the address-of operator (p stores the address of n)", marks: 1 },
            { criterion: "Distinguishes * in the declaration (pointer type) from * as dereference (access the pointed-to value)", marks: 1 },
            { criterion: "States the output is 6 and explains that n itself was modified through p", marks: 1 },
          ],
        },
      ],
    },
    {
      id: "cf50-sec-f",
      title: "Section F — Programming (5 marks)",
      instructions: "Write a complete C program. You may run your code against the sample test before submitting if code execution is enabled.",
      questions: [
        {
          id: "cf50-f1",
          type: "CODE_WRITING",
          marks: 5,
          prompt: [
            "**Array processing with pointers and functions.**",
            "",
            "Write a program that reads an integer `n` (1 ≤ n ≤ 20) followed by `n` integers into an array, then uses **these four functions**:",
            "",
            "1. `void readArray(int *arr, int n)` — reads `n` integers into the array.",
            "2. `void printArray(const int *arr, int n)` — prints the elements on one line separated by single spaces, followed by a newline.",
            "3. `void findMinMax(const int *arr, int n, int *min, int *max)` — stores the smallest and largest values **through the pointer parameters** `min` and `max`.",
            "4. `int doubleEvens(int *arr, int n)` — doubles every even element **in place** (modifying the original array through the pointer) and returns how many elements were doubled.",
            "",
            "`main()` must print exactly:",
            "",
            "```",
            "Original: <elements>",
            "Min: <min>, Max: <max>",
            "Doubled evens: <count>",
            "Updated: <elements after doubling>",
            "```",
            "",
            "If `n` is outside 1–20, print `Invalid size` and stop.",
            "",
            "**Sample input**",
            "```",
            "6",
            "3 8 -2 7 10 5",
            "```",
            "**Sample output**",
            "```",
            "Original: 3 8 -2 7 10 5",
            "Min: -2, Max: 10",
            "Doubled evens: 3",
            "Updated: 3 16 -4 7 20 5",
            "```",
          ].join("\n"),
          data: {
            starterCode: F_STARTER,
            sampleTests: [{ stdin: "6\n3 8 -2 7 10 5\n", expected: "Original: 3 8 -2 7 10 5\nMin: -2, Max: 10\nDoubled evens: 3\nUpdated: 3 16 -4 7 20 5" }],
          },
          answer: {
            solutionCode: F_SOLUTION,
            hiddenTests: [
              { stdin: "1\n-7\n", expected: "Original: -7\nMin: -7, Max: -7\nDoubled evens: 0\nUpdated: -7" },
              { stdin: "5\n2 4 6 8 10\n", expected: "Original: 2 4 6 8 10\nMin: 2, Max: 10\nDoubled evens: 5\nUpdated: 4 8 12 16 20" },
              { stdin: "4\n-3 -1 -9 -5\n", expected: "Original: -3 -1 -9 -5\nMin: -9, Max: -1\nDoubled evens: 0\nUpdated: -3 -1 -9 -5" },
              { stdin: "0\n", expected: "Invalid size" },
            ],
          },
          rubric: [
            { criterion: "Program structure and function design: all four functions defined with the required signatures and called from main", marks: 1 },
            { criterion: "Correct use of arrays/pointers as function arguments (array passed as int *, &min/&max passed)", marks: 1 },
            { criterion: "Correct pointer-based processing: min/max written through pointers and evens doubled in place via the pointer", marks: 1 },
            { criterion: "Correct calculation and logic (min/max over all elements, even test, count returned, size check)", marks: 1 },
            { criterion: "Correct output format and an overall working program (minor syntax slips may still earn partial credit elsewhere)", marks: 1 },
          ],
          explanation: "See the model solution. Partial credit is awarded per rubric line; a small syntax error does not cancel marks earned for correct design and logic.",
        },
      ],
    },
  ],
};

export default test;
