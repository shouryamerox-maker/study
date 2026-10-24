/**
 * OFFICIAL SYLLABUS MAP — Sharda University, B.Tech CSE–AIML, batch 2026–2030, Semester 1.
 *
 * Source: B_Tech_CSE-AIML_course_syllabus_2026-2030.pdf, PDF pages 1–108 only.
 * Every value below was transcribed from the PDF; `page` / `pages` give the PDF page it
 * came from (in this PDF the printed page number equals the PDF page number).
 *
 * Rules followed:
 *  - Unit titles and topic wording are kept as printed (including the PDF's own spelling).
 *  - Nothing is invented. Anything the PDF does not state is `null` and shown as
 *    "not specified" in the app.
 *  - Inconsistencies inside the PDF are recorded in `sourceNotes`, not silently resolved.
 *
 * This is syllabus data only — it is NOT study material and is not linked to lessons.
 */

export interface SyllabusTopic {
  /** Topic label as printed in the outline syllabus (A, B, C). */
  id: string;
  text: string;
}

export interface SyllabusUnit {
  number: number;
  title: string;
  /** Hours breakdown printed next to the unit title, if any (e.g. "6-3-12-6 = 27 hrs"). */
  hours?: string;
  topics: SyllabusTopic[];
  pages: number[];
}

export interface ExamCoverage {
  /** Name as printed, e.g. "Mid Term Examination (MTE)". */
  name: string;
  marks: string;
  /** Units explicitly stated as covered; null when the PDF does not say. */
  units: number[] | null;
  /** The PDF's own wording of the coverage rule. */
  statement: string;
  page: number;
}

export interface SyllabusSubject {
  code: string;
  /** Official name from the Semester 1 course list (PDF page 26). */
  name: string;
  icon: "computer" | "zap" | "sigma" | "heart" | "code" | "dna" | "leaf";
  credits: number | null;
  /** Contact hours exactly as printed. */
  contactHours: string | null;
  courseType: string | null;
  /** Overall marks distribution exactly as printed. */
  assessment: string | null;
  assessmentPage: number | null;
  midSem: ExamCoverage | null;
  endSem: ExamCoverage | null;
  units: SyllabusUnit[];
  /** Range of PDF pages that make up this subject's course plan. */
  pages: [number, number];
  /** Inconsistencies or gaps found in the source PDF for this subject. */
  sourceNotes: string[];
}

export interface Semester {
  slug: string;
  name: string;
  /** Total credits as printed on the semester course list. */
  statedCredits: number | null;
  listPage: number;
  subjects: SyllabusSubject[];
  sourceNotes: string[];
}

export interface SyllabusProgramme {
  university: string;
  programme: string;
  batch: string;
  academicYear: string;
  sourceFile: string;
  sourcePages: string;
  semesters: Semester[];
}

