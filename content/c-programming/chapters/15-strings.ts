import type { ChapterContent } from "../../../src/lib/content/schema";

const chapter: ChapterContent = {
  slug: "strings",
  title: "Strings and Character Handling",
  summary:
    "Text in C is an array of characters ending with a special '\\0' terminator. Learn how strings are stored, how to read them safely, how to use the string.h and ctype.h libraries, and how to process text character by character.",
  topics: [
    {
      slug: "strings-and-text",
      title: "Strings in C",
      lessons: [
        {
          slug: "string-basics",
          title: "Character arrays, the null terminator and reading strings",
          summary:
            "How C stores text as a char array ending in '\\0', string literals, printing strings, and reading them with scanf and fgets.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Explain how C represents a string as a char array ending in '\\0'",
                "Declare and initialise strings in several ways and size them correctly",
                "Print strings with %s and puts",
                "Read a word with scanf(\"%s\") and a whole line with fgets, and explain the difference",
              ],
            },
            {
              type: "markdown",
              md: `Many languages have a built-in "string" type. C does not. In C, a **string** is simply an **array of \`char\`** whose last used element is a special character with value 0, written \`'\\0'\` and called the **null terminator**.

Imagine writing a word in a row of boxes on squared paper, one letter per box, and then putting a big **STOP** sign in the box after the last letter. Anyone reading the boxes reads letters until they hit the STOP sign — they do not need to be told the length in advance. That STOP sign is \`'\\0'\`, and every string function in C relies on it.`,
            },
            {
              type: "definition",
              term: "String",
              md: "A sequence of characters stored in a `char` array and terminated by the null character `'\\0'`.",
            },
            {
              type: "definition",
              term: "Null terminator ('\\0')",
              md: "The character with numeric value 0 that marks the end of a string. It is not the digit `'0'` (which has value 48 in ASCII).",
            },
            {
              type: "definition",
              term: "String literal",
              md: "Text written in double quotes in source code, such as `\"hello\"`. The compiler stores it as a char array and adds the `'\\0'` automatically, so `\"hello\"` occupies 6 bytes.",
            },
            {
              type: "table",
              caption: "Memory of char word[6] = \"hello\";",
              headers: ["Index", "0", "1", "2", "3", "4", "5"],
              rows: [["Character", "'h'", "'e'", "'l'", "'l'", "'o'", "'\\0'"]],
            },
            {
              type: "syntax",
              language: "c",
              code: `char name[SIZE];                         /* room for SIZE-1 chars + '\\0' */
char greet[] = "hello";                  /* size 6 chosen automatically */
char greet2[10] = "hello";               /* extra elements set to '\\0' */
char letters[] = {'h', 'i', '\\0'};       /* same as "hi" */

printf("%s", name);                      /* print a string */`,
              md: "Always leave one extra element for the terminator: to store a word of up to 20 letters, declare `char word[21];`.",
            },
            {
              type: "code",
              language: "c",
              title: "Strings are char arrays",
              code: `#include <stdio.h>

int main(void)
{
    char greet[] = "hello";
    char name[10] = "Ada";
    int i;

    printf("%s, %s!\\n", greet, name);

    printf("Characters of greet: ");
    for (i = 0; greet[i] != '\\0'; i++)
        printf("[%c]", greet[i]);
    printf("\\n");

    printf("Array size of greet: %d\\n", (int)sizeof greet);
    printf("Array size of name: %d\\n", (int)sizeof name);

    greet[0] = 'J';
    printf("%s\\n", greet);
    return 0;
}`,
              runnable: true,
              output: `hello, Ada!
Characters of greet: [h][e][l][l][o]
Array size of greet: 6
Array size of name: 10
Jello`,
              walkthrough: [
                { lines: "5", text: "The compiler counts 5 letters plus the terminator, so `greet` is an array of 6 chars." },
                { lines: "6", text: "`name` has room for 10 chars; \"Ada\" uses 3 plus `'\\0'`, and the remaining elements are also set to `'\\0'`." },
                { lines: "9", text: "`%s` prints characters starting at the given array until it reaches `'\\0'`." },
                { lines: "12-13", text: "The standard way to walk a string: keep going until the current character is the terminator. We never need to know the length beforehand." },
                { lines: "16-17", text: "`sizeof` gives the size of the **array** (6 and 10), which is not the same as the length of the text (5 and 3). `sizeof(char)` is always 1, so this is a byte count too." },
                { lines: "19-20", text: "A string stored in a char array can be modified like any array element. Changing index 0 turns \"hello\" into \"Jello\"." },
              ],
            },
            {
              type: "callout",
              variant: "note",
              title: "'A' versus \"A\"",
              md: "Single quotes make a **character** (one `char` value). Double quotes make a **string** (a char array). `'A'` is one byte; `\"A\"` is two bytes: `'A'` followed by `'\\0'`. Mixing them up is a common compile error: `char c = \"A\";` is wrong.",
            },
            {
              type: "heading",
              text: "Reading strings: scanf versus fgets",
              level: 2,
            },
            {
              type: "markdown",
              md: `**\`scanf("%s", name)\`** reads one *word*: it skips leading whitespace, then stops at the next space, tab or newline. Note there is **no \`&\`** before \`name\`, because an array name already gives the address of its first element.

Problems with plain \`%s\`:
- It cannot read "Ada Lovelace" as one string — it stops at the space.
- It has no idea how big your array is. Typing a 50-letter word into \`char name[10]\` writes past the end (undefined behaviour). You can limit it with a width: \`scanf("%9s", name)\`.

**\`fgets(buffer, size, stdin)\`** reads a whole *line*, including spaces, and never stores more than \`size - 1\` characters plus \`'\\0'\`. It **keeps the newline** \`'\\n'\` if there was room for it, so you often remove it afterwards.`,
            },
            {
              type: "syntax",
              language: "c",
              code: `scanf("%19s", word);              /* one word, at most 19 chars */
fgets(line, sizeof line, stdin);   /* a whole line, at most sizeof line - 1 chars */`,
            },
            {
              type: "code",
              language: "c",
              title: "Reading a word and a full line",
              code: `#include <stdio.h>

int main(void)
{
    char first[20];
    char line[50];
    int i;

    scanf("%19s", first);
    printf("Word read by scanf: [%s]\\n", first);

    while (getchar() != '\\n')
        ;   /* discard the rest of the first line */

    fgets(line, sizeof line, stdin);
    printf("Line read by fgets: [%s]\\n", line);

    for (i = 0; line[i] != '\\0'; i++)
        if (line[i] == '\\n')
            line[i] = '\\0';
    printf("After removing newline: [%s]\\n", line);
    return 0;
}`,
              runnable: true,
              stdin: "Ada Lovelace\nCharles Babbage\n",
              output: `Word read by scanf: [Ada]
Line read by fgets: [Charles Babbage
]
After removing newline: [Charles Babbage]`,
              walkthrough: [
                { lines: "9", text: "`%19s` reads one word (stopping at the space) and at most 19 characters, leaving room for `'\\0'` in a 20-char array. No `&` is needed for an array." },
                { lines: "10", text: "Only \"Ada\" was read; \" Lovelace\" and the newline are still waiting in the input." },
                { lines: "12-13", text: "Throw away characters up to and including the newline, so the next read starts on the second line." },
                { lines: "15", text: "`fgets` reads the whole second line including the space, and also stores the `'\\n'` that ended it. `sizeof line` (50) tells it the buffer size." },
                { lines: "16", text: "The brackets show the newline: the closing `]` appears on the next line." },
                { lines: "18-20", text: "Replace the newline with `'\\0'`, which ends the string one character earlier." },
              ],
            },
            {
              type: "callout",
              variant: "warning",
              title: "Never use gets",
              md: "The old function `gets(buffer)` reads a line with **no size limit** and was so dangerous that it was removed from the C language in C11. Use `fgets` instead.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `Because every string ends with \`'\\0'\`, a function only needs the **starting address** of the text: it reads characters one by one until it meets the zero. That is how \`printf("%s")\`, \`puts\`, and every function in \`string.h\` work. The price is responsibility: the array must be big enough for the characters **plus** the terminator, and the terminator must really be there — otherwise functions keep reading past the end of your array.`,
            },
            {
              type: "heading",
              text: "Real-world uses",
              level: 2,
            },
            {
              type: "markdown",
              md: `- Usernames, file names, commands and messages are all strings.
- Network protocols such as HTTP send lines of text that C servers read with line-based functions like \`fgets\`.
- Many famous security holes were caused by copying input into a fixed-size char array without checking its length — which is why size-limited reading matters.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "No room for the terminator",
                  wrong: `char word[5] = "hello";   /* 5 letters, no space for '\\0' */`,
                  right: `char word[6] = "hello";   /* or simply char word[] = "hello"; */`,
                  md: "A string of n characters needs an array of at least n + 1. Without the terminator, printing or measuring the string reads past the array.",
                },
                {
                  title: "Using & with %s",
                  wrong: `char name[20];
scanf("%s", &name);`,
                  right: `char name[20];
scanf("%19s", name);`,
                  md: "The array name already evaluates to the address of its first element. Also give a width so the input cannot overflow the array.",
                },
                {
                  title: "Expecting scanf(\"%s\") to read spaces",
                  wrong: `scanf("%s", fullName);    /* "Ada Lovelace" -> "Ada" */`,
                  right: `fgets(fullName, sizeof fullName, stdin);`,
                  md: "`%s` stops at whitespace. Use `fgets` to read a line that may contain spaces (and remove the trailing newline if needed).",
                },
                {
                  title: "Assigning a string with =",
                  wrong: `char city[20];
city = "Paris";           /* compile error */`,
                  right: `char city[20] = "Paris";  /* at declaration */
/* or later: strcpy(city, "Paris"); */`,
                  md: "Arrays cannot be assigned. Initialise at declaration, or copy with `strcpy` (next lesson).",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "A C string is a char array terminated by '\\0' (value 0).",
                "\"abc\" occupies 4 bytes; sizeof gives array size, not text length.",
                "'A' is a char; \"A\" is a string of two bytes.",
                "scanf(\"%s\") reads a single word and needs no &; use a width like %19s.",
                "fgets reads a line including spaces and keeps the '\\n' if there is room.",
                "gets is unsafe and was removed in C11.",
              ],
            },
            {
              type: "recap",
              items: [
                "Strings are char arrays ending in '\\0'.",
                "Size the array for the text plus one.",
                "Loop with `for (i = 0; s[i] != '\\0'; i++)` to visit each character.",
                "scanf for single words, fgets for whole lines.",
              ],
            },
            {
              type: "exercise",
              id: "c15-ex-count-chars",
              kind: "write",
              title: "Count characters by hand",
              prompt: "Without using `string.h`, write a program with `char text[] = \"programming\";` that counts the characters before `'\\0'` using a loop and prints `Length: 11`.",
              hint: "Start a counter at 0 and increase it while `text[count] != '\\0'`.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    char text[] = "programming";
    int count = 0;
    while (text[count] != '\\0')
        count++;
    printf("Length: %d\\n", count);
    return 0;
}`,
              expectedOutput: "Length: 11",
            },
            {
              type: "exercise",
              id: "c15-ex-predict-terminator",
              kind: "predict",
              title: "Cutting a string short",
              prompt: "Predict the output.",
              starterCode: `#include <stdio.h>

int main(void)
{
    char s[] = "breakfast";
    s[5] = '\\0';
    printf("%s\\n", s);
    printf("%d\\n", (int)sizeof s);
    return 0;
}`,
              hint: "Printing stops at the first '\\0'. sizeof is about the array, which did not change.",
              solution: "Index 5 held 'f'; replacing it with '\\0' ends the string after \"break\". The array is still 10 bytes.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    char s[] = "breakfast";
    s[5] = '\\0';
    printf("%s\\n", s);
    printf("%d\\n", (int)sizeof s);
    return 0;
}`,
              expectedOutput: `break
10`,
            },
            {
              type: "exercise",
              id: "c15-ex-concept-fgets",
              kind: "concept",
              title: "scanf or fgets?",
              prompt: "A program asks the user for their full address. Explain which input function you would use and why, and what extra step you would take after reading.",
              hint: "Addresses contain spaces.",
              solution: "Use `fgets(addr, sizeof addr, stdin)`, because an address contains spaces and `scanf(\"%s\")` stops at the first space; fgets also respects the buffer size. Afterwards, remove the trailing '\\n' that fgets keeps, e.g. by replacing it with '\\0'.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c15-literal-size-mcq",
              prompt: "How many bytes does the array `char s[] = \"C lang\";` occupy?",
              options: [
                { id: "a", text: "5" },
                { id: "b", text: "6" },
                { id: "c", text: "7" },
                { id: "d", text: "8" },
              ],
              correct: "c",
              explanation: "\"C lang\" has 6 characters (including the space) plus the '\\0' terminator.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c15-scanf-space-tf",
              prompt: "`scanf(\"%s\", s)` with the input `New York` stores \"New York\" in s.",
              correct: false,
              explanation: "%s stops at whitespace, so only \"New\" is stored.",
            },
            {
              type: "FILL_BLANK",
              slug: "c15-terminator-fill",
              prompt: "Every C string ends with the null character, written in C as ___.",
              accepted: [["'\\0'", "\\0", "'\\\\0'"]],
              caseSensitive: true,
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c15-predict-loop",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

int main(void)
{
    char s[] = "banana";
    int i, count = 0;
    for (i = 0; s[i] != '\\0'; i++)
        if (s[i] == 'a')
            count++;
    printf("%d\\n", count);
    return 0;
}`,
              expected: "3",
              explanation: "The loop counts the 'a' characters in \"banana\".",
            },
          ],
        },
        {
          slug: "string-library-functions",
          title: "The string.h library",
          summary:
            "Measure, copy, join and compare strings with strlen, strcpy, strcat and strcmp, plus their size-limited cousins, and avoid buffer overflows.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Use strlen, strcpy, strcat and strcmp correctly",
                "Explain the difference between strlen and sizeof",
                "Interpret the return value of strcmp",
                "Recognise and avoid buffer overflows when copying and joining strings",
              ],
            },
            {
              type: "markdown",
              md: `Because strings are arrays, you cannot copy them with \`=\` or compare them with \`==\`. Instead, the header \`<string.h>\` provides ready-made functions that loop over the characters for you.

Think of these functions as office helpers who each do one job with a row of letter boxes: one *counts* letters up to the STOP sign, one *copies* a row into another row, one *appends* a row onto the end of another, and one *compares* two rows alphabetically. None of them checks whether the destination row is long enough — that is still your job.`,
            },
            {
              type: "table",
              caption: "Core string.h functions",
              headers: ["Function", "What it does", "Returns"],
              rows: [
                ["strlen(s)", "Counts characters before '\\0'", "The length (as size_t)"],
                ["strcpy(dest, src)", "Copies src (including '\\0') into dest", "dest"],
                ["strcat(dest, src)", "Appends src to the end of dest", "dest"],
                ["strcmp(a, b)", "Compares a and b character by character", "< 0, 0 or > 0"],
                ["strncpy(dest, src, n)", "Copies at most n chars", "dest"],
                ["strncat(dest, src, n)", "Appends at most n chars, then '\\0'", "dest"],
              ],
            },
            {
              type: "definition",
              term: "Buffer overflow",
              md: "Writing more data into an array (buffer) than it can hold, so the extra bytes overwrite neighbouring memory. It is undefined behaviour and a major source of security vulnerabilities.",
            },
            {
              type: "definition",
              term: "Lexicographic order",
              md: "Dictionary-style ordering of strings, comparing character codes one position at a time. In ASCII, all uppercase letters come before lowercase ones, so \"Zoo\" < \"apple\".",
            },
            {
              type: "syntax",
              language: "c",
              code: `#include <string.h>

size_t len = strlen(s);
strcpy(dest, src);          /* dest must have room for strlen(src) + 1 */
strcat(dest, src);          /* dest must have room for strlen(dest) + strlen(src) + 1 */
if (strcmp(a, b) == 0) { /* equal */ }`,
            },
            {
              type: "code",
              language: "c",
              title: "Measuring, copying and joining",
              code: `#include <stdio.h>
#include <string.h>

int main(void)
{
    char first[20] = "Grace";
    char last[] = "Hopper";
    char full[40];

    printf("strlen(first) = %d\\n", (int)strlen(first));
    printf("sizeof(first) = %d\\n", (int)sizeof first);

    strcpy(full, first);
    strcat(full, " ");
    strcat(full, last);
    printf("Full name: %s (%d chars)\\n", full, (int)strlen(full));

    strcpy(first, "Ada");
    printf("first is now: %s\\n", first);
    return 0;
}`,
              runnable: true,
              output: `strlen(first) = 5
sizeof(first) = 20
Full name: Grace Hopper (12 chars)
first is now: Ada`,
              walkthrough: [
                { lines: "2", text: "Include `string.h` to use the string functions." },
                { lines: "10-11", text: "`strlen` counts characters up to the terminator (5); `sizeof` gives the size of the array (20). `strlen` returns a `size_t`, so we cast it to `int` for `%d`." },
                { lines: "13", text: "Copy \"Grace\" and its terminator into `full`. This is how you \"assign\" a string after declaration." },
                { lines: "14-15", text: "`strcat` finds the `'\\0'` at the end of `full` and writes the new text from there, adding a fresh terminator." },
                { lines: "18", text: "Overwrite `first` with a new, shorter string. The old characters after the new terminator are still in memory but are no longer part of the string." },
              ],
            },
            {
              type: "heading",
              text: "Comparing strings with strcmp",
              level: 2,
            },
            {
              type: "markdown",
              md: `\`strcmp(a, b)\` compares the two strings character by character until they differ or one ends. It returns:

- **0** if the strings are identical,
- a **negative** value if \`a\` comes first in lexicographic order,
- a **positive** value if \`a\` comes after \`b\`.

Only the **sign** is guaranteed. Different libraries may return −1, −32 or any other negative number, so always compare the result with 0 rather than with a specific value like −1.`,
            },
            {
              type: "code",
              language: "c",
              title: "Using strcmp to check passwords and sort two words",
              code: `#include <stdio.h>
#include <string.h>

const char *describe(int r)
{
    if (r < 0) return "comes before";
    if (r > 0) return "comes after";
    return "is equal to";
}

int main(void)
{
    char guess[20];
    char a[] = "apple", b[] = "apricot", c[] = "Zebra";

    printf("apple %s apricot\\n", describe(strcmp(a, b)));
    printf("apricot %s apple\\n", describe(strcmp(b, a)));
    printf("Zebra %s apple\\n", describe(strcmp(c, a)));
    printf("apple %s apple\\n", describe(strcmp(a, "apple")));

    scanf("%19s", guess);
    if (strcmp(guess, "open123") == 0)
        printf("Access granted\\n");
    else
        printf("Access denied\\n");
    return 0;
}`,
              runnable: true,
              stdin: "open123",
              output: `apple comes before apricot
apricot comes after apple
Zebra comes before apple
apple is equal to apple
Access granted`,
              walkthrough: [
                { lines: "4-9", text: "A helper that turns the sign of a comparison result into words. (`const char *` is a pointer to text; pointers are explained in the next chapter — here it simply lets a function return a string literal.)" },
                { lines: "16", text: "\"apple\" and \"apricot\" share \"ap\"; at index 2, 'p' < 'r', so apple comes first and the result is negative." },
                { lines: "18", text: "'Z' (code 90) is smaller than 'a' (code 97) in ASCII, so \"Zebra\" sorts before \"apple\"." },
                { lines: "22-25", text: "The correct way to test equality: `strcmp(...) == 0`. Writing `guess == \"open123\"` would compare addresses, not contents, and would never be true here." },
              ],
            },
            {
              type: "callout",
              variant: "exam",
              title: "strcmp returns 0 for equal",
              md: "`if (strcmp(a, b))` is **true when the strings are different**, because any non-zero value counts as true. Many students get this backwards. Write `strcmp(a, b) == 0` to make your intention clear.",
            },
            {
              type: "callout",
              variant: "warning",
              title: "The size-limited versions have quirks",
              md: "`strncpy(dest, src, n)` does **not** add a `'\\0'` if `src` has n or more characters, so you must terminate it yourself: `dest[n - 1] = '\\0';`. `strncat(dest, src, n)` always adds the terminator, but `n` is the maximum number of characters to **append**, not the size of `dest`.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `Each function is just a loop that relies on the terminator. \`strlen\` counts until \`'\\0'\`; \`strcpy\` copies characters until it has copied a \`'\\0'\`; \`strcat\` first runs to the \`'\\0'\` of \`dest\` and then copies from there; \`strcmp\` walks both strings together until the characters differ or both end. Because the functions only receive addresses, they cannot know the array sizes — which is exactly why you must make sure the destination is large enough.`,
            },
            {
              type: "heading",
              text: "Real-world applications",
              level: 2,
            },
            {
              type: "markdown",
              md: `- Building file paths: \`strcpy(path, dir); strcat(path, "/"); strcat(path, file);\`.
- Command interpreters compare the typed command with known commands using \`strcmp\`.
- Sorting names alphabetically (for example with \`qsort\`) uses \`strcmp\` as the comparison.
- Login systems compare entered usernames (real systems compare hashed passwords, never plain text!).`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Comparing strings with ==",
                  wrong: `if (answer == "yes")
    printf("ok\\n");`,
                  right: `if (strcmp(answer, "yes") == 0)
    printf("ok\\n");`,
                  md: "`==` compares the addresses of the two arrays, which are different even if the text is the same.",
                },
                {
                  title: "Destination too small for strcat",
                  wrong: `char msg[8] = "Hello";
strcat(msg, ", world");   /* needs 13 bytes: overflow */`,
                  right: `char msg[20] = "Hello";
strcat(msg, ", world");`,
                  md: "The destination must hold the old text, the new text and one terminator. Count before you join.",
                },
                {
                  title: "Using strcat on an uninitialised array",
                  wrong: `char out[30];
strcat(out, "data");      /* out has no '\\0' yet */`,
                  right: `char out[30] = "";        /* or out[0] = '\\0'; or strcpy first */
strcat(out, "data");`,
                  md: "`strcat` searches for the existing terminator. In an uninitialised array it might find garbage first. Start with an empty string.",
                },
                {
                  title: "Checking strcmp against -1 or 1",
                  wrong: `if (strcmp(a, b) == -1)   /* not portable */`,
                  right: `if (strcmp(a, b) < 0)`,
                  md: "Only the sign of the result is specified by the standard.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "strlen counts characters before '\\0'; it does not include the terminator.",
                "strcpy and strcat require the destination to have enough space; they do no checking.",
                "strcmp returns 0 when strings are equal, negative if the first is smaller, positive if larger.",
                "Strings cannot be compared with == or assigned with = after declaration.",
                "Uppercase letters sort before lowercase ones in ASCII-based comparisons.",
              ],
            },
            {
              type: "recap",
              items: [
                "#include <string.h> for strlen, strcpy, strcat, strcmp.",
                "strlen ≠ sizeof: text length versus array size.",
                "Test equality with strcmp(a, b) == 0.",
                "Always ensure the destination buffer is big enough.",
              ],
            },
            {
              type: "exercise",
              id: "c15-ex-build-email",
              kind: "write",
              title: "Build an email address",
              prompt: "Given `char user[] = \"alan\";` and `char domain[] = \"example.org\";`, use `strcpy` and `strcat` to build `alan@example.org` in a `char email[40]`, then print it followed by its length in the form `alan@example.org (16)`.",
              hint: "Copy the user, append \"@\", then append the domain.",
              solutionCode: `#include <stdio.h>
#include <string.h>

int main(void)
{
    char user[] = "alan";
    char domain[] = "example.org";
    char email[40];
    strcpy(email, user);
    strcat(email, "@");
    strcat(email, domain);
    printf("%s (%d)\\n", email, (int)strlen(email));
    return 0;
}`,
              expectedOutput: "alan@example.org (16)",
            },
            {
              type: "exercise",
              id: "c15-ex-debug-compare",
              kind: "debug",
              title: "The menu that never matches",
              prompt: "The user types `quit`, but the program never says goodbye. Explain why and fix it.",
              starterCode: `char cmd[20];
scanf("%19s", cmd);
if (cmd == "quit")
    printf("Goodbye\\n");`,
              hint: "What does == compare for arrays?",
              solution: "`cmd == \"quit\"` compares two addresses (the array cmd and the string literal), which are never the same. Include <string.h> and write `if (strcmp(cmd, \"quit\") == 0)`.",
            },
            {
              type: "exercise",
              id: "c15-ex-predict-strlen",
              kind: "predict",
              title: "strlen versus sizeof",
              prompt: "Predict the output.",
              starterCode: `#include <stdio.h>
#include <string.h>

int main(void)
{
    char a[15] = "data";
    strcat(a, "base");
    printf("%s %d %d\\n", a, (int)strlen(a), (int)sizeof a);
    return 0;
}`,
              hint: "strcat appends; sizeof never changes.",
              solution: "After strcat, a holds \"database\" (8 chars). The array is still 15 bytes.",
              solutionCode: `#include <stdio.h>
#include <string.h>

int main(void)
{
    char a[15] = "data";
    strcat(a, "base");
    printf("%s %d %d\\n", a, (int)strlen(a), (int)sizeof a);
    return 0;
}`,
              expectedOutput: "database 8 15",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c15-strcmp-mcq",
              prompt: "What does `strcmp(\"cat\", \"car\")` return?",
              options: [
                { id: "a", text: "0" },
                { id: "b", text: "A negative value" },
                { id: "c", text: "A positive value" },
                { id: "d", text: "The length of the common prefix" },
              ],
              correct: "c",
              explanation: "At index 2, 't' (116) is greater than 'r' (114), so the first string is larger and the result is positive.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c15-predict-strcpy",
              prompt: "What does this program print?",
              code: `#include <stdio.h>
#include <string.h>

int main(void)
{
    char s[20] = "sunshine";
    strcpy(s, "sun");
    printf("%s %d\\n", s, (int)strlen(s));
    return 0;
}`,
              expected: "sun 3",
              explanation: "strcpy copies \"sun\" and its terminator over the start of s, so the string is now just \"sun\".",
            },
            {
              type: "TRUE_FALSE",
              slug: "c15-strcmp-if-tf",
              prompt: "The condition `if (strcmp(a, b))` is true when strings a and b are equal.",
              correct: false,
              explanation: "Equal strings give 0, which is false. The condition is true when they differ.",
            },
            {
              type: "FILL_BLANK",
              slug: "c15-strcat-fill",
              prompt: "The string.h function that appends one string onto the end of another is ___.",
              accepted: [["strcat", "strcat()", "strncat"]],
            },
            {
              type: "CODE_WRITING",
              slug: "c15-code-longer-word",
              prompt: "Read two words (each at most 49 characters, no spaces) from standard input. Print the longer word. If they have the same length, print the one that comes first alphabetically according to `strcmp`.\n\nExample: input `pear banana` → output `banana`.",
              starterCode: `#include <stdio.h>
#include <string.h>

int main(void)
{
    char a[50], b[50];
    scanf("%49s %49s", a, b);
    /* your code here */
    return 0;
}`,
              sampleTests: [
                { stdin: "pear banana", expected: "banana" },
                { stdin: "dog cat", expected: "cat" },
              ],
              hiddenTests: [
                { stdin: "elephant ant", expected: "elephant" },
                { stdin: "same same", expected: "same" },
                { stdin: "Zoo zoo", expected: "Zoo" },
              ],
              solutionCode: `#include <stdio.h>
#include <string.h>

int main(void)
{
    char a[50], b[50];
    int la, lb;
    scanf("%49s %49s", a, b);
    la = (int)strlen(a);
    lb = (int)strlen(b);
    if (la > lb)
        printf("%s\\n", a);
    else if (lb > la)
        printf("%s\\n", b);
    else if (strcmp(a, b) <= 0)
        printf("%s\\n", a);
    else
        printf("%s\\n", b);
    return 0;
}`,
              explanation: "Compare lengths with strlen first; break ties with strcmp, remembering uppercase letters sort before lowercase.",
            },
          ],
        },
      ],
    },
    {
      slug: "character-processing",
      title: "Working with characters",
      lessons: [
        {
          slug: "character-handling-ctype",
          title: "ctype.h and manual string processing",
          summary:
            "Classify and convert characters with ctype.h, and write your own loops to count, transform, reverse and check strings.",
          estMinutes: 35,
          blocks: [
            {
              type: "objectives",
              items: [
                "Explain that characters are small integers (ASCII codes)",
                "Use ctype.h functions such as isalpha, isdigit, isspace, toupper and tolower",
                "Write loops that count, convert and reverse strings in place",
                "Implement your own version of strlen and a palindrome check",
              ],
            },
            {
              type: "markdown",
              md: `Behind the scenes, every \`char\` is just a small integer. The computer stores the letter \`'A'\` as the number 65, \`'a'\` as 97 and the digit \`'0'\` as 48, according to the **ASCII** table. This means you can do arithmetic with characters:

- \`'A' + 1\` is \`'B'\`
- \`'7' - '0'\` is the number 7 (the digit's value)
- \`'a' - 'A'\` is 32, the distance between lower- and uppercase letters

Rather than memorising codes, use the standard header \`<ctype.h>\`, which provides functions to **test** what kind of character something is and to **convert** between cases. They work correctly on any system, not only ASCII ones.`,
            },
            {
              type: "definition",
              term: "ASCII",
              md: "A standard that assigns numbers 0–127 to characters: letters, digits, punctuation and control characters like newline (10). In ASCII, 'A'–'Z' are 65–90, 'a'–'z' are 97–122 and '0'–'9' are 48–57.",
            },
            {
              type: "definition",
              term: "Character classification",
              md: "Deciding which category a character belongs to (letter, digit, whitespace, punctuation...). The `is...` functions in ctype.h return non-zero (true) or 0 (false).",
            },
            {
              type: "table",
              caption: "Common ctype.h functions",
              headers: ["Function", "True (non-zero) when the character is..."],
              rows: [
                ["isalpha(c)", "a letter A–Z or a–z"],
                ["isdigit(c)", "a decimal digit 0–9"],
                ["isalnum(c)", "a letter or a digit"],
                ["isspace(c)", "whitespace: space, tab, newline, ..."],
                ["isupper(c) / islower(c)", "an uppercase / lowercase letter"],
                ["ispunct(c)", "punctuation such as ! , . ?"],
                ["toupper(c) / tolower(c)", "(conversion) returns the upper/lowercase version, or c unchanged"],
              ],
            },
            {
              type: "syntax",
              language: "c",
              code: `#include <ctype.h>

if (isdigit(c)) { ... }    /* test */
c = toupper(c);            /* convert: toupper returns the new value */`,
              md: "The conversion functions **return** the converted character; they do not change their argument. Remember to assign the result.",
            },
            {
              type: "code",
              language: "c",
              title: "Classifying the characters of a line",
              code: `#include <stdio.h>
#include <ctype.h>

int main(void)
{
    char line[100];
    int i, letters = 0, digits = 0, spaces = 0, others = 0;

    fgets(line, sizeof line, stdin);

    for (i = 0; line[i] != '\\0' && line[i] != '\\n'; i++) {
        unsigned char c = line[i];
        if (isalpha(c))
            letters++;
        else if (isdigit(c))
            digits++;
        else if (isspace(c))
            spaces++;
        else
            others++;
    }

    printf("Letters: %d\\n", letters);
    printf("Digits: %d\\n", digits);
    printf("Spaces: %d\\n", spaces);
    printf("Other: %d\\n", others);
    return 0;
}`,
              runnable: true,
              stdin: "Room 101, Floor 3!\n",
              output: `Letters: 9
Digits: 4
Spaces: 3
Other: 2`,
              walkthrough: [
                { lines: "2", text: "`ctype.h` declares the classification and conversion functions." },
                { lines: "9", text: "Read a whole line, spaces included." },
                { lines: "11", text: "Stop at the terminator **or** at the newline kept by fgets, so the newline is not counted as a space." },
                { lines: "12", text: "Copy into an `unsigned char` before calling ctype functions. They are only defined for values representable as `unsigned char` (or EOF); this avoids problems with characters outside plain ASCII." },
                { lines: "13-20", text: "An if–else chain puts each character into exactly one category." },
                { lines: "23-26", text: "For \"Room 101, Floor 3!\": 9 letters (Room, Floor), 4 digits (1,0,1,3), 3 spaces, and 2 others (the comma and the exclamation mark)." },
              ],
            },
            {
              type: "heading",
              text: "Processing strings in place",
              level: 2,
            },
            {
              type: "markdown",
              md: `Many text tasks follow the same plan: walk through the string with an index and change, count or compare characters. Two classic techniques:

- **Single index walk:** \`for (i = 0; s[i] != '\\0'; i++)\` to look at or change each character.
- **Two indices from both ends:** start \`i\` at 0 and \`j\` at the last character (\`strlen(s) - 1\`), and move them toward each other. This is how you reverse a string or check if it is a palindrome.`,
            },
            {
              type: "code",
              language: "c",
              title: "My own strlen, uppercase conversion, reverse and palindrome check",
              code: `#include <stdio.h>
#include <ctype.h>

int myStrlen(const char s[])
{
    int n = 0;
    while (s[n] != '\\0')
        n++;
    return n;
}

void toUpperCase(char s[])
{
    int i;
    for (i = 0; s[i] != '\\0'; i++)
        s[i] = toupper((unsigned char)s[i]);
}

void reverse(char s[])
{
    int i = 0, j = myStrlen(s) - 1;
    char tmp;
    while (i < j) {
        tmp = s[i];
        s[i] = s[j];
        s[j] = tmp;
        i++;
        j--;
    }
}

int isPalindrome(const char s[])
{
    int i = 0, j = myStrlen(s) - 1;
    while (i < j) {
        if (tolower((unsigned char)s[i]) != tolower((unsigned char)s[j]))
            return 0;
        i++;
        j--;
    }
    return 1;
}

int main(void)
{
    char word[] = "Stressed";
    printf("Length: %d\\n", myStrlen(word));
    reverse(word);
    printf("Reversed: %s\\n", word);
    toUpperCase(word);
    printf("Upper: %s\\n", word);
    printf("Racecar palindrome? %d\\n", isPalindrome("Racecar"));
    printf("Hello palindrome? %d\\n", isPalindrome("Hello"));
    return 0;
}`,
              runnable: true,
              output: `Length: 8
Reversed: dessertS
Upper: DESSERTS
Racecar palindrome? 1
Hello palindrome? 0`,
              walkthrough: [
                { lines: "4-10", text: "Our own `strlen`: count characters until the terminator. This is essentially what the library does." },
                { lines: "12-17", text: "Convert in place. `toupper` returns the converted character, so we assign it back to `s[i]`. Non-letters are returned unchanged." },
                { lines: "19-30", text: "Reverse with two indices: swap the outer pair, then move inward until they meet. The terminator stays where it is." },
                { lines: "32-42", text: "Palindrome check: compare mirrored characters, ignoring case with `tolower`. Return 0 as soon as one pair differs; if every pair matched, return 1." },
                { lines: "48-49", text: "\"Stressed\" reversed is \"dessertS\" — the capital S moved to the end." },
                { lines: "52-53", text: "String literals can be passed to functions that take `const char s[]`, because those functions only read the text." },
              ],
            },
            {
              type: "callout",
              variant: "tip",
              title: "Turning digit characters into numbers",
              md: "To convert the character `'7'` into the integer 7, subtract `'0'`: `int d = c - '0';`. This works because the digits '0'–'9' have consecutive codes in every C character set. It is the core of converting a string like \"2024\" into a number by hand: `value = value * 10 + (c - '0');`.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `Characters are integers, so comparisons such as \`c >= 'a'\` and arithmetic such as \`c - '0'\` are just number operations. The ctype functions wrap the details of the character set in clear names, and the terminator gives every loop a natural stopping point. Modifying \`s[i]\` inside a function changes the caller's string because, like any array, a string is passed by the address of its first character.`,
            },
            {
              type: "heading",
              text: "Real-world applications",
              level: 2,
            },
            {
              type: "markdown",
              md: `- Validating input: checking that a phone number has only digits, or a username only letters and digits.
- Case-insensitive search, such as finding "Error" and "ERROR" in log files.
- Word counting and text statistics (editors show word counts this way).
- Simple ciphers like the Caesar cipher shift letters with character arithmetic.
- Parsing numbers from text, as \`atoi\` and \`scanf\` do internally.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Ignoring the return value of toupper",
                  wrong: `toupper(s[i]);             /* result thrown away */`,
                  right: `s[i] = toupper((unsigned char)s[i]);`,
                  md: "ctype conversion functions do not modify their argument. Assign the returned value.",
                },
                {
                  title: "Confusing the digit '0' with the value 0",
                  wrong: `int d = c;                 /* '7' gives 55, not 7 */`,
                  right: `int d = c - '0';           /* '7' - '0' gives 7 */`,
                  md: "A digit character holds its character code. Subtract `'0'` to get its numeric value.",
                },
                {
                  title: "Reversing with the wrong end index",
                  wrong: `int j = strlen(s);         /* points at '\\0' */`,
                  right: `int j = strlen(s) - 1;     /* last real character */`,
                  md: "Starting at `strlen(s)` would swap the terminator to the front, making the string appear empty.",
                },
                {
                  title: "Counting the fgets newline as part of the text",
                  wrong: `for (i = 0; line[i] != '\\0'; i++)
    if (isspace((unsigned char)line[i])) spaces++;   /* counts '\\n' too */`,
                  right: `for (i = 0; line[i] != '\\0' && line[i] != '\\n'; i++)
    if (isspace((unsigned char)line[i])) spaces++;`,
                  md: "fgets keeps the newline. Stop at it (or remove it first) if it should not be counted.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "Characters are stored as integer codes; in ASCII 'A' = 65, 'a' = 97, '0' = 48.",
                "c - '0' converts a digit character to its integer value.",
                "ctype.h is…() functions return non-zero for true and 0 for false.",
                "toupper/tolower return the converted character; they do not change the argument.",
                "Reversing in place uses two indices moving inward, starting at 0 and strlen(s) − 1.",
              ],
            },
            {
              type: "recap",
              items: [
                "Include <ctype.h> to test and convert characters.",
                "Pass characters as unsigned char values to ctype functions.",
                "Walk strings with an index until '\\0'.",
                "Use two indices from both ends for reversing and palindromes.",
              ],
            },
            {
              type: "exercise",
              id: "c15-ex-vowels",
              kind: "write",
              title: "Count vowels",
              prompt: "Write a function `int countVowels(const char s[])` that returns how many vowels (a, e, i, o, u, in either case) a string contains. Print `countVowels(\"Programming In C\")`, which should be 4 (o, a, i and I).",
              hint: "Convert each character with tolower, then compare with the five vowels.",
              solutionCode: `#include <stdio.h>
#include <ctype.h>

int countVowels(const char s[])
{
    int i, count = 0;
    char c;
    for (i = 0; s[i] != '\\0'; i++) {
        c = tolower((unsigned char)s[i]);
        if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u')
            count++;
    }
    return count;
}

int main(void)
{
    printf("%d\\n", countVowels("Programming In C"));
    return 0;
}`,
              expectedOutput: "4",
            },
            {
              type: "exercise",
              id: "c15-ex-predict-char-math",
              kind: "predict",
              title: "Character arithmetic",
              prompt: "Predict the output.",
              starterCode: `#include <stdio.h>

int main(void)
{
    char c = 'C';
    char d = '5';
    printf("%c %c %d\\n", c + 2, c + 32, d - '0' + 1);
    return 0;
}`,
              hint: "'C' + 2 is two letters later; adding 32 to an uppercase ASCII letter gives the lowercase letter.",
              solution: "'C' + 2 = 'E'; 'C' + 32 = 'c'; '5' - '0' + 1 = 6.",
              solutionCode: `#include <stdio.h>

int main(void)
{
    char c = 'C';
    char d = '5';
    printf("%c %c %d\\n", c + 2, c + 32, d - '0' + 1);
    return 0;
}`,
              expectedOutput: "E c 6",
            },
            {
              type: "exercise",
              id: "c15-ex-debug-reverse",
              kind: "debug",
              title: "The disappearing string",
              prompt: "After calling this reverse function, printing the string shows nothing. Find and fix the bug.",
              starterCode: `void reverse(char s[])
{
    int i = 0, j = strlen(s);
    char t;
    while (i < j) {
        t = s[i]; s[i] = s[j]; s[j] = t;
        i++; j--;
    }
}`,
              hint: "What character is at index strlen(s)?",
              solution: "j starts at the terminator, so the first swap moves '\\0' to index 0 and the string looks empty. Start with `j = strlen(s) - 1`.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c15-toupper-mcq",
              prompt: "What is printed by `printf(\"%c\", toupper('7'));`?",
              options: [
                { id: "a", text: "7" },
                { id: "b", text: "Nothing — toupper fails on digits" },
                { id: "c", text: "The character with code 7 − 32" },
                { id: "d", text: "A compile error" },
              ],
              correct: "a",
              explanation: "toupper returns its argument unchanged when it is not a lowercase letter.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c15-predict-digits",
              prompt: "What does this program print?",
              code: `#include <stdio.h>
#include <ctype.h>

int main(void)
{
    char s[] = "a1b22c333";
    int i, total = 0;
    for (i = 0; s[i] != '\\0'; i++)
        if (isdigit((unsigned char)s[i]))
            total += s[i] - '0';
    printf("%d\\n", total);
    return 0;
}`,
              expected: "14",
              explanation: "Only digit characters are added, each converted with - '0': 1 + 2 + 2 + 3 + 3 + 3 = 14.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c15-ascii-order-tf",
              prompt: "In ASCII, every uppercase letter has a smaller code than every lowercase letter.",
              correct: true,
              explanation: "Uppercase letters are 65–90 and lowercase letters are 97–122.",
            },
            {
              type: "FILL_BLANK",
              slug: "c15-digit-value-fill",
              prompt: "If `char c` holds a digit character, the expression `c - ___` gives its numeric value.",
              accepted: [["'0'", "48"]],
              caseSensitive: true,
            },
          ],
        },
      ],
    },
  ],
};

export default chapter;
