import type { ChapterContent } from "../../../src/lib/content/schema";

const chapter: ChapterContent = {
  slug: "conditionals",
  title: "Decision Making: if and switch",
  summary:
    "Make programs choose what to do: if, if-else, else-if ladders, nested conditions, the switch statement with break, fall-through and default, and how to pick the right construct.",
  topics: [
    {
      slug: "if-statements",
      title: "The if family",
      lessons: [
        {
          slug: "if-and-if-else",
          title: "if and if-else",
          summary:
            "Run code only when a condition is true with if, choose between two paths with if-else, and use braces to group statements safely.",
          estMinutes: 25,
          blocks: [
            {
              type: "objectives",
              items: [
                "Write if and if-else statements with correct syntax",
                "Explain how C decides whether a condition is true (non-zero) or false (zero)",
                "Use braces to group several statements into one block",
                "Avoid the classic mistakes: stray semicolons, = instead of ==, missing braces",
              ],
            },
            {
              type: "markdown",
              md: `## Programs that make choices

Until now, every program you wrote ran its statements from top to bottom, one after another, every time. Real programs need to react: *if* the password is wrong, show an error; *if* the balance is too low, refuse the withdrawal; *otherwise*, continue.

C's \`if\` statement is a fork in the road. The program evaluates a **condition**; if it is true it takes one path, and (with \`else\`) if it is false it takes the other. Afterwards, both paths join up again and the program continues with the next statement.

Remember from the operators chapter: in C a condition is just an expression. **Zero means false; any non-zero value means true.**`,
            },
            {
              type: "definition",
              term: "Condition",
              md: "The expression inside the parentheses of `if (...)`. It is evaluated and compared with zero: non-zero means the condition holds (true), zero means it does not (false).",
            },
            {
              type: "definition",
              term: "Compound statement (block)",
              md: "A group of statements enclosed in braces `{ ... }`. C treats a block as a single statement, so it can be used anywhere one statement is expected, such as the body of an `if`.",
            },
            {
              type: "syntax",
              language: "c",
              code: `if (condition)
    statement;          /* runs only if condition is true */

if (condition) {
    statements...       /* several statements need braces */
}

if (condition) {
    statements...       /* condition true  */
} else {
    statements...       /* condition false */
}`,
              md: "Without braces, an `if` controls exactly **one** statement: the next one. Using braces every time is a widely recommended habit.",
            },
            {
              type: "code",
              language: "c",
              title: "Simple if statements",
              runnable: true,
              code: `#include <stdio.h>

int main(void)
{
    int temperature = -5;
    int distance = -12;

    if (distance < 0)
        distance = -distance;
    printf("distance = %d\\n", distance);

    if (temperature < 0) {
        printf("Freezing!\\n");
        printf("Wear a coat.\\n");
    }
    if (temperature > 30)
        printf("Hot day\\n");
    printf("Temperature: %d\\n", temperature);
    return 0;
}`,
              output: `distance = 12
Freezing!
Wear a coat.
Temperature: -5`,
              walkthrough: [
                { lines: "5-6", text: "Two values to test. Both are negative." },
                { lines: "8-9", text: "If `distance` is negative, flip its sign. This computes an absolute value. The `if` controls only line 9." },
                { lines: "10", text: "This line is *not* part of the `if`; it always runs." },
                { lines: "12-15", text: "Two statements must run together, so they are wrapped in braces to form one block." },
                { lines: "16-17", text: "-5 > 30 is false, so line 17 is skipped." },
                { lines: "18", text: "Execution always continues after the `if` statements." },
              ],
            },
            {
              type: "code",
              language: "c",
              title: "if-else: even or odd",
              runnable: true,
              stdin: "7",
              code: `#include <stdio.h>

int main(void)
{
    int n;

    printf("Enter a number: ");
    scanf("%d", &n);

    if (n % 2 == 0) {
        printf("%d is even\\n", n);
    } else {
        printf("%d is odd\\n", n);
    }
    printf("Done\\n");
    return 0;
}`,
              output: `Enter a number: 7 is odd
Done`,
              walkthrough: [
                { lines: "7-8", text: "Prompt for and read an integer. With input `7`, n is 7. (The typed input is not part of the program's output, which is why the result appears on the same line as the prompt here.)" },
                { lines: "10", text: "7 % 2 is 1, so `n % 2 == 0` is false (0)." },
                { lines: "11", text: "Skipped, because the condition is false." },
                { lines: "12-13", text: "The `else` branch runs instead. Exactly one of the two branches always runs." },
                { lines: "15", text: "Both paths join here; this always prints." },
              ],
            },
            {
              type: "callout",
              variant: "tip",
              title: "Testing for zero / non-zero",
              md: "Because any non-zero value is true, `if (count)` means `if (count != 0)` and `if (!count)` means `if (count == 0)`. Both styles are common; use whichever reads more clearly.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `The compiler turns an \`if\` into a **conditional jump**: evaluate the condition, and if it is zero, jump past the "true" code (to the \`else\` code, if any). If it is non-zero, fall into the "true" code and, at its end, jump over the \`else\` code. That is why exactly one branch of an if-else runs, and why the condition only has to produce "zero" or "non-zero".`,
            },
            {
              type: "heading",
              text: "Real-world uses",
              level: 2,
            },
            {
              type: "markdown",
              md: `- **Validation:** \`if (age < 0) { printf("Invalid age\\n"); }\`
- **Access control:** \`if (pin == storedPin) unlock(); else denyAccess();\`
- **Safety checks:** \`if (divisor != 0) result = total / divisor;\`
- **Game logic:** \`if (health <= 0) gameOver = 1;\``,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "A semicolon right after the condition",
                  wrong: `if (x > 10);
    printf("big\\n");   /* ALWAYS prints */`,
                  right: `if (x > 10)
    printf("big\\n");`,
                  md: "The `;` is an empty statement that becomes the whole body of the `if`. The `printf` is then an ordinary statement that always runs.",
                },
                {
                  title: "Forgetting braces around several statements",
                  wrong: `if (balance < 0)
    printf("Overdrawn\\n");
    fee = 25;          /* always runs! */`,
                  right: `if (balance < 0) {
    printf("Overdrawn\\n");
    fee = 25;
}`,
                  md: "Indentation means nothing to the compiler. Without braces only the first statement belongs to the `if`.",
                },
                {
                  title: "Assignment instead of comparison",
                  wrong: `if (choice = 1)   /* sets choice to 1; always true */`,
                  right: `if (choice == 1)`,
                  md: "`=` stores a value; the value 1 is non-zero so the branch always runs. Enable compiler warnings (e.g. `-Wall`) to catch this.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "The condition is true if non-zero, false if zero.",
                "Without braces, if/else controls exactly one statement.",
                "In an if-else, exactly one branch executes.",
                "if (x > 10); has an empty body: the next statement always runs.",
              ],
            },
            {
              type: "recap",
              items: [
                "if runs a statement only when its condition is non-zero.",
                "else provides the alternative path when the condition is zero.",
                "Braces group statements into one block; use them generously.",
              ],
            },
            {
              type: "exercise",
              id: "c09-ex-pass-fail",
              kind: "write",
              title: "Pass or fail",
              prompt: "Write a program with `int marks = 47;` that prints `PASS` if marks are at least 40, otherwise `FAIL`, and then always prints `Thank you`.",
              hint: "Use if-else, then a printf after the whole if-else statement.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int marks = 47;

    if (marks >= 40) {
        printf("PASS\\n");
    } else {
        printf("FAIL\\n");
    }
    printf("Thank you\\n");
    return 0;
}`,
              expectedOutput: `PASS
Thank you`,
            },
            {
              type: "exercise",
              id: "c09-ex-debug-semicolon",
              kind: "debug",
              title: "Why does it always warn?",
              prompt: "This program prints `Low battery!` even though the level is 80. Find the bug.",
              starterCode: `#include <stdio.h>

int main(void)
{
    int level = 80;
    if (level < 20);
        printf("Low battery!\\n");
    printf("Level: %d\\n", level);
    return 0;
}`,
              hint: "Look carefully at the end of the if line.",
              solution: "The semicolon after `if (level < 20)` is an empty statement that forms the body of the if. Remove it.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int level = 80;
    if (level < 20)
        printf("Low battery!\\n");
    printf("Level: %d\\n", level);
    return 0;
}`,
              expectedOutput: "Level: 80",
            },
            {
              type: "exercise",
              id: "c09-ex-predict-truthy",
              kind: "predict",
              title: "What counts as true?",
              prompt: "Predict the output.\n\n```c\n#include <stdio.h>\n\nint main(void)\n{\n    int a = -3, b = 0;\n    if (a) printf(\"A\\n\");\n    if (b) printf(\"B\\n\");\n    if (!b) printf(\"C\\n\");\n    if (a = 0) printf(\"D\\n\");\n    printf(\"%d\\n\", a);\n    return 0;\n}\n```",
              hint: "Only zero is false. And what does a = 0 do to a?",
              solution: "-3 is non-zero, so A prints. b is 0, so B is skipped. !b is 1, so C prints. `a = 0` stores 0 in a and has value 0, so D is skipped, and a is now 0.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int a = -3, b = 0;
    if (a) printf("A\\n");
    if (b) printf("B\\n");
    if (!b) printf("C\\n");
    if ((a = 0)) printf("D\\n");
    printf("%d\\n", a);
    return 0;
}`,
              expectedOutput: `A
C
0`,
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c09-if-semicolon-mcq",
              prompt: "What does this fragment print when x is 3?\n\n```c\nif (x > 5);\n    printf(\"big \");\nprintf(\"end\");\n```",
              options: [
                { id: "a", text: "end" },
                { id: "b", text: "big end" },
                { id: "c", text: "Nothing; it does not compile" },
                { id: "d", text: "big" },
              ],
              correct: "b",
              explanation: "The ; after the condition is the (empty) body of the if, so printf(\"big \") always runs.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c09-nonzero-tf",
              prompt: "`if (-1)` executes its body.",
              correct: true,
              explanation: "Any non-zero value, including negative values, is true.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c09-braces-output",
              prompt: "What does this print? (Pay attention to braces, not indentation.)",
              code: `#include <stdio.h>

int main(void)
{
    int x = 2;
    if (x > 5)
        printf("A\\n");
        printf("B\\n");
    printf("C\\n");
    return 0;
}`,
              expected: "B\nC",
              explanation: "Only the first printf belongs to the if. B and C always print.",
            },
            {
              type: "FILL_BLANK",
              slug: "c09-else-fill",
              prompt: "In an if statement, the keyword that introduces the branch executed when the condition is false is ___ .",
              accepted: [["else"]],
            },
          ],
        },
        {
          slug: "else-if-ladders-nested-if",
          title: "else-if ladders and nested conditions",
          summary:
            "Choose among many alternatives with an else-if ladder, put decisions inside decisions with nested if, and understand the dangling-else rule.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Write an else-if ladder to choose among several ranges or cases",
                "Order the conditions in a ladder correctly",
                "Write nested if statements and trace which branch runs",
                "Explain the dangling-else rule and avoid it with braces",
              ],
            },
            {
              type: "markdown",
              md: `## More than two choices

Many decisions have more than two outcomes. A grade can be A, B, C, D or F. A number can be positive, negative or zero. For this, C programmers chain \`if-else\` statements into an **else-if ladder**:

The conditions are tested **from top to bottom**. The first one that is true has its branch executed, and then the *rest of the ladder is skipped*. If none is true, the final \`else\` (if present) runs.

Think of a sorting machine for parcels: the parcel slides down a chute past several gates, and drops through the first gate that fits.`,
            },
            {
              type: "syntax",
              language: "c",
              code: `if (condition1) {
    /* runs if condition1 is true */
} else if (condition2) {
    /* runs if condition1 is false and condition2 is true */
} else if (condition3) {
    /* ... */
} else {
    /* runs if none of the conditions is true (optional) */
}`,
              md: "`else if` is not a separate keyword: it is simply an `else` whose single statement is another `if`.",
            },
            {
              type: "definition",
              term: "else-if ladder",
              md: "A chain of `if ... else if ... else` statements in which at most one branch executes: the first whose condition is true, or the final `else` if none is.",
            },
            {
              type: "code",
              language: "c",
              title: "Grading with an else-if ladder",
              runnable: true,
              stdin: "84",
              code: `#include <stdio.h>

int main(void)
{
    int marks;
    scanf("%d", &marks);

    if (marks < 0 || marks > 100)
        printf("Invalid marks\\n");
    else if (marks >= 90)
        printf("Grade: A\\n");
    else if (marks >= 80)
        printf("Grade: B\\n");
    else if (marks >= 70)
        printf("Grade: C\\n");
    else if (marks >= 60)
        printf("Grade: D\\n");
    else
        printf("Grade: F\\n");
    return 0;
}`,
              output: "Grade: B",
              walkthrough: [
                { lines: "6", text: "Read the marks; with input 84, marks = 84." },
                { lines: "8-9", text: "First rule out invalid input. 84 is in range, so continue down." },
                { lines: "10", text: "84 >= 90 is false; continue." },
                { lines: "12-13", text: "84 >= 80 is true: print Grade: B, then skip the rest of the ladder." },
                { lines: "14-19", text: "Never examined for 84. Notice that line 14 does not need `marks < 80`: we only reach it if the earlier tests failed." },
              ],
            },
            {
              type: "callout",
              variant: "warning",
              title: "Order matters",
              md: "If you test `marks >= 60` first, a score of 95 would match it and print D. In a ladder of `>=` tests, go from the **largest threshold to the smallest** (or use explicit ranges).",
            },
            {
              type: "heading",
              text: "Nested if statements",
              level: 2,
            },
            {
              type: "markdown",
              md: `An \`if\` can contain any statement, including another \`if\`. This is called **nesting**. Use it when a second question only makes sense after the first is answered: *if* the user is logged in, *then* check whether they are an admin.

When tracing nested ifs, work from the outside in, and use braces so the structure is obvious.`,
            },
            {
              type: "code",
              language: "c",
              title: "Largest of three numbers with nested if",
              runnable: true,
              stdin: "12 45 30",
              code: `#include <stdio.h>

int main(void)
{
    int a, b, c;
    scanf("%d %d %d", &a, &b, &c);

    if (a >= b) {
        if (a >= c)
            printf("Largest: %d\\n", a);
        else
            printf("Largest: %d\\n", c);
    } else {
        if (b >= c)
            printf("Largest: %d\\n", b);
        else
            printf("Largest: %d\\n", c);
    }
    return 0;
}`,
              output: "Largest: 45",
              walkthrough: [
                { lines: "6", text: "Read three integers: a = 12, b = 45, c = 30." },
                { lines: "8", text: "12 >= 45 is false, so jump to the outer `else` on line 13." },
                { lines: "14", text: "Inside the else we know b > a. Now compare b with c: 45 >= 30 is true." },
                { lines: "15", text: "Print 45." },
                { lines: "9-12", text: "This inner if-else would only run if a >= b." },
              ],
            },
            {
              type: "heading",
              text: "The dangling else",
              level: 2,
            },
            {
              type: "definition",
              term: "Dangling else rule",
              md: "An `else` always belongs to the **nearest preceding `if` that does not already have an `else`** in the same block, regardless of indentation.",
            },
            {
              type: "code",
              language: "c",
              title: "Indentation lies; braces don't",
              runnable: true,
              code: `#include <stdio.h>

int main(void)
{
    int x = 5, y = -3;

    if (x > 0)
        if (y > 0)
            printf("both positive\\n");
    else
        printf("which if does this else belong to?\\n");

    if (x > 0) {
        if (y > 0)
            printf("both positive\\n");
    } else {
        printf("x is not positive\\n");
    }
    return 0;
}`,
              output: "which if does this else belong to?",
              walkthrough: [
                { lines: "7-11", text: "The indentation suggests the `else` pairs with `if (x > 0)`, but the rule pairs it with the nearer `if (y > 0)`. x > 0 is true, y > 0 is false, so the else runs and prints the message." },
                { lines: "13-18", text: "Braces end the inner if on line 16, so this `else` really belongs to `if (x > 0)`. x is positive and y is not, so nothing prints here." },
              ],
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `An else-if ladder is really a set of if-else statements nested inside each other's \`else\` branches, written flat for readability. Once a condition is true, its branch runs and the program jumps past every remaining \`else\`. That is why later conditions can assume all earlier ones were false, and why the order of conditions matters.`,
            },
            {
              type: "heading",
              text: "Real-world uses",
              level: 2,
            },
            {
              type: "markdown",
              md: `- **Tax brackets and tariffs:** different rates for different income or usage ranges.
- **Grading systems** and **shipping costs** by weight range.
- **Nested checks:** login → permissions → action; or "is the file open?" → "is there data?".
- **Classifying input:** positive / negative / zero, or child / teen / adult / senior.`,
            },
            {
              type: "table",
              caption: "Ladder vs. nested if",
              headers: ["Use an else-if ladder when...", "Use nested ifs when..."],
              rows: [
                ["the alternatives are mutually exclusive (one outcome)", "a second question depends on the answer to the first"],
                ["you test ranges of one value (marks, age, income)", "you combine different variables step by step"],
                ["you want the most readable flat structure", "the logic is naturally a decision tree"],
              ],
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Wrong order in a ladder",
                  wrong: `if (marks >= 40) grade = 'P';
else if (marks >= 75) grade = 'D';  /* never reached for 80 */`,
                  right: `if (marks >= 75) grade = 'D';
else if (marks >= 40) grade = 'P';`,
                  md: "The first true condition wins. Put the most specific (highest) threshold first.",
                },
                {
                  title: "Separate ifs instead of a ladder",
                  wrong: `if (n > 0) printf("positive\\n");
if (n >= 0) printf("non-negative\\n");  /* both print for 5 */`,
                  right: `if (n > 0) printf("positive\\n");
else if (n == 0) printf("zero\\n");
else printf("negative\\n");`,
                  md: "Independent `if` statements are all tested. If you want exactly one outcome, chain them with `else`.",
                },
                {
                  title: "Relying on indentation for a nested else",
                  wrong: `if (a > 0)
    if (b > 0) printf("both\\n");
else printf("a not positive\\n");`,
                  right: `if (a > 0) {
    if (b > 0) printf("both\\n");
} else {
    printf("a not positive\\n");
}`,
                  md: "The else attaches to the nearest unmatched if. Use braces to make it attach where you intend.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "In an else-if ladder, conditions are tested top to bottom and only the first true branch runs.",
                "Later conditions in a ladder can assume the earlier ones were false.",
                "An else belongs to the nearest unmatched if, whatever the indentation.",
                "Separate if statements are all evaluated; else-if makes them mutually exclusive.",
              ],
            },
            {
              type: "recap",
              items: [
                "Use else-if ladders for one-of-many choices.",
                "Order ladder conditions from most to least specific.",
                "Nesting puts a decision inside a decision.",
                "Braces resolve the dangling-else problem.",
              ],
            },
            {
              type: "exercise",
              id: "c09-ex-sign",
              kind: "write",
              title: "Positive, negative or zero",
              prompt: "Write a program with `int n = -8;` that prints `negative`, `zero` or `positive` using an else-if ladder. Then also print `even` or `odd` using a separate if-else.",
              hint: "Two independent decisions: a 3-way ladder and a 2-way if-else.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int n = -8;

    if (n < 0)
        printf("negative\\n");
    else if (n == 0)
        printf("zero\\n");
    else
        printf("positive\\n");

    if (n % 2 == 0)
        printf("even\\n");
    else
        printf("odd\\n");
    return 0;
}`,
              expectedOutput: `negative
