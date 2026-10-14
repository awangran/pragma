import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";

/* =========================================================
   NAVBAR
========================================================= */
async function NavbarWithUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user ?? null;
  const avatarUrl = user?.user_metadata?.avatar_url ?? null;
  return <Navbar user={user ? { avatarUrl } : null} />;
}

/* =========================================================
   ESTADOS
========================================================= */
const ESTADO_CONFIG = {
  cumplida: {
    label: "Cumplida",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    soft: "bg-emerald-50",
    bar: "bg-emerald-500",
  },
  en_proceso: {
    label: "En proceso",
    dot: "bg-amber-500",
    text: "text-amber-700",
    soft: "bg-amber-50",
    bar: "bg-amber-500",
  },
  no_cumplida: {
    label: "No cumplida",
    dot: "bg-rose-500",
    text: "text-rose-700",
    soft: "bg-rose-50",
    bar: "bg-rose-500",
  },
  sin_informacion: {
    label: "Sin información suficiente",
    dot: "bg-slate-300",
    text: "text-slate-600",
    soft: "bg-slate-100",
    bar: "bg-slate-300",
  },
} as const;

type Estado = keyof typeof ESTADO_CONFIG;
const ESTADOS = Object.keys(ESTADO_CONFIG) as Estado[];

type SeguimientoResumen = {
  propuesta_id: number;
  estado: Estado;
  que_cambio: string | null;
  fecha_evidencia: string | null;
};

type Item = {
  id: number;
  titulo: string | null;
  quePropone: string | null;
  estado: Estado;
  fechaEvidencia: string | null;
  queCambio: string | null;
};

type Sector = {
  id: number | null;
  titulo: string;
  extendido: string | null;
  items: Item[];
};

/* =========================================================
   ACENTOS POR TEMA
   Colores tomados de la paleta de la página de comparación.
========================================================= */
const ACENTOS = [
  { hex: "#4774ff", soft: "#eef2ff", grad: "from-[#d6e5ff] via-[#aee8ff] to-[#4776ff]" },
  { hex: "#7768ff", soft: "#f1efff", grad: "from-[#dfe8ff] via-[#b5d9ff] to-[#7768ff]" },
  { hex: "#4278ff", soft: "#eaf1ff", grad: "from-[#eee2ff] via-[#b9e7ff] to-[#4278ff]" },
  { hex: "#7863bd", soft: "#f4f0fb", grad: "from-[#e9e1ff] via-[#c9dcff] to-[#7863bd]" },
];

function acentoPara(index: number) {
  return ACENTOS[index % ACENTOS.length];
}

/* =========================================================
   HELPERS
========================================================= */
function estadoSeguro(value?: string | null): Estado {
  if (
    value === "cumplida" ||
    value === "en_proceso" ||
    value === "no_cumplida" ||
    value === "sin_informacion"
  ) {
    return value;
  }
  return "sin_informacion";
}

function formatFecha(value?: string | null) {
  if (!value) return null;
  const fecha = new Date(value);
  if (Number.isNaN(fecha.getTime())) return null;
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(fecha);
}

function contarPorEstado(items: Item[], estado: Estado) {
  return items.filter((item) => item.estado === estado).length;
}

/* =========================================================
   ICONOS
========================================================= */
function ArrowIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path d="M4 12h15M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* =========================================================
   IMÁGENES POR TEMA
========================================================= */
const TEMA_IMAGES_BY_ID: Record<number, string> = {
  1: "/tema-ciencia-tecnologia.jpg",
  2: "/tema-economia.jpg",
  3: "/tema-educacion.jpg",
  4: "/seguimiento-cafe.jpg",
  5: "/tema-energia.jpg",
  6: "/seguimiento-equidad.jpg",
  7: "/tema-infraestructura.jpg",
  8: "/tema-medio-ambiente.jpg",
  9: "/pragma-paz.avif",
  10: "/tema-politica-exterior.jpg",
  11: "/tema-salud.jpg",
  12: "/tema-seguridad.jpg",
};

function imagenTema(id: number | null) {
  if (id === null) return "/seguimiento-colombia.jpg";
  return TEMA_IMAGES_BY_ID[id] ?? "/seguimiento-colombia.jpg";
}

