import type { CourseContent } from "../../src/lib/content/schema";
import ch01 from "./chapters/01-characteristics-of-life";
import ch02 from "./chapters/02-cell-theory-and-structure";
import ch03 from "./chapters/03-intro-computational-biology";
import ch04 from "./chapters/04-unit-1-revision";

/**
 * Study material for BTT1102 Introduction to Computational Biology.
 * Scope: Unit 1 only, as defined in the official syllabus (PDF p. 91):
 *   A Characteristics of living organisms
 *   B Cell theory; Structure of Prokaryotic and Eukaryotic Cells
 *   C Introduction to Computational Biology and its interdisciplinary applications
 * Teaching content follows the teacher's "bio unit 1" slides; topic C is not in the slides.
 */
const course: CourseContent = {
  subject: { slug: "biology", name: "Biology", kind: "SCIENCE", description: "Biology and computational biology." },
  slug: "btt1102-computational-biology",
  title: "Introduction to Computational Biology (BTT1102)",
  summary:
    "Study material for BTT1102. Unit 1: characteristics of living organisms, cell theory, cell structure, prokaryotic and eukaryotic cells, and an introduction to computational biology. Further units will be added later.",
  level: "Semester 1",
  codeLanguage: null,
  isStarterContent: false,
  units: [
    {
      slug: "unit-1",
      title: "Unit 1 · Introduction to Biology and Computational Biology",
      summary: "Characteristics of living organisms; cell theory; structure of prokaryotic and eukaryotic cells; introduction to computational biology.",
      chapters: [ch01, ch02, ch03, ch04],
    },
  ],
};

export default course;