const subjects: SyllabusSubject[] = [
  {
    code: "CSAI1101",
    name: "Fundamentals of Computing and Artificial Intelligence",
    icon: "computer",
    credits: 3,
    contactHours: "2-0-0-2 (L-T-P-SL)",
    courseType: "Core - Theory Only",
    assessment: "CA: 25% | MTE: 15% | ETE: 60% | Total: 100 marks",
    assessmentPage: 28,
    midSem: {
      name: "Mid Term Examination (MTE)",
      marks: "15 marks",
      units: [1, 2],
      statement: "MTE covers Units 1–2 and CO1-CO6 are assessed in ETE. MTE maps to TS1–TS3.",
      page: 36,
    },
    endSem: {
      name: "End Term Examination (ETE)",
      marks: "60 marks",
      units: [1, 2, 3, 4, 5],
      statement: "ETE is comprehensive -- all 5 units and all 6 COs.",
      page: 36,
    },
    units: [
      {
        number: 1,
        title: "Hardware aspect of Computer Science & Engineering",
        pages: [29],
        topics: [
          { id: "A", text: "History of Computing Systems, Computer Basics and Computer Organization." },
          { id: "B", text: "Data Representation in Computers: Number System with Conversion, Binary codes" },
          { id: "C", text: "Evolution of Programming Languages: Low Level Languages, High Level, Machine, Assembly Languages" },
        ],
      },
      {
        number: 2,
        title: "Visual Thinking and Problem Understanding",
        pages: [29],
        topics: [
          { id: "A", text: "Introduction to problem visualization: mental models vs external representations, benefits for computational thinking" },
          { id: "B", text: "Types of visual tools: sketches, mind maps, lists, tables, timelines, storyboards" },
          { id: "C", text: "Introduction to Algorithms & Pseudo code: Problem Solving Approach" },
        ],
      },
      {
        number: 3,
        title: "Visualizing Processes and Logic",
        pages: [29],
        topics: [
          { id: "A", text: "Flowchart fundamentals: symbols, control structures, branching, loops, input-output" },
          { id: "B", text: "Decision tables and truth tables for logical conditions" },
          { id: "C", text: "Step-by-step execution tracing: dry runs, state tables, variable tracking, Test cases" },
        ],
      },
      {
        number: 4,
        title: "Introduction to Artificial Intelligence",
        pages: [29],
        topics: [
          { id: "A", text: "Fundamental concepts and principles of AI , Objectives and goals of intelligent systems , Historical evolution and milestones in AI development" },
          { id: "B", text: "Overview of the AI curriculum and core domain, learning pathway for AI development, Real-world applications of AI across diverse domains" },
          { id: "C", text: "AI-based vs traditional problem-solving techniques, Rational agents and intelligent behaviour, Philosophical and practical perspectives of AI systems" },
        ],
      },
      {
        number: 5,
        title: "Introduction to Machine Learning",
        pages: [29, 30],
        topics: [
          { id: "A", text: "Role and significance of machine learning within AI, Types of learning paradigms (supervised, unsupervised, reinforcement learning)" },
          { id: "B", text: "Core concepts of classification and clustering, Basic algorithms and their working principles (Supervised Learning Algorithms)" },
          { id: "C", text: "Applications of ML in various domains" },
        ],
      },
    ],
    pages: [27, 40],
    sourceNotes: [
      "The course identification table shows “Semester: I”; the page header reads “Semester VI”. It is listed under Semester 1 on PDF page 26.",
      "The course plan title spells it “Fundamental of Computing and Artificial Intelligence”; the official Semester 1 list uses “Fundamentals…”.",
      "The MTE section (p. 36) states Units 1–2 only, but its question guidance also mentions flowcharts, decision tables and execution tracing, which are Unit 3 topics. The stated Units 1–2 coverage is shown here.",
    ],
  },
  {
    code: "EEE1101",
    name: "Basics of Electrical and Electronics Engineering",
    icon: "zap",
    credits: 4,
    contactHours: "2-1-2-3 (L-T-P-SL)",
    courseType: "Core",
    assessment: "Lab (40 marks) + MTE (10 marks) + ETE (50 marks) = 100 marks",
    assessmentPage: 42,
    midSem: {
      name: "Mid Term Examination (MTE)",
      marks: "10 marks",
      units: [1, 2, 3],
      statement: "Units 1–3 covered; CO5 and CO6 assessed only in ETE",
      page: 49,
    },
    endSem: {
      name: "End Term Examination (ETE)",
      marks: "100 marks (scaled to 50)",
      units: [1, 2, 3, 4, 5],
      statement: "End Term Examination (ETE) -- 100 Marks (Scaled to 50) (CO1–CO6)",
      page: 49,
    },
    units: [
      {
        number: 1,
        title: "Basics of Electrical Circuits",
        hours: "6-3-12-6 = 27 hrs",
        pages: [42, 43],
        topics: [
          {
            id: "A",
            text: "Introduction to electrical circuits: Voltage, Current, Resistance, and Power, Types of components- active, passive, unilateral, bilateral, Ohm's Law, Types of sources-voltage, current, independent, dependent. Source transformation.",
          },
          { id: "B", text: "Series and Parallel circuits, Kirchhoff's Laws (KVL and KCL), Basic circuit analysis (nodal and mesh) techniques with DC source. Superposition Theorem." },
          { id: "C", text: "Representation of AC signal, peak, average and rms values, real power, reactive power, apparent power, power factor" },
        ],
      },
      {
        number: 2,
        title: "Transformer and DC Motor",
        hours: "4-3-8-6 = 21 hrs",
        pages: [43],
        topics: [
          { id: "A", text: "Construction, working principle and applications of transformer, Types of transformer-step-up and step-down." },
          { id: "B", text: "EMF equation of transformer, Losses observed in transformer, Efficiency of transformer" },
          { id: "C", text: "Construction, working principle and applications of DC motor." },
        ],
      },
      {
        number: 3,
        title: "PN junction Diode and its applications",
        hours: "8-3-16-6 = 33 hrs",
        pages: [43],
        topics: [
          { id: "A", text: "Formation of PN junction and depletion layer, Forward and reverse biasing of PN junction diode, V-I characteristics of ideal and practical diodes." },
          { id: "B", text: "Half and Full Wave rectification using PN junction diodes, calculation of ripple factor." },
          { id: "C", text: "Application of diode as clipper circuit." },
        ],
      },
      {
        number: 4,
        title: "MOS Transistors",
        hours: "6-3-12-6 = 27 hrs",
        pages: [44],
        topics: [
          { id: "A", text: "Introduction to MOSFET, depletion and enhancement type, drain characteristics and transfer characteristics." },
          { id: "B", text: "Introduction to CMOS technology" },
          { id: "C", text: "Introduction to IC technology and role of transistors as a basic building block of ICs, CMOS inverter" },
        ],
      },
      {
        number: 5,
        title: "Introduction to switching circuits",
        hours: "6-3-12-6 = 27 hrs",
        pages: [44],
        topics: [
          { id: "A", text: "Number System Concepts- Number base conversion, 1's Complement and 2's Complement, Fundamentals of Logic Gates, Universal logic gates, BCD and Gray codes." },
          { id: "B", text: "SOP and POS simplification of Boolean expressions using Karnaugh map (up to four variables), concept of don't care condition." },
          { id: "C", text: "Classification of digital circuits, Arithmetic circuits design-adder and subtractor, one-bit magnitude comparator." },
        ],
      },
    ],
    pages: [41, 56],
    sourceNotes: [
      "The course identification table shows “Semester: II”, but the course is listed under Semester 1 on PDF page 26.",
      "The MTE section (p. 49) is titled “CO1–CO4 only” and states “Units 1–3 covered”, but its question guidance also mentions MOSFET/CMOS interpretation (Unit 4). The stated Units 1–3 coverage is shown here.",
      "Laboratory assessment (40 marks) covers lab experiments, not specific theory units.",
      "End-Sem coverage of all units is based on the ETE heading (CO1–CO6, which map to Units 1–5) and its Section A guidance “(all units)” on p. 49.",
    ],
  },
  {
    code: "MTT1113",
    name: "Calculus and Abstract Algebra",
    icon: "sigma",
    credits: 4,
    contactHours: "3-1-0 (L-T-P)",
    courseType: "Core -- Theory Only",
    assessment: "CA: 25% | MTE: 15% | ETE: 60% | Total: 100 marks",
    assessmentPage: 58,
    midSem: {
      name: "Mid Term Examination (MTE)",
      marks: "15 marks",
      units: [1, 2, 3],
      statement: "MTE covers Units 1–3 (CO1, CO2, CO3, CO4). CO5 and CO6 are assessed in ETE only.",
      page: 65,
    },
    endSem: {
      name: "End Term Examination (ETE)",
      marks: "60 marks",
      units: [1, 2, 3, 4, 5],
      statement: "ETE is comprehensive -- all 5 units and all 6 COs.",
      page: 65,
    },
    units: [
      {
        number: 1,
        title: "Calculus",
        pages: [58, 59],
        topics: [
          { id: "A", text: "Differentiation, Successive differentiation Taylor's and Maclaurin theorems, indeterminate forms, L' Hospital's rule" },
          { id: "B", text: "Partial derivatives, Total derivative, Euler's theorem for homogeneous function, Maxima and minima for function of two variables" },
          { id: "C", text: "Evaluation of double integration, Applications of double integral" },
        ],
      },
      {
        number: 2,
        title: "Basic Algebra",
        pages: [59],
        topics: [
          { id: "A", text: "Sets, relations and functions" },
          { id: "B", text: "Basics of groups, Subgroups" },
          { id: "C", text: "Cyclic groups, basics of Rings and Field" },
        ],
      },
      {
        number: 3,
        title: "Matrices",
        pages: [59],
        topics: [
          { id: "A", text: "Matrices: Addition, subtraction and scalar multiplication, matrix multiplication, Symmetric, Skew-Symmetric and orthogonal Matrices" },
          { id: "B", text: "Determinants, rank of a matrix, Systems of linear equations, linear Independence and dependence. Cramer's Rule" },
          { id: "C", text: "Inverse of a matrix by using elementary transformation, Gauss elimination and Gauss-Jordan elimination, Eigenvalues, Eigenvectors, Diagonalization" },
        ],
      },
      {
        number: 4,
        title: "Vector Space and Linear Transformation",
        pages: [59],
        topics: [
          { id: "A", text: "Vector Space, linear dependence and Independent of vectors, basis, dimension" },
          { id: "B", text: "Introduction to linear transformations (maps)" },
          { id: "C", text: "Range and kernel space of a linear transformation, rank and nullity of L.T." },
        ],
      },
      {
        number: 5,
        title: "Inverse of Linear and Gram Schmidt Orthonormalization",
        pages: [59],
        topics: [
          { id: "A", text: "Inverse of a linear transformation, Matrix associated with a L.T." },
          { id: "B", text: "Basic introduction of Inner product spaces" },
          { id: "C", text: "Gram-Schmidt orthogonalization" },
        ],
      },
    ],
    pages: [57, 69],
    sourceNotes: [],
  },
  {
    code: "IKT1105",
    name: "Human Values and Professional Ethics",
    icon: "heart",
    credits: 2,
    contactHours: "2-0-0 (L-T-P)",
    courseType: "Compulsory",
    assessment: "Theory — CA (25%): Assessment 1 (10), Assessment 2 (5), Assignment 1 (5), Assignment 2 (5) · ESE (75%)",
    assessmentPage: 71,
    midSem: null,
    endSem: null,
    units: [
      {
        number: 1,
        title: "The Need and Process for Value Education",
        pages: [70],
        topics: [
          { id: "A", text: "The need, basic guidelines, content, and process for Value Education" },
          { id: "B", text: "Concept of `Natural Acceptance' and Experiential Validation- as the mechanism for self-exploration; Continuous Happiness and Prosperity- A look at basic Human Aspirations" },
          { id: "C", text: "Right understanding, Relationship and Physical Facilities- the basic requirements for fulfilment aspirations of every human being with their correct priority" },
        ],
      },
      {
        number: 2,
        title: "Understanding Harmony in the Human Being - Harmony in Myself",
        pages: [70, 71],
        topics: [
          { id: "A", text: "Human being as a co-existence of the sentient `I' and the material `Body'" },
          { id: "B", text: "The needs of Self (`I') and `Body' ; Understanding the Body as an instrument of `I' (I being the doer, seer and enjoyer)" },
          { id: "C", text: "The characteristics and activities of `I' and harmony in `I' ; Understanding the harmony of I with the Body: Correct appraisal of Physical needs, meaning of Prosperity in detail" },
        ],
      },
      {
        number: 3,
        title: "Harmony in the Family and Society",
        pages: [71],
        topics: [
          { id: "A", text: "Values in human-human relationship; Trust and Respect as the foundational values of relationship" },
          { id: "B", text: "Understanding the meaning of Trust; Difference between intention and competence; The meaning of Respect; Difference between respect and differentiation; the other salient values in relationship" },
          { id: "C", text: "Harmony in the society (society being an extension of family; Visualizing a universal harmonious order in society - from family to world family" },
        ],
      },
      {
        number: 4,
        title: "Harmony in the Nature and Existence",
        pages: [71],
        topics: [
          { id: "A", text: "The harmony in the Nature" },
          { id: "B", text: "Interconnectedness and mutual fulfilment among the four orders of nature recyclability and self-regulation in nature" },
          { id: "C", text: "Understanding Existence as Co-existence of mutually interacting units in all-pervasive space" },
        ],
      },
      {
        number: 5,
        title: "Competence in professional ethics",
        pages: [71],
        topics: [
          { id: "A", text: "Ability to utilize the professional competence for augmenting universal human order" },
          { id: "B", text: "Ability to identify the scope and characteristics of people-friendly and eco-friendly production systems," },
          { id: "C", text: "Ability to identify and develop appropriate technologies and management patterns for above production systems." },
        ],
      },
    ],
    pages: [70, 72],
    sourceNotes: [
      "No mid-semester examination is listed. The end-semester examination (ESE, 75%) is listed without stating which units it covers.",
    ],
  },
  {
    code: "CSCR1300",
    name: "Programming for Problem Solving",
    icon: "code",
    credits: 4,
    contactHours: "2-0-4-2 (L-T-P-SL)",
    courseType: "Core",
    assessment: "Lab (40 marks) + MTE (10 marks) + ETE (50 marks) = 100 marks",
    assessmentPage: 74,
    midSem: {
      name: "Mid Term Examination (MTE)",
      marks: "10 marks",
      units: [1, 2, 3],
      statement: "Units 1–3 covered; CO5 and CO6 assessed only in ETE",
      page: 82,
    },
    endSem: {
      name: "End Term Examination (ETE)",
      marks: "100 marks (scaled to 50)",
      units: [1, 2, 3, 4, 5],
      statement: "End Term Examination (ETE) -- 100 Marks (Scaled to 50) (CO1–CO6)",
      page: 82,
    },
    units: [
      {
        number: 1,
        title: "Introduction to C Programming",
        hours: "4-0-10-6 = 20 hrs",
        pages: [75],
        topics: [
          { id: "A", text: "Introduction to C language, Variables, Constants, Identifiers and Keywords" },
          { id: "B", text: "Data Types: Format specifiers, modifiers, type casting" },
          { id: "C", text: "Operators: Category, Expressions: Associativity & Precedence" },
        ],
      },
      {
        number: 2,
        title: "Control Statements",
        hours: "6-0-12-6 = 24 hrs",
        pages: [75, 76],
        topics: [
          { id: "A", text: "Decisions: if, if-else, Nested if-else, if-else-if ladder, Switch Case" },
          { id: "B", text: "Iterations: While, Do While, For Loop, Nested Looping, Pattern Printing" },
          { id: "C", text: "Execution Sequence: GOTO, Break, Continue" },
        ],
      },
      {
        number: 3,
        title: "Functions & Arrays",
        hours: "8-0-16-6 = 30 hrs",
        pages: [76],
        topics: [
          { id: "A", text: "Functions: Definition, Declaration/Prototyping, Calling, Types, Recursion, Storage Classes" },
          { id: "B", text: "Pre-processors: Directives, Operators (#, ##, \\), Macros: Types, Use, Predefined Macros" },
          { id: "C", text: "Arrays: 1D & 2D -- Declaration, Initialization, Traversal, Manipulation" },
        ],
      },
      {
        number: 4,
        title: "Pointers & Strings",
        hours: "6-0-12-6 = 24 hrs",
        pages: [76, 77],
        topics: [
          { id: "A", text: "Pointer: Introduction, Declaration, Pointer arithmetic, Array of Pointers, Pointer to Pointer" },
          { id: "B", text: "Dynamic Memory Allocation (malloc, calloc, realloc, free), Call by Reference, Passing/Returning Arrays" },
          { id: "C", text: "Strings: Introduction, Predefined string functions, Manipulation, Command Line Arguments" },
        ],
      },
      {
        number: 5,
        title: "User-Defined Data Types & File Handling",
        hours: "6-0-10-6 = 22 hrs",
        pages: [77],
        topics: [
          { id: "A", text: "Structures, Unions, typedef & Enumeration: Introduction, Declaration, Differences, Application" },
          { id: "B", text: "Nested structure, self-referential structure, Array of structures, Passing structures to functions" },
          { id: "C", text: "Files: Introduction, I/O Streaming, Sequential/Random access, Creating, Opening, Closing, R/W operations" },
        ],
      },
    ],
    pages: [73, 88],
    sourceNotes: [
      "Laboratory assessment (40 marks) covers lab experiments, not specific theory units.",
      "End-Sem coverage of all units is based on the ETE heading (CO1–CO6, which map to Units 1–5) and its Section A guidance “(all units)” on p. 82.",
    ],
  },
  {
    code: "BTT1102",
    name: "Introduction to Computational Biology",
    icon: "dna",
    credits: 2,
    contactHours: "2-0-0-2 (L-T-P-SL)",
    courseType: "Core -- Theory Only",
    assessment: "CA: 25% | MTE: 15% | ETE: 60% | Total: 100 marks",
    assessmentPage: 91,
    midSem: {
      name: "Mid Sem Examination (MSE)",
      marks: "15 marks",
      units: [1, 2, 3],
      statement: "MSE covers Units 1–3 (CO1, CO2, CO3, CO4). CO5 and CO6 are assessed in ESE only.",
      page: 98,
    },
    endSem: {
      name: "End Sem Examination (ESE)",
      marks: "60 marks",
      units: [1, 2, 3, 4, 5],
      statement: "End Sem Examination (ESE) -- 60 Marks (All Units, All COs)",
      page: 98,
    },
    units: [
      {
        number: 1,
        title: "Introduction to Biology and Computational Biology",
        pages: [91],
        topics: [
          { id: "A", text: "Characteristics of living organisms" },
          { id: "B", text: "Cell theory; Structure of Prokaryotic and Eukaryotic Cells" },
          { id: "C", text: "Introduction to Computational Biology and its interdisciplinary applications" },
        ],
      },
      {
        number: 2,
        title: "Biomolecules and Computational Biology",
        pages: [91, 92],
        topics: [
          { id: "A", text: "Introduction to Biomolecules" },
          { id: "B", text: "Amino acid, Overview of protein structure: Primary, secondary, tertiary, and quaternary structures" },
          { id: "C", text: "Bioinformatics tools and techniques for analyzing biological datasets from large-scale data," },
        ],
      },
      {
        number: 3,
        title: "Introduction to Biological databases and their applications",
        pages: [92],
        topics: [
          { id: "A", text: "Nucleic acid sequence databases-GenBank, EMBL, DDBJ" },
          { id: "B", text: "Protein sequence databases-UniProt, TrEMBL, GenPept" },
          { id: "C", text: "Structural databases – PDB, NDB, PubChem, and Zinc" },
        ],
      },
      {
        number: 4,
        title: "AI in Medical Biotechnology",
        pages: [92],
        topics: [
          { id: "A", text: "Genetic Diseases and Personalized Medicine" },
          { id: "B", text: "Applications of AI in Gene therapy" },
          { id: "C", text: "Cancer: Causes, Diagnostics, and Role of Computational Biology in Treatment" },
        ],
      },
      {
        number: 5,
        title: "AI in Biotechnology",
        pages: [92],
        topics: [
          { id: "A", text: "Artificial Intelligence in Biotechnology: AI in Genomics and Precision Medicine" },
          { id: "B", text: "AI in Agriculture: Precision Farming, Crop Monitoring, and Automated Disease Detection, Robotics" },
          { id: "C", text: "AI in Bioinformatics: Big Data Analysis in Genomics and Proteomics" },
        ],
      },
    ],
    pages: [89, 101],
    sourceNotes: [
      "The course identification table shows “Semester: II” and an older header reads “Semester IV | Batch 2018–2022”, but the course is listed under Semester 1 on PDF page 26 and the batch field reads 2026–2030.",
      "The course details call the exams MTE/ETE; the examination section calls them MSE (Mid Sem) and ESE (End Sem).",
    ],
  },
  {
    code: "CVT1103",
    name: "Environmental Studies",
    icon: "leaf",
    credits: 0,
    contactHours: "2-0-0 (L-T-P)",
    courseType: "Compulsory",
    assessment: "Theory — CA (25) · ESE (75)",
    assessmentPage: 103,
    midSem: null,
    endSem: null,
    units: [
      {
        number: 1,
        title: "General Introduction",
        pages: [103],
        topics: [
          { id: "A", text: "Definition, principles and scope of environmental science" },
          { id: "B", text: "Water Resources, Land Resources, Food Resources" },
          { id: "C", text: "Mineral Resources, Energy Resources, Forest Resources" },
        ],
      },
      {
        number: 2,
        title: "Atmosphere and meteorological parameters",
        pages: [103],
        topics: [
          { id: "A", text: "Structure and composition of atmosphere" },
          { id: "B", text: "Meteorological parameters: Pressure, Temperature, Precipitation, Humidity," },
          { id: "C", text: "Radiation, Wind speed and direction, Wind Rose" },
        ],
      },
      {
        number: 3,
        title: "Environmental Pollution (Cause, effects and control measures)",
        pages: [103],
        topics: [
          { id: "A", text: "Air, water, Noise and Soil pollution" },
          { id: "B", text: "Case studies on pollution" },
          { id: "C", text: "Solid waste management: Causes, effects and control measures of urban and industrial wastes." },
        ],
      },
      {
        number: 4,
        title: "Climate Change and its impact",
        pages: [103],
        topics: [
          { id: "A", text: "Concept of Global Warming and greenhouse effect" },
          { id: "B", text: "Ozone layer Depletion and its consequences" },
          { id: "C", text: "Climate change and its effect on ecosystem, Kyoto protocol and IPCC concerns on changing climate" },
        ],
      },
      {
        number: 5,
        title: "Social Issues and the Environment",
        pages: [103],
        topics: [
          { id: "A", text: "Concept of sustainable development, Water conservation" },
          { id: "B", text: "Resettlement and rehabilitation of people; its problems and concerns, Case studies" },
          { id: "C", text: "Population explosion and its consequences" },
        ],
      },
    ],
    pages: [102, 104],
    sourceNotes: [
      "The course details table names this course “Environmental Science”; the official Semester 1 list (PDF page 26) uses “Environmental Studies”.",
      "No mid-semester examination is listed. The end-semester examination (ESE, 75) is listed without stating which units it covers.",
    ],
  },
];

export const shardaCseAiml2026: SyllabusProgramme = {
  university: "Sharda University",
  programme: "B.Tech Computer Science & Engineering — AI & ML",
  batch: "2026–2030",
  academicYear: "2026–27",
  sourceFile: "B_Tech_CSE-AIML_course_syllabus_2026-2030.pdf",
  sourcePages: "PDF pages 1–108",
  semesters: [
    {
      slug: "semester-1",
      name: "Semester 1",
      statedCredits: 18,
      listPage: 26,
      subjects,
      sourceNotes: [
        "PDF page 26 states “Semester 1, Credits: 18”. The credits printed in the seven individual course tables add up to 19 (3 + 4 + 4 + 2 + 4 + 2 + 0).",
      ],
    },
  ],
};

export function findSubject(semesterSlug: string, code: string) {
  const sem = shardaCseAiml2026.semesters.find((s) => s.slug === semesterSlug);
  const subject = sem?.subjects.find((s) => s.code.toLowerCase() === code.toLowerCase());
  return sem && subject ? { semester: sem, subject } : null;
}
