/* Mark JS as available — motion styles are gated behind html.js so the
   no-JS experience stays fully static and readable. */
document.documentElement.classList.add("js");

/* Theme toggle — persists in localStorage, defaults to system preference. */
(function () {
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = stored || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;
    const setIcon = () => {
      btn.textContent =
        document.documentElement.getAttribute("data-theme") === "dark" ? "☀" : "☾";
    };
    setIcon();
    btn.addEventListener("click", () => {
      const next =
        document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      setIcon();
    });
  });
})();

/* Scroll-reveal + metric count-up + active nav tracking.
   All skipped when the user prefers reduced motion. */
document.addEventListener("DOMContentLoaded", () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Reveal on scroll --- */
  const revealTargets = document.querySelectorAll(
    ".project-card, .xp-item, .skill-group, .contact-box, .case .fact, .case .callout"
  );
  revealTargets.forEach((el) => el.classList.add("reveal"));

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach((el) => el.classList.add("visible"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach((el) => io.observe(el));
  }

  /* --- Metric count-up (numbers animate from 0 once visible) --- */
  if (!reducedMotion && "IntersectionObserver" in window) {
    const counters = document.querySelectorAll(".metric b, .case .fact b");
    const countIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          countIO.unobserve(e.target);
          const el = e.target;
          const m = el.textContent.match(/^([\d,.]+)(.*)$/);
          if (!m) return; // non-numeric metrics (e.g. "3 / 6 / 12 h") stay as-is
          const target = parseFloat(m[1].replace(/,/g, ""));
          const suffix = m[2];
          const decimals = (m[1].split(".")[1] || "").replace(/,/g, "").length;
          if (!isFinite(target)) return;
          const t0 = performance.now();
          const dur = 900;
          const fmt = (v) =>
            v.toLocaleString("en-US", {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            });
          const tick = (t) => {
            const p = Math.min((t - t0) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = fmt(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => countIO.observe(el));
  }

  /* --- Active nav link tracking (landing page only) --- */
  const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  if (navLinks.length && "IntersectionObserver" in window) {
    const sections = navLinks
      .map((a) => document.getElementById(a.getAttribute("href").slice(1)))
      .filter(Boolean);
    const navIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          navLinks.forEach((a) =>
            a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id)
          );
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => navIO.observe(s));
  }
});
