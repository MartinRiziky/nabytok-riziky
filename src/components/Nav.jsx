import { PAGES } from '../data/config';

export default function Nav({ page, goTo, scrolled }) {
  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-logo" onClick={() => goTo("domov")}>
        Nábytok<span>Riziky</span>
      </div>
      <div className="nav-links">
        {PAGES.map((p) => (
          <button
            key={p}
            className={`nav-link ${page === p ? "active" : ""}`}
            onClick={() => goTo(p)}
          >
            {p}
          </button>
        ))}
      </div>
    </nav>
  );
}
