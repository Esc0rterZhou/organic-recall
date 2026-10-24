# Organic Recall

Independent organic chemistry practice in English, organized around the 26 chapters of Vollhardt & Schore, *Organic Chemistry: Structure and Function*, sixth edition.

**No GPT, ChatGPT login, OpenAI API, or API key is required.** All quiz logic, PDF text extraction, matching, and progress storage run in the visitor's browser. GitHub Pages serves the static files.

## Study

- 236 original questions, including 36 questions in Chapter 19.
- Add lecture PDFs to match their readable topics to a prepared question bank.
- Practice products, reagents, mechanisms, short syntheses, and concepts.
- Review explanations, textbook PDF page references, missed questions, and flagged questions.
- Export quizzes or back up and restore learning progress.

This app selects questions from a verified basic bank; it does not generate new questions with an AI model or read every chemical drawing. Scanned PDFs need OCR first. Lecture limit: 50 MB and 250 pages per file.

## Run locally

The downloadable standalone package already includes `dist/vendor/`. For a fresh repository checkout, prepare the pinned PDF.js build dependency once:

```sh
npm install --ignore-scripts --omit=optional
npm run build
```

This downloads PDF.js from the npm registry, not from OpenAI. The finished website serves the parser and all assets from its own host.

With Node.js 20 or later installed:

```sh
node server.mjs
```

Open `http://127.0.0.1:4174/`. No npm installation is needed. Alternatively, serve the `dist/` folder using any static HTTP server.

Run `npm run check` to check the content and independent runtime. To emulate a GitHub project URL on PowerShell:

```powershell
$env:BASE_PATH='organic-recall'
node server.mjs
```

Then open `http://127.0.0.1:4174/organic-recall/`.

## Publish on GitHub Pages

1. In repository **Settings → Pages → Build and deployment**, choose **GitHub Actions** as the source.
2. Push to `main`, or run the **Deploy independent website** workflow under Actions.
3. The workflow installs the exact pinned PDF.js version, bundles its license, fonts, CMaps, and WebAssembly assets, checks the app, and publishes `dist/`. It does not connect to OpenAI.

The same `dist/` directory can be deployed on another static host or your own server, without GitHub or ChatGPT at runtime. References: [GitHub Pages publishing](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Your files and progress

- Original textbook and lecture PDFs are not included in this repository. Visitors choose files from their own devices, and the app processes them locally.
- Source references use PDF page numbers, not printed page numbers. Link the supplied original sixth-edition textbook (1,374 pages) for direct page jumps.
- Learning progress stays in localStorage on each device. It is not uploaded or synced.
- When moving from another domain, export a progress backup there and restore it on this website. Browser storage is specific to each origin.
- File links are held only for the current visit; reopen PDFs after refreshing if you want to view original pages.

PDF.js is distributed under the Apache-2.0 license included at `dist/vendor/PDFJS-LICENSE.txt` after extraction.
