import { SERVICES } from '../data/services';

export default function Home({ goTo }) {
  return (
    <>
      <section className="hero">
        <div className="hero-grain" />
        <div className="hero-wood" />
        <div className="hero-content">
          <div className="hero-badge">Od roku 1998 · Rodinná tradícia</div>
          <h1>
            Nábytok na mieru<br />z <em>lásky</em> k drevu
          </h1>
          <p className="hero-sub">
            Vyrábame kuchyne, skrine a nábytok presne podľa vašich predstáv.
            Kvalitné materiály, precízne spracovanie, doživotná spokojnosť.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary" onClick={() => goTo("plánovač")}>
              📐 Navrhnite si kuchyňu
            </button>
            <button className="btn btn-outline" onClick={() => goTo("kontakt")}>
              Nezáväzná konzultácia
            </button>
          </div>
        </div>
      </section>

      <section className="section">
        <p className="section-label">Čo ponúkame</p>
        <h2 className="section-title playfair">Komplexné riešenia pre váš domov</h2>
        <p className="section-sub">
          Od prvotného návrhu cez výrobu až po montáž — postaráme sa o všetko.
        </p>
        <div className="services-grid">
          {SERVICES.map((s, i) => (
            <div key={i} className="service-card">
              <div className="service-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: "var(--charcoal)", padding: "80px 48px", textAlign: "center" }}>
        <h2 className="playfair" style={{ color: "var(--warm-white)", fontSize: "clamp(24px,4vw,40px)", marginBottom: 16 }}>
          Máte víziu? <span style={{ color: "var(--oak)" }}>My ju zrealizujeme.</span>
        </h2>
        <p style={{ color: "rgba(250,247,242,0.5)", maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.7 }}>
          Vyskúšajte náš interaktívny plánovač kuchyne alebo nás kontaktujte pre nezáväznú konzultáciu.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => goTo("plánovač")}>Otvoriť plánovač</button>
          <button className="btn btn-outline" onClick={() => goTo("kontakt")}>Napísať nám</button>
        </div>
      </section>
    </>
  );
}
