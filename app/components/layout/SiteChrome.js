export function SkipLink() {
  return (
    <a className="skip" href="#main">
      Skip to content
    </a>
  );
}

export function SiteHeader() {
  return (
    <header>
      <div className="socials">
        <a href="/contact" aria-label="Contact Auren">
          in
        </a>
        <a href="/contact" aria-label="Explore Auren">
          <svg viewBox="0 0 24 24">
            <rect x="4" y="4" width="16" height="16" rx="4" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.3" cy="6.8" r=".6" />
          </svg>
        </a>
        <a href="/contact" aria-label="Begin a conversation">
          f
        </a>
      </div>
      <a className="brand" href="/#home" aria-label="Auren home">
        <img src="/assets/auren.svg" alt="Auren" />
      </a>
      <button id="menu-toggle" aria-expanded="false" aria-controls="menu">
        Navigate{" "}
        <span className="hamburger">
          <i></i>
          <i></i>
          <i></i>
        </span>
      </button>
    </header>
  );
}

export function Entrance() {
  return (
    <div
      className="entrance"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Auren Automotive"
    >
      <img className="entrance-logo" src="/assets/auren.svg" alt="Auren" />
      <p className="micro entrance-message">
        Individual vision. Exceptional execution.
        <br />
        Automotive craftsmanship, shaped around you.
      </p>
      <div className="entrance-bottom">
        <div className="entrance-actions">
          <button data-enter="accept">Accept &amp; Enter</button>
          <button data-enter="reject">Reject &amp; Enter</button>
        </div>
        <p>
          Choose how to enter the experience.
          <br />
          Your preference is remembered on this device.
        </p>
      </div>
    </div>
  );
}

export function MainNavigation() {
  return (
    <nav id="menu" aria-label="Main navigation" inert>
      <div className="menu-links">
        <a href="/#home">
          Home <small>01</small>
        </a>
        <a href="/#approach">
          Our Approach <small>02</small>
        </a>
        <a href="/#services">
          Services <small>03</small>
        </a>
        <a href="/builds">
          Builds <small>04</small>
        </a>
        <a href="/stock">
          Stock <small>05</small>
        </a>
        <a href="/contact">
          Contact <small>06</small>
        </a>
      </div>
      <div className="menu-bottom">
        <p className="micro">
          Auren Automotive.
          <br />
          Crafted around you.
        </p>
        <button id="cookie-settings">Cookie preferences</button>
      </div>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <img src="/assets/auren.svg" alt="Auren" />
      <nav aria-label="Footer">
        <a href="/#home">Home</a>
        <a href="/builds">Builds</a>
        <a href="/stock">Stock</a>
        <a href="/contact">Contact</a>
        <button id="privacy-open">Privacy</button>
      </nav>
      <p className="micro">
        Auren Automotive.
        <br />
        Individual vision. Exceptional execution.
      </p>
      <small>© Auren Automotive. Crafted around you.</small>
    </footer>
  );
}

export function PageProgress() {
  return (
    <div className="page-progress" aria-hidden="true">
      <span></span>
    </div>
  );
}