even`,
            },
            {
              type: "exercise",
              id: "c09-ex-predict-ladder",
              kind: "predict",
              title: "Trace the ladder",
              prompt: "Predict the output.\n\n```c\n#include <stdio.h>\n\nint main(void)\n{\n    int t = 25;\n    if (t > 30) printf(\"hot\\n\");\n    else if (t > 20) printf(\"warm\\n\");\n    else if (t > 10) printf(\"mild\\n\");\n    else printf(\"cold\\n\");\n    if (t > 10) printf(\"not cold\\n\");\n    return 0;\n}\n```",
              hint: "The ladder stops at the first true test; the last if is separate.",
              solution: "25 > 30 is false; 25 > 20 is true, so `warm` prints and the ladder ends. The final if is independent and 25 > 10, so `not cold` also prints.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int t = 25;
    if (t > 30) printf("hot\\n");
    else if (t > 20) printf("warm\\n");
    else if (t > 10) printf("mild\\n");
    else printf("cold\\n");
    if (t > 10) printf("not cold\\n");
    return 0;
}`,
              expectedOutput: `warm
not cold`,
            },
            {
              type: "exercise",
              id: "c09-ex-concept-dangling",
              kind: "concept",
              title: "Fix the indentation",
              prompt: "Rewrite this fragment with braces so that the `else` belongs to the **outer** if, and state what the original prints when `a = 1` and `b = 0`.\n\n```c\nif (a)\n    if (b)\n        printf(\"X\");\nelse\n    printf(\"Y\");\n```",
              solution: "Originally the else belongs to `if (b)`, so with a = 1 and b = 0 it prints `Y`. To attach it to the outer if:\n\n```c\nif (a) {\n    if (b)\n        printf(\"X\");\n} else {\n    printf(\"Y\");\n}\n```\nNow with a = 1, b = 0 nothing is printed.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c09-ladder-mcq",
              prompt: "With `int n = 15;`, what does this print?\n\n```c\nif (n > 5) printf(\"A\");\nelse if (n > 10) printf(\"B\");\nelse printf(\"C\");\n```",
              options: [
                { id: "a", text: "B" },
                { id: "b", text: "AB" },
                { id: "c", text: "A" },
                { id: "d", text: "C" },
              ],
              correct: "c",
              explanation: "15 > 5 is the first true test, so only A prints; the rest of the ladder is skipped.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c09-dangling-output",
              prompt: "What does this print?",
              code: `#include <stdio.h>

int main(void)
{
    int a = 0, b = 1;
    if (a == 1)
        if (b == 1)
            printf("one\\n");
    else
        printf("two\\n");
    printf("three\\n");
    return 0;
}`,
              expected: "three",
              explanation: "The else belongs to the inner if (b == 1). Since a == 1 is false, the whole inner if-else is skipped.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c09-elseif-tf",
              prompt: "In an else-if ladder, more than one branch can execute if more than one condition is true.",
              correct: false,
              explanation: "Only the first true branch executes; the rest are skipped.",
            },
            {
              type: "CODE_WRITING",
              slug: "c09-electricity-bill",
              prompt:
                "Read the number of electricity units used (a non-negative integer) and print the bill as `Bill: X`. Tariff: the first 100 units cost 5 each, units 101–200 cost 7 each, and every unit above 200 costs 10. For example, 150 units cost 100×5 + 50×7 = 850, so print `Bill: 850`.",
              starterCode: `#include <stdio.h>

int main(void)
{
    int units;
    scanf("%d", &units);
    /* compute the bill with an else-if ladder */
    return 0;
}`,
              sampleTests: [
                { stdin: "150", expected: "Bill: 850" },
                { stdin: "50", expected: "Bill: 250" },
              ],
              hiddenTests: [
                { stdin: "0", expected: "Bill: 0" },
                { stdin: "200", expected: "Bill: 1200" },
                { stdin: "250", expected: "Bill: 1700" },
              ],
              solutionCode: `#include <stdio.h>

int main(void)
{
    int units, bill;
    scanf("%d", &units);

    if (units <= 100)
        bill = units * 5;
    else if (units <= 200)
        bill = 100 * 5 + (units - 100) * 7;
    else
        bill = 100 * 5 + 100 * 7 + (units - 200) * 10;

    printf("Bill: %d\\n", bill);
    return 0;
}`,
              explanation: "Each slab is charged at its own rate. The ladder picks the highest slab reached, and the formula adds the full cost of every lower slab.",
            },
          ],
        },
      ],
    },
    {
      slug: "switch-statement",
      title: "The switch statement",
      lessons: [
        {
          slug: "switch-case-break-default",
          title: "switch, case, break and default",
          summary:
            "Select among many fixed values with switch, control execution with break, use fall-through deliberately, handle the rest with default, and choose between switch and if.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Write a switch statement with case labels, break and default",
                "Explain fall-through and use it deliberately to group cases",
                "State the rules for switch expressions and case labels",
                "Decide when switch is a better choice than an else-if ladder",
              ],
            },
            {
              type: "markdown",
              md: `## A menu of choices

Imagine a vending machine: you press button 1, 2, 3 or 4 and get a different drink each time. When a program must pick an action based on **one integer value** matching one of several **fixed constants**, an else-if ladder like \`if (x == 1) ... else if (x == 2) ...\` works but is repetitive. The \`switch\` statement expresses this directly.

\`switch\` evaluates its expression once, then **jumps** to the \`case\` label whose constant equals that value. Execution continues from there until a \`break\` (or the end of the switch). If no label matches, it jumps to \`default\` if there is one; otherwise the whole switch is skipped.`,
            },
            {
              type: "syntax",
              language: "c",
              code: `switch (integer_expression) {
case CONSTANT_1:
    statements;
    break;
case CONSTANT_2:
case CONSTANT_3:          /* several labels can share code */
    statements;
    break;
default:                  /* optional: no case matched     */
    statements;
}`,
              md: "The expression must have an **integer type** (`int`, `char`, `long`, enum...). Each case label must be an **integer constant expression** (like `3`, `'A'`, or `2 * 5`), and no two labels may be equal.",
            },
            {
              type: "definition",
              term: "case label",
              md: "A marker `case constant:` inside a switch. It is an entry point, not a separate block: execution starts at the matching label and keeps going.",
            },
            {
              type: "definition",
              term: "break",
              md: "A statement that immediately exits the innermost enclosing `switch` (or loop). Execution continues with the statement after the switch.",
            },
            {
              type: "definition",
              term: "Fall-through",
              md: "When a case's statements do not end with `break`, execution *falls through* into the statements of the next case label, without testing it.",
            },
            {
              type: "code",
              language: "c",
              title: "A four-function calculator",
              runnable: true,
              stdin: "12 * 4",
              code: `#include <stdio.h>

int main(void)
{
    double a, b;
    char op;

    scanf("%lf %c %lf", &a, &op, &b);

    switch (op) {
    case '+':
        printf("%.2f\\n", a + b);
        break;
    case '-':
        printf("%.2f\\n", a - b);
        break;
    case '*':
        printf("%.2f\\n", a * b);
        break;
    case '/':
        if (b != 0)
            printf("%.2f\\n", a / b);
        else
            printf("Error: division by zero\\n");
        break;
    default:
        printf("Unknown operator %c\\n", op);
    }
    return 0;
}`,
              output: "48.00",
              walkthrough: [
                { lines: "8", text: "Read a number, an operator character, and another number. Input `12 * 4` gives a = 12, op = '*', b = 4. The space before `%c` skips whitespace." },
                { lines: "10", text: "`op` is a `char`, which is an integer type, so it can be switched on." },
                { lines: "11-16", text: "These labels don't match '*', so they are skipped entirely." },
                { lines: "17-19", text: "Match! Print 48.00, then `break` leaves the switch." },
                { lines: "20-25", text: "A case can contain any statements, including an if-else for the divide-by-zero check." },
                { lines: "26-27", text: "`default` handles every other character. It is last, so it needs no break." },
              ],
            },
            {
              type: "heading",
              text: "Fall-through: bug or feature?",
              level: 2,
            },
            {
              type: "markdown",
              md: `Because case labels are just entry points, forgetting \`break\` makes execution continue into the next case. This is the most common switch bug. But fall-through is also useful:

1. **Grouping:** several labels in a row with no statements between them share one action (\`case 6: case 7: weekend\`).
2. **Cumulative actions:** higher levels include everything lower levels do.

When you fall through on purpose after some statements, add a comment like \`/* fall through */\` so readers know it is intentional.`,
            },
            {
              type: "code",
              language: "c",
              title: "Grouped cases and deliberate fall-through",
              runnable: true,
              code: `#include <stdio.h>

int main(void)
{
    int day = 6;
    int level = 2;

    switch (day) {
    case 1: case 2: case 3: case 4: case 5:
        printf("Weekday\\n");
        break;
    case 6:
    case 7:
        printf("Weekend\\n");
        break;
    default:
        printf("Invalid day\\n");
    }

    printf("Features for level %d:\\n", level);
    switch (level) {
    case 3:
        printf("- expert mode\\n");
        /* fall through */
    case 2:
        printf("- custom themes\\n");
        /* fall through */
    case 1:
        printf("- basic editor\\n");
    }
    return 0;
}`,
              output: `Weekend
Features for level 2:
- custom themes
- basic editor`,
              walkthrough: [
                { lines: "9-11", text: "Five labels share one action. Days 1 to 5 all print Weekday." },
                { lines: "12-15", text: "day is 6: jump to `case 6:`. It has no statements, so execution falls through to `case 7:`'s printf, then breaks." },
                { lines: "16-17", text: "Any other day number lands in default." },
                { lines: "21-22", text: "level is 2, so jump straight to `case 2:`; `case 3:` is skipped." },
                { lines: "25-29", text: "No breaks: print custom themes, fall through and print basic editor. The switch then ends." },
              ],
            },
            {
              type: "heading",
              text: "Choosing between if and switch",
              level: 2,
            },
            {
              type: "table",
              caption: "switch vs. else-if ladder",
              headers: ["", "switch", "else-if ladder"],
              rows: [
                ["Tests", "equality with constant values only", "any condition (ranges, &&, ||, floats, strings via functions)"],
                ["Expression type", "integer types only (int, char, enum...)", "anything that can be tested"],
                ["Readability for menus", "excellent", "repetitive"],
                ["Ranges like 60–69", "awkward (one label per value)", "natural: marks >= 60"],
                ["Fall-through", "possible (and a common bug)", "not applicable"],
              ],
            },
            {
              type: "callout",
              variant: "tip",
              title: "Rule of thumb",
              md: "Use `switch` when you are comparing **one integer or char variable** against a list of **specific constant values** (menus, commands, codes). Use if / else-if for ranges, compound conditions, floating-point values or strings.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `Because every case label is a compile-time integer constant, the compiler can build a **jump table**: an array of code addresses indexed by the value. Instead of testing each case one by one, the program can jump straight to the right code. That is also why labels must be constants and why only integer types are allowed: you cannot index a table with a string or a range. Labels being mere addresses in that table explains fall-through too: nothing stops execution at the next label unless you \`break\`.`,
            },
            {
              type: "heading",
              text: "Real-world uses",
              level: 2,
            },
            {
              type: "markdown",
              md: `- **Menu-driven programs:** "1. Deposit 2. Withdraw 3. Balance 4. Exit".
- **Command interpreters:** handling single-letter commands like \`'q'\` (quit) or \`'h'\` (help).
- **State machines:** traffic lights, vending machines, game states (\`MENU\`, \`PLAYING\`, \`PAUSED\`).
- **Parsing:** classifying characters in a calculator or compiler.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Forgetting break",
                  wrong: `switch (choice) {
case 1: printf("Tea\\n");
case 2: printf("Coffee\\n");   /* choice 1 prints both! */
}`,
                  right: `switch (choice) {
case 1: printf("Tea\\n"); break;
case 2: printf("Coffee\\n"); break;
}`,
                  md: "Without `break`, execution falls through to the next case. End every case with break unless fall-through is intended (and commented).",
                },
                {
                  title: "Using a range or variable as a case label",
                  wrong: `case marks >= 90:    /* not allowed */
case limit:          /* not allowed: limit is a variable */`,
                  right: `if (marks >= 90) ...   /* use if for ranges */
case 90:               /* constants only */`,
                  md: "Case labels must be integer constant expressions. For ranges or variables use an if / else-if ladder.",
                },
                {
                  title: "Switching on a double or a string",
                  wrong: `switch (price) { case 9.99: ... }      /* error */
switch (name)  { case "Ali": ... }     /* error */`,
                  right: `switch (code) { case 1: ... }   /* integer code */
if (strcmp(name, "Ali") == 0) ...   /* strings: see chapter 15 */`,
                  md: "The controlling expression must be an integer type.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "switch works only with integer-type expressions; case labels must be distinct integer constants.",
                "Execution starts at the matching case and continues until break or the end of the switch (fall-through).",
                "default runs when no case matches; it is optional and can appear anywhere.",
                "Several labels can share code by being written one after another.",
                "Use switch for exact constant matches, if/else-if for ranges and complex conditions.",
              ],
            },
            {
              type: "recap",
              items: [
                "switch jumps to the case equal to the expression's value.",
                "break exits the switch; without it, execution falls through.",
                "default catches all unmatched values.",
                "Choose switch for menus and codes, if for ranges and conditions.",
              ],
            },
            {
              type: "exercise",
              id: "c09-ex-predict-fallthrough",
              kind: "predict",
              title: "Where is the break?",
              prompt: "Predict the output.\n\n```c\n#include <stdio.h>\n\nint main(void)\n{\n    int x = 2;\n    switch (x) {\n    case 1: printf(\"one \");\n    case 2: printf(\"two \");\n    case 3: printf(\"three \"); break;\n    case 4: printf(\"four \");\n    default: printf(\"other \");\n    }\n    printf(\"\\n\");\n    return 0;\n}\n```",
              hint: "Start at case 2 and keep going until a break.",
              solution: "Execution starts at case 2, prints `two `, falls through to case 3, prints `three `, and the break exits. Output: `two three`.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int x = 2;
    switch (x) {
    case 1: printf("one ");
    case 2: printf("two ");
    case 3: printf("three "); break;
    case 4: printf("four ");
    default: printf("other ");
    }
    printf("\\n");
    return 0;
}`,
              expectedOutput: "two three",
            },
            {
              type: "exercise",
              id: "c09-ex-vowel",
              kind: "write",
              title: "Vowel or consonant",
              prompt: "Write a program with `char ch = 'E';` that uses a switch to print `vowel` for a, e, i, o, u (upper or lower case) and `consonant` otherwise.",
              hint: "Stack ten case labels on top of one printf and break.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    char ch = 'E';

    switch (ch) {
    case 'a': case 'e': case 'i': case 'o': case 'u':
    case 'A': case 'E': case 'I': case 'O': case 'U':
        printf("vowel\\n");
        break;
    default:
        printf("consonant\\n");
    }
    return 0;
}`,
              expectedOutput: "vowel",
            },
            {
              type: "exercise",
              id: "c09-ex-concept-switch-or-if",
              kind: "concept",
              title: "switch or if?",
              prompt: "For each task, say whether switch or an else-if ladder is more appropriate, and why:\n\n1. Print the month name for a month number 1–12.\n2. Classify a BMI value (a double) as underweight, normal, overweight or obese.\n3. Handle menu choices 'a', 'b', 'c', 'q'.\n4. Decide whether a year is a leap year.",
              solution: "1. switch: one integer compared with 12 constants.\n2. else-if: the value is a double and the categories are ranges.\n3. switch: one char compared with constant characters.\n4. if/else-if (or a single logical expression): the rule combines divisibility conditions with && and ||, not equality with constants.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c09-switch-type-mcq",
              prompt: "Which of these can NOT be used as the controlling expression of a switch?",
              options: [
                { id: "a", text: "an int variable" },
                { id: "b", text: "a char variable" },
                { id: "c", text: "a double variable" },
                { id: "d", text: "the expression n % 3" },
              ],
              correct: "c",
              explanation: "switch requires an integer type. char and int expressions are fine; double is not allowed.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c09-switch-default-output",
              prompt: "What does this print?",
              code: `#include <stdio.h>

int main(void)
{
    int n = 7;
    switch (n % 3) {
    case 0: printf("zero\\n"); break;
    default: printf("other\\n");
    case 2: printf("two\\n"); break;
    }
    return 0;
}`,
              expected: "other\ntwo",
              explanation: "7 % 3 is 1, which matches no case, so execution jumps to default. default has no break, so it falls through into case 2 before breaking.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c09-default-tf",
              prompt: "Every switch statement must contain a default label.",
              correct: false,
              explanation: "default is optional. Without it, if no case matches, the switch simply does nothing.",
            },
            {
              type: "FILL_BLANK",
              slug: "c09-break-fill",
              prompt: "To stop execution from falling through into the next case, end the case with the ___ statement.",
              accepted: [["break", "break;"]],
            },
            {
              type: "CODE_WRITING",
              slug: "c09-int-calculator",
              prompt:
                "Read an expression of the form `a op b` where a and b are integers and op is one of `+ - * / %` (separated by spaces). Print the integer result. If op is `/` or `%` and b is 0, print `Division by zero`. For any other operator print `Invalid operator`. Use a switch.",
              starterCode: `#include <stdio.h>

int main(void)
{
    int a, b;
    char op;
    scanf("%d %c %d", &a, &op, &b);
    /* your switch here */
    return 0;
}`,
              sampleTests: [
                { stdin: "7 + 5", expected: "12" },
                { stdin: "7 / 2", expected: "3" },
              ],
              hiddenTests: [
                { stdin: "9 - 12", expected: "-3" },
                { stdin: "17 % 5", expected: "2" },
                { stdin: "8 / 0", expected: "Division by zero" },
                { stdin: "5 ^ 2", expected: "Invalid operator" },
              ],
              solutionCode: `#include <stdio.h>

int main(void)
{
    int a, b;
    char op;
    scanf("%d %c %d", &a, &op, &b);

    switch (op) {
    case '+': printf("%d\\n", a + b); break;
    case '-': printf("%d\\n", a - b); break;
    case '*': printf("%d\\n", a * b); break;
    case '/':
    case '%':
        if (b == 0)
            printf("Division by zero\\n");
        else if (op == '/')
            printf("%d\\n", a / b);
        else
            printf("%d\\n", a % b);
        break;
    default:
        printf("Invalid operator\\n");
    }
    return 0;
}`,
              explanation: "Group '/' and '%' so the zero check is written once, then pick the operation with an if-else inside the case.",
            },
          ],
        },
      ],
    },
  ],
};

export default chapter;
