import type { ChapterContent } from "../../../src/lib/content/schema";

const chapter: ChapterContent = {
  slug: "dynamic-memory",
  title: "Dynamic Memory Allocation",
  summary:
    "Request memory at run time from the heap with malloc, calloc and realloc, give it back with free, and avoid leaks and dangling pointers.",
  topics: [
    {
      slug: "heap-allocation",
      title: "Allocating memory on the heap",
      lessons: [
        {
          slug: "stack-heap-malloc-free",
          title: "Stack vs heap, malloc and free",
          summary:
            "Why fixed-size arrays are not always enough, how the heap differs from the stack, and the malloc / check / use / free pattern.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Describe the difference between stack memory and heap memory",
                "Allocate memory with malloc using sizeof correctly",
                "Always check the result of malloc for NULL",
                "Release memory with free and explain why it matters",
              ],
            },
            {
              type: "markdown",
              md: `Up to now, every array you have created had a size fixed when you wrote the program: \`int marks[50];\`. But what if the class has 200 students? Or 3? You could declare \`int marks[10000];\` "just in case", but that wastes memory, and it still breaks for 10001 students.

**Dynamic memory allocation** lets your program ask for exactly as much memory as it needs *while it is running*, and give it back when it is done.

An analogy: automatic variables are like the desk you are given for an exam. It appears when you sit down and is cleared away when you leave. Heap memory is like renting a storage unit. You ask for a size, you get a key (a pointer), it stays yours until you hand the key back, and if you forget to hand it back you keep paying for it (a *memory leak*).`,
            },
            {
              type: "definition",
              term: "Stack",
              md: "The region of memory that holds automatic (local) variables and function-call information. Allocation and release are automatic and very fast, but the stack is limited in size (often a few megabytes) and everything in a function's frame disappears when it returns.",
            },
            {
              type: "definition",
              term: "Heap",
              md: "A large pool of memory managed at run time. You request blocks with `malloc`, `calloc` or `realloc` and release them with `free`. A heap block lives until you free it, regardless of which function created it.",
            },
            {
              type: "definition",
              term: "malloc",
              md: "`void *malloc(size_t size)` from `<stdlib.h>`. Allocates `size` bytes of uninitialised memory and returns a pointer to the first byte, or `NULL` if the request cannot be satisfied.",
            },
            {
              type: "table",
              caption: "Stack vs heap",
              headers: ["", "Stack", "Heap"],
              rows: [
                ["Who manages it", "The compiler, automatically", "You, with malloc/free"],
                ["Size decided", "When the program is written (mostly)", "While the program runs"],
                ["Lifetime", "Until the block/function ends", "Until you call free"],
                ["Speed", "Very fast", "Slower (bookkeeping)"],
                ["Typical limit", "A few MB", "Most of available RAM"],
                ["Typical bug", "Stack overflow, returning address of local", "Leaks, dangling pointers, double free"],
              ],
            },
            { type: "heading", text: "The four-step pattern", level: 2 },
            {
              type: "syntax",
              language: "c",
              code: `#include <stdlib.h>

type *ptr = malloc(count * sizeof *ptr);   /* 1. allocate      */
if (ptr == NULL) { /* handle failure */ }   /* 2. check         */
/* ... use ptr[0] .. ptr[count-1] ... */     /* 3. use           */
free(ptr);                                  /* 4. release       */
ptr = NULL;                                 /*    (good habit)  */`,
              md: "`sizeof *ptr` means \"the size of whatever ptr points to\". It stays correct even if you later change the type of `ptr`. Writing `sizeof(int)` also works when ptr is an `int *`.",
            },
            {
              type: "code",
              language: "c",
              title: "One int on the heap",
              runnable: true,
              code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *p = malloc(sizeof *p);      /* room for one int on the heap */
    if (p == NULL) {
        printf("Out of memory\\n");
        return 1;
    }
    *p = 42;
    printf("Value on the heap: %d\\n", *p);
    free(p);                         /* give the memory back */
    p = NULL;                        /* avoid a dangling pointer */
    return 0;
}`,
              output: "Value on the heap: 42",
              walkthrough: [
                { lines: "2", text: "`malloc` and `free` are declared in `<stdlib.h>`. Forgetting this include is a classic error." },
                { lines: "5", text: "Ask for enough bytes to hold one `int`. `malloc` returns a `void *`, which C converts to `int *` automatically (no cast needed in C)." },
                { lines: "6-9", text: "If the system cannot provide memory, `malloc` returns `NULL`. Dereferencing NULL would crash, so we stop with an error code." },
                { lines: "10-11", text: "Use the block exactly like any other `int` through the pointer." },
                { lines: "12", text: "`free` returns the block to the heap. After this, the memory no longer belongs to us." },
                { lines: "13", text: "Setting `p` to `NULL` makes any accidental later use obvious (a crash at a NULL access instead of silent corruption)." },
              ],
            },
            {
              type: "code",
              language: "c",
              title: "An array whose size comes from the user",
              runnable: true,
              stdin: "4\n70 85 90 64\n",
              code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n, i, sum = 0;
    int *marks;

    printf("How many marks?\\n");
    if (scanf("%d", &n) != 1 || n <= 0) {
        printf("Invalid count\\n");
        return 1;
    }
    marks = malloc(n * sizeof *marks);
    if (marks == NULL) {
        printf("Out of memory\\n");
        return 1;
    }
    for (i = 0; i < n; i++) {
        scanf("%d", &marks[i]);
        sum += marks[i];
    }
    printf("You entered:");
    for (i = 0; i < n; i++) {
        printf(" %d", marks[i]);
    }
    printf("\\nAverage: %.2f\\n", (double)sum / n);
    free(marks);
    return 0;
}`,
              output: `How many marks?
You entered: 70 85 90 64
Average: 77.25`,
              walkthrough: [
                { lines: "6", text: "`marks` is just a pointer for now. It will point to the first element of a heap array." },
                { lines: "9-12", text: "Validate the count before allocating: asking for 0 or a negative number of elements makes no sense." },
                { lines: "13", text: "Allocate `n` ints. The total size in bytes is `n * sizeof(int)`, typically `n * 4`." },
                { lines: "18-21", text: "Because array indexing works on pointers, `marks[i]` behaves exactly like an ordinary array element. `&marks[i]` gives scanf the address of element i." },
                { lines: "26", text: "Cast to `double` before dividing so the average keeps its fraction: 309 / 4 = 77.25." },
                { lines: "27", text: "Every successful `malloc` needs exactly one matching `free`." },
              ],
            },
            {
              type: "callout",
              variant: "warning",
              title: "malloc does not clear memory",
              md: "The bytes returned by `malloc` contain whatever was there before. Reading them before writing is undefined behaviour. Use `calloc` (next lesson) if you need zeros.",
            },
            { type: "heading", text: "Heap memory outlives the function", level: 2 },
            {
              type: "markdown",
              md: `A function cannot safely return the address of its local array, because that array lives in its stack frame and disappears on return. A heap block, however, survives until \`free\`, so a function can create one and hand it back to the caller. The rule then becomes: **whoever ends up owning the pointer must free it.**`,
            },
            {
              type: "code",
              language: "c",
              title: "A function that returns a new heap array",
              runnable: true,
              code: `#include <stdio.h>
#include <stdlib.h>

int *makeSquares(int n) {
    int i;
    int *a = malloc(n * sizeof *a);
    if (a == NULL) {
        return NULL;
    }
    for (i = 0; i < n; i++) {
        a[i] = (i + 1) * (i + 1);
    }
    return a;                 /* the block survives the return */
}

int main(void) {
    int i;
    int *sq = makeSquares(5);
    if (sq == NULL) {
        printf("Out of memory\\n");
        return 1;
    }
    for (i = 0; i < 5; i++) {
        printf("%d ", sq[i]);
    }
    printf("\\n");
    free(sq);                 /* the caller owns it, so the caller frees it */
    return 0;
}`,
              output: "1 4 9 16 25",
              walkthrough: [
                { lines: "6-9", text: "Allocate inside the function and pass failure on to the caller by returning `NULL`." },
                { lines: "10-12", text: "Fill the block with 1, 4, 9, 16, 25." },
                { lines: "13", text: "Returning the pointer is safe because heap memory is not tied to the function's stack frame." },
                { lines: "18-22", text: "The caller checks for failure exactly as if it had called malloc itself." },
                { lines: "27", text: "Ownership passed to `main`, so `main` frees it." },
              ],
            },
            { type: "heading", text: "Why it works", level: 2 },
            {
              type: "markdown",
              md: `The C library keeps a record of which parts of the heap are in use. \`malloc(n)\` finds a free region of at least \`n\` bytes, marks it as used (usually storing the block size in a small hidden header just before the address it returns), and gives you the address. \`free(p)\` looks at that hidden header to learn the size and marks the region free again so a later \`malloc\` can reuse it. That is why you must pass \`free\` **exactly** the pointer malloc returned, and why you must not free the same block twice.

The pointer itself is an ordinary local variable on the stack; only the block it points to is on the heap. When the function ends, the pointer vanishes, but the block remains, which is how leaks happen if nobody else kept the address.`,
            },
            { type: "heading", text: "Real-world uses", level: 2 },
            {
              type: "markdown",
              md: `- Reading a file whose size is unknown until run time (an image, a CSV of student records).
- Data structures that grow and shrink: linked lists, trees, hash tables, dynamic arrays.
- Large buffers that would overflow the stack, such as a 50 MB array.
- Returning newly created objects from functions (a function that builds a string or record).`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Forgetting to multiply by sizeof",
                  wrong: `int *a = malloc(n);          /* only n bytes! */`,
                  right: `int *a = malloc(n * sizeof *a);`,
                  md: "malloc counts **bytes**, not elements. With 4-byte ints, `malloc(10)` holds only two and a half ints; writing 10 of them overflows the block.",
                },
                {
                  title: "Not checking for NULL",
                  wrong: `int *a = malloc(n * sizeof *a);
a[0] = 5;                    /* crashes if a is NULL */`,
                  right: `int *a = malloc(n * sizeof *a);
if (a == NULL) {
    printf("Out of memory\\n");
    return 1;
}
a[0] = 5;`,
                  md: "Allocation can fail, especially for large requests. Always check before using the pointer.",
                },
                {
                  title: "Using sizeof on the pointer instead of the pointed-to type",
                  wrong: `double *d = malloc(n * sizeof d);   /* size of a pointer */`,
                  right: `double *d = malloc(n * sizeof *d);  /* size of a double */`,
                  md: "`sizeof d` is the size of the pointer (often 8), not of a double. The star in `sizeof *d` matters. It happens to work on some machines and fails on others.",
                },
                {
                  title: "Forgetting #include <stdlib.h>",
                  wrong: `#include <stdio.h>
int *p = malloc(sizeof *p);  /* implicit declaration warning */`,
                  right: `#include <stdio.h>
#include <stdlib.h>
int *p = malloc(sizeof *p);`,
                  md: "Without the header, old compilers assume malloc returns `int`, which can corrupt the pointer on 64-bit systems.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "malloc, calloc, realloc and free are declared in <stdlib.h>.",
                "malloc(size) takes a size in bytes and returns void* (NULL on failure); the memory is uninitialised.",
                "Always write count * sizeof(type) (or sizeof *ptr) when allocating arrays.",
                "Every successful allocation must be released with exactly one free.",
                "Heap memory persists after the allocating function returns; stack memory does not.",
                "In C, the result of malloc does not need a cast (it does in C++).",
              ],
            },
            {
              type: "recap",
              items: [
                "The stack holds locals automatically; the heap holds blocks you manage.",
                "Pattern: allocate, check for NULL, use, free (then set the pointer to NULL).",
                "Size arguments are in bytes, so multiply by sizeof.",
                "A function may return heap memory; the caller must free it.",
              ],
            },
            {
              type: "exercise",
              id: "c20-ex-reverse-heap",
              kind: "write",
              title: "Reverse a list of any length",
              prompt: "Write a program that reads `n` and then `n` integers into a malloc'd array, then prints them in reverse order separated by spaces. Test with input `5` / `1 2 3 4 5`.",
              hint: "Allocate n * sizeof(int) bytes; loop from n-1 down to 0 when printing.",
              solution: "Allocate after reading n, check for NULL, fill, print backwards, free. With input `5` / `1 2 3 4 5` the program prints `5 4 3 2 1`.",
              solutionCode: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n, i;
    int *a;
    if (scanf("%d", &n) != 1 || n <= 0) return 0;
    a = malloc(n * sizeof *a);
    if (a == NULL) return 1;
    for (i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    for (i = n - 1; i >= 0; i--) {
        printf("%d", a[i]);
        if (i > 0) printf(" ");
    }
    printf("\\n");
    free(a);
    return 0;
}`,
            },
            {
              type: "exercise",
              id: "c20-ex-fix-malloc",
              kind: "debug",
              title: "Fix the allocation",
              prompt: "This program is meant to store the first 6 multiples of 7, but it writes past the end of its block. Find both problems and fix them.",
              starterCode: `#include <stdio.h>

int main(void) {
    int i;
    int *m = malloc(6);
    for (i = 0; i < 6; i++) {
        m[i] = 7 * (i + 1);
    }
    for (i = 0; i < 6; i++) {
        printf("%d ", m[i]);
    }
    printf("\\n");
    return 0;
}`,
              hint: "Count bytes, not elements. Also: which header declares malloc, and what is missing at the end?",
              solution: "Include `<stdlib.h>`, allocate `6 * sizeof *m` bytes, check for NULL, and `free(m)` at the end.",
              solutionCode: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int i;
    int *m = malloc(6 * sizeof *m);
    if (m == NULL) return 1;
    for (i = 0; i < 6; i++) {
        m[i] = 7 * (i + 1);
    }
    for (i = 0; i < 6; i++) {
        printf("%d ", m[i]);
    }
    printf("\\n");
    free(m);
    return 0;
}`,
              expectedOutput: "7 14 21 28 35 42",
            },
            {
              type: "exercise",
              id: "c20-ex-stack-or-heap",
              kind: "concept",
              title: "Stack or heap?",
              prompt: "For each, say whether the memory is on the stack or the heap and when it is released:\n\n1. `int count = 0;` inside `main`\n2. The block returned by `malloc(100)`\n3. The pointer variable `p` in `int *p = malloc(100);` inside a function\n4. `char name[30];` inside a function",
              hint: "A pointer variable and the block it points to are two different things.",
              solution: "1. Stack, released when main returns. 2. Heap, released only when free is called (or the program ends). 3. Stack: the pointer itself is a local variable and disappears when the function returns; if nobody else saved the address, the heap block leaks. 4. Stack, released when the function returns.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c20-malloc-mcq-1",
              prompt: "Which call correctly allocates space for an array of 20 `double` values pointed to by `double *d`?",
              options: [
                { id: "a", text: "d = malloc(20);" },
                { id: "b", text: "d = malloc(20 * sizeof d);" },
                { id: "c", text: "d = malloc(20 * sizeof *d);" },
                { id: "d", text: "d = malloc(sizeof(double));" },
              ],
              correct: "c",
              explanation: "sizeof *d is the size of one double. (a) is 20 bytes, (b) uses the size of a pointer, (d) holds only one double.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c20-malloc-tf-1",
              prompt: "Memory returned by malloc is automatically filled with zeros.",
              correct: false,
              explanation: "malloc leaves memory uninitialised. calloc zero-fills.",
            },
            {
              type: "FILL_BLANK",
              slug: "c20-malloc-fill-1",
              prompt: "If malloc cannot allocate the requested memory it returns ___.",
              accepted: [["NULL", "a null pointer", "null pointer", "null", "0"]],
              explanation: "Always compare the result with NULL before using it.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c20-malloc-output-1",
              prompt: "What does this program print?",
              code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int i, total = 0;
    int *a = malloc(4 * sizeof *a);
    if (a == NULL) return 1;
    for (i = 0; i < 4; i++) {
        a[i] = i * 10;
    }
    for (i = 0; i < 4; i++) {
        total += a[i];
    }
    printf("%d %d\\n", a[3], total);
    free(a);
    return 0;
}`,
              expected: "30 60",
              explanation: "The array holds 0, 10, 20, 30. a[3] is 30 and the total is 60.",
            },
          ],
        },
        {
          slug: "calloc-realloc-dynamic-arrays",
          title: "calloc, realloc and growing arrays",
          summary:
            "Zero-initialised allocation with calloc, resizing with realloc, and building a dynamic array that grows as input arrives.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Use calloc to allocate zero-initialised arrays",
                "Resize a block safely with realloc using a temporary pointer",
                "Build a dynamic array that grows by doubling its capacity",
                "Allocate and free a two-dimensional array of rows",
              ],
            },
            {
              type: "markdown",
              md: `\`malloc\` is the basic tool, but two relatives make common jobs easier:

- **calloc** ("clear allocate") gives you an array that is already filled with zeros, perfect for counters and tallies.
- **realloc** ("re-allocate") changes the size of a block you already have, keeping the existing contents. It is how you build an array that grows while the user keeps typing.

Think of realloc as asking the storage company for a bigger unit. If the unit next door is empty they knock down the wall (the block grows in place). If not, they move all your boxes into a bigger unit elsewhere and give you a new key (a new address).`,
            },
            {
              type: "definition",
              term: "calloc",
              md: "`void *calloc(size_t count, size_t size)` allocates room for `count` elements of `size` bytes each, sets every byte to zero, and returns a pointer (or NULL).",
            },
            {
              type: "definition",
              term: "realloc",
              md: "`void *realloc(void *ptr, size_t newSize)` resizes the block at `ptr` to `newSize` bytes, preserving the old contents up to the smaller of the two sizes. It may move the block and return a different address. On failure it returns NULL and leaves the original block untouched.",
            },
            {
              type: "definition",
              term: "Capacity vs size (count)",
              md: "In a dynamic array, **capacity** is how many elements the allocated block can hold; **count** is how many are actually in use. When count reaches capacity, the array is grown.",
            },
            {
              type: "syntax",
              language: "c",
              code: `type *a = calloc(count, sizeof *a);            /* zero-filled */

type *tmp = realloc(a, newCount * sizeof *a);  /* resize        */
if (tmp == NULL) { /* a is still valid: free it or keep using it */ }
else { a = tmp; }`,
            },
            {
              type: "code",
              language: "c",
              title: "Tallying dice rolls with calloc",
              runnable: true,
              stdin: "1 3 3 6 2 3 6\n",
              code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int roll, face;
    int *counts = calloc(7, sizeof *counts);   /* indexes 0..6, all zero */
    if (counts == NULL) {
        printf("Out of memory\\n");
        return 1;
    }
    while (scanf("%d", &roll) == 1) {
        if (roll >= 1 && roll <= 6) {
            counts[roll]++;
        }
    }
    for (face = 1; face <= 6; face++) {
        printf("%d: %d\\n", face, counts[face]);
    }
    free(counts);
    return 0;
}`,
              output: `1: 1
