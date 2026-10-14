import { Suspense, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen, ChevronDown, Wallet, BriefcaseBusiness, Droplets, HeartHandshake, WifiOff, Trees } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import ArticlesFilterClient from "@/components/articles-filter-client";
async function NavbarWithUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user ?? null;
  const avatarUrl = user?.user_metadata?.avatar_url ?? null;
  return <Navbar user={user ? { avatarUrl } : null} />;
}
type Articulo = {
  id: number;
  titulo: string;
  resumen: string;
  categoria: string;
  foto?: string | null;
  created_at?: string | null;
};
type DatoPais = {
  cifra: string;
  titulo: string;
  periodo: string;
  texto: string;
  queMide: string;
  noConcluye: string;
  fuente: string;
  fuenteNombre: string;
};
const DATOS: Record<string, DatoPais> = {
  pobreza: {
    cifra: "28,0 %",
    titulo: "Pobreza monetaria nacional",
    periodo: "2025",
    texto:
      "Más de una de cada cuatro personas tenía ingresos por debajo de la línea de pobreza monetaria.",
    queMide:
      "La proporción de personas cuyos ingresos no alcanzan el umbral definido para cubrir necesidades básicas.",
    noConcluye:
      "No describe por sí sola acceso a vivienda, salud, educación, seguridad o calidad de vida.",
    fuente: "https://www.dane.gov.co/files/operaciones/PM/cp-PM-2025.pdf",
    fuenteNombre: "DANE",
  },
  rural: {
    cifra: "39,5 %",
    titulo: "Pobreza en centros poblados y rural disperso",
    periodo: "2025",
    texto:
      "La cifra fue 14,9 puntos porcentuales mayor que el 24,6 % registrado en cabeceras municipales.",
    queMide:
      "La pobreza monetaria en áreas rurales y centros poblados, según la clasificación usada por el DANE.",
    noConcluye:
      "No permite explicar por sí sola las causas de la brecha entre territorios.",
    fuente: "https://www.dane.gov.co/files/operaciones/PM/cp-PM-2025.pdf",
    fuenteNombre: "DANE",
  },
  trabajo: {
    cifra: "55,3 %",
    titulo: "Informalidad laboral",
    periodo: "2026",
    texto:
      "Más de la mitad de las personas ocupadas se clasificaban como informales en ese trimestre móvil.",
    queMide:
      "Personas que trabajan y que el DANE clasifica como informales. No es una cifra de desempleo.",
    noConcluye:
      "No indica automáticamente que todas las personas informales tengan el mismo ingreso o las mismas condiciones.",
    fuente:
      "https://www.dane.gov.co/files/operaciones/GEIH/bol-GEIHEISS-dic2025-feb2026.pdf",
    fuenteNombre: "DANE",
  },
  agua: {
    cifra: "4,49 millones",
    titulo: "Personas rurales sin cobertura de acueducto",
    periodo: "2024",
    texto:
      "De los 5,20 millones de personas sin cobertura de acueducto en el país, 4,49 millones vivían en zonas rurales.",
    queMide:
      "La cobertura reportada de acueducto; no equivale a una evaluación completa de la prestación del servicio.",
    noConcluye:
      "Tener cobertura no garantiza agua apta para consumo ni servicio continuo durante todo el día.",
    fuente:
      "https://sisconpes.dnp.gov.co/SisCONPESWeb/Content/documentos-gente/CONPES_GENTE_4165.pdf",
    fuenteNombre: "DNP",
  },
  mayores: {
    cifra: "1,05 millones",
    titulo: "Personas mayores potencialmente elegibles sin subsidio",
    periodo: "2025",
    texto:
      "Cumplían los requisitos identificados hasta C01 del Sisbén IV, pero no recibían el subsidio de Colombia Mayor ni estaban en lista de espera.",
    queMide:
      "Personas mayores potencialmente elegibles para Colombia Mayor, según los criterios y el corte del decreto citado.",
    noConcluye:
      "No corresponde al total de personas mayores sin pensión ni al total de personas mayores en situación de pobreza.",
    fuente: "https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?dt=S&i=191807",
    fuenteNombre: "Decreto 1342",
  },
  internet: {
    cifra: "34,4 %",
    titulo: "Hogares sin internet",
    periodo: "2024",
    texto:
      "Cerca de un tercio de los hogares no contaba con conexión a internet.",
    queMide:
      "Hogares sin conexión fija ni móvil. Se calcula como 100 % menos el 65,6 % con internet reportado por la ECV 2024.",
    noConcluye:
      "No informa sobre velocidad, estabilidad, costo, habilidades digitales o calidad de uso.",
    fuente: "https://www.dane.gov.co/files/operaciones/ECV/bol-ECV-2024.pdf",
    fuenteNombre: "DANE",
  },
  bosques: {
    cifra: "119.483 ha",
    titulo: "Bosque perdido por deforestación",
    periodo: "2025",
    texto:
      "La pérdida fue mayor que las 113.608 hectáreas reportadas para 2024.",
    queMide:
      "La superficie de bosque natural perdida durante el año, según el monitoreo del IDEAM.",
    noConcluye:
      "No atribuye por sí sola la pérdida a una causa, actor, política o decisión específica.",
    fuente: "https://www.ideam.gov.co/file-download/download/public/21833",
    fuenteNombre: "IDEAM",
  },
};
const INDICE = [
  { ancla: "#ingresos", etiqueta: "Ingresos", icono: Wallet },
  { ancla: "#trabajo", etiqueta: "Trabajo", icono: BriefcaseBusiness },
  { ancla: "#bosques", etiqueta: "Bosques", icono: Trees },
  { ancla: "#agua", etiqueta: "Agua", icono: Droplets },
  { ancla: "#vejez", etiqueta: "Vejez", icono: HeartHandshake },
  { ancla: "#conectividad", etiqueta: "Internet", icono: WifiOff },
];
/* =========================================================
   COMPONENTES
========================================================= */
/* Franja a pantalla completa. `derecha` alinea el texto a la derecha.
   Usa alternancia: izquierda, derecha, izquierda, derecha… */
