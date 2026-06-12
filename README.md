# Portfolio — Harjasdeep Singh

Static portfolio site. No build step, no dependencies — plain HTML/CSS/JS.

**Live at:** `https://hardy1499.github.io` (once deployed, see below)

## Structure

```
portfolio/
├── index.html              # Landing page (hero, projects, experience, skills, contact)
├── projects/               # One case-study page per project
│   ├── eurowings.html
│   ├── berlin-stgnn.html
│   └── market-copilot.html
├── assets/
│   ├── style.css           # All styling (CSS variables, dark/light themes)
│   ├── projects.js         # ★ PROJECT DATA — edit this to add/update projects
│   └── main.js             # Theme toggle
├── .nojekyll               # Tells GitHub Pages to skip Jekyll processing
└── README.md
```

## Deploy to GitHub Pages (one-time, ~5 minutes)

1. Create a repo named exactly **`HARDY1499.github.io`** on GitHub (must match your username).
2. From inside this `portfolio/` folder:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/HARDY1499/HARDY1499.github.io.git
   git push -u origin main
   ```
3. Done. The site goes live at `https://hardy1499.github.io` within a couple of minutes.
   Every future `git push` redeploys automatically — no Actions config needed for a
   user-pages repo.

(If you'd rather keep it in a repo with a different name, enable Pages in
Settings → Pages → Deploy from branch `main`, and the site lives at
`https://hardy1499.github.io/<repo-name>/`.)

## Adding a new project

1. Open `assets/projects.js` and append an object to the `PROJECTS` array
   (title, status, headline, up to 3 metrics, tags, page URL, GitHub URL).
   The landing-page card appears automatically.
2. (Optional) Create a case-study page: copy any file in `projects/`,
   replace the content, and point the `page` field at it.
3. Commit and push.

## Updating existing content

- **Experience / skills / contact** → edit `index.html` directly (plain HTML sections).
- **Design tweaks** → everything is CSS variables at the top of `assets/style.css`;
  change `--accent` once to re-theme the whole site.

## Custom domain (optional, later)

Buy a domain (e.g. `harjasdeep.dev`), add a `CNAME` file containing the domain
to this repo, and set the DNS A/CNAME records per GitHub's docs. The
`hardy1499.github.io` URL keeps working either way.
