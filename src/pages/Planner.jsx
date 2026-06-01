import KitchenPlanner from '../components/KitchenPlanner';

export default function Planner({ goTo }) {
  return (
    <section className="section" style={{ paddingTop: 140 }}>
      <p className="section-label">Interaktívny nástroj</p>
      <h2 className="section-title playfair">Plánovač kuchyne</h2>
      <p className="section-sub">
        Nastavte tvar a rozmery miestnosti, pridávajte skrinky a sledujte výsledok
        v pôdoryse aj bokoryse v reálnom čase.
      </p>

      <KitchenPlanner />

      <div style={{ marginTop: 40, textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>
          Máte hotový návrh? Pošlite nám ho a my vám pripravíme cenovú ponuku.
        </p>
        <button className="btn btn-primary" onClick={() => goTo("kontakt")}>
          Odoslať návrh na konzultáciu →
        </button>
      </div>
    </section>
  );
}
