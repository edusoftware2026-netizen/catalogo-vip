"use client";

import { useEffect, useMemo, useState } from "react";

type Profile = {
  id: string;
  name: string;
  age: number;
  zone: string;
  price: number;
  commission: number;
  status: "available" | "busy";
  bio: string;
  photoUrl: string | null;
};

const labels = { available: "Disponible", busy: "Ocupada" };

export default function Home() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [zone, setZone] = useState("Todas");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selected, setSelected] = useState<Profile | null>(null);

  useEffect(() => {
    fetch("/api/profiles")
      .then((response) => response.json())
      .then((data) => setProfiles(data.profiles ?? []))
      .finally(() => setLoading(false));
  }, []);

  const zones = useMemo(
    () => ["Todas", ...Array.from(new Set(profiles.map((item) => item.zone)))],
    [profiles],
  );
  const filtered = profiles.filter(
    (profile) =>
      (zone === "Todas" || profile.zone === zone) &&
      (!availableOnly || profile.status === "available"),
  );
  const botUsername =
    process.env.NEXT_PUBLIC_BOT_USERNAME || "CatalogoVIPSCZBot";

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio">
          <span className="brand-mark">ID</span>
          <span><strong>Iam Dani</strong><small>Catálogo Santa Cruz</small></span>
        </a>
        <nav>
          <a href="#catalogo">Catálogo</a>
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#seguridad">Seguridad</a>
        </nav>
        <a className="admin-link" href="/admin">Acceso administrador</a>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <span className="eyebrow">Selección privada · Santa Cruz</span>
          <h1>Encuentra una compañía<em> a tu medida.</em></h1>
          <p>Perfiles verificados, disponibilidad actualizada y coordinación directa con nuestra administración.</p>
          <div className="hero-actions">
            <a className="primary-button" href="#catalogo">Explorar catálogo <span>↗</span></a>
            <span className="privacy-note"><i>●</i> Atención privada y discreta</span>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="arch"><span className="arch-monogram">ID</span><span className="arch-line">Selección exclusiva</span></div>
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <span className="star star-one">✦</span><span className="star star-two">✦</span>
        </div>
      </section>

      <section className="catalog-section" id="catalogo">
        <div className="section-heading">
          <div><span className="eyebrow">Catálogo actualizado</span><h2>Perfiles disponibles</h2></div>
          <p>Selecciona un perfil para consultar disponibilidad. Los detalles de la cita se coordinan únicamente por privado.</p>
        </div>
        <div className="filters">
          <label>Zona
            <select value={zone} onChange={(event) => setZone(event.target.value)}>
              {zones.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <button className={availableOnly ? "filter-chip active" : "filter-chip"} onClick={() => setAvailableOnly(!availableOnly)}>
            <span /> Disponibles ahora
          </button>
          <span className="result-count">{filtered.length} perfiles</span>
        </div>
        {loading ? <p className="empty-state">Cargando catálogo…</p> :
          filtered.length === 0 ? <p className="empty-state">No hay perfiles publicados por el momento.</p> :
          <div className="profile-grid">
            {filtered.map((profile, index) => (
              <article className="profile-card" key={profile.id}>
                <div className={`portrait tone-${index % 4}`} style={profile.photoUrl ? { backgroundImage: `url(${profile.photoUrl})` } : undefined}>
                  {!profile.photoUrl && <span className="portrait-initials">{profile.name.slice(0, 2).toUpperCase()}</span>}
                  <span className={`status ${profile.status}`}>{labels[profile.status]}</span>
                  <span className="portrait-number">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className="profile-body">
                  <div className="profile-title"><div><h3>{profile.name}</h3><span>{profile.age} años · {profile.zone}</span></div><span className="verified">✓</span></div>
                  <p>{profile.bio}</p>
                  <div className="price-row"><span>Desde <strong>Bs {profile.price}</strong></span><button onClick={() => setSelected(profile)}>Ver perfil <span>↗</span></button></div>
                </div>
              </article>
            ))}
          </div>
        }
      </section>

      <section className="process-section" id="como-funciona">
        <div><span className="eyebrow">Simple y privado</span><h2>Coordina en tres pasos</h2></div>
        <ol>
          <li><span>01</span><strong>Elige un perfil</strong><p>Revisa información, zona, tarifa y disponibilidad.</p></li>
          <li><span>02</span><strong>Solicita disponibilidad</strong><p>El bot registra tu solicitud y avisa a administración.</p></li>
          <li><span>03</span><strong>Coordina por privado</strong><p>La administradora verifica la comisión y confirma los detalles.</p></li>
        </ol>
      </section>
      <section className="safety-section" id="seguridad">
        <span className="safety-icon">✦</span><div><span className="eyebrow">Privacidad primero</span><h2>Tu información se mantiene protegida.</h2></div>
        <p>No publicamos ubicaciones exactas, teléfonos ni datos personales. Servicio exclusivo para mayores de 18 años.</p>
      </section>
      <footer>
        <div className="brand footer-brand"><span className="brand-mark">ID</span><span><strong>Iam Dani</strong><small>Catálogo Santa Cruz</small></span></div>
        <span>Atención mediante Telegram · Santa Cruz, Bolivia</span><span>+18 · Uso responsable</span>
      </footer>

      {selected && <div className="modal-backdrop">
        <section className="profile-modal" role="dialog" aria-modal="true">
          <button className="modal-close" onClick={() => setSelected(null)}>×</button>
          <div className="modal-portrait"><span>{selected.name.slice(0, 2).toUpperCase()}</span><small>Perfil verificado</small></div>
          <div className="modal-content">
            <span className={`status ${selected.status}`}>{labels[selected.status]}</span>
            <h2>{selected.name}</h2><p className="modal-meta">{selected.age} años · {selected.zone}</p><p>{selected.bio}</p>
            <dl><div><dt>Tarifa referencial</dt><dd>Bs {selected.price}</dd></div><div><dt>Comisión de reserva</dt><dd>Bs {selected.commission}</dd></div></dl>
            <a className="request-button" href={`https://t.me/${botUsername}?start=perfil_${selected.id}`}>Solicitar disponibilidad en Telegram</a>
            <small className="modal-disclaimer">La administradora confirmará disponibilidad y enviará su QR por mensaje privado.</small>
          </div>
        </section>
      </div>}
    </main>
  );
}
