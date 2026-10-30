export function ContactHero() {
  return (
    <section
      className="inner-hero inner-hero--contact"
      aria-labelledby="contact-title"
    >
      <picture className="inner-hero__media">
        <source
          media="(max-width: 600px)"
          srcSet="/assets/cd172e50335c7303fe9e8ca85f952608dd0b0236-880x1592.jpg"
        />
        <img
          src="/assets/8234f422e53117f9ee574a826d50902f5e4272b5-2880x1800.jpg"
          alt="A performance vehicle in a dark studio"
          width="2880"
          height="1800"
          fetchPriority="high"
        />
      </picture>
      <div className="inner-hero__content inner-container">
        <p className="inner-kicker">Your Ideas. Our Attention To Detail.</p>
        <h1 id="contact-title">Begin Your Build</h1>
        <div className="inner-hero__lower">
          <p>Tell us about your vehicle and the build you have in mind.</p>
          <a
            className="button inner-secondary"
            href="#build-enquiry"
            data-focus-form
          >
            Begin A Build Enquiry
          </a>
        </div>
      </div>
    </section>
  );
}

export function BuildEnquiry() {
  return (
    <section
      className="contact-brief"
      id="build-enquiry"
      aria-labelledby="enquiry-title"
    >
      <div className="contact-brief__sticky inner-container">
        <figure className="contact-brief__visual">
          <img
            src="/assets/8234f422e53117f9ee574a826d50902f5e4272b5-2880x1800.jpg"
            alt=""
            width="2880"
            height="1800"
          />
        </figure>
        <div className="contact-brief__form">
          <div className="inner-section-head">
            <h2 id="enquiry-title">Shape The Brief</h2>
            <p>
              Share the vehicle, the direction and the details that matter to
              you.
            </p>
          </div>
          <form id="build-form" noValidate>
            <label htmlFor="build-name">Your Name</label>
            <input id="build-name" name="name" autoComplete="name" required />
            <label htmlFor="build-email">Email Address</label>
            <input
              id="build-email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
            <label htmlFor="build-vehicle">Your Vehicle</label>
            <input
              id="build-vehicle"
              name="vehicle"
              placeholder="Make, model and year"
              required
            />
            <label htmlFor="build-vision">Your Vision</label>
            <textarea
              id="build-vision"
              name="vision"
              rows="5"
              required
            ></textarea>
            <button className="button inner-primary" type="submit">
              Begin A Build Enquiry
            </button>
            <p className="form-note">
              This preview prepares a downloadable enquiry for your client. No
              information is sent.
            </p>
            <p
              className="form-status"
              id="build-form-status"
              aria-live="polite"
            ></p>
          </form>
        </div>
      </div>
    </section>
  );
}

export function ContactDetail() {
  return (
    <section
      className="contact-detail inner-container"
      aria-labelledby="contact-detail-title"
    >
      <figure data-reveal>
        <img
          src="/assets/1ebe90ab77d2912275ef15f9ba86fe2fea1f451f-2880x3600.jpg"
          alt="Hand-finished automotive upholstery detail"
          width="2880"
          height="3600"
          loading="lazy"
        />
      </figure>
      <h2 id="contact-detail-title" data-reveal>
        A Considered Approach To Every Detail
      </h2>
    </section>
  );
}
