import { vehicles, services } from "../../data/collections";

export function BuildsHero() {
  return (
    <section
      className="inner-hero inner-hero--builds"
      aria-labelledby="builds-title"
    >
      <picture className="inner-hero__media">
        <source
          media="(max-width: 600px)"
          srcSet="/assets/6cfdfe75afaf67d53f391484d666b2fc7a2060cd-1520x2688.png"
        />
        <img
          src="/assets/35c93330a1cd16aa426b7bded4ad225113f7b6db-3840x2160.png"
          alt="Close detail of red bodywork and an illuminated headlight"
          width="3840"
          height="2160"
          fetchPriority="high"
        />
      </picture>
      <div className="inner-hero__content inner-container">
        <h1 id="builds-title">Selected Commissions</h1>
        <div className="inner-hero__lower">
          <p>
            Explore individual projects, each shaped by a different brief and a
            shared attention to detail.
          </p>
          <a className="button inner-primary" href="/contact">
            Begin A Build Enquiry
          </a>
        </div>
      </div>
    </section>
  );
}

export function CommissionsGallery() {
  return (
    <section className="build-film" aria-labelledby="build-film-title">
      <div className="build-film__sticky">
        <div className="build-film__heading inner-container" data-reveal>
          <h2 id="build-film-title">Different Briefs. One Standard.</h2>
          <p>Individual design, from the first sketch to the final finish.</p>
        </div>
        <div className="build-film__viewport">
          <div className="build-film__track">
            {vehicles.map((commission) => (
              <figure className="build-frame" key={commission.name}>
                <img src={commission.image} alt="" width="708" height="1402" />
                <figcaption>{commission.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function BuildApproach() {
  return (
    <section
      className="build-approach inner-container"
      aria-labelledby="build-approach-title"
    >
      <div className="build-approach__image" data-reveal>
        <img
          src="/assets/1ebe90ab77d2912275ef15f9ba86fe2fea1f451f-2880x3600.jpg"
          alt="Hand-finished automotive upholstery detail"
          width="2880"
          height="3600"
          loading="lazy"
        />
      </div>
      <div className="build-approach__copy" data-reveal>
        <h2 id="build-approach-title">A Considered Approach</h2>
        <p>
          Distinctive by design. Personal in every detail. From the first sketch
          to the final finish.
        </p>
        <dl className="service-ledger">
          {services.map(([name, description]) => (
            <div key={name}>
              <dt>{name}</dt>
              <dd>{description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
