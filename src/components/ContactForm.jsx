import { useState } from 'react';
import { CONTACT_INFO } from '../data/config';

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", type: "", msg: "" });
  const [toast, setToast] = useState(null);

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const submit = () => {
    if (!form.name || !form.email || !form.msg) {
      setToast({ type: "error", msg: "Vyplňte prosím meno, email a správu." });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setToast({ type: "success", msg: "Správa bola odoslaná! Ozveme sa vám do 24 hodín." });
    setForm({ name: "", email: "", phone: "", type: "", msg: "" });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <>
      <div className="contact-grid">
        <div>
          <div className="form-group">
            <label>Meno a priezvisko *</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ján Novák" />
          </div>
          <div className="form-group">
            <label>E-mail *</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="jan@email.sk" />
          </div>
          <div className="form-group">
            <label>Telefón</label>
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+421 9XX XXX XXX" />
          </div>
          <div className="form-group">
            <label>Typ nábytku</label>
            <select value={form.type} onChange={(e) => set("type", e.target.value)}>
              <option value="">— Vyberte —</option>
              <option>Kuchyňa na mieru</option>
              <option>Vstavaná skriňa</option>
              <option>Obývacia stena</option>
              <option>Spálňový nábytok</option>
              <option>Kancelársky nábytok</option>
              <option>Iné</option>
            </select>
          </div>
          <div className="form-group">
            <label>Vaša správa *</label>
            <textarea
              rows={5}
              value={form.msg}
              onChange={(e) => set("msg", e.target.value)}
              placeholder="Opíšte váš projekt, rozmery priestoru, materiálové preferencie..."
            />
          </div>
          <button className="btn btn-primary" onClick={submit} style={{ width: "100%" }}>
            Odoslať dopyt
          </button>
        </div>

        <div className="contact-info">
          <h3 className="playfair">Kontaktujte nás</h3>
          <div className="contact-info-item">
            <div className="contact-info-icon">📍</div>
            <div>
              <strong>Adresa</strong>
              <p>{CONTACT_INFO.address.split('\n').map((l, i) => <span key={i}>{l}<br /></span>)}</p>
            </div>
          </div>
          <div className="contact-info-item">
            <div className="contact-info-icon">📞</div>
            <div>
              <strong>Telefón</strong>
              <p>{CONTACT_INFO.phone}<br />{CONTACT_INFO.hours}</p>
            </div>
          </div>
          <div className="contact-info-item">
            <div className="contact-info-icon">✉️</div>
            <div>
              <strong>E-mail</strong>
              <p>{CONTACT_INFO.email}</p>
            </div>
          </div>
          <div className="contact-info-item">
            <div className="contact-info-icon">🏭</div>
            <div>
              <strong>Showroom</strong>
              <p>Navštívte našu výstavu<br />Po dohode aj cez víkend</p>
            </div>
          </div>
          <div style={{ marginTop: 32, padding: 20, background: "rgba(196,162,101,0.1)", borderRadius: 12 }}>
            <p style={{ fontSize: 14, color: "rgba(250,247,242,0.8)", lineHeight: 1.7 }}>
              <strong style={{ color: "var(--oak)" }}>Bezplatná konzultácia</strong><br />
              Radi vám poradíme s návrhom a výberom materiálov. Prvá konzultácia a zameranie je u nás zadarmo.
            </p>
          </div>
        </div>
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}
