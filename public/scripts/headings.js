const escapeHTML = (text) =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const instances = new WeakMap();

// Home and inner pages share the same line masks, character rise and colour fill.
export function setupHeadingReveals(
  reduced,
  { root = document, selector = "h2.reveal,h3.reveal" } = {},
) {
  let disposed = false;
  let resizeTimer;
  const states = [];
  const timers = new Set();
  const animations = new Set();
  const later = (callback, delay) => {
    const timer = setTimeout(() => {
      timers.delete(timer);
      if (!disposed) callback();
    }, delay);
    timers.add(timer);
  };
  const headings = [...root.querySelectorAll(selector)];
  const restore = (state) => {
    state.observer?.disconnect();
    state.element.innerHTML = state.html;
    for (const [name, value] of state.attributes) {
      if (value === null) state.element.removeAttribute(name);
      else state.element.setAttribute(name, value);
    }
  };
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    clearTimeout(resizeTimer);
    window.removeEventListener("resize", resize);
    timers.forEach(clearTimeout);
    animations.forEach((animation) => animation.cancel());
    states.forEach((state) => {
      restore(state);
      if (instances.get(state.element) === cleanup)
        instances.delete(state.element);
    });
  };
  const build = (state, revealed = false) => {
    const { element, html, scrollFill } = state;
    element.innerHTML = html
      .split(/<br\s*\/?\s*>/i)
      .map((line) =>
        line
          .trim()
          .split(/\s+/)
          .map((word) => `<span class="heading-probe">${word}</span>`)
          .join(" "),
      )
      .join("<br>");
    element.classList.add("heading-reveal");
    element.classList.remove("reveal");
    const groups = [];
    for (const word of element.querySelectorAll(".heading-probe")) {
      let line = groups.find(
        (group) => Math.abs(group.top - word.offsetTop) < 2,
      );
      if (!line) {
        line = { top: word.offsetTop, words: [] };
        groups.push(line);
      }
      line.words.push(word.textContent);
    }
    const lines = groups.map((group) => group.words.join(" "));
    if (scrollFill) {
      element.innerHTML = lines
        .map(
          (line) => `<span class="scroll-fill-line">${escapeHTML(line)}</span>`,
        )
        .join("");
      element.classList.add("scroll-fill-heading");
      return;
    }
    element.innerHTML = lines
      .map(
        (line) =>
          `<span class="rise-line"><span class="rise-line-inner${revealed ? " rise-fill" : ""}">${revealed ? escapeHTML(line) : [...line].map((character) => (character === " " ? " " : `<span class="rise-char">${escapeHTML(character)}</span>`)).join("")}</span></span>`,
      )
      .join("");
    element.setAttribute("aria-label", lines.join(" "));
    element
      .querySelectorAll(".rise-line")
      .forEach((line) => line.setAttribute("aria-hidden", "true"));
    element.dataset.revealed = String(revealed);
  };
  const play = (state) => {
    const { element } = state;
    if (disposed || element.dataset.revealed === "true") return;
    element.dataset.revealed = "true";
    state.observer?.unobserve(element);
    const characters = [...element.querySelectorAll(".rise-char")];
    const gap = Math.min(25, 500 / Math.max(characters.length - 1, 1));
    for (const [index, character] of characters.entries()) {
      const animation = character.animate(
        [{ transform: "translateY(120%)" }, { transform: "translateY(0)" }],
        {
          duration: 600,
          delay: index * gap,
          easing: "cubic-bezier(.16,1,.3,1)",
          fill: "forwards",
        },
      );
      animations.add(animation);
    }
    later(
      () => {
        element.querySelectorAll(".rise-line-inner").forEach((line, index) => {
          line.textContent = line.textContent;
          line.classList.add("rise-fill");
          line.style.animationDelay = `${index * 100}ms`;
        });
        for (const animation of animations) {
          if (animation.playState === "finished") {
            animation.cancel();
            animations.delete(animation);
          }
        }
      },
      (characters.length - 1) * gap + 610,
    );
  };
  function resize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (disposed) return;
      for (const state of states)
        build(state, state.element.dataset.revealed === "true");
    }, 160);
  }
  Promise.resolve(document.fonts?.ready).then(() => {
    if (disposed) return;
    for (const element of headings) {
      instances.get(element)?.();
      const state = {
        element,
        html: element.innerHTML,
        attributes: ["class", "style", "aria-label", "data-revealed"].map(
          (name) => [name, element.getAttribute(name)],
        ),
        scrollFill: element.matches(".service-intro h2"),
      };
      states.push(state);
      instances.set(element, cleanup);
      if (reduced) {
        element.classList.add("visible");
        continue;
      }
      build(state);
      if (state.scrollFill) continue;
      state.observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) play(state);
        },
        { threshold: 0, rootMargin: "0px 0px -15% 0px" },
      );
      state.observer.observe(element);
    }
    if (!reduced) window.addEventListener("resize", resize);
  });
  return cleanup;
}
