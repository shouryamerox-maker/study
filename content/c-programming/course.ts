import type { CourseContent } from "../../src/lib/content/schema";
import ch01 from "./chapters/01-introduction";
import ch02 from "./chapters/02-program-structure";
import ch03 from "./chapters/03-tokens";
import ch04 from "./chapters/04-variables-constants";
import ch05 from "./chapters/05-data-types";
import ch06 from "./chapters/06-input-output";
import ch07 from "./chapters/07-operators";
import ch08 from "./chapters/08-precedence";
import ch09 from "./chapters/09-conditionals";
import ch10 from "./chapters/10-loops";
import ch11 from "./chapters/11-nested-loops-patterns";
import ch12 from "./chapters/12-functions";
import ch13 from "./chapters/13-recursion";
import ch14 from "./chapters/14-arrays";
import ch15 from "./chapters/15-strings";
import ch16 from "./chapters/16-pointers";
import ch17 from "./chapters/17-pointers-arrays-functions";
import ch18 from "./chapters/18-structures-unions";
import ch19 from "./chapters/19-storage-classes";
import ch20 from "./chapters/20-dynamic-memory";
import ch21 from "./chapters/21-file-handling";
import ch22 from "./chapters/22-preprocessor";
import ch23 from "./chapters/23-advanced-topics";
import ch24 from "./chapters/24-problem-solving";

/**
 * STARTER CONTENT — this C course is an original starter curriculum written for the
 * platform. It is NOT the official university syllabus. Replace or re-map it once the
 * official syllabus is supplied (slugs keep progress records stable).
 */
const course: CourseContent = {
  subject: {
    slug: "programming",
    name: "Programming",
    kind: "PROGRAMMING",
    description: "Programming languages and problem solving.",
  },
  slug: "c-programming",
  title: "C Programming: From Zero to Pointers and Beyond",
  summary:
    "Learn C from first principles: program structure, data types, control flow, functions, arrays, strings, pointers, memory management, files and advanced topics, with runnable examples and practice.",
  level: "Beginner → Advanced",
  codeLanguage: "c",
  isStarterContent: true,
  units: [
    { slug: "getting-started", title: "Unit 1 · Getting Started", summary: "What C is, how a program is built and run, and the building blocks of the language.", chapters: [ch01, ch02, ch03] },
    { slug: "data-and-io", title: "Unit 2 · Data and Input/Output", summary: "Storing values, choosing data types and talking to the user.", chapters: [ch04, ch05, ch06] },
    { slug: "operators-expressions", title: "Unit 3 · Operators and Expressions", summary: "Computing with values and understanding evaluation order.", chapters: [ch07, ch08] },
    { slug: "control-flow", title: "Unit 4 · Control Flow", summary: "Making decisions and repeating work.", chapters: [ch09, ch10, ch11] },
    { slug: "functions", title: "Unit 5 · Functions", summary: "Breaking programs into reusable pieces, including recursion.", chapters: [ch12, ch13] },
    { slug: "arrays-strings", title: "Unit 6 · Arrays and Strings", summary: "Working with collections of values and text.", chapters: [ch14, ch15] },
    { slug: "pointers", title: "Unit 7 · Pointers", summary: "Addresses, dereferencing and using pointers with arrays and functions.", chapters: [ch16, ch17] },
    { slug: "types-and-memory", title: "Unit 8 · User-Defined Types and Memory", summary: "Structures, storage classes and dynamic memory.", chapters: [ch18, ch19, ch20] },
    { slug: "files-preprocessor", title: "Unit 9 · Files and the Preprocessor", summary: "Persisting data and building with macros and headers.", chapters: [ch21, ch22] },
    { slug: "advanced", title: "Unit 10 · Advanced C and Projects", summary: "Function pointers, bit manipulation, undefined behaviour, debugging and mini-projects.", chapters: [ch23, ch24] },
  ],
};

export default course;
