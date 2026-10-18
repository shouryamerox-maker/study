import type { ChapterContent } from "../../../src/lib/content/schema";

const chapter: ChapterContent = {
  slug: "preprocessor",
  title: "The C Preprocessor",
  summary:
    "The text-processing step that runs before compilation: #include, #define constants and macros, macro pitfalls, conditional compilation, header files with include guards, and predefined macros.",
  topics: [
    {
      slug: "macros",
      title: "#include and #define",
      lessons: [
        {
          slug: "preprocessor-include-define",
          title: "What the preprocessor does: #include and #define",
          summary:
            "How the preprocessor transforms source text before compilation, the two forms of #include, symbolic constants with #define, and the built-in predefined macros.",
          estMinutes: 25,
          blocks: [
            {
              type: "objectives",
              items: [
                "Describe where the preprocessor fits in the build process",
                "Explain the difference between #include <file> and #include \"file\"",
                "Create symbolic constants with #define and explain why they help",
                "Use predefined macros such as __LINE__, __FILE__ and __func__",
              ],
            },
            {
              type: "markdown",
              md: `Since your very first program you have typed \`#include <stdio.h>\` without thinking much about it. Lines that start with \`#\` are not C statements at all. They are instructions to the **preprocessor**, a program that edits your source code *before* the compiler sees it.

Imagine you are sending a letter that says "insert the standard greeting here" and "replace every TEAM_NAME with 'The Rockets'". An assistant goes through the letter, carries out those instructions, and hands the finished text to the person who will actually read it. The preprocessor is that assistant; the compiler only ever sees the finished text.

Building a C program happens in stages:

1. **Preprocessing**: handle every \`#\` directive, remove comments, expand macros.
2. **Compiling**: translate the resulting C into machine code (an object file).
3. **Linking**: combine object files and libraries into an executable.

You can see the preprocessor's output yourself with \`gcc -E program.c\`.`,
            },
            {
              type: "definition",
              term: "Preprocessor directive",
              md: "A line beginning with `#` (such as `#include`, `#define`, `#if`) that instructs the preprocessor. Directives end at the end of the line (no semicolon) unless the line is continued with a backslash.",
            },
            {
              type: "definition",
              term: "Macro",
              md: "A name defined with `#define` that the preprocessor replaces with its replacement text wherever it appears in the code (except inside string literals and comments). This replacement is called **macro expansion**.",
            },
            {
              type: "definition",
              term: "Header file",
              md: "A file (usually ending in `.h`) containing declarations, macros and type definitions meant to be shared by several source files through `#include`.",
            },
            { type: "heading", text: "#include: pasting in another file", level: 2 },
            {
              type: "syntax",
              language: "c",
              code: `#include <header.h>     /* search the system/standard include directories */
#include "myheader.h"   /* search the current file's directory first, then the system ones */`,
              md: "`#include` literally replaces itself with the entire contents of the named file. Use angle brackets for standard and library headers and quotes for your own headers.",
            },
            {
              type: "table",
              caption: "Common standard headers",
              headers: ["Header", "Provides"],
              rows: [
                ["<stdio.h>", "printf, scanf, FILE, fopen, EOF"],
                ["<stdlib.h>", "malloc, free, exit, atoi, rand, qsort"],
                ["<string.h>", "strlen, strcpy, strcmp, memcpy"],
                ["<math.h>", "sqrt, pow, sin, fabs"],
                ["<ctype.h>", "isdigit, isalpha, toupper"],
                ["<limits.h>", "INT_MAX, INT_MIN, CHAR_BIT"],
              ],
            },
            { type: "heading", text: "#define: symbolic constants", level: 2 },
            {
              type: "syntax",
              language: "c",
              code: `#define NAME replacement_text

#define PI          3.14159
#define MAX_SIZE    100
#define GREETING    "Hello"`,
              md: "By convention macro names are written in UPPER_CASE so they stand out. There is no `=` and no semicolon: everything after the name, to the end of the line, is the replacement text.",
            },
            {
              type: "code",
              language: "c",
              title: "Symbolic constants in action",
              runnable: true,
              code: `#include <stdio.h>

#define PI 3.14159
#define MAX_STUDENTS 5
#define GREETING "Welcome to C!"

int main(void) {
    double r = 2.0;
    int marks[MAX_STUDENTS] = {70, 82, 64, 91, 55};
    int i, best = marks[0];

    printf("%s\\n", GREETING);
    printf("Area of circle: %.2f\\n", PI * r * r);
    for (i = 1; i < MAX_STUDENTS; i++) {
        if (marks[i] > best) best = marks[i];
    }
    printf("Best of %d marks: %d\\n", MAX_STUDENTS, best);
    return 0;
}`,
              output: `Welcome to C!
Area of circle: 12.57
Best of 5 marks: 91`,
              walkthrough: [
                { lines: "3-5", text: "Three macros. Before compiling, every `PI` becomes `3.14159`, every `MAX_STUDENTS` becomes `5`, and `GREETING` becomes the string literal." },
                { lines: "9", text: "After preprocessing this reads `int marks[5] = ...`. Because the macro is a true constant, it can size an array." },
                { lines: "13", text: "`PI * r * r` becomes `3.14159 * r * r` = 12.566..., printed as 12.57." },
                { lines: "14", text: "If the class grows, change `MAX_STUDENTS` in one place and the array size, the loop and the message all update together." },
              ],
            },
            {
              type: "callout",
              variant: "tip",
              title: "#define vs const",
              md: "`const double pi = 3.14159;` is a real variable with a type that the compiler checks and a debugger can show. `#define` is plain text substitution with no type. Many style guides prefer `const` (or `enum`) for typed constants, and keep `#define` for things only the preprocessor can do, such as conditional compilation.",
            },
            { type: "heading", text: "Predefined macros", level: 2 },
            {
              type: "table",
              caption: "Macros every standard compiler defines",
              headers: ["Macro", "Expands to"],
              rows: [
                ["__LINE__", "The current line number (an int)"],
                ["__FILE__", "The current source file name (a string)"],
                ["__DATE__", "Compilation date, e.g. \"Oct 18 2026\""],
                ["__TIME__", "Compilation time, e.g. \"14:05:09\""],
                ["__STDC__", "1 if the compiler conforms to Standard C"],
                ["__STDC_VERSION__", "The standard version, e.g. 199901L (C99), 201112L (C11), 201710L (C17)"],
                ["__func__", "(C99, technically not a macro) the current function's name as a string"],
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Where am I?",
              runnable: true,
              code: `#include <stdio.h>

void report(void) {
    printf("Inside %s, line %d\\n", __func__, __LINE__);
}

int main(void) {
    printf("Inside %s, line %d\\n", __func__, __LINE__);
    report();
#ifdef __STDC__
    printf("This compiler conforms to Standard C\\n");
#endif
    return 0;
}`,
              output: `Inside main, line 8
Inside report, line 4
This compiler conforms to Standard C`,
              walkthrough: [
                { lines: "4", text: "`__LINE__` becomes the number 4 because this text is on line 4. `__func__` is the string \"report\"." },
                { lines: "8", text: "The same line in `main` reports line 8 and function \"main\"." },
                { lines: "10-12", text: "A first taste of conditional compilation: the printf is only compiled if `__STDC__` is defined." },
              ],
            },
            {
              type: "markdown",
              md: `\`__FILE__\`, \`__DATE__\` and \`__TIME__\` are also useful, but their values depend on where and when you compile, so try them yourself: \`printf("%s compiled %s %s\\n", __FILE__, __DATE__, __TIME__);\`. They are commonly used in error messages and version banners.`,
            },
            { type: "heading", text: "Why it works", level: 2 },
            {
              type: "markdown",
              md: `The preprocessor does not understand C. It works on **tokens** (words, numbers, symbols) and simply replaces text. When it sees \`#include <stdio.h>\` it finds that file and splices its text in. When it sees a macro name, it substitutes the replacement text. The compiler then receives one long file in which no \`#\` directives or macro names remain. That is why \`MAX_STUDENTS\` can size an array (the compiler sees the literal \`5\`), and also why macros have no type, no scope and no address: by the time the compiler runs, they no longer exist.`,
            },
            { type: "heading", text: "Real-world uses", level: 2 },
            {
              type: "markdown",
              md: `- **Configuration constants**: buffer sizes, limits, version numbers (\`#define VERSION "2.1.0"\`).
- **Standard library constants** are macros: \`EOF\`, \`NULL\`, \`INT_MAX\`, \`RAND_MAX\`, \`SEEK_SET\`.
- **Assertions and logging**: \`assert(x > 0)\` from \`<assert.h>\` is a macro that uses \`__FILE__\` and \`__LINE__\` to tell you exactly where a check failed.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Putting a semicolon at the end of a #define",
                  wrong: `#define SIZE 10;
int a[SIZE];          /* becomes int a[10;]; : error */`,
                  right: `#define SIZE 10
int a[SIZE];`,
                  md: "The semicolon becomes part of the replacement text and lands wherever the macro is used.",
                },
                {
                  title: "Using = in a #define",
                  wrong: `#define RATE = 5
total = price * RATE;   /* price * = 5 : error */`,
                  right: `#define RATE 5`,
                  md: "#define is not an assignment. Everything after the name is copied, including the `=`.",
                },
                {
                  title: "Expecting macros to work inside strings",
                  wrong: `#define NAME "Ada"
printf("Hello NAME\\n");   /* prints Hello NAME */`,
                  right: `printf("Hello %s\\n", NAME);`,
                  md: "The preprocessor never replaces text inside string literals.",
                },
                {
                  title: "Using quotes for standard headers (or brackets for your own)",
                  wrong: `#include <myutils.h>   /* not found: only system dirs searched */`,
                  right: `#include "myutils.h"`,
                  md: "Use `\"...\"` for your project's headers so the current directory is searched first.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "The preprocessor runs before the compiler; directives start with # and do not end with a semicolon.",
                "#include <...> searches system directories; #include \"...\" searches the current directory first.",
                "#define NAME text performs textual substitution; macros have no type and no scope.",
                "Macro names are not replaced inside string literals or comments.",
                "__LINE__, __FILE__, __DATE__, __TIME__ and __STDC__ are predefined macros.",
                "gcc -E shows the output of the preprocessor.",
              ],
            },
            {
              type: "recap",
              items: [
                "Preprocessing → compiling → linking.",
                "#include pastes a file's contents into yours.",
                "#define creates text replacements, typically for constants.",
                "Predefined macros report line, file, date and standard version.",
              ],
            },
            {
              type: "exercise",
              id: "c22-ex-define-constants",
              kind: "write",
              title: "Constants for a shop",
              prompt: "Define macros `TAX_RATE` (0.15), `ITEMS` (3) and `SHOP` (\"Corner Store\"). Store the prices 4.00, 2.50 and 3.50 in an array of size ITEMS, compute the subtotal and the total including tax, and print:\n\n```\nCorner Store\nSubtotal: 10.00\nTotal: 11.50\n```",
              hint: "Total = subtotal * (1 + TAX_RATE). Print with %.2f.",
              solution: "Define the three macros and use them for the array size, the loop bound and the calculation.",
              solutionCode: `#include <stdio.h>

#define TAX_RATE 0.15
#define ITEMS 3
#define SHOP "Corner Store"

int main(void) {
    double prices[ITEMS] = {4.00, 2.50, 3.50};
    double subtotal = 0.0;
    int i;
    for (i = 0; i < ITEMS; i++) {
        subtotal += prices[i];
    }
    printf("%s\\n", SHOP);
    printf("Subtotal: %.2f\\n", subtotal);
    printf("Total: %.2f\\n", subtotal * (1 + TAX_RATE));
    return 0;
}`,
              expectedOutput: "Corner Store\nSubtotal: 10.00\nTotal: 11.50",
            },
            {
              type: "exercise",
              id: "c22-ex-fix-define",
              kind: "debug",
              title: "Fix the broken constants",
              prompt: "This program does not compile. Fix the macro definitions so that it prints `Capacity: 40`.",
              starterCode: `#include <stdio.h>

#define ROWS = 5;
#define COLS 8;

int main(void) {
    printf("Capacity: %d\\n", ROWS * COLS);
    return 0;
}`,
              hint: "Expand the macros by hand inside the printf call.",
              solution: "Remove the `=` and both semicolons: `#define ROWS 5` and `#define COLS 8`.",
              solutionCode: `#include <stdio.h>

#define ROWS 5
#define COLS 8

int main(void) {
    printf("Capacity: %d\\n", ROWS * COLS);
    return 0;
}`,
              expectedOutput: "Capacity: 40",
            },
            {
              type: "exercise",
              id: "c22-ex-include-concept",
              kind: "concept",
              title: "Angle brackets or quotes?",
              prompt: "Explain what `#include` actually does to your source file, and say which form you would use for (a) `math.h`, (b) a header `grades.h` you wrote for your project.",
              hint: "Think 'copy and paste'.",
              solution: "#include replaces the directive line with the full text of the named file before compilation. (a) `#include <math.h>` because it is a standard header in the system include directories. (b) `#include \"grades.h\"` so the preprocessor looks in your project directory first.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c22-define-mcq-1",
              prompt: "Given `#define SIZE 10;`, what happens with `int a[SIZE];`?",
              options: [
                { id: "a", text: "An array of 10 ints is created" },
                { id: "b", text: "A compile error, because the code becomes int a[10;];" },
                { id: "c", text: "A run-time error" },
                { id: "d", text: "The preprocessor removes the semicolon automatically" },
              ],
              correct: "b",
              explanation: "The semicolon is part of the replacement text.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c22-string-tf-1",
              prompt: "The preprocessor replaces macro names that appear inside string literals.",
              correct: false,
              explanation: "Text inside string literals and comments is never macro-expanded.",
            },
            {
              type: "FILL_BLANK",
              slug: "c22-line-fill-1",
              prompt: "The predefined macro ___ expands to the current line number of the source file.",
              accepted: [["__LINE__"]],
              caseSensitive: true,
              explanation: "__LINE__ is an integer constant; __FILE__ is the file name.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c22-define-output-1",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

#define WIDTH 4
#define HEIGHT 3
#define LABEL "Area"

int main(void) {
    printf("%s: %d\\n", LABEL, WIDTH * HEIGHT);
    printf("WIDTH\\n");
    return 0;
}`,
              expected: "Area: 12\nWIDTH",
              explanation: "Macros are expanded in code but not inside the string literal \"WIDTH\\n\".",
            },
          ],
        },
        {
          slug: "function-like-macros-pitfalls",
          title: "Function-like macros and their pitfalls",
          summary:
            "Macros with parameters, why every parameter and the whole body need parentheses, side-effect traps, the # and ## operators, multi-line macros and #undef.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Write function-like macros with parameters",
                "Parenthesise macro parameters and bodies to avoid precedence bugs",
                "Explain why arguments with side effects are dangerous in macros",
                "Use the # (stringize) and ## (token-pasting) operators and multi-line macros",
              ],
            },
            {
              type: "markdown",
              md: `A macro can take parameters, so it looks like a function call: \`SQUARE(5)\`. But it is **not** a function. A function evaluates its arguments once and then runs; a macro just copies the argument **text** into its body. That makes macros fast (no call overhead) and type-generic (\`SQUARE\` works for int and double), but it also creates some famous traps.

The analogy: a function is a chef who receives ingredients that are already measured. A macro is a recipe card where you write the ingredient's *description* into every blank. If you write "2 + 3 eggs" into "beat ___ × ___", the person following the card may do something you did not intend.`,
            },
            {
              type: "definition",
              term: "Function-like macro",
              md: "A macro defined with a parameter list immediately after its name, e.g. `#define SQUARE(x) ((x) * (x))`. There must be no space between the name and the `(`.",
            },
            {
              type: "definition",
              term: "Side effect",
              md: "Any change an expression makes besides producing a value, such as `i++`, assignment, or calling a function that prints. Macro arguments with side effects may be evaluated more than once.",
            },
            {
              type: "syntax",
              language: "c",
              code: `#define NAME(param1, param2) replacement_using_params

#define SQUARE(x)   ((x) * (x))
#define MAX(a, b)   ((a) > (b) ? (a) : (b))

/* continue a long macro over several lines with a backslash */
#define LONG_MACRO(x) do {   \\
        statement1;          \\
        statement2;          \\
    } while (0)`,
              md: "Rule of thumb: wrap **each parameter** in parentheses and wrap **the whole body** in parentheses.",
            },
            {
              type: "code",
              language: "c",
              title: "Why the parentheses matter",
              runnable: true,
              code: `#include <stdio.h>

#define SQUARE_BAD(x)  x * x
#define SQUARE(x)      ((x) * (x))
#define DOUBLE_BAD(x)  (x) + (x)
#define DOUBLE(x)      ((x) + (x))

int main(void) {
    printf("SQUARE_BAD(2 + 3) = %d\\n", SQUARE_BAD(2 + 3));
    printf("SQUARE(2 + 3)     = %d\\n", SQUARE(2 + 3));
    printf("10 * DOUBLE_BAD(4) = %d\\n", 10 * DOUBLE_BAD(4));
    printf("10 * DOUBLE(4)     = %d\\n", 10 * DOUBLE(4));
    return 0;
}`,
              output: `SQUARE_BAD(2 + 3) = 11
SQUARE(2 + 3)     = 25
10 * DOUBLE_BAD(4) = 44
10 * DOUBLE(4)     = 80`,
              walkthrough: [
                { lines: "3", text: "No parentheses around the parameter." },
                { lines: "9", text: "`SQUARE_BAD(2 + 3)` becomes `2 + 3 * 2 + 3`. Multiplication first: 2 + 6 + 3 = 11, not 25." },
                { lines: "10", text: "`SQUARE(2 + 3)` becomes `((2 + 3) * (2 + 3))` = 25." },
                { lines: "11", text: "`10 * DOUBLE_BAD(4)` becomes `10 * (4) + (4)` = 44, because the body has no outer parentheses." },
                { lines: "12", text: "`10 * ((4) + (4))` = 80. Both kinds of parentheses are needed." },
              ],
            },
            {
              type: "callout",
              variant: "exam",
              title: "Expand by hand",
              md: "In exams, macro questions are solved by literally rewriting the code with the replacement text, then applying normal precedence. Do not 'evaluate' the argument first: that is what a function would do, not a macro.",
            },
            { type: "heading", text: "Side effects: arguments evaluated twice", level: 2 },
            {
              type: "code",
              language: "c",
              title: "Macro vs function with i++",
              runnable: true,
              code: `#include <stdio.h>

#define MAX(a, b) ((a) > (b) ? (a) : (b))

int maxFn(int a, int b) {
    return a > b ? a : b;
}

int main(void) {
    int i = 5, j = 3, m;
    m = MAX(i++, j);
    printf("macro:    m = %d, i = %d\\n", m, i);
    i = 5;
    m = maxFn(i++, j);
    printf("function: m = %d, i = %d\\n", m, i);
    return 0;
}`,
              output: `macro:    m = 6, i = 7
function: m = 5, i = 6`,
              walkthrough: [
                { lines: "11", text: "Expands to `((i++) > (j) ? (i++) : (j))`. The test uses i (5) and increments it to 6; because 5 > 3, the second `i++` is evaluated too, yielding 6 and leaving i at 7." },
                { lines: "14", text: "The function receives the value 5 once; `i` is incremented exactly once, to 6." },
                { lines: "12, 15", text: "Same-looking calls, different results. Never pass expressions with side effects to a macro." },
              ],
            },
            {
              type: "callout",
              variant: "warning",
              title: "Sometimes it is undefined behaviour",
              md: "With `#define SQUARE(x) ((x) * (x))`, the call `SQUARE(i++)` becomes `((i++) * (i++))`, which modifies `i` twice without a sequence point: undefined behaviour, so there is no 'correct' output. The MAX example above is well-defined only because `?:` has a sequence point after its condition.",
            },
            { type: "heading", text: "Stringizing (#), token pasting (##) and multi-line macros", level: 2 },
            {
              type: "table",
              headers: ["Operator", "Effect", "Example", "Result"],
              rows: [
                ["#param", "Turns the argument text into a string literal", "#define STR(x) #x  then STR(a+b)", "\"a+b\""],
                ["a ## b", "Glues two tokens into one", "#define VAR(n) value##n  then VAR(3)", "value3"],
                ["\\ at line end", "Continues the macro on the next line", "#define M(x) do { \\ ... } while (0)", "One logical line"],
              ],
            },
            {
              type: "code",
              language: "c",
              title: "A debugging SHOW macro and a safe SWAP",
              runnable: true,
              code: `#include <stdio.h>

#define MAX(a, b)   ((a) > (b) ? (a) : (b))
#define SHOW(expr)  printf(#expr " = %d\\n", (expr))
#define SWAP_INT(a, b) do { \\
        int tmp_ = (a);     \\
        (a) = (b);          \\
        (b) = tmp_;         \\
    } while (0)

int main(void) {
    int x = 7, y = 12;
    SHOW(MAX(x, y));
    SHOW(x * 2 + 1);
    SWAP_INT(x, y);
    printf("after swap: x = %d, y = %d\\n", x, y);
    return 0;
}`,
              output: `MAX(x, y) = 12
x * 2 + 1 = 15
after swap: x = 12, y = 7`,
              walkthrough: [
                { lines: "4", text: "`#expr` turns the argument's source text into a string. Adjacent string literals are joined, so the format becomes e.g. `\"x * 2 + 1\" \" = %d\\n\"`." },
                { lines: "5-9", text: "A multi-line macro: each line except the last ends with a backslash. Wrapping the body in `do { ... } while (0)` makes the macro behave like a single statement, so it works correctly after an `if` without braces." },
                { lines: "13", text: "The argument is stringized exactly as written (`MAX(x, y)`), while the value is computed from the expanded macro: 12." },
                { lines: "15", text: "A macro can modify its arguments because it pastes the variable names directly into the code, something a function could only do via pointers." },
              ],
            },
            {
              type: "markdown",
              md: `**#undef NAME** removes a macro definition so the name can be redefined or used normally afterwards. Defining the same macro twice with different text is an error (or warning) unless you \`#undef\` it in between.`,
            },
            { type: "heading", text: "Why it works", level: 2 },
            {
              type: "markdown",
              md: `During expansion, the preprocessor replaces each parameter in the body with the **exact tokens** of the corresponding argument, then rescans the result for further macros. It does no arithmetic and knows nothing about precedence. Parentheses in the macro body are just more tokens that it copies, but they force the compiler to group things correctly afterwards. The same text-copying explains double evaluation: if the parameter appears twice in the body, the argument's text, including \`i++\`, appears twice in the final code.`,
            },
            {
              type: "table",
              caption: "Macro or function?",
              headers: ["", "Function-like macro", "Function (or inline function)"],
              rows: [
                ["Type checking", "None", "Yes"],
                ["Argument evaluation", "Possibly several times", "Exactly once"],
                ["Works for any type", "Yes", "No (one type per function)"],
                ["Call overhead", "None", "Small (none if inlined)"],
                ["Debugging", "Hard (gone after preprocessing)", "Easy"],
              ],
            },
            { type: "heading", text: "Real-world uses", level: 2 },
            {
              type: "markdown",
              md: `- \`<ctype.h>\` functions like \`isdigit\` and \`getc\` are often implemented as macros for speed.
- Generic helpers: \`MIN\`, \`MAX\`, \`ARRAY_LEN(a)\` (\`(sizeof(a) / sizeof((a)[0]))\`).
- Logging and test frameworks use \`#\` to print the expression that failed, as \`assert\` does.
- In modern C, \`static inline\` functions replace many function-like macros because they are type-safe and evaluate arguments once.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Missing parentheses around parameters",
                  wrong: `#define AREA(w, h) w * h
AREA(2 + 1, 4)       /* 2 + 1 * 4 = 6 */`,
                  right: `#define AREA(w, h) ((w) * (h))
AREA(2 + 1, 4)       /* 12 */`,
                  md: "Wrap every use of a parameter in parentheses.",
                },
                {
                  title: "A space between the macro name and (",
                  wrong: `#define SQUARE (x) ((x) * (x))
/* SQUARE becomes "(x) ((x) * (x))" : an object-like macro! */`,
                  right: `#define SQUARE(x) ((x) * (x))`,
                  md: "With a space, the preprocessor treats `(x) ((x) * (x))` as the replacement text of a parameterless macro.",
                },
                {
                  title: "Passing arguments with side effects",
                  wrong: `int big = MAX(n++, limit);   /* n may be incremented twice */`,
                  right: `int big = MAX(n, limit);
n++;`,
                  md: "Keep macro arguments free of `++`, `--`, assignments and function calls with side effects.",
                },
                {
                  title: "Multi-statement macro without do-while(0)",
                  wrong: `#define RESET(a, b) a = 0; b = 0
if (done) RESET(x, y);       /* b = 0 always runs! */`,
                  right: `#define RESET(a, b) do { (a) = 0; (b) = 0; } while (0)
if (done) RESET(x, y);`,
                  md: "Only the first statement would belong to the `if`. The do-while(0) wrapper turns the body into one statement.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "Function-like macros substitute argument text; they do not evaluate arguments first.",
                "Parenthesise each parameter and the entire macro body.",
                "There must be no space between a function-like macro's name and its opening parenthesis.",
                "Macro arguments with side effects (i++) may be evaluated more than once, sometimes causing undefined behaviour.",
                "# turns an argument into a string literal; ## joins two tokens; a trailing backslash continues a macro onto the next line.",
              ],
            },
            {
              type: "recap",
              items: [
                "Macros copy text; expand them by hand to understand them.",
                "Parentheses everywhere: around parameters and around the body.",
                "Avoid side effects in macro arguments.",
                "Prefer functions (or static inline) when type safety matters.",
              ],
            },
            {
              type: "exercise",
              id: "c22-ex-macro-predict",
              kind: "predict",
              title: "Expand by hand",
              prompt: "Predict each printed value by expanding the macros manually.",
              starterCode: `#include <stdio.h>

#define TRIPLE(x) x + x + x
#define HALF(x) ((x) / 2)

int main(void) {
    printf("%d\\n", 2 * TRIPLE(3));
    printf("%d\\n", HALF(7 + 3));
    printf("%d\\n", TRIPLE(1 + 1));
    return 0;
}`,
              hint: "2 * TRIPLE(3) becomes 2 * 3 + 3 + 3.",
              solution: "2 * 3 + 3 + 3 = 12 (not 18). HALF(7 + 3) = ((7 + 3) / 2) = 5. TRIPLE(1 + 1) = 1 + 1 + 1 + 1 + 1 + 1 = 6 (correct by luck, since addition is associative).",
              solutionCode: `#include <stdio.h>

#define TRIPLE(x) x + x + x
#define HALF(x) ((x) / 2)

int main(void) {
    printf("%d\\n", 2 * TRIPLE(3));
    printf("%d\\n", HALF(7 + 3));
    printf("%d\\n", TRIPLE(1 + 1));
    return 0;
}`,
              expectedOutput: "12\n5\n6",
            },
            {
              type: "exercise",
              id: "c22-ex-fix-cube",
              kind: "debug",
              title: "Fix the CUBE macro",
              prompt: "`CUBE(1 + 1)` should be 8 and `100 / CUBE(2)` should be 12, but this prints `4` and `400`. Fix the macro.",
              starterCode: `#include <stdio.h>

#define CUBE(x) x * x * x

int main(void) {
    printf("%d\\n", CUBE(1 + 1));
    printf("%d\\n", 100 / CUBE(2));
    return 0;
}`,
              hint: "Expand both calls. Which parentheses are missing?",
              solution: "`CUBE(1 + 1)` became `1 + 1 * 1 + 1 * 1 + 1` = 4 and `100 / CUBE(2)` became `100 / 2 * 2 * 2` = 400. Use `#define CUBE(x) ((x) * (x) * (x))`.",
              solutionCode: `#include <stdio.h>

#define CUBE(x) ((x) * (x) * (x))

int main(void) {
    printf("%d\\n", CUBE(1 + 1));
    printf("%d\\n", 100 / CUBE(2));
    return 0;
}`,
              expectedOutput: "8\n12",
            },
            {
              type: "exercise",
              id: "c22-ex-array-len",
              kind: "write",
              title: "An ARRAY_LEN macro",
              prompt: "Write a macro `ARRAY_LEN(a)` that gives the number of elements of an array, and a `PRINT_INT(v)` macro using `#` that prints `name = value`. Use them to print the length of `int scores[] = {9, 4, 7, 1, 8};` and the variable `total`, which holds the sum of its elements.",
              hint: "sizeof(a) / sizeof((a)[0]). Cast to int before printing.",
              solution: "ARRAY_LEN only works on real arrays, not on pointers (inside a function receiving an array parameter it would give the wrong answer).",
              solutionCode: `#include <stdio.h>

#define ARRAY_LEN(a) ((int)(sizeof(a) / sizeof((a)[0])))
#define PRINT_INT(v) printf(#v " = %d\\n", (v))

int main(void) {
    int scores[] = {9, 4, 7, 1, 8};
    int i, total = 0;
    for (i = 0; i < ARRAY_LEN(scores); i++) {
        total += scores[i];
    }
    PRINT_INT(ARRAY_LEN(scores));
    PRINT_INT(total);
    return 0;
}`,
              expectedOutput: "ARRAY_LEN(scores) = 5\ntotal = 29",
            },
          ],
          practice: [
            {
              type: "OUTPUT_PREDICTION",
              slug: "c22-macro-output-1",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

#define SUB(a, b) a - b

int main(void) {
    printf("%d\\n", SUB(10, 3 + 2));
    printf("%d\\n", 2 * SUB(5, 1));
    return 0;
}`,
              expected: "9\n9",
              explanation: "SUB(10, 3 + 2) becomes 10 - 3 + 2 = 9. 2 * SUB(5, 1) becomes 2 * 5 - 1 = 9.",
            },
            {
              type: "MCQ",
              slug: "c22-macro-mcq-1",
              prompt: "Which definition of SQUARE is safest?",
              options: [
                { id: "a", text: "#define SQUARE(x) x * x" },
                { id: "b", text: "#define SQUARE(x) (x * x)" },
                { id: "c", text: "#define SQUARE(x) ((x) * (x))" },
                { id: "d", text: "#define SQUARE (x) ((x) * (x))" },
              ],
              correct: "c",
              explanation: "Both the parameters and the body are parenthesised. (d) has a space before the parameter list, making it an object-like macro.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c22-macro-tf-1",
              prompt: "A function-like macro evaluates each argument exactly once, just like a function.",
              correct: false,
              explanation: "The argument text is copied wherever the parameter appears, so it may be evaluated zero, one or several times.",
            },
            {
              type: "FILL_BLANK",
              slug: "c22-stringize-fill-1",
              prompt: "In a macro body, the ___ operator turns a parameter into a string literal, and the ___ operator joins two tokens into one.",
              accepted: [["#", "# operator", "stringize", "stringizing"], ["##", "## operator", "token-pasting", "token pasting"]],
              explanation: "#x gives \"...\"; a##b gives a single token ab.",
            },
            {
              type: "CODE_WRITING",
              slug: "c22-macro-cube-code",
              prompt: "Define two macros: `CUBE(x)` that computes x³ and `IS_EVEN(n)` that is 1 when n is even and 0 otherwise (both fully parenthesised). Then read integers from standard input until EOF and, for each one, print `<n>: cube <c>, even` or `<n>: cube <c>, odd` using the macros.",
              starterCode: `#include <stdio.h>

/* define CUBE and IS_EVEN here */

int main(void) {
    int n;
    while (scanf("%d", &n) == 1) {
        /* print using the macros */
    }
    return 0;
}`,
              sampleTests: [
                { stdin: "2\n", expected: "2: cube 8, even" },
                { stdin: "-3 0\n", expected: "-3: cube -27, odd\n0: cube 0, even" },
              ],
              hiddenTests: [
                { stdin: "5\n", expected: "5: cube 125, odd" },
                { stdin: "10 1\n", expected: "10: cube 1000, even\n1: cube 1, odd" },
                { stdin: "7 -2\n", expected: "7: cube 343, odd\n-2: cube -8, even" },
              ],
              solutionCode: `#include <stdio.h>

#define CUBE(x) ((x) * (x) * (x))
#define IS_EVEN(n) ((n) % 2 == 0)

int main(void) {
    int n;
    while (scanf("%d", &n) == 1) {
        printf("%d: cube %d, %s\\n", n, CUBE(n), IS_EVEN(n) ? "even" : "odd");
    }
    return 0;
}`,
              explanation: "Testing `% 2 == 0` (rather than `== 1` for odd) also works for negative numbers, since -3 % 2 is -1 in C.",
            },
          ],
        },
      ],
    },
    {
      slug: "conditional-compilation",
      title: "Conditional compilation and header files",
      lessons: [
        {
          slug: "conditional-compilation-include-guards",
          title: "#if, #ifdef, include guards and header files",
          summary:
            "Choosing which code gets compiled with #if/#ifdef/#ifndef/#elif, debug switches, defining macros from the command line, and writing header files protected by include guards.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Use #if, #elif, #else, #endif, #ifdef and #ifndef to include or exclude code",
                "Build a debug-logging switch and set macros from the compiler command line",
                "Write a header file with an include guard and explain why it is needed",
                "Use defined() and #error for configuration checks",
              ],
            },
            {
              type: "markdown",
              md: `Sometimes you want **one** source file to produce **different** programs: a debug build that prints diagnostic messages and a release build that does not; a Windows version and a Linux version; a free edition and a full edition. Conditional compilation lets the preprocessor keep or delete blocks of code before the compiler ever sees them.

Think of a script for a play with notes like "[only in the matinee performance]". The director reads the notes and hands the actors a script with those scenes either kept or cut. The actors (the compiler) never see the notes, just the final script.`,
            },
            {
              type: "definition",
              term: "Conditional compilation",
              md: "Using preprocessor directives (`#if`, `#ifdef`, `#ifndef`, `#elif`, `#else`, `#endif`) so that some lines of source code are compiled only when a condition is true.",
            },
            {
              type: "definition",
              term: "Include guard",
              md: "A `#ifndef NAME_H` / `#define NAME_H` / `#endif` wrapper around a header's contents so that, if the header is included more than once in the same translation unit, its contents are processed only the first time.",
            },
            {
              type: "syntax",
              language: "c",
              code: `#if constant_expression        /* integer expression of macros/literals */
    ...
#elif another_expression
    ...
#else
    ...
#endif

#ifdef NAME     /* same as  #if defined(NAME)  */
#ifndef NAME    /* same as  #if !defined(NAME) */`,
              md: "`#if` conditions are evaluated by the preprocessor, so they may only use integer constants and macros, not variables. An undefined name in `#if` counts as 0.",
            },
            {
              type: "code",
              language: "c",
              title: "A debug switch",
              runnable: true,
              code: `#include <stdio.h>

#define DEBUG 1          /* change to 0 to silence debug output */

#if DEBUG
#define LOG(msg) printf("[debug] %s\\n", msg)
#else
#define LOG(msg) ((void)0)
#endif

int main(void) {
    int i, sum = 0;
    LOG("starting");
    for (i = 1; i <= 4; i++) {
        sum += i;
    }
    LOG("loop finished");
    printf("sum = %d\\n", sum);
    return 0;
}`,
              output: `[debug] starting
[debug] loop finished
sum = 10`,
              walkthrough: [
                { lines: "3", text: "The switch. Real projects usually leave this line out and pass `-DDEBUG=1` to the compiler instead." },
                { lines: "5-9", text: "Only one of the two `LOG` definitions survives preprocessing. With DEBUG = 1, LOG prints; otherwise it expands to `((void)0)`, a statement that does nothing." },
                { lines: "13, 17", text: "The calls stay in the code permanently. Switching DEBUG to 0 removes all logging without editing them, and the release program contains no logging code at all." },
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Editions, defaults and defined()",
              runnable: true,
              code: `#include <stdio.h>

#define LEVEL 2

#ifndef MAX_USERS
#define MAX_USERS 100        /* default unless defined on the command line */
#endif

int main(void) {
#if LEVEL == 1
    printf("Basic edition\\n");
#elif LEVEL == 2
    printf("Standard edition\\n");
#else
    printf("Pro edition\\n");
#endif
    printf("Max users: %d\\n", MAX_USERS);
#if defined(LEVEL) && !defined(TRIAL)
    printf("Full version\\n");
#endif
    return 0;
}`,
              output: `Standard edition
Max users: 100
Full version`,
              walkthrough: [
                { lines: "5-7", text: "A common pattern: provide a default value only if nobody defined it already. Compiling with `gcc -DMAX_USERS=500 prog.c` would override it." },
                { lines: "10-16", text: "An `#if / #elif / #else` chain. Only the branch for LEVEL 2 reaches the compiler." },
                { lines: "18-20", text: "`defined(NAME)` can be combined with `&&`, `||` and `!` inside `#if`. TRIAL is not defined, so this line is kept." },
              ],
            },
            {
              type: "code",
              language: "shell",
              title: "Defining macros from the command line",
              runnable: false,
              code: `gcc -DDEBUG=1 prog.c -o prog          # like #define DEBUG 1
gcc -DTRIAL prog.c -o prog_trial        # like #define TRIAL 1
gcc -E prog.c | less                    # view the preprocessed source`,
            },
            { type: "heading", text: "Header files and include guards", level: 2 },
            {
              type: "markdown",
              md: `A header file collects the declarations that several \`.c\` files need: function prototypes, \`struct\` definitions, \`extern\` variable declarations and macros. But headers often include other headers. If \`main.c\` includes both \`shapes.h\` and \`draw.h\`, and \`draw.h\` also includes \`shapes.h\`, then \`struct Point\` would be defined twice in \`main.c\`, which is a compile error. The include guard prevents this.`,
            },
            {
              type: "code",
              language: "c",
              title: "shapes.h  (a typical header)",
              runnable: false,
              code: `#ifndef SHAPES_H
#define SHAPES_H

#define PI 3.14159

struct Point {
    int x, y;
};

double circleArea(double r);           /* prototype; body is in shapes.c */
int manhattan(struct Point a, struct Point b);

#endif /* SHAPES_H */`,
            },
            {
              type: "markdown",
              md: `The first time the header is included, \`SHAPES_H\` is not defined, so the preprocessor keeps the contents and defines \`SHAPES_H\`. Any later inclusion finds \`SHAPES_H\` already defined and skips everything up to \`#endif\`. Many compilers also accept the non-standard but widespread \`#pragma once\` at the top of a header for the same purpose.

The next runnable program simulates a header being pasted in twice, which is exactly what \`#include\` would do.`,
            },
            {
              type: "code",
              language: "c",
              title: "An include guard in action",
              runnable: true,
              code: `#include <stdio.h>

/* Imagine these lines come from point.h, included twice by accident */
#ifndef POINT_H
#define POINT_H
struct Point { int x, y; };
#endif

#ifndef POINT_H          /* second inclusion: POINT_H already defined, so skipped */
#define POINT_H
struct Point { int x, y; };
#endif

int main(void) {
    struct Point p = {3, 4};
    printf("(%d, %d)\\n", p.x, p.y);
    return 0;
}`,
              output: "(3, 4)",
              walkthrough: [
                { lines: "4-7", text: "First copy: POINT_H is undefined, so it is defined and `struct Point` is kept." },
                { lines: "9-12", text: "Second copy: POINT_H is now defined, so the preprocessor drops these lines. Without the guard, `struct Point` would be defined twice: a compile error ('redefinition of struct Point')." },
                { lines: "15-16", text: "The struct is usable normally." },
              ],
            },
            {
              type: "table",
              caption: "What belongs in a header?",
              headers: ["Put in the .h file", "Keep in the .c file"],
              rows: [
                ["Function prototypes", "Function bodies (definitions)"],
                ["struct, union, enum and typedef definitions", "Global variable definitions (int count = 0;)"],
                ["extern variable declarations", "static helper functions and variables"],
                ["Macros and constants shared by several files", "Macros used only in that file"],
              ],
            },
            {
              type: "callout",
              variant: "tip",
              title: "#error for configuration checks",
              md: "`#error message` stops compilation with your message. Example: `#if MAX_USERS > 1000` / `#error \"MAX_USERS is too large\"` / `#endif`. It turns a configuration mistake into a clear compile-time error instead of a mysterious run-time bug.",
            },
            { type: "heading", text: "Why it works", level: 2 },
            {
              type: "markdown",
              md: `The preprocessor reads the file from top to bottom, keeping a table of currently defined macros. When it meets \`#if\`, it evaluates the condition right then using that table; lines in a false branch are discarded (they must still be roughly well-formed, but they are never compiled). Because \`#define\` updates the table as it goes, the *order* of directives matters: an include guard works precisely because the first copy defines the guard name before the second copy is examined.

Since each \`.c\` file is preprocessed separately, include guards only prevent double inclusion **within one translation unit**. Every \`.c\` file still gets its own copy of the header, which is exactly why headers must not define variables or function bodies (see the storage classes chapter).`,
            },
            { type: "heading", text: "Real-world uses", level: 2 },
            {
              type: "markdown",
              md: `- **Every standard header** is wrapped in an include guard.
- **Portability**: \`#ifdef _WIN32\` selects Windows-specific code, \`#ifdef __linux__\` Linux code.
- **Debug vs release builds**: \`assert\` is disabled when \`NDEBUG\` is defined.
- **Feature flags**: the same codebase produces trial and full versions, or targets hardware with and without certain capabilities.
- **Temporarily disabling code**: \`#if 0 ... #endif\` comments out a block, even one that contains \`/* */\` comments.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Using a variable in #if",
                  wrong: `int debug = 1;
#if debug          /* debug is not a macro: treated as 0 */
    printf("debugging\\n");
#endif`,
                  right: `#define DEBUG 1
#if DEBUG
    printf("debugging\\n");
#endif`,
                  md: "The preprocessor runs before variables exist. Only macros and integer constants can be tested.",
                },
                {
                  title: "Forgetting the include guard",
                  wrong: `/* point.h */
struct Point { int x, y; };`,
                  right: `/* point.h */
#ifndef POINT_H
#define POINT_H
struct Point { int x, y; };
#endif`,
                  md: "If the header is reached twice through different includes, the struct is redefined and compilation fails.",
                },
                {
                  title: "Mismatched or missing #endif",
                  wrong: `#ifdef DEBUG
printf("x = %d\\n", x);
/* forgot #endif */`,
                  right: `#ifdef DEBUG
printf("x = %d\\n", x);
#endif`,
                  md: "Every #if/#ifdef/#ifndef needs a matching #endif. Add a comment after #endif in long blocks (`#endif /* DEBUG */`).",
                },
                {
                  title: "Confusing #ifdef with #if",
                  wrong: `#define DEBUG 0
#ifdef DEBUG        /* true! DEBUG is defined (as 0) */
    LOG("...");
#endif`,
                  right: `#define DEBUG 0
#if DEBUG           /* false: DEBUG's value is 0 */
    LOG("...");
#endif`,
                  md: "#ifdef asks only whether a name is defined, not what its value is.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "#ifdef X is equivalent to #if defined(X); #ifndef X to #if !defined(X).",
                "#if may only use constant integer expressions and macros; undefined identifiers count as 0.",
                "Every conditional block ends with #endif; #elif and #else are optional.",
                "Include guard pattern: #ifndef NAME_H, #define NAME_H, contents, #endif.",
                "gcc -DNAME=value defines a macro from the command line.",
                "Headers contain declarations, not definitions of variables or function bodies.",
              ],
            },
            {
              type: "recap",
              items: [
                "Conditional compilation keeps or removes code before compiling.",
                "Use it for debug switches, platform differences and configuration.",
                "Include guards make headers safe to include more than once.",
                "#ifdef tests existence; #if tests value.",
              ],
            },
            {
              type: "exercise",
              id: "c22-ex-units",
              kind: "write",
              title: "Metric or imperial build",
              prompt: "Write a program with `#define METRIC 1`. Using `#if METRIC ... #else ... #endif`, make it print `Distance: 5.00 km` when METRIC is 1 and `Distance: 3.11 miles` otherwise, for a distance of 5 km (1 km = 0.621371 miles).",
              hint: "Keep the distance in km in a variable and convert only in the #else branch.",
              solution: "With METRIC 1 the output is `Distance: 5.00 km`. Change it to 0 to see `Distance: 3.11 miles`.",
              solutionCode: `#include <stdio.h>

#define METRIC 1

int main(void) {
    double km = 5.0;
#if METRIC
    printf("Distance: %.2f km\\n", km);
#else
    printf("Distance: %.2f miles\\n", km * 0.621371);
#endif
    return 0;
}`,
              expectedOutput: "Distance: 5.00 km",
            },
            {
              type: "exercise",
              id: "c22-ex-ifdef-predict",
              kind: "predict",
              title: "Predict the conditional output",
              prompt: "What does this program print?",
              starterCode: `#include <stdio.h>

#define MODE 0
#define FEATURE

int main(void) {
#ifdef MODE
    printf("A\\n");
#endif
#if MODE
    printf("B\\n");
#endif
#ifdef FEATURE
    printf("C\\n");
#endif
#ifndef MISSING
    printf("D\\n");
#endif
    return 0;
}`,
              hint: "#ifdef only asks whether the name exists. A macro can be defined with no value at all.",
              solution: "MODE is defined (A), but its value is 0 (no B). FEATURE is defined with empty text (C). MISSING is not defined (D). Output: A, C, D on separate lines.",
              solutionCode: `#include <stdio.h>

#define MODE 0
#define FEATURE

int main(void) {
#ifdef MODE
    printf("A\\n");
#endif
#if MODE
    printf("B\\n");
#endif
#ifdef FEATURE
    printf("C\\n");
#endif
#ifndef MISSING
    printf("D\\n");
#endif
    return 0;
}`,
              expectedOutput: "A\nC\nD",
            },
            {
              type: "exercise",
              id: "c22-ex-header-design",
              kind: "concept",
              title: "Design a header",
              prompt: "You are writing `stack.c` with functions `void push(int)`, `int pop(void)`, `int isEmpty(void)`, a private array `static int items[100];`, and a macro `STACK_MAX 100` that users should know about. Write out what `stack.h` should contain.",
              hint: "Only what other files need; the array is private.",
              solution: "```c\n#ifndef STACK_H\n#define STACK_H\n\n#define STACK_MAX 100\n\nvoid push(int value);\nint pop(void);\nint isEmpty(void);\n\n#endif\n```\nThe array and its index stay `static` in stack.c, so other files can use the stack only through these functions.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c22-guard-mcq-1",
              prompt: "What is the purpose of an include guard?",
              options: [
                { id: "a", text: "To stop a header from being included in more than one .c file" },
                { id: "b", text: "To prevent a header's contents from being processed twice within the same translation unit" },
                { id: "c", text: "To make the linker ignore duplicate functions" },
                { id: "d", text: "To speed up program execution" },
              ],
              correct: "b",
              explanation: "Each .c file still includes the header once; the guard stops repeated inclusion within one file's preprocessing.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c22-ifdef-tf-1",
              prompt: "After `#define VERBOSE 0`, the block inside `#ifdef VERBOSE ... #endif` is compiled.",
              correct: true,
              explanation: "#ifdef only checks that VERBOSE is defined; its value is irrelevant.",
            },
            {
              type: "FILL_BLANK",
              slug: "c22-guard-fill-1",
              prompt: "Complete the include guard: `#___ UTILS_H` then `#define UTILS_H` ... `#endif`.",
              accepted: [["ifndef", "if !defined(UTILS_H)", "if !defined UTILS_H"]],
              explanation: "#ifndef is true only the first time, before UTILS_H is defined.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c22-cond-output-1",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

#define VERSION 3

int main(void) {
#if VERSION >= 3
    printf("new");
#elif VERSION == 2
    printf("old");
#else
    printf("ancient");
#endif
#if defined(BETA) || VERSION > 2
    printf("+\\n");
#else
    printf("\\n");
#endif
    return 0;
}`,
              expected: "new+",
              explanation: "VERSION is 3, so the first branch is kept. BETA is undefined, but VERSION > 2 is true, so \"+\\n\" is printed.",
            },
          ],
        },
      ],
    },
  ],
};

export default chapter;
