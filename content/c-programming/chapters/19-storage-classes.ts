import type { ChapterContent } from "../../../src/lib/content/schema";

const chapter: ChapterContent = {
  slug: "storage-classes",
  title: "Storage Classes",
  summary:
    "Where a variable can be seen (scope), how long it lives (lifetime) and whether other files can reach it (linkage), controlled with auto, register, static and extern.",
  topics: [
    {
      slug: "scope-lifetime-linkage",
      title: "Scope, lifetime and linkage",
      lessons: [
        {
          slug: "scope-lifetime-auto-register",
          title: "Scope, lifetime, auto and register",
          summary:
            "The three questions every variable answers: where is it visible, how long does it exist, and can other files see it? Plus the auto and register storage classes.",
          estMinutes: 25,
          blocks: [
            {
              type: "objectives",
              items: [
                "Explain the difference between scope, lifetime and linkage",
                "Distinguish block scope from file scope and predict which variable a name refers to",
                "Describe automatic storage and why local variables start with garbage values",
                "Know what the auto and register keywords mean and why they are rarely written today",
              ],
            },
            {
              type: "markdown",
              md: `So far you have declared variables inside \`main\`, inside other functions, and occasionally at the top of the file. You may have noticed that a variable declared inside one function cannot be used in another, and that a local variable forgets its value once its function returns. These are not accidents: C has precise rules about **where** a name can be used and **how long** the storage behind it exists.

A helpful analogy is a hotel:

- **Scope** is *which rooms can see a notice*. A notice pinned inside Room 12 is visible only in Room 12; a notice in the lobby is visible to everyone in the building.
- **Lifetime** is *how long the notice stays up*. Some notices are taken down when the guest checks out (automatic storage); others stay for the whole season (static storage).
- **Linkage** is *whether other hotels in the chain can read it*. A lobby notice may be shared with the whole chain (external linkage) or kept for this hotel only (internal linkage).

A **storage class** keyword (\`auto\`, \`register\`, \`static\`, \`extern\`) is how you tell the compiler which combination you want.`,
            },
            {
              type: "definition",
              term: "Scope",
              md: "The region of the program text in which a name can be used. A variable declared inside braces `{ }` has **block scope** (visible from its declaration to the closing brace). A variable declared outside every function has **file scope** (visible from its declaration to the end of the file).",
            },
            {
              type: "definition",
              term: "Lifetime (storage duration)",
              md: "The period of program execution during which the variable's memory exists. **Automatic** variables exist only while their block is running. **Static** variables exist for the entire run of the program.",
            },
            {
              type: "definition",
              term: "Linkage",
              md: "Whether the same name in different source files refers to the same object. **External** linkage: shared across files. **Internal** linkage: private to one file. **No linkage**: local variables, which are unique to their block.",
            },
            {
              type: "table",
              caption: "The four storage-class keywords at a glance",
              headers: ["Keyword", "Typical place", "Scope", "Lifetime", "Linkage", "Default value"],
              rows: [
                ["auto (default for locals)", "Inside a block", "Block", "Automatic", "None", "Garbage (indeterminate)"],
                ["register", "Inside a block", "Block", "Automatic", "None", "Garbage (indeterminate)"],
                ["static (local)", "Inside a block", "Block", "Whole program", "None", "0"],
                ["static (global)", "Outside functions", "File", "Whole program", "Internal", "0"],
                ["extern / plain global", "Outside functions", "File", "Whole program", "External", "0"],
              ],
            },
            { type: "heading", text: "Block scope and file scope", level: 2 },
            {
              type: "markdown",
              md: `When two variables with the same name are visible at the same point, the **innermost** declaration wins. We say the inner variable *shadows* (hides) the outer one. The outer variable still exists; you just cannot reach it by that name until the inner block ends.`,
            },
            {
              type: "code",
              language: "c",
              title: "Shadowing: which count is which?",
              runnable: true,
              code: `#include <stdio.h>

int count = 100;            /* global: file scope */

void show(void) {
    printf("show sees count = %d\\n", count);
}

int main(void) {
    int count = 5;          /* local: hides the global */
    printf("main sees count = %d\\n", count);
    {
        int count = 9;      /* inner block hides main's count */
        printf("inner block sees count = %d\\n", count);
    }
    printf("back in main, count = %d\\n", count);
    show();
    return 0;
}`,
              output: `main sees count = 5
inner block sees count = 9
back in main, count = 5
show sees count = 100`,
              walkthrough: [
                { lines: "3", text: "A global variable: file scope, static lifetime, external linkage. It exists before `main` even starts." },
                { lines: "5-7", text: "`show` has no local called `count`, so the name refers to the global one: it prints 100." },
                { lines: "10", text: "A new local `count` in `main`. From here to the end of `main`, the name `count` means this variable, not the global." },
                { lines: "12-15", text: "A bare pair of braces starts a new block. The `count` declared on line 13 hides `main`'s `count` until the closing brace on line 15, where it is destroyed." },
                { lines: "16", text: "After the inner block ends, `count` again means `main`'s variable, which was never changed: 5." },
                { lines: "17", text: "Calling `show` proves the global was untouched by all the local variables with the same name." },
              ],
            },
            {
              type: "callout",
              variant: "tip",
              title: "Avoid shadowing in real code",
              md: "Shadowing is legal but confusing. Compile with `gcc -Wall -Wshadow` and the compiler will warn you whenever an inner name hides an outer one.",
            },
            { type: "heading", text: "auto: the default for local variables", level: 2 },
            {
              type: "markdown",
              md: `Every variable declared inside a block without a storage-class keyword is **automatic**. Its storage is created when execution reaches the declaration and destroyed when the block exits. Writing \`auto int x;\` is exactly the same as \`int x;\` in classic C, which is why you almost never see \`auto\` in real programs.

Because automatic storage is created fresh on every call, an uninitialised automatic variable holds whatever bits happened to be in that memory: an **indeterminate** value. Always initialise local variables before reading them.`,
            },
            {
              type: "syntax",
              language: "c",
              code: `storage-class  type  name = initial_value;

auto     int a = 0;     /* same as: int a = 0;  (inside a block) */
register int i;         /* hint: keep i in a CPU register */
static   int s;         /* covered in the next lesson */
extern   int g;         /* covered in the multi-file lesson */`,
              md: "At most one storage-class keyword may appear in a declaration, and it is usually written first.",
            },
            {
              type: "code",
              language: "c",
              title: "Automatic variables are re-created on every call",
              runnable: true,
              code: `#include <stdio.h>

void visit(void) {
    auto int calls = 0;     /* 'auto' is the default; same as int calls = 0; */
    calls++;
    printf("calls = %d\\n", calls);
}

int main(void) {
    register int i;         /* a hint only: keep i somewhere fast */
    for (i = 1; i <= 3; i++) {
        visit();
    }
    return 0;
}`,
              output: `calls = 1
calls = 1
calls = 1`,
              walkthrough: [
                { lines: "4", text: "`calls` is automatic. Each time `visit` runs, a brand-new `calls` is created and set to 0." },
                { lines: "5-6", text: "It is incremented to 1 and printed. When `visit` returns, this `calls` is destroyed." },
                { lines: "10", text: "`register` asks the compiler to keep `i` in a fast CPU register. Modern compilers decide this themselves, so the keyword is only a hint." },
                { lines: "11-13", text: "Three calls, three fresh variables, so the output is `calls = 1` every time. If you want the count to survive between calls you need `static` (next lesson)." },
              ],
            },
            {
              type: "callout",
              variant: "note",
              title: "auto in modern C",
              md: "The C23 standard repurposed `auto` for type inference (as in C++), so `auto x = 5;` now means \"deduce the type\". Old-style `auto int x;` is still accepted, but there is no reason to write it. Just write `int x;`.",
            },
            { type: "heading", text: "register: a speed hint with one hard rule", level: 2 },
            {
              type: "markdown",
              md: `\`register\` was invented when compilers were simple and programmers had to tell them which variables were used most (loop counters, for example). Today optimising compilers allocate registers far better than people do, so \`register\` is effectively ignored for speed. One rule still applies: **you cannot take the address of a register variable**. \`&i\` is a compile error if \`i\` is declared \`register\`, and that also means you cannot pass it to \`scanf\`.`,
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `When a function is called, the compiler reserves a chunk of memory called a **stack frame** for its automatic variables. When the function returns, that frame is simply abandoned and the next call reuses the same memory. That is why automatic variables are fast (no bookkeeping), why they vanish when the function ends, and why an uninitialised one contains leftovers from whatever used that memory last.

Global variables are different: the compiler places them in a fixed data area that is set up once when the program loads and is zero-filled. That is why a global without an initialiser reliably starts at 0, while a local does not.`,
            },
            { type: "heading", text: "Real-world uses", level: 2 },
            {
              type: "markdown",
              md: `- **Loop counters and temporaries** are automatic: they are needed only briefly and are cheap to create.
- **Recursion relies on automatic storage**: each recursive call gets its own copy of the locals in its own stack frame.
- **Keeping names local** reduces bugs in large programs, because a function cannot accidentally change another function's variables.
- Embedded programmers still meet \`register\` in old codebases and need to know it simply means "no address-of".`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Reading an uninitialised local variable",
                  wrong: `int sum;              /* garbage! */
for (i = 0; i < n; i++)
    sum += a[i];`,
                  right: `int sum = 0;
for (i = 0; i < n; i++)
    sum += a[i];`,
                  md: "Automatic variables are **not** zeroed. Reading one before assigning it is undefined behaviour and usually gives a random-looking result. Initialise every local.",
                },
                {
                  title: "Using a local variable outside its block",
                  wrong: `if (x > 0) {
    int doubled = x * 2;
}
printf("%d\\n", doubled);   /* error: undeclared */`,
                  right: `int doubled = 0;
if (x > 0) {
    doubled = x * 2;
}
printf("%d\\n", doubled);`,
                  md: "A variable's scope ends at the closing brace of the block that declared it. Declare it in the outer block if you need it afterwards.",
                },
                {
                  title: "Taking the address of a register variable",
                  wrong: `register int n;
scanf("%d", &n);     /* error: address of register variable */`,
                  right: `int n;
scanf("%d", &n);`,
                  md: "A register variable might not live in memory, so it has no address. Drop the `register` keyword; the compiler will optimise anyway.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "Scope = where a name is visible (block or file). Lifetime = how long storage exists (automatic or static). Linkage = whether other files share it (external, internal, none).",
                "Local variables are auto by default; `auto int x;` and `int x;` are identical inside a block in classic C.",
                "Automatic variables hold garbage until assigned; globals and statics are initialised to 0.",
                "You cannot apply `&` to a register variable.",
                "When names clash, the innermost declaration hides the outer one (shadowing).",
              ],
            },
            {
              type: "recap",
              items: [
                "Every variable has a scope, a lifetime and a linkage.",
                "Block-scope variables are visible only between their declaration and the closing brace.",
                "auto storage is created on entry to a block and destroyed on exit.",
                "register is an obsolete speed hint that forbids taking the variable's address.",
              ],
            },
            {
              type: "exercise",
              id: "c19-ex-shadow-predict",
              kind: "predict",
              title: "Predict the shadowing output",
              prompt: "What does this program print? Work it out on paper first, then run it.",
              starterCode: `#include <stdio.h>

int x = 1;

int main(void) {
    printf("%d ", x);
    int x = 2;
    printf("%d ", x);
    {
        int x = 3;
        printf("%d ", x);
    }
    printf("%d\\n", x);
    return 0;
}`,
              hint: "The global is visible until main declares its own x. The inner block's x disappears at its closing brace.",
              solution: "The first printf runs before main's own `x` is declared, so it sees the global (1). Then main's `x` (2) hides the global. The inner block prints 3, and after it ends we are back to main's `x`, which is 2.",
              solutionCode: `#include <stdio.h>

int x = 1;

int main(void) {
    printf("%d ", x);
    int x = 2;
    printf("%d ", x);
    {
        int x = 3;
        printf("%d ", x);
    }
    printf("%d\\n", x);
    return 0;
}`,
              expectedOutput: "1 2 3 2",
            },
            {
              type: "exercise",
              id: "c19-ex-fix-sum",
              kind: "debug",
              title: "Fix the unreliable sum",
              prompt: "This program sometimes prints the right total and sometimes a strange number. Find and fix the bug so it always prints `Total: 15`.",
              starterCode: `#include <stdio.h>

int main(void) {
    int nums[5] = {1, 2, 3, 4, 5};
    int total;
    int i;
    for (i = 0; i < 5; i++) {
        total += nums[i];
    }
    printf("Total: %d\\n", total);
    return 0;
}`,
              hint: "What value does an automatic variable start with?",
              solution: "`total` is an automatic variable, so it starts with an indeterminate value. Initialise it: `int total = 0;`.",
              solutionCode: `#include <stdio.h>

int main(void) {
    int nums[5] = {1, 2, 3, 4, 5};
    int total = 0;
    int i;
    for (i = 0; i < 5; i++) {
        total += nums[i];
    }
    printf("Total: %d\\n", total);
    return 0;
}`,
              expectedOutput: "Total: 15",
            },
            {
              type: "exercise",
              id: "c19-ex-classify",
              kind: "concept",
              title: "Classify the variables",
              prompt: "For each variable in this fragment, state its scope, lifetime and linkage:\n\n```c\nint total;\nvoid f(int p) {\n    int k = 0;\n    register int r = 1;\n}\n```",
              hint: "Parameters behave like local variables of the function.",
              solution: "`total`: file scope, static lifetime, external linkage (starts at 0). `p`: block scope (the function body), automatic lifetime, no linkage. `k`: block scope, automatic, no linkage. `r`: block scope, automatic, no linkage, and its address cannot be taken.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c19-scope-mcq-1",
              prompt: "Which property describes **how long** a variable's storage exists while the program runs?",
              options: [
                { id: "a", text: "Scope" },
                { id: "b", text: "Lifetime (storage duration)" },
                { id: "c", text: "Linkage" },
                { id: "d", text: "Type" },
              ],
              correct: "b",
              explanation: "Lifetime is about time during execution; scope is about regions of source text; linkage is about sharing between files.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c19-auto-tf-1",
              prompt: "An automatic (local) `int` variable that is not initialised is guaranteed to start at 0.",
              correct: false,
              explanation: "Only static-duration variables (globals and statics) are zero-initialised. Automatic variables hold indeterminate values.",
            },
            {
              type: "FILL_BLANK",
              slug: "c19-register-fill-1",
              prompt: "You cannot apply the address-of operator ___ to a variable declared with the `register` storage class.",
              accepted: [["&", "& operator", "address-of"]],
              explanation: "A register variable may not have a memory address, so `&` is forbidden.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c19-shadow-output-1",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

int n = 7;

void f(void) {
    printf("%d\\n", n);
}

int main(void) {
    int n = 3;
    f();
    printf("%d\\n", n);
    return 0;
}`,
              expected: "7\n3",
              explanation: "`f` sees only the global `n` (7). Inside `main`, the local `n` (3) hides the global.",
            },
          ],
        },
        {
          slug: "static-local-and-global",
          title: "static: variables that remember",
          summary:
            "Static local variables keep their value between calls; static globals and static functions are private to one file.",
          estMinutes: 25,
          blocks: [
            {
              type: "objectives",
              items: [
                "Use a static local variable to keep a value between function calls",
                "Explain when a static variable is initialised and why it defaults to 0",
                "Use static on global variables and functions to give them internal linkage",
                "Choose between a static local, a global and a parameter for sharing state",
              ],
            },
            {
              type: "markdown",
              md: `In the last lesson every call to \`visit\` printed \`calls = 1\`, because its local variable was created and destroyed on every call. Sometimes that is exactly what you do **not** want. Think of a ticket machine at a bakery: every time someone presses the button it must hand out the *next* number, so it has to remember the last number it gave out.

The keyword \`static\` gives you that memory. It has two different jobs depending on where you write it:

1. **Inside a function**, \`static\` changes the **lifetime**: the variable lives for the whole program but is still only visible inside that function.
2. **Outside all functions**, \`static\` changes the **linkage**: the global variable or function becomes private to the current source file.`,
            },
            {
              type: "definition",
              term: "Static local variable",
              md: "A variable declared with `static` inside a block. It has block scope (only that block can name it) but static lifetime: it is created and initialised once, before the program starts, and keeps its value between calls.",
            },
            {
              type: "definition",
              term: "Internal linkage",
              md: "A file-scope name declared `static` is visible only within its own source file (translation unit). Other files cannot refer to it, even with `extern`.",
            },
            {
              type: "syntax",
              language: "c",
              code: `/* inside a function: remembers between calls */
static type name = constant_initialiser;

/* outside functions: private to this file */
static type globalName;
static return_type helper(parameters) { ... }`,
              md: "The initialiser of a static variable must be a constant expression (such as `0`, `10`, or `'A'`), because it is set before the program runs.",
            },
            {
              type: "code",
              language: "c",
              title: "A ticket machine with a static counter",
              runnable: true,
              code: `#include <stdio.h>

int nextTicket(void) {
    static int ticket = 0;   /* initialised once, before the program starts */
    ticket++;
    return ticket;
}

int main(void) {
    printf("Ticket %d\\n", nextTicket());
    printf("Ticket %d\\n", nextTicket());
    printf("Ticket %d\\n", nextTicket());
    return 0;
}`,
              output: `Ticket 1
Ticket 2
Ticket 3`,
              walkthrough: [
                { lines: "4", text: "`ticket` is static. The `= 0` is applied **once**, when the program loads, not every time the function is called." },
                { lines: "5-6", text: "Each call increments the same variable and returns its new value." },
                { lines: "10-12", text: "Three calls give 1, 2, 3. No other function can see or change `ticket`, which keeps the counter safe." },
              ],
            },
            {
              type: "code",
              language: "c",
              title: "Automatic vs static, side by side",
              runnable: true,
              code: `#include <stdio.h>

void compare(void) {
    int a = 0;          /* automatic: fresh each call */
    static int s = 0;   /* static: remembers between calls */
    a++;
    s++;
    printf("a = %d, s = %d\\n", a, s);
}

int main(void) {
    int i;
    for (i = 0; i < 4; i++) {
        compare();
    }
    return 0;
}`,
              output: `a = 1, s = 1
a = 1, s = 2
a = 1, s = 3
a = 1, s = 4`,
              walkthrough: [
                { lines: "4", text: "`a` is created and set to 0 on every call." },
                { lines: "5", text: "`s` was set to 0 once. On later calls this line does nothing: it is a one-time initialisation, not an assignment." },
                { lines: "6-8", text: "Both are incremented. `a` always becomes 1; `s` keeps climbing." },
                { lines: "13-15", text: "Four calls show the difference clearly." },
              ],
            },
            {
              type: "callout",
              variant: "exam",
              title: "Initialisation is not assignment",
              md: "`static int s = 0;` runs its `= 0` once. If you instead wrote `static int s; s = 0;`, the assignment `s = 0;` would execute on every call and reset the counter. Examiners love this trap.",
            },
            { type: "heading", text: "static at file level: hiding names", level: 2 },
            {
              type: "markdown",
              md: `In a program built from many files, every ordinary global variable and function is shared across all files (external linkage). That can cause name clashes: two programmers both write a helper called \`init\`, and the linker complains. Marking a global or function \`static\` keeps it private to its file, much like a \`private\` helper in other languages. A good habit: **make every global and every helper function \`static\` unless another file genuinely needs it.**

Static-duration variables (globals and statics) are also **zero-initialised** if you give no initialiser: numbers become 0, pointers become \`NULL\`, and arrays are filled with zeros.`,
            },
            {
              type: "code",
              language: "c",
              title: "A private global, a private helper, and zero-filled statics",
              runnable: true,
              code: `#include <stdio.h>

static int total;            /* internal linkage, starts at 0 */

static void add(int x) {     /* helper visible only in this file */
    total += x;
}

int main(void) {
    static int zeros[3];     /* static arrays are zero-filled too */
    add(10);
    add(32);
    printf("total = %d\\n", total);
    printf("zeros: %d %d %d\\n", zeros[0], zeros[1], zeros[2]);
    return 0;
}`,
              output: `total = 42
zeros: 0 0 0`,
              walkthrough: [
                { lines: "3", text: "A global marked `static`: every function in this file can use it, but another `.c` file cannot. No initialiser, so it starts at 0." },
                { lines: "5-7", text: "A `static` function has internal linkage. Another file could define its own `add` without a clash." },
                { lines: "10", text: "A static local array. Because it has static lifetime, all three elements start at 0." },
                { lines: "11-14", text: "10 + 32 = 42, and the zero-filled array prints 0 0 0." },
              ],
            },
            { type: "heading", text: "Why it works", level: 2 },
            {
              type: "markdown",
              md: `A static local is not stored in the function's stack frame. The compiler places it in the same fixed data area as global variables, which is set up once when the program loads. The function's code simply refers to that fixed location, so every call sees the same memory. The only thing that makes it "local" is the compiler's scope rule: no other function is allowed to use the name.

File-level \`static\` works at the linker stage. When the compiler produces an object file, it marks static names as *local symbols*. The linker does not offer them to other object files, so there can be no clash and no outside access.`,
            },
            {
              type: "table",
              caption: "Three ways to keep state between calls",
              headers: ["Approach", "Who can change it", "Good for"],
              rows: [
                ["Static local variable", "Only the one function", "Counters, caches, one-time setup flags"],
                ["Static global (file level)", "Any function in the same file", "State shared by a small group of related functions"],
                ["Ordinary global", "Any function in any file", "Rarely a good idea; use sparingly"],
                ["Pass a pointer parameter", "Whoever the caller allows", "Most flexible and testable"],
              ],
            },
            { type: "heading", text: "Real-world uses", level: 2 },
            {
              type: "markdown",
              md: `- **ID generators**: give each new record, order or player a unique number.
- **One-time initialisation**: \`static int initialised = 0;\` lets a function do expensive setup on its first call only.
- **Caching**: a function can remember a previously computed result.
- **Library design**: library authors mark internal helpers \`static\` so they never collide with names in your program.
- **Returning a string safely**: a function may return a pointer to a static local buffer, because the buffer outlives the call (unlike an automatic array).`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Resetting a static with an assignment",
                  wrong: `int counter(void) {
    static int c;
    c = 0;          /* runs every call! */
    return ++c;     /* always 1 */
}`,
                  right: `int counter(void) {
    static int c = 0;   /* runs once */
    return ++c;
}`,
                  md: "Put the starting value in the declaration as an initialiser. A separate assignment statement executes every time.",
                },
                {
                  title: "Initialising a static with a non-constant",
                  wrong: `void f(int n) {
    static int first = n;   /* error */
}`,
                  right: `void f(int n) {
    static int first = 0;
    static int set = 0;
    if (!set) { first = n; set = 1; }
}`,
                  md: "Static variables are initialised before the program runs, so the initialiser must be a constant expression. Use a flag if you need to capture a runtime value.",
                },
                {
                  title: "Returning the address of an automatic local",
                  wrong: `char *greeting(void) {
    char msg[] = "hello";
    return msg;     /* msg dies here: dangling */
}`,
                  right: `char *greeting(void) {
    static char msg[] = "hello";
    return msg;     /* msg lives for the whole program */
}`,
                  md: "An automatic array is destroyed when the function returns. A static array lives on, so returning its address is safe (but every call shares the same buffer).",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "A static local has block scope but static (whole-program) lifetime.",
                "Static variables are initialised once, before main runs, and default to 0.",
                "The initialiser of a static variable must be a constant expression.",
                "static on a global variable or function gives it internal linkage (private to the file).",
                "The word static has two meanings: lifetime when used inside a block, linkage when used at file level.",
              ],
            },
            {
              type: "recap",
              items: [
                "static locals remember their value between calls.",
                "The = value on a static declaration is a one-time initialisation.",
                "File-level static hides globals and functions from other files.",
                "Static storage is zero-filled by default.",
              ],
            },
            {
              type: "exercise",
              id: "c19-ex-call-logger",
              kind: "write",
              title: "Count your calls",
              prompt: "Write a function `void greet(const char *name)` that prints `Hello, <name>! (call <n>)` where n counts how many times `greet` has been called. Call it with \"Ana\", \"Ben\" and \"Chen\" from `main`.",
              hint: "A static int inside greet, incremented before printing.",
              solution: "Use `static int calls = 0;` inside `greet`, increment it and print it.",
              solutionCode: `#include <stdio.h>

void greet(const char *name) {
    static int calls = 0;
    calls++;
    printf("Hello, %s! (call %d)\\n", name, calls);
}

int main(void) {
    greet("Ana");
    greet("Ben");
    greet("Chen");
    return 0;
}`,
              expectedOutput: `Hello, Ana! (call 1)
Hello, Ben! (call 2)
Hello, Chen! (call 3)`,
            },
            {
              type: "exercise",
              id: "c19-ex-static-predict",
              kind: "predict",
              title: "Predict the static sequence",
              prompt: "What does this program print?",
              starterCode: `#include <stdio.h>

int step(void) {
    static int v = 10;
    v = v - 3;
    return v;
}

int main(void) {
    int a = step();
    int b = step();
    int c = step();
    printf("%d %d %d\\n", a, b, c);
    return 0;
}`,
              hint: "v starts at 10 only once.",
              solution: "v goes 10 → 7 → 4 → 1, so the program prints `7 4 1`.",
              solutionCode: `#include <stdio.h>

int step(void) {
    static int v = 10;
    v = v - 3;
    return v;
}

int main(void) {
    int a = step();
    int b = step();
    int c = step();
    printf("%d %d %d\\n", a, b, c);
    return 0;
}`,
              expectedOutput: "7 4 1",
            },
            {
              type: "exercise",
              id: "c19-ex-fix-reset",
              kind: "debug",
              title: "Why does the counter never grow?",
              prompt: "This function should return 1, 2, 3 on successive calls but always returns 1. Fix it.",
              starterCode: `#include <stdio.h>

int nextId(void) {
    static int id;
    id = 0;
    id++;
    return id;
}

int main(void) {
    printf("%d\\n", nextId());
    printf("%d\\n", nextId());
    printf("%d\\n", nextId());
    return 0;
}`,
              hint: "Which line runs on every call?",
              solution: "`id = 0;` is an ordinary assignment executed on every call. Remove it (static variables already start at 0) or write `static int id = 0;`.",
              solutionCode: `#include <stdio.h>

int nextId(void) {
    static int id = 0;
    id++;
    return id;
}

int main(void) {
    printf("%d\\n", nextId());
    printf("%d\\n", nextId());
    printf("%d\\n", nextId());
    return 0;
}`,
              expectedOutput: "1\n2\n3",
            },
          ],
          practice: [
            {
              type: "OUTPUT_PREDICTION",
              slug: "c19-static-output-1",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

void tick(void) {
    static int t = 5;
    int u = 5;
    t++;
    u++;
    printf("%d %d\\n", t, u);
}

int main(void) {
    tick();
    tick();
    tick();
    return 0;
}`,
              expected: "6 6\n7 6\n8 6",
              explanation: "`t` keeps its value between calls; `u` is re-created as 5 every call.",
            },
            {
              type: "MCQ",
              slug: "c19-static-mcq-1",
              prompt: "A global variable is declared as `static int hits;` at the top of `stats.c`. Which statement is true?",
              options: [
                { id: "a", text: "It is re-initialised to 0 every time a function in stats.c is called" },
                { id: "b", text: "Other source files can use it if they declare `extern int hits;`" },
                { id: "c", text: "It is visible only within stats.c and starts at 0" },
                { id: "d", text: "It has automatic lifetime" },
              ],
              correct: "c",
              explanation: "File-level static gives internal linkage; static storage is zero-initialised once and lasts the whole program.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c19-static-tf-1",
              prompt: "`static int x = n;` inside a function is valid when `n` is a parameter of that function.",
              correct: false,
              explanation: "A static variable's initialiser must be a constant expression, because it is applied before the program runs.",
            },
            {
              type: "FILL_BLANK",
              slug: "c19-static-fill-1",
              prompt: "A static local variable has ___ scope but lasts for the whole run of the program.",
              accepted: [["block", "local", "block-level"]],
              explanation: "Only the enclosing block can name it, but its storage lives for the entire program.",
            },
            {
              type: "CODE_WRITING",
              slug: "c19-running-total-code",
              prompt: "Write a function `int runningTotal(int x)` that uses a **static local variable** to add `x` to a running total and return the total so far. In `main`, read an integer `n`, then `n` integers; after reading each one, print the running total on its own line.",
              starterCode: `#include <stdio.h>

int runningTotal(int x) {
    /* your code here */
}

int main(void) {
    int n, i, x;
    scanf("%d", &n);
    for (i = 0; i < n; i++) {
        scanf("%d", &x);
        printf("%d\\n", runningTotal(x));
    }
    return 0;
}`,
              sampleTests: [
                { stdin: "4\n5 10 -3 8\n", expected: "5\n15\n12\n20" },
                { stdin: "1\n7\n", expected: "7" },
              ],
              hiddenTests: [
                { stdin: "3\n0 0 0\n", expected: "0\n0\n0" },
                { stdin: "5\n1 2 3 4 5\n", expected: "1\n3\n6\n10\n15" },
                { stdin: "2\n-5 -5\n", expected: "-5\n-10" },
              ],
              solutionCode: `#include <stdio.h>

int runningTotal(int x) {
    static int total = 0;
    total += x;
    return total;
}

int main(void) {
    int n, i, x;
    if (scanf("%d", &n) != 1) return 0;
    for (i = 0; i < n; i++) {
        scanf("%d", &x);
        printf("%d\\n", runningTotal(x));
    }
    return 0;
}`,
              explanation: "`static int total = 0;` is initialised once, so each call adds to the previous total.",
            },
          ],
        },
      ],
    },
    {
      slug: "multi-file-programs",
      title: "extern and multi-file programs",
      lessons: [
        {
          slug: "extern-and-multi-file-programs",
          title: "extern: sharing variables across files",
          summary:
            "Declarations versus definitions, the extern keyword, header files for sharing, and how the compiler and linker cooperate to build programs from several .c files.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Explain the difference between a declaration and a definition",
                "Use extern to refer to a global variable defined elsewhere",
                "Organise a small program into a .c file, a .h header and a main file",
                "Diagnose 'undefined reference' and 'multiple definition' linker errors",
              ],
            },
            {
              type: "markdown",
              md: `Real programs are not one giant file. A game might have \`graphics.c\`, \`sound.c\`, \`player.c\` and \`main.c\`. Each file is compiled separately into an *object file*, and then the **linker** joins them into one executable. This raises a question: if \`score\` is created in \`player.c\`, how does \`main.c\` use it?

The answer is \`extern\`. Think of a library catalogue card: the card says *"this book exists and is shelved somewhere in the building"*, but the card is not the book. An \`extern\` declaration is the catalogue card; the **definition** in one file is the actual book.`,
            },
            {
              type: "definition",
              term: "Definition",
              md: "A declaration that also creates storage (for a variable) or provides the body (for a function). Each global variable or function must be defined **exactly once** in the whole program. Example: `int score = 0;`",
            },
            {
              type: "definition",
              term: "Declaration",
              md: "Tells the compiler a name exists and what type it has, without creating it. You may declare the same thing many times. Example: `extern int score;` or a function prototype `int add(int, int);`.",
            },
            {
              type: "definition",
              term: "Translation unit",
              md: "One `.c` file after the preprocessor has pasted in all its `#include`d headers. The compiler handles one translation unit at a time; the linker combines them.",
            },
            {
              type: "syntax",
              language: "c",
              code: `extern type name;          /* declaration only: no storage */
type name = value;         /* definition: storage created here (one file only) */

extern int f(int);         /* function prototypes are extern by default, */
int f(int);                /* so these two lines mean the same thing      */`,
            },
            { type: "heading", text: "A three-file example", level: 2 },
            {
              type: "markdown",
              md: `Here is a tiny program split across three files. (You cannot run multiple files in the browser runner, so read these, then try the single-file versions below.)`,
            },
            {
              type: "code",
              language: "c",
              title: "counter.h  (the shared declarations)",
              runnable: false,
              code: `#ifndef COUNTER_H
#define COUNTER_H

extern int count;        /* declaration: defined in counter.c */
void increment(void);    /* prototype: defined in counter.c   */

#endif`,
            },
            {
              type: "code",
              language: "c",
              title: "counter.c  (the one definition)",
              runnable: false,
              code: `#include "counter.h"

int count = 0;           /* definition: storage lives here */

void increment(void) {
    count++;
}`,
            },
            {
              type: "code",
              language: "c",
              title: "main.c  (the user)",
              runnable: false,
              code: `#include <stdio.h>
#include "counter.h"

int main(void) {
    increment();
    increment();
    printf("count = %d\\n", count);   /* prints count = 2 */
    return 0;
}`,
            },
            {
              type: "code",
              language: "shell",
              title: "Building it",
              runnable: false,
              code: `gcc -Wall -c counter.c        # produces counter.o
gcc -Wall -c main.c           # produces main.o
gcc counter.o main.o -o app   # the linker joins them
./app
# or in one step:
gcc -Wall main.c counter.c -o app`,
            },
            {
              type: "markdown",
              md: `Notice the pattern:

1. The **header** (\`counter.h\`) holds only declarations, so it is safe to include in any number of files.
2. Exactly **one** \`.c\` file holds the definition \`int count = 0;\`.
3. Every file that uses \`count\` includes the header. \`counter.c\` includes it too, so the compiler can check the declaration and the definition agree.

The \`#ifndef / #define / #endif\` lines are an *include guard*, explained in the preprocessor chapter.`,
            },
            {
              type: "callout",
              variant: "warning",
              title: "Never define variables in a header",
              md: "If `counter.h` contained `int count = 0;`, every file including it would define its own `count`, and the linker would report **multiple definition of `count`**. Headers get `extern` declarations; one `.c` file gets the definition.",
            },
            { type: "heading", text: "extern in a single file", level: 2 },
            {
              type: "markdown",
              md: `\`extern\` also works inside one file. It lets you use a global before its definition appears, exactly as a prototype lets you call a function before its body.`,
            },
            {
              type: "code",
              language: "c",
              title: "Using a global before its definition",
              runnable: true,
              code: `#include <stdio.h>

extern int limit;            /* declaration: "limit exists somewhere" */
void printLimit(void);       /* function declaration (extern by default) */

int main(void) {
    printf("limit is %d\\n", limit);
    limit = 20;
    printLimit();
    return 0;
}

int limit = 10;              /* definition: storage is created here */

void printLimit(void) {
    printf("now limit is %d\\n", limit);
}`,
              output: `limit is 10
now limit is 20`,
              walkthrough: [
                { lines: "3", text: "`extern` announces the variable and its type. Without this line, line 7 would be an error because `limit` has not been seen yet." },
                { lines: "4", text: "A function prototype is a declaration too; functions have external linkage by default." },
                { lines: "7-9", text: "`main` reads the global (10), changes it to 20, then calls the function." },
                { lines: "13", text: "The definition. This is where memory for `limit` is created and set to 10 before the program starts." },
                { lines: "15-17", text: "The function sees the same global, now holding 20." },
              ],
            },
            {
              type: "code",
              language: "c",
              title: "extern inside a function",
              runnable: true,
              code: `#include <stdio.h>

void report(void) {
    extern int errors;       /* refer to the global defined below */
    printf("errors so far: %d\\n", errors);
}

int errors = 0;

int main(void) {
    errors += 2;
    report();
    errors++;
    report();
    return 0;
}`,
              output: `errors so far: 2
errors so far: 3`,
              walkthrough: [
                { lines: "4", text: "An `extern` declaration can appear inside a block. It does not create a local variable; it says \"the name `errors` here means the global one\"." },
                { lines: "8", text: "The single definition of `errors`." },
                { lines: "11-14", text: "`main` changes the global and `report` sees each update: 2, then 3." },
              ],
            },
            { type: "heading", text: "Why it works", level: 2 },
            {
              type: "markdown",
              md: `The compiler works on one file at a time. When it sees \`extern int count;\` it records "there is an \`int\` called \`count\`; I don't know where it lives yet" and emits an *unresolved reference*. In the file with \`int count = 0;\` it emits a *symbol* named \`count\` with storage.

The linker then matches every unresolved reference with exactly one symbol:

- **No definition anywhere** → \`undefined reference to 'count'\`.
- **Two definitions** → \`multiple definition of 'count'\`.
- **Definition marked \`static\`** → it is hidden from other files, so they also get \`undefined reference\`.

This separation is also why programs can be rebuilt quickly: change one \`.c\` file and only that file is recompiled before re-linking.`,
            },
            {
              type: "table",
              caption: "Common linker messages and their usual cause",
              headers: ["Message", "Usual cause", "Fix"],
              rows: [
                ["undefined reference to `x`", "Declared (extern) but never defined, or the defining .c file was not compiled in", "Add the definition, or add the file to the gcc command"],
                ["multiple definition of `x`", "Variable defined in a header included by several files", "Put `extern` in the header and define it in one .c file"],
                ["conflicting types for `x`", "Declaration and definition disagree (e.g. int vs double)", "Include the header in the defining file so the compiler checks"],
              ],
            },
            { type: "heading", text: "Real-world uses", level: 2 },
            {
              type: "markdown",
              md: `- **The standard library** works this way: \`stdio.h\` declares \`printf\`, and the definition lives in the C library that the linker adds automatically. \`errno\` and \`stdout\` are also declared in headers and defined in the library.
- **Configuration values** shared across modules, such as \`extern int verbose;\` set from command-line options.
- **Large projects** (operating systems, game engines) are thousands of \`.c\` files tied together with headers.

Use shared globals sparingly: every file that can change a variable is a file you must check when it goes wrong. Prefer passing values as parameters, and keep globals \`static\` unless sharing is truly needed.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Defining a variable in a header",
                  wrong: `/* config.h */
int verbose = 0;`,
                  right: `/* config.h */
extern int verbose;

/* config.c */
int verbose = 0;`,
                  md: "Each file including the header would get its own definition, causing a 'multiple definition' link error.",
                },
                {
                  title: "Giving an extern declaration an initialiser",
                  wrong: `extern int limit = 10;   /* this is a definition! */`,
                  right: `extern int limit;        /* declaration */
int limit = 10;          /* definition, in one file */`,
                  md: "An initialiser turns any declaration into a definition (compilers usually warn). Keep extern declarations without values.",
                },
                {
                  title: "Trying to use another file's static global",
                  wrong: `/* a.c */  static int secret = 42;
/* b.c */  extern int secret;   /* link error */`,
                  right: `/* a.c */  int secret = 42;
/* b.c */  extern int secret;`,
                  md: "`static` at file level means internal linkage: no other file can reach it. Remove `static` if sharing is intended, or better, provide a function that returns the value.",
                },
                {
                  title: "Forgetting to compile all the files",
                  wrong: `gcc main.c -o app      # undefined reference to 'increment'`,
                  right: `gcc main.c counter.c -o app`,
                  md: "The linker can only find definitions in files you give it.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "A declaration introduces a name; a definition also allocates storage. Many declarations, exactly one definition.",
                "extern declares a variable without defining it; it does not allocate memory.",
                "Functions have external linkage by default; prototypes are implicitly extern.",
                "Headers contain extern declarations and prototypes, never variable definitions.",
                "'undefined reference' = missing definition; 'multiple definition' = defined twice.",
              ],
            },
            {
              type: "recap",
              items: [
                "extern says a variable exists elsewhere; the definition creates it once.",
                "Share across files with a header of extern declarations included everywhere.",
                "The compiler handles one file; the linker matches references to definitions.",
                "static hides a global from other files; extern cannot reach it.",
              ],
            },
            {
              type: "exercise",
              id: "c19-ex-extern-split",
              kind: "concept",
              title: "Split a program into files",
              prompt: "A single-file program has a global `double balance = 0.0;` and functions `void deposit(double)` and `double getBalance(void)`, plus `main`. Describe what goes into `bank.h`, `bank.c` and `main.c`, and the gcc command to build it. Then make `balance` impossible for `main.c` to change directly.",
              hint: "Which file owns the variable? What does main actually need to know?",
              solution: "`bank.h`: an include guard plus the prototypes `void deposit(double amount);` and `double getBalance(void);`. `bank.c`: `#include \"bank.h\"`, the definition of `balance`, and the two function bodies. `main.c`: `#include \"bank.h\"` and `main`. Build with `gcc -Wall main.c bank.c -o bank`. To protect `balance`, declare it `static double balance = 0.0;` in bank.c and do not mention it in the header. Then main.c can only use deposit/getBalance.",
            },
            {
              type: "exercise",
              id: "c19-ex-extern-write",
              kind: "write",
              title: "Use extern before the definition",
              prompt: "Write a single-file program that declares `extern int level;` near the top, has `main` print `Level: <value>` then call `levelUp()` twice and print again, and defines `int level = 1;` and `void levelUp(void)` (which adds 1 to level) **after** main.",
              hint: "You need both `extern int level;` and a prototype for levelUp above main.",
              solution: "Declare both names above main, then define them afterwards.",
              solutionCode: `#include <stdio.h>

extern int level;
void levelUp(void);

int main(void) {
    printf("Level: %d\\n", level);
    levelUp();
    levelUp();
    printf("Level: %d\\n", level);
    return 0;
}

int level = 1;

void levelUp(void) {
    level++;
}`,
              expectedOutput: "Level: 1\nLevel: 3",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c19-extern-mcq-1",
              prompt: "What does `extern int total;` do?",
              options: [
                { id: "a", text: "Creates a global int called total initialised to 0" },
                { id: "b", text: "Declares that an int called total is defined somewhere else, without allocating storage" },
                { id: "c", text: "Makes total private to the current file" },
                { id: "d", text: "Creates a local variable that keeps its value between calls" },
              ],
              correct: "b",
              explanation: "extern without an initialiser is a pure declaration.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c19-extern-tf-1",
              prompt: "It is good practice to write `int count = 0;` in a header file so that every .c file can use count.",
              correct: false,
              explanation: "That defines count in every file that includes the header, giving a multiple-definition link error. Put `extern int count;` in the header.",
            },
            {
              type: "FILL_BLANK",
              slug: "c19-extern-fill-1",
              prompt: "If a variable is declared with extern but never defined, the ___ reports an 'undefined reference' error.",
              accepted: [["linker", "link editor", "ld"]],
              explanation: "Each file compiles fine; only the linker discovers that no definition exists.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c19-extern-output-1",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

extern int k;

void bump(void) {
    k *= 2;
}

int main(void) {
    bump();
    bump();
    printf("%d\\n", k);
    return 0;
}

int k = 3;`,
              expected: "12",
              explanation: "There is only one `k`, defined as 3. Doubling twice gives 12.",
            },
          ],
        },
      ],
    },
  ],
};

export default chapter;
