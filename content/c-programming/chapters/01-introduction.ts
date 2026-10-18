import type { ChapterContent } from "../../../src/lib/content/schema";

/** Raw template tag: backslashes in C code (\n, \t, \0) are kept exactly as typed. */
const c = String.raw;

const chapter: ChapterContent = {
  slug: "introduction",
  title: "Introduction to C",
  summary:
    "Where C came from, why it is still everywhere, how to set up a compiler or online environment, and how to write, compile and run your very first program.",
  topics: [
    {
      slug: "what-is-c",
      title: "What is C?",
      lessons: [
        {
          slug: "c-history-and-features",
          title: "The story of C and why it matters",
          summary:
            "Learn where C came from, the features that made it famous, and the kinds of real systems that are still written in C today.",
          estMinutes: 20,
          blocks: [
            {
              type: "objectives",
              items: [
                "Describe in a few sentences how and why the C language was created.",
                "Explain what it means for C to be a compiled, procedural, middle-level language.",
                "List the key features of C: speed, portability, small core, rich library, direct memory access.",
                "Name real-world systems that are written in C.",
                "Read a tiny C program and recognise its main parts.",
              ],
            },
            {
              type: "markdown",
              md: `## A language built to build an operating system

In the late 1960s, programmers at **Bell Labs** (a research lab of the American telephone company AT&T) were building an operating system called **UNIX**. Operating systems were normally written in *assembly language* — a notation that maps almost one-to-one onto the instructions of one particular processor. Assembly is fast, but it is painful to write, and a program written for one processor has to be completely rewritten for another.

Ken Thompson first created a small language called **B**. Around **1972**, **Dennis Ritchie** extended B into a new language with proper data types. He called it **C**. UNIX was then rewritten in C, which was a revolutionary idea: an operating system written in a language that could be moved ("ported") to a new computer just by writing a new compiler.

Think of it like this: assembly is a set of instructions written in one specific local dialect. C is a common language that a translator (the **compiler**) can convert into any local dialect you need.`,
            },
            {
              type: "table",
              caption: "Milestones in the history of C",
              headers: ["Year", "Event"],
              rows: [
                ["1969–1970", "Ken Thompson creates the B language while working on UNIX at Bell Labs."],
                ["1972", "Dennis Ritchie develops C, adding data types such as int and char."],
                ["1978", "Kernighan and Ritchie publish *The C Programming Language* (\"K&R C\")."],
                ["1989/1990", "C is standardised by ANSI and ISO — known as **C89/C90** or \"ANSI C\"."],
                ["1999", "**C99** adds // comments, long long, declarations anywhere in a block, and more."],
                ["2011", "**C11** adds threads, better Unicode support and other features."],
                ["2018 / 2024", "**C17** fixes defects; **C23** modernises the language further."],
              ],
            },
            {
              type: "definition",
              term: "Programming language",
              md: "A precise, written notation for giving instructions to a computer. Programs are written as plain text that follows strict grammar rules.",
            },
            {
              type: "definition",
              term: "Compiler",
              md: "A program that translates source code written in a language like C into **machine code** — the binary instructions a processor actually executes. The output is usually an executable file you can run again and again without the compiler.",
            },
            {
              type: "definition",
              term: "Middle-level language",
              md: "A description often given to C: it has high-level features (functions, loops, readable names) but also low-level features (direct access to memory addresses and bits) that are normally only found in assembly.",
            },
            {
              type: "heading",
              text: "The key features of C",
              level: 2,
            },
            {
              type: "markdown",
              md: `- **Fast and efficient.** C code is compiled straight to machine code with very little extra machinery running behind the scenes, so C programs are typically among the fastest you can write.
- **Portable.** The same C source file can be compiled for a laptop, a phone, a washing machine controller or a supercomputer, as long as a compiler exists for that machine.
- **Small core language.** C has only a few dozen keywords. You can learn the whole language — the real challenge is learning to use it well.
- **Rich standard library.** Ready-made functions for input/output (\`printf\`, \`scanf\`), text, maths, memory and files come with every compiler.
- **Procedural and structured.** Programs are built from *functions* — named blocks of instructions — which keeps large programs organised.
- **Direct memory access.** Through *pointers*, C lets you work with memory addresses directly. This gives great power (and responsibility).
- **Influential.** C++, C#, Java, JavaScript, Go, PHP and many others borrowed C's syntax. Learning C makes many other languages feel familiar.`,
            },
            {
              type: "callout",
              variant: "note",
              title: "C is small, not simple",
              md: "C trusts the programmer. It does very few safety checks for you, which is part of why it is fast. As you learn, you will meet situations where C lets you make a mistake without warning — this course will point them out clearly.",
            },
            {
              type: "heading",
              text: "Your first look at C code",
              level: 2,
            },
            {
              type: "markdown",
              md: "Don't worry about understanding every symbol yet — chapter 2 explains the structure of a C program in detail. For now, just notice that a C program is plain text, that instructions end with a semicolon, and that `printf` puts text on the screen.",
            },
            {
              type: "code",
              language: "c",
              title: "A tiny C program",
              runnable: true,
              code: c`#include <stdio.h>

int main(void)
{
    printf("C was created by Dennis Ritchie.\n");
    printf("It first appeared around 1972.\n");
    printf("C is still used everywhere today!\n");
    return 0;
}`,
              output: `C was created by Dennis Ritchie.
It first appeared around 1972.
C is still used everywhere today!`,
              walkthrough: [
                { lines: "1", text: "Brings in the standard input/output library so that we can use `printf`." },
                { lines: "2", text: "A blank line. Blank lines are ignored by the compiler; they just make code easier to read." },
                { lines: "3", text: "Every C program starts running in a function called `main`. `int` means it gives back a whole number when it finishes." },
                { lines: "4", text: "The opening brace starts the body of `main`." },
                { lines: "5-7", text: "Each `printf` call prints a piece of text. `\\n` is the *newline* character: it moves the cursor to the start of the next line." },
                { lines: "8", text: "`return 0;` tells the operating system the program finished successfully." },
                { lines: "9", text: "The closing brace ends `main`, and therefore the program." },
              ],
            },
            {
              type: "markdown",
              md: "C can do arithmetic as well as print text. Here a program stores two whole numbers, multiplies them and prints the result. The `%d` inside the text is a placeholder that `printf` replaces with a number.",
            },
            {
              type: "code",
              language: "c",
              title: "C as a calculator",
              runnable: true,
              code: c`#include <stdio.h>

int main(void)
{
    int cores = 8;
    int tasks_per_core = 125;
    int total = cores * tasks_per_core;

    printf("Cores: %d\n", cores);
    printf("Tasks per core: %d\n", tasks_per_core);
    printf("Total tasks: %d\n", total);
    return 0;
}`,
              output: `Cores: 8
Tasks per core: 125
Total tasks: 1000`,
              walkthrough: [
                { lines: "1", text: "Includes the header that declares `printf`." },
                { lines: "3-4", text: "The `main` function, where execution begins." },
                { lines: "5-6", text: "Create two *variables* (named storage boxes) of type `int` (whole number) and give them starting values." },
                { lines: "7", text: "Multiply the two values with `*` and store the answer, 1000, in a third variable." },
                { lines: "9-11", text: "Print each value. `printf` swaps each `%d` for the value of the matching variable after the comma." },
                { lines: "12", text: "Report success to the operating system." },
              ],
            },
            {
              type: "heading",
              text: "Why it works: compiled straight to the machine",
              level: 2,
            },
            {
              type: "markdown",
              md: `When you compile the programs above, the compiler turns each line into a handful of processor instructions: "load 8", "load 125", "multiply", "call printf". There is no interpreter reading your code line by line while it runs and no hidden garbage collector. That directness is why C is fast and predictable, and why it is the language of choice when every microsecond or every byte of memory counts.

It is also why C is **portable**: the C source does not mention any particular processor. To run it on a new machine, you compile the *same* source with a compiler for that machine.`,
            },
            {
              type: "heading",
              text: "Where C is used today",
              level: 2,
            },
            {
              type: "table",
              caption: "Real-world applications of C",
              headers: ["Area", "Examples"],
              rows: [
                ["Operating systems", "The Linux kernel, large parts of Windows and macOS, Android's lower layers"],
                ["Embedded systems", "Microcontrollers in cars, microwaves, pacemakers, drones, routers, IoT sensors"],
                ["Databases", "SQLite, PostgreSQL, Redis, MySQL's core"],
                ["Language runtimes", "The standard Python interpreter (CPython), Ruby, PHP and Lua are written in C"],
                ["Networking", "Web servers such as Nginx and Apache, network stacks, curl"],
                ["Graphics and games", "Game engines, OpenGL drivers, image/video libraries"],
                ["Scientific computing", "High-performance numerical libraries and simulations"],
              ],
            },
            {
              type: "callout",
              variant: "tip",
              title: "Why learn C first?",
              md: "Because C hides very little, learning it teaches you how computers really work: memory, data representation, and how programs are built. That understanding makes you better in *every* language you learn afterwards.",
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Thinking C and C++ are the same language",
                  md: "C++ grew out of C and can compile most C code, but it is a different, much larger language with classes, templates and more. Some valid C is not valid C++ and vice versa. In this course we write pure C and save files with the `.c` extension (not `.cpp`).",
                },
                {
                  title: "Forgetting the semicolon at the end of a statement",
                  wrong: c`printf("Hello\n")
return 0;`,
                  right: c`printf("Hello\n");
return 0;`,
                  md: "In C, each statement ends with `;`. Without it the compiler reports a syntax error, often pointing at the *next* line, which can be confusing at first.",
                },
                {
                  title: "Using capital letters where C expects lowercase",
                  wrong: c`Printf("Hello\n");
Return 0;`,
                  right: c`printf("Hello\n");
return 0;`,
                  md: "C is **case-sensitive**: `printf` and `Printf` are completely different names. Keywords like `return` and `int` are always lowercase.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "C was developed by **Dennis Ritchie** at **Bell Labs** around **1972**, as a successor to the language B.",
                "C was created to write the **UNIX** operating system.",
                "C is a **compiled**, **procedural**, **structured** language, often called **middle-level** because it combines high-level constructs with low-level memory access.",
                "Main standards: C89/C90 (ANSI C), C99, C11, C17, C23.",
                "Key features: fast, portable, small set of keywords, rich standard library, pointers, case-sensitive.",
              ],
            },
            {
              type: "recap",
              items: [
                "C was born at Bell Labs to rewrite UNIX in a portable way.",
                "A compiler translates C source code into machine code for a specific processor.",
                "C is fast because it compiles directly to machine instructions with little runtime overhead.",
                "C is portable because the same source can be compiled for many machines.",
                "Operating systems, embedded devices, databases and language interpreters are commonly written in C.",
              ],
            },
            {
              type: "exercise",
              id: "c01-ex-why-unix-in-c",
              kind: "concept",
              title: "Why rewrite UNIX in C?",
              prompt: "In two or three sentences, explain why rewriting UNIX in C instead of assembly language was such an important decision.",
              hint: "Think about what happens when you want to run the operating system on a brand new type of computer.",
              solution:
                "Assembly language is tied to one processor, so an operating system written in assembly must be rewritten for every new machine. Written in C, UNIX only needed a C compiler for the new machine; the same source code could then be recompiled. This made UNIX portable and showed that systems software did not have to be written in assembly.",
            },
            {
              type: "exercise",
              id: "c01-ex-predict-lines",
              kind: "predict",
              title: "How many lines?",
              prompt: "Predict exactly what this program prints. Pay attention to where the `\\n` characters are.",
              starterCode: c`#include <stdio.h>

int main(void)
{
    printf("Learning ");
    printf("C\n");
    printf("is fun\n");
    return 0;
}`,
              hint: "Text keeps going on the same line until a `\\n` is printed.",
              solution: "The first `printf` has no newline, so \"C\" is printed straight after \"Learning \" on the same line.",
              solutionCode: c`#include <stdio.h>

int main(void)
{
    printf("Learning ");
    printf("C\n");
    printf("is fun\n");
    return 0;
}`,
              expectedOutput: `Learning C
is fun`,
            },
            {
              type: "exercise",
              id: "c01-ex-about-c",
              kind: "write",
              title: "Three facts about C",
              prompt: "Write a complete C program that prints these three lines exactly:\n\n```\nCreator: Dennis Ritchie\nYear: 1972\nPlace: Bell Labs\n```",
              hint: "Use three `printf` calls, each ending with `\\n`.",
              solutionCode: c`#include <stdio.h>

int main(void)
{
    printf("Creator: Dennis Ritchie\n");
    printf("Year: 1972\n");
    printf("Place: Bell Labs\n");
    return 0;
}`,
              expectedOutput: `Creator: Dennis Ritchie
Year: 1972
Place: Bell Labs`,
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c01-creator-mcq",
              prompt: "Who is credited with creating the C programming language?",
              options: [
                { id: "a", text: "James Gosling" },
                { id: "b", text: "Dennis Ritchie" },
                { id: "c", text: "Bjarne Stroustrup" },
                { id: "d", text: "Guido van Rossum" },
              ],
              correct: "b",
              explanation: "Dennis Ritchie developed C at Bell Labs around 1972. Gosling created Java, Stroustrup created C++, and van Rossum created Python.",
            },
            {
              type: "MCQ",
              slug: "c01-purpose-mcq",
              prompt: "C was originally developed mainly to write which piece of software?",
              options: [
                { id: "a", text: "The UNIX operating system" },
                { id: "b", text: "The first web browser" },
                { id: "c", text: "Microsoft Excel" },
                { id: "d", text: "The Java virtual machine" },
              ],
              correct: "a",
              explanation: "C was created so that UNIX could be written in a portable, high-level language instead of assembly.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c01-case-sensitive-tf",
              prompt: "In C, `Main` and `main` are treated as the same name.",
              correct: false,
              explanation: "C is case-sensitive, so `Main` and `main` are different identifiers. The program's entry point must be spelled `main`.",
            },
            {
              type: "FILL_BLANK",
              slug: "c01-predecessor-fill",
              prompt: "C was developed as a successor to a language called ___.",
              accepted: [["B", "B language"]],
              caseSensitive: true,
              explanation: "Ken Thompson's language B was the direct predecessor of C.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c01-first-output",
              prompt: "What does this program print?",
              code: c`#include <stdio.h>

int main(void)
{
    printf("Bell ");
    printf("Labs\n");
    printf("1972\n");
    return 0;
}`,
              expected: `Bell Labs
1972`,
              explanation: "The first `printf` has no newline, so \"Labs\" continues on the same line. Then `\\n` moves to a new line before \"1972\".",
            },
          ],
        },
      ],
    },
    {
      slug: "getting-set-up",
      title: "Setting up and your first program",
      lessons: [
        {
          slug: "c-setup-and-hello-world",
          title: "Compilers, IDEs and Hello, World!",
          summary:
            "Choose a compiler and editor (or an online environment), then write, compile and run your first C program step by step.",
          estMinutes: 25,
          blocks: [
            {
              type: "objectives",
              items: [
                "Explain the difference between a text editor, a compiler and an IDE.",
                "Name popular C compilers and IDEs for Windows, macOS and Linux, and online alternatives.",
                "Compile and run a C program from the command line with gcc.",
                "Write, explain and modify the classic Hello, World! program.",
                "Read and react to basic compiler error messages.",
              ],
            },
            {
              type: "markdown",
              md: `## What you need to program in C

Writing a C program is a bit like writing a recipe in English for a chef who only speaks French. You need:

1. **Somewhere to write the recipe** — a *text editor*.
2. **A translator** — the *compiler*, which turns your C text into machine code.
3. **A kitchen to cook in** — the operating system, which runs the resulting executable.

An **IDE** (Integrated Development Environment) bundles the editor, compiler controls and a debugger into one window, so you can write, build and run with a single click.`,
            },
            {
              type: "definition",
              term: "Source code / source file",
              md: "The human-readable program text you write. C source files use the extension `.c`, for example `hello.c`.",
            },
            {
              type: "definition",
              term: "Executable",
              md: "The file produced by the compiler that the operating system can run directly — for example `hello.exe` on Windows or `hello` on Linux and macOS.",
            },
            {
              type: "definition",
              term: "IDE (Integrated Development Environment)",
              md: "An application that combines a code editor, build tools (compiler integration), and a debugger, often with features like syntax highlighting and auto-completion.",
            },
            {
              type: "table",
              caption: "Common tools for C development",
              headers: ["Tool", "Kind", "Platforms", "Notes"],
              rows: [
                ["GCC (GNU Compiler Collection)", "Compiler", "Linux, Windows (MinGW-w64/MSYS2), macOS", "The most widely used free C compiler. Command: `gcc`."],
                ["Clang", "Compiler", "macOS (default), Linux, Windows", "Fast, very clear error messages. On macOS, `gcc` is usually Clang in disguise."],
                ["MSVC", "Compiler", "Windows", "Microsoft's compiler, included with Visual Studio."],
                ["TCC (Tiny C Compiler)", "Compiler", "Windows, Linux", "Very small and quick; handy for experiments."],
                ["VS Code", "Editor (+ extensions)", "All", "Lightweight editor; add the C/C++ extension and a compiler."],
                ["Code::Blocks, Dev-C++", "IDE", "Windows (Code::Blocks also Linux/macOS)", "Beginner-friendly; often bundle GCC (MinGW)."],
                ["CLion, Visual Studio, Xcode", "IDE", "Various", "Full-featured professional IDEs."],
                ["Online compilers", "Browser", "Any", "Websites such as OnlineGDB, Programiz or Compiler Explorer let you run C with no installation. The *Run* buttons in this course work the same way."],
              ],
            },
            {
              type: "callout",
              variant: "tip",
              title: "Getting started quickly",
              md: "You can follow this entire course using the **Run** buttons on the code examples — no installation needed. When you are ready, install GCC (on Windows via MSYS2 or MinGW-w64, on macOS via `xcode-select --install`, on Linux via your package manager, e.g. `sudo apt install build-essential`).",
            },
            {
              type: "heading",
              text: "Hello, World!",
              level: 2,
            },
            {
              type: "markdown",
              md: "By tradition — started by the K&R book in 1978 — the first program in a new language prints **Hello, World!**. Type it into a file called `hello.c` exactly as shown.",
            },
            {
              type: "code",
              language: "c",
              title: "hello.c",
              runnable: true,
              code: c`#include <stdio.h>

int main(void)
{
    printf("Hello, World!\n");
    return 0;
}`,
              output: "Hello, World!",
              walkthrough: [
                { lines: "1", text: "`#include <stdio.h>` is a *preprocessor directive*. It pastes in the declarations from the standard input/output header, which tells the compiler what `printf` looks like." },
                { lines: "3", text: "`int main(void)` defines the `main` function. The operating system calls `main` when the program starts. `void` means it takes no arguments, and `int` means it returns an integer." },
                { lines: "4", text: "`{` opens the function body." },
                { lines: "5", text: "`printf` prints the text inside the double quotes. The `\\n` at the end is a newline, so the cursor moves to the next line afterwards. The statement ends with `;`." },
                { lines: "6", text: "`return 0;` ends `main` and reports *success* (0) to the operating system." },
                { lines: "7", text: "`}` closes the function body." },
              ],
            },
            {
              type: "heading",
              text: "Compiling and running from the command line",
              level: 3,
            },
            {
              type: "syntax",
              language: "shell",
              code: c`gcc source_file.c -o program_name
./program_name        (Linux / macOS)
program_name.exe      (Windows Command Prompt; .\program_name in PowerShell)`,
              md: "`gcc` compiles the source file; `-o` chooses the name of the output executable. If you leave out `-o`, GCC names the file `a.out` (Linux/macOS) or `a.exe` (Windows).",
            },
            {
              type: "code",
              language: "shell",
              title: "A typical terminal session",
              runnable: false,
              code: c`$ gcc hello.c -o hello
$ ./hello
Hello, World!`,
            },
            {
              type: "callout",
              variant: "tip",
              title: "Turn on warnings",
              md: "Compile with `gcc -Wall -Wextra hello.c -o hello`. The `-Wall -Wextra` flags ask the compiler to warn you about suspicious code. Warnings are free bug reports — read them!",
            },
            {
              type: "markdown",
              md: "A program can print as many lines as you like. Each `\\n` starts a new line, and you can even put several `\\n` characters in a single `printf`.",
            },
            {
              type: "code",
              language: "c",
              title: "Printing a small banner",
              runnable: true,
              code: c`#include <stdio.h>

int main(void)
{
    printf("*******************\n");
    printf("*  Welcome to C!  *\n");
    printf("*******************\n");
    printf("Line one\nLine two\n");
    return 0;
}`,
              output: `*******************
*  Welcome to C!  *
*******************
Line one
Line two`,
              walkthrough: [
                { lines: "1", text: "Include `stdio.h` for `printf`." },
                { lines: "3-4", text: "Start of `main`." },
                { lines: "5-7", text: "Three separate `printf` calls draw a box. Spaces inside the quotes are printed exactly as written." },
                { lines: "8", text: "One `printf` can print two lines: the first `\\n` ends \"Line one\", the second ends \"Line two\"." },
                { lines: "9", text: "Return 0 for success." },
              ],
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `When you type \`gcc hello.c -o hello\`, the compiler reads your text, checks that it follows C's grammar, and generates machine code. It also **links** your code with the C standard library, which contains the real implementation of \`printf\`. The result is a standalone executable. Running it asks the operating system to load the program into memory and call \`main\`. When \`main\` returns 0, the program ends and the operating system learns that everything went well.

You will see each of these steps — preprocessing, compiling, assembling and linking — in detail in the next chapter.`,
            },
            {
              type: "heading",
              text: "Where this is used",
              level: 3,
            },
            {
              type: "markdown",
              md: "Every C project, from a student assignment to the Linux kernel, is built with exactly this edit → compile → run cycle. Large projects automate it with build tools such as `make` or CMake, but underneath they still call a compiler like `gcc` or `clang` on `.c` files.",
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Missing #include <stdio.h>",
                  wrong: c`int main(void)
{
    printf("Hello, World!\n");
    return 0;
}`,
                  right: c`#include <stdio.h>

int main(void)
{
    printf("Hello, World!\n");
    return 0;
}`,
                  md: "Without the header, the compiler does not know what `printf` is. Modern compilers report an error or a warning such as *implicit declaration of function 'printf'*. Always include the header for every library function you use.",
                },
                {
                  title: "Using curly “smart” quotes copied from a document",
                  wrong: "printf(“Hello, World!\\n”);",
                  right: c`printf("Hello, World!\n");`,
                  md: "Word processors replace straight quotes with curly ones. C only understands straight double quotes `\"`. Write code in a code editor, not a word processor.",
                },
                {
                  title: "Using a forward slash instead of a backslash for newline",
                  wrong: c`printf("Hello, World!/n");`,
                  right: c`printf("Hello, World!\n");`,
                  md: "The newline escape sequence is backslash-n (`\\n`). A forward slash just prints the characters `/n` literally.",
                },
                {
                  title: "Saving the file with the wrong extension",
                  md: "Save C programs as `hello.c`, not `hello.txt` or `hello.cpp`. Some editors silently add `.txt`; others treat `.cpp` files as C++, which has slightly different rules.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "`#include <stdio.h>` is required to use `printf` and `scanf`.",
                "Execution of every C program begins at the `main` function.",
                "`return 0;` from `main` indicates successful termination.",
                "`gcc file.c -o name` compiles; without `-o` the default output is `a.out` (or `a.exe` on Windows).",
                "C source files use the `.c` extension; header files use `.h`.",
              ],
            },
            {
              type: "recap",
              items: [
                "You need an editor and a compiler; an IDE combines them. Online compilers need no installation.",
                "GCC, Clang and MSVC are the most common C compilers.",
                "Hello, World! uses `#include`, `main`, `printf` and `return 0`.",
                "Compile, fix any errors, then run the executable — this cycle is the heart of programming in C.",
              ],
            },
            {
              type: "exercise",
              id: "c01-ex-debug-hello",
              kind: "debug",
              title: "Fix the broken Hello",
              prompt: "This program does not build. Find and fix both mistakes.",
              starterCode: c`#include <stdio.h>

int Main(void)
{
    printf("Hello, World!\n")
    return 0;
}
`,
              hint: "Look at the spelling of the function name and at the end of the printf line. Remember that C is case-sensitive.",
              solution: "1) The `printf` statement needs a semicolon at the end. The compiler often reports this error on the *following* line (`return 0;`), because that is where it realises something is missing. 2) `Main` must be `main` (lowercase). With `Main`, the code compiles, but the linker cannot find the entry point `main` and the build fails.",
              solutionCode: c`#include <stdio.h>

int main(void)
{
    printf("Hello, World!\n");
    return 0;
}`,
              expectedOutput: "Hello, World!",
            },
            {
              type: "exercise",
              id: "c01-ex-name-card",
              kind: "write",
              title: "Your name card",
              prompt: "Write a program that prints a name card exactly like this (use your own name in your version; the solution uses \"Ada\"):\n\n```\n+------------+\n| Name: Ada  |\n| Lang: C    |\n+------------+\n```",
              hint: "One `printf` per line. Count the spaces carefully.",
              solutionCode: c`#include <stdio.h>

int main(void)
{
    printf("+------------+\n");
    printf("| Name: Ada  |\n");
    printf("| Lang: C    |\n");
    printf("+------------+\n");
    return 0;
}`,
              expectedOutput: `+------------+
| Name: Ada  |
| Lang: C    |
+------------+`,
            },
            {
              type: "exercise",
              id: "c01-ex-compile-command",
              kind: "concept",
              title: "Name the executable",
              prompt: "You type `gcc game.c` (with no `-o` option) on Linux. What is the executable called, and how do you run it? What command would produce an executable called `game` instead?",
              hint: "GCC has a traditional default output name.",
              solution: "Without `-o`, GCC produces `a.out` on Linux, which you run with `./a.out`. To name it `game`, use `gcc game.c -o game` and run `./game`.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c01-entry-point-mcq",
              prompt: "Where does execution of a C program begin?",
              options: [
                { id: "a", text: "At the first line of the file" },
                { id: "b", text: "At the `#include` directive" },
                { id: "c", text: "At the `main` function" },
                { id: "d", text: "At whichever function is defined first" },
              ],
              correct: "c",
              explanation: "The operating system (via the C runtime) always starts a program by calling `main`, wherever it is in the file.",
            },
            {
              type: "FILL_BLANK",
              slug: "c01-header-fill",
              prompt: "To use `printf`, a program should include the header file ___.",
              accepted: [["stdio.h", "<stdio.h>", "#include <stdio.h>"]],
              explanation: "`stdio.h` declares the standard input/output functions, including `printf` and `scanf`.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c01-ide-tf",
              prompt: "An IDE is required to write C programs.",
              correct: false,
              explanation: "Any plain text editor plus a compiler is enough. An IDE is a convenience that bundles these tools together.",
            },
            {
              type: "MCQ",
              slug: "c01-gcc-o-mcq",
              prompt: "What does the `-o hello` part of `gcc hello.c -o hello` do?",
              options: [
                { id: "a", text: "Turns on optimisation" },
                { id: "b", text: "Sets the name of the output executable to `hello`" },
                { id: "c", text: "Opens the file `hello` for editing" },
                { id: "d", text: "Runs the program after compiling" },
              ],
              correct: "b",
              explanation: "`-o` specifies the output file name. Optimisation flags look like `-O2` (capital O).",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c01-hello-newlines-output",
              prompt: "What does this program print?",
              code: c`#include <stdio.h>

int main(void)
{
    printf("Hello,\nWorld!\n");
    printf("Bye");
    return 0;
}`,
              expected: `Hello,
World!
Bye`,
              explanation: "The `\\n` after the comma splits the greeting over two lines; \"Bye\" goes on a third line.",
            },
            {
              type: "CODE_WRITING",
              slug: "c01-greet-code",
              prompt: "The starter code already reads one word (a person's first name) into `name`. Add a single `printf` so the program prints:\n\n```\nHello, NAME! Welcome to C.\n```\n\nwhere `NAME` is the word that was typed. For input `Ada` the output must be `Hello, Ada! Welcome to C.`\n\n*Tip:* `%s` is the placeholder for a word of text, just like `%d` is for a number.",
              starterCode: c`#include <stdio.h>

int main(void)
{
    char name[50];
    scanf("%49s", name);
    /* your printf goes here */
    return 0;
}`,
              sampleTests: [{ stdin: "Ada", expected: "Hello, Ada! Welcome to C." }],
              hiddenTests: [
                { stdin: "Dennis", expected: "Hello, Dennis! Welcome to C." },
                { stdin: "Ken", expected: "Hello, Ken! Welcome to C." },
                { stdin: "Grace\n", expected: "Hello, Grace! Welcome to C." },
              ],
              solutionCode: c`#include <stdio.h>

int main(void)
{
    char name[50];
    scanf("%49s", name);
    printf("Hello, %s! Welcome to C.\n", name);
    return 0;
}`,
              explanation: "`printf` replaces `%s` with the text stored in `name`. You will learn all about `scanf` and format specifiers in chapter 6.",
            },
          ],
        },
      ],
    },
  ],
};

export default chapter;
