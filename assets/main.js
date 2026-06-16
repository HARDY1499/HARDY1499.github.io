/* ============================================================
   Harjasdeep Singh — Developer Analytics Dashboard JS
   Governs SPA tab routing, AJAX case study fetching, searching,
   theme toggles, clock loops, and interactive terminal consoles.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  initConsoleLogger();
  initThemeEngine();
  initTabRouting();
  initMobileMenu();
  initClockLoop();
  initProjectExplorer();
  initInteractiveTerminal();
  initLossCurveWidget();
});

/* ============================================================
   1. LIVE CONSOLE LOG LOGGER (FOOTER DRAWER)
   ============================================================ */
function initConsoleLogger() {
  const drawer = document.getElementById("console-drawer");
  const titlebar = document.getElementById("console-drawer-titlebar");
  const logViewport = document.getElementById("console-log-viewport");

  if (!drawer || !titlebar) return;

  // Collapse by default on mobile devices (width <= 850px)
  if (window.innerWidth <= 850) {
    drawer.classList.add("minimized");
    titlebar.setAttribute("aria-expanded", "false");
  }

  // Toggle Minimize/Expand console drawer
  titlebar.addEventListener("click", () => {
    const isMinimized = drawer.classList.toggle("minimized");
    titlebar.setAttribute("aria-expanded", !isMinimized);
    window.logConsoleEvent("SYS", `Console drawer ${isMinimized ? 'minimized' : 'expanded'}.`);
  });

  // Global logger function bound to window
  window.logConsoleEvent = (tag, message) => {
    if (!logViewport) return;

    const entry = document.createElement("div");
    entry.className = "log-entry animate-fade";

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    let tagClass = "sys";
    if (tag.toLowerCase() === "data") tagClass = "data";
    if (tag.toLowerCase() === "action") tagClass = "action";

    entry.innerHTML = `
      <span class="log-timestamp">[${timeStr}]</span>
      <span class="log-tag ${tagClass}">[${tag.toUpperCase()}]</span>
      <span class="log-message">${message}</span>
    `;

    logViewport.appendChild(entry);
    logViewport.scrollTop = logViewport.scrollHeight;

    // Prune logs if too long
    while (logViewport.children.length > 50) {
      logViewport.removeChild(logViewport.firstChild);
    }
  };
}

/* ============================================================
   2. THEME ENGINE & ACCENTS
   ============================================================ */
