import type { ChapterContent } from "../../../src/lib/content/schema";

const chapter: ChapterContent = {
  slug: "operators",
  title: "Operators",
  summary:
    "Operators are the verbs of C: they compute, compare, combine and update values. This chapter covers arithmetic (including % and integer division), assignment, increment/decrement, relational, logical, conditional, bitwise operators and sizeof.",
  topics: [
    {
      slug: "arithmetic-and-assignment",
      title: "Arithmetic, assignment and increment",
      lessons: [
        {
          slug: "arithmetic-assignment-increment-operators",
          title: "Arithmetic, assignment and increment/decrement operators",
          summary:
            "Compute with +, -, *, / and %, understand integer division, update variables with = and compound assignment, and master the difference between x++ and ++x.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Use the five arithmetic operators +, -, *, / and % correctly",
                "Predict the result of integer division and the remainder operator, including with negative numbers",
                "Update variables with = and compound assignment operators such as += and %=",
                "Explain the difference between pre-increment (++x) and post-increment (x++)",
              ],
            },
            {
              type: "markdown",
              md: `## What is an operator?

So far your programs have mostly stored and printed values. To make a program actually *do* something, you need **operators**. An operator is a symbol that tells the compiler to perform an operation on one or more values. The values it works on are called **operands**.

Think of a calculator: the numbers you type are the operands, and the buttons \`+\`, \`-\`, \`×\`, \`÷\` are the operators. C has the same idea, plus many more buttons.

In the expression \`a + b\`, the operator is \`+\` and the operands are \`a\` and \`b\`. The whole thing is an **expression**: something that produces a value.`,
            },
            {
              type: "definition",
              term: "Operator and operand",
              md: "An **operator** is a symbol (such as `+`, `*` or `=`) that performs an operation. An **operand** is a value or variable the operator acts on. A **unary** operator takes one operand (`-x`, `x++`), a **binary** operator takes two (`a * b`), and C's only **ternary** operator takes three (`c ? a : b`).",
            },
            {
              type: "definition",
              term: "Expression",
              md: "Any combination of values, variables, operators and function calls that produces a value. `7`, `x`, `x + 1` and `price * qty - discount` are all expressions.",
            },
            {
              type: "heading",
              text: "The arithmetic operators",
              level: 2,
            },
            {
              type: "table",
              caption: "Arithmetic operators (assume int a = 17, b = 5)",
              headers: ["Operator", "Meaning", "Example", "Result"],
              rows: [
                ["+", "addition", "a + b", "22"],
                ["-", "subtraction (or unary minus)", "a - b", "12"],
                ["*", "multiplication", "a * b", "85"],
                ["/", "division", "a / b", "3 (integer division!)"],
                ["%", "remainder (modulus)", "a % b", "2"],
              ],
            },
            {
              type: "code",
              language: "c",
              title: "All five arithmetic operators",
              runnable: true,
              code: `#include <stdio.h>

int main(void)
{
    int a = 17, b = 5;

    printf("a + b = %d\\n", a + b);
    printf("a - b = %d\\n", a - b);
    printf("a * b = %d\\n", a * b);
    printf("a / b = %d\\n", a / b);
    printf("a %% b = %d\\n", a % b);
    return 0;
}`,
              output: `a + b = 22
a - b = 12
a * b = 85
a / b = 3
a % b = 2`,
              walkthrough: [
                { lines: "1", text: "Include the standard I/O header so we can use `printf`." },
                { lines: "5", text: "Declare two `int` variables. Because both are integers, every result below is an integer too." },
                { lines: "7-9", text: "Addition, subtraction and multiplication behave exactly as in ordinary maths." },
                { lines: "10", text: "`17 / 5` is 3.4 in maths, but with two `int` operands C performs **integer division** and throws away the fractional part, giving 3." },
                { lines: "11", text: "`17 % 5` gives the remainder after dividing: 17 = 5 × 3 + **2**. Inside a `printf` format string, `%%` prints a single `%` sign." },
                { lines: "12", text: "Return 0 to tell the operating system the program finished successfully." },
              ],
            },
            {
              type: "heading",
              text: "Integer division and the remainder operator",
              level: 2,
            },
            {
              type: "markdown",
              md: `When **both** operands of \`/\` are integers, C performs *integer division*: it computes the quotient and **truncates toward zero**, discarding any fraction. It does *not* round. So \`7 / 2\` is \`3\`, \`99 / 100\` is \`0\`, and \`-7 / 2\` is \`-3\`.

If **at least one** operand is a floating-point value (\`float\` or \`double\`), the division is done in floating point: \`7.0 / 2\` is \`3.5\`.

The **remainder operator** \`%\` gives what is left over after integer division. It only works with integer operands (\`7.5 % 2\` is a compile error). The rule that ties \`/\` and \`%\` together is:

> \`(a / b) * b + a % b == a\`  (always true when b is not 0)

That rule tells you the sign of the remainder: in C99 and later, the result of \`%\` has the same sign as the **left** operand. So \`-7 % 2\` is \`-1\` and \`7 % -2\` is \`1\`.`,
            },
            {
              type: "code",
              language: "c",
              title: "Integer division vs. real division",
              runnable: true,
              code: `#include <stdio.h>

int main(void)
{
    int total = 7, count = 2;
    double wrong = total / count;
    double right = (double)total / count;

    printf("wrong average = %.2f\\n", wrong);
    printf("right average = %.2f\\n", right);
    printf("-7 / 2 = %d\\n", -7 / 2);
    printf("-7 %% 2 = %d\\n", -7 % 2);
    return 0;
}`,
              output: `wrong average = 3.00
right average = 3.50
-7 / 2 = -3
-7 % 2 = -1`,
              walkthrough: [
                { lines: "5", text: "Two integers: a total of 7 shared among 2." },
                { lines: "6", text: "`total / count` is evaluated **first**, as integer division, giving 3. Only then is 3 converted to `double` (3.0) and stored. Storing into a `double` variable is too late to save the fraction." },
                { lines: "7", text: "The cast `(double)total` turns 7 into 7.0 *before* dividing, so the division is done in floating point and gives 3.5." },
                { lines: "9-10", text: "`%.2f` prints a `double` with two decimal places, revealing the difference: 3.00 vs 3.50." },
                { lines: "11", text: "-3.5 truncated toward zero is -3 (not -4)." },
                { lines: "12", text: "Check with the rule: (-3) × 2 + r = -7 gives r = -1. The remainder takes the sign of the left operand." },
              ],
            },
            {
              type: "callout",
              variant: "warning",
              title: "Never divide by zero",
              md: "Integer division or remainder by zero (`x / 0`, `x % 0`) is **undefined behaviour**: the program may crash or produce garbage. Always check that a divisor is non-zero before dividing when it comes from user input.",
            },
            {
              type: "heading",
              text: "Assignment and compound assignment",
              level: 2,
            },
            {
              type: "markdown",
              md: `The **assignment operator** \`=\` evaluates the expression on its right and stores the value in the variable on its left. It does *not* mean "equals" as in maths; read \`x = x + 1\` as "x **becomes** x plus 1".

Because updating a variable using its own value is so common, C provides **compound assignment** operators that combine an arithmetic operator with \`=\`. \`x += 5\` means exactly \`x = x + 5\`. Every arithmetic and bitwise operator has a compound form: \`+=\`, \`-=\`, \`*=\`, \`/=\`, \`%=\`, \`&=\`, \`|=\`, \`^=\`, \`<<=\`, \`>>=\`.

An assignment is itself an expression whose value is the value stored. That is why \`a = b = 0;\` works: assignment groups right to left, so \`b = 0\` happens first and its value (0) is then assigned to \`a\`.`,
            },
            {
              type: "syntax",
              language: "c",
              code: `variable = expression;        /* simple assignment          */
variable op= expression;      /* same as: variable = variable op (expression) */

x += 3;    /* x = x + 3 */
x *= y + 1;  /* x = x * (y + 1)  -- note the implied parentheses! */`,
              md: "The right-hand side of a compound assignment is evaluated as a whole first. `x *= y + 1` multiplies `x` by `(y + 1)`, not `x * y + 1`.",
            },
            {
              type: "heading",
              text: "Increment and decrement: ++ and --",
              level: 2,
            },
            {
              type: "markdown",
              md: `Adding or subtracting 1 is so common (counting, stepping through an array) that C has dedicated unary operators: \`++\` adds 1 and \`--\` subtracts 1. Each comes in two forms:

- **Prefix** (\`++x\`): increment first, then use the *new* value in the surrounding expression.
- **Postfix** (\`x++\`): use the *old* value in the surrounding expression, and increment afterwards.

Analogy: a ticket machine. With **post**-increment, you are handed the current ticket number and the counter clicks up after you leave. With **pre**-increment, the counter clicks up first and you receive the new number.

When \`x++;\` or \`++x;\` stands alone as a statement, there is no surrounding expression, so both forms do the same thing.`,
            },
            {
              type: "code",
              language: "c",
              title: "Pre vs. post increment and compound assignment",
              runnable: true,
              code: `#include <stdio.h>

int main(void)
{
    int x = 5;
    int y;

    y = x++;
    printf("after y = x++: x = %d, y = %d\\n", x, y);
    y = ++x;
    printf("after y = ++x: x = %d, y = %d\\n", x, y);
    x += 10;
    printf("after x += 10: x = %d\\n", x);
    x %= 4;
    printf("after x %%= 4: x = %d\\n", x);
    return 0;
}`,
              output: `after y = x++: x = 6, y = 5
after y = ++x: x = 7, y = 7
after x += 10: x = 17
after x %= 4: x = 1`,
              walkthrough: [
                { lines: "5-6", text: "`x` starts at 5; `y` will receive results." },
                { lines: "8", text: "Post-increment: the *old* value of `x` (5) is assigned to `y`, then `x` becomes 6." },
                { lines: "10", text: "Pre-increment: `x` becomes 7 first, then the new value 7 is assigned to `y`." },
                { lines: "12", text: "`x += 10` is shorthand for `x = x + 10`, so 7 + 10 = 17." },
                { lines: "14", text: "`x %= 4` is `x = x % 4`; 17 % 4 = 1." },
                { lines: "15", text: "`%%` in the format string prints a literal `%`." },
              ],
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `Every C expression has a **type**, and the operator chooses its behaviour from the types of its operands. Two \`int\` operands give an \`int\` result, and an \`int\` cannot hold a fraction, so \`/\` must discard it. When one operand is a \`double\`, the other is converted to \`double\` first (the *usual arithmetic conversions*) and real division happens.

\`++\` and \`--\` are not magic either: \`x++\` behaves like "remember the current value, add 1 to \`x\`, hand back the remembered value"; \`++x\` behaves like "add 1 to \`x\`, hand back the new value". The difference only matters when the expression's value is *used*.`,
            },
            {
              type: "heading",
              text: "Real-world uses",
              level: 2,
            },
            {
              type: "markdown",
              md: `- **Converting units:** \`seconds / 60\` gives whole minutes and \`seconds % 60\` gives leftover seconds; the same trick converts cents to dollars and cents.
- **Even/odd tests:** \`n % 2 == 0\` is the classic test for an even number.
- **Extracting digits:** \`n % 10\` gives the last digit of \`n\`, and \`n / 10\` removes it. Credit-card check digits and digit-sum problems use this.
- **Wrapping around:** \`(index + 1) % size\` cycles 0, 1, …, size-1, 0, … as used in circular buffers and clock arithmetic.
- **Counting:** \`count++\` and \`total += value\` appear in almost every loop you will write.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Expecting a fraction from integer division",
                  wrong: `int sum = 7, n = 2;
double avg = sum / n;      /* avg is 3.0 */`,
                  right: `int sum = 7, n = 2;
double avg = (double)sum / n;   /* avg is 3.5 */`,
                  md: "The division happens before the assignment, using integer arithmetic. Cast one operand to `double` *before* dividing.",
                },
                {
                  title: "Using % with floating-point values",
                  wrong: `double x = 7.5;
double r = x % 2;   /* compile error */`,
                  right: `#include <math.h>
double x = 7.5;
double r = fmod(x, 2.0);   /* 1.5 */`,
                  md: "`%` is defined only for integer types. For floating-point remainders use `fmod` from `<math.h>`.",
                },
                {
                  title: "Confusing = with ==",
                  wrong: `if (x = 5)   /* assigns 5, always true */
    printf("five\\n");`,
                  right: `if (x == 5)  /* compares */
    printf("five\\n");`,
                  md: "`=` assigns; `==` compares. Using `=` in a condition stores the value and then tests it, which is almost never what you meant. Compile with warnings enabled to catch this.",
                },
                {
                  title: "Misreading compound assignment",
                  wrong: `x *= y + 1;   /* thinking it means x = x * y + 1 */`,
                  right: `x = x * y + 1;   /* write it out if that is what you mean */`,
                  md: "In `x op= expr`, the whole right-hand side is computed first, so `x *= y + 1` is `x = x * (y + 1)`.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "int / int gives an int: the fraction is truncated toward zero (7/2 = 3, -7/2 = -3).",
                "% works only on integers; the result has the sign of the left operand (-7 % 2 = -1).",
                "(a / b) * b + a % b == a for any int a and non-zero b.",
                "y = x++ assigns the old value; y = ++x assigns the new value.",
                "x op= e means x = x op (e), with e fully evaluated first.",
                "Division or remainder by zero is undefined behaviour.",
              ],
            },
            {
              type: "recap",
              items: [
                "Operators act on operands to form expressions that produce values.",
                "The arithmetic operators are + - * / %, and integer division discards the fraction.",
                "Cast to double before dividing when you need a real-valued result.",
                "= assigns; compound operators like += combine an operation with assignment.",
                "++ and -- add or subtract 1; prefix uses the new value, postfix the old value.",
              ],
            },
            {
              type: "exercise",
              id: "c07-ex-predict-division",
              kind: "predict",
              title: "Predict the arithmetic",
              prompt: "Without running it, write down exactly what this program prints.\n\n```c\n#include <stdio.h>\n\nint main(void)\n{\n    int a = 29, b = 4;\n    printf(\"%d %d\\n\", a / b, a % b);\n    printf(\"%d %d\\n\", -a / b, -a % b);\n    printf(\"%.2f\\n\", a / 4.0);\n    return 0;\n}\n```",
              hint: "29 = 4 × 7 + 1. For negatives, truncate toward zero and let the remainder take the sign of the left operand.",
              solution: "29 / 4 is 7 with remainder 1. -29 / 4 truncates to -7 and the remainder is -1, because (-7) × 4 + (-1) = -29. 29 / 4.0 uses real division: 7.25.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int a = 29, b = 4;
    printf("%d %d\\n", a / b, a % b);
    printf("%d %d\\n", -a / b, -a % b);
    printf("%.2f\\n", a / 4.0);
    return 0;
}`,
              expectedOutput: `7 1
-7 -1
7.25`,
            },
            {
              type: "exercise",
              id: "c07-ex-digits",
              kind: "write",
              title: "Sum of the digits of a 3-digit number",
              prompt: "Write a program that reads a three-digit positive integer and prints the sum of its digits. For input `472` it should print `Sum of digits = 13`. Use only `/` and `%` (no loops yet).",
              hint: "n % 10 gives the last digit. n / 10 % 10 gives the middle digit. n / 100 gives the first digit.",
              solution: "Extract each digit with division and remainder by powers of 10, then add them.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int n = 472;   /* replace with scanf("%d", &n); to read input */
    int ones = n % 10;
    int tens = (n / 10) % 10;
    int hundreds = n / 100;

    printf("Sum of digits = %d\\n", ones + tens + hundreds);
    return 0;
}`,
              expectedOutput: "Sum of digits = 13",
            },
            {
              type: "exercise",
              id: "c07-ex-debug-average",
              kind: "debug",
              title: "Fix the average",
              prompt: "This program should print `Average = 82.33` but prints `Average = 82.00`. Find and fix the bug.",
              starterCode: `#include <stdio.h>

int main(void)
{
    int m1 = 80, m2 = 90, m3 = 77;
    double avg = (m1 + m2 + m3) / 3;
    printf("Average = %.2f\\n", avg);
    return 0;
}`,
              hint: "What type is (m1 + m2 + m3)? What type is 3?",
              solution: "Both operands of / are int, so integer division gives 82. Divide by 3.0 (or cast the sum to double) to get real division.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int m1 = 80, m2 = 90, m3 = 77;
    double avg = (m1 + m2 + m3) / 3.0;
    printf("Average = %.2f\\n", avg);
    return 0;
}`,
              expectedOutput: "Average = 82.33",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c07-int-division-mcq",
              prompt: "What is the value of `19 / 4` in C when both operands are `int`?",
              options: [
                { id: "a", text: "4.75" },
                { id: "b", text: "5" },
                { id: "c", text: "4" },
                { id: "d", text: "3" },
              ],
              correct: "c",
              explanation: "Integer division truncates the fractional part: 4.75 becomes 4. It does not round.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c07-pre-post-output",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

int main(void)
{
    int a = 3, b, c;
    b = a++;
    c = ++a;
    printf("%d %d %d\\n", a, b, c);
    return 0;
}`,
              expected: "5 3 5",
              explanation: "b = a++ stores 3 and makes a 4. c = ++a makes a 5 and stores 5.",
            },
            {
              type: "FILL_BLANK",
              slug: "c07-modulus-fill",
              prompt: "The value of `-17 % 5` in C99 and later is ___ .",
              accepted: [["-2"]],
              explanation: "-17 / 5 truncates to -3, and (-3) × 5 + r = -17 gives r = -2.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c07-compound-tf",
              prompt: "`x *= 2 + 3;` sets x to x * 2 + 3.",
              correct: false,
              explanation: "The right-hand side is evaluated first: x = x * (2 + 3) = x * 5.",
            },
            {
              type: "CODE_WRITING",
              slug: "c07-seconds-to-hms",
              prompt:
                "Read a non-negative integer number of seconds from standard input and print it as hours, minutes and seconds in the format `H h M min S s`. For example, `3725` prints `1 h 2 min 5 s`. Use `/` and `%`.",
              starterCode: `#include <stdio.h>

int main(void)
{
    int total;
    scanf("%d", &total);
    /* your code here */
    return 0;
}`,
              sampleTests: [
                { stdin: "3725", expected: "1 h 2 min 5 s" },
                { stdin: "59", expected: "0 h 0 min 59 s" },
              ],
              hiddenTests: [
                { stdin: "0", expected: "0 h 0 min 0 s" },
                { stdin: "86399", expected: "23 h 59 min 59 s" },
                { stdin: "7200", expected: "2 h 0 min 0 s" },
              ],
              solutionCode: `#include <stdio.h>

int main(void)
{
    int total;
    scanf("%d", &total);
    int hours = total / 3600;
    int minutes = (total % 3600) / 60;
    int seconds = total % 60;
    printf("%d h %d min %d s\\n", hours, minutes, seconds);
    return 0;
}`,
              explanation: "There are 3600 seconds in an hour. total / 3600 gives whole hours; the leftover (total % 3600) divided by 60 gives minutes; total % 60 gives the remaining seconds.",
            },
          ],
        },
      ],
    },
    {
      slug: "comparison-and-logic",
      title: "Comparison, logic and choice",
      lessons: [
        {
          slug: "relational-logical-conditional-operators",
          title: "Relational, logical and conditional operators",
          summary:
            "Compare values with relational operators, combine conditions with &&, || and !, understand short-circuit evaluation, and choose between two values with ?:.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Use the six relational operators and know that they produce 1 or 0",
                "Combine conditions with &&, || and ! and build truth tables",
                "Explain short-circuit evaluation and use it to write safe conditions",
                "Use the conditional operator ?: to choose between two values",
              ],
            },
            {
              type: "markdown",
              md: `## Asking questions in C

Programs constantly ask yes/no questions: *Is the password correct? Is the balance enough? Is the user an adult?* **Relational operators** ask how two values compare, and **logical operators** combine several answers into one.

C (before C99's \`bool\`) has no separate true/false type in expressions. Instead it uses integers:

- A comparison that is true produces **1**; a false comparison produces **0**.
- When C *tests* a value (in \`if\`, \`while\`, \`&&\`, ...), **0 means false and any non-zero value means true**.

So \`5 > 3\` has the value 1, and you can even print it with \`%d\`.`,
            },
            {
              type: "definition",
              term: "Relational operator",
              md: "An operator that compares two values and yields `1` (true) or `0` (false): `==` equal, `!=` not equal, `<`, `>`, `<=`, `>=`.",
            },
            {
              type: "definition",
              term: "Logical operator",
              md: "An operator that combines truth values: `&&` (AND: true if both are true), `||` (OR: true if at least one is true), `!` (NOT: flips true and false). The result is always `1` or `0`.",
            },
            {
              type: "table",
              caption: "Truth table (0 = false, 1 = true)",
              headers: ["A", "B", "A && B", "A || B", "!A"],
              rows: [
                ["0", "0", "0", "0", "1"],
                ["0", "1", "0", "1", "1"],
                ["1", "0", "0", "1", "0"],
                ["1", "1", "1", "1", "0"],
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Relational and logical operators produce 1 or 0",
              runnable: true,
              code: `#include <stdio.h>

int main(void)
{
    int a = 10, b = 20;

    printf("a == b : %d\\n", a == b);
    printf("a != b : %d\\n", a != b);
    printf("a <  b : %d\\n", a < b);
    printf("a >= b : %d\\n", a >= b);
    printf("(a < b) && (b < 30) : %d\\n", (a < b) && (b < 30));
    printf("(a > b) || (b == 20) : %d\\n", (a > b) || (b == 20));
    printf("!(a < b) : %d\\n", !(a < b));
    return 0;
}`,
              output: `a == b : 0
a != b : 1
a <  b : 1
a >= b : 0
(a < b) && (b < 30) : 1
(a > b) || (b == 20) : 1
!(a < b) : 0`,
              walkthrough: [
                { lines: "5", text: "Two values to compare." },
                { lines: "7-10", text: "Each comparison is an expression of type `int` whose value is 1 or 0, so it can be printed with `%d`." },
                { lines: "11", text: "Both sides are true (10 < 20 and 20 < 30), so `&&` gives 1." },
                { lines: "12", text: "The left side is false but the right side is true; `||` needs only one true side, so it gives 1." },
                { lines: "13", text: "`a < b` is 1, and `!` flips it to 0." },
              ],
            },
            {
              type: "heading",
              text: "Short-circuit evaluation",
              level: 2,
            },
            {
              type: "markdown",
              md: `\`&&\` and \`||\` always evaluate their **left** operand first, and they stop as soon as the answer is known:

- For \`A && B\`: if \`A\` is false, the whole thing must be false, so **\`B\` is never evaluated**.
- For \`A || B\`: if \`A\` is true, the whole thing must be true, so **\`B\` is never evaluated**.

This is called **short-circuit evaluation**. It is a guarantee of the language, not an optimisation the compiler may or may not do. It lets you put a *guard* on the left that protects a dangerous test on the right, such as \`x != 0 && 10 / x > 1\`.

Analogy: a bouncer checks your ID first. If you are under age, there is no point checking whether your name is on the guest list.`,
            },
            {
              type: "code",
              language: "c",
              title: "Short-circuiting in action",
              runnable: true,
              code: `#include <stdio.h>

int main(void)
{
    int count = 0;
    int x = 0;

    if (x != 0 && 10 / x > 1)
        printf("big\\n");
    else
        printf("skipped the division safely\\n");

    if (x == 0 || ++count > 0)
        printf("count = %d\\n", count);

    if (x == 1 && ++count > 0)
        printf("never printed\\n");
    printf("count is still %d\\n", count);
    return 0;
}`,
              output: `skipped the division safely
count = 0
count is still 0`,
              walkthrough: [
                { lines: "5-6", text: "`count` lets us observe whether the right-hand side runs; `x` is 0 on purpose." },
                { lines: "8", text: "`x != 0` is false, so `&&` stops immediately. The division `10 / x` (which would divide by zero) is never executed." },
                { lines: "13", text: "`x == 0` is true, so `||` already knows the answer is true. `++count` is skipped, and `count` stays 0." },
                { lines: "16", text: "`x == 1` is false, so again `++count` is skipped." },
                { lines: "18", text: "Proof: `count` was never incremented." },
              ],
            },
            {
              type: "callout",
              variant: "tip",
              title: "Order your conditions",
              md: "Put the cheap or protective test on the left of `&&`: check that a divisor is non-zero, an index is in range, or a pointer is not NULL *before* using it on the right.",
            },
            {
              type: "heading",
              text: "The conditional operator ?:",
              level: 2,
            },
            {
              type: "syntax",
              language: "c",
              code: `condition ? value_if_true : value_if_false`,
              md: "The condition is evaluated first. If it is non-zero, the result is the second operand; otherwise it is the third. Only one of the two values is evaluated.",
            },
            {
              type: "markdown",
              md: `The **conditional operator** (often called the *ternary operator*, because it is C's only operator with three operands) is a compact way to choose between two **values**. It is an expression, so you can use it inside assignments and function calls, which a plain \`if\` statement cannot do.

Use it for short, simple choices. For anything with side effects or more than two outcomes, an \`if\` statement (next chapters) is clearer.`,
            },
            {
              type: "code",
              language: "c",
              title: "Choosing values with ?:",
              runnable: true,
              code: `#include <stdio.h>

int main(void)
{
    int a = 42, b = 17;
    int marks = 38;
    int max = (a > b) ? a : b;

    printf("max = %d\\n", max);
    printf("Result: %s\\n", (marks >= 40) ? "PASS" : "FAIL");
    printf("%d is %s\\n", b, (b % 2 == 0) ? "even" : "odd");
    return 0;
}`,
              output: `max = 42
Result: FAIL
17 is odd`,
              walkthrough: [
                { lines: "7", text: "`a > b` is true, so the expression's value is `a` (42), which is stored in `max`." },
                { lines: "10", text: "38 >= 40 is false, so the third operand, the string \"FAIL\", is passed to `printf`'s `%s`." },
                { lines: "11", text: "17 % 2 is 1, so `b % 2 == 0` is false and \"odd\" is chosen." },
              ],
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `Because truth is just an integer, all of these operators fit neatly into C's expression system: comparisons produce \`int\` values, logical operators consume and produce \`int\` values, and \`?:\` consumes a truth value to select another value. The C standard defines a **sequence point** after the left operand of \`&&\`, \`||\` and after the condition of \`?:\`. That is what *guarantees* the left side is completely finished before the right side is even considered, which is why short-circuit guards are safe.`,
            },
            {
              type: "heading",
              text: "Real-world uses",
              level: 2,
            },
            {
              type: "markdown",
              md: `- **Input validation:** \`age >= 18 && age <= 120\` checks a range.
- **Access rules:** \`isAdmin || isOwner\` grants permission if either is true.
- **Safe guards:** \`count > 0 && total / count > 50\` avoids division by zero.
- **Formatting output:** \`printf("%d item%s", n, n == 1 ? "" : "s")\` prints "1 item" but "3 items".`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Writing a range like in maths",
                  wrong: `if (0 < x < 10)   /* always true! */`,
                  right: `if (0 < x && x < 10)`,
                  md: "`0 < x < 10` is parsed as `(0 < x) < 10`. The first part is 0 or 1, and both are less than 10, so the test is always true. Combine two comparisons with `&&`.",
                },
                {
                  title: "Using & or | instead of && or ||",
                  wrong: `if (x != 0 & 10 / x > 1)   /* no short-circuit */`,
                  right: `if (x != 0 && 10 / x > 1)`,
                  md: "`&` and `|` are *bitwise* operators: they always evaluate both sides, so the division runs even when x is 0. Use `&&` and `||` for logic.",
                },
                {
                  title: "Comparing floating-point values with ==",
                  wrong: `double d = 0.1 + 0.2;
if (d == 0.3) ...   /* false! */`,
                  right: `#include <math.h>
if (fabs(d - 0.3) < 1e-9) ...`,
                  md: "Many decimal fractions cannot be stored exactly in binary, so tiny rounding errors appear. Compare floating-point values against a small tolerance instead.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "Relational and logical operators yield int 1 (true) or 0 (false).",
                "When tested, 0 is false and every non-zero value is true.",
                "&& and || evaluate left to right and short-circuit; the right operand may never run.",
                "a < b < c does not test a range; write a < b && b < c.",
                "?: evaluates only one of its last two operands and is an expression, not a statement.",
              ],
            },
            {
              type: "recap",
              items: [
                "Six relational operators: == != < > <= >=.",
                "&& (and), || (or), ! (not) combine conditions.",
                "Short-circuiting lets the left condition guard the right one.",
                "cond ? a : b picks a value in a single expression.",
              ],
            },
            {
              type: "exercise",
              id: "c07-ex-leap-year",
              kind: "write",
              title: "Leap year as a single expression",
              prompt: "A year is a leap year if it is divisible by 4 but not by 100, or if it is divisible by 400. Write a program that prints whether 1900, 2000 and 2024 are leap years, using one logical expression and `?:`. Expected output:\n\n```\n1900: not leap\n2000: leap\n2024: leap\n```",
              hint: "(y % 4 == 0 && y % 100 != 0) || y % 400 == 0",
              solution: "Combine the rules with && and ||, then use ?: to choose between the two strings.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int years[3] = {1900, 2000, 2024};
    int i;

    for (i = 0; i < 3; i++) {
        int y = years[i];
        int leap = (y % 4 == 0 && y % 100 != 0) || y % 400 == 0;
        printf("%d: %s\\n", y, leap ? "leap" : "not leap");
    }
    return 0;
}`,
              expectedOutput: `1900: not leap
2000: leap
2024: leap`,
            },
            {
              type: "exercise",
              id: "c07-ex-predict-short-circuit",
              kind: "predict",
              title: "Who gets incremented?",
              prompt: "Predict the output.\n\n```c\n#include <stdio.h>\n\nint main(void)\n{\n    int a = 1, b = 1;\n    int r = (a > 5) && (++b > 0);\n    int s = (a > 0) || (++b > 0);\n    printf(\"%d %d %d\\n\", r, s, b);\n    return 0;\n}\n```",
              hint: "Ask whether the left operand alone already decides each result.",
              solution: "a > 5 is false, so && skips ++b and r = 0. a > 0 is true, so || skips ++b and s = 1. b is still 1.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int a = 1, b = 1;
    int r = (a > 5) && (++b > 0);
    int s = (a > 0) || (++b > 0);
    printf("%d %d %d\\n", r, s, b);
    return 0;
}`,
              expectedOutput: "0 1 1",
            },
            {
              type: "exercise",
              id: "c07-ex-concept-range",
              kind: "concept",
              title: "Why is this always true?",
              prompt: "A student writes `if (18 <= age <= 60)` to check that age is between 18 and 60. Explain why the condition is true even for `age = 5`, and write the correct condition.",
              solution: "It is parsed as `(18 <= age) <= 60`. For age = 5, `18 <= 5` is 0, and `0 <= 60` is 1, so the condition is true. In fact it is true for every age, because the first part is always 0 or 1. The correct condition is `age >= 18 && age <= 60`.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c07-short-circuit-mcq",
              prompt: "In `if (n != 0 && total / n > 10)`, what happens when `n` is 0?",
              options: [
                { id: "a", text: "The program crashes with division by zero" },
                { id: "b", text: "total / n is never evaluated, and the condition is false" },
                { id: "c", text: "The condition is true" },
                { id: "d", text: "It is a compile error" },
              ],
              correct: "b",
              explanation: "&& short-circuits: the left side is false, so the right side (the division) is skipped.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c07-relational-values-output",
              prompt: "What does this print?",
              code: `#include <stdio.h>

