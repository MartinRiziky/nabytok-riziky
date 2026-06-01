# NábytokRiziky – Webstránka

Profesionálna webstránka pre rodinnú stolársku firmu s nábytkom na mieru.

## Funkcie

- **Domov** — Hero sekcia, prehľad služieb, CTA
- **Služby** — 6 služieb, pracovný postup, cenník 3D vizualizácií (5 balíkov)
- **Galéria** — Filtrovateľná galéria realizácií
- **Plánovač kuchyne** — Interaktívny nástroj s:
  - Tvar miestnosti: obdĺžnik, L-ľavá, L-pravá s vlastnými rozmermi
  - Skrinky: spodné, horné, vysoké, drezové, umývačka riadu, rúra
  - Okná na 3 stenách (zadná, ľavá, pravá) s vertikálnym posuvom
  - Pracovná doska (5 materiálov, nastaviteľná hrúbka a presah)
  - Obkladový panel (4 materiály s textúrami)
  - Pôdorys + bokorys v reálnom čase
- **Kontakt** — Formulár s validáciou, kontaktné údaje

## Tech Stack

- **React 18** + **Vite**
- Čistý CSS (bez frameworkov)
- Fonty: Playfair Display + DM Sans (Google Fonts)
- SVG vizualizácie (žiadne externé knižnice)

## Štruktúra projektu

```
src/
├── components/
│   ├── Nav.jsx              # Navigácia
│   ├── Footer.jsx           # Pätička
│   ├── ContactForm.jsx      # Kontaktný formulár
│   └── KitchenPlanner/
│       ├── KitchenPlanner.jsx  # Hlavný plánovač komponent
│       └── index.js
├── pages/
│   ├── Home.jsx
│   ├── Services.jsx
│   ├── Gallery.jsx
│   ├── Planner.jsx
│   └── Contact.jsx
├── data/
│   ├── config.js            # Brand, kontakty, navigácia
│   ├── services.js          # Služby, workflow, cenník
│   ├── gallery.js           # Galéria položky
│   └── planner.js           # Skrinky, materiály, konštanty
├── styles/
│   └── main.css             # Všetky štýly
├── App.jsx                  # Hlavný app s routingom
└── main.jsx                 # Entry point
```

## Inštalácia a spustenie

```bash
# Klonovanie
git clone https://github.com/vas-ucet/nabytok-riziky.git
cd nabytok-riziky

# Inštalácia závislostí
npm install

# Spustenie dev servera
npm run dev

# Build pre produkciu
npm run build

# Náhľad produkčného buildu
npm run preview
```

## Licencia

© 2026 NábytokRiziky s.r.o.