2: 1
3: 3
4: 0
5: 0
6: 2`,
              walkthrough: [
                { lines: "6", text: "Seven ints, all guaranteed to be 0. Index 0 is unused so that face `k` is simply `counts[k]`." },
                { lines: "11", text: "Read numbers until input ends (scanf stops returning 1)." },
                { lines: "12-14", text: "Validate the roll before using it as an index, to avoid writing outside the array." },
                { lines: "16-18", text: "Faces 4 and 5 never appeared, and they correctly print 0 because calloc zeroed them. With malloc they would contain garbage." },
              ],
            },
            {
              type: "table",
              caption: "malloc vs calloc vs realloc",
              headers: ["Function", "Arguments", "Initial contents", "Typical use"],
              rows: [
                ["malloc", "total bytes", "Garbage", "General allocation you will fill yourself"],
                ["calloc", "count, size of one", "All zero", "Counters, flags, arrays you need cleared"],
                ["realloc", "old pointer, new total bytes", "Old data kept; new part garbage", "Growing or shrinking an existing block"],
                ["free", "pointer", "-", "Releasing any of the above"],
              ],
            },
            { type: "heading", text: "A dynamic array that grows", level: 2 },
            {
              type: "markdown",
              md: `When you do not know how many values are coming, start with a small capacity and **double** it whenever it fills up. Doubling keeps the number of expensive resizes small: to store a million numbers you resize only about twenty times.`,
            },
            {
              type: "code",
              language: "c",
              title: "Reading any number of integers",
              runnable: true,
              stdin: "5 8 13 21 34\n",
              code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int capacity = 2, count = 0, value, i;
    int *data = malloc(capacity * sizeof *data);
    if (data == NULL) return 1;

    while (scanf("%d", &value) == 1) {
        if (count == capacity) {
            int newCap = capacity * 2;
            int *tmp = realloc(data, newCap * sizeof *data);
            if (tmp == NULL) {
                free(data);
                printf("Out of memory\\n");
                return 1;
            }
            data = tmp;
            capacity = newCap;
            printf("(grew to %d)\\n", capacity);
        }
        data[count++] = value;
    }
    printf("Read %d numbers in reverse:", count);
    for (i = count - 1; i >= 0; i--) {
        printf(" %d", data[i]);
    }
    printf("\\n");
    free(data);
    return 0;
}`,
              output: `(grew to 4)
(grew to 8)
Read 5 numbers in reverse: 34 21 13 8 5`,
              walkthrough: [
                { lines: "5-7", text: "Start with room for just 2 ints. `count` tracks how many are stored." },
                { lines: "10", text: "Only when the array is full do we need to grow it." },
                { lines: "12", text: "realloc into a **temporary** pointer. If we wrote `data = realloc(data, ...)` and it failed, we would lose our only pointer to the old block (a leak)." },
                { lines: "13-17", text: "On failure the old block is still valid, so we free it before exiting." },
                { lines: "18-20", text: "On success, adopt the (possibly moved) block and record the new capacity." },
                { lines: "22", text: "Store the value, then increment `count` (post-increment)." },
                { lines: "24-27", text: "Reading 5 values caused growth 2 → 4 → 8. Printing backwards proves every value survived the moves." },
              ],
            },
            {
              type: "callout",
              variant: "tip",
              title: "realloc special cases",
              md: "`realloc(NULL, n)` behaves like `malloc(n)`, which lets you start a growing array from a NULL pointer. Avoid relying on `realloc(p, 0)`: its behaviour differs between systems; call `free(p)` instead.",
            },
            { type: "heading", text: "Two-dimensional dynamic arrays", level: 2 },
            {
              type: "markdown",
              md: `For a table whose rows and columns are both chosen at run time, allocate an array of row pointers, then one block per row. Free in reverse order: each row first, then the array of pointers.`,
            },
            {
              type: "code",
              language: "c",
              title: "A rows x cols multiplication table on the heap",
              runnable: true,
              code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int rows = 3, cols = 4, r, c;
    int **grid = malloc(rows * sizeof *grid);       /* array of row pointers */
    if (grid == NULL) return 1;
    for (r = 0; r < rows; r++) {
        grid[r] = malloc(cols * sizeof *grid[r]);   /* one block per row */
        if (grid[r] == NULL) return 1;              /* (simplified) */
    }
    for (r = 0; r < rows; r++) {
        for (c = 0; c < cols; c++) {
            grid[r][c] = (r + 1) * (c + 1);
            printf("%3d", grid[r][c]);
        }
        printf("\\n");
    }
    for (r = 0; r < rows; r++) {
        free(grid[r]);                               /* free rows first */
    }
    free(grid);                                      /* then the pointer array */
    return 0;
}`,
              output: `  1  2  3  4
  2  4  6  8
  3  6  9 12`,
              walkthrough: [
                { lines: "6", text: "`grid` is a pointer to pointers. `sizeof *grid` is the size of one `int *`." },
                { lines: "8-11", text: "Each row gets its own block of `cols` ints. (A complete program would free the rows already allocated before giving up.)" },
                { lines: "14-15", text: "`grid[r][c]` works just like a normal 2D array: `grid[r]` is a row pointer, then `[c]` indexes into that row. `%3d` pads to width 3." },
                { lines: "19-22", text: "Free each row, then the array that held the row pointers. Freeing `grid` first would lose the row addresses and leak them." },
              ],
            },
            { type: "heading", text: "Why it works", level: 2 },
            {
              type: "markdown",
              md: `calloc is essentially malloc followed by setting every byte to 0 (with an overflow check on \`count * size\`). realloc first checks whether the space just after your block is free; if so it extends the block in place and returns the same address. Otherwise it allocates a new block, copies the old bytes across, frees the old block and returns the new address. That copying is why every pointer into the old block becomes invalid after a successful realloc that moved, and why you must always use the returned pointer.`,
            },
            { type: "heading", text: "Real-world uses", level: 2 },
            {
              type: "markdown",
              md: `- **Growable arrays** like C++'s \`std::vector\` or Python's \`list\` are built on exactly this doubling-with-realloc idea.
- **Reading lines of unknown length** from a file or the keyboard: grow a character buffer as needed.
- **Histograms and frequency tables** use calloc so every count starts at zero.
- **Images and matrices** whose dimensions are read from a file header use 2D dynamic allocation.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Assigning realloc straight back to the only pointer",
                  wrong: `data = realloc(data, newCap * sizeof *data);
/* if this fails, data = NULL and the old block leaks */`,
                  right: `int *tmp = realloc(data, newCap * sizeof *data);
if (tmp == NULL) { free(data); return 1; }
data = tmp;`,
                  md: "Use a temporary pointer so that failure does not destroy your only reference to the existing block.",
                },
                {
                  title: "Keeping old pointers after realloc",
                  wrong: `int *first = &data[0];
data = tmp;           /* block may have moved */
printf("%d", *first); /* may read freed memory */`,
                  right: `data = tmp;
printf("%d", data[0]);`,
                  md: "After realloc, any pointer into the old block may be dangling. Recompute pointers from the new base.",
                },
                {
                  title: "Mixing up calloc's arguments with malloc's",
                  wrong: `int *a = calloc(n * sizeof(int));   /* one argument: error */`,
                  right: `int *a = calloc(n, sizeof(int));`,
                  md: "calloc takes two arguments: the number of elements and the size of each.",
                },
                {
                  title: "Freeing a 2D array in the wrong order",
                  wrong: `free(grid);
for (r = 0; r < rows; r++) free(grid[r]);   /* grid already freed! */`,
                  right: `for (r = 0; r < rows; r++) free(grid[r]);
free(grid);`,
                  md: "Free inner blocks before the block that stores their addresses.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "calloc(n, size) allocates n * size bytes and sets them all to zero; malloc does not initialise.",
                "realloc(p, newSize) preserves existing contents and may return a different address.",
                "On failure realloc returns NULL and the original block remains valid and must still be freed.",
                "realloc(NULL, n) is equivalent to malloc(n).",
                "Doubling capacity keeps the number of reallocations small (logarithmic in the final size).",
              ],
            },
            {
              type: "recap",
              items: [
                "Use calloc when you need a zero-filled array.",
                "Use realloc to grow or shrink, always through a temporary pointer.",
                "A dynamic array tracks both count and capacity.",
                "2D dynamic arrays: allocate the pointer array, then rows; free rows, then the pointer array.",
              ],
            },
            {
              type: "exercise",
              id: "c20-ex-calloc-letters",
              kind: "write",
              title: "Letter frequency with calloc",
              prompt: "Use `calloc` to create 26 counters. Count the lowercase letters in the string `\"banana bread\"` and print each letter that appears at least once with its count, in alphabetical order, one per line as `letter: count`.",
              hint: "counts[ch - 'a']++ for each lowercase ch.",
              solution: "Allocate 26 zeroed ints, loop through the string, then print the non-zero counters.",
              solutionCode: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    const char *text = "banana bread";
    int i;
    int *counts = calloc(26, sizeof *counts);
    if (counts == NULL) return 1;
    for (i = 0; text[i] != '\\0'; i++) {
        if (text[i] >= 'a' && text[i] <= 'z') {
            counts[text[i] - 'a']++;
        }
    }
    for (i = 0; i < 26; i++) {
        if (counts[i] > 0) {
            printf("%c: %d\\n", 'a' + i, counts[i]);
        }
    }
    free(counts);
    return 0;
}`,
              expectedOutput: `a: 4