/* =========================================================
   PERSONAS DEL GOBIERNO (ESTÁTICO)
========================================================= */
const PERSONAS_GOBIERNO = [
  {
    nombre: "Abelardo de la Espriella",
    cargo: "Presidencia",
    imagen: "/Espriella.jpeg",
    perfil: "Derecho · Empresa · Política",
    bio: "Abogado penalista y empresario. Combina el ejercicio del derecho con iniciativas empresariales y la participación en el debate público.",
    detalles: [
      { titulo: "Formación", texto: "Egresado de Derecho de la Universidad Sergio Arboleda." },
      { titulo: "Recorrido profesional", texto: "Fundó De la Espriella Lawyers en 2002. Ha participado en procesos judiciales de amplia repercusión pública." },
    ],
    fuente: "https://laud.udistrital.edu.co/nacional/quien-es-abelardo-de-la-espriella-nuevo-presidente-de-colombia-2026-2030",
    medio: "LAUD · Universidad Distrital",
  },
  {
    nombre: "José Manuel Restrepo",
    cargo: "Vicepresidencia",
    imagen: "/restrepo.webp",
    perfil: "Economía · Academia · Gestión pública",
    bio: "Economista y académico. Fue ministro de Comercio y de Hacienda durante el gobierno de Iván Duque y ha dirigido instituciones de educación superior.",
    detalles: [
      { titulo: "Formación", texto: "Economista de la Universidad del Rosario, con estudios de posgrado en economía y dirección de instituciones de educación superior." },
      { titulo: "Recorrido profesional", texto: "Ha sido rector del CESA, de la Universidad del Rosario y de la Universidad EIA. Su experiencia pública incluye la gestión comercial y fiscal." },
    ],
    fuente: "https://www.agenciapi.co/noticia/de-memoria/quien-es-jose-manuel-restrepo-la-hoja-de-vida-del-nuevo-vicepresidente-de-colombia",
    medio: "Agencia de Periodismo Investigativo (API)",
  },
];

