import type { ChapterContent } from "../../../src/lib/content/schema";

/**
 * BTT1102 Unit 1 · Topic C — Introduction to Computational Biology and its interdisciplinary
 * applications. This topic is in the official syllabus (PDF p. 91) but is NOT covered in the
 * teacher's Unit 1 slides; the content below is written from standard introductory sources and is
 * labelled as such in the lesson.
 */
const chapter: ChapterContent = {
  slug: "introduction-to-computational-biology",
  title: "Introduction to Computational Biology",
  summary: "What computational biology is, how it relates to bioinformatics, and where it is applied.",
  topics: [
    {
      slug: "computational-biology",
      title: "Computational biology and its applications",
      lessons: [
        {
          slug: "what-is-computational-biology",
          title: "What is computational biology? Interdisciplinary applications",
          summary: "Definition, related fields, types of biological data and real-world applications.",
          estMinutes: 20,
          blocks: [
            {
              type: "callout",
              variant: "info",
              title: "About this lesson",
              md: "This topic is part of the official BTT1102 Unit 1 syllabus (*“Introduction to Computational Biology and its interdisciplinary applications”*), but it is **not covered in your teacher's Unit 1 slides**. It is written from standard introductory sources. Check with your teacher how much depth they expect.",
            },
            { type: "objectives", items: ["Define computational biology and bioinformatics.", "Name the disciplines that computational biology combines.", "Describe major applications of computational biology with examples."] },
            {
              type: "definition",
              term: "Computational biology",
              md: "The use of **computers, mathematics, statistics and algorithms** to study, model and understand **biological systems and biological data**.",
            },
            {
              type: "definition",
              term: "Bioinformatics",
              md: "A closely related field focused on **storing, organising, retrieving and analysing biological data** — especially DNA, RNA and protein sequences — using databases and software tools.",
            },
            {
              type: "markdown",
              md: "The two terms overlap and are often used together. A simple way to separate them:\n- **Bioinformatics** builds and uses **tools and databases** to handle biological data.\n- **Computational biology** uses computation (models, simulations, algorithms) to **answer biological questions**.",
            },
            { type: "heading", text: "Why do we need computers in biology?" },
            {
              type: "markdown",
              md: "Modern biology produces **huge amounts of data**. The human genome alone is about **3 billion** DNA bases, and DNA-sequencing machines now read millions of sequences in a single run. No person can analyse this by hand — computers are needed to store, search, compare and model it.\n\nThe completion of the **Human Genome Project (2003)** is a famous example of biology that depended on computing to assemble the genome from many small pieces of sequence.",
            },
            { type: "heading", text: "An interdisciplinary field" },
            {
              type: "table",
              headers: ["Discipline", "What it contributes"],
              rows: [
                ["**Biology**", "The questions and the data (cells, genes, proteins, organisms)"],
                ["**Computer science**", "Algorithms, programming, databases, artificial intelligence and machine learning"],
                ["**Mathematics**", "Models and equations describing biological processes"],
                ["**Statistics**", "Making sense of noisy data; testing whether results are significant"],
                ["**Chemistry and physics**", "Understanding molecular structure and interactions (e.g. of proteins and drugs)"],
              ],
            },
            { type: "heading", text: "Types of biological data" },
            {
              type: "markdown",
              md: "- **Sequences** — DNA, RNA (strings of A, C, G, T/U) and proteins (strings of amino acids).\n- **Structures** — 3-D shapes of proteins and other molecules.\n- **Expression data** — which genes are switched on in a cell and how strongly.\n- **Images** — microscope images, medical scans.\n- **Clinical and population data** — patient records, disease spread.",
            },
            { type: "heading", text: "Applications" },
            {
              type: "table",
              headers: ["Area", "How computation is used", "Example"],
              rows: [
                ["**Genomics**", "Assembling and comparing genome sequences; finding genes", "Human Genome Project"],
                ["**Protein structure prediction**", "Predicting a protein's 3-D shape from its amino-acid sequence", "AI systems such as AlphaFold"],
                ["**Drug discovery**", "Screening millions of molecules on a computer to find likely drugs before lab testing", "Virtual screening of drug candidates"],
                ["**Personalised (precision) medicine**", "Using a patient's genetic data to choose suitable treatment", "Choosing cancer therapy based on tumour mutations"],
                ["**Disease modelling and epidemiology**", "Mathematical models of how infections spread", "Forecasting outbreaks"],
                ["**Medical diagnosis**", "Machine learning on images and data to detect disease", "Detecting tumours in scans"],
                ["**Agriculture**", "Analysing crop genomes and field data", "Breeding disease-resistant crops; precision farming"],
                ["**Evolution and phylogenetics**", "Comparing sequences to build evolutionary trees", "Tracing how species are related"],
              ],
            },
            {
              type: "callout",
              variant: "tip",
              title: "Connection with the rest of this course",
              md: "Later units of BTT1102 build on these ideas: biomolecules and bioinformatics tools (Unit 2), biological databases such as GenBank and PDB (Unit 3), and AI in medical and agricultural biotechnology (Units 4–5).",
            },
            {
              type: "examPoints",
              items: [
                "Computational biology = computers + mathematics + statistics applied to biological systems and data.",
                "Bioinformatics focuses on managing and analysing biological data (sequences, databases, tools).",
                "It is interdisciplinary: biology, computer science, mathematics, statistics, chemistry and physics.",
                "Applications: genomics, protein structure prediction, drug discovery, personalised medicine, disease modelling, agriculture, evolution.",
              ],
            },
            { type: "recap", items: ["Biology now generates more data than humans can analyse by hand.", "Computational biology turns this data into understanding, predictions and new treatments."] },
          ],
          practice: [
            {
              type: "MCQ",
              slug: "bio1-compbio-mcq-def",
              prompt: "Computational biology is best described as:",
              options: [
                { id: "a", text: "The study of computers made from biological materials" },
                { id: "b", text: "The use of computers, mathematics and statistics to study biological systems and data" },
                { id: "c", text: "The repair of computer hardware" },
                { id: "d", text: "Growing cells in a laboratory dish" },
              ],
              correct: "b",
              explanation: "Computational biology applies computation, mathematics and statistics to biological questions and data.",
            },
            {
              type: "MCQ",
              slug: "bio1-compbio-mcq-app",
              prompt: "Predicting the 3-D shape of a protein from its amino-acid sequence is an application of:",
              options: [
                { id: "a", text: "Computational biology" },
                { id: "b", text: "Thermoregulation" },
                { id: "c", text: "Binary fission" },
                { id: "d", text: "Endocytosis" },
              ],
              correct: "a",
              explanation: "Protein structure prediction is a major computational biology application.",
            },
            {
              type: "TRUE_FALSE",
              slug: "bio1-compbio-tf-interdisciplinary",
              prompt: "Computational biology combines biology with fields such as computer science, mathematics and statistics.",
              correct: true,
              explanation: "It is an interdisciplinary field.",
            },
          ],
        },
      ],
    },
  ],
};

export default chapter;
