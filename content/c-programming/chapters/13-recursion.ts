import type { ChapterContent } from "../../../src/lib/content/schema";

const chapter: ChapterContent = {
  slug: "recursion",
  title: "Recursion",
  summary:
    "Learn how a function can solve a problem by calling itself on a smaller version of the same problem: base cases, recursive cases, the call stack, classic recursive algorithms, and when to prefer a loop instead.",
  topics: [
    {
      slug: "recursion-fundamentals",
      title: "Thinking recursively",
      lessons: [
        {
          slug: "recursion-basics",
          title: "Base case, recursive case and the call stack",
          summary:
            "What recursion is, the two parts every recursive function needs, and how the call stack keeps track of each unfinished call.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Explain what it means for a function to be recursive",
                "Identify the base case and the recursive case in a recursive function",
                "Trace a recursive function by drawing its call stack",
                "Write a recursive factorial function and explain why it terminates",
              ],
            },
            {
              type: "markdown",
              md: `In the previous chapter you learned that a function can call *other* functions. Nothing in C stops a function from calling **itself**. A function that does this is called **recursive**, and the technique is called **recursion**.

Why would anyone want that? Because many problems have a natural "smaller copy of myself" inside them:

- To count down from 5, say "5" and then **count down from 4**.
- To compute 5! (5 factorial = 5 × 4 × 3 × 2 × 1), multiply 5 by **4!**.
- To add up the digits of 1234, take the last digit 4 and add **the digit sum of 123**.

Each time, the big problem is described in terms of the *same* problem on a *smaller* input. Recursion lets you write exactly that description as code.`,
            },
            {
              type: "callout",
              variant: "info",
              title: "An everyday analogy: Russian nesting dolls",
              md: `Imagine you are handed a set of nesting dolls and asked "how many dolls are there?". You open the outer doll and find another doll inside. Rather than solving the whole problem at once, you say: *"the answer is 1 plus however many dolls are inside this one"*. You repeat the same question on the smaller doll. Eventually you open a doll that is solid — it contains nothing. That solid doll is where you stop: its answer is simply 1. Then all the "1 plus..." answers are added up on the way back out.`,
            },
            {
              type: "definition",
              term: "Recursive function",
              md: "A function that calls itself, either directly (`f` calls `f`) or indirectly (`f` calls `g`, which calls `f`).",
            },
            {
              type: "definition",
              term: "Base case",
              md: "The condition under which the function returns an answer **without** calling itself again. It is the stopping point. Every recursive function needs at least one.",
            },
            {
              type: "definition",
              term: "Recursive case",
              md: "The part of the function that calls itself on a **smaller** or **simpler** input, moving the problem one step closer to the base case.",
            },
            {
              type: "syntax",
              language: "c",
              code: `return_type solve(parameters)
{
    if (/* input is small enough */) {
        return /* direct answer */;          /* base case */
    }
    /* recursive case: call solve on a smaller input */
    return /* combine */ solve(/* smaller input */);
}`,
              md: "Almost every recursive function follows this shape: check for the base case first, otherwise reduce the problem and call yourself.",
            },
            {
              type: "code",
              language: "c",
              title: "A recursive countdown",
              code: `#include <stdio.h>

void countdown(int n)
{
    if (n == 0) {
        printf("Liftoff!\\n");
        return;
    }
    printf("%d\\n", n);
    countdown(n - 1);
}

int main(void)
{
    countdown(3);
    return 0;
}`,
              runnable: true,
              output: `3
2
1
Liftoff!`,
              walkthrough: [
                { lines: "3", text: "`countdown` takes the number to start from. It returns nothing (`void`), it only prints." },
                { lines: "5-8", text: "**Base case.** When `n` reaches 0 we print `Liftoff!` and `return` immediately, without calling `countdown` again. This is what stops the recursion." },
                { lines: "9", text: "Otherwise we print the current value of `n`." },
                { lines: "10", text: "**Recursive case.** We call `countdown` with `n - 1`, a smaller number, so each call gets one step closer to 0." },
                { lines: "15", text: "`main` starts the chain with 3. The calls made are `countdown(3)`, `countdown(2)`, `countdown(1)` and `countdown(0)`." },
              ],
            },
            {
              type: "heading",
              text: "The call stack: how C remembers unfinished calls",
              level: 2,
            },
            {
              type: "markdown",
              md: `Each time a function is called, C sets aside a small block of memory called a **stack frame** (or *activation record*). The frame holds that call's parameters, its local variables, and the place to return to when it finishes.

Frames are stacked like plates: a new call puts a plate **on top**, and when a call returns its plate is **removed from the top**. This is the **call stack**.

With recursion, several frames of the *same* function are on the stack at once, each with **its own copy** of the parameters. When \`factorial(4)\` calls \`factorial(3)\`, the variable \`n\` in the first frame is still 4 — the new frame simply has its own \`n\` equal to 3.`,
            },
            {
              type: "definition",
              term: "Stack frame",
              md: "The memory reserved for one active function call: its parameters, local variables and return information. Each recursive call gets a fresh frame.",
            },
            {
              type: "table",
              caption: "Call stack while computing factorial(3) (top of the stack is the last row)",
              headers: ["Moment", "Frames on the stack", "What happens"],
              rows: [
                ["1", "main → factorial(3)", "3 is not ≤ 1, so it needs factorial(2)"],
                ["2", "main → factorial(3) → factorial(2)", "2 is not ≤ 1, so it needs factorial(1)"],
                ["3", "main → factorial(3) → factorial(2) → factorial(1)", "Base case: returns 1"],
                ["4", "main → factorial(3) → factorial(2)", "Computes 2 × 1 = 2 and returns it"],
                ["5", "main → factorial(3)", "Computes 3 × 2 = 6 and returns it"],
                ["6", "main", "Receives 6"],
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Recursive factorial",
              code: `#include <stdio.h>

int factorial(int n)
{
    if (n <= 1)
        return 1;
    return n * factorial(n - 1);
}

int main(void)
{
    int i;
    for (i = 0; i <= 5; i++)
        printf("%d! = %d\\n", i, factorial(i));
    return 0;
}`,
              runnable: true,
              output: `0! = 1
1! = 1
2! = 2
3! = 6
4! = 24
5! = 120`,
              walkthrough: [
                { lines: "3", text: "`factorial` receives a non-negative integer and returns n!." },
                { lines: "5-6", text: "**Base case.** By definition 0! = 1 and 1! = 1, so for `n <= 1` we return 1 directly. Using `<=` instead of `==` also protects us if someone passes 0." },
                { lines: "7", text: "**Recursive case.** n! = n × (n−1)!. The multiplication cannot happen until `factorial(n - 1)` has returned its value, so this frame waits on the stack." },
                { lines: "13-14", text: "The loop calls `factorial` for 0 to 5 and prints each result." },
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Watching the calls go down and the results come back up",
              code: `#include <stdio.h>

int factorial(int n, int depth)
{
    int result;
    printf("%*scall factorial(%d)\\n", depth * 2, "", n);
    if (n <= 1)
        result = 1;
    else
        result = n * factorial(n - 1, depth + 1);
    printf("%*sreturn %d\\n", depth * 2, "", result);
    return result;
}

int main(void)
{
    printf("Answer: %d\\n", factorial(4, 0));
    return 0;
}`,
              runnable: true,
              output: `call factorial(4)
  call factorial(3)
    call factorial(2)
      call factorial(1)
      return 1
    return 2
  return 6
return 24
Answer: 24`,
              walkthrough: [
                { lines: "3", text: "We add an extra `depth` parameter only for display: it tells us how deep in the recursion we are." },
                { lines: "6", text: "`%*s` prints a string padded to a width given as an argument. Printing the empty string `\"\"` with width `depth * 2` produces that many spaces, so deeper calls are indented further." },
                { lines: "7-10", text: "The usual base case and recursive case. Note that `depth + 1` is passed to the inner call." },
                { lines: "11", text: "This line runs only **after** the inner call has returned, so the `return` messages appear in reverse order — the deepest call finishes first." },
                { lines: "17", text: "`main` prints the final answer after the whole chain has unwound." },
              ],
            },
            {
              type: "callout",
              variant: "tip",
              title: "Two phases",
              md: "Think of a recursive call as having a **winding** phase (calls going deeper, the stack growing) and an **unwinding** phase (calls returning, the stack shrinking). Code written *before* the recursive call runs while winding; code written *after* it runs while unwinding.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `Recursion works because of two promises:

1. **Progress:** every recursive call is made on an input that is strictly closer to the base case (here, \`n - 1\` is smaller than \`n\`).
2. **Termination:** the base case is guaranteed to be reached, and it returns without recursing.

If both promises hold, the chain of calls is finite. Because each call has its own stack frame, no call overwrites another call's \`n\`, so when the inner calls return, each waiting frame still knows exactly what to multiply by. This is the same reasoning as **mathematical induction**: prove the smallest case, then show that solving size *n−1* lets you solve size *n*.`,
            },
            {
              type: "heading",
              text: "Where recursion is used",
              level: 2,
            },
            {
              type: "markdown",
              md: `- **Tree-shaped data:** folders inside folders on a disk, HTML elements inside elements, family trees. "Process this folder" naturally means "process each sub-folder the same way".
- **Divide-and-conquer algorithms:** merge sort and quicksort split an array in half and sort each half recursively; binary search looks in one half recursively.
- **Mathematical definitions:** factorials, Fibonacci numbers, powers and greatest common divisors are defined recursively.
- **Parsing:** compilers (including your C compiler) read nested expressions like \`(a + (b * c))\` with recursive functions.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Forgetting the base case",
                  wrong: `int factorial(int n)
{
    return n * factorial(n - 1);   /* never stops */
}`,
                  right: `int factorial(int n)
{
    if (n <= 1)
        return 1;
    return n * factorial(n - 1);
}`,
                  md: "Without a base case the function calls itself forever until the call stack runs out of memory and the program crashes (a *stack overflow*). Always write the stopping condition first.",
                },
                {
                  title: "Recursing on an input that does not get smaller",
                  wrong: `void countdown(int n)
{
    if (n == 0) return;
    printf("%d\\n", n);
    countdown(n);       /* same n again! */
}`,
                  right: `void countdown(int n)
{
    if (n == 0) return;
    printf("%d\\n", n);
    countdown(n - 1);
}`,
                  md: "The recursive call must move toward the base case. Passing the same value (or a larger one) means the base case is never reached.",
                },
                {
                  title: "Calling recursively but throwing away the result",
                  wrong: `int factorial(int n)
{
    if (n <= 1)
        return 1;
    factorial(n - 1);          /* result ignored */
    return n;
}`,
                  right: `int factorial(int n)
{
    if (n <= 1)
        return 1;
    return n * factorial(n - 1);
}`,
                  md: "The value returned by the inner call must actually be **used** (combined with `n` and returned). Simply calling the function does not make its result appear anywhere.",
                },
                {
                  title: "A base case that can be skipped",
                  wrong: `int f(int n)
{
    if (n == 0) return 0;
    return n + f(n - 2);   /* f(5): 5, 3, 1, -1, ... never hits 0 */
}`,
                  right: `int f(int n)
{
    if (n <= 0) return 0;
    return n + f(n - 2);
}`,
                  md: "If the input jumps by more than one, an `==` test may be stepped over. Use a range test such as `<=` so the base case catches every value it should.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "Every recursive function must have at least one base case and a recursive case that moves toward it.",
                "Each recursive call gets its own stack frame with its own copies of parameters and local variables.",
                "Statements after the recursive call execute in reverse order of the calls (during unwinding).",
                "Missing or unreachable base cases cause infinite recursion, which ends in a stack overflow crash.",
                "Be able to trace factorial(n) by drawing the stack of calls and the returned values.",
              ],
            },
            {
              type: "recap",
              items: [
                "Recursion = a function solving a problem by calling itself on a smaller version of it.",
                "Base case stops the recursion; recursive case reduces the problem.",
                "The call stack stores one frame per active call; frames are removed in reverse order.",
                "factorial(n) = n × factorial(n − 1), with factorial(0) = factorial(1) = 1.",
              ],
            },
            {
              type: "exercise",
              id: "c13-ex-count-up",
              kind: "write",
              title: "Count up recursively",
              prompt: "Write a recursive function `void countUp(int n)` that prints the numbers from 1 to `n`, one per line, **in increasing order**. Do not use any loop. Call it from `main` with `countUp(4)`.",
              hint: "Make the recursive call *first* (with n − 1) and print n *after* it returns. The base case is n == 0, where you print nothing.",
              solution: "Printing after the recursive call means the deepest call (1) prints first while the stack unwinds.",
              solutionCode: `#include <stdio.h>

void countUp(int n)
{
    if (n == 0)
        return;
    countUp(n - 1);
    printf("%d\\n", n);
}

int main(void)
{
    countUp(4);
    return 0;
}`,
              expectedOutput: `1
2
3
4`,
            },
            {
              type: "exercise",
              id: "c13-ex-predict-before-after",
              kind: "predict",
              title: "Before and after the call",
              prompt: "Predict the exact output of this program.",
              starterCode: `#include <stdio.h>

void show(int n)
{
    if (n == 0)
        return;
    printf("in %d\\n", n);
    show(n - 1);
    printf("out %d\\n", n);
}

int main(void)
{
    show(2);
    return 0;
}`,
              hint: "The `in` lines print while winding; the `out` lines print while unwinding.",
              solution: "show(2) prints `in 2`, then show(1) prints `in 1`, then show(0) returns. Unwinding, show(1) prints `out 1`, then show(2) prints `out 2`.",
              solutionCode: `#include <stdio.h>

void show(int n)
{
    if (n == 0)
        return;
    printf("in %d\\n", n);
    show(n - 1);
    printf("out %d\\n", n);
}

int main(void)
{
    show(2);
    return 0;
}`,
              expectedOutput: `in 2
in 1
out 1
out 2`,
            },
            {
              type: "exercise",
              id: "c13-ex-concept-base-case",
              kind: "concept",
              title: "Spot the missing piece",
              prompt: "A classmate's recursive function `int sumTo(int n) { return n + sumTo(n - 1); }` crashes for every input. Explain exactly why, and state the one line that fixes it.",
              hint: "What does sumTo(0) do?",
              solution: "There is no base case, so the calls continue forever: sumTo(3) → sumTo(2) → ... → sumTo(-1000) and so on, until the call stack overflows. Adding `if (n <= 0) return 0;` as the first line gives a stopping point.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c13-base-case-mcq",
              prompt: "In a recursive function, what is the purpose of the **base case**?",
              options: [
                { id: "a", text: "To call the function again with a smaller input" },
                { id: "b", text: "To return a result without making another recursive call, so the recursion stops" },
                { id: "c", text: "To declare the function before main" },
                { id: "d", text: "To allocate memory for the call stack" },
              ],
              correct: "b",
              explanation: "The base case is the stopping condition: it returns directly without recursing.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c13-frames-tf",
              prompt: "When a recursive function calls itself, the new call shares the same copy of the parameter `n` as the caller.",
              correct: false,
              explanation: "Each call gets its own stack frame with its own copy of every parameter and local variable.",
            },
            {
              type: "FILL_BLANK",
              slug: "c13-stack-overflow-fill",
              prompt: "A recursive function with no reachable base case keeps adding frames until the program crashes with a stack ___.",
              accepted: [["overflow"]],
              explanation: "Infinite recursion exhausts the call stack: a stack overflow.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c13-predict-reverse",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

void p(int n)
{
    if (n > 3)
        return;
    p(n + 1);
    printf("%d ", n);
}

int main(void)
{
    p(1);
    printf("\\n");
    return 0;
}`,
              expected: "3 2 1",
              explanation: "The print happens after the recursive call, so values are printed while unwinding: 3 first, then 2, then 1.",
            },
          ],
        },
        {
          slug: "classic-recursive-problems",
          title: "Classic recursive problems",
          summary:
            "Apply recursion to Fibonacci numbers, sum of digits, powers and the greatest common divisor, and learn a reliable method for designing recursive functions.",
          estMinutes: 35,
          blocks: [
            {
              type: "objectives",
              items: [
                "Use a three-step method to design a recursive function",
                "Write recursive functions for Fibonacci numbers, digit sums, powers and GCD",
                "Recognise functions with more than one recursive call (tree recursion)",
                "Explain why naive recursive Fibonacci becomes slow",
              ],
            },
            {
              type: "markdown",
              md: `Designing a recursive function feels like magic at first, but there is a dependable recipe. Ask yourself three questions:

1. **What is the smallest version of the problem, and what is its answer?** That becomes the base case.
2. **How can I make the problem one step smaller?** (Subtract 1, drop the last digit, halve the exponent...)
3. **If I already had the answer to the smaller problem, how would I build the full answer?** That is the recursive case.

The key mental trick is to **trust the recursive call**. When you write \`sumDigits(n / 10)\`, do not try to trace every level in your head. Just assume it correctly returns the digit sum of the smaller number, and focus on combining it with the current step.`,
            },
            {
              type: "definition",
              term: "Leap of faith",
              md: "The habit of assuming the recursive call already works for the smaller input while writing the recursive case. If the base case is correct and each step is correct, the whole function is correct.",
            },
            {
              type: "heading",
              text: "Sum of digits",
              level: 2,
            },
            {
              type: "markdown",
              md: `For a non-negative integer \`n\`:

- \`n % 10\` gives the **last digit** (1234 % 10 = 4).
- \`n / 10\` **drops the last digit** using integer division (1234 / 10 = 123).

So the digit sum of 1234 is \`4 + digitSum(123)\`. The smallest problem is a number with no digits left, 0, whose digit sum is 0.`,
            },
            {
              type: "code",
              language: "c",
              title: "Sum and count of digits",
              code: `#include <stdio.h>

int sumDigits(int n)
{
    if (n == 0)
        return 0;
    return n % 10 + sumDigits(n / 10);
}

int countDigits(int n)
{
    if (n < 10)
        return 1;
    return 1 + countDigits(n / 10);
}

int main(void)
{
    printf("sumDigits(1234) = %d\\n", sumDigits(1234));
    printf("sumDigits(9045) = %d\\n", sumDigits(9045));
    printf("countDigits(1234) = %d\\n", countDigits(1234));
    printf("countDigits(7) = %d\\n", countDigits(7));
    return 0;
}`,
              runnable: true,
              output: `sumDigits(1234) = 10
sumDigits(9045) = 18
countDigits(1234) = 4
countDigits(7) = 1`,
              walkthrough: [
                { lines: "5-6", text: "Base case for the digit sum: once every digit has been removed, `n` is 0 and contributes nothing." },
                { lines: "7", text: "Take the last digit with `n % 10` and add the digit sum of the remaining digits `n / 10`." },
                { lines: "12-13", text: "For counting, a single-digit number (less than 10) has exactly one digit. This also makes `countDigits(0)` correctly return 1." },
                { lines: "14", text: "Every other number has one more digit than the number with its last digit removed." },
                { lines: "19-22", text: "Calls for a few test values. Trace sumDigits(1234): 4 + (3 + (2 + (1 + 0))) = 10." },
              ],
            },
            {
              type: "heading",
              text: "Power: x raised to n",
              level: 2,
            },
            {
              type: "markdown",
              md: `x⁰ = 1 for any x, and xⁿ = x × xⁿ⁻¹. That gives a simple recursive power function that makes *n* calls.

We can do much better with an observation: if *n* is even, xⁿ = (x^(n/2))². Computing x^(n/2) **once** and squaring it halves the problem at every step, so x¹⁰⁰⁰ takes only about 10 calls instead of 1000. This is called **fast exponentiation** or *exponentiation by squaring*.`,
            },
            {
              type: "code",
              language: "c",
              title: "Simple and fast recursive power",
              code: `#include <stdio.h>

long power(long x, int n)
{
    if (n == 0)
        return 1;
    return x * power(x, n - 1);
}

long fastPower(long x, int n)
{
    long half;
    if (n == 0)
        return 1;
    half = fastPower(x, n / 2);
    if (n % 2 == 0)
        return half * half;
    return x * half * half;
}

int main(void)
{
    printf("2^10 = %ld\\n", power(2, 10));
    printf("3^5  = %ld\\n", power(3, 5));
    printf("2^20 = %ld\\n", fastPower(2, 20));
    printf("5^0  = %ld\\n", fastPower(5, 0));
    return 0;
}`,
              runnable: true,
              output: `2^10 = 1024
3^5  = 243
2^20 = 1048576
5^0  = 1`,
              walkthrough: [
                { lines: "5-7", text: "Plain recursion: base case n == 0 returns 1; otherwise multiply x by x to the power n − 1." },
                { lines: "13-14", text: "Fast version uses the same base case." },
                { lines: "15", text: "Compute x^(n/2) **once** and store it in `half`. Calling `fastPower` twice here would throw away the whole speed advantage." },
                { lines: "16-18", text: "For even n the answer is half × half. For odd n, integer division lost one factor of x (e.g. 5/2 = 2), so we multiply it back in." },
              ],
            },
            {
              type: "heading",
              text: "Fibonacci numbers: two recursive calls",
              level: 2,
            },
            {
              type: "markdown",
              md: `The Fibonacci sequence starts 0, 1, 1, 2, 3, 5, 8, 13, ... where each number is the sum of the two before it:

- fib(0) = 0, fib(1) = 1 (two base cases)
- fib(n) = fib(n − 1) + fib(n − 2) for n ≥ 2

Because the recursive case calls the function **twice**, the calls form a branching tree rather than a straight line. This is called **tree recursion**.`,
            },
            {
              type: "syntax",
              language: "c",
              code: `int fib(int n)
{
    if (n < 2)                      /* base cases: fib(0)=0, fib(1)=1 */
        return n;
    return fib(n - 1) + fib(n - 2); /* two recursive calls */
}`,
            },
            {
              type: "code",
              language: "c",
              title: "Fibonacci and counting the calls",
              code: `#include <stdio.h>

int calls = 0;

int fib(int n)
{
    calls++;
    if (n < 2)
        return n;
    return fib(n - 1) + fib(n - 2);
}

int main(void)
{
    int n;
    for (n = 0; n <= 10; n++)
        printf("%d ", fib(n));
    printf("\\n");

    calls = 0;
    printf("fib(20) = %d\\n", fib(20));
    printf("calls needed: %d\\n", calls);
    return 0;
}`,
              runnable: true,
              output: `0 1 1 2 3 5 8 13 21 34 55
fib(20) = 6765
calls needed: 21891`,
              walkthrough: [
                { lines: "3", text: "A global counter so we can see how much work the recursion does. (Globals are covered properly in the storage-classes chapter.)" },
                { lines: "7", text: "Every time `fib` is entered, we count one call." },
                { lines: "8-9", text: "Two base cases in one test: when n is 0 or 1, fib(n) equals n itself." },
                { lines: "10", text: "Tree recursion: each call spawns two more calls (until a base case)." },
                { lines: "16-18", text: "Print the first 11 Fibonacci numbers." },
                { lines: "20-22", text: "Reset the counter and compute fib(20). It takes 21 891 calls, because the same smaller values are recomputed again and again." },
              ],
            },
            {
              type: "callout",
              variant: "warning",
              title: "Naive Fibonacci is exponential",
              md: "fib(5) calls fib(4) and fib(3); but fib(4) *also* calls fib(3). The repeated work snowballs: the number of calls grows roughly by a factor of 1.6 every time n increases by 1. fib(40) needs over 300 million calls. A simple loop computes the same value in 40 steps (see the next lesson).",
            },
            {
              type: "heading",
              text: "Greatest common divisor (Euclid's algorithm)",
              level: 3,
            },
            {
              type: "markdown",
              md: `One of the oldest algorithms in existence is naturally recursive: **gcd(a, b) = gcd(b, a % b)**, and **gcd(a, 0) = a**. For example gcd(48, 18) = gcd(18, 12) = gcd(12, 6) = gcd(6, 0) = 6.

\`\`\`c
int gcd(int a, int b)
{
    if (b == 0)
        return a;
    return gcd(b, a % b);
}
\`\`\`

Notice that the recursive call is the **very last thing** the function does — nothing is left to compute after it returns. Such a call is called a **tail call**, and it is easy to turn into a loop.`,
            },
            {
              type: "definition",
              term: "Tail recursion",
              md: "Recursion where the recursive call is the final action of the function (its result is returned unchanged). `gcd` is tail-recursive; `factorial` is not, because it still multiplies by n after the call returns.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `Each function here shrinks its input in a way that **must** reach the base case: \`n / 10\` eventually becomes 0, \`n - 1\` or \`n / 2\` eventually becomes 0, \`n - 1\` and \`n - 2\` eventually drop below 2, and in Euclid's algorithm \`a % b\` is always smaller than \`b\`, so the second argument decreases to 0. Combine that with a correct base case and a correct combining step, and the function is correct for every valid input.`,
            },
            {
              type: "heading",
              text: "Real-world applications",
              level: 2,
            },
            {
              type: "markdown",
              md: `- **Fast exponentiation** is used in cryptography (RSA raises huge numbers to huge powers modulo a third number).
- **GCD** is used to simplify fractions and in many number-theory and cryptographic algorithms.
- **Digit processing** shows up in check-digit validation (ISBNs, credit card Luhn checks) and number formatting.
- Recognising the **repeated-work problem** in Fibonacci leads to *memoisation* and *dynamic programming*, core ideas in algorithm design.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Only one base case for Fibonacci",
                  wrong: `int fib(int n)
{
    if (n == 0) return 0;
    return fib(n - 1) + fib(n - 2);  /* fib(1) calls fib(-1)! */
}`,
                  right: `int fib(int n)
{
    if (n < 2) return n;
    return fib(n - 1) + fib(n - 2);
}`,
                  md: "With two recursive calls reaching back two steps, you need base cases for both 0 and 1. Otherwise fib(1) calls fib(-1), which never reaches 0.",
                },
                {
                  title: "Calling the recursive function twice when once is enough",
                  wrong: `return fastPower(x, n / 2) * fastPower(x, n / 2);`,
                  right: `half = fastPower(x, n / 2);
return half * half;`,
                  md: "Both calls compute the same value. Store it once in a variable; otherwise the 'fast' power does as much work as the slow one.",
                },
                {
                  title: "Using sumDigits on negative numbers",
                  wrong: `printf("%d\\n", sumDigits(-123));   /* returns -6 */`,
                  right: `int n = -123;
if (n < 0) n = -n;
printf("%d\\n", sumDigits(n));      /* 6 */`,
                  md: "In C, `%` with a negative left operand gives a negative remainder (-123 % 10 is -3). Convert to a positive value first if you want the usual digit sum.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "fib(n) needs two base cases (n = 0 and n = 1) because it recurses on n − 1 and n − 2.",
                "n % 10 extracts the last digit; n / 10 removes it — the standard recursive digit pattern.",
                "Fast exponentiation computes x^(n/2) once and squares it, using O(log n) calls.",
                "A tail call is the last action of a function; gcd(b, a % b) is a classic tail-recursive example.",
                "Naive recursive Fibonacci recomputes the same values and grows exponentially in time.",
              ],
            },
            {
              type: "recap",
              items: [
                "Design recipe: smallest case → how to shrink → how to combine.",
                "Trust the recursive call while writing the recursive case.",
                "Tree recursion (two or more calls) can repeat work dramatically.",
                "Euclid: gcd(a, 0) = a; gcd(a, b) = gcd(b, a % b).",
              ],
            },
            {
              type: "exercise",
              id: "c13-ex-reverse-digits",
              kind: "write",
              title: "Print digits in reverse",
              prompt: "Write a recursive function `void printReverse(int n)` that prints the digits of a positive integer from last to first, followed by nothing else. In `main`, call `printReverse(4071)` and then print a newline. The output should be `1704`.",
              hint: "Print `n % 10` first, then recurse on `n / 10` if it is not zero.",
              solutionCode: `#include <stdio.h>

void printReverse(int n)
{
    printf("%d", n % 10);
    if (n / 10 != 0)
        printReverse(n / 10);
}

int main(void)
{
    printReverse(4071);
    printf("\\n");
    return 0;
}`,
              expectedOutput: "1704",
            },
            {
              type: "exercise",
              id: "c13-ex-debug-power",
              kind: "debug",
              title: "Fix the power function",
              prompt: "This function is meant to compute `base` to the power `exp` but it crashes. Find and fix the bug.",
              starterCode: `int power(int base, int exp)
{
    if (exp == 1)
        return base;
    return base * power(base, exp - 1);
}
/* power(7, 0) crashes */`,
              hint: "What happens when exp starts at 0?",
              solution: "The only base case is `exp == 1`, so `power(7, 0)` calls power(7, -1), power(7, -2), ... forever. Use `if (exp == 0) return 1;` as the base case, which handles 0 and still works for every positive exponent.",
            },
            {
              type: "exercise",
              id: "c13-ex-predict-gcd",
              kind: "predict",
              title: "Trace Euclid",
              prompt: "Write down every call made by `gcd(84, 36)` and the final answer.",
              hint: "Replace (a, b) with (b, a % b) until b is 0.",
              solution: "gcd(84, 36) → gcd(36, 12) → gcd(12, 0) → returns 12. The answer is 12.",
            },
          ],
          practice: [
            {
              type: "OUTPUT_PREDICTION",
              slug: "c13-predict-mystery",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

int mystery(int n)
{
    if (n == 0)
        return 0;
    return (n % 10) * (n % 10) + mystery(n / 10);
}

int main(void)
{
    printf("%d\\n", mystery(123));
    return 0;
}`,
              expected: "14",
              explanation: "It sums the squares of the digits: 9 + 4 + 1 = 14.",
            },
            {
              type: "MCQ",
              slug: "c13-fib-base-mcq",
              prompt: "Why does `int fib(int n) { if (n == 0) return 0; return fib(n-1) + fib(n-2); }` fail for n = 1?",
              options: [
                { id: "a", text: "Because fib(1) calls fib(0) and fib(-1), and fib(-1) never reaches the base case" },
                { id: "b", text: "Because C does not allow a function to call itself twice" },
                { id: "c", text: "Because the return type should be long" },
                { id: "d", text: "Because fib(0) should return 1" },
              ],
              correct: "a",
              explanation: "Recursing on n − 2 can skip over 0, so a second base case for n = 1 is required.",
            },
            {
              type: "FILL_BLANK",
              slug: "c13-last-digit-fill",
              prompt: "For a positive int `n`, the expression `n ___ 10` gives its last digit, and `n / 10` removes the last digit.",
              accepted: [["%"]],
              explanation: "The remainder after division by 10 is the last decimal digit.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c13-tail-tf",
              prompt: "In `return n * factorial(n - 1);` the recursive call is a tail call.",
              correct: false,
              explanation: "After factorial(n - 1) returns, the multiplication by n still has to happen, so it is not the last action.",
            },
            {
              type: "CODE_WRITING",
              slug: "c13-code-sum-digits",
              prompt: "Read a non-negative integer `n` from standard input and print the sum of its digits. You **must** compute the sum with a recursive function `int sumDigits(int n)` (no loops in that function).\n\nExample: input `1234` → output `10`.",
              starterCode: `#include <stdio.h>

int sumDigits(int n)
{
    /* your recursive code here */
}

int main(void)
{
    int n;
    scanf("%d", &n);
    printf("%d\\n", sumDigits(n));
    return 0;
}`,
              sampleTests: [
                { stdin: "1234", expected: "10" },
                { stdin: "9", expected: "9" },
              ],
              hiddenTests: [
                { stdin: "0", expected: "0" },
                { stdin: "99999", expected: "45" },
                { stdin: "1000001", expected: "2" },
              ],
              solutionCode: `#include <stdio.h>

int sumDigits(int n)
{
    if (n == 0)
        return 0;
    return n % 10 + sumDigits(n / 10);
}

int main(void)
{
    int n;
    scanf("%d", &n);
    printf("%d\\n", sumDigits(n));
    return 0;
}`,
              explanation: "Base case: 0 has digit sum 0. Recursive case: last digit plus the digit sum of the rest.",
            },
          ],
        },
      ],
    },
    {
      slug: "recursion-or-loops",
      title: "Recursion versus iteration",
      lessons: [
        {
          slug: "recursion-vs-iteration",
          title: "Choosing between recursion and loops; stack overflow",
          summary:
            "Convert recursive functions to loops and back, compare their costs, understand stack overflow, and learn when each style is the better choice.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Rewrite a simple recursive function as an equivalent loop",
                "Compare recursion and iteration in terms of memory, speed and clarity",
                "Explain what causes a stack overflow and how to avoid it",
                "Decide which approach suits a given problem",
              ],
            },
            {
              type: "markdown",
              md: `Anything you can do with recursion you can also do with a loop, and vice versa. The two styles are just different ways of repeating work:

- A **loop** repeats by jumping back to the top of its body, updating variables in place.
- **Recursion** repeats by making a new function call, creating a fresh stack frame each time.

Think of climbing down a staircase. Iteration is walking down the stairs one by one. Recursion is asking a friend on the step below to finish the job and report back — who asks a friend on the next step, and so on. Both get to the bottom, but recursion leaves a chain of friends waiting for answers.`,
            },
            {
              type: "definition",
              term: "Iteration",
              md: "Repeating a block of code with a loop (`for`, `while`, `do-while`). Uses a fixed amount of memory regardless of how many repetitions occur.",
            },
            {
              type: "definition",
              term: "Stack overflow",
              md: "A runtime failure that happens when the call stack runs out of space, typically caused by recursion that is infinite or simply too deep. The program usually crashes (for example with a *segmentation fault*).",
            },
            {
              type: "code",
              language: "c",
              title: "Factorial both ways",
              code: `#include <stdio.h>

long factRec(int n)
{
    if (n <= 1)
        return 1;
    return n * factRec(n - 1);
}

long factIter(int n)
{
    long result = 1;
    int i;
    for (i = 2; i <= n; i++)
        result *= i;
    return result;
}

int main(void)
{
    int n;
    for (n = 1; n <= 10; n += 3)
        printf("n=%2d  recursive=%8ld  iterative=%8ld\\n", n, factRec(n), factIter(n));
    return 0;
}`,
              runnable: true,
              output: `n= 1  recursive=       1  iterative=       1
n= 4  recursive=      24  iterative=      24
n= 7  recursive=    5040  iterative=    5040
n=10  recursive= 3628800  iterative= 3628800`,
              walkthrough: [
                { lines: "3-8", text: "The recursive version mirrors the mathematical definition. It uses n stack frames." },
                { lines: "10-17", text: "The iterative version keeps a running product in `result` and multiplies by 2, 3, ..., n. It uses one frame and two variables, no matter how big n is." },
                { lines: "22-23", text: "Both functions are called for n = 1, 4, 7, 10 and the results are printed side by side with field widths for alignment." },
              ],
            },
            {
              type: "markdown",
              md: `### A recipe for turning simple recursion into a loop

For a recursive function that makes **one** call on a smaller input:

1. The **base case** value becomes the loop's *starting value* (e.g. \`result = 1\`).
2. The **recursive step** becomes the loop body (\`result *= i\`).
3. The input that was **shrinking** becomes the loop variable.

Tail-recursive functions are the easiest: the parameters simply become variables that the loop updates.`,
            },
            {
              type: "code",
              language: "c",
              title: "Fibonacci and GCD without recursion",
              code: `#include <stdio.h>

int fibIter(int n)
{
    int prev = 0, curr = 1, next, i;
    if (n == 0)
        return 0;
    for (i = 2; i <= n; i++) {
        next = prev + curr;
        prev = curr;
        curr = next;
    }
    return curr;
}

int gcdIter(int a, int b)
{
    int r;
    while (b != 0) {
        r = a % b;
        a = b;
        b = r;
    }
    return a;
}

int main(void)
{
    printf("fib(20) = %d\\n", fibIter(20));
    printf("fib(40) = %d\\n", fibIter(40));
    printf("gcd(48, 18) = %d\\n", gcdIter(48, 18));
    return 0;
}`,
              runnable: true,
              output: `fib(20) = 6765
fib(40) = 102334155
gcd(48, 18) = 6`,
              walkthrough: [
                { lines: "5", text: "Instead of recomputing, we remember only the last two Fibonacci numbers." },
                { lines: "8-12", text: "Each pass slides the window forward: the new number is the sum of the previous two. fib(40) takes 39 passes instead of hundreds of millions of calls." },
                { lines: "19-23", text: "Euclid's tail recursion `gcd(b, a % b)` becomes a loop that replaces (a, b) with (b, a % b) until b is 0." },
                { lines: "29-31", text: "The results match the recursive versions, but run instantly." },
              ],
            },
            {
              type: "table",
              caption: "Recursion versus iteration",
              headers: ["Aspect", "Recursion", "Iteration"],
              rows: [
                ["How it repeats", "Function calls itself", "Loop jumps back"],
                ["Stopping condition", "Base case", "Loop condition becomes false"],
                ["Memory", "One stack frame per active call (grows with depth)", "Constant — just the loop variables"],
                ["Speed", "Slight overhead per call", "Usually a little faster"],
                ["Risk", "Stack overflow if too deep or infinite", "Infinite loop (program hangs, does not crash)"],
                ["Best for", "Tree-shaped or divide-and-conquer problems", "Simple counting and linear processing"],
              ],
            },
            {
              type: "heading",
              text: "Stack overflow",
              level: 2,
            },
            {
              type: "markdown",
              md: `The call stack is not infinite. On a typical desktop system it is around 1–8 MB. If each frame takes, say, 48 bytes, a recursion depth of a few hundred thousand can fill it. When the stack is full, the next call writes past its end and the operating system stops the program.

\`\`\`c
int sumTo(int n)
{
    if (n == 0) return 0;
    return n + sumTo(n - 1);
}
/* sumTo(100) is fine. sumTo(10000000) will very likely crash. */
\`\`\`

The exact limit depends on the system, compiler and settings, so you **cannot** predict the precise depth at which a crash happens. That is why deep linear recursions (one call per element of a million-item list) are usually written as loops in C.`,
            },
            {
              type: "callout",
              variant: "note",
              title: "Infinite loop vs infinite recursion",
              md: "An infinite *loop* just keeps running (you stop it with Ctrl+C). Infinite *recursion* uses more memory with every call, so it soon crashes. Both are bugs, but the symptoms differ.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `Recursion and loops are equally powerful because a loop's variables can store whatever the stack frames would have stored. In factorial, the waiting frames each hold one number to multiply by later; a loop can just multiply immediately and keep a running product. When the work to do *after* the recursive call is complex (for example, processing both halves of a tree), simulating it with a loop needs an explicit stack data structure, which is why recursion is clearer for such problems.`,
            },
            {
              type: "heading",
              text: "Choosing in practice",
              level: 2,
            },
            {
              type: "markdown",
              md: `- Prefer **iteration** for simple counting, summing arrays, reading input until end-of-file, or anything that could go a million steps deep.
- Prefer **recursion** when the problem is naturally self-similar and the depth stays small: traversing directory trees, binary search, merge sort, quicksort, generating permutations, solving puzzles like the Towers of Hanoi.
- Embedded systems and safety-critical code (cars, aircraft, medical devices) often **ban** recursion, because their stacks are tiny and the maximum stack usage must be proved in advance.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Using recursion for very deep linear work",
                  wrong: `long sumTo(long n)
{
    if (n == 0) return 0;
    return n + sumTo(n - 1);
}
/* sumTo(5000000) — likely stack overflow */`,
                  right: `long sumTo(long n)
{
    long s = 0, i;
    for (i = 1; i <= n; i++)
        s += i;
    return s;
}`,
                  md: "One frame per step means millions of frames. A loop does the same job in constant memory.",
                },
                {
                  title: "Getting the loop's starting value wrong when converting",
                  wrong: `long result = 0;           /* product starts at 0 */
for (i = 2; i <= n; i++)
    result *= i;            /* always 0 */`,
                  right: `long result = 1;           /* base case value */
for (i = 2; i <= n; i++)
    result *= i;`,
                  md: "The starting value of the accumulator should be the base case value: 1 for products, 0 for sums.",
                },
                {
                  title: "Assuming recursion is always slower and avoiding it everywhere",
                  wrong: "Writing a 60-line loop with a hand-made stack to walk a tree.",
                  right: "Writing a 6-line recursive tree walk, since tree depth is small.",
                  md: "When the recursion depth is small (like log n for balanced splits), the overhead is negligible and recursive code is far easier to read and get right.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "Every recursive solution can be rewritten iteratively and vice versa.",
                "Recursion uses one stack frame per active call; iteration uses constant extra memory.",
                "Stack overflow is caused by recursion that is infinite or too deep; the exact limit is system-dependent.",
                "Tail-recursive functions convert directly into loops.",
                "Recursion is preferred for naturally recursive structures (trees, divide-and-conquer).",
              ],
            },
            {
              type: "recap",
              items: [
                "Loops repeat with jumps; recursion repeats with calls.",
                "Base case value → loop's initial value; recursive step → loop body.",
                "Iterative Fibonacci keeps the last two values and runs in linear time.",
                "Choose iteration for deep or simple repetition, recursion for self-similar problems.",
              ],
            },
            {
              type: "exercise",
              id: "c13-ex-sum-iter",
              kind: "write",
              title: "From recursion to a loop",
              prompt: "Convert this recursive function into an equivalent iterative function `int sumDigitsIter(int n)` and print `sumDigitsIter(98765)` from `main`.\n\n```c\nint sumDigits(int n) { if (n == 0) return 0; return n % 10 + sumDigits(n / 10); }\n```",
              hint: "Start with `sum = 0` (the base case value) and loop `while (n != 0)`.",
              solutionCode: `#include <stdio.h>

int sumDigitsIter(int n)
{
    int sum = 0;
    while (n != 0) {
        sum += n % 10;
        n /= 10;
    }
    return sum;
}

int main(void)
{
    printf("%d\\n", sumDigitsIter(98765));
    return 0;
}`,
              expectedOutput: "35",
            },
            {
              type: "exercise",
              id: "c13-ex-concept-choose",
              kind: "concept",
              title: "Which would you choose?",
              prompt: "For each task, say whether you would use recursion or a loop in C, and give one reason: (a) summing 10 million numbers read from a file; (b) printing every file in a folder and all its sub-folders; (c) computing gcd(a, b).",
              hint: "Think about depth and the shape of the problem.",
              solution: "(a) A loop: recursion would need 10 million frames and overflow the stack. (b) Recursion: folders are a tree and their depth is small, so 'list this folder, then recurse into each sub-folder' is natural. (c) Either works; the recursion depth is tiny (logarithmic), but since it is tail-recursive a simple while loop is just as clear.",
            },
            {
              type: "exercise",
              id: "c13-ex-predict-hanoi",
              kind: "predict",
              title: "Towers of Hanoi moves",
              prompt: "The Towers of Hanoi is a famous recursive puzzle. Predict the output of this program, which counts the moves needed for 1 to 5 disks.",
              starterCode: `#include <stdio.h>

int moves(int disks)
{
    if (disks == 0)
        return 0;
    return 2 * moves(disks - 1) + 1;
}

int main(void)
{
    int d;
    for (d = 1; d <= 5; d++)
        printf("%d ", moves(d));
    printf("\\n");
    return 0;
}`,
              hint: "moves(1) = 1, moves(2) = 2·1 + 1 = 3, ...",
              solution: "Each value is twice the previous plus one: 1, 3, 7, 15, 31 (that is, 2^d − 1).",
              solutionCode: `#include <stdio.h>

int moves(int disks)
{
    if (disks == 0)
        return 0;
    return 2 * moves(disks - 1) + 1;
}

int main(void)
{
    int d;
    for (d = 1; d <= 5; d++)
        printf("%d ", moves(d));
    printf("\\n");
    return 0;
}`,
              expectedOutput: "1 3 7 15 31",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c13-memory-mcq",
              prompt: "Which statement about memory use is correct?",
              options: [
                { id: "a", text: "A loop that runs n times needs n stack frames" },
                { id: "b", text: "A linear recursion n calls deep has up to n stack frames active at once" },
                { id: "c", text: "Recursion never uses the stack" },
                { id: "d", text: "Recursion and iteration always use exactly the same amount of memory" },
              ],
              correct: "b",
              explanation: "Every unfinished call keeps its frame on the stack, so depth n means n frames. A loop uses one frame.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c13-convert-tf",
              prompt: "Every recursive function can be rewritten using loops (possibly with an explicit stack data structure).",
              correct: true,
              explanation: "Recursion and iteration are equally expressive.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c13-predict-iter-fib",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

int main(void)
{
    int a = 0, b = 1, t, i;
    for (i = 0; i < 7; i++) {
        printf("%d ", a);
        t = a + b;
        a = b;
        b = t;
    }
    printf("\\n");
    return 0;
}`,
              expected: "0 1 1 2 3 5 8",
              explanation: "The loop prints the first 7 Fibonacci numbers by sliding the pair (a, b) forward.",
            },
            {
              type: "FILL_BLANK",
              slug: "c13-tail-fill",
              prompt: "A recursive call that is the very last action of a function is called a ___ call, and it is easy to convert into a loop.",
              accepted: [["tail"]],
            },
          ],
        },
      ],
    },
  ],
};

export default chapter;
