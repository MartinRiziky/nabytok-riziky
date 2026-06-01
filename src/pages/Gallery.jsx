import { useState } from 'react';
import { GALLERY_ITEMS, GALLERY_CATEGORIES } from '../data/gallery';

export default function Gallery() {
  const [filter, setFilter] = useState("všetko");

  const filtered = filter === "všetko"
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((g) => g.cat === filter);

  return (
    <section className="section" style={{ paddingTop: 140 }}>
      <p className="section-label">Naše práce</p>
      <h2 className="section-title playfair">Galéria realizácií</h2>
      <p className="section-sub">
        Každý projekt je originál — navrhnutý a vyrobený presne podľa priania zákazníka.
      </p>

      <div className="gallery-filters">
        {GALLERY_CATEGORIES.map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="gallery-grid">
        {filtered.map((item, i) => (
          <div key={i} className="gallery-item">
            <div
              className="gallery-item-bg"
              style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}dd)` }}
            >
              {item.title.charAt(0)}
            </div>
            <div className="gallery-item-overlay">
              <span>{item.cat}</span>
              <h4>{item.title}</h4>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