b: 2
d: 1
e: 1
n: 2
r: 1`,
            },
            {
              type: "exercise",
              id: "c20-ex-realloc-predict",
              kind: "predict",
              title: "Predict the growth messages",
              prompt: "A dynamic array starts with capacity 1 and doubles whenever it is full, printing `grow N` with the new capacity. How many messages are printed while 10 values are added, and what are they? Run the code to check.",
              starterCode: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int cap = 1, count = 0, v;
    int *a = malloc(cap * sizeof *a);
    if (a == NULL) return 1;
    for (v = 1; v <= 10; v++) {
        if (count == cap) {
            int *tmp = realloc(a, cap * 2 * sizeof *a);
            if (tmp == NULL) { free(a); return 1; }
            a = tmp;
            cap *= 2;
            printf("grow %d\\n", cap);
        }
        a[count++] = v;
    }
    printf("count=%d cap=%d\\n", count, cap);
    free(a);
    return 0;
}`,
              hint: "Growth happens when adding the 2nd, 3rd, 5th and 9th values.",
              solution: "Four messages: grow 2, grow 4, grow 8, grow 16; then count=10 cap=16.",
              solutionCode: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int cap = 1, count = 0, v;
    int *a = malloc(cap * sizeof *a);
    if (a == NULL) return 1;
    for (v = 1; v <= 10; v++) {
        if (count == cap) {
            int *tmp = realloc(a, cap * 2 * sizeof *a);
            if (tmp == NULL) { free(a); return 1; }
            a = tmp;
            cap *= 2;
            printf("grow %d\\n", cap);
        }
        a[count++] = v;
    }
    printf("count=%d cap=%d\\n", count, cap);
    free(a);
    return 0;
}`,
              expectedOutput: `grow 2
