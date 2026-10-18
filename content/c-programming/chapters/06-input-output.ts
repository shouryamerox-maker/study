import type { ChapterContent } from "../../../src/lib/content/schema";

/** Raw template tag: backslashes in C code (\n, \t, \0) are kept exactly as typed. */
const c = String.raw;

const chapter: ChapterContent = {
  slug: "input-output",
  title: "Input and Output",
  summary:
    "Talk to the user: print neatly formatted output with printf (format specifiers, escape sequences, width and precision) and read values safely with scanf.",
  topics: [
    {
      slug: "formatted-output",
      title: "Formatted output with printf",
      lessons: [
        {
          slug: "c-printf-format-specifiers",
          title: "printf, format specifiers and escape sequences",
          summary:
            "Learn how printf combines a format string with values, which format specifier to use for each type, and how escape sequences produce special characters.",
          estMinutes: 25,
          blocks: [
            {
              type: "objectives",
              items: [
                "Explain how printf's format string and argument list work together.",
                "Choose the correct format specifier for int, unsigned, long, char, string, float and double values.",
                "Print special characters with escape sequences such as \\n, \\t, \\\\ and \\\".",
                "Print integers in decimal, octal and hexadecimal.",
              ],
            },
            {
              type: "markdown",
              md: `## A template with blanks

\`printf\` ("print formatted") works like a fill-in-the-blanks form. The first argument is the **format string** — the template. Every **format specifier** in it (starting with \`%\`) is a blank. The remaining arguments are the values that fill the blanks, **in order**.

\`\`\`c
printf("%s is %d years old\\n", "Ada", 20);
//       ^^     ^^              ^^^^^  ^^
//       blank1 blank2          value1 value2
\`\`\`

prints \`Ada is 20 years old\`. Everything in the format string that is not a specifier or an escape sequence is printed exactly as written.`,
            },
            {
              type: "syntax",
              language: "c",
              code: c`printf("format string", value1, value2, ...);`,
              md: "The number and types of the values must match the specifiers in the format string. `printf` is declared in `stdio.h` and returns the number of characters printed (rarely used).",
            },
            {
              type: "definition",
              term: "Format specifier",
              md: "A placeholder in a format string that starts with `%` and ends with a conversion letter (such as `d`, `f`, `c`, `s`). It tells `printf` the type of the next argument and how to display it.",
            },
            {
              type: "definition",
              term: "Escape sequence",
              md: "A backslash followed by one or more characters, used inside character and string literals to represent characters that are hard to type, such as newline `\\n` or tab `\\t`.",
            },
            {
              type: "table",
              caption: "Common printf format specifiers",
              headers: ["Specifier", "Type of argument", "Example", "Output"],
              rows: [
                ["`%d` or `%i`", "`int` (signed decimal)", "`printf(\"%d\", -42)`", "`-42`"],
                ["`%u`", "`unsigned int`", "`printf(\"%u\", 42u)`", "`42`"],
                ["`%ld`, `%lu`", "`long`, `unsigned long`", "`printf(\"%ld\", 100000L)`", "`100000`"],
                ["`%lld`", "`long long`", "`printf(\"%lld\", 5000000000LL)`", "`5000000000`"],
                ["`%f`", "`double` (and `float`, which is promoted)", "`printf(\"%f\", 2.5)`", "`2.500000`"],
                ["`%e`, `%g`", "`double` in scientific / shortest form", "`printf(\"%g\", 2.5)`", "`2.5`"],
                ["`%c`", "`char` (a single character)", "`printf(\"%c\", 'Z')`", "`Z`"],
                ["`%s`", "string (`char` array)", "`printf(\"%s\", \"hi\")`", "`hi`"],
                ["`%x`, `%X`", "`unsigned int` in hexadecimal", "`printf(\"%x\", 255)`", "`ff`"],
                ["`%o`", "`unsigned int` in octal", "`printf(\"%o\", 8)`", "`10`"],
                ["`%p`", "pointer (address)", "`printf(\"%p\", (void *)&x)`", "an address — varies every run"],
                ["`%%`", "none — prints a percent sign", "`printf(\"100%%\")`", "`100%`"],
              ],
            },
            {
              type: "code",
              language: "c",
              title: "One value, many specifiers",
              runnable: true,
              code: c`#include <stdio.h>

int main(void)
{
    int n = 255;
    char initial = 'K';
    double temp = 36.6;

    printf("Decimal: %d\n", n);
    printf("Octal: %o, Hex: %x, HEX: %X\n", n, n, n);
    printf("Initial: %c (ASCII code %d)\n", initial, initial);
    printf("Temperature: %f\n", temp);
    printf("Name: %s, Score: %d%%\n", "Ken", 97);
    return 0;
}`,
              output: `Decimal: 255
Octal: 377, Hex: ff, HEX: FF
Initial: K (ASCII code 75)
Temperature: 36.600000
Name: Ken, Score: 97%`,
              walkthrough: [
                { lines: "9", text: "`%d` prints the int in decimal." },
                { lines: "10", text: "The same value in octal (`377`) and hexadecimal (`ff`/`FF`). Three specifiers need three arguments, even if they are the same variable." },
                { lines: "11", text: "A `char` can be printed as a character with `%c` or as its numeric code with `%d`." },
                { lines: "12", text: "`%f` prints 6 digits after the decimal point by default (precision is controlled in the next lesson)." },
                { lines: "13", text: "`%s` prints a string; `%%` prints a literal `%`." },
              ],
            },
            {
              type: "heading",
              text: "Escape sequences",
              level: 2,
            },
            {
              type: "table",
              caption: "Escape sequences",
              headers: ["Sequence", "Meaning"],
              rows: [
                ["`\\n`", "Newline — move to the start of the next line"],
                ["`\\t`", "Horizontal tab — jump to the next tab stop"],
                ["`\\\\`", "A single backslash"],
                ["`\\\"`", "A double quote inside a string"],
                ["`\\'`", "A single quote (needed inside a character literal: `'\\''`)"],
                ["`\\r`", "Carriage return — back to the start of the current line"],
                ["`\\a`", "Alert (bell) — may beep"],
                ["`\\b`", "Backspace"],
                ["`\\0`", "The null character (value 0) — marks the end of a string"],
                ["`\\x41`, `\\101`", "Character by hexadecimal / octal code (both are `'A'`)"],
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Escape sequences in action",
              runnable: true,
              code: c`#include <stdio.h>

int main(void)
{
    printf("Name\tScore\n");
    printf("Ada\t95\n");
    printf("She said \"C is great!\"\n");
    printf("Path: C:\\Users\\ada\n");
    printf("It\'s %c and %c\n", '\'', '\x41');
    return 0;
}`,
              output: "Name\tScore\nAda\t95\nShe said \"C is great!\"\nPath: C:\\Users\\ada\nIt's ' and A",
              walkthrough: [
                { lines: "5-6", text: "`\\t` inserts a tab character, which terminals display by jumping to the next tab stop (usually every 8 columns), so the columns line up." },
                { lines: "7", text: "`\\\"` puts a double quote *inside* a string without ending it." },
                { lines: "8", text: "To print one backslash you must write two: `\\\\`." },
                { lines: "9", text: "`\\'` is optional inside a string, but required in the character literal `'\\''`. `'\\x41'` is the character with hex code 41, which is `'A'`." },
              ],
            },
            {
              type: "callout",
              variant: "warning",
              title: "Mismatched specifiers are undefined behaviour",
              md: "If the specifier doesn't match the argument's type — `%d` with a `double`, `%f` with an `int`, `%s` with a `char` — the output is garbage or the program may crash. The compiler does **not** convert the value for you. Compile with `-Wall` and GCC/Clang will warn about mismatches.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: "`printf` is a *variadic* function: it accepts any number of arguments, but it has no way of knowing their types on its own. It walks through the format string character by character, copying ordinary characters to the output. Each time it meets a `%`, it reads the specifier and fetches the **next** argument, *assuming* it has the type the specifier says. That's why the specifiers are the only source of type information — and why a mismatch is so harmful. Escape sequences, on the other hand, are handled by the **compiler**: `\"\\n\"` is stored in the program as a single newline character before `printf` ever runs.",
            },
            {
              type: "heading",
              text: "Real-world use",
              level: 3,
            },
            {
              type: "markdown",
              md: "The printf-style format string is one of C's most influential ideas: Python's `%` formatting, Java's `String.format`, Go's `fmt.Printf`, the shell's `printf` command and many logging libraries use the same specifiers. In C itself, `fprintf` writes the same format to files or to `stderr` for error messages, and `snprintf` builds formatted text in memory — for example to create file names like `photo_0042.jpg`.",
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Wrong specifier for the type",
                  wrong: c`double price = 9.99;
printf("%d\n", price);`,
                  right: c`double price = 9.99;
printf("%f\n", price);`,
                  md: "`%d` expects an `int`. Passing a `double` is undefined behaviour; you might see 0, a random number or a crash. Match every specifier to its argument.",
                },
                {
                  title: "Fewer arguments than specifiers",
                  wrong: c`int a = 3, b = 4;
printf("%d + %d = %d\n", a, b);`,
                  right: c`int a = 3, b = 4;
printf("%d + %d = %d\n", a, b, a + b);`,
                  md: "Each specifier consumes one argument. With a missing argument, `printf` reads whatever happens to be in memory — undefined behaviour.",
                },
                {
                  title: "Using a single backslash in a Windows path",
                  wrong: c`printf("C:\new\table.txt\n");`,
                  right: c`printf("C:\\new\\table.txt\n");`,
                  md: "In the wrong version `\\n` and `\\t` are escape sequences, so the output contains a newline and a tab instead of the folder names. Double each backslash.",
                },
                {
                  title: "Printing a percent sign with a single %",
                  wrong: c`printf("Discount: 20%\n");`,
                  right: c`printf("Discount: 20%%\n");`,
                  md: "`%` always starts a format specifier. Write `%%` to print a literal percent sign.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "`%d`/`%i` int, `%u` unsigned, `%ld` long, `%f` double/float, `%c` char, `%s` string, `%x` hex, `%o` octal, `%%` percent.",
                "Specifiers and arguments are matched left to right; their number and types must agree.",
                "`printf` returns the number of characters printed.",
                "`\\n` newline, `\\t` tab, `\\\\` backslash, `\\\"` double quote, `\\0` null character.",
                "An escape sequence counts as a single character.",
              ],
            },
            {
              type: "recap",
              items: [
                "printf = format string + matching arguments.",
                "Every `%` starts a specifier; choose it by the argument's type.",
                "Escape sequences represent special characters inside literals.",
                "Mismatches are undefined behaviour — let `-Wall` catch them.",
              ],
            },
            {
              type: "exercise",
              id: "c06-ex-predict-specifiers",
              kind: "predict",
              title: "Specifier soup",
              prompt: "Predict the output exactly.",
              starterCode: c`#include <stdio.h>

int main(void)
{
    int x = 26;
    printf("%d %o %x %X\n", x, x, x, x);
    printf("%c%c%c\n", 'C', 'a' + 1, 66);
    printf("50%% of %d is %d\n", x, x / 2);
    return 0;
}`,
              hint: "26 = 3×8 + 2 = 1×16 + 10.",
              solution: "26 is 32 in octal and 1a / 1A in hex. 'a' + 1 is 'b' and 66 is 'B'. The last line prints a literal percent sign.",
              solutionCode: c`#include <stdio.h>

int main(void)
{
    int x = 26;
    printf("%d %o %x %X\n", x, x, x, x);
    printf("%c%c%c\n", 'C', 'a' + 1, 66);
    printf("50%% of %d is %d\n", x, x / 2);
    return 0;
}`,
              expectedOutput: `26 32 1a 1A
CbB
50% of 26 is 13`,
            },
            {
              type: "exercise",
              id: "c06-ex-quote-path",
              kind: "write",
              title: "Quotes and backslashes",
              prompt: "Write a program that prints exactly these two lines:\n\n```\nThe file is in \"D:\\games\\save\"\nUse the \\n escape for a new line\n```",
              hint: "Every `\"` inside the string needs `\\\"` and every backslash needs `\\\\`.",
              solutionCode: c`#include <stdio.h>

int main(void)
{
    printf("The file is in \"D:\\games\\save\"\n");
    printf("Use the \\n escape for a new line\n");
    return 0;
}`,
              expectedOutput: c`The file is in "D:\games\save"
Use the \n escape for a new line`,
            },
            {
              type: "exercise",
              id: "c06-ex-fix-printf",
              kind: "debug",
              title: "Fix the report",
              prompt: "This program should print `Items: 3, Price: 4.50, Grade: A`, but the specifiers are wrong. Fix them.",
              starterCode: c`#include <stdio.h>

int main(void)
{
    int items = 3;
    double price = 4.5;
    char grade = 'A';
    printf("Items: %f, Price: %d, Grade: %s\n", items, price, grade);
    return 0;
}`,
              hint: "int → `%d`, double → `%f` (with a precision), char → `%c`.",
              solution: "`items` is an int (`%d`), `price` is a double (`%.2f` gives two decimals) and `grade` is a single char (`%c`, not `%s`).",
              solutionCode: c`#include <stdio.h>

int main(void)
{
    int items = 3;
    double price = 4.5;
    char grade = 'A';
    printf("Items: %d, Price: %.2f, Grade: %c\n", items, price, grade);
    return 0;
}`,
              expectedOutput: "Items: 3, Price: 4.50, Grade: A",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c06-char-spec-mcq",
              prompt: "Which format specifier prints a single character?",
              options: [
                { id: "a", text: "`%s`" },
                { id: "b", text: "`%c`" },
                { id: "c", text: "`%ch`" },
                { id: "d", text: "`%d`" },
              ],
              correct: "b",
              explanation: "`%c` prints one character; `%s` prints a whole string; `%d` would print the character's numeric code.",
            },
            {
              type: "FILL_BLANK",
              slug: "c06-percent-fill",
              prompt: "To print a literal `%` sign with printf, write ___ in the format string.",
              accepted: [["%%"]],
              explanation: "A single `%` starts a format specifier, so a literal percent sign is written as `%%`.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c06-escape-one-char-tf",
              prompt: "The escape sequence `\\n` is stored as two characters: a backslash and the letter n.",
              correct: false,
              explanation: "The compiler converts `\\n` into a single newline character.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c06-hex-output",
              prompt: "What does this program print?",
              code: c`#include <stdio.h>

int main(void)
{
    int v = 31;
    printf("%d=%x=%o\n", v, v, v);
    printf("\"%c\"\n", 'v');
    return 0;
}`,
              expected: `31=1f=37
"v"`,
              explanation: "31 = 0x1F = 037 (3×8 + 7). `\\\"` prints a double-quote character around the `v`.",
            },
          ],
        },
        {
          slug: "c-printf-width-precision",
          title: "Field width, precision and flags",
          summary:
            "Control exactly how values are laid out: minimum width, number of decimals, left/right alignment, zero padding and plus signs — and use them to build neat tables.",
          estMinutes: 20,
          blocks: [
            {
              type: "objectives",
              items: [
                "Write the full form of a format specifier: %[flags][width][.precision]type.",
                "Set a minimum field width and alignment (right by default, left with -).",
                "Control the number of decimal places with precision, and truncate strings with %.ns.",
                "Use the 0 and + flags, and build aligned tables of output.",
              ],
            },
            {
              type: "markdown",
              md: `## Making output look professional

Compare these two receipts:

\`\`\`
Coffee 3.5          Coffee      3.50
Sandwich 12         Sandwich   12.00
Water 1.25          Water       1.25
\`\`\`

The second is easier to read because every price has the **same width** and **two decimals**. \`printf\` can do this for you. Between the \`%\` and the conversion letter you can add **flags**, a **width** and a **precision**.`,
            },
            {
              type: "syntax",
              language: "c",
              code: c`%[flags][width][.precision]type

%8d      int, at least 8 characters wide, right-aligned
%-8d     int, at least 8 wide, left-aligned
%08d     int, at least 8 wide, padded with zeros
%+d      int, always show the sign
%.2f     double with exactly 2 decimals
%10.3f   double, 3 decimals, at least 10 wide
%.3s     at most 3 characters of a string
%*d      width taken from an extra int argument`,
            },
            {
              type: "definition",
              term: "Field width",
              md: "The **minimum** number of characters to print. Shorter output is padded with spaces (on the left by default). Longer output is **never** cut off — the field just grows.",
            },
            {
              type: "definition",
              term: "Precision",
              md: "Written as a dot followed by a number. For `%f` it is the number of digits after the decimal point (the value is rounded). For `%s` it is the maximum number of characters printed. For integers it is the minimum number of digits.",
            },
            {
              type: "definition",
              term: "Flag",
              md: "A character that modifies formatting: `-` left-align, `0` pad numbers with zeros, `+` always show a sign, space (put a space before positive numbers), `#` alternate form (e.g. `0x` prefix for hex).",
            },
            {
              type: "code",
              language: "c",
              title: "Width, precision and flags (brackets show the field edges)",
              runnable: true,
              code: c`#include <stdio.h>

int main(void)
{
    int n = 42;
    double pi = 3.14159;

    printf("[%d]\n", n);
    printf("[%6d]\n", n);
    printf("[%-6d]\n", n);
    printf("[%06d]\n", n);
    printf("[%+d] [%+d]\n", n, -n);
    printf("[%.2f]\n", pi);
    printf("[%9.3f]\n", pi);
    printf("[%-9.1f]\n", pi);
    printf("[%.3s]\n", "Programming");
    printf("[%8s] [%-8s]\n", "left", "right");
    printf("[%2d]\n", 12345);
    printf("[%#x] [%#o]\n", 255, 8);
    return 0;
}`,
              output: `[42]
[    42]
[42    ]
[000042]
[+42] [-42]
[3.14]
[    3.142]
[3.1      ]
[Pro]
[    left] [right   ]
[12345]
[0xff] [010]`,
              walkthrough: [
                { lines: "8", text: "No width: as many characters as needed." },
                { lines: "9", text: "Width 6: four spaces + `42`, right-aligned." },
                { lines: "10", text: "The `-` flag left-aligns; padding goes on the right." },
                { lines: "11", text: "The `0` flag pads with zeros instead of spaces — handy for IDs and times like `07:05`." },
                { lines: "12", text: "`+` forces a sign on positive numbers too." },
                { lines: "13", text: "Precision 2: rounded to two decimals." },
                { lines: "14", text: "Width 9, precision 3: `3.142` is 5 characters, so 4 spaces are added on the left." },
                { lines: "15", text: "Left-aligned with 1 decimal." },
                { lines: "16", text: "For strings, precision is the maximum number of characters: only `Pro` is printed." },
                { lines: "17", text: "Strings can be right-aligned (default) or left-aligned in a field." },
                { lines: "18", text: "Width is only a minimum: 12345 does not fit in 2 characters, so it is printed in full." },
                { lines: "19", text: "The `#` flag adds a `0x` prefix for hex and a leading `0` for octal." },
              ],
            },
            {
              type: "callout",
              variant: "note",
              title: "Precision rounds",
              md: "`%.2f` **rounds** to two decimals, it does not just chop: 2.678 prints as `2.68`. But remember that values like 2.675 are stored as 2.67499999..., so they may round down. If exact decimal rounding matters (money), work in whole cents.",
            },
            {
              type: "markdown",
              md: "Combining a left-aligned text column with right-aligned number columns produces a tidy table — the classic use of field widths.",
            },
            {
              type: "code",
              language: "c",
              title: "A neatly aligned receipt",
              runnable: true,
              code: c`#include <stdio.h>

int main(void)
{
    printf("%-10s %3s %8s\n", "Item", "Qty", "Price");
    printf("%-10s %3d %8.2f\n", "Coffee", 2, 3.5);
    printf("%-10s %3d %8.2f\n", "Sandwich", 1, 12.0);
    printf("%-10s %3d %8.2f\n", "Water", 3, 1.25);
    printf("%-10s %3s %8.2f\n", "TOTAL", "", 2 * 3.5 + 12.0 + 3 * 1.25);
    printf("Order #%05d\n", 731);
    return 0;
}`,
              output: `Item       Qty    Price
Coffee       2     3.50
Sandwich     1    12.00
Water        3     1.25
TOTAL             22.75
Order #00731`,
              walkthrough: [
                { lines: "5", text: "The header row uses the same widths as the data rows: 10 left-aligned, 3 and 8 right-aligned." },
                { lines: "6-8", text: "Each row: item name padded to 10 characters on the right, quantity in 3 columns, price in 8 columns with 2 decimals. The decimal points line up." },
                { lines: "9", text: "An empty string in the 3-wide Qty field keeps the total aligned. 7.00 + 12.00 + 3.75 = 22.75." },
                { lines: "10", text: "`%05d` gives a fixed-length, zero-padded order number." },
              ],
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: "`printf` first converts the value to text according to the type and precision (for example 3.14159 with `.3` becomes the 5 characters `3.142`). It then compares that length with the width. If the text is shorter, it adds padding — spaces on the left, spaces on the right with `-`, or zeros between the sign and the digits with `0`. Because every row of a table is padded to the same widths, monospaced terminal fonts make the columns line up perfectly.",
            },
            {
              type: "heading",
              text: "Real-world use",
              level: 3,
            },
            {
              type: "markdown",
              md: "Command-line tools such as `ls -l`, `top` and `df` use fixed-width formatting to print aligned columns. Zero padding produces file names (`frame_0007.png`), timestamps (`09:05:03`) and invoice numbers. Bank statements and point-of-sale receipts print money with `%.2f` in fixed-width columns so the decimal points line up.",
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Expecting width to cut long values",
                  wrong: c`printf("[%3d]\n", 123456);   /* expecting [456] or [123] */`,
                  right: c`printf("[%6d]\n", 123456);   /* choose a width that fits */`,
                  md: "Width is a **minimum**. Numbers are never truncated; the field simply expands, which breaks table alignment. Choose a width large enough for your biggest value. (Only strings can be cut, with a precision like `%.3s`.)",
                },
                {
                  title: "Putting the precision before the width",
                  wrong: c`printf("%.2 8f\n", price);`,
                  right: c`printf("%8.2f\n", price);`,
                  md: "The order is fixed: flags, then width, then `.precision`, then the type letter — no spaces inside.",
                },
                {
                  title: "Using precision to round integers",
                  wrong: c`int avg = 7;
printf("%.2d\n", avg);   /* prints 07, not 7.00 */`,
                  right: c`int avg = 7;
printf("%.2f\n", (double) avg);   /* 7.00 */`,
                  md: "For integers, precision means *minimum number of digits*. To show decimals, print a floating-point value with `%f`.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "General form: `%[flags][width][.precision]type`.",
                "Width = minimum characters (right-aligned by default); `-` left-aligns.",
                "`%.nf` → n digits after the decimal point (rounded).",
                "`%.ns` → at most n characters of the string.",
                "`0` flag pads with zeros; `+` shows the sign; `#` adds `0x`/`0` prefixes.",
                "Values longer than the width are printed in full.",
              ],
            },
            {
              type: "recap",
              items: [
                "Width and alignment make columns line up.",
                "Precision controls decimals for floating values and length for strings.",
                "Flags fine-tune padding and signs.",
                "Use the same widths in header and data rows to build tables.",
              ],
            },
            {
              type: "exercise",
              id: "c06-ex-predict-widths",
              kind: "predict",
              title: "Count the spaces",
              prompt: "Predict the output exactly, including spaces inside the brackets.",
              starterCode: c`#include <stdio.h>

int main(void)
{
    printf("[%5d]\n", -17);
    printf("[%-7.2f]\n", 2.5);
    printf("[%04d]\n", 9);
    printf("[%6.2s]\n", "Hello");
    return 0;
}`,
              hint: "The minus sign counts toward the width. For `%6.2s`, first cut the string, then pad it.",
              solution: "`-17` is 3 characters, padded to 5: `[  -17]`. `2.50` left-aligned in 7: `[2.50   ]`. `[0009]`. `He` padded to 6: `[    He]`.",
              solutionCode: c`#include <stdio.h>

int main(void)
{
    printf("[%5d]\n", -17);
    printf("[%-7.2f]\n", 2.5);
    printf("[%04d]\n", 9);
    printf("[%6.2s]\n", "Hello");
    return 0;
}`,
              expectedOutput: `[  -17]
[2.50   ]
[0009]
[    He]`,
            },
            {
              type: "exercise",
              id: "c06-ex-time-format",
              kind: "write",
              title: "Digital clock",
              prompt: "Given `int h = 7, m = 5, s = 3;`, print the time as `07:05:03`.",
              hint: "Use `%02d` three times.",
              solutionCode: c`#include <stdio.h>

int main(void)
{
    int h = 7, m = 5, s = 3;
    printf("%02d:%02d:%02d\n", h, m, s);
    return 0;
}`,
              expectedOutput: "07:05:03",
            },
            {
              type: "exercise",
              id: "c06-ex-grade-table",
              kind: "write",
              title: "Results table",
              prompt: "Print this table exactly (name column 8 characters left-aligned, mark column 6 characters right-aligned with one decimal):\n\n```\nName      Mark\nAda       91.5\nLinus     78.0\nGrace    100.0\n```",
              hint: "Header: `%-8s%6s`. Rows: `%-8s%6.1f`.",
              solutionCode: c`#include <stdio.h>

int main(void)
{
    printf("%-8s%6s\n", "Name", "Mark");
    printf("%-8s%6.1f\n", "Ada", 91.5);
    printf("%-8s%6.1f\n", "Linus", 78.0);
    printf("%-8s%6.1f\n", "Grace", 100.0);
    return 0;
}`,
              expectedOutput: `Name      Mark
Ada       91.5
Linus     78.0
Grace    100.0`,
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c06-width-mcq",
              prompt: "What does `printf(\"[%-5d]\", 42);` print?",
              options: [
                { id: "a", text: "`[   42]`" },
                { id: "b", text: "`[42   ]`" },
                { id: "c", text: "`[00042]`" },
                { id: "d", text: "`[-42]`" },
              ],
              correct: "b",
              explanation: "Width 5, left-aligned with the `-` flag: `42` followed by three spaces.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c06-precision-output",
              prompt: "What does this program print?",
              code: c`#include <stdio.h>

int main(void)
{
    double v = 7.0 / 4;
    printf("%.1f|%6.2f|%-6.3f|\n", v, v, v);
    printf("%03d|%+d\n", 5, 5);
    return 0;
}`,
              expected: `1.8|  1.75|1.750 |
005|+5`,
              explanation: "7/4 = 1.75. `%.1f` rounds to 1.8; `%6.2f` pads `1.75` to 6 characters on the left; `%-6.3f` prints `1.750` and pads one space on the right. `%03d` gives `005`; `%+d` gives `+5`.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c06-width-truncate-tf",
              prompt: "`printf(\"%3d\", 98765);` prints only three digits.",
              correct: false,
              explanation: "The width is a minimum; numbers are never truncated, so all five digits are printed.",
            },
            {
              type: "FILL_BLANK",
              slug: "c06-two-decimals-fill",
              prompt: "Complete the specifier so that a `double` is printed with exactly two digits after the decimal point: `printf(\"%___\", price);`",
              accepted: [[".2f", ".2lf"]],
              explanation: "`%.2f` prints two digits after the decimal point.",
            },
          ],
        },
      ],
    },
    {
      slug: "formatted-input",
      title: "Formatted input with scanf",
      lessons: [
        {
          slug: "c-scanf-input",
          title: "Reading input with scanf",
          summary:
            "Read numbers, characters and words from the keyboard with scanf, understand why it needs the & operator, read several values at once, and avoid the classic scanf pitfalls.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Read int, double, char and single-word string values with scanf.",
                "Explain why scanf needs the address-of operator & for most variables.",
                "Read several values with one scanf call and describe how whitespace is handled.",
                "Use scanf's return value to detect invalid input.",
                "Avoid common pitfalls: missing &, %f vs %lf, leftover newlines with %c, and spaces in strings.",
              ],
            },
            {
              type: "markdown",
              md: `## Asking the user

\`scanf\` ("scan formatted") is the mirror image of \`printf\`: it reads text that the user types, converts it according to format specifiers, and **stores** the results in your variables.

There is one big difference. \`printf\` only needs the *values* of variables. \`scanf\` must *change* your variables, so it needs to know **where they live in memory**. You give it the address with the **address-of operator \`&\`**.

Analogy: to show someone a parcel (printf) you just hand them a copy. To have a courier deliver a parcel to you (scanf), you must give them your **address**.`,
            },
            {
              type: "syntax",
              language: "c",
              code: c`scanf("format string", &variable1, &variable2, ...);

scanf("%d", &age);            /* int                          */
scanf("%lf", &height);        /* double  (note: %lf, not %f)  */
scanf("%f", &weight);         /* float                        */
scanf(" %c", &grade);         /* char    (space skips whitespace) */
scanf("%49s", name);          /* word into char name[50]: no & */`,
            },
            {
              type: "definition",
              term: "Address-of operator (&)",
              md: "The unary operator `&` gives the memory address of a variable. `&age` means \"the location where `age` is stored\". scanf writes the converted value to that location.",
            },
            {
              type: "definition",
              term: "Input buffer",
              md: "Keyboard input is collected in a buffer and handed to the program when the user presses Enter. scanf takes characters from this buffer; anything it doesn't use (such as the final newline) **stays there** for the next input call.",
            },
            {
              type: "table",
              caption: "scanf specifiers differ from printf in some cases",
              headers: ["Type", "scanf", "printf"],
              rows: [
                ["`int`", "`%d`", "`%d`"],
                ["`float`", "`%f`", "`%f`"],
                ["`double`", "`%lf`", "`%f` (or `%lf`)"],
                ["`char`", "`%c` (use `\" %c\"` to skip whitespace)", "`%c`"],
                ["string (one word)", "`%s` with an array, no `&`", "`%s`"],
                ["`long`", "`%ld`", "`%ld`"],
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Reading different types",
              runnable: true,
              stdin: "20 1.68\nB\n",
              code: c`#include <stdio.h>

int main(void)
{
    int age;
    double height;
    char grade;

    printf("Enter age and height: ");
    scanf("%d %lf", &age, &height);
    printf("Enter grade: ");
    scanf(" %c", &grade);

    printf("\nAge %d, height %.2f m, grade %c\n", age, height, grade);
    printf("In 5 years you will be %d.\n", age + 5);
    return 0;
}`,
              output: `Enter age and height: Enter grade:
Age 20, height 1.68 m, grade B
In 5 years you will be 25.`,
              walkthrough: [
                { lines: "5-7", text: "Declare variables to receive the input. They don't need initial values because scanf will fill them." },
                { lines: "9", text: "A *prompt* tells the user what to type. (When input is supplied automatically, as with the Run button here, the typed text is not echoed, so the prompts appear next to each other in the output.)" },
                { lines: "10", text: "One call reads two values. `%d` → `int`, `%lf` → `double`. Each variable is passed by address with `&`. The space in the format matches any amount of whitespace, including none." },
                { lines: "12", text: "`\" %c\"` — the leading space skips the newline left over from the previous line before reading the character `B`." },
                { lines: "14", text: "`\\n` at the start of the string moves past the prompt line before printing the results." },
                { lines: "15", text: "The values can be used in calculations like any other variable." },
              ],
            },
            {
              type: "callout",
              variant: "note",
              title: "How scanf treats whitespace",
              md: "Numeric specifiers (`%d`, `%f`, `%lf`) and `%s` automatically skip leading spaces, tabs and newlines. So the user can type `20 1.68`, or `20` and Enter and then `1.68` — both work. `%c` is different: it reads the very next character, **even if it is a space or newline**. A space in the format string skips any whitespace in the input.",
            },
            {
              type: "heading",
              text: "Checking that input succeeded",
              level: 2,
            },
            {
              type: "markdown",
              md: "`scanf` **returns the number of values it successfully stored**. If the user types `abc` where a number was expected, it stops and returns 0, and your variable is left unchanged. If input ends (end of file) before anything is read, it returns `EOF` (a negative constant). Robust programs check this return value. (`if` statements are covered in chapter 9.)",
            },
            {
              type: "code",
              language: "c",
              title: "Validating input with scanf's return value",
              runnable: true,
              stdin: "12 x",
              code: c`#include <stdio.h>

int main(void)
{
    int a = 0, b = 0;
    int count = scanf("%d %d", &a, &b);

    printf("scanf stored %d value(s)\n", count);
    if (count == 2)
        printf("Sum: %d\n", a + b);
    else
        printf("Invalid input: please type two whole numbers\n");
    printf("a = %d, b = %d\n", a, b);
    return 0;
}`,
              output: `scanf stored 1 value(s)
Invalid input: please type two whole numbers
a = 12, b = 0`,
              walkthrough: [
                { lines: "5", text: "Initialising to 0 means we have a known value even if scanf fails." },
                { lines: "6", text: "The input is `12 x`. `%d` reads 12 into `a`. The second `%d` meets `x`, which cannot start a number, so scanf stops. It returns 1." },
                { lines: "8", text: "Shows the return value: 1." },
                { lines: "9-12", text: "Only add when both numbers were read; otherwise show an error." },
                { lines: "13", text: "`b` kept its initial value 0. The `x` is still waiting, unread, in the input buffer." },
              ],
            },
            {
              type: "heading",
              text: "Literal characters in the format",
              level: 3,
            },
            {
              type: "markdown",
              md: "Ordinary characters in the scanf format must appear in the input exactly. For example, `scanf(\"%d/%d/%d\", &day, &month, &year);` reads a date typed as `25/12/2026`. If the user types a different separator, matching stops at that point.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: "In C, function arguments are passed **by value**: the function receives a *copy*. If you wrote `scanf(\"%d\", age)`, scanf would receive a copy of `age`'s current (garbage) value and would have no way to change the real variable. Passing `&age` gives scanf the variable's address; it converts the typed characters into an `int` and writes the bits straight into that memory location. Arrays (used for strings) are different: an array name already *acts as* the address of its first element, so `name` needs no `&`. You'll understand this fully in the pointers chapters.",
            },
            {
              type: "heading",
              text: "Real-world use",
              level: 3,
            },
            {
              type: "markdown",
              md: "`scanf` is ideal for learning, programming-contest problems and simple tools that read numbers from a file or terminal. Production programs usually read a whole line with `fgets` and then convert it with `sscanf` or `strtol`, because this gives better control over errors — but the format specifiers you learn here are exactly the same. Programs that read data files (`fscanf`) use the same rules too.",
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Forgetting the &",
                  wrong: c`int age;
scanf("%d", age);`,
                  right: c`int age;
scanf("%d", &age);`,
                  md: "Without `&`, scanf receives the (garbage) value of `age` and treats it as an address — undefined behaviour, often a crash. GCC with `-Wall` warns: *format '%d' expects argument of type 'int *'*.",
                },
                {
                  title: "Using %f to read a double",
                  wrong: c`double price;
scanf("%f", &price);`,
                  right: c`double price;
scanf("%lf", &price);`,
                  md: "In scanf, `%f` means *pointer to float* (4 bytes). Writing a float's bits into an 8-byte double gives a nonsense value. Use `%lf` for `double`.",
                },
                {
                  title: "Reading a char after a number",
                  wrong: c`scanf("%d", &qty);
scanf("%c", &choice);   /* reads the leftover '\n' */`,
                  right: c`scanf("%d", &qty);
scanf(" %c", &choice);  /* space skips whitespace first */`,
                  md: "After the user types `3` and Enter, the newline remains in the buffer. `%c` reads that newline immediately instead of waiting. A space before `%c` skips it.",
                },
                {
                  title: "Expecting %s to read a full name",
                  wrong: c`char name[50];
scanf("%s", name);   /* "Ada Lovelace" -> only "Ada" */`,
                  right: c`char name[50];
fgets(name, sizeof name, stdin);   /* reads the whole line */`,
                  md: "`%s` stops at the first whitespace, so it reads one word. To read a line with spaces, use `fgets` (chapter 15). Also always give a width like `%49s` so a long word cannot overflow the array.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "scanf stores values, so it needs addresses: `&variable` (except for arrays/strings).",
                "`%lf` for `double` in scanf; `%f` for `float`.",
                "scanf returns the number of items successfully assigned, or `EOF` at end of input.",
                "Numeric specifiers and `%s` skip leading whitespace; `%c` does not — use `\" %c\"`.",
                "`%s` reads a single word (stops at whitespace).",
                "Non-whitespace characters in the format must match the input exactly.",
              ],
            },
            {
              type: "recap",
              items: [
                "scanf converts typed text into values and stores them through addresses.",
                "Use the right specifier for each type and remember the `&`.",
                "One scanf call can read several values separated by whitespace.",
                "Check the return value to catch bad input.",
              ],
            },
            {
              type: "exercise",
              id: "c06-ex-fix-scanf",
              kind: "debug",
              title: "Three scanf bugs",
              prompt: "With the input `4 2.5 y` this program should print `4 x 2.50 = 10.00, confirmed: y`, but it has three bugs. Fix them.",
              starterCode: c`#include <stdio.h>

int main(void)
{
    int qty;
    double price;
    char ok;
    scanf("%d", qty);
    scanf("%f", &price);
    scanf("%c", &ok);
    printf("%d x %.2f = %.2f, confirmed: %c\n", qty, price, qty * price, ok);
    return 0;
}`,
              hint: "Check the `&`, the specifier for `double`, and what `%c` reads first.",
              solution: "1) `qty` needs `&qty`. 2) A `double` must be read with `%lf`. 3) `%c` would read the space before `y`; use `\" %c\"` to skip whitespace.",
              solutionCode: c`#include <stdio.h>

int main(void)
{
    int qty;
    double price;
    char ok;
    scanf("%d", &qty);
    scanf("%lf", &price);
    scanf(" %c", &ok);
    printf("%d x %.2f = %.2f, confirmed: %c\n", qty, price, qty * price, ok);
    return 0;
}`,
            },
            {
              type: "exercise",
              id: "c06-ex-rectangle-input",
              kind: "write",
              title: "Rectangle from input",
              prompt: "Write a program that reads the width and height of a rectangle as two `double` values and prints `Area: A` and `Perimeter: P`, each with two decimals. For input `3.5 2` it prints:\n\n```\nArea: 7.00\nPerimeter: 11.00\n```",
              hint: "Use `%lf` twice in one scanf call.",
              solutionCode: c`#include <stdio.h>

int main(void)
{
    double w, h;
    scanf("%lf %lf", &w, &h);
    printf("Area: %.2f\n", w * h);
    printf("Perimeter: %.2f\n", 2 * (w + h));
    return 0;
}`,
            },
            {
              type: "exercise",
              id: "c06-ex-why-ampersand",
              kind: "concept",
              title: "Why & for scanf but not printf?",
              prompt: "Explain in your own words why `printf(\"%d\", x)` works without `&` but `scanf(\"%d\", &x)` needs it.",
              hint: "Which function needs to *change* x?",
              solution: "C passes copies of argument values to functions. printf only needs to read x's value, so a copy is enough. scanf must store a new value into x, which is impossible with a copy; it needs x's memory address so it can write there. `&x` supplies that address.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c06-scanf-double-mcq",
              prompt: "Which call correctly reads a value into `double rate;`?",
              options: [
                { id: "a", text: "`scanf(\"%f\", &rate);`" },
                { id: "b", text: "`scanf(\"%lf\", rate);`" },
                { id: "c", text: "`scanf(\"%lf\", &rate);`" },
                { id: "d", text: "`scanf(\"%d\", &rate);`" },
              ],
              correct: "c",
              explanation: "A `double` needs `%lf`, and scanf needs the variable's address, `&rate`.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c06-scanf-return-tf",
              prompt: "scanf returns the number of input items it successfully assigned.",
              correct: true,
              explanation: "For example, `scanf(\"%d %d\", &a, &b)` returns 2 on success, fewer if matching fails, or `EOF` if input ended first.",
            },
            {
              type: "FILL_BLANK",
              slug: "c06-ampersand-fill",
              prompt: "Fill in the missing operator so that scanf can store the value in `count`: `scanf(\"%d\", ___count);`",
              accepted: [["&"]],
              explanation: "The address-of operator `&` gives scanf the location where it should store the value.",
            },
            {
              type: "MCQ",
              slug: "c06-char-skip-mcq",
              prompt: "A program reads a number with `scanf(\"%d\", &n);` and then a character with `scanf(\"%c\", &ch);`. The user types `5`, Enter, `y`, Enter. What is stored in `ch`?",
              options: [
                { id: "a", text: "`'y'`" },
                { id: "b", text: "`'5'`" },
                { id: "c", text: "The newline character `'\\n'`" },
                { id: "d", text: "Nothing — scanf waits forever" },
              ],
              correct: "c",
              explanation: "`%d` leaves the newline in the buffer, and `%c` reads it immediately. Writing `\" %c\"` would skip it and read `'y'`.",
            },
            {
              type: "CODE_WRITING",
              slug: "c06-bill-code",
              prompt: "Read a quantity (whole number) and a unit price (decimal number), then print the bill in exactly this format, with prices to two decimals:\n\n```\nTotal: Q x P = T\n```\n\nFor input `3 2.5` the output is `Total: 3 x 2.50 = 7.50`.",
              starterCode: c`#include <stdio.h>

int main(void)
{
    int qty;
    double price;
    /* read qty and price, then print the bill */
    return 0;
}`,
              sampleTests: [
                { stdin: "3 2.5", expected: "Total: 3 x 2.50 = 7.50" },
                { stdin: "10 0.99", expected: "Total: 10 x 0.99 = 9.90" },
              ],
              hiddenTests: [
                { stdin: "1 100", expected: "Total: 1 x 100.00 = 100.00" },
                { stdin: "0 4.75", expected: "Total: 0 x 4.75 = 0.00" },
                { stdin: "4\n12.3\n", expected: "Total: 4 x 12.30 = 49.20" },
              ],
              solutionCode: c`#include <stdio.h>

int main(void)
{
    int qty;
    double price;
    scanf("%d %lf", &qty, &price);
    printf("Total: %d x %.2f = %.2f\n", qty, price, qty * price);
    return 0;
}`,
              explanation: "Read an `int` with `%d` and a `double` with `%lf` (both with `&`). `qty * price` converts `qty` to `double` automatically.",
            },
          ],
        },
      ],
    },
  ],
};

export default chapter;
