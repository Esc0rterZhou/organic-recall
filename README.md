# Organic Recall 3.5

Public site: https://esc0rterzhou.github.io/organic-recall/

An independent organic chemistry workspace with English, Chinese and French interfaces, questions, options and explanations. It requires no GPT account or model API. GitHub Pages serves the site. Supabase, when configured, supplies username/password authentication and private cross-device progress.

## Learning

- All 26 textbook chapters remain selectable from the homepage study pass and Chapters catalogue.
- 236 original basic questions, including 36 in Chapter 19. All questions and 259 section titles have Chinese and French translations; original PDF text stays in its source language.
- Double-click a homepage chapter circle to enter that chapter. Single-click selects it; the practice button remains available. Enter also opens the focused node.
- The Visual lab opens on a smaller particle sphere with surface dots connected to reaction boxes. Single-click a reaction box to open its exercise or conditions, without a separate Practice button. Surface dots select a reaction for preview. Six Chapter 19 exercises remain available. Exercises use group tiles, click-to-place electron arrows, intermediate choices and ordered reagent slots. Original reaction graphs, formal-charge checks, explicit proton tracking and paired-arrow checks are retained.
- A Mechanisms filter and explicit badges expose the Fischer and HVZ exercises. Their four annotated elementary steps retain paired-arrow and intermediate validation. Correct checks play the electron movements and fade to the immediate intermediate; playback is also available after revealing the reference. Returning to drawing preserves the user's arrows. This is a set of source-annotated local steps, not a full arbitrary mechanism grader.
- The reaction map and five integrated prompts remain under Visual lab. Conditions stay hidden until revealed. Wrong checks and hints flag points for review.
- The supplied sixth-edition textbook is built in. PDF.js renders all 1,374 original PDF pages inside the website, including front matter and references. Chapter selection and question references retain original page numbers. Losslessly compressed blocks load only the needed chapter; no file upload or external reader is required. The reader retains two parsed parts in memory and browser HTTP caching avoids repeated downloads.
- Lecture PDF upload has been removed. Course content is updated centrally by the maintainer after receiving teaching materials outside the website.
- Language and reduced-motion preferences live under Settings. User progress, quiz drafts, visual attempts, notes and reading bookmarks are stored per profile. Guest data is separate; copying guest progress into an account is explicit.

The default entry page retains the original cloudscape and glass login panel. A local WebGL renderer draws 32,000 particles on desktop and 12,000 on mobile, with a Canvas fallback. Each of the ten reactions has a different form: torus, double helix, orbital lobes, vortex, trefoil, twisted ribbon, crystal cage, crown, rosette or spiral disc. Focus transitions use a smooth 760 ms easing curve and loosen into a shell between forms to prevent a dense collapse; rapid changes start from the current pose. Mouse attraction, a brief entry pulse and natural drag rotation remain available.

Homepage molecules use skeletal formulas: unlabeled carbon vertices/endpoints, visible heteroatoms, clipped bond ends and inward aromatic double bonds. Condensed aldehyde and hydroxymethyl groups are expanded before drawing, and formula numerals use subscripts. Methane remains explicitly labeled because a single carbon cannot be expressed as a skeletal bond. Chapter circles stay clear of the central illustration. These are structural illustrations and stylized particles, not computed quantum orbitals. Reaction text stays in fixed readable boxes. Keyboard entry, pause, reduced motion, and list selectors remain available. Statistics stay on the progress page; supporting guidance remains expandable. The original reference video and design documents are not deployed.

## Run and build

The standalone download includes the complete dist directory, including the local PDF parser and account client. Serve it over HTTP; with Node.js 22.12 or later:

    node server.mjs

Open http://127.0.0.1:4174/. For a fresh source checkout:

    npm install --ignore-scripts --no-audit --no-fund
    npm run build
    npm run check

Pinned PDF.js and Supabase client assets are bundled locally. The published application has no remote script or stylesheet CDN. A configured account signs in and syncs only with the declared Supabase project. No private service-role key is allowed in browser configuration.

## Private username accounts

Registration uses a username and password. No email address, university domain, mail sender or GPT account is needed. Usernames are case-insensitive, 3–24 ASCII letters, digits or underscores. Passwords are 10–64 characters and at most 72 UTF-8 bytes.

The registration service creates a Supabase Auth UUID and an opaque internal identity; the synthetic address is never a mailbox or a user-facing login field. Supabase Auth manages password hashing. Each UUID owns its own progress row. Row Level Security and the save function enforce ownership, including the owner captured before asynchronous account switches. Revision conflicts merge records by item timestamp. Guest progress remains separate until explicitly imported.

Registration displays a random 192-bit recovery code. Save it when shown. Only its SHA-256 hash is stored by the backend; the raw code is not stored in progress or backups. Recovery requires the username, code and new password, preserves the UUID and progress, and generates a replacement code. The previous code then stops working. Without the password or recovery code, self-service recovery is unavailable.

To deploy another instance:

1. Run `supabase/username-setup.sql` in the project's SQL editor. It creates private profiles, progress, recovery and rate-limit functions with explicit grants and RLS.
2. Deploy `supabase/functions/username-auth/index.ts` as `username-auth`. Its public registration/recovery endpoint uses its own input, rate-limit and recovery checks; set legacy JWT verification off for this function, as specified in `supabase/config.toml`. The service key stays in Supabase's server environment and is never copied into the browser.
3. Disable direct public Auth signups; this application's server function creates managed users. Keep the Email password provider enabled. No SMTP is required.
4. Set the project's public URL and publishable key in `dist/account-config.json`. Add the deployment origin to the function's explicit CORS allowlist if hosting elsewhere. Use only a public publishable key in frontend files.
5. Set `registrationReady` true after registration, login, owner isolation and recovery work against the live backend. The supplied public configuration points to the deployed Organic Recall project.

Live QA verified two independent users, private progress reads/writes, denied cross-owner access, private recovery hashes, guest denial, recovery rotation, rejected old passwords/codes, preserved progress and revision conflicts. No test credentials are distributed.


## Publication

Push to main to run the GitHub Pages workflow. index.html is the new home; practice.html and review.html remain compatible entry pages for Chapters and Visual lab. The exported dist directory can also be served by another static host. Lecture PDFs, private user data, reference video and private credentials are excluded from publication. The supplied textbook is included as chapter blocks under dist/textbook.

Third-party license details are in THIRD-PARTY-NOTICES.md. The older full-editor workspace remains available in local development history; v3's published exercises do not need its large runtime.
