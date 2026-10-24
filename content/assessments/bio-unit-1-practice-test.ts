import type { AssessmentDefinition } from "../../src/lib/content/assessment-schema";

/**
 * Biology — Unit 1 Practice Test (BTT1102 Introduction to Computational Biology, Unit 1 only).
 * Scope: official Unit 1 topics (syllabus PDF p. 91) as taught in the BTT1102 Unit 1 study material,
 * which follows the teacher's slides. 15 MCQ × 1 + 5 short × 3 + 1 long × 10 = 40 marks.
 */

const opt = (a: string, b: string, c: string, d: string) => [
  { id: "a", text: a },
  { id: "b", text: b },
  { id: "c", text: c },
  { id: "d", text: d },
];

const test: AssessmentDefinition = {
  slug: "bio-unit-1-practice-test",
  courseSlug: "btt1102-computational-biology",
  title: "Biology — Unit 1 Practice Test",
  description: "BTT1102 Introduction to Computational Biology, Unit 1: characteristics of living organisms, cell theory, cell structure, prokaryotic and eukaryotic cells, and introduction to computational biology.",
  instructions: [
    "This test has **21 questions** in three sections and carries **40 marks**. Time: **60 minutes**.",
    "",
    "- **Section A** (15 × 1 = 15 marks) is marked automatically.",
    "- **Sections B and C** (15 + 10 = 25 marks) are marked by your teacher using the rubric shown after grading. Partial marks are given.",
    "- Your answers save automatically. You can move between questions and mark questions for review.",
    "- Write in clear sentences or points. Use correct biological terms.",
  ].join("\n"),
  durationMinutes: 60,
  attemptLimit: 3,
  resultRelease: "IMMEDIATE",
  showAnswerKey: true,
  assignToAll: true,
  coverage: ["characteristics-of-living-organisms", "cell-theory-and-cell-structure", "introduction-to-computational-biology"],
  sections: [
    {
      id: "bio1t-sec-a",
      title: "Section A — Multiple choice (15 × 1 mark)",
      instructions: "Choose the single best answer.",
      questions: [
        {
          id: "bio1t-a1",
          type: "MCQ",
          marks: 1,
          prompt: "The leaves of *Mimosa pudica* fold and droop when touched. This shows which characteristic of living organisms?",
          data: { options: opt("Homeostasis", "Response to the environment (stimuli)", "Asexual reproduction", "Energy processing") },
          answer: { correct: "b" },
          explanation: "Folding on touch is a response to a stimulus in the environment.",
        },
        {
          id: "bio1t-a2",
          type: "MCQ",
          marks: 1,
          prompt: "Offspring produced by asexual reproduction are genetically identical to the parent because:",
          data: { options: opt("Two parents contribute gametes", "Only one parent is involved and no gametes fuse", "The gametes are diploid", "Asexual reproduction increases genetic variation") },
          answer: { correct: "b" },
          explanation: "Asexual reproduction has one parent and no fusion of gametes, so offspring are copies of the parent.",
        },
        {
          id: "bio1t-a3",
          type: "MCQ",
          marks: 1,
          prompt: "A polar bear has thick fur and a dense layer of fat under its skin. These features mainly help it to:",
          data: { options: opt("Reproduce sexually", "Carry out photosynthesis", "Maintain body temperature (thermoregulation) — part of homeostasis", "Increase its metabolism by breathing faster") },
          answer: { correct: "c" },
          explanation: "Fur and fat insulate the body and conserve heat, keeping internal temperature steady.",
        },
        {
          id: "bio1t-a4",
          type: "MCQ",
          marks: 1,
          prompt: "A plant captures energy from sunlight and stores it as chemical energy in food. This process is called:",
          data: { options: opt("Cellular respiration", "Photosynthesis", "Diffusion", "Homeostasis") },
          answer: { correct: "b" },
          explanation: "Photosynthesis converts light energy into chemical energy in food; respiration releases energy from food.",
        },
        {
          id: "bio1t-a5",
          type: "MCQ",
          marks: 1,
          prompt: "All the different plant and animal species living together in a forest make up a:",
          data: { options: opt("Population", "Community", "Organ system", "Biosphere") },
          answer: { correct: "b" },
          explanation: "A community is all the populations of different species in an area. A population is one species.",
        },
        {
          id: "bio1t-a6",
          type: "MCQ",
          marks: 1,
          prompt: "Who was the first to observe **living** cells?",
          data: { options: opt("Robert Hooke", "Anton van Leeuwenhoek", "Robert Brown", "Matthias Schleiden") },
          answer: { correct: "b" },
          explanation: "Hooke named cells after seeing dead cork; Leeuwenhoek first observed living cells.",
        },
        {
          id: "bio1t-a7",
          type: "MCQ",
          marks: 1,
          prompt: "Rudolf Virchow's contribution to the cell theory was the idea that:",
          data: { options: opt("Plants are made of cells", "Animals are made of cells", "All cells arise from pre-existing cells", "The nucleus controls the cell") },
          answer: { correct: "c" },
          explanation: "Virchow (1855): “Omnis cellula e cellula” — all cells arise from pre-existing cells.",
        },
        {
          id: "bio1t-a8",
          type: "MCQ",
          marks: 1,
          prompt: "In the fluid mosaic model, the membrane is called “fluid” because:",
          data: {
            options: opt(
              "It is made only of water",
              "Its lipids and many of its proteins can move sideways within the bilayer",
              "Proteins form solid layers on both sides of the lipids",
              "It dissolves easily in the cytoplasm",
            ),
          },
          answer: { correct: "b" },
          explanation: "Lipids and proteins move laterally, so the membrane behaves like a flexible fluid.",
        },
        {
          id: "bio1t-a9",
          type: "MCQ",
          marks: 1,
          prompt: "Which structure is **freely permeable**, rather than selectively permeable?",
          data: { options: opt("Plasma membrane", "Nuclear envelope", "Cell wall", "Tonoplast") },
          answer: { correct: "c" },
          explanation: "The cell wall is porous and freely permeable; membranes are selectively permeable.",
        },
        {
          id: "bio1t-a10",
          type: "MCQ",
          marks: 1,
          prompt: "A pancreatic cell secretes large amounts of digestive enzymes (proteins). Which organelle would you expect to be most abundant in it?",
          data: { options: opt("Smooth endoplasmic reticulum", "Rough endoplasmic reticulum", "Chloroplasts", "Cell wall") },
          answer: { correct: "b" },
          explanation: "Rough ER carries ribosomes that make proteins for export, so protein-secreting cells have a lot of it.",
        },
        {
          id: "bio1t-a11",
          type: "MCQ",
          marks: 1,
          prompt: "Ribosomes attached to the endoplasmic reticulum mainly synthesise proteins that:",
          data: { options: opt("Are used only inside the cytosol", "Will be exported out of the cell", "Form the cell wall", "Are stored as glycogen") },
          answer: { correct: "b" },
          explanation: "ER-bound ribosomes make proteins for export (and for membranes); free ribosomes make proteins used inside the cell.",
        },
        {
          id: "bio1t-a12",
          type: "MCQ",
          marks: 1,
          prompt: "The cell wall of bacteria is made mainly of:",
          data: { options: opt("Cellulose", "Chitin", "Peptidoglycan", "Phospholipids") },
          answer: { correct: "c" },
          explanation: "Bacteria: peptidoglycan; plants: cellulose; fungi: chitin.",
        },
        {
          id: "bio1t-a13",
          type: "MCQ",
          marks: 1,
          prompt: "A cell has **centrioles**, stores **glycogen** and has **no cell wall**. The cell is most likely:",
          data: { options: opt("A plant cell", "An animal cell", "A bacterial cell", "A fungal cell") },
          answer: { correct: "b" },
          explanation: "Centrioles, glycogen storage and no cell wall are features of animal cells.",
        },
        {
          id: "bio1t-a14",
          type: "MCQ",
          marks: 1,
          prompt: "Which of the following is **absent** in prokaryotic cells?",
          data: { options: opt("Ribosomes", "Plasma membrane", "Mitochondria", "Cytoplasm") },
          answer: { correct: "c" },
          explanation: "Prokaryotes have no membrane-bound organelles such as mitochondria, but they do have ribosomes, a membrane and cytoplasm.",
        },
        {
          id: "bio1t-a15",
          type: "MCQ",
          marks: 1,
          prompt: "Using computer algorithms to compare DNA sequences of different species and build an evolutionary tree is an example of:",
          data: { options: opt("Computational biology", "Endocytosis", "Thermoregulation", "Binary fission") },
          answer: { correct: "a" },
          explanation: "Applying computation to biological data (sequence comparison, phylogenetics) is computational biology.",
        },
      ],
    },
    {
      id: "bio1t-sec-b",
      title: "Section B — Short answer (5 × 3 marks)",
      instructions: "Answer in 3–6 sentences or clear points.",
      questions: [
        {
          id: "bio1t-b1",
          type: "SHORT_ANSWER",
          marks: 3,
          prompt: "Define **homeostasis**. Explain, with one example each, how organisms maintain body temperature in **cold** and in **hot** environments.",
          answer: {
            modelAnswer:
              "Homeostasis is the ability of an organism to maintain constant internal conditions (temperature, pH, chemical concentrations) within a narrow range despite changes in the environment. Cold: animals such as polar bears conserve heat with thick fur and a dense layer of fat/blubber (feathers in birds). Hot: organisms shed excess heat — humans perspire (sweat) and dogs pant.",
          },
          rubric: [
            { criterion: "Correct definition of homeostasis (maintaining a steady internal environment despite external change)", marks: 1 },
            { criterion: "Cold-climate mechanism with example (e.g. fur, fat/blubber, feathers in polar bear/birds)", marks: 1 },
            { criterion: "Hot-climate mechanism with example (e.g. sweating in humans, panting in dogs)", marks: 1 },
          ],
        },
        {
          id: "bio1t-b2",
          type: "SHORT_ANSWER",
          marks: 3,
          prompt: "State the **three postulates of the cell theory** and name the scientist(s) associated with each.",
          answer: {
            modelAnswer:
              "1. All living organisms are made up of cells — Schleiden (plants, 1838) and Schwann (animals, 1839). 2. The cell is the basic structural and functional unit of life — Schleiden and Schwann. 3. All cells arise from pre-existing cells — Rudolf Virchow (1855), “Omnis cellula e cellula”.",
          },
          rubric: [
            { criterion: "All living organisms are made of cells — Schleiden and/or Schwann", marks: 1 },
            { criterion: "The cell is the basic structural and functional unit of life", marks: 1 },
            { criterion: "All cells arise from pre-existing cells — Virchow", marks: 1 },
          ],
        },
        {
          id: "bio1t-b3",
          type: "SHORT_ANSWER",
          marks: 3,
          prompt: "Give **three** differences between **rough endoplasmic reticulum** and **smooth endoplasmic reticulum**.",
          answer: {
            modelAnswer:
              "Rough ER has ribosomes on its surface; smooth ER has none. Rough ER synthesises (and folds) proteins; smooth ER synthesises lipids. Smooth ER detoxifies drugs and poisons (e.g. in liver cells); rough ER is abundant in protein-secreting cells. Rough ER is mostly flattened sacs (cisternae); smooth ER is mostly tubules.",
          },
          rubric: [
            { criterion: "Presence vs absence of ribosomes", marks: 1 },
            { criterion: "Protein synthesis (RER) vs lipid synthesis (SER)", marks: 1 },
            { criterion: "Any other valid difference (detoxification by SER; cisternae vs tubules; cells where each is abundant)", marks: 1 },
          ],
        },
        {
          id: "bio1t-b4",
          type: "SHORT_ANSWER",
          marks: 3,
          prompt: "What is the cell wall made of in **plants**, **fungi** and **bacteria**? State **one** function of the cell wall.",
          answer: {
            modelAnswer:
              "Plants: cellulose (and hemicellulose); fungi: chitin; bacteria: peptidoglycan. Functions (any one): gives the cell a definite shape and size; provides mechanical support and protection; allows plants, fungi and bacteria to withstand dilute (hypotonic) surroundings without bursting; is permeable to particles of different sizes.",
          },
          rubric: [
            { criterion: "Plants — cellulose (hemicellulose also acceptable)", marks: 0.5 },
            { criterion: "Fungi — chitin", marks: 0.5 },
            { criterion: "Bacteria — peptidoglycan (murein/mucopeptide)", marks: 1 },
            { criterion: "One correct function (shape, support/protection, withstands hypotonic medium, permeability)", marks: 1 },
          ],
        },
        {
          id: "bio1t-b5",
          type: "SHORT_ANSWER",
          marks: 3,
          prompt: "Give **three** differences between **prokaryotic** and **eukaryotic** cells, with one example of each type of organism.",
          answer: {
            modelAnswer:
              "Prokaryotic: no true nucleus — DNA in a nucleoid; no membrane-bound organelles; 70S ribosomes; usually one circular chromosome; smaller (0.1–5 µm); divide by binary fission. Eukaryotic: true nucleus with nuclear membrane; membrane-bound organelles (mitochondria, ER, Golgi); 80S ribosomes; several linear chromosomes; larger (10–100 µm); divide by mitosis. Examples: bacteria/archaea (prokaryotes); plants, animals, fungi, protists (eukaryotes).",
          },
          rubric: [
            { criterion: "Two correct differences (e.g. nucleus vs nucleoid; membrane-bound organelles; 70S vs 80S; circular vs linear DNA; size; division)", marks: 2 },
            { criterion: "Third correct difference plus a correct example of each (e.g. bacterium; plant/animal/fungus)", marks: 1 },
          ],
        },
      ],
    },
    {
      id: "bio1t-sec-c",
      title: "Section C — Long answer (10 marks)",
      instructions: "Write a structured answer with headings or points. A diagram is not required in this online test — describe the arrangement in words.",
      questions: [
        {
          id: "bio1t-c1",
          type: "LONG_ANSWER",
          marks: 10,
          prompt:
            "Describe the structure of the **plasma membrane** according to the **fluid mosaic model**. In your answer:\n\n1. name the scientists who proposed the model;\n2. describe the lipid bilayer and the arrangement of proteins and other components;\n3. explain why the model is called “fluid” and “mosaic”;\n4. state **two** functions of the plasma membrane.",
          answer: {
            modelAnswer:
              "Proposed by S. J. Singer and G. L. Nicolson (1972). The basic structure is a phospholipid bilayer: hydrophilic heads face the watery outside and inside of the cell, hydrophobic tails point inwards. Proteins are embedded in the bilayer — integral proteins span it (some form channels) and peripheral proteins sit on the surface; they are not sandwiched in continuous layers. Cholesterol lies between lipids in animal cells; carbohydrate chains on the outer surface form glycoproteins and glycolipids (cell recognition). Fluid: lipids and many proteins move sideways, so the membrane is flexible. Mosaic: proteins are scattered through the lipid layer like tiles of a mosaic. Functions: selectively permeable — regulates movement of molecules; maintains the distinct composition of the cell; allows diffusion of O₂/CO₂; allows endocytosis (e.g. Amoeba engulfing food).",
          },
          rubric: [
            { criterion: "Singer and Nicolson (1972) named as proposers", marks: 1 },
            { criterion: "Phospholipid bilayer described: hydrophilic heads facing water on both sides, hydrophobic tails inwards", marks: 2 },
            { criterion: "Proteins: integral (spanning/channels) and peripheral (surface) — embedded, not a sandwich", marks: 2 },
            { criterion: "Other components: cholesterol and/or carbohydrates as glycoproteins/glycolipids", marks: 1 },
            { criterion: "Correct meaning of “fluid” (lateral movement) and “mosaic” (scattered proteins)", marks: 2 },
            { criterion: "Two correct functions (selective permeability/transport, maintaining composition, diffusion, endocytosis)", marks: 2 },
          ],
          explanation: "See the lesson “The plasma membrane and the fluid mosaic model”.",
        },
      ],
    },
  ],
};

export default test;
