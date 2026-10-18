import type { ChapterContent } from "../../../src/lib/content/schema";

const chapter: ChapterContent = {
  slug: "pointers",
  title: "Pointers",
  summary:
    "Pointers are variables that hold memory addresses. Learn how memory is organised, how to take an address with & and follow it with *, why NULL and pointer types matter, and how pointer arithmetic and comparison work.",
  topics: [
    {
      slug: "pointer-fundamentals",
      title: "Addresses and pointer variables",
      lessons: [
        {
          slug: "pointer-basics",
          title: "Memory, addresses, & and *",
          summary:
            "How variables live at addresses in memory, how to get an address with &, how to store it in a pointer, and how to read and change a variable through a pointer with *.",
          estMinutes: 35,
          blocks: [
            {
              type: "objectives",
              items: [
                "Describe memory as a sequence of numbered bytes and explain what an address is",
                "Use the address-of operator & to obtain a variable's address",
                "Declare a pointer variable of the correct type",
                "Use the dereference operator * to read and modify the variable a pointer points to",
              ],
            },
            {
              type: "markdown",
              md: `Your computer's memory (RAM) is a very long row of tiny storage cells called **bytes**. Each byte has a unique number, its **address**, just as each house on a long street has a house number. When you declare \`int age = 19;\`, the compiler reserves a few consecutive bytes (typically 4) somewhere in memory, stores 19 there, and remembers that the name \`age\` refers to that location.

Until now you have always used variables by **name**. A **pointer** lets you work with a variable by its **address** instead. A pointer is simply a variable whose value is an address.

Analogy: a variable is a house containing something valuable. Its address is written on a piece of paper. A **pointer** is that piece of paper. Copying the paper is cheap, you can hand it to a friend (a function), and anyone holding it can go to the house and look at — or change — what is inside.`,
            },
            {
              type: "definition",
              term: "Address",
              md: "The number identifying a location in memory. The address of a variable is the address of its first byte.",
            },
            {
              type: "definition",
              term: "Pointer",
              md: "A variable that stores the address of another object (variable, array element, etc.). Its type says what kind of object it points to, e.g. `int *` points to an `int`.",
            },
            {
              type: "definition",
              term: "Address-of operator (&)",
              md: "The unary operator `&x` gives the address of the variable `x`. You have already used it with `scanf(\"%d\", &x)`.",
            },
            {
              type: "definition",
              term: "Dereference operator (*)",
              md: "The unary operator `*p` means \"the object that `p` points to\". It can be read (`y = *p;`) or assigned to (`*p = 5;`). Also called the *indirection* operator.",
            },
            {
              type: "syntax",
              language: "c",
              code: `type *name;          /* declare a pointer to type */
name = &variable;    /* make it point to variable */
*name                /* the variable it points to */

int x = 10;
int *p = &x;         /* p holds the address of x */
*p = 20;             /* changes x to 20 */`,
              md: "The `*` in a **declaration** means \"is a pointer\". The `*` in an **expression** means \"follow the pointer\". Same symbol, two roles.",
            },
            {
              type: "table",
              caption: "A memory picture (addresses are made up for illustration — real ones differ on every run)",
              headers: ["Name", "Address", "Contents"],
              rows: [
                ["x", "1000", "10"],
                ["p", "2000", "1000 (the address of x)"],
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Reading and writing through a pointer",
              code: `#include <stdio.h>

int main(void)
{
    int x = 10;
    int *p;

    p = &x;
    printf("x = %d\\n", x);
    printf("*p = %d\\n", *p);

    *p = 25;
    printf("after *p = 25, x = %d\\n", x);

    x = x + 5;
    printf("after x = x + 5, *p = %d\\n", *p);

    printf("p points to x? %d\\n", p == &x);
    return 0;
}`,
              runnable: true,
              output: `x = 10
*p = 10
after *p = 25, x = 25
after x = x + 5, *p = 30
p points to x? 1`,
              walkthrough: [
                { lines: "5", text: "An ordinary int variable." },
                { lines: "6", text: "`p` is declared as a pointer to int. It does not point anywhere useful yet." },
                { lines: "8", text: "Store the address of `x` in `p`. Now `p` \"points to\" `x`." },
                { lines: "10", text: "`*p` follows the pointer and reads the int stored there, which is the value of `x`." },
                { lines: "12", text: "Assigning to `*p` writes into the memory of `x`. We changed `x` without using its name." },
                { lines: "15-16", text: "It works the other way too: `x` and `*p` are two names for the same storage." },
                { lines: "18", text: "Comparing two addresses: `p == &x` is true (1). We print the comparison result, never the raw address." },
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Seeing real addresses (output differs on every machine)",
              code: `#include <stdio.h>

int main(void)
{
    int a = 1, b = 2;
    int *p = &a;

    printf("address of a: %p\\n", (void *)&a);
    printf("address of b: %p\\n", (void *)&b);
    printf("value of p:   %p\\n", (void *)p);
    printf("address of p: %p\\n", (void *)&p);
    return 0;
}`,
              runnable: true,
              walkthrough: [
                { lines: "8", text: "`%p` prints an address, usually in hexadecimal. The argument should be converted to `void *`." },
                { lines: "10", text: "The value stored in `p` is identical to the address of `a` — that is what \"p points to a\" means." },
                { lines: "11", text: "`p` is itself a variable, so it has its own address, different from the address it stores." },
              ],
            },
            {
              type: "callout",
              variant: "note",
              title: "Why no expected output?",
              md: "Addresses depend on the operating system, the compiler and even the particular run (many systems randomise memory layout for security). Run the program above and you will see hexadecimal numbers such as `000000000061FE14`, but your numbers will differ. The only thing you can rely on is the *relationship*: the second and third lines print the same address.",
            },
            {
              type: "heading",
              text: "Pointer declarations: watch the star",
              level: 2,
            },
            {
              type: "markdown",
              md: `The \`*\` belongs to each **variable name**, not to the type:

\`\`\`c
int *p, q;     /* p is a pointer to int, q is a plain int! */
int *p, *q;    /* both are pointers */
\`\`\`

Whether you write \`int *p\`, \`int* p\` or \`int * p\` makes no difference to the compiler, but \`int *p\` reminds you that the star attaches to \`p\`.`,
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `Every variable occupies real memory with a real address. \`&x\` simply asks the compiler for that address, and a pointer stores it like any other value. When you write \`*p\`, the program goes to the address in \`p\` and, because \`p\` has type \`int *\`, treats the bytes there as an \`int\`. Since \`x\` and \`*p\` refer to the very same bytes, a change through one is visible through the other.`,
            },
            {
              type: "heading",
              text: "Where pointers are used",
              level: 2,
            },
            {
              type: "markdown",
              md: `- **Letting functions change variables:** \`scanf\` needs \`&x\` because it must write into \`x\`. You will write such functions in the next chapter.
- **Arrays and strings:** array names behave like pointers to their first element; all string functions work with pointers.
- **Dynamic memory:** \`malloc\` returns a pointer to memory allocated at run time (chapter 20).
- **Data structures:** linked lists and trees connect nodes with pointers.
- **Hardware:** embedded programs control devices by writing to specific memory addresses through pointers.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Assigning a value instead of an address",
                  wrong: `int x = 5;
int *p = x;     /* stores 5 as if it were an address */`,
                  right: `int x = 5;
int *p = &x;`,
                  md: "A pointer must hold an address. Use `&` to get the address of the variable. Most compilers warn about this mistake — do not ignore the warning.",
                },
                {
                  title: "Forgetting the * when you mean the pointed-to value",
                  wrong: `int x = 5, *p = &x;
p = 10;         /* changes the pointer, not x */`,
                  right: `int x = 5, *p = &x;
*p = 10;        /* changes x */`,
                  md: "`p = ...` changes where the pointer points. `*p = ...` changes the value at that location.",
                },
                {
                  title: "Declaring two pointers on one line incorrectly",
                  wrong: `int* a, b;      /* b is an int, not a pointer */
b = &x;         /* warning / error */`,
                  right: `int *a, *b;`,
                  md: "Each pointer variable needs its own `*` in the declaration.",
                },
                {
                  title: "Printing an address with %d",
                  wrong: `printf("%d\\n", p);`,
                  right: `printf("%p\\n", (void *)p);`,
                  md: "Addresses may be wider than an int (on 64-bit systems they usually are). Use `%p` with a `void *` argument.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "A pointer is a variable that stores an address.",
                "&x gives the address of x; *p gives the object p points to.",
                "In `int *p, q;` only p is a pointer.",
                "After `p = &x;`, `*p` and `x` refer to the same memory: changing one changes the other.",
                "Addresses are printed with %p and a (void *) cast; their values are system-dependent.",
              ],
            },
            {
              type: "recap",
              items: [
                "Memory is a row of numbered bytes; a variable's address is where it starts.",
                "Declare: `int *p;` Point: `p = &x;` Use: `*p`.",
                "The declaration star means \"pointer\"; the expression star means \"follow\".",
                "Never rely on specific address values.",
              ],
            },
            {
              type: "exercise",
              id: "c16-ex-double-through-pointer",
              kind: "write",
              title: "Change a variable through a pointer",
              prompt: "Declare `double price = 12.5;` and a pointer `pp` to it. Using **only** `pp` (not the name `price`), double the price and then add 1. Finally print `price` with two decimals; it should show `26.00`.",
              hint: "`*pp = *pp * 2;` then `*pp = *pp + 1;`",
              solutionCode: `#include <stdio.h>

int main(void)
{
    double price = 12.5;
    double *pp = &price;
    *pp = *pp * 2;
    *pp = *pp + 1;
    printf("%.2f\\n", price);
    return 0;
}`,
              expectedOutput: "26.00",
            },
            {
              type: "exercise",
              id: "c16-ex-predict-two-pointers",
              kind: "predict",
              title: "Two pointers, one variable",
              prompt: "Predict the output.",
              starterCode: `#include <stdio.h>

int main(void)
{
    int n = 4;
    int *a = &n;
    int *b = a;
    *a = *a * 3;
    *b = *b - 2;
    printf("%d %d %d\\n", n, *a, *b);
    return 0;
}`,
              hint: "`b = a` copies the address, so both point to n.",
              solution: "n becomes 4 × 3 = 12, then 12 − 2 = 10. All three expressions name the same int.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int n = 4;
    int *a = &n;
    int *b = a;
    *a = *a * 3;
    *b = *b - 2;
    printf("%d %d %d\\n", n, *a, *b);
    return 0;
}`,
              expectedOutput: "10 10 10",
            },
            {
              type: "exercise",
              id: "c16-ex-concept-star",
              kind: "concept",
              title: "Two meanings of *",
              prompt: "In the line `int *p = &x;` and then `*p = 7;`, explain what the `*` means in each line.",
              hint: "One is a declaration, one is an expression.",
              solution: "In `int *p = &x;` the `*` is part of the declaration and says that p is a pointer to int (it is initialised with x's address). In `*p = 7;` the `*` is the dereference operator: it means \"the int that p points to\", so 7 is stored into x.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c16-deref-mcq",
              prompt: "After `int x = 3; int *p = &x;`, which statement sets `x` to 8?",
              options: [
                { id: "a", text: "p = 8;" },
                { id: "b", text: "&p = 8;" },
                { id: "c", text: "*p = 8;" },
                { id: "d", text: "&x = 8;" },
              ],
              correct: "c",
              explanation: "*p refers to the int p points to, which is x.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c16-decl-tf",
              prompt: "In the declaration `int *p, q;`, both p and q are pointers to int.",
              correct: false,
              explanation: "Only p is a pointer; q is a plain int.",
            },
            {
              type: "FILL_BLANK",
              slug: "c16-address-of-fill",
              prompt: "To store the address of variable `total` in the pointer `pt`, write: `pt = ___total;`",
              accepted: [["&"]],
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c16-predict-basic",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

int main(void)
{
    int a = 5, b = 9;
    int *p = &a;
    *p = *p + b;
    p = &b;
    *p = 0;
    printf("%d %d\\n", a, b);
    return 0;
}`,
              expected: "14 0",
              explanation: "First p points to a, so a becomes 5 + 9 = 14. Then p is redirected to b, and b is set to 0.",
            },
          ],
        },
        {
          slug: "null-and-pointer-types",
          title: "NULL, pointer types and void pointers",
          summary:
            "Why every pointer must point somewhere valid, how NULL marks \"points nowhere\", why a pointer's type matters, and a first look at generic void pointers.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Explain the danger of uninitialised (wild) pointers",
                "Use NULL to mark a pointer that points nowhere and check it before dereferencing",
                "Explain why a pointer's base type matters",
                "Describe what a void pointer is and why it must be converted before dereferencing",
              ],
            },
            {
              type: "markdown",
              md: `A pointer is only useful if the address it holds is **valid** — the address of a real object your program owns. A local pointer variable that you have not initialised contains whatever bits happened to be in its memory: a random address. Following it is like driving to an address scribbled by a stranger: you might reach an empty field, a locked building, or someone else's house.

C gives you a special value to say "this pointer deliberately points nowhere": the **null pointer**, written \`NULL\`. A null pointer is like an empty envelope — clearly marked as having no address inside. You can check for it before using the pointer.`,
            },
            {
              type: "definition",
              term: "Wild (uninitialised) pointer",
              md: "A pointer that has never been given a valid address. Dereferencing it is undefined behaviour.",
            },
            {
              type: "definition",
              term: "Null pointer (NULL)",
              md: "A pointer value guaranteed not to point to any object. `NULL` is a macro defined in `<stdio.h>`, `<stdlib.h>`, `<stddef.h>` and others. Dereferencing a null pointer is undefined behaviour (it usually crashes the program).",
            },
            {
              type: "definition",
              term: "Base type",
              md: "The type a pointer points to. For `double *dp`, the base type is `double`. It determines how many bytes are read or written by `*dp` and how pointer arithmetic moves.",
            },
            {
              type: "syntax",
              language: "c",
              code: `int *p = NULL;           /* points nowhere, on purpose */

if (p != NULL) {         /* or simply: if (p) */
    printf("%d\\n", *p);  /* safe: only when p is valid */
}`,
            },
            {
              type: "code",
              language: "c",
              title: "Checking for NULL before use",
              code: `#include <stdio.h>

void showValue(const int *p)
{
    if (p == NULL) {
        printf("No value available\\n");
        return;
    }
    printf("Value: %d\\n", *p);
}

int main(void)
{
    int score = 87;
    int *best = NULL;

    showValue(best);

    best = &score;
    showValue(best);

    if (best)
        printf("best is not NULL\\n");
    return 0;
}`,
              runnable: true,
              output: `No value available
Value: 87
best is not NULL`,
              walkthrough: [
                { lines: "3", text: "The function receives a pointer. `const int *` means it promises only to read the int, not change it." },
                { lines: "5-8", text: "Guard clause: if the pointer is NULL, report that and return **before** any dereference." },
                { lines: "9", text: "Only reached when `p` holds a real address." },
                { lines: "15", text: "Initialise pointers to NULL when you do not yet have something for them to point to. Never leave them uninitialised." },
                { lines: "17", text: "Passing NULL is handled safely by the check." },
                { lines: "19-20", text: "Now `best` points to `score`, so the value is printed." },
                { lines: "22", text: "A null pointer counts as false in a condition and any valid pointer as true, so `if (best)` means `if (best != NULL)`." },
              ],
            },
            {
              type: "callout",
              variant: "warning",
              title: "Uninitialised pointers are worse than NULL",
              md: "`int *p; *p = 5;` writes 5 to a random address — undefined behaviour that may silently corrupt other data. `int *p = NULL; *p = 5;` is also undefined, but on most systems it crashes immediately and predictably, which makes the bug much easier to find. A NULL check prevents both.",
            },
            {
              type: "heading",
              text: "Why the pointer type matters",
              level: 2,
            },
            {
              type: "markdown",
              md: `An address alone only says where something *starts*. The base type tells the compiler **how to interpret** the bytes there: how many to read and whether they form an integer, a floating-point number or a character. That is why C has \`int *\`, \`double *\`, \`char *\` and so on, and why assigning a \`double *\` to an \`int *\` produces a warning.

On a given system, all ordinary data pointers usually have the same size (typically 8 bytes on 64-bit systems, 4 on 32-bit systems) regardless of the base type — what differs is how the pointed-to memory is used.`,
            },
            {
              type: "code",
              language: "c",
              title: "Pointers of different types",
              code: `#include <stdio.h>

int main(void)
{
    int i = 42;
    double d = 3.75;
    char c = 'Q';

    int *ip = &i;
    double *dp = &d;
    char *cp = &c;

    printf("%d %.2f %c\\n", *ip, *dp, *cp);

    *ip += 8;
    *dp *= 2;
    *cp = 'R';
    printf("%d %.2f %c\\n", i, d, c);

    printf("*cp occupies %d byte\\n", (int)sizeof *cp);
    return 0;
}`,
              runnable: true,
              output: `42 3.75 Q
50 7.50 R
*cp occupies 1 byte`,
              walkthrough: [
                { lines: "9-11", text: "Each pointer's base type matches the variable it points to." },
                { lines: "13", text: "Dereferencing reads the right number of bytes and interprets them correctly for each type." },
                { lines: "15-17", text: "Compound assignment works through pointers just like on plain variables." },
                { lines: "20", text: "`sizeof *cp` is the size of the **pointed-to** object, a `char`, which is always exactly 1 byte. `sizeof *ip` and `sizeof *dp` would typically give 4 and 8, but those sizes are system-dependent, so we do not print them here." },
              ],
            },
            {
              type: "heading",
              text: "void pointers (a brief look)",
              level: 2,
            },
            {
              type: "markdown",
              md: `A \`void *\` is a **generic pointer**: it can hold the address of any object type, but it does not know what type is stored there. Because of that, you **cannot dereference** a \`void *\` directly — you must first convert it to a specific pointer type.

\`\`\`c
int n = 7;
void *vp = &n;            /* any object address can be stored */
int *ip = (int *)vp;      /* convert back to the real type */
printf("%d\\n", *ip);      /* 7 */
\`\`\`

You will meet \`void *\` again with \`malloc\` (which returns a \`void *\`), with \`qsort\`, and in the \`%p\` format.`,
            },
            {
              type: "definition",
              term: "Generic pointer (void *)",
              md: "A pointer type that can hold any object address but cannot be dereferenced or used in arithmetic until it is converted to a specific pointer type.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `NULL works because the language reserves one pointer value that compares unequal to the address of every object, so a simple \`p != NULL\` test reliably separates \"points somewhere\" from \"points nowhere\". Pointer types work because the compiler records the base type with each pointer and uses it every time you dereference, so the same address can be read as an \`int\`, a \`double\` or a \`char\` depending on the pointer used.`,
            },
            {
              type: "heading",
              text: "Real-world use",
              level: 2,
            },
            {
              type: "markdown",
              md: `- Library functions return NULL to signal failure: \`fopen\` returns NULL if a file cannot be opened, \`malloc\` if memory runs out, \`strchr\` if a character is not found. Checking for NULL is everyday C.
- Linked lists use a NULL \`next\` pointer to mark the last node.
- Generic containers and sorting routines use \`void *\` so one function can handle any data type.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Using a pointer before giving it an address",
                  wrong: `int *p;
*p = 10;          /* p holds garbage: UB */`,
                  right: `int x;
int *p = &x;
*p = 10;`,
                  md: "Always initialise a pointer with a valid address or NULL at the point of declaration.",
                },
                {
                  title: "Dereferencing without checking a possibly-NULL pointer",
                  wrong: `FILE *f = fopen("data.txt", "r");
fscanf(f, "%d", &n);     /* crashes if the file is missing */`,
                  right: `FILE *f = fopen("data.txt", "r");
if (f == NULL) {
    printf("Cannot open file\\n");
    return 1;
}
fscanf(f, "%d", &n);`,
                  md: "When a function may return NULL, test the result before using it.",
                },
                {
                  title: "Mixing pointer types",
                  wrong: `double d = 2.5;
int *p = &d;       /* warning: incompatible pointer type */
printf("%d\\n", *p);`,
                  right: `double d = 2.5;
double *p = &d;
printf("%.1f\\n", *p);`,
                  md: "The base type must match the object. Reading a double's bytes as an int gives meaningless results (and is undefined behaviour).",
                },
                {
                  title: "Dereferencing a void pointer",
                  wrong: `void *vp = &n;
printf("%d\\n", *vp);     /* error: void has no value */`,
                  right: `void *vp = &n;
printf("%d\\n", *(int *)vp);`,
                  md: "Convert a `void *` to the correct pointer type before dereferencing it.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "Uninitialised pointers hold garbage; dereferencing them is undefined behaviour.",
                "NULL means \"points to no object\"; dereferencing NULL is also undefined behaviour.",
                "Always check pointers that might be NULL before dereferencing them.",
                "The base type determines how many bytes *p accesses and how they are interpreted.",
                "A void * can hold any object address but must be cast before dereferencing.",
              ],
            },
            {
              type: "recap",
              items: [
                "Initialise every pointer: with an address or with NULL.",
                "if (p) is the same as if (p != NULL).",
                "Match the pointer's base type to the object's type.",
                "void * is a generic address holder; convert it before use.",
              ],
            },
            {
              type: "exercise",
              id: "c16-ex-safe-max",
              kind: "write",
              title: "Pick a pointer safely",
              prompt: "Write a function `void printOrDefault(const int *p, int def)` that prints `*p` if p is not NULL, otherwise prints `def`. In `main`, call it once with NULL and default 0, and once with the address of a variable holding 33. Expected output: `0` then `33` on separate lines.",
              hint: "A single if/else on `p != NULL`.",
              solutionCode: `#include <stdio.h>

void printOrDefault(const int *p, int def)
{
    if (p != NULL)
        printf("%d\\n", *p);
    else
        printf("%d\\n", def);
}

int main(void)
{
    int v = 33;
    printOrDefault(NULL, 0);
    printOrDefault(&v, 0);
    return 0;
}`,
              expectedOutput: `0
33`,
            },
            {
              type: "exercise",
              id: "c16-ex-debug-wild",
              kind: "debug",
              title: "The crashing counter",
              prompt: "This program sometimes crashes and sometimes prints nonsense. Explain the bug and fix it.",
              starterCode: `#include <stdio.h>

int main(void)
{
    int *count;
    *count = 0;
    *count = *count + 1;
    printf("%d\\n", *count);
    return 0;
}`,
              hint: "Where does `count` point?",
              solution: "`count` is an uninitialised (wild) pointer, so `*count = 0` writes to an unknown address — undefined behaviour. Create an int for it to point to: `int c; int *count = &c;` (or simply use an int variable directly).",
            },
            {
              type: "exercise",
              id: "c16-ex-concept-void",
              kind: "concept",
              title: "Why can't you dereference void *?",
              prompt: "Explain in your own words why `*vp` is not allowed when `vp` is a `void *`.",
              hint: "What information does the compiler need to read memory?",
              solution: "To read through a pointer, the compiler must know how many bytes to read and how to interpret them, which comes from the base type. `void` has no size or value representation, so the compiler cannot generate the read. Converting to e.g. `int *` supplies that information.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c16-null-mcq",
              prompt: "Which is the safest way to declare a pointer that you will assign later?",
              options: [
                { id: "a", text: "int *p;" },
                { id: "b", text: "int *p = NULL;" },
                { id: "c", text: "int *p = 0x1000;" },
                { id: "d", text: "int p = NULL;" },
              ],
              correct: "b",
              explanation: "Initialising to NULL makes the \"not yet pointing anywhere\" state explicit and testable.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c16-void-deref-tf",
              prompt: "A `void *` pointer can be dereferenced directly with `*` as long as it holds a valid address.",
              correct: false,
              explanation: "It must first be converted to a pointer to a complete type such as `int *`.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c16-predict-null-check",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

int main(void)
{
    int a = 6;
    int *p = NULL;
    int *q = &a;
    printf("%d ", p == NULL);
    printf("%d ", q != NULL);
    if (q)
        *q = *q * *q;
    printf("%d\\n", a);
    return 0;
}`,
              expected: "1 1 36",
              explanation: "p is NULL (1), q is not NULL (1), and a is squared through q: 6 × 6 = 36.",
            },
            {
              type: "FILL_BLANK",
              slug: "c16-void-fill",
              prompt: "A generic pointer that can hold the address of any object type is declared with the type `___ *`.",
              accepted: [["void"]],
              caseSensitive: true,
            },
          ],
        },
      ],
    },
    {
      slug: "pointer-arithmetic",
      title: "Pointer arithmetic and comparison",
      lessons: [
        {
          slug: "pointer-arithmetic-comparison",
          title: "Moving pointers through memory",
          summary:
            "Add and subtract integers to pointers, subtract two pointers, compare pointers, and use these operations to walk through an array.",
          estMinutes: 35,
          blocks: [
            {
              type: "objectives",
              items: [
                "Explain that p + 1 moves by one element, not one byte",
                "Use increment and decrement on pointers to traverse an array",
                "Subtract two pointers into the same array to count elements between them",
                "Compare pointers and know when pointer arithmetic is valid",
              ],
            },
            {
              type: "markdown",
              md: `Because the elements of an array sit next to each other in memory, a pointer to one element can be moved to the next element by **adding 1**. This is **pointer arithmetic**.

The clever part: adding 1 to a pointer does not add 1 *byte*. It moves forward by **one whole element** of the pointer's base type. If \`p\` is an \`int *\` and ints are 4 bytes, \`p + 1\` is 4 bytes further on; if \`p\` is a \`double *\`, \`p + 1\` is 8 bytes further on. You think in elements, and the compiler does the byte calculation.

Analogy: on a street where every house is the same width, "go three houses along" is easier than "walk 45 metres". Pointer arithmetic is counting houses.`,
            },
            {
              type: "definition",
              term: "Pointer arithmetic",
              md: "Adding an integer to, or subtracting an integer from, a pointer to move it by that many elements; and subtracting two pointers to find how many elements apart they are.",
            },
            {
              type: "definition",
              term: "Scaling",
              md: "The automatic multiplication by the size of the base type. `p + n` refers to the address `p + n × sizeof(*p)` bytes.",
            },
            {
              type: "table",
              caption: "Valid pointer operations",
              headers: ["Operation", "Example", "Meaning"],
              rows: [
                ["pointer + int", "p + 2", "Pointer two elements further on"],
                ["pointer − int", "p - 1", "Pointer one element back"],
                ["++ / --", "p++, --p", "Move to next / previous element"],
                ["pointer − pointer", "q - p", "Number of elements between them (same array only)"],
                ["comparison", "p < q, p == q", "Which comes first / same location"],
                ["NOT allowed", "p + q, p * 2, p / 2", "Meaningless — compile error"],
              ],
            },
            {
              type: "syntax",
              language: "c",
              code: `int a[5];
int *p = &a[0];   /* points to the first element */

*(p + i)          /* the element i places after p, same as a[i] */
p++;              /* now points to a[1] */`,
            },
            {
              type: "code",
              language: "c",
              title: "Walking an array with a pointer",
              code: `#include <stdio.h>

int main(void)
{
    int a[5] = {10, 20, 30, 40, 50};
    int *p = &a[0];
    int *end = &a[4];
    int i;

    printf("*p = %d, *(p + 2) = %d\\n", *p, *(p + 2));

    for (i = 0; i < 5; i++)
        printf("%d ", *(p + i));
    printf("\\n");

    while (p <= end) {
        printf("%d ", *p);
        p++;
    }
    printf("\\n");

    p = end;
    while (p >= &a[0] + 1) {
        printf("%d ", *p);
        p--;
    }
    printf("%d\\n", *p);
    return 0;
}`,
              runnable: true,
              output: `*p = 10, *(p + 2) = 30
10 20 30 40 50
10 20 30 40 50
50 40 30 20 10`,
              walkthrough: [
                { lines: "6-7", text: "`p` points to the first element and `end` to the last." },
                { lines: "10", text: "`*(p + 2)` means: move two ints forward, then read. The parentheses matter — `*p + 2` would be 10 + 2." },
                { lines: "12-13", text: "Offset style: p stays put and we read the element i places away." },
                { lines: "16-19", text: "Moving style: print the current element, then advance p by one element. Comparing `p <= end` keeps us inside the array." },
                { lines: "22-27", text: "Walk backwards with `p--`. We stop while p still points to a[1] and print a[0] separately afterwards, so the pointer never moves before the start of the array." },
              ],
            },
            {
              type: "heading",
              text: "Subtracting and comparing pointers",
              level: 2,
            },
            {
              type: "markdown",
              md: `If \`p\` and \`q\` point into the **same array**, then \`q - p\` is the number of **elements** from \`p\` to \`q\` (not bytes). Its type is \`ptrdiff_t\`, a signed integer type; to print it portably with TCC/Windows we cast it to \`int\`.

Pointers into the same array can also be compared with \`<\`, \`>\`, \`<=\`, \`>=\`: the one with the higher index is "greater". Any two pointers of the same type can be compared with \`==\` and \`!=\`.`,
            },
            {
              type: "code",
              language: "c",
              title: "Finding a value and its position with pointers",
              code: `#include <stdio.h>

int main(void)
{
    double temps[6] = {18.5, 21.0, 25.5, 19.0, 27.5, 22.0};
    double *start = temps;
    double *p;
    double *hottest = start;

    for (p = start; p < start + 6; p++)
        if (*p > *hottest)
            hottest = p;

    printf("Hottest: %.1f\\n", *hottest);
    printf("Day index: %d\\n", (int)(hottest - start));
    printf("Days after it: %d\\n", (int)((start + 5) - hottest));
    printf("Is it after day 2? %d\\n", hottest > &temps[2]);
    return 0;
}`,
              runnable: true,
              output: `Hottest: 27.5
Day index: 4
Days after it: 1
Is it after day 2? 1`,
              walkthrough: [
                { lines: "6", text: "Writing just the array name `temps` gives a pointer to its first element — the same as `&temps[0]`. (The next chapter explores this in depth.)" },
                { lines: "10", text: "`start + 6` is a pointer **one past** the last element. It may be computed and compared, but never dereferenced. Looping while `p < start + 6` visits all six elements." },
                { lines: "11-12", text: "Remember the **location** of the best element, not just its value." },
                { lines: "15", text: "Pointer subtraction gives the element distance: index 4. Each double is 8 bytes, but the result counts elements, not bytes." },
                { lines: "17", text: "Pointer comparison: index 4 is after index 2, so the result is 1 (true)." },
              ],
            },
            {
              type: "callout",
              variant: "warning",
              title: "Stay inside the array (plus one)",
              md: "Pointer arithmetic is only defined within an array and up to the position **one past its last element**. Moving further, moving before the first element, or subtracting/ordering pointers into *different* arrays is undefined behaviour. Dereferencing the one-past-the-end pointer is also undefined.",
            },
            {
              type: "callout",
              variant: "exam",
              title: "Precedence of * and ++",
              md: "`*p++` means `*(p++)`: use the current element, then move the pointer. `(*p)++` increments the **value** pointed to and leaves the pointer alone. `*(p + 1)` reads the next element; `*p + 1` adds 1 to the current element's value.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `Array elements are contiguous and all the same size, so the element after \`p\` is always exactly \`sizeof(*p)\` bytes later. The compiler knows the base type of every pointer and multiplies by its size automatically, so \`p + i\` lands precisely on element i. Subtraction reverses the calculation: (byte distance) ÷ (element size) = element count. This is also the reason arithmetic on a \`void *\` is not allowed in standard C — there is no element size to scale by.`,
            },
            {
              type: "heading",
              text: "Real-world applications",
              level: 2,
            },
            {
              type: "markdown",
              md: `- Standard library functions like \`strlen\` and \`memcpy\` are typically written with pointer increments.
- Parsers keep a pointer to "the current character" in a buffer and advance it as they read tokens.
- Image processing walks a pointer across rows of pixels.
- Finding a match with pointers and computing its index by subtraction is exactly how \`strchr\` results are turned into positions.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Forgetting parentheses with *",
                  wrong: `int a[] = {5, 9, 2};
int *p = a;
printf("%d\\n", *p + 1);    /* 6: value of a[0] plus 1 */`,
                  right: `printf("%d\\n", *(p + 1));  /* 9: the next element */`,
                  md: "`*` binds more tightly than `+`. Put the pointer addition inside parentheses before dereferencing.",
                },
                {
                  title: "Running past the end",
                  wrong: `for (p = a; p <= a + 5; p++)   /* a has 5 elements */
    sum += *p;                  /* reads a[5] */`,
                  right: `for (p = a; p < a + 5; p++)
    sum += *p;`,
                  md: "`a + 5` is the one-past-the-end pointer: fine to compare, never to dereference. Use `<`.",
                },
                {
                  title: "Thinking p + 1 adds one byte",
                  wrong: `/* expecting p + 1 to be 1 byte after p for an int * */`,
                  right: `/* p + 1 is sizeof(int) bytes after p — the next int */`,
                  md: "Pointer arithmetic is scaled by the base type. Do not multiply by `sizeof` yourself — that would skip elements.",
                },
                {
                  title: "Subtracting pointers into different arrays",
                  wrong: `int a[3], b[3];
int d = &b[0] - &a[0];   /* undefined */`,
                  right: `int a[3];
int d = &a[2] - &a[0];   /* 2 */`,
                  md: "Pointer subtraction and ordering comparisons are defined only for pointers into the same array.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "p + n moves n elements (n × sizeof base type bytes), not n bytes.",
                "q − p gives the number of elements between two pointers into the same array.",
                "Adding, multiplying or dividing two pointers is not allowed.",
                "A pointer may point one past the end of an array but must not be dereferenced there.",
                "*p++ uses the value then advances p; (*p)++ increments the value.",
              ],
            },
            {
              type: "recap",
              items: [
                "Pointer arithmetic counts in elements of the base type.",
                "*(p + i) is the element i places after p.",
                "Subtract pointers to get distances; compare them to see order.",
                "Keep every pointer within the array or exactly one past its end.",
              ],
            },
            {
              type: "exercise",
              id: "c16-ex-pointer-sum",
              kind: "write",
              title: "Sum with a moving pointer",
              prompt: "Given `int a[] = {3, 8, 1, 9, 4, 6};`, compute the sum of the elements using a pointer that moves from the first element to the last with `p++` (no `[ ]` indexing inside the loop). Print `Sum: 31`.",
              hint: "Loop `for (p = a; p < a + 6; p++) sum += *p;`",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int a[] = {3, 8, 1, 9, 4, 6};
    int *p, sum = 0;
    for (p = a; p < a + 6; p++)
        sum += *p;
    printf("Sum: %d\\n", sum);
    return 0;
}`,
              expectedOutput: "Sum: 31",
            },
            {
              type: "exercise",
              id: "c16-ex-predict-star-plus",
              kind: "predict",
              title: "Stars and pluses",
              prompt: "Predict the output.",
              starterCode: `#include <stdio.h>

int main(void)
{
    int a[4] = {7, 3, 9, 5};
    int *p = a;
    printf("%d ", *p + 2);
    printf("%d ", *(p + 2));
    p += 3;
    printf("%d ", *p);
    printf("%d\\n", (int)(p - a));
    return 0;
}`,
              hint: "Watch the parentheses, then remember p moved.",
              solution: "*p + 2 = 7 + 2 = 9; *(p + 2) = a[2] = 9; after p += 3, *p = a[3] = 5; p − a = 3.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int a[4] = {7, 3, 9, 5};
    int *p = a;
    printf("%d ", *p + 2);
    printf("%d ", *(p + 2));
    p += 3;
    printf("%d ", *p);
    printf("%d\\n", (int)(p - a));
    return 0;
}`,
              expectedOutput: "9 9 5 3",
            },
            {
              type: "exercise",
              id: "c16-ex-concept-scaling",
              kind: "concept",
              title: "How far does it move?",
              prompt: "On a system where `double` is 8 bytes, a `double *dp` holds the address 1000 (pretend). What address does `dp + 3` hold, and what is `(dp + 3) - dp`?",
              hint: "Scaling multiplies by the element size; subtraction divides by it.",
              solution: "dp + 3 holds 1000 + 3 × 8 = 1024. The difference (dp + 3) − dp is 3 (elements), not 24.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c16-arith-mcq",
              prompt: "If `int *p` points to `a[1]` in `int a[5]`, what does `p + 2` point to?",
              options: [
                { id: "a", text: "The byte two bytes after a[1]" },
                { id: "b", text: "a[2]" },
                { id: "c", text: "a[3]" },
                { id: "d", text: "a[1] with its value increased by 2" },
              ],
              correct: "c",
              explanation: "Moving two elements forward from index 1 reaches index 3.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c16-predict-postinc",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

int main(void)
{
    int a[3] = {4, 7, 1};
    int *p = a;
    int x = *p++;
    int y = (*p)++;
    printf("%d %d %d %d\\n", x, y, a[1], *p);
    return 0;
}`,
              expected: "4 7 8 8",
              explanation: "*p++ reads a[0] (4) then moves p to a[1]. (*p)++ reads a[1] (7) then increments a[1] to 8; p still points to a[1].",
            },
            {
              type: "TRUE_FALSE",
              slug: "c16-add-pointers-tf",
              prompt: "If p and q are pointers into the same array, the expression `p + q` gives the midpoint between them.",
              correct: false,
              explanation: "Adding two pointers is not allowed. A midpoint is computed as `p + (q - p) / 2`.",
            },
            {
              type: "FILL_BLANK",
              slug: "c16-diff-fill",
              prompt: "For `int a[10];`, the value of `&a[7] - &a[2]` is ___.",
              accepted: [["5"]],
            },
            {
              type: "CODE_WRITING",
              slug: "c16-code-count-above",
              prompt: "Read an integer `n` (1 ≤ n ≤ 50), then `n` integers into an array, then a threshold `t`. Using a **pointer** to walk through the array (pointer arithmetic, not `a[i]`, inside the counting loop), print how many elements are strictly greater than `t`.\n\nExample: input `5`, `4 9 2 7 5`, `5` → output `2`.",
              starterCode: `#include <stdio.h>

int main(void)
{
    int a[50];
    int n, t, i, count = 0;
    int *p;
    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &a[i]);
    scanf("%d", &t);
    /* count with a pointer */
    printf("%d\\n", count);
    return 0;
}`,
              sampleTests: [
                { stdin: "5\n4 9 2 7 5\n5", expected: "2" },
              ],
              hiddenTests: [
                { stdin: "3\n1 2 3\n10", expected: "0" },
                { stdin: "4\n-1 -2 -3 -4\n-3", expected: "2" },
                { stdin: "1\n100\n99", expected: "1" },
              ],
              solutionCode: `#include <stdio.h>

int main(void)
{
    int a[50];
    int n, t, i, count = 0;
    int *p;
    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &a[i]);
    scanf("%d", &t);
    for (p = a; p < a + n; p++)
        if (*p > t)
            count++;
    printf("%d\\n", count);
    return 0;
}`,
              explanation: "Start p at the first element and stop at the one-past-the-end pointer a + n.",
            },
          ],
        },
      ],
    },
  ],
};

export default chapter;
