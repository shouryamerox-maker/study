import type { ChapterContent } from "../../../src/lib/content/schema";

const chapter: ChapterContent = {
  slug: "loops",
  title: "Loops: while, do-while and for",
  summary:
    "Repeat work without repeating code: while, do-while and for loops, counters and accumulators, sentinel-controlled input, break and continue, and how to recognise and avoid infinite loops.",
  topics: [
    {
      slug: "loop-statements",
      title: "The three loop statements",
      lessons: [
        {
          slug: "while-and-do-while-loops",
          title: "while and do-while loops",
          summary:
            "Repeat statements while a condition holds, understand the difference between pre-test and post-test loops, and process input until a sentinel value appears.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Write while and do-while loops and trace their execution",
                "Identify the three parts of every loop: initialisation, condition and update",
                "Explain why a do-while body always runs at least once",
                "Write sentinel-controlled loops that read input until a special value",
              ],
            },
            {
              type: "markdown",
              md: `## Why loops?

Suppose you need to print the numbers 1 to 1000. Writing 1000 \`printf\` calls is absurd. Computers are brilliant at doing the same thing many times, and **loops** are how we ask them to.

A loop repeats a block of code (the **body**) as long as a condition is true. Each repetition is called an **iteration**.

Analogy: stirring soup. *While the soup is not smooth, stir once more.* You check the soup, stir, check again, and stop as soon as it is smooth. If the soup is already smooth when you arrive, you do not stir at all.`,
            },
            {
              type: "definition",
              term: "Iteration",
              md: "One execution of a loop's body. A loop that runs its body 5 times performs 5 iterations.",
            },
            {
              type: "definition",
              term: "Loop control variable (counter)",
              md: "A variable whose value determines whether the loop continues, typically **initialised** before the loop, **tested** in the condition and **updated** in each iteration.",
            },
            {
              type: "syntax",
              language: "c",
              code: `initialisation;
while (condition) {
    body;
    update;
}`,
              md: "The condition is tested **before** every iteration (a *pre-test* loop). If it is false the very first time, the body never runs.",
            },
            {
              type: "code",
              language: "c",
              title: "A countdown with while",
              runnable: true,
              code: `#include <stdio.h>

int main(void)
{
    int count = 5;

    while (count > 0) {
        printf("%d ", count);
        count--;
    }
    printf("Liftoff!\\n");
    return 0;
}`,
              output: "5 4 3 2 1 Liftoff!",
              walkthrough: [
                { lines: "5", text: "**Initialisation:** the counter starts at 5." },
                { lines: "7", text: "**Condition:** checked before each iteration. 5 > 0, 4 > 0, ... 1 > 0 are true; when count reaches 0 the test fails and the loop ends." },
                { lines: "8", text: "**Body:** print the current value followed by a space." },
                { lines: "9", text: "**Update:** move towards ending the loop. Without this line the loop would never stop." },
                { lines: "11", text: "Runs once, after the loop has finished." },
              ],
            },
            {
              type: "table",
              caption: "Tracing the countdown",
              headers: ["Iteration", "count before test", "count > 0?", "Printed", "count after update"],
              rows: [
                ["1", "5", "yes", "5", "4"],
                ["2", "4", "yes", "4", "3"],
                ["3", "3", "yes", "3", "2"],
                ["4", "2", "yes", "2", "1"],
                ["5", "1", "yes", "1", "0"],
                ["-", "0", "no: exit", "", ""],
              ],
            },
            {
              type: "heading",
              text: "Sentinel-controlled loops",
              level: 2,
            },
            {
              type: "markdown",
              md: `Often you do not know in advance how many values the user will type. A common solution is a **sentinel**: a special value that means "I'm finished", such as -1 for a list of marks (which cannot be negative) or 0 for a list of prices.

The standard pattern reads the first value *before* the loop, and reads the next value at the *end* of the body, so the sentinel is tested before it can be processed.`,
            },
            {
              type: "definition",
              term: "Sentinel value",
              md: "A special input value, chosen so it can never be real data, that signals the end of input. The sentinel itself is not processed.",
            },
            {
              type: "code",
              language: "c",
              title: "Summing input until -1",
              runnable: true,
              stdin: "10 25 7 -1",
              code: `#include <stdio.h>

int main(void)
{
    int value, sum = 0, count = 0;

    printf("Enter numbers (-1 to stop):\\n");
    scanf("%d", &value);
    while (value != -1) {
        sum += value;
        count++;
        scanf("%d", &value);
    }
    printf("Count = %d, Sum = %d\\n", count, sum);
    if (count > 0)
        printf("Average = %.2f\\n", (double)sum / count);
    return 0;
}`,
              output: `Enter numbers (-1 to stop):
Count = 3, Sum = 42
Average = 14.00`,
              walkthrough: [
                { lines: "5", text: "Two **accumulators**: `sum` collects a running total and `count` counts values. Both must start at 0." },
                { lines: "8", text: "**Priming read:** get the first value before testing it." },
                { lines: "9", text: "Continue as long as the value is not the sentinel. With input `10 25 7 -1` the loop runs for 10, 25 and 7." },
                { lines: "10-11", text: "Process the value: add it to the total and count it." },
                { lines: "12", text: "Read the next value at the end of the body, so the condition checks it before it is processed. When -1 is read, the loop stops and -1 is never added." },
                { lines: "15-16", text: "Guard against dividing by zero if the very first input was the sentinel." },
              ],
            },
            {
              type: "heading",
              text: "The do-while loop",
              level: 2,
            },
            {
              type: "syntax",
              language: "c",
              code: `do {
    body;
} while (condition);   /* note the semicolon! */`,
              md: "The body runs **first**, then the condition is tested (a *post-test* loop). So the body always executes **at least once**.",
            },
            {
              type: "markdown",
              md: `\`do-while\` fits situations where you must do something before you can decide whether to repeat it. The classic example is **input validation**: you have to ask for the value before you can check whether it is valid. Menus are another: show the menu, handle the choice, and repeat unless the user chose "exit".`,
            },
            {
              type: "code",
              language: "c",
              title: "Input validation with do-while",
              runnable: true,
              stdin: "15 -2 7",
              code: `#include <stdio.h>

int main(void)
{
    int n;

    do {
        printf("Enter a number from 1 to 10: ");
        scanf("%d", &n);
    } while (n < 1 || n > 10);

    printf("\\nYou chose %d\\n", n);
    return 0;
}`,
              output: "Enter a number from 1 to 10: Enter a number from 1 to 10: Enter a number from 1 to 10: \nYou chose 7",
              walkthrough: [
                { lines: "7-9", text: "The body runs immediately: prompt and read. There is no need to give `n` a dummy value first." },
                { lines: "10", text: "Repeat while the value is out of range. 15 is too big, -2 is too small, so the prompt appears three times; 7 ends the loop." },
                { lines: "12", text: "After the loop, n is guaranteed to be between 1 and 10. (The typed input is not echoed, so the prompts appear side by side in the output.)" },
              ],
            },
            {
              type: "table",
              caption: "while vs. do-while",
              headers: ["", "while", "do-while"],
              rows: [
                ["Condition tested", "before each iteration", "after each iteration"],
                ["Minimum iterations", "0", "1"],
                ["Semicolon after while(...)", "no (it would be an empty body!)", "yes, required"],
                ["Typical use", "unknown count, may be zero (sentinel input, digit processing)", "menus, input validation"],
              ],
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `A loop is a conditional jump that points **backwards**. For \`while\`, the compiler generates: test the condition; if false, jump past the loop; otherwise run the body and jump back to the test. For \`do-while\` the test is placed *after* the body, which is exactly why the body runs once before any test. A loop terminates only if something in the body (the update) eventually makes the condition false.`,
            },
            {
              type: "heading",
              text: "Real-world uses",
              level: 2,
            },
            {
              type: "markdown",
              md: `- **Reading data** until the end of input or a sentinel (sensor readings, a list of marks).
- **Retrying** an operation until it succeeds: re-asking for a password, reconnecting to a server.
- **Game loops:** \`while (!gameOver) { readInput(); update(); draw(); }\`.
- **Processing digits:** \`while (n > 0) { digit = n % 10; n /= 10; }\`.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Forgetting the update",
                  wrong: `int i = 1;
while (i <= 5) {
    printf("%d\\n", i);
}                       /* i never changes: infinite loop */`,
                  right: `int i = 1;
while (i <= 5) {
    printf("%d\\n", i);
    i++;
}`,
                  md: "Every loop needs something in the body that moves the condition towards false.",
                },
                {
                  title: "A semicolon after while(...)",
                  wrong: `while (i <= 5);   /* empty body, loops forever */
{
    i++;
}`,
                  right: `while (i <= 5) {
    i++;
}`,
                  md: "The stray `;` becomes the whole loop body, so `i` never changes. (do-while is the only loop that *needs* a semicolon after the condition.)",
                },
                {
                  title: "Uninitialised accumulator",
                  wrong: `int sum;              /* garbage value */
while (...) sum += x;`,
                  right: `int sum = 0;
while (...) sum += x;`,
                  md: "Local variables start with indeterminate values. Initialise totals to 0 and products to 1.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "while is pre-test (0 or more iterations); do-while is post-test (at least 1 iteration).",
                "do { ... } while (cond); ends with a semicolon.",
                "Every loop needs initialisation, a condition and an update.",
                "Sentinel loops: priming read before the loop, next read at the end of the body.",
                "Initialise sums to 0 and products to 1 before the loop.",
              ],
            },
            {
              type: "recap",
              items: [
                "Loops repeat a body while a condition is true.",
                "while tests first; do-while tests after running the body once.",
                "A sentinel value marks the end of input and is not processed.",
                "Forgetting the update causes an infinite loop.",
              ],
            },
            {
              type: "exercise",
              id: "c10-ex-predict-while",
              kind: "predict",
              title: "Trace the loop",
              prompt: "Predict the output.\n\n```c\n#include <stdio.h>\n\nint main(void)\n{\n    int n = 1;\n    while (n < 40) {\n        printf(\"%d \", n);\n        n = n * 3;\n    }\n    printf(\"\\nend: %d\\n\", n);\n    return 0;\n}\n```",
              hint: "Make a trace table: n = 1, 3, 9, ...",
              solution: "n takes the values 1, 3, 9, 27 (all printed). Then n becomes 81, the test 81 < 40 fails, and `end: 81` is printed.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int n = 1;
    while (n < 40) {
        printf("%d ", n);
        n = n * 3;
    }
    printf("\\nend: %d\\n", n);
    return 0;
}`,
              expectedOutput: "1 3 9 27 \nend: 81",
            },
            {
              type: "exercise",
              id: "c10-ex-count-digits",
              kind: "write",
              title: "Count the digits",
              prompt: "Write a program with `int n = 905173;` that uses a while loop to count its digits and prints `6 digits`. Make sure `n = 0` would print `1 digits` (use do-while!).",
              hint: "Divide by 10 until the number becomes 0, counting each division. A do-while handles 0 correctly because the body runs once.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int n = 905173;
    int digits = 0;

    do {
        digits++;
        n /= 10;
    } while (n != 0);

    printf("%d digits\\n", digits);
    return 0;
}`,
              expectedOutput: "6 digits",
            },
            {
              type: "exercise",
              id: "c10-ex-concept-dowhile",
              kind: "concept",
              title: "Zero or one?",
              prompt: "How many times does each body run when `x` starts at 10? Explain.\n\n```c\nwhile (x < 5) { x++; }\n\ndo { x++; } while (x < 5);\n```",
              solution: "The while loop runs 0 times: the condition 10 < 5 is false at the first test. The do-while runs once: the body executes (x becomes 11) before the condition is tested and found false.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c10-dowhile-mcq",
              prompt: "Which loop is guaranteed to execute its body at least once?",
              options: [
                { id: "a", text: "while" },
                { id: "b", text: "for" },
                { id: "c", text: "do-while" },
                { id: "d", text: "None of them" },
              ],
              correct: "c",
              explanation: "do-while tests its condition after the body, so the body always runs once.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c10-while-sum-output",
              prompt: "What does this print?",
              code: `#include <stdio.h>

int main(void)
{
    int i = 10, sum = 0;
    while (i > 0) {
        sum += i;
        i -= 3;
    }
    printf("%d %d\\n", sum, i);
    return 0;
}`,
              expected: "22 -2",
              explanation: "i takes 10, 7, 4, 1 (sum = 22), then becomes -2 and the loop stops.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c10-sentinel-tf",
              prompt: "In a correctly written sentinel-controlled loop, the sentinel value is added to the total.",
              correct: false,
              explanation: "The sentinel only marks the end of the data and must not be processed.",
            },
            {
              type: "FILL_BLANK",
              slug: "c10-dowhile-fill",
              prompt: "Complete the syntax: `do { x++; } ___ (x < 10);`",
              accepted: [["while"]],
            },
            {
              type: "CODE_WRITING",
              slug: "c10-reverse-digits",
              prompt:
                "Read a non-negative integer and print its digits reversed as a number. For example, `1234` prints `4321`, and `1200` prints `21` (leading zeros disappear). For `0` print `0`. Use a while loop with `% 10` and `/ 10`.",
              starterCode: `#include <stdio.h>

int main(void)
{
    int n, rev = 0;
    scanf("%d", &n);
    /* your loop here */
    printf("%d\\n", rev);
    return 0;
}`,
              sampleTests: [
                { stdin: "1234", expected: "4321" },
                { stdin: "1200", expected: "21" },
              ],
              hiddenTests: [
                { stdin: "0", expected: "0" },
                { stdin: "7", expected: "7" },
                { stdin: "90817", expected: "71809" },
              ],
              solutionCode: `#include <stdio.h>

int main(void)
{
    int n, rev = 0;
    scanf("%d", &n);
    while (n > 0) {
        rev = rev * 10 + n % 10;
        n /= 10;
    }
    printf("%d\\n", rev);
    return 0;
}`,
              explanation: "Each iteration takes the last digit of n (n % 10), appends it to rev by shifting rev one place left (rev * 10), and removes that digit from n (n / 10).",
            },
          ],
        },
        {
          slug: "for-loops-counting",
          title: "The for loop",
          summary:
            "Write counter-controlled loops compactly with for, step by different amounts, build sums and products, and choose between for, while and do-while.",
          estMinutes: 25,
          blocks: [
            {
              type: "objectives",
              items: [
                "Write a for loop and identify its initialisation, condition and update parts",
                "Trace the exact order in which the three parts execute",
                "Count up, count down and step by amounts other than 1",
                "Choose the most suitable loop for a task",
              ],
            },
            {
              type: "markdown",
              md: `## All the loop control in one line

Most loops follow the same shape: set a counter, test it, do the work, update the counter. The \`for\` loop collects the three control parts into its header, so you can see at a glance how the loop runs:

\`for (i = 1; i <= 10; i++)\` reads as "start *i* at 1; keep going while *i* is at most 10; add 1 to *i* after each iteration".

Use \`for\` whenever you know (or can compute) how many times to repeat: "for each of the 30 students", "for every number from 1 to n".`,
            },
            {
              type: "syntax",
              language: "c",
              code: `for (initialisation; condition; update) {
    body;
}

/* is equivalent to: */
initialisation;
while (condition) {
    body;
    update;
}`,
              md: "Order: initialisation once → test condition → body → update → test → body → update → ... until the test is false. Any of the three parts may be omitted, but the two semicolons must stay.",
            },
            {
              type: "definition",
              term: "Counter-controlled loop",
              md: "A loop whose number of iterations is determined by a counter that moves from a start value to an end value, as opposed to a *sentinel-controlled* loop that stops on a special input.",
            },
            {
              type: "definition",
              term: "Accumulator",
              md: "A variable that builds up a result across iterations, such as a running sum (start at 0, `sum += x`) or a running product (start at 1, `prod *= x`).",
            },
            {
              type: "code",
              language: "c",
              title: "Summing 1 to 5 with a trace",
              runnable: true,
              code: `#include <stdio.h>

int main(void)
{
    int i, sum = 0;

    for (i = 1; i <= 5; i++) {
        sum += i;
        printf("i = %d, sum = %d\\n", i, sum);
    }
    printf("After the loop, i = %d\\n", i);
    return 0;
}`,
              output: `i = 1, sum = 1
i = 2, sum = 3
i = 3, sum = 6
i = 4, sum = 10
i = 5, sum = 15
After the loop, i = 6`,
              walkthrough: [
                { lines: "5", text: "`sum` is an accumulator and must start at 0." },
                { lines: "7", text: "`i = 1` runs once. Then `i <= 5` is tested before each iteration, and `i++` runs after each iteration." },
                { lines: "8-9", text: "The body adds the current i to the running total and prints both." },
                { lines: "11", text: "The loop ends when the test fails, which happens when i has become 6. That is why i is 6 here, not 5. Off-by-one questions often test this." },
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Products, counting down and other steps",
              runnable: true,
              code: `#include <stdio.h>

int main(void)
{
    int n = 6;
    long fact = 1;
    int i;

    for (i = 2; i <= n; i++)
        fact *= i;
    printf("%d! = %ld\\n", n, fact);

    for (i = 10; i >= 0; i -= 2)
        printf("%d ", i);
    printf("\\n");

    for (i = 1; i <= 100; i *= 3)
        printf("%d ", i);
    printf("\\n");
    return 0;
}`,
              output: "6! = 720\n10 8 6 4 2 0 \n1 3 9 27 81 ",
              walkthrough: [
                { lines: "6", text: "A product accumulator starts at 1 (starting at 0 would make every product 0). `long` gives extra range." },
                { lines: "9-10", text: "Factorial: multiply 2 × 3 × 4 × 5 × 6 = 720. A one-statement body needs no braces." },
                { lines: "13-14", text: "Count down by 2: the update can be any expression, here `i -= 2`, and the condition uses `>=`." },
                { lines: "17-18", text: "Multiply by 3 each time: 1, 3, 9, 27, 81. The next value, 243, fails `i <= 100`." },
              ],
            },
            {
              type: "callout",
              variant: "note",
              title: "Declaring the counter inside for (C99)",
              md: "Since C99 you can write `for (int i = 0; i < n; i++)`. The variable `i` then exists only inside the loop. Older compilers (C89) require declaring it before the loop, which is also how you can use its final value afterwards.",
            },
            {
              type: "heading",
              text: "Choosing a loop",
              level: 2,
            },
            {
              type: "table",
              caption: "Which loop should I use?",
              headers: ["Situation", "Best fit", "Example"],
              rows: [
                ["Number of iterations known or computable", "for", "print a table for 1 to 10"],
                ["Repeat while a condition holds; may be zero times", "while", "read until sentinel; process digits"],
                ["Must run at least once", "do-while", "menu; validate input"],
              ],
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `A \`for\` loop is simply a \`while\` loop with its pieces rearranged for readability; the compiler generates essentially the same code for both. Putting the update in the header means it is hard to forget, which is one reason \`for\` is preferred for counting loops. The final value of the counter is the first value that made the condition false.`,
            },
            {
              type: "heading",
              text: "Real-world uses",
              level: 2,
            },
            {
              type: "markdown",
              md: `- **Processing every element** of an array: \`for (i = 0; i < n; i++)\` (chapter 14).
- **Repeating a fixed number of times:** 12 months of interest, 60 frames per second for 10 seconds.
- **Generating sequences:** tables, powers, factorials, Fibonacci numbers.
- **Simulations:** \`for (year = 1; year <= 10; year++) balance *= 1.05;\`.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Off-by-one errors",
                  wrong: `for (i = 1; i < 10; i++)   /* runs 9 times: 1..9 */`,
                  right: `for (i = 1; i <= 10; i++)  /* runs 10 times: 1..10 */`,
                  md: "Check the first and last values: count from a to b inclusive with `i = a; i <= b`, or n times with `i = 0; i < n`.",
                },
                {
                  title: "Commas instead of semicolons in the header",
                  wrong: `for (i = 0, i < 5, i++)`,
                  right: `for (i = 0; i < 5; i++)`,
                  md: "The three parts are separated by semicolons. (Commas are allowed *inside* a part, e.g. `for (i = 0, j = 10; i < j; i++, j--)`.)",
                },
                {
                  title: "Semicolon after the header",
                  wrong: `for (i = 0; i < 5; i++);
    printf("%d\\n", i);   /* prints 5 once */`,
                  right: `for (i = 0; i < 5; i++)
    printf("%d\\n", i);`,
                  md: "A semicolon right after `)` gives the loop an empty body; the printf runs once afterwards.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "for (init; cond; update): init once; cond before each iteration; update after each iteration.",
                "After for (i = 1; i <= n; i++), i equals n + 1.",
                "for (i = 0; i < n; i++) runs exactly n times.",
                "for (;;) is an infinite loop: an empty condition counts as true.",
                "Products start at 1, sums at 0.",
              ],
            },
            {
              type: "recap",
              items: [
                "for puts initialisation, condition and update in one header.",
                "It is equivalent to a while loop with the update at the end of the body.",
                "Steps can be any update: i--, i += 2, i *= 3.",
                "Use for for counting, while for conditions, do-while for at-least-once.",
              ],
            },
            {
              type: "exercise",
              id: "c10-ex-table",
              kind: "write",
              title: "Multiplication table of 7",
              prompt: "Write a program that prints the multiplication table of 7 from 1 to 5 in the form `7 x 1 = 7`, one line each.",
              hint: "for (i = 1; i <= 5; i++) printf(\"7 x %d = %d\\n\", i, 7 * i);",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int i;
    for (i = 1; i <= 5; i++)
        printf("7 x %d = %d\\n", i, 7 * i);
    return 0;
}`,
              expectedOutput: `7 x 1 = 7
7 x 2 = 14
7 x 3 = 21
7 x 4 = 28
7 x 5 = 35`,
            },
            {
              type: "exercise",
              id: "c10-ex-predict-for",
              kind: "predict",
              title: "How many stars?",
              prompt: "Predict the output.\n\n```c\n#include <stdio.h>\n\nint main(void)\n{\n    int i, count = 0;\n    for (i = 3; i <= 20; i += 4)\n        count++;\n    printf(\"%d %d\\n\", count, i);\n    return 0;\n}\n```",
              hint: "List the values of i: 3, 7, ...",
              solution: "i takes 3, 7, 11, 15, 19: five iterations. Then i becomes 23, which fails the test. Output: `5 23`.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int i, count = 0;
    for (i = 3; i <= 20; i += 4)
        count++;
    printf("%d %d\\n", count, i);
    return 0;
}`,
              expectedOutput: "5 23",
            },
            {
              type: "exercise",
              id: "c10-ex-debug-fact",
              kind: "debug",
              title: "Why is the factorial 0?",
              prompt: "This program should print `5! = 120` but prints `5! = 0`. Fix it.",
              starterCode: `#include <stdio.h>

int main(void)
{
    int i, fact = 0;
    for (i = 1; i <= 5; i++)
        fact *= i;
    printf("5! = %d\\n", fact);
    return 0;
}`,
              hint: "What is 0 times anything?",
              solution: "A product accumulator must start at 1, not 0.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int i, fact = 1;
    for (i = 1; i <= 5; i++)
        fact *= i;
    printf("5! = %d\\n", fact);
    return 0;
}`,
              expectedOutput: "5! = 120",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c10-for-count-mcq",
              prompt: "How many times does the body of `for (i = 0; i < 10; i += 2)` execute?",
              options: [
                { id: "a", text: "10" },
                { id: "b", text: "5" },
                { id: "c", text: "6" },
                { id: "d", text: "4" },
              ],
              correct: "b",
              explanation: "i takes 0, 2, 4, 6, 8: five iterations. At 10 the test fails.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c10-for-down-output",
              prompt: "What does this print?",
              code: `#include <stdio.h>

int main(void)
{
    int i, p = 1;
    for (i = 5; i > 1; i--)
        p *= i;
    printf("%d %d\\n", p, i);
    return 0;
}`,
              expected: "120 1",
              explanation: "p = 5 × 4 × 3 × 2 = 120. The loop stops when i becomes 1.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c10-for-order-tf",
              prompt: "In a for loop, the update expression runs before the first iteration.",
              correct: false,
              explanation: "The update runs after each iteration of the body, never before the first one.",
            },
            {
              type: "FILL_BLANK",
              slug: "c10-for-parts-fill",
              prompt: "In `for (i = 1; i <= n; i++)`, the part `i <= n` is called the ___ .",
              accepted: [["condition", "test", "loop condition", "test expression"]],
            },
          ],
        },
      ],
    },
    {
      slug: "loop-control",
      title: "Controlling loops",
      lessons: [
        {
          slug: "break-continue-infinite-loops",
          title: "break, continue and infinite loops",
          summary:
            "Leave a loop early with break, skip to the next iteration with continue, write intentional infinite loops safely, and diagnose accidental ones.",
          estMinutes: 25,
          blocks: [
            {
              type: "objectives",
              items: [
                "Use break to exit a loop as soon as a result is found",
                "Use continue to skip the rest of the current iteration",
                "Write an intentional infinite loop with a clear exit",
                "Diagnose and fix the common causes of accidental infinite loops",
              ],
            },
            {
              type: "markdown",
              md: `## Changing the flow from inside a loop

Sometimes you discover halfway through a loop that you are done (you found what you were searching for), or that the current item should be skipped (an invalid reading). Two statements let you react:

- **\`break\`** jumps **out** of the innermost loop immediately. Execution continues after the loop.
- **\`continue\`** jumps to the **next iteration**: the rest of the body is skipped. In a \`for\` loop the update still runs; in \`while\`/\`do-while\` the condition is tested next.

Analogy: looking for your keys in a row of drawers. Once you find them, you stop searching (\`break\`). If a drawer is locked, you skip it and move to the next one (\`continue\`).`,
            },
            {
              type: "definition",
              term: "break (in a loop)",
              md: "Terminates the innermost enclosing loop (or switch) immediately.",
            },
            {
              type: "definition",
              term: "continue",
              md: "Skips the remaining statements of the current iteration of the innermost loop. In a `for` loop, control goes to the update expression; in `while` and `do-while`, to the condition.",
            },
            {
              type: "syntax",
              language: "c",
              code: `for (...) {
    if (found_what_we_need)
        break;        /* leave the loop now */
    if (skip_this_one)
        continue;     /* go to the next iteration */
    /* normal processing */
}`,
            },
            {
              type: "code",
              language: "c",
              title: "break and continue",
              runnable: true,
              code: `#include <stdio.h>

int main(void)
{
    int i;

    for (i = 50; i <= 100; i++) {
        if (i % 7 == 0) {
            printf("First multiple of 7: %d\\n", i);
            break;
        }
    }

    for (i = 1; i <= 15; i++) {
        if (i % 2 == 0 || i % 3 == 0)
            continue;
        printf("%d ", i);
    }
    printf("\\n");
    return 0;
}`,
              output: `First multiple of 7: 56
1 5 7 11 13 `,
              walkthrough: [
                { lines: "7-12", text: "Search from 50 upwards. At i = 56 the test succeeds; we print and `break`, so 57 to 100 are never checked." },
                { lines: "14", text: "Second loop over 1 to 15." },
                { lines: "15-16", text: "Skip numbers divisible by 2 or 3. `continue` jumps to `i++` and the next test, so the printf is skipped." },
                { lines: "17", text: "Only 1, 5, 7, 11 and 13 reach this line." },
              ],
            },
            {
              type: "heading",
              text: "Infinite loops",
              level: 2,
            },
            {
              type: "markdown",
              md: `An **infinite loop** never ends on its own. Sometimes that is exactly what you want: servers, operating systems and embedded devices run "forever". C programmers write intentional infinite loops as \`while (1)\` or \`for (;;)\` and leave them with \`break\` (or \`return\`) when a condition inside is met.

An **accidental** infinite loop is a bug; your program "hangs". Common causes:

1. The update is missing, or changes the wrong variable.
2. The update moves *away* from the stopping condition (\`i--\` instead of \`i++\`).
3. A stray semicolon after \`while (...)\` or \`for (...)\`.
4. The condition can never become false, such as \`i != 10\` when \`i\` goes 1, 3, 5, ... 9, 11.
5. Comparing floating-point values with \`!=\`: \`for (x = 0.0; x != 1.0; x += 0.1)\` may never hit exactly 1.0.

If your program hangs in a terminal, press **Ctrl+C** to stop it.`,
            },
            {
              type: "definition",
              term: "Infinite loop",
              md: "A loop whose condition never becomes false. Intentional ones (`while (1)`, `for (;;)`) contain a `break` or `return`; accidental ones are bugs.",
            },
            {
              type: "code",
              language: "c",
              title: "An intentional infinite loop with a clean exit",
              runnable: true,
              stdin: "5 3 0",
              code: `#include <stdio.h>

int main(void)
{
    int x;

    while (1) {
        if (scanf("%d", &x) != 1 || x == 0)
            break;
        printf("%d squared is %d\\n", x, x * x);
    }
    printf("Bye\\n");
    return 0;
}`,
              output: `5 squared is 25
3 squared is 9
Bye`,
              walkthrough: [
                { lines: "7", text: "`while (1)`: the condition is always true, so the only way out is a `break`." },
                { lines: "8-9", text: "`scanf` returns the number of values it read. If it could not read a number (end of input or bad input), or the number is 0, leave the loop. Checking the return value protects against an endless loop on bad input." },
                { lines: "10", text: "Otherwise process the value." },
                { lines: "12", text: "After `break`, execution continues here." },
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Prime test: stop as soon as a divisor is found",
              runnable: true,
              stdin: "91",
              code: `#include <stdio.h>

int main(void)
{
    int n, d;
    int isPrime = 1;

    scanf("%d", &n);
    for (d = 2; d * d <= n; d++) {
        if (n % d == 0) {
            isPrime = 0;
            break;
        }
    }
    if (n < 2)
        printf("%d is not prime\\n", n);
    else if (isPrime)
        printf("%d is prime\\n", n);
    else
        printf("%d is not prime (divisible by %d)\\n", n, d);
    return 0;
}`,
              output: "91 is not prime (divisible by 7)",
              walkthrough: [
                { lines: "6", text: "A **flag** variable: assume prime until proven otherwise." },
                { lines: "8", text: "Read n; with input 91, n = 91." },
                { lines: "9", text: "We only need to try divisors up to the square root of n: if n = a × b, one of a and b is at most √n. `d * d <= n` avoids floating-point square roots." },
                { lines: "10-13", text: "91 % 7 == 0, so clear the flag and `break`. There is no point testing more divisors, and d keeps the value 7." },
                { lines: "15-16", text: "Numbers below 2 are not prime by definition, whatever the loop found." },
                { lines: "17-20", text: "Otherwise report the result using the flag, including the divisor that stopped the search." },
              ],
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `\`break\` and \`continue\` are structured jumps: \`break\` jumps to just after the loop, and \`continue\` jumps to the loop's "next iteration" point (the update in \`for\`, the test in \`while\`). Because they always target the *innermost* loop, they cannot jump to arbitrary places, which keeps code readable. An infinite loop is just a loop whose test can never fail; adding a \`break\` gives it an exit that is decided in the middle of the body rather than at the top.`,
            },
            {
              type: "heading",
              text: "Real-world uses",
              level: 2,
            },
            {
              type: "markdown",
              md: `- **Searching:** stop scanning a list once the item is found (\`break\`).
- **Filtering:** skip blank lines, comments or invalid readings (\`continue\`).
- **Event loops:** GUIs, games and servers run \`while (1)\` until the user quits.
- **Embedded systems:** a microcontroller's \`main\` usually ends in \`for (;;)\` that reads sensors forever.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "continue in a while loop skipping the update",
                  wrong: `int i = 0;
while (i < 10) {
    if (i % 2 == 0)
        continue;      /* i never changes: infinite loop */
    printf("%d\\n", i);
    i++;
}`,
                  right: `int i;
for (i = 0; i < 10; i++) {
    if (i % 2 == 0)
        continue;      /* the update i++ still runs */
    printf("%d\\n", i);
}`,
                  md: "In a while loop, `continue` jumps straight to the condition, skipping an update at the bottom of the body. Use a for loop, or update before the continue.",
                },
                {
                  title: "A condition that skips over its target",
                  wrong: `for (i = 1; i != 10; i += 2)   /* 1,3,5,7,9,11,... never 10 */`,
                  right: `for (i = 1; i < 10; i += 2)`,
                  md: "Prefer `<`, `<=`, `>`, `>=` over `!=` in loop conditions, so overshooting the target still stops the loop.",
                },
                {
                  title: "Expecting break to leave all loops",
                  wrong: `for (i = 0; i < 3; i++)
    for (j = 0; j < 3; j++)
        if (j == 1) break;   /* only leaves the inner loop */`,
                  right: `int done = 0;
for (i = 0; i < 3 && !done; i++)
    for (j = 0; j < 3; j++)
        if (j == 1) { done = 1; break; }`,
                  md: "`break` exits only the innermost loop. Use a flag (or a function with `return`) to stop outer loops too.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "break exits the innermost loop or switch; continue skips to the next iteration of the innermost loop.",
                "In for, continue jumps to the update; in while/do-while, to the condition.",
                "while (1) and for (;;) are intentional infinite loops; they need a break or return.",
                "Prefer < or > over != in loop conditions to avoid overshooting.",
                "Never test floating-point loop counters with == or !=.",
              ],
            },
            {
              type: "recap",
              items: [
                "break stops a loop early, typically when a search succeeds.",
                "continue skips the rest of one iteration.",
                "Intentional infinite loops need a clear exit inside.",
                "Accidental infinite loops come from missing or wrong updates and impossible conditions.",
              ],
            },
            {
              type: "exercise",
              id: "c10-ex-predict-break-continue",
              kind: "predict",
              title: "break vs. continue",
              prompt: "Predict the output.\n\n```c\n#include <stdio.h>\n\nint main(void)\n{\n    int i;\n    for (i = 1; i <= 10; i++) {\n        if (i == 4) continue;\n        if (i == 8) break;\n        printf(\"%d \", i);\n    }\n    printf(\"| %d\\n\", i);\n    return 0;\n}\n```",
              hint: "4 is skipped; the loop ends when i reaches 8.",
              solution: "Prints 1 2 3 (4 skipped) 5 6 7, then at i = 8 the loop breaks with i still 8.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int i;
    for (i = 1; i <= 10; i++) {
        if (i == 4) continue;
        if (i == 8) break;
        printf("%d ", i);
    }
    printf("| %d\\n", i);
    return 0;
}`,
              expectedOutput: "1 2 3 5 6 7 | 8",
            },
            {
              type: "exercise",
              id: "c10-ex-debug-infinite",
              kind: "debug",
              title: "The loop that never ends",
              prompt: "This program should print the odd numbers below 10 but never stops. Fix it while keeping the while loop.",
              starterCode: `#include <stdio.h>

int main(void)
{
    int i = 0;
    while (i < 10) {
        if (i % 2 == 0)
            continue;
        printf("%d ", i);
        i++;
    }
    printf("\\n");
    return 0;
}`,
              hint: "What happens to i when it is even?",
              solution: "When i is even, continue jumps back to the condition without incrementing i, so i stays 0 forever. Increment before continuing (or move i++ to the top of the body).",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int i = 0;
    while (i < 10) {
        if (i % 2 == 0) {
            i++;
            continue;
        }
        printf("%d ", i);
        i++;
    }
    printf("\\n");
    return 0;
}`,
              expectedOutput: "1 3 5 7 9",
            },
            {
              type: "exercise",
              id: "c10-ex-guess",
              kind: "write",
              title: "Guess the number",
              prompt: "Write a guessing game: the secret is 42. Use `while (1)` to read guesses with scanf, printing `Too low`, `Too high`, or `Correct after N guesses` (then break). With input `50 30 42` the output is:\n\n```\nToo high\nToo low\nCorrect after 3 guesses\n```",
              hint: "Count every guess; break inside the 'correct' branch. Also break if scanf fails, to avoid an infinite loop.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int secret = 42, guess, tries = 0;

    while (1) {
        if (scanf("%d", &guess) != 1)
            break;
        tries++;
        if (guess < secret) {
            printf("Too low\\n");
        } else if (guess > secret) {
            printf("Too high\\n");
        } else {
            printf("Correct after %d guesses\\n", tries);
            break;
        }
    }
    return 0;
}`,
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c10-continue-mcq",
              prompt: "In a `for` loop, where does control go after a `continue` statement?",
              options: [
                { id: "a", text: "To the statement after the loop" },
                { id: "b", text: "To the update expression, then the condition" },
                { id: "c", text: "To the initialisation expression" },
                { id: "d", text: "To the start of the body, without testing the condition" },
              ],
              correct: "b",
              explanation: "continue skips the rest of the body; the for loop then performs its update and tests the condition.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c10-break-output",
              prompt: "What does this print?",
              code: `#include <stdio.h>

int main(void)
{
    int n = 0, sum = 0;
    while (1) {
        n++;
        if (n % 3 == 0) continue;
        sum += n;
        if (sum > 10) break;
    }
    printf("%d %d\\n", n, sum);
    return 0;
}`,
              expected: "5 12",
              explanation: "n=1 sum=1; n=2 sum=3; n=3 skipped; n=4 sum=7; n=5 sum=12 > 10, break.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c10-break-nested-tf",
              prompt: "A break inside an inner loop also terminates the outer loop.",
              correct: false,
              explanation: "break only exits the innermost enclosing loop (or switch).",
            },
            {
              type: "CODE_WRITING",
              slug: "c10-first-negative",
              prompt:
                "Read an integer n, then n integers. Print the position (1-based) and value of the **first** negative number as `First negative: V at position P`, and stop reading as soon as you find it. If there is no negative number, print `No negative numbers`.",
              starterCode: `#include <stdio.h>

int main(void)
{
    int n, i, x;
    scanf("%d", &n);
    /* your loop here */
    return 0;
}`,
              sampleTests: [
                { stdin: "5\n4 7 -2 9 -5", expected: "First negative: -2 at position 3" },
                { stdin: "3\n1 2 3", expected: "No negative numbers" },
              ],
              hiddenTests: [
                { stdin: "1\n-8", expected: "First negative: -8 at position 1" },
                { stdin: "0", expected: "No negative numbers" },
                { stdin: "4\n0 0 0 -1", expected: "First negative: -1 at position 4" },
              ],
              solutionCode: `#include <stdio.h>

int main(void)
{
    int n, i, x;
    int found = 0;
    scanf("%d", &n);
    for (i = 1; i <= n; i++) {
        scanf("%d", &x);
        if (x < 0) {
            printf("First negative: %d at position %d\\n", x, i);
            found = 1;
            break;
        }
    }
    if (!found)
        printf("No negative numbers\\n");
    return 0;
}`,
              explanation: "A flag records whether the search succeeded; break stops the loop at the first negative value.",
            },
          ],
        },
      ],
    },
  ],
};

export default chapter;
