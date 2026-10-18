import type { ChapterContent } from "../../../src/lib/content/schema";

const chapter: ChapterContent = {
  slug: "arrays",
  title: "Arrays",
  summary:
    "Store many values of the same type under one name: declaring and initialising arrays, indexing and traversal, staying inside the bounds, classic array algorithms, passing arrays to functions, and two-dimensional arrays for tables and matrices.",
  topics: [
    {
      slug: "one-dimensional-arrays",
      title: "One-dimensional arrays",
      lessons: [
        {
          slug: "array-basics",
          title: "Declaring, initialising and indexing arrays",
          summary:
            "What an array is, how to declare and initialise it, how zero-based indexing works, how to loop over every element, and why going out of bounds is undefined behaviour.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Explain what an array is and why it is useful",
                "Declare and initialise arrays in several ways",
                "Access and modify elements using zero-based indices",
                "Traverse an array with a for loop",
                "Explain why accessing an element outside the array is undefined behaviour",
              ],
            },
            {
              type: "markdown",
              md: `Suppose you need to store the marks of 50 students. With what you know so far, you would need 50 separate variables: \`mark1\`, \`mark2\`, ... \`mark50\`. Computing the average would mean typing 50 names. And if the class grew to 60 students, you would have to rewrite the program.

An **array** solves this. It is a single variable that holds a **fixed number of values of the same type**, stored one after another in memory. You refer to an individual value by its position, called its **index**.

Think of an array as a row of numbered lockers in a school corridor. All lockers are the same size (same type), they are side by side (contiguous memory), and you open one by its number (its index). The whole row has one name, such as \`marks\`.`,
            },
            {
              type: "definition",
              term: "Array",
              md: "A fixed-size collection of elements of the same data type, stored in consecutive memory locations and accessed by a single name plus an index.",
            },
            {
              type: "definition",
              term: "Element",
              md: "One individual value stored in an array, such as `marks[3]`.",
            },
            {
              type: "definition",
              term: "Index (subscript)",
              md: "The position number used to select an element. In C, indices start at **0**, so an array of size N has valid indices 0 to N − 1.",
            },
            {
              type: "syntax",
              language: "c",
              code: `type name[SIZE];                       /* declaration */
type name[SIZE] = { v0, v1, v2, ... }; /* declaration with initialiser */
type name[] = { v0, v1, v2 };          /* size deduced from the list (3) */

name[index]                            /* access one element */`,
              md: "`SIZE` must be a positive integer constant in standard beginner-level C (for example `5` or a `#define`d constant).",
            },
            {
              type: "table",
              caption: "Memory picture of int marks[5] = {72, 85, 90, 64, 78};",
              headers: ["Index", "0", "1", "2", "3", "4"],
              rows: [["Value", "72", "85", "90", "64", "78"]],
            },
            {
              type: "code",
              language: "c",
              title: "Creating, reading and changing elements",
              code: `#include <stdio.h>

int main(void)
{
    int marks[5] = {72, 85, 90, 64, 78};

    printf("First mark: %d\\n", marks[0]);
    printf("Last mark: %d\\n", marks[4]);

    marks[3] = 70;              /* change the 4th element */
    marks[0] = marks[0] + 5;    /* add 5 to the 1st element */

    printf("After changes: %d %d %d %d %d\\n",
           marks[0], marks[1], marks[2], marks[3], marks[4]);
    return 0;
}`,
              runnable: true,
              output: `First mark: 72
Last mark: 78
After changes: 77 85 90 70 78`,
              walkthrough: [
                { lines: "5", text: "Declares an array of 5 `int`s and fills it from the braces: index 0 gets 72, index 1 gets 85, and so on." },
                { lines: "7-8", text: "The first element is at index 0 and the last at index 4 (size − 1), **not** 5." },
                { lines: "10", text: "An element is used just like an ordinary variable — here we assign a new value to `marks[3]`." },
                { lines: "11", text: "Elements can appear on both sides of an assignment: read `marks[0]`, add 5, store it back." },
                { lines: "13-14", text: "Printing each element by its index shows the updated array." },
              ],
            },
            {
              type: "heading",
              text: "Ways to initialise",
              level: 2,
            },
            {
              type: "markdown",
              md: `| Declaration | Resulting contents |
|---|---|
| \`int a[5] = {1, 2, 3, 4, 5};\` | 1 2 3 4 5 |
| \`int a[5] = {1, 2};\` | 1 2 0 0 0 — missing elements become **0** |
| \`int a[5] = {0};\` | 0 0 0 0 0 — a common idiom to zero an array |
| \`int a[] = {4, 8, 15};\` | size is deduced as 3 |
| \`int a[5];\` (inside a function) | **garbage** — unpredictable values until you assign them |

The last row is important: a local array without an initialiser is *not* automatically zero. Reading its elements before writing them gives meaningless values.`,
            },
            {
              type: "heading",
              text: "Traversal: visiting every element with a loop",
              level: 2,
            },
            {
              type: "markdown",
              md: `The real power of arrays appears when you combine them with loops. Because the index can be a **variable**, one loop can visit all elements:

\`\`\`c
for (i = 0; i < SIZE; i++)
    /* do something with a[i] */
\`\`\`

Note the condition \`i < SIZE\`, not \`i <= SIZE\`. The loop runs for i = 0, 1, ..., SIZE − 1 — exactly the valid indices.`,
            },
            {
              type: "code",
              language: "c",
              title: "Reading values into an array and printing them back",
              code: `#include <stdio.h>

#define N 5

int main(void)
{
    int values[N];
    int i;

    for (i = 0; i < N; i++)
        scanf("%d", &values[i]);

    printf("In order:  ");
    for (i = 0; i < N; i++)
        printf("%d ", values[i]);
    printf("\\n");

    printf("Reversed:  ");
    for (i = N - 1; i >= 0; i--)
        printf("%d ", values[i]);
    printf("\\n");

    printf("Number of elements: %d\\n", (int)(sizeof values / sizeof values[0]));
    return 0;
}`,
              runnable: true,
              stdin: "10 20 30 40 50",
              output: `In order:  10 20 30 40 50
Reversed:  50 40 30 20 10
Number of elements: 5`,
              walkthrough: [
                { lines: "3", text: "Using a named constant for the size means we only change one line if the size changes." },
                { lines: "7", text: "An array of N ints with no initialiser — we fill it from input next." },
                { lines: "10-11", text: "`&values[i]` is the address of element i, which is what `scanf` needs (just like `&x` for a plain variable)." },
                { lines: "14-15", text: "Forward traversal: i goes 0, 1, 2, 3, 4." },
                { lines: "19-20", text: "Backward traversal: start at the last valid index N − 1 and go down to 0." },
                { lines: "23", text: "`sizeof values` is the total size of the array in bytes; dividing by the size of one element gives the element count. This only works on a real array, not on an array parameter (see the next lesson). We cast to `int` to print with `%d`." },
              ],
            },
            {
              type: "heading",
              text: "Array bounds: C does not check them",
              level: 2,
            },
            {
              type: "markdown",
              md: `For \`int a[5]\`, the elements are \`a[0]\` to \`a[4]\`. Writing \`a[5]\` or \`a[-1]\` refers to memory that **does not belong to the array**. C does **not** check this for you — no error message, no exception. The behaviour is **undefined**: the program might print a strange number, silently overwrite another variable, crash, or appear to work perfectly today and fail tomorrow.`,
            },
            {
              type: "definition",
              term: "Undefined behaviour (UB)",
              md: "Program behaviour that the C standard places no requirements on. Anything can happen, and results may differ between compilers, machines or even runs. Accessing an array out of bounds is UB.",
            },
            {
              type: "callout",
              variant: "warning",
              title: "Off-by-one is the classic array bug",
              md: "`for (i = 0; i <= 5; i++) a[i] = 0;` on `int a[5]` writes one element past the end. Train yourself to read `i < N` as \"for every valid index\".",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `Because all elements have the same size and sit next to each other, the computer can find any element instantly with simple arithmetic: *address of a[i] = start address + i × size of one element*. That is why indexing is very fast no matter how large the array is, and also why indices start at 0 — element 0 is at the start, with an offset of zero. It also explains the danger of going out of bounds: the formula happily computes an address beyond the array, and C trusts you.`,
            },
            {
              type: "heading",
              text: "Real-world uses",
              level: 2,
            },
            {
              type: "markdown",
              md: `- Storing sensor readings, exam marks, daily temperatures or prices for processing.
- Audio is an array of samples; a greyscale image row is an array of pixel brightness values.
- Lookup tables: \`daysInMonth[12] = {31, 28, 31, ...}\` turns a month number into a day count without a long \`switch\`.
- Buffers for input and output — every string you will meet in the next chapter is an array of characters.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Using index N for the last element",
                  wrong: `int a[5] = {1, 2, 3, 4, 5};
printf("%d\\n", a[5]);   /* out of bounds: UB */`,
                  right: `int a[5] = {1, 2, 3, 4, 5};
printf("%d\\n", a[4]);   /* last element */`,
                  md: "An array of size N has indices 0 to N − 1. Index N is one past the end.",
                },
                {
                  title: "Loop condition with <=",
                  wrong: `for (i = 0; i <= N; i++)
    sum += a[i];`,
                  right: `for (i = 0; i < N; i++)
    sum += a[i];`,
                  md: "`<=` makes the loop run N + 1 times and read `a[N]`, which is outside the array.",
                },
                {
                  title: "Assuming an uninitialised local array is zero",
                  wrong: `int count[10];
count[3]++;      /* count[3] was garbage */`,
                  right: `int count[10] = {0};
count[3]++;      /* now 1 */`,
                  md: "Local arrays contain unpredictable values. Initialise them (`= {0}`) or fill them in a loop before use.",
                },
                {
                  title: "Trying to copy or compare arrays with = or ==",
                  wrong: `int a[3] = {1, 2, 3}, b[3];
b = a;          /* compile error */`,
                  right: `int a[3] = {1, 2, 3}, b[3], i;
for (i = 0; i < 3; i++)
    b[i] = a[i];`,
                  md: "Whole arrays cannot be assigned. Copy element by element (or later, with `memcpy`). Similarly `a == b` does not compare contents.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "Array indices in C start at 0; the last valid index is size − 1.",
                "Missing initialisers are set to 0: `int a[5] = {1, 2};` gives 1 2 0 0 0.",
                "Uninitialised local arrays contain garbage values.",
                "C performs no bounds checking; accessing out of bounds is undefined behaviour.",
                "sizeof(arr) / sizeof(arr[0]) gives the element count only for a true array in scope.",
                "Arrays cannot be assigned or compared as a whole with = or ==.",
              ],
            },
            {
              type: "recap",
              items: [
                "An array stores many values of one type in consecutive memory.",
                "Declare with `type name[SIZE];`, access with `name[i]`.",
                "Use `for (i = 0; i < N; i++)` to visit every element.",
                "Stay within 0 … N − 1 — the compiler will not stop you.",
              ],
            },
            {
              type: "exercise",
              id: "c14-ex-squares",
              kind: "write",
              title: "Table of squares",
              prompt: "Declare an `int` array of size 8. Use one loop to store `i * i` in element `i`, then a second loop to print all elements separated by spaces, followed by a newline.",
              hint: "First loop: `sq[i] = i * i;`. Second loop: print `sq[i]`.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int sq[8];
    int i;
    for (i = 0; i < 8; i++)
        sq[i] = i * i;
    for (i = 0; i < 8; i++)
        printf("%d ", sq[i]);
    printf("\\n");
    return 0;
}`,
              expectedOutput: "0 1 4 9 16 25 36 49",
            },
            {
              type: "exercise",
              id: "c14-ex-predict-partial-init",
              kind: "predict",
              title: "Partial initialisation",
              prompt: "Predict the output.",
              starterCode: `#include <stdio.h>

int main(void)
{
    int a[6] = {3, 1, 4};
    int i;
    a[4] = a[0] + a[2];
    for (i = 0; i < 6; i++)
        printf("%d ", a[i]);
    printf("\\n");
    return 0;
}`,
              hint: "Elements not listed in the braces start at 0.",
              solution: "Initially 3 1 4 0 0 0. Then a[4] = 3 + 4 = 7.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int a[6] = {3, 1, 4};
    int i;
    a[4] = a[0] + a[2];
    for (i = 0; i < 6; i++)
        printf("%d ", a[i]);
    printf("\\n");
    return 0;
}`,
              expectedOutput: "3 1 4 0 7 0",
            },
            {
              type: "exercise",
              id: "c14-ex-debug-bounds",
              kind: "debug",
              title: "Find the bounds bug",
              prompt: "This program is supposed to print the 4 temperatures but sometimes prints a strange fifth number. Explain the bug and fix it.",
              starterCode: `#include <stdio.h>

int main(void)
{
    int temp[4] = {21, 23, 19, 25};
    int i;
    for (i = 1; i <= 4; i++)
        printf("%d\\n", temp[i]);
    return 0;
}`,
              hint: "Which index does the loop start at, and which one does it end at?",
              solution: "The loop uses indices 1 to 4. It skips temp[0] and reads temp[4], which is out of bounds (undefined behaviour). Use `for (i = 0; i < 4; i++)`.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c14-last-index-mcq",
              prompt: "Given `double prices[20];`, which expression refers to the **last** element?",
              options: [
                { id: "a", text: "prices[20]" },
                { id: "b", text: "prices[19]" },
                { id: "c", text: "prices[-1]" },
                { id: "d", text: "prices[21]" },
              ],
              correct: "b",
              explanation: "Indices run from 0 to 19 for an array of 20 elements.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c14-bounds-tf",
              prompt: "If you access `a[10]` on an array declared as `int a[10];`, the C compiler or runtime is guaranteed to report an error.",
              correct: false,
              explanation: "C does no bounds checking. Out-of-bounds access is undefined behaviour — it may crash, print garbage or seem to work.",
            },
            {
              type: "FILL_BLANK",
              slug: "c14-zero-init-fill",
              prompt: "To declare an int array `count` of 26 elements with every element set to zero, write: `int count[26] = ___;`",
              accepted: [["{0}", "{ 0 }", "{}"]],
              explanation: "`{0}` sets the first element to 0 and all remaining elements are zero-initialised.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c14-predict-traverse",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

int main(void)
{
    int a[] = {5, 10, 15, 20};
    int i;
    for (i = 3; i >= 0; i -= 2)
        printf("%d ", a[i]);
    printf("\\n");
    return 0;
}`,
              expected: "20 10",
              explanation: "i takes the values 3 and 1, printing a[3] = 20 and a[1] = 10. Then i becomes −1 and the loop stops.",
            },
          ],
        },
        {
          slug: "array-algorithms-and-functions",
          title: "Array algorithms and passing arrays to functions",
          summary:
            "Classic array algorithms — sum, average, maximum, minimum, linear search, counting and reversing — and how to pass arrays to functions correctly.",
          estMinutes: 35,
          blocks: [
            {
              type: "objectives",
              items: [
                "Compute the sum, average, maximum and minimum of an array",
                "Implement linear search and report where a value was found",
                "Pass an array and its length to a function",
                "Explain why a function can modify the caller's array",
              ],
            },
            {
              type: "markdown",
              md: `Most array programs are built from a handful of patterns. Once you know them, you will spot them everywhere:

- **Accumulate** — keep a running total (sum, product, count).
- **Track the best so far** — maximum, minimum, longest, earliest.
- **Search** — look at each element until you find what you want.
- **Transform in place** — change elements, such as reversing or scaling.

Each pattern is a loop over the indices with a small amount of extra state kept in ordinary variables.`,
            },
            {
              type: "definition",
              term: "Accumulator",
              md: "A variable that collects a result across loop iterations, such as `sum`, which starts at 0 and has each element added to it.",
            },
            {
              type: "definition",
              term: "Linear search",
              md: "Checking elements one by one from the start until the target is found or the array ends. It works on any array, sorted or not, and needs up to N comparisons.",
            },
            {
              type: "code",
              language: "c",
              title: "Sum, average, maximum and minimum",
              code: `#include <stdio.h>

int main(void)
{
    int marks[] = {72, 85, 90, 64, 78, 88};
    int n = sizeof marks / sizeof marks[0];
    int i, sum = 0;
    int max = marks[0], min = marks[0];
    int maxPos = 0;

    for (i = 0; i < n; i++) {
        sum += marks[i];
        if (marks[i] > max) {
            max = marks[i];
            maxPos = i;
        }
        if (marks[i] < min)
            min = marks[i];
    }

    printf("Sum: %d\\n", sum);
    printf("Average: %.2f\\n", (double)sum / n);
    printf("Highest: %d (student %d)\\n", max, maxPos + 1);
    printf("Lowest: %d\\n", min);
    return 0;
}`,
              runnable: true,
              output: `Sum: 477
Average: 79.50
Highest: 90 (student 3)
Lowest: 64`,
              walkthrough: [
                { lines: "6", text: "Compute the number of elements from the array itself, so adding marks to line 5 needs no other change." },
                { lines: "7", text: "The accumulator `sum` must start at 0." },
                { lines: "8", text: "Start max and min at the **first element**, not at 0. If all marks were negative, starting max at 0 would give a wrong answer." },
                { lines: "12", text: "Accumulate pattern: add each element to the total." },
                { lines: "13-16", text: "Best-so-far pattern: when we see a bigger value, remember it and its index." },
                { lines: "22", text: "Cast to `double` before dividing; otherwise integer division would throw away the .50." },
                { lines: "23", text: "Indices start at 0 but humans count from 1, so we print `maxPos + 1`." },
              ],
            },
            {
              type: "heading",
              text: "Passing arrays to functions",
              level: 2,
            },
            {
              type: "markdown",
              md: `Writing every algorithm inside \`main\` gets messy. Functions that take arrays let you write \`sum(marks, n)\` and reuse it.

There are two key facts:

1. **Pass the length separately.** Inside the function, the parameter does not know how many elements the array has, so you must pass that number as another argument.
2. **The function works on the caller's actual array.** When you pass an array, C passes the **address of its first element**, not a copy of all the elements. So if the function changes \`a[i]\`, the caller's array changes too. (You will see exactly why in the pointers chapters.)`,
            },
            {
              type: "syntax",
              language: "c",
              code: `return_type func(type arr[], int n);   /* prototype: [] with no size */

func(myArray, count);                   /* call: just the array's name */`,
              md: "In the parameter list, `int arr[]` and `int arr[100]` mean the same thing — any number inside the brackets is ignored. In the call, write only the array name, without brackets.",
            },
            {
              type: "code",
              language: "c",
              title: "Reusable array functions",
              code: `#include <stdio.h>

void printArray(int a[], int n)
{
    int i;
    for (i = 0; i < n; i++)
        printf("%d ", a[i]);
    printf("\\n");
}

int linearSearch(int a[], int n, int target)
{
    int i;
    for (i = 0; i < n; i++)
        if (a[i] == target)
            return i;
    return -1;
}

void reverse(int a[], int n)
{
    int i, tmp;
    for (i = 0; i < n / 2; i++) {
        tmp = a[i];
        a[i] = a[n - 1 - i];
        a[n - 1 - i] = tmp;
    }
}

int main(void)
{
    int data[] = {4, 8, 15, 16, 23, 42};
    int n = 6;
    int pos;

    printArray(data, n);
    pos = linearSearch(data, n, 16);
    printf("16 found at index %d\\n", pos);
    printf("99 found at index %d\\n", linearSearch(data, n, 99));

    reverse(data, n);
    printArray(data, n);
    return 0;
}`,
              runnable: true,
              output: `4 8 15 16 23 42
16 found at index 3
99 found at index -1
42 23 16 15 8 4`,
              walkthrough: [
                { lines: "3", text: "`int a[]` receives the array; `n` tells the function how many elements to use." },
                { lines: "11-18", text: "Linear search returns the index as soon as it finds the target. Only if the loop finishes without finding it do we return −1, a value that can never be a valid index." },
                { lines: "20-28", text: "Reverse swaps the first with the last, the second with the second-last, and so on. We only go to n / 2; going all the way would swap everything back." },
                { lines: "25-26", text: "`n - 1 - i` is the mirror position of `i`. For i = 0 it is the last index." },
                { lines: "36-38", text: "Calls pass just the name `data` plus the length." },
                { lines: "41-42", text: "After `reverse(data, n)`, the array in `main` is reversed: the function changed the caller's array, not a copy." },
              ],
            },
            {
              type: "callout",
              variant: "warning",
              title: "sizeof does not work on array parameters",
              md: "Inside `void f(int a[])`, the expression `sizeof a` gives the size of an **address**, not of the whole array. That is why `sizeof a / sizeof a[0]` gives a wrong count inside a function and the length must be passed in.",
            },
            {
              type: "callout",
              variant: "tip",
              title: "Protect arrays you do not intend to change",
              md: "Write `int sum(const int a[], int n)`. The `const` promises the function will not modify the elements, and the compiler will complain if it accidentally tries.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `Each algorithm keeps a tiny amount of state (a sum, a best value, a position) and updates it while the loop visits each index exactly once. This guarantees every element is considered and the loop always ends after N steps. Passing an array by its starting address is efficient — passing a million-element array costs the same as passing one address — and it is what lets helper functions like \`reverse\` modify data in place.`,
            },
            {
              type: "heading",
              text: "Real-world applications",
              level: 2,
            },
            {
              type: "markdown",
              md: `- A gradebook computing the class average, top score and failing count.
- A weather station finding the highest and lowest temperature of the month.
- Searching an inventory list for a product code.
- Libraries such as the C standard library's \`qsort\` and \`bsearch\` take an array and its length, exactly like the functions above.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Initialising max to 0",
                  wrong: `int max = 0;
for (i = 0; i < n; i++)
    if (a[i] > max) max = a[i];   /* wrong if all values are negative */`,
                  right: `int max = a[0];
for (i = 1; i < n; i++)
    if (a[i] > max) max = a[i];`,
                  md: "Start the best-so-far with an actual element so the result is always a value from the array.",
                },
                {
                  title: "Returning -1 too early in a search",
                  wrong: `for (i = 0; i < n; i++) {
    if (a[i] == target) return i;
    else return -1;          /* gives up after one element */
}`,
                  right: `for (i = 0; i < n; i++)
    if (a[i] == target) return i;
return -1;                   /* only after checking all */`,
                  md: "You only know the target is absent after checking **every** element, so `return -1` belongs after the loop.",
                },
                {
                  title: "Using sizeof on a parameter to get the length",
                  wrong: `int sum(int a[])
{
    int n = sizeof a / sizeof a[0];   /* NOT the element count */
    ...
}`,
                  right: `int sum(int a[], int n)
{
    ...
}`,
                  md: "An array parameter is really an address. Pass the length as a separate parameter.",
                },
                {
                  title: "Writing brackets in the function call",
                  wrong: `printArray(data[], 6);   /* syntax error */
printArray(data[6], 6);  /* passes one (out-of-bounds) int */`,
                  right: `printArray(data, 6);`,
                  md: "To pass the whole array, use just its name.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "When an array is passed to a function, the address of its first element is passed — not a copy.",
                "A function can therefore modify the caller's array elements.",
                "The array length must be passed as a separate parameter.",
                "Initialise max/min with the first element, not with 0.",
                "Linear search returns −1 (or similar) only after the whole array has been checked.",
                "Reversing in place swaps a[i] with a[n − 1 − i] for i < n / 2.",
              ],
            },
            {
              type: "recap",
              items: [
                "Patterns: accumulate, best-so-far, search, transform in place.",
                "Function parameter `int a[]` plus an `int n` for the length.",
                "Changes made through an array parameter are visible to the caller.",
                "Use `const` for array parameters the function should only read.",
              ],
            },
            {
              type: "exercise",
              id: "c14-ex-count-above",
              kind: "write",
              title: "Count values above average",
              prompt: "Write a function `int countAbove(const int a[], int n, double limit)` that returns how many elements are greater than `limit`. In `main`, use the array `{12, 7, 19, 3, 25, 10}`, compute its average, and print `Average: 12.67` and `Above average: 2` on two lines.",
              hint: "Compute the sum first, divide by n as a double, then call countAbove with that average.",
              solutionCode: `#include <stdio.h>

int countAbove(const int a[], int n, double limit)
{
    int i, count = 0;
    for (i = 0; i < n; i++)
        if (a[i] > limit)
            count++;
    return count;
}

int main(void)
{
    int a[] = {12, 7, 19, 3, 25, 10};
    int n = 6, i, sum = 0;
    double avg;
    for (i = 0; i < n; i++)
        sum += a[i];
    avg = (double)sum / n;
    printf("Average: %.2f\\n", avg);
    printf("Above average: %d\\n", countAbove(a, n, avg));
    return 0;
}`,
              expectedOutput: `Average: 12.67
Above average: 2`,
            },
            {
              type: "exercise",
              id: "c14-ex-predict-modify",
              kind: "predict",
              title: "Does the function change the array?",
              prompt: "Predict the output.",
              starterCode: `#include <stdio.h>

void doubleAll(int a[], int n)
{
    int i;
    for (i = 0; i < n; i++)
        a[i] *= 2;
}

void tryChange(int x)
{
    x *= 2;
}

int main(void)
{
    int arr[3] = {1, 2, 3};
    int v = 5;
    doubleAll(arr, 3);
    tryChange(v);
    printf("%d %d %d %d\\n", arr[0], arr[1], arr[2], v);
    return 0;
}`,
              hint: "Arrays are passed by their address; plain ints are copied.",
              solution: "doubleAll modifies the original array (2 4 6), but tryChange only changes its own copy of v, which stays 5.",
              solutionCode: `#include <stdio.h>

void doubleAll(int a[], int n)
{
    int i;
    for (i = 0; i < n; i++)
        a[i] *= 2;
}

void tryChange(int x)
{
    x *= 2;
}

int main(void)
{
    int arr[3] = {1, 2, 3};
    int v = 5;
    doubleAll(arr, 3);
    tryChange(v);
    printf("%d %d %d %d\\n", arr[0], arr[1], arr[2], v);
    return 0;
}`,
              expectedOutput: "2 4 6 5",
            },
            {
              type: "exercise",
              id: "c14-ex-concept-length",
              kind: "concept",
              title: "Why pass n?",
              prompt: "Explain in two or three sentences why array functions in C almost always take the number of elements as an extra parameter.",
              hint: "What does the function actually receive?",
              solution: "When an array is passed, the function only receives the address of the first element, so it has no information about how many elements follow. Without the length it cannot know where to stop, and `sizeof` on the parameter gives the size of an address, not of the array.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c14-pass-array-mcq",
              prompt: "What is actually passed to `f` in the call `f(scores, 10);` where `scores` is an `int` array?",
              options: [
                { id: "a", text: "A copy of all 10 elements" },
                { id: "b", text: "The address of the first element of scores" },
                { id: "c", text: "The value of scores[0]" },
                { id: "d", text: "The value of scores[10]" },
              ],
              correct: "b",
              explanation: "Arrays are passed as the address of their first element, so f works on the original data.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c14-predict-max-pos",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

int main(void)
{
    int a[] = {3, 9, 2, 9, 5};
    int i, best = 0;
    for (i = 1; i < 5; i++)
        if (a[i] > a[best])
            best = i;
    printf("%d %d\\n", best, a[best]);
    return 0;
}`,
              expected: "1 9",
              explanation: "`>` (not `>=`) means the first 9, at index 1, is kept; the second 9 is not strictly greater.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c14-param-size-tf",
              prompt: "In the parameter declaration `void f(int a[50])`, the number 50 limits the function to arrays of exactly 50 elements.",
              correct: false,
              explanation: "The size in an array parameter is ignored; `int a[50]`, `int a[]` and `int *a` all mean the same thing.",
            },
            {
              type: "FILL_BLANK",
              slug: "c14-reverse-index-fill",
              prompt: "When reversing an array of length n in place, element `a[i]` is swapped with element `a[___]`.",
              accepted: [["n - 1 - i", "n-1-i", "n - i - 1", "n-i-1"]],
            },
            {
              type: "CODE_WRITING",
              slug: "c14-code-max-min",
              prompt: "Read an integer `n` (1 ≤ n ≤ 100) followed by `n` integers. Store them in an array and print the largest and smallest values on one line, separated by a space.\n\nExample: input `5` then `3 -2 8 0 5` → output `8 -2`.",
              starterCode: `#include <stdio.h>

int main(void)
{
    int a[100];
    int n, i;
    scanf("%d", &n);
    /* read the values and find max and min */
    return 0;
}`,
              sampleTests: [
                { stdin: "5\n3 -2 8 0 5", expected: "8 -2" },
                { stdin: "1\n42", expected: "42 42" },
              ],
              hiddenTests: [
                { stdin: "4\n-5 -9 -1 -7", expected: "-1 -9" },
                { stdin: "6\n10 10 10 10 10 10", expected: "10 10" },
                { stdin: "3\n100 -100 0", expected: "100 -100" },
              ],
              solutionCode: `#include <stdio.h>

int main(void)
{
    int a[100];
    int n, i, max, min;
    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &a[i]);
    max = min = a[0];
    for (i = 1; i < n; i++) {
        if (a[i] > max) max = a[i];
        if (a[i] < min) min = a[i];
    }
    printf("%d %d\\n", max, min);
    return 0;
}`,
              explanation: "Start max and min at a[0] so that all-negative inputs work.",
            },
          ],
        },
      ],
    },
    {
      slug: "multidimensional-arrays",
      title: "Two-dimensional arrays",
      lessons: [
        {
          slug: "two-dimensional-arrays",
          title: "2D arrays and matrices",
          summary:
            "Declare and initialise two-dimensional arrays, traverse them with nested loops, compute row and column totals, add and transpose matrices, and pass 2D arrays to functions.",
          estMinutes: 35,
          blocks: [
            {
              type: "objectives",
              items: [
                "Declare and initialise a two-dimensional array",
                "Access elements with row and column indices",
                "Traverse a 2D array using nested loops",
                "Implement row/column sums, matrix addition and transpose",
                "Pass a 2D array to a function with the correct parameter type",
              ],
            },
            {
              type: "markdown",
              md: `Many kinds of data are naturally a **grid**: a spreadsheet, a seating plan, a chessboard, the marks of several students in several subjects, or a mathematical **matrix**. C models a grid with a **two-dimensional (2D) array** — conceptually a table with rows and columns.

Picture a cinema: seat "row 2, seat 5" is found with two numbers. Likewise \`seats[2][5]\` is the element in row 2, column 5 (both counted from 0).`,
            },
            {
              type: "definition",
              term: "Two-dimensional array",
              md: "An array of arrays: `int m[R][C]` has R rows, each of which is an array of C ints. Element `m[i][j]` is in row i and column j.",
            },
            {
              type: "definition",
              term: "Row-major order",
              md: "The way C lays out a 2D array in memory: all of row 0 first, then all of row 1, and so on. The elements of one row are contiguous.",
            },
            {
              type: "syntax",
              language: "c",
              code: `type name[ROWS][COLS];

type name[ROWS][COLS] = {
    { r0c0, r0c1, ... },
    { r1c0, r1c1, ... },
    ...
};

name[row][col]          /* access one element */`,
              md: "When initialising, you may omit the number of rows (`int m[][3] = {...}`), but never the number of columns.",
            },
            {
              type: "table",
              caption: "int m[2][3] = {{1, 2, 3}, {4, 5, 6}};",
              headers: ["", "col 0", "col 1", "col 2"],
              rows: [
                ["row 0", "m[0][0] = 1", "m[0][1] = 2", "m[0][2] = 3"],
                ["row 1", "m[1][0] = 4", "m[1][1] = 5", "m[1][2] = 6"],
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Student marks: row and column totals",
              code: `#include <stdio.h>

#define STUDENTS 3
#define SUBJECTS 4

int main(void)
{
    int marks[STUDENTS][SUBJECTS] = {
        {70, 85, 60, 90},
        {55, 65, 75, 80},
        {88, 92, 79, 95}
    };
    int i, j, total;

    for (i = 0; i < STUDENTS; i++) {
        total = 0;
        for (j = 0; j < SUBJECTS; j++) {
            printf("%4d", marks[i][j]);
            total += marks[i][j];
        }
        printf("  | total %d\\n", total);
    }

    printf("Subject averages:");
    for (j = 0; j < SUBJECTS; j++) {
        total = 0;
        for (i = 0; i < STUDENTS; i++)
            total += marks[i][j];
        printf(" %.1f", (double)total / STUDENTS);
    }
    printf("\\n");
    return 0;
}`,
              runnable: true,
              output: `  70  85  60  90  | total 305
  55  65  75  80  | total 275
  88  92  79  95  | total 354
Subject averages: 71.0 80.7 71.3 88.3`,
              walkthrough: [
                { lines: "8-12", text: "A 3 × 4 array initialised row by row. Each inner brace list is one row (one student)." },
                { lines: "15-22", text: "Row-wise traversal: the outer loop picks a row (student), the inner loop walks across its columns (subjects)." },
                { lines: "16", text: "Reset the total at the start of **each** row." },
                { lines: "18", text: "`%4d` prints each mark in a field 4 characters wide so the columns line up." },
                { lines: "25-30", text: "Column-wise traversal: now the outer loop picks a column (subject) and the inner loop goes down the rows. Swapping which loop is outer changes what we total." },
              ],
            },
            {
              type: "heading",
              text: "Matrices",
              level: 2,
            },
            {
              type: "markdown",
              md: `In mathematics, a matrix is a rectangular grid of numbers. Two common operations:

- **Addition:** two matrices of the same size are added element by element: \`C[i][j] = A[i][j] + B[i][j]\`.
- **Transpose:** rows become columns: \`T[j][i] = A[i][j]\`. A 2 × 3 matrix becomes 3 × 2.`,
            },
            {
              type: "code",
              language: "c",
              title: "Matrix addition and transpose with functions",
              code: `#include <stdio.h>

#define R 2
#define C 3

void printMatrix(int rows, int cols, int m[][3])
{
    int i, j;
    for (i = 0; i < rows; i++) {
        for (j = 0; j < cols; j++)
            printf("%3d", m[i][j]);
        printf("\\n");
    }
}

int main(void)
{
    int a[R][C] = {{1, 2, 3}, {4, 5, 6}};
    int b[R][C] = {{10, 20, 30}, {40, 50, 60}};
    int sum[R][C];
    int t[C][R];
    int i, j;

    for (i = 0; i < R; i++)
        for (j = 0; j < C; j++)
            sum[i][j] = a[i][j] + b[i][j];

    for (i = 0; i < R; i++)
        for (j = 0; j < C; j++)
            t[j][i] = a[i][j];

    printf("a + b:\\n");
    printMatrix(R, C, sum);

    printf("transpose of a:\\n");
    for (i = 0; i < C; i++) {
        for (j = 0; j < R; j++)
            printf("%3d", t[i][j]);
        printf("\\n");
    }
    return 0;
}`,
              runnable: true,
              output: `a + b:
 11 22 33
 44 55 66
transpose of a:
  1  4
  2  5
  3  6`,
              walkthrough: [
                { lines: "6", text: "A 2D array parameter must state the number of **columns** (`m[][3]`) so the compiler can compute where each row starts. The number of rows is passed separately." },
                { lines: "18-21", text: "Two 2 × 3 input matrices, a result matrix of the same size, and a 3 × 2 matrix for the transpose." },
                { lines: "24-26", text: "Matrix addition: visit every (i, j) and add corresponding elements." },
                { lines: "28-30", text: "Transpose: element at row i, column j of `a` goes to row j, column i of `t`." },
                { lines: "33", text: "Pass the matrix by name, like a 1D array." },
                { lines: "36-40", text: "`t` is a 3 × 2 matrix: it has only 2 columns, so it does not match `printMatrix`'s `m[][3]` parameter type. We print it with its own nested loops instead." },
              ],
            },
            {
              type: "callout",
              variant: "exam",
              title: "Column count is mandatory",
              md: "In `void f(int m[][COLS], int rows)` every dimension except the first must be given. `void f(int m[][])` is a compile error. Examiners love this question.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `A 2D array is stored as one long block in row-major order. For \`int m[R][C]\`, element \`m[i][j]\` sits at position \`i × C + j\` from the start. That formula needs **C** (the number of columns) but not R — which is exactly why functions must be told the column count and why it is fine to omit the row count. Nested loops visit every combination of i and j, so every cell is processed exactly once.`,
            },
            {
              type: "heading",
              text: "Real-world applications",
              level: 2,
            },
            {
              type: "markdown",
              md: `- **Images:** a greyscale picture is a 2D array of brightness values; filters such as blur work on neighbouring cells.
- **Games:** board games (chess, tic-tac-toe, minesweeper) store the board as a 2D array.
- **Spreadsheets and tables:** sales per region per month, marks per student per subject.
- **Science and graphics:** matrices rotate and scale 3D models and solve systems of equations.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Using a comma instead of separate brackets",
                  wrong: `m[1, 2] = 5;   /* comma operator: means m[2] */`,
                  right: `m[1][2] = 5;`,
                  md: "C uses one pair of brackets per dimension. `m[1, 2]` compiles (the comma operator yields 2) but means something completely different.",
                },
                {
                  title: "Omitting the column size in a parameter",
                  wrong: `void show(int m[][], int rows);   /* error */`,
                  right: `void show(int m[][4], int rows);`,
                  md: "The compiler needs the number of columns to locate `m[i][j]`.",
                },
                {
                  title: "Mixing up rows and columns in loop bounds",
                  wrong: `int m[2][5];
for (i = 0; i < 5; i++)        /* i used as row */
    for (j = 0; j < 2; j++)
        m[i][j] = 0;           /* rows 2..4 do not exist */`,
                  right: `for (i = 0; i < 2; i++)        /* rows */
    for (j = 0; j < 5; j++)    /* columns */
        m[i][j] = 0;`,
                  md: "The first index is bounded by the number of rows, the second by the number of columns.",
                },
                {
                  title: "Forgetting to reset a per-row total",
                  wrong: `total = 0;
for (i = 0; i < R; i++) {
    for (j = 0; j < C; j++) total += m[i][j];
    printf("%d\\n", total);    /* running total, not row total */
}`,
                  right: `for (i = 0; i < R; i++) {
    total = 0;
    for (j = 0; j < C; j++) total += m[i][j];
    printf("%d\\n", total);
}`,
                  md: "Initialise the accumulator inside the outer loop when you want one result per row.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "`int m[R][C]` has R rows and C columns; m[i][j] is row i, column j.",
                "C stores 2D arrays in row-major order: m[i][j] is at offset i × C + j.",
                "In a 2D array parameter, all dimensions except the first must be specified.",
                "When initialising, the row count may be omitted: `int m[][3] = {{1,2,3},{4,5,6}};`.",
                "Transpose: T[j][i] = A[i][j]; an R × C matrix becomes C × R.",
              ],
            },
            {
              type: "recap",
              items: [
                "2D arrays model grids, tables and matrices.",
                "Use nested loops: outer for rows, inner for columns (or swap for column-wise work).",
                "Matrix addition is element by element; transpose swaps indices.",
                "Pass 2D arrays with the column size fixed in the parameter type.",
              ],
            },
            {
              type: "exercise",
              id: "c14-ex-diagonal",
              kind: "write",
              title: "Sum of the main diagonal",
              prompt: "Given the 3 × 3 matrix `{{2, 7, 6}, {9, 5, 1}, {4, 3, 8}}`, print the sum of its main diagonal (elements where row == column) and the sum of its other diagonal, in the format `Main: 15` and `Anti: 15` on separate lines.",
              hint: "The main diagonal is m[i][i]. The other diagonal is m[i][2 - i].",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int m[3][3] = {{2, 7, 6}, {9, 5, 1}, {4, 3, 8}};
    int i, mainSum = 0, antiSum = 0;
    for (i = 0; i < 3; i++) {
        mainSum += m[i][i];
        antiSum += m[i][2 - i];
    }
    printf("Main: %d\\n", mainSum);
    printf("Anti: %d\\n", antiSum);
    return 0;
}`,
              expectedOutput: `Main: 15
Anti: 15`,
            },
            {
              type: "exercise",
              id: "c14-ex-predict-2d",
              kind: "predict",
              title: "Partially initialised grid",
              prompt: "Predict the output.",
              starterCode: `#include <stdio.h>

int main(void)
{
    int g[3][3] = {{1}, {2, 3}};
    int i, j;
    for (i = 0; i < 3; i++) {
        for (j = 0; j < 3; j++)
            printf("%d", g[i][j]);
        printf("\\n");
    }
    return 0;
}`,
              hint: "Missing elements in each row, and missing rows, are zero.",
              solution: "Row 0 is {1, 0, 0}, row 1 is {2, 3, 0}, row 2 is all zeros.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int g[3][3] = {{1}, {2, 3}};
    int i, j;
    for (i = 0; i < 3; i++) {
        for (j = 0; j < 3; j++)
            printf("%d", g[i][j]);
        printf("\\n");
    }
    return 0;
}`,
              expectedOutput: `100
230
000`,
            },
            {
              type: "exercise",
              id: "c14-ex-concept-rowmajor",
              kind: "concept",
              title: "Where is the element?",
              prompt: "For `int m[4][6]`, how many `int`s from the start of the array is the element `m[2][3]`? Show the calculation.",
              hint: "Use i × C + j.",
              solution: "Offset = 2 × 6 + 3 = 15. Two full rows of 6 elements come before row 2, then 3 more elements within row 2.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c14-2d-param-mcq",
              prompt: "Which function prototype correctly accepts a 2D int array with 5 columns?",
              options: [
                { id: "a", text: "void f(int m[][], int rows);" },
                { id: "b", text: "void f(int m[5][], int rows);" },
                { id: "c", text: "void f(int m[][5], int rows);" },
                { id: "d", text: "void f(int m, int rows, int cols);" },
              ],
              correct: "c",
              explanation: "Every dimension except the first must be specified; the column count is 5.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c14-predict-2d-sum",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

int main(void)
{
    int m[2][3] = {{1, 2, 3}, {4, 5, 6}};
    int i, s = 0;
    for (i = 0; i < 2; i++)
        s += m[i][2];
    printf("%d %d\\n", s, m[1][0]);
    return 0;
}`,
              expected: "9 4",
              explanation: "Column 2 holds 3 and 6 (sum 9); m[1][0] is 4.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c14-rowmajor-tf",
              prompt: "In C, the elements of a 2D array are stored row by row: all of row 0, then all of row 1, and so on.",
              correct: true,
              explanation: "C uses row-major order.",
            },
            {
              type: "FILL_BLANK",
              slug: "c14-2d-count-fill",
              prompt: "The array `double grid[4][7];` contains ___ elements in total.",
              accepted: [["28"]],
              explanation: "4 rows × 7 columns = 28.",
            },
            {
              type: "CODE_WRITING",
              slug: "c14-code-row-sums",
              prompt: "Read two integers `r` and `c` (1 ≤ r, c ≤ 10), then an r × c matrix of integers row by row. Print the sum of each row on its own line.\n\nExample input:\n```\n2 3\n1 2 3\n4 5 6\n```\nOutput:\n```\n6\n15\n```",
              starterCode: `#include <stdio.h>

int main(void)
{
    int m[10][10];
    int r, c, i, j;
    scanf("%d %d", &r, &c);
    /* read the matrix and print each row sum */
    return 0;
}`,
              sampleTests: [
                { stdin: "2 3\n1 2 3\n4 5 6", expected: "6\n15" },
              ],
              hiddenTests: [
                { stdin: "1 1\n-7", expected: "-7" },
                { stdin: "3 2\n1 1\n2 2\n-3 3", expected: "2\n4\n0" },
                { stdin: "2 4\n10 20 30 40\n0 0 0 1", expected: "100\n1" },
              ],
              solutionCode: `#include <stdio.h>

int main(void)
{
    int m[10][10];
    int r, c, i, j, total;
    scanf("%d %d", &r, &c);
    for (i = 0; i < r; i++)
        for (j = 0; j < c; j++)
            scanf("%d", &m[i][j]);
    for (i = 0; i < r; i++) {
        total = 0;
        for (j = 0; j < c; j++)
            total += m[i][j];
        printf("%d\\n", total);
    }
    return 0;
}`,
              explanation: "Read with nested loops, then total each row, resetting the total for every row.",
            },
          ],
        },
      ],
    },
  ],
};

export default chapter;
