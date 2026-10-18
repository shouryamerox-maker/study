import type { ChapterContent } from "../../../src/lib/content/schema";

const chapter: ChapterContent = {
  slug: "functions",
  title: "Functions",
  summary:
    "Break programs into named, reusable pieces: why functions matter, prototypes and definitions, parameters and arguments, return values, void functions, call by value, scope, and how to design good functions.",
  topics: [
    {
      slug: "function-basics",
      title: "Writing and calling functions",
      lessons: [
        {
          slug: "functions-declare-define-call",
          title: "Declaring, defining and calling functions",
          summary:
            "Understand why functions exist, and write prototypes, definitions and calls for functions that return values and void functions.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Explain why programs are divided into functions",
                "Write a function prototype, a function definition and a function call",
                "Return a value with return and use the returned value in expressions",
                "Write void functions that perform an action without returning a value",
              ],
            },
            {
              type: "markdown",
              md: `## Why functions?

You have already used functions: \`printf\` and \`scanf\` are functions somebody else wrote, and \`main\` is a function you write in every program. A **function** is a named block of code that performs one task. You give it some input, it does its job, and it can hand back a result.

Think of a kitchen appliance like a blender. You put ingredients in (the **inputs**), press a button (the **call**), and get a smoothie out (the **return value**). You don't need to know how the motor works each time you use it; you just need to know what goes in and what comes out.

Functions give you:

- **Reuse:** write the code once, call it many times.
- **Readability:** \`if (is_prime(n))\` says what is happening; 10 lines of loop do not.
- **Easier testing and debugging:** each function can be checked on its own.
- **Teamwork:** different people can write different functions.`,
            },
            {
              type: "definition",
              term: "Function definition",
              md: "The complete function: a **header** (return type, name, parameter list) followed by a **body** in braces containing the statements that run when the function is called.",
            },
            {
              type: "definition",
              term: "Function prototype (declaration)",
              md: "A statement that announces a function's name, return type and parameter types, ending in a semicolon, e.g. `int square(int n);`. It lets the compiler check calls that appear before the definition.",
            },
            {
              type: "definition",
              term: "Function call",
              md: "An expression that runs a function, e.g. `square(7)`. Control jumps into the function, and when it finishes, control returns to the point of the call, where the call expression takes the returned value.",
            },
            {
              type: "syntax",
              language: "c",
              code: `/* prototype: usually near the top of the file */
return_type function_name(type1 param1, type2 param2);

/* definition */
return_type function_name(type1 param1, type2 param2)
{
    /* body */
    return expression;   /* omitted (or plain return;) for void */
}

/* call */
variable = function_name(argument1, argument2);`,
              md: "Use `void` as the return type when nothing is returned, and `(void)` as the parameter list when the function takes no input.",
            },
            {
              type: "code",
              language: "c",
              title: "Prototype, call and definition",
              runnable: true,
              code: `#include <stdio.h>

int square(int n);          /* prototype (declaration) */

int main(void)
{
    int a = 7;
    int result = square(a);

    printf("square(%d) = %d\\n", a, result);
    printf("square(3 + 2) = %d\\n", square(3 + 2));
    printf("sum of squares = %d\\n", square(3) + square(4));
    return 0;
}

int square(int n)           /* definition */
{
    return n * n;
}`,
              output: `square(7) = 49
square(3 + 2) = 25
sum of squares = 25`,
              walkthrough: [
                { lines: "3", text: "The prototype tells the compiler: `square` takes one `int` and returns an `int`. Because of it, `main` can call `square` even though the definition comes later." },
                { lines: "8", text: "Call: the value of `a` (7) is copied into the parameter `n`, the body runs, and `return n * n` sends 49 back. The call expression `square(a)` is replaced by 49, which is stored in `result`." },
                { lines: "11", text: "Arguments can be expressions: `3 + 2` is evaluated to 5 first, then passed." },
                { lines: "12", text: "Calls can appear inside bigger expressions: 9 + 16 = 25." },
                { lines: "16-19", text: "The definition: header (matches the prototype) and body. `return` ends the function and supplies the result." },
              ],
            },
            {
              type: "heading",
              text: "Return values and void functions",
              level: 2,
            },
            {
              type: "markdown",
              md: `The **return type** says what kind of value the function hands back. \`return expression;\` ends the function immediately and sends that value to the caller. A function may contain several \`return\` statements (for example one in each branch of an if); whichever executes first ends the function.

A **void function** returns nothing. It is used for its *effect*, such as printing. It may use a plain \`return;\` to leave early, or simply reach its closing brace.

A function can return **only one value**. (Later, pointers and structures will let you get more information out.)`,
            },
            {
              type: "code",
              language: "c",
              title: "A void function and a function with two returns",
              runnable: true,
              code: `#include <stdio.h>

void print_line(int width);
int max_of(int a, int b);

int main(void)
{
    print_line(20);
    printf("Max of 8 and 13 is %d\\n", max_of(8, 13));
    printf("Max of -2 and -9 is %d\\n", max_of(-2, -9));
    print_line(20);
    return 0;
}

void print_line(int width)
{
    int i;
    for (i = 0; i < width; i++)
        printf("-");
    printf("\\n");
}

int max_of(int a, int b)
{
    if (a > b)
        return a;
    return b;
}`,
              output: `--------------------
Max of 8 and 13 is 13
Max of -2 and -9 is -2
--------------------`,
              walkthrough: [
                { lines: "3-4", text: "Two prototypes. `void` means print_line returns nothing." },
                { lines: "8", text: "A void function is called as a statement on its own; there is no value to store." },
                { lines: "9-10", text: "max_of returns an int, so its call can be used directly as a printf argument." },
                { lines: "16-21", text: "print_line does a job (prints `width` dashes) and reaches the closing brace without returning a value." },
                { lines: "23-28", text: "If a > b, the first return ends the function immediately. Otherwise execution reaches the second return. No `else` is needed." },
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Returning a char, called inside a loop",
              runnable: true,
              code: `#include <stdio.h>

char grade(int marks)
{
    if (marks >= 90) return 'A';
    if (marks >= 75) return 'B';
    if (marks >= 50) return 'C';
    return 'F';
}

int main(void)
{
    int scores[4] = {95, 76, 50, 31};
    int i;

    for (i = 0; i < 4; i++)
        printf("%d -> %c\\n", scores[i], grade(scores[i]));
    return 0;
}`,
              output: `95 -> A
76 -> B
50 -> C
31 -> F`,
              walkthrough: [
                { lines: "3-9", text: "Here the definition comes *before* main, so no separate prototype is needed: a definition also acts as a declaration." },
                { lines: "5-8", text: "Each `return` ends the function, so later tests can assume the earlier ones failed, just like an else-if ladder." },
                { lines: "13", text: "Four test scores in an array (arrays are covered in chapter 14)." },
                { lines: "16-17", text: "The same function is reused four times, once per score." },
              ],
            },
            {
              type: "callout",
              variant: "warning",
              title: "Always declare before use",
              md: "If you call a function before the compiler has seen its prototype or definition, modern C compilers report an error (older ones guessed a return type of `int`, causing subtle bugs). Put prototypes at the top of the file, or define functions before `main`.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `When a function is called, the program saves the place it has reached, creates fresh storage for the function's parameters and local variables (a **stack frame**), copies the argument values into the parameters, and jumps to the function body. \`return\` puts the result where the caller can find it, destroys the frame, and jumps back to the saved place. The prototype is what lets the compiler check, at each call, that you pass the right number and types of arguments and use the result correctly.`,
            },
            {
              type: "heading",
              text: "Real-world uses",
              level: 2,
            },
            {
              type: "markdown",
              md: `- **Libraries:** the C standard library (\`printf\`, \`sqrt\`, \`strlen\`) is a collection of functions.
- **Business rules:** \`calculate_tax(income)\`, \`is_valid_pin(pin)\` keep rules in one place, so a change is made once.
- **Large programs:** operating systems and games contain thousands of small functions, each with one job.
- **Menus:** each menu option calls its own function, keeping \`main\` short and readable.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Semicolon after the definition header",
                  wrong: `int square(int n);
{
    return n * n;
}`,
                  right: `int square(int n)
{
    return n * n;
}`,
                  md: "A prototype ends with `;`; a definition header must not. With the semicolon, the braces become a stray block and the compiler reports an error.",
                },
                {
                  title: "Forgetting to use the return value",
                  wrong: `square(5);              /* result thrown away */
printf("%d\\n", n);`,
                  right: `int s = square(5);
printf("%d\\n", s);`,
                  md: "A returned value must be stored or used; calling the function does not change any of the caller's variables.",
                },
                {
                  title: "Missing return in a non-void function",
                  wrong: `int max_of(int a, int b)
{
    if (a > b)
        return a;
}                       /* nothing returned when a <= b */`,
                  right: `int max_of(int a, int b)
{
    if (a > b)
        return a;
    return b;
}`,
                  md: "If a non-void function ends without returning and the caller uses the result, the behaviour is undefined. Make sure every path returns a value.",
                },
                {
                  title: "Calling with the wrong number of arguments",
                  wrong: `int r = max_of(4);`,
                  right: `int r = max_of(4, 9);`,
                  md: "With a prototype in scope, the compiler rejects calls whose arguments do not match the parameter list.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "Prototype: int f(int x); (ends with ;) - definition: header + body in braces.",
                "A definition placed before its first call also serves as the declaration.",
                "return ends the function immediately; a function returns at most one value.",
                "void functions return nothing and are called as statements.",
                "Use (void) for a function that takes no parameters, e.g. int main(void).",
              ],
            },
            {
              type: "recap",
              items: [
                "Functions package one task under a name for reuse and readability.",
                "Declare (prototype), define (header + body) and call (name + arguments).",
                "Return values replace the call expression at the point of call.",
                "void functions perform actions without returning a value.",
              ],
            },
            {
              type: "exercise",
              id: "c12-ex-cube",
              kind: "write",
              title: "Cube and print",
              prompt: "Write a function `int cube(int n)` and a function `void show_cube(int n)` that prints `n^3 = value` using `cube`. Call `show_cube` for 2, 3 and -4. Expected output:\n\n```\n2^3 = 8\n3^3 = 27\n-4^3 = -64\n```",
              hint: "show_cube calls cube inside its printf.",
              solutionCode: `#include <stdio.h>

int cube(int n)
{
    return n * n * n;
}

void show_cube(int n)
{
    printf("%d^3 = %d\\n", n, cube(n));
}

int main(void)
{
    show_cube(2);
    show_cube(3);
    show_cube(-4);
    return 0;
}`,
              expectedOutput: `2^3 = 8
3^3 = 27
-4^3 = -64`,
            },
            {
              type: "exercise",
              id: "c12-ex-predict-calls",
              kind: "predict",
              title: "Follow the calls",
              prompt: "Predict the output.\n\n```c\n#include <stdio.h>\n\nint twice(int x)\n{\n    return 2 * x;\n}\n\nint add_one(int x)\n{\n    return x + 1;\n}\n\nint main(void)\n{\n    printf(\"%d\\n\", twice(add_one(4)));\n    printf(\"%d\\n\", add_one(twice(4)));\n    printf(\"%d\\n\", twice(twice(twice(1))));\n    return 0;\n}\n```",
              hint: "Evaluate the innermost call first: its result becomes the argument of the outer call.",
              solution: "twice(add_one(4)) = twice(5) = 10; add_one(twice(4)) = add_one(8) = 9; twice(twice(twice(1))) = 8.",
              solutionCode: `#include <stdio.h>

int twice(int x)
{
    return 2 * x;
}

int add_one(int x)
{
    return x + 1;
}

int main(void)
{
    printf("%d\\n", twice(add_one(4)));
    printf("%d\\n", add_one(twice(4)));
    printf("%d\\n", twice(twice(twice(1))));
    return 0;
}`,
              expectedOutput: `10
9
8`,
            },
            {
              type: "exercise",
              id: "c12-ex-debug-missing-return",
              kind: "debug",
              title: "Where did the area go?",
              prompt: "This program should print `Area = 12.50` but the compiler complains or the output is wrong. Fix the function.",
              starterCode: `#include <stdio.h>

double triangle_area(double base, double height)
{
    double area = 0.5 * base * height;
}

int main(void)
{
    printf("Area = %.2f\\n", triangle_area(5.0, 5.0));
    return 0;
}`,
              hint: "What does the function give back to main?",
              solution: "The function computes `area` but never returns it, so main uses an undefined value. Add `return area;`.",
              solutionCode: `#include <stdio.h>

double triangle_area(double base, double height)
{
    double area = 0.5 * base * height;
    return area;
}

int main(void)
{
    printf("Area = %.2f\\n", triangle_area(5.0, 5.0));
    return 0;
}`,
              expectedOutput: "Area = 12.50",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c12-prototype-mcq",
              prompt: "Which of these is a correct prototype for a function that takes two doubles and returns their average?",
              options: [
                { id: "a", text: "double average(double a, double b)" },
                { id: "b", text: "double average(double a, double b);" },
                { id: "c", text: "average(double a, b);" },
                { id: "d", text: "void average(double a, double b);" },
              ],
              correct: "b",
              explanation: "A prototype has the return type, name and parameter types and ends with a semicolon. (a) is a definition header without a body; (c) lacks a return type and the type of b; (d) returns nothing.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c12-return-early-output",
              prompt: "What does this print?",
              code: `#include <stdio.h>

int sign(int x)
{
    if (x > 0) return 1;
    if (x < 0) return -1;
    return 0;
}

int main(void)
{
    printf("%d %d %d\\n", sign(42), sign(-7), sign(0));
    printf("%d\\n", sign(5) + sign(-5) + sign(9));
    return 0;
}`,
              expected: "1 -1 0\n1",
              explanation: "Each return ends the function. 1 + (-1) + 1 = 1.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c12-void-return-tf",
              prompt: "A void function can contain the statement `return;` to leave the function early.",
              correct: true,
              explanation: "return; with no value is allowed in void functions.",
            },
            {
              type: "FILL_BLANK",
              slug: "c12-void-fill",
              prompt: "A function that does not return any value has the return type ___ .",
              accepted: [["void"]],
            },
            {
              type: "CODE_WRITING",
              slug: "c12-max3-function",
              prompt:
                "Write a function `int max3(int a, int b, int c)` that returns the largest of its three arguments. In `main`, read three integers and print `Max: X` using your function.",
              starterCode: `#include <stdio.h>

int max3(int a, int b, int c)
{
    /* your code here */
}

int main(void)
{
    int x, y, z;
    scanf("%d %d %d", &x, &y, &z);
    printf("Max: %d\\n", max3(x, y, z));
    return 0;
}`,
              sampleTests: [
                { stdin: "3 9 4", expected: "Max: 9" },
                { stdin: "-1 -5 -3", expected: "Max: -1" },
              ],
              hiddenTests: [
                { stdin: "7 7 7", expected: "Max: 7" },
                { stdin: "1 2 30", expected: "Max: 30" },
                { stdin: "100 0 -100", expected: "Max: 100" },
              ],
              solutionCode: `#include <stdio.h>

int max3(int a, int b, int c)
{
    int m = a;
    if (b > m) m = b;
    if (c > m) m = c;
    return m;
}

int main(void)
{
    int x, y, z;
    scanf("%d %d %d", &x, &y, &z);
    printf("Max: %d\\n", max3(x, y, z));
    return 0;
}`,
              explanation: "Keep a running maximum: start with a, and replace it whenever a larger value is found.",
            },
          ],
        },
        {
          slug: "parameters-call-by-value-scope",
          title: "Parameters, arguments, call by value and scope",
          summary:
            "Distinguish parameters from arguments, understand that C copies argument values into parameters, and learn where variables are visible.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Distinguish formal parameters from actual arguments",
                "Explain call by value and predict why a function cannot change the caller's variables",
                "Describe the scope and lifetime of parameters and local variables",
                "Recognise why a simple swap function does not work in C (yet)",
              ],
            },
            {
              type: "markdown",
              md: `## Parameters and arguments

These two words are often mixed up, so let's be precise:

- A **parameter** (formal parameter) is the variable named in the function's header: in \`int square(int n)\`, \`n\` is a parameter.
- An **argument** (actual argument) is the value supplied in a call: in \`square(a + 1)\`, the expression \`a + 1\` is the argument.

When the function is called, each argument is evaluated, and its **value is copied** into the corresponding parameter, in order: first argument to first parameter, and so on. This is called **call by value** (or pass by value), and it is the only way C passes arguments.

Analogy: you give a friend a **photocopy** of your notes. They can scribble all over the copy, but your original notes are untouched.`,
            },
            {
              type: "definition",
              term: "Parameter vs. argument",
              md: "A **parameter** is a variable declared in the function header that receives a value. An **argument** is the expression passed in a call whose value is given to the parameter.",
            },
            {
              type: "definition",
              term: "Call by value",
              md: "The argument's value is copied into the parameter. The function works on its own copy, so assigning to the parameter never affects the caller's variable.",
            },
            {
              type: "syntax",
              language: "c",
              code: `/* definition: formal parameters p1, p2 */
type name(type1 p1, type2 p2) { ... }

/* call: actual arguments are matched by position */
name(arg1, arg2);   /* p1 = value of arg1; p2 = value of arg2 */`,
              md: "The number and order of arguments must match the parameters. If an argument's type differs (e.g. an `int` passed to a `double` parameter), the value is converted as if by assignment.",
            },
            {
              type: "code",
              language: "c",
              title: "The function changes its copy only",
              runnable: true,
              code: `#include <stdio.h>

void try_to_change(int x)
{
    printf("  inside, before: x = %d\\n", x);
    x = 100;
    printf("  inside, after:  x = %d\\n", x);
}

int main(void)
{
    int value = 5;

    printf("before call: value = %d\\n", value);
    try_to_change(value);
    printf("after call:  value = %d\\n", value);
    return 0;
}`,
              output: `before call: value = 5
  inside, before: x = 5
  inside, after:  x = 100
after call:  value = 5`,
              walkthrough: [
                { lines: "3", text: "`x` is the parameter: a brand-new variable that exists only while the function runs." },
                { lines: "15", text: "The argument `value` is evaluated (5) and that number is copied into `x`." },
                { lines: "6", text: "Only the copy changes." },
                { lines: "16", text: "Back in main, `value` is still 5. The function never had access to it." },
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Why swap fails, and how to get a result out",
              runnable: true,
              code: `#include <stdio.h>

void swap(int a, int b)
{
    int temp = a;
    a = b;
    b = temp;
    printf("inside swap: a = %d, b = %d\\n", a, b);
}

int add_bonus(int marks, int bonus)
{
    marks = marks + bonus;
    return marks;
}

int main(void)
{
    int x = 1, y = 2;
    int m = 70;

    swap(x, y);
    printf("in main:     x = %d, y = %d\\n", x, y);

    m = add_bonus(m, 5);
    printf("marks after bonus: %d\\n", m);
    return 0;
}`,
              output: `inside swap: a = 2, b = 1
in main:     x = 1, y = 2
marks after bonus: 75`,
              walkthrough: [
                { lines: "3-9", text: "The swap is performed correctly, but on the copies `a` and `b`." },
                { lines: "22-23", text: "x and y are unchanged: call by value. (Chapter 17 shows how pointers let a function modify the caller's variables.)" },
                { lines: "11-15", text: "Modifying a parameter is fine; the useful result is *returned*." },
                { lines: "25", text: "The caller chooses to store the returned value back into `m`. This is the normal way to get a result out of a function." },
              ],
            },
            {
              type: "heading",
              text: "Scope and lifetime",
              level: 2,
            },
            {
              type: "markdown",
              md: `**Scope** is the region of the program where a name can be used. **Lifetime** is the period during which the variable actually exists in memory.

- **Parameters and local variables** (declared inside a function or block) have **block scope**: they are visible only inside that function or block. They are created when the function is called and destroyed when it returns, so their values are not remembered between calls.
- Two functions can each have a variable called \`n\` or \`result\`; they are completely separate variables that happen to share a name.
- **Global variables** are declared outside all functions and are visible from their declaration to the end of the file, and they live for the whole program. They are convenient but make programs harder to understand, because any function might change them. Prefer parameters and return values. (Chapter 19 covers storage classes in detail.)`,
            },
            {
              type: "definition",
              term: "Local variable",
              md: "A variable declared inside a function or block. It can be used only within that block, and (unless declared `static`) it is created fresh on each call and destroyed when the block ends.",
            },
            {
              type: "code",
              language: "c",
              title: "Same names, different variables",
              runnable: true,
              code: `#include <stdio.h>

int counter = 0;   /* global: visible to every function below */

int triple(int n)
{
    int result = n * 3;   /* local to triple */
    counter++;
    return result;
}

int main(void)
{
    int n = 4;
    int result = 10;

    printf("triple(n) = %d\\n", triple(n));
    printf("main's n = %d, main's result = %d\\n", n, result);
    printf("triple(7) = %d\\n", triple(7));
    printf("triple was called %d times\\n", counter);
    return 0;
}`,
              output: `triple(n) = 12
main's n = 4, main's result = 10
triple(7) = 21
triple was called 2 times`,
              walkthrough: [
                { lines: "3", text: "A global variable, used here only to count calls." },
                { lines: "5-10", text: "`n` and `result` here belong to `triple` only." },
                { lines: "14-15", text: "`main` has its own `n` and `result`, unrelated to triple's." },
                { lines: "17", text: "triple's `result` is set to 12, but that does not touch main's `result`." },
                { lines: "18", text: "Proof: main's variables are unchanged (4 and 10)." },
                { lines: "20", text: "The global was updated by both calls." },
              ],
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `Each call gets its own stack frame holding its parameters and locals. Arguments are evaluated in the caller and their values are written into the new frame. The function can only reach variables in its own frame (and globals); it has no name or address for the caller's locals, so it cannot change them. When the function returns, its frame is discarded, which is why locals do not survive between calls.`,
            },
            {
              type: "heading",
              text: "Real-world uses",
              level: 2,
            },
            {
              type: "markdown",
              md: `- **Safety:** call by value means a function cannot accidentally corrupt the caller's data, which makes large programs easier to reason about.
- **Independent modules:** people can name local variables freely without clashing with other functions.
- **Pure functions** (output depends only on parameters, no globals) are easy to test: \`assert(square(3) == 9);\`.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Expecting a function to change the caller's variable",
                  wrong: `void double_it(int x) { x = x * 2; }
...
double_it(n);   /* n is unchanged */`,
                  right: `int double_it(int x) { return x * 2; }
...
n = double_it(n);`,
                  md: "Return the new value and assign it in the caller (or, later, pass a pointer).",
                },
                {
                  title: "Using another function's local variable",
                  wrong: `void compute(void) { int total = 42; }
int main(void) { compute(); printf("%d", total); }  /* error */`,
                  right: `int compute(void) { int total = 42; return total; }
int main(void) { printf("%d", compute()); }`,
                  md: "Locals are visible only inside their own function. Pass data out through the return value.",
                },
                {
                  title: "Arguments in the wrong order",
                  wrong: `double power(double base, int exp);
power(3, 2.0);   /* 3 is base, 2.0 converted to exp... meant 2^3? */`,
                  right: `power(2.0, 3);   /* base first, exponent second */`,
                  md: "Arguments are matched to parameters by position only, not by name.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "Parameters are declared in the function header; arguments are the values passed in a call.",
                "C always uses call by value: parameters are copies of the arguments.",
                "Changing a parameter never changes the caller's variable.",
                "Locals and parameters have block scope and exist only during the call.",
                "Variables with the same name in different functions are different variables.",
              ],
            },
            {
              type: "recap",
              items: [
                "Arguments are evaluated and copied into parameters by position.",
                "Return values are the normal way to send results back.",
                "Each function has its own private local variables.",
                "Avoid globals; prefer parameters and return values.",
              ],
            },
            {
              type: "exercise",
              id: "c12-ex-predict-value",
              kind: "predict",
              title: "Copies everywhere",
              prompt: "Predict the output.\n\n```c\n#include <stdio.h>\n\nint f(int a)\n{\n    a = a * 10;\n    return a + 1;\n}\n\nint main(void)\n{\n    int a = 2, b;\n    b = f(a);\n    printf(\"%d %d\\n\", a, b);\n    b = f(b);\n    printf(\"%d %d\\n\", a, b);\n    return 0;\n}\n```",
              hint: "main's a and f's a are different variables.",
              solution: "First call: f's a becomes 20 and 21 is returned; main's a stays 2. Second call: f(21) returns 211.",
              solutionCode: `#include <stdio.h>

int f(int a)
{
    a = a * 10;
    return a + 1;
}

int main(void)
{
    int a = 2, b;
    b = f(a);
    printf("%d %d\\n", a, b);
    b = f(b);
    printf("%d %d\\n", a, b);
    return 0;
}`,
              expectedOutput: `2 21
2 211`,
            },
            {
              type: "exercise",
              id: "c12-ex-debug-increment",
              kind: "debug",
              title: "The stubborn counter",
              prompt: "This program should print `Score: 3` but prints `Score: 0`. Fix it **without** using global variables or pointers.",
              starterCode: `#include <stdio.h>

void add_point(int score)
{
    score++;
}

int main(void)
{
    int score = 0;
    add_point(score);
    add_point(score);
    add_point(score);
    printf("Score: %d\\n", score);
    return 0;
}`,
              hint: "Make the function return the new score.",
              solution: "add_point increments only its copy. Make it return score + 1 and assign the result.",
              solutionCode: `#include <stdio.h>

int add_point(int score)
{
    return score + 1;
}

int main(void)
{
    int score = 0;
    score = add_point(score);
    score = add_point(score);
    score = add_point(score);
    printf("Score: %d\\n", score);
    return 0;
}`,
              expectedOutput: "Score: 3",
            },
            {
              type: "exercise",
              id: "c12-ex-concept-param-arg",
              kind: "concept",
              title: "Name the parts",
              prompt: "In the code below, list the parameters, the arguments, and the local variables of `area`.\n\n```c\ndouble area(double w, double h) { double a = w * h; return a; }\n...\nresult = area(len + 1, 4.5);\n```",
              solution: "Parameters: `w` and `h`. Arguments: `len + 1` and `4.5`. Local variable of area: `a` (parameters are also local to the function). `result` belongs to the caller.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c12-call-by-value-mcq",
              prompt: "After `void inc(int x) { x++; }` and `int n = 5; inc(n);`, what is n?",
              options: [
                { id: "a", text: "6" },
                { id: "b", text: "5" },
                { id: "c", text: "Undefined" },
                { id: "d", text: "0" },
              ],
              correct: "b",
              explanation: "x is a copy of n; incrementing the copy does not affect n.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c12-scope-output",
              prompt: "What does this print?",
              code: `#include <stdio.h>

int calc(int x, int y)
{
    int z = x - y;
    x = 0;
    return z * 2;
}

int main(void)
{
    int x = 9, y = 4, z = 1;
    z = calc(y, x);
    printf("%d %d %d\\n", x, y, z);
    return 0;
}`,
              expected: "9 4 -10",
              explanation: "Arguments go by position: calc's x = 4 and y = 9, so z = -5 and -10 is returned. main's x and y are unchanged.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c12-local-lifetime-tf",
              prompt: "A normal (non-static) local variable keeps its value from one call of a function to the next.",
              correct: false,
              explanation: "Locals are created on each call and destroyed on return. (static locals, covered in chapter 19, are the exception.)",
            },
            {
              type: "FILL_BLANK",
              slug: "c12-param-fill",
              prompt: "In `int add(int a, int b)`, the variables a and b are called ___ , while the values passed in `add(3, 4)` are called ___ .",
              accepted: [
                ["parameters", "formal parameters", "parameter"],
                ["arguments", "actual arguments", "actual parameters", "argument"],
              ],
            },
          ],
        },
      ],
    },
    {
      slug: "designing-functions",
      title: "Designing with functions",
      lessons: [
        {
          slug: "function-design-decomposition",
          title: "Designing good functions",
          summary:
            "Decompose problems into small single-purpose functions, write predicate functions that return true/false, and let functions call other functions.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Break a problem into small functions that each do one job",
                "Write predicate functions (is_..., has_...) that return 1 or 0",
                "Build functions from other functions (gcd → lcm, power → is_armstrong)",
                "Apply naming and design guidelines to make functions easy to use and test",
              ],
            },
            {
              type: "markdown",
              md: `## Top-down design

Professional programmers rarely write one long \`main\`. They start from the big task and split it into smaller sub-tasks, then split those again until each piece is simple enough to write in a few lines. Each piece becomes a function. This is **top-down design** (also called *stepwise refinement* or *decomposition*).

Example: "print all Armstrong numbers between 100 and 999" (a 3-digit number equal to the sum of the cubes of its digits, like 153 = 1³ + 5³ + 3³).

- *Is this number an Armstrong number?* → \`is_armstrong(n)\`
  - *How many digits does it have?* → \`count_digits(n)\`
  - *What is a digit raised to a power?* → \`power(base, exp)\`

Each function is small, has a clear name, and can be tested on its own.`,
            },
            {
              type: "definition",
              term: "Predicate function",
              md: "A function that answers a yes/no question and returns 1 (true) or 0 (false), conventionally named `is_...` or `has_...`, e.g. `is_prime(n)`. Its call can be used directly as a condition: `if (is_prime(n))`.",
            },
            {
              type: "definition",
              term: "Single responsibility",
              md: "The guideline that each function should do one well-defined job. A function that both computes a result and prints it is harder to reuse than one that only computes and returns it.",
            },
            {
              type: "table",
              caption: "Guidelines for good functions",
              headers: ["Guideline", "Good", "Less good"],
              rows: [
                ["Name says what it does", "average(a, b)", "func1(a, b)"],
                ["One job", "is_prime(n) returns 1/0", "check(n) that tests AND prints"],
                ["Inputs via parameters", "area(w, h)", "area() reading global w, h"],
                ["Outputs via return value", "return total;", "setting a global variable"],
                ["Short", "fits on one screen", "200 lines"],
                ["Separate computing from I/O", "compute in a function, print in main", "printf deep inside a calculation"],
              ],
            },
            {
              type: "syntax",
              language: "c",
              code: `int is_something(int n)      /* predicate: returns 1 or 0 */
{
    if (/* disqualifying test */)
        return 0;
    /* ... */
    return 1;
}

if (is_something(x)) { ... }  /* reads like English */`,
            },
            {
              type: "code",
              language: "c",
              title: "A predicate function: is_prime",
              runnable: true,
              code: `#include <stdio.h>

int is_prime(int n)
{
    int d;
    if (n < 2)
        return 0;
    for (d = 2; d * d <= n; d++)
        if (n % d == 0)
            return 0;
    return 1;
}

int main(void)
{
    int n, count = 0;

    printf("Primes up to 30:");
    for (n = 1; n <= 30; n++) {
        if (is_prime(n)) {
            printf(" %d", n);
            count++;
        }
    }
    printf("\\nThat is %d primes.\\n", count);
    return 0;
}`,
              output: `Primes up to 30: 2 3 5 7 11 13 17 19 23 29
That is 10 primes.`,
              walkthrough: [
                { lines: "3", text: "A predicate: it answers \"is n prime?\" with 1 or 0." },
                { lines: "6-7", text: "Guard clause: rule out the special cases first and return immediately." },
                { lines: "8-10", text: "As soon as a divisor is found, `return 0` exits both the loop and the function. No flag variable or break is needed." },
                { lines: "11", text: "If the loop finishes without finding a divisor, n is prime." },
                { lines: "20", text: "The call reads like a sentence. main doesn't need to know *how* primality is tested." },
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Functions calling functions: gcd and lcm",
              runnable: true,
              stdin: "12 18",
              code: `#include <stdio.h>

int gcd(int a, int b);
int lcm(int a, int b);

int main(void)
{
    int x, y;

    scanf("%d %d", &x, &y);
    printf("gcd = %d\\n", gcd(x, y));
    printf("lcm = %d\\n", lcm(x, y));
    return 0;
}

int gcd(int a, int b)
{
    while (b != 0) {
        int r = a % b;
        a = b;
        b = r;
    }
    return a;
}

int lcm(int a, int b)
{
    return a / gcd(a, b) * b;
}`,
              output: `gcd = 6
lcm = 36`,
              walkthrough: [
                { lines: "3-4", text: "Prototypes first, so main can be written at the top and read like a summary of the program." },
                { lines: "10", text: "Read 12 and 18." },
                { lines: "16-24", text: "Euclid's algorithm: replace (a, b) with (b, a % b) until b is 0. (12, 18) → (18, 12) → (12, 6) → (6, 0), so gcd = 6. Changing the parameters a and b is safe: they are copies." },
                { lines: "26-29", text: "lcm reuses gcd: lcm(a, b) = a / gcd(a, b) × b = 12 / 6 × 18 = 36. Dividing first keeps intermediate values small." },
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Top-down design: Armstrong numbers",
              runnable: true,
              code: `#include <stdio.h>

int power(int base, int exp)
{
    int result = 1;
    int i;
    for (i = 0; i < exp; i++)
        result *= base;
    return result;
}

int count_digits(int n)
{
    int count = 0;
    do {
        count++;
        n /= 10;
    } while (n != 0);
    return count;
}

int is_armstrong(int n)
{
    int digits = count_digits(n);
    int sum = 0, rest = n;
    while (rest > 0) {
        sum += power(rest % 10, digits);
        rest /= 10;
    }
    return sum == n;
}

int main(void)
{
    int n;
    for (n = 100; n <= 999; n++)
        if (is_armstrong(n))
            printf("%d\\n", n);
    return 0;
}`,
              output: `153
370
371
407`,
              walkthrough: [
                { lines: "3-10", text: "power: integer exponentiation by repeated multiplication (avoids floating-point `pow`)." },
                { lines: "12-20", text: "count_digits: a do-while so that 0 counts as 1 digit." },
                { lines: "22-31", text: "is_armstrong combines the helpers: add each digit raised to the number of digits, then compare. `return sum == n;` returns the comparison result (1 or 0) directly." },
                { lines: "33-39", text: "main is now tiny and readable: test every 3-digit number and print the matches." },
              ],
            },
            {
              type: "callout",
              variant: "tip",
              title: "Test functions in isolation",
              md: "Before using a helper inside a bigger program, call it from main with known values: `printf(\"%d\\n\", gcd(12, 18));` should print 6. Bugs are much easier to find in a 5-line function than in a 100-line main.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `A function call is an expression, so a function's result can be fed straight into another function, a condition or an arithmetic expression. That composability is what makes decomposition practical: once \`gcd\` is correct, every function that calls it inherits that correctness. Because each call has its own parameters and locals, helpers can be combined freely without their variables interfering.`,
            },
            {
              type: "heading",
              text: "Real-world uses",
              level: 2,
            },
            {
              type: "markdown",
              md: `- **Validation helpers:** \`is_valid_email\`, \`is_leap_year\`, \`is_in_range\` used across a whole application.
- **Fractions:** \`gcd\` is used to simplify fractions and in cryptography (RSA key generation).
- **Menu-driven programs:** each option is a function; \`main\` only shows the menu and dispatches with a switch.
- **Unit testing:** small functions with clear inputs and outputs are exactly what automated test suites check.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Printing instead of returning",
                  wrong: `void average(int a, int b)
{
    printf("%.1f\\n", (a + b) / 2.0);   /* caller can't use the value */
}`,
                  right: `double average(int a, int b)
{
    return (a + b) / 2.0;
}
/* caller decides: printf("%.1f\\n", average(x, y)); */`,
                  md: "A function that returns its result can be printed, stored, compared or passed on. One that prints can only print.",
                },
                {
                  title: "A predicate that returns too early",
                  wrong: `int is_prime(int n)
{
    int d;
    for (d = 2; d < n; d++)
        if (n % d == 0) return 0;
        else return 1;      /* decides after testing only d = 2! */
    return 1;
}`,
                  right: `int is_prime(int n)
{
    int d;
    if (n < 2) return 0;
    for (d = 2; d * d <= n; d++)
        if (n % d == 0) return 0;
    return 1;               /* only after ALL divisors are tested */
}`,
                  md: "You can return 0 as soon as one divisor is found, but you can only return 1 after every candidate has been checked.",
                },
                {
                  title: "One giant function",
                  wrong: `int main(void)
{
    /* 150 lines: input, validation, calculation, formatting... */
}`,
                  right: `int main(void)
{
    int n = read_positive();
    long result = compute(n);
    print_report(n, result);
    return 0;
}`,
                  md: "Split long code into named steps. main should read like an outline of the program.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "Top-down design: split a task into sub-tasks, each implemented as a function.",
                "Predicate functions return 1/0 and are named is_... or has_....",
                "return sum == n; returns the result of the comparison (1 or 0).",
                "A function can call other functions; prototypes let you define them in any order.",
                "Prefer functions that return values over functions that print results.",
              ],
            },
            {
              type: "recap",
              items: [
                "Good functions are small, well named and do one job.",
                "Predicates make conditions read like English.",
                "Build complex behaviour by combining simple tested functions.",
                "Keep input/output in main or dedicated functions, and calculations separate.",
              ],
            },
            {
              type: "exercise",
              id: "c12-ex-leap-function",
              kind: "write",
              title: "is_leap_year and days_in_month",
              prompt: "Write `int is_leap_year(int y)` and `int days_in_month(int month, int year)` (which uses is_leap_year for February). In main, print the days in February 2024, February 2023 and April 2023:\n\n```\n29\n28\n30\n```",
              hint: "Use a switch on month inside days_in_month: 4, 6, 9, 11 → 30; 2 → 28 or 29; default → 31.",
              solutionCode: `#include <stdio.h>

int is_leap_year(int y)
{
    return (y % 4 == 0 && y % 100 != 0) || y % 400 == 0;
}

int days_in_month(int month, int year)
{
    switch (month) {
    case 2:
        return is_leap_year(year) ? 29 : 28;
    case 4: case 6: case 9: case 11:
        return 30;
    default:
        return 31;
    }
}

int main(void)
{
    printf("%d\\n", days_in_month(2, 2024));
    printf("%d\\n", days_in_month(2, 2023));
    printf("%d\\n", days_in_month(4, 2023));
    return 0;
}`,
              expectedOutput: `29
28
30`,
            },
            {
              type: "exercise",
              id: "c12-ex-predict-compose",
              kind: "predict",
              title: "Composed calls",
              prompt: "Predict the output.\n\n```c\n#include <stdio.h>\n\nint is_even(int n) { return n % 2 == 0; }\n\nint next(int n)\n{\n    if (is_even(n))\n        return n / 2;\n    return 3 * n + 1;\n}\n\nint main(void)\n{\n    int n = 6, steps = 0;\n    while (n != 1) {\n        n = next(n);\n        steps++;\n    }\n    printf(\"%d\\n\", steps);\n    return 0;\n}\n```",
              hint: "Trace: 6 → 3 → 10 → ...",
              solution: "6 → 3 → 10 → 5 → 16 → 8 → 4 → 2 → 1: 8 steps.",
              solutionCode: `#include <stdio.h>

int is_even(int n) { return n % 2 == 0; }

int next(int n)
{
    if (is_even(n))
        return n / 2;
    return 3 * n + 1;
}

int main(void)
{
    int n = 6, steps = 0;
    while (n != 1) {
        n = next(n);
        steps++;
    }
    printf("%d\\n", steps);
    return 0;
}`,
              expectedOutput: "8",
            },
            {
              type: "exercise",
              id: "c12-ex-concept-design",
              kind: "concept",
              title: "Decompose a problem",
              prompt: "A program must read a list of exam marks (ending with -1), and print the average, the highest mark, and how many students passed (mark ≥ 40). Propose a set of functions (names, parameters, return types) for this program and say what main would do.",
              solution: "One reasonable design: `int read_mark(void)` returns the next mark (or -1); `int is_pass(int mark)` returns 1/0; `double average(int sum, int count)` returns sum/count (guarding count 0); `int max_of(int a, int b)`. main loops: read a mark until -1, update sum, count, the running max via max_of, and the pass count via is_pass; then prints the results using average. Computing and printing are kept separate, and each function has one job.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c12-predicate-mcq",
              prompt: "What does `int is_positive(int n) { return n > 0; }` return for n = -3?",
              options: [
                { id: "a", text: "-3" },
                { id: "b", text: "1" },
                { id: "c", text: "0" },
                { id: "d", text: "Nothing; it does not compile" },
              ],
              correct: "c",
              explanation: "n > 0 is false, which has the int value 0, and that value is returned.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c12-gcd-output",
              prompt: "What does this print?",
              code: `#include <stdio.h>

int gcd(int a, int b)
{
    while (b != 0) {
        int r = a % b;
        a = b;
        b = r;
    }
    return a;
}

int main(void)
{
    printf("%d %d %d\\n", gcd(48, 36), gcd(17, 5), gcd(10, 0));
    return 0;
}`,
              expected: "12 1 10",
              explanation: "(48,36)→(36,12)→(12,0) gives 12; 17 and 5 share no factor, so 1; gcd(10, 0) returns 10 immediately.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c12-call-in-function-tf",
              prompt: "A function in C may call other functions, provided they have been declared before the call.",
              correct: true,
              explanation: "Any function can call any other declared function; that is how programs are composed.",
            },
            {
              type: "CODE_WRITING",
              slug: "c12-is-perfect",
              prompt:
                "A **perfect number** equals the sum of its proper divisors (divisors smaller than itself): 6 = 1 + 2 + 3. Write a function `int is_perfect(int n)` that returns 1 if n is perfect and 0 otherwise. In main, read n and print `N is perfect` or `N is not perfect`.",
              starterCode: `#include <stdio.h>

int is_perfect(int n)
{
    /* your code here */
}

int main(void)
{
    int n;
    scanf("%d", &n);
    if (is_perfect(n))
        printf("%d is perfect\\n", n);
    else
        printf("%d is not perfect\\n", n);
    return 0;
}`,
              sampleTests: [
                { stdin: "6", expected: "6 is perfect" },
                { stdin: "12", expected: "12 is not perfect" },
              ],
              hiddenTests: [
                { stdin: "28", expected: "28 is perfect" },
                { stdin: "1", expected: "1 is not perfect" },
                { stdin: "496", expected: "496 is perfect" },
              ],
              solutionCode: `#include <stdio.h>

int is_perfect(int n)
{
    int d, sum = 0;
    if (n < 2)
        return 0;
    for (d = 1; d < n; d++)
        if (n % d == 0)
            sum += d;
    return sum == n;
}

int main(void)
{
    int n;
    scanf("%d", &n);
    if (is_perfect(n))
        printf("%d is perfect\\n", n);
    else
        printf("%d is not perfect\\n", n);
    return 0;
}`,
              explanation: "Sum every divisor smaller than n and compare with n. Numbers below 2 have no proper divisors that add up to themselves, so they are not perfect.",
            },
          ],
        },
      ],
    },
  ],
};

export default chapter;
