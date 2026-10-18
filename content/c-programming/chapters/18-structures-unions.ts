import type { ChapterContent } from "../../../src/lib/content/schema";

const chapter: ChapterContent = {
  slug: "structures-unions",
  title: "Structures, Unions and Enumerations",
  summary:
    "Create your own data types: structures that group related values, arrays of structures, pointers to structures with the -> operator, unions that share memory, enumerations for named constants, and typedef for clean type names.",
  topics: [
    {
      slug: "structures",
      title: "Structures",
      lessons: [
        {
          slug: "structure-basics",
          title: "Declaring and using structures",
          summary:
            "Group related values of different types into one structure, initialise it, access members with the dot operator, copy structures and pass them to functions.",
          estMinutes: 30,
          blocks: [
            {
              type: "objectives",
              items: [
                "Explain why structures are needed and how they differ from arrays",
                "Declare a structure type and structure variables",
                "Initialise structures, including with designated initialisers",
                "Access and modify members with the dot operator",
                "Copy structures with = and pass them to and return them from functions",
              ],
            },
            {
              type: "markdown",
              md: `An array groups many values of the **same** type. But real-world things are described by values of **different** types. A student has a name (text), a roll number (int) and an average mark (double). With what you know so far, you would need three separate variables — or three parallel arrays for a whole class — and you would have to keep them in sync by hand.

A **structure** (\`struct\`) lets you define your **own type** that bundles related values together under one name. Think of it as a form with labelled boxes: a "student record" form has a box for the name, a box for the roll number and a box for the mark. The form's *design* is the struct type; each filled-in form is a struct variable.`,
            },
            {
              type: "definition",
              term: "Structure (struct)",
              md: "A user-defined type that groups several variables, possibly of different types, into a single unit.",
            },
            {
              type: "definition",
              term: "Member (field)",
              md: "One named component of a structure, such as `name` or `marks` in a student structure.",
            },
            {
              type: "definition",
              term: "Structure tag",
              md: "The name after the keyword `struct` (e.g. `student` in `struct student`). Together, `struct student` is the full type name.",
            },
            {
              type: "syntax",
              language: "c",
              code: `struct tag {
    type1 member1;
    type2 member2;
    ...
};                               /* note the semicolon! */

struct tag var;                  /* declare a variable */
struct tag v2 = { val1, val2 };  /* initialise in order */
struct tag v3 = { .member2 = val2, .member1 = val1 }; /* designated */

var.member1 = value;             /* dot operator */`,
              md: "Declaring the struct type does not create any variable or reserve memory; it only describes the layout. Memory is reserved when you declare a variable of that type.",
            },
            {
              type: "code",
              language: "c",
              title: "A student record",
              code: `#include <stdio.h>
#include <string.h>

struct student {
    char name[30];
    int roll;
    double average;
};

int main(void)
{
    struct student s1 = {"Amina Yusuf", 101, 78.5};
    struct student s2;

    strcpy(s2.name, "Lucas Silva");
    s2.roll = 102;
    s2.average = 84.25;

    printf("%s (roll %d): %.2f\\n", s1.name, s1.roll, s1.average);
    printf("%s (roll %d): %.2f\\n", s2.name, s2.roll, s2.average);

    s1.average += 5;
    if (s1.average > s2.average)
        printf("%s has the higher average\\n", s1.name);
    else
        printf("%s has the higher average\\n", s2.name);
    return 0;
}`,
              runnable: true,
              output: `Amina Yusuf (roll 101): 78.50
Lucas Silva (roll 102): 84.25
Lucas Silva has the higher average`,
              walkthrough: [
                { lines: "4-8", text: "Defines a new type `struct student` with three members. The semicolon after the closing brace is required." },
                { lines: "12", text: "Initialise members in the order they were declared: name, roll, average." },
                { lines: "13", text: "Declare a second variable without initialising it; we fill it member by member." },
                { lines: "15", text: "`name` is a char array, so we cannot write `s2.name = \"...\"`; we copy with `strcpy`." },
                { lines: "16-17", text: "The dot operator selects a member. `s2.roll` behaves exactly like an ordinary int variable." },
                { lines: "22", text: "Members can be updated with any operator: 78.5 + 5 = 83.5." },
                { lines: "23-26", text: "83.5 is still below 84.25, so Lucas is reported." },
              ],
            },
            {
              type: "heading",
              text: "Copying, nesting and functions",
              level: 2,
            },
            {
              type: "markdown",
              md: `Unlike arrays, structures **can be assigned** with \`=\`: \`s2 = s1;\` copies every member — even an array member inside the struct. Structures can also be **passed to functions** and **returned from functions** by value (a full copy is made).

Structures can contain other structures. A \`struct date\` can be a member of a \`struct employee\`, and you reach the inner members with a chain of dots: \`e.joined.year\`.

What you **cannot** do is compare structures with \`==\`. Compare the members you care about instead.`,
            },
            {
              type: "code",
              language: "c",
              title: "Nested structures, copying and functions",
              code: `#include <stdio.h>

struct date {
    int day, month, year;
};

struct employee {
    char name[20];
    struct date joined;
    double salary;
};

void printEmployee(struct employee e)
{
    printf("%s joined %02d/%02d/%d, salary %.0f\\n",
           e.name, e.joined.day, e.joined.month, e.joined.year, e.salary);
}

struct employee giveRaise(struct employee e, double percent)
{
    e.salary = e.salary * (1 + percent / 100);
    return e;
}

int main(void)
{
    struct employee a = { .name = "Priya", .joined = {3, 7, 2021}, .salary = 50000 };
    struct employee b;

    b = a;
    b.joined.year = 2023;

    printEmployee(a);
    printEmployee(b);

    giveRaise(a, 10);
    printf("After ignoring the result: %.0f\\n", a.salary);
    a = giveRaise(a, 10);
    printf("After storing the result:  %.0f\\n", a.salary);
    return 0;
}`,
              runnable: true,
              output: `Priya joined 03/07/2021, salary 50000
Priya joined 03/07/2023, salary 50000
After ignoring the result: 50000
After storing the result:  55000`,
              walkthrough: [
                { lines: "3-5", text: "A small structure for dates. Several members of the same type can share one declaration line." },
                { lines: "9", text: "A structure member whose type is another structure." },
                { lines: "13-17", text: "The function receives a **copy** of the employee. `e.joined.day` follows two dots: employee → date → day. `%02d` pads to two digits." },
                { lines: "19-23", text: "Because the parameter is a copy, the function must **return** the modified structure for the caller to see the change." },
                { lines: "27", text: "Designated initialisers name each member, so their order does not matter and the code is self-documenting. The nested date is initialised with its own braces." },
                { lines: "30-31", text: "`b = a` copies all members (including the name array). Changing `b.joined.year` afterwards does not affect `a`." },
                { lines: "36-39", text: "Calling `giveRaise` without using its return value changes nothing. Assigning the result back updates `a`." },
              ],
            },
            {
              type: "callout",
              variant: "note",
              title: "Structure size and padding",
              md: "`sizeof(struct student)` is **at least** the sum of its members' sizes, but often a little more. Compilers insert unused *padding* bytes so that members sit at addresses the processor can access efficiently. The exact size is system-dependent, so never compute it by hand — always use `sizeof`.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `A struct variable is one contiguous block of memory with each member at a fixed offset from the start. The compiler knows every offset from the type definition, so \`s.roll\` simply means "the int at offset k inside s". Because the size of the whole block is known at compile time, the compiler can copy it in one go for \`=\`, for passing by value, and for returning — something it cannot do for arrays, which decay to pointers.`,
            },
            {
              type: "heading",
              text: "Real-world applications",
              level: 2,
            },
            {
              type: "markdown",
              md: `- Records: students, employees, products, bank accounts, flights.
- Geometry and graphics: \`struct point { double x, y; }\`, rectangles, colours (\`struct rgb { unsigned char r, g, b; }\`).
- Operating systems and libraries describe things with structs: \`struct tm\` in \`<time.h>\` holds a broken-down date and time, and \`FILE\` is a structure.
- Network packets and file formats are described as structs of header fields.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Missing semicolon after the struct definition",
                  wrong: `struct point {
    int x, y;
}                    /* missing ; */
int main(void) { ... }`,
                  right: `struct point {
    int x, y;
};`,
                  md: "A struct definition is a declaration and must end with `;`. Forgetting it produces confusing errors on the following lines.",
                },
                {
                  title: "Using the tag without the struct keyword",
                  wrong: `student s1;            /* error in C (fine in C++) */`,
                  right: `struct student s1;     /* or use typedef, lesson 3 */`,
                  md: "In C, the type name is `struct student`, not just `student`, unless you create an alias with `typedef`.",
                },
                {
                  title: "Assigning a string to a char-array member",
                  wrong: `s.name = "Omar";        /* error: array not assignable */`,
                  right: `strcpy(s.name, "Omar");`,
                  md: "A char array member follows array rules: copy text into it with `strcpy` (or initialise it at declaration).",
                },
                {
                  title: "Comparing structures with ==",
                  wrong: `if (p1 == p2)           /* error */`,
                  right: `if (p1.x == p2.x && p1.y == p2.y)`,
                  md: "C has no built-in structure comparison. Compare members individually (or write a helper function).",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "A struct groups members of possibly different types; an array groups elements of one type.",
                "A struct definition ends with a semicolon and does not by itself allocate memory.",
                "Members are accessed with the dot operator: var.member.",
                "Structures can be assigned, passed and returned by value; they cannot be compared with ==.",
                "sizeof a struct may exceed the sum of its members because of padding.",
              ],
            },
            {
              type: "recap",
              items: [
                "Define with `struct tag { ... };`, declare with `struct tag v;`.",
                "Initialise in order `{a, b}` or by name `{.m = a}`.",
                "Use `.` to reach members, chains of `.` for nested structs.",
                "Functions get copies of struct arguments — return the result if you change it.",
              ],
            },
            {
              type: "exercise",
              id: "c18-ex-rectangle",
              kind: "write",
              title: "Rectangle area and perimeter",
              prompt: "Define `struct rect { double width, height; };` and write `double area(struct rect r)` and `double perimeter(struct rect r)`. For a rectangle 4.5 × 2, print `Area: 9.00` and `Perimeter: 13.00` on separate lines.",
              hint: "Area = width × height; perimeter = 2 × (width + height).",
              solutionCode: `#include <stdio.h>

struct rect {
    double width, height;
};

double area(struct rect r)
{
    return r.width * r.height;
}

double perimeter(struct rect r)
{
    return 2 * (r.width + r.height);
}

int main(void)
{
    struct rect r = {4.5, 2};
    printf("Area: %.2f\\n", area(r));
    printf("Perimeter: %.2f\\n", perimeter(r));
    return 0;
}`,
              expectedOutput: `Area: 9.00
Perimeter: 13.00`,
            },
            {
              type: "exercise",
              id: "c18-ex-predict-copy",
              kind: "predict",
              title: "Copy or share?",
              prompt: "Predict the output.",
              starterCode: `#include <stdio.h>

struct point {
    int x, y;
};

void move(struct point p)
{
    p.x += 10;
}

int main(void)
{
    struct point a = {1, 2};
    struct point b = a;
    b.y = 50;
    move(a);
    printf("%d %d %d %d\\n", a.x, a.y, b.x, b.y);
    return 0;
}`,
              hint: "Both assignment and parameter passing make copies.",
              solution: "b is an independent copy, so only b.y changes to 50. move() modifies its own copy, so a.x stays 1.",
              solutionCode: `#include <stdio.h>

struct point {
    int x, y;
};

void move(struct point p)
{
    p.x += 10;
}

int main(void)
{
    struct point a = {1, 2};
    struct point b = a;
    b.y = 50;
    move(a);
    printf("%d %d %d %d\\n", a.x, a.y, b.x, b.y);
    return 0;
}`,
              expectedOutput: "1 2 1 50",
            },
            {
              type: "exercise",
              id: "c18-ex-concept-struct-vs-array",
              kind: "concept",
              title: "Struct or array?",
              prompt: "For each, say whether a struct or an array is the better fit and why: (a) the 7 daily temperatures of a week; (b) a book with title, author, year and price; (c) 100 books.",
              hint: "Same type and position-based, or different types and name-based?",
              solution: "(a) An array: seven values of the same type identified by position. (b) A struct: different types identified by name. (c) An array of structs: many records, each of which is a book struct.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c18-struct-decl-mcq",
              prompt: "Which statement about `struct item { int id; double price; };` is true?",
              options: [
                { id: "a", text: "It creates a variable called item" },
                { id: "b", text: "It defines a new type called struct item but creates no variable" },
                { id: "c", text: "It is invalid because members have different types" },
                { id: "d", text: "It must be written inside main" },
              ],
              correct: "b",
              explanation: "A struct definition describes a type. Variables are declared separately, e.g. `struct item it;`.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c18-assign-tf",
              prompt: "If `a` and `b` are variables of the same struct type, `a = b;` copies all members of b into a, including array members.",
              correct: true,
              explanation: "Structure assignment copies the whole structure.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c18-predict-nested",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

struct inner { int a, b; };
struct outer { struct inner in; int c; };

int main(void)
{
    struct outer o = { {1, 2}, 3 };
    o.in.b = o.in.a + o.c;
    printf("%d %d %d\\n", o.in.a, o.in.b, o.c);
    return 0;
}`,
              expected: "1 4 3",
              explanation: "o.in.b becomes 1 + 3 = 4.",
            },
            {
              type: "FILL_BLANK",
              slug: "c18-dot-fill",
              prompt: "To access the member `year` of the structure variable `today`, write `today___year`.",
              accepted: [["."]],
            },
          ],
        },
        {
          slug: "struct-arrays-and-pointers",
          title: "Arrays of structures and pointers to structures",
          summary:
            "Store many records in an array of structures, point to structures, use the arrow operator, and pass structures to functions efficiently by pointer.",
          estMinutes: 35,
          blocks: [
            {
              type: "objectives",
              items: [
                "Declare, initialise and traverse an array of structures",
                "Declare a pointer to a structure and access members with ->",
                "Explain that p->m is shorthand for (*p).m",
                "Pass structures to functions by pointer to modify them or avoid copying",
              ],
            },
            {
              type: "markdown",
              md: `A single struct holds one record; most programs need many. An **array of structures** is a table: each element is one row (a record), and each member is a column. \`class[2].name\` reads as "the name of the third student".

When structures get large, copying them into every function call is wasteful, and a function that receives a copy cannot change the original. The solution is the same as for ints: pass a **pointer**. Because accessing members through a pointer is so common, C provides a special operator for it: the **arrow** \`->\`.`,
            },
            {
              type: "definition",
              term: "Array of structures",
              md: "An array whose elements are structures, e.g. `struct student cls[40];`. Access a member with `cls[i].member`.",
            },
            {
              type: "definition",
              term: "Arrow operator (->)",
              md: "Accesses a member through a pointer to a structure: `p->member` is exactly `(*p).member`.",
            },
            {
              type: "syntax",
              language: "c",
              code: `struct tag arr[N];            /* array of structures */
arr[i].member                 /* member of element i */

struct tag *p = &var;         /* pointer to a structure */
p->member                     /* same as (*p).member */`,
              md: "The parentheses in `(*p).member` are required because `.` binds more tightly than `*`; `*p.member` would mean `*(p.member)`.",
            },
            {
              type: "code",
              language: "c",
              title: "A small product table",
              code: `#include <stdio.h>

struct product {
    char name[20];
    int qty;
    double price;
};

int main(void)
{
    struct product stock[] = {
        {"Pencil", 120, 0.45},
        {"Notebook", 35, 2.80},
        {"Eraser", 0, 0.60},
        {"Ruler", 18, 1.25}
    };
    int n = sizeof stock / sizeof stock[0];
    int i;
    double total = 0;

    printf("%-10s %5s %7s\\n", "Item", "Qty", "Value");
    for (i = 0; i < n; i++) {
        double value = stock[i].qty * stock[i].price;
        total += value;
        printf("%-10s %5d %7.2f\\n", stock[i].name, stock[i].qty, value);
    }
    printf("Total stock value: %.2f\\n", total);

    printf("Out of stock:");
    for (i = 0; i < n; i++)
        if (stock[i].qty == 0)
            printf(" %s", stock[i].name);
    printf("\\n");
    return 0;
}`,
              runnable: true,
              output: `Item         Qty   Value
Pencil       120   54.00
Notebook      35   98.00
Eraser         0    0.00
Ruler         18   22.50
Total stock value: 174.50
Out of stock: Eraser`,
              walkthrough: [
                { lines: "11-16", text: "An array of four structures, each initialised with its own brace list. The size is deduced from the initialiser." },
                { lines: "17", text: "The usual element-count trick works for arrays of structs too." },
                { lines: "21", text: "`%-10s` left-aligns text in a 10-character field; `%5s` and `%7s` right-align, making a neat header." },
                { lines: "23", text: "`stock[i].qty` — first index the array, then select the member." },
                { lines: "30-32", text: "Searching the table: print the names of all items whose quantity is 0." },
              ],
            },
            {
              type: "heading",
              text: "Pointers to structures and ->",
              level: 2,
            },
            {
              type: "code",
              language: "c",
              title: "Modifying records through pointers",
              code: `#include <stdio.h>

struct account {
    int number;
    double balance;
};

int withdraw(struct account *acc, double amount)
{
    if (amount > acc->balance)
        return 0;
    acc->balance -= amount;
    return 1;
}

void printAccount(const struct account *acc)
{
    printf("Account %d: balance %.2f\\n", acc->number, acc->balance);
}

struct account *richest(struct account list[], int n)
{
    struct account *best = &list[0];
    int i;
    for (i = 1; i < n; i++)
        if (list[i].balance > best->balance)
            best = &list[i];
    return best;
}

int main(void)
{
    struct account accs[3] = { {1001, 250.0}, {1002, 900.0}, {1003, 75.5} };
    struct account *p = &accs[0];

    printf("(*p).balance = %.2f, p->balance = %.2f\\n", (*p).balance, p->balance);

    if (withdraw(p, 100))
        printAccount(p);
    if (!withdraw(&accs[2], 100))
        printf("Account %d: insufficient funds\\n", accs[2].number);

    printf("Richest is account %d\\n", richest(accs, 3)->number);
    return 0;
}`,
              runnable: true,
              output: `(*p).balance = 250.00, p->balance = 250.00
Account 1001: balance 150.00
Account 1003: insufficient funds
Richest is account 1002`,
              walkthrough: [
                { lines: "8", text: "The function takes a pointer, so it works on the caller's actual account — no copy is made." },
                { lines: "10-12", text: "`acc->balance` reads and updates the member through the pointer." },
                { lines: "16", text: "`const struct account *` is the efficient way to pass a structure that the function only reads: just an address is passed, and const forbids changes." },
                { lines: "21-29", text: "Returning a pointer to the best element of the caller's array is safe because that array outlives the function." },
                { lines: "34", text: "`p` points to the first account." },
                { lines: "36", text: "`(*p).balance` and `p->balance` are the same thing; the arrow is just nicer to write." },
                { lines: "38-41", text: "Pass a pointer to the account to change. The second withdrawal fails because 75.50 < 100." },
                { lines: "43", text: "The function returns a pointer, so we can apply `->` directly to the call's result." },
              ],
            },
            {
              type: "callout",
              variant: "exam",
              title: "Dot or arrow?",
              md: "Use `.` when the thing on the left **is** a structure (`s.x`, `arr[i].x`). Use `->` when the thing on the left is a **pointer** to a structure (`p->x`). If you get it wrong, the compiler tells you — but you must know the rule for written exams.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `An array of structs is laid out like any array: element after element, each one structure-sized, so \`stock[i]\` is found by the usual index arithmetic and \`.qty\` then adds the member offset. A pointer to a struct holds the struct's start address; \`p->qty\` means "go to that address, then to the qty offset". Passing a pointer copies only an address, so it is fast regardless of the structure's size and lets the function update the original.`,
            },
            {
              type: "heading",
              text: "Real-world applications",
              level: 2,
            },
            {
              type: "markdown",
              md: `- In-memory tables: a list of contacts, a class register, an inventory.
- Sorting records by a field (for example with \`qsort\` and a comparison function receiving \`const void *\` that you convert to \`const struct product *\`).
- Linked lists and trees: each node is a struct containing a pointer to the next node, accessed as \`node->next\`.
- Large configuration or state structures in games and operating systems are almost always passed by pointer.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Using . with a pointer",
                  wrong: `struct account *p = &a;
p.balance = 0;          /* error: p is a pointer */`,
                  right: `p->balance = 0;         /* or (*p).balance = 0; */`,
                  md: "The dot operator needs a structure on its left. With a pointer, use the arrow.",
                },
                {
                  title: "Missing parentheses in (*p).member",
                  wrong: `*p.balance = 0;         /* parsed as *(p.balance) */`,
                  right: `(*p).balance = 0;`,
                  md: "`.` has higher precedence than unary `*`. This is exactly why `->` exists.",
                },
                {
                  title: "Expecting a by-value parameter to update the caller",
                  wrong: `void deposit(struct account a, double x)
{
    a.balance += x;        /* changes a copy */
}`,
                  right: `void deposit(struct account *a, double x)
{
    a->balance += x;
}`,
                  md: "To change the caller's structure, take a pointer parameter and call with `&acc`.",
                },
                {
                  title: "Indexing in the wrong place",
                  wrong: `printf("%s\\n", stock.name[2]);   /* stock is the array */`,
                  right: `printf("%s\\n", stock[2].name);`,
                  md: "First choose the element of the array of structs, then the member.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "Access a member of element i of an array of structs with arr[i].member.",
                "p->member is equivalent to (*p).member.",
                "Use . with a structure, -> with a pointer to a structure.",
                "Passing a pointer avoids copying the structure and allows the function to modify it.",
                "Use const struct T * for read-only structure parameters.",
              ],
            },
            {
              type: "recap",
              items: [
                "Arrays of structs are tables of records.",
                "Point to a struct with `struct T *p = &s;`.",
                "Read and write members through pointers with `->`.",
                "Prefer pointer parameters for large or modifiable structs.",
              ],
            },
            {
              type: "exercise",
              id: "c18-ex-average-age",
              kind: "write",
              title: "Average age of a group",
              prompt: "Define `struct person { char name[20]; int age; };` and an array of three people: Ali 19, Bea 22, Chen 25. Write `double averageAge(const struct person *p, int n)` that uses `->` (or `p[i].age`) to compute the average. Print `Average age: 22.0`.",
              hint: "Loop i from 0 to n − 1 and add `(p + i)->age` or `p[i].age`.",
              solutionCode: `#include <stdio.h>

struct person {
    char name[20];
    int age;
};

double averageAge(const struct person *p, int n)
{
    int i, sum = 0;
    for (i = 0; i < n; i++)
        sum += (p + i)->age;
    return (double)sum / n;
}

int main(void)
{
    struct person group[3] = { {"Ali", 19}, {"Bea", 22}, {"Chen", 25} };
    printf("Average age: %.1f\\n", averageAge(group, 3));
    return 0;
}`,
              expectedOutput: "Average age: 22.0",
            },
            {
              type: "exercise",
              id: "c18-ex-debug-birthday",
              kind: "debug",
              title: "The birthday that never happens",
              prompt: "After calling `birthday(p)`, the person's age is unchanged. Find and fix the bug.",
              starterCode: `struct person { char name[20]; int age; };

void birthday(struct person x)
{
    x.age++;
}

/* in main: birthday(p); printf("%d\\n", p.age); */`,
              hint: "Is the function working on the original or on a copy?",
              solution: "The structure is passed by value, so `x` is a copy. Take a pointer: `void birthday(struct person *x) { x->age++; }` and call it as `birthday(&p);`.",
            },
            {
              type: "exercise",
              id: "c18-ex-predict-arrow",
              kind: "predict",
              title: "Walking an array of structs with a pointer",
              prompt: "Predict the output.",
              starterCode: `#include <stdio.h>

struct pt { int x, y; };

int main(void)
{
    struct pt pts[3] = { {1, 2}, {3, 4}, {5, 6} };
    struct pt *p = pts;
    p->x = 10;
    p++;
    p->y += p->x;
    printf("%d %d %d\\n", pts[0].x, pts[1].y, (p + 1)->x);
    return 0;
}`,
              hint: "p++ moves to the next whole structure.",
              solution: "pts[0].x becomes 10. After p++, p points to pts[1], whose y becomes 4 + 3 = 7. (p + 1)->x is pts[2].x = 5.",
              solutionCode: `#include <stdio.h>

struct pt { int x, y; };

int main(void)
{
    struct pt pts[3] = { {1, 2}, {3, 4}, {5, 6} };
    struct pt *p = pts;
    p->x = 10;
    p++;
    p->y += p->x;
    printf("%d %d %d\\n", pts[0].x, pts[1].y, (p + 1)->x);
    return 0;
}`,
              expectedOutput: "10 7 5",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c18-arrow-mcq",
              prompt: "If `sp` is a pointer to a structure with member `score`, which expression is **not** equivalent to the others?",
              options: [
                { id: "a", text: "sp->score" },
                { id: "b", text: "(*sp).score" },
                { id: "c", text: "*sp.score" },
                { id: "d", text: "sp[0].score" },
              ],
              correct: "c",
              explanation: "`*sp.score` parses as `*(sp.score)`, which is an error since sp is a pointer. The others all access the member.",
            },
            {
              type: "TRUE_FALSE",
              slug: "c18-pass-pointer-tf",
              prompt: "Passing a pointer to a large structure is usually more efficient than passing the structure by value.",
              correct: true,
              explanation: "Only an address is copied instead of the whole structure.",
            },
            {
              type: "FILL_BLANK",
              slug: "c18-arrow-fill",
              prompt: "If `p` points to a struct with member `id`, the expression `(*p).id` can be written as `p___id`.",
              accepted: [["->"]],
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c18-predict-array-structs",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

struct item { char code; int qty; };

int main(void)
{
    struct item list[] = { {'A', 3}, {'B', 0}, {'C', 7} };
    int i, total = 0;
    for (i = 0; i < 3; i++)
        if (list[i].qty > 0) {
            printf("%c", list[i].code);
            total += list[i].qty;
        }
    printf(" %d\\n", total);
    return 0;
}`,
              expected: "AC 10",
              explanation: "Only items A and C have positive quantity; 3 + 7 = 10.",
            },
            {
              type: "CODE_WRITING",
              slug: "c18-code-top-student",
              prompt: "Define a structure with a name (at most 29 characters, no spaces) and an integer score. Read `n` (1 ≤ n ≤ 50), then `n` lines each containing a name and a score. Print the name and score of the student with the highest score, separated by a space. If several share the highest score, print the first one.\n\nExample input:\n```\n3\nAna 82\nBen 95\nCai 77\n```\nOutput: `Ben 95`",
              starterCode: `#include <stdio.h>

struct student {
    char name[30];
    int score;
};

int main(void)
{
    struct student s[50];
    int n, i;
    scanf("%d", &n);
    /* read the students and find the best */
    return 0;
}`,
              sampleTests: [
                { stdin: "3\nAna 82\nBen 95\nCai 77", expected: "Ben 95" },
              ],
              hiddenTests: [
                { stdin: "1\nSolo 50", expected: "Solo 50" },
                { stdin: "4\nA 70\nB 90\nC 90\nD 10", expected: "B 90" },
                { stdin: "2\nLow 0\nNeg -5", expected: "Low 0" },
              ],
              solutionCode: `#include <stdio.h>

struct student {
    char name[30];
    int score;
};

int main(void)
{
    struct student s[50];
    int n, i, best = 0;
    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%29s %d", s[i].name, &s[i].score);
    for (i = 1; i < n; i++)
        if (s[i].score > s[best].score)
            best = i;
    printf("%s %d\\n", s[best].name, s[best].score);
    return 0;
}`,
              explanation: "Read into s[i].name (an array, so no &) and &s[i].score. Track the index of the best; using > keeps the first of any ties.",
            },
          ],
        },
      ],
    },
    {
      slug: "unions-enums-typedef",
      title: "Unions, enumerations and typedef",
      lessons: [
        {
          slug: "unions-enums-and-typedef",
          title: "Unions, enums and typedef",
          summary:
            "Share one block of memory between alternatives with unions, give names to integer constants with enums, and create readable type aliases with typedef.",
          estMinutes: 35,
          blocks: [
            {
              type: "objectives",
              items: [
                "Explain how a union differs from a structure in memory",
                "Use a tagged union safely by tracking which member is active",
                "Declare enumerations and use enumeration constants in switch statements",
                "Create type aliases with typedef, including for structures",
              ],
            },
            {
              type: "markdown",
              md: `This lesson covers three smaller tools for defining your own types.

**Unions.** A structure gives each member its *own* storage. A **union** makes all members **share the same storage** — it can hold only one of them at a time. Think of a single parking space marked "car OR motorbike OR van": whichever vehicle is parked there now is the only valid one. Unions save memory when a value can be one of several kinds but never several at once.

**Enumerations.** Programs often use small sets of codes: days of the week, menu choices, traffic-light colours. Writing \`if (light == 2)\` is cryptic. An **enum** gives those numbers names: \`if (light == GREEN)\`.

**typedef.** Writing \`struct student\` everywhere gets tedious. \`typedef\` creates a new **name** (an alias) for an existing type, so you can just write \`Student\`.`,
            },
            {
              type: "definition",
              term: "Union",
              md: "A user-defined type whose members all start at the same address and overlap. Its size is at least that of its largest member. Only the member most recently written holds a meaningful value.",
            },
            {
              type: "definition",
              term: "Enumeration (enum)",
              md: "A type consisting of a set of named integer constants called enumerators. By default the first is 0 and each next one is one greater.",
            },
            {
              type: "definition",
              term: "typedef",
              md: "A keyword that introduces an alias for an existing type. It does not create a new distinct type; the alias and the original are interchangeable.",
            },
            {
              type: "syntax",
              language: "c",
              code: `union tag { type1 m1; type2 m2; };     /* members overlap */

enum tag { NAME0, NAME1, NAME2 };       /* 0, 1, 2 */
enum tag { A = 1, B, C = 10, D };       /* 1, 2, 10, 11 */

typedef existing_type NewName;
typedef struct { int x, y; } Point;     /* alias for an unnamed struct */`,
            },
            {
              type: "table",
              caption: "struct versus union",
              headers: ["", "struct", "union"],
              rows: [
                ["Storage", "Each member has its own space", "All members share one space"],
                ["Size", "At least the sum of members (plus padding)", "At least the largest member"],
                ["Valid members at once", "All of them", "Only the last one written"],
                ["Typical use", "Records with several properties", "A value that may be one of several kinds"],
              ],
            },
            {
              type: "code",
              language: "c",
              title: "A tagged union: one value, several possible kinds",
              code: `#include <stdio.h>

enum kind { INT_VALUE, REAL_VALUE, CHAR_VALUE };

union payload {
    int i;
    double d;
    char c;
};

struct value {
    enum kind tag;
    union payload data;
};

void printValue(struct value v)
{
    switch (v.tag) {
    case INT_VALUE:
        printf("int: %d\\n", v.data.i);
        break;
    case REAL_VALUE:
        printf("real: %.3f\\n", v.data.d);
        break;
    case CHAR_VALUE:
        printf("char: %c\\n", v.data.c);
        break;
    }
}

int main(void)
{
    struct value items[3];
    union payload u;
    int i;

    items[0].tag = INT_VALUE;   items[0].data.i = 42;
    items[1].tag = REAL_VALUE;  items[1].data.d = 3.14159;
    items[2].tag = CHAR_VALUE;  items[2].data.c = 'Z';

    for (i = 0; i < 3; i++)
        printValue(items[i]);

    printf("union at least as big as a double? %d\\n", sizeof u >= sizeof(double));
    printf("all members share one address? %d\\n",
           (void *)&u.i == (void *)&u.d && (void *)&u.d == (void *)&u.c);
    return 0;
}`,
              runnable: true,
              output: `int: 42
real: 3.142
char: Z
union at least as big as a double? 1
all members share one address? 1`,
              walkthrough: [
                { lines: "3", text: "An enum names the three possible kinds. INT_VALUE is 0, REAL_VALUE is 1, CHAR_VALUE is 2." },
                { lines: "5-9", text: "The union can hold an int **or** a double **or** a char, in the same memory." },
                { lines: "11-14", text: "A **tagged union**: a struct that pairs the union with an enum recording which member is currently valid." },
                { lines: "18-28", text: "`switch` on the tag decides which member to read. Enum constants are integer constants, so they work as `case` labels." },
                { lines: "37-39", text: "Set the tag and the matching member together, so they always agree." },
                { lines: "44", text: "A union is at least as large as its largest member (the double). Its exact size is system-dependent, so we print only the comparison." },
                { lines: "45-46", text: "Every member of a union begins at the same address — that is what \"sharing storage\" means. We compare addresses rather than printing them." },
              ],
            },
            {
              type: "callout",
              variant: "warning",
              title: "Reading the wrong union member",
              md: "If you store `u.d = 3.5;` and then read `u.i`, you get the double's bytes reinterpreted as an int — a meaningless, system-dependent value. Always read the member that was last written, which is exactly what the tag in a tagged union keeps track of.",
            },
            {
              type: "heading",
              text: "Enumerations and typedef together",
              level: 2,
            },
            {
              type: "code",
              language: "c",
              title: "A traffic light and a typedef'd structure",
              code: `#include <stdio.h>

typedef enum { RED, YELLOW, GREEN } Light;

typedef struct {
    char name[20];
    Light state;
    int seconds;
} Signal;

typedef unsigned int uint;

Light next(Light l)
{
    switch (l) {
    case RED:    return GREEN;
    case GREEN:  return YELLOW;
    default:     return RED;
    }
}

const char *lightName(Light l)
{
    static const char *names[] = {"RED", "YELLOW", "GREEN"};
    return names[l];
}

int main(void)
{
    Signal s = {"Main St", RED, 30};
    uint step;
    enum month { JAN = 1, FEB, MAR, DEC = 12 };

    for (step = 0; step < 4; step++) {
        printf("%s: %s (value %d)\\n", s.name, lightName(s.state), s.state);
        s.state = next(s.state);
    }
    printf("FEB = %d, MAR = %d, DEC = %d\\n", FEB, MAR, DEC);
    return 0;
}`,
              runnable: true,
              output: `Main St: RED (value 0)
Main St: GREEN (value 2)
Main St: YELLOW (value 1)
Main St: RED (value 0)
FEB = 2, MAR = 3, DEC = 12`,
              walkthrough: [
                { lines: "3", text: "`typedef enum {...} Light;` defines the enumeration and gives it the short name `Light` in one step. RED = 0, YELLOW = 1, GREEN = 2." },
                { lines: "5-9", text: "An unnamed structure with the alias `Signal`. Now variables are declared as `Signal s;` instead of `struct something s;`." },
                { lines: "11", text: "typedef works for any type, not just structs: `uint` is now another name for `unsigned int`." },
                { lines: "13-20", text: "A function that takes and returns the enum type. The switch makes the light sequence RED → GREEN → YELLOW → RED readable." },
                { lines: "22-26", text: "Because enumerators are small integers starting at 0, they can index an array of names. (`static` keeps the array alive after the function returns; storage classes are covered in the next chapter.)" },
                { lines: "32", text: "Enumerators can be given explicit values. FEB and MAR continue counting from JAN = 1, and DEC is set to 12." },
                { lines: "35", text: "An enum value printed with `%d` shows its underlying integer." },
              ],
            },
            {
              type: "callout",
              variant: "tip",
              title: "Why prefer enum over #define for related constants?",
              md: "An enum groups related names under one type, numbers them automatically, documents what values a variable is meant to hold (`Light state`), and debuggers can show the names. `#define RED 0` is just text replacement with none of those benefits.",
            },
            {
              type: "heading",
              text: "Why it works",
              level: 2,
            },
            {
              type: "markdown",
              md: `A union is laid out with every member at offset 0, so its size only needs to fit the largest member; writing one member overwrites the bytes of the others. Enumerators are simply integer constants that the compiler substitutes, so they cost nothing at run time and work anywhere an integer constant does (\`case\` labels, array sizes). \`typedef\` is purely a compile-time naming tool: \`Signal\` and the unnamed struct type are the same type, so no conversions are ever involved.`,
            },
            {
              type: "heading",
              text: "Real-world applications",
              level: 2,
            },
            {
              type: "markdown",
              md: `- **Unions:** interpreters and spreadsheet cells store "a number or a string or a boolean" in a tagged union; network code parses message bodies whose layout depends on a type field.
- **Enums:** states of a state machine (IDLE, RUNNING, STOPPED), error codes, menu options, days and months.
- **typedef:** portable size-specific types like \`uint32_t\` in \`<stdint.h>\` are typedefs; \`size_t\` and \`FILE\` are typedefs too. Libraries hide implementation details behind typedef names.`,
            },
            {
              type: "mistakes",
              items: [
                {
                  title: "Using several union members as if they were independent",
                  wrong: `union payload p;
p.i = 5;
p.d = 2.5;
printf("%d\\n", p.i);     /* not 5 any more */`,
                  right: `struct both { int i; double d; } p;
p.i = 5;
p.d = 2.5;
printf("%d\\n", p.i);     /* 5 */`,
                  md: "Union members overlap; writing one destroys the others. If you need all values at once, use a struct.",
                },
                {
                  title: "Assuming enum values start at 1",
                  wrong: `enum day { MON, TUE, WED };
/* expecting MON == 1 */`,
                  right: `enum day { MON = 1, TUE, WED };   /* 1, 2, 3 */`,
                  md: "Enumerators start at 0 unless you give a starting value.",
                },
                {
                  title: "Forgetting that typedef needs the alias at the end",
                  wrong: `typedef Point struct { int x, y; };   /* error */`,
                  right: `typedef struct { int x, y; } Point;`,
                  md: "typedef follows the pattern of a declaration: `typedef <type> <NewName>;`. The new name goes where a variable name would go.",
                },
                {
                  title: "Using a struct tag when only a typedef name exists",
                  wrong: `typedef struct { int x, y; } Point;
struct Point p;          /* error: no tag called Point */`,
                  right: `Point p;`,
                  md: "An unnamed struct with a typedef has no tag. Use the alias, or give the struct a tag too: `typedef struct Point { ... } Point;`.",
                },
              ],
            },
            {
              type: "examPoints",
              items: [
                "All members of a union share the same memory; its size is at least that of its largest member.",
                "Only the most recently written union member holds a meaningful value.",
                "Enumerators are integer constants; they start at 0 and increase by 1 unless assigned.",
                "In enum { A = 5, B, C }, B is 6 and C is 7.",
                "typedef creates an alias, not a new distinct type: typedef struct {...} Name;",
                "A tagged union pairs an enum tag with a union to record which member is valid.",
              ],
            },
            {
              type: "recap",
              items: [
                "struct: all members at once; union: one member at a time.",
                "enum names a set of related integer constants.",
                "typedef gives a shorter or clearer name to any type.",
                "Combine them: typedef'd structs with enum fields and tagged unions.",
              ],
            },
            {
              type: "exercise",
              id: "c18-ex-shape-area",
              kind: "write",
              title: "Shapes with a tagged union",
              prompt: "Create `typedef enum { CIRCLE, SQUARE } ShapeKind;` and a `Shape` struct holding a kind and a union with `double radius` and `double side`. Write `double shapeArea(Shape s)` (use 3.14159 for π). Print the areas of a circle with radius 2 and a square with side 3, with two decimals: `12.57` and `9.00` on separate lines.",
              hint: "Switch on s.kind and read only the matching union member.",
              solutionCode: `#include <stdio.h>

typedef enum { CIRCLE, SQUARE } ShapeKind;

typedef struct {
    ShapeKind kind;
    union {
        double radius;
        double side;
    } dim;
} Shape;

double shapeArea(Shape s)
{
    switch (s.kind) {
    case CIRCLE: return 3.14159 * s.dim.radius * s.dim.radius;
    case SQUARE: return s.dim.side * s.dim.side;
    }
    return 0;
}

int main(void)
{
    Shape c, q;
    c.kind = CIRCLE;
    c.dim.radius = 2;
    q.kind = SQUARE;
    q.dim.side = 3;
    printf("%.2f\\n", shapeArea(c));
    printf("%.2f\\n", shapeArea(q));
    return 0;
}`,
              expectedOutput: `12.57
9.00`,
            },
            {
              type: "exercise",
              id: "c18-ex-predict-enum",
              kind: "predict",
              title: "Enumerator values",
              prompt: "Predict the output.",
              starterCode: `#include <stdio.h>

enum level { LOW, MEDIUM = 5, HIGH, MAX = HIGH * 2 };

int main(void)
{
    printf("%d %d %d %d\\n", LOW, MEDIUM, HIGH, MAX);
    return 0;
}`,
              hint: "Counting continues from the last explicit value.",
              solution: "LOW = 0, MEDIUM = 5, HIGH = 6, MAX = 6 × 2 = 12.",
              solutionCode: `#include <stdio.h>

enum level { LOW, MEDIUM = 5, HIGH, MAX = HIGH * 2 };

int main(void)
{
    printf("%d %d %d %d\\n", LOW, MEDIUM, HIGH, MAX);
    return 0;
}`,
              expectedOutput: "0 5 6 12",
            },
            {
              type: "exercise",
              id: "c18-ex-concept-union",
              kind: "concept",
              title: "Union or struct?",
              prompt: "A sensor reading is either a temperature (double) or an error code (int), never both. Another record stores a city's temperature **and** its population. Which should be a union and which a struct? Explain.",
              hint: "Do you need both values at the same time?",
              solution: "The sensor reading should be a (tagged) union: only one of the two values is meaningful at a time, so they can share storage, with a tag saying which. The city record should be a struct, because both the temperature and the population must be stored simultaneously.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "c18-union-size-mcq",
              prompt: "For `union u { char c; int i; double d; };`, which statement is guaranteed?",
              options: [
                { id: "a", text: "sizeof(union u) equals sizeof(char) + sizeof(int) + sizeof(double)" },
                { id: "b", text: "sizeof(union u) is at least sizeof(double)" },
                { id: "c", text: "All three members can hold independent values at the same time" },
                { id: "d", text: "sizeof(union u) is always exactly 8" },
              ],
              correct: "b",
              explanation: "A union must be large enough for its largest member; padding may make it larger, and exact sizes are system-dependent.",
            },
            {
              type: "OUTPUT_PREDICTION",
              slug: "c18-predict-enum-switch",
              prompt: "What does this program print?",
              code: `#include <stdio.h>

typedef enum { NORTH, EAST, SOUTH, WEST } Dir;

Dir turnRight(Dir d)
{
    return (Dir)((d + 1) % 4);
}

int main(void)
{
    Dir d = WEST;
    int i;
    for (i = 0; i < 3; i++)
        d = turnRight(d);
    printf("%d\\n", d);
    return 0;
}`,
              expected: "2",
              explanation: "WEST (3) → NORTH (0) → EAST (1) → SOUTH (2).",
            },
            {
              type: "TRUE_FALSE",
              slug: "c18-typedef-tf",
              prompt: "`typedef int Score;` creates a brand-new type that cannot be mixed with int.",
              correct: false,
              explanation: "typedef only creates an alias; Score and int are the same type.",
            },
            {
              type: "FILL_BLANK",
              slug: "c18-enum-fill",
              prompt: "In `enum color { RED, GREEN = 4, BLUE };`, the value of BLUE is ___.",
              accepted: [["5"]],
            },
          ],
        },
      ],
    },
  ],
};

export default chapter;
