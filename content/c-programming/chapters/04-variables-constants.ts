import type { ChapterContent } from "../../../src/lib/content/schema";

/** Raw template tag: backslashes in C code (\n, \t, \0) are kept exactly as typed. */
const c = String.raw;

const chapter: ChapterContent = {
  slug: "variables-constants",
  title: "Variables and Constants",
  summary:
    "How C stores values in named variables, how to declare and initialise them, how to write constants (literals, const and #define), and where a variable can be used (scope).",
  topics: [
    {
      slug: "variables",
      title: "Variables",
      lessons: [
        {
          slug: "c-variables-declaration-initialization",
          title: "Declaring, initialising and assigning variables",
          summary:
            "Understand what a variable really is, how to declare one, the difference between initialisation and assignment, and why uninitialised variables are dangerous.",
          estMinutes: 25,
          blocks: [
            {
              type: "objectives",
              items: [
                "Explain what a variable is in terms of memory, name, type and value.",
                "Declare variables of different types, one or several per line.",
                "Distinguish declaration, initialisation and assignment.",
                "Explain why reading an uninitialised local variable is a bug.",
                "Update a variable using its own previous value.",
              ],
            },
            {
              type: "markdown",
              md: `## Labelled boxes in memory

Your computer's memory is like a huge wall of numbered lockers. A **variable** is a locker you have reserved and stuck a name label on. In C, every variable has:

- a **name** (the label) — e.g. \`age\`
- a **type** (what kind of thing fits inside, and how big the locker is) — e.g. \`int\` for whole numbers
- a **value** (what is currently inside) — e.g. \`19\`
- an **address** (the locker number) — chosen by the compiler and operating system; you'll work with addresses in the pointers chapters.

The value can change while the program runs — that is why it is called a *variable*.`,
            },
            {
              type: "definition",
              term: "Variable",
              md: "A named region of memory that stores a value of a particular type. The value can be read and changed while the program runs.",
            },
            {
              type: "definition",
              term: "Declaration",
              md: "A statement that introduces a variable's name and type to the compiler, e.g. `int age;`. For an ordinary local variable, the declaration also reserves storage for it.",
            },
            {
              type: "definition",
              term: "Initialisation",
              md: "Giving a variable a value **at the moment it is declared**: `int age = 19;`.",
            },
            {
              type: "definition",
              term: "Assignment",
              md: "Storing a new value in an existing variable using `=`: `age = 20;`. The old value is overwritten.",
            },
            {
              type: "syntax",
              language: "c",
              code: c`type name;                         /* declaration                 */
type name = value;                 /* declaration + initialisation */
type name1, name2 = value2, name3; /* several of the same type     */
name = expression;                 /* assignment (later)           */`,
              md: "The `=` in an assignment means *store the value on the right into the variable on the left*. It is **not** a mathematical equation.",
            },
            {
              type: "table",
              caption: "The most common variable types (details in chapter 5)",
              headers: ["Type", "Holds", "Example declaration", "printf placeholder"],
              rows: [
                ["`int`", "Whole numbers", "`int count = 42;`", "`%d`"],
                ["`float`", "Decimal numbers (about 6–7 significant digits)", "`float price = 9.99f;`", "`%f`"],
                ["`double`", "Decimal numbers (about 15–16 significant digits)", "`double pi = 3.14159265;`", "`%f` (or `%lf`)"],
                ["`char`", "A single character", "`char grade = 'A';`", "`%c`"],
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Declare, initialise, assign",
              runnable: true,
              code: c`#include <stdio.h>

int main(void)
{
    int age = 19;            /* declaration + initialisation */
    char grade = 'B';
    double height_m = 1.75;
    int year;                /* declaration only */

    year = 2026;             /* assignment */
    printf("Age: %d, Grade: %c\n", age, grade);
    printf("Height: %.2f m, Year: %d\n", height_m, year);

    age = 20;                /* overwrite the old value */
    grade = 'A';
    printf("Next year -> Age: %d, Grade: %c\n", age, grade);
    return 0;
}`,
              output: `Age: 19, Grade: B
Height: 1.75 m, Year: 2026
Next year -> Age: 20, Grade: A`,
              walkthrough: [
                { lines: "5-7", text: "Three variables are declared and initialised in one step. Character values go in single quotes: `'B'`." },
                { lines: "8", text: "`year` is declared but not yet given a value. We must not read it until we assign one." },
                { lines: "10", text: "Assignment: 2026 is stored in `year`." },
                { lines: "11-12", text: "Print the values. `%c` prints a character, `%.2f` a decimal number with 2 decimals." },
                { lines: "14-15", text: "New values replace the old ones. The previous values (19 and 'B') are gone." },
                { lines: "16", text: "Printing again shows the updated values." },
              ],
            },
            {
              type: "heading",
              text: "Using a variable's own value",
              level: 2,
            },
            {
              type: "markdown",
              md: "Because `=` means *store*, you can write `total = total + price;`. The right-hand side is computed first using the **current** value of `total`, then the result is stored back into `total`. This is how programs keep running totals, counters and scores.",
            },
            {
              type: "code",
              language: "c",
              title: "A running total and a swap",
              runnable: true,
              code: c`#include <stdio.h>

int main(void)
{
    int total = 0;
    total = total + 15;
    total = total + 25;
    total = total * 2;
    printf("total = %d\n", total);

    int a = 3, b = 8, temp;
    temp = a;
    a = b;
    b = temp;
    printf("after swap: a = %d, b = %d\n", a, b);
    return 0;
}`,
              output: `total = 80
after swap: a = 8, b = 3`,
              walkthrough: [
                { lines: "5", text: "Start the total at 0. Initialising to 0 is essential — otherwise the total would start from a garbage value." },
                { lines: "6", text: "Right side: 0 + 15 = 15, stored in `total`." },
                { lines: "7", text: "15 + 25 = 40." },
                { lines: "8", text: "40 × 2 = 80." },
                { lines: "11", text: "Declare three ints on one line; `a` and `b` are initialised, `temp` is not (it gets a value on the next line before being read)." },
                { lines: "12-14", text: "Swapping needs a temporary variable. If we wrote `a = b; b = a;` both would end up as 8, because the original value of `a` would be lost." },
                { lines: "15", text: "Prints the swapped values." },
              ],
            },
            {
              type: "callout",
              variant: "warning",
              title: "Uninitialised local variables contain garbage",
              md: "A local variable declared without a value (like `int year;`) holds whatever bits happened to be in that memory. Reading it before assigning a value is **undefined behaviour**: the program might print a random number, print 0, or behave strangely. Always initialise variables, or assign them before their first use. Compile with `-Wall` to get warnings about this.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: "When the compiler sees `int total = 0;`, it reserves a few bytes (typically 4 for an `int`) and remembers that the name `total` refers to that location. Every later use of `total` becomes \"read from that location\" and every assignment becomes \"write to that location\". The type tells the compiler how many bytes to use and how to interpret the bits — the same bytes mean something very different as an `int` than as a `float`. That is why C requires every variable to be declared with a type before it is used.",
            },
            {
              type: "heading",
              text: "Real-world use",
              level: 3,
            },
            {
              type: "markdown",
              md: "Variables hold everything a program is working on: a game's `score` and `lives`, a thermostat's `current_temp` and `target_temp`, a shopping cart's `subtotal`. The running-total pattern (`total = total + x`) appears in billing systems, statistics, sensors that average readings, and countless loops you will write from chapter 10 onwards.",
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Using a variable before declaring it",
                  wrong: c`count = 5;
int count;`,
                  right: c`int count;
count = 5;`,
                  md: "C reads top to bottom. The name must be declared before any use, or the compiler reports *'count' undeclared*.",
                },
                {
                  title: "Reading an uninitialised variable",
                  wrong: c`int sum;
sum = sum + 10;   /* sum started as garbage */`,
                  right: c`int sum = 0;
sum = sum + 10;`,
                  md: "The wrong version adds 10 to an unknown value (undefined behaviour). Initialise accumulators to 0 (or 1 for products).",
                },
                {
                  title: "Writing the assignment backwards",
                  wrong: c`int x;
10 = x;`,
                  right: c`int x;
x = 10;`,
                  md: "The variable that receives the value must be on the **left** of `=`. A literal like 10 cannot be assigned to, so the compiler reports *lvalue required*.",
                },
                {
                  title: "Initialising only the last variable in a list",
                  wrong: c`int a, b, c = 0;   /* only c is 0! */`,
                  right: c`int a = 0, b = 0, c = 0;`,
                  md: "In a multiple declaration each initialiser applies only to the variable directly before it. `a` and `b` are left uninitialised.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "A variable has a name, a type, a value and an address.",
                "Declaration: `int x;`. Initialisation: `int x = 5;`. Assignment: `x = 7;`.",
                "Variables must be declared before use; C is statically typed.",
                "Uninitialised local variables hold indeterminate (garbage) values.",
                "`=` is assignment; the left side must be a modifiable variable (an *lvalue*).",
                "`int a, b = 5;` initialises only `b`.",
              ],
            },
            {
              type: "recap",
              items: [
                "Variables are named, typed storage locations.",
                "Initialise when you declare whenever possible.",
                "Assignment evaluates the right side first, then stores it on the left.",
                "Swapping two variables needs a temporary.",
              ],
            },
            {
              type: "exercise",
              id: "c04-ex-predict-updates",
              kind: "predict",
              title: "Trace the updates",
              prompt: "Trace the value of each variable line by line and predict the output.",
              starterCode: c`#include <stdio.h>

int main(void)
{
    int x = 4;
    int y = x * 3;
    x = y - x;
    y = y + x;
    printf("x = %d, y = %d\n", x, y);
    return 0;
}`,
              hint: "Write down x and y after each line. Each line uses the values from the line before.",
              solution: "x = 4, y = 12; then x = 12 - 4 = 8; then y = 12 + 8 = 20.",
              solutionCode: c`#include <stdio.h>

int main(void)
{
    int x = 4;
    int y = x * 3;
    x = y - x;
    y = y + x;
    printf("x = %d, y = %d\n", x, y);
    return 0;
}`,
              expectedOutput: "x = 8, y = 20",
            },
            {
              type: "exercise",
              id: "c04-ex-bill",
              kind: "write",
              title: "Café bill",
              prompt: "Declare `int coffee = 3;`, `int cake = 4;` and `int total = 0;`. Add 2 coffees and 1 cake to `total` using the running-total pattern, then print `Total: 10`.",
              hint: "`total = total + 2 * coffee;` and so on.",
              solutionCode: c`#include <stdio.h>

int main(void)
{
    int coffee = 3;
    int cake = 4;
    int total = 0;

    total = total + 2 * coffee;
    total = total + cake;
    printf("Total: %d\n", total);
    return 0;
}`,
              expectedOutput: "Total: 10",
            },
            {
              type: "exercise",
              id: "c04-ex-broken-swap",
              kind: "debug",
              title: "The broken swap",
              prompt: "This program is supposed to print `p = 2, q = 1`, but prints `p = 2, q = 2`. Explain why and fix it.",
              starterCode: c`#include <stdio.h>

int main(void)
{
    int p = 1, q = 2;
    p = q;
    q = p;
    printf("p = %d, q = %d\n", p, q);
    return 0;
}`,
              hint: "What is the value of `p` when `q = p;` runs?",
              solution: "After `p = q;` the original value of `p` (1) is lost, so `q = p;` just copies 2 back. Save `p` in a temporary variable first.",
              solutionCode: c`#include <stdio.h>

int main(void)
{
    int p = 1, q = 2;
    int temp = p;
    p = q;
    q = temp;
    printf("p = %d, q = %d\n", p, q);
    return 0;
}`,
              expectedOutput: "p = 2, q = 1",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c04-init-mcq",
              prompt: "Which statement **declares and initialises** a variable?",
              options: [
                { id: "a", text: "`int score;`" },
                { id: "b", text: "`score = 10;`" },
                { id: "c", text: "`int score = 10;`" },
                { id: "d", text: "`10 = score;`" },
              ],
              correct: "c",
              explanation: "(a) only declares, (b) assigns to an existing variable, (d) is invalid.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c04-multi-init-tf",
              prompt: "In `int a, b, c = 5;` all three variables are set to 5.",
              correct: false,
              explanation: "Only `c` is initialised to 5. `a` and `b` are declared without initial values.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c04-update-output",
              prompt: "What does this program print?",
              code: c`#include <stdio.h>

int main(void)
{
    int n = 5;
    n = n + 3;
    n = n * n;
    int m = n - 60;
    printf("%d %d\n", n, m);
    return 0;
}`,
              expected: "64 4",
              explanation: "n becomes 8, then 64. m = 64 - 60 = 4.",
            },
            {
              type: "FILL_BLANK",
              slug: "c04-garbage-fill",
              prompt: "A local variable that is declared but never given a value holds an indeterminate value, often called a ___ value.",
              accepted: [["garbage", "junk", "indeterminate", "random"]],
              explanation: "Uninitialised local variables contain whatever bits were left in memory — a garbage value. Reading it is undefined behaviour.",
            },
          ],
        },
      ],
    },
    {
      slug: "constants-and-scope",
      title: "Constants and scope",
      lessons: [
        {
          slug: "c-constants-and-literals",
          title: "Literals, const and #define",
          summary:
            "Write integer, floating-point, character and string literals correctly, and create named constants with const and #define.",
          estMinutes: 25,
          blocks: [
            {
              type: "objectives",
              items: [
                "Write integer literals in decimal, octal and hexadecimal.",
                "Write floating-point literals, including exponent notation, and character and string literals.",
                "Create named constants with `const` and `#define` and explain how they differ.",
                "Explain why named constants are better than \"magic numbers\".",
              ],
            },
            {
              type: "markdown",
              md: `## Values that never change

Some values in a program are fixed: the number of days in a week, the value of π, the maximum number of players in a game. A **constant** is a value that cannot change while the program runs.

C gives you two kinds:

1. **Literals** — values written directly in the code: \`7\`, \`3.14\`, \`'A'\`, \`"hello"\`.
2. **Named constants** — a name for a fixed value, created with the \`const\` keyword or the \`#define\` preprocessor directive.`,
            },
            {
              type: "definition",
              term: "Literal",
              md: "A fixed value written directly in source code, such as `42`, `0x2A`, `2.5`, `'x'` or `\"text\"`. Also called a *constant* in many textbooks.",
            },
            {
              type: "table",
              caption: "Kinds of literals",
              headers: ["Kind", "Examples", "Notes"],
              rows: [
                ["Decimal integer", "`0`, `42`, `-17`, `100000`", "Ordinary base-10 numbers (the `-` is actually an operator applied to the literal)"],
                ["Octal integer", "`017`, `0755`", "Starts with `0`; digits 0–7. `017` is 15 in decimal!"],
                ["Hexadecimal integer", "`0x1F`, `0XFF`, `0xdead`", "Starts with `0x`; digits 0–9 and A–F"],
                ["Integer suffixes", "`42u`, `42L`, `42UL`", "`u` = unsigned, `L` = long"],
                ["Floating-point", "`3.14`, `.5`, `2.`, `6.02e23`, `1.5E-3`", "Type `double` by default; `e` means ×10^n"],
                ["float suffix", "`3.14f`, `2.5F`", "Makes the literal a `float`"],
                ["Character", "`'A'`, `'7'`, `'\\n'`, `'\\''`", "One character in single quotes; stored as its numeric code"],
                ["String", "`\"Hello\"`, `\"\"`, `\"Line\\n\"`", "Characters in double quotes, automatically ended by a hidden `'\\0'`"],
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Literals in different forms",
              runnable: true,
              code: c`#include <stdio.h>

int main(void)
{
    printf("Decimal 255 = %d\n", 255);
    printf("Octal 0377  = %d\n", 0377);
    printf("Hex 0xFF    = %d\n", 0xFF);
    printf("Octal 010   = %d (not ten!)\n", 010);

    printf("3.5e2  = %.1f\n", 3.5e2);
    printf("1.5e-3 = %.4f\n", 1.5e-3);

    printf("'A' as char: %c, as number: %d\n", 'A', 'A');
    printf("String: %s\n", "C is fun");
    return 0;
}`,
              output: `Decimal 255 = 255
Octal 0377  = 255
Hex 0xFF    = 255
Octal 010   = 8 (not ten!)
3.5e2  = 350.0
1.5e-3 = 0.0015
'A' as char: A, as number: 65
String: C is fun`,
              walkthrough: [
                { lines: "5-7", text: "The same value, 255, written three ways. `%d` always prints in decimal." },
                { lines: "8", text: "A leading zero makes a literal octal: `010` is 1×8 + 0 = 8. A classic trap!" },
                { lines: "10", text: "`3.5e2` means 3.5 × 10² = 350." },
                { lines: "11", text: "`1.5e-3` means 1.5 × 10⁻³ = 0.0015. `%.4f` shows four decimals." },
                { lines: "13", text: "A character literal is really a small integer: in ASCII, `'A'` has code 65. `%c` shows the character, `%d` shows the code." },
                { lines: "14", text: "`%s` prints a string literal." },
              ],
            },
            {
              type: "heading",
              text: "Named constants",
              level: 2,
            },
            {
              type: "syntax",
              language: "c",
              code: c`const type NAME = value;   /* a read-only variable, checked by the compiler */

#define NAME replacement   /* text substitution by the preprocessor (no = and no ;) */`,
            },
            {
              type: "definition",
              term: "const",
              md: "A type qualifier that makes a variable read-only after initialisation. `const double PI = 3.14159;` — any later attempt to assign to `PI` is a compile-time error.",
            },
            {
              type: "definition",
              term: "#define (symbolic constant / macro)",
              md: "A preprocessor directive that replaces every later occurrence of a name with some text before compilation. `#define MAX 100` turns `MAX` into `100` everywhere. Macros are covered fully in chapter 22.",
            },
            {
              type: "code",
              language: "c",
              title: "const and #define together",
              runnable: true,
              code: c`#include <stdio.h>

#define MAX_SCORE 100

int main(void)
{
    const double PI = 3.14159;
    const int DAYS_PER_WEEK = 7;

    double radius = 3.0;
    double area = PI * radius * radius;
    int my_score = 85;

    printf("Area: %.2f\n", area);
    printf("Weeks in 28 days: %d\n", 28 / DAYS_PER_WEEK);
    printf("Score: %d out of %d\n", my_score, MAX_SCORE);
    printf("Points missed: %d\n", MAX_SCORE - my_score);
    return 0;
}`,
              output: `Area: 28.27
Weeks in 28 days: 4
Score: 85 out of 100
Points missed: 15`,
              walkthrough: [
                { lines: "3", text: "A symbolic constant. The preprocessor replaces each `MAX_SCORE` with `100`. Note: no `=` and no `;`." },
                { lines: "7-8", text: "Two `const` variables. They have a type and must be initialised; they can never be changed afterwards." },
                { lines: "11", text: "3.14159 × 3 × 3 = 28.27431, printed as 28.27." },
                { lines: "15", text: "28 / 7 = 4." },
                { lines: "16-17", text: "`MAX_SCORE` reads like a word but is replaced by 100 before compiling." },
              ],
            },
            {
              type: "table",
              caption: "const vs #define",
              headers: ["", "`const`", "`#define`"],
              rows: [
                ["Handled by", "Compiler", "Preprocessor (text replacement)"],
                ["Has a type?", "Yes — type-checked", "No — just text"],
                ["Syntax", "`const int MAX = 10;`", "`#define MAX 10`"],
                ["Obeys scope rules?", "Yes (block or file scope)", "No — valid from the `#define` line to the end of the file"],
                ["Visible in a debugger?", "Usually yes", "No (the name has disappeared)"],
                ["Usable as an array size everywhere?", "Not in all contexts in C", "Yes"],
              ],
            },
            {
              type: "callout",
              variant: "tip",
              title: "Avoid magic numbers",
              md: "A *magic number* is an unexplained literal like `0.18` or `86400` in the middle of code. Replace it with a named constant (`TAX_RATE`, `SECONDS_PER_DAY`). The code becomes self-explanatory, and if the value ever changes you edit it in one place.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: "Literals are encoded directly into the machine instructions or the program's data, so they cost nothing to \"look up\". A `const` variable is a normal variable that the compiler refuses to let you modify — the compiler checks every assignment against the qualifier. A `#define` constant never reaches the compiler at all: by the time the code is compiled, `MAX_SCORE` has already been replaced by `100`, which is why the directive needs no type, no `=` and no semicolon.",
            },
            {
              type: "heading",
              text: "Real-world use",
              level: 3,
            },
            {
              type: "markdown",
              md: "Hexadecimal literals are everywhere in systems programming — colours (`0xFF8800`), hardware register addresses, bit masks. Octal is still used for UNIX file permissions (`chmod 0755`). Standard headers are full of named constants: `INT_MAX`, `EOF`, `EXIT_SUCCESS`, `RAND_MAX`. Configuration values like buffer sizes and timeouts are normally defined once as constants at the top of a file.",
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Adding a leading zero to a decimal number",
                  wrong: c`int code = 0123;   /* meant one hundred twenty-three */`,
                  right: c`int code = 123;`,
                  md: "A leading zero makes the literal **octal**: `0123` is 83 in decimal. And `089` is an error because 8 and 9 are not octal digits.",
                },
                {
                  title: "Using = or ; in a #define",
                  wrong: c`#define RATE = 5;`,
                  right: c`#define RATE 5`,
                  md: "Everything after the name is the replacement text. With `= 5;`, `RATE * 2` becomes `= 5; * 2` — a syntax error.",
                },
                {
                  title: "Trying to change a const",
                  wrong: c`const int LIMIT = 10;
LIMIT = 20;`,
                  right: c`int limit = 10;   /* if it must change, it isn't a constant */
limit = 20;`,
                  md: "Assigning to a `const` object is a compile-time error (*assignment of read-only variable*). Declare it without `const` if it really needs to change.",
                },
                {
                  title: "Confusing 'A' and \"A\"",
                  wrong: c`char letter = "A";`,
                  right: c`char letter = 'A';`,
                  md: "Single quotes make a character (one small integer). Double quotes make a string (an array of characters ending in `'\\0'`). A `char` variable holds a single character.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "Integer literals: decimal (`25`), octal (leading `0`: `031`), hexadecimal (`0x19`) — all equal 25.",
                "Floating literals are `double` by default; add `f` for `float`. `2.5e3` = 2500.0.",
                "Character literals use single quotes and are stored as integer codes (`'A'` = 65 in ASCII).",
                "`const` creates a typed read-only variable; `#define` performs untyped text substitution.",
                "`#define` lines have no `=` and no terminating `;`.",
              ],
            },
            {
              type: "recap",
              items: [
                "Literals are values written directly in code.",
                "Watch out for leading zeros: they mean octal.",
                "Use `const` or `#define` to give fixed values meaningful names.",
                "Named constants replace magic numbers and make code easier to change.",
              ],
            },
            {
              type: "exercise",
              id: "c04-ex-predict-bases",
              kind: "predict",
              title: "Bases and codes",
              prompt: "Predict the output of this program.",
              starterCode: c`#include <stdio.h>

int main(void)
{
    printf("%d\n", 0x10);
    printf("%d\n", 012);
    printf("%d\n", 'a');
    printf("%.1f\n", 2.5e1);
    return 0;
}`,
              hint: "0x10 is base 16; 012 is base 8; 'a' is 97 in ASCII.",
              solution: "0x10 = 16; 012 = 1×8 + 2 = 10; 'a' = 97; 2.5e1 = 25.0.",
              solutionCode: c`#include <stdio.h>

int main(void)
{
    printf("%d\n", 0x10);
    printf("%d\n", 012);
    printf("%d\n", 'a');
    printf("%.1f\n", 2.5e1);
    return 0;
}`,
              expectedOutput: `16
10
97
25.0`,
            },
            {
              type: "exercise",
              id: "c04-ex-seconds-per-day",
              kind: "write",
              title: "Remove the magic numbers",
              prompt: "Write a program that defines `#define HOURS_PER_DAY 24` and `const int SECONDS_PER_HOUR = 3600;`, then prints `Seconds in 3 days: 259200`.",
              hint: "3 × 24 × 3600.",
              solutionCode: c`#include <stdio.h>

#define HOURS_PER_DAY 24

int main(void)
{
    const int SECONDS_PER_HOUR = 3600;
    int days = 3;

    printf("Seconds in 3 days: %d\n", days * HOURS_PER_DAY * SECONDS_PER_HOUR);
    return 0;
}`,
              expectedOutput: "Seconds in 3 days: 259200",
            },
            {
              type: "exercise",
              id: "c04-ex-const-vs-define",
              kind: "concept",
              title: "const or #define?",
              prompt: "Give two differences between `const int MAX = 50;` and `#define MAX 50`.",
              hint: "Think about who processes each one, and whether it has a type.",
              solution: "1) `const` is handled by the compiler and has a type that is checked; `#define` is a text substitution done by the preprocessor and has no type. 2) `const` follows normal scope rules and exists as a named object (visible in a debugger); a `#define` is valid from its line to the end of the file regardless of blocks, and the name disappears before compilation.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c04-octal-mcq",
              prompt: "What is the decimal value of the C literal `017`?",
              options: [
                { id: "a", text: "17" },
                { id: "b", text: "15" },
                { id: "c", text: "23" },
                { id: "d", text: "It is a syntax error" },
              ],
              correct: "b",
              explanation: "A leading 0 means octal: 1×8 + 7 = 15.",
            },
            {
              type: "MCQ",
              slug: "c04-define-correct-mcq",
              prompt: "Which line correctly defines a symbolic constant `SIZE` equal to 20?",
              options: [
                { id: "a", text: "`#define SIZE = 20;`" },
                { id: "b", text: "`#define SIZE 20;`" },
                { id: "c", text: "`#define SIZE 20`" },
                { id: "d", text: "`define SIZE 20`" },
              ],
              correct: "c",
              explanation: "A `#define` has the form `#define NAME replacement` with no `=` and no semicolon.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c04-float-literal-default-tf",
              prompt: "In C, the literal `3.14` has type `double` unless it has an `f` suffix.",
              correct: true,
              explanation: "Unsuffixed floating-point literals are `double`; `3.14f` is a `float`.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c04-literals-output",
              prompt: "What does this program print?",
              code: c`#include <stdio.h>
#define BONUS 5

int main(void)
{
    const int BASE = 0x14;
    printf("%d\n", BASE + BONUS);
    printf("%c%c\n", 'H', 'i');
    return 0;
}`,
              expected: `25
Hi`,
              explanation: "0x14 = 1×16 + 4 = 20, plus 5 = 25. Then two characters are printed side by side.",
            },
          ],
        },
        {
          slug: "c-variable-scope-basics",
          title: "Scope: where a variable can be used",
          summary:
            "Learn block scope, the difference between local and global variables, what happens when names shadow each other, and why globals should be used sparingly.",
          estMinutes: 20,
          blocks: [
            {
              type: "objectives",
              items: [
                "Define scope and identify the scope of a given variable.",
                "Distinguish local (block-scope) variables from global (file-scope) variables.",
                "Predict the output of programs where an inner variable shadows an outer one.",
                "Explain why global variables should be used sparingly.",
              ],
            },
            {
              type: "markdown",
              md: `## Rooms and the hallway

Think of a program as a house. Each pair of braces \`{ }\` is a **room**. A variable declared inside a room is a **local** variable — it can be used only in that room (and in smaller rooms inside it). A variable declared outside every function is in the **hallway**: every room in the house can see it. That is a **global** variable.

The region of code where a name can be used is called its **scope**.`,
            },
            {
              type: "definition",
              term: "Scope",
              md: "The part of the program text in which a name (variable, function, etc.) is visible and can be used.",
            },
            {
              type: "definition",
              term: "Block",
              md: "A group of statements enclosed in braces `{ }`. A function body is a block, and blocks can be nested inside each other.",
            },
            {
              type: "definition",
              term: "Local variable (block scope)",
              md: "A variable declared inside a block. It is visible from its declaration to the closing `}` of that block. Ordinary local variables are created when execution enters the block and destroyed when it leaves.",
            },
            {
              type: "definition",
              term: "Global variable (file scope)",
              md: "A variable declared outside all functions. It is visible from its declaration to the end of the file, exists for the whole run of the program, and is automatically initialised to 0 if you don't give it a value.",
            },
            {
              type: "syntax",
              language: "c",
              code: c`int global_var = 0;        /* file scope: visible in every function below */

int main(void)
{                          /* --- block of main starts ---              */
    int local_var = 1;     /* block scope: visible until main's }       */
    {                      /* --- inner block starts ---                */
        int inner = 2;     /* visible only inside the inner block       */
    }                      /* --- inner ends: inner no longer exists --- */
    return 0;
}`,
            },
            {
              type: "code",
              language: "c",
              title: "Local and global variables",
              runnable: true,
              code: c`#include <stdio.h>

int visits = 0;          /* global */

void visit(void)
{
    int step = 10;       /* local to visit() */
    visits = visits + 1;
    printf("visit(): step = %d, visits = %d\n", step, visits);
}

int main(void)
{
    int step = 1;        /* local to main(), unrelated to visit's step */
    visit();
    visit();
    printf("main(): step = %d, visits = %d\n", step, visits);
    return 0;
}`,
              output: `visit(): step = 10, visits = 1
visit(): step = 10, visits = 2
main(): step = 1, visits = 2`,
              walkthrough: [
                { lines: "3", text: "`visits` is declared outside every function, so both `visit` and `main` can use it." },
                { lines: "5-10", text: "A small function (functions are covered in chapter 12). Its `step` exists only while `visit` runs and is re-created as 10 each time." },
                { lines: "8", text: "Updates the shared global counter." },
                { lines: "14", text: "`main` has its own variable also called `step`. Two locals in different functions can share a name without any conflict." },
                { lines: "15-16", text: "Calling `visit` twice increments the global to 2." },
                { lines: "17", text: "`main` still sees its own `step` (1) and the global `visits` (2)." },
              ],
            },
            {
              type: "heading",
              text: "Nested blocks and shadowing",
              level: 2,
            },
            {
              type: "markdown",
              md: "If an inner block declares a variable with the **same name** as an outer one, the inner variable *shadows* (hides) the outer one until the inner block ends. The outer variable is not changed — it is just temporarily out of sight.",
            },
            {
              type: "code",
              language: "c",
              title: "Shadowing in nested blocks",
              runnable: true,
              code: c`#include <stdio.h>

int x = 1;                       /* global x */

int main(void)
{
    printf("A: x = %d\n", x);    /* global x */
    int x = 2;                   /* local x shadows the global */
    printf("B: x = %d\n", x);
    {
        int x = 3;               /* inner x shadows main's x */
        int y = 100;
        printf("C: x = %d, y = %d\n", x, y);
    }
    printf("D: x = %d\n", x);    /* back to main's x; y is gone */
    return 0;
}`,
              output: `A: x = 1
B: x = 2
C: x = 3, y = 100
D: x = 2`,
              walkthrough: [
                { lines: "3", text: "A global `x` with value 1." },
                { lines: "7", text: "No local `x` has been declared yet, so this uses the global: prints 1." },
                { lines: "8", text: "From here to the end of `main`, the name `x` refers to this local variable (2). The global still exists but is hidden." },
                { lines: "10-14", text: "An inner block. Its own `x` (3) hides `main`'s `x`. `y` exists only inside these braces." },
                { lines: "15", text: "After the inner block, its `x` and `y` are destroyed. `x` means `main`'s `x` again: 2. Using `y` here would be a compile error." },
              ],
            },
            {
              type: "callout",
              variant: "warning",
              title: "Shadowing is legal but confusing",
              md: "Reusing a name in an inner block is a frequent source of bugs: you think you are updating the outer variable but you are actually updating a new one. GCC's `-Wshadow` option warns about it. Prefer distinct names.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: "When the compiler meets a name, it searches for its declaration starting in the **innermost** enclosing block and moving outwards, finally checking file scope. The first match wins — that is shadowing. Local variables are typically stored on the *stack*: space is reserved when a block or function starts and released when it ends, which is why a local's value does not survive between calls. Globals live in a separate memory area for the entire run, which is why they keep their values and are zero-initialised.",
            },
            {
              type: "heading",
              text: "Real-world use",
              level: 3,
            },
            {
              type: "markdown",
              md: "Well-written programs keep variables in the **smallest scope possible**: a loop counter lives inside the loop, a temporary lives inside the block that needs it. This makes code easier to reason about, because fewer lines can change each variable. Globals are reserved for genuinely program-wide state — for example a configuration flag such as `verbose_mode`, or a hardware status register in embedded code. Large codebases use globals sparingly because any function can modify them, which makes bugs hard to trace.",
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Using a variable outside its block",
                  wrong: c`int main(void)
{
    {
        int result = 42;
    }
    printf("%d\n", result);   /* error: result undeclared */
    return 0;
}`,
                  right: c`int main(void)
{
    int result;
    {
        result = 42;
    }
    printf("%d\n", result);
    return 0;
}`,
                  md: "A variable exists only inside the block where it is declared. Declare it in the outer block if you need it there.",
                },
                {
                  title: "Accidentally shadowing instead of updating",
                  wrong: c`int total = 0;
{
    int total = 50;   /* new variable! */
}
printf("%d\n", total);   /* prints 0 */`,
                  right: c`int total = 0;
{
    total = 50;       /* updates the outer variable */
}
printf("%d\n", total);   /* prints 50 */`,
                  md: "Writing the type again (`int total`) declares a **new** variable. To change the existing one, just assign to it.",
                },
                {
                  title: "Assuming a local keeps its value between calls",
                  wrong: c`void count_calls(void)
{
    int calls = 0;
    calls = calls + 1;
    printf("%d\n", calls);   /* always prints 1 */
}`,
                  right: c`int calls = 0;   /* global: survives between calls */

void count_calls(void)
{
    calls = calls + 1;
    printf("%d\n", calls);   /* 1, 2, 3, ... */
}`,
                  md: "An ordinary local is re-created (and re-initialised) every time the function runs. Use a global — or, better, a `static` local (chapter 19) — if the value must persist.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "Scope = region of code where a name is visible.",
                "Local (block-scope) variables are visible from declaration to the end of their block.",
                "Global (file-scope) variables are declared outside all functions, visible to all functions after the declaration, and default to 0.",
                "Uninitialised **local** variables contain garbage; uninitialised **globals** are 0.",
                "An inner declaration with the same name shadows the outer one until the inner block ends.",
                "Variables in different functions may share a name without conflict.",
              ],
            },
            {
              type: "recap",
              items: [
                "Braces create blocks; blocks create scopes.",
                "Locals live and die with their block; globals live for the whole program.",
                "The innermost declaration of a name wins.",
                "Keep variables in the smallest scope that works.",
              ],
            },
            {
              type: "exercise",
              id: "c04-ex-predict-scope",
              kind: "predict",
              title: "Who is n?",
              prompt: "Predict the output.",
              starterCode: c`#include <stdio.h>

int n = 5;

int main(void)
{
    printf("%d\n", n);
    n = n + 1;
    {
        int n = 50;
        n = n + 1;
        printf("%d\n", n);
    }
    printf("%d\n", n);
    return 0;
}`,
              hint: "Line `n = n + 1;` before the inner block changes the global; the inner block has its own `n`.",
              solution: "The global n is 5, then becomes 6. The inner n starts at 50 and becomes 51. After the block, n refers to the global again: 6.",
              solutionCode: c`#include <stdio.h>

int n = 5;

int main(void)
{
    printf("%d\n", n);
    n = n + 1;
    {
        int n = 50;
        n = n + 1;
        printf("%d\n", n);
    }
    printf("%d\n", n);
    return 0;
}`,
              expectedOutput: `5
51
6`,
            },
            {
              type: "exercise",
              id: "c04-ex-fix-scope",
              kind: "debug",
              title: "Out of scope",
              prompt: "This program does not compile. Fix it so it prints `Discounted price: 80` without removing the inner block.",
              starterCode: c`#include <stdio.h>

int main(void)
{
    int price = 100;
    {
        int discounted = price - 20;
    }
    printf("Discounted price: %d\n", discounted);
    return 0;
}`,
              hint: "Where must `discounted` be declared for the `printf` to see it?",
              solution: "`discounted` is declared inside the inner block, so it does not exist at the `printf`. Declare it before the block and only assign inside.",
              solutionCode: c`#include <stdio.h>

int main(void)
{
    int price = 100;
    int discounted;
    {
        discounted = price - 20;
    }
    printf("Discounted price: %d\n", discounted);
    return 0;
}`,
              expectedOutput: "Discounted price: 80",
            },
            {
              type: "exercise",
              id: "c04-ex-global-default",
              kind: "concept",
              title: "Default values",
              prompt: "A program has `int g;` outside all functions and `int k;` inside `main`. Neither is initialised. What value does each have when `main` starts, and why?",
              hint: "Globals and locals are stored differently.",
              solution: "`g` is a global with static storage duration, so it is automatically initialised to 0. `k` is an ordinary local variable; its value is indeterminate (garbage), and reading it before assigning is undefined behaviour.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c04-scope-def-mcq",
              prompt: "A variable declared inside a pair of braces in `main` can be used...",
              options: [
                { id: "a", text: "anywhere in the program" },
                { id: "b", text: "anywhere in `main`, even before its declaration" },
                { id: "c", text: "from its declaration to the closing brace of that block" },
                { id: "d", text: "only on the line where it is declared" },
              ],
              correct: "c",
              explanation: "Block scope runs from the point of declaration to the end of the enclosing block.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c04-global-zero-tf",
              prompt: "An uninitialised global `int` variable starts with the value 0.",
              correct: true,
              explanation: "Objects with static storage duration (including globals) are zero-initialised if no initialiser is given.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c04-shadow-output",
              prompt: "What does this program print?",
              code: c`#include <stdio.h>

int main(void)
{
    int a = 10;
    {
        int a = 20;
        a = a + 5;
        printf("%d ", a);
    }
    a = a + 1;
    printf("%d\n", a);
    return 0;
}`,
              expected: "25 11",
              explanation: "The inner `a` (20 → 25) is a separate variable. The outer `a` is unaffected by it, so it goes from 10 to 11.",
            },
            {
              type: "FILL_BLANK",
              slug: "c04-shadow-term-fill",
              prompt: "When an inner block declares a variable with the same name as an outer variable, the inner one is said to ___ the outer one.",
              accepted: [["shadow", "hide", "mask", "shadows", "hides"]],
              explanation: "The inner declaration shadows (hides) the outer one until the inner block ends.",
            },
            {
              type: "CODE_WRITING",
              slug: "c04-time-convert-code",
              prompt: "Write a program that reads a whole number of hours and prints the equivalent minutes and seconds in exactly this format:\n\n```\nH hours = M minutes = S seconds\n```\n\nUse named constants (`const int` or `#define`) for 60 minutes per hour and 60 seconds per minute.\n\nFor input `2` the output is `2 hours = 120 minutes = 7200 seconds`.",
              starterCode: c`#include <stdio.h>

int main(void)
{
    int hours;
    scanf("%d", &hours);
    /* your code here */
    return 0;
}`,
              sampleTests: [{ stdin: "2", expected: "2 hours = 120 minutes = 7200 seconds" }],
              hiddenTests: [
                { stdin: "0", expected: "0 hours = 0 minutes = 0 seconds" },
                { stdin: "1", expected: "1 hours = 60 minutes = 3600 seconds" },
                { stdin: "24", expected: "24 hours = 1440 minutes = 86400 seconds" },
              ],
              solutionCode: c`#include <stdio.h>

#define MINUTES_PER_HOUR 60

int main(void)
{
    const int SECONDS_PER_MINUTE = 60;
    int hours;
    scanf("%d", &hours);

    int minutes = hours * MINUTES_PER_HOUR;
    int seconds = minutes * SECONDS_PER_MINUTE;
    printf("%d hours = %d minutes = %d seconds\n", hours, minutes, seconds);
    return 0;
}`,
              explanation: "Minutes = hours × 60 and seconds = minutes × 60. Named constants make the conversion factors obvious.",
            },
          ],
        },
      ],
    },
  ],
};

export default chapter;
