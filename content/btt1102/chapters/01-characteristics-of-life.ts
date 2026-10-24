import type { ChapterContent } from "../../../src/lib/content/schema";

/**
 * BTT1102 Unit 1 · Topic A — Characteristics of living organisms.
 * Primary source: teacher's slides "bio unit 1" (slides 2–12, 14). Where a slide is
 * imprecise, a clearly marked clarification is added (see `callout` blocks titled "Clarification").
 */
const chapter: ChapterContent = {
  slug: "characteristics-of-living-organisms",
  title: "Characteristics of Living Organisms",
  summary: "What biology studies, what makes something alive, and how living things are organised from organelles to the biosphere.",
  topics: [
    {
      slug: "biology-and-life",
      title: "Biology and life",
      lessons: [
        {
          slug: "biology-and-its-branches",
          title: "What is biology? Branches of biology",
          summary: "Biology is the study of living things. Learn what it covers and its main branches.",
          estMinutes: 10,
          blocks: [
            { type: "objectives", items: ["Define biology and state what it studies.", "Name the main branches of biology and what each one studies.", "Match a description of a study area to the correct branch."] },
            { type: "definition", term: "Biology", md: "The scientific study of **living things (organisms)** — their structure, function, growth, origin, evolution and distribution." },
            {
              type: "markdown",
              md: "Biology classifies and describes organisms, explains how they work, how **species** come into existence, and how organisms interact with each other and with their natural environment.\n\nLiving things range from microscopic bacteria to a blue whale — biology studies all of them, at every scale from molecules to the whole Earth.",
            },
            { type: "heading", text: "Branches of biology" },
            {
              type: "table",
              headers: ["Branch", "What it studies", "Example question it asks"],
              rows: [
                ["**Biochemistry**", "The chemicals (molecules) that make up life and the reactions between them", "How does an enzyme speed up digestion?"],
                ["**Cell biology**", "Life at the level of the cell", "What does the mitochondrion do?"],
                ["**Microbiology**", "Microscopic organisms such as bacteria", "How do bacteria multiply?"],
                ["**Immunology**", "An organism's resistance (immunity) to disease", "How does a vaccine protect us?"],
                ["**Genetics**", "How organisms pass traits to their offspring (heredity)", "Why do children resemble their parents?"],
                ["**Physiology**", "How living bodies and their parts work (function)", "How does the heart pump blood?"],
                ["**Zoology**", "Animals", "How do birds migrate?"],
                ["**Botany**", "Plants", "How do leaves make food?"],
                ["**Ecology**", "How organisms interact with their environment and with each other", "What happens to a pond if fish are removed?"],
                ["**Evolutionary biology**", "How populations and species change over time", "How did whales evolve from land mammals?"],
              ],
            },
            {
              type: "callout",
              variant: "note",
              title: "Clarification (slide 3)",
              md: "The slide says physiology is “the study of how the **human** body works”. That is **human** physiology. Physiology in general studies how **any** living organism and its parts function — there is plant physiology, animal physiology and microbial physiology too.",
            },
            { type: "examPoints", items: ["Biology = study of living organisms: structure, function, growth, origin, evolution, distribution.", "Genetics → heredity; ecology → interactions with environment; physiology → functioning of the body."] },
            { type: "recap", items: ["Biology studies life at every level.", "Each branch focuses on one aspect: molecules (biochemistry), cells (cell biology), heredity (genetics), interactions (ecology) and so on."] },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "bio1-branches-mcq-1",
              prompt: "Which branch of biology studies how organisms interact with their environment and with each other?",
              options: [
                { id: "a", text: "Physiology" },
                { id: "b", text: "Ecology" },
                { id: "c", text: "Genetics" },
                { id: "d", text: "Biochemistry" },
              ],
              correct: "b",
              explanation: "Ecology studies interactions between organisms and their environment.",
            },
            {
              type: "MCQ",
              slug: "bio1-branches-mcq-2",
              prompt: "A scientist studies why offspring resemble their parents. Which branch is this?",
              options: [
                { id: "a", text: "Immunology" },
                { id: "b", text: "Botany" },
                { id: "c", text: "Genetics" },
                { id: "d", text: "Zoology" },
              ],
              correct: "c",
              explanation: "Genetics studies heredity — how traits pass from parents to offspring.",
            },
            {
              type: "FILL_BLANK",
              slug: "bio1-branches-fill-1",
              prompt: "The study of the chemicals that make up life is called ___ .",
              accepted: [["biochemistry"]],
              explanation: "Biochemistry studies the molecules of life and their reactions.",
            },
          ],
        },
        {
          slug: "what-is-life",
          title: "What is life? The characteristics of living organisms",
          summary: "The shared properties of all living things — response, reproduction, growth, regulation, homeostasis, energy processing, cells and heredity.",
          estMinutes: 25,
          blocks: [
            {
              type: "objectives",
              items: [
                "Define an organism.",
                "List and explain the characteristics shared by all living organisms.",
                "Explain adaptation, reproduction (sexual and asexual), metabolism, homeostasis and energy processing with examples.",
              ],
            },
            { type: "definition", term: "Organism", md: "An individual living creature — for example a bacterium, a mango tree, a frog or a human." },
            {
              type: "markdown",
              md: "There is no single feature that alone proves something is alive. Instead, biologists use a **set of characteristics** that all living organisms share. According to the teacher's slides, all living organisms:\n\n1. respond to their environment\n2. grow and change (develop)\n3. reproduce and have offspring\n4. have complex chemistry (metabolism) and are regulated\n5. maintain homeostasis\n6. are built of structures called **cells**\n7. pass their traits on to their offspring (heredity)\n\nThey also **process energy** to power all of the above. Each characteristic is explained below.",
            },

            { type: "heading", text: "1. Responding to the environment" },
            {
              type: "markdown",
              md: "Living things sense what is going on around them and **respond to changes (stimuli)** in their environment — light, touch, temperature, chemicals and so on.\n\n**Example:** the leaves of the sensitive plant *Mimosa pudica* droop and fold within seconds when touched, and return to normal after a few minutes. A non-living rock does not respond like this.",
            },
            { type: "definition", term: "Adaptation", md: "The process of becoming adjusted to an environment. Adaptations may be **structural** (body parts), **physiological** (body chemistry) or **behavioural** (actions) traits that improve an organism's chances of survival — and therefore of reproducing." },
            {
              type: "table",
              caption: "Types of adaptation with examples",
              headers: ["Type", "Example"],
              rows: [
                ["Structural", "Thick fur and a fat layer in polar bears keep heat in."],
                ["Physiological", "Sweating in humans cools the body."],
                ["Behavioural", "Dogs pant to lose heat; birds migrate in winter."],
              ],
            },

            { type: "heading", text: "2. Reproduction" },
            {
              type: "markdown",
              md: "**Reproduction** is the process of making the next generation. If a species could not reproduce, it would go extinct. Reproduction can be **sexual** or **asexual**.",
            },
            {
              type: "table",
              headers: ["", "Sexual reproduction", "Asexual reproduction"],
              rows: [
                ["Number of parents", "Two", "One"],
                ["Gametes", "Two **gametes** (haploid sex cells), one from each parent, fuse", "No fusion of gametes"],
                ["Offspring", "Genetically unique", "Genetically identical to the parent (clones)"],
                ["Genetic variation", "Increases variation within a species", "No new variation (except by mutation)"],
                ["Examples", "Humans, most animals, flowering plants", "Bacteria (binary fission), yeast (budding), potato tubers"],
              ],
            },
            { type: "definition", term: "Gamete", md: "A **haploid** sex cell (sperm or egg) — it carries **one** set of chromosomes, half the number found in normal body cells." },
            {
              type: "callout",
              variant: "note",
              title: "Clarification (slide 6)",
              md: "The slide says “all living organisms must have the ability to reproduce”. Strictly, reproduction is a property of a **species**. Some individual organisms cannot reproduce — a mule or a worker bee is sterile — yet they are clearly alive.",
            },

            { type: "heading", text: "3. Growth and development" },
            {
              type: "markdown",
              md: "Organisms **grow** (increase in size or cell number) and **develop** (change in form and function) by following instructions coded in their **genes**. These instructions make sure that a species' young grow up to show the same characteristics as their parents.\n\n**Example:** a tadpole goes through many changes — it grows legs and loses its tail — to become an adult frog.\n\nNote: a crystal can “grow” by adding material on its surface, but living things grow **from inside**, by making new cells and new molecules.",
            },

            { type: "heading", text: "4. Regulation and metabolism" },
            {
              type: "markdown",
              md: "Even the smallest organisms are complex. They need many **regulatory mechanisms** to coordinate internal functions, respond to stimuli and cope with stress. Two examples of regulated internal functions are **nutrient transport** and **blood flow**.\n\n**Organs** (groups of tissues working together) carry out specific jobs: carrying oxygen around the body, removing wastes, delivering nutrients to every cell and cooling the body.\n\nCompare a flower with a crystal. Both have beautiful structures, but the crystal does not change. The flower is constantly transporting water, making pigment molecules, breaking down sugar for energy and carrying out many other **biochemical reactions** needed to stay alive.",
            },
            { type: "definition", term: "Metabolism", md: "The **sum of all the chemical reactions** in a cell (or organism). It includes building molecules up (anabolism) and breaking them down to release energy (catabolism)." },

            { type: "heading", text: "5. Homeostasis" },
            { type: "definition", term: "Homeostasis", md: "Literally “steady state” — the ability of an organism to keep its **internal conditions** (temperature, pH, water, chemical concentrations) within a narrow range, even when the environment changes." },
            {
              type: "markdown",
              md: "Cells only work properly under the right conditions: suitable temperature, pH and concentration of chemicals. Homeostasis keeps them there.\n\n**Thermoregulation** (control of body temperature) is a good example:\n- In **cold** climates, animals such as the polar bear (*Ursus maritimus*) conserve heat using thick **fur**, and a dense layer of **fat/blubber** under the skin. Feathers also insulate birds.\n- In **hot** climates, organisms shed excess heat — humans **perspire** (sweat) and dogs **pant**.",
            },

            { type: "heading", text: "6. Energy processing" },
            {
              type: "markdown",
              md: "All organisms use a source of **energy** for their metabolic activities.\n- Some capture energy from **sunlight** and convert it into chemical energy stored in food — **photosynthesis** (plants, algae, some bacteria).\n- Others use the **chemical energy** in molecules they take in as food — released by **cellular respiration** (animals, fungi, and plants too).\n\n**Example:** the California condor uses chemical energy from its food to power flight.",
            },

            { type: "heading", text: "7. Made of cells, and 8. Heredity" },
            {
              type: "markdown",
              md: "All living organisms are made of one or more **cells** — the basic unit of life (covered in detail in the next chapter).\n\nOrganisms also **pass their traits to their offspring** through genetic material (DNA). This is called **heredity**.",
            },

            { type: "heading", text: "Summary: the characteristics of life" },
            {
              type: "markdown",
              md: "The teacher's summary slide lists **seven** characteristics of life:\n\n1. Responsiveness to the environment\n2. Growth and change\n3. Ability to reproduce\n4. Have a metabolism (and “breathe” — see clarification below)\n5. Maintain homeostasis\n6. Being made of cells\n7. Passing traits on to offspring",
            },
            {
              type: "callout",
              variant: "warning",
              title: "Clarification (slide 12) — “have a metabolism and breathe”",
              md: "Do **not** write that all living things *breathe*. **Breathing** means moving air in and out (lungs, gills) — plants and bacteria do not breathe. What every cell does is **cellular respiration**: releasing energy from food. Some organisms even respire **without oxygen** (anaerobic respiration). In exams, write “have a **metabolism** (including cellular respiration)”.\n\nAlso note: textbooks differ in how many characteristics they list (7, 8 or more) and how they group them. Learn the ideas, not just a number.",
            },
            {
              type: "examPoints",
              items: [
                "Organism = an individual living creature.",
                "Adaptation may be structural, physiological or behavioural.",
                "Sexual reproduction: two parents, fusion of haploid gametes, genetically unique offspring. Asexual: one parent, identical offspring.",
                "Metabolism = sum of all chemical reactions in a cell.",
                "Homeostasis = maintaining a steady internal environment (e.g. thermoregulation).",
                "Energy is captured by photosynthesis or released from food by cellular respiration.",
              ],
            },
            { type: "recap", items: ["Living things respond, grow, reproduce, carry out metabolism, maintain homeostasis, process energy, are made of cells and pass on traits.", "No single property defines life — it is the combination."] },
            {
              type: "exercise",
              id: "bio1-ex-characteristics",
              kind: "concept",
              title: "Is it alive?",
              prompt: "A car moves, uses fuel (energy) and releases waste gases. Using the characteristics of life, explain why a car is **not** a living organism.",
              hint: "Check each characteristic: cells, reproduction, growth from within, homeostasis, heredity.",
              solution:
                "A car shows only some features that look like life (movement, using energy). It is **not made of cells**, it cannot **reproduce** or pass on **traits** to offspring, it does not **grow and develop** from inside, it has no **metabolism** in the biological sense, and it cannot maintain **homeostasis** on its own. An organism must show the whole set of characteristics.",
            },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "bio1-life-mcq-homeostasis",
              prompt: "A human sweats on a hot day so that body temperature stays near 37 °C. This is an example of:",
              options: [
                { id: "a", text: "Reproduction" },
                { id: "b", text: "Homeostasis" },
                { id: "c", text: "Growth" },
                { id: "d", text: "Heredity" },
              ],
              correct: "b",
              explanation: "Keeping internal temperature steady despite the environment is homeostasis (thermoregulation).",
            },
            {
              type: "MCQ",
              slug: "bio1-life-mcq-asexual",
              prompt: "Which statement about **asexual** reproduction is correct?",
              options: [
                { id: "a", text: "It needs two parents." },
                { id: "b", text: "It involves fusion of haploid gametes." },
                { id: "c", text: "It produces offspring genetically identical to the parent." },
                { id: "d", text: "It increases genetic variation in a species." },
              ],
              correct: "c",
              explanation: "Asexual reproduction involves one parent and no fusion of gametes, so offspring are identical to the parent.",
            },
            {
              type: "MCQ",
              slug: "bio1-life-mcq-adaptation",
              prompt: "A polar bear's thick fur and layer of fat are best described as:",
              options: [
                { id: "a", text: "Behavioural adaptations" },
                { id: "b", text: "Structural adaptations" },
                { id: "c", text: "Asexual reproduction" },
                { id: "d", text: "Metabolism" },
              ],
              correct: "b",
              explanation: "Fur and fat are body structures that help the bear survive the cold — structural adaptations.",
            },
            {
              type: "FILL_BLANK",
              slug: "bio1-life-fill-metabolism",
              prompt: "The sum of all the chemical reactions in a cell is called ___ .",
              accepted: [["metabolism"]],
              explanation: "Metabolism = all chemical reactions in a cell.",
            },
            {
              type: "TRUE_FALSE",
              slug: "bio1-life-tf-breathe",
              prompt: "All living organisms breathe using lungs or gills.",
              correct: false,
              explanation: "Plants, fungi and bacteria do not breathe. All cells carry out cellular respiration, which is different from breathing.",
            },
          ],
        },
        {
          slug: "levels-of-organisation",
          title: "Levels of organisation in living things",
          summary: "From organelles to the biosphere — the hierarchy of life.",
          estMinutes: 10,
          blocks: [
            { type: "objectives", items: ["List the levels of biological organisation in the correct order.", "Give an example for each level.", "Distinguish population, community and ecosystem."] },
            {
              type: "markdown",
              md: "Living things are part of a **highly structured hierarchy**. Each level is built from the level below it.\n\nInside one organism, structure goes: **cell → tissue → organ → organ system → organism**.",
            },
            {
              type: "image",
              src: "/diagrams/btt1102/levels-of-organisation.svg",
              alt: "Levels of organisation: organelle, cell, tissue, organ, organ system, organism, population, community, ecosystem, biosphere.",
              caption: "Levels of biological organisation, from smallest to largest",
            },
            {
              type: "table",
              caption: "Each level with the example used in the teacher's slides",
              headers: ["Level", "Meaning", "Example"],
              rows: [
                ["Organelle", "A specialised structure inside a cell", "The nucleus (stained blue in onion cells)"],
                ["Cell", "The basic unit of life", "Human blood cells"],
                ["Tissue", "A group of similar cells doing the same job", "Human skin tissue; muscle tissue"],
                ["Organ", "Different tissues working together", "Stomach, heart"],
                ["Organ system", "Organs working together", "Digestive system (stomach + intestine + …)"],
                ["Organism", "An individual living thing", "One pine tree"],
                ["Population", "All individuals of **one species** in an area", "All the pine trees in a forest"],
                ["Community", "All the **different species** living in an area", "All plants and animals in the forest"],
                ["Ecosystem", "A community **plus** its non-living environment", "A coastal ecosystem: organisms + water, soil, climate"],
                ["Biosphere", "All the ecosystems on Earth", "The whole Earth"],
              ],
            },
            {
              type: "callout",
              variant: "tip",
              title: "How to remember",
              md: "**Population** = one species. **Community** = many species. **Ecosystem** = community + non-living surroundings. Below the organelle, the hierarchy continues down to **molecules** and **atoms**.",
            },
            { type: "examPoints", items: ["Correct order: organelle → cell → tissue → organ → organ system → organism → population → community → ecosystem → biosphere.", "The cell is the smallest level that is itself alive."] },
            { type: "recap", items: ["Life is organised in levels; each level is built from the one below.", "Population, community and ecosystem describe groups of organisms and their environment."] },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "bio1-levels-mcq-1",
              prompt: "All the pine trees in a forest together form a:",
              options: [
                { id: "a", text: "Community" },
                { id: "b", text: "Population" },
                { id: "c", text: "Ecosystem" },
                { id: "d", text: "Organ system" },
              ],
              correct: "b",
              explanation: "A population is all individuals of one species in an area.",
            },
            {
              type: "MCQ",
              slug: "bio1-levels-mcq-2",
              prompt: "Which sequence is in the correct order from smallest to largest?",
              options: [
                { id: "a", text: "Cell → organ → tissue → organism" },
                { id: "b", text: "Tissue → cell → organ → organ system" },
                { id: "c", text: "Cell → tissue → organ → organ system" },
                { id: "d", text: "Organ → tissue → cell → organism" },
              ],
              correct: "c",
              explanation: "Cells form tissues, tissues form organs, and organs form organ systems.",
            },
            {
              type: "FILL_BLANK",
              slug: "bio1-levels-fill-1",
              prompt: "A community together with its non-living environment is called an ___ .",
              accepted: [["ecosystem"]],
              explanation: "Ecosystem = living community + non-living (abiotic) environment.",
            },
          ],
        },
      ],
    },
  ],
};

export default chapter;
