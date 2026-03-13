document.addEventListener("DOMContentLoaded", () => {
  const revealEls = document.querySelectorAll("[data-reveal]");

  if (!("IntersectionObserver" in window) || revealEls.length === 0) {
    // Fallback: just show everything
    revealEls.forEach((el) => el.classList.add("reveal-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;

            // Optional stagger via data-reveal-delay (in ms)
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

  // Hero title per-letter cascade
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
});

