export function setupButtonHovers(reduced) {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) =>
        e.target.style.setProperty(
          "--button-play",
          e.isIntersecting && !reduced ? "running" : "paused",
        ),
      ),
    { threshold: 0 },
  );
  const decorate = (button) => {
    if (button.dataset.rollingButton) return;
    const label = button.textContent
      .replace(/[↗↑]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    button.dataset.rollingButton = "true";
    button.setAttribute("aria-label", label);
    const text = document.createElement("span");
    text.className = "button-label";
    text.setAttribute("aria-hidden", "true");
    [...label].forEach((c, i) => {
      const char = document.createElement("span");
      char.className = "button-char";
      char.textContent = c === " " ? "\u00a0" : c;
      char.style.transitionDelay = `${i * 0.02}s`;
      text.append(char);
    });
    button.replaceChildren(text);
    if (button.classList.contains("button")) {
      const shine = document.createElement("i");
      shine.className = "button-shine";
      shine.setAttribute("aria-hidden", "true");
      button.append(shine);
      observer.observe(button);
    }
  };
  const scan = (root) => {
    if (root.matches?.(".button,.entrance-actions button,.back-top"))
      decorate(root);
    root
      .querySelectorAll?.(".button,.entrance-actions button,.back-top")
      .forEach(decorate);
  };
  scan(document);
  new MutationObserver((records) =>
    records.forEach((r) =>
      r.addedNodes.forEach((n) => {
        if (n.nodeType === 1) scan(n);
      }),
    ),
  ).observe(document.body, { childList: true, subtree: true });
}
