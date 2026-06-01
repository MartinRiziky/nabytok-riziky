import { useState, useEffect } from 'react';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import Gallery from './pages/Gallery';
import Planner from './pages/Planner';
import Contact from './pages/Contact';

export default function App() {
  const [page, setPage] = useState("domov");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = document.getElementById("app-scroll-root");
    if (!el) return;
    const handler = () => setScrolled(el.scrollTop > 40);
    el.addEventListener("scroll", handler);
    return () => el.removeEventListener("scroll", handler);
  }, []);

  const goTo = (p) => {
    setPage(p);
    const el = document.getElementById("app-scroll-root");
    if (el) el.scrollTop = 0;
  };

  return (
    <div id="app-scroll-root" style={{ height: "100vh", overflow: "auto" }}>
      <Nav page={page} goTo={goTo} scrolled={scrolled} />

      {page === "domov" && <Home goTo={goTo} />}
      {page === "služby" && <Services />}
      {page === "galéria" && <Gallery />}
      {page === "plánovač" && <Planner goTo={goTo} />}
      {page === "kontakt" && <Contact />}

      <Footer goTo={goTo} />
    </div>
  );
}
