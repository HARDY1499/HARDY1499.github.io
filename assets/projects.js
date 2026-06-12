/* ============================================================
   PROJECT DATA — to add a new project, append an object here.
   The landing page renders cards from this array automatically.
   Fields:
     title      — project name
     status     — e.g. "Ongoing", "Completed", "" (hidden if empty)
     headline   — one-sentence description shown on the card
     metrics    — up to 3 {value, label} pairs (big numbers)
     tags       — tech stack chips
     page       — relative URL of the case-study page ("" = no page)
     github     — repo URL ("" = none)
   ============================================================ */

const PROJECTS = [
  {
    title: "Captain Scheduling Optimization — Eurowings",
    status: "Ongoing",
    headline:
      "Integrated column-generation solver assigning captains to flight legs across 8 European bases under EASA flight-duty regulations — engine complete and running end-to-end, now being scaled to the full instance. RWTH OR Practice Project with Eurowings (Lufthansa Group), supervised by Prof. Marco Lübbecke.",
    metrics: [
      { value: "432", label: "captains" },
      { value: "52,885", label: "flight legs" },
      { value: "2.8×", label: "pricing speed-up (exact)" },
    ],
    tags: ["Python", "SCIP (PySCIPopt)", "Column Generation", "MIP", "pandas", "NetworkX"],
    page: "projects/eurowings.html",
    github: "",
  },
  {
    title: "Spatio-Temporal Traffic Forecasting (ST-GNN)",
    status: "Ongoing",
    headline:
      "A3T-GCN model forecasting hourly traffic speeds 3, 6, and 12 hours ahead across Berlin's open VMZ detector network, benchmarked against last-value, historical-average, and per-node LSTM baselines.",
    metrics: [
      { value: "454", label: "loop detectors" },
      { value: "5,000+", label: "monthly CSVs processed" },
      { value: "3 / 6 / 12 h", label: "forecast horizons" },
    ],
    tags: ["PyTorch", "PyTorch Geometric Temporal", "GeoPandas", "SciPy", "pandas"],
    page: "projects/berlin-stgnn.html",
    github: "https://github.com/HARDY1499/BerlinTrafficPrediction",
  },
  {
    title: "Enterprise Market Intelligence Copilot",
    status: "",
    headline:
      "Local-first LLM analyst answering enterprise market questions that mix hard pipeline numbers (TAM, SAM, MRR) with qualitative context — a LangGraph ReAct agent wielding a SQL generator and semantic search over a vector store.",
    metrics: [
      { value: "2 tools", label: "SQL + vector search" },
      { value: "100% local", label: "Ollama, no cloud APIs" },
    ],
    tags: ["LangGraph", "Gemma / Llama 3.1", "Ollama", "ChromaDB", "FastAPI", "Python"],
    page: "projects/market-copilot.html",
    github: "https://github.com/HARDY1499/Enterprise-Market-Intelligence-Copilot-v2",
  },
  {
    title: "Quizzler — Real-Time Multiplayer Trivia Game",
    status: "Solo build · 2026",
    headline:
      "Cross-platform (iOS / Android / web) head-to-head trivia with a retro arcade identity: atomic server-side matchmaking, live score sync over WebSockets, and per-topic ELO ratings settled transactionally on the server.",
    metrics: [
      { value: "3 platforms", label: "one codebase" },
      { value: "ELO K=32", label: "per-topic skill rating" },
      { value: "1 transaction", label: "settles ratings + XP" },
    ],
    tags: ["React Native (Expo)", "TypeScript", "Supabase", "PostgreSQL", "WebSockets"],
    page: "projects/quizzler.html",
    github: "https://github.com/HARDY1499/quizzler",
  },
];

/* Renders cards into #project-grid (no-op on case-study pages). */
(function renderProjects() {
  const grid = document.getElementById("project-grid");
  if (!grid) return;
  grid.innerHTML = PROJECTS.map((p) => {
    const metrics = (p.metrics || [])
      .map((m) => `<div class="metric"><b>${m.value}</b><span>${m.label}</span></div>`)
      .join("");
    const tags = (p.tags || []).map((t) => `<span class="tag">${t}</span>`).join("");
    const status = p.status ? `<span class="status">${p.status}</span>` : "";
    const inner = `
      <div class="card-top"><h3>${p.title}</h3>${status}</div>
      <p class="headline">${p.headline}</p>
      <div class="metrics">${metrics}</div>
      <div class="tags">${tags}</div>
      ${p.page ? `<span class="card-link">Read case study →</span>` : ""}`;
    return p.page
      ? `<a class="project-card" href="${p.page}">${inner}</a>`
      : `<div class="project-card">${inner}</div>`;
  }).join("");
})();