function FranjaFoto({
  src,
  id,
  tituloId,
  derecha = false,
  position = "center",
  portada = false,
  children,
}: {
  src: string;
  id?: string;
  tituloId: string;
  derecha?: boolean;
  position?: string;
  portada?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={tituloId}
      className={`relative isolate w-[calc(100%+2rem)] scroll-mt-24 overflow-hidden bg-[#111b3f] sm:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)] ${
        portada ? "mt-5" : ""
      }`}
    >
      <Image
        src={src}
        alt=""
        fill
        priority={portada}
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: position }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: derecha
            ? "linear-gradient(270deg, rgba(17,27,63,0.96) 0%, rgba(17,27,63,0.88) 30%, rgba(17,27,63,0.48) 54%, rgba(17,27,63,0.05) 79%)"
            : "linear-gradient(90deg, rgba(17,27,63,0.96) 0%, rgba(17,27,63,0.88) 30%, rgba(17,27,63,0.48) 54%, rgba(17,27,63,0.05) 79%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[#111b3f]/40 lg:hidden"
      />
      <div
        className={`relative z-10 mx-auto flex w-full max-w-6xl items-center px-6 py-12 text-white md:py-14 ${
          portada ? "min-h-[480px] sm:min-h-[540px]" : "min-h-[340px] sm:min-h-[380px]"
        } ${derecha ? "lg:justify-end" : ""}`}
      >
        <div className="w-full max-w-[535px]">{children}</div>
      </div>
    </section>
  );
}
function Frase({
  etiqueta,
  autor,
  fuente,
  adaptada = false,
  children,
}: {
  etiqueta: string;
  autor: string;
  fuente: string;
  adaptada?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="w-[calc(100%+2rem)] bg-gradient-to-r from-[#f2f6ff] via-[#f7f5ff] to-white sm:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)]">
      <div className="mx-auto w-full max-w-6xl px-6 py-8 md:py-10">
        <figure className="max-w-2xl border-l-2 border-[#a5b8ff] pl-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5574ff]">
            {etiqueta}
          </p>
          {adaptada ? (
            <p className="mt-3 text-sm leading-7 text-slate-600">{children}</p>
          ) : (
            <blockquote className="mt-3 text-sm leading-7 text-slate-600">“{children}”</blockquote>
          )}
          <figcaption className="mt-2 text-xs leading-6 text-slate-500">
            <a
              href={fuente}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-[#a5b8ff]/60 underline-offset-4 hover:text-[#3458d8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff]"
            >
              {autor}
            </a>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
function DatoPrincipal({ dato, descripcion }: { dato: DatoPais; descripcion: string }) {
  return (
    <div className="mt-7 border-t border-white/25 pt-6">
      <p className="text-4xl font-semibold leading-none tracking-[-0.045em] sm:text-[44px]">
        {dato.cifra}
      </p>
      <p className="mt-3 max-w-[320px] text-sm font-medium leading-6 text-white/95">
        {descripcion}
      </p>
      <p className="mt-3 text-[11px] leading-5 text-white/80">
        {dato.periodo} ·{" "}
        <a
          href={dato.fuente}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Consultar fuente: ${dato.titulo}`}
          className="underline underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          {dato.fuenteNombre}
        </a>
      </p>
    </div>
  );
}
function DetalleDato({ dato, children }: { dato: DatoPais; children?: ReactNode }) {
  return (
    <details className="group mt-6 border-t border-white/25 pt-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-1 text-xs font-normal text-[#ded5ff] [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
        Qué hay detrás del dato
        <ChevronDown
          aria-hidden="true"
          className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <div className="pb-2 pt-4 text-xs leading-6 text-white/90">
        {children}
        <dl className="mt-4 space-y-4">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#ded5ff]">Qué cuenta</dt>
            <dd className="mt-1">{dato.queMide}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#ded5ff]">Qué no nos dice</dt>
            <dd className="mt-1">{dato.noConcluye}</dd>
          </div>
        </dl>
      </div>
    </details>
  );
}
function Barra({
  etiqueta,
  valor,
  ancho,
  destacada = false,
}: {
  etiqueta: string;
  valor: string;
  ancho: number;
  destacada?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 text-xs text-white/90">
        <span>{etiqueta}</span>
        <span className="font-semibold text-white">{valor}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20" aria-hidden="true">
        <div
          className={`h-full rounded-full ${destacada ? "bg-[#c8d5ff]" : "bg-white/60"}`}
          style={{ width: `${ancho}%` }}
        />
      </div>
    </div>
  );
}
/* =========================================================
   PÁGINA
========================================================= */
export default async function ArticulosPage() {
  const supabase = await createClient();
  const { data: articlesData, error } = await supabase
    .from("articulos")
    .select("id, titulo, resumen, categoria, foto, created_at")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error cargando artículos:", error);
  }
  const articles = (articlesData ?? []) as Articulo[];
  const categories = Array.from(
    new Set(articles.map((articulo) => articulo.categoria).filter(Boolean)),
  );
  return (
    <div className="flex min-h-screen w-full flex-col bg-white text-[#111b3f]">
      <main className="flex flex-1 flex-col items-center px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<Navbar user={null} />}>
          <NavbarWithUser />
        </Suspense>
        {/* 00 · PORTADA */}
        <FranjaFoto
          src="/pexels-enrique-8264573.jpg"
          tituloId="articulos-title"
          position="65% center"
          portada
        >
          <p className="inline-flex w-fit items-center rounded-full border border-white/25 bg-white/15 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
            Pragma Radar · Contexto y análisis
          </p>
          <h1
            id="articulos-title"
            className="mt-5 text-[40px] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl lg:text-[58px]"
          >
            El país,
            <br />
            <span className="text-[#c8d5ff]">en contexto.</span>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/95">
            Lo que pasa en el país también pasa en tu vida. Encuentra lecturas y cifras para entenderlo mejor.
          </p>
        </FranjaFoto>
        {/* 01 · ARTÍCULOS */}
        <section
          id="lecturas"
          aria-label="Artículos de Pragma Radar"
          className="w-full max-w-6xl scroll-mt-24 pb-10 pt-10 sm:pt-12"
        >
          <div className="mb-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5574ff]">Para entender la actualidad</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">Últimas novedades</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
            Explora temas de coyuntura y artículos para entender qué está cambiando en Colombia y cómo se conecta con tu vida.
          </p>
        </div>
        {error ? (
            <div role="status" className="border-l-2 border-amber-400 bg-amber-50 px-5 py-6 text-sm leading-6 text-slate-700">
              No pudimos cargar las publicaciones. Vuelve a intentarlo más tarde.
            </div>
          ) : articles.length === 0 ? (
            <div role="status" className="flex items-start gap-4 border-b border-[#e2e9f8] py-8">
              <BookOpen aria-hidden="true" className="h-6 w-6 shrink-0 text-[#7863d5]" />
              <div>
                <h3 className="text-lg font-semibold">Pronto encontrarás nuevas lecturas.</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Aún no hay publicaciones disponibles. Mientras tanto, puedes consultar los compromisos y sus actualizaciones.
                </p>
                <Link
                  href="/seguimiento"
                  className="mt-4 inline-flex items-center gap-2 border-b border-[#3458d8]/30 pb-1 text-sm font-normal text-[#3458d8] transition hover:border-[#3458d8]"
                >
                  Explorar el seguimiento
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <ArticlesFilterClient articles={articles} categories={categories} />
          )}
        </section>
        {/* 02 · ÍNDICE DE CIFRAS — con espacio inferior para no pegarse a la franja */}
        <nav id="cifras" aria-labelledby="cifras-title" className="mx-auto w-full max-w-6xl scroll-mt-24 pb-12 pt-8 md:pb-16">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5574ff]">Colombia en cifras</p>
            <h2 id="cifras-title" className="mt-2 text-2xl font-semibold tracking-tight text-[#111b3f] sm:text-3xl">El país no cabe en un titular.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
                Las cifras hacen visibles realidades que no siempre llegan a los titulares. Aquí encontrarás datos para entender cómo se vive en Colombia, poner en contexto lo que escuchas y formar tu propia opinión.            </p>
          </div>
          <ol className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-6">
            {INDICE.map((item, index) => {
              const Icono = item.icono;
              const degradados = [
                "from-[#e8e1ff] via-[#b5ddff] to-[#5574ff]",
                "from-[#dfe8ff] via-[#b5d9ff] to-[#7768ff]",
                "from-[#eee2ff] via-[#b9e7ff] to-[#4278ff]",
                "from-[#dff7ff] via-[#b8ddff] to-[#6570ff]",
                "from-[#e9e0ff] via-[#ccd5ff] to-[#7863bd]",
                "from-[#e2edff] via-[#b9e7ff] to-[#5574ff]",
              ];
              return (
                <li key={item.ancla}>
                  <a href={item.ancla} className="group block h-full rounded-2xl text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff]">
                    <h3 className="mb-3 text-sm font-medium text-[#7863bd]">{item.etiqueta}</h3>
                    <div className={`mx-auto flex aspect-square w-full max-w-[120px] items-center justify-center rounded-[24px] bg-gradient-to-br ${degradados[index % degradados.length]} shadow-[0_12px_30px_rgba(70,105,255,0.14)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_16px_36px_rgba(70,105,255,0.22)] motion-reduce:transform-none motion-reduce:transition-none`}>
                      <div className="flex h-[72%] w-[72%] items-center justify-center rounded-[18px] border border-white/45 bg-white/10">
                        <Icono aria-hidden="true" className="h-8 w-8 text-white" strokeWidth={1.6} />
                      </div>
                    </div>
                    <div className="mx-auto mt-4 max-w-[170px]">
                    </div>
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>
        {/* 03 · INGRESOS — derecha */}
        <FranjaFoto id="ingresos" tituloId="ingresos-title" src="/by_xez-poverty-7456552_1920.jpg" derecha>
          <h2 id="ingresos-title" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c8d5ff]">01 · Ingresos</h2>
          <DatoPrincipal dato={DATOS.pobreza} descripcion="de las personas tenía ingresos por debajo de la línea de pobreza." />
          <div className="mt-6 space-y-4">
            <Barra etiqueta="Cabeceras municipales" valor="24,6 %" ancho={61.5} />
            <Barra etiqueta="Centros poblados y rural disperso" valor="39,5 %" ancho={98.75} destacada />
          </div>
          <p className="mt-3 text-[11px] text-white/80">Brecha de 14,9 puntos porcentuales.</p>
          <DetalleDato dato={DATOS.rural}>
            <p className="mb-4 text-sm leading-7 text-white/95">
              En las zonas rurales, la pobreza monetaria fue mayor que en las cabeceras municipales.
            </p>
          </DetalleDato>
        </FranjaFoto>
        {/* 04 · TRABAJO — izquierda */}
        <FranjaFoto
          id="trabajo"
          tituloId="trabajo-title"
          src="/pexels-christian-bolanos-2158732257-37597786.jpg"
          position="35% center"
        >
          <h2 id="trabajo-title" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c8d5ff]">02 · Trabajo</h2>
          <DatoPrincipal dato={DATOS.trabajo} descripcion="de las personas ocupadas se clasificaban como informales." />
          <DetalleDato dato={DATOS.trabajo}></DetalleDato>
        </FranjaFoto>
        {/* 05 · BOSQUES — datos y dos fotografías */}
        <section
          id="bosques"
          aria-labelledby="bosques-title"
          className="mx-auto w-full max-w-6xl scroll-mt-24 py-12 md:py-16"
        >
          <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div className="lg:order-2">
              <h2 id="bosques-title" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5574ff]">03 · Bosques</h2>
              <div className="mt-7 border-t border-[#e2e9f8] pt-6">
                <p className="text-4xl font-semibold leading-none tracking-[-0.045em] text-[#5574ff] sm:text-[44px]">
                  {DATOS.bosques.cifra}
                </p>
                <p className="mt-3 max-w-[320px] text-sm font-medium leading-6 text-[#111b3f]">
                  de bosque natural se perdieron por deforestación en 2025.
                </p>
                <p className="mt-3 text-[11px] leading-5 text-slate-500">
                  {DATOS.bosques.periodo} ·{" "}
                  <a
                    href={DATOS.bosques.fuente}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3458d8] underline decoration-[#a5b8ff] underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff]"
                  >
                    {DATOS.bosques.fuenteNombre}
                  </a>
                </p>
              </div>
              <details className="group mt-6 border-t border-[#e2e9f8] pt-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-1 text-xs font-normal text-[#7863bd] [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff]">
                  Qué hay detrás del dato
                  <ChevronDown
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
                  />
                </summary>
                <div className="pb-2 pt-4 text-xs leading-6 text-slate-600">
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7863bd]">Qué cuenta</dt>
                      <dd className="mt-1">{DATOS.bosques.queMide}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7863bd]">Qué no nos dice</dt>
                      <dd className="mt-1">{DATOS.bosques.noConcluye}</dd>
                    </div>
                  </dl>
                </div>
              </details>
            </div>
            <div className="grid grid-cols-2 items-start gap-3 sm:gap-4 lg:order-1">
              <figure>
                <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] bg-[#edf2ff]">
                  <Image
                    src="/pexels-pok-rie-33563-1268076.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 45vw, 270px"
                    className="object-cover"
                  />
                </div>
              </figure>
              <figure className="pt-7">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] bg-[#edf2ff]">
                  <Image
                    src="/paramos.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 45vw, 270px"
                    className="object-cover"
                  />
                </div>
              </figure>
            </div>
          </div>
        </section>
        {/* 05 · AGUA — izquierda */}
        <FranjaFoto
          id="agua"
          tituloId="agua-title"
          src="/pexels-kelly-3030281.jpg"
          position="center"
        >
          <h2 id="agua-title" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c8d5ff]">04 · Agua</h2>
          <DatoPrincipal dato={DATOS.agua} descripcion="de personas en zonas rurales no tenía cobertura de acueducto." />
          <DetalleDato dato={DATOS.agua}></DetalleDato>
        </FranjaFoto>
        {/* 06 · VEJEZ — derecha */}
        <FranjaFoto
          id="vejez"
          tituloId="mayores-title"
          src="/pexels-daniel-camargo-329104058-13836463.jpg"
          derecha
          position="70% center"
        >
          <h2 id="mayores-title" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c8d5ff]">05 · Vejez</h2>
          <DatoPrincipal
            dato={DATOS.mayores}
            descripcion="de personas mayores potencialmente elegibles estaba sin Colombia Mayor y fuera de su lista de espera."
          />
          <DetalleDato dato={DATOS.mayores}></DetalleDato>
        </FranjaFoto>
        {/* 07 · CONECTIVIDAD — bloque de texto con fotos, sin franja */}
        <section
          id="conectividad"
          aria-labelledby="conectividad-title"
          className="mx-auto w-full max-w-6xl scroll-mt-24 py-12 md:py-16"
        >
          <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
            <div>
              <h2 id="conectividad-title" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5574ff]">06 · Internet</h2>
              <div className="mt-7 border-t border-[#e2e9f8] pt-6">
                <p className="text-4xl font-semibold leading-none tracking-[-0.045em] text-[#5574ff] sm:text-[44px]">
                  {DATOS.internet.cifra}
                </p>
                <p className="mt-3 max-w-[320px] text-sm font-medium leading-6 text-[#111b3f]">
                  de los hogares no tenía conexión a internet en 2024.
                </p>
                <p className="mt-3 text-[11px] leading-5 text-slate-500">
                  {DATOS.internet.periodo} ·{" "}
                  <a
                    href={DATOS.internet.fuente}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3458d8] underline decoration-[#a5b8ff] underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff]"
                  >
                    {DATOS.internet.fuenteNombre}
                  </a>
                </p>
              </div>
              <details className="group mt-6 border-t border-[#e2e9f8] pt-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-1 text-xs font-normal text-[#7863bd] [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff]">
                  Qué hay detrás del dato
                  <ChevronDown
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
                  />
                </summary>
                <div className="pb-2 pt-4 text-xs leading-6 text-slate-600">
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7863bd]">Qué cuenta</dt>
                      <dd className="mt-1">{DATOS.internet.queMide}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7863bd]">Qué no nos dice</dt>
                      <dd className="mt-1">{DATOS.internet.noConcluye}</dd>
                    </div>
                  </dl>
                </div>
              </details>
            </div>
            <div className="grid grid-cols-2 items-start gap-3 sm:gap-4">
              <figure>
                <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] bg-[#edf2ff]">
                  <Image
                    src="/albertoadan-aerial-1880873_1920.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 45vw, 270px"
                    className="object-cover"
                  />
                </div>
              </figure>
              <figure className="pt-7">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] bg-[#edf2ff]">
                  <Image
                    src="/computadores.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 45vw, 270px"
                    className="object-cover"
                  />
                </div>
              </figure>
            </div>
          </div>
        </section>

         <Frase
          etiqueta="Del contexto al seguimiento"
          autor="Donella Meadows"
          fuente="https://donellameadows.org/archives/leverage-points-places-to-intervene-in-a-system/"
          adaptada
        >
          Si no sabemos a dónde queremos ir, poco importa que avancemos mucho.
        </Frase>


      </main>
      <footer>
        <Suspense
          fallback={<div className="px-8 py-6 text-sm text-slate-500">Cargando pie de página…</div>}
        >
          <Footer />
        </Suspense>
      </footer>
    </div>
  );
}
