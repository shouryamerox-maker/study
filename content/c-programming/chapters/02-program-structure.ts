import type { ChapterContent } from "../../../src/lib/content/schema";

/** Raw template tag: backslashes in C code (\n, \t, \0) are kept exactly as typed. */
const c = String.raw;

const chapter: ChapterContent = {
  slug: "program-structure",
  title: "Structure of a C Program",
  summary:
    "The standard layout of a C program, the role of main() and header files, and the four-stage journey from source code to a running executable that reports a return code.",
  topics: [
    {
      slug: "anatomy-of-a-c-program",
      title: "Anatomy of a C program",
      lessons: [
        {
          slug: "c-program-sections-and-main",
          title: "Sections of a program, main() and header files",
          summary:
            "Learn the conventional sections of a C source file, what main() is and how it is written, and what header files like stdio.h actually provide.",
          estMinutes: 25,
          blocks: [
            {
              type: "objectives",
              items: [
                "Identify the standard sections of a C program: documentation, preprocessor directives, definitions, global declarations, main() and user-defined functions.",
                "Explain the role of main() and write its two standard forms.",
                "Explain what a header file is and the difference between <...> and \"...\" includes.",
                "Recognise function prototypes and know why they appear before main().",
              ],
            },
            {
              type: "markdown",
              md: `## A C program has a shape

Think of a C source file like a formal letter. A letter has a predictable layout — your address, the date, a greeting, the body, a signature — so anyone can find what they need quickly. C programs follow a similar layout. The compiler is strict about *some* of the order (things must be declared before they are used), and the rest is a convention that experienced programmers follow so code is easy to read.`,
            },
            {
              type: "table",
              caption: "The conventional sections of a C program, top to bottom",
              headers: ["Section", "What goes there", "Example"],
              rows: [
                ["1. Documentation", "Comments describing the program, author, date, purpose", "`/* Area calculator - Ada, 2026 */`"],
                ["2. Preprocessor / link section", "`#include` directives for header files", "`#include <stdio.h>`"],
                ["3. Definition section", "Symbolic constants and macros", "`#define PI 3.14159`"],
                ["4. Global declarations", "Variables and function prototypes visible to the whole file", "`int counter = 0;` / `double area(double r);`"],
                ["5. main() function", "Where execution starts; the program's top-level steps", "`int main(void) { ... }`"],
                ["6. Subprograms", "Definitions of your own functions", "`double area(double r) { ... }`"],
              ],
            },
            {
              type: "code",
              language: "c",
              title: "A program with every section",
              runnable: true,
              code: c`/* Circle calculator
   Author: Ada  |  Purpose: show the sections of a C program */
#include <stdio.h>

#define PI 3.14159

int circles_computed = 0;
double circle_area(double radius);

int main(void)
{
    double r = 2.0;
    double a = circle_area(r);

    printf("Radius: %.1f\n", r);
    printf("Area: %.2f\n", a);
    printf("Circles computed: %d\n", circles_computed);
    return 0;
}

double circle_area(double radius)
{
    circles_computed = circles_computed + 1;
    return PI * radius * radius;
}`,
              output: `Radius: 2.0
Area: 12.57
Circles computed: 1`,
              walkthrough: [
                { lines: "1-2", text: "**Documentation section**: a comment explaining what the program is. The compiler ignores comments." },
                { lines: "3", text: "**Link section**: include `stdio.h` so `printf` is declared." },
                { lines: "5", text: "**Definition section**: `#define PI 3.14159` tells the preprocessor to replace every `PI` with `3.14159` before compiling." },
                { lines: "7", text: "**Global declaration**: a variable visible to every function in the file." },
                { lines: "8", text: "A **function prototype**: it announces that a function called `circle_area` exists, takes a `double`, and returns a `double`. This lets `main` call it even though its body comes later." },
                { lines: "10-19", text: "**main()**: execution starts here. It computes the area, prints three lines, and returns 0." },
                { lines: "15-16", text: "`%.1f` and `%.2f` print a decimal number with 1 and 2 digits after the point (more in chapter 6). 3.14159 × 2 × 2 = 12.56636, which rounds to 12.57." },
                { lines: "21-25", text: "**Subprogram section**: the full definition of `circle_area`. It updates the global counter and returns the area." },
              ],
            },
            {
              type: "callout",
              variant: "note",
              title: "Only main() is compulsory",
              md: "The smallest legal C program is just `int main(void) { return 0; }`. All the other sections are optional — you add them as the program needs them. But the *order* matters: something must be declared before it is used.",
            },
            {
              type: "heading",
              text: "The main() function",
              level: 2,
            },
            {
              type: "definition",
              term: "main()",
              md: "The special function where every hosted C program starts executing. There must be exactly one `main` in a program. It returns an `int` exit status to the operating system.",
            },
            {
              type: "syntax",
              language: "c",
              code: c`int main(void)
{
    /* statements */
    return 0;
}

int main(int argc, char *argv[])
{
    /* statements that may use command-line arguments */
    return 0;
}`,
              md: "These are the two forms guaranteed by the C standard. The second receives command-line arguments (covered in a later chapter). You may see `void main()` in old textbooks — it is **not** standard C and should be avoided.",
            },
            {
              type: "definition",
              term: "Function prototype (declaration)",
              md: "A line that states a function's name, return type and parameter types, ending in a semicolon, e.g. `double circle_area(double radius);`. It lets the compiler check calls to the function before it has seen the function's body.",
            },
            {
              type: "heading",
              text: "Header files",
              level: 2,
            },
            {
              type: "definition",
              term: "Header file",
              md: "A file (extension `.h`) containing declarations — function prototypes, constants, type definitions — that other source files can include. Including `stdio.h` tells the compiler what `printf` looks like; the actual machine code for `printf` lives in the C library and is joined to your program by the linker.",
            },
            {
              type: "table",
              caption: "Frequently used standard headers",
              headers: ["Header", "Provides", "Examples"],
              rows: [
                ["`stdio.h`", "Standard input/output", "`printf`, `scanf`, `puts`, `getchar`, file functions"],
                ["`stdlib.h`", "General utilities", "`malloc`, `free`, `exit`, `abs`, `rand`, `EXIT_SUCCESS`"],
                ["`math.h`", "Mathematics", "`sqrt`, `pow`, `sin`, `fabs`"],
                ["`string.h`", "String handling", "`strlen`, `strcpy`, `strcmp`"],
                ["`ctype.h`", "Character tests", "`isdigit`, `toupper`"],
                ["`limits.h`, `float.h`", "Limits of numeric types", "`INT_MAX`, `DBL_MAX`"],
              ],
            },
            {
              type: "syntax",
              language: "c",
              code: c`#include <header.h>     /* standard/system header: search the compiler's include directories */
#include "myheader.h"   /* your own header: search the current folder first, then system folders */`,
            },
            {
              type: "markdown",
              md: "Here is a second program that uses a different header, `math.h`, to compute a square root. Notice that the *structure* is the same: includes at the top, then `main`.",
            },
            {
              type: "code",
              language: "c",
              title: "Using math.h",
              runnable: true,
              code: c`#include <stdio.h>
#include <math.h>

int main(void)
{
    double side_squared = 49.0;
    double side = sqrt(side_squared);

    printf("Square root of %.1f is %.1f\n", side_squared, side);
    printf("2 to the power 10 is %.0f\n", pow(2.0, 10.0));
    return 0;
}`,
              output: `Square root of 49.0 is 7.0
2 to the power 10 is 1024`,
              walkthrough: [
                { lines: "1-2", text: "Two headers: `stdio.h` for `printf` and `math.h` for `sqrt` and `pow`." },
                { lines: "6-7", text: "`sqrt` returns the square root as a `double`." },
                { lines: "9", text: "Prints both numbers with one digit after the decimal point." },
                { lines: "10", text: "`pow(2.0, 10.0)` computes 2¹⁰. `%.0f` prints it with no decimal places." },
                { lines: "11", text: "Report success." },
              ],
            },
            {
              type: "callout",
              variant: "warning",
              title: "Linking the maths library on Linux",
              md: "With GCC on Linux you sometimes need to add `-lm` at the end of the command to link the maths library: `gcc roots.c -o roots -lm`. On Windows and macOS this is usually unnecessary.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `The C compiler reads a file **from top to bottom, once**. When it reaches a call such as \`circle_area(r)\`, it must already know the function's return type and parameters so that it can check the call and generate correct code. That is why includes, constants and prototypes come *first*: they are promises the compiler can rely on later. Headers are simply collections of such promises for library functions. The function bodies themselves can come anywhere — even in a different file — because the **linker** connects calls to bodies at the very end.`,
            },
            {
              type: "heading",
              text: "Real-world use",
              level: 3,
            },
            {
              type: "markdown",
              md: "Real projects split code across many files: `.h` files contain prototypes and constants (the *interface*), and `.c` files contain the function bodies (the *implementation*). For example, a game might have `physics.h` / `physics.c` and `graphics.h` / `graphics.c`, and `main.c` includes the headers it needs. This chapter's layout scales directly to that structure.",
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Calling a function before declaring it",
                  wrong: c`#include <stdio.h>

int main(void)
{
    printf("%d\n", twice(4));
    return 0;
}

int twice(int x) { return 2 * x; }`,
                  right: c`#include <stdio.h>

int twice(int x);   /* prototype */

int main(void)
{
    printf("%d\n", twice(4));
    return 0;
}

int twice(int x) { return 2 * x; }`,
                  md: "In modern C (C99 and later) calling an undeclared function is an error or at least a warning. Add a prototype above `main`, or define the function before `main`.",
                },
                {
                  title: "Writing void main()",
                  wrong: c`void main()
{
    printf("Hi\n");
}`,
                  right: c`int main(void)
{
    printf("Hi\n");
    return 0;
}`,
                  md: "The standard says `main` returns `int`. `void main` may compile on some compilers but is non-portable and loses the exit status.",
                },
                {
                  title: "Putting a semicolon after #include or #define",
                  wrong: c`#include <stdio.h>;
#define PI 3.14159;`,
                  right: c`#include <stdio.h>
#define PI 3.14159`,
                  md: "Preprocessor directives are not C statements, so they do not end with `;`. A semicolon after `#define PI 3.14159` becomes part of the replacement text, so `PI * 2` turns into `3.14159; * 2` — a confusing syntax error.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "Sections of a C program: documentation, link (preprocessor), definition, global declaration, main(), subprograms.",
                "Only `main()` is mandatory; every program has exactly one `main`.",
                "Standard forms: `int main(void)` and `int main(int argc, char *argv[])`.",
                "`#include <file.h>` searches system directories; `#include \"file.h\"` searches the current directory first.",
                "Header files contain declarations (prototypes, macros), not the compiled code of library functions.",
                "Preprocessor directives start with `#` and do not end with a semicolon.",
              ],
            },
            {
              type: "recap",
              items: [
                "A C file usually flows: comments → includes → #defines → globals/prototypes → main → other functions.",
                "main() is where execution begins and returns an int status.",
                "Prototypes let you call a function before its definition appears.",
                "Header files collect declarations so many files can share them.",
              ],
            },
            {
              type: "exercise",
              id: "c02-ex-label-sections",
              kind: "concept",
              title: "Label the sections",
              prompt: "For each line, name the program section it belongs to:\n\n1. `/* Payroll v2 */`\n2. `#include <stdlib.h>`\n3. `#define TAX_RATE 0.2`\n4. `double net_pay(double gross);`\n5. `int main(void) {`",
              hint: "Use the six-section table from the lesson.",
              solution: "1. Documentation. 2. Link / preprocessor section. 3. Definition section. 4. Global declaration section (a function prototype). 5. The main() function.",
            },
            {
              type: "exercise",
              id: "c02-ex-prototype-write",
              kind: "write",
              title: "Add a prototype",
              prompt: "Complete a program that defines a function `int square(int n)` **after** `main`, declares it with a prototype **before** `main`, and prints `9 squared is 81`.",
              hint: "The prototype is the function header followed by a semicolon.",
              solutionCode: c`#include <stdio.h>

int square(int n);

int main(void)
{
    printf("9 squared is %d\n", square(9));
    return 0;
}

int square(int n)
{
    return n * n;
}`,
              expectedOutput: "9 squared is 81",
            },
            {
              type: "exercise",
              id: "c02-ex-define-semicolon",
              kind: "debug",
              title: "The sneaky semicolon",
              prompt: "This program fails to compile with an error on the `printf` line, even though that line looks fine. Explain why and fix it.",
              starterCode: c`#include <stdio.h>
#define SIDES 6;

int main(void)
{
    printf("A die has %d sides\n", SIDES);
    return 0;
}`,
              hint: "Mentally replace `SIDES` with exactly the text after it in the #define.",
              solution: "The preprocessor replaces `SIDES` with `6;`, so the call becomes `printf(\"...\", 6;);`, which is a syntax error. Remove the semicolon from the `#define` line.",
              solutionCode: c`#include <stdio.h>
#define SIDES 6

int main(void)
{
    printf("A die has %d sides\n", SIDES);
    return 0;
}`,
              expectedOutput: "A die has 6 sides",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c02-mandatory-section-mcq",
              prompt: "Which part of a C program is mandatory?",
              options: [
                { id: "a", text: "The documentation section" },
                { id: "b", text: "The `#define` section" },
                { id: "c", text: "The `main()` function" },
                { id: "d", text: "Global variable declarations" },
              ],
              correct: "c",
              explanation: "A hosted C program must contain exactly one `main` function; all other sections are optional.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c02-header-contains-code-tf",
              prompt: "The header file `stdio.h` contains the compiled machine code of `printf`.",
              correct: false,
              explanation: "Headers contain declarations. The compiled code of `printf` is in the C standard library, which the linker joins to your program.",
            },
            {
              type: "FILL_BLANK",
              slug: "c02-include-quotes-fill",
              prompt: "To include your own header file `shapes.h` from the current folder you write `#include ___`.",
              accepted: [["\"shapes.h\""]],
              explanation: "Double quotes tell the preprocessor to search the current directory first. Angle brackets are used for standard headers.",
            },
            {
              type: "MCQ",
              slug: "c02-prototype-mcq",
              prompt: "Which line is a valid function prototype?",
              options: [
                { id: "a", text: "`int add(int a, int b)`" },
                { id: "b", text: "`int add(int a, int b);`" },
                { id: "c", text: "`add(int a, int b) int;`" },
                { id: "d", text: "`#prototype add(int, int)`" },
              ],
              correct: "b",
              explanation: "A prototype is the function header followed by a semicolon. Without the semicolon (option a) it would be the start of a definition.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c02-define-output",
              prompt: "What does this program print?",
              code: c`#include <stdio.h>
#define WIDTH 4
#define HEIGHT 3

int area(int w, int h);

int main(void)
{
    printf("Area = %d\n", area(WIDTH, HEIGHT));
    return 0;
}

int area(int w, int h)
{
    return w * h;
}`,
              expected: "Area = 12",
              explanation: "The preprocessor replaces WIDTH with 4 and HEIGHT with 3; `area(4, 3)` returns 12.",
            },
          ],
        },
      ],
    },
    {
      slug: "from-source-to-execution",
      title: "From source code to a running program",
      lessons: [
        {
          slug: "c-compilation-pipeline-and-return-codes",
          title: "Preprocess, compile, assemble, link — and run",
          summary:
            "Follow a C program through the four stages of building, see what each stage produces, and learn how a running program reports success or failure with its return code.",
          estMinutes: 25,
          blocks: [
            {
              type: "objectives",
              items: [
                "Name the four stages of building a C program and what each one produces.",
                "Use gcc options -E, -S and -c to stop after each stage.",
                "Distinguish compile-time errors, link-time errors and run-time errors.",
                "Explain what the return value of main() means and how to inspect it.",
              ],
            },
            {
              type: "markdown",
              md: `## A factory with four stations

When you click *Build* or type \`gcc hello.c -o hello\`, it looks like a single step. In reality your program passes through a small assembly line with four stations:

1. **Preprocessor** — handles every line starting with \`#\`: pastes in header files, replaces macros, removes comments.
2. **Compiler** — translates the preprocessed C into **assembly language** for your processor.
3. **Assembler** — turns assembly into binary **object code** (\`.o\` or \`.obj\` file).
4. **Linker** — joins your object file(s) with library code (like \`printf\`) into one **executable**.

Then the operating system's **loader** places the executable in memory and calls \`main\`.`,
            },
            {
              type: "table",
              caption: "The build pipeline for hello.c",
              headers: ["Stage", "Input", "Output", "gcc option to stop here"],
              rows: [
                ["Preprocessing", "`hello.c`", "Expanded source (`hello.i`)", "`gcc -E hello.c -o hello.i`"],
                ["Compilation", "`hello.i`", "Assembly code (`hello.s`)", "`gcc -S hello.c`"],
                ["Assembly", "`hello.s`", "Object file (`hello.o`)", "`gcc -c hello.c`"],
                ["Linking", "`hello.o` + C library", "Executable (`hello` / `hello.exe`)", "`gcc hello.o -o hello`"],
              ],
            },
            {
              type: "definition",
              term: "Preprocessor",
              md: "The first stage. It processes directives beginning with `#` (`#include`, `#define`, `#if`...), strips comments, and outputs pure C text for the compiler.",
            },
            {
              type: "definition",
              term: "Object file",
              md: "A file of machine code produced from one source file. It is not yet runnable because calls to functions in other files or libraries (such as `printf`) are still unresolved placeholders.",
            },
            {
              type: "definition",
              term: "Linker",
              md: "The tool that combines object files and libraries, resolves every function call to an actual address, and writes the final executable.",
            },
            {
              type: "definition",
              term: "Exit status (return code)",
              md: "The integer a program hands back to the operating system when it ends — the value returned from `main`, or passed to `exit()`. By convention 0 means success and non-zero means some kind of failure.",
            },
            {
              type: "code",
              language: "shell",
              title: "Watching each stage",
              runnable: false,
              code: c`$ gcc -E hello.c -o hello.i   # 1. preprocess only (hello.i is hundreds of lines!)
$ gcc -S hello.i              # 2. compile to assembly -> hello.s
$ gcc -c hello.s              # 3. assemble -> hello.o
$ gcc hello.o -o hello        # 4. link -> hello
$ ./hello
Hello, World!`,
            },
            {
              type: "heading",
              text: "Seeing the preprocessor at work",
              level: 2,
            },
            {
              type: "markdown",
              md: "The preprocessor does pure text substitution before the compiler sees anything. In the program below, the compiler never sees the words `GREETING` or `YEAR` — only the replacement text. The special macro `__LINE__` is replaced by the current line number.",
            },
            {
              type: "code",
              language: "c",
              title: "Macros are replaced before compilation",
              runnable: true,
              code: c`#include <stdio.h>
#define GREETING "Welcome to the build pipeline"
#define YEAR 2026

int main(void)
{
    /* This comment is removed by the preprocessor */
    printf("%s\n", GREETING);
    printf("Year: %d\n", YEAR);
    printf("This is line %d of the source file\n", __LINE__);
    return 0;
}`,
              output: `Welcome to the build pipeline
Year: 2026
This is line 10 of the source file`,
              walkthrough: [
                { lines: "1", text: "During preprocessing, this line is replaced by the entire contents of `stdio.h`." },
                { lines: "2-3", text: "Two macros. Every later `GREETING` becomes the string literal, and `YEAR` becomes `2026`." },
                { lines: "7", text: "Comments are deleted by the preprocessor; the compiler never sees them." },
                { lines: "8", text: "After preprocessing this line reads `printf(\"%s\\n\", \"Welcome to the build pipeline\");`. `%s` prints a string." },
                { lines: "9", text: "Becomes `printf(\"Year: %d\\n\", 2026);`." },
                { lines: "10", text: "`__LINE__` is a predefined macro that expands to the line number where it appears — here, 10." },
              ],
            },
            {
              type: "heading",
              text: "Running the program and return codes",
              level: 2,
            },
            {
              type: "markdown",
              md: `When \`main\` ends with \`return 0;\`, the value 0 is passed to the operating system. Scripts, build tools and other programs check this value to decide whether your program succeeded. The header \`stdlib.h\` defines the portable names \`EXIT_SUCCESS\` and \`EXIT_FAILURE\` for exactly this purpose.

The program below checks a value and returns a failure code if it is invalid. Here the value is valid, so it reports success.`,
            },
            {
              type: "code",
              language: "c",
              title: "Returning success or failure",
              runnable: true,
              code: c`#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int temperature = 37;

    if (temperature < -50 || temperature > 60) {
        printf("Error: reading out of range\n");
        return EXIT_FAILURE;
    }

    printf("Reading OK: %d degrees\n", temperature);
    return EXIT_SUCCESS;
}`,
              output: "Reading OK: 37 degrees",
              walkthrough: [
                { lines: "2", text: "`stdlib.h` defines `EXIT_SUCCESS` (0) and `EXIT_FAILURE` (usually 1)." },
                { lines: "6", text: "A sensor reading to validate." },
                { lines: "8", text: "An `if` statement (chapter 9) checks whether the value is outside the sensible range. `||` means *or*." },
                { lines: "9-10", text: "Only runs for a bad reading: print an error and end `main` early with a failure status." },
                { lines: "13-14", text: "For a good reading, print it and return success. The operating system receives 0." },
              ],
            },
            {
              type: "code",
              language: "shell",
              title: "Inspecting the exit status in a terminal",
              runnable: false,
              code: c`$ ./check_reading
Reading OK: 37 degrees
$ echo $?            # Linux/macOS: show the last exit status
0
> echo %ERRORLEVEL%  # Windows Command Prompt
0`,
            },
            {
              type: "callout",
              variant: "tip",
              title: "Falling off the end of main",
              md: "Since C99, if execution reaches the closing `}` of `main` without a `return`, it behaves as if `return 0;` were there. This rule applies **only** to `main`. Writing `return 0;` explicitly is still clearer and is expected in exams.",
            },
            {
              type: "heading",
              text: "Three kinds of errors",
              level: 2,
            },
            {
              type: "table",
              headers: ["Kind", "Detected by", "Example", "Symptom"],
              rows: [
                ["Compile-time (syntax/type) error", "Compiler", "Missing `;`, misspelt keyword", "No executable is produced; error with line number"],
                ["Link-time error", "Linker", "`Main` instead of `main`; calling a function that was declared but never defined", "*undefined reference to ...*"],
                ["Run-time error", "Happens while running", "Dividing by zero, reading bad input", "Crash, or wrong results"],
                ["Logical error", "Only you (testing)", "Using `+` where you meant `*`", "Program runs but gives the wrong answer"],
              ],
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `Splitting the build into stages lets each tool do one job well and lets large projects rebuild efficiently. Each \`.c\` file is preprocessed, compiled and assembled **separately** into its own object file. If you change one file in a 500-file project, only that file is recompiled; the linker then quickly re-joins all the object files. Libraries such as the C standard library are shipped already compiled, so your build only has to link against them.`,
            },
            {
              type: "heading",
              text: "Real-world use",
              level: 3,
            },
            {
              type: "markdown",
              md: "Build systems (`make`, CMake, Ninja) automate exactly these stages and use file timestamps to recompile only what changed. Continuous-integration servers run test programs and look at their **exit status**: 0 means the tests passed and the code can be merged; anything else stops the pipeline. Shell scripts use `&&` to run the next command only if the previous one returned 0.",
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Misreading a link error as a compile error",
                  wrong: c`#include <stdio.h>

void greet(void);

int main(void)
{
    greet();
    return 0;
}`,
                  right: c`#include <stdio.h>

void greet(void);

int main(void)
{
    greet();
    return 0;
}

void greet(void)
{
    printf("Hi!\n");
}`,
                  md: "The prototype satisfies the compiler, so compilation succeeds, but there is no definition of `greet` anywhere, so the *linker* fails with *undefined reference to `greet`*. Provide the function body (or link the file that contains it).",
                },
                {
                  title: "Returning a non-zero value for success",
                  wrong: c`int main(void)
{
    printf("Done\n");
    return 1;   /* intended to mean 'true, it worked' */
}`,
                  right: c`int main(void)
{
    printf("Done\n");
    return 0;   /* 0 = success */
}`,
                  md: "For exit statuses, 0 means success. Returning 1 tells scripts and build tools that the program *failed*.",
                },
                {
                  title: "Forgetting -lm when using math.h on Linux",
                  md: "If GCC on Linux reports *undefined reference to `sqrt`*, the problem is linking, not your code. Add `-lm` at the end: `gcc prog.c -o prog -lm`.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "Order of stages: **preprocessing → compilation → assembly → linking**, then loading/execution.",
                "Preprocessor output: expanded source (`.i`); compiler: assembly (`.s`); assembler: object file (`.o`/`.obj`); linker: executable.",
                "`gcc -E` stops after preprocessing, `-S` after compilation, `-c` after assembly.",
                "Comments are removed and macros expanded by the **preprocessor**.",
                "*Undefined reference* errors come from the **linker**.",
                "Return value of `main`: 0 / `EXIT_SUCCESS` = success, non-zero / `EXIT_FAILURE` = failure.",
              ],
            },
            {
              type: "recap",
              items: [
                "One gcc command runs four tools in sequence.",
                "The preprocessor works on text; the compiler and assembler create machine code; the linker joins pieces together.",
                "Errors can appear at compile time, link time or run time — knowing which helps you fix them faster.",
                "A program's exit status lets other programs know whether it succeeded.",
              ],
            },
            {
              type: "exercise",
              id: "c02-ex-stage-match",
              kind: "concept",
              title: "Which stage?",
              prompt: "Which build stage is responsible for each of the following?\n\n1. Replacing `#define MAX 10` uses with `10`.\n2. Reporting *undefined reference to `calc`*.\n3. Producing `prog.o` from `prog.s`.\n4. Reporting *expected ';' before 'return'*.",
              hint: "Errors about missing pieces between files come late; errors about grammar come early.",
              solution: "1. Preprocessor. 2. Linker. 3. Assembler. 4. Compiler (a syntax error).",
            },
            {
              type: "exercise",
              id: "c02-ex-predict-line",
              kind: "predict",
              title: "Predict __LINE__",
              prompt: "What does this program print?",
              starterCode: c`#include <stdio.h>
#define TIMES 3

int main(void)
{
    printf("%d\n", TIMES * 5);
    printf("%d\n", __LINE__);
    return 0;
}`,
              hint: "Count the lines from the top, starting at 1.",
              solution: "`TIMES * 5` becomes `3 * 5` = 15. The second `printf` is on line 7.",
              solutionCode: c`#include <stdio.h>
#define TIMES 3

int main(void)
{
    printf("%d\n", TIMES * 5);
    printf("%d\n", __LINE__);
    return 0;
}`,
              expectedOutput: `15
7`,
            },
            {
              type: "exercise",
              id: "c02-ex-exit-status",
              kind: "write",
              title: "Report a status",
              prompt: "Write a program that stores `int items = 0;`. If `items` is 0 it should print `Nothing to process` and return `EXIT_FAILURE`; otherwise print `Processing` and return `EXIT_SUCCESS`. (You can copy the `if` pattern from the lesson.)",
              hint: "Use `if (items == 0) { ... }` and include `stdlib.h`.",
              solutionCode: c`#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int items = 0;

    if (items == 0) {
        printf("Nothing to process\n");
        return EXIT_FAILURE;
    }
    printf("Processing\n");
    return EXIT_SUCCESS;
}`,
              expectedOutput: "Nothing to process",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c02-stage-order-mcq",
              prompt: "What is the correct order of the stages that turn a C source file into an executable?",
              options: [
                { id: "a", text: "Compile → preprocess → link → assemble" },
                { id: "b", text: "Preprocess → compile → assemble → link" },
                { id: "c", text: "Preprocess → assemble → compile → link" },
                { id: "d", text: "Link → preprocess → compile → assemble" },
              ],
              correct: "b",
              explanation: "Directives are handled first, then C is translated to assembly, assembled into object code, and finally linked.",
            },
            {
              type: "MCQ",
              slug: "c02-undefined-ref-mcq",
              prompt: "A build fails with the message *undefined reference to `area`*. Which tool reported it?",
              options: [
                { id: "a", text: "The preprocessor" },
                { id: "b", text: "The compiler" },
                { id: "c", text: "The linker" },
                { id: "d", text: "The operating system loader" },
              ],
              correct: "c",
              explanation: "The linker resolves calls to function definitions. If no definition of `area` exists in any object file or library, it reports an undefined reference.",
            },
            {
              type: "FILL_BLANK",
              slug: "c02-gcc-c-fill",
              prompt: "The gcc option that compiles and assembles a file into an object file *without linking* is ___.",
              accepted: [["-c"]],
              caseSensitive: true,
              explanation: "`gcc -c file.c` produces `file.o`. `-E` stops after preprocessing and `-S` after compiling to assembly.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c02-comments-removed-tf",
              prompt: "Comments are removed from the source code by the preprocessor, before the compiler proper sees the code.",
              correct: true,
              explanation: "Comment removal happens during the preprocessing phase (each comment is replaced by a single space).",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c02-macro-expand-output",
              prompt: "What does this program print?",
              code: c`#include <stdio.h>
#define START 10
#define STEP 5

int main(void)
{
    printf("%d\n", START + STEP);
    printf("%d %d\n", START, STEP * 2);
    return 0;
}`,
              expected: `15
10 10`,
              explanation: "After preprocessing: `printf(\"%d\\n\", 10 + 5);` and `printf(\"%d %d\\n\", 10, 5 * 2);`.",
            },
            {
              type: "CODE_WRITING",
              slug: "c02-add-function-code",
              prompt: "Complete the program so that it reads two whole numbers and prints their sum in the form `Sum: S`.\n\nYou must:\n1. Declare a prototype for `int add(int a, int b);` above `main`.\n2. Define `add` **below** `main`.\n3. Call `add` from `main`.\n\nFor input `3 4` the output is `Sum: 7`.",
              starterCode: c`#include <stdio.h>

/* 1. prototype here */

int main(void)
{
    int x, y;
    scanf("%d %d", &x, &y);
    /* 3. call add and print the result */
    return 0;
}

/* 2. definition of add here */`,
              sampleTests: [
                { stdin: "3 4", expected: "Sum: 7" },
                { stdin: "10 -2", expected: "Sum: 8" },
              ],
              hiddenTests: [
                { stdin: "0 0", expected: "Sum: 0" },
                { stdin: "-5 -6", expected: "Sum: -11" },
                { stdin: "1000 2345", expected: "Sum: 3345" },
              ],
              solutionCode: c`#include <stdio.h>

int add(int a, int b);

int main(void)
{
    int x, y;
    scanf("%d %d", &x, &y);
    printf("Sum: %d\n", add(x, y));
    return 0;
}

int add(int a, int b)
{
    return a + b;
}`,
              explanation: "The prototype tells the compiler about `add` before `main` uses it; the definition after `main` provides the body that the linker connects to the call.",
            },
          ],
        },
      ],
    },
  ],
};

export default chapter;