function initThemeEngine() {
  const themeBtn = document.getElementById("theme-toggle-btn");
  const moonIcon = document.getElementById("theme-icon-moon");
  const sunIcon = document.getElementById("theme-icon-sun");
  const accentDots = document.querySelectorAll(".accent-dot");

  // A. Light/Dark Toggle
  let activeTheme = localStorage.getItem("dashboard-theme") || "dark";
  
  const setTheme = (theme) => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("dashboard-theme", theme);
    activeTheme = theme;

    if (theme === "light") {
      if (moonIcon) moonIcon.style.display = "none";
      if (sunIcon) sunIcon.style.display = "block";
    } else {
      if (moonIcon) moonIcon.style.display = "block";
      if (sunIcon) sunIcon.style.display = "none";
    }
  };

  // Set initial theme
  setTheme(activeTheme);

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const nextTheme = activeTheme === "dark" ? "light" : "dark";
      setTheme(nextTheme);
      window.logConsoleEvent("SYS", `Theme status changed to: ${nextTheme.toUpperCase()}`);
    });
  }

  // B. Accent Preset Dots
  let activeAccent = localStorage.getItem("dashboard-accent") || "emerald";

  const setAccent = (accent) => {
    document.body.setAttribute("data-accent", accent);
    localStorage.setItem("dashboard-accent", accent);
    activeAccent = accent;

    accentDots.forEach(dot => {
      if (dot.getAttribute("data-accent") === accent) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  };

  // Set initial accent
  setAccent(activeAccent);

  accentDots.forEach(dot => {
    dot.addEventListener("click", () => {
      const targetAccent = dot.getAttribute("data-accent");
      setAccent(targetAccent);
      window.logConsoleEvent("SYS", `Color preset accent updated to: ${targetAccent.toUpperCase()}`);
    });
  });
}

/* ============================================================
   3. SPA TAB ROUTING
   ============================================================ */
function initTabRouting() {
  const navButtons = document.querySelectorAll(".nav-btn");
  const panelViews = document.querySelectorAll(".panel-view");
  const headerTitle = document.getElementById("header-panel-title");

  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      if (!targetTab) return;

      // Update Nav Buttons active state
      navButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // Update Views active state
      panelViews.forEach(view => {
        if (view.id === `panel-${targetTab}`) {
          view.classList.add("active");
        } else {
          view.classList.remove("active");
        }
      });

      // Update Top Header Banner title
      let panelName = "Overview";
      if (targetTab === "projects") panelName = "Projects Explorer";
      if (targetTab === "experience") panelName = "Experience Logs";
      if (targetTab === "skills") panelName = "Skills Matrix";
      if (targetTab === "contact") panelName = "Contact Portal & Shell";

      if (headerTitle) {
        headerTitle.textContent = `System Panel // ${panelName}`;
      }

      // Auto-close mobile drawer menu upon selecting a tab
      if (window.closeMobileMenu && window.innerWidth <= 850) {
        window.closeMobileMenu();
      }

      window.logConsoleEvent("SYS", `Active workspace panel switched to: ${targetTab.toUpperCase()}`);
    });
  });

  // Handle back triggers or other nav link redirects (e.g. view projects button in overview)
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-go-tab]");
    if (trigger) {
      e.preventDefault();
      const tabName = trigger.getAttribute("data-go-tab");
      const navBtn = document.querySelector(`.nav-btn[data-tab="${tabName}"]`);
      if (navBtn) navBtn.click();
    }
  });
}

/* ============================================================
   3.5. MOBILE SLIDE-OUT DRAWER MENU
   ============================================================ */
function initMobileMenu() {
  const toggleBtn = document.getElementById("mobile-menu-toggle");
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  const closeBtn = document.getElementById("sidebar-close-btn");
  const mainContent = document.querySelector(".main-content");

  if (!toggleBtn || !sidebar || !backdrop) return;

  const openMenu = () => {
    sidebar.classList.add("open");
    backdrop.classList.add("open");
    toggleBtn.setAttribute("aria-expanded", "true");
    if (mainContent && window.innerWidth <= 850) {
      mainContent.inert = true;
    }
    window.logConsoleEvent("SYS", "Mobile navigation menu drawer opened.");
  };

  const closeMenu = () => {
    sidebar.classList.remove("open");
    backdrop.classList.remove("open");
    toggleBtn.setAttribute("aria-expanded", "false");
    if (mainContent) {
      mainContent.inert = false;
    }
    window.logConsoleEvent("SYS", "Mobile navigation menu drawer closed.");
  };

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (sidebar.classList.contains("open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeMenu);
  }

  backdrop.addEventListener("click", closeMenu);

  // Close menu on ESC key press
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("open")) {
      closeMenu();
    }
  });

  // Handle screen resize: clean up drawer states when transitioning to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 850) {
      if (sidebar.classList.contains("open")) {
        closeMenu();
      } else if (mainContent && mainContent.inert) {
        mainContent.inert = false;
      }
    }
  });

  // Expose closeMenu globally so other parts of main.js can use it
  window.closeMobileMenu = closeMenu;
}

/* ============================================================
   4. SYSTEM CLOCK LOOP
   ============================================================ */
