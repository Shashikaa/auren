import { vehicles, principles } from "../../data/collections";

export function StockHero() {
  return (
    <section
      className="inner-hero inner-hero--stock"
      aria-labelledby="stock-title"
    >
      <picture className="inner-hero__media">
        <source
          media="(max-width: 600px)"
          srcSet="/assets/02dd1fb0de568518e405be67ae7dc3ef47fe383a-1320x2388.jpg"
        />
        <img
          src="/assets/2bd7f1455a34d387b7cab13cfe092e2bd89f49fb-2880x1868.jpg"
          alt="A curated line of performance vehicles in a dark studio"
          width="2880"
          height="1868"
          fetchPriority="high"
        />
      </picture>
      <div className="inner-hero__content inner-container">
        <h1 id="stock-title">The Collection</h1>
        <div className="inner-hero__lower">
          <p>
            Discover a curated selection of vehicles and the possibilities for
            making each one your own.
          </p>
          <a className="button inner-primary" href="/contact">
            Begin A Build Enquiry
          </a>
        </div>
      </div>
    </section>
  );
}

export function VehicleShowcase() {
  return (
    <section className="stock-stage" aria-labelledby="stock-stage-title">
      <div className="stock-stage__sticky inner-container">
        <div className="stock-stage__copy" data-reveal>
          <h2 id="stock-stage-title">Three Starting Points</h2>
          <p>
            Each vehicle offers a different canvas. The direction begins with
            yours.
          </p>
        </div>
        <div className="stock-stage__vehicles">
          {vehicles.map((vehicle, index) => (
            <figure
              className={`stock-vehicle stock-vehicle--${index + 1}`}
              key={vehicle.name}
            >
              <img src={vehicle.image} alt="" width="708" height="1402" />
              <figcaption>{vehicle.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CollectionEditorial() {
  return (
    <section
      className="inner-editorial inner-container"
      aria-labelledby="stock-possibility-title"
    >
      <div className="inner-section-head" data-reveal>
        <h2 id="stock-possibility-title">Possibility, Not Specification</h2>
        <p>
          Auren considers the vehicle as a whole, from its stance to the
          smallest tactile detail.
        </p>
      </div>
      <div className="principle-grid">
        {principles.map((principle, index) => (
          <article
            className={`principle-card principle-card--${index + 1}`}
            key={principle.title}
            data-reveal
          >
            <figure>
              <img
                src={principle.image}
                alt=""
                width="2880"
                height="2234"
                loading="lazy"
              />
            </figure>
            <div>
              <h3>{principle.title}</h3>
              <p>{principle.copy}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
