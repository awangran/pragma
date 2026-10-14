import OpinionPromesaSection from "@/components/opinion-promesa-section";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronDown, History } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";

/* ============================================================
   NAVBAR
============================================================ */

async function NavbarWithUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user ?? null;
  const avatarUrl = user?.user_metadata?.avatar_url ?? null;
  return <Navbar user={user ? { avatarUrl } : null} />;
}

/* ============================================================
   ESTADOS
============================================================ */

const ESTADO_CONFIG = {
  cumplida: {
    label: "Cumplida",
    color: "#437363",
    bg: "bg-[#edf5f0]",
    text: "text-[#355b4e]",
  },
  en_proceso: {
    label: "En proceso",
    color: "#5574ff",
    bg: "bg-[#edf2ff]",
    text: "text-[#3455bf]",
  },
  no_cumplida: {
    label: "No cumplida",
    color: "#a65b70",
    bg: "bg-[#f8edf1]",
    text: "text-[#874459]",
  },
  sin_informacion: {
    label: "Sin información suficiente",
    color: "#94a3b8",
    bg: "bg-slate-100",
    text: "text-slate-600",
  },
} as const;

type EstadoVeeduria = keyof typeof ESTADO_CONFIG;
const ESTADOS = Object.keys(ESTADO_CONFIG) as EstadoVeeduria[];

const DESCRIPCIONES_ESTADO: Record<EstadoVeeduria, string> = {
  cumplida: "La evidencia registrada indica que el compromiso fue realizado.",
  en_proceso: "Hay evidencia de acciones en curso relacionadas con el compromiso.",
  no_cumplida: "La evidencia registrada indica que el compromiso no fue cumplido.",
  sin_informacion: "La información registrada no permite determinar su cumplimiento.",
};

/* ============================================================
   TIPOS
============================================================ */

type Tema = {
  id: number;
  titulo: string | null;
  tituloExtendido: string | null;
};

type Fuente = {
  id: number;
  seguimiento_id: number;
  titulo: string;
  url: string | null;
  tipo: string | null;
  fecha_fuente: string | null;
  created_at: string | null;
};

