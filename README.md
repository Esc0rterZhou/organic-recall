# Organic Recall

Independent organic chemistry review in English. Public site: https://esc0rterzhou.github.io/organic-recall/

No GPT, ChatGPT account, OpenAI API or API key is needed. GitHub Pages serves static files; PDF processing, structure editing, checks and progress storage run in the visitor's browser.

## Exam Studio: Chapter 19 pilot

The home page offers a prepared reaction map, six active-recall cards, an automatic weak-point list and five integrated prompts. The two-day plan totals 150 minutes, without a scheduling setup flow.

- Two product drawings: acyl chloride formation and carboxylic acid reduction.
- One ordered-conditions task: Grignard carbonation and acid workup.
- Two mechanism tasks: paired electron movements and intermediate structures in selected Fischer esterification and HVZ acyl-exchange steps.
- One two-transformation synthesis: cyanation followed by heated aqueous nitrile hydrolysis.

Ketcher 3.18.0 standalone provides copied substrates, atoms, bonds, charges, templates, undo, redo and layout. Electron-pair arrows use a separate SVG canvas with semantic atom/bond anchors, click or drag input, undo and redo. A whole-step check requires both the intermediate and the complete annotated arrow set. Drawings and notes save locally; frames can be revisited or copied forward.

Checks compare small-molecule connectivity, bond orders and formal charges while ignoring layout and atom numbering. Explicit hydrogens are retained in proton-tracking frames. Only the supplied source-annotated steps are checked. Arbitrary mechanisms, unrestricted synthetic routes, stereochemistry and query structures are outside the pilot's automatic grading scope. Integrated written answers use a self-check list.

The actual lecture PDF can be rendered locally under Lecture image cover. Drag covers over products or conditions, then reveal each one individually. Image PDFs work without OCR for this visual mode. Lecture 2 PDF page 35 is original slide 32. The original PDF is never uploaded or bundled.

## Basic practice is preserved

Basic practice contains 236 original multiple-choice questions across the 26 textbook chapters, including 36 Chapter 19 questions. Readable lecture PDF topics select questions from the prepared bank; the app does not generate arbitrary new questions or recognize every chemical structure. Scanned PDF text matching needs OCR first. File limit: 50 MB and 250 pages per lecture.

Questions reference Vollhardt & Schore, Organic Chemistry: Structure and Function, sixth edition, and the supplied Chapter 19 lectures. References use PDF file-page numbers rather than printed page numbers. Link the original 1,374-page textbook in Basic practice for page viewing. References are not a claim of human review or measured exam frequency.

## Run and build

The standalone download includes the complete dist directory, including the editor and PDF parser. With Node.js 22.12 or later, run:

```sh
node server.mjs
```

Open http://127.0.0.1:4174/. Any static HTTP server can serve dist as well.

For a fresh source checkout:

```sh
npm install --ignore-scripts --omit=optional --no-audit --no-fund
npm run build
npm run check
```

Build downloads pinned PDF.js from npm and the official Ketcher standalone release from GitHub. Ketcher's SHA-256 is verified before extraction. Windows uses tar; Linux uses unzip. These downloads happen during build, not as a runtime dependency on another application server.

To test a GitHub project prefix in PowerShell:

```powershell
$env:BASE_PATH='organic-recall'
node server.mjs
```

Open http://127.0.0.1:4174/organic-recall/.

## Publish and data

The GitHub Actions workflow builds, verifies and publishes dist on pushes to main. Repository Settings → Pages uses GitHub Actions. The same dist can be hosted on any static host without ChatGPT at runtime.

Progress is stored per browser and origin, without cloud synchronization. Studio and Basic practice maintain separate progress. Export study backups before moving devices; Basic practice also supports restoring its progress backups. Reopen local PDFs after refreshing. Cover positions are saved, but the PDF bytes are not.

Third-party licenses and source links are documented in THIRD-PARTY-NOTICES.md. Ketcher's license is bundled at dist/editor/LICENSE.txt; PDF.js's license at dist/vendor/PDFJS-LICENSE.txt. Original copyrighted textbooks and lecture PDFs are not redistributed.