int main(void)
{
    int x = 7;
    printf("%d %d %d\\n", x > 5, x == 8, !x);
    printf("%d\\n", (x > 5) + (x < 10));
    return 0;
}`,
              expected: "1 0 0\n2",
              explanation: "True comparisons are 1 and false ones 0. !7 is 0 because 7 is non-zero. 1 + 1 = 2.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c07-range-tf",
              prompt: "In C, `if (1 < x < 5)` correctly checks whether x is between 1 and 5.",
              correct: false,
              explanation: "It is evaluated as (1 < x) < 5, which is always true because 0 and 1 are both less than 5.",
            },
            {
              type: "FILL_BLANK",
              slug: "c07-ternary-fill",
              prompt: "Complete the expression so that `min` gets the smaller of a and b: `min = (a < b) ___ a ___ b;`",
              accepted: [["?"], [":"]],
              explanation: "The conditional operator has the form condition ? value_if_true : value_if_false.",
            },
          ],
        },
      ],
    },
    {
      slug: "bits-and-sizes",
      title: "Bitwise operators and sizeof",
      lessons: [
        {
          slug: "bitwise-operators-and-sizeof",
          title: "Bitwise operators and the sizeof operator",
          summary:
            "Work directly with the bits of an integer using &, |, ^, ~, << and >>, and measure the size of types and variables with sizeof.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Write small numbers in binary and apply &, |, ^ and ~ bit by bit",
                "Use << and >> to shift bits and relate shifts to multiplying/dividing by 2",
                "Set, clear, toggle and test individual bits using masks",
                "Use sizeof to find the size of a type, variable or array, and compute an array's length",
              ],
            },
            {
              type: "markdown",
              md: `## Looking inside an integer