type Seguimiento = {
  id: number;
  propuesta_id: number;
  imagen_url?: string | null;
  estado: EstadoVeeduria;
  porcentaje: number | null;
  que_cambio: string | null;
  evidencia: string | null;
  fecha_evidencia: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type Propuesta = {
  id: number;
  candidato_id: number | null;
  tema_id: number | null;
  titulo: string | null;
  que_pasa: string | null;
  que_propone: string | null;
  que_cambia: string | null;
  created_at: string;
  tema: Tema | Tema[] | null;
};

type Candidato = {
  id: number;
  nombre: string | null;
};

/* ============================================================
   CONSTANTES
============================================================ */

const TIPO_FUENTE_LABELS: Record<string, string> = {
  documento_oficial: "Documento oficial",
  datos_publicos: "Datos públicos",
  declaracion_funcionario: "Declaración de funcionario",
  contrato: "Contrato",
  informe: "Informe",
  noticia: "Noticia",
  decreto: "Decreto",
  acta: "Acta",
  video: "Video",
  comunicado: "Comunicado",
  otra: "Otra fuente",
  otro: "Otra fuente",
};

const IMAGENES_TEMA: Record<number, string> = {
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

/* ============================================================
   HELPERS
============================================================ */

function getEstadoConfig(estado?: string | null) {
  if (estado && Object.prototype.hasOwnProperty.call(ESTADO_CONFIG, estado)) {
    return ESTADO_CONFIG[estado as EstadoVeeduria];
  }
  return ESTADO_CONFIG.sin_informacion;
}

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(`${value.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function safeUrl(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

/* ============================================================
   PÁGINA
============================================================ */

async function SeguimientoDetalleContenido({
  params,
}: {
  params: Promise<{ promesaId: string }>;
}) {
  /*
   * La carpeta todavía puede llamarse [promesaId].
   * Internamente usamos propuestaId porque la fuente canónica
   * es public.propuestas.
   */
  const { promesaId } = await params;
  const propuestaId = Number(promesaId);

  if (!/^\d+$/.test(promesaId) || !Number.isSafeInteger(propuestaId) || propuestaId <= 0) {
    notFound();
  }

  const supabase = await createClient();

  /* PROPUESTA */

  const { data: propuestaRaw, error: propuestaError } = await supabase
    .from("propuestas")
    .select(`
      id,
      candidato_id,
      tema_id,
      titulo,
      que_pasa,
      que_propone,
      que_cambia,
      created_at,
      tema:tema_id (
        id,
        titulo,
        tituloExtendido
      )
    `)
    .eq("id", propuestaId)
    .single();

  if (propuestaError || !propuestaRaw) {
    console.error("Error cargando propuesta:", propuestaError);
    notFound();
  }

  const propuesta = propuestaRaw as unknown as Propuesta;

  /* CANDIDATO */

  let candidato: Candidato | null = null;

  if (propuesta.candidato_id !== null) {
    const { data: candidatoRaw } = await supabase
      .from("candidatos")
      .select("id, nombre")
      .eq("id", propuesta.candidato_id)
      .maybeSingle();

    candidato = candidatoRaw as Candidato | null;
  }

  /* SEGUIMIENTOS */

  const { data: seguimientosRaw, error: seguimientosError } = await supabase
    .from("seguimientos")
    .select("*")
    .eq("propuesta_id", propuestaId)
    .order("created_at", { ascending: false });

  if (seguimientosError) {
    console.error("Error cargando seguimientos:", seguimientosError);
  }

  const seguimientos = (seguimientosRaw ?? []) as Seguimiento[];

  /* FUENTES */

  const seguimientoIds = seguimientos.map((seguimiento) => seguimiento.id);

  let fuentes: Fuente[] = [];
  let errorFuentes = false;

  if (seguimientoIds.length > 0) {
    const { data: fuentesRaw, error: fuentesError } = await supabase
      .from("fuentes")
      .select(`
        id,
        seguimiento_id,
        titulo,
        url,
        tipo,
        fecha_fuente,
        created_at
      `)
      .in("seguimiento_id", seguimientoIds)
      .order("created_at", { ascending: false });

    if (fuentesError) {
      errorFuentes = true;
      console.error("Error cargando fuentes:", fuentesError);
    }

    fuentes = (fuentesRaw ?? []) as Fuente[];
  }

  const fuentesPorSeguimiento = new Map<number, Fuente[]>();
  for (const fuente of fuentes) {
    const actuales = fuentesPorSeguimiento.get(fuente.seguimiento_id) ?? [];
    actuales.push(fuente);
    fuentesPorSeguimiento.set(fuente.seguimiento_id, actuales);
  }

  /* DATOS DERIVADOS */

  const ultimoSeguimiento = seguimientos[0] ?? null;
  const config = getEstadoConfig(ultimoSeguimiento?.estado ?? "sin_informacion");

  const temaRelacion = Array.isArray(propuesta.tema) ? propuesta.tema[0] : propuesta.tema;
  const nombreTema = temaRelacion?.titulo || "Compromiso público";
  const imagenTema =
    IMAGENES_TEMA[temaRelacion?.id ?? propuesta.tema_id ?? -1] ?? "/seguimiento-colombia.jpg";

  const porcentaje = ultimoSeguimiento?.porcentaje;
  const porcentajeValido =
    typeof porcentaje === "number" && Number.isFinite(porcentaje) && porcentaje >= 0 && porcentaje <= 100;

  const estadoActual = ultimoSeguimiento?.estado ?? "sin_informacion";
  const historial = [...seguimientos].sort((a, b) => {
    const fechaA = a.fecha_evidencia ?? a.created_at?.slice(0, 10) ?? "";
    const fechaB = b.fecha_evidencia ?? b.created_at?.slice(0, 10) ?? "";
    return fechaB.localeCompare(fechaA) || b.id - a.id;
  });

  const etapasPrometidas = [
    { numero: "01", titulo: "El problema", texto: propuesta.que_pasa },
    { numero: "02", titulo: "La propuesta", texto: propuesta.que_propone },
    { numero: "03", titulo: "El cambio esperado", texto: propuesta.que_cambia },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-white text-[#111b3f]">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<Navbar user={null} />}>
          <NavbarWithUser />
        </Suspense>
      </div>

      <main className="flex w-full flex-1 flex-col items-center">
        {/* VOLVER */}
        <div className="w-full max-w-6xl px-6 pb-4 pt-5">
          <Link
            href="/seguimiento#veeduria"
            className="inline-flex max-w-full items-center gap-2 break-words text-xs font-semibold text-[#5574ff] underline decoration-[#5574ff]/40 underline-offset-4 hover:decoration-[#5574ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff]"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Todos los compromisos
          </Link>
        </div>

        {/* 1 · ENCABEZADO */}
        <header className="relative isolate w-full overflow-hidden bg-[#111b3f] text-white">
          <Image src={imagenTema} alt="" fill priority sizes="100vw" className="pointer-events-none object-cover object-center" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(17,27,63,0.94) 0%, rgba(17,27,63,0.80) 48%, rgba(17,27,63,0.22) 100%)" }} />
          <div className="relative z-10 mx-auto flex min-h-[260px] w-full max-w-6xl items-end px-6 py-10 sm:min-h-[300px] sm:py-10">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase leading-6 tracking-[0.2em] text-[#d5ccff] sm:text-xs">
                  {nombreTema}
                </p>

                <h1 className="mt-3 text-3xl font-semibold leading-[1.1] tracking-[-0.035em] text-white sm:text-4xl">
                  {propuesta.titulo || "Compromiso electoral"}
                </h1>

                {candidato?.nombre && (
                  <p className="mt-4 text-sm leading-6 text-white/85">
                    Compromiso de <span className="font-semibold text-white">{candidato.nombre}</span>
                  </p>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                  {!seguimientosError && (
                    <span
                      aria-label={`Estado según la evidencia registrada: ${config.label}`}
                      className="inline-flex items-center gap-3 text-sm font-semibold text-white"
                    >
                      <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-white/10" style={{ backgroundColor: config.color }} />
                      {config.label}
                    </span>
                  )}
                </div>
              </div>
          </div>
        </header>

        <nav aria-label="Secciones del compromiso" className="mx-auto flex w-full max-w-6xl flex-wrap gap-x-7 gap-y-3 px-6 pt-6 text-xs font-medium text-[#243d9b]">
          <a href="#propuesta" className="border-b border-[#a5b8ff] pb-1">La propuesta</a>
          <a href="#estado-actual" className="border-b border-[#a5b8ff] pb-1">Estado actual</a>
          <a href="#opinion-ciudadana" className="border-b border-[#a5b8ff] pb-1">Opinión ciudadana</a>
        </nav>

        {/* 2 · LO PROMETIDO */}
        <section id="propuesta" aria-labelledby="prometido-title" className="my-10 w-full scroll-mt-24 max-w-6xl px-6 sm:my-12">
          <div className="relative isolate overflow-hidden rounded-[28px] bg-[#111b3f] p-6 text-white sm:p-8 [&>p]:relative [&>h2]:relative [&>ol]:relative">
            <Image src="/cartagena2.jpg" alt="" fill sizes="(max-width: 1152px) 100vw, 1152px" className="pointer-events-none object-cover object-center" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(17,27,63,0.22) 0%, rgba(17,27,63,0.48) 38%, rgba(17,27,63,0.70) 100%)" }} />
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d5ccff]">Lo prometido</p>
            <h2 id="prometido-title" className="mt-3 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
              ¿Qué se planteó hacer?
            </h2>

            <ol className="mt-8 grid gap-x-7 gap-y-6 md:grid-cols-3">
              {etapasPrometidas.map((etapa) => (
                <li key={etapa.numero} className="border-t border-white/40 bg-[#111b3f]/30 p-4 sm:p-5" >
                  <p className="text-[10px] font-semibold tracking-[0.15em] text-[#d5ccff]">{etapa.numero}</p>
                  <h3 className="mt-2 text-base font-semibold tracking-[-0.02em]">{etapa.titulo}</h3>
                  <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-white/95">
                    {etapa.texto?.trim() || "Sin información registrada."}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 3 · ESTADO ACTUAL */}
        <section id="estado-actual" aria-labelledby="resumen-title" className="w-full scroll-mt-24 border-y border-[#dfe7f8] bg-[#f2f5ff] text-[#111b3f]">
          <div className="mx-auto w-full max-w-6xl px-6 py-7 sm:py-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7863bd]">Estado actual</p>
          <h2 id="resumen-title" className="mt-3 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
            ¿Dónde va este compromiso?
          </h2>
          <div className="mt-5 grid gap-8 md:grid-cols-[1fr_auto] md:items-start">
            <p className="max-w-2xl text-sm leading-7 text-slate-700">
              {seguimientosError
                ? "No pudimos cargar las actualizaciones. Intenta consultar esta página nuevamente."
                : DESCRIPCIONES_ESTADO[estadoActual] ||
                  "Todavía no hay una evaluación documentada para este compromiso."}
            </p>

            <dl className="flex flex-wrap gap-6 md:min-w-[260px]">
              <div className="border-l-2 border-[#c7b5ff] pl-3">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7863bd]">Actualizaciones</dt>
                <dd className="mt-1 text-xl font-semibold tracking-[-0.03em]">
                  {seguimientosError ? "—" : seguimientos.length}
                </dd>
              </div>
              <div className="border-l-2 border-[#c7b5ff] pl-3">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7863bd]">Fuentes</dt>
                <dd className="mt-1 text-xl font-semibold tracking-[-0.03em]">
                  {errorFuentes || seguimientosError ? "—" : fuentes.length}
                </dd>
              </div>
              {porcentajeValido && (
                <div className="border-l-2 border-[#c7b5ff] pl-3">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7863bd]">Avance registrado</dt>
                  <dd className="mt-1 text-xl font-semibold tracking-[-0.03em]">{porcentaje}%</dd>
                </div>
              )}
            </dl>
          </div>

          {porcentajeValido && (
            <p className="mt-4 max-w-2xl text-xs leading-6 text-slate-500">
              El avance pertenece a la última actualización. No se calcula automáticamente a partir de las fuentes o los registros.
            </p>
          )}
          <Suspense fallback={<p role="status" className="mt-7 border-t border-[#dfe7f8] pt-5 text-xs text-slate-500">Cargando opinión ciudadana…</p>}>
            <OpinionPromesaSection propuestaId={propuestaId} />
          </Suspense>
          </div>
        </section>

        {/* 4 · CRONOLOGÍA */}
        <section id="historial" aria-labelledby="historial-title" className="w-full max-w-6xl scroll-mt-24 px-6 py-7 sm:py-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7863bd]">Hechos y fuentes</p>
          <h2 id="historial-title" className="mt-3 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">De la promesa a las acciones.</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">Cada registro resume un hecho. Expándelo para conocer los detalles y consultar sus fuentes.</p>

          {seguimientosError ? (
            <p role="status" className="mt-8 rounded-[24px] bg-[#f2f5ff] p-6 text-sm leading-7 text-slate-600">No pudimos cargar el historial. Este error no determina el cumplimiento del compromiso.</p>
          ) : historial.length > 0 ? (
            <ol className="relative ml-2 mt-7 space-y-5 border-l border-[#c7b5ff] pl-6 sm:pl-8">
              {historial.map((seguimiento) => {
                const listaFuentes = fuentesPorSeguimiento.get(seguimiento.id) ?? [];
                const fechaEvidencia = formatDate(seguimiento.fecha_evidencia);
                const fechaRegistroItem = formatDate(seguimiento.created_at);
                const fotoPropia = seguimiento.imagen_url?.startsWith("/") && !seguimiento.imagen_url.startsWith("//")
                  ? seguimiento.imagen_url : safeUrl(seguimiento.imagen_url);
                const cambio = seguimiento.que_cambio?.trim();
                const evidencia = seguimiento.evidencia?.trim();
                const mostrarEvidencia = evidencia && evidencia !== cambio;
                const textoCompleto = cambio || evidencia || "No hay una descripción registrada.";
                const esLargo = textoCompleto.length > 240;
                const resumenBreve = esLargo ? `${textoCompleto.slice(0, 240).replace(/\s+\S*$/, "")}…` : textoCompleto;
                return (
                  <li key={seguimiento.id} className="relative">
                    <span aria-hidden="true" className="absolute -left-[29px] top-7 h-2.5 w-2.5 rounded-full bg-[#7863bd] ring-4 ring-white sm:-left-[37px]" />
                    <article className="grid overflow-hidden rounded-[26px] border border-[#dfe7f8] bg-white md:grid-cols-[0.26fr_0.74fr]">
                      <div className="relative min-h-[150px] bg-[#edf2ff] md:min-h-[190px]">
                        <Image src={fotoPropia ?? imagenTema} alt="" fill sizes="(max-width: 768px) 100vw, 380px" unoptimized={Boolean(safeUrl(fotoPropia))} className="object-cover object-center" />
                        {!fotoPropia && <span className="absolute bottom-4 left-4 rounded bg-[#111b3f]/80 px-2.5 py-1.5 text-[10px] text-white">Imagen de contexto</span>}
                      </div>
                      <div className="min-w-0 p-5 sm:p-6 [&:has(details[open])_.resumen-actividad]:hidden">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                          <p className="text-sm font-semibold text-[#7863bd]">{fechaEvidencia ?? fechaRegistroItem ?? "Fecha pendiente de registrar"}</p>
                          {seguimiento.id === ultimoSeguimiento?.id && <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#5574ff]">Evaluación actual</span>}
                        </div>
                        <h3 className="sr-only">Qué ocurrió</h3>
                        <p className="resumen-actividad mt-3 break-words text-sm leading-7 text-[#43506b]">{resumenBreve}</p>
                        <details className="group mt-4 border-t border-[#e2e9f8] pt-3">
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5574ff] [&::-webkit-details-marker]:hidden">
                            <span className="text-xs font-normal tracking-wide text-[#7863bd] transition-colors hover:text-[#5574ff]">
                              <span className="group-open:hidden">Detalles y fuentes</span>
                              <span className="hidden group-open:inline">Mostrar menos</span>
                            </span>
                            <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-[#7863bd] transition-transform group-open:rotate-180" />
                          </summary>
                          <p className="mt-4 whitespace-pre-line break-words text-sm leading-7 text-slate-600">{textoCompleto}</p>
                          {mostrarEvidencia && cambio && <div className="mt-4"><p className="text-[10px] font-medium uppercase tracking-wider text-[#7863bd]">Qué respalda la evaluación</p><p className="mt-2 whitespace-pre-line break-words text-sm leading-7 text-slate-600">{evidencia}</p></div>}
                          <div className="mt-5 border-t border-[#e2e9f8] pt-3">
                            <p className="text-[10px] font-medium text-slate-500">Fuentes</p>
                            {errorFuentes ? <p className="mt-2 text-xs text-slate-500">No pudimos cargar las fuentes.</p> : listaFuentes.length ? (
                              <ul className="mt-2 space-y-2">
                                {listaFuentes.map((fuente) => {
                                  const url = safeUrl(fuente.url);
                                  return <li key={fuente.id} className="text-xs leading-6 text-slate-500">
                                    <span>{TIPO_FUENTE_LABELS[fuente.tipo ?? ""] || "Otra fuente"} · </span>
                                    {url ? <a href={url} target="_blank" rel="noopener noreferrer" className="break-words text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-[#5574ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5574ff]">{fuente.titulo || new URL(url).hostname}<span className="sr-only"> (abre en otra pestaña)</span></a> : <span>{fuente.titulo || "Fuente sin enlace"}</span>}
                                  </li>;
                                })}
                              </ul>
                            ) : <p className="mt-2 text-xs text-slate-500">No hay fuentes asociadas a esta actualización.</p>}
                          </div>
                        </details>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="mt-8 grid overflow-hidden rounded-[26px] bg-[#f2f5ff] sm:grid-cols-[0.35fr_0.65fr]">
              <div className="relative min-h-[200px]"><Image src={imagenTema} alt="" fill sizes="(max-width: 640px) 100vw, 380px" className="object-cover" /></div>
              <div className="p-6 sm:p-8"><History aria-hidden="true" className="h-5 w-5 text-[#7863bd]" /><h3 className="mt-4 text-xl font-semibold">El seguimiento está por comenzar.</h3><p className="mt-3 text-sm leading-7 text-slate-600">Todavía no hay actualizaciones documentadas. La ausencia de registros no permite concluir que la propuesta se haya cumplido o incumplido.</p></div>
            </div>
          )}
        </section>

        <section
  aria-label="Cómo interpretar el estado"
  className="relative isolate w-full overflow-hidden bg-[#111b3f] text-white"
>
  <Image
    src="/congreso.jpg"
    alt=""
    fill
    sizes="100vw"
    className="pointer-events-none object-cover object-right"
  />

  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0"
    style={{
      background:
        "linear-gradient(90deg, rgba(17,27,63,0.94) 0%, rgba(17,27,63,0.82) 55%, rgba(17,27,63,0.40) 100%)",
    }}
  />

  <details className="group relative z-10 mx-auto w-full max-w-6xl px-6">
    <summary className="flex min-h-[130px] cursor-pointer list-none items-center justify-between gap-6 py-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#c7b5ff] sm:min-h-[150px] sm:py-10 [&::-webkit-details-marker]:hidden">
      <div className="max-w-xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d5ccff]">
          Leer la evidencia
        </p>

        <h2 className="mt-3 text-2xl font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-3xl">
          ¿Qué significa cada estado?
        </h2>

        <p className="mt-3 max-w-md text-xs leading-6 text-white/85">
          Cada clasificación depende de la información registrada.
          Conoce qué permite concluir.
        </p>
      </div>

      <ChevronDown
        aria-hidden="true"
        className="h-6 w-6 shrink-0 text-[#d5ccff] transition-transform duration-300 group-open:rotate-180 motion-reduce:transition-none"
      />
    </summary>

    <div className="pb-8 sm:pb-10">
      <dl className="grid gap-x-10 sm:grid-cols-2">
        {ESTADOS.map((estado) => {
          const configEstado = ESTADO_CONFIG[estado];

          return (
            <div
              key={estado}
              className="border-t border-white/25 py-5"
            >
              <dt className="flex items-center gap-3 text-sm font-semibold text-white">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-white/10"
                  style={{ backgroundColor: configEstado.color }}
                />
                {configEstado.label}
              </dt>

              <dd className="mt-3 max-w-md pl-[22px] text-xs leading-6 text-white/85">
                {DESCRIPCIONES_ESTADO[estado]}
              </dd>
            </div>
          );
        })}
      </dl>

      <p className="mt-5 max-w-2xl border-l-2 border-[#c7b5ff] pl-4 text-xs leading-6 text-white/90">
        La falta de información no demuestra, por sí sola,
        cumplimiento ni incumplimiento.
      </p>
    </div>
  </details>
</section>
      </main>

      <footer>
        <Suspense fallback={<div className="px-8 py-6 text-sm text-slate-500">Cargando pie de página…</div>}>
          <Footer />
        </Suspense>
      </footer>
    </div>
  );
}

/* El límite de Suspense envuelve al componente que consulta Supabase y espera params. */
export default function SeguimientoDetallePage({
  params,
}: {
  params: Promise<{ promesaId: string }>;
}) {
  return (
    <Suspense fallback={<SeguimientoDetalleCargando />}>
      <SeguimientoDetalleContenido params={params} />
    </Suspense>
  );
}

function SeguimientoDetalleCargando() {
  return (
    <div className="min-h-screen bg-white text-[#111b3f]">
      <div className="px-4 sm:px-6 lg:px-8">
        <Navbar user={null} />
      </div>
      <div role="status" className="mx-auto w-full max-w-6xl px-6 py-10">
        <p className="text-sm text-[#7863bd]">Cargando el seguimiento…</p>
        <div aria-hidden="true" className="mt-6 space-y-5 motion-safe:animate-pulse">
          <div className="h-56 rounded-[32px] bg-[#edf2ff]" />
          <div className="h-5 w-2/3 rounded bg-[#f1ebfa]" />
          <div className="h-32 rounded-[22px] bg-[#f6f7fb]" />
        </div>
      </div>
    </div>
  );
}