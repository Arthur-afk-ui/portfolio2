/* Transições curtas de leitura; sem efeitos contínuos de mouse ou partículas. */
(() => {
  "use strict";
  const { $, $$, motion } = window.ArthurApp;
  const header = $("#header"),
    progress = $(".scroll-progress");
  let frame = 0;
  function paintScroll() {
    frame = 0;
    const top = Math.max(0, window.scrollY);
    const length = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${length > 0 ? Math.min(1, top / length) : 0})`;
    header.classList.toggle("scrolled", top > 15);
  }
  function scheduleScroll() {
    if (!frame) frame = requestAnimationFrame(paintScroll);
  }
  window.addEventListener("scroll", scheduleScroll, { passive: true });
  window.addEventListener("resize", scheduleScroll, { passive: true });
  paintScroll();
  let observer;
  function reveal() {
    observer?.disconnect();
    const elements = $$(".reveal");
    if (motion.matches || !("IntersectionObserver" in window)) {
      elements.forEach((el) => {
        el.classList.remove("pending");
        el.classList.add("visible");
      });
      return;
    }
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("pending");
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px 30px 0px" },
    );
    elements.forEach((el) => {
      if (!el.classList.contains("visible")) {
        el.classList.add("pending");
        observer.observe(el);
      }
    });
  }
  reveal();
  motion.addEventListener("change", reveal);
})();
