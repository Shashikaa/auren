export default function InnerClose({ headingId, imageAlt, eyebrow }) {
  return (
    <section className="inner-close" aria-labelledby={headingId}>
      <img
        src="/assets/8234f422e53117f9ee574a826d50902f5e4272b5-2880x1800.jpg"
        alt={imageAlt}
        width="2880"
        height="1800"
        loading="lazy"
      />
      <div className="inner-close__copy inner-container" data-reveal>
        {eyebrow && <p>{eyebrow}</p>}
        <h2 id={headingId}>Make It Yours</h2>
        <a className="button inner-secondary" href="/contact">
          Begin A Build Enquiry
        </a>
      </div>
    </section>
  );
}
