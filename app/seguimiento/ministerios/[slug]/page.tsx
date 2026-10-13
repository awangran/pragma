import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { ArrowLeft, Building2, ChevronDown } from "lucide-react";
type Persona = { id: number; nombre: string | null; avatar: string | null };
type Funcionario = { id: number; cargo: string; bio: string | null; trayectoria: string | null; fecha_inicio: string | null; fecha_fin: string | null; candidato: Persona | Persona[] | null };
type Ministerio = { id: number; nombre: string; slug: string; descripcion: string | null; sitio_web: string | null; logo: string | null };
type Actividad = { id: number; titulo: string; resumen: string; tipo: string | null; fecha: string | null; url_oficial: string | null; imagen_url: string | null; estado: string | null; fecha_inicio: string | null; fecha_fin: string | null };
type Fuente = { id: number; titulo: string; url: string; tipo: string | null; fecha_fuente: string | null; proyecto_id?: number; actividad_id?: number };
type Enlace = { id: number; titulo: string; url: string; tipo: string | null };
function personaDe(f: Funcionario) { return Array.isArray(f.candidato) ? f.candidato[0] ?? null : f.candidato; }
function urlSegura(valor?: string | null) { if (!valor) return null; try { const u = new URL(valor); return ["http:", "https:"].includes(u.protocol) ? u.href : null; } catch { return null; } }
function fotoSegura(valor?: string | null) { return valor?.startsWith("/") && !valor.startsWith("//") ? valor : urlSegura(valor); }
function fecha(valor?: string | null) { if (!valor) return null; const d = new Date(`${valor.slice(0,10)}T12:00:00Z`); return Number.isNaN(d.getTime()) ? null : new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(d); }
function fotoTema(nombre: string) {
  const n = nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const pares: [string, string][] = [["agricultura","/seguimiento-campo.jpg"],["ambiente","/cloud11-macaw-1416395_1920.jpg"],["ciencia","/tema-ciencia-tecnologia.jpg"],["comercio","/tayrona.jpg"],["cultura","/seguimiento-arte.jpg"],["culturas","/seguimiento-arte.jpg"],["defensa","/tema-seguridad.jpg"],["educacion","/tema-educacion.jpg"],["hacienda","/tema-economia.jpg"],["justicia","/just.jpg"],["energia","/tema-energia.jpg"],["exteriores","/tema-politica-exterior.jpg"],["salud","/tema-salud.jpg"],["tecnologias","/radio.jpg"],["trabajo","/imagen-seguimiento.jpg"],["transporte","/tema-infraestructura.jpg"],["deporte","/deporte.jpg"],["vivienda","/vivienda.jpg"]];
  return pares.find(([clave]) => n.includes(clave))?.[1] ?? "/seguimiento-colombia.jpg";
}
async function NavbarConUsuario() { const supabase = await createClient(); const { data } = await supabase.auth.getUser(); return <Navbar user={data.user ? { avatarUrl: data.user.user_metadata?.avatar_url ?? null } : null} />; }
function Cargando() { return <div role="status" className="mx-auto w-full max-w-6xl px-6 py-10"><p className="text-sm text-[#7863bd]">Cargando información institucional…</p><div aria-hidden="true" className="mt-6 h-56 rounded-[28px] bg-[#edf2ff] motion-safe:animate-pulse" /></div>; }
function Marco({ children }: { children: React.ReactNode }) { return <div className="min-h-screen bg-white text-[#111b3f]"><div className="px-4 sm:px-6 lg:px-8"><Suspense fallback={<Navbar user={null} />}><NavbarConUsuario /></Suspense></div>{children}<footer><Suspense fallback={<div className="p-6 text-xs text-slate-500">Cargando pie de página…</div>}><Footer /></Suspense></footer></div>; }
const CAMPOS_FUNCIONARIO = "id, cargo, bio, trayectoria, fecha_inicio, fecha_fin, candidato:candidato_id(id,nombre,avatar)";
function EnlaceExterno({url,children}:{url:string|null|undefined;children:React.ReactNode}) { const segura=urlSegura(url); return segura ? <a href={segura} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-2 break-words text-xs font-semibold text-[#5574ff] underline decoration-[#5574ff]/40 underline-offset-4 hover:decoration-[#5574ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff]">{children}<span className="sr-only">Abre en una pestaña nueva</span></a> : null; }
function claveFuente(valor: string) {
  const u = new URL(valor);
  u.hash = "";
  for (const key of Array.from(u.searchParams.keys())) {
    if (key.startsWith("utm_") || ["fbclid", "gclid"].includes(key)) u.searchParams.delete(key);
  }
  u.searchParams.sort();
  return u.href.replace(/\/$/, "");
}
function Fuentes({items,error,oficial}:{items:Fuente[];error:boolean;oficial?:string|null}) {
  const vistos = new Set<string>();
  const unicas = items.filter(f=>{
    const url = urlSegura(f.url);
    if (!url) return true;
    const clave = claveFuente(url);
    if (vistos.has(clave)) return false;
    vistos.add(clave);
    return true;
  });
  const urlOficial = urlSegura(oficial);
  const mostrarOficial = urlOficial && !vistos.has(claveFuente(urlOficial));
  return <div className="mt-5 border-t border-[#111b3f]/10 pt-4">
    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#7863bd]">Fuentes</p>
    {(unicas.length > 0 || mostrarOficial) && <ul className="mt-2 space-y-2">
      {unicas.map(f=><li key={f.id}><EnlaceExterno url={f.url}>{f.titulo || "Consultar fuente"}</EnlaceExterno>{!urlSegura(f.url) && <p className="text-xs text-slate-600">{f.titulo} · Enlace no disponible</p>}{fecha(f.fecha_fuente) && <p className="mt-1 text-[10px] text-slate-500">{fecha(f.fecha_fuente)}</p>}</li>)}
      {mostrarOficial && <li><EnlaceExterno url={urlOficial}>Fuente oficial</EnlaceExterno></li>}
    </ul>}
    {error && <p className="mt-2 text-xs leading-6 text-slate-600">No pudimos cargar todas las fuentes.</p>}
    {!error && !unicas.length && !mostrarOficial && <p className="mt-2 text-xs leading-6 text-slate-600">No hay fuentes asociadas a este registro.</p>}
  </div>;
}
function FlechaDesplegable() { return <ChevronDown aria-hidden="true" className="h-5 w-5 shrink-0 text-[#5574ff] transition-transform group-open:rotate-180 motion-reduce:transition-none" />; }
function CitaPublica() {
  return (
    <section aria-label="El sentido del servicio público" className="w-full bg-gradient-to-r from-[#f2f6ff] via-[#f7f5ff] to-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-8 md:py-10">
        <figure className="max-w-2xl border-l-2 border-[#a5b8ff] pl-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5574ff]">El sentido del servicio público</p>
          <blockquote className="mt-3 text-sm leading-7 text-slate-600">«El servicio público debe ser más que hacer un trabajo eficiente y honesto; debe ser una dedicación completa al pueblo y a la nación.»</blockquote>
          <figcaption className="mt-2 text-xs leading-6 text-slate-500"><a href="https://academia-lab.com/enciclopedia/margaret-chase-smith/" target="_blank" rel="noopener noreferrer" className="underline decoration-[#a5b8ff]/60 underline-offset-4 hover:text-[#3458d8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff]">Margaret Chase Smith<span className="sr-only"> (abre en una pestaña nueva)</span></a></figcaption>
        </figure>
      </div>
    </section>
  );
}
export default function MinisterioPage({params}:{params:Promise<{slug:string}>}) { return <Marco><main><Suspense fallback={<Cargando />}><DetalleMinisterio params={params} /></Suspense></main></Marco>; }
async function DetalleMinisterio({params}:{params:Promise<{slug:string}>}) {
  const {slug} = await params; const supabase=await createClient();
  const mr=await supabase.from("ministerios").select("id,nombre,slug,descripcion,sitio_web,logo").eq("slug",slug).maybeSingle();
  if(mr.error) {console.error("Error del ministerio público:",mr.error);return <div role="status" className="mx-auto max-w-6xl px-6 py-12 text-sm text-slate-600">No pudimos cargar la institución.</div>;}
  if(!mr.data) notFound(); const m=mr.data as Ministerio;
  const [fr, ar] = await Promise.all([
  supabase
    .from("funcionarios_ministerio")
    .select(CAMPOS_FUNCIONARIO)
    .eq("ministerio_id", m.id)
    .eq("activo", true)
    .order("fecha_inicio", {
      ascending: false,
      nullsFirst: false,
    }),

  supabase
    .from("actividad_ministerio")
    .select(
      "id,titulo,resumen,tipo,fecha,url_oficial,imagen_url,fecha_inicio,fecha_fin"
    )
    .eq("ministerio_id", m.id)
    .order("fecha", {
      ascending: false,
      nullsFirst: false,
    })
    .order("id", { ascending: false }),
]);
  const funcionarios=(fr.data ?? []) as unknown as Funcionario[]; const actividades=(ar.data ?? []) as Actividad[];
  const [lr,far]=await Promise.all([
    funcionarios.length ? supabase.from("links_funcionario").select("id,funcionario_id,titulo,url,tipo").in("funcionario_id",funcionarios.map(f=>f.id)) : Promise.resolve({data:[],error:null}),
    actividades.length ? supabase.from("fuentes_actividad").select("id,actividad_id,titulo,url,tipo,fecha_fuente").in("actividad_id",actividades.map(a=>a.id)) : Promise.resolve({data:[],error:null}),
  ]);
  const links=(lr.data ?? []) as (Enlace & {funcionario_id:number})[];const fa=(far.data ?? []) as Fuente[];
  for(const r of [fr,ar,lr,far]) if(r.error) console.error("Error cargando registros institucionales:",r.error);
  const principal = funcionarios[0];
  const personaPrincipal = principal ? personaDe(principal) : null;
  const retrato = fotoSegura(personaPrincipal?.avatar);
  return <>
    <div className="mx-auto max-w-6xl px-6 pb-6 pt-5">
      <Link href="/seguimiento/ministerios" className="inline-flex max-w-full items-center gap-2 break-words text-xs font-semibold text-[#5574ff] underline decoration-[#5574ff]/40 underline-offset-4 hover:decoration-[#5574ff]"><ArrowLeft aria-hidden="true" className="h-4 w-4" />Todos los ministerios</Link>
  <header className="relative isolate mt-8 overflow-hidden rounded-[32px] bg-[#eef2ff] sm:mt-10 sm:rounded-[38px]">
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-[#e1eeff] via-[#eee8ff] to-[#d9f2ff]" />
      <div className="relative grid items-center gap-8 px-7 py-10 sm:grid-cols-[auto_1fr] sm:gap-10 sm:px-10 sm:py-12 lg:gap-12 lg:px-12 lg:py-14">
        <div className="relative h-[220px] w-[180px] shrink-0 overflow-hidden rounded-[24px] bg-white/60 ring-4 ring-white/70 sm:h-[260px] sm:w-[210px] lg:h-[280px] lg:w-[230px]">
          {retrato ? <Image src={retrato} alt={personaPrincipal?.nombre ? `Retrato de ${personaPrincipal.nombre}` : "Retrato del responsable"} fill sizes="(max-width: 640px) 180px, (max-width: 1024px) 210px, 230px" unoptimized priority className="object-cover object-top" /> : <div className="flex h-full items-center justify-center"><Building2 aria-hidden="true" className="h-12 w-12 text-[#7863bd]/50" /></div>}
        </div>
        <div className="min-w-0">
          <p className="max-w-2xl text-[11px] font-semibold uppercase leading-6 tracking-[0.2em] text-[#594397] sm:text-xs">{m.nombre}</p>
          <h1 className="mt-3 break-words text-3xl font-semibold leading-[1.05] tracking-[-0.04em] text-[#111b3f] sm:text-4xl lg:text-5xl">{personaPrincipal?.nombre || "Responsable no registrado"}</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#52618c]">Conoce su trayectoria y revisa las responsabilidades y la actividad documentada del ministerio.</p>
        </div>
      </div>
    </header>
    </div>
    <nav aria-label="Secciones del perfil" className="border-y border-[#e2e9f8] bg-white"><div className="mx-auto flex max-w-6xl gap-7 overflow-x-auto px-6 py-4 text-xs font-semibold text-[#52618c] sm:gap-10">{[["institucion","La institución"],["responsables","Responsable"],["actividad","Actividad reciente"]].map(([id,label])=><a key={id} href={`#${id}`} className="shrink-0 py-1 hover:text-[#5574ff] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff]">{label}</a>)}</div></nav>
        <section id="responsables" aria-labelledby="responsables-title" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-8">
      <h2 id="responsables-title" className="sr-only">Perfil y trayectoria</h2>
      {fr.error ? <p className="text-sm text-slate-600">No pudimos cargar los responsables.</p> : !funcionarios.length ? <p className="text-sm text-slate-600">No hay un responsable activo registrado.</p> : funcionarios.map((f,index) => {
        const persona = personaDe(f);
        const avatar = fotoSegura(persona?.avatar);
        const entradas = (f.trayectoria ?? "").split("\n").map(linea => linea.replace(/^\s*[-•]\s*/, "").trim()).filter(Boolean);
        const renderEntrada = (linea: string, i: number) => <li key={`${f.id}-${i}`} className="relative break-words whitespace-pre-line text-[13px] leading-6 text-slate-600"><span aria-hidden="true" className="absolute -left-[21px] top-2 h-2 w-2 rounded-full bg-[#5574ff] ring-4 ring-white" />{linea}</li>;
        return <article key={f.id} className={index > 0 ? "mt-8 border-t border-[#e2e9f8] pt-8" : ""}>
          {funcionarios.length > 1 && <div className="mb-6 flex items-center gap-4">{avatar && <Image src={avatar} alt="" width={60} height={72} unoptimized className="h-[72px] w-[60px] rounded-xl object-cover object-top" />}<div><h3 className="text-lg font-semibold">{persona?.nombre || "Nombre no registrado"}</h3><p className="mt-1 text-xs text-[#7863bd]">{f.cargo}</p></div></div>}
          <div className="grid items-start gap-7 lg:grid-cols-[1fr_1.05fr] lg:gap-10">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5574ff]">El perfil</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Quién es.</h3>
              <p className="mt-4 break-words whitespace-pre-line text-[13px] leading-6 text-slate-600">{f.bio || "No hay biografía registrada."}</p>
              <div className="mt-4 space-y-1 text-xs leading-6 text-slate-500">{fecha(f.fecha_inicio) && <p>Inicio en el cargo: {fecha(f.fecha_inicio)}</p>}{fecha(f.fecha_fin) && <p>Fin registrado: {fecha(f.fecha_fin)}</p>}</div>
              <div className="mt-4 flex flex-wrap gap-4">{links.filter(l=>l.funcionario_id===f.id).map(l=><EnlaceExterno key={l.id} url={l.url}>{l.titulo}</EnlaceExterno>)}</div>
              {lr.error && <p className="mt-2 text-xs text-slate-500">No pudimos cargar los enlaces del perfil.</p>}
            </div>
            <div className="min-w-0 border-t border-[#e2e9f8] pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5574ff]">Su recorrido</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Trayectoria.</h3>
              {entradas.length ? <div className="mt-4">
                <ul className="space-y-4 border-l border-[#cddaff] pl-4">{entradas.slice(0,2).map(renderEntrada)}</ul>
                {entradas.length > 2 && <details className="group mt-4">
                  <summary className="flex w-fit cursor-pointer list-none items-center gap-2 border-b border-[#7863bd]/40 pb-1 text-xs font-semibold text-[#6555a8] hover:text-[#5574ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff] [&::-webkit-details-marker]:hidden"><span className="group-open:hidden">Ver trayectoria completa</span><span className="hidden group-open:inline">Mostrar menos</span><ChevronDown aria-hidden="true" className="h-4 w-4 transition-transform group-open:rotate-180 motion-reduce:transition-none" /></summary>
                  <ul className="mt-4 space-y-4 border-l border-[#cddaff] pl-4">{entradas.slice(2).map(renderEntrada)}</ul>
                </details>}
              </div> : <p className="mt-4 text-[13px] leading-6 text-slate-500">No hay trayectoria registrada.</p>}
            </div>
          </div>
        </article>;
      })}
    </section>
    <section id="institucion" aria-labelledby="institucion-title" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-10 pt-10">
      <div className="grid overflow-hidden rounded-[28px] bg-[#f2f5ff] md:grid-cols-[0.85fr_1.15fr]">
        <figure className="relative min-h-[240px] bg-[#111b3f] sm:min-h-[280px]"><Image src={fotoTema(m.nombre)} alt="" fill sizes="(max-width: 768px) 100vw, 480px" className="object-cover object-center" /><div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#111b3f]/75 via-transparent to-transparent" /></figure>
        <div className="p-6 sm:p-8"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5574ff]">La institución</p><h2 id="institucion-title" className="mt-3 text-2xl font-semibold tracking-[-0.035em]">¿Qué le corresponde?</h2><p className="mt-4 break-words whitespace-pre-line text-sm leading-7 text-slate-600">{m.descripcion || "Todavía no hay una descripción institucional registrada."}</p><div className="mt-5"><EnlaceExterno url={m.sitio_web}>Visitar el sitio oficial</EnlaceExterno></div></div>
      </div>
    </section>
    <section
  id="actividad"
  aria-labelledby="actividad-title"
  className="bg-[#f5f7fc]"
>
  <div className="mx-auto max-w-6xl scroll-mt-24 px-6 py-10 sm:py-12">
    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7863bd]">
      Lo documentado
    </p>

    <h2
      id="actividad-title"
      className="mt-3 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl"
    >
      Actividad reciente.
    </h2>

    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
      Programas, anuncios y actuaciones en un mismo recorrido. Consulta qué
      se ha registrado y las fuentes que lo respaldan; un anuncio no
      demuestra por sí solo un resultado.
    </p>

    {ar.error ? (
      <p className="mt-5 text-sm text-slate-600">
        No pudimos cargar la actividad.
      </p>
    ) : !actividades.length ? (
      <p className="mt-6 text-sm leading-7 text-slate-600">
        Todavía no hay actividad registrada en Pragma Radar para este
        ministerio.
      </p>
    ) : (
      <ol className="mt-8 space-y-5 border-l border-[#c3b6e3] pl-5 sm:pl-8">
        {actividades.map((a) => (
          <li key={a.id} className="relative">
            <span
              aria-hidden="true"
              className="absolute -left-[25px] top-6 h-2.5 w-2.5 rounded-full bg-[#5574ff] ring-4 ring-[#f2f3fd] sm:-left-[37px]"
            />

            <article className="grid overflow-hidden rounded-[22px] border border-[#dce4f5] bg-white md:grid-cols-[0.38fr_0.62fr]">
              <div className="relative min-h-[210px] bg-[#edf2ff]">
                <Image
                  src={fotoSegura(a.imagen_url) ?? fotoTema(m.nombre)}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  unoptimized={Boolean(urlSegura(a.imagen_url))}
                  className="object-cover"
                />

                {!fotoSegura(a.imagen_url) && (
                  <span className="absolute bottom-3 left-3 rounded bg-[#111b3f]/75 px-2 py-1 text-[10px] text-white">
                    Imagen de contexto
                  </span>
                )}
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <p className="text-xs font-semibold text-[#7863bd]">
                    {fecha(a.fecha) || "Fecha no registrada"}
                  </p>

                  {a.tipo && (
                    <p className="border-l border-[#c3b6e3] pl-4 text-[10px] font-medium uppercase tracking-[0.1em] text-[#52618c]">
                      {a.tipo.replaceAll("_", " ")}
                    </p>
                  )}
                </div>

                <h3 className="mt-3 break-words text-lg font-semibold leading-7 tracking-[-0.02em]">
                  {a.titulo}
                </h3>

                <details className="group mt-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-1 text-xs font-normal text-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff] [&::-webkit-details-marker]:hidden">
                    <span>
                      Detalles y fuentes
                      <span className="sr-only"> de {a.titulo}</span>
                    </span>

                    <FlechaDesplegable />
                  </summary>

                  {a.resumen && (
                    <p className="mt-4 whitespace-pre-line break-words text-sm leading-7 text-slate-700">
                      {a.resumen}
                    </p>
                  )}

                  {(fecha(a.fecha_inicio) || fecha(a.fecha_fin)) && (
                    <div className="mt-3 text-xs leading-6 text-slate-500">
                      {fecha(a.fecha_inicio) && (
                        <p>Inicio: {fecha(a.fecha_inicio)}</p>
                      )}

                      {fecha(a.fecha_fin) && (
                        <p>Fin registrado: {fecha(a.fecha_fin)}</p>
                      )}
                    </div>
                  )}

                  <Fuentes
                    items={fa.filter((f) => f.actividad_id === a.id)}
                    error={Boolean(far.error)}
                    oficial={a.url_oficial}
                  />
                </details>
              </div>
            </article>
          </li>
        ))}
      </ol>
    )}
  </div>
</section>
    <CitaPublica />
  </>;
}
