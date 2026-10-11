"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Fuente = { titulo: string; url: string; tipo: string; fecha_fuente: string | null };
type Seguimiento = { id: number; estado: string; porcentaje: number | null; que_cambio: string | null; evidencia: string; fecha_evidencia: string | null; imagen_url: string | null; created_at: string | null; fuentes: Fuente[] };
type Formulario = { estado: string; porcentaje: string; que_cambio: string; evidencia: string; fecha: string; imagen: string };
const inicial: Formulario = { estado: "sin_informacion", porcentaje: "", que_cambio: "", evidencia: "", fecha: "", imagen: "" };
const estados = [{ id:"sin_informacion", nombre:"Sin información suficiente" }, { id:"en_proceso", nombre:"En proceso" }, { id:"cumplida", nombre:"Cumplida" }, { id:"no_cumplida", nombre:"No cumplida" }];
const tipos = ["documento_oficial", "datos_publicos", "declaracion_funcionario", "contrato", "informe", "otra"];
const campo = "mt-2 block w-full rounded-xl border border-[#dfe7f8] bg-white p-3 text-sm outline-none focus:border-[#5574ff]";
export default function EditorSeguimiento() {
  const params = useParams<{ id: string }>();
  const [propuestaId, setPropuestaId] = useState<number>(0);
  const [titulo, setTitulo] = useState("");
  const [registros, setRegistros] = useState<Seguimiento[]>([]);
  const [form, setForm] = useState<Formulario>(inicial);
  const [fuentes, setFuentes] = useState<Fuente[]>([]);
  const [editando, setEditando] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);
  const [admin, setAdmin] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let activo = true;
    async function cargar() {
      setCargando(true);
      try {
        const db = createClient();
        const { data: auth, error: ae } = await db.auth.getUser();
        if (ae || !auth.user) throw new Error("Inicia sesión para continuar.");
        const { data: perfil, error: pe } = await db.from("profiles").select("role").eq("id", auth.user.id).single();
        if (pe || perfil?.role !== "admin") throw new Error("Necesitas permisos de administrador.");
        const idPropuesta = Number(new URLSearchParams(window.location.search).get("propuesta_id"));
        if (!Number.isSafeInteger(idPropuesta) || idPropuesta <= 0) throw new Error("Elige una propuesta desde el listado de compromisos.");
        const { data: propuesta, error: pre } = await db.from("propuestas").select("titulo").eq("id", idPropuesta).single();
        if (pre) throw pre;
        const { data, error } = await db.from("seguimientos").select("*,fuentes(*)").eq("propuesta_id", idPropuesta).order("created_at", { ascending: false }).order("id", { ascending: false });
        if (error) throw error;
        if (activo) { setPropuestaId(idPropuesta); setTitulo(propuesta.titulo); setRegistros((data ?? []) as Seguimiento[]); setAdmin(true); }
      } catch (error) { if (activo) setMensaje(error instanceof Error ? error.message : "No se pudo cargar el seguimiento."); }
      finally { if (activo) setCargando(false); }
    }
    void cargar(); return () => { activo = false; };
  }, [params.id, revision]);
  function cambiar(clave: keyof Formulario, valor: string) { setForm(prev => ({ ...prev, [clave]: valor })); }
  function nueva() { setEditando(null); setForm(inicial); setFuentes([]); setMensaje(""); }
  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setMensaje("");
    const porcentaje = form.porcentaje.trim() === "" ? null : Number(form.porcentaje);
    if (porcentaje !== null && (!Number.isInteger(porcentaje) || porcentaje < 0 || porcentaje > 100)) { setMensaje("El porcentaje debe ser un entero entre 0 y 100, o quedar vacío."); return; }
    if (form.imagen && !/^\/(?!\/)|^https?:\/\//i.test(form.imagen)) { setMensaje("La imagen debe ser una ruta local como /tema-seguridad.jpg o una URL http/https."); return; }
    if (fuentes.some(f=>!f.titulo.trim() || !/^https?:\/\//i.test(f.url))) { setMensaje("Completa el nombre y la URL http/https de cada fuente."); return; }
    setOcupado(true);
    try {
      const { error } = await createClient().rpc("guardar_seguimiento_radar", {
        p_propuesta_id:propuestaId, p_seguimiento_id:editando, p_estado:form.estado,
        p_porcentaje:porcentaje, p_que_cambio:form.que_cambio.trim() || null,
        p_evidencia:form.evidencia.trim(), p_fecha:form.fecha || null,
        p_imagen:form.imagen.trim() || null,
        p_fuentes:fuentes.map(f=>({ ...f, titulo:f.titulo.trim(), url:f.url.trim(), fecha_fuente:f.fecha_fuente || null }))
      });
      if (error) throw error;
      nueva(); setMensaje("Actualización y fuentes guardadas."); setRevision(v=>v+1);
    } catch (error) { setMensaje(error instanceof Error ? error.message : "No se pudo guardar. Revisa el SQL y los permisos de la base de datos."); }
    finally { setOcupado(false); }
  }
  async function eliminar(id: number) {
    if (!confirm("¿Eliminar esta actualización y sus fuentes? La propuesta de campaña se conserva.")) return;
    setOcupado(true);
    try {
      const { data, error } = await createClient().from("seguimientos").delete().eq("id",id).eq("propuesta_id",propuestaId).select("id");
      if (error) throw error;
      if (!data?.length) throw new Error("No se eliminó el registro. Revisa tus permisos.");
      if (editando === id) nueva();
      setMensaje("Actualización eliminada."); setRevision(v=>v+1);
    } catch (error) { setMensaje(error instanceof Error ? error.message : "No se pudo eliminar."); }
    finally { setOcupado(false); }
  }
  return <main className="mx-auto max-w-6xl px-6 py-10 text-[#111b3f]">
    <Link href="/admin/promesas" className="text-sm text-[#5574ff] underline underline-offset-4">Volver a compromisos</Link>
    <p className="mt-6 text-xs uppercase tracking-widest text-[#7863bd]">Seguimiento · Propuesta {propuestaId || "…"}</p>
    <h1 className="mt-3 text-3xl font-semibold">{titulo || "Editar seguimiento"}</h1>
    <p className="mt-3 text-sm leading-6 text-slate-600">Registra hechos documentados. El resumen cuenta qué pasó; la evidencia explica qué permite concluir.</p>
    {mensaje && <p role="status" className="mt-5 rounded-xl bg-[#eee7fa] p-4 text-sm">{mensaje}</p>}
    {cargando && <p className="mt-5 text-sm">Cargando…</p>}
    {admin && <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.3fr_0.7fr]">
      <form id="editor-seguimiento" onSubmit={guardar} className="scroll-mt-8 rounded-3xl border border-[#dfe7f8] p-6 sm:p-8">
        <h2 className="text-xl font-semibold">{editando === null ? "Nueva actualización" : `Editar actualización ${editando}`}</h2>
        <fieldset disabled={ocupado} className="mt-6 space-y-5 disabled:opacity-60">
          <label className="block text-sm">Qué ocurrió<textarea required rows={3} value={form.que_cambio} onChange={e=>cambiar("que_cambio",e.target.value)} className={campo} placeholder="Un párrafo corto sobre el hecho documentado." /></label>
          <label className="block text-sm">Evidencia y evaluación<textarea required rows={5} value={form.evidencia} onChange={e=>cambiar("evidencia",e.target.value)} className={campo} placeholder="Qué respalda la fuente y cómo se relaciona con la promesa." /></label>
          <div className="grid gap-5 sm:grid-cols-2"><label className="text-sm">Estado<select value={form.estado} onChange={e=>cambiar("estado",e.target.value)} className={campo}>{estados.map(s=><option key={s.id} value={s.id}>{s.nombre}</option>)}</select></label><label className="text-sm">Fecha de la evidencia<input type="date" value={form.fecha} onChange={e=>cambiar("fecha",e.target.value)} className={campo} /></label></div>
          <label className="block text-sm">Porcentaje opcional<input type="number" min={0} max={100} step={1} value={form.porcentaje} onChange={e=>cambiar("porcentaje",e.target.value)} className={campo} /><span className="mt-2 block text-xs text-slate-500">Déjalo vacío si no tienes una medición que lo justifique.</span></label>
          <label className="block text-sm">Imagen<input value={form.imagen} onChange={e=>cambiar("imagen",e.target.value)} className={campo} placeholder="/tema-seguridad.jpg o https://…" /><span className="mt-2 block text-xs text-slate-500">Si queda vacío, la página pública puede usar la foto del tema.</span></label>
          <div className="border-t border-[#dfe7f8] pt-5"><h3 className="font-semibold">Fuentes</h3><p className="mt-2 text-xs text-slate-500">Usa el nombre de la institución o del medio y el enlace al documento concreto.</p>
            {fuentes.map((f,index)=><div key={index} className="mt-4 space-y-3 rounded-2xl bg-[#f2f5ff] p-4">
              <label className="block text-xs">Nombre<input required className={campo} value={f.titulo} onChange={e=>setFuentes(prev=>prev.map((x,i)=>i===index ? {...x,titulo:e.target.value} : x))} /></label>
              <label className="block text-xs">URL<input required type="url" className={campo} value={f.url} onChange={e=>setFuentes(prev=>prev.map((x,i)=>i===index ? {...x,url:e.target.value} : x))} /></label>
              <label className="block text-xs">Tipo<select className={campo} value={f.tipo} onChange={e=>setFuentes(prev=>prev.map((x,i)=>i===index ? {...x,tipo:e.target.value} : x))}>{tipos.map(t=><option key={t} value={t}>{t.replaceAll("_"," ")}</option>)}</select></label>
              <label className="block text-xs">Fecha de publicación<input type="date" className={campo} value={f.fecha_fuente ?? ""} onChange={e=>setFuentes(prev=>prev.map((x,i)=>i===index ? {...x,fecha_fuente:e.target.value} : x))} /></label>
              <button type="button" className="text-xs text-red-700 underline" onClick={()=>setFuentes(prev=>prev.filter((_,i)=>i!==index))}>Quitar fuente</button>
            </div>)}
            <button type="button" className="mt-4 text-sm text-[#5574ff] underline underline-offset-4" onClick={()=>setFuentes(prev=>[...prev,{titulo:"",url:"",tipo:"documento_oficial",fecha_fuente:""}])}>Agregar fuente</button>
          </div>
          <div className="flex flex-wrap items-center gap-4"><button type="submit" className="rounded-xl bg-[#5574ff] px-5 py-3 text-sm font-medium text-white">{ocupado ? "Guardando…" : "Guardar actualización"}</button>{editando !== null && <Link href="/admin/promesas" className="text-sm underline">Volver al listado</Link>}</div>
        </fieldset>
      </form>
      <aside className="rounded-3xl bg-[#f2f5ff] p-6">
        <h2 className="text-xl font-semibold">Historial registrado</h2>
        <p className="mt-2 text-xs leading-5 text-slate-500">Las nuevas actualizaciones se agregan al historial. Edita una existente para corregirla.</p>
        <Link href={`/seguimiento/${propuestaId}`} className="mt-4 inline-block text-sm text-[#5574ff] underline">Abrir página pública</Link>
        {!registros.length && <p className="mt-6 text-sm">Todavía no hay actualizaciones.</p>}
        <ul className="mt-6 space-y-5">{registros.map(r=><li key={r.id} className="border-t border-[#dfe7f8] pt-5"><p className="text-xs text-[#7863bd]">{r.fecha_evidencia || "Fecha de evidencia pendiente"} · {estados.find(s=>s.id===r.estado)?.nombre ?? r.estado}</p><p className="mt-2 whitespace-pre-line text-sm leading-6">{r.que_cambio || r.evidencia}</p><p className="mt-2 text-xs text-slate-500">{r.fuentes?.length ?? 0} fuentes</p><div className="mt-3 flex gap-4"><Link href={`/admin/promesas/${r.id}/editar`} className="text-sm text-[#5574ff] underline">Editar</Link><button disabled={ocupado} onClick={()=>void eliminar(r.id)} className="text-sm text-red-700 underline">Eliminar</button></div></li>)}</ul>
      </aside>
    </div>}
  </main>;
}
