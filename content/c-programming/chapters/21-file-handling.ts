import type { ChapterContent } from "../../../src/lib/content/schema";

const chapter: ChapterContent = {
  slug: "file-handling",
  title: "File Handling",
  summary:
    "Streams, FILE pointers and the standard I/O library: opening and closing files, reading and writing text and binary data, and handling errors robustly.",
  topics: [
    {
      slug: "streams-and-text-files",
      title: "Streams and text files",
      lessons: [
        {
          slug: "streams-fopen-fclose",
          title: "Streams, FILE*, fopen and fclose",
          summary:
            "What a stream is, the three standard streams, opening files in the right mode, checking for failure, and formatted file I/O with fprintf and fscanf.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Explain what a stream is and name the three standard streams",
                "Open a file with fopen using the correct mode and check for NULL",
                "Write and read formatted data with fprintf and fscanf",
                "Close files with fclose and explain why closing matters",
              ],
            },
            {
              type: "markdown",
              md: `Every program you have written so far forgets everything the moment it ends. The marks you typed in, the totals you computed, all gone. **Files** let a program save data so that it survives after the program exits, and read data that some other program (or person) created.

C treats every source or destination of bytes, whether the keyboard, the screen or a file on disk, as a **stream**: a sequence of bytes that flows in one direction, like water through a pipe. You have been using streams all along: \`printf\` writes to a stream called \`stdout\`, and \`scanf\` reads from a stream called \`stdin\`. Working with files is mostly a matter of opening a new pipe and using functions you already know with an \`f\` in front of their name.`,
            },
            {
              type: "definition",
              term: "Stream",
              md: "An abstraction for a flow of bytes to or from a device or file. Your program reads from and writes to streams; the C library and operating system handle the actual hardware.",
            },
            {
              type: "definition",
              term: "FILE *",
              md: "A pointer to a `FILE` structure (declared in `<stdio.h>`) that holds everything the library needs to manage an open stream: a buffer, the current position, error and end-of-file flags. You never look inside it; you just pass the pointer to I/O functions.",
            },
            {
              type: "definition",
              term: "Standard streams",
              md: "Three streams opened automatically before `main` starts: `stdin` (standard input, usually the keyboard), `stdout` (standard output, usually the screen) and `stderr` (standard error, for error messages, also usually the screen). All three have type `FILE *`.",
            },
            {
              type: "table",
              caption: "Console functions and their stream equivalents",
              headers: ["Console version", "Stream version", "Notes"],
              rows: [
                ["printf(fmt, ...)", "fprintf(stdout, fmt, ...)", "fprintf works with any FILE *"],
                ["scanf(fmt, ...)", "fscanf(stdin, fmt, ...)", "Returns number of items read, or EOF"],
                ["getchar()", "fgetc(stdin)", "Returns int: a character or EOF"],
                ["putchar(c)", "fputc(c, stdout)", ""],
                ["puts(s)", "fputs(s, stdout)", "puts adds a newline; fputs does not"],
                ["(none safe)", "fgets(buf, n, stdin)", "Reads a line safely, keeping the newline"],
              ],
            },
            {
              type: "code",
              language: "c",
              title: "The standard streams are just FILE pointers",
              runnable: true,
              stdin: "19\n",
              code: `#include <stdio.h>

int main(void) {
    int age;
    fprintf(stdout, "Enter your age:\\n");
    if (fscanf(stdin, "%d", &age) != 1) {
        fprintf(stderr, "That was not a number\\n");
        return 1;
    }
    fprintf(stdout, "Next year you will be %d\\n", age + 1);
    return 0;
}`,
              output: `Enter your age:
Next year you will be 20`,
              walkthrough: [
                { lines: "5", text: "`fprintf(stdout, ...)` is exactly what `printf(...)` does behind the scenes." },
                { lines: "6", text: "`fscanf(stdin, ...)` is the same as `scanf(...)`. It returns how many items it successfully converted." },
                { lines: "7", text: "Error messages go to `stderr`. It is a separate stream, so if the user redirects normal output to a file (`./app > out.txt`), errors still appear on screen." },
                { lines: "10", text: "With input 19, the program prints 20." },
              ],
            },
            { type: "heading", text: "Opening a file: fopen and its modes", level: 2 },
            {
              type: "syntax",
              language: "c",
              code: `FILE *fp = fopen("filename", "mode");
if (fp == NULL) {
    /* could not open: report and stop or recover */
}
/* ... read or write using fp ... */
fclose(fp);`,
              md: "`fopen` returns `NULL` if the file cannot be opened (it does not exist, you lack permission, the disk is full...). Always check.",
            },
            {
              type: "table",
              caption: "fopen modes (add b for binary, e.g. \"rb\", \"wb\")",
              headers: ["Mode", "Meaning", "If file exists", "If file does not exist"],
              rows: [
                ["\"r\"", "Read", "Read from the start", "fopen returns NULL"],
                ["\"w\"", "Write", "**Erased** (truncated to empty)", "Created"],
                ["\"a\"", "Append", "Writes go to the end", "Created"],
                ["\"r+\"", "Read and write", "Kept; start at beginning", "fopen returns NULL"],
                ["\"w+\"", "Read and write", "**Erased**", "Created"],
                ["\"a+\"", "Read and append", "Kept; writes go to end", "Created"],
              ],
            },
            {
              type: "callout",
              variant: "warning",
              title: "\"w\" destroys existing contents",
              md: "Opening an existing file with `\"w\"` immediately empties it, even if you never write anything. Use `\"a\"` to add to the end, or `\"r+\"` to modify in place.",
            },
            {
              type: "definition",
              term: "fclose",
              md: "`int fclose(FILE *fp)` flushes any buffered output to the file, releases the stream's resources and returns 0 on success (EOF on error). After fclose, the pointer must not be used.",
            },
            { type: "heading", text: "Formatted file I/O: fprintf and fscanf", level: 2 },
            {
              type: "markdown",
              md: `The next program writes three lines to a file and then reads them back in the same run. (If the online runner does not allow programs to create files, the example will print its "Could not create" message instead; in that case, try it on your own computer. Files never persist between runs of the online runner.)`,
            },
            {
              type: "code",
              language: "c",
              title: "Write a score file, then read it back",
              runnable: true,
              code: `#include <stdio.h>

int main(void) {
    FILE *fp;
    char name[20];
    int score, total = 0, count = 0;

    fp = fopen("scores.txt", "w");
    if (fp == NULL) {
        printf("Could not create scores.txt\\n");
        return 1;
    }
    fprintf(fp, "Ana 82\\n");
    fprintf(fp, "Ben 75\\n");
    fprintf(fp, "Chen 91\\n");
    fclose(fp);

    fp = fopen("scores.txt", "r");
    if (fp == NULL) {
        printf("Could not open scores.txt\\n");
        return 1;
    }
    while (fscanf(fp, "%19s %d", name, &score) == 2) {
        printf("%-5s %3d\\n", name, score);
        total += score;
        count++;
    }
    fclose(fp);
    printf("Average: %.1f\\n", (double)total / count);
    return 0;
}`,
              output: `Ana    82
Ben    75
Chen   91
Average: 82.7`,
              walkthrough: [
                { lines: "4", text: "A `FILE *` variable will refer to whichever file we currently have open." },
                { lines: "8-12", text: "Open for writing. `\"w\"` creates the file (or empties it if it already exists). Check for NULL before using the pointer." },
                { lines: "13-15", text: "`fprintf` works exactly like `printf`, but the first argument says which stream to write to." },
                { lines: "16", text: "Closing flushes the buffered text to disk. Without it, the reader below might see an empty file." },
                { lines: "18-22", text: "Reopen the same file for reading." },
                { lines: "23", text: "`fscanf` returns how many items it converted. We keep looping while it reads both a name and a score; at end of file it returns EOF and the loop stops. `%19s` stops at 19 characters, protecting the 20-byte array." },
                { lines: "24", text: "`%-5s` left-aligns the name in 5 columns and `%3d` right-aligns the score in 3, making a neat table." },
                { lines: "29", text: "(82 + 75 + 91) / 3 = 82.67, printed to one decimal place as 82.7." },
              ],
            },
            { type: "heading", text: "Handling errors", level: 2 },
            {
              type: "markdown",
              md: `When fopen fails, the library records the reason in a global variable called \`errno\`. The function \`perror("message")\` prints your message followed by a human-readable description of that reason (for example *No such file or directory*) to **stderr**. A robust program checks every fopen, reports the problem clearly and either stops or carries on with a sensible default.`,
            },
            {
              type: "code",
              language: "c",
              title: "Coping with a missing file",
              runnable: true,
              code: `#include <stdio.h>

int main(void) {
    FILE *fp = fopen("does_not_exist.txt", "r");
    if (fp == NULL) {
        perror("fopen");          /* e.g. "fopen: No such file or directory" on stderr */
        printf("Using default settings instead.\\n");
        return 0;
    }
    printf("File opened.\\n");
    fclose(fp);
    return 0;
}`,
              output: "Using default settings instead.",
              walkthrough: [
                { lines: "4", text: "Opening a file that does not exist in `\"r\"` mode fails, so `fopen` returns NULL." },
                { lines: "6", text: "`perror` writes to stderr, so its message is not part of the standard output shown here. The exact wording depends on the system." },
                { lines: "7-8", text: "Instead of crashing, the program recovers gracefully." },
                { lines: "10-11", text: "Never reached here; but notice we only call `fclose` on a pointer that was successfully opened." },
              ],
            },
            { type: "heading", text: "Why it works", level: 2 },
            {
              type: "markdown",
              md: `Talking to a disk is slow, so the C library does not send every \`fprintf\` to the disk immediately. Each \`FILE\` has a **buffer** in memory; output collects there and is written in large chunks when the buffer fills, when you call \`fflush(fp)\`, or when you call \`fclose\`. That is why forgetting \`fclose\` can lose the last part of your output if the program crashes, and why a file you have just written may look empty to another reader until it is closed.

\`fopen\` asks the operating system to open the file and, if that succeeds, allocates a \`FILE\` structure (with its buffer) and returns a pointer to it. \`fclose\` flushes, tells the OS you are done, and frees that structure. Operating systems limit how many files a process may have open at once, so a program that opens files in a loop without closing them will eventually see fopen fail.`,
            },
            { type: "heading", text: "Real-world uses", level: 2 },
            {
              type: "markdown",
              md: `- **Saving and loading**: game saves, configuration files, a gradebook program storing records between runs.
- **Logs**: servers append a line to a log file (mode \`"a"\`) for every request.
- **Data processing**: reading CSV exports from spreadsheets, writing reports.
- **Unix filters**: tools like \`sort\` and \`grep\` read \`stdin\` and write \`stdout\`, so they can be chained with pipes (\`cat data.txt | sort | uniq\`). Writing your programs the same way makes them composable.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Not checking fopen for NULL",
                  wrong: `FILE *fp = fopen("data.txt", "r");
fscanf(fp, "%d", &n);     /* crashes if the file is missing */`,
                  right: `FILE *fp = fopen("data.txt", "r");
if (fp == NULL) {
    perror("data.txt");
    return 1;
}
fscanf(fp, "%d", &n);`,
                  md: "Passing a NULL `FILE *` to any I/O function is undefined behaviour, typically a crash.",
                },
                {
                  title: "Using \"w\" when you meant \"a\"",
                  wrong: `FILE *log = fopen("log.txt", "w");   /* wipes old log */`,
                  right: `FILE *log = fopen("log.txt", "a");   /* adds to the end */`,
                  md: "Mode `\"w\"` truncates the file to zero length the moment it is opened.",
                },
                {
                  title: "Forgetting fclose",
                  wrong: `fp = fopen("out.txt", "w");
fprintf(fp, "result\\n");
fp = fopen("out.txt", "r");   /* first stream never closed */`,
                  right: `fp = fopen("out.txt", "w");
fprintf(fp, "result\\n");
fclose(fp);
fp = fopen("out.txt", "r");`,
                  md: "Unclosed files may not be flushed, and each one holds an OS resource. Close every file you open.",
                },
                {
                  title: "Using backslashes in Windows paths inside strings",
                  wrong: `fopen("C:\\new\\data.txt", "r");   /* \\n is a newline escape! */`,
                  right: `fopen("C:/new/data.txt", "r");      /* forward slashes work */
fopen("C:\\\\new\\\\data.txt", "r");  /* or double the backslashes */`,
                  md: "Inside a C string, a single backslash starts an escape sequence. Use forward slashes or `\\\\`.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "stdin, stdout and stderr are FILE * streams opened automatically before main runs.",
                "fopen returns NULL on failure; always check it before use.",
                "\"w\" creates or truncates; \"a\" creates or appends; \"r\" requires the file to exist.",
                "fprintf/fscanf are printf/scanf with an extra first argument: the FILE *.",
                "fclose flushes buffered output and releases the stream; it returns 0 on success.",
                "perror prints a description of the last error to stderr.",
              ],
            },
            {
              type: "recap",
              items: [
                "A stream is a flow of bytes; FILE * is your handle to it.",
                "Open with fopen in the right mode, check for NULL, close with fclose.",
                "The f-versions of the I/O functions take the stream as an argument.",
                "Report errors to stderr, and recover gracefully when a file is missing.",
              ],
            },
            {
              type: "exercise",
              id: "c21-ex-write-table",
              kind: "write",
              title: "Write a times table to a file",
              prompt: "Write a program that creates `table.txt` containing the lines `7 x 1 = 7` up to `7 x 5 = 35`, closes it, then reopens it and copies each line to the screen using fscanf to read the three numbers on each line.",
              hint: "Write with fprintf(fp, \"%d x %d = %d\\n\", ...). Read with fscanf(fp, \"%d x %d = %d\", &a, &b, &c) == 3.",
              solution: "Literal characters like `x` and `=` in an fscanf format must match the input exactly, so the same format can be used for writing and reading.",
              solutionCode: `#include <stdio.h>

int main(void) {
    int i, a, b, c;
    FILE *fp = fopen("table.txt", "w");
    if (fp == NULL) {
        printf("Cannot create file\\n");
        return 1;
    }
    for (i = 1; i <= 5; i++) {
        fprintf(fp, "%d x %d = %d\\n", 7, i, 7 * i);
    }
    fclose(fp);

    fp = fopen("table.txt", "r");
    if (fp == NULL) {
        printf("Cannot open file\\n");
        return 1;
    }
    while (fscanf(fp, "%d x %d = %d", &a, &b, &c) == 3) {
        printf("%d x %d = %d\\n", a, b, c);
    }
    fclose(fp);
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
              id: "c21-ex-mode-concept",
              kind: "concept",
              title: "Choose the mode",
              prompt: "Which fopen mode would you use for each task?\n\n1. Load a saved game (must exist).\n2. Add today's entry to the end of a diary file.\n3. Export a fresh report, replacing yesterday's.\n4. Update one record in the middle of an existing data file.",
              hint: "Think about whether existing content must survive and where writes should go.",
              solution: "1. \"r\" (or \"rb\" if binary). 2. \"a\". 3. \"w\". 4. \"r+\" (or \"r+b\"), which keeps the content and allows writing at any position after fseek.",
            },
            {
              type: "exercise",
              id: "c21-ex-fix-fopen",
              kind: "debug",
              title: "Fix the crash-prone reader",
              prompt: "This program crashes when `config.txt` is missing. Make it print `No config, using 10` and continue with the value 10 instead. It should then print `Limit: 10`.",
              starterCode: `#include <stdio.h>

int main(void) {
    int limit;
    FILE *fp = fopen("config.txt", "r");
    fscanf(fp, "%d", &limit);
    fclose(fp);
    printf("Limit: %d\\n", limit);
    return 0;
}`,
              hint: "Check fp before calling fscanf or fclose, and give limit a default.",
              solution: "Initialise `limit` to 10 and only read and close the file if fopen succeeded.",
              solutionCode: `#include <stdio.h>

int main(void) {
    int limit = 10;
    FILE *fp = fopen("config.txt", "r");
    if (fp == NULL) {
        printf("No config, using 10\\n");
    } else {
        if (fscanf(fp, "%d", &limit) != 1) {
            limit = 10;
        }
        fclose(fp);
    }
    printf("Limit: %d\\n", limit);
    return 0;
}`,
              expectedOutput: "No config, using 10\nLimit: 10",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c21-fopen-mcq-1",
              prompt: "A file `log.txt` already contains 50 lines. Which mode lets you add a line **without** losing the existing ones?",
              options: [
                { id: "a", text: "\"w\"" },
                { id: "b", text: "\"r\"" },
                { id: "c", text: "\"a\"" },
                { id: "d", text: "\"w+\"" },
              ],
              correct: "c",
              explanation: "\"a\" appends. \"w\" and \"w+\" truncate the file; \"r\" does not allow writing.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c21-stderr-tf-1",
              prompt: "stdin, stdout and stderr must be opened with fopen before you can use them.",
              correct: false,
              explanation: "They are opened automatically before main starts.",
            },
            {
              type: "FILL_BLANK",
              slug: "c21-fopen-fill-1",
              prompt: "If fopen cannot open the requested file, it returns ___.",
              accepted: [["NULL", "a null pointer", "null pointer", "null"]],
              explanation: "Always compare the result of fopen with NULL.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c21-fprintf-output-1",
              prompt: "What does this program print? (Assume the file can be created.)",
              code: `#include <stdio.h>

int main(void) {
    int a, b, sum = 0;
    FILE *fp = fopen("pairs.txt", "w");
    if (fp == NULL) return 1;
    fprintf(fp, "%d %d\\n", 3, 4);
    fprintf(fp, "%d %d\\n", 10, 20);
    fclose(fp);
    fp = fopen("pairs.txt", "r");
    if (fp == NULL) return 1;
    while (fscanf(fp, "%d %d", &a, &b) == 2) {
        sum += a * b;
    }
    fclose(fp);
    printf("%d\\n", sum);
    return 0;
}`,
              expected: "212",
              explanation: "3*4 + 10*20 = 12 + 200 = 212.",
            },
          ],
        },
        {
          slug: "reading-text-files-eof",
          title: "Characters, lines and reading until EOF",
          summary:
            "fgetc/fputc and fgets/fputs, the EOF value, correct end-of-file loops, append mode, and writing filters that read stdin and write stdout.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Read and write single characters with fgetc and fputc",
                "Read whole lines safely with fgets and write them with fputs",
                "Write correct loops that stop at end of file using EOF or NULL",
                "Explain why the result of fgetc must be stored in an int",
              ],
            },
            {
              type: "markdown",
              md: `\`fscanf\` is handy when you know the exact layout of the data. Often you do not: you want to count characters, copy a file, or process it line by line. For that, C offers two pairs of simpler tools:

- **Character at a time**: \`fgetc\` reads one character, \`fputc\` writes one.
- **Line at a time**: \`fgets\` reads one line into a character array, \`fputs\` writes a string.

The key question with any reading loop is: *how do I know when the file has ended?* Each function signals it in its own way, and getting this right is one of the most important skills in this chapter.`,
            },
            {
              type: "definition",
              term: "EOF",
              md: "A macro in `<stdio.h>` meaning \"end of file\". It is a negative `int` (usually -1) returned by functions such as `fgetc`, `getchar` and `fscanf` when no more input is available (or on error). It is not a character stored in the file.",
            },
            {
              type: "syntax",
              language: "c",
              code: `int c;
while ((c = fgetc(fp)) != EOF) {      /* character loop */
    /* use c */
}

char line[100];
while (fgets(line, sizeof line, fp) != NULL) {   /* line loop */
    /* use line (includes '\\n' if the line fitted) */
}`,
              md: "`fgetc` returns EOF at the end; `fgets` returns NULL. `fgets` reads at most `size - 1` characters and always adds the terminating `'\\0'`.",
            },
            {
              type: "code",
              language: "c",
              title: "Counting characters, lines and vowels",
              runnable: true,
              code: `#include <stdio.h>

int main(void) {
    int c, chars = 0, lines = 0, vowels = 0;
    FILE *fp = fopen("poem.txt", "w");
    if (fp == NULL) {
        printf("Cannot write file\\n");
        return 1;
    }
    fputs("Roses are red\\n", fp);
    fputs("Violets are blue\\n", fp);
    fputs("C is for coding\\n", fp);
    fclose(fp);

    fp = fopen("poem.txt", "r");
    if (fp == NULL) {
        printf("Cannot read file\\n");
        return 1;
    }
    while ((c = fgetc(fp)) != EOF) {
        chars++;
        if (c == '\\n') lines++;
        if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') vowels++;
    }
    fclose(fp);
    printf("Characters: %d\\nLines: %d\\nVowels: %d\\n", chars, lines, vowels);
    return 0;
}`,
              output: `Characters: 47
Lines: 3
Vowels: 16`,
              walkthrough: [
                { lines: "4", text: "`c` is an `int`, not a `char`, so it can hold every possible character **and** the distinct value EOF." },
                { lines: "10-12", text: "`fputs` writes a string exactly as given. Unlike `puts`, it does not add a newline, so we include `\\n` ourselves." },
                { lines: "20", text: "The idiom: read a character into `c`, then compare it with EOF. The extra parentheses are essential because `!=` binds tighter than `=`." },
                { lines: "21-23", text: "Every character counts (including newlines: 14 + 17 + 16 = 47). Each `'\\n'` ends a line." },
                { lines: "26", text: "One printf with several `\\n` escapes prints three lines." },
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Line numbers with fgets, and append mode",
              runnable: true,
              code: `#include <stdio.h>

int main(void) {
    char line[64];
    int n = 0;
    FILE *fp = fopen("notes.txt", "w");
    if (fp == NULL) return 1;
    fputs("first line\\n", fp);
    fputs("second line\\n", fp);
    fclose(fp);

    fp = fopen("notes.txt", "a");          /* add to the end */
    if (fp == NULL) return 1;
    fputs("third line\\n", fp);
    fclose(fp);

    fp = fopen("notes.txt", "r");
    if (fp == NULL) return 1;
    while (fgets(line, sizeof line, fp) != NULL) {
        n++;
        printf("%d: %s", n, line);         /* line already ends with \\n */
    }
    fclose(fp);
    return 0;
}`,
              output: `1: first line
2: second line
3: third line`,
              walkthrough: [
                { lines: "6-10", text: "Create the file with two lines." },
                { lines: "12-15", text: "Reopen in `\"a\"` mode: the existing two lines are kept and the new line goes at the end." },
                { lines: "19", text: "`sizeof line` is 64, so fgets reads at most 63 characters per call, never overflowing the array. It returns NULL at end of file." },
                { lines: "21", text: "fgets keeps the newline it read, so the format string has no `\\n` of its own; otherwise lines would be double-spaced." },
              ],
            },
            {
              type: "callout",
              variant: "tip",
              title: "Removing the newline that fgets keeps",
              md: "A common idiom (using `<string.h>`): `line[strcspn(line, \"\\n\")] = '\\0';`. `strcspn` returns the index of the first newline (or the string length if there is none), and we overwrite it with the terminator.",
            },
            { type: "heading", text: "stdin and stdout are streams too: writing a filter", level: 2 },
            {
              type: "markdown",
              md: `Because the keyboard and screen are streams, exactly the same loop that reads a file can read the user's input until they signal end of input (Ctrl+D on Linux/macOS, Ctrl+Z then Enter on Windows, or simply the end of piped input). Programs that read \`stdin\` and write \`stdout\` are called **filters**.`,
            },
            {
              type: "code",
              language: "c",
              title: "An uppercase filter",
              runnable: true,
              stdin: "hello, file world\nbye\n",
              code: `#include <stdio.h>
#include <ctype.h>

int main(void) {
    int c;
    while ((c = fgetc(stdin)) != EOF) {
        fputc(toupper(c), stdout);
    }
    return 0;
}`,
              output: `HELLO, FILE WORLD
BYE`,
              walkthrough: [
                { lines: "2", text: "`<ctype.h>` provides `toupper`, which converts lowercase letters and leaves everything else unchanged." },
                { lines: "6", text: "The same EOF loop as for a file, but the stream is `stdin`." },
                { lines: "7", text: "Write each converted character to `stdout`. Run it as `./upper < notes.txt > NOTES.txt` and it becomes a file converter without changing a line of code." },
              ],
            },
            { type: "heading", text: "Why it works", level: 2 },
            {
              type: "markdown",
              md: `A \`char\` can hold 256 different values, and a file can legitimately contain all of them. To signal "no more data", \`fgetc\` needs a value that is **not** any character, so it returns an \`int\`: characters come back as 0 to 255, and EOF is a negative number. If you store the result in a \`char\`, EOF gets squeezed into the same range as real characters: depending on the system, the loop may never end, or it may stop early at a byte with value 255.

The stream remembers a **position**. Every read moves it forward. When a read tries to go past the last byte, the stream sets its end-of-file flag and the function returns EOF (or NULL for fgets). That is why the check must come **after** the read attempt, as in \`while ((c = fgetc(fp)) != EOF)\`, and not before it with \`feof\`.`,
            },
            { type: "heading", text: "Real-world uses", level: 2 },
            {
              type: "markdown",
              md: `- Word counters, spell checkers and search tools process text character by character or line by line.
- Configuration files are typically read line by line with fgets, then each line is parsed.
- Log analysers read huge files one line at a time so they never need the whole file in memory.
- Compilers start by reading your \`.c\` file character by character.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Storing fgetc's result in a char",
                  wrong: `char c;
while ((c = fgetc(fp)) != EOF) { ... }`,
                  right: `int c;
while ((c = fgetc(fp)) != EOF) { ... }`,
                  md: "A char cannot reliably represent EOF as well as every byte. Always use int.",
                },
                {
                  title: "Looping on feof",
                  wrong: `while (!feof(fp)) {
    fgets(line, sizeof line, fp);
    printf("%s", line);   /* last line printed twice */
}`,
                  right: `while (fgets(line, sizeof line, fp) != NULL) {
    printf("%s", line);
}`,
                  md: "feof only becomes true **after** a read has failed. The loop body runs one extra time with stale data. Test the return value of the read function instead.",
                },
                {
                  title: "Missing parentheses around the assignment",
                  wrong: `while (c = fgetc(fp) != EOF)   /* c becomes 0 or 1 */`,
                  right: `while ((c = fgetc(fp)) != EOF)`,
                  md: "`!=` has higher precedence than `=`, so without the extra parentheses `c` receives the result of the comparison.",
                },
                {
                  title: "Using gets",
                  wrong: `char name[20];
gets(name);              /* removed from C11: no size limit */`,
                  right: `char name[20];
fgets(name, sizeof name, stdin);`,
                  md: "gets cannot know the array size and can overflow it. It was removed from the language; always use fgets.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "fgetc returns an int: the character read, or EOF at end of file or on error.",
                "fgets(buf, n, fp) reads at most n-1 characters, stops after a newline (which it keeps), and returns NULL at end of file.",
                "fputs does not add a newline; puts does.",
                "Do not control a read loop with while(!feof(fp)); test the read function's return value.",
                "In while ((c = fgetc(fp)) != EOF) the inner parentheses are required.",
              ],
            },
            {
              type: "recap",
              items: [
                "fgetc/fputc work a character at a time; fgets/fputs a line at a time.",
                "EOF is a signal returned by functions, not a character in the file.",
                "Keep the result of fgetc in an int.",
                "The same loops work on stdin, making your program a filter.",
              ],
            },
            {
              type: "exercise",
              id: "c21-ex-copy-file",
              kind: "write",
              title: "Copy a file character by character",
              prompt: "Create `src.txt` containing `abc\\nxyz\\n`. Then open it for reading and `dst.txt` for writing, copy every character with fgetc/fputc, close both, and finally print the contents of `dst.txt` with a fgets loop.",
              hint: "You need two FILE pointers open at the same time during the copy.",
              solution: "Open src with \"r\" and dst with \"w\", copy until EOF, close both, then reopen dst with \"r\" and print each line.",
              solutionCode: `#include <stdio.h>

int main(void) {
    int c;
    char line[32];
    FILE *src, *dst;

    src = fopen("src.txt", "w");
    if (src == NULL) return 1;
    fputs("abc\\nxyz\\n", src);
    fclose(src);

    src = fopen("src.txt", "r");
    dst = fopen("dst.txt", "w");
    if (src == NULL || dst == NULL) {
        printf("Cannot open files\\n");
        return 1;
    }
    while ((c = fgetc(src)) != EOF) {
        fputc(c, dst);
    }
    fclose(src);
    fclose(dst);

    dst = fopen("dst.txt", "r");
    if (dst == NULL) return 1;
    while (fgets(line, sizeof line, dst) != NULL) {
        printf("%s", line);
    }
    fclose(dst);
    return 0;
}`,
              expectedOutput: "abc\nxyz",
            },
            {
              type: "exercise",
              id: "c21-ex-feof-debug",
              kind: "debug",
              title: "Why is the last number counted twice?",
              prompt: "The file contains `5 10 15`, so the total should be 30, but this prints 45. Explain the bug and fix it.",
              starterCode: `#include <stdio.h>

int main(void) {
    int x, total = 0;
    FILE *fp = fopen("nums.txt", "w");
    if (fp == NULL) return 1;
    fprintf(fp, "5 10 15\\n");
    fclose(fp);

    fp = fopen("nums.txt", "r");
    if (fp == NULL) return 1;
    while (!feof(fp)) {
        fscanf(fp, "%d", &x);
        total += x;
    }
    fclose(fp);
    printf("Total: %d\\n", total);
    return 0;
}`,
              hint: "When does feof become true: before or after a read fails?",
              solution: "After reading 15, the newline is still unread, so feof is false. The next fscanf fails (returns EOF) and leaves x as 15, which is added again. Test fscanf's return value instead: `while (fscanf(fp, \"%d\", &x) == 1)`.",
              solutionCode: `#include <stdio.h>

int main(void) {
    int x, total = 0;
    FILE *fp = fopen("nums.txt", "w");
    if (fp == NULL) return 1;
    fprintf(fp, "5 10 15\\n");
    fclose(fp);

    fp = fopen("nums.txt", "r");
    if (fp == NULL) return 1;
    while (fscanf(fp, "%d", &x) == 1) {
        total += x;
    }
    fclose(fp);
    printf("Total: %d\\n", total);
    return 0;
}`,
              expectedOutput: "Total: 30",
            },
            {
              type: "exercise",
              id: "c21-ex-longest-line",
              kind: "predict",
              title: "Predict: longest line",
              prompt: "What does this program print?",
              starterCode: `#include <stdio.h>
#include <string.h>

int main(void) {
    char line[80], best[80] = "";
    FILE *fp = fopen("words.txt", "w");
    if (fp == NULL) return 1;
    fputs("cat\\nelephant\\nemu\\n", fp);
    fclose(fp);
    fp = fopen("words.txt", "r");
    if (fp == NULL) return 1;
    while (fgets(line, sizeof line, fp) != NULL) {
        line[strcspn(line, "\\n")] = '\\0';
        if (strlen(line) > strlen(best)) strcpy(best, line);
    }
    fclose(fp);
    printf("[%s] %d\\n", best, (int)strlen(best));
    return 0;
}`,
              hint: "The newline is removed before measuring.",
              solution: "The longest line is \"elephant\" with 8 characters, printed as `[elephant] 8`.",
              solutionCode: `#include <stdio.h>
#include <string.h>

int main(void) {
    char line[80], best[80] = "";
    FILE *fp = fopen("words.txt", "w");
    if (fp == NULL) return 1;
    fputs("cat\\nelephant\\nemu\\n", fp);
    fclose(fp);
    fp = fopen("words.txt", "r");
    if (fp == NULL) return 1;
    while (fgets(line, sizeof line, fp) != NULL) {
        line[strcspn(line, "\\n")] = '\\0';
        if (strlen(line) > strlen(best)) strcpy(best, line);
    }
    fclose(fp);
    printf("[%s] %d\\n", best, (int)strlen(best));
    return 0;
}`,
              expectedOutput: "[elephant] 8",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c21-fgetc-mcq-1",
              prompt: "Why should the variable receiving the result of `fgetc` be declared as `int` rather than `char`?",
              options: [
                { id: "a", text: "Because fgetc reads two bytes at a time" },
                { id: "b", text: "So that it can hold every character value as well as the distinct value EOF" },
                { id: "c", text: "Because char variables cannot be compared with !=" },
                { id: "d", text: "Because files store characters as ints" },
              ],
              correct: "b",
              explanation: "EOF is a negative int that must be distinguishable from all 256 byte values.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c21-fgets-tf-1",
              prompt: "fgets removes the newline character from the end of the line it reads.",
              correct: false,
              explanation: "fgets keeps the newline (if the line fitted in the buffer). You must remove it yourself if unwanted.",
            },
            {
              type: "FILL_BLANK",
              slug: "c21-fgets-fill-1",
              prompt: "At end of file, fgetc returns ___ while fgets returns ___.",
              accepted: [["EOF", "-1"], ["NULL", "a null pointer", "null pointer", "null"]],
              explanation: "Each function signals the end in its own way: an int value for fgetc, a null pointer for fgets.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c21-fgetc-output-1",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

int main(void) {
    int c, digits = 0, spaces = 0;
    FILE *fp = fopen("mix.txt", "w");
    if (fp == NULL) return 1;
    fputs("Room 101 has 3 beds", fp);
    fclose(fp);
    fp = fopen("mix.txt", "r");
    if (fp == NULL) return 1;
    while ((c = fgetc(fp)) != EOF) {
        if (c >= '0' && c <= '9') digits++;
        else if (c == ' ') spaces++;
    }
    fclose(fp);
    printf("%d %d\\n", digits, spaces);
    return 0;
}`,
              expected: "4 4",
              explanation: "Digits: 1, 0, 1, 3 (four). Spaces between the five words: four.",
            },
            {
              type: "CODE_WRITING",
              slug: "c21-word-count-code",
              prompt: "Write a program that reads **all** of standard input until EOF (treat it as a stream with `fgetc(stdin)` or `getchar()`) and prints `lines=L words=W chars=C`, where L is the number of newline characters, W the number of words (maximal runs of non-whitespace characters) and C the total number of characters read, including newlines.",
              starterCode: `#include <stdio.h>
#include <ctype.h>

int main(void) {
    int c, lines = 0, words = 0, chars = 0;
    /* read until EOF */
    printf("lines=%d words=%d chars=%d\\n", lines, words, chars);
    return 0;
}`,
              sampleTests: [
                { stdin: "hello world\n", expected: "lines=1 words=2 chars=12" },
                { stdin: "one\ntwo three\n  four  \n", expected: "lines=3 words=4 chars=23" },
              ],
              hiddenTests: [
                { stdin: "", expected: "lines=0 words=0 chars=0" },
                { stdin: "a b c d e\n", expected: "lines=1 words=5 chars=10" },
                { stdin: "\n\n\n", expected: "lines=3 words=0 chars=3" },
              ],
              solutionCode: `#include <stdio.h>
#include <ctype.h>

int main(void) {
    int c, lines = 0, words = 0, chars = 0, inWord = 0;
    while ((c = fgetc(stdin)) != EOF) {
        chars++;
        if (c == '\\n') lines++;
        if (isspace(c)) {
            inWord = 0;
        } else if (!inWord) {
            inWord = 1;
            words++;
        }
    }
    printf("lines=%d words=%d chars=%d\\n", lines, words, chars);
    return 0;
}`,
              explanation: "A word starts whenever a non-space character follows a space (or the start). The inWord flag tracks whether we are already inside a word.",
            },
          ],
        },
      ],
    },
    {
      slug: "binary-files",
      title: "Binary files and random access",
      lessons: [
        {
          slug: "binary-files-fread-fwrite",
          title: "Binary files with fread, fwrite and fseek",
          summary:
            "Text versus binary files, saving arrays and structs with fwrite, loading them with fread, jumping around with fseek/ftell/rewind, and checking for errors.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Explain the difference between text and binary files",
                "Save and load arrays and structs with fwrite and fread",
                "Move within a file using fseek, ftell and rewind",
                "Use the return values of fread/fwrite and ferror/feof to detect problems",
              ],
            },
            {
              type: "markdown",
              md: `A text file stores numbers as human-readable characters: the number 1000000 takes seven bytes (\`'1'\`, \`'0'\`, ...), and reading it back means converting text to a number again. A **binary file** stores the raw bytes exactly as they sit in memory: an \`int\` takes \`sizeof(int)\` bytes (typically 4) whatever its value, and reading it back is a straight copy.

Think of the difference between writing a recipe out by hand (text: anyone can read it, but it takes effort to copy) and photocopying the page (binary: fast and exact, but only useful to a machine that knows the layout).`,
            },
            {
              type: "definition",
              term: "Binary file",
              md: "A file whose contents are raw bytes rather than characters meant for people. Opened with a `b` in the mode (`\"rb\"`, `\"wb\"`, `\"ab\"`, `\"r+b\"`...) so that no newline translation takes place.",
            },
            {
              type: "definition",
              term: "fwrite / fread",
              md: "`size_t fwrite(const void *ptr, size_t size, size_t count, FILE *fp)` writes `count` items of `size` bytes from memory at `ptr`. `fread` has the same parameters and reads into `ptr`. Both return the number of **items** (not bytes) successfully transferred.",
            },
            {
              type: "definition",
              term: "File position indicator",
              md: "The byte offset within the file where the next read or write will happen. `ftell(fp)` reports it, `fseek(fp, offset, origin)` changes it, and `rewind(fp)` sets it back to 0.",
            },
            {
              type: "syntax",
              language: "c",
              code: `size_t n = fwrite(array, sizeof array[0], count, fp);  /* n == count on success */
size_t m = fread(array, sizeof array[0], count, fp);   /* m < count at EOF/error */

fseek(fp, offset, SEEK_SET);   /* from the beginning      */
fseek(fp, offset, SEEK_CUR);   /* from the current place  */
fseek(fp, offset, SEEK_END);   /* from the end            */
long pos = ftell(fp);          /* current byte offset     */
rewind(fp);                    /* back to the start       */`,
            },
            {
              type: "table",
              caption: "Text vs binary files",
              headers: ["", "Text file", "Binary file"],
              rows: [
                ["Content", "Characters, readable in an editor", "Raw memory bytes"],
                ["Functions", "fprintf, fscanf, fgets, fputs", "fwrite, fread"],
                ["Size of the int 1000000", "7 characters", "sizeof(int) bytes (typically 4)"],
                ["Newlines", "May be translated (\\n ↔ \\r\\n on Windows)", "Never translated"],
                ["Portable between machines?", "Yes", "Only if size, byte order and padding match"],
                ["Random access by record number", "Awkward (lines vary in length)", "Easy (records have fixed size)"],
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Saving and loading an array of structs",
              runnable: true,
              code: `#include <stdio.h>

struct Student {
    int id;
    char name[20];
    double gpa;
};

int main(void) {
    struct Student out[3] = {
        {101, "Amara", 3.6},
        {102, "Bilal", 3.1},
        {103, "Chloe", 3.9}
    };
    struct Student in[3];
    size_t written, got;
    int i;

    FILE *fp = fopen("students.dat", "wb");
    if (fp == NULL) {
        printf("Cannot create file\\n");
        return 1;
    }
    written = fwrite(out, sizeof(struct Student), 3, fp);
    fclose(fp);
    printf("Wrote %d records\\n", (int)written);

    fp = fopen("students.dat", "rb");
    if (fp == NULL) {
        printf("Cannot open file\\n");
        return 1;
    }
    got = fread(in, sizeof(struct Student), 3, fp);
    fclose(fp);
    printf("Read %d records\\n", (int)got);
    for (i = 0; i < (int)got; i++) {
        printf("%d %-6s %.1f\\n", in[i].id, in[i].name, in[i].gpa);
    }
    return 0;
}`,
              output: `Wrote 3 records
Read 3 records
101 Amara  3.6
102 Bilal  3.1
103 Chloe  3.9`,
              walkthrough: [
                { lines: "3-7", text: "Every `struct Student` has the same fixed size, which makes it ideal for binary storage." },
                { lines: "19", text: "`\"wb\"`: write, binary. On Windows the `b` stops the library from converting byte 10 (`\\n`) into two bytes." },
                { lines: "24", text: "One call writes the whole array: 3 items, each `sizeof(struct Student)` bytes. The return value is the number of items written." },
                { lines: "26", text: "`fwrite` returns `size_t`; we cast to `int` to print it portably." },
                { lines: "33", text: "`fread` copies the bytes straight back into memory. If the file were shorter, `got` would be less than 3." },
                { lines: "36-38", text: "Loop over only the records actually read. The data is identical to what was written." },
              ],
            },
            {
              type: "callout",
              variant: "note",
              title: "Binary files and portability",
              md: "The byte size of a struct depends on the compiler and machine (types may differ in size, and the compiler may insert padding). A binary file written on one system may not load correctly on another. For data exchanged between systems, text formats such as CSV or JSON are safer.",
            },
            { type: "heading", text: "Random access with fseek and ftell", level: 2 },
            {
              type: "markdown",
              md: `Because every record has the same size, record number *k* starts at byte \`k * sizeof(record)\`. With \`fseek\` you can jump straight there, read it or overwrite it, without touching the rest of the file, just like jumping to a track on an album instead of listening from the start.`,
            },
            {
              type: "code",
              language: "c",
              title: "Jumping to, reading and updating a record",
              runnable: true,
              code: `#include <stdio.h>

int main(void) {
    int data[5] = {10, 20, 30, 40, 50};
    int value;
    long bytes;
    FILE *fp = fopen("numbers.bin", "w+b");   /* create, read and write */
    if (fp == NULL) {
        printf("Cannot open file\\n");
        return 1;
    }
    fwrite(data, sizeof(int), 5, fp);

    fseek(fp, 0, SEEK_END);
    bytes = ftell(fp);
    printf("Records in file: %ld\\n", bytes / (long)sizeof(int));

    fseek(fp, 3 * (long)sizeof(int), SEEK_SET);   /* jump to record 3 */
    fread(&value, sizeof(int), 1, fp);
    printf("Record 3 holds %d\\n", value);

    value = 99;
    fseek(fp, 1 * (long)sizeof(int), SEEK_SET);   /* overwrite record 1 */
    fwrite(&value, sizeof(int), 1, fp);

    rewind(fp);
    printf("All records:");
    while (fread(&value, sizeof(int), 1, fp) == 1) {
        printf(" %d", value);
    }
    printf("\\n");
    fclose(fp);
    return 0;
}`,
              output: `Records in file: 5
Record 3 holds 40
All records: 10 99 30 40 50`,
              walkthrough: [
                { lines: "7", text: "`\"w+b\"` creates (or empties) the file and allows both reading and writing." },
                { lines: "14-16", text: "Seek to the end and ask for the position: that is the file size in bytes. Dividing by the record size gives the number of records, whatever size an int has on this machine." },
                { lines: "18-20", text: "Records are numbered from 0, so record 3 starts after three ints. Reading it gives 40." },
                { lines: "22-24", text: "Seek to record 1 and overwrite it in place. The other records are untouched." },
                { lines: "26", text: "`rewind` returns to the start. A seek (or rewind) is required when switching between writing and reading on the same stream." },
                { lines: "28-30", text: "Read one int at a time until fread returns something other than 1." },
              ],
            },
            { type: "heading", text: "Detecting errors: return values, feof and ferror", level: 2 },
            {
              type: "markdown",
              md: `Every I/O function reports success or failure through its return value: fopen (NULL), fread/fwrite (fewer items than requested), fscanf (fewer conversions or EOF), fclose (EOF), fseek (non-zero). When a read stops early, you can ask *why*:

- \`feof(fp)\` is non-zero if the end of the file was reached.
- \`ferror(fp)\` is non-zero if a read or write error occurred (for example, the disk was removed).

Use them **after** a read has failed, to explain the failure, never as the loop condition.`,
            },
            { type: "heading", text: "Why it works", level: 2 },
            {
              type: "markdown",
              md: `\`fwrite\` does not interpret your data at all. It sees a starting address and a number of bytes, and copies those bytes to the stream's buffer. \`fread\` does the reverse. That is why it can save any type (ints, doubles, structs, whole arrays) and why it is so fast: there is no conversion to and from text. It is also why you must read data back using the **same** type and layout you wrote: the file itself contains no description of what the bytes mean.

The \`b\` in the mode matters on Windows, where text mode converts \`\\n\` to \`\\r\\n\` on output and back on input. In binary data, a byte with value 10 is just a number, so such translation would corrupt it. On Linux and macOS the \`b\` has no effect, but writing it keeps your program portable.`,
            },
            { type: "heading", text: "Real-world uses", level: 2 },
            {
              type: "markdown",
              md: `- **File formats**: images (PNG, BMP), audio (WAV), and executables are binary files with a documented header followed by data.
- **Simple databases**: fixed-size records with random access, like a student-records file indexed by record number.
- **Save games and caches**: dumping a struct to disk and loading it back is fast and simple.
- **Checking file size**: \`fseek(fp, 0, SEEK_END); ftell(fp);\` on a binary stream.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Forgetting the b in the mode",
                  wrong: `FILE *fp = fopen("img.dat", "w");   /* text mode */
fwrite(pixels, 1, n, fp);`,
                  right: `FILE *fp = fopen("img.dat", "wb");
fwrite(pixels, 1, n, fp);`,
                  md: "On Windows, text mode may alter bytes with value 10 or 26. Always use binary mode for binary data.",
                },
                {
                  title: "Confusing items with bytes in the return value",
                  wrong: `if (fread(arr, sizeof(int), 10, fp) != 10 * sizeof(int))
    printf("error\\n");`,
                  right: `if (fread(arr, sizeof(int), 10, fp) != 10)
    printf("short read\\n");`,
                  md: "fread and fwrite return the number of complete items transferred, not the number of bytes.",
                },
                {
                  title: "Writing a struct that contains pointers",
                  wrong: `struct Person { char *name; int age; };
fwrite(&p, sizeof p, 1, fp);   /* saves an address, not the name */`,
                  right: `struct Person { char name[30]; int age; };
fwrite(&p, sizeof p, 1, fp);`,
                  md: "A pointer is just an address that means nothing in a later run. Store the actual characters (an array) in records you write to disk.",
                },
                {
                  title: "Switching from writing to reading without seeking",
                  wrong: `fwrite(&x, sizeof x, 1, fp);
fread(&y, sizeof y, 1, fp);    /* undefined: no seek in between */`,
                  right: `fwrite(&x, sizeof x, 1, fp);
rewind(fp);                    /* or fseek / fflush */
fread(&y, sizeof y, 1, fp);`,
                  md: "On an update stream (`r+`, `w+`, `a+`), a write followed by a read needs an fseek, rewind or fflush in between.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "Binary modes include b: \"rb\", \"wb\", \"ab\", \"r+b\", \"w+b\", \"a+b\".",
                "fwrite(ptr, size, count, fp) and fread(ptr, size, count, fp) return the number of items transferred.",
                "fseek origins: SEEK_SET (start), SEEK_CUR (current), SEEK_END (end). ftell returns the current offset; rewind goes back to 0.",
                "Record k of fixed-size records starts at byte k * sizeof(record).",
                "feof and ferror explain why a read failed; they should not be used as loop conditions.",
              ],
            },
            {
              type: "recap",
              items: [
                "Binary files store raw bytes: fast and exact, but tied to the machine's layout.",
                "fwrite and fread move whole arrays or structs in one call.",
                "fseek, ftell and rewind give random access to fixed-size records.",
                "Check every return value; use feof/ferror to diagnose failures.",
              ],
            },
            {
              type: "exercise",
              id: "c21-ex-binary-doubles",
              kind: "write",
              title: "Save and reload temperatures",
              prompt: "Write an array of 4 doubles `{21.5, 19.0, 23.0, 18.5}` to `temps.bin` with a single fwrite. Reopen it, read the values back one at a time with fread until it fails, and print their average with two decimals as `Average: X`.",
              hint: "Use \"wb\" then \"rb\"; loop while (fread(&t, sizeof t, 1, fp) == 1).",
              solution: "The four values add up to 82.0, so the average is 20.50.",
              solutionCode: `#include <stdio.h>

int main(void) {
    double temps[4] = {21.5, 19.0, 23.0, 18.5};
    double t, sum = 0.0;
    int n = 0;
    FILE *fp = fopen("temps.bin", "wb");
    if (fp == NULL) return 1;
    fwrite(temps, sizeof temps[0], 4, fp);
    fclose(fp);

    fp = fopen("temps.bin", "rb");
    if (fp == NULL) return 1;
    while (fread(&t, sizeof t, 1, fp) == 1) {
        sum += t;
        n++;
    }
    fclose(fp);
    printf("Average: %.2f\\n", sum / n);
    return 0;
}`,
              expectedOutput: "Average: 20.50",
            },
            {
              type: "exercise",
              id: "c21-ex-seek-predict",
              kind: "predict",
              title: "Predict the seek",
              prompt: "What does this program print?",
              starterCode: `#include <stdio.h>

int main(void) {
    int a[6] = {5, 15, 25, 35, 45, 55};
    int v;
    FILE *fp = fopen("seek.bin", "w+b");
    if (fp == NULL) return 1;
    fwrite(a, sizeof(int), 6, fp);
    fseek(fp, -2 * (long)sizeof(int), SEEK_END);
    fread(&v, sizeof(int), 1, fp);
    printf("%d\\n", v);
    fseek(fp, 0, SEEK_SET);
    fread(&v, sizeof(int), 1, fp);
    printf("%d\\n", v);
    fclose(fp);
    return 0;
}`,
              hint: "Seeking -2 records from the end lands at the start of the second-to-last record.",
              solution: "The first read gets the 5th element (45); after seeking to the start, the second read gets 5.",
              solutionCode: `#include <stdio.h>

int main(void) {
    int a[6] = {5, 15, 25, 35, 45, 55};
    int v;
    FILE *fp = fopen("seek.bin", "w+b");
    if (fp == NULL) return 1;
    fwrite(a, sizeof(int), 6, fp);
    fseek(fp, -2 * (long)sizeof(int), SEEK_END);
    fread(&v, sizeof(int), 1, fp);
    printf("%d\\n", v);
    fseek(fp, 0, SEEK_SET);
    fread(&v, sizeof(int), 1, fp);
    printf("%d\\n", v);
    fclose(fp);
    return 0;
}`,
              expectedOutput: "45\n5",
            },
            {
              type: "exercise",
              id: "c21-ex-text-or-binary",
              kind: "concept",
              title: "Text or binary?",
              prompt: "For each situation, would you choose a text file or a binary file, and why?\n\n1. A settings file users may edit by hand.\n2. A cache of 1 million sensor readings reloaded by the same program.\n3. Exporting marks for a spreadsheet program.",
              hint: "Who (or what) will read the file?",
              solution: "1. Text: humans must read and edit it. 2. Binary: compact, fast to load, and read back by the same program on the same machine, so layout issues do not arise. 3. Text (CSV): spreadsheets read text formats, and text is portable.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c21-fread-mcq-1",
              prompt: "`n = fread(buf, sizeof(int), 10, fp);` returns 7. What does that mean?",
              options: [
                { id: "a", text: "7 bytes were read" },
                { id: "b", text: "7 complete ints were read; end of file or an error occurred before 10" },
                { id: "c", text: "The call failed completely" },
                { id: "d", text: "The file contains exactly 70 bytes" },
              ],
              correct: "b",
              explanation: "fread returns the number of complete items read. Use feof/ferror to tell end of file from error.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c21-binary-tf-1",
              prompt: "`fseek(fp, 0, SEEK_END)` followed by `ftell(fp)` gives the size in bytes of a file opened in binary mode.",
              correct: true,
              explanation: "The position at the end equals the number of bytes in the file.",
            },
            {
              type: "FILL_BLANK",
              slug: "c21-rewind-fill-1",
              prompt: "The function ___(fp) moves the file position back to the beginning of the file.",
              accepted: [["rewind"]],
              explanation: "rewind(fp) is equivalent to fseek(fp, 0, SEEK_SET) and also clears the error flag.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c21-binary-output-1",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

int main(void) {
    int out[4] = {2, 4, 6, 8};
    int in[10];
    size_t got;
    FILE *fp = fopen("four.bin", "wb");
    if (fp == NULL) return 1;
    fwrite(out, sizeof(int), 4, fp);
    fclose(fp);
    fp = fopen("four.bin", "rb");
    if (fp == NULL) return 1;
    got = fread(in, sizeof(int), 10, fp);
    fclose(fp);
    printf("%d %d\\n", (int)got, in[(int)got - 1]);
    return 0;
}`,
              expected: "4 8",
              explanation: "Only 4 ints are in the file, so fread returns 4 even though 10 were requested. The last one read is 8.",
            },
          ],
        },
      ],
    },
  ],
};

export default chapter;
