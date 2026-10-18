import type { ChapterContent } from "../../../src/lib/content/schema";

/** Raw template tag: backslashes in C code (\n, \t, \0) are kept exactly as typed. */
const c = String.raw;

const chapter: ChapterContent = {
  slug: "tokens",
  title: "Tokens, Keywords and Identifiers",
  summary:
    "The smallest building blocks of C source code: tokens, reserved keywords, the rules for naming things, comments, and how whitespace is treated.",
  topics: [
    {
      slug: "tokens-and-keywords",
      title: "Tokens and keywords",
      lessons: [
        {
          slug: "c-tokens-and-keywords",
          title: "Tokens: the words of the C language",
          summary:
            "See how the compiler breaks your source code into tokens, learn the six kinds of tokens, and meet the reserved keywords of C.",
          estMinutes: 20,
          blocks: [
            {
              type: "objectives",
              items: [
                "Define a token and list the six categories of C tokens.",
                "Split a line of C code into its individual tokens and count them.",
                "Recognise C's reserved keywords and explain why they cannot be used as names.",
                "Explain how whitespace separates tokens but is otherwise ignored.",
              ],
            },
            {
              type: "markdown",
              md: `## Reading code the way the compiler does

When you read the sentence *"The cat sat."*, you automatically see three words and a full stop. You do not think about individual letters. The C compiler does something similar: its very first job is to scan your source text and group the characters into meaningful units called **tokens**. Only then does it check whether the tokens are arranged in a grammatically correct way.

For example, the statement

\`\`\`c
int total = price + 25;
\`\`\`

is seen by the compiler as these **7 tokens**: \`int\`  \`total\`  \`=\`  \`price\`  \`+\`  \`25\`  \`;\``,
            },
            {
              type: "definition",
              term: "Token",
              md: "The smallest individual unit of a C program that is meaningful to the compiler. Tokens are like the words and punctuation marks of a sentence.",
            },
            {
              type: "definition",
              term: "Lexical analysis",
              md: "The compiler phase that reads raw characters and groups them into tokens (also called *scanning* or *tokenising*). The part of the compiler that does it is called the *lexer* or *scanner*.",
            },
            {
              type: "table",
              caption: "The six kinds of tokens in C",
              headers: ["Kind", "What it is", "Examples"],
              rows: [
                ["Keywords", "Reserved words with a fixed meaning in the language", "`int`, `return`, `if`, `while`"],
                ["Identifiers", "Names you choose for variables, functions, etc.", "`total`, `price`, `main`, `printf`"],
                ["Constants", "Fixed numeric or character values written directly in code", "`25`, `3.14`, `'A'`, `0x1F`"],
                ["String literals", "Text in double quotes", "`\"Hello\"`, `\"%d\\n\"`"],
                ["Operators", "Symbols that perform operations", "`+`, `-`, `*`, `=`, `==`, `&&`, `++`"],
                ["Special symbols (punctuators)", "Symbols that structure the code", "`;`, `,`, `( )`, `{ }`, `[ ]`, `#`"],
              ],
            },
            {
              type: "code",
              language: "c",
              title: "A program made of tokens",
              runnable: true,
              code: c`#include <stdio.h>

int main(void)
{
    int price = 75;
    int total = price + 25;
    printf("Total: %d\n", total);
    return 0;
}`,
              output: "Total: 100",
              walkthrough: [
                { lines: "1", text: "A preprocessor directive. The preprocessor handles it before tokens reach the compiler proper." },
                { lines: "3", text: "Tokens: `int` (keyword), `main` (identifier), `(` `)` (punctuators), `void` (keyword)." },
                { lines: "5", text: "Tokens: `int` `price` `=` `75` `;` — a keyword, an identifier, an operator, a constant and a punctuator: 5 tokens." },
                { lines: "6", text: "7 tokens: `int` `total` `=` `price` `+` `25` `;`." },
                { lines: "7", text: "7 tokens: `printf` `(` `\"Total: %d\\n\"` `,` `total` `)` `;`. The whole string literal, including spaces inside it, is **one** token." },
                { lines: "8", text: "3 tokens: `return` `0` `;`." },
              ],
            },
            {
              type: "heading",
              text: "Keywords",
              level: 2,
            },
            {
              type: "definition",
              term: "Keyword (reserved word)",
              md: "A word that the C language has already given a special meaning, such as `int` or `while`. Keywords are always lowercase (apart from the newer ones that begin with an underscore) and cannot be used as identifiers.",
            },
            {
              type: "table",
              caption: "The 32 keywords of C89/C90 (ANSI C)",
              headers: ["", "", "", ""],
              rows: [
                ["auto", "double", "int", "struct"],
                ["break", "else", "long", "switch"],
                ["case", "enum", "register", "typedef"],
                ["char", "extern", "return", "union"],
                ["const", "float", "short", "unsigned"],
                ["continue", "for", "signed", "void"],
                ["default", "goto", "sizeof", "volatile"],
                ["do", "if", "static", "while"],
              ],
            },
            {
              type: "markdown",
              md: `Later standards added more keywords:

- **C99:** \`inline\`, \`restrict\`, \`_Bool\`, \`_Complex\`, \`_Imaginary\`
- **C11:** \`_Alignas\`, \`_Alignof\`, \`_Atomic\`, \`_Generic\`, \`_Noreturn\`, \`_Static_assert\`, \`_Thread_local\`
- **C23:** \`bool\`, \`true\`, \`false\`, \`nullptr\`, \`static_assert\`, \`thread_local\`, \`alignas\`, \`alignof\`, \`constexpr\`, \`typeof\` and a few others

Exam questions about "the keywords of C" almost always mean the classic **32**.`,
            },
            {
              type: "callout",
              variant: "exam",
              title: "printf and main are not keywords",
              md: "`main`, `printf`, `scanf` and `include` are **identifiers**, not keywords. `main` is the name of a function the program must define; `printf` is a library function; `include` is part of a preprocessor directive.",
            },
            {
              type: "heading",
              text: "Whitespace",
              level: 2,
            },
            {
              type: "definition",
              term: "Whitespace",
              md: "Spaces, tabs and newlines (and a few rarer characters such as form feed). In C, whitespace separates tokens but is otherwise ignored — except inside string and character literals, where it is part of the value.",
            },
            {
              type: "markdown",
              md: "Because whitespace only separates tokens, this second program is identical to the compiler's eyes to a nicely formatted version — it just is much harder for humans to read. Notice that the spaces *inside* the string are kept.",
            },
            {
              type: "code",
              language: "c",
              title: "Whitespace does not change meaning (but matters to humans!)",
              runnable: true,
              code: c`#include <stdio.h>
int main(void){int a=4,b=6;printf("a + b = %d\n",a+b);
return
0
;}`,
              output: "a + b = 10",
              walkthrough: [
                { lines: "1", text: "Preprocessor directives must each be on their own line — this is one place where newlines *do* matter." },
                { lines: "2", text: "No spaces between most tokens: `int main(void){int a=4,b=6;...`. The compiler can still tell where each token ends because symbols like `(`, `=` and `,` cannot be part of a name." },
                { lines: "3-5", text: "`return`, `0` and `;` are split across three lines. Newlines are just whitespace here, so this is still the statement `return 0;`." },
              ],
            },
            {
              type: "callout",
              variant: "warning",
              title: "Where a space is required",
              md: "You need whitespace between two tokens that would otherwise merge into one: `int x` cannot be written `intx` (that would be a single identifier). Similarly `return 0` needs the space, but `return(0)` does not.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: "The lexer reads characters greedily: it keeps adding characters to the current token for as long as the result could still be a valid token (this is known as the *maximal munch* rule). Letters and digits can continue an identifier, so `intx` is one identifier; but `=` can never be part of an identifier, so `a=4` naturally splits into `a`, `=` and `4`. Once the code is a stream of tokens, all the original spacing is gone — which is why formatting is entirely for humans.",
            },
            {
              type: "heading",
              text: "Real-world use",
              level: 3,
            },
            {
              type: "markdown",
              md: "Tokenising is the first step of every compiler, interpreter, syntax highlighter and code formatter. Your editor colours keywords differently from identifiers because it runs a small lexer as you type. Tools like `clang-format` take the token stream and re-print it with consistent spacing — possible only because whitespace doesn't change meaning.",
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Using a keyword as a variable name",
                  wrong: c`int return = 5;
float double = 2.5;`,
                  right: c`int result = 5;
float amount = 2.5;`,
                  md: "Keywords are reserved. The compiler sees `return` and expects a return statement, producing a confusing syntax error. Choose a different, descriptive name.",
                },
                {
                  title: "Writing keywords with capital letters",
                  wrong: c`Int count = 0;
RETURN 0;`,
                  right: c`int count = 0;
return 0;`,
                  md: "C keywords are lowercase. `Int` is not a keyword — the compiler treats it as an unknown identifier and reports an error.",
                },
                {
                  title: "Splitting a token with a space",
                  wrong: c`int total = 1 0;
if (a = = b) { }`,
                  right: c`int total = 10;
if (a == b) { }`,
                  md: "A space ends a token. `1 0` is two separate constants, and `= =` is two assignment operators instead of the single equality operator `==`.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "A token is the smallest meaningful unit of a C program.",
                "Six kinds of tokens: keywords, identifiers, constants, string literals, operators, special symbols.",
                "C89/C90 has **32 keywords**; all are lowercase.",
                "`main`, `printf` and `scanf` are identifiers, not keywords.",
                "A string literal such as `\"Hello world\"` is a single token, spaces included.",
                "Whitespace separates tokens and is otherwise ignored outside literals.",
              ],
            },
            {
              type: "recap",
              items: [
                "The compiler first breaks source text into tokens.",
                "Keywords are reserved words with fixed meanings.",
                "Whitespace is for readability; the compiler only needs it to separate tokens that would otherwise merge.",
                "Counting tokens is a common exam exercise: count keywords, names, constants, strings, operators and punctuation separately.",
              ],
            },
            {
              type: "exercise",
              id: "c03-ex-count-tokens",
              kind: "concept",
              title: "Count the tokens",
              prompt: "How many tokens are in each statement? List them.\n\n1. `x = y * 2;`\n2. `printf(\"Sum = %d\", s);`\n3. `float rate = 0.05;`",
              hint: "A whole string literal counts as one token.",
              solution: "1. 6 tokens: `x` `=` `y` `*` `2` `;`. 2. 7 tokens: `printf` `(` `\"Sum = %d\"` `,` `s` `)` `;`. 3. 5 tokens: `float` `rate` `=` `0.05` `;`.",
            },
            {
              type: "exercise",
              id: "c03-ex-classify",
              kind: "concept",
              title: "Classify the tokens",
              prompt: "Classify each token from `while (count < 10) count++;` as a keyword, identifier, constant, operator or special symbol.",
              hint: "There are 9 tokens.",
              solution: "`while` keyword; `(` special symbol; `count` identifier; `<` operator; `10` constant; `)` special symbol; `count` identifier; `++` operator; `;` special symbol.",
            },
            {
              type: "exercise",
              id: "c03-ex-reformat",
              kind: "write",
              title: "Make it readable",
              prompt: "Rewrite this working but squashed program with one statement per line and sensible indentation. It should still print `Product: 42`.\n\n```c\n#include <stdio.h>\nint main(void){int p=6,q=7;printf(\"Product: %d\\n\",p*q);return 0;}\n```",
              hint: "Put the braces on their own lines and indent the body by four spaces.",
              solutionCode: c`#include <stdio.h>

int main(void)
{
    int p = 6;
    int q = 7;
    printf("Product: %d\n", p * q);
    return 0;
}`,
              expectedOutput: "Product: 42",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c03-not-keyword-mcq",
              prompt: "Which of the following is **not** a C keyword?",
              options: [
                { id: "a", text: "`sizeof`" },
                { id: "b", text: "`volatile`" },
                { id: "c", text: "`printf`" },
                { id: "d", text: "`register`" },
              ],
              correct: "c",
              explanation: "`printf` is a library function (an identifier). `sizeof`, `volatile` and `register` are all among the 32 C89 keywords.",
            },
            {
              type: "FILL_BLANK",
              slug: "c03-keyword-count-fill",
              prompt: "The ANSI C (C89/C90) standard defines ___ keywords.",
              accepted: [["32", "thirty-two", "thirty two"]],
              explanation: "There are 32 keywords in C89/C90; C99, C11 and C23 added more.",
            },
            {
              type: "MCQ",
              slug: "c03-token-count-mcq",
              prompt: "How many tokens are in the statement `sum = sum + 10;`?",
              options: [
                { id: "a", text: "4" },
                { id: "b", text: "5" },
                { id: "c", text: "6" },
                { id: "d", text: "7" },
              ],
              correct: "c",
              explanation: "`sum` `=` `sum` `+` `10` `;` — six tokens.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c03-string-one-token-tf",
              prompt: "The string literal `\"Hello, World!\"` counts as a single token.",
              correct: true,
              explanation: "A complete string literal is one token, regardless of the spaces or punctuation inside it.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c03-whitespace-output",
              prompt: "Whitespace is unusual here. What does the program print?",
              code: c`#include <stdio.h>
int main(void)
{
    int    n   =
        3 ;
    printf("n  =  %d\n",   n   *   n);
    return 0;
}`,
              expected: "n  =  9",
              explanation: "Extra spaces between tokens are ignored, so `n` is 3 and `n * n` is 9. But the spaces *inside* the string literal are printed exactly as written.",
            },
          ],
        },
      ],
    },
    {
      slug: "identifiers-and-comments",
      title: "Identifiers and comments",
      lessons: [
        {
          slug: "c-identifiers-and-comments",
          title: "Naming rules, conventions and comments",
          summary:
            "Learn the rules every identifier must follow, the conventions good programmers use to pick names, and how to write single-line and multi-line comments.",
          estMinutes: 20,
          blocks: [
            {
              type: "objectives",
              items: [
                "State the rules for valid identifiers in C.",
                "Decide whether a given name is a valid identifier and explain why.",
                "Choose clear, conventional names (snake_case, UPPER_CASE for constants).",
                "Write single-line (//) and multi-line (/* */) comments and avoid common comment pitfalls.",
              ],
            },
            {
              type: "markdown",
              md: `## Naming things

An **identifier** is a name you give to something in your program: a variable, a function, a constant, a type. Choosing names is like labelling boxes when you move house — "KITCHEN – plates" is far more useful than "Box 7". The compiler does not care whether a name is meaningful, but it does insist that the name follows a few strict rules.`,
            },
            {
              type: "definition",
              term: "Identifier",
              md: "A user-defined name for a variable, function, array, structure, label or other program entity. Examples: `total`, `calculate_tax`, `MAX_SIZE`, `i`.",
            },
            {
              type: "heading",
              text: "The rules for identifiers",
              level: 2,
            },
            {
              type: "markdown",
              md: `1. An identifier may contain only **letters** (\`a–z\`, \`A–Z\`), **digits** (\`0–9\`) and the **underscore** \`_\`.
2. The **first character must be a letter or an underscore** — never a digit.
3. **No spaces** and no other symbols (\`-\`, \`$\`, \`@\`, \`.\`, \`#\` ...).
4. It **cannot be a keyword** (\`int\`, \`while\`, \`return\` ...).
5. Identifiers are **case-sensitive**: \`total\`, \`Total\` and \`TOTAL\` are three different names.
6. Length: the standard guarantees at least 31 significant characters for external names and 63 for internal names (C99); in practice compilers accept very long names.`,
            },
            {
              type: "table",
              caption: "Valid or invalid?",
              headers: ["Name", "Valid?", "Reason"],
              rows: [
                ["`student_age`", "Valid", "Letters and underscore"],
                ["`_count`", "Valid (but avoid)", "May start with underscore; names starting with `_` are often reserved for the implementation"],
                ["`value2`", "Valid", "Digits allowed after the first character"],
                ["`2value`", "Invalid", "Starts with a digit"],
                ["`total marks`", "Invalid", "Contains a space"],
                ["`net-pay`", "Invalid", "`-` is the minus operator"],
                ["`float`", "Invalid", "Keyword"],
                ["`Float`", "Valid", "Case differs from the keyword `float` (but confusing!)"],
                ["`price$`", "Invalid in standard C", "`$` is not allowed by the standard (some compilers accept it as an extension)"],
              ],
            },
            {
              type: "syntax",
              language: "c",
              code: c`identifier : (letter | _) (letter | digit | _)*

examples   : count   max_value   x1   _temp   PI`,
              md: "Read as: one letter or underscore, followed by any number of letters, digits or underscores.",
            },
            {
              type: "code",
              language: "c",
              title: "Case sensitivity in action",
              runnable: true,
              code: c`#include <stdio.h>

int main(void)
{
    int score = 10;
    int Score = 20;
    int SCORE = 30;
    int score_total = score + Score + SCORE;

    printf("score = %d\n", score);
    printf("Score = %d\n", Score);
    printf("SCORE = %d\n", SCORE);
    printf("score_total = %d\n", score_total);
    return 0;
}`,
              output: `score = 10
Score = 20
SCORE = 30
score_total = 60`,
              walkthrough: [
                { lines: "5-7", text: "Three **different** variables. Because C is case-sensitive, the names do not clash. (This is legal but terrible style — never do it in real code!)" },
                { lines: "8", text: "`score_total` uses an underscore to join two words. It adds the three variables: 10 + 20 + 30 = 60." },
                { lines: "10-13", text: "Each `printf` shows that the three variables kept their own values." },
              ],
            },
            {
              type: "heading",
              text: "Naming conventions",
              level: 3,
            },
            {
              type: "table",
              headers: ["Style", "Example", "Typical use in C"],
              rows: [
                ["snake_case", "`total_marks`, `read_input()`", "Variables and functions (most common in C)"],
                ["camelCase", "`totalMarks`, `readInput()`", "Also seen, especially in code influenced by Java/JavaScript"],
                ["UPPER_SNAKE_CASE", "`MAX_STUDENTS`, `PI`", "Macros and constants defined with `#define`"],
                ["Short names", "`i`, `j`, `n`", "Loop counters and very short-lived values"],
              ],
            },
            {
              type: "callout",
              variant: "tip",
              title: "Good names explain themselves",
              md: "Prefer `seconds_elapsed` to `s`, and `is_valid` to `flag`. A good name removes the need for a comment. Pick one style (snake_case or camelCase) and use it consistently.",
            },
            {
              type: "heading",
              text: "Comments",
              level: 2,
            },
            {
              type: "definition",
              term: "Comment",
              md: "Text in the source code meant for human readers. The preprocessor removes comments, so they have no effect on the compiled program.",
            },
            {
              type: "syntax",
              language: "c",
              code: c`// single-line comment: runs to the end of the line (C99 and later)

/* multi-line (block) comment:
   can span several lines */`,
            },
            {
              type: "code",
              language: "c",
              title: "Comments in practice",
              runnable: true,
              code: c`/*
 * Program: unit converter
 * Converts a distance in kilometres to metres.
 */
#include <stdio.h>

int main(void)
{
    int km = 3;              // distance entered by the user
    int metres = km * 1000;  /* 1 km = 1000 m */

    // printf("debug: km=%d\n", km);   <- disabled debug line
    printf("%d km = %d m\n", km, metres);
    printf("/* this is not a comment */\n");
    return 0;
}`,
              output: `3 km = 3000 m
/* this is not a comment */`,
              walkthrough: [
                { lines: "1-4", text: "A block comment used as a header that documents the program. The extra `*` at the start of each line is just a popular style." },
                { lines: "9", text: "A `//` comment at the end of a line explains what the variable holds." },
                { lines: "10", text: "A short `/* */` comment can also appear at the end of a line." },
                { lines: "12", text: "\"Commenting out\" a line: putting `//` in front disables it without deleting it. This debug line does not run." },
                { lines: "13", text: "Prints `3 km = 3000 m`." },
                { lines: "14", text: "Comment markers **inside a string literal** are just ordinary characters, so they are printed." },
              ],
            },
            {
              type: "callout",
              variant: "warning",
              title: "Block comments do not nest",
              md: "A `/* ... */` comment ends at the **first** `*/`. So `/* outer /* inner */ still outer? */` ends after `inner */`, and the compiler then tries to compile `still outer? */` — an error.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: "Identifier rules exist so the lexer can tell names apart from numbers and operators instantly: a token starting with a digit must be a number, so names can't start with a digit; `-` is an operator, so it can't be inside a name. Comments disappear during preprocessing (each one is replaced by a single space), which is why they cost nothing at run time, and why comment-like text inside a string — already recognised as a string literal — is left alone.",
            },
            {
              type: "heading",
              text: "Real-world use",
              level: 3,
            },
            {
              type: "markdown",
              md: "Professional teams follow written style guides (for example, the Linux kernel coding style uses snake_case and short lowercase names). Documentation tools like **Doxygen** read specially formatted comments such as `/** Returns the area of a circle. */` and generate web documentation. Good names and comments are one of the first things reviewed in a code review.",
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Starting an identifier with a digit",
                  wrong: c`int 1st_place = 100;`,
                  right: c`int first_place = 100;`,
                  md: "Identifiers must begin with a letter or underscore. The lexer reads `1` as the start of a number, and the rest becomes a syntax error.",
                },
                {
                  title: "Using a hyphen or space in a name",
                  wrong: c`int max-speed = 120;
int max speed = 120;`,
                  right: c`int max_speed = 120;`,
                  md: "`-` is the subtraction operator and a space ends a token. Use an underscore (or camelCase) to join words.",
                },
                {
                  title: "Nesting block comments",
                  wrong: c`/* disable this block
   int x = 5; /* the starting value */
   x = x * 2;
*/`,
                  right: c`/* disable this block
   int x = 5;    // the starting value
   x = x * 2;
*/`,
                  md: "The inner `*/` ends the whole comment early, leaving `x = x * 2; */` to be compiled. Use `//` comments inside a block you may want to comment out, or use `#if 0 ... #endif` (chapter 22).",
                },
                {
                  title: "Forgetting to close a block comment",
                  wrong: c`/* compute the total
int total = a + b;
printf("%d\n", total);`,
                  right: c`/* compute the total */
int total = a + b;
printf("%d\n", total);`,
                  md: "Without `*/`, everything up to the next `*/` (possibly far down the file) becomes part of the comment, and code silently disappears. Syntax highlighting in your editor makes this easy to spot.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "Identifiers: letters, digits, underscore only; must start with a letter or underscore; no keywords; case-sensitive.",
                "Examples of invalid identifiers: `2nd`, `my var`, `net-pay`, `int`.",
                "`//` comments were introduced in C99; `/* */` comments work in every version of C.",
                "Block comments cannot be nested.",
                "Comments are removed by the preprocessor and do not affect the executable.",
              ],
            },
            {
              type: "recap",
              items: [
                "Identifiers name variables, functions and other entities.",
                "Follow the rules (letter/underscore first, no symbols, no keywords) and the conventions (descriptive snake_case, UPPER_CASE macros).",
                "Use `//` for short notes and `/* */` for longer explanations.",
                "Comment markers inside strings are just text.",
              ],
            },
            {
              type: "exercise",
              id: "c03-ex-valid-names",
              kind: "concept",
              title: "Valid or not?",
              prompt: "For each name, say whether it is a valid C identifier. If not, explain why: `average`, `_tmp`, `3d_point`, `while`, `While`, `rate%`, `total_2024`, `first name`.",
              hint: "Check the first character, the allowed characters, and the keyword list.",
              solution: "`average` valid; `_tmp` valid (though leading underscores are best avoided); `3d_point` invalid (starts with a digit); `while` invalid (keyword); `While` valid (case differs); `rate%` invalid (`%` not allowed); `total_2024` valid; `first name` invalid (contains a space).",
            },
            {
              type: "exercise",
              id: "c03-ex-debug-names",
              kind: "debug",
              title: "Fix the names",
              prompt: "This program does not compile because of its identifiers. Rename the variables so it compiles and prints `Area: 24`.",
              starterCode: c`#include <stdio.h>

int main(void)
{
    int room-width = 4;
    int 2length = 6;
    int area = room-width * 2length;
    printf("Area: %d\n", area);
    return 0;
}`,
              hint: "Replace the hyphen with an underscore and make the second name start with a letter.",
              solution: "`room-width` contains a minus sign and `2length` starts with a digit. Rename them, for example, to `room_width` and `length2` (or `room_length`).",
              solutionCode: c`#include <stdio.h>

int main(void)
{
    int room_width = 4;
    int room_length = 6;
    int area = room_width * room_length;
    printf("Area: %d\n", area);
    return 0;
}`,
              expectedOutput: "Area: 24",
            },
            {
              type: "exercise",
              id: "c03-ex-predict-comments",
              kind: "predict",
              title: "What survives the comments?",
              prompt: "Predict the output.",
              starterCode: c`#include <stdio.h>

int main(void)
{
    int a = 1;
    // a = 2;
    a = a + 10; /* a = 100; */
    printf("a = %d\n", a);
    printf("// done\n");
    return 0;
}`,
              hint: "Commented-out code does not run, but text inside a string is printed.",
              solution: "Only `a = a + 10;` runs, so `a` is 11. The `//` inside the string is printed literally.",
              solutionCode: c`#include <stdio.h>

int main(void)
{
    int a = 1;
    // a = 2;
    a = a + 10; /* a = 100; */
    printf("a = %d\n", a);
    printf("// done\n");
    return 0;
}`,
              expectedOutput: `a = 11
// done`,
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c03-valid-identifier-mcq",
              prompt: "Which of these is a valid C identifier?",
              options: [
                { id: "a", text: "`2nd_value`" },
                { id: "b", text: "`second-value`" },
                { id: "c", text: "`second_value`" },
                { id: "d", text: "`second value`" },
              ],
              correct: "c",
              explanation: "Only letters, digits and underscores are allowed, and the first character cannot be a digit.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c03-nested-comments-tf",
              prompt: "Multi-line comments (`/* ... */`) can be nested inside each other in standard C.",
              correct: false,
              explanation: "A block comment ends at the first `*/`, so nesting does not work.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c03-case-identifiers-tf",
              prompt: "`count` and `Count` can be two different variables in the same block.",
              correct: true,
              explanation: "C identifiers are case-sensitive, so these are distinct names (though using both is poor style).",
            },
            {
              type: "FILL_BLANK",
              slug: "c03-first-char-fill",
              prompt: "The first character of an identifier must be a letter or an ___.",
              accepted: [["underscore", "_", "underscore (_)"]],
              explanation: "Identifiers start with a letter or underscore; digits are allowed only after the first character.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c03-comment-output",
              prompt: "What does this program print?",
              code: c`#include <stdio.h>

int main(void)
{
    int total = 5;  // starting value
    /* total = total * 3; */
    total = total + 2;
    // total = 0;
    printf("total = %d\n", total);
    printf("/* end */\n");
    return 0;
}`,
              expected: `total = 7
/* end */`,
              explanation: "The two commented-out assignments never run, so total is 5 + 2 = 7. The comment markers inside the string literal are printed as ordinary text.",
            },
            {
              type: "CODE_WRITING",
              slug: "c03-perimeter-code",
              prompt: "Write a program that reads the length and width of a rectangle (two whole numbers) and prints its perimeter as `Perimeter: P`. Use meaningful identifiers such as `length`, `width` and `perimeter`, and add at least one comment.\n\nFor input `5 3` the output is `Perimeter: 16`.",
              starterCode: c`#include <stdio.h>

int main(void)
{
    int length, width;
    scanf("%d %d", &length, &width);
    /* compute and print the perimeter */
    return 0;
}`,
              sampleTests: [{ stdin: "5 3", expected: "Perimeter: 16" }],
              hiddenTests: [
                { stdin: "10 10", expected: "Perimeter: 40" },
                { stdin: "1 0", expected: "Perimeter: 2" },
                { stdin: "125 75", expected: "Perimeter: 400" },
              ],
              solutionCode: c`#include <stdio.h>

int main(void)
{
    int length, width;
    scanf("%d %d", &length, &width);

    // perimeter of a rectangle = 2 * (length + width)
    int perimeter = 2 * (length + width);
    printf("Perimeter: %d\n", perimeter);
    return 0;
}`,
              explanation: "Perimeter = 2 × (length + width). Clear names make the formula read like the maths it represents.",
            },
          ],
        },
      ],
    },
  ],
};

export default chapter;