function initClockLoop() {
  const clockEl = document.getElementById("sidebar-time");
  if (!clockEl) return;

  const updateClock = () => {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  updateClock();
  setInterval(updateClock, 1000);
}

/* ============================================================
   5. PROJECTS EXPLORER (FILTERING, SEARCH & CASE STUDIES)
   ============================================================ */
function initProjectExplorer() {
  const grid = document.getElementById("project-dashboard-grid");
  const searchInput = document.getElementById("project-search-input");
  const filterChips = document.querySelectorAll("#tech-filter-chips .filter-chip");
  const dialog = document.getElementById("case-study-slideover");
  const dialogBody = document.getElementById("case-study-body");

  if (!grid) return;

  // A. Render cards
  const renderCards = () => {
    // PROJECTS array comes from projects.js
    if (typeof PROJECTS === "undefined") {
      grid.innerHTML = `<p style='grid-column: 1/-1;'>Database connection failed. Projects array undefined.</p>`;
      return;
    }

    grid.innerHTML = PROJECTS.map((proj, idx) => {
      const metrics = (proj.metrics || [])
        .map(m => `
          <div class="project-metric-item">
            <span class="project-metric-value">${m.value}</span>
            <span class="project-metric-label">${m.label}</span>
          </div>
        `).join("");

      const tags = (proj.tags || [])
        .map(t => `<span class="project-tag-chip">${t}</span>`)
        .join("");

      const statusBadge = proj.status ? `<span class="project-status-badge">${proj.status}</span>` : "";

      const inner = `
        <div class="project-card-header">
          <h3 class="project-card-title">${proj.title}</h3>
          ${statusBadge}
        </div>
        <p class="project-card-headline">${proj.headline}</p>
        <div class="project-card-metrics">
          ${metrics}
        </div>
        <div class="project-card-tags">
          ${tags}
        </div>
        <div class="project-card-footer">
          ${proj.page ? `<span class="project-action-link">Explore case study <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>` : `<span class="project-action-link" style="opacity:0.5;cursor:default;">Local Project</span>`}
          ${proj.github ? `<a class="project-repo-link" href="${proj.github}" target="_blank" rel="noopener" aria-label="GitHub Repository" onclick="event.stopPropagation();">
            <svg viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>
          </a>` : ""}
        </div>
      `;

      return `
        <article class="dashboard-project-card" data-index="${idx}" data-tags='${JSON.stringify(proj.tags || [])}' tabindex="0">
          ${inner}
        </article>
      `;
    }).join("");
  };

  renderCards();

  // B. Filtering logic
  let activeTag = "all";
  let activeQuery = "";

  const applyFilters = () => {
    const cards = grid.querySelectorAll(".dashboard-project-card");
    let matchCount = 0;

    cards.forEach(card => {
      const idx = card.getAttribute("data-index");
      const proj = PROJECTS[idx];
      const tags = JSON.parse(card.getAttribute("data-tags"));
      
      const textToSearch = `${proj.title} ${proj.headline} ${tags.join(" ")}`.toLowerCase();
      const matchesQuery = textToSearch.includes(activeQuery.toLowerCase());
      
      let matchesTag = false;
      if (activeTag === "all") {
        matchesTag = true;
      } else if (activeTag === "Python") {
        matchesTag = tags.includes("Python");
      } else if (activeTag === "PyTorch") {
        matchesTag = tags.includes("PyTorch") || tags.includes("PyTorch Geometric Temporal");
      } else if (activeTag === "Optimization") {
        matchesTag = tags.includes("SCIP (PySCIPopt)") || tags.includes("Column Generation") || tags.includes("MIP");
      } else if (activeTag === "Web") {
        matchesTag = tags.includes("TypeScript") || tags.includes("Supabase") || tags.includes("WebSockets");
      }

      if (matchesQuery && matchesTag) {
        card.style.display = "flex";
        matchCount++;
      } else {
        card.style.display = "none";
      }
    });

    window.logConsoleEvent("DATA", `Projects search query: "${activeQuery}", tag: "${activeTag.toUpperCase()}". Matches: ${matchCount}/${cards.length}`);
  };

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      activeQuery = e.target.value;
      applyFilters();
    });
  }

  filterChips.forEach(chip => {
    chip.addEventListener("click", () => {
      filterChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      activeTag = chip.getAttribute("data-filter");
      applyFilters();
    });
  });

  // C. Dynamic AJAX Case Study Injection
  const loadCaseStudy = async (url) => {
    if (!dialogBody || !dialog) return;
    
    dialogBody.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:300px; gap:16px;">
        <span class="sys-heartbeat" style="width:24px; height:24px;"></span>
        <p style="font-family:var(--font-mono); font-size:0.85rem; color:var(--text-muted)">Connecting gateway... Fetching case study segments...</p>
      </div>
    `;

    dialog.showModal();
    window.logConsoleEvent("SYS", `Initiating secure fetch request for case study: ${url}`);

    try {
      // Since pages are in projects/ folder (e.g. projects/eurowings.html), we fetch relative to site root
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const htmlText = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, "text/html");
      
      // Standalone files contain case study text inside <main class="mac-window case container"> .mac-content
      const contentSource = doc.querySelector(".mac-content") || doc.querySelector("main") || doc.body;
      
      // Strip out navigation links that make no sense inside the overlay (like "back to projects")
      const backLinks = contentSource.querySelectorAll(".back, .case-nav");
      backLinks.forEach(el => el.remove());

      // Inject case study structure
      dialogBody.innerHTML = `<div class="case-study-content">${contentSource.innerHTML}</div>`;
      window.logConsoleEvent("DATA", `Asynchronously loaded case study segments: ${url} (${htmlText.length} bytes processed)`);

    } catch (err) {
      console.error(err);
      dialogBody.innerHTML = `
        <div style="padding: 40px 20px; text-align:center;">
          <h3 style="color:var(--accent); font-family:var(--font-heading); margin-bottom:12px;">Fetch Operation Failed</h3>
          <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:20px;">Could not connect to target content. Standalone case study page may be missing or server has rejected the request.</p>
          <code style="display:block; max-width:100%; word-break:break-all; padding:10px; background-color:var(--bg-base); border:1px solid var(--border-color);">${err.message}</code>
        </div>
      `;
      window.logConsoleEvent("SYS", `[ERROR] Failed to fetch case study node: ${err.message}`);
    }
  };

  // Click handler on project cards
  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".dashboard-project-card");
    if (!card) return;

    // Check if clicked element was a hyperlink (e.g. GitHub icon link) - if so, let it act normally
    if (e.target.closest("a")) return;

    const idx = card.getAttribute("data-index");
    const proj = PROJECTS[idx];

    if (proj && proj.page) {
      loadCaseStudy(proj.page);
    } else {
      window.logConsoleEvent("SYS", `Selected project "${proj.title}" does not contain separate case studies.`);
    }
  });

  // Keyboard navigation click handler
  grid.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const card = e.target.closest(".dashboard-project-card");
      if (card) card.click();
    }
  });

  // Light dismiss fallback selector for older browsers (from modern-web-guidance)
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isDialogContent = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
      if (isDialogContent) return;
      dialog.close();
      window.logConsoleEvent("SYS", "Modal dismissed via backdrop click (fallback).");
    });
  }
}

/* ============================================================
   6. CONTACT TAB PORTAL & TERMINAL SHELL
   ============================================================ */
function initInteractiveTerminal() {
  const terminalInput = document.getElementById("interactive-terminal-input");
  const terminalBody = document.getElementById("interactive-terminal-body");

  if (!terminalInput || !terminalBody) return;

  const appendTerminalLine = (text, type = "") => {
    const line = document.createElement("div");
    line.className = `terminal-line ${type}`;
    line.textContent = text;
    terminalBody.appendChild(line);
    terminalBody.scrollTop = terminalBody.scrollHeight;
  };

  const commandRegistry = {
    "/help": () => {
      appendTerminalLine("Available interactive command directives:");
      appendTerminalLine("  /projects      List all featured projects & navigate");
      appendTerminalLine("  /experience    List professional positions & navigate");
      appendTerminalLine("  /skills        List top technical skill matrix & navigate");
      appendTerminalLine("  /contact       Print contact routes & focus text input");
      appendTerminalLine("  /theme         Toggle between light and dark interface themes");
      appendTerminalLine("  /accent <val>  Update color accent (emerald / indigo / amber)");
      appendTerminalLine("  /weather       Retrieve real-time mock meteorology for Aachen, DE");
      appendTerminalLine("  /clear         Flush console buffer lines");
      appendTerminalLine("  /linkedin      Launch LinkedIn profile in new browser tab");
      appendTerminalLine("  /github        Launch GitHub code profile in new browser tab");
    },
    "/projects": () => {
      appendTerminalLine("Querying projects catalog... 4 records retrieved:", "success");
      if (typeof PROJECTS !== "undefined") {
        PROJECTS.forEach(p => {
          appendTerminalLine(` -> [${p.title}] - ${p.headline.slice(0, 50)}...`);
        });
      }
      // Navigate Tab
      const btn = document.querySelector('.nav-btn[data-tab="projects"]');
      if (btn) btn.click();
    },
    "/experience": () => {
      appendTerminalLine("Accessing corporate experience logs...", "success");
      appendTerminalLine(" -> RWTH Aachen University (2025 - expected Sep 2027)");
      appendTerminalLine(" -> Publicis Sapient - Associate Technology L1 (2022 - 2024)");
      appendTerminalLine(" -> Publicis Sapient - Junior Associate Technology (2021 - 2022)");
      const btn = document.querySelector('.nav-btn[data-tab="experience"]');
      if (btn) btn.click();
    },
    "/skills": () => {
      appendTerminalLine("Retrieving skills coefficient scores...", "success");
      appendTerminalLine(" -> ML & AI: PyTorch, Graph Neural Nets, LLMs, LangGraph");
      appendTerminalLine(" -> Optimization: MIP/LP Formulation, SCIP, Gurobi, Column Gen");
      appendTerminalLine(" -> Programming: Python, pandas, C++, SQL, Java");
      const btn = document.querySelector('.nav-btn[data-tab="skills"]');
      if (btn) btn.click();
    },
    "/contact": () => {
      appendTerminalLine("Contact Coordinates:", "success");
      appendTerminalLine(" -> Channel: Please use the message form on this page.");
      appendTerminalLine(" -> Location: Aachen, North Rhine-Westphalia, Germany");
      appendTerminalLine("Locating entry fields... Form active.", "system");
      
      const formName = document.getElementById("contact-name");
      if (formName) formName.focus();
    },
    "/clear": () => {
      terminalBody.innerHTML = "";
    },
    "/weather": () => {
      appendTerminalLine("Querying Aachen weather API...", "system");
      setTimeout(() => {
        appendTerminalLine("Current Aachen Meteorology: 14°C, light rain drizzle, wind 12 km/h NW. Typically Aachen.", "success");
      }, 300);
    },
    "/theme": () => {
      const themeBtn = document.getElementById("theme-toggle-btn");
      if (themeBtn) themeBtn.click();
      appendTerminalLine("System theme settings updated successfully.", "success");
    },
    "/accent": (args) => {
      const target = args[0] ? args[0].toLowerCase() : "";
      if (["emerald", "indigo", "amber"].includes(target)) {
        const dot = document.querySelector(`.accent-dot[data-accent="${target}"]`);
        if (dot) dot.click();
        appendTerminalLine(`Workspace accent set to: ${target.toUpperCase()}`, "success");
      } else {
        appendTerminalLine("Invalid parameter. Try: /accent emerald | indigo | amber", "system");
      }
    },
    "/linkedin": () => {
      appendTerminalLine("Opening LinkedIn profile...", "success");
      window.open("https://linkedin.com/in/harjasdeep14", "_blank");
    },
    "/github": () => {
      appendTerminalLine("Opening GitHub profile...", "success");
      window.open("https://github.com/HARDY1499", "_blank");
    }
  };

  terminalInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const rawVal = terminalInput.value.trim();
      terminalInput.value = "";
      if (!rawVal) return;

      appendTerminalLine(`harjasdeep$ ${rawVal}`);
      
      const parts = rawVal.split(/\s+/);
      const cmd = parts[0];
      const args = parts.slice(1);

      window.logConsoleEvent("ACTION", `Terminal command executed: "${cmd}"`);

      if (commandRegistry[cmd]) {
        commandRegistry[cmd](args);
      } else {
        appendTerminalLine(`bash: command not found: ${cmd}. Type /help for assistance.`, "system");
      }
    }
  });

  // Handle contact form submit
  window.handleFormSubmit = async () => {
    const name = document.getElementById("contact-name").value;
    const email = document.getElementById("contact-email").value;
    const msg = document.getElementById("contact-message").value;
    const accessKey = document.getElementById("web3forms-access-key").value;

    appendTerminalLine(`Form submit request received from ${name}...`, "system");
    window.logConsoleEvent("ACTION", `Contact form query submitted by ${name} (${email})`);

    // Developer Mode simulation fallback if access key is not yet set
    if (accessKey === "YOUR_ACCESS_KEY_HERE" || !accessKey) {
      setTimeout(() => {
        appendTerminalLine("[DEV MODE] Web3Forms Access Key is set to default placeholder.", "system");
        appendTerminalLine("To enable real email forwarding, register at web3forms.com and paste your key in index.html.", "system");
        appendTerminalLine("Data packet simulated successfully!", "success");
        appendTerminalLine("Thank you for contacting me. I will reply shortly via your email.");
        document.getElementById("portfolio-contact-form").reset();
      }, 800);
      return;
    }

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          access_key: accessKey,
          name: name,
          email: email,
          message: msg,
          from_name: "Portfolio Command Center",
          subject: `New Message from ${name} via Portfolio`
        })
      });

      const result = await response.json();
      if (result.success) {
        appendTerminalLine("Data packet transmitted successfully!", "success");
        appendTerminalLine("Thank you for contacting me. I will reply shortly via your email.");
        document.getElementById("portfolio-contact-form").reset();
        window.logConsoleEvent("ACTION", "Email successfully forwarded to your account via Web3Forms.");
      } else {
        appendTerminalLine("Transmission failure: server rejected delivery key.", "system");
        window.logConsoleEvent("SYS", `[ERROR] Web3Forms submission failed: ${result.message}`);
      }
    } catch (err) {
      appendTerminalLine("Transmission failure: network offline or endpoint block.", "system");
      window.logConsoleEvent("SYS", `[ERROR] Network error during form submit: ${err.message}`);
    }
  };
}

/* ============================================================
   7. INTERACTIVE LOSS CURVE NODE CLICKS
   ============================================================ */
function initLossCurveWidget() {
  const dots = document.querySelectorAll(".chart-dot");
  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      const epoch = dot.getAttribute("data-epoch");
      const loss = dot.getAttribute("data-val");

      window.logConsoleEvent("DATA", `Loss node clicked. Model state Epoch: ${epoch}, Validation Loss (L1): ${loss}`);
      
      const termBody = document.getElementById("interactive-terminal-body");
      if (termBody) {
        const line = document.createElement("div");
        line.className = "terminal-line success";
        line.textContent = `[PLOT ANALYTICS] Epoch: ${epoch} || Loss value: ${loss}`;
        termBody.appendChild(line);
        termBody.scrollTop = termBody.scrollHeight;
      }
    });
  });
}
