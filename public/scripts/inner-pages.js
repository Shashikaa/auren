import { setupHeadingReveals } from "./headings.js";

/* Importing this module never touches the DOM. React owns setup and teardown. */
const activePages = new WeakMap();
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const ease = "cubic-bezier(.16,1,.3,1)";

/** Accept [data-motion-page] main or its .inner-page shell; return full cleanup.
 * Repeated setup replaces the previous instance. Media changes are internal.
 */
export function setupInnerPage(root) {
  const page = root?.matches?.("[data-motion-page]")
    ? root
    : root?.querySelector?.("[data-motion-page]");
  const shell = page?.closest(".inner-page");
  if (!page || !shell) return () => {};
  activePages.get(page)?.();
  const controller = new AbortController();
  const { signal } = controller;
  const on = (target, name, callback, options = {}) =>
    target?.addEventListener(name, callback, { ...options, signal });
  const find = (selector) => shell.querySelector(selector);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = matchMedia("(min-width: 1024px) and (min-height: 720px)");
  const timers = new Set();
  const urls = new Set();
  let disposed = false;
  let disposeMotion = () => {};
  const oldReady = page.getAttribute("data-motion-ready");
  const later = (callback, delay) => {
    const id = setTimeout(() => {
      timers.delete(id);
      if (!disposed) callback();
    }, delay);
    timers.add(id);
  };

  // Navigation stays scoped to this shell. Only body scroll-lock classes are shared.
  const menu = find("#menu");
  const toggle = find("#menu-toggle");
  let menuOpen = false;
  let returnFocus = null;
  const priorMenuInert = menu?.inert;
  const priorExpanded = toggle?.getAttribute("aria-expanded");
  const priorLocks = new Map(
    ["menu-open", "locked"].map((name) => [
      name,
      document.body.classList.contains(name),
    ]),
  );
  const focusable = (container) =>
    [
      ...container.querySelectorAll(
        'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),[tabindex="0"]',
      ),
    ].filter(
      (element) =>
        element.getClientRects().length && !element.closest("[inert]"),
    );
  const setMenu = (open, restoreFocus = true) => {
    if (!menu || !toggle || open === menuOpen) return;
    menuOpen = open;
    if (open) returnFocus = document.activeElement;
    for (const name of priorLocks.keys())
      document.body.classList.toggle(name, open || priorLocks.get(name));
    toggle.setAttribute("aria-expanded", String(open));
    menu.inert = !open;
    if (open) focusable(menu)[0]?.focus({ preventScroll: true });
    else if (restoreFocus && returnFocus?.isConnected)
      returnFocus.focus({ preventScroll: true });
  };
  on(toggle, "click", () => setMenu(!menuOpen));
  menu
    ?.querySelectorAll("a")
    .forEach((link) => on(link, "click", () => setMenu(false, false)));
  on(document, "keydown", (event) => {
    if (!menuOpen) return;
    if (event.key === "Escape") {
      event.preventDefault();
      setMenu(false);
    }
    if (event.key === "Tab") {
      const nodes = [toggle, ...focusable(menu)];
      const index = nodes.indexOf(document.activeElement);
      const next = event.shiftKey
        ? index <= 0
          ? nodes.length - 1
          : index - 1
        : (index + 1) % nodes.length;
      event.preventDefault();
      nodes[next]?.focus();
    }
  });
  on(document, "focusin", (event) => {
    if (menuOpen && !menu.contains(event.target) && event.target !== toggle)
      focusable(menu)[0]?.focus({ preventScroll: true });
  });

  shell.querySelectorAll("[data-focus-form]").forEach((link) =>
    on(link, "click", (event) => {
      const href = link.getAttribute("href");
      const target = href?.startsWith("#")
        ? find(`[id="${CSS.escape(href.slice(1))}"]`)
        : null;
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({
        behavior: reduced.matches ? "instant" : "smooth",
        block: "start",
      });
      later(
        () =>
          target
            .querySelector("input,textarea")
            ?.focus({ preventScroll: true }),
        reduced.matches ? 0 : 550,
      );
    }),
  );

  const form = find("#build-form");
  const status = find("#build-form-status");
  const invalidAttributes = new Map();
  if (form) {
    const fields = [...form.querySelectorAll("input,textarea")];
    fields.forEach((field) =>
      invalidAttributes.set(field, field.getAttribute("aria-invalid")),
    );
    on(form, "input", (event) => {
      if (event.target.matches("input,textarea"))
        event.target.setAttribute(
          "aria-invalid",
          String(!event.target.checkValidity()),
        );
    });
    on(form, "submit", (event) => {
      event.preventDefault();
      fields.forEach((field) =>
        field.setAttribute("aria-invalid", String(!field.checkValidity())),
      );
      const invalid = fields.find((field) => !field.checkValidity());
      if (invalid) {
        if (status)
          status.textContent =
            "Complete each field with a valid value before preparing the enquiry.";
        invalid.focus();
        return;
      }
      const data = new FormData(form);
      const text = [
        "Auren Automotive Build Enquiry",
        "",
        `Name: ${data.get("name")}`,
        `Email: ${data.get("email")}`,
        `Vehicle: ${data.get("vehicle")}`,
        "",
        "Vision:",
        String(data.get("vision")),
      ].join("\n");
      const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
      urls.add(url);
      const download = document.createElement("a");
      download.href = url;
      download.download = "auren-build-enquiry.txt";
      download.click();
      later(() => {
        URL.revokeObjectURL(url);
        urls.delete(url);
      }, 1000);
      if (status)
        status.textContent =
          "Your enquiry file is ready. No information was sent.";
    });
  }

  const privacy = find("#privacy-dialog");
  let privacyFocus = null;
  const openPrivacy = (event) => {
    setMenu(false, false);
    privacyFocus = event?.currentTarget || toggle;
    if (privacy && !privacy.open) privacy.showModal();
  };
  on(find("#privacy-open"), "click", openPrivacy);
  on(find("#cookie-settings"), "click", openPrivacy);
  on(privacy?.querySelector(".dialog-close"), "click", () => privacy.close());
  on(privacy, "close", () => {
    const target = privacyFocus?.closest("[inert]") ? toggle : privacyFocus;
    if (target?.isConnected) target.focus({ preventScroll: true });
  });
  on(find("#reset-preference"), "click", () => {
    try {
      localStorage.removeItem("auren-entrance");
    } catch {
      /* Storage can be disabled. */
    }
    privacy?.close();
  });

  // Media changes recreate just motion. Interaction listeners remain single-instance.
  const startMotion = () => {
    disposeMotion();
    if (disposed) return;
    const motionController = new AbortController();
    const motionSignal = motionController.signal;
    const styles = new Map();
    const animations = new Set();
    const observers = [];
    let frame = 0;
    let dirty = true;
    let stopped = false;
    const metrics = {};
    const animated = !reduced.matches;
    const pinned = animated && desktop.matches;
    const oldDesktopClass = shell.classList.contains("inner-motion-desktop");
    shell.classList.toggle("inner-motion-desktop", pinned);
    const write = (element, property, value) => {
      if (!element) return;
      if (!styles.has(element)) styles.set(element, new Map());
      const original = styles.get(element);
      if (!original.has(property))
        original.set(property, [
          element.style.getPropertyValue(property),
          element.style.getPropertyPriority(property),
        ]);
      if (element.style.getPropertyValue(property) !== value)
        element.style.setProperty(property, value);
    };
    const motionOn = (target, name, callback, options = {}) =>
      target?.addEventListener(name, callback, {
        ...options,
        signal: motionSignal,
      });
    const hero = page.querySelector(".inner-hero");
    const heroImage = hero?.querySelector(".inner-hero__media img");
    const heroContent = hero?.querySelector(".inner-hero__content");
    const stage = page.querySelector(".stock-stage");
    const vehicles = [...page.querySelectorAll(".stock-vehicle")];
    const film = page.querySelector(".build-film");
    const track = film?.querySelector(".build-film__track");
    const viewport = film?.querySelector(".build-film__viewport");
    const sticky = film?.querySelector(".build-film__sticky");
    const progress = find(".page-progress span");
    const images = [
      ...page.querySelectorAll(
        ".principle-card figure img,.build-approach__image img,.contact-brief__visual img,.contact-detail figure img,.inner-close>img",
      ),
    ];
    const documentTop = (element) =>
      element.getBoundingClientRect().top + window.scrollY;
    const request = () => {
      if (!stopped && !frame) frame = requestAnimationFrame(render);
    };
    const remeasure = () => {
      dirty = true;
      request();
    };
    const measure = () => {
      const height = window.innerHeight;
      if (pinned && film && track && viewport) {
        // Include actual flex gaps and both viewport gutters, not a guessed vw.
        const gutter = parseFloat(getComputedStyle(viewport).paddingLeft) || 0;
        const rightGutter =
          parseFloat(getComputedStyle(viewport).paddingRight) || 0;
        const travel = Math.max(
          0,
          track.scrollWidth - (viewport.clientWidth - gutter - rightGutter),
        );
        const distance = Math.max(travel, height * 0.9);
        write(film, "height", `${height + distance}px`);
        // A zoomed/oversized panel must remain accessible, never clipped in a pin.
        write(sticky, "height", "");
        write(sticky, "position", "");
        const contentHeight = sticky.scrollHeight;
        if (contentHeight > height + 2) {
          write(sticky, "height", `${contentHeight}px`);
          write(sticky, "position", "relative");
          write(viewport, "overflow-x", "auto");
          write(track, "transform", "none");
          write(film, "height", "auto");
          metrics.film = null;
        } else {
          write(viewport, "overflow-x", "");
          metrics.film = { top: documentTop(film), distance, travel };
        }
      }
      if (pinned && stage) {
        const distance = height * Math.max(1, vehicles.length - 1) * 0.85;
        write(stage, "height", `${height + distance}px`);
        metrics.stage = { top: documentTop(stage), distance };
      }
      metrics.height = height;
      metrics.max = Math.max(1, document.documentElement.scrollHeight - height);
      metrics.hero = hero
        ? { top: documentTop(hero), height: hero.offsetHeight }
        : null;
      metrics.images = pinned
        ? images.map((image) => {
            const container = image.parentElement;
            const driver = container.matches(
              ".contact-brief__visual,.build-approach__image",
            )
              ? container.closest("section")
              : container;
            return {
              image,
              top: documentTop(driver),
              height: driver.offsetHeight,
              amount: Math.min(54, container.offsetHeight * 0.065),
            };
          })
        : [];
      dirty = false;
    };
    function render() {
      frame = 0;
      if (stopped || !page.isConnected) return;
      if (dirty) measure();
      const y = window.scrollY;
      write(progress, "transform", `scaleX(${clamp(y / metrics.max)})`);
      if (!pinned) return;
      if (metrics.hero) {
        const p = clamp((y - metrics.hero.top) / metrics.hero.height);
        write(
          heroImage,
          "transform",
          `translate3d(0,${(p * 100).toFixed(3)}px,0) scale(1.12)`,
        );
        write(
          heroContent,
          "transform",
          `translate3d(0,${(-p * 70).toFixed(3)}px,0)`,
        );
        write(heroContent, "opacity", String(1 - clamp((p - 0.12) / 0.82)));
      }
      if (metrics.film) {
        const p = clamp((y - metrics.film.top) / metrics.film.distance);
        write(
          track,
          "transform",
          `translate3d(${(-metrics.film.travel * p).toFixed(3)}px,0,0)`,
        );
      }
      if (metrics.stage) {
        const p = clamp((y - metrics.stage.top) / metrics.stage.distance);
        const active = p * Math.max(1, vehicles.length - 1);
        vehicles.forEach((vehicle, i) => {
          const offset = i - active;
          const distance = Math.abs(offset);
          const prominence = (1 + Math.cos(Math.PI * clamp(distance))) / 2;
          write(
            vehicle,
            "transform",
            `translate3d(${(offset * 86).toFixed(3)}%,${((1 - prominence) * 26).toFixed(3)}px,0) scale(${(0.74 + prominence * 0.26).toFixed(4)})`,
          );
          write(
            vehicle,
            "opacity",
            String(
              (0.34 + prominence * 0.66) *
                (1 - clamp((distance - 1.15) / 0.55)),
            ),
          );
          write(vehicle, "z-index", String(Math.round(prominence * 100)));
        });
      }
      for (const item of metrics.images) {
        const p = clamp(
          (y + metrics.height - item.top) / (metrics.height + item.height),
        );
        write(
          item.image,
          "transform",
          `translate3d(0,${((p * 2 - 1) * item.amount).toFixed(3)}px,0) scale(1.15)`,
        );
      }
    }

    const cleanupHeadings = setupHeadingReveals(!animated, {
      root: page,
      selector: "h1,h2,h3",
    });

    // Copy and ledger reveals complement the shared title choreography.
    if (animated && typeof Element.prototype.animate === "function") {
      const targets = new Set(
        page.querySelectorAll(
          ".inner-kicker,.inner-hero__lower,.service-ledger>div",
        ),
      );
      page.querySelectorAll("[data-reveal]").forEach((element) => {
        if (
          !element.matches("h1,h2,h3,figure,.build-approach__image") &&
          !element.querySelector("h1,h2,h3")
        )
          targets.add(element);
        else
          element
            .querySelectorAll(":scope>p")
            .forEach((paragraph) => targets.add(paragraph));
      });
      // Never hide the enquiry form or its ancestors.
      const revealTargets = [...targets].filter(
        (element) => !element.closest(".contact-brief__form"),
      );
      const reveal = (element) => {
        if (stopped) return;
        write(element, "opacity", "1");
        const row = element.parentElement?.matches(".service-ledger")
          ? [...element.parentElement.children].indexOf(element)
          : 0;
        const animation = element.animate(
          [
            { opacity: 0, transform: `translate3d(0,28px,0)` },
            { opacity: 1, transform: "translate3d(0,0,0)" },
          ],
          { duration: 850, delay: row * 65, easing: ease, fill: "backwards" },
        );
        animations.add(animation);
        animation.onfinish = () => {
          animations.delete(animation);
          animation.cancel();
        };
      };
      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
          (entries) =>
            entries.forEach((entry) => {
              if (!entry.isIntersecting || stopped) return;
              reveal(entry.target);
              observer.unobserve(entry.target);
            }),
          { threshold: 0.08, rootMargin: "0px 0px -5% 0px" },
        );
        observers.push(observer);
        revealTargets.forEach((element) => {
          if (element.getBoundingClientRect().bottom < 0) return;
          write(element, "opacity", "0");
          observer.observe(element);
        });
        motionOn(page, "focusin", (event) => {
          for (const element of revealTargets)
            if (element === event.target || element.contains(event.target))
              write(element, "opacity", "1");
        });
      } else revealTargets.forEach(reveal);
    }
    motionOn(window, "scroll", request, { passive: true });
    motionOn(window, "resize", remeasure, { passive: true });
    motionOn(window, "orientationchange", remeasure, { passive: true });
    page.querySelectorAll("img").forEach((image) => {
      if (!image.complete) motionOn(image, "load", remeasure, { once: true });
    });
    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(remeasure);
      observers.push(observer);
      observer.observe(page);
      if (track) observer.observe(track);
      if (sticky) observer.observe(sticky);
    }
    document.fonts?.ready.then(() => {
      if (!stopped) remeasure();
    });
    render();
    disposeMotion = () => {
      if (stopped) return;
      stopped = true;
      motionController.abort();
      cleanupHeadings();
      cancelAnimationFrame(frame);
      observers.forEach((observer) => observer.disconnect());
      animations.forEach((animation) => {
        animation.onfinish = null;
        animation.cancel();
      });
      animations.clear();
      styles.forEach((properties, element) =>
        properties.forEach(([value, priority], property) => {
          if (value) element.style.setProperty(property, value, priority);
          else element.style.removeProperty(property);
        }),
      );
      shell.classList.toggle("inner-motion-desktop", oldDesktopClass);
    };
  };
  on(reduced, "change", startMotion);
  on(desktop, "change", startMotion);
  startMotion();
  page.dataset.motionReady = "true";
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    controller.abort();
    disposeMotion();
    timers.forEach(clearTimeout);
    urls.forEach((url) => URL.revokeObjectURL(url));
    setMenu(false, false);
    if (menu) menu.inert = priorMenuInert;
    if (toggle) {
      if (priorExpanded === null) toggle.removeAttribute("aria-expanded");
      else toggle.setAttribute("aria-expanded", priorExpanded);
    }
    if (privacy?.open) privacy.close();
    invalidAttributes.forEach((value, field) => {
      if (value === null) field.removeAttribute("aria-invalid");
      else field.setAttribute("aria-invalid", value);
    });
    if (oldReady === null) page.removeAttribute("data-motion-ready");
    else page.setAttribute("data-motion-ready", oldReady);
    if (activePages.get(page) === cleanup) activePages.delete(page);
  };
  activePages.set(page, cleanup);
  return cleanup;
}
