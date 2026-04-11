/**
 * Loads `content/homepage.md`, reads YAML between the first pair of --- fences,
 * and applies values to elements marked with data-cms / data-cms-* attributes.
 * No build step and no npm dependencies — serve the site over HTTP so fetch() works.
 */

function parseFrontMatter(markdown) {
  const m = markdown.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
  if (!m) return {};
  return parseSimpleYaml(m[1]);
}

function parseSimpleYaml(src) {
  const lines = src.split(/\r?\n/);
  const out = {};
  let i = 0;
  let blockKey = null;
  const blockLines = [];

  const flushBlock = () => {
    if (blockKey === null) return;
    out[blockKey] = blockLines.join("\n").replace(/\n+$/, "");
    blockKey = null;
    blockLines.length = 0;
  };

  while (i < lines.length) {
    const raw = lines[i];
    const trimmedRight = raw.replace(/\s+$/, "");
    const trimmed = trimmedRight.trim();

    if (trimmed.startsWith("#")) {
      i += 1;
      continue;
    }

    if (blockKey !== null) {
      if (trimmed === "") {
        blockLines.push("");
        i += 1;
        continue;
      }
      const maybeNewKey = trimmed.match(/^([\w_]+):\s*(.*)$/);
      if (maybeNewKey && !/^\s/.test(raw)) {
        flushBlock();
        continue;
      }
      blockLines.push(raw.replace(/^\s+/, ""));
      i += 1;
      continue;
    }

    const blockStart = trimmedRight.match(/^([\w_]+):\s*\|-?\s*$/);
    if (blockStart) {
      flushBlock();
      blockKey = blockStart[1];
      i += 1;
      continue;
    }

    const kv = trimmedRight.match(/^([\w_]+):\s*(.*)$/);
    if (kv) {
      flushBlock();
      const k = kv[1];
      let v = kv[2];
      if (v.startsWith('"') && v.endsWith('"') && v.length >= 2) {
        v = v.slice(1, -1).replace(/\\"/g, '"');
      } else if (v.startsWith("'") && v.endsWith("'") && v.length >= 2) {
        v = v.slice(1, -1).replace(/\\'/g, "'");
      }
      out[k] = v;
    }
    i += 1;
  }

  flushBlock();
  return out;
}

function hasKey(data, key) {
  return Object.prototype.hasOwnProperty.call(data, key);
}

function applyCms(data) {
  if (!data || typeof data !== "object") return;

  if (hasKey(data, "site_page_title")) {
    const t = document.querySelector("title");
    const titleVal = String(data.site_page_title).trim();
    if (t && titleVal) t.textContent = titleVal;
  }

  document.querySelectorAll("[data-cms]").forEach((el) => {
    const key = el.dataset.cms;
    if (!key || !hasKey(data, key)) return;
    const raw = String(data[key]);
    // Empty CMS values must not wipe baked-in HTML (Decap can save blanks; live file may differ from repo).
    if (raw.trim() === "") return;
    el.textContent = raw;
  });

  document.querySelectorAll("[data-cms-src]").forEach((el) => {
    const key = el.dataset.cmsSrc;
    if (!key || !data[key]) return;
    el.setAttribute("src", String(data[key]));
  });

  document.querySelectorAll("[data-cms-alt]").forEach((el) => {
    const key = el.dataset.cmsAlt;
    if (!key || !hasKey(data, key)) return;
    el.setAttribute("alt", String(data[key]));
  });

  document.querySelectorAll("[data-cms-poster]").forEach((el) => {
    const key = el.dataset.cmsPoster;
    if (!key || !data[key]) return;
    el.setAttribute("poster", String(data[key]));
  });

  document.querySelectorAll("[data-cms-href]").forEach((el) => {
    const key = el.dataset.cmsHref;
    if (!key || !hasKey(data, key)) return;
    el.setAttribute("href", String(data[key]));
  });

  document.querySelectorAll("[data-cms-aria-label]").forEach((el) => {
    const key = el.dataset.cmsAriaLabel;
    if (!key || !hasKey(data, key)) return;
    el.setAttribute("aria-label", String(data[key]));
  });
}

async function loadHomepageCms() {
  try {
    const res = await fetch("content/homepage.md", { cache: "no-store" });
    if (!res.ok) return;
    const text = await res.text();
    const data = parseFrontMatter(text);
    applyCms(data);
  } catch {
    /* keep baked-in HTML */
  }
}

function initRevealAndHero() {
  const revealEls = document.querySelectorAll("[data-reveal]");

  if (!("IntersectionObserver" in window) || revealEls.length === 0) {
    revealEls.forEach((el) => el.classList.add("reveal-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.dataset.revealDelay;
            if (delay) {
              el.style.transitionDelay = `${parseInt(delay, 10)}ms`;
            }
            el.classList.add("reveal-visible");
            observer.unobserve(el);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -12% 0px",
      }
    );

    revealEls.forEach((el) => observer.observe(el));
  }

  const heroTitle = document.querySelector(".hero-text h1");
  if (heroTitle && !heroTitle.dataset.split) {
    const text = heroTitle.textContent || "";
    const frag = document.createDocumentFragment();
    let index = 0;
    for (const char of text) {
      if (char === " ") {
        frag.appendChild(document.createTextNode(" "));
        continue;
      }
      const span = document.createElement("span");
      span.textContent = char;
      span.className = "hero-char";
      span.style.setProperty("--char-index", index.toString());
      frag.appendChild(span);
      index += 1;
    }
    heroTitle.textContent = "";
    heroTitle.appendChild(frag);
    heroTitle.dataset.split = "true";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadHomepageCms();
  initRevealAndHero();
});