/* =========================================================
   MINISTERIOS
========================================================= */
async function GabineteSection() {
  const supabase = await createClient();

  const { data: ministeriosRaw, error } = await supabase
    .from("ministerios")
    .select(`
      id,
      nombre,
      slug,
      funcionarios_ministerio (
        id,
        cargo,
        bio,
        activo,
        nombre,
        ubicacion,
        avatar,
        fecha_inicio
      )
    `)
    .eq("funcionarios_ministerio.activo", true)
    .order("nombre", { ascending: true })
    .order("fecha_inicio", { referencedTable: "funcionarios_ministerio", ascending: false, nullsFirst: false })
    .order("id", { referencedTable: "funcionarios_ministerio", ascending: false });

  if (error) {
    console.error("Error cargando ministerios:", error);
  }

  const ministerios = (ministeriosRaw ?? [])
    .map((ministerio) => {
      const funcionarios = Array.isArray(ministerio.funcionarios_ministerio)
        ? ministerio.funcionarios_ministerio
        : [];

      const funcionario = funcionarios.find((item) => item.activo === true) ?? null;
      if (!funcionario) return null;

      return {
        ...ministerio,
        funcionario,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (ministerios.length === 0) {
    return (
      <p className="text-sm leading-7 text-slate-600">
        La información de los ministerios no está disponible por ahora.{" "}
        <Link href="/seguimiento/ministerios" className="text-[#5574ff] underline underline-offset-4">
          Consultar el directorio
        </Link>
      </p>
    );
  }

  const renderMinisterio = (ministerio: (typeof ministerios)[number]) => (
    <Link
      key={ministerio.id}
      href={`/seguimiento/ministerios/${ministerio.slug}`}
      className="group flex items-center gap-4 border-b border-[#dfe7f8] py-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff]"
    >
      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-[14px] bg-[#edf2ff] sm:w-20">
        {ministerio.funcionario.avatar ? (
          <Image
            src={ministerio.funcionario.avatar}
            alt={ministerio.funcionario.nombre ?? "Ministro o ministra"}
            fill
            sizes="80px"
            unoptimized
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
          />
        ) : (
          <span aria-hidden="true" className="flex h-full items-center justify-center text-lg font-semibold text-[#7863bd]">
            {(ministerio.funcionario.nombre ?? "")
              .trim()
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((parte: string) => parte[0])
              .join("")}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-base font-semibold leading-6 tracking-[-0.025em] text-[#111b3f] group-hover:text-[#243d9b]">
          {ministerio.nombre.replace(/^Ministerio\s+(?:de\s+|del\s+|para\s+)?/i, "")}
        </h4>
        <p className="mt-1 text-xs leading-5 text-slate-600">{ministerio.funcionario.nombre}</p>
      </div>
      <span className="shrink-0 text-[#5574ff]">
        <ArrowIcon />
      </span>
    </Link>
  );

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7863bd]">Ministerios</p>
          <h3 className="mt-2 text-2xl font-semibold leading-[1.1] tracking-[-0.035em] sm:text-3xl">
            Quién dirige cada sector del Gobierno
          </h3>
        </div>
        <Link
          href="/seguimiento/ministerios"
          className="inline-flex w-fit shrink-0 items-center gap-2 border-b border-[#243d9b]/40 pb-1.5 text-xs font-medium text-[#243d9b] transition hover:border-[#243d9b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff]"
        >
          Ver todos los ministerios
          <ArrowIcon />
        </Link>
      </div>
      <div className="mt-5 grid gap-x-8 sm:grid-cols-2">
        {ministerios.slice(0, 4).map(renderMinisterio)}
      </div>
    </div>
  );
}

/* =========================================================
   COMPROMISOS DE CAMPAÑA (VEEDURÍA)
========================================================= */
async function VeeduriaSection() {
  const supabase = await createClient();

  const { data: candidato } = await supabase
    .from("candidatos")
    .select("id, nombre, partido, avatar")
    .eq("id", 14)
    .single();

  if (!candidato) {
    return (
      <div className="rounded-[24px] bg-slate-50 px-8 py-16 text-center">
        <p className="text-sm text-slate-500">La información de seguimiento no está disponible.</p>
      </div>
    );
  }

  const { data: propuestasData, error: propuestasError } = await supabase
    .from("propuestas")
    .select(`
      id,
      titulo,
      que_propone,
      tema_id,
      tema:tema_id (
        id,
        titulo,
        tituloExtendido
      )
    `)
    .eq("candidato_id", candidato.id)
    .order("id", { ascending: true });

  if (propuestasError) {
    console.error("Error cargando propuestas:", propuestasError);
    return (
      <p role="status" className="py-10 text-sm text-slate-600">
        No pudimos cargar los compromisos. Intenta de nuevo más tarde.
      </p>
    );
  }

  const propuestas = propuestasData ?? [];
  const propuestaIds = propuestas.map((p) => p.id);

  const { data: seguimientosData, error: seguimientosError } =
    propuestaIds.length > 0
      ? await supabase
          .from("seguimientos")
          .select("id, propuesta_id, estado, que_cambio, fecha_evidencia, created_at")
          .in("propuesta_id", propuestaIds)
          .order("created_at", { ascending: false, nullsFirst: false })
          .order("id", { ascending: false })
      : { data: [], error: null };

  if (seguimientosError) {
    console.error("Error cargando seguimientos:", seguimientosError);
    return (
      <p role="status" className="py-10 text-sm text-slate-600">
        Los estados no están disponibles por ahora. Intenta de nuevo más tarde.
      </p>
    );
  }

  // La consulta viene del más reciente al más antiguo,
  // así que el primero por propuesta es el último estado registrado.
  const ultimoPorPropuesta = new Map<number, SeguimientoResumen>();
  for (const seg of seguimientosData ?? []) {
    if (!ultimoPorPropuesta.has(seg.propuesta_id)) {
      ultimoPorPropuesta.set(seg.propuesta_id, {
        propuesta_id: seg.propuesta_id,
        estado: estadoSeguro(seg.estado),
        que_cambio: seg.que_cambio,
        fecha_evidencia: seg.fecha_evidencia,
      });
    }
  }

  // Agrupar compromisos por tema.
  const sectoresMap = new Map<string, Sector>();
  for (const p of propuestas) {
    const relacion = Array.isArray(p.tema) ? p.tema[0] : p.tema;
    const seg = ultimoPorPropuesta.get(p.id);
    const titulo = relacion?.titulo ?? "Otros";
    const key = String(relacion?.id ?? `otros-${titulo}`);

    if (!sectoresMap.has(key)) {
      sectoresMap.set(key, {
        id: relacion?.id ?? null,
        titulo,
        extendido: relacion?.tituloExtendido ?? null,
        items: [],
      });
    }

    sectoresMap.get(key)!.items.push({
      id: p.id,
      titulo: p.titulo,
      quePropone: p.que_propone,
      estado: seg?.estado ?? "sin_informacion",
      fechaEvidencia: formatFecha(seg?.fecha_evidencia),
      queCambio: seg?.que_cambio ?? null,
    });
  }

  const sectores = Array.from(sectoresMap.values()).sort((a, b) =>
    a.titulo.localeCompare(b.titulo, "es")
  );

  const todosLosItems = sectores.flatMap((s) => s.items);
  const total = todosLosItems.length;
  const haySinInformacion = contarPorEstado(todosLosItems, "sin_informacion") > 0;

  return (
    <div>
      {/* RESUMEN */}
      <div className="overflow-hidden rounded-[24px] border border-[#dfe7ff] bg-gradient-to-br from-[#f2f5ff] via-[#f6f3ff] to-white p-6 sm:p-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5574ff]">
          Seguimiento a {total} compromisos
        </p>
        <h3 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-[#111b3f] sm:text-3xl">
          Compromisos de {candidato.nombre}
        </h3>

        <div aria-hidden="true" className="mt-6 flex h-2.5 overflow-hidden rounded-full bg-[#e4eaf5]">
          {ESTADOS.map((e) => {
            const cantidad = contarPorEstado(todosLosItems, e);
            return cantidad > 0 ? (
              <div
                key={e}
                className={ESTADO_CONFIG[e].bar}
                style={{ width: `${(cantidad / Math.max(total, 1)) * 100}%` }}
              />
            ) : null;
          })}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-4">
          {ESTADOS.map((e) => (
            <div key={e} className="border-l-2 border-[#c9d6ff] pl-4">
              <p className="text-2xl font-semibold tracking-[-0.04em] text-[#111b3f] sm:text-3xl">
                {contarPorEstado(todosLosItems, e)}
              </p>
              <p className="mt-1 flex items-start gap-2 text-xs leading-5 text-slate-600">
                <span aria-hidden="true" className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${ESTADO_CONFIG[e].dot}`} />
                {ESTADO_CONFIG[e].label}
              </p>
            </div>
          ))}
        </div>
      </div>

            {/* TEMAS EN ACORDEÓN */}
      <div className="mt-8 space-y-3">
        {sectores.map((sector, sectorIndex) => {
          const acento = acentoPara(sectorIndex);
          const imagen = imagenTema(sector.id);

          return (
            <details
              key={`${sector.id ?? "otros"}-${sector.titulo}`}
              className="group overflow-hidden rounded-[22px] border border-[#e2e9f8] bg-white transition-shadow open:shadow-[0_12px_32px_rgba(17,27,63,0.06)]"
              style={{ borderLeft: `4px solid ${acento.hex}` }}
            >
              <summary className="relative flex min-h-[132px] cursor-pointer list-none items-center gap-4 overflow-hidden p-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#5574ff] [&::-webkit-details-marker]:hidden sm:min-h-[150px] sm:gap-6 sm:p-7">
                {/* Imagen de fondo a todo el ancho, más visible */}
                <Image
                  src={imagen}
                  alt=""
                  fill
                  sizes="(max-width: 1152px) 100vw, 1152px"
                  className="object-cover transition duration-700 group-hover:scale-[1.03]"
                />

                {/* Velo claro en la zona del texto para que se lea bien */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    background:
  "linear-gradient(90deg, rgba(17,27,63,0.72) 0%, rgba(17,27,63,0.48) 42%, rgba(17,27,63,0.12) 75%, rgba(17,27,63,0.03) 100%)",
                  }}
                />

                <div className="relative z-10 min-w-0 flex-1 text-white">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                    style={{ color: "#d5ccff" }}
                  >
                    {sector.items.length} {sector.items.length === 1 ? "compromiso" : "compromisos"}
                  </p>
                  <h4 className="mt-1 text-lg font-semibold leading-6 tracking-[-0.03em] text-white sm:text-2xl">
                    {sector.titulo}
                  </h4>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {ESTADOS.map((e) => {
                      const cantidad = contarPorEstado(sector.items, e);
                      if (cantidad === 0) return null;
                      return (
                        <span
                          key={e}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${ESTADO_CONFIG[e].soft} ${ESTADO_CONFIG[e].text}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${ESTADO_CONFIG[e].dot}`} />
                          {cantidad} {ESTADO_CONFIG[e].label.toLowerCase()}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <span
                  aria-hidden="true"
                  className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white shadow-md transition duration-300 group-open:rotate-45"
                  style={{ backgroundColor: acento.hex }}
                >
                  +
                </span>
              </summary>

              <div
                className="px-4 pb-4 pt-4 sm:px-6 sm:pb-6"
                style={{ background: `linear-gradient(180deg, ${acento.soft} 0%, #ffffff 60%)` }}
              >
                {sector.extendido && (
                  <p className="mb-4 max-w-3xl text-xs leading-6 text-slate-600">{sector.extendido}</p>
                )}

                <ul className="space-y-3">
                  {sector.items.map((item, index) => {
                    const config = ESTADO_CONFIG[item.estado];
                    return (
                      <li key={item.id}>
                        <Link
                          href={`/seguimiento/${item.id}`}
                          className="group/item relative flex items-start gap-4 overflow-hidden rounded-[18px] bg-white p-4 shadow-[0_4px_16px_rgba(17,27,63,0.05)] ring-1 ring-black/[0.03] transition hover:shadow-[0_10px_28px_rgba(17,27,63,0.09)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff] sm:p-5"
                        >
                          <span
                            aria-hidden="true"
                            className="absolute inset-y-0 left-0 w-1"
                            style={{ backgroundColor: acento.hex }}
                          />

                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                            style={{ backgroundColor: acento.soft, color: acento.hex }}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${config.soft} ${config.text}`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                                {config.label}
                              </span>
                              {item.fechaEvidencia && (
                                <span className="text-[10px] text-slate-500">Evidencia del {item.fechaEvidencia}</span>
                              )}
                            </div>

                            <h5 className="mt-2.5 text-[15px] font-semibold leading-6 tracking-[-0.02em] text-[#111b3f] transition group-hover/item:text-[#5574ff]">
                              {item.titulo || "Compromiso sin título"}
                            </h5>

                            {item.queCambio ? (
                              <p className="mt-1.5 line-clamp-2 text-xs leading-6 text-slate-600">
                                <span className="font-semibold" style={{ color: acento.hex }}>
                                  Última actualización:{" "}
                                </span>
                                {item.queCambio}
                              </p>
                            ) : item.quePropone ? (
                              <p className="mt-1.5 line-clamp-2 text-xs leading-6 text-slate-600">{item.quePropone}</p>
                            ) : null}
                          </div>

                          <span
                            className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition duration-300 group-hover/item:translate-x-0.5 group-hover/item:text-white"
                            style={{ backgroundColor: acento.soft, color: acento.hex }}
                          >
                            <ArrowIcon className="h-3.5 w-3.5" />
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </details>
          );
        })}
      </div>

      {haySinInformacion && (
        <p className="mt-8 max-w-2xl border-t border-[#dce5fb] pt-4 text-xs leading-6 text-slate-600">
          “Sin información suficiente” significa que la evidencia disponible no permite determinar el estado. No equivale a cumplimiento ni a incumplimiento.
        </p>
      )}
    </div>
  );
}

/* =========================================================
   PÁGINA
========================================================= */
export default function SeguimientoPage() {
  return (
    <div className="w-full bg-white text-[#111b3f]">
      <main className="flex w-full flex-col items-center">
        <Suspense fallback={<Navbar user={null} />}>
          <NavbarWithUser />
        </Suspense>

        {/* HERO */}
        <section aria-labelledby="seguimiento-hero-title" className="mt-5 w-full">
          <div className="relative isolate overflow-hidden bg-[#111b3f]">
            <Image
              src="/portada2.jpg"
              alt="Pescadores en una embarcación en Colombia"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(17,27,63,0.90) 0%, rgba(17,27,63,0.60) 42%, rgba(17,27,63,0.08) 100%)",
              }}
            />
            <div className="relative z-10 mx-auto flex min-h-[500px] w-full max-w-6xl items-end px-6 py-10 sm:min-h-[540px] lg:min-h-[580px] lg:py-14">
              <div className="max-w-3xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d5ccff]">
                  Pragma Radar · Veeduría ciudadana
                </p>
                <h1
                  id="seguimiento-hero-title"
                  className="mt-6 text-[42px] font-semibold leading-[0.98] tracking-[-0.045em] text-white sm:text-6xl lg:text-[72px]"
                >
                  La política no<br />termina cuando<br />votas.
                </h1>
                <p className="mt-6 max-w-xl text-sm leading-7 text-white/90 sm:text-base">
                  Esta veeduría sigue la gestión del Gobierno: quiénes lo integran, qué acciones adelantan sus ministerios y cómo avanzan los compromisos de campaña.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* NAVEGACIÓN */}
        <nav aria-label="Secciones de la veeduría" className="w-full border-b border-[#e2e9f8]">
          <div className="mx-auto flex max-w-6xl flex-wrap gap-x-7 gap-y-3 px-6 py-5 text-xs font-medium text-[#243d9b]">
            <a href="#gobierno" className="border-b border-[#243d9b]/30 pb-1 hover:border-[#243d9b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff]">
              01 · Gobierno nacional
            </a>
            <a href="#veeduria" className="border-b border-[#243d9b]/30 pb-1 hover:border-[#243d9b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff]">
              02 · Compromisos
            </a>
          </div>
        </nav>

        {/* 01 · GOBIERNO Y MINISTERIOS */}
        <section
          id="gobierno"
          aria-labelledby="gobierno-title"
          className="w-full scroll-mt-24 bg-gradient-to-b from-white via-[#f6f8ff] to-white"
        >
          <div className="mx-auto w-full max-w-6xl px-6 py-12 md:py-14">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5574ff]">
                01 · Gobierno nacional
              </p>
              <h2
                id="gobierno-title"
                className="mt-3 text-3xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-4xl"
              >
                Presidente y vicepresidente electos
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Periodo 2026-2030.
              </p>
            </div>

            <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
              {PERSONAS_GOBIERNO.map((persona, index) => (
                <article
                  key={persona.nombre}
                  className="overflow-hidden rounded-[28px] border border-[#e2e9f8] bg-white"
                >
                  <div className="grid sm:grid-cols-[0.82fr_1.18fr]">
                    <div className="relative min-h-[260px] bg-[#e8edfb] sm:min-h-[300px]">
                      <Image
                        src={persona.imagen}
                        alt={persona.nombre}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 40vw, 230px"
                        className="object-cover"
                        style={{ objectPosition: "center 20%" }}
                      />
                      <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#3458d8]">
                        {persona.cargo}
                      </span>
                    </div>
                    <div className="flex flex-col justify-center p-6">
                      <p
                        className={
                          index === 0
                            ? "text-[9px] font-semibold uppercase tracking-[0.12em] text-[#5574ff]"
                            : "text-[9px] font-semibold uppercase tracking-[0.12em] text-[#7957c7]"
                        }
                      >
                        {persona.perfil}
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.035em]">
                        {persona.nombre}
                      </h3>
                      <p className="mt-4 text-xs leading-6 text-slate-600">{persona.bio}</p>
                    </div>
                  </div>

                  <details className="group border-t border-[#e2e9f8]">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 text-xs font-semibold text-[#3458d8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5574ff] [&::-webkit-details-marker]:hidden">
                      Ver trayectoria completa
                      <span
                        aria-hidden="true"
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#edf2ff] text-lg transition group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <div className="grid gap-4 px-6 pb-6 sm:grid-cols-2">
                      {persona.detalles.map((detalle) => (
                        <div key={detalle.titulo} className="border-l-2 border-[#bdcbff] pl-3">
                          <h4 className="text-xs font-semibold">{detalle.titulo}</h4>
                          <p className="mt-2 text-xs leading-6 text-slate-600">{detalle.texto}</p>
                        </div>
                      ))}
                      <a
                        href={persona.fuente}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] leading-5 text-[#5574ff] underline underline-offset-4 sm:col-span-2"
                      >
                        Fuente: {persona.medio}
                      </a>
                    </div>
                  </details>
                </article>
              ))}
            </div>

            <div className="mt-8 border-t border-[#e2e9f8] pt-8">
              <Suspense
                fallback={
                  <div role="status" className="h-40 animate-pulse rounded-[24px] bg-slate-100">
                    <span className="sr-only">Cargando ministerios…</span>
                  </div>
                }
              >
                <GabineteSection />
              </Suspense>
            </div>
          </div>
        </section>

        {/* 02 · COMPROMISOS */}
        <section id="veeduria" aria-labelledby="veeduria-title" className="w-full max-w-6xl scroll-mt-24 px-6 py-12 md:py-14">
          <div className="mb-9">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5574ff]">
              02 · Compromisos de campaña
            </p>
            <h2
              id="veeduria-title"
              className="mt-3 max-w-2xl text-3xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-4xl"
            >
              Las promesas valen lo que demuestran.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              Sabrás qué avanzó, qué falta y dónde se han registrado cambios.
            </p>
          </div>

          <Suspense
            fallback={
              <div role="status" className="h-56 animate-pulse rounded-[24px] bg-slate-100">
                <span className="sr-only">Cargando compromisos…</span>
              </div>
            }
          >
            <VeeduriaSection />
          </Suspense>
        </section>
      </main>
      <Footer />
    </div>
  );
}