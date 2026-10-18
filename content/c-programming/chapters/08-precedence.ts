import type { ChapterContent } from "../../../src/lib/content/schema";

const chapter: ChapterContent = {
  slug: "precedence",
  title: "Operator Precedence and Evaluation",
  summary:
    "How C decides which operator applies first: precedence, associativity, evaluating expressions step by step, using parentheses for clarity, and why expressions like i = i++ are undefined.",
  topics: [
    {
      slug: "precedence-and-associativity",
      title: "Precedence and associativity",
      lessons: [
        {
          slug: "precedence-associativity-rules",
          title: "Precedence, associativity and the precedence table",
          summary:
            "Learn how C groups operators in an expression using precedence levels and associativity, read the precedence table, and use parentheses to make intent clear.",
          estMinutes: 25,
          blocks: [
            {
              type: "objectives",
              items: [
                "Explain what precedence and associativity mean",
                "Read the C precedence table and apply it to group an expression",
                "Distinguish left-to-right from right-to-left associativity with examples",
                "Use parentheses to override precedence and to make code clearer",
              ],
            },
            {
              type: "markdown",
              md: `## Who goes first?

In school maths you learned that \`2 + 3 × 4\` is 14, not 20, because multiplication is done before addition. C has the same idea, but with many more operators, so it needs a precise rulebook. That rulebook has two parts:

1. **Precedence** decides which operator *binds more tightly* when different operators meet. \`*\` has higher precedence than \`+\`, so \`2 + 3 * 4\` groups as \`2 + (3 * 4)\`.
2. **Associativity** decides how operators of the *same* precedence group. \`-\` is left-associative, so \`20 - 6 - 4\` groups as \`(20 - 6) - 4\` = 10, not \`20 - (6 - 4)\` = 18.

Think of precedence as the "rank" of an operator and associativity as the tie-breaker when two operators have the same rank.`,
            },
            {
              type: "definition",
              term: "Precedence",
              md: "The priority of an operator. Operators with higher precedence are grouped with their operands before operators with lower precedence.",
            },
            {
              type: "definition",
              term: "Associativity",
              md: "The direction in which operators of equal precedence are grouped: **left-to-right** (`a - b - c` means `(a - b) - c`) or **right-to-left** (`a = b = c` means `a = (b = c)`).",
            },
            {
              type: "table",
              caption: "C operator precedence, from highest (1) to lowest (15)",
              headers: ["Level", "Operators", "Description", "Associativity"],
              rows: [
                ["1", "()  []  ->  .  x++  x--", "function call, subscript, member access, postfix", "left to right"],
                ["2", "++x  --x  +  -  !  ~  (type)  *  &  sizeof", "unary operators", "right to left"],
                ["3", "*  /  %", "multiplicative", "left to right"],
                ["4", "+  -", "additive", "left to right"],
                ["5", "<<  >>", "shift", "left to right"],
                ["6", "<  <=  >  >=", "relational", "left to right"],
                ["7", "==  !=", "equality", "left to right"],
                ["8", "&", "bitwise AND", "left to right"],
                ["9", "^", "bitwise XOR", "left to right"],
                ["10", "|", "bitwise OR", "left to right"],
                ["11", "&&", "logical AND", "left to right"],
                ["12", "||", "logical OR", "left to right"],
                ["13", "?:", "conditional", "right to left"],
                ["14", "=  +=  -=  *=  /=  %=  &=  ^=  |=  <<=  >>=", "assignment", "right to left"],
                ["15", ",", "comma", "left to right"],
              ],
            },
            {
              type: "callout",
              variant: "tip",
              title: "A memory aid",
              md: "Roughly: **unary > arithmetic > shift > relational > equality > bitwise > logical > conditional > assignment > comma**. Arithmetic before comparison, comparison before logic, and assignment almost last, so that `x = a + b > c && d` computes everything on the right before storing.",
            },
            {
              type: "code",
              language: "c",
              title: "Precedence and left-to-right associativity",
              runnable: true,
              code: `#include <stdio.h>

int main(void)
{
    int a = 2 + 3 * 4;
    int b = (2 + 3) * 4;
    int c = 20 - 6 - 4;
    int d = 20 / 5 * 2;
    int e = 17 % 5 * 3;

    printf("a = %d\\n", a);
    printf("b = %d\\n", b);
    printf("c = %d\\n", c);
    printf("d = %d\\n", d);
    printf("e = %d\\n", e);
    return 0;
}`,
              output: `a = 14
b = 20
c = 10
d = 8
e = 6`,
              walkthrough: [
                { lines: "5", text: "`*` outranks `+`: 3 * 4 = 12 first, then 2 + 12 = 14." },
                { lines: "6", text: "Parentheses override precedence: 2 + 3 = 5 first, then 5 * 4 = 20." },
                { lines: "7", text: "Both operators are `-` (same level), so left-to-right: (20 - 6) - 4 = 10." },
                { lines: "8", text: "`/` and `*` share a level, so left-to-right: (20 / 5) * 2 = 8, not 20 / (5 * 2) = 2." },
                { lines: "9", text: "`%` is on the same level as `*`: (17 % 5) * 3 = 2 * 3 = 6." },
                { lines: "11-15", text: "Print each result." },
              ],
            },
            {
              type: "heading",
              text: "Right-to-left associativity",
              level: 2,
            },
            {
              type: "markdown",
              md: `Three groups associate **right to left**: the unary operators, the conditional operator \`?:\`, and the assignment operators.

- \`x = y = z = 7\` groups as \`x = (y = (z = 7))\`. The innermost assignment stores 7 in \`z\` and has the value 7, which is stored in \`y\`, and so on.
- \`-!x\` groups as \`-(!x)\`: the operator nearest the operand applies first.
- \`a ? b : c ? d : e\` groups as \`a ? b : (c ? d : e)\`, which lets you chain conditional choices.`,
            },
            {
              type: "code",
              language: "c",
              title: "Mixing operator families",
              runnable: true,
              code: `#include <stdio.h>

int main(void)
{
    int x, y, z;
    int p = 5, q = 10;

    x = y = z = 7;
    printf("x=%d y=%d z=%d\\n", x, y, z);
    printf("%d\\n", p < q == 1);
    printf("%d\\n", p > 3 || q < 5 && q > 20);
    printf("%d\\n", -p * 2);
    printf("%d\\n", !p + 1);
    printf("%d\\n", (p & 4) == 4);
    return 0;
}`,
              output: `x=7 y=7 z=7
1
1
-10
1
1`,
              walkthrough: [
                { lines: "8", text: "Assignment is right-associative: z gets 7, then y gets the value of (z = 7), then x." },
                { lines: "10", text: "Relational `<` outranks equality `==`: (p < q) == 1 → 1 == 1 → 1. Legal, but hard to read; prefer explicit parentheses." },
                { lines: "11", text: "`&&` outranks `||`, so this is p > 3 || (q < 5 && q > 20). The left side is already true, so the result is 1." },
                { lines: "12", text: "Unary minus binds tighter than `*`: (-5) * 2 = -10." },
                { lines: "13", text: "`!` is unary, so it binds before `+`: (!5) + 1 = 0 + 1 = 1." },
                { lines: "14", text: "Without the parentheses, `p & 4 == 4` would mean p & (4 == 4) = 5 & 1 = 1 by luck. The parentheses make the intended test explicit." },
              ],
            },
            {
              type: "heading",
              text: "Parentheses for clarity",
              level: 2,
            },
            {
              type: "syntax",
              language: "c",
              code: `( expression )

/* grouping overrides precedence and associativity */
result = (a + b) * c;
ok     = (flags & MASK) != 0;
both   = (x > 0) && (y > 0);`,
              md: "A parenthesised expression is evaluated as a single operand of the operator around it, whatever that operator's precedence.",
            },
            {
              type: "markdown",
              md: `Parentheses always win. They cost nothing at run time, and they make your intention obvious to the reader (and to your future self). Good practice:

- Always parenthesise when mixing **bitwise** operators with comparisons: \`(flags & MASK) != 0\`.
- Parenthesise mixed \`&&\` and \`||\`: \`(a && b) || c\`.
- Do **not** over-parenthesise simple arithmetic: \`a + b * c\` is universally understood.

A professional rule of thumb: if you need to look at the table to be sure, add parentheses.`,
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `When the compiler reads an expression it builds a **parse tree**: each operator becomes a node whose children are its operands. Precedence and associativity are simply the rules for building that tree from a flat line of tokens. Once the tree exists, the value is computed from the leaves upward. Parentheses force a particular sub-tree, which is why they override everything else.

For \`2 + 3 * 4\` the tree has \`+\` at the root, with \`2\` on the left and the sub-tree \`3 * 4\` on the right.`,
            },
            {
              type: "heading",
              text: "Real-world uses",
              level: 2,
            },
            {
              type: "markdown",
              md: `- **Formulas:** converting Fahrenheit to Celsius needs \`(f - 32) * 5 / 9\`; without the parentheses you get \`f - 160 / 9\`.
- **Flag checks** in systems code: \`if ((status & ERROR_BIT) != 0)\`.
- **Code review:** many style guides (and compiler warnings like \`-Wparentheses\`) require explicit parentheses around mixed \`&&\`/\`||\` and bitwise tests because they are frequent sources of bugs.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Forgetting parentheses in a formula",
                  wrong: `celsius = f - 32 * 5 / 9;`,
                  right: `celsius = (f - 32) * 5 / 9;`,
                  md: "`*` and `/` bind before `-`, so the wrong version subtracts 32 * 5 / 9 (= 17) from f.",
                },
                {
                  title: "Bitwise AND inside a comparison",
                  wrong: `if (x & 1 == 0)   /* means x & (1 == 0), i.e. x & 0 */`,
                  right: `if ((x & 1) == 0)`,
                  md: "Equality operators outrank `&`, `^` and `|`. The wrong version is always false.",
                },
                {
                  title: "Assuming && and || have equal precedence",
                  wrong: `if (a || b && c)   /* means a || (b && c) */`,
                  right: `if ((a || b) && c)   /* if that is what you meant */`,
                  md: "`&&` binds tighter than `||`. Write the parentheses that express your intent.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "Unary > multiplicative (* / %) > additive (+ -) > shift > relational > equality > & > ^ > | > && > || > ?: > assignment > comma.",
                "Unary, conditional and assignment operators are right-to-left; almost everything else is left-to-right.",
                "a - b - c = (a - b) - c, and a / b * c = (a / b) * c.",
                "x = y = 0 works because assignment is right-associative and yields the stored value.",
                "== binds tighter than &, so write (x & m) == m.",
              ],
            },
            {
              type: "recap",
              items: [
                "Precedence chooses between different operators; associativity breaks ties at the same level.",
                "Parentheses override both and improve readability.",
                "The compiler turns an expression into a tree using these rules, then evaluates it.",
              ],
            },
            {
              type: "exercise",
              id: "c08-ex-predict-precedence",
              kind: "predict",
              title: "Group, then evaluate",
              prompt: "Predict the output.\n\n```c\n#include <stdio.h>\n\nint main(void)\n{\n    int a = 6, b = 4, c = 2;\n    printf(\"%d\\n\", a + b * c);\n    printf(\"%d\\n\", a / b * c);\n    printf(\"%d\\n\", a - b - c);\n    printf(\"%d\\n\", a > b && b > c);\n    printf(\"%d\\n\", a % b + c * 3);\n    return 0;\n}\n```",
              hint: "Add the parentheses the compiler would add, then evaluate.",
              solution: "6 + (4*2) = 14; (6/4)*2 = 1*2 = 2; (6-4)-2 = 0; (6>4) && (4>2) = 1; (6%4) + (2*3) = 2 + 6 = 8.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int a = 6, b = 4, c = 2;
    printf("%d\\n", a + b * c);
    printf("%d\\n", a / b * c);
    printf("%d\\n", a - b - c);
    printf("%d\\n", a > b && b > c);
    printf("%d\\n", a % b + c * 3);
    return 0;
}`,
              expectedOutput: `14
2
0
1
8`,
            },
            {
              type: "exercise",
              id: "c08-ex-debug-celsius",
              kind: "debug",
              title: "Fix the temperature formula",
              prompt: "This should print `100.0` but prints something else. Fix it.",
              starterCode: `#include <stdio.h>

int main(void)
{
    double f = 212;
    double c = f - 32 * 5 / 9.0;
    printf("%.1f\\n", c);
    return 0;
}`,
              hint: "Which operation happens first in f - 32 * 5 / 9.0?",
              solution: "Multiplication and division bind before subtraction, so the program computes 212 - 17.78 = 194.2. Parenthesise the subtraction: (f - 32) * 5 / 9.0.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    double f = 212;
    double c = (f - 32) * 5 / 9.0;
    printf("%.1f\\n", c);
    return 0;
}`,
              expectedOutput: "100.0",
            },
            {
              type: "exercise",
              id: "c08-ex-concept-parenthesise",
              kind: "concept",
              title: "Add the compiler's parentheses",
              prompt: "Fully parenthesise each expression the way the compiler groups it:\n\n1. `a + b * c - d`\n2. `x = y += 2`\n3. `!a && b || c`\n4. `a < b == c > d`",
              solution: "1. `(a + (b * c)) - d`\n2. `x = (y += 2)` (assignments are right-to-left)\n3. `((!a) && b) || c`\n4. `(a < b) == (c > d)` (relational binds tighter than equality)",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c08-precedence-mcq-1",
              prompt: "What is the value of `10 - 4 / 2 * 3`?",
              options: [
                { id: "a", text: "9" },
                { id: "b", text: "1" },
                { id: "c", text: "4" },
                { id: "d", text: "6" },
              ],
              correct: "c",
              explanation: "/ and * bind first, left to right: 4 / 2 = 2, 2 * 3 = 6. Then 10 - 6 = 4.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c08-assoc-tf",
              prompt: "The assignment operator `=` is right-associative, so `a = b = 5` assigns 5 to b first and then to a.",
              correct: true,
              explanation: "a = b = 5 groups as a = (b = 5).",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c08-mixed-output",
              prompt: "What does this print?",
              code: `#include <stdio.h>

int main(void)
{
    int a = 3, b = 5, c = 7;
    printf("%d\\n", a + b * c % 4);
    printf("%d\\n", a < b || b > c && c == 0);
    printf("%d\\n", (a + b) * (c - a) / 2);
    return 0;
}`,
              expected: "6\n1\n16",
              explanation: "b * c % 4 = 35 % 4 = 3, plus 3 = 6. && binds first, but a < b is already true, so 1. 8 * 4 / 2 = 16.",
            },
            {
              type: "FILL_BLANK",
              slug: "c08-higher-fill",
              prompt: "Between `&&` and `||`, the operator with higher precedence is ___ .",
              accepted: [["&&"]],
              explanation: "&& binds tighter than ||, just as multiplication binds tighter than addition.",
            },
            {
              type: "CODE_WRITING",
              slug: "c08-fahrenheit-celsius",
              prompt:
                "Read an integer temperature in Fahrenheit and print the Celsius value with one decimal place using the formula C = (F - 32) × 5 / 9. For input `212` print `100.0`. Be careful with both precedence and integer division.",
              starterCode: `#include <stdio.h>

int main(void)
{
    int f;
    scanf("%d", &f);
    /* compute and print celsius */
    return 0;
}`,
              sampleTests: [
                { stdin: "212", expected: "100.0" },
                { stdin: "32", expected: "0.0" },
              ],
              hiddenTests: [
                { stdin: "98", expected: "36.7" },
                { stdin: "-40", expected: "-40.0" },
                { stdin: "0", expected: "-17.8" },
              ],
              solutionCode: `#include <stdio.h>

int main(void)
{
    int f;
    scanf("%d", &f);
    double c = (f - 32) * 5 / 9.0;
    printf("%.1f\\n", c);
    return 0;
}`,
              explanation: "Parentheses make the subtraction happen first; dividing by 9.0 forces floating-point division so the fraction is kept.",
            },
          ],
        },
      ],
    },
    {
      slug: "evaluating-expressions",
      title: "Evaluating expressions",
      lessons: [
        {
          slug: "expression-evaluation-sequence-points",
          title: "Step-by-step evaluation and sequence points",
          summary:
            "Evaluate complex expressions step by step, including mixed int/double arithmetic, and learn the difference between precedence and order of evaluation, and why i = i++ is undefined.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Evaluate a complex expression step by step, showing every intermediate value",
                "Track the type of each sub-expression when int and double are mixed",
                "Explain the difference between precedence (grouping) and order of evaluation",
                "Explain why expressions like i = i++ and printf(\"%d %d\", i, i++) have undefined behaviour",
              ],
            },
            {
              type: "markdown",
              md: `## A method for evaluating any expression

Exam questions love long expressions. You can solve any of them reliably with a three-step method:

1. **Parenthesise:** using the precedence table, add the parentheses the compiler would add.
2. **Evaluate inside out:** compute the innermost sub-expressions first, writing down each intermediate value **and its type**.
3. **Apply the final operator** (usually an assignment), including any conversion to the variable's type.

Let's apply it to \`r = 10 + 20 / 4 * 3 - 8 % 3\`.`,
            },
            {
              type: "workedExample",
              title: "Evaluating r = 10 + 20 / 4 * 3 - 8 % 3",
              problem: "All values are `int`. Find the value stored in `r`.",
              steps: [
                "Parenthesise: `/`, `*` and `%` bind first, left to right; then `+` and `-` left to right: `r = ((10 + ((20 / 4) * 3)) - (8 % 3))`.",
                "Innermost: `20 / 4` = 5 (int).",
                "`5 * 3` = 15 (int).",
                "`8 % 3` = 2 (int).",
                "`10 + 15` = 25, then `25 - 2` = 23.",
                "Assign 23 to r.",
              ],
              answer: "r = 23",
            },
            {
              type: "definition",
              term: "Usual arithmetic conversions",
              md: "When a binary operator has operands of different arithmetic types, the \"smaller\" one is converted to the \"larger\" type before the operation. For example, in `int + double` the `int` is converted to `double`. Conversions happen **per operator**, not once for the whole expression.",
            },
            {
              type: "code",
              language: "c",
              title: "Evaluating mixed expressions",
              runnable: true,
              code: `#include <stdio.h>

int main(void)
{
    int r = 10 + 20 / 4 * 3 - 8 % 3;
    double d = 7 / 2 + 7.0 / 2;
    int k = 5 + 3 > 7 && 2 * 3 == 6;
    int t = 9 / 2 * 2.0;

    printf("r = %d\\n", r);
    printf("d = %.1f\\n", d);
    printf("k = %d\\n", k);
    printf("t = %d\\n", t);
    return 0;
}`,
              output: `r = 23
d = 6.5
k = 1
t = 8`,
              walkthrough: [
                { lines: "5", text: "The worked example above: 20/4 = 5, 5*3 = 15, 8%3 = 2, 10+15-2 = 23." },
                { lines: "6", text: "`7 / 2` is int division = 3. `7.0 / 2` is double division = 3.5. Then 3 + 3.5: the int 3 converts to 3.0, giving 6.5. Conversions happen per operator!" },
                { lines: "7", text: "Arithmetic first: 5 + 3 = 8 and 2 * 3 = 6. Then relational: 8 > 7 is 1. Then equality: 6 == 6 is 1. Finally 1 && 1 is 1." },
                { lines: "8", text: "Left to right: 9 / 2 = 4 (int division), then 4 * 2.0 = 8.0 (double). Storing 8.0 in an int gives 8." },
                { lines: "10-13", text: "Print the four results." },
              ],
            },
            {
              type: "heading",
              text: "Precedence is not order of evaluation",
              level: 2,
            },
            {
              type: "markdown",
              md: `Precedence tells you how an expression is **grouped**. It does **not** tell you in which order the operands are **computed**.

In \`f() + g() * h()\`, precedence guarantees the result is \`f() + (g() * h())\`. But C does **not** say whether \`f\`, \`g\` or \`h\` is *called* first. The compiler may call them in any order. If each function prints something, the printed order may differ between compilers, even though the final value is always the same.

Only a few operators *do* fix an order: \`&&\`, \`||\`, \`?:\` and the comma operator \`,\` always fully evaluate their left operand first.`,
            },
            {
              type: "code",
              language: "c",
              title: "Unspecified order of evaluation (output order may vary)",
              runnable: true,
              code: `#include <stdio.h>

int show(int v)
{
    printf("[%d]", v);
    return v;
}

int main(void)
{
    int r = show(1) + show(2) * show(3);
    printf("\\nr = %d\\n", r);
    return 0;
}`,
              walkthrough: [
                { lines: "3-7", text: "A helper function that prints its argument and returns it, so we can see when it is called. (Functions are covered fully in chapter 12.)" },
                { lines: "11", text: "The value is always 1 + (2 * 3) = 7. But the order in which the three calls happen is **unspecified**: one compiler may print [1][2][3], another [2][3][1]. No expected output is shown for that reason." },
                { lines: "12", text: "Whatever order the calls happen in, `r = 7` is guaranteed." },
              ],
            },
            {
              type: "heading",
              text: "Sequence points and undefined behaviour",
              level: 2,
            },
            {
              type: "definition",
              term: "Sequence point",
              md: "A point in the program where all side effects of previous evaluations are complete and none of the following ones have started. Examples: the end of a full expression (the `;`), after the left operand of `&&`, `||` and `,`, after the condition of `?:`, and just before a function is called (after all arguments are evaluated). C11 describes the same idea as \"sequenced before\".",
            },
            {
              type: "definition",
              term: "Side effect",
              md: "Any change to the state of the program made while evaluating an expression, such as storing to a variable (`=`, `+=`, `++`) or printing output.",
            },
            {
              type: "markdown",
              md: `The rule you must remember:

> **Between two sequence points, if a variable is modified, it must not be modified again, and its value must not be read for any purpose other than computing the new value.** Breaking this rule is **undefined behaviour (UB)**.

Look at \`i = i++;\`. It modifies \`i\` twice (once by \`++\`, once by \`=\`) with no sequence point between the two. The C standard does not say which happens last, and it goes further: it says the *entire program* has no defined meaning. Real compilers produce different results: some leave \`i\` unchanged, some increment it, and an optimiser may do something stranger still. So **there is no correct output** for such code, and an exam answer of "6" or "5" is wrong; the right answer is "undefined behaviour".

The same problem appears in:

- \`printf("%d %d\\n", i, i++);\`: \`i\` is read *and* modified in the arguments with no sequence point between (the commas separating arguments are **not** the comma operator).
- \`a[i] = i++;\`
- \`x = ++i + i++;\``,
            },
            {
              type: "code",
              language: "c",
              title: "Undefined: do NOT write code like this",
              runnable: false,
              code: `int i = 5;
i = i++;                     /* UB: i modified twice            */
printf("%d %d\\n", i, i++);   /* UB: i read and modified          */
int x = ++i + i++;           /* UB: i modified twice            */`,
              walkthrough: [
                { lines: "2", text: "Two unsequenced writes to `i`. No output can be predicted." },
                { lines: "3", text: "One argument reads `i`, another modifies it, and argument evaluation is unsequenced. Undefined." },
                { lines: "4", text: "Two modifications of `i` in one expression. Undefined." },
              ],
            },
            {
              type: "callout",
              variant: "exam",
              title: "How to answer UB questions",
              md: "If a question asks for the output of `i = i++` or similar, the correct answer is: **the behaviour is undefined; the output cannot be predicted and may differ between compilers.** Explain that the variable is modified twice (or read and modified) without an intervening sequence point.",
            },
            {
              type: "code",
              language: "c",
              title: "Safe versions: one modification per variable per expression",
              runnable: true,
              code: `#include <stdio.h>

int main(void)
{
    int i = 5;
    int a, b;

    a = i++;
    b = i++ + 10;
    printf("a=%d b=%d i=%d\\n", a, b, i);

    i = 1;
    if (i++ == 1 && i == 2)
        printf("&& finished the left side first, i=%d\\n", i);

    int k = (i = 10, i + 5);
    printf("k=%d\\n", k);
    return 0;
}`,
              output: `a=5 b=16 i=7
&& finished the left side first, i=2
k=15`,
              walkthrough: [
                { lines: "8", text: "Fine: `i` is modified once and `a` once. a gets 5, i becomes 6." },
                { lines: "9", text: "Fine: b gets 6 + 10 = 16, and i becomes 7." },
                { lines: "13", text: "Fine: `&&` is a sequence point. The left side `i++ == 1` is fully finished (comparison true, i now 2) before the right side reads `i`." },
                { lines: "16", text: "The comma **operator** is also a sequence point: `i = 10` completes, then `i + 5` = 15 is the value of the whole parenthesised expression." },
              ],
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `C was designed to run fast on many different processors. By leaving the order of evaluation open, the standard lets each compiler pick the order that is cheapest for its machine, for example keeping values in registers. The price is that the programmer must not write code whose meaning depends on that order. Sequence points are the places where the standard *does* promise an order, so code that only depends on them is portable.`,
            },
            {
              type: "heading",
              text: "Real-world uses",
              level: 2,
            },
            {
              type: "markdown",
              md: `- **Writing portable code:** a program that "works" on your compiler but relies on evaluation order can break when compiled with optimisation or on another platform.
- **Code reviews and static analysers** (and the warning \`-Wsequence-point\` in GCC) flag these patterns because they are real-world bugs.
- **Clarity:** splitting \`a[i] = i++;\` into \`a[i] = i; i++;\` is both correct and easier to read.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Modifying a variable twice in one expression",
                  wrong: `i = i++ + 1;`,
                  right: `i = i + 2;   /* or: i++; i++; */`,
                  md: "Say what you mean in separate steps; never modify the same variable twice between sequence points.",
                },
                {
                  title: "Reading and modifying in function arguments",
                  wrong: `printf("%d %d\\n", n, n++);`,
                  right: `printf("%d %d\\n", n, n + 1);
n++;`,
                  md: "Argument evaluation order is unspecified and the commas between arguments are not sequence points.",
                },
                {
                  title: "Thinking precedence decides evaluation order",
                  wrong: `/* "* binds tighter, so g() and h() are called before f()" */
r = f() + g() * h();`,
                  right: `int a = f();
int b = g();
int c = h();
r = a + b * c;   /* order of calls is now fixed */`,
                  md: "Precedence only groups operands. If call order matters, use separate statements.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "Evaluate by first parenthesising, then working inside out, tracking types.",
                "Conversions happen per operator: 7 / 2 + 7.0 / 2 is 3 + 3.5 = 6.5.",
                "Precedence decides grouping, not the order operands are evaluated.",
                "&&, ||, ?: and the comma operator evaluate their left operand first (sequence points).",
                "i = i++, a[i] = i++ and printf(\"%d %d\", i, i++) are undefined behaviour: no defined output.",
              ],
            },
            {
              type: "recap",
              items: [
                "Parenthesise, evaluate inside out, then apply the assignment.",
                "Watch for integer division hiding inside larger expressions.",
                "The order in which operands are computed is generally unspecified.",
                "Never modify a variable twice, or read and modify it, between sequence points.",
              ],
            },
            {
              type: "exercise",
              id: "c08-ex-predict-mixed",
              kind: "predict",
              title: "Track the types",
              prompt: "Predict the output.\n\n```c\n#include <stdio.h>\n\nint main(void)\n{\n    double a = 5 / 2 * 2.0;\n    double b = 5 / 2.0 * 2;\n    int c = 3 + 4 * 5 % 6 - 1;\n    printf(\"%.1f %.1f %d\\n\", a, b, c);\n    return 0;\n}\n```",
              hint: "Evaluate left to right among * / %, and note where a double first appears.",
              solution: "a: 5 / 2 = 2 (int), 2 * 2.0 = 4.0. b: 5 / 2.0 = 2.5, 2.5 * 2 = 5.0. c: 4 * 5 = 20, 20 % 6 = 2, 3 + 2 - 1 = 4.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    double a = 5 / 2 * 2.0;
    double b = 5 / 2.0 * 2;
    int c = 3 + 4 * 5 % 6 - 1;
    printf("%.1f %.1f %d\\n", a, b, c);
    return 0;
}`,
              expectedOutput: "4.0 5.0 4",
            },
            {
              type: "exercise",
              id: "c08-ex-concept-ub",
              kind: "concept",
              title: "Explain the bug",
              prompt: "A student says: \"`int i = 3; i = i++;` prints 3 on my compiler, so the answer is 3.\" Explain why this reasoning is wrong.",
              solution: "`i` is modified twice (by `++` and by `=`) without an intervening sequence point, which is undefined behaviour. The C standard places no requirement on the result, so a different compiler, a different optimisation level or even a later version of the same compiler may give 4 or something else. Observing one result does not make it correct C. Rewrite as `i++;` or `i = i + 1;` depending on the intent.",
            },
            {
              type: "exercise",
              id: "c08-ex-debug-sequence",
              kind: "debug",
              title: "Make it well-defined",
              prompt: "This program is meant to print the numbers `1 2` (the current value, then the next value) and leave `n` at 2. It contains undefined behaviour. Rewrite it so its output is guaranteed.",
              starterCode: `#include <stdio.h>

int main(void)
{
    int n = 1;
    printf("%d %d\\n", n, ++n);
    return 0;
}`,
              hint: "Do the increment in its own statement.",
              solution: "Print n and n + 1 without modifying n inside the call, then increment n separately.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    int n = 1;
    printf("%d %d\\n", n, n + 1);
    n++;
    return 0;
}`,
              expectedOutput: "1 2",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c08-ub-mcq",
              prompt: "What is printed by `int i = 5; printf(\"%d %d\\n\", i, i++);`?",
              options: [
                { id: "a", text: "5 5" },
                { id: "b", text: "6 5" },
                { id: "c", text: "5 6" },
                { id: "d", text: "The behaviour is undefined; no output is guaranteed" },
              ],
              correct: "d",
              explanation: "i is read and modified in the argument list without a sequence point between, which is undefined behaviour.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c08-step-by-step-output",
              prompt: "What does this print?",
              code: `#include <stdio.h>

int main(void)
{
    int x = 8, y = 3;
    double z = x / y + x % y * 1.5;
    printf("%.2f\\n", z);
    return 0;
}`,
              expected: "5.00",
              explanation: "x / y = 2 (int). x % y = 2, then 2 * 1.5 = 3.0. 2 + 3.0 = 5.0.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c08-order-tf",
              prompt: "In `a() + b() * c()`, C guarantees that b() and c() are called before a().",
              correct: false,
              explanation: "Precedence only decides grouping. The order in which the functions are called is unspecified.",
            },
            {
              type: "FILL_BLANK",
              slug: "c08-sequence-point-fill",
              prompt: "Modifying the same variable twice without an intervening sequence point, as in `i = i++`, results in ___ behaviour.",
              accepted: [["undefined", "undefined behavior", "undefined behaviour"]],
              explanation: "The C standard places no requirements on such a program.",
            },
          ],
        },
      ],
    },
  ],
};

export default chapter;
