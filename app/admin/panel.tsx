"use client";

import { FormEvent, useEffect, useState } from "react";

type Profile = { id: string; name: string; age: number; zone: string; price: number; commission: number; bio: string; status: string };
const blank = { name: "", age: 18, zone: "", price: 0, commission: 0, bio: "", status: "draft" };

export default function AdminPanel() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const load = () => fetch("/api/admin/profiles").then((r) => r.json()).then((d) => setProfiles(d.profiles ?? []));
  useEffect(() => { load(); }, []);

  async function save(event: FormEvent) {
    event.preventDefault(); setMessage("Guardando…");
    const response = await fetch(editing ? `/api/admin/profiles/${editing}` : "/api/admin/profiles", {
      method: editing ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form),
    });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error ?? "No se pudo guardar");
    setMessage("Perfil guardado correctamente"); setEditing(null); setForm(blank); await load();
  }
  function edit(profile: Profile) { setEditing(profile.id); setForm({ ...profile }); window.scrollTo({ top: 0, behavior: "smooth" }); }

  return <main className="admin-page">
    <header className="admin-page-header"><div className="brand"><span className="brand-mark">ID</span><span><strong>Panel administrativo</strong><small>Catálogo Santa Cruz</small></span></div><a href="/">Ver catálogo</a></header>
    <section className="admin-editor">
      <div><span className="eyebrow">{editing ? "Modificar perfil" : "Nuevo perfil"}</span><h1>{editing ? "Editar catálogo" : "Agregar al catálogo"}</h1><p>Los cambios publicados aparecen inmediatamente en la página.</p></div>
      <form onSubmit={save}>
        <label>Nombre<input required value={form.name} onChange={(e) => setForm({...form, name:e.target.value})}/></label>
        <label>Edad<input required type="number" min="18" value={form.age} onChange={(e) => setForm({...form, age:Number(e.target.value)})}/></label>
        <label>Zona<input required value={form.zone} onChange={(e) => setForm({...form, zone:e.target.value})}/></label>
        <label>Tarifa (Bs)<input required type="number" min="0" value={form.price} onChange={(e) => setForm({...form, price:Number(e.target.value)})}/></label>
        <label>Comisión (Bs)<input required type="number" min="0" value={form.commission} onChange={(e) => setForm({...form, commission:Number(e.target.value)})}/></label>
        <label>Estado<select value={form.status} onChange={(e) => setForm({...form, status:e.target.value})}><option value="draft">Borrador</option><option value="available">Disponible</option><option value="busy">Ocupada</option><option value="paused">Pausada</option><option value="retired">Retirada</option></select></label>
        <label className="wide">Descripción<textarea required value={form.bio} onChange={(e) => setForm({...form, bio:e.target.value})}/></label>
        <div className="wide admin-actions"><button className="primary-button" type="submit">{editing ? "Guardar cambios" : "Crear perfil"}</button>{editing && <button type="button" onClick={() => {setEditing(null);setForm(blank)}}>Cancelar</button>}<span>{message}</span></div>
      </form>
    </section>
    <section className="admin-catalog"><span className="eyebrow">Gestión del catálogo</span><h2>Perfiles ({profiles.length})</h2>
      <div className="admin-list">{profiles.map((profile) => <article className="admin-profile" key={profile.id}><span className="mini-avatar">{profile.name.slice(0,2).toUpperCase()}</span><div><strong>{profile.name}</strong><small>{profile.zone} · Bs {profile.price}</small></div><span className={`status ${profile.status}`}>{profile.status}</span><button className="edit-button" onClick={() => edit(profile)}>Editar</button></article>)}</div>
    </section>
  </main>;
}