grow 4
grow 8
grow 16
count=10 cap=16`,
            },
            {
              type: "exercise",
              id: "c20-ex-realloc-concept",
              kind: "concept",
              title: "Why the temporary pointer?",
              prompt: "Explain in two or three sentences what can go wrong with `p = realloc(p, bigger);` and how the temporary-pointer pattern prevents it.",
              hint: "What does realloc return on failure, and what happens to the old block?",
              solution: "If realloc fails it returns NULL but does not free the old block. Writing the result straight into `p` overwrites the only copy of the old address with NULL, so the old block can never be freed (a leak) and its data is lost. Storing the result in `tmp` first lets you check for NULL while `p` still points to the valid old block.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c20-calloc-mcq-1",
              prompt: "What is the main difference between `malloc(10 * sizeof(int))` and `calloc(10, sizeof(int))`?",
              options: [
                { id: "a", text: "calloc allocates on the stack, malloc on the heap" },
                { id: "b", text: "calloc zero-initialises the memory; malloc does not" },
                { id: "c", text: "calloc memory does not need to be freed" },
                { id: "d", text: "malloc can only allocate one element" },
              ],
              correct: "b",
              explanation: "Both allocate the same amount on the heap and both must be freed; only calloc clears it.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c20-realloc-tf-1",
              prompt: "After a successful realloc, the returned pointer may be different from the pointer you passed in.",
              correct: true,
              explanation: "If the block cannot grow in place, realloc moves it to a new address and frees the old one.",
            },
            {
              type: "FILL_BLANK",
              slug: "c20-realloc-fill-1",
              prompt: "Calling realloc(___, n) behaves exactly like malloc(n).",
              accepted: [["NULL", "0", "a null pointer", "null"]],
              explanation: "Passing a null pointer means there is no existing block, so realloc simply allocates.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c20-calloc-output-1",
              prompt: "What does this program print?",
              code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int i;
    int *a = calloc(3, sizeof *a);
    if (a == NULL) return 1;
    a[1] = 5;
    int *tmp = realloc(a, 5 * sizeof *a);
    if (tmp == NULL) { free(a); return 1; }
    a = tmp;
    a[3] = 7;
    a[4] = 9;
    for (i = 0; i < 5; i++) {
        printf("%d ", a[i]);
    }
    printf("\\n");
    free(a);
    return 0;
}`,
              expected: "0 5 0 7 9",
              explanation: "calloc zeroed the first three elements; realloc kept them; elements 3 and 4 were assigned before being printed.",
            },
            {
              type: "CODE_WRITING",
              slug: "c20-above-average-code",
              prompt: "Read an integer `n` (1 ≤ n ≤ 100000), then `n` integers. Store them in a **dynamically allocated** array. Print, on one line separated by single spaces, every value that is strictly greater than the average, in input order. If no value is above the average, print `none`. Remember to free the array.",
              starterCode: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n;
    scanf("%d", &n);
    /* allocate, read, compute, print, free */
    return 0;
}`,
              sampleTests: [
                { stdin: "5\n1 2 3 4 5\n", expected: "4 5" },
                { stdin: "3\n10 10 10\n", expected: "none" },
              ],
              hiddenTests: [
                { stdin: "4\n-2 8 0 6\n", expected: "8 6" },
                { stdin: "1\n5\n", expected: "none" },
                { stdin: "6\n3 9 1 7 2 8\n", expected: "9 7 8" },
              ],
              solutionCode: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n, i, printed = 0;
    long sum = 0;
    int *a;
    if (scanf("%d", &n) != 1 || n <= 0) return 0;
    a = malloc(n * sizeof *a);
    if (a == NULL) return 1;
    for (i = 0; i < n; i++) {
        scanf("%d", &a[i]);
        sum += a[i];
    }
    for (i = 0; i < n; i++) {
        if ((long)a[i] * n > sum) {      /* a[i] > sum / n, without fractions */
            if (printed) printf(" ");
            printf("%d", a[i]);
            printed = 1;
        }
    }
    if (!printed) printf("none");
    printf("\\n");
    free(a);
    return 0;
}`,
              explanation: "Comparing a[i] * n > sum avoids floating-point rounding. Allocate after reading n, and free at the end.",
            },
          ],
        },
      ],
    },
    {
      slug: "memory-bugs",
      title: "Memory bugs and how to avoid them",
      lessons: [
        {
          slug: "memory-leaks-dangling-pointers",
          title: "Memory leaks, dangling pointers and double free",
          summary:
            "The classic dynamic-memory bugs, why they are dangerous, and the habits and tools that prevent them.",
          estMinutes: 25,
          blocks: [
            {
              type: "objectives",
              items: [
                "Recognise a memory leak and explain why it harms long-running programs",
                "Explain dangling pointers, use-after-free and double free",
                "Apply ownership rules so every allocation has exactly one free",
                "Know which tools (Valgrind, AddressSanitizer) detect memory bugs",
              ],
            },
            {
              type: "markdown",
              md: `With great power comes great responsibility. The heap gives you control, but the compiler no longer cleans up after you. Three mistakes account for most memory bugs in C programs:

1. **Leaks**: you forget to give memory back.
2. **Dangling pointers**: you keep using memory after giving it back.
3. **Double free**: you give the same memory back twice.

Back to the storage-unit analogy: a leak is losing the key while still paying rent; a dangling pointer is still using your old key after the unit has been rented to someone else (you might open their boxes!); a double free is returning a key you already returned, which confuses the company's records.`,
            },
            {
              type: "definition",
              term: "Memory leak",
              md: "Heap memory that is still allocated but no longer reachable through any pointer, so it can never be freed. The program's memory use grows until it ends.",
            },
            {
              type: "definition",
              term: "Dangling pointer",
              md: "A pointer that still holds the address of memory that has been freed (or of a local variable whose function has returned). Using it is **use-after-free**, which is undefined behaviour.",
            },
            {
              type: "definition",
              term: "Double free",
              md: "Calling `free` twice on the same block. This is undefined behaviour and can corrupt the heap's bookkeeping, often crashing later in an unrelated place.",
            },
            {
              type: "definition",
              term: "Ownership",
              md: "A design rule stating which part of the program is responsible for freeing a block. Exactly one owner should free each allocation.",
            },
            {
              type: "code",
              language: "c",
              title: "Three bugs in one fragment (do NOT run this pattern)",
              runnable: false,
              code: `int *p = malloc(10 * sizeof *p);
p = malloc(20 * sizeof *p);    /* LEAK: first block is now unreachable */

free(p);
p[0] = 5;                      /* USE-AFTER-FREE: p is dangling */

free(p);                       /* DOUBLE FREE: undefined behaviour */`,
            },
            {
              type: "callout",
              variant: "warning",
              title: "Undefined behaviour has no 'expected output'",
              md: "Programs with use-after-free or double free may appear to work, print garbage, or crash, and the result can change between runs, compilers and machines. That is what makes these bugs so dangerous: testing can pass while the bug waits.",
            },
            { type: "heading", text: "Defensive habits", level: 2 },
            {
              type: "markdown",
              md: `- **Set pointers to NULL after free.** \`free(NULL)\` is defined to do nothing, so an accidental second free becomes harmless, and an accidental use crashes immediately at a NULL access instead of silently corrupting memory.
- **Free on every exit path.** If a function returns early on an error, it must free what it already allocated.
- **One owner per block.** Document who frees: "the caller must free the returned string".
- **Pair allocation and free visibly.** Write the \`free\` as soon as you write the \`malloc\`, then fill in the code between.`,
            },
            {
              type: "code",
              language: "c",
              title: "Copying a string onto the heap, with clear ownership",
              runnable: true,
              code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* Returns a heap copy of s. The CALLER must free the result. */
char *copyString(const char *s) {
    char *copy = malloc(strlen(s) + 1);   /* +1 for the '\\0' */
    if (copy == NULL) {
        return NULL;
    }
    strcpy(copy, s);
    return copy;
}

int main(void) {
    char *name = copyString("Ada Lovelace");
    if (name == NULL) {
        printf("Out of memory\\n");
        return 1;
    }
    name[0] = 'a';                         /* we own it, we may modify it */
    printf("%s (%d chars)\\n", name, (int)strlen(name));
    free(name);
    name = NULL;
    free(name);                            /* free(NULL) is safe: does nothing */
    printf("done\\n");
    return 0;
}`,
              output: `ada Lovelace (12 chars)
done`,
              walkthrough: [
                { lines: "5", text: "A comment stating ownership is part of good C interface design." },
                { lines: "7", text: "A string of length n needs n + 1 bytes for the terminating `'\\0'`. Forgetting the +1 is a classic buffer overflow." },
                { lines: "11", text: "`strcpy` copies the characters and the terminator into the new block." },
                { lines: "21", text: "Unlike a string literal, the heap copy is ours to change." },
                { lines: "22", text: "`strlen` returns `size_t`; we cast to `int` to print it portably with `%d`." },
                { lines: "23-25", text: "Free, set to NULL, and a second `free` is now harmless. Without line 24 it would be a double free." },
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Freeing on every path out of a function",
              runnable: true,
              code: `#include <stdio.h>
#include <stdlib.h>

/* Returns the sum of 1..n using a temporary heap array, or -1 on error. */
int sumUpTo(int n) {
    int i, sum = 0;
    int *tmp;
    if (n <= 0) {
        return -1;                 /* nothing allocated yet: nothing to free */
    }
    tmp = malloc(n * sizeof *tmp);
    if (tmp == NULL) {
        return -1;
    }
    for (i = 0; i < n; i++) {
        tmp[i] = i + 1;
    }
    for (i = 0; i < n; i++) {
        if (tmp[i] < 0) {          /* an error check in the middle */
            free(tmp);             /* free before the early return */
            return -1;
        }
        sum += tmp[i];
    }
    free(tmp);                     /* free on the normal path too */
    return sum;
}

int main(void) {
    printf("%d\\n", sumUpTo(10));
    printf("%d\\n", sumUpTo(0));
    printf("%d\\n", sumUpTo(100));
    return 0;
}`,
              output: `55
-1
5050`,
              walkthrough: [
                { lines: "8-10", text: "An early return before any allocation does not need a free." },
                { lines: "11-14", text: "If malloc fails there is nothing to free either." },
                { lines: "19-22", text: "Once `tmp` is allocated, **every** return must be preceded by `free(tmp)`. Missing this one is the most common real-world leak." },
                { lines: "25-26", text: "The normal path frees as well. 1 + 2 + ... + 10 = 55 and 1 + ... + 100 = 5050." },
              ],
            },
            { type: "heading", text: "Finding memory bugs with tools", level: 2 },
            {
              type: "table",
              headers: ["Tool", "How to use", "Finds"],
              rows: [
                ["Valgrind (Linux)", "valgrind --leak-check=full ./app", "Leaks, use-after-free, uninitialised reads, double free"],
                ["AddressSanitizer", "gcc -g -fsanitize=address prog.c", "Out-of-bounds, use-after-free, double free, leaks (fast)"],
                ["Compiler warnings", "gcc -Wall -Wextra", "Some obvious misuse, missing includes"],
              ],
            },
            { type: "heading", text: "Why it works", level: 2 },
            {
              type: "markdown",
              md: `When you \`free\` a block, the allocator marks it available and may store its own bookkeeping data inside it. A later \`malloc\` can hand those same bytes to another part of your program. A dangling pointer therefore may read someone else's data or overwrite the allocator's records; a double free puts the same block on the free list twice, so two future mallocs may return the same memory. None of this is checked at run time in normal builds, which is why these bugs show up far from their cause.

A leak, by contrast, harms nothing immediately; the memory simply can never be reused. The operating system reclaims everything when a program exits, so leaks matter most in programs that run for a long time: servers, games, operating systems, embedded devices.`,
            },
            { type: "heading", text: "Real-world uses", level: 2 },
            {
              type: "markdown",
              md: `- Many security vulnerabilities in browsers and operating systems have been use-after-free bugs, which attackers exploit to run their own code.
- Long-running servers are monitored for slowly growing memory, the classic sign of a leak.
- Professional C codebases document ownership in comments and run Valgrind or sanitizers in automated tests.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Overwriting the only pointer to a block",
                  wrong: `char *buf = malloc(100);
buf = malloc(200);      /* first 100 bytes leaked */`,
                  right: `char *buf = malloc(100);
free(buf);
buf = malloc(200);`,
                  md: "Before reassigning a pointer that owns a block, free the old block (or use realloc).",
                },
                {
                  title: "Using memory after freeing it",
                  wrong: `free(list);
printf("%d\\n", list[0]);   /* use-after-free */`,
                  right: `printf("%d\\n", list[0]);
free(list);
list = NULL;`,
                  md: "Finish all work with a block before freeing it, then null the pointer.",
                },
                {
                  title: "Freeing memory you did not allocate",
                  wrong: `int x = 5;
int *p = &x;
free(p);                /* x is on the stack! */`,
                  right: `int *p = malloc(sizeof *p);
if (p != NULL) { *p = 5; free(p); }`,
                  md: "Only pass free a pointer that came from malloc, calloc or realloc (or NULL). Never free stack variables, string literals, or a pointer into the middle of a block.",
                },
                {
                  title: "Forgetting room for the string terminator",
                  wrong: `char *c = malloc(strlen(s));
strcpy(c, s);          /* writes one byte too many */`,
                  right: `char *c = malloc(strlen(s) + 1);
strcpy(c, s);`,
                  md: "strlen does not count the '\\0', but strcpy copies it.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "A memory leak is allocated memory that is no longer reachable and therefore can never be freed.",
                "A dangling pointer points to freed memory; dereferencing it is undefined behaviour.",
                "Freeing the same block twice (double free) is undefined behaviour.",
                "free(NULL) is safe and does nothing, so set pointers to NULL after freeing.",
                "Only pointers returned by malloc/calloc/realloc may be passed to free.",
              ],
            },
            {
              type: "recap",
              items: [
                "Leak = forgot to free; dangling = used after free; double free = freed twice.",
                "Every allocation needs exactly one free, on every path out of the code.",
                "Null pointers after free to make mistakes harmless or obvious.",
                "Use Valgrind or -fsanitize=address to catch what you miss.",
              ],
            },
            {
              type: "exercise",
              id: "c20-ex-find-leak",
              kind: "debug",
              title: "Plug the leak",
              prompt: "This function leaks memory when the input contains a negative number. Fix it so that every path frees the buffer. The program should still print `-1` then `6`.",
              starterCode: `#include <stdio.h>
#include <stdlib.h>

int product(const int *src, int n) {
    int i, result = 1;
    int *copy = malloc(n * sizeof *copy);
    if (copy == NULL) return -1;
    for (i = 0; i < n; i++) {
        if (src[i] < 0) {
            return -1;
        }
        copy[i] = src[i];
        result *= copy[i];
    }
    free(copy);
    return result;
}

int main(void) {
    int a[3] = {2, -1, 3};
    int b[3] = {1, 2, 3};
    printf("%d\\n", product(a, 3));
    printf("%d\\n", product(b, 3));
    return 0;
}`,
              hint: "Look at every `return` after the malloc.",
              solution: "Add `free(copy);` before the early `return -1;` inside the loop.",
              solutionCode: `#include <stdio.h>
#include <stdlib.h>

int product(const int *src, int n) {
    int i, result = 1;
    int *copy = malloc(n * sizeof *copy);
    if (copy == NULL) return -1;
    for (i = 0; i < n; i++) {
        if (src[i] < 0) {
            free(copy);
            return -1;
        }
        copy[i] = src[i];
        result *= copy[i];
    }
    free(copy);
    return result;
}

int main(void) {
    int a[3] = {2, -1, 3};
    int b[3] = {1, 2, 3};
    printf("%d\\n", product(a, 3));
    printf("%d\\n", product(b, 3));
    return 0;
}`,
              expectedOutput: "-1\n6",
            },
            {
              type: "exercise",
              id: "c20-ex-join-strings",
              kind: "write",
              title: "Join two strings on the heap",
              prompt: "Write `char *join(const char *a, const char *b)` that returns a new heap string containing a, a space, then b. In main, join \"Hello\" and \"world\", print the result, and free it.",
              hint: "You need strlen(a) + 1 (space) + strlen(b) + 1 (terminator) bytes.",
              solution: "Allocate the exact size, then strcpy a, append the space, and strcat b.",
              solutionCode: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char *join(const char *a, const char *b) {
    char *r = malloc(strlen(a) + strlen(b) + 2);
    if (r == NULL) return NULL;
    strcpy(r, a);
    strcat(r, " ");
    strcat(r, b);
    return r;
}

int main(void) {
    char *s = join("Hello", "world");
    if (s == NULL) return 1;
    printf("%s\\n", s);
    free(s);
    return 0;
}`,
              expectedOutput: "Hello world",
            },
            {
              type: "exercise",
              id: "c20-ex-name-bug",
              kind: "concept",
              title: "Name the bug",
              prompt: "Name the bug in each fragment:\n\n1. `char *s = malloc(8); s = \"hi\"; free(s);`\n2. `int *a = malloc(40); free(a); a[0] = 1;`\n3. `int *q = malloc(40); int *r = q; free(q); free(r);`",
              hint: "Ask: who owns which block at each moment?",
              solution: "1. A leak (the malloc'd block is lost when s is pointed at the literal) followed by freeing a string literal, which is invalid. Use strcpy instead of assignment. 2. Use-after-free: a is dangling after free. 3. Double free: q and r point to the same block, so it is freed twice.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c20-leak-mcq-1",
              prompt: "Which of these code fragments contains a memory leak?",
              options: [
                { id: "a", text: "int *p = malloc(4); free(p); p = NULL;" },
                { id: "b", text: "int *p = malloc(4); p = malloc(8); free(p);" },
                { id: "c", text: "int *p = NULL; free(p);" },
                { id: "d", text: "int *p = calloc(1, 4); free(p);" },
              ],
              correct: "b",
              explanation: "The first 4-byte block becomes unreachable when p is reassigned, so it can never be freed.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c20-freenull-tf-1",
              prompt: "Calling free(NULL) is safe and does nothing.",
              correct: true,
              explanation: "The C standard guarantees free(NULL) has no effect.",
            },
            {
              type: "FILL_BLANK",
              slug: "c20-dangling-fill-1",
              prompt: "A pointer that still holds the address of memory that has already been freed is called a ___ pointer.",
              accepted: [["dangling"]],
              explanation: "Using a dangling pointer is use-after-free, which is undefined behaviour.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c20-ownership-output-1",
              prompt: "What does this program print?",
              code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *p = malloc(sizeof *p);
    if (p == NULL) return 1;
    *p = 8;
    int *q = p;
    *q += 2;
    printf("%d\\n", *p);
    free(p);
    p = NULL;
    q = NULL;
    printf("%d\\n", p == NULL && q == NULL);
    return 0;
}`,
              expected: "10\n1",
              explanation: "p and q point to the same block, so changing *q changes *p. After free, both are set to NULL, so the condition is true (1). The block is freed exactly once.",
            },
          ],
        },
      ],
    },
  ],
};

export default chapter;