Inside the computer, an \`int\` is a row of bits (binary digits, 0 or 1). The number 12 is stored as \`...00001100\`, and 10 as \`...00001010\`. **Bitwise operators** work on these bits directly, column by column, like comparing two rows of light switches.

Each position has a weight that is a power of 2. Reading from the right: 1, 2, 4, 8, 16, ... So \`1100\` is 8 + 4 = 12 and \`1010\` is 8 + 2 = 10.

Bitwise operators are used in device drivers, network protocols, graphics, compression, and anywhere many yes/no flags are packed into one number. For beginners, use them on **unsigned** integers: the results are then fully defined and easy to reason about.`,
            },
            {
              type: "definition",
              term: "Bit and mask",
              md: "A **bit** is a single binary digit, 0 or 1. Bit *n* has the value 2ⁿ. A **mask** is a number with 1s in the positions you are interested in, such as `1u << 3` (binary 1000) for bit 3.",
            },
            {
              type: "table",
              caption: "Bitwise operators with a = 12 (1100) and b = 10 (1010)",
              headers: ["Operator", "Name", "Rule for each bit", "Example", "Result"],
              rows: [
                ["&", "AND", "1 only if both bits are 1", "a & b", "1000 = 8"],
                ["|", "OR", "1 if either bit is 1", "a | b", "1110 = 14"],
                ["^", "XOR", "1 if the bits differ", "a ^ b", "0110 = 6"],
                ["~", "NOT (complement)", "flips every bit", "~a & 0xF", "0011 = 3"],
                ["<<", "left shift", "moves bits left, fills with 0", "a << 2", "110000 = 48"],
                [">>", "right shift", "moves bits right", "a >> 2", "11 = 3"],
              ],
            },
            {
              type: "code",
              language: "c",
              title: "The six bitwise operators",
              runnable: true,
              code: `#include <stdio.h>

int main(void)
{
    unsigned int a = 12;   /* binary 1100 */
    unsigned int b = 10;   /* binary 1010 */

    printf("a & b  = %u\\n", a & b);
    printf("a | b  = %u\\n", a | b);
    printf("a ^ b  = %u\\n", a ^ b);
    printf("a << 2 = %u\\n", a << 2);
    printf("a >> 2 = %u\\n", a >> 2);
    printf("~a & 0xF = %u\\n", ~a & 0xFu);
    return 0;
}`,
              output: `a & b  = 8
a | b  = 14
a ^ b  = 6
a << 2 = 48
a >> 2 = 3
~a & 0xF = 3`,
              walkthrough: [
                { lines: "5-6", text: "Use `unsigned int` so every bit is an ordinary value bit; `%u` prints an unsigned value." },
                { lines: "8", text: "1100 & 1010: only the leftmost column has 1 in both, giving 1000 = 8." },
                { lines: "9", text: "1100 | 1010 = 1110 = 14: a column is 1 if either row has a 1." },
                { lines: "10", text: "1100 ^ 1010 = 0110 = 6: a column is 1 where the bits differ." },
                { lines: "11", text: "Shifting left by 2 appends two zeros: 110000 = 48, which is 12 × 4." },
                { lines: "12", text: "Shifting right by 2 drops the two rightmost bits: 11 = 3, which is 12 / 4." },
                { lines: "13", text: "`~a` flips *all* 32 (typically) bits, giving a huge number. Masking with `0xF` (binary 1111) keeps only the lowest 4 bits: 0011 = 3." },
              ],
            },
            {
              type: "callout",
              variant: "note",
              title: "Signed values and shifts",
              md: "For **signed** negative numbers, `>>` is implementation-defined (most compilers copy the sign bit), and left-shifting a negative value or shifting by a count ≥ the width of the type is undefined. `~5` on an `int` is `-6` on all common machines (two's complement). Stick to unsigned types for bit manipulation.",
            },
            {
              type: "heading",
              text: "Setting, clearing, toggling and testing bits",
              level: 2,
            },
            {
              type: "syntax",
              language: "c",
              code: `x |=  (1u << n);    /* set bit n to 1      */
x &= ~(1u << n);    /* clear bit n to 0    */
x ^=  (1u << n);    /* toggle bit n        */
if (x & (1u << n))  /* test: non-zero if bit n is 1 */`,
              md: "These four idioms are worth memorising. `1u << n` builds a mask with only bit n set.",
            },
            {
              type: "code",
              language: "c",
              title: "Using bits as on/off flags",
              runnable: true,
              code: `#include <stdio.h>

int main(void)
{
    unsigned int flags = 0;

    flags = flags | (1u << 0);   /* turn on bit 0 */
    flags = flags | (1u << 3);   /* turn on bit 3 */
    printf("after setting bits 0 and 3: %u\\n", flags);

    if (flags & (1u << 3))
        printf("bit 3 is ON\\n");

    flags = flags & ~(1u << 0);  /* turn off bit 0 */
    printf("after clearing bit 0: %u\\n", flags);

    flags = flags ^ (1u << 1);   /* toggle bit 1 */
    printf("after toggling bit 1: %u\\n", flags);
    printf("7 is %s\\n", (7 & 1) ? "odd" : "even");
    return 0;
}`,
              output: `after setting bits 0 and 3: 9
bit 3 is ON
after clearing bit 0: 8
after toggling bit 1: 10
7 is odd`,
              walkthrough: [
                { lines: "5", text: "All flags start off (every bit 0)." },
                { lines: "7-9", text: "OR-ing with a mask turns that bit on without disturbing the others: 0001 | 1000 = 1001 = 9." },
                { lines: "11-12", text: "AND with a mask is non-zero only if that bit is on, so this is a test." },
                { lines: "14-15", text: "`~(1u << 0)` is all ones except bit 0; AND-ing clears just bit 0: 1001 becomes 1000 = 8." },
                { lines: "17-18", text: "XOR flips bit 1: 1000 becomes 1010 = 10." },
                { lines: "19", text: "The lowest bit of an odd number is always 1, so `n & 1` is a fast odd/even test." },
              ],
            },
            {
              type: "heading",
              text: "The sizeof operator",
              level: 2,
            },
            {
              type: "markdown",
              md: `\`sizeof\` looks like a function, but it is an **operator** evaluated by the compiler. It gives the number of **bytes** a type or an object occupies. You can write \`sizeof(int)\` for a type (parentheses required) or \`sizeof x\` for a variable (parentheses optional).

The result has type \`size_t\`, an unsigned integer type. To print it portably you would use \`%zu\`; in this course we often cast it to \`int\` and use \`%d\`, which is safe for small sizes.

Sizes are **platform-dependent** except for \`char\`, which is always exactly 1 byte. Typical values on today's desktop computers: \`int\` 4, \`double\` 8, \`float\` 4, \`long\` 4 or 8. A very useful trick that works everywhere is computing the number of elements in an array:

\`sizeof(arr) / sizeof(arr[0])\``,
            },
            {
              type: "definition",
              term: "sizeof",
              md: "A compile-time operator that yields the size in bytes of a type or expression, as a value of type `size_t`. The operand of `sizeof` is not evaluated (except for variable-length arrays), so `sizeof(x++)` does **not** change x.",
            },
            {
              type: "code",
              language: "c",
              title: "sizeof and array length",
              runnable: true,
              code: `#include <stdio.h>

int main(void)
{
    int marks[5] = {70, 85, 90, 65, 88};
    int n = (int)(sizeof(marks) / sizeof(marks[0]));
    char c = 'A';

    printf("sizeof(char) = %d\\n", (int)sizeof(char));
    printf("sizeof c = %d\\n", (int)sizeof c);
    printf("marks has %d elements\\n", n);
    return 0;
}`,
              output: `sizeof(char) = 1
sizeof c = 1
marks has 5 elements`,
              walkthrough: [
                { lines: "5", text: "An array of five `int` values." },
                { lines: "6", text: "`sizeof(marks)` is the whole array's size (5 × size of an int); dividing by the size of one element gives 5 on every platform." },
                { lines: "9", text: "`char` is 1 byte by definition. The cast to `int` lets us print with `%d`." },
                { lines: "10", text: "For a variable, the parentheses are optional: `sizeof c`." },
                { lines: "11", text: "Prints the element count computed on line 6." },
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Sizes on your machine (output varies)",
              runnable: true,
              code: `#include <stdio.h>

int main(void)
{
    printf("int:    %d bytes\\n", (int)sizeof(int));
    printf("float:  %d bytes\\n", (int)sizeof(float));
    printf("double: %d bytes\\n", (int)sizeof(double));
    printf("long:   %d bytes\\n", (int)sizeof(long));
    return 0;
}`,
              walkthrough: [
                { lines: "5-8", text: "Run this to see the sizes on your own system. Typical results are 4, 4, 8 and either 4 (Windows) or 8 (64-bit Linux/macOS) for long. No expected output is given because it depends on the platform." },
              ],
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `Bitwise operators map directly to single machine instructions that process all bits of a word in parallel, which is why they are so fast. Shifting left by *n* multiplies an unsigned value by 2ⁿ for the same reason that appending a zero to a decimal number multiplies it by 10: each position is worth twice the one to its right.

\`sizeof\` works at compile time because the compiler already knows the layout of every type. It simply replaces \`sizeof(int)\` with a constant, so using it costs nothing at run time.`,
            },
            {
              type: "heading",
              text: "Real-world uses",
              level: 2,
            },
            {
              type: "markdown",
              md: `- **File permissions** on Linux are bit flags: read = 4, write = 2, execute = 1, combined with \`|\`.
- **Hardware registers** in embedded systems are controlled by setting and clearing individual bits.
- **Colours:** a 24-bit RGB colour \`0xRRGGBB\` is unpacked with \`(c >> 16) & 0xFF\` for red.
- **Memory allocation:** \`malloc(n * sizeof(int))\` (chapter 20) asks for exactly enough bytes for n ints.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Using ^ for powers",
                  wrong: `int sq = 5 ^ 2;   /* 7, not 25! */`,
                  right: `int sq = 5 * 5;   /* or pow(5, 2) from <math.h> */`,
                  md: "In C, `^` is bitwise XOR, not exponentiation. 101 ^ 010 = 111 = 7.",
                },
                {
                  title: "Confusing & with &&",
                  wrong: `if (flags & 4 == 4)   /* parsed as flags & (4 == 4) */`,
                  right: `if ((flags & 4) == 4)`,
                  md: "`==` has higher precedence than `&`, so always parenthesise bitwise expressions inside comparisons. (Precedence is covered in the next chapter.)",
                },
                {
                  title: "Using sizeof on an array parameter",
                  wrong: `void f(int arr[]) {
    int n = sizeof(arr) / sizeof(arr[0]);  /* wrong count */
}`,
                  right: `void f(int arr[], int n) {
    /* pass the length in explicitly */
}`,
                  md: "Inside a function, an array parameter is really a pointer, so `sizeof(arr)` is the size of a pointer. The array-length trick only works where the array itself is declared. You will see why in the pointers chapters.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "& | ^ work bit by bit; ~ flips all bits; ^ is XOR, not power.",
                "For unsigned x, x << n equals x × 2ⁿ and x >> n equals x / 2ⁿ (while no bits overflow).",
                "Set: x |= m; clear: x &= ~m; toggle: x ^= m; test: x & m.",
                "sizeof is an operator evaluated at compile time; sizeof(char) is always 1.",
                "Array length: sizeof(arr) / sizeof(arr[0]), only where the array is declared.",
              ],
            },
            {
              type: "recap",
              items: [
                "Integers are rows of bits; bitwise operators process them column by column.",
                "Shifts move bits left or right, multiplying or dividing by powers of 2.",
                "Masks built with 1u << n let you control single bits.",
                "sizeof gives sizes in bytes; most sizes depend on the platform.",
              ],
            },
            {
              type: "exercise",
              id: "c07-ex-predict-bits",
              kind: "predict",
              title: "Bitwise by hand",
              prompt: "Predict the output, working in binary.\n\n```c\n#include <stdio.h>\n\nint main(void)\n{\n    unsigned int x = 6, y = 3;\n    printf(\"%u %u %u\\n\", x & y, x | y, x ^ y);\n    printf(\"%u %u\\n\", x << 3, x >> 1);\n    return 0;\n}\n```",
              hint: "6 is 110 and 3 is 011.",
              solution: "110 & 011 = 010 = 2; 110 | 011 = 111 = 7; 110 ^ 011 = 101 = 5; 6 << 3 = 48; 6 >> 1 = 3.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    unsigned int x = 6, y = 3;
    printf("%u %u %u\\n", x & y, x | y, x ^ y);
    printf("%u %u\\n", x << 3, x >> 1);
    return 0;
}`,
              expectedOutput: `2 7 5
48 3`,
            },
            {
              type: "exercise",
              id: "c07-ex-rgb",
              kind: "write",
              title: "Unpack a colour",
              prompt: "The colour `0x1E90FF` (dodger blue) stores red, green and blue in 8 bits each. Write a program that extracts and prints the three components as `R=30 G=144 B=255`.",
              hint: "Red is (c >> 16) & 0xFF, green is (c >> 8) & 0xFF, blue is c & 0xFF.",
              solution: "Shift the wanted byte down to the lowest 8 bits, then mask with 0xFF.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    unsigned int c = 0x1E90FF;
    unsigned int r = (c >> 16) & 0xFF;
    unsigned int g = (c >> 8) & 0xFF;
    unsigned int b = c & 0xFF;

    printf("R=%u G=%u B=%u\\n", r, g, b);
    return 0;
}`,
              expectedOutput: "R=30 G=144 B=255",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c07-xor-mcq",
              prompt: "What is the value of `5 ^ 2` in C?",
              options: [
                { id: "a", text: "25" },
                { id: "b", text: "7" },
                { id: "c", text: "10" },
                { id: "d", text: "3" },
              ],
              correct: "b",
              explanation: "^ is bitwise XOR: 101 ^ 010 = 111 = 7.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c07-bit-flags-output",
              prompt: "What does this print?",
              code: `#include <stdio.h>

int main(void)
{
    unsigned int f = 5;
    f |= 1u << 1;
    f &= ~(1u << 2);
    printf("%u\\n", f);
    return 0;
}`,
              expected: "3",
              explanation: "5 is 101. Setting bit 1 gives 111 = 7. Clearing bit 2 gives 011 = 3.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c07-sizeof-char-tf",
              prompt: "`sizeof(char)` is 1 on every C implementation.",
              correct: true,
              explanation: "The standard defines sizeof(char) as 1. Other sizes vary by platform.",
            },
            {
              type: "FILL_BLANK",
              slug: "c07-array-length-fill",
              prompt: "For `double v[8];`, the expression `sizeof(v) / sizeof(___)` gives 8.",
              accepted: [["v[0]", "double", "*v"]],
              explanation: "Divide the total size by the size of one element.",
            },
          ],
        },
      ],
    },
  ],
};

export default chapter;
