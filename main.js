document.addEventListener("DOMContentLoaded", () => {
  const revealEls = document.querySelectorAll("[data-reveal]");

  if (!("IntersectionObserver" in window) || revealEls.length === 0) {
    // Fallback: just show everything
    revealEls.forEach((el) => el.classList.add("reveal-visible"));
    return;
  }

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
});

