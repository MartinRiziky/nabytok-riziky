import { SERVICES, WORKFLOW_STEPS, PRICING_3D } from '../data/services';

export default function Services() {
  return (
    <section className="section" style={{ paddingTop: 140 }}>
      <p className="section-label">Naše služby</p>
      <h2 className="section-title playfair">Všetko pod jednou strechou</h2>
      <p className="section-sub">
        Celý proces od návrhu po montáž realizujeme vo vlastnej dielni s tímom skúsených stolárov.
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

      {/* Workflow */}
      <div style={{ marginTop: 48, padding: 40, background: "var(--cream)", borderRadius: 20, border: "1px solid rgba(196,162,101,0.15)" }}>
        <h3 className="playfair" style={{ fontSize: 24, marginBottom: 16 }}>Ako pracujeme?</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 24 }}>
          {WORKFLOW_STEPS.map((s) => (
            <div key={s.n}>
              <div style={{ fontSize: 32, fontFamily: "'Playfair Display',serif", color: "var(--oak)", fontWeight: 700 }}>{s.n}</div>
              <h4 style={{ margin: "8px 0 6px", fontSize: 16, fontWeight: 600 }}>{s.t}</h4>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3D Pricing */}
      <div style={{ marginTop: 48, padding: 40, background: "var(--charcoal)", borderRadius: 20, color: "var(--warm-white)" }}>
        <p style={{ fontSize: 12, letterSpacing: 3, textTransform: "uppercase", color: "var(--oak)", marginBottom: 12, fontWeight: 600 }}>
          Cenník
        </p>
        <h3 className="playfair" style={{ fontSize: 28, marginBottom: 8 }}>
          3D Vizualizácia — voliteľná služba
        </h3>
        <p style={{ fontSize: 15, color: "rgba(250,247,242,0.6)", marginBottom: 32, maxWidth: 560, lineHeight: 1.7 }}>
          Vizualizácia nie je podmienkou objednávky. Ak ju chcete, vyberte si balík podľa rozsahu projektu.
          Pri objednávke nábytku nad 3 000 € sa cena vizualizácie odpočíta z celkovej sumy.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16 }}>
          {PRICING_3D.map((p, i) => (
            <div
              key={i}
              style={{
                padding: 24, borderRadius: 16,
                background: p.pop ? "rgba(196,162,101,0.15)" : "rgba(255,255,255,0.05)",
                border: p.pop ? "2px solid var(--oak)" : "1px solid rgba(255,255,255,0.08)",
                position: "relative",
              }}
            >
              {p.pop && (
                <div style={{
                  position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                  background: "var(--oak)", color: "#fff", fontSize: 10, fontWeight: 700,
                  padding: "3px 12px", borderRadius: 20, letterSpacing: 1, textTransform: "uppercase",
                }}>
                  najčastejšie
                </div>
              )}
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "var(--oak)", marginBottom: 8 }}>{p.name}</div>
              <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "'Playfair Display',serif", marginBottom: 4 }}>{p.price}</div>
              <p style={{ fontSize: 13, color: "rgba(250,247,242,0.7)", marginBottom: 12, lineHeight: 1.5 }}>{p.desc}</p>
              <p style={{ fontSize: 11, color: "rgba(250,247,242,0.4)", lineHeight: 1.6 }}>{p.items}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 24, fontSize: 12, color: "rgba(250,247,242,0.35)", lineHeight: 1.6 }}>
          * Ceny sú orientačné a môžu sa líšiť podľa komplexnosti projektu. Revízia = úprava rozloženia, materiálov alebo farieb.
          Pohľad = jeden uhol vizualizácie (čelný, bočný, perspektíva).
        </p>
      </div>
    </section>
  );
}
