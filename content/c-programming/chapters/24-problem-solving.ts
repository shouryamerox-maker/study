import type { ChapterContent } from "../../../src/lib/content/schema";

const chapter: ChapterContent = {
  slug: "problem-solving",
  title: "Problem Solving and Mini-Projects",
  summary:
    "A repeatable four-step method for turning a problem statement into a tested C program, applied to four complete mini-projects that combine everything in the course.",
  topics: [
    {
      slug: "problem-solving-method",
      title: "A method for solving problems",
      lessons: [
        {
          slug: "problem-solving-understand-plan-code-test",
          title: "Understand, plan, code, test",
          summary:
            "How experienced programmers approach a new problem: clarify it with examples, design an algorithm in pseudocode, build it incrementally, and test it with normal and edge cases.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Apply the four-step method: understand, plan, code, test",
                "Turn a problem statement into inputs, outputs and worked examples",
                "Write pseudocode and break a problem into functions",
                "Design test cases that include edge cases and invalid input",
              ],
            },
            {
              type: "markdown",
              md: `You now know most of the C language. The hard part of programming, though, is rarely the syntax; it is deciding **what** to write. Faced with a blank editor, many beginners start typing \`#include <stdio.h>\` and hope the rest will come. It usually doesn't.

Experienced programmers follow a method, popularised by the mathematician George Pólya for solving maths problems. Think of it like building furniture: you read the instructions and check the parts (understand), lay out the steps (plan), assemble one piece at a time (code), and wobble-test it before putting books on it (test).

1. **Understand** the problem: What are the inputs? What output is wanted? Work small examples by hand.
2. **Plan** a solution: Write the steps in plain language or pseudocode. Split the work into functions.
3. **Code** it incrementally: Write one function, compile, test, then add the next.
4. **Test** it: Normal cases, boundary cases, and invalid input. Compare with your hand-worked examples.

The rest of this chapter applies the method to four mini-projects. First, a small problem to see each step clearly.`,
            },
            {
              type: "definition",
              term: "Algorithm",
              md: "A finite, precise sequence of steps that solves a problem. An algorithm is independent of any programming language; the C program is one way of expressing it.",
            },
            {
              type: "definition",
              term: "Pseudocode",
              md: "An informal, language-neutral description of an algorithm using structured English (IF, WHILE, FOR EACH...). It lets you think about logic without worrying about semicolons and types.",
            },
            {
              type: "definition",
              term: "Edge case",
              md: "An input at the extreme or unusual end of what is allowed: zero, one element, the largest value, an empty input, equal values, negative numbers. Bugs cluster at edge cases.",
            },
            {
              type: "definition",
              term: "Incremental development",
              md: "Building a program in small steps, compiling and testing after each one, so that when something breaks you know it was the last small change.",
            },
            {
              type: "workedExample",
              title: "Step 1, Understand: primes in a range",
              problem: "Problem statement: *Read two integers and print all the prime numbers between them (inclusive), followed by how many there are.*",
              steps: [
                "**Inputs**: two integers a and b. Questions to ask: can a be larger than b? Can they be negative? (Decision: if a > b, swap them; numbers below 2 are never prime.)",
                "**Output**: a line listing the primes, then a count line. Exact format: `Primes between 10 and 30: 11 13 17 19 23 29` and `Count: 6`.",
                "**Key concept**: a prime is an integer greater than 1 whose only divisors are 1 and itself.",
                "**Hand example**: from 10 to 30: check each number; 11, 13, 17, 19, 23, 29 survive, so the count is 6.",
                "**Edge examples**: (30, 10) should give the same result; (0, 1) gives no primes and Count: 0; (2, 2) gives just 2.",
              ],
              answer: "We now know precisely what to build and have expected outputs for several inputs, before writing any code.",
            },
            {
              type: "syntax",
              language: "text",
              code: `Step 2, Plan (pseudocode)

FUNCTION isPrime(n)
    IF n < 2 RETURN false
    FOR d FROM 2 WHILE d * d <= n
        IF n MOD d = 0 RETURN false
    RETURN true

MAIN
    READ a, b            (stop with a message if reading fails)
    IF a > b SWAP a, b
    PRINT heading
    count <- 0
    FOR n FROM a TO b
        IF isPrime(n) PRINT n, count <- count + 1
    PRINT count`,
              md: "Notice the plan already separates the reusable piece (isPrime) from the input/output logic (main).",
            },
            {
              type: "markdown",
              md: `**Step 3, Code incrementally.** Write \`isPrime\` first and test it **on its own** before writing \`main\`. A tiny test harness compares the function's answers with values we worked out by hand.`,
            },
            {
              type: "code",
              language: "c",
              title: "Testing one function before building on it",
              runnable: true,
              code: `#include <stdio.h>

int isPrime(int n) {
    int d;
    if (n < 2) return 0;
    for (d = 2; d * d <= n; d++) {
        if (n % d == 0) return 0;
    }
    return 1;
}

int main(void) {
    int inputs[]   = {0, 1, 2, 3, 4, 9, 13, 25, 97};
    int expected[] = {0, 0, 1, 1, 0, 0, 1,  0,  1};
    int i, failures = 0;
    for (i = 0; i < 9; i++) {
        int got = isPrime(inputs[i]);
        if (got != expected[i]) {
            printf("FAIL: isPrime(%d) = %d, expected %d\\n", inputs[i], got, expected[i]);
            failures++;
        }
    }
    printf("%d tests, %d failures\\n", 9, failures);
    return 0;
}`,
              output: "9 tests, 0 failures",
              walkthrough: [
                { lines: "5", text: "Edge cases first: 0, 1 and negative numbers are not prime." },
                { lines: "6", text: "Only divisors up to √n need checking: if n = d × e with d ≤ e, then d × d ≤ n. Writing `d * d <= n` avoids calling `sqrt`." },
                { lines: "13-14", text: "Test inputs chosen deliberately: below 2, the smallest prime, a square of a prime (9, 25, which catch an off-by-one in `<=`), and a larger prime." },
                { lines: "17-21", text: "Print only failures, with enough detail to fix them. Silence means success." },
              ],
            },
            {
              type: "code",
              language: "c",
              title: "The complete program",
              runnable: true,
              stdin: "30 10\n",
              code: `#include <stdio.h>

int isPrime(int n) {
    int d;
    if (n < 2) return 0;
    for (d = 2; d * d <= n; d++) {
        if (n % d == 0) return 0;
    }
    return 1;
}

int main(void) {
    int a, b, n, count = 0;
    if (scanf("%d %d", &a, &b) != 2) {
        printf("Please enter two integers.\\n");
        return 1;
    }
    if (a > b) {
        int t = a;
        a = b;
        b = t;
    }
    printf("Primes between %d and %d:", a, b);
    for (n = a; n <= b; n++) {
        if (isPrime(n)) {
            printf(" %d", n);
            count++;
        }
    }
    printf("\\nCount: %d\\n", count);
    return 0;
}`,
              output: `Primes between 10 and 30: 11 13 17 19 23 29
Count: 6`,
              walkthrough: [
                { lines: "3-10", text: "The already-tested function is reused unchanged." },
                { lines: "14-17", text: "Invalid input is handled instead of computing with garbage." },
                { lines: "18-22", text: "The decision from the Understand step: swap if the range is reversed. This run used input `30 10`." },
                { lines: "23-29", text: "Each number is printed with a leading space, so the line has no trailing space." },
              ],
            },
            {
              type: "heading",
              text: "Step 4, Test: design the test cases",
              level: 2,
            },
            {
              type: "table",
              caption: "Test plan for the primes program",
              headers: ["Input", "Why", "Expected output"],
              rows: [
                ["10 30", "Normal case", "11 13 17 19 23 29 / Count: 6"],
                ["30 10", "Reversed range", "Same as above"],
                ["2 2", "Smallest prime, range of one", "2 / Count: 1"],
                ["-5 1", "No primes; negatives", "(nothing) / Count: 0"],
                ["x", "Invalid input", "Please enter two integers."],
              ],
            },
            { type: "heading", text: "Why it works", level: 2 },
            {
              type: "markdown",
              md: `The method works because it attacks the two main sources of bugs separately. **Misunderstanding** the problem is fixed before any code exists, by writing examples with exact expected outputs. **Logic errors** are caught early because every piece is tested as soon as it is written, while it is small. When the final program misbehaves, you already trust the parts, so the bug must be in how they are connected.

Splitting work into functions is what makes incremental testing possible: \`isPrime\` can be tested with a dozen values in milliseconds, which is much harder if the logic is buried inside the input loop.`,
            },
            { type: "heading", text: "Real-world uses", level: 2 },
            {
              type: "markdown",
              md: `- **Programming exams and contests** reward exactly this: read carefully, test against the sample, then think about edge cases.
- **Professional development** formalises the steps as requirements, design documents, code review and automated **unit tests** (just like our harness, but run automatically on every change).
- **Test-driven development** writes the test table *before* the function.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Coding before understanding",
                  md: "Starting to type immediately often produces a program that solves a slightly different problem (wrong output format, inclusive vs exclusive range). Write at least one exact input/output example first.",
                },
                {
                  title: "Writing everything, then compiling once",
                  wrong: `/* 200 lines written, first compile: 37 errors */`,
                  right: `/* write isPrime, compile, test; then write main, compile, test */`,
                  md: "Compile and run after every small step. Errors are then few and obviously located.",
                },
                {
                  title: "Testing only the 'happy path'",
                  md: "A program that works for 10 to 30 may fail for 2 to 2, for 0 or for reversed input. Always test boundaries, empty or single-element input, and invalid data.",
                },
                {
                  title: "Off-by-one in loop bounds",
                  wrong: `for (d = 2; d * d < n; d++)   /* says 9 and 25 are prime */`,
                  right: `for (d = 2; d * d <= n; d++)`,
                  md: "Check boundaries with a value that sits exactly on them, here perfect squares.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "The four steps: understand the problem, plan (algorithm/pseudocode), code incrementally, test.",
                "Identify inputs, outputs, constraints and hand-worked examples before coding.",
                "Pseudocode describes logic independent of a programming language.",
                "Good tests cover normal cases, edge cases (0, 1, maximum, empty, equal values) and invalid input.",
                "Breaking a program into functions makes each part testable on its own.",
              ],
            },
            {
              type: "recap",
              items: [
                "Understand: inputs, outputs, examples, edge cases.",
                "Plan: pseudocode and functions.",
                "Code: one small piece at a time, compiling often.",
                "Test: against hand-worked expectations, including the awkward inputs.",
              ],
            },
            {
              type: "exercise",
              id: "c24-ex-leap-tests",
              kind: "concept",
              title: "Design tests for isLeapYear",
              prompt: "A year is a leap year if it is divisible by 4, except years divisible by 100, which are leap years only if also divisible by 400. List at least five test inputs for `int isLeapYear(int year)` with the expected result and the reason each one is useful.",
              hint: "Each rule in the definition deserves a test, plus a plain non-leap year.",
              solution: "2023 → 0 (not divisible by 4); 2024 → 1 (divisible by 4 only); 1900 → 0 (divisible by 100 but not 400); 2000 → 1 (divisible by 400); 2100 → 0 (another century rule check); 4 → 1 (small value). Each test targets one branch of the rule.",
            },
            {
              type: "exercise",
              id: "c24-ex-leap-write",
              kind: "write",
              title: "Implement and test isLeapYear",
              prompt: "Write `isLeapYear` and a test harness like the isPrime one that checks the years 2023, 2024, 1900, 2000 and 2100 and prints `5 tests, 0 failures` when everything passes.",
              hint: "return (y % 4 == 0 && y % 100 != 0) || y % 400 == 0;",
              solution: "Combine the rules into one Boolean expression, then compare against a table of expected answers.",
              solutionCode: `#include <stdio.h>

int isLeapYear(int y) {
    return (y % 4 == 0 && y % 100 != 0) || y % 400 == 0;
}

int main(void) {
    int years[]    = {2023, 2024, 1900, 2000, 2100};
    int expected[] = {0,    1,    0,    1,    0};
    int i, failures = 0;
    for (i = 0; i < 5; i++) {
        if (isLeapYear(years[i]) != expected[i]) {
            printf("FAIL: %d\\n", years[i]);
            failures++;
        }
    }
    printf("%d tests, %d failures\\n", 5, failures);
    return 0;
}`,
              expectedOutput: "5 tests, 0 failures",
            },
            {
              type: "exercise",
              id: "c24-ex-range-debug",
              kind: "debug",
              title: "The missing last number",
              prompt: "This program should print the multiples of 7 from 7 to 35 inclusive, but 35 is missing. Which test case would have caught it, and what is the fix?",
              starterCode: `#include <stdio.h>

int main(void) {
    int n;
    for (n = 7; n < 35; n += 7) {
        printf("%d ", n);
    }
    printf("\\n");
    return 0;
}`,
              hint: "Test the boundary: is the upper limit included?",
              solution: "A test whose expected output includes the upper bound (35) catches it. The condition must be `n <= 35`.",
              solutionCode: `#include <stdio.h>

int main(void) {
    int n;
    for (n = 7; n <= 35; n += 7) {
        printf("%d ", n);
    }
    printf("\\n");
    return 0;
}`,
              expectedOutput: "7 14 21 28 35",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c24-method-mcq-1",
              prompt: "According to the four-step method, what should you do **first** when given a new programming problem?",
              options: [
                { id: "a", text: "Write the main function" },
                { id: "b", text: "Identify inputs, outputs and work through examples by hand" },
                { id: "c", text: "Choose variable names" },
                { id: "d", text: "Run the compiler with -Wall" },
              ],
              correct: "b",
              explanation: "Understanding the problem, with concrete examples, comes before planning and coding.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c24-method-tf-1",
              prompt: "If a program gives the correct output for the sample input in the problem statement, it is fully tested.",
              correct: false,
              explanation: "Samples usually show only normal cases. Edge cases and invalid input need their own tests.",
            },
            {
              type: "FILL_BLANK",
              slug: "c24-edge-fill-1",
              prompt: "An unusual input at the boundary of what is allowed, such as an empty list or the value 0, is called an ___ case.",
              accepted: [["edge", "boundary", "corner"]],
              explanation: "Edge (boundary) cases are where off-by-one and special-case bugs hide.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c24-trace-output-1",
              prompt: "Trace this program by hand. What does it print?",
              code: `#include <stdio.h>

int main(void) {
    int n = 12, steps = 0;
    while (n != 1) {
        if (n % 2 == 0) n = n / 2;
        else n = 3 * n + 1;
        steps++;
    }
    printf("%d\\n", steps);
    return 0;
}`,
              expected: "9",
              explanation: "12 → 6 → 3 → 10 → 5 → 16 → 8 → 4 → 2 → 1: nine steps.",
            },
            {
              type: "CODE_WRITING",
              slug: "c24-second-largest-code",
              prompt: "Read an integer `n` (n ≥ 1) followed by `n` integers. Print the **second largest distinct** value. If there is no such value (all values equal, or only one value), print `none`. Plan the edge cases before coding!",
              starterCode: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    /* your code */
    return 0;
}`,
              sampleTests: [
                { stdin: "5\n4 9 2 9 7\n", expected: "7" },
                { stdin: "3\n5 5 5\n", expected: "none" },
              ],
              hiddenTests: [
                { stdin: "1\n42\n", expected: "none" },
                { stdin: "4\n-1 -5 -3 -2\n", expected: "-2" },
                { stdin: "6\n10 20 30 40 50 60\n", expected: "50" },
              ],
              solutionCode: `#include <stdio.h>

int main(void) {
    int n, i, x, largest = 0, second = 0, haveSecond = 0;
    if (scanf("%d", &n) != 1 || n < 1) return 0;
    scanf("%d", &largest);
    for (i = 1; i < n; i++) {
        scanf("%d", &x);
        if (x > largest) {
            second = largest;
            haveSecond = 1;
            largest = x;
        } else if (x < largest && (!haveSecond || x > second)) {
            second = x;
            haveSecond = 1;
        }
    }
    if (haveSecond) printf("%d\\n", second);
    else printf("none\\n");
    return 0;
}`,
              explanation: "Track the largest and the best value strictly below it. Starting from the first input (not 0) handles negative numbers; the haveSecond flag handles the 'none' cases.",
            },
          ],
        },
      ],
    },
    {
      slug: "mini-projects",
      title: "Mini-projects",
      lessons: [
        {
          slug: "project-student-marks-report",
          title: "Project: student marks report",
          summary:
            "Read student names and marks, compute totals, averages and grades with structs and functions, and print a formatted class report.",
          estMinutes: 45,
          blocks: [
            {
              type: "objectives",
              items: [
                "Turn a written specification into a struct-based design",
                "Divide the program into small functions with clear responsibilities",
                "Process an array of structs read from standard input",
                "Produce neatly aligned tabular output with printf field widths",
              ],
            },
            {
              type: "heading",
              text: "Requirements",
              level: 2,
            },
            {
              type: "markdown",
              md: `A teacher wants a quick report for a class.

- **Input**: the number of students *n* (1 to 50), then one line per student: a name (one word, at most 29 characters) and three integer marks out of 100.
- **Output**: a table with each student's name, three marks, total, average (2 decimals) and grade; then the class average (over all marks) and the top student by total (the first one, if tied).
- **Grade scale** (by average): A ≥ 80, B ≥ 70, C ≥ 60, D ≥ 50, otherwise F.
- **Errors**: if *n* is out of range or a line cannot be read, print a message and stop.

Think of this like a spreadsheet: each row is a student record, each column a field, and some columns are calculated from others.`,
            },
            {
              type: "definition",
              term: "Specification",
              md: "A precise description of what a program must do: its inputs, outputs, rules and error handling. It is the contract you test against.",
            },
            {
              type: "definition",
              term: "Record",
              md: "A group of related fields describing one entity, such as one student. In C a record is a `struct`; a table of records is an array of structs.",
            },
            {
              type: "heading",
              text: "Design",
              level: 2,
            },
            {
              type: "table",
              caption: "Functions and their responsibilities",
              headers: ["Function", "Job", "Concepts used"],
              rows: [
                ["gradeFor(avg)", "Map an average to a letter", "if-else chain, return values"],
                ["readStudent(&s)", "Read one name and three marks; report failure", "pointers to structs, scanf return value"],
                ["computeResult(&s)", "Fill in total, average, grade", "loops, -> operator, casting"],
                ["printReport(list, n)", "Print the table", "printf widths, array of structs"],
                ["findTop(list, n)", "Index of the highest total", "linear search for a maximum"],
                ["main", "Validate n, drive the steps, print the summary", "arrays, error handling"],
              ],
            },
            {
              type: "syntax",
              language: "c",
              code: `#define MAX_STUDENTS 50
#define SUBJECTS 3

struct Student {
    char name[30];
    int marks[SUBJECTS];
    int total;        /* calculated */
    double average;   /* calculated */
    char grade;       /* calculated */
};

char gradeFor(double avg);
int  readStudent(struct Student *s);
void computeResult(struct Student *s);
void printReport(const struct Student list[], int n);
int  findTop(const struct Student list[], int n);`,
              md: "Writing the struct and the prototypes first is the 'plan' step in code form. Each prototype is a promise to implement and test.",
            },
            {
              type: "markdown",
              md: `Following the incremental approach, we first build and test the calculation functions with hard-coded data, before any input handling exists.`,
            },
            {
              type: "code",
              language: "c",
              title: "Stage 1: test the calculations",
              runnable: true,
              code: `#include <stdio.h>
#include <string.h>

#define SUBJECTS 3

struct Student {
    char name[30];
    int marks[SUBJECTS];
    int total;
    double average;
    char grade;
};

char gradeFor(double avg) {
    if (avg >= 80) return 'A';
    if (avg >= 70) return 'B';
    if (avg >= 60) return 'C';
    if (avg >= 50) return 'D';
    return 'F';
}

void computeResult(struct Student *s) {
    int j;
    s->total = 0;
    for (j = 0; j < SUBJECTS; j++) {
        s->total += s->marks[j];
    }
    s->average = (double)s->total / SUBJECTS;
    s->grade = gradeFor(s->average);
}

int main(void) {
    struct Student s = {"Test", {80, 79, 80}, 0, 0.0, '?'};
    computeResult(&s);
    printf("%s total=%d avg=%.2f grade=%c\\n", s.name, s.total, s.average, s.grade);
    printf("boundaries: %c %c %c %c %c\\n",
           gradeFor(80), gradeFor(79.99), gradeFor(60), gradeFor(50), gradeFor(49.5));
    return 0;
}`,
              output: `Test total=239 avg=79.67 grade=B
boundaries: A B C D F`,
              walkthrough: [
                { lines: "14-20", text: "Because each `if` returns, the checks can be written from highest to lowest without `else`." },
                { lines: "22-30", text: "`s->total` is shorthand for `(*s).total`. Passing a pointer lets the function fill in the caller's struct." },
                { lines: "28", text: "Cast before dividing so the average keeps its decimals (239 / 3 = 79.67, not 79)." },
                { lines: "37-38", text: "Test values exactly on and just below each boundary: the most likely place for a `>` vs `>=` mistake." },
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Stage 2: the complete report program",
              runnable: true,
              stdin: "4\nAsha 78 85 92\nBrian 55 61 48\nChen 90 94 88\nDina 67 72 70\n",
              code: `#include <stdio.h>

#define MAX_STUDENTS 50
#define SUBJECTS 3

struct Student {
    char name[30];
    int marks[SUBJECTS];
    int total;
    double average;
    char grade;
};

char gradeFor(double avg) {
    if (avg >= 80) return 'A';
    if (avg >= 70) return 'B';
    if (avg >= 60) return 'C';
    if (avg >= 50) return 'D';
    return 'F';
}

int readStudent(struct Student *s) {
    int j;
    if (scanf("%29s", s->name) != 1) return 0;
    for (j = 0; j < SUBJECTS; j++) {
        if (scanf("%d", &s->marks[j]) != 1) return 0;
    }
    return 1;
}

void computeResult(struct Student *s) {
    int j;
    s->total = 0;
    for (j = 0; j < SUBJECTS; j++) {
        s->total += s->marks[j];
    }
    s->average = (double)s->total / SUBJECTS;
    s->grade = gradeFor(s->average);
}

void printReport(const struct Student list[], int n) {
    int i, j;
    printf("%-10s %4s %4s %4s %6s %7s  %s\\n", "Name", "M1", "M2", "M3", "Total", "Avg", "Grade");
    for (i = 0; i < n; i++) {
        printf("%-10s", list[i].name);
        for (j = 0; j < SUBJECTS; j++) {
            printf(" %4d", list[i].marks[j]);
        }
        printf(" %6d %7.2f  %c\\n", list[i].total, list[i].average, list[i].grade);
    }
}

int findTop(const struct Student list[], int n) {
    int i, best = 0;
    for (i = 1; i < n; i++) {
        if (list[i].total > list[best].total) best = i;
    }
    return best;
}

int main(void) {
    struct Student list[MAX_STUDENTS];
    int n, i, top, classTotal = 0;
    if (scanf("%d", &n) != 1 || n < 1 || n > MAX_STUDENTS) {
        printf("Invalid number of students\\n");
        return 1;
    }
    for (i = 0; i < n; i++) {
        if (!readStudent(&list[i])) {
            printf("Invalid data for student %d\\n", i + 1);
            return 1;
        }
        computeResult(&list[i]);
        classTotal += list[i].total;
    }
    printReport(list, n);
    top = findTop(list, n);
    printf("Class average: %.2f\\n", (double)classTotal / (n * SUBJECTS));
    printf("Top student: %s (%d)\\n", list[top].name, list[top].total);
    return 0;
}`,
              output: `Name         M1   M2   M3  Total     Avg  Grade
Asha         78   85   92    255   85.00  A
Brian        55   61   48    164   54.67  D
Chen         90   94   88    272   90.67  A
Dina         67   72   70    209   69.67  C
Class average: 75.00
Top student: Chen (272)`,
              walkthrough: [
                { lines: "22-29", text: "`readStudent` returns 0 if anything fails, so `main` can report which student's line was bad. `%29s` protects the 30-byte name array." },
                { lines: "41-51", text: "Field widths line the columns up: `%-10s` left-aligns names in 10 columns, `%4d` and `%7.2f` right-align numbers. The header uses the same widths with `%s`." },
                { lines: "53-59", text: "Strict `>` keeps the **first** student when totals tie, as the specification requires." },
                { lines: "64-67", text: "Validate n before using it as a loop bound: n > 50 would overflow the array." },
                { lines: "78", text: "Class average over all marks: 900 / 12 = 75.00." },
              ],
            },
            {
              type: "heading",
              text: "Testing the project",
              level: 2,
            },
            {
              type: "table",
              headers: ["Test", "Input idea", "Checks"],
              rows: [
                ["Normal", "The sample above", "Table values, grades, average, top"],
                ["Boundaries", "A student averaging exactly 80, 70, 60, 50", "Grades A, B, C, D, not one lower"],
                ["Single student", "n = 1", "Top student is that student"],
                ["Tie", "Two students with the same highest total", "The first one is reported"],
                ["Bad n", "0 or 51", "Invalid number of students"],
                ["Bad data", "A mark written as 'ninety'", "Invalid data for student k"],
              ],
            },
            { type: "heading", text: "Why it works", level: 2 },
            {
              type: "markdown",
              md: `Each function does one job and communicates through parameters and return values, never through global variables. That means each piece can be tested alone (as in Stage 1), and the main function reads almost like the specification: read and compute each student, print the report, find the top, print the summary. The struct keeps all of a student's data together, so passing one pointer gives a function everything it needs, and the array of structs is a natural "table" for the report.`,
            },
            { type: "heading", text: "Real-world uses", level: 2 },
            {
              type: "markdown",
              md: `Almost every business program is a variation of this: read records, compute derived fields, summarise, report. Payroll (hours → pay), inventory (stock → reorder flags) and sales reports (orders → totals by region) all follow the same read → compute → report structure.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Integer division for the average",
                  wrong: `s->average = s->total / SUBJECTS;   /* 239 / 3 = 79 */`,
                  right: `s->average = (double)s->total / SUBJECTS;`,
                  md: "Both operands are ints, so the fraction is discarded before assignment. The report would show 79.00 instead of 79.67, and with non-whole grade thresholds (say, A at 79.5 or above) the grade itself would come out wrong too.",
                },
                {
                  title: "Grade checks in the wrong order",
                  wrong: `if (avg >= 50) return 'D';
if (avg >= 80) return 'A';   /* never reached for 85 */`,
                  right: `if (avg >= 80) return 'A';
if (avg >= 50) return 'D';`,
                  md: "With early returns, test the highest threshold first.",
                },
                {
                  title: "Passing the struct by value to a function that should fill it",
                  wrong: `void computeResult(struct Student s) { s.total = ...; }  /* changes a copy */`,
                  right: `void computeResult(struct Student *s) { s->total = ...; }`,
                  md: "Structs are passed by value. Use a pointer when the function must update the caller's record.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "Design data first (the struct), then functions with single responsibilities.",
                "Pass a pointer to a struct to let a function modify it; use -> to access members.",
                "Mark read-only array parameters const (const struct Student list[]).",
                "Use printf field widths (%-10s, %6d, %7.2f) for aligned tables.",
                "Validate counts before using them as array bounds.",
              ],
            },
            {
              type: "recap",
              items: [
                "Specification → struct + prototypes → test calculations → add I/O.",
                "Calculated fields are filled in by a dedicated function.",
                "The report is just a loop over an array of structs.",
                "Edge tests: grade boundaries, ties, n = 1, bad input.",
              ],
            },
            {
              type: "exercise",
              id: "c24-ex-marks-subject-max",
              kind: "write",
              title: "Extension: best mark per subject",
              prompt: "Extend the report with a line `Best per subject: X Y Z` showing the highest mark in each of the three subjects. Write a function `void subjectMax(const struct Student list[], int n, int best[])` and test it on the sample data (expected: `Best per subject: 90 94 92`).",
              hint: "Initialise best[j] from list[0], then loop over the rest.",
              solution: "Loop over subjects, and for each subject over students, keeping the maximum.",
              solutionCode: `#include <stdio.h>

#define SUBJECTS 3

struct Student {
    char name[30];
    int marks[SUBJECTS];
};

void subjectMax(const struct Student list[], int n, int best[]) {
    int i, j;
    for (j = 0; j < SUBJECTS; j++) {
        best[j] = list[0].marks[j];
        for (i = 1; i < n; i++) {
            if (list[i].marks[j] > best[j]) best[j] = list[i].marks[j];
        }
    }
}

int main(void) {
    struct Student list[4] = {
        {"Asha", {78, 85, 92}}, {"Brian", {55, 61, 48}},
        {"Chen", {90, 94, 88}}, {"Dina", {67, 72, 70}}
    };
    int best[SUBJECTS];
    subjectMax(list, 4, best);
    printf("Best per subject: %d %d %d\\n", best[0], best[1], best[2]);
    return 0;
}`,
              expectedOutput: "Best per subject: 90 94 92",
            },
            {
              type: "exercise",
              id: "c24-ex-marks-extensions",
              kind: "concept",
              title: "More extension ideas",
              prompt: "Choose two of these extensions and describe which functions and struct fields you would add or change:\n\n1. Sort the report by total, highest first.\n2. Support a variable number of subjects read from the input.\n3. Save the report to a file `report.txt` as well as printing it.\n4. Reject marks outside 0–100.",
              hint: "Think about qsort, dynamic memory, FILE * parameters and validation in readStudent.",
              solution: "1. Add a comparison function on total and call qsort(list, n, sizeof list[0], byTotalDesc) before printReport. 2. Read the subject count first and allocate marks with malloc (struct holds int *marks), freeing at the end. 3. Change printReport to take a FILE *out and use fprintf; call it with stdout and with a file opened in \"w\" mode. 4. In readStudent, return 0 if a mark is < 0 or > 100.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c24-marks-mcq-1",
              prompt: "In the report program, why does `computeResult` take `struct Student *s` rather than `struct Student s`?",
              options: [
                { id: "a", text: "Structs cannot be passed by value in C" },
                { id: "b", text: "So the function can store total, average and grade in the caller's struct" },
                { id: "c", text: "Pointers make the program use less memory for the array" },
                { id: "d", text: "Because scanf requires it" },
              ],
              correct: "b",
              explanation: "A by-value parameter is a copy; changes would be lost when the function returns.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c24-marks-output-1",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

char gradeFor(double avg) {
    if (avg >= 80) return 'A';
    if (avg >= 70) return 'B';
    if (avg >= 60) return 'C';
    if (avg >= 50) return 'D';
    return 'F';
}

int main(void) {
    int total = 179;
    double a1 = total / 3;
    double a2 = (double)total / 3;
    printf("%.2f %.2f %c\\n", a1, a2, gradeFor(a2));
    return 0;
}`,
              expected: "59.00 59.67 D",
              explanation: "total / 3 is integer division (59), which is only then converted to double, giving 59.00. Casting first gives 59.67. Both are below 60, so the grade is D.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c24-marks-tf-1",
              prompt: "Using `>` (not `>=`) when searching for the highest total means that, in a tie, the first student with that total is reported.",
              correct: true,
              explanation: "A later student replaces the current best only if strictly greater.",
            },
            {
              type: "CODE_WRITING",
              slug: "c24-grade-count-code",
              prompt: "Read an integer `n`, then `n` marks (integers 0–100). Using a function `char gradeFor(int mark)` with the scale A ≥ 80, B ≥ 70, C ≥ 60, D ≥ 50, otherwise F, print how many marks fall in each grade in the format `A:x B:x C:x D:x F:x`.",
              starterCode: `#include <stdio.h>

char gradeFor(int mark) {
    /* your code */
}

int main(void) {
    int n;
    scanf("%d", &n);
    /* count grades and print */
    return 0;
}`,
              sampleTests: [
                { stdin: "5\n85 72 64 55 30\n", expected: "A:1 B:1 C:1 D:1 F:1" },
                { stdin: "3\n80 80 79\n", expected: "A:2 B:1 C:0 D:0 F:0" },
              ],
              hiddenTests: [
                { stdin: "1\n0\n", expected: "A:0 B:0 C:0 D:0 F:1" },
                { stdin: "4\n100 50 60 70\n", expected: "A:1 B:1 C:1 D:1 F:0" },
                { stdin: "6\n49 49 50 99 69 70\n", expected: "A:1 B:1 C:1 D:1 F:2" },
              ],
              solutionCode: `#include <stdio.h>

char gradeFor(int mark) {
    if (mark >= 80) return 'A';
    if (mark >= 70) return 'B';
    if (mark >= 60) return 'C';
    if (mark >= 50) return 'D';
    return 'F';
}

int main(void) {
    int n, i, mark;
    int a = 0, b = 0, c = 0, d = 0, f = 0;
    if (scanf("%d", &n) != 1) return 0;
    for (i = 0; i < n; i++) {
        scanf("%d", &mark);
        switch (gradeFor(mark)) {
            case 'A': a++; break;
            case 'B': b++; break;
            case 'C': c++; break;
            case 'D': d++; break;
            default:  f++; break;
        }
    }
    printf("A:%d B:%d C:%d D:%d F:%d\\n", a, b, c, d, f);
    return 0;
}`,
              explanation: "Reuse one grading function and count its results with a switch on the returned letter.",
            },
          ],
        },
        {
          slug: "project-bank-account-menu",
          title: "Project: bank account menu",
          summary:
            "A menu-driven program with a loop and switch, money stored safely as integer cents, validated deposits and withdrawals, and a transaction history.",
          estMinutes: 45,
          blocks: [
            {
              type: "objectives",
              items: [
                "Build a menu-driven program with a loop and a switch statement",
                "Represent money safely as an integer number of cents",
                "Write functions that validate and update state through pointers",
                "Record a transaction history in an array of structs",
              ],
            },
            { type: "heading", text: "Requirements", level: 2 },
            {
              type: "markdown",
              md: `Build a simple bank account simulator, like the menu on an ATM screen.

- Show the menu once: \`1) Deposit  2) Withdraw  3) Balance  4) Statement  0) Exit\`.
- Then repeatedly read an option number. Options 1 and 2 are followed by an amount (e.g. \`120.50\`).
- **Deposit**: the amount must be positive; print \`Deposited $X\`.
- **Withdraw**: the amount must be positive and not more than the balance; otherwise print \`Insufficient funds\`.
- **Balance**: print \`Balance: $X\`. **Statement**: list every successful transaction.
- Invalid amounts print \`Invalid amount\`; unknown options print \`Unknown option N\`.
- Option 0 or the end of input ends the program with \`Goodbye. Final balance: $X\`.`,
            },
            {
              type: "definition",
              term: "Menu-driven program",
              md: "A program whose main loop repeatedly reads a choice from the user and dispatches to the matching action (usually with `switch`) until an exit choice is made.",
            },
            {
              type: "definition",
              term: "Fixed-point money (cents)",
              md: "Storing amounts as whole numbers of the smallest unit (cents) instead of `double` dollars. Integer arithmetic is exact, so no rounding errors accumulate (0.1 + 0.2 is not exactly 0.3 in floating point).",
            },
            {
              type: "callout",
              variant: "warning",
              title: "Never store money in floating point",
              md: "`double` cannot represent most decimal fractions exactly. After many transactions a balance of $0.30 might become 0.30000000000000004 or 0.29999999999999999. Convert to integer cents as soon as the amount is read.",
            },
            { type: "heading", text: "Design", level: 2 },
            {
              type: "syntax",
              language: "c",
              code: `struct Transaction { char type; int cents; };   /* 'D' or 'W' */

int  toCents(double amount);               /* 120.50 -> 12050 */
void printMoney(int cents);                /* 12050 -> $120.50 */
void deposit(int *balance, int cents);
int  withdraw(int *balance, int cents);    /* 0 if insufficient funds */

while (read choice && choice != 0) {
    switch (choice) { case 1: ... case 2: ... case 3: ... case 4: ... default: ... }
}`,
              md: "The balance lives in main; functions receive a pointer so they can change it. This keeps state out of global variables.",
            },
            {
              type: "code",
              language: "c",
              title: "Stage 1: test the money helpers",
              runnable: true,
              code: `#include <stdio.h>

int toCents(double amount) {
    return (int)(amount * 100 + 0.5);    /* round to the nearest cent */
}

void printMoney(int cents) {
    printf("$%d.%02d", cents / 100, cents % 100);
}

int main(void) {
    double inputs[4] = {120.5, 0.1, 19.99, 1000};
    int i;
    for (i = 0; i < 4; i++) {
        int c = toCents(inputs[i]);
        printf("%d cents = ", c);
        printMoney(c);
        printf("\\n");
    }
    printf("0.1 + 0.2 as cents: %d\\n", toCents(0.1) + toCents(0.2));
    return 0;
}`,
              output: `12050 cents = $120.50
10 cents = $0.10
1999 cents = $19.99
100000 cents = $1000.00
0.1 + 0.2 as cents: 30`,
              walkthrough: [
                { lines: "4", text: "19.99 * 100 might be 1998.9999999; adding 0.5 before truncating rounds it correctly to 1999. (This simple rounding is for positive amounts, which is all we accept.)" },
                { lines: "8", text: "`%02d` pads the cents with a leading zero: 5 cents prints as `05`, not `5`." },
                { lines: "20", text: "In cents, 10 + 20 is exactly 30. In doubles, 0.1 + 0.2 is not exactly 0.3." },
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Stage 2: the complete menu program",
              runnable: true,
              stdin: "1 500\n2 120.50\n2 1000\n3\n7\n1 -5\n4\n0\n",
              code: `#include <stdio.h>

#define MAX_TX 100

struct Transaction {
    char type;      /* 'D' deposit, 'W' withdrawal */
    int cents;
};

int toCents(double amount) {
    return (int)(amount * 100 + 0.5);
}

void printMoney(int cents) {
    printf("$%d.%02d", cents / 100, cents % 100);
}

void deposit(int *balance, int cents) {
    *balance += cents;
}

int withdraw(int *balance, int cents) {
    if (cents > *balance) return 0;
    *balance -= cents;
    return 1;
}

int main(void) {
    struct Transaction history[MAX_TX];
    int count = 0, balance = 0, choice, i, cents;
    double amount;

    printf("1) Deposit  2) Withdraw  3) Balance  4) Statement  0) Exit\\n");
    while (scanf("%d", &choice) == 1 && choice != 0) {
        switch (choice) {
        case 1:
        case 2:
            if (scanf("%lf", &amount) != 1 || amount <= 0) {
                printf("Invalid amount\\n");
                break;
            }
            cents = toCents(amount);
            if (choice == 1) {
                deposit(&balance, cents);
                printf("Deposited ");
            } else if (withdraw(&balance, cents)) {
                printf("Withdrew ");
            } else {
                printf("Insufficient funds\\n");
                break;
            }
            printMoney(cents);
            printf("\\n");
            if (count < MAX_TX) {
                history[count].type = (choice == 1) ? 'D' : 'W';
                history[count].cents = cents;
                count++;
            }
            break;
        case 3:
            printf("Balance: ");
            printMoney(balance);
            printf("\\n");
            break;
        case 4:
            printf("Statement (%d transactions)\\n", count);
            for (i = 0; i < count; i++) {
                printf("  %c ", history[i].type);
                printMoney(history[i].cents);
                printf("\\n");
            }
            break;
        default:
            printf("Unknown option %d\\n", choice);
        }
    }
    printf("Goodbye. Final balance: ");
    printMoney(balance);
    printf("\\n");
    return 0;
}`,
              output: `1) Deposit  2) Withdraw  3) Balance  4) Statement  0) Exit
Deposited $500.00
Withdrew $120.50
Insufficient funds
Balance: $379.50
Unknown option 7
Invalid amount
Statement (2 transactions)
  D $500.00
  W $120.50
Goodbye. Final balance: $379.50`,
              walkthrough: [
                { lines: "18-26", text: "The balance is updated through a pointer. `withdraw` refuses (returns 0) rather than letting the balance go negative." },
                { lines: "34", text: "The loop ends on option 0 **or** when input runs out or is not a number (scanf stops returning 1). The program never loops forever on bad input." },
                { lines: "36-37", text: "Cases 1 and 2 share the amount-reading code by falling through from `case 1:` into `case 2:`." },
                { lines: "38-41", text: "Validation first. `break` leaves the switch (not the loop), so the menu continues." },
                { lines: "42-51", text: "Exactly one of three outcomes. Only successful transactions reach the code that prints the amount and records history." },
                { lines: "54-58", text: "Record the transaction if there is room. Bounds-checking the history array prevents overflow after 100 transactions." },
                { lines: "73-74", text: "`default` catches any other number, such as 7 in this run." },
              ],
            },
            { type: "heading", text: "Why it works", level: 2 },
            {
              type: "markdown",
              md: `The loop-plus-switch structure separates **choosing** an action from **performing** it. Every action ends with \`break\`, returning control to the loop, which reads the next choice. Because all money is held as \`int\` cents, every comparison (\`cents > *balance\`) and every update is exact. Validation happens at the boundary, where data enters the program, so the core functions can assume they receive sensible amounts.`,
            },
            { type: "heading", text: "Real-world uses", level: 2 },
            {
              type: "markdown",
              md: `- ATMs, vending machines, point-of-sale terminals and embedded device menus are all menu loops.
- Real banking software stores money as integers (or decimal types) for exactly the reason shown here.
- Transaction logs, like our history array, are how real systems produce statements and audit trails.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Forgetting break in a switch case",
                  wrong: `case 3:
    printf("Balance: ...\\n");
case 4:                        /* falls through: statement printed too */
    printf("Statement...\\n");`,
                  right: `case 3:
    printf("Balance: ...\\n");
    break;
case 4:
    printf("Statement...\\n");
    break;`,
                  md: "Without break, execution continues into the next case. Use fall-through only deliberately, as with cases 1 and 2.",
                },
                {
                  title: "Infinite loop on non-numeric input",
                  wrong: `while (choice != 0) {
    scanf("%d", &choice);   /* fails forever on 'x' */
    ...
}`,
                  right: `while (scanf("%d", &choice) == 1 && choice != 0) {
    ...
}`,
                  md: "When scanf fails, the bad characters stay in the input and the same failure repeats. Check the return value.",
                },
                {
                  title: "Using double for the balance",
                  wrong: `double balance = 0.0;
balance += 0.10;  balance += 0.20;
if (balance == 0.30) ...      /* false! */`,
                  right: `int balanceCents = 0;
balanceCents += 10;  balanceCents += 20;
if (balanceCents == 30) ...   /* true */`,
                  md: "Floating-point values are approximations. Use integer cents for money.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "A menu program is a loop around a switch; each case ends with break.",
                "Check scanf's return value in the loop condition to stop cleanly at end of input or on bad input.",
                "Store money as integer cents; print with %d.%02d.",
                "Pass state (the balance) by pointer instead of using globals.",
                "Validate input at the point where it enters the program.",
              ],
            },
            {
              type: "recap",
              items: [
                "Loop + switch = menu.",
                "Integer cents = exact money.",
                "Functions validate and update through pointers.",
                "An array of structs keeps the transaction history.",
              ],
            },
            {
              type: "exercise",
              id: "c24-ex-bank-interest",
              kind: "write",
              title: "Extension: monthly interest",
              prompt: "Add a function `int addInterest(int *balance, int ratePerThousand)` that adds interest to the balance, rounded down to a whole cent, and returns the interest added. Test it: a balance of $1234.56 at 15 per thousand (1.5%) should gain $18.51 and become $1253.07.",
              hint: "interest = *balance * rate / 1000 using integer arithmetic.",
              solution: "123456 * 15 / 1000 = 1851 cents (integer division rounds down). The new balance is 125307 cents.",
              solutionCode: `#include <stdio.h>

void printMoney(int cents) {
    printf("$%d.%02d", cents / 100, cents % 100);
}

int addInterest(int *balance, int ratePerThousand) {
    int interest = *balance * ratePerThousand / 1000;
    *balance += interest;
    return interest;
}

int main(void) {
    int balance = 123456;
    int gained = addInterest(&balance, 15);
    printf("Interest: ");
    printMoney(gained);
    printf("\\nNew balance: ");
    printMoney(balance);
    printf("\\n");
    return 0;
}`,
              expectedOutput: "Interest: $18.51\nNew balance: $1253.07",
            },
            {
              type: "exercise",
              id: "c24-ex-bank-predict",
              kind: "predict",
              title: "Predict the session",
              prompt: "Using the complete menu program above, what is printed for the input `1 50\\n2 20.25\\n2 40\\n3\\n` (after the menu line)?",
              hint: "Follow the balance in cents: 5000, then 2975.",
              solution: "Deposited $50.00, Withdrew $20.25, Insufficient funds (40.00 > 29.75), Balance: $29.75, then end of input gives Goodbye. Final balance: $29.75.",
            },
            {
              type: "exercise",
              id: "c24-ex-bank-extensions",
              kind: "concept",
              title: "More extension ideas",
              prompt: "How would you add (a) multiple accounts selected by account number, (b) a daily withdrawal limit, and (c) saving the balance and history to a file between runs?",
              hint: "Arrays of structs, an extra field, and the file-handling chapter.",
              solution: "(a) Make a struct Account { int number; int balance; struct Transaction history[MAX_TX]; int count; } and an array of accounts; read an account number first and search for it. (b) Track withdrawnToday in the account and reject withdrawals that would exceed the limit. (c) On exit, write each account with fwrite (or fprintf for a text format); on start, read them back if the file exists.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c24-bank-mcq-1",
              prompt: "Why does the bank program store the balance as an `int` number of cents?",
              options: [
                { id: "a", text: "Because printf cannot print doubles" },
                { id: "b", text: "Because integer arithmetic on cents is exact, avoiding floating-point rounding errors" },
                { id: "c", text: "Because ints are larger than doubles" },
                { id: "d", text: "Because scanf cannot read decimals" },
              ],
              correct: "b",
              explanation: "Decimal fractions like 0.1 cannot be represented exactly in binary floating point.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c24-bank-output-1",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

void printMoney(int cents) {
    printf("$%d.%02d\\n", cents / 100, cents % 100);
}

int main(void) {
    printMoney(705);
    printMoney(99);
    printMoney(120000);
    return 0;
}`,
              expected: "$7.05\n$0.99\n$1200.00",
              explanation: "%02d pads single-digit cents with a zero.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c24-bank-tf-1",
              prompt: "Inside a switch that is inside a while loop, `break` exits the while loop.",
              correct: false,
              explanation: "break exits only the innermost switch or loop, which here is the switch.",
            },
            {
              type: "CODE_WRITING",
              slug: "c24-bank-sim-code",
              prompt: "Simulate an account that starts at 0 cents. Read integers until EOF: a positive value is a deposit of that many cents; a negative value is a withdrawal of that many cents, which is **rejected** if it would make the balance negative; 0 is ignored. At the end print `balance=B rejected=R` where R is the number of rejected withdrawals.",
              starterCode: `#include <stdio.h>

int main(void) {
    int x, balance = 0, rejected = 0;
    while (scanf("%d", &x) == 1) {
        /* your code */
    }
    printf("balance=%d rejected=%d\\n", balance, rejected);
    return 0;
}`,
              sampleTests: [
                { stdin: "500 -200 -400 100\n", expected: "balance=400 rejected=1" },
                { stdin: "-50\n", expected: "balance=0 rejected=1" },
              ],
              hiddenTests: [
                { stdin: "100 -100 -1 0 50\n", expected: "balance=50 rejected=1" },
                { stdin: "", expected: "balance=0 rejected=0" },
                { stdin: "1000 -250 -250 -250 -250 -1\n", expected: "balance=0 rejected=1" },
              ],
              solutionCode: `#include <stdio.h>

int main(void) {
    int x, balance = 0, rejected = 0;
    while (scanf("%d", &x) == 1) {
        if (x > 0) {
            balance += x;
        } else if (x < 0) {
            if (balance + x < 0) {
                rejected++;
            } else {
                balance += x;
            }
        }
    }
    printf("balance=%d rejected=%d\\n", balance, rejected);
    return 0;
}`,
              explanation: "A withdrawal x < 0 is allowed only if balance + x stays at or above zero.",
            },
          ],
        },
        {
          slug: "project-text-statistics",
          title: "Project: text statistics",
          summary:
            "Analyse any text from standard input: lines, words, characters, sentences, average word length, the longest word and the most common letter.",
          estMinutes: 45,
          blocks: [
            {
              type: "objectives",
              items: [
                "Read text line by line with fgets until end of input",
                "Detect words with a state flag and character classification from ctype.h",
                "Collect several statistics in one struct passed by pointer",
                "Use a frequency array to find the most common letter",
              ],
            },
            { type: "heading", text: "Requirements", level: 2 },
            {
              type: "markdown",
              md: `Writers and teachers use tools that report on a piece of text. Build one.

- **Input**: any text from standard input, until end of input. Lines are at most 255 characters.
- A **word** is a maximal run of letters and digits (so \`don't\` counts as two words, \`don\` and \`t\`; that is fine for this version).
- **Output**:
  - \`Lines\`, \`Words\`, \`Characters\` (excluding newline characters), \`Letters\`, \`Digits\`, \`Sentences\` (count of \`.\`, \`!\` and \`?\`)
  - \`Average word length\` (word characters / words, 2 decimals)
  - \`Longest word\` (the first one if tied) with its length
  - \`Most common letter\` (case-insensitive; alphabetically first if tied) with its count
- Empty input must not crash (no division by zero).`,
            },
            {
              type: "definition",
              term: "State flag",
              md: "A variable that remembers which situation the program is in, such as `inWord = 1` while scanning letters of a word. Changes of state (outside → inside a word) mark events such as 'a new word starts'.",
            },
            {
              type: "definition",
              term: "Frequency array",
              md: "An array of counters indexed by a value, e.g. `freq[c - 'a']` for letters. One pass over the data fills it; a second pass over the 26 counters finds the maximum.",
            },
            { type: "heading", text: "Design", level: 2 },
            {
              type: "syntax",
              language: "c",
              code: `struct Stats {
    int lines, words, chars, letters, digits, sentences, wordChars;
    int freq[26];
    char longest[64];
    int longestLen;
};

void analyseLine(const char *line, struct Stats *st);   /* update stats from one line */
void printStats(const struct Stats *st);                /* report */

main: struct Stats st = {0};  while (fgets(line, ...)) analyseLine(line, &st);  printStats(&st);`,
              md: "`struct Stats st = {0};` sets **every** member, including the whole array and string, to zero, so all counters start correctly.",
            },
            {
              type: "code",
              language: "c",
              title: "Stage 1: words with a state flag",
              runnable: true,
              code: `#include <stdio.h>
#include <ctype.h>

int countWords(const char *s) {
    int i, words = 0, inWord = 0;
    for (i = 0; s[i] != '\\0'; i++) {
        if (isalnum((unsigned char)s[i])) {
            if (!inWord) {
                words++;          /* outside -> inside: a new word */
                inWord = 1;
            }
        } else {
            inWord = 0;
        }
    }
    return words;
}

int main(void) {
    printf("%d\\n", countWords("Hello, world!"));
    printf("%d\\n", countWords("   spaces   everywhere  "));
    printf("%d\\n", countWords(""));
    printf("%d\\n", countWords("C99 and C11 -- both!"));
    return 0;
}`,
              output: `2
2
0
4`,
              walkthrough: [
                { lines: "7", text: "`isalnum` is true for letters and digits. Casting to `unsigned char` avoids undefined behaviour for characters with negative values on systems where char is signed." },
                { lines: "8-11", text: "A word is counted only at the moment we **enter** it, so a word of any length counts once." },
                { lines: "13", text: "Any other character (space, punctuation) puts us outside a word." },
                { lines: "20-23", text: "Edge tests: punctuation next to words, extra spaces, empty string, digits inside words." },
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Stage 2: the complete text analyser",
              runnable: true,
              stdin: "C was created in 1972 by Dennis Ritchie.\nIt is still popular today!\nWhy? Because it is fast and portable.\n",
              code: `#include <stdio.h>
#include <ctype.h>
#include <string.h>

struct Stats {
    int lines, words, chars, letters, digits, sentences, wordChars;
    int freq[26];
    char longest[64];
    int longestLen;
};

void analyseLine(const char *line, struct Stats *st) {
    char word[64];
    int len = 0, i;
    st->lines++;
    for (i = 0; ; i++) {
        unsigned char c = (unsigned char)line[i];
        if (isalnum(c)) {
            if (len < 63) word[len] = (char)c;
            len++;
            if (isalpha(c)) {
                st->letters++;
                st->freq[tolower(c) - 'a']++;
            } else {
                st->digits++;
            }
        } else if (len > 0) {            /* a word just ended */
            st->words++;
            st->wordChars += len;
            if (len > st->longestLen) {
                word[len < 63 ? len : 63] = '\\0';
                strcpy(st->longest, word);
                st->longestLen = len;
            }
            len = 0;
        }
        if (c == '\\0') break;
        if (c == '.' || c == '!' || c == '?') st->sentences++;
        if (c != '\\n') st->chars++;
    }
}

void printStats(const struct Stats *st) {
    int i, best = 0;
    for (i = 1; i < 26; i++) {
        if (st->freq[i] > st->freq[best]) best = i;
    }
    printf("Lines: %d\\n", st->lines);
    printf("Words: %d\\n", st->words);
    printf("Characters: %d\\n", st->chars);
    printf("Letters: %d\\n", st->letters);
    printf("Digits: %d\\n", st->digits);
    printf("Sentences: %d\\n", st->sentences);
    if (st->words > 0) {
        printf("Average word length: %.2f\\n", (double)st->wordChars / st->words);
        printf("Longest word: %s (%d)\\n", st->longest, st->longestLen);
    }
    if (st->letters > 0) {
        printf("Most common letter: %c (%d)\\n", 'a' + best, st->freq[best]);
    }
}

int main(void) {
    char line[256];
    struct Stats st = {0};
    while (fgets(line, sizeof line, stdin) != NULL) {
        analyseLine(line, &st);
    }
    printStats(&st);
    return 0;
}`,
              output: `Lines: 3
Words: 20
Characters: 103
Letters: 78
Digits: 4
Sentences: 4
Average word length: 4.10
Longest word: portable (8)
Most common letter: i (9)`,
              walkthrough: [
                { lines: "12-15", text: "Each call handles one line. `word` collects the current word's characters; `len` is its length." },
                { lines: "16-17", text: "The loop runs up to **and including** the terminating `'\\0'`, so a word at the very end of the line is still finished off by the `else if` branch." },
                { lines: "18-26", text: "Letters and digits extend the current word. Letters are counted in the frequency array case-insensitively with `tolower`." },
                { lines: "27-35", text: "When a non-alphanumeric character follows a word, the word is complete: count it, add its length, and keep it if it is strictly longer than the longest so far (so the first longest wins a tie)." },
                { lines: "37-39", text: "Stop at the terminator; count sentence punctuation; count every character except the newline." },
                { lines: "44-47", text: "Scan the 26 counters; strict `>` makes the alphabetically first letter win a tie." },
                { lines: "54-60", text: "Guard the divisions and the 'longest' and 'most common' lines so empty input produces sensible output instead of dividing by zero." },
                { lines: "65", text: "`= {0}` zero-initialises every member of the struct." },
              ],
            },
            { type: "heading", text: "Why it works", level: 2 },
            {
              type: "markdown",
              md: `The analyser makes **one pass** over every character, updating all statistics as it goes, so it works for text of any length while holding just one line in memory. The \`inWord\`-style logic (here, \`len > 0\` means "inside a word") turns a stream of characters into a stream of word events. Bundling all counters into one struct means the analysis function needs only one extra parameter, and adding a new statistic later means adding one field rather than changing every function signature.`,
            },
            { type: "heading", text: "Real-world uses", level: 2 },
            {
              type: "markdown",
              md: `- The Unix tool \`wc\` (word count) is a C program built on this exact idea.
- Readability scores (Flesch reading ease) use words per sentence and letters per word.
- Letter-frequency analysis breaks simple substitution ciphers: in English text, \`e\` and \`t\` are usually the most common letters.
- Search engines and spell checkers start by splitting text into words (tokenising).`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Missing the last word on a line",
                  wrong: `for (i = 0; line[i] != '\\0'; i++) { ... }   /* word at end never 'ends' */`,
                  right: `for (i = 0; ; i++) { ...; if (line[i] == '\\0') break; }`,
                  md: "If the text does not end with a separator, the final word is never counted unless the end of the string also ends the word.",
                },
                {
                  title: "Passing a plain char to isalpha/tolower",
                  wrong: `if (isalpha(line[i]))     /* UB for negative char values */`,
                  right: `if (isalpha((unsigned char)line[i]))`,
                  md: "The ctype functions require a value representable as unsigned char (or EOF). Accented characters can be negative in a signed char.",
                },
                {
                  title: "Dividing by zero on empty input",
                  wrong: `printf("%.2f", (double)wordChars / words);   /* words may be 0 */`,
                  right: `if (words > 0) printf("%.2f", (double)wordChars / words);`,
                  md: "Always consider the empty input when dividing by a count.",
                },
                {
                  title: "Counting the newline that fgets keeps",
                  wrong: `st->chars += strlen(line);   /* includes '\\n' */`,
                  right: `if (c != '\\n') st->chars++;`,
                  md: "fgets stores the newline in the buffer. Decide explicitly whether your specification counts it.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "fgets(line, sizeof line, stdin) returns NULL at end of input; use it as the loop condition.",
                "A state flag (inside/outside a word) counts words correctly regardless of spacing.",
                "Cast chars to unsigned char before passing them to ctype.h functions.",
                "freq[tolower(c) - 'a']++ builds a case-insensitive letter histogram.",
                "struct Stats st = {0}; zero-initialises all members, including arrays.",
              ],
            },
            {
              type: "recap",
              items: [
                "One pass, many statistics, all in one struct.",
                "Words are detected by transitions between word and non-word characters.",
                "A frequency array plus a max-search finds the most common letter.",
                "Guard every division and every 'best' result against empty input.",
              ],
            },
            {
              type: "exercise",
              id: "c24-ex-text-palindromes",
              kind: "write",
              title: "Extension: count palindrome words",
              prompt: "Write `int isPalindrome(const char *w)` (case-insensitive) and use it to count palindromic words of length ≥ 2 in the sentence `\"Anna saw a kayak at noon level\"`. Expected output: `Palindromes: 4`.",
              hint: "Compare tolower(w[i]) with tolower(w[len-1-i]) for i < len/2. Split the sentence into words with the same state-flag idea, or with strtok on a copy.",
              solution: "Anna, kayak, noon and level are palindromes (saw, a and at are not, or are too short).",
              solutionCode: `#include <stdio.h>
#include <string.h>
#include <ctype.h>

int isPalindrome(const char *w) {
    int i, len = (int)strlen(w);
    for (i = 0; i < len / 2; i++) {
        if (tolower((unsigned char)w[i]) != tolower((unsigned char)w[len - 1 - i])) {
            return 0;
        }
    }
    return 1;
}

int main(void) {
    char text[] = "Anna saw a kayak at noon level";
    int count = 0;
    char *word = strtok(text, " ");
    while (word != NULL) {
        if (strlen(word) >= 2 && isPalindrome(word)) count++;
        word = strtok(NULL, " ");
    }
    printf("Palindromes: %d\\n", count);
    return 0;
}`,
              expectedOutput: "Palindromes: 4",
            },
            {
              type: "exercise",
              id: "c24-ex-text-extensions",
              kind: "concept",
              title: "More extension ideas",
              prompt: "Describe how you would add: (a) treating apostrophes inside words as part of the word, (b) counting how many times each distinct word occurs, (c) reading the text from a file named on the command line.",
              hint: "Look ahead one character; an array of structs {word, count}; argv and fopen.",
              solution: "(a) When the character is `'` and the previous and next characters are letters, treat it as a word character. (b) Keep an array of struct { char word[64]; int count; }; for each finished word (lower-cased), search the array with strcmp and increment, or append a new entry (use realloc to grow). (c) Use int main(int argc, char *argv[]); if argc > 1, fopen(argv[1], \"r\") and pass that FILE * to fgets instead of stdin, falling back to stdin otherwise.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c24-text-mcq-1",
              prompt: "In a state-flag word counter, at which moment is the word count incremented?",
              options: [
                { id: "a", text: "On every letter" },
                { id: "b", text: "On every space" },
                { id: "c", text: "When moving from outside a word to inside a word" },
                { id: "d", text: "At the end of each line" },
              ],
              correct: "c",
              explanation: "Counting transitions into a word counts each word exactly once, however many spaces separate them.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c24-text-output-1",
              prompt: "What does this program print?",
              code: `#include <stdio.h>
#include <ctype.h>

int main(void) {
    const char *s = "Data, data everywhere!";
    int freq[26] = {0};
    int i, best = 0;
    for (i = 0; s[i] != '\\0'; i++) {
        if (isalpha((unsigned char)s[i])) {
            freq[tolower((unsigned char)s[i]) - 'a']++;
        }
    }
    for (i = 1; i < 26; i++) {
        if (freq[i] > freq[best]) best = i;
    }
    printf("%c %d\\n", 'a' + best, freq[best]);
    return 0;
}`,
              expected: "a 4",
              explanation: "Counting case-insensitively: 'a' appears 4 times (in Data and data), 'e' 3 times (in everywhere), and 'd', 't' and 'r' twice each. So 'a' is the most common, with 4.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c24-text-tf-1",
              prompt: "`struct Stats st = {0};` sets every member of st to zero, including all elements of its arrays.",
              correct: true,
              explanation: "Members not explicitly initialised in a partial initialiser are zero-initialised.",
            },
            {
              type: "CODE_WRITING",
              slug: "c24-longest-word-code",
              prompt: "Read text from standard input until EOF. A word is a maximal run of letters (`isalpha`). Print `words=W longest=L` where W is the number of words and L is the length of the longest word (0 if there are no words).",
              starterCode: `#include <stdio.h>
#include <ctype.h>

int main(void) {
    int c, words = 0, longest = 0, len = 0;
    /* read with getchar() until EOF */
    printf("words=%d longest=%d\\n", words, longest);
    return 0;
}`,
              sampleTests: [
                { stdin: "The quick brown fox\n", expected: "words=4 longest=5" },
                { stdin: "Hi! Hello-there, world.\n", expected: "words=4 longest=5" },
              ],
              hiddenTests: [
                { stdin: "", expected: "words=0 longest=0" },
                { stdin: "a\nbb\nccc", expected: "words=3 longest=3" },
                { stdin: "123 456 !!!\n", expected: "words=0 longest=0" },
              ],
              solutionCode: `#include <stdio.h>
#include <ctype.h>

int main(void) {
    int c, words = 0, longest = 0, len = 0;
    do {
        c = getchar();
        if (c != EOF && isalpha(c)) {
            len++;
        } else if (len > 0) {
            words++;
            if (len > longest) longest = len;
            len = 0;
        }
    } while (c != EOF);
    printf("words=%d longest=%d\\n", words, longest);
    return 0;
}`,
              explanation: "Treating EOF as a separator (the do-while processes it once) finishes a word that is not followed by a newline.",
            },
          ],
        },
        {
          slug: "project-matrix-operations",
          title: "Project: matrix operations",
          summary:
            "Read two square matrices and compute their sum, product, transpose and trace with functions on 2D arrays, including the pointer view of 2D arrays.",
          estMinutes: 45,
          blocks: [
            {
              type: "objectives",
              items: [
                "Pass two-dimensional arrays to functions correctly",
                "Implement matrix addition, multiplication and transpose with nested loops",
                "Relate m[i][j] to pointer notation *(*(m + i) + j)",
                "Validate dimensions and keep output neatly formatted",
              ],
            },
            { type: "heading", text: "Requirements", level: 2 },
            {
              type: "markdown",
              md: `Matrices (rectangular grids of numbers) are the workhorse of graphics, physics simulations, statistics and machine learning. Build a small matrix calculator.

- **Input**: a size *n* (1 to 10), then the *n × n* entries of matrix A row by row, then those of matrix B.
- **Output**, each matrix with every entry printed in a field of width 5:
  - \`A + B\`
  - \`A x B\` (matrix product)
  - \`Transpose of A\`
  - \`Trace of A: T\` (the sum of the main diagonal)
- If *n* is out of range or entries are missing, print \`Invalid input\`.

Recall the matrix product: entry (i, j) of A × B is row *i* of A "dotted" with column *j* of B: the sum over k of A[i][k] × B[k][j].`,
            },
            {
              type: "definition",
              term: "Matrix product",
              md: "For n × n matrices, (A × B)[i][j] = Σₖ A[i][k] · B[k][j]. It needs three nested loops (i, j, k) and in general A × B ≠ B × A.",
            },
            {
              type: "definition",
              term: "Transpose",
              md: "The matrix obtained by swapping rows and columns: Aᵀ[i][j] = A[j][i]. The first row becomes the first column.",
            },
            {
              type: "definition",
              term: "Row-major order",
              md: "C stores a 2D array row after row in one contiguous block. `int m[3][4]` is three consecutive arrays of 4 ints, which is why a function parameter must specify the column count: `int m[][4]`.",
            },
            {
              type: "syntax",
              language: "c",
              code: `#define MAX 10

void readMatrix(int m[][MAX], int n);         /* column size is required */
void printMatrix(const char *title, int m[][MAX], int n);
void add(int a[][MAX], int b[][MAX], int r[][MAX], int n);
void multiply(int a[][MAX], int b[][MAX], int r[][MAX], int n);
void transpose(int a[][MAX], int r[][MAX], int n);
int  trace(int (*m)[MAX], int n);             /* same type as int m[][MAX] */`,
              md: "`int m[][MAX]` and `int (*m)[MAX]` mean the same thing as parameters: a pointer to arrays of MAX ints. The functions use a fixed MAX-wide array but only the top-left n × n part.",
            },
            {
              type: "code",
              language: "c",
              title: "Stage 1: two views of a 2D array",
              runnable: true,
              code: `#include <stdio.h>

#define MAX 3

int trace(int (*m)[MAX], int n) {
    int i, sum = 0;
    for (i = 0; i < n; i++) {
        sum += *(*(m + i) + i);          /* same as m[i][i] */
    }
    return sum;
}

int main(void) {
    int m[MAX][MAX] = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
    int *flat = &m[0][0];
    int i;
    printf("m[1][2] = %d, *(*(m + 1) + 2) = %d\\n", m[1][2], *(*(m + 1) + 2));
    printf("row-major order:");
    for (i = 0; i < MAX * MAX; i++) {
        printf(" %d", flat[i]);
    }
    printf("\\ntrace = %d\\n", trace(m, MAX));
    return 0;
}`,
              output: `m[1][2] = 6, *(*(m + 1) + 2) = 6
row-major order: 1 2 3 4 5 6 7 8 9
trace = 15`,
              walkthrough: [
                { lines: "5", text: "`int (*m)[MAX]` is a pointer to an array of MAX ints, i.e. a pointer to one row." },
                { lines: "8", text: "`m + i` moves forward i whole rows; `*(m + i)` is that row (decaying to a pointer to its first int); adding `i` and dereferencing gives the diagonal element." },
                { lines: "15", text: "`&m[0][0]` is a plain `int *` to the first element." },
                { lines: "17", text: "Index notation and pointer notation reach the same element: row 1, column 2 is 6." },
                { lines: "18-21", text: "Walking the flat pointer shows the rows are stored one after another: row-major order." },
                { lines: "22", text: "1 + 5 + 9 = 15." },
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Stage 2: the complete matrix calculator",
              runnable: true,
              stdin: "3\n1 2 3\n4 5 6\n7 8 9\n2 0 1\n1 1 0\n0 3 1\n",
              code: `#include <stdio.h>

#define MAX 10

int readMatrix(int m[][MAX], int n) {
    int i, j;
    for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
            if (scanf("%d", &m[i][j]) != 1) return 0;
        }
    }
    return 1;
}

void printMatrix(const char *title, int m[][MAX], int n) {
    int i, j;
    printf("%s\\n", title);
    for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
            printf("%5d", m[i][j]);
        }
        printf("\\n");
    }
}

void add(int a[][MAX], int b[][MAX], int r[][MAX], int n) {
    int i, j;
    for (i = 0; i < n; i++)
        for (j = 0; j < n; j++)
            r[i][j] = a[i][j] + b[i][j];
}

void multiply(int a[][MAX], int b[][MAX], int r[][MAX], int n) {
    int i, j, k;
    for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
            r[i][j] = 0;
            for (k = 0; k < n; k++) {
                r[i][j] += a[i][k] * b[k][j];
            }
        }
    }
}

void transpose(int a[][MAX], int r[][MAX], int n) {
    int i, j;
    for (i = 0; i < n; i++)
        for (j = 0; j < n; j++)
            r[j][i] = a[i][j];
}

int trace(int (*m)[MAX], int n) {
    int i, sum = 0;
    for (i = 0; i < n; i++) {
        sum += *(*(m + i) + i);
    }
    return sum;
}

int main(void) {
    int a[MAX][MAX], b[MAX][MAX], r[MAX][MAX];
    int n;
    if (scanf("%d", &n) != 1 || n < 1 || n > MAX ||
        !readMatrix(a, n) || !readMatrix(b, n)) {
        printf("Invalid input\\n");
        return 1;
    }
    add(a, b, r, n);
    printMatrix("A + B", r, n);
    multiply(a, b, r, n);
    printMatrix("A x B", r, n);
    transpose(a, r, n);
    printMatrix("Transpose of A", r, n);
    printf("Trace of A: %d\\n", trace(a, n));
    return 0;
}`,
              output: `A + B
    3    2    4
    5    6    6
    7   11   10
A x B
    4   11    4
   13   23   10
   22   35   16
Transpose of A
    1    4    7
    2    5    8
    3    6    9
Trace of A: 15`,
              walkthrough: [
                { lines: "5-13", text: "Reading returns 0 on the first missing or invalid entry so `main` can report bad input." },
                { lines: "15-24", text: "`%5d` gives every entry the same width, keeping columns aligned even with negative or multi-digit values." },
                { lines: "33-43", text: "The classic triple loop. `r[i][j]` must be reset to 0 before accumulating; the result goes into a **separate** matrix because a and b are still needed while it is being computed." },
                { lines: "45-50", text: "Transpose writes `r[j][i]` from `a[i][j]`. Again a separate result matrix: transposing in place with this loop would overwrite values before they are copied." },
                { lines: "63-67", text: "Short-circuit evaluation: if n is invalid, the matrices are never read. Checking `n > MAX` prevents writing outside the fixed-size arrays." },
                { lines: "68-74", text: "One scratch matrix `r` is reused for each result, since each is printed before the next is computed." },
              ],
            },
            { type: "heading", text: "Why it works", level: 2 },
            {
              type: "markdown",
              md: `A 2D array parameter is really a pointer to its first row. To find \`m[i][j]\`, the compiler computes *start + (i × MAX + j) × sizeof(int)*, which is why it must know \`MAX\` (the row length) but not the number of rows. Using the same \`MAX\` everywhere keeps all functions compatible, and passing \`n\` tells each one how much of the grid is in use. Each operation is a direct translation of its mathematical definition into nested loops, so testing it against a small hand-computed example (a 2 × 2 or 3 × 3) gives high confidence.`,
            },
            { type: "heading", text: "Real-world uses", level: 2 },
            {
              type: "markdown",
              md: `- **3D graphics**: every rotation, scaling and camera projection is a 4 × 4 matrix multiplication, performed millions of times per second by GPUs.
- **Machine learning**: neural network layers are large matrix products.
- **Image processing**: an image is a matrix of pixels; transposing rotates or flips it.
- **Scientific computing**: libraries such as BLAS and LAPACK, still written in C and Fortran, are highly optimised versions of these loops.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Omitting the column size in a 2D array parameter",
                  wrong: `void printMatrix(int m[][], int n);     /* error */`,
                  right: `void printMatrix(int m[][MAX], int n);`,
                  md: "The compiler needs the row length to compute element addresses. Only the first dimension may be left empty.",
                },
                {
                  title: "Not resetting the accumulator in multiplication",
                  wrong: `for (k = 0; k < n; k++)
    r[i][j] += a[i][k] * b[k][j];      /* r[i][j] held garbage */`,
                  right: `r[i][j] = 0;
for (k = 0; k < n; k++)
    r[i][j] += a[i][k] * b[k][j];`,
                  md: "Uninitialised (or previously used) result cells corrupt the sum.",
                },
                {
                  title: "Multiplying element by element",
                  wrong: `r[i][j] = a[i][j] * b[i][j];   /* not the matrix product */`,
                  right: `/* sum over k of a[i][k] * b[k][j] */`,
                  md: "The matrix product combines a row of A with a column of B. Element-wise multiplication is a different operation.",
                },
                {
                  title: "Transposing in place with the full loop",
                  wrong: `for (i...) for (j...) { int t = a[i][j]; a[i][j] = a[j][i]; a[j][i] = t; }
/* every pair is swapped twice: no change */`,
                  right: `for (i = 0; i < n; i++)
    for (j = i + 1; j < n; j++) { int t = a[i][j]; a[i][j] = a[j][i]; a[j][i] = t; }`,
                  md: "In place, only swap above the diagonal (j > i), or write into a separate matrix.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "A 2D array parameter must specify all dimensions except the first: int m[][MAX].",
                "int m[][MAX] and int (*m)[MAX] are equivalent parameter types; m[i][j] equals *(*(m + i) + j).",
                "C stores 2D arrays in row-major order.",
                "Matrix product: r[i][j] = Σ a[i][k] * b[k][j], needing three nested loops and a zeroed accumulator.",
                "Transpose: r[j][i] = a[i][j]; trace: sum of a[i][i].",
              ],
            },
            {
              type: "recap",
              items: [
                "Fixed MAX-sized arrays plus a size n keep functions simple.",
                "Each operation is its mathematical definition written as loops.",
                "Results go into a separate matrix.",
                "Pointer notation and index notation access the same memory.",
              ],
            },
            {
              type: "exercise",
              id: "c24-ex-matrix-symmetric",
              kind: "write",
              title: "Extension: is it symmetric?",
              prompt: "Write `int isSymmetric(int m[][MAX], int n)` that returns 1 if the matrix equals its transpose. Test it on `{{1,7,3},{7,4,5},{3,5,6}}` (symmetric) and `{{1,2},{3,4}}` (not), printing `1` and `0`.",
              hint: "Compare m[i][j] with m[j][i] only for j > i.",
              solution: "Return 0 at the first mismatch; checking only above the diagonal halves the work.",
              solutionCode: `#include <stdio.h>

#define MAX 10

int isSymmetric(int m[][MAX], int n) {
    int i, j;
    for (i = 0; i < n; i++) {
        for (j = i + 1; j < n; j++) {
            if (m[i][j] != m[j][i]) return 0;
        }
    }
    return 1;
}

int main(void) {
    int s[MAX][MAX] = {{1, 7, 3}, {7, 4, 5}, {3, 5, 6}};
    int t[MAX][MAX] = {{1, 2}, {3, 4}};
    printf("%d\\n", isSymmetric(s, 3));
    printf("%d\\n", isSymmetric(t, 2));
    return 0;
}`,
              expectedOutput: "1\n0",
            },
            {
              type: "exercise",
              id: "c24-ex-matrix-predict",
              kind: "predict",
              title: "Predict a 2 × 2 product",
              prompt: "For A = [[1, 2], [3, 4]] and B = [[0, 1], [1, 0]], what are A × B and B × A? What does the difference show?",
              hint: "B swaps things: multiplying on the right swaps columns, on the left swaps rows.",
              solution: "A × B = [[2, 1], [4, 3]] (columns of A swapped). B × A = [[3, 4], [1, 2]] (rows of A swapped). They differ, showing matrix multiplication is not commutative.",
            },
            {
              type: "exercise",
              id: "c24-ex-matrix-extensions",
              kind: "concept",
              title: "More extension ideas",
              prompt: "How would you extend the calculator to (a) rectangular matrices (r × c times c × p), (b) matrices larger than 10 × 10, (c) reading the matrices from a file?",
              hint: "Separate dimensions; dynamic memory; fopen/fscanf.",
              solution: "(a) Read r, c, p separately; multiply loops i < r, j < p, k < c, and reject input where the inner dimensions differ. (b) Allocate with malloc: an array of row pointers or one block of r * c ints accessed as m[i * c + j]; free it at the end. (c) Open the file with fopen, check for NULL, and use fscanf(fp, ...) in readMatrix by passing the FILE * as a parameter.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c24-matrix-mcq-1",
              prompt: "Which function header correctly accepts a 2D array declared as `int grid[10][10]`?",
              options: [
                { id: "a", text: "void f(int grid[][], int n)" },
                { id: "b", text: "void f(int **grid, int n)" },
                { id: "c", text: "void f(int grid[][10], int n)" },
                { id: "d", text: "void f(int grid[10][], int n)" },
              ],
              correct: "c",
              explanation: "Only the first dimension may be omitted. int ** is a different type (pointer to pointer), not compatible with a true 2D array.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c24-matrix-output-1",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

int main(void) {
    int a[2][2] = {{1, 2}, {3, 4}};
    int b[2][2] = {{5, 6}, {7, 8}};
    int i, j, k, r;
    for (i = 0; i < 2; i++) {
        for (j = 0; j < 2; j++) {
            r = 0;
            for (k = 0; k < 2; k++) r += a[i][k] * b[k][j];
            printf("%d ", r);
        }
    }
    printf("\\n");
    return 0;
}`,
              expected: "19 22 43 50",
              explanation: "Row 1: 1·5+2·7 = 19, 1·6+2·8 = 22. Row 2: 3·5+4·7 = 43, 3·6+4·8 = 50.",
            },
            {
              type: "FILL_BLANK",
              slug: "c24-matrix-fill-1",
              prompt: "In pointer notation, m[i][j] can be written as *(*(m + ___) + ___).",
              accepted: [["i"], ["j"]],
              caseSensitive: true,
              explanation: "m + i selects row i; adding j selects the column within that row.",
            },
            {
              type: "CODE_WRITING",
              slug: "c24-transpose-code",
              prompt: "Read two integers `r` and `c` (1 to 10), then an r × c matrix row by row. Print its transpose (c rows of r numbers), with numbers on each row separated by single spaces.",
              starterCode: `#include <stdio.h>

int main(void) {
    int m[10][10];
    int r, c;
    scanf("%d %d", &r, &c);
    /* read, then print the transpose */
    return 0;
}`,
              sampleTests: [
                { stdin: "2 3\n1 2 3\n4 5 6\n", expected: "1 4\n2 5\n3 6" },
                { stdin: "1 1\n7\n", expected: "7" },
              ],
              hiddenTests: [
                { stdin: "3 1\n1\n2\n3\n", expected: "1 2 3" },
                { stdin: "2 2\n-1 0\n5 9\n", expected: "-1 5\n0 9" },
                { stdin: "1 4\n10 20 30 40\n", expected: "10\n20\n30\n40" },
              ],
              solutionCode: `#include <stdio.h>

int main(void) {
    int m[10][10];
    int r, c, i, j;
    if (scanf("%d %d", &r, &c) != 2 || r < 1 || r > 10 || c < 1 || c > 10) return 0;
    for (i = 0; i < r; i++)
        for (j = 0; j < c; j++)
            scanf("%d", &m[i][j]);
    for (j = 0; j < c; j++) {
        for (i = 0; i < r; i++) {
            printf(i == 0 ? "%d" : " %d", m[i][j]);
        }
        printf("\\n");
    }
    return 0;
}`,
              explanation: "Swap the loop order when printing: the outer loop runs over columns of the original, the inner loop over its rows.",
            },
          ],
        },
      ],
    },
  ],
};

export default chapter;
