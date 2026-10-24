import type { AssessmentDefinition } from "../../src/lib/content/assessment-schema";
import cFundamentals50 from "./c-fundamentals-pointers-50";
import cFundamentals2 from "./c-fundamentals-to-pointers-2";
import bioUnit1 from "./bio-unit-1-practice-test";

/** Seed assessments imported by `npm run content:import`. Existing tests are never overwritten without --force. */
export const assessments: AssessmentDefinition[] = [cFundamentals50, cFundamentals2, bioUnit1];
