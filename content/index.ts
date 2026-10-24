/**
 * Registry of course content packages. Add a new course (any subject) here, then run
 * `npm run content:import`. See content/CONTENT_GUIDE.md.
 */
import type { CourseContent } from "../src/lib/content/schema";
import cProgramming from "./c-programming/course";
import btt1102 from "./btt1102/course";

export const courses: CourseContent[] = [cProgramming, btt1102];
