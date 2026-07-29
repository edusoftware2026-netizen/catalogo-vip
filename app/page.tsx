"use client";

import { useMemo, useState } from "react";

type ProfileStatus = "Disponible" | "Ocupada" | "Pausada";

type Profile = {
  id: number;
  name: string;
  age: number;
  zone: string;
  price: number;
  commission: number;
  status: ProfileStatus;
  bio: string;
  tone: string;
  initials: string;
  verified: boolean;
};

const profiles: Profile[] = [
  {
    id: 1,
    name: "Valentina",
    age: 23,
    zone: "Equipetrol",
    price: 900,
    commission: 300,
    status: "Disponible",
    bio: "Conversación cálida, presencia elegante y atención discreta.",
    tone: "rose",
    initials: "VA",
    verified: true,
  },
  {
    id: 2,
    name: "Renata",
    age: 25,
    zone: "Centro",
    price: 1100,
    commission: 350,
    status: "Disponible",
    bio: "Espontánea, puntual y con un estilo sofisticado.",
    tone: "emerald",
    initials: "RE",
    verified: true,
  },
  {
    id: 3,
    name: "Camila",
    age: 22,
    zone: "Urubó",
    price: 800,
    commission: 250,
    status: "Ocupada",
    bio: "Amable, reservada y amante de los buenos detalles.",
    tone: "violet",
    initials: "CA",
    verified: true,
  },
  {
    id: 4,
    name: "Sofía",
    age: 27,
    zone: "Norte",
    price: 1000,
    commission: 300,
    status: "Disponible",
    bio: "Carismática, atenta y siempre impecable.",
    tone: "amber",
    initials: "SO",
    verified: true,
  },
];

const navItems = ["Catálogo", "Cómo funciona", "Seguridad"];

