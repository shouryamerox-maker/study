import type { ChapterContent } from "../../../src/lib/content/schema";

/** Raw template tag: backslashes in C code (\n, \t, \0) are kept exactly as typed. */
const c = String.raw;

const chapter: ChapterContent = {
  slug: "data-types",
  title: "Data Types",
  summary:
    "C's built-in data types, their typical sizes and ranges, signed vs unsigned integers, float vs double, and how values are converted between types — including the famous integer-division trap.",
  topics: [
    {
      slug: "basic-data-types",
      title: "Basic data types",
      lessons: [
        {
          slug: "c-integer-types-sizes-ranges",
          title: "Integer types, sizes, ranges and signedness",
          summary:
            "Meet char, short, int, long and long long, measure them with sizeof, look up their limits in limits.h, and understand signed vs unsigned.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "List C's basic data types and what each is used for.",
                "Use `sizeof` to find the size of a type and know the typical sizes on modern systems.",
                "Use `limits.h` constants such as `INT_MAX` to find the range of a type.",
                "Explain the difference between signed and unsigned integers and compute their ranges from the number of bits.",
                "Describe what happens when an integer goes out of range (overflow and wrap-around).",
              ],
            },
            {
              type: "markdown",
              md: `## Why types matter

Memory is just a long row of **bits** (0s and 1s), grouped into **bytes** of 8 bits. The bit pattern \`01000001\` could be the number 65, the letter \`'A'\`, or part of a decimal number — it depends entirely on how you *interpret* it. A **data type** tells the compiler two things:

1. **How much memory** to reserve (how many bytes).
2. **How to interpret** the bits (whole number? decimal number? character?) and therefore which operations make sense.

Choosing a type is like choosing a container: a teaspoon, a cup or a bucket. Too small and the value overflows; too big wastes space (which matters when you store millions of values).`,
            },
            {
              type: "definition",
              term: "Data type",
              md: "A classification that determines how much memory a value occupies, how its bits are interpreted, and which operations can be performed on it.",
            },
            {
              type: "definition",
              term: "Bit and byte",
              md: "A **bit** is a single binary digit (0 or 1). A **byte** is the smallest addressable unit of memory; on virtually all systems it is 8 bits (the constant `CHAR_BIT` in `limits.h`).",
            },
            {
              type: "table",
              caption: "C's basic types — sizes are typical for modern 64-bit desktop systems, not guaranteed by the standard",
              headers: ["Type", "Typical size", "Typical range", "Use"],
              rows: [
                ["`char`", "1 byte", "−128 to 127 or 0 to 255 (implementation-defined)", "A single character / tiny integer"],
                ["`signed char` / `unsigned char`", "1 byte", "−128 to 127 / 0 to 255", "Small numbers, raw bytes"],
                ["`short` (`short int`)", "2 bytes", "−32,768 to 32,767", "Small integers"],
                ["`int`", "4 bytes", "−2,147,483,648 to 2,147,483,647", "The default integer type"],
                ["`long` (`long int`)", "4 bytes (Windows) or 8 bytes (Linux/macOS 64-bit)", "At least ±2,147,483,647", "Larger integers"],
                ["`long long`", "8 bytes", "About ±9.22 × 10¹⁸", "Very large integers (C99)"],
                ["`float`", "4 bytes", "About ±3.4 × 10³⁸, ~6–7 significant digits", "Decimal numbers, low precision"],
                ["`double`", "8 bytes", "About ±1.7 × 10³⁰⁸, ~15–16 significant digits", "Decimal numbers (the default choice)"],
                ["`long double`", "8, 12 or 16 bytes", "At least as big as `double`", "Extra precision"],
                ["`void`", "—", "No values", "\"Nothing\": e.g. a function returning nothing"],
              ],
            },
            {
              type: "callout",
              variant: "exam",
              title: "What the standard actually guarantees",
              md: "C only guarantees **minimum** ranges and an ordering: `sizeof(char)` is always 1, and `char ≤ short ≤ int ≤ long ≤ long long` in size. Minimums: `short` and `int` at least 16 bits, `long` at least 32 bits, `long long` at least 64 bits. The exact sizes depend on the compiler and platform.",
            },
            {
              type: "heading",
              text: "Measuring types with sizeof",
              level: 2,
            },
            {
              type: "syntax",
              language: "c",
              code: c`sizeof(type)        /* e.g. sizeof(int)   */
sizeof expression   /* e.g. sizeof total  */`,
              md: "`sizeof` is an **operator** (a keyword, not a function) that gives the size in bytes. Its result has the unsigned type `size_t`, whose proper format specifier is `%zu`. In this course we cast it to `int` and print with `%d`, which works with every compiler.",
            },
            {
              type: "code",
              language: "c",
              title: "Sizes on your machine (output varies by platform)",
              runnable: true,
              code: c`#include <stdio.h>

int main(void)
{
    printf("char:        %d byte(s)\n", (int)sizeof(char));
    printf("short:       %d byte(s)\n", (int)sizeof(short));
    printf("int:         %d byte(s)\n", (int)sizeof(int));
    printf("long:        %d byte(s)\n", (int)sizeof(long));
    printf("long long:   %d byte(s)\n", (int)sizeof(long long));
    printf("float:       %d byte(s)\n", (int)sizeof(float));
    printf("double:      %d byte(s)\n", (int)sizeof(double));
    return 0;
}`,
              walkthrough: [
                { lines: "5", text: "`sizeof(char)` is 1 on every C implementation, by definition." },
                { lines: "6-9", text: "Typical results: short 2, int 4, long 4 (Windows) or 8 (64-bit Linux/macOS), long long 8. Run it to see your platform's values." },
                { lines: "10-11", text: "Typically float 4 and double 8 (IEEE 754 single and double precision)." },
              ],
            },
            {
              type: "heading",
              text: "Signed and unsigned",
              level: 2,
            },
            {
              type: "definition",
              term: "Signed integer",
              md: "An integer type that can hold negative and positive values. With n bits (two's complement, used by all modern machines), the range is −2ⁿ⁻¹ to 2ⁿ⁻¹ − 1. `int`, `short` and `long` are signed by default.",
            },
            {
              type: "definition",
              term: "Unsigned integer",
              md: "An integer type that holds only zero and positive values. With n bits the range is 0 to 2ⁿ − 1. Declared with the `unsigned` keyword: `unsigned int`, `unsigned char`, etc.",
            },
            {
              type: "table",
              caption: "Range from number of bits",
              headers: ["Bits", "Signed range", "Unsigned range"],
              rows: [
                ["8", "−128 … 127", "0 … 255"],
                ["16", "−32,768 … 32,767", "0 … 65,535"],
                ["32", "−2,147,483,648 … 2,147,483,647", "0 … 4,294,967,295"],
                ["64", "about −9.22×10¹⁸ … 9.22×10¹⁸", "0 … about 1.84×10¹⁹"],
              ],
            },
            {
              type: "markdown",
              md: "The header `limits.h` defines constants for every integer type's limits, so you never need to memorise them. The values printed below are the same on all mainstream platforms, because `char` is 8 bits and `short` is 16 bits on all of them.",
            },
            {
              type: "code",
              language: "c",
              title: "Looking up limits with limits.h",
              runnable: true,
              code: c`#include <stdio.h>
#include <limits.h>

int main(void)
{
    printf("Bits in a char: %d\n", CHAR_BIT);
    printf("signed char:    %d to %d\n", SCHAR_MIN, SCHAR_MAX);
    printf("unsigned char:  0 to %d\n", UCHAR_MAX);
    printf("short:          %d to %d\n", SHRT_MIN, SHRT_MAX);
    printf("unsigned short: 0 to %d\n", USHRT_MAX);
    return 0;
}`,
              output: `Bits in a char: 8
signed char:    -128 to 127
unsigned char:  0 to 255
short:          -32768 to 32767
unsigned short: 0 to 65535`,
              walkthrough: [
                { lines: "2", text: "`limits.h` defines the range constants for all integer types." },
                { lines: "6", text: "`CHAR_BIT` is the number of bits in a byte — 8." },
                { lines: "7", text: "8-bit signed: −2⁷ to 2⁷ − 1." },
                { lines: "8", text: "8-bit unsigned: 0 to 2⁸ − 1 = 255. The same 8 bits, a different interpretation." },
                { lines: "9-10", text: "16-bit `short`: −32,768 to 32,767 signed, 0 to 65,535 unsigned. Similar constants exist for the other types: `INT_MIN`/`INT_MAX`, `UINT_MAX`, `LONG_MAX`, `LLONG_MAX`..." },
              ],
            },
            {
              type: "heading",
              text: "Going out of range",
              level: 3,
            },
            {
              type: "markdown",
              md: `What happens when a value is too big for its type?

- **Unsigned** types **wrap around** (like a car's odometer): one past the maximum gives 0, and one below 0 gives the maximum. This behaviour is fully defined by the standard.
- **Signed** overflow (e.g. \`INT_MAX + 1\`) is **undefined behaviour**: anything may happen, and optimising compilers really do produce surprising results. Never rely on it.`,
            },
            {
              type: "code",
              language: "c",
              title: "Unsigned wrap-around (well defined)",
              runnable: true,
              code: c`#include <stdio.h>

int main(void)
{
    unsigned char level = 250;

    level = level + 10;
    printf("250 + 10 -> %d\n", level);

    level = 0;
    level = level - 1;
    printf("0 - 1    -> %d\n", level);

    unsigned short counter = 65535;
    counter = counter + 1;
    printf("65535 + 1 -> %u\n", counter);
    return 0;
}`,
              output: `250 + 10 -> 4
0 - 1    -> 255
65535 + 1 -> 0`,
              walkthrough: [
                { lines: "5", text: "An `unsigned char` holds 0–255." },
                { lines: "7", text: "250 + 10 = 260 is computed as an `int`, then stored back into the 8-bit variable. 260 doesn't fit, so it wraps: 260 − 256 = 4." },
                { lines: "8", text: "When passed to `printf`, the small type is promoted to `int`, so `%d` is fine." },
                { lines: "10-12", text: "Going below 0 wraps to the top: 0 − 1 becomes 255." },
                { lines: "14-16", text: "The same for a 16-bit `unsigned short`: 65,535 + 1 wraps to 0. `%u` prints an unsigned value." },
              ],
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: "An n-bit variable can hold exactly 2ⁿ different bit patterns. Unsigned types use all of them for 0 … 2ⁿ − 1. Signed types (two's complement) use half of them for negative numbers, which is why the positive maximum is about half as large and why the range is lopsided (−128 … 127: zero takes one of the \"non-negative\" patterns). Unsigned arithmetic is defined as arithmetic *modulo 2ⁿ* — keep only the lowest n bits — so wrapping is simply what the hardware does when the extra carry bit is thrown away.",
            },
            {
              type: "heading",
              text: "Real-world use",
              level: 3,
            },
            {
              type: "markdown",
              md: "Choosing types carefully matters in practice. Image pixels are usually `unsigned char` (0–255 per colour channel). Network protocols and file formats specify exact sizes, so C99's `stdint.h` provides fixed-width types such as `uint8_t`, `int32_t` and `uint64_t`. Overflow bugs have caused real disasters: the Ariane 5 rocket (1996) was lost when a 64-bit floating value was converted to a 16-bit signed integer that couldn't hold it, and the \"Year 2038 problem\" comes from storing time as a signed 32-bit count of seconds.",
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Assuming int (or long) has the same size everywhere",
                  wrong: c`/* assumes long is 8 bytes - false on Windows */
long big = 5000000000;`,
                  right: c`long long big = 5000000000LL;   /* at least 64 bits everywhere */`,
                  md: "`long` is 4 bytes on Windows and 8 on 64-bit Linux. If you need a guaranteed size, use `long long` (≥ 64 bits) or the fixed-width types from `stdint.h`.",
                },
                {
                  title: "Relying on signed overflow",
                  wrong: c`int x = INT_MAX;
x = x + 1;   /* undefined behaviour! */`,
                  right: c`long long x = INT_MAX;
x = x + 1;   /* fine: long long has room */`,
                  md: "Signed overflow is undefined behaviour — the program may print a negative number, crash, or the compiler may assume it never happens and produce strange code. Use a wider type or check before adding.",
                },
                {
                  title: "Storing a negative value in an unsigned variable",
                  wrong: c`unsigned int temperature = -5;`,
                  right: c`int temperature = -5;`,
                  md: "`-5` is converted to a huge positive number (wrap-around). Use a signed type for anything that can be negative.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "Basic types: `char`, `int`, `float`, `double` (plus `void`); modifiers: `short`, `long`, `signed`, `unsigned`.",
                "`sizeof(char)` is always 1; typical: short 2, int 4, float 4, double 8 bytes.",
                "n-bit signed range: −2ⁿ⁻¹ to 2ⁿ⁻¹−1; unsigned: 0 to 2ⁿ−1.",
                "`limits.h` defines `INT_MAX`, `INT_MIN`, `UINT_MAX`, `CHAR_BIT`, etc.",
                "`sizeof` is an operator, evaluated at compile time for ordinary types.",
                "Unsigned overflow wraps around (defined); signed overflow is undefined behaviour.",
              ],
            },
            {
              type: "recap",
              items: [
                "A type decides size, interpretation and allowed operations.",
                "Sizes vary by platform; the standard guarantees only minimums and ordering.",
                "Unsigned types trade negative numbers for a doubled positive range.",
                "Use `limits.h` and `sizeof` instead of memorising numbers.",
              ],
            },
            {
              type: "exercise",
              id: "c05-ex-range-calc",
              kind: "concept",
              title: "Compute the ranges",
              prompt: "A (hypothetical) machine has 12-bit integers. What are the ranges of a signed and an unsigned 12-bit integer?",
              hint: "2¹¹ = 2048 and 2¹² = 4096.",
              solution: "Signed: −2¹¹ to 2¹¹ − 1 = −2048 to 2047. Unsigned: 0 to 2¹² − 1 = 0 to 4095.",
            },
            {
              type: "exercise",
              id: "c05-ex-predict-wrap",
              kind: "predict",
              title: "Odometer arithmetic",
              prompt: "Predict the output.",
              starterCode: c`#include <stdio.h>

int main(void)
{
    unsigned char a = 200;
    unsigned char b = 100;
    unsigned char sum = a + b;
    printf("%d\n", sum);
    printf("%d\n", a + b);
    return 0;
}`,
              hint: "The sum is computed as an `int`. What happens when it is *stored* in an `unsigned char`?",
              solution: "`a + b` is computed as an `int` (300). Stored in `sum`, it wraps: 300 − 256 = 44. The second `printf` prints the `int` result directly: 300.",
              solutionCode: c`#include <stdio.h>

int main(void)
{
    unsigned char a = 200;
    unsigned char b = 100;
    unsigned char sum = a + b;
    printf("%d\n", sum);
    printf("%d\n", a + b);
    return 0;
}`,
              expectedOutput: `44
300`,
            },
            {
              type: "exercise",
              id: "c05-ex-choose-type",
              kind: "concept",
              title: "Choose a type",
              prompt: "Pick the most suitable type for each: (1) the number of students in a class, (2) a bank balance in euros and cents, (3) one colour channel of a pixel (0–255), (4) the population of the world, (5) a person's initial.",
              hint: "Consider range, sign and whether fractions are needed.",
              solution: "(1) `int`. (2) `double` for simple programs — real banking software stores whole cents in a 64-bit integer (`long long`) to avoid rounding errors. (3) `unsigned char`. (4) `long long` (about 8 billion is more than `INT_MAX`). (5) `char`.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c05-sizeof-char-mcq",
              prompt: "Which statement about sizes is guaranteed by the C standard?",
              options: [
                { id: "a", text: "`sizeof(int)` is 4" },
                { id: "b", text: "`sizeof(char)` is 1" },
                { id: "c", text: "`sizeof(long)` is 8" },
                { id: "d", text: "`sizeof(double)` is 2 × `sizeof(float)`" },
              ],
              correct: "b",
              explanation: "Only `sizeof(char) == 1` is guaranteed. The others are common but platform-dependent.",
            },
            {
              type: "MCQ",
              slug: "c05-unsigned-range-mcq",
              prompt: "What is the range of a 16-bit `unsigned short`?",
              options: [
                { id: "a", text: "−32,768 to 32,767" },
                { id: "b", text: "0 to 32,767" },
                { id: "c", text: "0 to 65,535" },
                { id: "d", text: "0 to 65,536" },
              ],
              correct: "c",
              explanation: "Unsigned n-bit range is 0 to 2ⁿ − 1 = 65,535.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c05-signed-overflow-tf",
              prompt: "Adding 1 to an `int` that holds `INT_MAX` is guaranteed to give `INT_MIN`.",
              correct: false,
              explanation: "Signed integer overflow is undefined behaviour. Only unsigned arithmetic is guaranteed to wrap around.",
            },
            {
              type: "FILL_BLANK",
              slug: "c05-limits-header-fill",
              prompt: "The constant `INT_MAX` is defined in the header file ___.",
              accepted: [["limits.h", "<limits.h>"]],
              explanation: "`limits.h` contains the integer range constants. (Floating-point limits are in `float.h`.)",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c05-wrap-output",
              prompt: "What does this program print?",
              code: c`#include <stdio.h>

int main(void)
{
    unsigned char x = 255;
    x = x + 2;
    unsigned char y = 3;
    y = y - 5;
    printf("%d %d\n", x, y);
    return 0;
}`,
              expected: "1 254",
              explanation: "255 + 2 = 257 wraps to 257 − 256 = 1. 3 − 5 = −2 wraps to 256 − 2 = 254.",
            },
          ],
        },
        {
          slug: "c-float-and-double",
          title: "Floating-point types: float and double",
          summary:
            "Store decimal numbers with float and double, understand precision and rounding errors, and learn how to compare floating-point values safely.",
          estMinutes: 25,
          blocks: [
            {
              type: "objectives",
              items: [
                "Explain the difference between `float` and `double` in size and precision.",
                "Print floating-point values with `%f` and a chosen number of decimals.",
                "Explain why values like 0.1 cannot be stored exactly.",
                "Compare floating-point numbers using a tolerance instead of `==`.",
              ],
            },
            {
              type: "markdown",
              md: `## Numbers with a decimal point

Integers can't store 3.75 or 0.001. For those, C provides **floating-point** types. The name comes from the way they are stored: like scientific notation (\`6.02 × 10²³\`), with a fixed number of significant digits and an exponent that lets the decimal point "float" to wherever it is needed. This gives a huge range — from tiny to astronomical — but a **limited number of significant digits**.

Think of it like a calculator display with room for only a certain number of digits: it can show \`0.000000123\` or \`123000000\`, but not \`123000000.000000123\`.`,
            },
            {
              type: "definition",
              term: "Floating-point number",
              md: "A number stored as a sign, a fraction (significand) and an exponent, in base 2. Almost all modern hardware uses the IEEE 754 format.",
            },
            {
              type: "definition",
              term: "Precision",
              md: "How many significant digits a type can represent reliably: about **6–7** for `float` and about **15–16** for `double`.",
            },
            {
              type: "table",
              caption: "float vs double (IEEE 754, used by virtually all systems)",
              headers: ["", "`float`", "`double`"],
              rows: [
                ["Size", "4 bytes (32 bits)", "8 bytes (64 bits)"],
                ["Significant digits", "≈ 6–7", "≈ 15–16"],
                ["Largest value", "≈ 3.4 × 10³⁸", "≈ 1.8 × 10³⁰⁸"],
                ["Literal", "`2.5f`", "`2.5`"],
                ["printf", "`%f`", "`%f`"],
                ["scanf", "`%f`", "`%lf` (note the `l`!)"],
              ],
            },
            {
              type: "syntax",
              language: "c",
              code: c`float  name = 1.5f;
double name = 1.5;

printf("%f",   value);   /* 6 decimals by default: 1.500000 */
printf("%.2f", value);   /* 2 decimals: 1.50                 */`,
            },
            {
              type: "code",
              language: "c",
              title: "float vs double precision",
              runnable: true,
              code: c`#include <stdio.h>

int main(void)
{
    float  f = 1.0f / 3.0f;
    double d = 1.0 / 3.0;

    printf("float : %.10f\n", f);
    printf("double: %.10f\n", d);

    float price = 19.99f;
    printf("Default %%f : %f\n", price);
    printf("With %%.2f : %.2f\n", price);
    return 0;
}`,
              output: `float : 0.3333333433
double: 0.3333333333
Default %f : 19.990000
With %.2f : 19.99`,
              walkthrough: [
                { lines: "5-6", text: "The same calculation, one third, in both types. Note the `f` suffixes to keep the `float` calculation in `float`." },
                { lines: "8", text: "Printed to 10 decimals, `float` goes wrong after about 7 digits: 0.3333333**433**." },
                { lines: "9", text: "`double` is still correct at 10 decimals." },
                { lines: "11-12", text: "`%f` always prints 6 decimal places. `%%` prints a literal percent sign." },
                { lines: "13", text: "`%.2f` rounds to 2 decimals — what you usually want for money." },
              ],
            },
            {
              type: "callout",
              variant: "tip",
              title: "Prefer double",
              md: "Use `double` for decimal numbers unless you have a specific reason (huge arrays, graphics hardware, microcontrollers) to save memory with `float`. All the maths functions in `math.h` (like `sqrt`) work in `double`.",
            },
            {
              type: "heading",
              text: "Rounding errors are normal",
              level: 2,
            },
            {
              type: "markdown",
              md: "Just as 1/3 cannot be written exactly as a decimal (0.3333...), many simple decimals like **0.1** cannot be written exactly in **binary**. The computer stores the closest value it can. The tiny errors are usually invisible, but they can surface when you print many digits or compare values with `==`.",
            },
            {
              type: "code",
              language: "c",
              title: "0.1 + 0.2 is not exactly 0.3",
              runnable: true,
              code: c`#include <stdio.h>
#include <math.h>

int main(void)
{
    double a = 0.1 + 0.2;
    double b = 0.3;

    printf("a = %.17f\n", a);
    printf("b = %.17f\n", b);

    if (a == b)
        printf("== says: equal\n");
    else
        printf("== says: not equal\n");

    if (fabs(a - b) < 1e-9)
        printf("tolerance says: equal\n");
    return 0;
}`,
              output: `a = 0.30000000000000004
b = 0.29999999999999999
== says: not equal
tolerance says: equal`,
              walkthrough: [
                { lines: "2", text: "`math.h` provides `fabs`, the absolute value of a `double`." },
                { lines: "6-7", text: "Mathematically equal, but each literal is rounded to the nearest binary value, and the addition rounds again." },
                { lines: "9-10", text: "With 17 significant digits we can see that the stored values differ in the last place." },
                { lines: "12-15", text: "`==` compares the exact bits, so it reports *not equal*. (`if`/`else` is covered in chapter 9.)" },
                { lines: "17-18", text: "The safe way: treat two values as equal when their difference is smaller than a tiny tolerance (here 10⁻⁹, written `1e-9`)." },
              ],
            },
            {
              type: "callout",
              variant: "note",
              title: "Exponent notation in printf",
              md: "`%e` prints scientific notation (e.g. `1.234568e+04`) and `%g` chooses the shorter of `%f`/`%e`. The number of exponent digits can differ between C libraries (some older Windows libraries print `e+004`), so this course avoids them in verified outputs.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: "A `double` stores 53 binary digits of significand. Any number that needs more binary digits — like 0.1, which is 0.000110011001100... repeating forever in binary — must be rounded to 53 bits. A `float` keeps only 24 bits, so its rounding error is about 500 million times larger. The exponent lets both types cover a huge range, but the *relative* precision is fixed: big numbers have big gaps between representable values. That's why adding 1 to 16,777,216.0f has no effect — the next representable `float` after it is 16,777,218.",
            },
            {
              type: "heading",
              text: "Real-world use",
              level: 3,
            },
            {
              type: "markdown",
              md: "Floating-point is used for physics simulations, 3D graphics (GPUs mostly use `float` for speed), sensor readings, statistics and machine learning. Because of rounding, **money** is often stored as an integer number of cents in financial software. Games and simulations compare positions with tolerances (\"close enough\") rather than `==`.",
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Comparing floating-point values with ==",
                  wrong: c`if (0.1 + 0.2 == 0.3) { ... }   /* false! */`,
                  right: c`if (fabs((0.1 + 0.2) - 0.3) < 1e-9) { ... }`,
                  md: "Rounding means mathematically equal expressions may differ in the last bit. Compare with a tolerance (and include `math.h` for `fabs`).",
                },
                {
                  title: "Printing a floating value with %d",
                  wrong: c`double avg = 7.5;
printf("%d\n", avg);   /* undefined behaviour */`,
                  right: c`double avg = 7.5;
printf("%.1f\n", avg);`,
                  md: "The format specifier must match the argument's type. `%d` expects an `int`; passing a `double` produces garbage or worse. Use `%f`.",
                },
                {
                  title: "Expecting float to hold many digits",
                  wrong: c`float id_number = 123456789.0f;   /* stored as 123456792 */`,
                  right: c`long id_number = 123456789;       /* exact integer */`,
                  md: "A `float` has only about 7 significant digits. Large whole numbers belong in integer types; use `double` if you really need a decimal type with more digits.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "`float`: 4 bytes, ~6–7 significant digits. `double`: 8 bytes, ~15–16 digits.",
                "Floating literals are `double` by default; `3.5f` is a `float`.",
                "`%f` prints 6 decimals by default; `%.nf` prints n decimals.",
                "`scanf` needs `%f` for `float` but `%lf` for `double`.",
                "Never test floating-point values for exact equality; use a tolerance.",
              ],
            },
            {
              type: "recap",
              items: [
                "Floating-point types store approximate decimal values with a fixed number of significant digits.",
                "`double` is the default and safest choice.",
                "Rounding errors are expected — print with sensible precision and compare with a tolerance.",
              ],
            },
            {
              type: "exercise",
              id: "c05-ex-predict-float-print",
              kind: "predict",
              title: "Formatting decimals",
              prompt: "Predict the output.",
              starterCode: c`#include <stdio.h>

int main(void)
{
    double x = 2.0 / 8.0;
    printf("%f\n", x);
    printf("%.1f\n", x * 10);
    printf("%.3f\n", x + 1);
    return 0;
}`,
              hint: "2/8 = 0.25 exactly (it is a power-of-two fraction).",
              solution: "0.25 with 6 decimals is 0.250000; 2.5 with one decimal is 2.5; 1.25 with three decimals is 1.250.",
              solutionCode: c`#include <stdio.h>

int main(void)
{
    double x = 2.0 / 8.0;
    printf("%f\n", x);
    printf("%.1f\n", x * 10);
    printf("%.3f\n", x + 1);
    return 0;
}`,
              expectedOutput: `0.250000
2.5
1.250`,
            },
            {
              type: "exercise",
              id: "c05-ex-circle",
              kind: "write",
              title: "Circle measurements",
              prompt: "Using `double` variables and `const double PI = 3.14159265;`, compute the circumference (2πr) and area (πr²) of a circle with radius 2.5. Print:\n\n```\nCircumference: 15.71\nArea: 19.63\n```",
              hint: "Use `%.2f`.",
              solutionCode: c`#include <stdio.h>

int main(void)
{
    const double PI = 3.14159265;
    double r = 2.5;

    printf("Circumference: %.2f\n", 2 * PI * r);
    printf("Area: %.2f\n", PI * r * r);
    return 0;
}`,
              expectedOutput: `Circumference: 15.71
Area: 19.63`,
            },
            {
              type: "exercise",
              id: "c05-ex-equality-concept",
              kind: "concept",
              title: "Why not ==?",
              prompt: "A student's program checks `if (total == 1.0)` after adding 0.1 ten times, and the check fails. Explain why and suggest a fix.",
              hint: "Can 0.1 be stored exactly in binary?",
              solution: "0.1 has no exact binary representation, so each addition accumulates a tiny rounding error; the total is 0.9999999999999999, not exactly 1.0. Compare with a tolerance instead: `if (fabs(total - 1.0) < 1e-9)`.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c05-double-scanf-mcq",
              prompt: "Which format specifier should be used to read a `double` with `scanf`?",
              options: [
                { id: "a", text: "`%d`" },
                { id: "b", text: "`%f`" },
                { id: "c", text: "`%lf`" },
                { id: "d", text: "`%df`" },
              ],
              correct: "c",
              explanation: "`scanf` needs `%lf` for `double` (and `%f` for `float`). With `printf`, `%f` works for both.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c05-float-precision-tf",
              prompt: "A `double` typically provides about 15–16 significant decimal digits of precision.",
              correct: true,
              explanation: "IEEE 754 double precision has a 53-bit significand, which corresponds to roughly 15–16 decimal digits.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c05-float-format-output",
              prompt: "What does this program print?",
              code: c`#include <stdio.h>

int main(void)
{
    double price = 4.5;
    int qty = 3;
    printf("%.2f\n", price * qty);
    printf("%f\n", price / 2);
    return 0;
}`,
              expected: `13.50
2.250000`,
              explanation: "4.5 × 3 = 13.5, printed with two decimals. 4.5 / 2 = 2.25, printed with the default six decimals.",
            },
            {
              type: "FILL_BLANK",
              slug: "c05-float-suffix-fill",
              prompt: "To make the literal 2.5 a `float` instead of a `double`, add the suffix ___.",
              accepted: [["f", "F"]],
              explanation: "`2.5f` (or `2.5F`) is a `float` literal.",
            },
          ],
        },
      ],
    },
    {
      slug: "type-conversion",
      title: "Type conversion",
      lessons: [
        {
          slug: "c-type-conversion-and-integer-division",
          title: "Implicit and explicit conversion, and integer division",
          summary:
            "Learn how C converts values between types automatically, how to force a conversion with a cast, and how to avoid the integer-division trap.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Explain implicit conversion (promotion and the usual arithmetic conversions).",
                "Predict what happens when a value is assigned to a narrower type (truncation).",
                "Use a cast to convert a value explicitly.",
                "Predict the results of integer division and the `%` operator, including negative operands.",
                "Compute averages and percentages correctly.",
              ],
            },
            {
              type: "markdown",
              md: `## Mixing types

What is \`7 / 2\`? In maths it is 3.5. In C it is **3**. That surprises almost every beginner — and it follows directly from C's type rules. When an operator is applied to two values, C first looks at their types:

- If **both** are integers, the operation is done in integer arithmetic. For division, the fractional part is simply **thrown away**.
- If **either** is a floating-point type, the other is converted to floating-point first, and the result is a floating-point value.

Converting a value from one type to another is called **type conversion**. It happens in two ways: automatically (**implicit**) or because you asked for it (**explicit**, with a *cast*).`,
            },
            {
              type: "definition",
              term: "Implicit conversion (coercion)",
              md: "A conversion the compiler performs automatically — for example, converting an `int` to `double` in `2.5 * 4`, or converting a `double` to `int` when it is assigned to an `int` variable.",
            },
            {
              type: "definition",
              term: "Explicit conversion (type cast)",
              md: "A conversion you request with the cast operator: `(type) expression`, e.g. `(double) total`.",
            },
            {
              type: "definition",
              term: "Integer promotion",
              md: "Before arithmetic, values of types smaller than `int` (`char`, `short`, and their unsigned versions) are converted to `int`. So `'A' + 1` is computed as `65 + 1` in `int`.",
            },
            {
              type: "definition",
              term: "Usual arithmetic conversions",
              md: "The rule that, when two operands have different types, the one of \"lower rank\" is converted to the type of the other before the operation: roughly `int` → `long` → `long long` → `float` → `double` → `long double`.",
            },
            {
              type: "table",
              caption: "Implicit conversions in action",
              headers: ["Expression / statement", "What happens", "Result"],
              rows: [
                ["`7 / 2`", "int / int → integer division", "`3`"],
                ["`7.0 / 2`", "2 converted to 2.0 → double division", "`3.5`"],
                ["`7 % 2`", "remainder (integers only)", "`1`"],
                ["`'a' + 1`", "'a' promoted to int 97", "`98`"],
                ["`int n = 9.99;`", "double → int: fraction discarded (truncation)", "`n` is `9`"],
                ["`double d = 5;`", "int → double", "`d` is `5.0`"],
                ["`char ch = 66;`", "int → char", "`ch` is `'B'`"],
              ],
            },
            {
              type: "syntax",
              language: "c",
              code: c`(type) expression

(double) sum / count      /* cast sum, THEN divide -> floating division */
(int) 3.99                /* -> 3 (truncation toward zero)               */`,
              md: "A cast applies to the operand immediately to its right. It has higher precedence than `*`, `/` and `%`.",
            },
            {
              type: "code",
              language: "c",
              title: "Integer division, remainder and casts",
              runnable: true,
              code: c`#include <stdio.h>

int main(void)
{
    int a = 7, b = 2;

    printf("a / b            = %d\n", a / b);
    printf("a %% b            = %d\n", a % b);
    printf("7.0 / 2          = %.2f\n", 7.0 / 2);
    printf("(double) a / b   = %.2f\n", (double) a / b);
    printf("(double)(a / b)  = %.2f\n", (double)(a / b));
    printf("-7 / 2 = %d, -7 %% 2 = %d\n", -7 / 2, -7 % 2);
    return 0;
}`,
              output: `a / b            = 3
a % b            = 1
7.0 / 2          = 3.50
(double) a / b   = 3.50
(double)(a / b)  = 3.00
-7 / 2 = -3, -7 % 2 = -1`,
              walkthrough: [
                { lines: "7", text: "Both operands are `int`, so the result is the whole-number part: 3." },
                { lines: "8", text: "`%` gives the remainder of integer division: 7 = 3 × 2 + **1**. (`%%` in the format string prints a single `%`.)" },
                { lines: "9", text: "One operand is a `double`, so `2` is converted to `2.0` and the result is 3.5." },
                { lines: "10", text: "The cast converts `a` to 7.0 **before** dividing, so this is floating division: 3.5." },
                { lines: "11", text: "The parentheses make the integer division happen first (giving 3); converting 3 to `double` afterwards gives 3.00. The cast is too late!" },
                { lines: "12", text: "Since C99, integer division truncates **toward zero**: −3.5 becomes −3, and the remainder takes the sign of the left operand: −1 (because −7 = −3 × 2 + (−1))." },
              ],
            },
            {
              type: "callout",
              variant: "exam",
              title: "The identity that always holds",
              md: "For integers with `b != 0`: `(a / b) * b + a % b == a`. Use it to work out tricky remainders with negative numbers. Dividing an integer by zero (`a / 0` or `a % 0`) is undefined behaviour.",
            },
            {
              type: "markdown",
              md: "The most common real-life version of the trap is computing an **average**. Watch how the result changes with and without a cast, and what happens when a `double` is stored into an `int`.",
            },
            {
              type: "code",
              language: "c",
              title: "Averages and assignment conversions",
              runnable: true,
              code: c`#include <stdio.h>

int main(void)
{
    int sum = 250;
    int count = 3;

    double wrong = sum / count;
    double right = (double) sum / count;
    printf("Wrong average: %.2f\n", wrong);
    printf("Right average: %.2f\n", right);

    int truncated = right;
    printf("Stored in an int: %d\n", truncated);

    char letter = 'A' + 2;
    printf("'A' + 2 = %c (code %d)\n", letter, letter);

    int percent = 100 * 17 / 20;
    printf("17 out of 20 = %d%%\n", percent);
    return 0;
}`,
              output: `Wrong average: 83.00
Right average: 83.33
Stored in an int: 83
'A' + 2 = C (code 67)
17 out of 20 = 85%`,
              walkthrough: [
                { lines: "8", text: "`sum / count` is integer division (83). Only *then* is 83 converted to `double` for storage — the fraction is already lost." },
                { lines: "9", text: "Casting `sum` first makes the division floating: 83.333..." },
                { lines: "13", text: "Assigning a `double` to an `int` silently discards the fraction (truncation toward zero, not rounding). Compilers can warn about this with `-Wconversion`." },
                { lines: "16", text: "`'A'` (65) is promoted to `int`, 2 is added, and 67 is stored back as a `char`: `'C'`." },
                { lines: "19", text: "Order matters with integers: `100 * 17 / 20` = 1700 / 20 = 85. Writing `17 / 20 * 100` would give 0 * 100 = 0!" },
                { lines: "20", text: "`%%` prints the percent sign." },
              ],
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: "Processors have separate instructions for integer and floating-point arithmetic, and each instruction needs both operands in the same format. So before `a / b` can run, C must decide on one common type. The usual arithmetic conversions pick the \"wider\" type so that no range is lost: mixing `int` and `double` means doing the work in `double`. If both are `int`, the integer division instruction runs, and it produces an integer quotient by definition. A cast simply inserts the conversion where *you* want it — which is why its position (`(double)a / b` versus `(double)(a / b)`) makes all the difference.",
            },
            {
              type: "heading",
              text: "Real-world use",
              level: 3,
            },
            {
              type: "markdown",
              md: "Integer division and `%` are genuinely useful: converting 150 minutes into 2 hours (`150 / 60`) and 30 minutes (`150 % 60`), splitting a number into digits (`n % 10`, `n / 10`), checking whether a number is even (`n % 2 == 0`), and finding which page an item is on (`index / items_per_page`). Casts are essential when computing averages, percentages and ratios from integer counts — in grade calculators, analytics dashboards and sensor software.",
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Casting after the integer division",
                  wrong: c`double avg = (double)(sum / count);`,
                  right: c`double avg = (double) sum / count;`,
                  md: "In the wrong version, the integer division happens first inside the parentheses, so the fraction is lost before the cast. Cast an operand, not the result.",
                },
                {
                  title: "Dividing two integer literals",
                  wrong: c`double half = 1 / 2;   /* 0.0 */`,
                  right: c`double half = 1.0 / 2;   /* 0.5 */`,
                  md: "`1 / 2` is integer division (0) no matter what type the result is stored in. Make at least one operand a floating-point literal.",
                },
                {
                  title: "Expecting assignment to an int to round",
                  wrong: c`int rounded = 2.9;   /* 2, not 3 */`,
                  right: c`int rounded = (int)(2.9 + 0.5);   /* 3 (for positive values) */`,
                  md: "Conversion from floating-point to integer truncates toward zero. To round a positive value, add 0.5 first — or use `round()` from `math.h`.",
                },
                {
                  title: "Using % with floating-point numbers",
                  wrong: c`double r = 7.5 % 2;   /* compile error */`,
                  right: c`#include <math.h>
double r = fmod(7.5, 2);   /* 1.5 */`,
                  md: "The `%` operator works only with integer operands. For floating-point remainders use `fmod` from `math.h`.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "int / int gives an int: the fraction is discarded (`7 / 2 == 3`).",
                "Since C99, integer division truncates toward zero: `-7 / 2 == -3`, `-7 % 2 == -1`.",
                "`%` works only on integers; `(a/b)*b + a%b == a`.",
                "In mixed expressions the narrower type is converted to the wider one (`int` → `double`).",
                "Assigning a floating value to an int truncates; assigning an int to a double is exact for typical values.",
                "Cast syntax: `(type) expr`; `(double)a / b` ≠ `(double)(a / b)`.",
              ],
            },
            {
              type: "recap",
              items: [
                "C converts types automatically in mixed expressions and in assignments.",
                "Integer division drops the fractional part — watch out in averages and percentages.",
                "Use a cast on an operand (or a floating literal) to get floating division.",
                "Small types are promoted to `int` before arithmetic.",
              ],
            },
            {
              type: "exercise",
              id: "c05-ex-predict-division",
              kind: "predict",
              title: "Division detective",
              prompt: "Predict every line of output.",
              starterCode: c`#include <stdio.h>

int main(void)
{
    int x = 17, y = 5;
    printf("%d\n", x / y);
    printf("%d\n", x % y);
    printf("%.1f\n", x / 2.0);
    printf("%.1f\n", (float)(x / y));
    printf("%d\n", (int) 9.8 + 1);
    return 0;
}`,
              hint: "Decide for each expression whether it is integer or floating arithmetic.",
              solution: "17/5 = 3; 17%5 = 2; 17/2.0 = 8.5; (float)(17/5) = (float)3 = 3.0; (int)9.8 = 9, plus 1 = 10.",
              solutionCode: c`#include <stdio.h>

int main(void)
{
    int x = 17, y = 5;
    printf("%d\n", x / y);
    printf("%d\n", x % y);
    printf("%.1f\n", x / 2.0);
    printf("%.1f\n", (float)(x / y));
    printf("%d\n", (int) 9.8 + 1);
    return 0;
}`,
              expectedOutput: `3
2
8.5
3.0
10`,
            },
            {
              type: "exercise",
              id: "c05-ex-minutes-split",
              kind: "write",
              title: "Hours and minutes",
              prompt: "Given `int total_minutes = 195;`, use `/` and `%` to print `195 minutes = 3 h 15 min`.",
              hint: "Hours are total / 60; remaining minutes are total % 60.",
              solutionCode: c`#include <stdio.h>

int main(void)
{
    int total_minutes = 195;
    int hours = total_minutes / 60;
    int minutes = total_minutes % 60;

    printf("%d minutes = %d h %d min\n", total_minutes, hours, minutes);
    return 0;
}`,
              expectedOutput: "195 minutes = 3 h 15 min",
            },
            {
              type: "exercise",
              id: "c05-ex-fix-percentage",
              kind: "debug",
              title: "The zero percent bug",
              prompt: "This program should print `Score: 72.50%` but prints `Score: 0.00%`. Find and fix the bug.",
              starterCode: c`#include <stdio.h>

int main(void)
{
    int correct = 29, total = 40;
    double percent = correct / total * 100;
    printf("Score: %.2f%%\n", percent);
    return 0;
}`,
              hint: "Evaluate `correct / total` by hand using integer rules.",
              solution: "`correct / total` is integer division: 29 / 40 = 0, and 0 × 100 = 0. Convert to `double` before dividing.",
              solutionCode: c`#include <stdio.h>

int main(void)
{
    int correct = 29, total = 40;
    double percent = (double) correct / total * 100;
    printf("Score: %.2f%%\n", percent);
    return 0;
}`,
              expectedOutput: "Score: 72.50%",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c05-int-div-mcq",
              prompt: "What is the value of `double r = 9 / 4;`?",
              options: [
                { id: "a", text: "2.25" },
                { id: "b", text: "2.0" },
                { id: "c", text: "2.5" },
                { id: "d", text: "3.0" },
              ],
              correct: "b",
              explanation: "`9 / 4` is integer division (2), which is then converted to 2.0 when stored.",
            },
            {
              type: "MCQ",
              slug: "c05-neg-mod-mcq",
              prompt: "In C99 and later, what is the value of `-13 % 4`?",
              options: [
                { id: "a", text: "1" },
                { id: "b", text: "3" },
                { id: "c", text: "-1" },
                { id: "d", text: "-3" },
              ],
              correct: "c",
              explanation: "-13 / 4 truncates toward zero to -3; -3 × 4 = -12; -13 - (-12) = -1. The remainder has the sign of the left operand.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c05-truncate-tf",
              prompt: "The statement `int n = 4.7;` stores 5 in `n`.",
              correct: false,
              explanation: "Floating-to-integer conversion truncates toward zero, so `n` is 4.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c05-cast-output",
              prompt: "What does this program print?",
              code: c`#include <stdio.h>

int main(void)
{
    int a = 5, b = 2;
    printf("%d %d\n", a / b, a % b);
    printf("%.1f %.1f\n", (double) a / b, (double)(a / b));
    printf("%c\n", 'a' + b);
    return 0;
}`,
              expected: `2 1
2.5 2.0
c`,
              explanation: "Integer 5/2 = 2 remainder 1. Casting `a` first gives 2.5; casting the integer result gives 2.0. 'a' + 2 is the character two places after 'a': 'c'.",
            },
            {
              type: "FILL_BLANK",
              slug: "c05-cast-syntax-fill",
              prompt: "Complete the statement so it performs floating-point division: `double avg = ___ total / n;`",
              accepted: [["(double)", "(float)", "(long double)"]],
              explanation: "Casting the left operand to a floating type before dividing makes the whole division floating-point.",
            },
            {
              type: "CODE_WRITING",
              slug: "c05-average-code",
              prompt: "Read two whole numbers: the **total** of some marks and the **number** of marks (always at least 1). Print the average with exactly two decimal places in the form `Average: X.XX`.\n\nBeware of integer division!\n\nFor input `250 3` the output is `Average: 83.33`.",
              starterCode: c`#include <stdio.h>

int main(void)
{
    int total, count;
    scanf("%d %d", &total, &count);
    /* compute and print the average */
    return 0;
}`,
              sampleTests: [
                { stdin: "250 3", expected: "Average: 83.33" },
                { stdin: "7 2", expected: "Average: 3.50" },
              ],
              hiddenTests: [
                { stdin: "9 3", expected: "Average: 3.00" },
                { stdin: "10 4", expected: "Average: 2.50" },
                { stdin: "1 6", expected: "Average: 0.17" },
              ],
              solutionCode: c`#include <stdio.h>

int main(void)
{
    int total, count;
    scanf("%d %d", &total, &count);

    double average = (double) total / count;
    printf("Average: %.2f\n", average);
    return 0;
}`,
              explanation: "Casting `total` to `double` before dividing keeps the fractional part. Without the cast, 7 / 2 would give 3.00.",
            },
          ],
        },
      ],
    },
  ],
};

export default chapter;
