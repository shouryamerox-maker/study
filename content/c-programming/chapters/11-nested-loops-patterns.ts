import type { ChapterContent } from "../../../src/lib/content/schema";

const chapter: ChapterContent = {
  slug: "nested-loops-patterns",
  title: "Nested Loops and Patterns",
  summary:
    "Loops inside loops: how nested loops execute, how to trace them and count iterations, and how to design star, number and pyramid patterns and multiplication tables row by row.",
  topics: [
    {
      slug: "nested-loops",
      title: "Nested loops",
      lessons: [
        {
          slug: "nested-loops-tracing",
          title: "How nested loops work",
          summary:
            "Understand the inner/outer loop relationship, trace iterations with a table, count how many times the inner body runs, and print a multiplication table grid.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Explain how an inner loop runs completely for each iteration of the outer loop",
                "Trace a nested loop with a table of (outer, inner) values",
                "Calculate how many times the inner body executes, including when the inner limit depends on the outer counter",
                "Print a formatted multiplication table with nested for loops",
              ],
            },
            {
              type: "markdown",
              md: `## A loop inside a loop

A loop body can contain any statements, including another loop. This is called **nesting**. The loop on the outside is the **outer loop**; the one inside its body is the **inner loop**.

The key rule: **for every single iteration of the outer loop, the inner loop runs from start to finish.**

Analogy: a clock. The minute hand (inner loop) goes all the way round, 0 to 59, and only then does the hour hand (outer loop) move forward by one. Then the minute hand goes all the way round again.

Nested loops are the natural tool whenever data has **rows and columns**: tables, grids, game boards, images, and the text patterns in this chapter.`,
            },
            {
              type: "definition",
              term: "Outer loop / inner loop",
              md: "In a nested loop, the **outer loop** controls how many times the whole inner loop is executed; the **inner loop** is part of the outer loop's body and restarts from its initial value on each outer iteration.",
            },
            {
              type: "syntax",
              language: "c",
              code: `for (i = 1; i <= rows; i++) {        /* outer: one iteration per row  */
    for (j = 1; j <= cols; j++) {    /* inner: one iteration per column */
        /* work for cell (i, j) */
    }
    /* work at the end of each row, e.g. printf("\\n"); */
}`,
              md: "Use **different** counter variables for the two loops (conventionally `i` for rows and `j` for columns).",
            },
            {
              type: "code",
              language: "c",
              title: "Watching the counters",
              runnable: true,
              code: `#include <stdio.h>

int main(void)
{
    int i, j;

    for (i = 1; i <= 3; i++) {
        for (j = 1; j <= 2; j++) {
            printf("(i=%d, j=%d) ", i, j);
        }
        printf("\\n");
    }
    return 0;
}`,
              output: "(i=1, j=1) (i=1, j=2) \n(i=2, j=1) (i=2, j=2) \n(i=3, j=1) (i=3, j=2) ",
              walkthrough: [
                { lines: "7", text: "The outer loop runs 3 times (i = 1, 2, 3)." },
                { lines: "8", text: "Each time the outer body starts, `j = 1` resets the inner counter. The inner loop then runs 2 times." },
                { lines: "9", text: "This line runs 3 × 2 = 6 times in total, once for every (i, j) pair." },
                { lines: "11", text: "After the inner loop finishes, end the row. This is in the outer body, so it runs 3 times." },
              ],
            },
            {
              type: "table",
              caption: "Trace of the nested loop above",
              headers: ["Step", "i", "j", "Action"],
              rows: [
                ["1", "1", "1", "print (i=1, j=1)"],
                ["2", "1", "2", "print (i=1, j=2)"],
                ["3", "1", "3", "j <= 2 fails → newline, i becomes 2"],
                ["4", "2", "1", "print (i=2, j=1)"],
                ["5", "2", "2", "print (i=2, j=2)"],
                ["6", "2", "3", "inner ends → newline, i becomes 3"],
                ["7–9", "3", "1, 2, 3", "two prints, then newline; i becomes 4 and the outer loop ends"],
              ],
            },
            {
              type: "heading",
              text: "Counting iterations",
              level: 2,
            },
            {
              type: "markdown",
              md: `If the outer loop runs **m** times and the inner loop runs **n** times *each time*, the inner body runs **m × n** times.

Often the inner limit depends on the outer counter, as in \`for (j = 1; j <= i; j++)\`. Then add up the inner counts row by row: for i = 1..n this gives 1 + 2 + ... + n = **n(n + 1) / 2**. This is exactly the shape of a triangle pattern, and it is also why some algorithms (like simple sorting) take time proportional to n².`,
            },
            {
              type: "code",
              language: "c",
              title: "Counting iterations and breaking out of nested loops",
              runnable: true,
              code: `#include <stdio.h>

int main(void)
{
    int a, b, count = 0;
    int found = 0;

    for (a = 1; a <= 4; a++)
        for (b = 1; b <= a; b++)
            count++;
    printf("Inner body ran %d times\\n", count);

    for (a = 1; a <= 20 && !found; a++) {
        for (b = a; b <= 20; b++) {
            if (a * b == 36 && a + b == 13) {
                printf("Found a=%d, b=%d\\n", a, b);
                found = 1;
                break;
            }
        }
    }
    return 0;
}`,
              output: `Inner body ran 10 times
Found a=4, b=9`,
              walkthrough: [
                { lines: "8-10", text: "The inner limit is `a`, so the inner body runs 1, 2, 3 and 4 times: 1 + 2 + 3 + 4 = 10 = 4 × 5 / 2." },
                { lines: "13", text: "The outer condition also checks the `found` flag, so the outer loop stops once a solution is found." },
                { lines: "14", text: "Starting `b` at `a` avoids testing each pair twice (3×12 and 12×3)." },
                { lines: "15-19", text: "When the pair is found, print it, set the flag and `break`. The break leaves only the inner loop; the flag then stops the outer loop." },
              ],
            },
            {
              type: "heading",
              text: "Multiplication tables",
              level: 2,
            },
            {
              type: "code",
              language: "c",
              title: "A formatted multiplication grid",
              runnable: true,
              code: `#include <stdio.h>

int main(void)
{
    int row, col;
    int n = 5;

    printf("    |");
    for (col = 1; col <= n; col++)
        printf("%4d", col);
    printf("\\n----+");
    for (col = 1; col <= n; col++)
        printf("----");
    printf("\\n");

    for (row = 1; row <= n; row++) {
        printf("%3d |", row);
        for (col = 1; col <= n; col++)
            printf("%4d", row * col);
        printf("\\n");
    }
    return 0;
}`,
              output: `    |   1   2   3   4   5
----+--------------------
  1 |   1   2   3   4   5
  2 |   2   4   6   8  10
  3 |   3   6   9  12  15
  4 |   4   8  12  16  20
  5 |   5  10  15  20  25`,
              walkthrough: [
                { lines: "8-10", text: "Header row: the column numbers. `%4d` prints each number right-aligned in a field 4 characters wide, so the columns line up." },
                { lines: "11-14", text: "A separator line: 4 dashes per column." },
                { lines: "16", text: "Outer loop: one iteration per row of the table." },
                { lines: "17", text: "Row label, 3 characters wide, followed by a bar." },
                { lines: "18-19", text: "Inner loop: one cell per column, containing row × col." },
                { lines: "20", text: "End the row." },
              ],
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `Nothing new is happening: the inner loop is just a statement inside the outer loop's body, so it executes *completely* every time the body executes. Its initialisation (\`j = 1\`) is part of that statement, which is why the inner counter restarts on each outer iteration. Output appears row by row because the terminal prints characters left to right and moves down only when it sees \`\\n\`.`,
            },
            {
              type: "heading",
              text: "Real-world uses",
              level: 2,
            },
            {
              type: "markdown",
              md: `- **Grids and matrices:** spreadsheets, game boards (chess, tic-tac-toe), seating plans (chapter 14 covers 2-D arrays).
- **Images:** an image is a grid of pixels; filters loop over every row and every column.
- **Comparing every pair:** finding duplicates, or the closest pair of points.
- **Timetables and reports** printed as rows and columns.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Reusing the same counter in both loops",
                  wrong: `for (i = 0; i < 3; i++)
    for (i = 0; i < 3; i++)   /* inner loop changes the outer counter! */
        printf("*");`,
                  right: `for (i = 0; i < 3; i++)
    for (j = 0; j < 3; j++)
        printf("*");`,
                  md: "The inner loop leaves `i` at 3, so the outer loop stops after one iteration (or, with other limits, loops forever). Use separate variables.",
                },
                {
                  title: "Newline in the wrong place",
                  wrong: `for (i = 0; i < 3; i++)
    for (j = 0; j < 3; j++) {
        printf("*");
        printf("\\n");   /* one star per line */
    }`,
                  right: `for (i = 0; i < 3; i++) {
    for (j = 0; j < 3; j++)
        printf("*");
    printf("\\n");       /* end of each row */
}`,
                  md: "The newline belongs to the outer loop body, after the inner loop finishes the row.",
                },
                {
                  title: "Forgetting that break only exits the inner loop",
                  wrong: `for (i = 0; i < n; i++)
    for (j = 0; j < n; j++)
        if (grid_match) break;   /* outer loop keeps going */`,
                  right: `int found = 0;
for (i = 0; i < n && !found; i++)
    for (j = 0; j < n; j++)
        if (grid_match) { found = 1; break; }`,
                  md: "Use a flag checked by the outer condition to stop both loops.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "The inner loop runs completely for each iteration of the outer loop.",
                "If the outer loop runs m times and the inner n times, the inner body runs m × n times.",
                "for (i = 1; i <= n; i++) for (j = 1; j <= i; j++) runs the inner body n(n+1)/2 times.",
                "Inner loop counters are re-initialised on each outer iteration.",
                "break leaves only the innermost loop.",
              ],
            },
            {
              type: "recap",
              items: [
                "Nested loops handle rows and columns: outer = rows, inner = columns.",
                "Trace nested loops with a table of counter values.",
                "Count iterations by multiplying or by summing row counts.",
                "Width specifiers like %4d keep table columns aligned.",
              ],
            },
            {
              type: "exercise",
              id: "c11-ex-predict-count",
              kind: "predict",
              title: "How many times?",
              prompt: "Predict the output.\n\n```c\n#include <stdio.h>\n\nint main(void)\n{\n    int i, j, c = 0;\n    for (i = 0; i < 4; i++)\n        for (j = i; j < 4; j++)\n            c++;\n    printf(\"%d\\n\", c);\n    return 0;\n}\n```",
              hint: "For i = 0 the inner loop runs 4 times, for i = 1 three times, ...",
              solution: "4 + 3 + 2 + 1 = 10.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int i, j, c = 0;
    for (i = 0; i < 4; i++)
        for (j = i; j < 4; j++)
            c++;
    printf("%d\\n", c);
    return 0;
}`,
              expectedOutput: "10",
            },
            {
              type: "exercise",
              id: "c11-ex-tables",
              kind: "write",
              title: "Tables 2 to 4",
              prompt: "Print the multiplication tables of 2, 3 and 4, each from 1 to 3, in this exact format (a blank line between tables):\n\n```\n2 x 1 = 2\n2 x 2 = 4\n2 x 3 = 6\n\n3 x 1 = 3\n...\n```",
              hint: "Outer loop over the table number, inner loop over the multiplier, and print an extra newline after each table except the last.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int t, k;
    for (t = 2; t <= 4; t++) {
        for (k = 1; k <= 3; k++)
            printf("%d x %d = %d\\n", t, k, t * k);
        if (t < 4)
            printf("\\n");
    }
    return 0;
}`,
              expectedOutput: `2 x 1 = 2
2 x 2 = 4
2 x 3 = 6

3 x 1 = 3
3 x 2 = 6
3 x 3 = 9

4 x 1 = 4
4 x 2 = 8
4 x 3 = 12`,
            },
            {
              type: "exercise",
              id: "c11-ex-concept-complexity",
              kind: "concept",
              title: "Thinking about cost",
              prompt: "A program compares every pair of students in a class of n students using two nested loops `for (i = 0; i < n; i++) for (j = 0; j < n; j++)`. How many comparisons are made for n = 100? How could you roughly halve this, and why does it matter for n = 100 000?",
              solution: "n × n = 10 000 comparisons for n = 100. Starting the inner loop at j = i + 1 compares each unordered pair once: n(n − 1)/2 = 4 950. For n = 100 000 the full version would do 10¹⁰ comparisons, which is slow even for a fast computer; the number of steps grows with the square of n, so halving it is helpful but choosing a better algorithm matters even more.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c11-iterations-mcq",
              prompt: "How many times is `x++` executed?\n\n```c\nfor (i = 0; i < 5; i++)\n    for (j = 0; j < 3; j++)\n        x++;\n```",
              options: [
                { id: "a", text: "8" },
                { id: "b", text: "15" },
                { id: "c", text: "5" },
                { id: "d", text: "24" },
              ],
              correct: "b",
              explanation: "5 outer iterations × 3 inner iterations = 15.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c11-nested-trace-output",
              prompt: "What does this print?",
              code: `#include <stdio.h>

int main(void)
{
    int i, j;
    for (i = 1; i <= 3; i++) {
        for (j = 1; j <= 3; j++)
            printf("%d", i * j);
        printf("\\n");
    }
    return 0;
}`,
              expected: "123\n246\n369",
              explanation: "Each row i prints i×1, i×2, i×3 with no separators.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c11-inner-reset-tf",
              prompt: "In `for (i...) { for (j = 0; j < n; j++) ... }`, the inner counter j starts again at 0 on every iteration of the outer loop.",
              correct: true,
              explanation: "The inner for statement, including its initialisation, is executed afresh each time the outer body runs.",
            },
            {
              type: "FILL_BLANK",
              slug: "c11-triangle-count-fill",
              prompt: "For n = 6, `for (i = 1; i <= n; i++) for (j = 1; j <= i; j++) count++;` leaves count equal to ___ .",
              accepted: [["21"]],
              explanation: "1 + 2 + 3 + 4 + 5 + 6 = 6 × 7 / 2 = 21.",
            },
          ],
        },
      ],
    },
    {
      slug: "pattern-printing",
      title: "Pattern printing",
      lessons: [
        {
          slug: "star-patterns-pyramids",
          title: "Star patterns and pyramids",
          summary:
            "A systematic method for pattern problems: rectangles, right triangles, inverted triangles, hollow shapes and centred pyramids.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Apply a step-by-step method to turn a picture into nested loops",
                "Print rectangles, right triangles and inverted triangles of stars",
                "Print centred pyramids by combining a spaces loop and a stars loop",
                "Use conditions inside the inner loop to draw hollow shapes",
              ],
            },
            {
              type: "markdown",
              md: `## The pattern method

Pattern problems are a favourite of exams and interviews because they test whether you can *think in loops*. Don't guess: use this method.

1. **Draw the pattern** for a small n (say 4) and number the rows 1..n.
2. **Outer loop = rows.** Almost always \`for (i = 1; i <= n; i++)\`.
3. For each row, **describe what is printed** as a list of *runs*: e.g. "3 spaces then 1 star".
4. **Make a table** of row number vs. the length of each run, and find a formula in terms of \`i\` and \`n\`.
5. **One inner loop per run**, then \`printf("\\n")\` at the end of the row.`,
            },
            {
              type: "workedExample",
              title: "Designing a centred pyramid for n = 4",
              problem: "Print:\n\n```\n   *\n  ***\n *****\n*******\n```",
              steps: [
                "Rows: 4, so the outer loop is `for (i = 1; i <= 4; i++)`.",
                "Each row is: some spaces, then some stars.",
                "Table: row 1 → 3 spaces, 1 star; row 2 → 2 spaces, 3 stars; row 3 → 1 space, 5 stars; row 4 → 0 spaces, 7 stars.",
                "Spaces decrease by 1 per row: spaces = n − i. Stars increase by 2 per row, starting at 1: stars = 2i − 1.",
                "Write two inner loops: `for (j = 1; j <= n - i; j++) printf(\" \");` and `for (j = 1; j <= 2 * i - 1; j++) printf(\"*\");`, then a newline.",
              ],
              answer: "spaces = n − i, stars = 2i − 1 for row i = 1..n.",
            },
            {
              type: "definition",
              term: "Run",
              md: "In a pattern row, a run is a sequence of the same character (or the same rule), such as \"3 spaces\" or \"5 stars\". Each run becomes one inner loop.",
            },
            {
              type: "syntax",
              language: "c",
              code: `for (i = 1; i <= n; i++) {                /* one iteration per row   */
    for (j = 1; j <= RUN1_LENGTH(i); j++)   /* first run, e.g. spaces  */
        printf(" ");
    for (j = 1; j <= RUN2_LENGTH(i); j++)   /* second run, e.g. stars  */
        printf("*");
    printf("\\n");                           /* end of the row          */
}`,
              md: "Replace RUN1_LENGTH(i) and RUN2_LENGTH(i) with the formulas from your table, such as `n - i` and `2 * i - 1`.",
            },
            {
              type: "code",
              language: "c",
              title: "Square and right triangle",
              runnable: true,
              code: `#include <stdio.h>

int main(void)
{
    int i, j, n = 4;

    for (i = 1; i <= n; i++) {
        for (j = 1; j <= n; j++)
            printf("*");
        printf("\\n");
    }
    printf("\\n");
    for (i = 1; i <= n; i++) {
        for (j = 1; j <= i; j++)
            printf("*");
        printf("\\n");
    }
    return 0;
}`,
              output: `****
****
****
****

*
**
***
****`,
              walkthrough: [
                { lines: "7-11", text: "Square: every row has the same length n, so the inner limit is the constant n." },
                { lines: "12", text: "A blank line between the two shapes." },
                { lines: "13-17", text: "Right triangle: row i has i stars, so the inner limit is `i`. This single change turns the square into a triangle." },
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Inverted triangle and centred pyramid",
              runnable: true,
              code: `#include <stdio.h>

int main(void)
{
    int i, j, n = 4;

    for (i = n; i >= 1; i--) {
        for (j = 1; j <= i; j++)
            printf("*");
        printf("\\n");
    }

    for (i = 1; i <= n; i++) {
        for (j = 1; j <= n - i; j++)
            printf(" ");
        for (j = 1; j <= 2 * i - 1; j++)
            printf("*");
        printf("\\n");
    }
    return 0;
}`,
              output: `****
***
**
*
   *
  ***
 *****
*******`,
              walkthrough: [
                { lines: "7-11", text: "Inverted triangle: count the rows *down* from n to 1, and print i stars in row i. (Alternatively count up and print n − i + 1 stars.)" },
                { lines: "13", text: "Pyramid: rows 1 to n." },
                { lines: "14-15", text: "First run: n − i spaces push the stars towards the centre." },
                { lines: "16-17", text: "Second run: 2i − 1 stars (1, 3, 5, 7)." },
                { lines: "18", text: "End of the row. Note there are no trailing spaces after the stars." },
              ],
            },
            {
              type: "heading",
              text: "Hollow shapes: conditions inside the inner loop",
              level: 2,
            },
            {
              type: "markdown",
              md: `For hollow shapes, every cell is either a star or a space depending on **where it is**. Loop over every (row, column) cell and decide with an \`if\`: a cell is on the border of an n × n square if it is in the first or last row, or the first or last column.`,
            },
            {
              type: "code",
              language: "c",
              title: "Hollow square",
              runnable: true,
              code: `#include <stdio.h>

int main(void)
{
    int i, j, n = 5;

    for (i = 1; i <= n; i++) {
        for (j = 1; j <= n; j++) {
            if (i == 1 || i == n || j == 1 || j == n)
                printf("*");
            else
                printf(" ");
        }
        printf("\\n");
    }
    return 0;
}`,
              output: `*****
*   *
*   *
*   *
*****`,
              walkthrough: [
                { lines: "7-8", text: "Visit every cell of the 5 × 5 grid." },
                { lines: "9-12", text: "Border cells (first/last row or first/last column) get a star; interior cells get a space." },
                { lines: "14", text: "End each row." },
              ],
            },
            {
              type: "callout",
              variant: "tip",
              title: "Debugging a pattern",
              md: "Temporarily print a visible character such as `.` instead of a space. Then you can see exactly how many spaces each row has: `...*`, `..***`, and spot an off-by-one immediately.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `The console is a grid that is filled left to right, top to bottom, exactly like the order of a nested loop (outer = row, inner = column). Once you express each run length as a formula of the row number, the inner loop limits *are* those formulas. Every pattern problem reduces to finding those formulas, which is why the table in step 4 is the heart of the method.`,
            },
            {
              type: "heading",
              text: "Real-world uses",
              level: 2,
            },
            {
              type: "markdown",
              md: `- **Text-based output:** progress bars, histograms (\`*\` per unit), ASCII charts in log files.
- **Graphics:** drawing a filled shape on a screen is the same row-by-row process on pixels.
- **Interview and exam practice:** pattern problems train the skill of turning a description into loop limits, which you will use for arrays and matrices.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Inner limit not depending on the row",
                  wrong: `for (i = 1; i <= n; i++) {
    for (j = 1; j <= n; j++) printf("*");   /* square, not triangle */
    printf("\\n");
}`,
                  right: `for (i = 1; i <= n; i++) {
    for (j = 1; j <= i; j++) printf("*");
    printf("\\n");
}`,
                  md: "If row lengths change, the inner limit must involve `i`.",
                },
                {
                  title: "Wrong star formula in a pyramid",
                  wrong: `for (j = 1; j <= 2 * i; j++) printf("*");   /* 2, 4, 6: off-centre */`,
                  right: `for (j = 1; j <= 2 * i - 1; j++) printf("*");   /* 1, 3, 5 */`,
                  md: "Check your formula against the first two rows of the table before running.",
                },
                {
                  title: "Spaces loop after the stars",
                  wrong: `for (j = 1; j <= 2 * i - 1; j++) printf("*");
for (j = 1; j <= n - i; j++) printf(" ");   /* left-aligned */`,
                  right: `for (j = 1; j <= n - i; j++) printf(" ");
for (j = 1; j <= 2 * i - 1; j++) printf("*");`,
                  md: "Runs must be printed in the order they appear from left to right.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "Outer loop = rows; one inner loop per run; newline after the inner loops.",
                "Right triangle: j <= i. Inverted: j <= n - i + 1 (or count i down).",
                "Centred pyramid: n - i spaces, then 2i - 1 stars.",
                "Hollow shapes: loop over every cell and use if to choose star or space.",
              ],
            },
            {
              type: "recap",
              items: [
                "Draw, list the runs, tabulate run lengths, find formulas, code.",
                "Triangles change the inner limit with i; pyramids add a spaces run.",
                "Conditions inside the inner loop draw outlines.",
              ],
            },
            {
              type: "exercise",
              id: "c11-ex-right-aligned",
              kind: "write",
              title: "Right-aligned triangle",
              prompt: "Print this right-aligned triangle for n = 4:\n\n```\n   *\n  **\n ***\n****\n```",
              hint: "Row i: n − i spaces, then i stars.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int i, j, n = 4;
    for (i = 1; i <= n; i++) {
        for (j = 1; j <= n - i; j++)
            printf(" ");
        for (j = 1; j <= i; j++)
            printf("*");
        printf("\\n");
    }
    return 0;
}`,
              expectedOutput: `   *
  **
 ***
****`,
            },
            {
              type: "exercise",
              id: "c11-ex-debug-pyramid",
              kind: "debug",
              title: "The lopsided pyramid",
              prompt: "This should print a centred pyramid of height 3 but the shape is wrong. Find and fix the bug.",
              starterCode: `#include <stdio.h>

int main(void)
{
    int i, j, n = 3;
    for (i = 1; i <= n; i++) {
        for (j = 1; j <= n - i; j++)
            printf(" ");
        for (j = 1; j <= 2 * i; j++)
            printf("*");
        printf("\\n");
    }
    return 0;
}`,
              hint: "Count the stars in each row of a proper pyramid: 1, 3, 5.",
              solution: "The star count must be 2i − 1, not 2i.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int i, j, n = 3;
    for (i = 1; i <= n; i++) {
        for (j = 1; j <= n - i; j++)
            printf(" ");
        for (j = 1; j <= 2 * i - 1; j++)
            printf("*");
        printf("\\n");
    }
    return 0;
}`,
              expectedOutput: `  *
 ***
*****`,
            },
            {
              type: "exercise",
              id: "c11-ex-diamond",
              kind: "write",
              title: "Diamond",
              prompt: "Extend the pyramid to a diamond for n = 3 (the bottom half is the pyramid upside down without repeating the middle row):\n\n```\n  *\n ***\n*****\n ***\n  *\n```",
              hint: "Print the pyramid for i = 1..n, then a second loop for i = n−1 down to 1 with the same formulas.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int i, j, n = 3;
    for (i = 1; i <= n; i++) {
        for (j = 1; j <= n - i; j++) printf(" ");
        for (j = 1; j <= 2 * i - 1; j++) printf("*");
        printf("\\n");
    }
    for (i = n - 1; i >= 1; i--) {
        for (j = 1; j <= n - i; j++) printf(" ");
        for (j = 1; j <= 2 * i - 1; j++) printf("*");
        printf("\\n");
    }
    return 0;
}`,
              expectedOutput: `  *
 ***
*****
 ***
  *`,
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c11-pyramid-formula-mcq",
              prompt: "In a centred star pyramid with n rows, how many stars are in row i (rows numbered from 1)?",
              options: [
                { id: "a", text: "i" },
                { id: "b", text: "2i" },
                { id: "c", text: "2i − 1" },
                { id: "d", text: "n − i" },
              ],
              correct: "c",
              explanation: "Rows have 1, 3, 5, ... stars: 2i − 1. The number of leading spaces is n − i.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c11-inverted-output",
              prompt: "What does this print?",
              code: `#include <stdio.h>

int main(void)
{
    int i, j;
    for (i = 1; i <= 3; i++) {
        for (j = 1; j <= 4 - i; j++)
            printf("#");
        printf("\\n");
    }
    return 0;
}`,
              expected: "###\n##\n#",
              explanation: "Row i prints 4 − i hashes: 3, 2, 1.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c11-newline-tf",
              prompt: "In a pattern program, `printf(\"\\n\")` normally belongs inside the inner loop.",
              correct: false,
              explanation: "The newline ends a row, so it belongs in the outer loop after the inner loop(s).",
            },
            {
              type: "CODE_WRITING",
              slug: "c11-star-pyramid",
              prompt:
                "Read a positive integer n and print a centred pyramid of stars with n rows. Row i has n − i leading spaces followed by 2i − 1 stars, and **no trailing spaces**. For n = 3:\n\n```\n  *\n ***\n*****\n```",
              starterCode: `#include <stdio.h>

int main(void)
{
    int n;
    scanf("%d", &n);
    /* print the pyramid */
    return 0;
}`,
              sampleTests: [
                { stdin: "3", expected: "  *\n ***\n*****" },
                { stdin: "1", expected: "*" },
              ],
              hiddenTests: [
                { stdin: "2", expected: " *\n***" },
                { stdin: "4", expected: "   *\n  ***\n *****\n*******" },
                { stdin: "5", expected: "    *\n   ***\n  *****\n *******\n*********" },
              ],
              solutionCode: `#include <stdio.h>

int main(void)
{
    int n, i, j;
    scanf("%d", &n);
    for (i = 1; i <= n; i++) {
        for (j = 1; j <= n - i; j++)
            printf(" ");
        for (j = 1; j <= 2 * i - 1; j++)
            printf("*");
        printf("\\n");
    }
    return 0;
}`,
              explanation: "One outer loop for rows and two inner loops for the two runs (spaces, then stars).",
            },
          ],
        },
        {
          slug: "number-patterns-floyd",
          title: "Number patterns",
          summary:
            "Print number triangles, repeated-digit triangles, Floyd's triangle and number pyramids by choosing what value each cell prints.",
          estMinutes: 25,
          blocks: [
            {
              type: "objectives",
              items: [
                "Decide whether a cell should print its column number, its row number or a running counter",
                "Print number triangles and Floyd's triangle",
                "Print a palindromic number pyramid with ascending and descending runs",
                "Avoid trailing separators when numbers are printed with spaces",
              ],
            },
            {
              type: "markdown",
              md: `## From stars to numbers

Number patterns use the same loop structure as star patterns. The only new question is **what to print in each cell**. There are three common answers:

| Print... | Pattern for n = 3 |
|---|---|
| the column \`j\` | 1 / 1 2 / 1 2 3 |
| the row \`i\` | 1 / 2 2 / 3 3 3 |
| a counter that never resets | 1 / 2 3 / 4 5 6 (Floyd's triangle) |

So, first get the *shape* right with stars, then replace \`printf("*")\` with the right value.`,
            },
            {
              type: "definition",
              term: "Floyd's triangle",
              md: "A right triangle of consecutive natural numbers: row 1 holds 1, row 2 holds 2 3, row 3 holds 4 5 6, and so on. It needs a counter declared *outside* both loops so it keeps increasing across rows.",
            },
            {
              type: "syntax",
              language: "c",
              code: `for (i = 1; i <= n; i++) {
    for (j = 1; j <= i; j++)
        printf("%d ", VALUE);   /* VALUE: j, i, counter++, ... */
    printf("\\n");
}`,
            },
            {
              type: "code",
              language: "c",
              title: "Column-number and row-number triangles",
              runnable: true,
              code: `#include <stdio.h>

int main(void)
{
    int i, j, n = 4;

    for (i = 1; i <= n; i++) {
        for (j = 1; j <= i; j++)
            printf("%d ", j);
        printf("\\n");
    }

    for (i = 1; i <= n; i++) {
        for (j = 1; j <= i; j++)
            printf("%d ", i);
        printf("\\n");
    }
    return 0;
}`,
              output: "1 \n1 2 \n1 2 3 \n1 2 3 4 \n1 \n2 2 \n3 3 3 \n4 4 4 4 ",
              walkthrough: [
                { lines: "7-11", text: "Same shape as the star triangle, but each cell prints its **column** number j, so every row counts 1, 2, ..." },
                { lines: "13-17", text: "Each cell prints its **row** number i, so row i repeats i, i times." },
                { lines: "9", text: "`\"%d \"` prints a space after every number, including the last (a trailing space that is invisible on screen)." },
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Floyd's triangle and a number pyramid",
              runnable: true,
              code: `#include <stdio.h>

int main(void)
{
    int i, j, n = 4;
    int k = 1;

    for (i = 1; i <= n; i++) {
        for (j = 1; j <= i; j++) {
            printf("%3d", k);
            k++;
        }
        printf("\\n");
    }

    for (i = 1; i <= n; i++) {
        for (j = 1; j <= n - i; j++)
            printf(" ");
        for (j = 1; j <= i; j++)
            printf("%d", j);
        for (j = i - 1; j >= 1; j--)
            printf("%d", j);
        printf("\\n");
    }
    return 0;
}`,
              output: `  1
  2  3
  4  5  6
  7  8  9 10
   1
  121
 12321
1234321`,
              walkthrough: [
                { lines: "6", text: "Floyd's counter starts at 1 and is declared outside both loops, so it is **never reset**." },
                { lines: "10-11", text: "Print the counter in a 3-wide field (so 10 lines up) and advance it." },
                { lines: "16-18", text: "Number pyramid: n − i leading spaces, as for the star pyramid." },
                { lines: "19-20", text: "Ascending run 1..i." },
                { lines: "21-22", text: "Descending run i−1..1, using a loop that counts down. Together the two runs make the palindrome 12321." },
              ],
            },
            {
              type: "callout",
              variant: "tip",
              title: "Numbers without a trailing space",
              md: "Automatic graders often compare output exactly. To separate numbers by single spaces with nothing after the last one, print the separator *before* every number except the first: `if (j > 1) printf(\" \"); printf(\"%d\", j);`.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `Inside the inner loop you have access to three useful quantities: the row \`i\`, the column \`j\`, and any variable you keep outside the loops. Every number pattern is some expression of these. Variables declared outside both loops keep their values across rows (Floyd's counter); expressions of \`i\` and \`j\` restart with every row.`,
            },
            {
              type: "heading",
              text: "Real-world uses",
              level: 2,
            },
            {
              type: "markdown",
              md: `- **Numbering items in a grid:** seat numbers in a cinema (row × seatsPerRow + seat), cell IDs in a spreadsheet.
- **Formatted reports:** using \`%3d\`-style widths to align columns of numbers.
- **Combinatorics:** Pascal's triangle (binomial coefficients) is a famous number pattern built with the same loops.`,
            },
            {
              type: "table",
              caption: "Pattern cheat sheet (rows i = 1..n)",
              headers: ["Pattern", "Inner loop(s)", "Cell value"],
              rows: [
                ["Right triangle", "j = 1..i", "* or j or i"],
                ["Inverted triangle", "j = 1..n-i+1", "* or j"],
                ["Right-aligned triangle", "n-i spaces, then j = 1..i", "*"],
                ["Centred pyramid", "n-i spaces, then 2i-1 cells", "*"],
                ["Number pyramid", "n-i spaces, 1..i, then i-1..1", "j"],
                ["Floyd's triangle", "j = 1..i", "k++ (k outside loops)"],
              ],
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Resetting Floyd's counter each row",
                  wrong: `for (i = 1; i <= n; i++) {
    int k = 1;               /* restarts every row */
    for (j = 1; j <= i; j++) printf("%d ", k++);
    printf("\\n");
}`,
                  right: `int k = 1;                   /* outside both loops */
for (i = 1; i <= n; i++) {
    for (j = 1; j <= i; j++) printf("%d ", k++);
    printf("\\n");
}`,
                  md: "Where you initialise a variable decides when it restarts.",
                },
                {
                  title: "Printing i when you meant j",
                  wrong: `for (j = 1; j <= i; j++) printf("%d", i);   /* 1, 22, 333 */`,
                  right: `for (j = 1; j <= i; j++) printf("%d", j);   /* 1, 12, 123 */`,
                  md: "Decide whether the value changes along a row (use j) or only down the rows (use i).",
                },
                {
                  title: "Misaligned columns",
                  wrong: `printf("%d ", k);   /* 9 and 10 have different widths */`,
                  right: `printf("%3d", k);   /* fixed width 3 */`,
                  md: "Use a field width so one- and two-digit numbers line up.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "Print j for 1 / 1 2 / 1 2 3; print i for 1 / 2 2 / 3 3 3.",
                "Floyd's triangle needs a counter initialised outside both loops.",
                "Number pyramid row i: n − i spaces, 1..i ascending, then i−1..1 descending.",
                "%3d right-aligns numbers in a 3-character field.",
              ],
            },
            {
              type: "recap",
              items: [
                "Get the shape with stars first, then choose the value per cell.",
                "Row, column and running counters cover most number patterns.",
                "Mind trailing spaces when output is checked exactly.",
              ],
            },
            {
              type: "exercise",
              id: "c11-ex-predict-numbers",
              kind: "predict",
              title: "Predict the number pattern",
              prompt: "Predict the output.\n\n```c\n#include <stdio.h>\n\nint main(void)\n{\n    int i, j;\n    for (i = 4; i >= 1; i--) {\n        for (j = 1; j <= i; j++)\n            printf(\"%d\", j);\n        printf(\"\\n\");\n    }\n    return 0;\n}\n```",
              hint: "The outer loop counts down; each row prints 1..i.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int i, j;
    for (i = 4; i >= 1; i--) {
        for (j = 1; j <= i; j++)
            printf("%d", j);
        printf("\\n");
    }
    return 0;
}`,
              expectedOutput: `1234
123
12
1`,
            },
            {
              type: "exercise",
              id: "c11-ex-binary-triangle",
              kind: "write",
              title: "0-1 triangle",
              prompt: "Print this triangle for n = 4, where each cell prints `(i + j) % 2`:\n\n```\n0\n10\n010\n1010\n```",
              hint: "Use the right-triangle loops and print (i + j) % 2 in each cell.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int i, j, n = 4;
    for (i = 1; i <= n; i++) {
        for (j = 1; j <= i; j++)
            printf("%d", (i + j) % 2);
        printf("\\n");
    }
    return 0;
}`,
              expectedOutput: `0
10
010
1010`,
            },
            {
              type: "exercise",
              id: "c11-ex-concept-cell-value",
              kind: "concept",
              title: "Which value goes in the cell?",
              prompt: "For each pattern (n = 3), state what the inner loop should print, using i (row), j (column) or a counter k declared outside the loops:\n\n1. `3 / 3 2 / 3 2 1`\n2. `1 / 3 5 / 7 9 11`\n3. `3 3 3 / 2 2 / 1`",
              solution: "1. `n - j + 1` (columns count down from n) in a right triangle with j <= i.\n2. A counter of odd numbers: print k, then k += 2, with k = 1 declared outside both loops.\n3. An inverted triangle where row i (counting i from n down to 1) prints i, i times; or counting rows up, print `n - i + 1` with j <= n - i + 1.",
            },
          ],
          practice: [
            {
              type: "OUTPUT_PREDICTION",
              slug: "c11-floyd-output",
              prompt: "What does this print?",
              code: `#include <stdio.h>

int main(void)
{
    int i, j, k = 1;
    for (i = 1; i <= 3; i++) {
        for (j = 1; j <= i; j++) {
            if (j > 1) printf(" ");
            printf("%d", k++);
        }
        printf("\\n");
    }
    return 0;
}`,
              expected: "1\n2 3\n4 5 6",
              explanation: "k is never reset, so numbers continue across rows: Floyd's triangle.",
            },
            {
              type: "MCQ",
              slug: "c11-row-value-mcq",
              prompt: "Inside `for (i = 1; i <= n; i++) for (j = 1; j <= i; j++) printf(\"%d\", X);`, which X produces the pattern 1 / 22 / 333?",
              options: [
                { id: "a", text: "j" },
                { id: "b", text: "i" },
                { id: "c", text: "i + j" },
                { id: "d", text: "n - i" },
              ],
              correct: "b",
              explanation: "Each row repeats its own row number.",
            },
            {
              type: "FILL_BLANK",
              slug: "c11-floyd-last-fill",
              prompt: "The last number in row 5 of Floyd's triangle is ___ .",
              accepted: [["15"]],
              explanation: "Row r ends with 1 + 2 + ... + r = r(r+1)/2 = 15.",
            },
            {
              type: "CODE_WRITING",
              slug: "c11-number-triangle",
              prompt:
                "Read a positive integer n and print a triangle where row i contains the numbers 1 to i separated by single spaces, with **no trailing space**. For n = 3:\n\n```\n1\n1 2\n1 2 3\n```",
              starterCode: `#include <stdio.h>

int main(void)
{
    int n;
    scanf("%d", &n);
    /* print the triangle */
    return 0;
}`,
              sampleTests: [
                { stdin: "3", expected: "1\n1 2\n1 2 3" },
                { stdin: "1", expected: "1" },
              ],
              hiddenTests: [
                { stdin: "5", expected: "1\n1 2\n1 2 3\n1 2 3 4\n1 2 3 4 5" },
                { stdin: "2", expected: "1\n1 2" },
              ],
              solutionCode: `#include <stdio.h>

int main(void)
{
    int n, i, j;
    scanf("%d", &n);
    for (i = 1; i <= n; i++) {
        for (j = 1; j <= i; j++) {
            if (j > 1)
                printf(" ");
            printf("%d", j);
        }
        printf("\\n");
    }
    return 0;
}`,
              explanation: "Printing the separator before every number except the first avoids a trailing space.",
            },
          ],
        },
      ],
    },
  ],
};

export default chapter;
