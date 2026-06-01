import ContactForm from '../components/ContactForm';

export default function Contact() {
  return (
    <section className="section" style={{ paddingTop: 140 }}>
      <p className="section-label">Spojte sa s nami</p>
      <h2 className="section-title playfair">Kontaktný formulár</h2>
      <p className="section-sub">
        Vyplňte formulár a ozveme sa vám do 24 hodín s nezáväznou ponukou.
      </p>
      <ContactForm />
    </section>
  );
}
