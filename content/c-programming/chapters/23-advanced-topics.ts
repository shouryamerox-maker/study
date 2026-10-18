import type { ChapterContent } from "../../../src/lib/content/schema";

const chapter: ChapterContent = {
  slug: "advanced-topics",
  title: "Advanced C Topics",
  summary:
    "Function pointers and callbacks with qsort, bit manipulation with masks, the const and volatile qualifiers, command-line arguments, undefined behaviour, debugging techniques and portability.",
  topics: [
    {
      slug: "function-pointers",
      title: "Function pointers and callbacks",
      lessons: [
        {
          slug: "function-pointers-callbacks-qsort",
          title: "Function pointers, callbacks and qsort",
          summary:
            "Storing the address of a function in a variable, passing behaviour into other functions as callbacks, tables of functions, and sorting anything with qsort.",
          estMinutes: 35,
          blocks: [
            {
              type: "objectives",
              items: [
                "Declare, assign and call through a function pointer",
                "Pass a function as a callback parameter to make code reusable",
                "Build an array of function pointers to replace a long switch",
                "Sort arrays of numbers and structs with qsort and a comparison function",
              ],
            },
            {
              type: "markdown",
              md: `You already know that a pointer can hold the address of a variable. Functions also live in memory, so they have addresses too, and C lets you store **a function's address** in a variable. Through that variable you can call whichever function it currently points to.

Why would you want that? Think of a TV remote with a programmable button. The button itself does not know what it does; you *assign* it an action (open Netflix, switch to HDMI 2). Code that receives a function pointer is like that button: it performs "the action", and the caller decides what the action is. This idea, passing behaviour around as a value, is called a **callback**, and it is how C sorts any kind of data, handles events, and builds plug-in systems.`,
            },
            {
              type: "definition",
              term: "Function pointer",
              md: "A variable that stores the address of a function with a particular signature (return type and parameter types). Calling it calls the function it points to.",
            },
            {
              type: "definition",
              term: "Callback",
              md: "A function passed (as a function pointer) to another function, which then 'calls back' into it at the appropriate time. Example: the comparison function you give to `qsort`.",
            },
            {
              type: "syntax",
              language: "c",
              code: `return_type (*name)(parameter_types);   /* declare */

int (*op)(int, int);      /* op points to a function taking (int, int), returning int */
op = add;                 /* a function's name decays to its address (&add also works) */
int r = op(2, 3);         /* call through the pointer ((*op)(2, 3) also works) */

typedef int (*BinaryOp)(int, int);   /* give the pointer type a readable name */
BinaryOp f = multiply;`,
              md: "The parentheses around `*name` are essential: `int *op(int, int);` would declare a **function** returning `int *`, not a pointer.",
            },
            {
              type: "code",
              language: "c",
              title: "One variable, two functions",
              runnable: true,
              code: `#include <stdio.h>

int add(int a, int b) { return a + b; }
int multiply(int a, int b) { return a * b; }

int main(void) {
    int (*op)(int, int);      /* op: pointer to function (int, int) -> int */
    op = add;
    printf("add: %d\\n", op(6, 7));
    op = multiply;
    printf("multiply: %d\\n", op(6, 7));
    return 0;
}`,
              output: `add: 13
multiply: 42`,
              walkthrough: [
                { lines: "3-4", text: "Two functions with the same signature: two ints in, one int out." },
                { lines: "7", text: "Declare the function pointer. Its type must match the functions it will point to." },
                { lines: "8-9", text: "Point it at `add` and call it like a normal function: 6 + 7 = 13." },
                { lines: "10-11", text: "Re-point it at `multiply`. The same call expression now gives 42." },
              ],
            },
            { type: "heading", text: "Callbacks: passing behaviour into a function", level: 2 },
            {
              type: "code",
              language: "c",
              title: "A reusable mapArray with callbacks",
              runnable: true,
              code: `#include <stdio.h>

int square(int x) { return x * x; }
int negate(int x) { return -x; }

void mapArray(int *a, int n, int (*f)(int)) {
    int i;
    for (i = 0; i < n; i++) {
        a[i] = f(a[i]);
    }
}

void printArray(const int *a, int n) {
    int i;
    for (i = 0; i < n; i++) {
        printf(i == 0 ? "%d" : " %d", a[i]);
    }
    printf("\\n");
}

int main(void) {
    int data[4] = {1, 2, 3, 4};
    mapArray(data, 4, square);
    printArray(data, 4);
    mapArray(data, 4, negate);
    printArray(data, 4);
    return 0;
}`,
              output: `1 4 9 16
-1 -4 -9 -16`,
              walkthrough: [
                { lines: "6", text: "The third parameter `f` is a function pointer. `mapArray` does not know or care what `f` does." },
                { lines: "9", text: "The callback is invoked on every element, and the result replaces it." },
                { lines: "16", text: "A small trick: choose the format string with `?:` so the first number has no leading space." },
                { lines: "23-26", text: "The same loop code squares the array, then negates it. To add a new transformation you write a tiny function, not a new loop." },
              ],
            },
            {
              type: "code",
              language: "c",
              title: "A table of operations instead of a switch",
              runnable: true,
              stdin: "0 8 5\n2 8 5\n1 8 5\n7 1 1\n",
              code: `#include <stdio.h>

int add(int a, int b) { return a + b; }
int sub(int a, int b) { return a - b; }
int mul(int a, int b) { return a * b; }

int main(void) {
    int (*ops[3])(int, int) = {add, sub, mul};
    const char *names[3] = {"add", "sub", "mul"};
    int choice, x, y;
    while (scanf("%d %d %d", &choice, &x, &y) == 3) {
        if (choice < 0 || choice > 2) {
            printf("bad choice\\n");
            continue;
        }
        printf("%s(%d, %d) = %d\\n", names[choice], x, y, ops[choice](x, y));
    }
    return 0;
}`,
              output: `add(8, 5) = 13
mul(8, 5) = 40
sub(8, 5) = 3
bad choice`,
              walkthrough: [
                { lines: "8", text: "`ops` is an array of 3 function pointers. Read it inside-out: `ops[3]` is an array, `*` of pointers, `(int, int)` to functions, returning `int`." },
                { lines: "11", text: "Each input line holds a choice and two operands." },
                { lines: "12-15", text: "Always validate an index before using it to pick a function: calling through a garbage pointer is undefined behaviour." },
                { lines: "16", text: "`ops[choice](x, y)` selects and calls the function in one expression. Adding an operation means adding one table entry." },
              ],
            },
            { type: "heading", text: "Sorting anything with qsort", level: 2 },
            {
              type: "markdown",
              md: `The standard library's \`qsort\` (in \`<stdlib.h>\`) can sort an array of **any** type, because you supply the one thing it cannot know: how to compare two elements.

\`void qsort(void *base, size_t count, size_t size, int (*compare)(const void *, const void *));\`

Your comparison function receives two \`const void *\` pointers to elements. It must return a **negative** number if the first should come first, **zero** if they are equal, and a **positive** number if the first should come after the second.`,
            },
            {
              type: "code",
              language: "c",
              title: "qsort with ints and with structs",
              runnable: true,
              code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct Player {
    char name[12];
    int score;
};

int ascending(const void *a, const void *b) {
    int x = *(const int *)a;
    int y = *(const int *)b;
    return (x > y) - (x < y);          /* -1, 0 or 1 */
}

int byName(const void *a, const void *b) {
    const struct Player *p = a;
    const struct Player *q = b;
    return strcmp(p->name, q->name);
}

int main(void) {
    int nums[6] = {42, 7, 19, -3, 88, 0};
    struct Player team[3] = {{"Zara", 70}, {"Ali", 95}, {"Mei", 82}};
    int i;

    qsort(nums, 6, sizeof nums[0], ascending);
    for (i = 0; i < 6; i++) printf(i ? " %d" : "%d", nums[i]);
    printf("\\n");

    qsort(team, 3, sizeof team[0], byName);
    for (i = 0; i < 3; i++) printf("%s:%d\\n", team[i].name, team[i].score);
    return 0;
}`,
              output: `-3 0 7 19 42 88
Ali:95
Mei:82
Zara:70`,
              walkthrough: [
                { lines: "10-14", text: "Convert the `void *` pointers to the real element type, read the values, and return -1, 0 or 1. `(x > y) - (x < y)` avoids the overflow that `x - y` can cause for large values." },
                { lines: "16-20", text: "For structs, compare a field. `strcmp` already returns negative/zero/positive, so it is a perfect comparison result." },
                { lines: "27", text: "Arguments: the array, the number of elements, the size of one element, and the callback. qsort calls `ascending` many times while it sorts." },
                { lines: "31", text: "The very same `qsort` sorts structs; only the size and the callback change." },
              ],
            },
            {
              type: "callout",
              variant: "tip",
              title: "Reversing the order",
              md: "To sort in descending order, swap the arguments: `int descending(const void *a, const void *b) { return ascending(b, a); }`.",
            },
            { type: "heading", text: "Why it works", level: 2 },
            {
              type: "markdown",
              md: `Compiled functions are machine code stored in memory, and the name of a function in an expression evaluates to the address where that code starts. A function pointer simply holds such an address; calling through it means "jump to this address, with these arguments". Because the pointer's type records the parameter and return types, the compiler still knows how to pass the arguments and receive the result correctly.

\`qsort\` works with any type because it treats the array as raw bytes: it knows where element *i* is (\`base + i * size\`) and can swap elements byte by byte. The only type-specific operation, comparison, is delegated to your callback.`,
            },
            { type: "heading", text: "Real-world uses", level: 2 },
            {
              type: "markdown",
              md: `- **Sorting and searching**: \`qsort\` and \`bsearch\` in the standard library.
- **Event handling**: GUI toolkits call your function when a button is clicked; \`signal()\` registers a handler for operating system signals; \`atexit()\` registers functions to run when the program ends.
- **Dispatch tables**: interpreters, command menus and state machines map codes to handler functions.
- **Plug-ins and drivers**: operating system kernels describe devices with structs full of function pointers (open, read, write, close).`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Missing parentheses in the declaration",
                  wrong: `int *op(int, int);       /* a function returning int* */`,
                  right: `int (*op)(int, int);     /* a pointer to a function */`,
                  md: "Without the parentheses, `*` binds to the return type.",
                },
                {
                  title: "Calling the function instead of passing it",
                  wrong: `mapArray(data, 4, square(2));   /* passes the int 4 */`,
                  right: `mapArray(data, 4, square);      /* passes the function */`,
                  md: "Writing parentheses after the name calls the function. Pass just the name to pass the function itself.",
                },
                {
                  title: "Comparison function that returns only 0 or 1",
                  wrong: `int cmp(const void *a, const void *b) {
    return *(const int *)a > *(const int *)b;   /* never negative */
}`,
                  right: `int cmp(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);
}`,
                  md: "qsort needs negative, zero and positive results. A comparison that never returns a negative value gives an incorrectly sorted array.",
                },
                {
                  title: "Wrong element size passed to qsort",
                  wrong: `qsort(team, 3, sizeof(int), byName);`,
                  right: `qsort(team, 3, sizeof team[0], byName);`,
                  md: "The size must be the size of one element of the array being sorted. `sizeof arr[0]` is always right.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "Declaration: return_type (*name)(param_types); the parentheses around *name are required.",
                "A function name used without () evaluates to its address; both f(x) and (*f)(x) call through a pointer.",
                "qsort(base, count, size, cmp) sorts any array; cmp returns <0, 0 or >0.",
                "Comparison functions take const void * parameters and cast them to the real element type.",
                "An array of function pointers can replace a long switch statement (a dispatch table).",
              ],
            },
            {
              type: "recap",
              items: [
                "Functions have addresses; function pointers store them.",
                "Callbacks let one function's behaviour be customised by another.",
                "Dispatch tables select a function by index.",
                "qsort + a comparison callback sorts any data type.",
              ],
            },
            {
              type: "exercise",
              id: "c23-ex-sort-desc",
              kind: "write",
              title: "Sort scores in descending order",
              prompt: "Use `qsort` with your own comparison function to sort `int scores[] = {55, 91, 68, 77, 91, 40};` from highest to lowest and print them separated by spaces.",
              hint: "Return (y > x) - (y < x).",
              solution: "A descending comparison reverses the roles of x and y. Equal values (91, 91) return 0.",
              solutionCode: `#include <stdio.h>
#include <stdlib.h>

int descending(const void *a, const void *b) {
    int x = *(const int *)a;
    int y = *(const int *)b;
    return (y > x) - (y < x);
}

int main(void) {
    int scores[] = {55, 91, 68, 77, 91, 40};
    int n = (int)(sizeof scores / sizeof scores[0]);
    int i;
    qsort(scores, n, sizeof scores[0], descending);
    for (i = 0; i < n; i++) {
        printf(i == 0 ? "%d" : " %d", scores[i]);
    }
    printf("\\n");
    return 0;
}`,
              expectedOutput: "91 91 77 68 55 40",
            },
            {
              type: "exercise",
              id: "c23-ex-apply-twice",
              kind: "predict",
              title: "Predict: applying a function twice",
              prompt: "What does this program print?",
              starterCode: `#include <stdio.h>

int inc(int x) { return x + 1; }
int dbl(int x) { return x * 2; }

int twice(int (*f)(int), int x) {
    return f(f(x));
}

int main(void) {
    printf("%d %d %d\\n", twice(inc, 5), twice(dbl, 5), twice(dbl, twice(inc, 1)));
    return 0;
}`,
              hint: "Work from the inside out for the third value.",
              solution: "twice(inc, 5) = 7; twice(dbl, 5) = 20; twice(inc, 1) = 3, then twice(dbl, 3) = 12. Output: `7 20 12`.",
              solutionCode: `#include <stdio.h>

int inc(int x) { return x + 1; }
int dbl(int x) { return x * 2; }

int twice(int (*f)(int), int x) {
    return f(f(x));
}

int main(void) {
    printf("%d %d %d\\n", twice(inc, 5), twice(dbl, 5), twice(dbl, twice(inc, 1)));
    return 0;
}`,
              expectedOutput: "7 20 12",
            },
            {
              type: "exercise",
              id: "c23-ex-fnptr-concept",
              kind: "concept",
              title: "Read the declaration",
              prompt: "Describe in words what each declaration means:\n\n1. `double (*g)(double);`\n2. `int (*handlers[4])(void);`\n3. `void sortBy(int *a, int n, int (*cmp)(int, int));`",
              hint: "Start at the name and work outwards, respecting parentheses.",
              solution: "1. g is a pointer to a function taking a double and returning a double (e.g. it could point to sqrt). 2. handlers is an array of 4 pointers to functions taking no arguments and returning int. 3. sortBy is a function taking an int pointer, an int, and a pointer to a function that takes two ints and returns an int; sortBy returns nothing.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c23-fnptr-mcq-1",
              prompt: "Which declaration makes `p` a pointer to a function that takes a `char *` and returns an `int`?",
              options: [
                { id: "a", text: "int *p(char *);" },
                { id: "b", text: "int (*p)(char *);" },
                { id: "c", text: "int (p*)(char *);" },
                { id: "d", text: "(int *)p(char *);" },
              ],
              correct: "b",
              explanation: "The parentheses bind * to p, making p a pointer; the rest gives the function's signature. (a) declares a function returning int *.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c23-qsort-tf-1",
              prompt: "The comparison function passed to qsort must return a negative value, zero, or a positive value depending on the order of its two arguments.",
              correct: true,
              explanation: "qsort interprets the sign of the result.",
            },
            {
              type: "FILL_BLANK",
              slug: "c23-qsort-fill-1",
              prompt: "The parameters of a qsort comparison function have type const ___ *.",
              accepted: [["void"]],
              explanation: "qsort works on any type, so it passes generic const void * pointers.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c23-fnptr-output-1",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

int half(int x) { return x / 2; }
int triple(int x) { return x * 3; }

int main(void) {
    int (*steps[3])(int) = {triple, half, triple};
    int i, v = 4;
    for (i = 0; i < 3; i++) {
        v = steps[i](v);
    }
    printf("%d\\n", v);
    return 0;
}`,
              expected: "18",
              explanation: "4 → triple → 12 → half → 6 → triple → 18.",
            },
          ],
        },
      ],
    },
    {
      slug: "low-level-c",
      title: "Bits and qualifiers",
      lessons: [
        {
          slug: "bit-manipulation-const-volatile",
          title: "Bit manipulation, const and volatile",
          summary:
            "Setting, clearing, toggling and testing bits with masks, packing flags into one integer, and the const and volatile type qualifiers.",
          estMinutes: 35,
          blocks: [
            {
              type: "objectives",
              items: [
                "Set, clear, toggle and test individual bits using masks",
                "Pack several on/off flags into one unsigned integer",
                "Extract a field of bits with shifts and masks",
                "Apply const correctly to variables, pointers and parameters, and explain volatile",
              ],
            },
            {
              type: "markdown",
              md: `Inside the computer every integer is a row of bits, each 0 or 1. Most of the time you do not care about individual bits, but sometimes you do: a game might store eight yes/no settings in a single byte, a network packet has fields that are a few bits wide, and a microcontroller turns an LED on by setting bit 5 of a hardware register.

Picture a row of light switches on a wall. **Bit manipulation** is flipping particular switches without disturbing the others. The tool for selecting switches is a **mask**: a number with 1s in exactly the positions you want to touch.

You met the bitwise operators \`&\`, \`|\`, \`^\`, \`~\`, \`<<\` and \`>>\` in the operators chapter. Here we put them to work. Always use **unsigned** types for bit work: shifting signed values can be implementation-defined or undefined.`,
            },
            {
              type: "definition",
              term: "Bit position",
              md: "Bits are numbered from 0 at the least significant (rightmost) end. In the 8-bit value `00100100`, bits 2 and 5 are set (5 = 32, 2 = 4, total 36).",
            },
            {
              type: "definition",
              term: "Mask",
              md: "A value whose 1 bits mark the positions an operation should affect. `1u << k` is the mask for bit k alone; `0xFFu` is the mask for the lowest 8 bits.",
            },
            {
              type: "table",
              caption: "The four core bit operations (k = bit number)",
              headers: ["Goal", "Expression", "Why it works"],
              rows: [
                ["Set bit k", "x |= (1u << k)", "OR with 1 forces a 1; OR with 0 leaves bits unchanged"],
                ["Clear bit k", "x &= ~(1u << k)", "~ makes a mask with a 0 at k; AND with 0 forces 0"],
                ["Toggle bit k", "x ^= (1u << k)", "XOR with 1 flips; XOR with 0 leaves unchanged"],
                ["Test bit k", "(x >> k) & 1u   or   x & (1u << k)", "Isolates bit k; non-zero means set"],
              ],
            },
            {
              type: "syntax",
              language: "c",
              code: `#define BIT(k)          (1u << (k))
x |=  BIT(k);              /* set    */
x &= ~BIT(k);              /* clear  */
x ^=  BIT(k);              /* toggle */
if (x & BIT(k)) { ... }    /* test   */
field = (x >> shift) & mask;   /* extract a multi-bit field */`,
            },
            {
              type: "code",
              language: "c",
              title: "Set, clear, toggle and test",
              runnable: true,
              code: `#include <stdio.h>

void printBinary(unsigned int x) {
    int i;
    for (i = 7; i >= 0; i--) {
        putchar(((x >> i) & 1u) ? '1' : '0');
    }
    putchar('\\n');
}

int main(void) {
    unsigned int flags = 0;          /* 00000000 */
    flags |= 1u << 3;                /* set bit 3    */
    printBinary(flags);
    flags |= 1u << 0;                /* set bit 0    */
    printBinary(flags);
    flags ^= 1u << 5;                /* toggle bit 5 */
    printBinary(flags);
    flags &= ~(1u << 3);             /* clear bit 3  */
    printBinary(flags);
    printf("bit 5 is %s\\n", (flags & (1u << 5)) ? "set" : "clear");
    printf("bit 3 is %s\\n", (flags & (1u << 3)) ? "set" : "clear");
    return 0;
}`,
              output: `00001000
00001001
00101001
00100001
bit 5 is set
bit 3 is clear`,
              walkthrough: [
                { lines: "3-9", text: "Print the lowest 8 bits from bit 7 down to bit 0: shift the wanted bit to position 0 and keep only it with `& 1u`." },
                { lines: "13", text: "`1u << 3` is `00001000`. OR-ing it in sets bit 3." },
                { lines: "15", text: "Setting bit 0 leaves bit 3 untouched: `00001001`." },
                { lines: "17", text: "XOR flips bit 5 from 0 to 1: `00101001`. Doing it again would flip it back." },
                { lines: "19", text: "`~(1u << 3)` is all ones except bit 3. AND-ing clears just that bit: `00100001`." },
                { lines: "21-22", text: "Testing: the AND is non-zero only if the bit is set." },
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Named flags: file permissions in one integer",
              runnable: true,
              code: `#include <stdio.h>

#define PERM_READ   (1u << 0)   /* 001 */
#define PERM_WRITE  (1u << 1)   /* 010 */
#define PERM_EXEC   (1u << 2)   /* 100 */

void show(unsigned int p) {
    printf("%c%c%c\\n",
           (p & PERM_READ)  ? 'r' : '-',
           (p & PERM_WRITE) ? 'w' : '-',
           (p & PERM_EXEC)  ? 'x' : '-');
}

int main(void) {
    unsigned int perms = PERM_READ | PERM_WRITE;
    show(perms);
    perms |= PERM_EXEC;
    show(perms);
    perms &= ~PERM_WRITE;
    show(perms);
    if ((perms & (PERM_READ | PERM_EXEC)) == (PERM_READ | PERM_EXEC)) {
        printf("can read and execute\\n");
    }
    return 0;
}`,
              output: `rw-
rwx
r-x
can read and execute`,
              walkthrough: [
                { lines: "3-5", text: "Give each bit a name. Code that says `PERM_WRITE` is far easier to read than `2`." },
                { lines: "15", text: "Combine flags with `|`: read and write." },
                { lines: "17, 19", text: "Grant execute, then revoke write, each without touching the other flags." },
                { lines: "21", text: "To require **all** of several flags, mask them and compare with the full mask. `perms & (A | B)` alone would be true if **either** were set." },
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Bit tricks: counting bits, powers of two, colour channels",
              runnable: true,
              code: `#include <stdio.h>

int countBits(unsigned int x) {
    int count = 0;
    while (x != 0) {
        x &= x - 1;        /* clears the lowest set bit */
        count++;
    }
    return count;
}

int isPowerOfTwo(unsigned int x) {
    return x != 0 && (x & (x - 1)) == 0;
}

int main(void) {
    unsigned int color = 0x3366CCu;     /* red=0x33, green=0x66, blue=0xCC */
    printf("bits set in 13: %d\\n", countBits(13));
    printf("64 power of two? %d\\n", isPowerOfTwo(64));
    printf("96 power of two? %d\\n", isPowerOfTwo(96));
    printf("red=%u green=%u blue=%u\\n",
           (color >> 16) & 0xFFu, (color >> 8) & 0xFFu, color & 0xFFu);
    return 0;
}`,
              output: `bits set in 13: 3
64 power of two? 1
96 power of two? 0
red=51 green=102 blue=204`,
              walkthrough: [
                { lines: "6", text: "Subtracting 1 flips the lowest set bit and all zeros below it; AND-ing removes that bit. 13 (1101) → 1100 → 1000 → 0: three iterations." },
                { lines: "13", text: "A power of two has exactly one bit set, so removing its lowest set bit leaves 0. 96 = 1100000 has two bits set." },
                { lines: "17", text: "A colour packed as 0xRRGGBB, 8 bits per channel." },
                { lines: "21-22", text: "Shift the wanted field down to the bottom, then mask off everything above it: 0x33 = 51, 0x66 = 102, 0xCC = 204." },
              ],
            },
            { type: "heading", text: "The const qualifier", level: 2 },
            {
              type: "markdown",
              md: `\`const\` promises that something will not be modified through that name; the compiler enforces the promise. With pointers there are **two** things that could be constant: the data pointed to, and the pointer itself. Read declarations from right to left: \`const int *p\` is "p is a pointer to an int that is const".`,
            },
            {
              type: "table",
              caption: "const and pointers",
              headers: ["Declaration", "Change *p?", "Change p?", "Read as"],
              rows: [
                ["int *p", "Yes", "Yes", "pointer to int"],
                ["const int *p  (same as int const *p)", "No", "Yes", "pointer to const int"],
                ["int *const p", "Yes", "No", "const pointer to int"],
                ["const int *const p", "No", "No", "const pointer to const int"],
              ],
            },
            {
              type: "code",
              language: "c",
              title: "const in practice",
              runnable: true,
              code: `#include <stdio.h>

int sumArray(const int *a, int n) {   /* promise: will not modify a[] */
    int i, s = 0;
    for (i = 0; i < n; i++) {
        s += a[i];
    }
    return s;
}

int main(void) {
    const int limit = 3;
    int values[3] = {4, 5, 6};
    const int *pc = values;       /* pointer to const int: cannot change *pc */
    int *const cp = values;       /* const pointer: cannot change cp itself */
    pc++;                         /* OK: move the pointer */
    *cp = 40;                     /* OK: change the pointed-to int */
    printf("%d %d %d\\n", *pc, *cp, sumArray(values, limit));
    return 0;
}`,
              output: "5 40 51",
              walkthrough: [
                { lines: "3", text: "`const int *a` documents and enforces that the function only reads the array. Callers can pass const or non-const arrays." },
                { lines: "12", text: "A const variable must be initialised and can never be assigned afterwards." },
                { lines: "14-17", text: "`pc` may move (now points at 5) but `*pc = 1;` would be a compile error. `cp` may modify its target (values[0] becomes 40) but `cp++` would be an error." },
                { lines: "18", text: "40 + 5 + 6 = 51." },
              ],
            },
            { type: "heading", text: "The volatile qualifier", level: 2 },
            {
              type: "markdown",
              md: `\`volatile\` tells the compiler: *this value may change at any moment for reasons you cannot see*, so every read must really read memory and every write must really write it. Without it, an optimising compiler may keep a copy in a register and never look at memory again.

You need \`volatile\` for:
- **Memory-mapped hardware registers**, e.g. \`volatile unsigned int *const STATUS = (unsigned int *)0x40021000;\` on a microcontroller.
- **Variables changed by a signal handler** (use \`volatile sig_atomic_t\`).
- Variables changed by an interrupt routine in embedded code.

\`volatile\` does **not** make code thread-safe; for threads, use the atomic types and mutexes from \`<stdatomic.h>\` and threading libraries.`,
            },
            {
              type: "code",
              language: "c",
              title: "Typical embedded use of volatile (not runnable on a PC)",
              runnable: false,
              code: `#define UART_STATUS (*(volatile unsigned int *)0x4000C018u)
#define TX_READY    (1u << 5)

void waitUntilReady(void) {
    /* Without volatile, the compiler could read the register once
       and loop forever on the cached value. */
    while ((UART_STATUS & TX_READY) == 0) {
        /* busy-wait */
    }
}`,
            },
            { type: "heading", text: "Why it works", level: 2 },
            {
              type: "markdown",
              md: `Bitwise operators work on every bit position independently and in parallel: bit *k* of \`a & b\` depends only on bit *k* of \`a\` and bit *k* of \`b\`. A mask exploits the identities \`x | 0 = x\`, \`x & 1 = x\` and \`x ^ 0 = x\` (leave alone) versus \`x | 1 = 1\`, \`x & 0 = 0\` and \`x ^ 1 = !x\` (force or flip). That is why a mask changes exactly its 1-positions (or, for clearing, its 0-positions) and nothing else.

\`const\` and \`volatile\` are **type qualifiers**: they do not change how a value is stored, only what the compiler allows (const) or assumes (volatile). const errors are caught at compile time, so they cost nothing at run time.`,
            },
            { type: "heading", text: "Real-world uses", level: 2 },
            {
              type: "markdown",
              md: `- **Embedded systems**: configuring peripherals by setting bits in registers.
- **Operating systems**: Unix file permissions (\`rwxr-xr-x\` is 9 bits), open-file flags such as \`O_CREAT | O_WRONLY\`.
- **Graphics**: packing RGBA colours into 32-bit integers.
- **Networking and compression**: protocol headers and encoded data are bit fields.
- **APIs**: \`const char *\` parameters (as in \`strlen\`, \`printf\`) promise the function will not modify your string.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Using & or | where the logical operator was meant (and vice versa)",
                  wrong: `if (flags && PERM_WRITE)   /* true whenever flags != 0 */`,
                  right: `if (flags & PERM_WRITE)    /* tests the write bit */`,
                  md: "`&&` asks whether both values are non-zero; `&` combines bits. Bit tests need `&`.",
                },
                {
                  title: "Clearing a bit with & instead of & ~",
                  wrong: `x &= (1u << 3);    /* clears everything EXCEPT bit 3 */`,
                  right: `x &= ~(1u << 3);   /* clears only bit 3 */`,
                  md: "To clear, AND with the inverted mask.",
                },
                {
                  title: "Precedence: comparing before masking",
                  wrong: `if (x & MASK == MASK)   /* parsed as x & (MASK == MASK) */`,
                  right: `if ((x & MASK) == MASK)`,
                  md: "`==` has higher precedence than `&`. Always parenthesise bitwise expressions in comparisons.",
                },
                {
                  title: "Shifting by too much or shifting signed values",
                  wrong: `int big = 1 << 31;      /* undefined for 32-bit int */
unsigned int y = 1u << 32;   /* undefined: shift >= width */`,
                  right: `unsigned int big = 1u << 31;   /* fine */`,
                  md: "Shifting into the sign bit of a signed int, or by a count ≥ the type's width, is undefined behaviour. Use unsigned types and keep shift counts in range.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "Set: x |= 1u << k. Clear: x &= ~(1u << k). Toggle: x ^= 1u << k. Test: x & (1u << k).",
                "Extract a field: (x >> shift) & mask.",
                "x & (x - 1) clears the lowest set bit; x is a power of two if x != 0 and x & (x - 1) == 0.",
                "const int *p: data is read-only; int *const p: pointer is read-only.",
                "volatile forces every access to go to memory; used for hardware registers and signal-handler flags, not for thread safety.",
                "Use unsigned types for bit manipulation.",
              ],
            },
            {
              type: "recap",
              items: [
                "Masks select which bits an operation affects.",
                "| sets, & ~ clears, ^ toggles, & tests.",
                "Named flag macros make bit code readable.",
                "const protects data from modification; volatile stops the compiler caching a value.",
              ],
            },
            {
              type: "exercise",
              id: "c23-ex-bits-predict",
              kind: "predict",
              title: "Predict the bit operations",
              prompt: "What does this program print?",
              starterCode: `#include <stdio.h>

int main(void) {
    unsigned int x = 0xF0u;      /* 1111 0000 */
    x |= 1u << 1;
    x &= ~(1u << 7);
    x ^= 0x0Fu;
    printf("%u %X\\n", x, x);
    return 0;
}`,
              hint: "Track the 8 bits after each line. %X prints in uppercase hexadecimal.",
              solution: "11110000 → set bit 1 → 11110010 → clear bit 7 → 01110010 → toggle low four bits → 01111101 = 125 = 0x7D. Output: `125 7D`.",
              solutionCode: `#include <stdio.h>

int main(void) {
    unsigned int x = 0xF0u;      /* 1111 0000 */
    x |= 1u << 1;
    x &= ~(1u << 7);
    x ^= 0x0Fu;
    printf("%u %X\\n", x, x);
    return 0;
}`,
              expectedOutput: "125 7D",
            },
            {
              type: "exercise",
              id: "c23-ex-fix-bit-test",
              kind: "debug",
              title: "Fix the bit test",
              prompt: "The program should print `bit 2 clear` for x = 9 (binary 1001), but prints `bit 2 set`. Fix the condition.",
              starterCode: `#include <stdio.h>

int main(void) {
    unsigned int x = 9;
    if (x && (1u << 2)) {
        printf("bit 2 set\\n");
    } else {
        printf("bit 2 clear\\n");
    }
    return 0;
}`,
              hint: "Logical AND versus bitwise AND.",
              solution: "`&&` is true because both operands are non-zero. Use `&` to test the bit: `if (x & (1u << 2))`.",
              solutionCode: `#include <stdio.h>

int main(void) {
    unsigned int x = 9;
    if (x & (1u << 2)) {
        printf("bit 2 set\\n");
    } else {
        printf("bit 2 clear\\n");
    }
    return 0;
}`,
              expectedOutput: "bit 2 clear",
            },
            {
              type: "exercise",
              id: "c23-ex-const-concept",
              kind: "concept",
              title: "Which lines compile?",
              prompt: "Given `int a = 1, b = 2; const int *p = &a; int *const q = &a;`, which of these statements compile, and why?\n\n1. `p = &b;`\n2. `*p = 5;`\n3. `q = &b;`\n4. `*q = 5;`",
              hint: "Read each declaration right to left.",
              solution: "1. Compiles: p itself is not const. 2. Error: p points to const int. 3. Error: q is a const pointer. 4. Compiles: q points to a non-const int, so a becomes 5.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c23-bits-mcq-1",
              prompt: "Which expression clears bit 4 of `x` and leaves all other bits unchanged?",
              options: [
                { id: "a", text: "x &= (1u << 4);" },
                { id: "b", text: "x |= ~(1u << 4);" },
                { id: "c", text: "x &= ~(1u << 4);" },
                { id: "d", text: "x ^= (1u << 4);" },
              ],
              correct: "c",
              explanation: "AND with a mask that is 0 only at bit 4. (d) toggles, which would set the bit if it was clear.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c23-bits-output-1",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

int main(void) {
    unsigned int v = 0xABu;
    printf("%u %u %u\\n", v >> 4, v & 0x0Fu, (v >> 3) & 1u);
    return 0;
}`,
              expected: "10 11 1",
              explanation: "0xAB = 1010 1011. High nibble 0xA = 10, low nibble 0xB = 11, bit 3 is 1.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c23-const-tf-1",
              prompt: "With the declaration `const char *s = name;`, the statement `s++;` is a compile error.",
              correct: false,
              explanation: "s is a pointer to const char; the pointer itself may change. Only *s = ... is forbidden.",
            },
            {
              type: "FILL_BLANK",
              slug: "c23-volatile-fill-1",
              prompt: "The type qualifier ___ tells the compiler that a variable may change outside the program's normal flow (e.g. a hardware register), so it must not cache its value.",
              accepted: [["volatile"]],
              explanation: "volatile forces every read and write to access memory.",
            },
            {
              type: "CODE_WRITING",
              slug: "c23-bit-commands-code",
              prompt: "Read an unsigned starting value `v` (decimal). Then read commands until EOF, each a letter and a bit number k (0–31):\n\n- `S k`: set bit k, then print v\n- `C k`: clear bit k, then print v\n- `T k`: toggle bit k, then print v\n- `Q k`: print 1 if bit k is set, else 0\n\nPrint each result (in decimal) on its own line. Use unsigned arithmetic and masks.",
              starterCode: `#include <stdio.h>

int main(void) {
    unsigned int v;
    char cmd;
    int k;
    scanf("%u", &v);
    while (scanf(" %c %d", &cmd, &k) == 2) {
        /* handle S, C, T, Q */
    }
    return 0;
}`,
              sampleTests: [
                { stdin: "0\nS 3\nS 0\nQ 3\nT 3\nQ 3\n", expected: "8\n9\n1\n1\n0" },
                { stdin: "255\nC 7\nC 0\nQ 1\n", expected: "127\n126\n1" },
              ],
              hiddenTests: [
                { stdin: "5\nT 1\nT 1\n", expected: "7\n5" },
                { stdin: "1\nQ 0\nQ 31\n", expected: "1\n0" },
                { stdin: "16\nS 4\nC 4\nC 4\n", expected: "16\n0\n0" },
              ],
              solutionCode: `#include <stdio.h>

int main(void) {
    unsigned int v;
    char cmd;
    int k;
    if (scanf("%u", &v) != 1) return 0;
    while (scanf(" %c %d", &cmd, &k) == 2) {
        unsigned int mask = 1u << k;
        if (cmd == 'S') {
            v |= mask;
            printf("%u\\n", v);
        } else if (cmd == 'C') {
            v &= ~mask;
            printf("%u\\n", v);
        } else if (cmd == 'T') {
            v ^= mask;
            printf("%u\\n", v);
        } else if (cmd == 'Q') {
            printf("%d\\n", (v & mask) ? 1 : 0);
        }
    }
    return 0;
}`,
              explanation: "Build the mask once with 1u << k, then use |=, &= ~, ^= or & as appropriate. The space before %c in scanf skips the newline left from the previous line.",
            },
          ],
        },
      ],
    },
    {
      slug: "robust-programs",
      title: "Robust and portable programs",
      lessons: [
        {
          slug: "command-line-ub-debugging",
          title: "Command-line arguments, undefined behaviour and debugging",
          summary:
            "Reading argc and argv, a catalogue of undefined behaviour to avoid, practical debugging with printf, compiler warnings and gdb, and writing portable C.",
          estMinutes: 40,
          blocks: [
            {
              type: "objectives",
              items: [
                "Read command-line arguments through argc and argv",
                "Recognise the most common forms of undefined behaviour",
                "Debug systematically with printf tracing, compiler warnings and gdb",
                "Write code that behaves the same on different compilers and systems",
              ],
            },
            {
              type: "markdown",
              md: `This lesson is about the habits that separate programs that *happen to work* from programs that *keep working*: taking input from the command line like professional tools, knowing which code C refuses to define, and finding bugs efficiently when they appear.

When you type \`gcc -Wall hello.c -o hello\`, you are giving the program \`gcc\` five extra words. Your own programs can receive words the same way through two parameters of \`main\`.`,
            },
            {
              type: "definition",
              term: "argc and argv",
              md: "The alternative form `int main(int argc, char *argv[])` receives the command line. `argc` (argument count) is the number of words, including the program name. `argv` (argument vector) is an array of strings: `argv[0]` is the program name, `argv[1]` to `argv[argc - 1]` are the arguments, and `argv[argc]` is NULL.",
            },
            {
              type: "syntax",
              language: "c",
              code: `int main(int argc, char *argv[])    /* also written: char **argv */
{
    /* argv[0]          program name (form depends on the system)
       argv[1]..argv[argc-1]  arguments, always as strings
       argv[argc]       NULL */
}`,
              md: "Arguments are always strings. Convert numbers with `atoi`, `atof` or, more robustly, `strtol` / `strtod`.",
            },
            {
              type: "code",
              language: "c",
              title: "Summing numbers given on the command line",
              runnable: true,
              code: `#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[]) {
    int i, total = 0;
    printf("argc = %d\\n", argc);
    if (argc < 2) {
        printf("No numbers given. Usage: sum 4 8 15\\n");
        return 0;
    }
    for (i = 1; i < argc; i++) {
        total += atoi(argv[i]);
    }
    printf("Sum of %d numbers: %d\\n", argc - 1, total);
    return 0;
}`,
              output: `argc = 1
No numbers given. Usage: sum 4 8 15`,
              walkthrough: [
                { lines: "4", text: "This form of `main` receives the command line from the operating system." },
                { lines: "6", text: "The online runner starts the program with no extra arguments, so argc is 1 (just the program name). That is the output shown." },
                { lines: "7-10", text: "Good command-line programs check argc and print a usage message rather than reading argv entries that do not exist." },
                { lines: "11-13", text: "Start at index 1 to skip the program name. `atoi` converts each string to an int." },
              ],
            },
            {
              type: "output",
              title: "Running it yourself in a terminal: ./sum 4 8 15",
              text: `argc = 4
Sum of 3 numbers: 27`,
            },
            {
              type: "markdown",
              md: `Since the online runner cannot pass arguments, a handy trick for testing is to put the argument-processing logic in a function and call it with a hand-made \`argv\` array:`,
            },
            {
              type: "code",
              language: "c",
              title: "Parsing options with a simulated argv",
              runnable: true,
              code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int run(int argc, char *argv[]) {
    const char *name = "world";
    int times = 1, i;
    for (i = 1; i < argc; i++) {
        if (strcmp(argv[i], "--name") == 0 && i + 1 < argc) {
            name = argv[++i];
        } else if (strcmp(argv[i], "--times") == 0 && i + 1 < argc) {
            times = atoi(argv[++i]);
        } else {
            printf("unknown option: %s\\n", argv[i]);
            return 1;
        }
    }
    for (i = 0; i < times; i++) {
        printf("Hello, %s!\\n", name);
    }
    return 0;
}

int main(void) {
    char *fakeArgv[] = {"greet", "--name", "Lina", "--times", "2", NULL};
    return run(5, fakeArgv);
}`,
              output: `Hello, Lina!
Hello, Lina!`,
              walkthrough: [
                { lines: "5", text: "`run` has exactly the same parameters as `main(int argc, char *argv[])`, so it could later be called as `return run(argc, argv);`." },
                { lines: "9-10", text: "An option that takes a value: check that a value follows (`i + 1 < argc`), then move `i` past it with `++i`." },
                { lines: "13-15", text: "Reject anything unrecognised with a message and a non-zero exit status." },
                { lines: "24-25", text: "A hand-built argv, terminated by NULL just like the real one." },
              ],
            },
            { type: "heading", text: "A catalogue of undefined behaviour", level: 2 },
            {
              type: "definition",
              term: "Undefined behaviour (UB)",
              md: "Code for which the C standard imposes **no requirements**. The program may crash, print nonsense, appear to work, or behave differently with another compiler or optimisation level. Compilers are allowed to assume UB never happens, which can make the results very surprising.",
            },
            {
              type: "table",
              caption: "Common undefined behaviour and how to avoid it",
              headers: ["Undefined behaviour", "Example", "Avoid by"],
              rows: [
                ["Array index out of bounds", "int a[5]; a[5] = 1;", "Loop with i < n; validate indexes"],
                ["Reading an uninitialised local", "int s; s += 1;", "Initialise every variable"],
                ["Signed integer overflow", "int x = INT_MAX; x + 1", "Check against INT_MAX/INT_MIN first; use wider or unsigned types"],
                ["Dereferencing NULL or an invalid pointer", "int *p = NULL; *p = 3;", "Check pointers before use"],
                ["Use after free / double free", "free(p); *p = 1;", "Set pointers to NULL after free"],
                ["Modifying a variable twice without sequencing", "i = i++ + 1;  a[i] = i++;", "One side effect per variable per expression"],
                ["Division or modulus by zero", "x / 0, x % 0", "Check the divisor"],
                ["Bad shift count", "1u << 32 (32-bit), 1 << -1", "Keep 0 ≤ count < width"],
                ["Modifying a string literal", "char *s = \"hi\"; s[0] = 'H';", "Use char s[] = \"hi\"; for modifiable text"],
                ["Returning address of a local", "return &localVar;", "Return a value, static, or heap memory"],
                ["printf format mismatch", "printf(\"%d\", 3.5);", "Match specifiers to types; compile with -Wall"],
                ["Using a missing return value", "int f(void) { } ... x = f();", "Every path of a non-void function returns a value"],
              ],
            },
            {
              type: "callout",
              variant: "warning",
              title: "'It works on my machine' is not proof",
              md: "A program containing UB can pass every test today and fail after a compiler upgrade or with `-O2`. Never reason about what UB 'usually does'; remove it.",
            },
            {
              type: "code",
              language: "c",
              title: "Checking before overflowing",
              runnable: true,
              code: `#include <stdio.h>
#include <limits.h>

/* Returns 1 and stores a + b in *result if it fits in an int, else returns 0. */
int safeAdd(int a, int b, int *result) {
    if ((b > 0 && a > INT_MAX - b) || (b < 0 && a < INT_MIN - b)) {
        return 0;
    }
    *result = a + b;
    return 1;
}

int main(void) {
    int r;
    unsigned int u = UINT_MAX;
    if (safeAdd(2000000000, 2000000000, &r)) {
        printf("%d\\n", r);
    } else {
        printf("overflow avoided\\n");
    }
    if (safeAdd(40, 2, &r)) {
        printf("40 + 2 = %d\\n", r);
    }
    u = u + 1;                       /* unsigned arithmetic wraps: defined */
    printf("unsigned wraps to %u\\n", u);
    return 0;
}`,
              output: `overflow avoided
40 + 2 = 42
unsigned wraps to 0`,
              walkthrough: [
                { lines: "6", text: "Test **before** adding, using subtraction that cannot itself overflow. If b is positive, a + b overflows exactly when a > INT_MAX - b." },
                { lines: "16-20", text: "2,000,000,000 + 2,000,000,000 does not fit in a 32-bit int, so the addition is never performed." },
                { lines: "24-25", text: "Unsigned types are different: the standard defines that they wrap around modulo 2ⁿ, so UINT_MAX + 1 is 0." },
              ],
            },
            { type: "heading", text: "Debugging techniques", level: 2 },
            {
              type: "markdown",
              md: `Debugging is detective work: form a hypothesis about where things go wrong, gather evidence, narrow it down. Three tools cover most cases.

**1. Compiler warnings: let the compiler find bugs for free.** Always compile with \`gcc -Wall -Wextra -g prog.c -o prog\`. \`-Wall\` and \`-Wextra\` enable warnings about uninitialised variables, format mismatches, missing returns, \`=\` used in conditions, unused variables and more. Treat every warning as a bug until proven otherwise.

**2. printf debugging (tracing).** Print the values of key variables at key points to see where reality departs from your expectation. Label every line, and remove or disable the traces afterwards (a \`#if TRACE\` switch makes this easy).

**3. A debugger (gdb).** Pause the program at any line, inspect variables, and step through one line at a time, without editing the code.`,
            },
            {
              type: "code",
              language: "c",
              title: "Tracing a loop to check its logic",
              runnable: true,
              code: `#include <stdio.h>

#define TRACE 1

int findMax(const int *a, int n) {
    int i, best = a[0];
    for (i = 1; i < n; i++) {
#if TRACE
        printf("[trace] i=%d a[i]=%d best=%d\\n", i, a[i], best);
#endif
        if (a[i] > best) best = a[i];
    }
    return best;
}

int main(void) {
    int temps[4] = {-7, -3, -9, -4};
    printf("max = %d\\n", findMax(temps, 4));
    return 0;
}`,
              output: `[trace] i=1 a[i]=-3 best=-7
[trace] i=2 a[i]=-9 best=-3
[trace] i=3 a[i]=-4 best=-3
max = -3`,
              walkthrough: [
                { lines: "3", text: "Set TRACE to 0 to remove all tracing at compile time." },
                { lines: "6", text: "Starting `best` at `a[0]` (not 0) is the fix for a classic bug: with all-negative data, `best = 0` would wrongly return 0. The trace makes such mistakes visible immediately." },
                { lines: "9", text: "Each trace line is labelled and shows the loop index, the current element and the running best." },
              ],
            },
            {
              type: "code",
              language: "shell",
              title: "A first gdb session",
              runnable: false,
              code: `gcc -Wall -g prog.c -o prog     # -g adds debugging information
gdb ./prog
(gdb) break findMax               # stop when findMax is called
(gdb) run                         # start the program
(gdb) next                        # execute the next line (step over calls)
(gdb) step                        # step into a function call
(gdb) print best                  # show a variable
(gdb) print a[2]
(gdb) display i                   # show i after every step
(gdb) backtrace                   # which functions led here (great after a crash)
(gdb) continue                    # run to the next breakpoint
(gdb) quit`,
            },
            {
              type: "table",
              caption: "Warnings that often reveal real bugs",
              headers: ["Warning (gcc -Wall, paraphrased)", "Typical cause"],
              rows: [
                ["'x' is used uninitialized", "Missing initial value"],
                ["format '%d' expects argument of type 'int', but argument has type 'double'", "Wrong printf specifier"],
                ["suggest parentheses around assignment used as truth value", "if (x = 5) instead of if (x == 5)"],
                ["control reaches end of non-void function", "A path with no return statement"],
                ["implicit declaration of function 'malloc'", "Missing #include"],
                ["comparison of integer expressions of different signedness", "int compared with size_t/unsigned"],
              ],
            },
            { type: "heading", text: "Writing portable C", level: 2 },
            {
              type: "table",
              caption: "Portability pitfalls",
              headers: ["Non-portable assumption", "Portable approach"],
              rows: [
                ["int is always 32 bits; long is 64 bits", "Use <stdint.h>: int32_t, int64_t, uint8_t; use sizeof"],
                ["char is signed (or unsigned)", "Use signed char / unsigned char explicitly for numbers"],
                ["Struct layout and padding are the same everywhere", "Do not fwrite structs for data exchange; use text or explicit byte formats"],
                ["Byte order (endianness) is little-endian", "Serialise multi-byte values byte by byte"],
                ["fflush(stdin), <conio.h>, getch(), system(\"pause\")", "Standard library only; read leftover input with a getchar loop"],
                ["void main()", "int main(void) or int main(int argc, char *argv[])"],
                ["Paths with backslashes, \\r\\n line endings", "Forward slashes; text mode handles newlines"],
              ],
            },
            { type: "heading", text: "Why it works", level: 2 },
            {
              type: "markdown",
              md: `C was designed to run efficiently on very different machines, so the standard deliberately leaves some things open: sizes of types (*implementation-defined*: each compiler must document its choice) and erroneous operations (*undefined*: no requirements at all). Leaving overflow or out-of-bounds access undefined means the compiler never has to insert checks, which makes C fast, but it moves the responsibility to you. Warnings, sanitizers (\`-fsanitize=address,undefined\`) and debuggers are how professionals take on that responsibility without guessing.

On start-up, the operating system splits the command line into words, copies them into memory as strings, builds the \`argv\` array of pointers to them, and calls \`main(argc, argv)\`. That is why every argument is a string and why \`argv[argc]\` is a NULL sentinel.`,
            },
            { type: "heading", text: "Real-world uses", level: 2 },
            {
              type: "markdown",
              md: `- Practically every command-line tool (\`gcc\`, \`git\`, \`ls\`, \`grep\`) parses argv; on Unix-like systems \`getopt\` helps with standard option syntax.
- Security reviews hunt for undefined behaviour, since buffer overflows and use-after-free are a major source of vulnerabilities.
- Professional builds use \`-Wall -Wextra -Werror\` so that warnings fail the build, and continuous integration runs tests under sanitizers.
- Portable code with fixed-width types runs on everything from 8-bit microcontrollers to supercomputers.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Reading argv without checking argc",
                  wrong: `int main(int argc, char *argv[]) {
    int n = atoi(argv[1]);      /* crashes if no argument */`,
                  right: `int main(int argc, char *argv[]) {
    if (argc < 2) {
        printf("usage: %s N\\n", argv[0]);
        return 1;
    }
    int n = atoi(argv[1]);`,
                  md: "If the user supplies no argument, argv[1] is NULL; passing it to atoi is undefined behaviour.",
                },
                {
                  title: "Comparing strings in argv with ==",
                  wrong: `if (argv[1] == "--help")     /* compares addresses */`,
                  right: `if (strcmp(argv[1], "--help") == 0)`,
                  md: "== compares pointers, not text. Use strcmp from <string.h>.",
                },
                {
                  title: "Ignoring warnings",
                  wrong: `gcc prog.c -o prog     # no warnings enabled`,
                  right: `gcc -Wall -Wextra -g prog.c -o prog`,
                  md: "Many bugs in this course (uninitialised variables, wrong format specifiers, = vs ==) produce warnings. Turn them on and read them.",
                },
                {
                  title: "Modifying a variable twice in one expression",
                  wrong: `i = i++ + 1;          /* undefined behaviour */
printf("%d %d", i, i++);   /* undefined behaviour */`,
                  right: `i = i + 2;
printf("%d ", i);
i++;
printf("%d", i);`,
                  md: "Split side effects into separate statements so the order is defined.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "argc counts the program name too; argv[0] is the program name and argv[argc] is NULL.",
                "Command-line arguments are strings; convert with atoi/atof/strtol.",
                "Undefined behaviour: out-of-bounds access, signed overflow, uninitialised reads, NULL dereference, use-after-free, modifying a variable twice between sequence points, division by zero, bad shifts, modifying string literals.",
                "Unsigned overflow wraps around and is well defined; signed overflow is undefined.",
                "Compile with -Wall -Wextra -g; use gdb commands break, run, next, step, print, backtrace.",
                "Use <stdint.h> fixed-width types and standard functions for portability.",
              ],
            },
            {
              type: "recap",
              items: [
                "main(int argc, char *argv[]) receives the command line as strings.",
                "Undefined behaviour has no guaranteed result: prevent it, don't predict it.",
                "Debug with warnings first, then tracing, then a debugger.",
                "Portable code avoids assumptions about sizes, signedness, layout and platform-specific headers.",
              ],
            },
            {
              type: "exercise",
              id: "c23-ex-argv-max",
              kind: "write",
              title: "Largest argument",
              prompt: "Write `int run(int argc, char *argv[])` that prints the largest of the integer arguments as `max = N`, or `usage: max N...` if there are none. Test it from `main` with a simulated argv `{\"max\", \"12\", \"-4\", \"30\", \"7\", NULL}`.",
              hint: "Initialise the maximum with atoi(argv[1]), then loop from index 2.",
              solution: "Check argc first; start best at the first argument, not at 0, so negative inputs also work.",
              solutionCode: `#include <stdio.h>
#include <stdlib.h>

int run(int argc, char *argv[]) {
    int i, best;
    if (argc < 2) {
        printf("usage: max N...\\n");
        return 1;
    }
    best = atoi(argv[1]);
    for (i = 2; i < argc; i++) {
        int v = atoi(argv[i]);
        if (v > best) best = v;
    }
    printf("max = %d\\n", best);
    return 0;
}

int main(void) {
    char *fakeArgv[] = {"max", "12", "-4", "30", "7", NULL};
    return run(5, fakeArgv);
}`,
              expectedOutput: "max = 30",
            },
            {
              type: "exercise",
              id: "c23-ex-spot-ub",
              kind: "concept",
              title: "Spot the undefined behaviour",
              prompt: "Which of these fragments have undefined behaviour? Explain each.\n\n1. `int a[3] = {1, 2, 3}; int s = 0; for (int i = 0; i <= 3; i++) s += a[i];`\n2. `unsigned char c = 255; c++;`\n3. `int x = 7; int y = x++ * x++;`\n4. `char msg[] = \"cat\"; msg[0] = 'b';`\n5. `int d = 0; if (d != 0) printf(\"%d\", 10 / d);`",
              hint: "Check array bounds, signedness, sequencing, literal vs array, and whether the dangerous operation can actually execute.",
              solution: "1. UB: the loop reads a[3], past the end (should be i < 3). 2. Fine: unsigned arithmetic wraps (c is promoted, and the result 256 converts back to 0 in unsigned char). 3. UB: x is modified twice without sequencing. 4. Fine: msg is a modifiable array copy of the literal. 5. Fine: the division is guarded and never executes with d == 0.",
            },
            {
              type: "exercise",
              id: "c23-ex-debug-average",
              kind: "debug",
              title: "Debug the average",
              prompt: "This program should print `average = 2.50` for the values 1 to 4, but prints `average = 2.00`. Add a trace if it helps, find the bug, and fix it.",
              starterCode: `#include <stdio.h>

int main(void) {
    int values[4] = {1, 2, 3, 4};
    int i, sum = 0;
    double avg;
    for (i = 0; i < 4; i++) {
        sum += values[i];
    }
    avg = sum / 4;
    printf("average = %.2f\\n", avg);
    return 0;
}`,
              hint: "Print sum and sum / 4 separately. What type is sum / 4?",
              solution: "`sum / 4` is integer division (10 / 4 = 2), and only then converted to double. Divide in floating point: `avg = sum / 4.0;` or `(double)sum / 4`.",
              solutionCode: `#include <stdio.h>

int main(void) {
    int values[4] = {1, 2, 3, 4};
    int i, sum = 0;
    double avg;
    for (i = 0; i < 4; i++) {
        sum += values[i];
    }
    avg = (double)sum / 4;
    printf("average = %.2f\\n", avg);
    return 0;
}`,
              expectedOutput: "average = 2.50",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c23-argv-mcq-1",
              prompt: "A program is run as `./convert in.txt out.txt`. What is `argc`, and what is `argv[1]`?",
              options: [
                { id: "a", text: "argc = 2, argv[1] = \"out.txt\"" },
                { id: "b", text: "argc = 3, argv[1] = \"in.txt\"" },
                { id: "c", text: "argc = 3, argv[1] = \"./convert\"" },
                { id: "d", text: "argc = 2, argv[1] = \"in.txt\"" },
              ],
              correct: "b",
              explanation: "The program name counts, so there are 3 words; argv[0] is the program name and argv[1] the first argument.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c23-ub-tf-1",
              prompt: "Adding 1 to an int variable holding INT_MAX is guaranteed to give INT_MIN.",
              correct: false,
              explanation: "Signed integer overflow is undefined behaviour. Only unsigned arithmetic is guaranteed to wrap around.",
            },
            {
              type: "FILL_BLANK",
              slug: "c23-wall-fill-1",
              prompt: "The gcc option ___ enables a broad set of useful warnings, and the option ___ adds debugging information for gdb.",
              accepted: [["-Wall", "Wall"], ["-g", "g"]],
              caseSensitive: true,
              explanation: "Typical command: gcc -Wall -Wextra -g prog.c -o prog.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c23-argv-output-1",
              prompt: "What does this program print?",
              code: `#include <stdio.h>
#include <string.h>

int count(int argc, char *argv[]) {
    int i, n = 0;
    for (i = 1; i < argc; i++) {
        if (strcmp(argv[i], "-v") == 0) n++;
    }
    return n;
}

int main(void) {
    char *args[] = {"tool", "-v", "file", "-v", "-q", NULL};
    printf("%d %d\\n", count(5, args), (int)strlen(args[2]));
    return 0;
}`,
              expected: "2 4",
              explanation: "Two of the arguments after argv[0] equal \"-v\"; args[2] is \"file\", which has 4 characters.",
            },
          ],
        },
      ],
    },
  ],
};

export default chapter;
