"use client";
import { getAdminSession } from "@/lib/admin-auth";
import AdminPanel from "./panel";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) {
    return <main className="admin-login">
      <div className="brand"><span className="brand-mark">ID</span><span><strong>Iam Dani</strong><small>Administración</small></span></div>
      <h1>Acceso protegido</h1>
      <p>Abre el bot de Telegram y envía <strong>/panel</strong>. Recibirás un enlace personal con acceso temporal.</p>
      <a className="primary-button" href="https://t.me/CatalogoVIPSCZBot">Abrir bot en Telegram</a>
    </main>;
  }
  return <AdminPanel />;
}