export default function Home() {
  const [zone, setZone] = useState("Todas");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<"perfiles" | "solicitudes">("perfiles");

  const filtered = useMemo(
    () =>
      profiles.filter(
        (profile) =>
          (zone === "Todas" || profile.zone === zone) &&
          (!availableOnly || profile.status === "Disponible"),
      ),
    [zone, availableOnly],
  );

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Ir al inicio">
          <span className="brand-mark">ID</span>
          <span>
            <strong>Iam Dani</strong>
            <small>Catálogo Santa Cruz</small>
          </span>
        </a>
        <nav aria-label="Navegación principal">
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`}>
              {item}
            </a>
          ))}
        </nav>
        <button className="admin-link" onClick={() => setAdminOpen(true)}>
          Acceso administrador
        </button>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <span className="eyebrow">Selección privada · Santa Cruz</span>
          <h1>
            Encuentra una compañía
            <em> a tu medida.</em>
          </h1>
          <p>
            Perfiles verificados, disponibilidad actualizada y coordinación
            directa con nuestra administración.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#catálogo">
              Explorar catálogo <span>↘</span>
            </a>
            <span className="privacy-note">
              <i aria-hidden="true">●</i> Atención privada y discreta
            </span>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="arch">
            <span className="arch-monogram">ID</span>
            <span className="arch-line">Selección exclusiva</span>
          </div>
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <span className="star star-one">✦</span>
          <span className="star star-two">✦</span>
        </div>
      </section>

      <section className="catalog-section" id="catálogo">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Catálogo actualizado</span>
            <h2>Perfiles disponibles</h2>
          </div>
          <p>
            Selecciona un perfil para consultar disponibilidad. Los detalles de
            la cita se coordinan únicamente por privado.
          </p>
        </div>

        <div className="filters" aria-label="Filtros del catálogo">
          <label>
            Zona
            <select value={zone} onChange={(event) => setZone(event.target.value)}>
              <option>Todas</option>
              <option>Equipetrol</option>
              <option>Centro</option>
              <option>Urubó</option>
              <option>Norte</option>
            </select>
          </label>
          <button
            className={availableOnly ? "filter-chip active" : "filter-chip"}
            onClick={() => setAvailableOnly((value) => !value)}
            aria-pressed={availableOnly}
          >
            <span /> Disponibles ahora
          </button>
          <span className="result-count">{filtered.length} perfiles</span>
        </div>

        <div className="profile-grid">
          {filtered.map((profile) => (
            <article className="profile-card" key={profile.id}>
              <div className={`portrait ${profile.tone}`}>
                <span className="portrait-initials">{profile.initials}</span>
                <span className={`status ${profile.status.toLowerCase()}`}>
                  {profile.status}
                </span>
                <span className="portrait-number">0{profile.id}</span>
              </div>
              <div className="profile-body">
                <div className="profile-title">
                  <div>
                    <h3>{profile.name}</h3>
                    <span>
                      {profile.age} años · {profile.zone}
                    </span>
                  </div>
                  {profile.verified && (
                    <span className="verified" title="Perfil verificado">
                      ✓
                    </span>
                  )}
                </div>
                <p>{profile.bio}</p>
                <div className="price-row">
                  <span>
                    Desde <strong>Bs {profile.price}</strong>
                  </span>
                  <button onClick={() => setSelected(profile)}>
                    Ver perfil <span>↗</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="process-section" id="cómo-funciona">
        <div>
          <span className="eyebrow">Simple y privado</span>
          <h2>Coordina en tres pasos</h2>
        </div>
        <ol>
          <li>
            <span>01</span>
            <strong>Elige un perfil</strong>
            <p>Revisa información, zona, tarifa y disponibilidad.</p>
          </li>
          <li>
            <span>02</span>
            <strong>Solicita disponibilidad</strong>
            <p>El bot registra tu solicitud y avisa a administración.</p>
          </li>
          <li>
            <span>03</span>
            <strong>Coordina por privado</strong>
            <p>La administradora verifica la comisión y confirma los detalles.</p>
          </li>
        </ol>
      </section>

      <section className="safety-section" id="seguridad">
        <span className="safety-icon">✦</span>
        <div>
          <span className="eyebrow">Privacidad primero</span>
          <h2>Tu información se mantiene protegida.</h2>
        </div>
        <p>
          No publicamos ubicaciones exactas, teléfonos ni datos personales.
          Servicio exclusivo para mayores de 18 años.
        </p>
      </section>

      <footer>
        <div className="brand footer-brand">
          <span className="brand-mark">ID</span>
          <span>
            <strong>Iam Dani</strong>
            <small>Catálogo Santa Cruz</small>
          </span>
        </div>
        <span>Atención mediante Telegram · Santa Cruz, Bolivia</span>
        <span>+18 · Uso responsable</span>
      </footer>

      {selected && (
        <div className="modal-backdrop" role="presentation">
          <section className="profile-modal" role="dialog" aria-modal="true">
            <button
              className="modal-close"
              onClick={() => setSelected(null)}
              aria-label="Cerrar perfil"
            >
              ×
            </button>
            <div className={`modal-portrait ${selected.tone}`}>
              <span>{selected.initials}</span>
              <small>Perfil verificado</small>
            </div>
            <div className="modal-content">
              <span className={`status ${selected.status.toLowerCase()}`}>
                {selected.status}
              </span>
              <h2>{selected.name}</h2>
              <p className="modal-meta">
                {selected.age} años · {selected.zone}
              </p>
              <p>{selected.bio}</p>
              <dl>
                <div>
                  <dt>Tarifa referencial</dt>
                  <dd>Bs {selected.price}</dd>
                </div>
                <div>
                  <dt>Comisión de reserva</dt>
                  <dd>Bs {selected.commission}</dd>
                </div>
              </dl>
              <button className="request-button">
                Solicitar disponibilidad en Telegram
              </button>
              <small className="modal-disclaimer">
                La administradora confirmará disponibilidad y enviará su QR por
                mensaje privado.
              </small>
            </div>
          </section>
        </div>
      )}

      {adminOpen && (
        <div className="admin-drawer" role="dialog" aria-modal="true">
          <div className="drawer-top">
            <div className="brand">
              <span className="brand-mark">ID</span>
              <span>
                <strong>Panel administrativo</strong>
                <small>Catálogo Santa Cruz</small>
              </span>
            </div>
            <button onClick={() => setAdminOpen(false)} aria-label="Cerrar panel">
              ×
            </button>
          </div>
          <div className="admin-tabs">
            <button
              className={adminTab === "perfiles" ? "active" : ""}
              onClick={() => setAdminTab("perfiles")}
            >
              Perfiles
            </button>
            <button
              className={adminTab === "solicitudes" ? "active" : ""}
              onClick={() => setAdminTab("solicitudes")}
            >
              Solicitudes <span>3</span>
            </button>
          </div>
          {adminTab === "perfiles" ? (
            <div className="admin-content">
              <div className="admin-heading">
                <div>
                  <span className="eyebrow">Gestión del catálogo</span>
                  <h2>Perfiles</h2>
                </div>
                <button>+ Nuevo perfil</button>
              </div>
              <div className="admin-list">
                {profiles.map((profile) => (
                  <div className="admin-profile" key={profile.id}>
                    <span className={`mini-avatar ${profile.tone}`}>
                      {profile.initials}
                    </span>
                    <div>
                      <strong>{profile.name}</strong>
                      <small>{profile.zone} · Bs {profile.price}</small>
                    </div>
                    <span className={`status ${profile.status.toLowerCase()}`}>
                      {profile.status}
                    </span>
                    <button className="edit-button">Editar</button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="admin-content">
              <div className="admin-heading">
                <div>
                  <span className="eyebrow">Bandeja operativa</span>
                  <h2>Solicitudes nuevas</h2>
                </div>
              </div>
              <div className="request-list">
                {["Valentina", "Renata", "Sofía"].map((name, index) => (
                  <article key={name}>
                    <span>SCZ-00{index + 21}</span>
                    <div>
                      <strong>Solicitud para {name}</strong>
                      <small>Recibida hace {index * 4 + 2} min · Telegram</small>
                    </div>
                    <button>Revisar</button>
                  </article>
                ))}
              </div>
            </div>
          )}
          <div className="drawer-note">
            Vista demostrativa. La conexión segura con Telegram se activará al
            configurar el servidor.
          </div>
        </div>
      )}
    </main>
  );
}
