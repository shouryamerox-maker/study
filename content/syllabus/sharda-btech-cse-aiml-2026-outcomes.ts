/**
 * Course objectives and course outcomes (COs) for Semester 1, transcribed from the
 * official syllabus PDF (B_Tech_CSE-AIML_course_syllabus_2026-2030.pdf, pages 1–108).
 *
 * `statement` is the official wording (as printed, including the PDF's own grammar).
 * `simple` is a plain-English explanation written for students — it is NOT official text
 * and the app always labels it as such.
 */

export interface CourseOutcome {
  id: string;
  /** Bloom level as printed, e.g. "Understand – L2". */
  level?: string;
  statement: string;
  simple: string;
  /** "theory" COs are assessed in exams; "lab" COs only in laboratory assessment. */
  kind?: "theory" | "lab";
}

export interface CourseAcademics {
  objectives: string[];
  objectivesPage: number;
  outcomes: CourseOutcome[];
  outcomesPages: number[];
}

export const semester1Academics: Record<string, CourseAcademics> = {
  CSAI1101: {
    objectivesPage: 28,
    objectives: [
      "The course aims to build a strong foundation in computer systems, develop problem-solving skills using visual and algorithmic approaches, and introduce fundamental concepts of Artificial Intelligence and Machine Learning for real-world applications.",
    ],
    outcomesPages: [28],
    outcomes: [
      {
        id: "CO1",
        level: "Understand – L2",
        statement: "Explain the fundamental concepts of computer systems, including hardware components, data representation techniques, and the evolution of programming languages.",
        simple: "Explain how a computer is built, how it stores numbers and data, and how programming languages developed.",
      },
      {
        id: "CO2",
        level: "Apply – L3",
        statement: "Apply visual thinking techniques and problem-solving strategies using tools such as mind maps, flowcharts, and pseudocode to analyze computational problems.",
        simple: "Use mind maps, flowcharts and pseudocode to understand and break down a problem.",
      },
      {
        id: "CO3",
        level: "Apply – L3",
        statement: "Develop algorithms and represent logical solutions using flowcharts, decision tables, and step-by-step execution tracing for given problems.",
        simple: "Write step-by-step solutions (algorithms) and check them with flowcharts, decision tables and dry runs.",
      },
      {
        id: "CO4",
        level: "Understand – L2",
        statement: "Describe the fundamental concepts, principles, and applications of Artificial Intelligence, including intelligent agents and problem-solving approaches.",
        simple: "Describe what AI is, what an intelligent agent is, and where AI is used.",
      },
      {
        id: "CO5",
        level: "Apply – L3",
        statement: "Apply basic machine learning concepts such as classification and clustering using appropriate algorithms for solving simple real-world problems.",
        simple: "Use simple machine-learning ideas such as classification and clustering on small real problems.",
      },
      {
        id: "CO6",
        level: "Analyze – L4",
        statement: "Analyze and compare traditional problem-solving approaches with AI and machine learning techniques based on efficiency, applicability, and outcomes.",
        simple: "Compare ordinary step-by-step programming with AI/ML approaches and judge which suits a problem better.",
      },
    ],
  },
  EEE1101: {
    objectivesPage: 41,
    objectives: [
      "To provide the students with an introductory concept in the field of electrical and electronics engineering to facilitate better understanding of the devices, techniques and equipment used in engineering applications.",
    ],
    outcomesPages: [41, 42],
    outcomes: [
      {
        id: "CO1",
        level: "Analyze – L4",
        kind: "theory",
        statement: "Analyze DC and AC electrical circuits using Ohm's law, KCL, KVL, nodal/mesh methods, and network theorems to compute circuit parameters.",
        simple: "Solve DC and AC circuits (find currents, voltages, power) using Ohm's law, Kirchhoff's laws and circuit theorems.",
      },
      {
        id: "CO2",
        level: "Understand – L2",
        kind: "theory",
        statement: "Explain the construction, working principles, losses, and efficiency of transformers and DC motors for suitable engineering applications.",
        simple: "Explain how transformers and DC motors are built and work, where energy is lost, and how efficient they are.",
      },
      {
        id: "CO3",
        level: "Analyze – L4",
        kind: "theory",
        statement: "Analyze the V–I characteristics of PN junction diodes and apply them in rectifier and clipper circuits with ripple factor calculation.",
        simple: "Understand how a diode conducts and use diodes in rectifiers and clippers, including ripple-factor calculations.",
      },
      {
        id: "CO4",
        level: "Understand – L2",
        kind: "theory",
        statement: "Interpret MOSFET characteristics and explain the role of CMOS technology and IC fabrication concepts.",
        simple: "Read MOSFET characteristic graphs and explain why CMOS and transistors are the building blocks of chips.",
      },
      {
        id: "CO5",
        level: "Analyze – L4",
        kind: "theory",
        statement: "Simplify and design switching circuits using number systems, logic gates, Boolean algebra, and Karnaugh maps.",
        simple: "Simplify logic expressions (Boolean algebra, K-maps) and design small digital circuits with logic gates.",
      },
      {
        id: "CO6",
        level: "Analyze – L4",
        kind: "theory",
        statement: "Analyze electrical, electronics, and digital logic concepts to design and evaluate basic arithmetic and comparator circuits for engineering applications.",
        simple: "Combine what you learned to design and check adders, subtractors and comparators.",
      },
      {
        id: "CO7",
        level: "Apply – L3",
        kind: "lab",
        statement:
          "Conduct experiments on DC circuits, network theorems, transformer, DC motor, PN junction diode, rectifier circuits, and MOSFET simulation using standard laboratory instruments; record observations and verify theoretical concepts through measured values.",
        simple: "Do the lab experiments, record readings and check that they match the theory.",
      },
      {
        id: "CO8",
        level: "Create – L5/L6",
        kind: "lab",
        statement:
          "Design and implement CMOS inverter, logic gate circuits, adder, and subtractor circuits using simulation tools and IC components; tabulate results and validate the logical operation through experimental outputs.",
        simple: "Build logic circuits (in simulation and with ICs) and prove they work from the outputs.",
      },
      {
        id: "CO9",
        level: "Apply – L2/L3",
        kind: "lab",
        statement: "Demonstrate professional, ethical, and responsible practices; perform skill self-assessment; reflect on learning to cultivate lifelong professional growth.",
        simple: "Work responsibly and ethically in the lab and reflect on your own progress.",
      },
      {
        id: "CO10",
        level: "Apply – L3",
        kind: "lab",
        statement: "Collaborate and communicate effectively in team-oriented lab activities; plan, implement, and present programming solutions; apply project management principles.",
        simple: "Work in a team, plan and present your lab work.",
      },
    ],
  },
  MTT1113: {
    objectivesPage: 58,
    objectives: [
      "To develop a clear understanding of the fundamental concepts of Calculus and Linear Algebra.",
      "To equip students with mathematical methods and techniques for solving engineering and scientific problems.",
      "To enhance analytical, logical, and problem-solving skills through the application of mathematical concepts.",
      "To provide a strong foundation for advanced studies and real-world applications in engineering and related fields.",
    ],
    outcomesPages: [58],
    outcomes: [
      {
        id: "CO1",
        level: "Understand – L1/L2",
        statement: "Define the concept of differential calculus and illustrate Maxima, minima and saddle points.",
        simple: "Understand differentiation and use it to find maximum, minimum and saddle points.",
      },
      {
        id: "CO2",
        level: "Explore – L2/L3",
        statement: "Explore the basic concept of sets, relation, functions, groups, Rings and Field",
        simple: "Learn the basic algebraic structures: sets, relations, functions, groups, rings and fields.",
      },
      {
        id: "CO3",
        level: "Apply – L3",
        statement: "Apply the rank method to evaluate system of linear equation and inverse of a matrix.",
        simple: "Use the rank of a matrix to solve systems of linear equations and to find a matrix inverse.",
      },
      {
        id: "CO4",
        level: "Analyze – L4/L5",
        statement:
          "Integrate and Analyze the vector space. Determine linear dependence and independence of vectors. Evaluate basis and dimension of vector spaces. Understand linear transformations (maps).",
        simple: "Work with vector spaces: check whether vectors are independent, find a basis and dimension, and understand linear maps.",
      },
      {
        id: "CO5",
        level: "Analyze – L4/L5",
        statement: "Analyze various memory to Evaluate inverse of a linear transformation. Determine the matrix representation of linear maps.",
        simple: "Find the inverse of a linear transformation and write a linear map as a matrix.",
      },
      {
        id: "CO6",
        level: "Analyze – L2/L4",
        statement: "Interpret the inner product spaces and build Gram-Schmidt orthogonalization process.",
        simple: "Understand inner products and use the Gram–Schmidt process to make vectors orthogonal.",
      },
    ],
  },
  IKT1105: {
    objectivesPage: 70,
    objectives: [
      "To facilitate the development of a Holistic perspective among students towards life and profession as well as towards happiness and prosperity based on a correct understanding of the Human reality and the rest of Existence",
    ],
    outcomesPages: [70],
    outcomes: [
      {
        id: "1",
        statement: "Understand that the technical education without study of human values can generate more problems than solutions.",
        simple: "See why technical skill alone, without good values, can cause harm.",
      },
      {
        id: "2",
        statement: "Define the principles and ideals, which help in making the judgement of what is more important.",
        simple: "Name the principles that help you decide what really matters.",
      },
      {
        id: "3",
        statement:
          "See that `I' and `Body' are two realities, and most of their desires are related to `I' and not body, while their efforts are mostly centred on the fulfilment of the needs of the body assuming that it will meet the needs of `I' too.",
        simple: "Tell apart the needs of the self (happiness, respect) from the needs of the body (food, comfort).",
      },
      {
        id: "4",
        statement: "Appreciate the importance of harmony in the self, family and the society for mutual fulfilment.",
        simple: "Value harmony within yourself, your family and society.",
      },
      {
        id: "5",
        statement: "Understand the importance of harmony among human beings, other living beings and entire nature for universal equilibrium and mutual co-existence.",
        simple: "Understand why people, other living things and nature must live in balance.",
      },
      {
        id: "6",
        statement: "Know and practice the ethical approach in profession for continuous happiness and sustained prosperity.",
        simple: "Practise ethics at work for lasting well-being and success.",
      },
    ],
  },
  CSCR1300: {
    objectivesPage: 74,
    objectives: [
      "To introduce the fundamentals of programming using C and develop problem-solving skills through structured lab practice, design exercises, ethical coding, and collaborative project work.",
    ],
    outcomesPages: [74],
    outcomes: [
      {
        id: "CO1",
        level: "Remember – L1",
        kind: "theory",
        statement: "Recall and list fundamental concepts of C programming such as keywords, data types, operators, and syntax.",
        simple: "Remember C's keywords, data types, operators and basic syntax.",
      },
      {
        id: "CO2",
        level: "Understand – L2",
        kind: "theory",
        statement: "Explain the working of operators, control structures, functions, arrays, and preprocessing directives in C programming.",
        simple: "Explain how operators, if/loops, functions, arrays and #directives work.",
      },
      {
        id: "CO3",
        level: "Apply – L3",
        kind: "theory",
        statement: "Develop C programs using control statements, functions, arrays, and strings to solve basic computational problems.",
        simple: "Write C programs with loops, functions, arrays and strings.",
      },
      {
        id: "CO4",
        level: "Analyze – L4",
        kind: "theory",
        statement: "Analyze and debug C programs involving pointers, recursion, structures, and dynamic memory allocation.",
        simple: "Find and fix bugs in programs that use pointers, recursion, structures and malloc/free.",
      },
      {
        id: "CO5",
        level: "Evaluate – L5",
        kind: "theory",
        statement: "Evaluate different programming approaches and optimize C programs using appropriate data structures, file handling, and memory management techniques.",
        simple: "Compare different ways to write a program and choose a better one, including files and memory use.",
      },
      {
        id: "CO6",
        level: "Create – L6",
        kind: "theory",
        statement: "Design, implement, and demonstrate complete C-based solutions by integrating functions, pointers, structures, and file handling to solve real-world problems.",
        simple: "Build a complete C program for a real problem using functions, pointers, structures and files.",
      },
      {
        id: "CO7",
        level: "Apply – L3",
        kind: "lab",
        statement: "Implement C programs using professional tools (gcc, Linux CLI, debuggers); configure experimental setups; demonstrate system operation; maintain structured lab records.",
        simple: "Use gcc, the Linux command line and a debugger, and keep proper lab records.",
      },
      {
        id: "CO8",
        level: "Create – L5/L6",
        kind: "lab",
        statement: "Design and develop modular C applications addressing real-world problems with societal awareness; propose solutions with planning considerations; evaluate outcomes analytically.",
        simple: "Plan and build modular C applications for real problems and evaluate the results.",
      },
      {
        id: "CO9",
        level: "Apply – L2/L3",
        kind: "lab",
        statement: "Demonstrate professional, ethical, and responsible practices; perform skill self-assessment; reflect on learning to cultivate lifelong professional growth.",
        simple: "Code honestly and responsibly, and reflect on your own progress.",
      },
      {
        id: "CO10",
        level: "Apply – L3",
        kind: "lab",
        statement: "Collaborate and communicate effectively in team-oriented lab activities; plan, implement, and present programming solutions; apply project management principles.",
        simple: "Work in a team to plan, build and present programming solutions.",
      },
    ],
  },
  BTT1102: {
    objectivesPage: 90,
    objectives: [
      "Introduction of fundamental biological concepts and their applications in computational sciences, bioinformatics, and artificial intelligence (AI).",
      "It provides computer science students with an understanding of how biology integrates with modern technological advancements.",
      "It allows to use of AI in big data analysis, and nanotechnology.",
      "It provides concept of using AI for modern disease detection, diagnostics and agricultural biotechnology.",
    ],
    outcomesPages: [90],
    outcomes: [
      {
        id: "CO1",
        level: "Understand – L1/L2",
        statement: "Understand the fundamental principles of biology and their relevance to computational sciences.",
        simple: "Learn the basic ideas of biology (life, cells, molecules) and why they matter for computing.",
      },
      {
        id: "CO2",
        level: "Explore – L2/L3",
        statement: "Analyze the molecular basis of biological systems and their computational modeling.",
        simple: "Understand the molecules of life (such as proteins) and how computers model them.",
      },
      {
        id: "CO3",
        level: "Apply – L3",
        statement: "Examine genetic principles and their applications in AI and machine learning.",
        simple: "See how genetic information is stored and searched, and how AI/ML uses it.",
      },
      {
        id: "CO4",
        level: "Analyze – L4/L5",
        statement: "Explore AI-driven medical and agricultural biotechnologies.",
        simple: "Explore how AI is used in medicine and agriculture.",
      },
      {
        id: "CO5",
        level: "Analyze – L4/L5",
        statement: "Investigate the role of bioinformatics in modern biology and healthcare.",
        simple: "Investigate how bioinformatics helps modern biology and healthcare.",
      },
      {
        id: "CO6",
        level: "Analyze – L2/L4",
        statement: "Apply computational tools for genomics, drug discovery, and disease modeling.",
        simple: "Use computer tools for studying genomes, finding drugs and modelling diseases.",
      },
    ],
  },
  CVT1103: {
    objectivesPage: 102,
    objectives: [
      "Enable students to learn the concepts, principles and importance of environmental science",
      "Provide students an insight of various causes of natural resource depletion and its conservation",
      "Provide knowledge of layers of atmosphere with an insight of role of climatic elements in dispersion of pollutants",
      "Provide detailed knowledge of causes, effects and control of different types of environmental pollution, solid waste management and its effect on climate change, global warming and ozone layer depletion",
      "Provide and enrich the students about social issues such as R&R, water conservation and sustainability.",
    ],
    outcomesPages: [102, 103],
    outcomes: [
      {
        id: "CO1",
        statement: "Understand the scope of environmental science with knowledge about various types of natural resources and its conservation",
        simple: "Know what environmental science covers and how natural resources can be conserved.",
      },
      {
        id: "CO2",
        statement: "Study about the structure and composition of atmosphere and factors affecting weather and climate",
        simple: "Learn the layers and gases of the atmosphere and what controls weather and climate.",
      },
      {
        id: "CO3",
        statement: "Study about pollution causes, effects and control and solid waste management",
        simple: "Learn the causes, effects and control of pollution, and how solid waste is managed.",
      },
      {
        id: "CO4",
        statement: "Effect of global warming and ozone layer depletion",
        simple: "Understand global warming and ozone-layer depletion and their effects.",
      },
      {
        id: "CO5",
        statement: "Understand sustainable development, resettlement and rehabilitation, impact of population explosion on environment",
        simple: "Understand sustainable development, resettling displaced people, and how population growth affects the environment.",
      },
      {
        id: "CO6",
        statement: "Understand overall environmental issues and its management",
        simple: "See the big picture of environmental problems and how they are managed.",
      },
    ],
  },
};
