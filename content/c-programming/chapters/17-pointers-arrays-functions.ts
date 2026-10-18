import type { ChapterContent } from "../../../src/lib/content/schema";

const chapter: ChapterContent = {
  slug: "pointers-arrays-functions",
  title: "Pointers with Arrays and Functions",
  summary:
    "See how arrays and pointers are tied together, use pointer parameters so functions can change the caller's variables and return several results, protect data with const, and take a first look at pointers to pointers.",
  topics: [
    {
      slug: "pointers-and-arrays",
      title: "Pointers and arrays",
      lessons: [
        {
          slug: "array-pointer-relationship",
          title: "Array decay and a[i] == *(a + i)",
          summary:
            "Why an array name usually turns into a pointer to its first element, how indexing is defined in terms of pointer arithmetic, and where arrays and pointers differ.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Explain array-to-pointer decay and when it does not happen",
                "Show that a[i] is defined as *(a + i) and use p[i] with pointers",
                "Explain why an array name cannot be assigned or incremented",
                "Compare char arrays and char pointers to string literals",
              ],
            },
            {
              type: "markdown",
              md: `In the last chapter you saw that writing just an array's name, like \`temps\`, gives a pointer to its first element. This is one of the most important rules in C, and it explains a lot of behaviour you have already met:

- why \`scanf("%s", name)\` needs no \`&\`,
- why functions can modify arrays passed to them,
- why \`sizeof\` on an array parameter gives the wrong answer.

The rule is called **array decay**: in almost every expression, an array is automatically converted ("decays") into a pointer to its element 0.

Analogy: an array is a whole train of identical carriages. When you hand the train to someone in C, what they actually receive is a ticket saying "the train starts at platform 3, carriage 0". From that ticket and the carriage size, they can walk to any carriage — but the ticket alone does not say how long the train is.`,
            },
            {
              type: "definition",
              term: "Array decay",
              md: "The automatic conversion of an array expression of type \"array of T\" into a pointer of type `T *` pointing to the first element. It happens in most expressions, including function calls.",
            },
            {
              type: "definition",
              term: "Subscript identity",
              md: "The C standard defines `E1[E2]` as `*((E1) + (E2))`. So `a[i]` and `*(a + i)` are exactly the same thing, for arrays and for pointers.",
            },
            {
              type: "syntax",
              language: "c",
              code: `int a[5];
int *p = a;        /* same as p = &a[0]; */

a[i]   ==  *(a + i)
p[i]   ==  *(p + i)
&a[i]  ==  a + i`,
            },
            {
              type: "code",
              language: "c",
              title: "Four ways to reach the same element",
              code: `#include <stdio.h>

int main(void)
{
    int a[4] = {11, 22, 33, 44};
    int *p = a;
    int i;

    for (i = 0; i < 4; i++)
        printf("%d %d %d %d\\n", a[i], *(a + i), p[i], *(p + i));

    printf("p == &a[0]? %d\\n", p == &a[0]);
    printf("a + 2 == &a[2]? %d\\n", a + 2 == &a[2]);

    p = &a[1];
    printf("p[0] = %d, p[1] = %d, p[-1] = %d\\n", p[0], p[1], p[-1]);
    return 0;
}`,
              runnable: true,
              output: `11 11 11 11
22 22 22 22
33 33 33 33
44 44 44 44
p == &a[0]? 1
a + 2 == &a[2]? 1
p[0] = 22, p[1] = 33, p[-1] = 11`,
              walkthrough: [
                { lines: "6", text: "`a` decays to `&a[0]`, so `p` points to the first element." },
                { lines: "9-10", text: "All four expressions are the same element: indexing the array, pointer arithmetic on the array name, indexing the pointer, and pointer arithmetic on the pointer." },
                { lines: "12-13", text: "Address comparisons confirm the identities. We print the comparison results (1 = true), never the addresses themselves." },
                { lines: "15-16", text: "Indexing is always **relative to the pointer**. With p pointing to a[1], `p[0]` is a[1] and `p[-1]` is a[0] — negative indices are fine as long as they stay inside the array." },
              ],
            },
            {
              type: "heading",
              text: "Arrays are not pointers",
              level: 2,
            },
            {
              type: "markdown",
              md: `Decay makes arrays and pointers *look* interchangeable, but they are different things:

| | \`int a[5];\` | \`int *p = a;\` |
|---|---|---|
| What it is | 5 ints of storage | One variable holding an address |
| \`sizeof\` | size of all 5 ints | size of one pointer |
| Can be assigned? | No (\`a = ...\` is an error) | Yes (\`p = ...\`) |
| Can be incremented? | No (\`a++\` is an error) | Yes (\`p++\`) |
| \`&\` gives | pointer to the whole array | address of the pointer variable |

Decay does **not** happen in three places: as the operand of \`sizeof\`, as the operand of unary \`&\`, and when a string literal initialises a char array.`,
            },
            {
              type: "code",
              language: "c",
              title: "Where the difference shows",
              code: `#include <stdio.h>

int countElements(int arr[])
{
    /* arr is really an int *, so sizeof would not help here */
    (void)arr;
    return -1;
}

int main(void)
{
    int a[6] = {1, 2, 3, 4, 5, 6};
    int *p = a;
    char word[] = "hello";
    const char *lit = "hello";

    printf("Elements via sizeof on the array: %d\\n", (int)(sizeof a / sizeof a[0]));
    printf("sizeof a == sizeof p? %d\\n", sizeof a == sizeof p);

    p++;
    printf("After p++: *p = %d\\n", *p);

    word[0] = 'j';
    printf("%s %s\\n", word, lit);
    printf("%c%c\\n", lit[1], *(lit + 4));
    (void)countElements(a);
    return 0;
}`,
              runnable: true,
              output: `Elements via sizeof on the array: 6
sizeof a == sizeof p? 0
After p++: *p = 2
jello hello
eo`,
              walkthrough: [
                { lines: "3-8", text: "A reminder: inside a function, an array parameter is a pointer, so the element count cannot be recovered from it. (`(void)arr;` just silences an unused-parameter warning.)" },
                { lines: "14-15", text: "`word` is an array **copy** of the text, which we may modify. `lit` points to a string literal stored elsewhere, which must **not** be modified — that is why we declare it `const char *`." },
                { lines: "17", text: "`sizeof a` is applied to the real array, so no decay happens and we get 6 × sizeof(int); dividing gives 6." },
                { lines: "18", text: "The array (6 ints) and the pointer (one address) have different sizes on any normal system, so the comparison prints 0. (Their exact sizes are system-dependent.)" },
                { lines: "20-21", text: "A pointer can move. `a++` would be a compile error, because an array name is not a variable that stores an address." },
                { lines: "23-24", text: "Changing `word[0]` is fine because `word` is our own array." },
                { lines: "25", text: "Indexing and pointer arithmetic work on a char pointer just like on a char array." },
              ],
            },
            {
              type: "callout",
              variant: "warning",
              title: "Never modify a string literal",
              md: "`char *s = \"hello\"; s[0] = 'j';` compiles but is undefined behaviour — literals may be stored in read-only memory and the program may crash. Use `char s[] = \"hello\";` when you need a modifiable copy, and `const char *` when you only want to point at a literal.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `Because \`a[i]\` is *defined* as \`*(a + i)\`, indexing is just pointer arithmetic plus a dereference. When the array decays to \`&a[0]\`, adding i moves i elements forward and \`*\` reads that element. The same definition applied to a pointer gives \`p[i]\`. (A fun consequence: since addition is commutative, \`i[a]\` is also legal — but never write that in real code!) The array itself, however, is a block of storage with a fixed location, which is why it cannot be reassigned or moved.`,
            },
            {
              type: "heading",
              text: "Real-world applications",
              level: 2,
            },
            {
              type: "markdown",
              md: `- Every library function that processes arrays or strings (\`strlen\`, \`memset\`, \`qsort\`) receives a pointer created by decay.
- Code often keeps a moving pointer into a buffer (\`char *cur\`) while the array name stays fixed as the start of the buffer.
- Pointing into the middle of an array (\`a + k\`) lets you treat a part of an array as a smaller array, which is how divide-and-conquer algorithms such as merge sort hand halves to recursive calls.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Trying to move an array name",
                  wrong: `int a[5];
a++;              /* error: array is not assignable */`,
                  right: `int a[5];
int *p = a;
p++;`,
                  md: "Use a separate pointer variable when you need something that moves.",
                },
                {
                  title: "Using sizeof on a pointer to count elements",
                  wrong: `int *p = a;
int n = sizeof p / sizeof p[0];   /* not the array length */`,
                  right: `int n = sizeof a / sizeof a[0];   /* on the array itself */`,
                  md: "Once an array has decayed to a pointer, its length is lost. Compute the length where the real array is visible and pass it along.",
                },
                {
                  title: "Modifying a string literal through a pointer",
                  wrong: `char *s = "cat";
s[0] = 'b';        /* undefined behaviour */`,
                  right: `char s[] = "cat";
s[0] = 'b';        /* "bat" */`,
                  md: "A char array initialised from a literal is your own copy; a pointer to a literal is not.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "An array name in an expression decays to a pointer to its first element (except with sizeof, & and string-literal initialisers).",
                "a[i] is defined as *(a + i); &a[i] equals a + i.",
                "Pointers can be indexed: p[i] == *(p + i).",
                "An array name cannot be assigned or incremented; a pointer can.",
                "sizeof(array) gives the whole array size; sizeof(pointer) gives the size of an address.",
                "Modifying a string literal is undefined behaviour.",
              ],
            },
            {
              type: "recap",
              items: [
                "Arrays decay to pointers; indexing is pointer arithmetic.",
                "Arrays own storage; pointers just refer to storage.",
                "Use char arrays for modifiable text, const char * for literals.",
              ],
            },
            {
              type: "exercise",
              id: "c17-ex-pointer-index",
              kind: "write",
              title: "Print the second half with a pointer",
              prompt: "Given `int a[8] = {1, 2, 3, 4, 5, 6, 7, 8};`, set `int *half = a + 4;` and use **indexing on the pointer** (`half[i]`) to print the last four elements separated by spaces: `5 6 7 8`.",
              hint: "half[0] is a[4].",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int a[8] = {1, 2, 3, 4, 5, 6, 7, 8};
    int *half = a + 4;
    int i;
    for (i = 0; i < 4; i++)
        printf("%d ", half[i]);
    printf("\\n");
    return 0;
}`,
              expectedOutput: "5 6 7 8",
            },
            {
              type: "exercise",
              id: "c17-ex-predict-decay",
              kind: "predict",
              title: "Pointer into a string",
              prompt: "Predict the output.",
              starterCode: `#include <stdio.h>

int main(void)
{
    char s[] = "pointer";
    char *p = s + 2;
    printf("%s\\n", p);
    printf("%c %c\\n", *p, p[3]);
    printf("%d\\n", (int)(p - s));
    return 0;
}`,
              hint: "%s prints from the given address until '\\0'.",
              solution: "p points to 'i' (index 2), so %s prints \"inter\". p[3] is s[5] = 'e'. p − s = 2.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    char s[] = "pointer";
    char *p = s + 2;
    printf("%s\\n", p);
    printf("%c %c\\n", *p, p[3]);
    printf("%d\\n", (int)(p - s));
    return 0;
}`,
              expectedOutput: `inter
i e
2`,
            },
            {
              type: "exercise",
              id: "c17-ex-concept-array-vs-pointer",
              kind: "concept",
              title: "Array or pointer?",
              prompt: "Give two things you can do with `int *p` that you cannot do with `int a[5]`, and one thing `sizeof` tells you differently about them.",
              hint: "Think about assignment and increment.",
              solution: "You can assign a new address to p (`p = &x;`) and increment it (`p++`); neither is allowed for the array name a. `sizeof a` gives the size of all five ints, while `sizeof p` gives the size of one pointer.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c17-identity-mcq",
              prompt: "For `int a[10];`, which expression is equivalent to `a[3]`?",
              options: [
                { id: "a", text: "*a + 3" },
                { id: "b", text: "*(a + 3)" },
                { id: "c", text: "&a + 3" },
                { id: "d", text: "a + 3" },
              ],
              correct: "b",
              explanation: "a[3] is defined as *(a + 3). `a + 3` is the address &a[3], and `*a + 3` is a[0] + 3.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c17-array-increment-tf",
              prompt: "If `a` is declared as `int a[5];`, the statement `a++;` moves `a` to the next element.",
              correct: false,
              explanation: "An array name is not assignable, so `a++` is a compile error. Use a pointer variable instead.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c17-predict-index-pointer",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

int main(void)
{
    int a[] = {2, 4, 6, 8, 10};
    int *p = a + 1;
    p[2] = 0;
    printf("%d %d %d\\n", *p, *(a + 3), p[-1]);
    return 0;
}`,
              expected: "4 0 2",
              explanation: "p points to a[1]. p[2] is a[3], which becomes 0. *p is 4, *(a + 3) is 0, p[-1] is a[0] = 2.",
            },
            {
              type: "FILL_BLANK",
              slug: "c17-decay-fill",
              prompt: "In most expressions, the array name `a` is converted to the address of its first element, which can also be written `___`.",
              accepted: [["&a[0]", "&(a[0])", "& a[0]"]],
            },
          ],
        },
      ],
    },
    {
      slug: "pointers-and-functions",
      title: "Pointers and functions",
      lessons: [
        {
          slug: "pointer-parameters",
          title: "Passing pointers to functions",
          summary:
            "Why plain parameters cannot change the caller's variables, how pointer parameters solve this (swap), and how to return several results through output parameters.",
          estMinutes: 35,
          blocks: [
            {
              type: "objectives",
              items: [
                "Explain why C's pass-by-value prevents a function from changing the caller's variables",
                "Write a swap function using pointer parameters",
                "Return multiple results from a function through pointer (output) parameters",
                "Explain why scanf needs & and why array parameters are pointers",
              ],
            },
            {
              type: "markdown",
              md: `In chapter 12 you learned that C passes arguments **by value**: the function receives a *copy* of each argument. Changing the copy inside the function does nothing to the original. That is usually what you want — but sometimes you **need** a function to change the caller's variables:

- \`swap(a, b)\` must exchange two variables.
- \`scanf\` must store the input in your variable.
- A function might need to produce several results at once (a minimum *and* a maximum).

The solution is to pass the **address** of the variable. The address is still copied (C is always pass-by-value), but a copy of an address points to the same house. Through it, the function can reach and change the original.

Analogy: lending a friend a photocopy of your notebook lets them scribble on the copy — your notebook is unchanged. Giving them your home address lets them walk in and write in the real notebook.`,
            },
            {
              type: "definition",
              term: "Pass by value",
              md: "The calling mechanism C always uses: each parameter is a new variable initialised with a copy of the argument's value.",
            },
            {
              type: "definition",
              term: "Pass by pointer (simulated pass by reference)",
              md: "Passing the address of a variable so that the function can read and modify the original through the pointer parameter.",
            },
            {
              type: "definition",
              term: "Output parameter",
              md: "A pointer parameter whose purpose is to receive a result from the function, e.g. `void minMax(..., int *min, int *max)`.",
            },
            {
              type: "syntax",
              language: "c",
              code: `void f(int *p)      /* parameter is a pointer */
{
    *p = 42;          /* change the caller's variable */
}

int x;
f(&x);               /* pass the address of x */`,
            },
            {
              type: "code",
              language: "c",
              title: "A swap that fails and a swap that works",
              code: `#include <stdio.h>

void swapCopy(int x, int y)
{
    int t = x;
    x = y;
    y = t;
}

void swap(int *x, int *y)
{
    int t = *x;
    *x = *y;
    *y = t;
}

int main(void)
{
    int a = 3, b = 8;

    swapCopy(a, b);
    printf("After swapCopy: a = %d, b = %d\\n", a, b);

    swap(&a, &b);
    printf("After swap:     a = %d, b = %d\\n", a, b);
    return 0;
}`,
              runnable: true,
              output: `After swapCopy: a = 3, b = 8
After swap:     a = 8, b = 3`,
              walkthrough: [
                { lines: "3-8", text: "`swapCopy` exchanges its own local copies x and y. When it returns, the copies disappear and a and b are untouched." },
                { lines: "10", text: "`swap` receives two **addresses**: x points to a, y points to b." },
                { lines: "12", text: "Save the value at the first address (the value of a)." },
                { lines: "13", text: "Copy the value at the second address into the first: a becomes b's value." },
                { lines: "14", text: "Store the saved value at the second address: b becomes the old a." },
                { lines: "21", text: "Calling with plain values cannot work." },
                { lines: "24", text: "Pass the addresses with `&`. This is exactly why `scanf(\"%d\", &a)` needs the `&`." },
              ],
            },
            {
              type: "table",
              caption: "What happens in memory during swap(&a, &b)",
              headers: ["Step", "a", "b", "t"],
              rows: [
                ["Start", "3", "8", "—"],
                ["t = *x", "3", "8", "3"],
                ["*x = *y", "8", "8", "3"],
                ["*y = t", "8", "3", "3"],
              ],
            },
            {
              type: "heading",
              text: "Returning several results",
              level: 2,
            },
            {
              type: "markdown",
              md: `A function can \`return\` only one value. To give back more, pass pointers to variables where the results should be stored. A common style is to use the return value for success/failure and the pointer parameters for the actual results.`,
            },
            {
              type: "code",
              language: "c",
              title: "Output parameters: min/max and safe division",
              code: `#include <stdio.h>

void minMax(const int a[], int n, int *min, int *max)
{
    int i;
    *min = *max = a[0];
    for (i = 1; i < n; i++) {
        if (a[i] < *min) *min = a[i];
        if (a[i] > *max) *max = a[i];
    }
}

int divide(int dividend, int divisor, int *quot, int *rem)
{
    if (divisor == 0)
        return 0;
    *quot = dividend / divisor;
    *rem = dividend % divisor;
    return 1;
}

int main(void)
{
    int data[] = {7, -3, 12, 5, 0};
    int lo, hi, q, r;

    minMax(data, 5, &lo, &hi);
    printf("min = %d, max = %d\\n", lo, hi);

    if (divide(17, 5, &q, &r))
        printf("17 / 5 = %d remainder %d\\n", q, r);
    if (!divide(4, 0, &q, &r))
        printf("Cannot divide by zero\\n");
    return 0;
}`,
              runnable: true,
              output: `min = -3, max = 12
17 / 5 = 3 remainder 2
Cannot divide by zero`,
              walkthrough: [
                { lines: "3", text: "`a` is the input array (read-only, hence `const`); `min` and `max` are output parameters." },
                { lines: "6", text: "Write the first element into both caller variables. `*min = *max = a[0]` assigns right-to-left." },
                { lines: "8-9", text: "Read and update the caller's variables through the pointers." },
                { lines: "13-20", text: "`divide` returns 1 for success or 0 for failure, and delivers the two results through `quot` and `rem`. When the divisor is 0 it returns early without touching the outputs." },
                { lines: "27", text: "Pass the addresses of `lo` and `hi`; after the call they hold the results." },
                { lines: "30-33", text: "Check the success flag before using the outputs." },
              ],
            },
            {
              type: "callout",
              variant: "note",
              title: "Array parameters are pointer parameters",
              md: "`void f(int a[])` and `void f(int *a)` are the same declaration. That is why array functions can modify the caller's array: they always receive a pointer. Writing `const int *a` (or `const int a[]`) makes the function read-only for the elements.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `The parameter \`int *x\` is a local copy, but it is a copy of an **address**. Two copies of the same address point to the same memory, so \`*x = ...\` inside the function writes directly into the caller's variable. Nothing about pass-by-value has changed — we simply chose to pass a value (an address) that lets the function reach the original.`,
            },
            {
              type: "heading",
              text: "Real-world applications",
              level: 2,
            },
            {
              type: "markdown",
              md: `- \`scanf\`, \`sscanf\` and \`fscanf\` store converted input through pointer parameters.
- \`strtol(text, &end, 10)\` returns the number and also tells you, through a pointer, where parsing stopped.
- Sorting algorithms call \`swap\` on array elements: \`swap(&a[i], &a[j])\`.
- APIs commonly return an error code and deliver data through output parameters (e.g. \`int readSensor(double *value)\`).`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Forgetting & in the call",
                  wrong: `int a = 1, b = 2;
swap(a, b);        /* passes values, not addresses */`,
                  right: `swap(&a, &b);`,
                  md: "A pointer parameter needs an address. Compilers warn about passing an int where a pointer is expected — treat that warning as an error.",
                },
                {
                  title: "Swapping the pointers instead of the values",
                  wrong: `void swap(int *x, int *y)
{
    int *t = x;
    x = y;
    y = t;          /* only the local pointers swap */
}`,
                  right: `void swap(int *x, int *y)
{
    int t = *x;
    *x = *y;
    *y = t;
}`,
                  md: "Exchanging the local pointer copies changes nothing in the caller. Dereference to exchange the values they point to.",
                },
                {
                  title: "Returning the address of a local variable",
                  wrong: `int *makeValue(void)
{
    int v = 10;
    return &v;      /* v dies when the function returns */
}`,
                  right: `void makeValue(int *out)
{
    *out = 10;      /* write into the caller's variable */
}`,
                  md: "Local variables cease to exist when the function returns; the returned pointer is dangling and using it is undefined behaviour. Write the result through an output parameter (or use dynamic memory, chapter 20).",
                },
                {
                  title: "Passing an uninitialised pointer as an output parameter",
                  wrong: `int *result;
minMax(data, 5, result, result);   /* result points nowhere */`,
                  right: `int lo, hi;
minMax(data, 5, &lo, &hi);`,
                  md: "Output parameters need real storage. Declare ordinary variables and pass their addresses.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "C always passes arguments by value; passing an address lets a function modify the original.",
                "swap must use int * parameters and be called as swap(&a, &b).",
                "Functions can return multiple results through output (pointer) parameters.",
                "int a[] and int *a are equivalent in a parameter list.",
                "Never return the address of a local (automatic) variable.",
              ],
            },
            {
              type: "recap",
              items: [
                "Copies of values cannot change the caller; copies of addresses can.",
                "Parameter: `int *p`; call: `f(&x)`; inside: `*p = ...`.",
                "Use a return value for status and pointer parameters for results.",
                "Array parameters are pointers in disguise.",
              ],
            },
            {
              type: "exercise",
              id: "c17-ex-sort-three",
              kind: "write",
              title: "Sort three variables",
              prompt: "Using the `swap(int *x, int *y)` function, write `void sort3(int *a, int *b, int *c)` that rearranges three variables into ascending order. In `main`, sort `x = 9, y = 2, z = 5` and print `2 5 9`.",
              hint: "Compare-and-swap (a, b), then (b, c), then (a, b) again.",
              solutionCode: `#include <stdio.h>

void swap(int *x, int *y)
{
    int t = *x;
    *x = *y;
    *y = t;
}

void sort3(int *a, int *b, int *c)
{
    if (*a > *b) swap(a, b);
    if (*b > *c) swap(b, c);
    if (*a > *b) swap(a, b);
}

int main(void)
{
    int x = 9, y = 2, z = 5;
    sort3(&x, &y, &z);
    printf("%d %d %d\\n", x, y, z);
    return 0;
}`,
              expectedOutput: "2 5 9",
            },
            {
              type: "exercise",
              id: "c17-ex-predict-output-param",
              kind: "predict",
              title: "Which variables change?",
              prompt: "Predict the output.",
              starterCode: `#include <stdio.h>

void update(int a, int *b)
{
    a = a + 10;
    *b = *b + 10;
}

int main(void)
{
    int x = 1, y = 1;
    update(x, &y);
    update(y, &x);
    printf("%d %d\\n", x, y);
    return 0;
}`,
              hint: "Only the pointer parameter reaches back into main.",
              solution: "First call: y becomes 11 (x unchanged at 1). Second call: x becomes 11 through the pointer; y is passed by value and unchanged. Output: 11 11.",
              solutionCode: `#include <stdio.h>

void update(int a, int *b)
{
    a = a + 10;
    *b = *b + 10;
}

int main(void)
{
    int x = 1, y = 1;
    update(x, &y);
    update(y, &x);
    printf("%d %d\\n", x, y);
    return 0;
}`,
              expectedOutput: "11 11",
            },
            {
              type: "exercise",
              id: "c17-ex-debug-swap",
              kind: "debug",
              title: "The lazy swap",
              prompt: "This swap function leaves the caller's variables unchanged. Find and fix the bug.",
              starterCode: `void swap(int *p, int *q)
{
    int *tmp;
    tmp = p;
    p = q;
    q = tmp;
}`,
              hint: "Are the values being exchanged, or the local pointers?",
              solution: "It swaps the local pointer variables, not the ints they point to. Fix: `int tmp = *p; *p = *q; *q = tmp;`.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c17-swap-call-mcq",
              prompt: "Given `void swap(int *x, int *y);` and `int a = 1, b = 2;`, which call correctly swaps a and b?",
              options: [
                { id: "a", text: "swap(a, b);" },
                { id: "b", text: "swap(*a, *b);" },
                { id: "c", text: "swap(&a, &b);" },
                { id: "d", text: "swap(&a, b);" },
              ],
              correct: "c",
              explanation: "The function expects two addresses.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c17-predict-stats",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

void stats(int a, int b, int *sum, int *diff)
{
    *sum = a + b;
    *diff = a - b;
    a = 0;
}

int main(void)
{
    int x = 9, s, d;
    stats(x, 4, &s, &d);
    printf("%d %d %d\\n", x, s, d);
    return 0;
}`,
              expected: "9 13 5",
              explanation: "Setting the copy `a` to 0 does not affect x. s and d receive 13 and 5 through the pointers.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c17-return-local-tf",
              prompt: "It is safe for a function to return the address of one of its local (non-static) variables.",
              correct: false,
              explanation: "The local variable no longer exists after the function returns; using the pointer is undefined behaviour.",
            },
            {
              type: "CODE_WRITING",
              slug: "c17-code-divmod",
              prompt: "Write a function `void divmod(int a, int b, int *q, int *r)` that stores the quotient and remainder of `a / b` in `*q` and `*r`. In `main`, read two integers a and b (b ≠ 0) and print the quotient and remainder separated by a space.\n\nExample: input `17 5` → output `3 2`.",
              starterCode: `#include <stdio.h>

void divmod(int a, int b, int *q, int *r)
{
    /* your code */
}

int main(void)
{
    int a, b, q, r;
    scanf("%d %d", &a, &b);
    divmod(a, b, &q, &r);
    printf("%d %d\\n", q, r);
    return 0;
}`,
              sampleTests: [
                { stdin: "17 5", expected: "3 2" },
                { stdin: "20 4", expected: "5 0" },
              ],
              hiddenTests: [
                { stdin: "3 7", expected: "0 3" },
                { stdin: "100 9", expected: "11 1" },
                { stdin: "-17 5", expected: "-3 -2" },
              ],
              solutionCode: `#include <stdio.h>

void divmod(int a, int b, int *q, int *r)
{
    *q = a / b;
    *r = a % b;
}

int main(void)
{
    int a, b, q, r;
    scanf("%d %d", &a, &b);
    divmod(a, b, &q, &r);
    printf("%d %d\\n", q, r);
    return 0;
}`,
              explanation: "Write the results through the pointer parameters. Note that in C, integer division truncates toward zero, so -17 / 5 is -3 and -17 % 5 is -2.",
            },
          ],
        },
        {
          slug: "const-and-double-pointers",
          title: "const pointers and pointers to pointers",
          summary:
            "Read and write declarations that combine const with pointers, and meet pointers to pointers: what they are and how a function can change the caller's pointer.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Distinguish const int *p, int *const p and const int *const p",
                "Use const pointer parameters to document and enforce read-only access",
                "Declare and use a pointer to a pointer (int **)",
                "Write a function that changes which object the caller's pointer points to",
              ],
            },
            {
              type: "markdown",
              md: `A pointer involves **two** things that could be changed: the **pointer itself** (where it points) and the **data it points to**. \`const\` lets you lock either one, or both.

Analogy: a pointer is a sign pointing to a shop.
- \`const int *p\` — the **shop's goods are behind glass**: you can look but not touch. You may still turn the sign to point at another shop.
- \`int *const p\` — the **sign is bolted down**: it always points to the same shop, but you can rearrange the goods inside.
- \`const int *const p\` — bolted-down sign *and* goods behind glass.`,
            },
            {
              type: "definition",
              term: "Pointer to const",
              md: "`const int *p` (also written `int const *p`): the data cannot be modified through p, but p itself can be redirected.",
            },
            {
              type: "definition",
              term: "Const pointer",
              md: "`int *const p = &x;`: p must be initialised and can never point anywhere else, but `*p` may be modified.",
            },
            {
              type: "definition",
              term: "Pointer to pointer",
              md: "A variable that stores the address of a pointer variable, e.g. `int **pp`. `*pp` is the pointer, and `**pp` is the int it points to.",
            },
            {
              type: "syntax",
              language: "c",
              code: `const int *p1;          /* *p1 read-only, p1 can change   */
int *const p2 = &x;     /* p2 fixed,      *p2 can change  */
const int *const p3 = &x; /* both fixed                   */

int **pp = &p;          /* pointer to a pointer to int    */`,
              md: "Read declarations **right to left** from the name: `int *const p2` is \"p2 is a const pointer to int\"; `const int *p1` is \"p1 is a pointer to int that is const\".",
            },
            {
              type: "table",
              caption: "What each form allows",
              headers: ["Declaration", "*p = 5;", "p = &y;"],
              rows: [
                ["int *p", "allowed", "allowed"],
                ["const int *p", "error", "allowed"],
                ["int *const p = &x", "allowed", "error"],
                ["const int *const p = &x", "error", "error"],
              ],
            },
            {
              type: "code",
              language: "c",
              title: "const in action",
              code: `#include <stdio.h>

int total(const int *a, int n)
{
    int s = 0;
    while (n-- > 0)
        s += *a++;
    return s;
}

int main(void)
{
    int x = 10, y = 20;
    int nums[] = {1, 2, 3, 4};

    const int *reader = &x;
    int *const fixed = &x;

    printf("reader sees %d\\n", *reader);
    reader = &y;                 /* OK: pointer may move */
    printf("reader now sees %d\\n", *reader);

    *fixed = 15;                 /* OK: data may change */
    printf("x changed to %d\\n", x);

    printf("total = %d\\n", total(nums, 4));
    return 0;
}`,
              runnable: true,
              output: `reader sees 10
reader now sees 20
x changed to 15
total = 10`,
              walkthrough: [
                { lines: "3", text: "`const int *a` promises the caller that `total` will not modify the array. The pointer itself is a local copy and may move." },
                { lines: "6-7", text: "`*a++` reads the current element and then advances the pointer — legal because only the data is const, not the pointer." },
                { lines: "16", text: "`reader` may point anywhere but cannot write: `*reader = 1;` would not compile." },
                { lines: "17", text: "`fixed` is locked onto x forever: `fixed = &y;` would not compile." },
                { lines: "20", text: "Redirecting a pointer-to-const is allowed." },
                { lines: "23", text: "Writing through a const pointer is allowed." },
              ],
            },
            {
              type: "callout",
              variant: "tip",
              title: "Use const for read-only parameters",
              md: "Whenever a function only reads through a pointer parameter, declare it `const T *`. It documents your intent, lets callers pass const data and string literals, and turns accidental writes into compile errors. Standard functions do this: `size_t strlen(const char *s);`.",
            },
            {
              type: "heading",
              text: "Pointers to pointers",
              level: 2,
            },
            {
              type: "markdown",
              md: `A pointer is a variable, so it has an address too — and that address can be stored in another pointer. With \`int x; int *p = &x; int **pp = &p;\`:

| Expression | Meaning |
|---|---|
| \`pp\` | address of p |
| \`*pp\` | p (the address of x) |
| \`**pp\` | x |

The main beginner-level use: a function that must change **which object the caller's pointer points to**. By the same logic as swap, to change an \`int\` you pass an \`int *\`; to change an \`int *\` you pass an \`int **\`. You will also see \`char **argv\` in \`main\`'s full signature and arrays of strings later.`,
            },
            {
              type: "code",
              language: "c",
              title: "A function that redirects the caller's pointer",
              code: `#include <stdio.h>

void pointToLargest(int a[], int n, int **best)
{
    int i;
    *best = &a[0];
    for (i = 1; i < n; i++)
        if (a[i] > **best)
            *best = &a[i];
}

int main(void)
{
    int x = 5;
    int *p = &x;
    int **pp = &p;
    int scores[] = {40, 95, 70, 88};
    int *top = NULL;

    printf("x via p: %d, via pp: %d\\n", *p, **pp);
    **pp = 6;
    printf("x is now %d\\n", x);

    pointToLargest(scores, 4, &top);
    printf("largest = %d at index %d\\n", *top, (int)(top - scores));
    *top = 100;
    printf("scores[1] = %d\\n", scores[1]);
    return 0;
}`,
              runnable: true,
              output: `x via p: 5, via pp: 5
x is now 6
largest = 95 at index 1
scores[1] = 100`,
              walkthrough: [
                { lines: "3", text: "`best` is a pointer to the caller's pointer, so the function can change where that pointer points." },
                { lines: "6", text: "`*best` is the caller's pointer (`top`). We make it point at the first element." },
                { lines: "8-9", text: "`**best` is the value the caller's pointer currently points at. If a bigger element appears, redirect the caller's pointer to it." },
                { lines: "16", text: "`pp` holds the address of `p`." },
                { lines: "20-21", text: "Two dereferences reach `x`: `*pp` is p, `**pp` is x. Writing `**pp = 6` changes x." },
                { lines: "24", text: "Pass the **address of** `top` (an `int **`) so the function can set it." },
                { lines: "25-27", text: "`top` now points into `scores`. Subtracting gives the index, and writing through `top` changes the array element." },
              ],
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `\`const\` is enforced entirely by the compiler: it checks every assignment and refuses writes through a pointer-to-const or reassignments of a const pointer, at no run-time cost. A pointer to a pointer works for the same reason any pointer works: \`*pp\` names the object at the stored address — here, a pointer variable — so assigning to \`*pp\` changes that pointer in the caller's frame.`,
            },
            {
              type: "heading",
              text: "Real-world applications",
              level: 2,
            },
            {
              type: "markdown",
              md: `- Standard library prototypes are full of \`const char *\` parameters (\`strlen\`, \`strcmp\`, \`printf\`'s format).
- \`int main(int argc, char **argv)\` receives the command-line arguments as a pointer to an array of string pointers.
- \`strtol(const char *s, char **end, int base)\` uses a \`char **\` to tell you where parsing stopped.
- Linked-list functions that may change the list's head pointer take a \`Node **head\` parameter.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Writing through a pointer to const",
                  wrong: `void clear(const int *a, int n)
{
    a[0] = 0;       /* error: read-only */
}`,
                  right: `void clear(int *a, int n)
{
    a[0] = 0;
}`,
                  md: "If the function must modify the data, do not mark it const. If it must not, the compiler error is doing its job.",
                },
                {
                  title: "Mixing up const placement",
                  wrong: `int *const p;     /* error: a const pointer must be initialised */`,
                  right: `int *const p = &x;`,
                  md: "With `const` after the `*`, the pointer itself is constant, so it must get its value at declaration.",
                },
                {
                  title: "Passing a pointer instead of its address",
                  wrong: `int *top = NULL;
pointToLargest(scores, 4, top);    /* type mismatch; top cannot change */`,
                  right: `pointToLargest(scores, 4, &top);`,
                  md: "To let a function change your pointer, pass the pointer's address (an `int **`).",
                },
                {
                  title: "Dereferencing the wrong number of times",
                  wrong: `int **pp = &p;
printf("%d\\n", *pp);    /* prints an address as int: wrong */`,
                  right: `printf("%d\\n", **pp);`,
                  md: "Each `*` removes one level of pointer. From `int **` you need two to reach the `int`.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "const int *p: data is read-only through p; p may be reassigned.",
                "int *const p: p cannot be reassigned (must be initialised); data may change.",
                "const int *const p: neither may change.",
                "Read declarations right to left starting from the variable name.",
                "With int **pp = &p: *pp is p and **pp is the int p points to.",
                "To modify a caller's T variable pass T *; to modify a caller's T * pass T **.",
              ],
            },
            {
              type: "recap",
              items: [
                "const can protect the data, the pointer, or both.",
                "Mark read-only pointer parameters const.",
                "A pointer to a pointer adds one more level of indirection.",
                "Use T ** parameters when a function must redirect the caller's pointer.",
              ],
            },
            {
              type: "exercise",
              id: "c17-ex-find-char",
              kind: "write",
              title: "Locate a character",
              prompt: "Write `int findChar(const char *s, char c, const char **where)` that returns 1 and sets `*where` to point at the first occurrence of `c` in `s`, or returns 0 if `c` does not occur. In `main`, search `\"programming\"` for `'g'`, and print the rest of the string from that position and the index: `gramming 3`.",
              hint: "Walk with a pointer until '\\0'; when you find c, assign `*where = s;` and return 1.",
              solutionCode: `#include <stdio.h>

int findChar(const char *s, char c, const char **where)
{
    while (*s != '\\0') {
        if (*s == c) {
            *where = s;
            return 1;
        }
        s++;
    }
    return 0;
}

int main(void)
{
    const char *text = "programming";
    const char *pos;
    if (findChar(text, 'g', &pos))
        printf("%s %d\\n", pos, (int)(pos - text));
    return 0;
}`,
              expectedOutput: "gramming 3",
            },
            {
              type: "exercise",
              id: "c17-ex-predict-double-pointer",
              kind: "predict",
              title: "Levels of indirection",
              prompt: "Predict the output.",
              starterCode: `#include <stdio.h>

int main(void)
{
    int a = 1, b = 2;
    int *p = &a;
    int **pp = &p;
    **pp += 10;
    *pp = &b;
    **pp *= 5;
    printf("%d %d %d\\n", a, b, *p);
    return 0;
}`,
              hint: "*pp = &b changes where p points.",
              solution: "**pp += 10 makes a = 11. *pp = &b redirects p to b. **pp *= 5 makes b = 10. *p is now b = 10.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int a = 1, b = 2;
    int *p = &a;
    int **pp = &p;
    **pp += 10;
    *pp = &b;
    **pp *= 5;
    printf("%d %d %d\\n", a, b, *p);
    return 0;
}`,
              expectedOutput: "11 10 10",
            },
            {
              type: "exercise",
              id: "c17-ex-concept-const",
              kind: "concept",
              title: "Which lines compile?",
              prompt: "Given `int x = 1, y = 2; const int *p = &x; int *const q = &x;`, which of these compile: (a) `p = &y;` (b) `*p = 3;` (c) `q = &y;` (d) `*q = 3;`?",
              hint: "p protects the data; q protects the pointer.",
              solution: "(a) compiles — p may be redirected. (b) error — data is read-only through p. (c) error — q is a const pointer. (d) compiles — data may be changed through q.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c17-const-mcq",
              prompt: "Which declaration makes `p` a pointer that can never be redirected, while still allowing `*p = 5;`?",
              options: [
                { id: "a", text: "const int *p = &x;" },
                { id: "b", text: "int const *p = &x;" },
                { id: "c", text: "int *const p = &x;" },
                { id: "d", text: "const int *const p = &x;" },
              ],
              correct: "c",
              explanation: "const after the * makes the pointer itself constant; the int it points to is still modifiable.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c17-const-param-tf",
              prompt: "`const int *p` and `int const *p` declare the same thing.",
              correct: true,
              explanation: "Both mean pointer to const int; what matters is whether const is before or after the *.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c17-predict-redirect",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

void moveForward(int **pp)
{
    (*pp)++;
}

int main(void)
{
    int a[] = {3, 6, 9};
    int *p = a;
    moveForward(&p);
    moveForward(&p);
    printf("%d\\n", *p);
    return 0;
}`,
              expected: "9",
              explanation: "Each call advances the caller's pointer by one element, so p ends at a[2].",
            },
            {
              type: "FILL_BLANK",
              slug: "c17-double-deref-fill",
              prompt: "If `int **pp = &p;` and `p = &x;`, then the expression `___pp` refers to x.",
              accepted: [["**"]],
            },
          ],
        },
      ],
    },
  ],
};

export default chapter;
