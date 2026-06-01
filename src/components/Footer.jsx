import { PAGES } from '../data/config';

export default function Footer({ goTo }) {
  return (
    <footer className="footer">
      <div className="footer-logo">NábytokRiziky</div>
      <p>Rodinná stolárska dielňa · Od roku 1998</p>
      <div className="footer-links">
        {PAGES.map((p) => (
          <button key={p} onClick={() => goTo(p)}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>
      <p style={{ marginTop: 24, fontSize: 12, opacity: 0.4 }}>
        © 2026 NábytokRiziky s.r.o. · Všetky práva vyhradené
      </p>
    </footer>
  );
}
