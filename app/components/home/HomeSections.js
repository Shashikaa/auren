export function HeroSection() {
  return (
    <section className="hero-track" id="home">
      <div className="hero-sticky">
        <div className="hero-scene">
          <img
            className="hero-fallback"
            src="assets/hero-poster.jpg"
            alt="Mercedes G-Wagen, Porsche GT3 RS and Land Rover Defender"
          />
          <canvas id="hero-depth" aria-hidden="true"></canvas>
          <video
            id="hero-video"
            muted
            playsInline
            preload="auto"
            aria-label="Cinematic reveal of three bespoke cars"
          >
            <source
              media="(max-width: 1023px)"
              src="assets/hero-mobile.mp4"
              type="video/mp4"
            />
            <source src="assets/hero.mp4" type="video/mp4" />
          </video>
          <video
            id="intro-video"
            muted
            playsInline
            preload="auto"
            aria-label="Scroll controlled camera move into the Porsche"
          >
            <source
              media="(max-width: 1023px)"
              src="assets/intro-mobile.mp4"
              type="video/mp4"
            />
            <source src="assets/intro.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="hero-title">
          <h1>
            Crafted For Those
            <br />
            Who Expect More
          </h1>
          <p>
            Individual design. Precision workmanship.
            <br />A driving experience that is yours alone.
          </p>
        </div>
        <div className="intro-carbon" aria-hidden="true"></div>
        <div className="intro-heading">
          <h2>
            More Than A Vehicle
            <br />
            An Expression Of You
          </h2>
        </div>
        <div className="image-trail" aria-hidden="true"></div>
        <div className="aperture" id="approach-aperture">
          <img
            src="assets/1ebe90ab77d2912275ef15f9ba86fe2fea1f451f-2880x3600.jpg"
            alt="Hands meticulously stitching red leather"
          />
          <h2>
            A Considered Approach
            <br />
            To Every Detail
          </h2>
          <div className="approach-intro" id="approach">
            <div className="logo-marquee">
              <div className="logo-belt"></div>
            </div>
            <p className="statement">
              Your ideas guide the process. We bring materials, proportions and
              finishing details together in one clear vision.
            </p>
            <a className="button" href="#contact">
              Begin Your Build <span>↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PrinciplesSection() {
  return (
    <section className="principles" aria-label="Our principles">
      <div className="principle-images"></div>
      <div className="principle-copy"></div>
    </section>
  );
}

export function ServiceIntroSection() {
  return (
    <section className="service-intro">
      <div className="detail-photo">
        <div className="detail-photo-frame">
          <img
            src="assets/9c69426f1711db9bc458b27925b9ac7e0d81d0aa-540x960.jpg"
            alt="Automotive craftsmanship close up"
            loading="lazy"
          />
        </div>
      </div>
      <h2 className="reveal">
        Distinctive by design.
        <br />
        Personal in every detail.
        <br />
        From the first sketch
        <br />
        to the final finish.
      </h2>
      <div className="service-intro-copy">
        <p className="reveal">
          Explore exterior design, cabin craftsmanship and carefully selected
          upgrades. Every part is considered alongside the whole, creating a
          vehicle that feels complete.
        </p>
        <a className="button reveal" href="#contact">
          Begin Your Build <span>↗</span>
        </a>
      </div>
    </section>
  );
}

export function ServicesSection() {
  return (
    <section
      className="services"
      id="services"
      aria-label="Our services"
    ></section>
  );
}

export function OrdinarySection() {
  return (
    <section className="ordinary-track">
      <div className="ordinary-background" aria-hidden="true">
        <div className="ordinary-pattern"></div>
      </div>
      <div className="ordinary-sticky">
        <div className="ordinary-word">Convention</div>
        <div className="top-cars">
          <img
            src="assets/9e787594ef2847dbc40ccfad10a2d216286d948b-708x1402.png"
            alt="Mercedes G-Wagen from above"
          />
          <img
            src="assets/682e73d1b2acb4f13627274e87a4177e916e71ac-708x1402.png"
            alt="Porsche GT3 RS from above"
          />
          <img
            src="assets/ba98741cf2c606538db469ad0ae866ba4a03829e-707x1402.png"
            alt="Land Rover Defender from above"
          />
        </div>
        <div className="ends-here">
          <h2>Stops Here</h2>
          <p>
            New perspectives on familiar silhouettes.
            <br />
            Built to reflect the person behind the wheel.
          </p>
        </div>
      </div>
    </section>
  );
}

export function CollectionSection({
  id,
  imageClass,
  title,
  description,
  buttonLabel,
}) {
  return (
    <section className="collection" id={id}>
      <div className={`collection-image ${imageClass}`}></div>
      <div className="collection-copy">
        <h2 className="reveal">{title}</h2>
        <p className="reveal">{description}</p>
        <button className="button reveal" data-open-collection={id}>
          {buttonLabel + " "}
          <span>↗</span>
        </button>
      </div>
    </section>
  );
}

export function FinalCtaSection() {
  return (
    <section className="final-cta" id="contact">
      <div className="final-scene">
        <img
          className="final-photo"
          src="assets/8234f422e53117f9ee574a826d50902f5e4272b5-2880x1800.jpg"
          alt="Three bespoke vehicles in a dark studio"
        />
        <canvas id="footer-depth" aria-hidden="true"></canvas>
      </div>
      <div className="final-copy">
        <p className="micro reveal">Your next chapter</p>
        <h2 className="reveal">
          Make It
          <br />
          Yours
        </h2>
        <button className="button reveal" id="contact-open">
          Begin Your Build <span>↗</span>
        </button>
      </div>
      <button className="back-top">Back to Top ↑</button>
    </section>
  );
}
