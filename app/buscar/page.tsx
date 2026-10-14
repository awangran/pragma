import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";

type PageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

type Candidato = {
  id: number;
  nombre: string | null;
  cargo: string | null;
  partido: string | null;
  ubicacion: string | null;
  avatar: string | null;
};

type FuncionarioBusqueda = {
 id: number; nombre: string | null; avatar: string | null;
 cargo: string | null; bio: string | null; fecha_inicio: string | null;
};
type MinisterioBusqueda = {
 id: number; nombre: string; slug: string; descripcion: string | null;
 funcionarios_ministerio: FuncionarioBusqueda[] | null;
};
type Articulo = {
  id: number;
  titulo: string | null;
  resumen: string | null;
  categoria: string | null;
  created_at: string | null;
  foto: string | null;
};

function normalizarBusqueda(valor: string) {
  return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function coincideBusqueda(texto: string, consulta: string) {
  const palabras = normalizarBusqueda(consulta).split(/\s+/).filter(Boolean);
  const significativas = palabras.filter(p => !["de", "del", "la", "las", "el", "los", "y", "en"].includes(p));
  const terminos = significativas.length ? significativas : palabras;
  const contenido = normalizarBusqueda(texto);
  const tokens = contenido.split(/\s+/);
  return terminos.length > 0 && terminos.every(p => tokens.some(t => t.startsWith(p)));
}

function palabrasSector(nombre: string) {
  const n = normalizarBusqueda(nombre);
  const sectores: [string, string][] = [
    ["agricultura", "agro agropecuario campo rural campesinos alimentos"],
    ["ambiente", "ambiental naturaleza biodiversidad sostenibilidad"],
    ["ciencia", "ciencia investigacion innovacion minciencias"],
    ["comercio", "industria turismo empresas mincit"],
    ["defensa", "seguridad ejercito fuerzas militares"],
    ["educacion", "educacion colegios escuelas universidades estudiantes"],
    ["hacienda", "economia finanzas impuestos presupuesto"],
    ["justicia", "justicia derecho judicial"],
    ["culturas", "cultura arte artes patrimonio"],
    ["cultura", "cultura arte artes patrimonio"],
    ["minas", "mineria energia electricidad"],
    ["exteriores", "cancilleria diplomacia relaciones internacionales"],
    ["salud", "salud hospitales medicamentos"],
    ["tecnologias", "tic mintic tecnologia conectividad internet telecomunicaciones digital"],
    ["trabajo", "laboral empleo trabajadores"],
    ["transporte", "movilidad carreteras infraestructura"],
    ["vivienda", "vivienda ciudades urbanismo territorio"],
    ["deporte", "deporte deportes atletas"],
    ["interior", "interior participacion democracia asuntos internos"],
  ];
  return sectores.filter(([clave]) => n.includes(clave)).map(([, palabras]) => palabras).join(" ");
}

const foco =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff]";

function imagenSegura(valor: string | null) {
  if (!valor) return null;

  if (valor.startsWith("/") && !valor.startsWith("//")) {
    return valor;
  }

  try {
    const url = new URL(valor);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function fecha(valor: string | null) {
  if (!valor) return null;
  const date = new Date(valor);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "America/Bogota",
  });
}

async function NavbarWithUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user ?? null;

  return (
    <Navbar
      user={
        user
          ? { avatarUrl: user.user_metadata?.avatar_url ?? null }
          : null
      }
    />
  );
}

function FormularioBusqueda({ query = "" }: { query?: string }) {
  return (
    <form action="/buscar" method="get" className="mt-7 max-w-2xl">
      <label htmlFor="busqueda" className="sr-only">
        Buscar candidatos, ministros, sectores y artículos
      </label>

      <div className="flex items-center gap-3 rounded-2xl border border-[#d7def5] bg-white px-4 py-2 focus-within:border-[#5574ff]">
        <Search
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-[#7863bd]"
        />

        <input
          id="busqueda"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Un nombre, un ministerio o un sector…"
          className="min-w-0 flex-1 bg-transparent py-3 text-sm text-[#111b3f] outline-none placeholder:text-slate-400"
        />

        <button
          type="submit"
          className={`rounded-lg px-2 py-2 text-xs font-medium text-[#5574ff] transition hover:bg-[#f2f5ff] ${foco}`}
        >
          Buscar
        </button>
      </div>
    </form>
  );
}

function Cargando() {
  return (
    <div
      role="status"
      className="mx-auto w-full max-w-6xl px-6 py-12"
    >
      <p className="text-sm text-[#7863bd]">
        Buscando en Pragma Radar…
      </p>
    </div>
  );
}

async function Resultados({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = (
    Array.isArray(params.q) ? params.q[0] : params.q
  )?.trim() ?? "";

  const supabase = await createClient();

  const [resultadoCandidatos, resultadoArticulos, resultadoMinisterios] = query
    ? await Promise.all([
        supabase
          .from("candidatos")
          .select("id,nombre,cargo,partido,ubicacion,avatar")
          .or("tipo.is.null,tipo.neq.Minister")
          .textSearch("nombre", query, {
            type: "websearch",
            config: "spanish",
          })
          .order("nombre", { ascending: true }),
        supabase
          .from("articulos")
          .select("id,titulo,resumen,categoria,created_at,foto")
          .textSearch("titulo", query, {
            type: "websearch",
            config: "spanish",
          })
          .order("created_at", { ascending: false }),
        supabase.from("ministerios")
          .select("id,nombre,slug,descripcion,funcionarios_ministerio(id,nombre,avatar,cargo,bio,fecha_inicio)")
          .eq("funcionarios_ministerio.activo", true)
          .order("nombre", { ascending: true })
          .order("fecha_inicio", { referencedTable: "funcionarios_ministerio", ascending: false, nullsFirst: false }),
      ])
    : [
        { data: [], error: null },
        { data: [], error: null },
        { data: [], error: null },
      ];

  const personas = (resultadoCandidatos.data ?? []) as Candidato[];
  const gobierno = personas.filter(p => p.id === 14 || p.id === 21).map(p => ({
    ...p,
    cargo: p.id === 14 ? "Presidente de la República" : "Vicepresidente de la República",
  }));
  const candidatos = personas.filter(p => p.id !== 14 && p.id !== 21);
  const articulos = (resultadoArticulos.data ?? []) as Articulo[];
  const ministerios = ((resultadoMinisterios.data ?? []) as unknown as MinisterioBusqueda[])
    .filter(m => coincideBusqueda(
      [m.nombre, m.descripcion, palabrasSector(m.nombre),
        ...(m.funcionarios_ministerio ?? []).map(f => [f.nombre, f.cargo, f.bio].join(" "))
      ].join(" "), query
    ));
  const total = candidatos.length + gobierno.length + articulos.length + ministerios.length;
  const hayError = Boolean(
    resultadoCandidatos.error || resultadoArticulos.error || resultadoMinisterios.error
  );

  if (hayError) {
    console.error("Error de búsqueda:", {
      candidatos: resultadoCandidatos.error,
      articulos: resultadoArticulos.error,
      ministerios: resultadoMinisterios.error,
    });
  }

  return (
    <>
      <header className="w-full border-b border-[#e2e9f8] bg-gradient-to-r from-[#f2f5ff] via-[#f5f0fc] to-white">
        <div className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7863bd]">
            Explora Pragma Radar
          </p>

          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl">
            {query ? "Lo que encontramos." : "Una pregunta puede ser el comienzo."}
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
            {query
              ? <>Resultados para &ldquo;{query}&rdquo;.</>
              : "Busca una persona, un ministerio o un sector. También puedes encontrar artículos por su título."}
          </p>

          <FormularioBusqueda query={query} />

          {query && !hayError && (
            <nav
              aria-label="Resultados de búsqueda"
              className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-xs text-slate-500"
            >
              <span>
                {total} {total === 1 ? "resultado" : "resultados"}
              </span>

              {gobierno.length > 0 && (
                <a href="#gobierno" className={`text-[#5574ff] underline underline-offset-4 ${foco}`}>
                  Gobierno nacional · {gobierno.length}
                </a>
              )}
              {candidatos.length > 0 && (
                <a href="#personas" className={`text-[#5574ff] underline underline-offset-4 ${foco}`}>
                  Candidatos · {candidatos.length}
                </a>
              )}
              {ministerios.length > 0 && (
                <a href="#ministerios" className={`text-[#5574ff] underline underline-offset-4 ${foco}`}>
                  Ministerios · {ministerios.length}
                </a>
              )}
              {articulos.length > 0 && (
                <a href="#lecturas" className={`text-[#5574ff] underline underline-offset-4 ${foco}`}>
                  Artículos · {articulos.length}
                </a>
              )}
            </nav>
          )}
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-6 py-9 sm:py-12">
        {hayError && (
          <p
            role="status"
            className="mb-8 rounded-2xl bg-[#f2f5ff] px-5 py-4 text-sm leading-6 text-slate-600"
          >
            No pudimos completar la búsqueda. Algunos resultados podrían
            faltar. Inténtalo nuevamente.
          </p>
        )}

        {gobierno.length > 0 && (
          <section
            id="gobierno"
            aria-labelledby="gobierno-title"
            className="scroll-mt-24"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7863bd]">
              Presidencia y Vicepresidencia
            </p>
            <h2 id="gobierno-title" className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Gobierno nacional.</h2>

            <ul className="mt-5 grid gap-x-10 lg:grid-cols-2">
              {gobierno.map((candidato) => {
                const foto = imagenSegura(candidato.avatar);
                const nombre = candidato.nombre || "Perfil";
                const iniciales = nombre
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((parte) => parte[0])
                  .join("");

                return (
                  <li key={candidato.id} className="border-b border-[#e2e9f8]">
                    <Link
                      href="/seguimiento#gobierno"
                      className={`group flex items-center gap-5 py-6 ${foco}`}
                    >
                      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#eee7fa] sm:h-28 sm:w-24">
                        {foto ? (
                          <Image
                            src={foto}
                            alt=""
                            fill
                            sizes="96px"
                            unoptimized
                            className="object-cover object-top"
                          />
                        ) : (
                          <span
                            aria-hidden="true"
                            className="flex h-full items-center justify-center text-xl font-medium text-[#7863bd]"
                          >
                            {iniciales}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold leading-6 tracking-[-0.02em] transition group-hover:text-[#5574ff]">
                          {nombre}
                        </h3>

                        {candidato.cargo && (
                          <p className="mt-2 text-xs leading-5 text-slate-600">
                            {candidato.cargo}
                          </p>
                        )}

                        {candidato.partido && (
                          <p className="mt-1 text-xs leading-5 text-[#7863bd]">
                            {candidato.partido}
                          </p>
                        )}

                        {candidato.ubicacion && (
                          <p className="mt-1 text-xs text-slate-500">
                            {candidato.ubicacion}
                          </p>
                        )}

                        <span className="mt-3 inline-flex items-center gap-2 border-b border-[#5574ff]/35 pb-1 text-xs font-normal text-[#5574ff]">
                          Consultar Gobierno y seguimiento
                          <ArrowUpRight aria-hidden="true" className="h-3 w-3" />
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {candidatos.length > 0 && (
          <section
            id="personas"
            aria-labelledby="personas-title"
            className={`${gobierno.length ? "mt-12" : ""} scroll-mt-24`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7863bd]">
              Personas y propuestas
            </p>
            <h2 id="personas-title" className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Candidatos.</h2>

            <ul className="mt-5 grid gap-x-10 lg:grid-cols-2">
              {candidatos.map((candidato) => {
                const foto = imagenSegura(candidato.avatar);
                const nombre = candidato.nombre || "Perfil";
                const iniciales = nombre
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((parte) => parte[0])
                  .join("");

                return (
                  <li key={candidato.id} className="border-b border-[#e2e9f8]">
                    <Link
                      href={`/candidatos/${candidato.id}`}
                      className={`group flex items-center gap-5 py-6 ${foco}`}
                    >
                      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#eee7fa] sm:h-28 sm:w-24">
                        {foto ? (
                          <Image
                            src={foto}
                            alt=""
                            fill
                            sizes="96px"
                            unoptimized
                            className="object-cover object-top"
                          />
                        ) : (
                          <span
                            aria-hidden="true"
                            className="flex h-full items-center justify-center text-xl font-medium text-[#7863bd]"
                          >
                            {iniciales}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold leading-6 tracking-[-0.02em] transition group-hover:text-[#5574ff]">
                          {nombre}
                        </h3>

                        {candidato.cargo && (
                          <p className="mt-2 text-xs leading-5 text-slate-600">
                            {candidato.cargo}
                          </p>
                        )}

                        {candidato.partido && (
                          <p className="mt-1 text-xs leading-5 text-[#7863bd]">
                            {candidato.partido}
                          </p>
                        )}

                        {candidato.ubicacion && (
                          <p className="mt-1 text-xs text-slate-500">
                            {candidato.ubicacion}
                          </p>
                        )}

                        <span className="mt-3 inline-flex items-center gap-2 border-b border-[#5574ff]/35 pb-1 text-xs font-normal text-[#5574ff]">
                          Consultar perfil
                          <ArrowUpRight aria-hidden="true" className="h-3 w-3" />
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {ministerios.length > 0 && (
          <section id="ministerios" aria-labelledby="ministerios-title" className={`${candidatos.length || gobierno.length ? "mt-12" : ""} scroll-mt-24`}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7863bd]">Sectores del Gobierno</p>
            <h2 id="ministerios-title" className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Ministerios.</h2>
            <ul className="mt-5 grid gap-x-10 lg:grid-cols-2">
              {ministerios.map(m => {
                const funcionarios = m.funcionarios_ministerio ?? [];
                const responsable = funcionarios.find(f => coincideBusqueda([f.nombre, f.cargo].join(" "), query)) ?? funcionarios[0];
                const foto = imagenSegura(responsable?.avatar ?? null);
                const nombre = responsable?.nombre || m.nombre;
                const iniciales = nombre.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join("");
                return (
                  <li key={m.id} className="border-b border-[#e2e9f8]">
                    <Link href={`/seguimiento/ministerios/${encodeURIComponent(m.slug)}`} className={`group flex items-center gap-5 py-6 ${foco}`}>
                      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#eee7fa] sm:h-28 sm:w-24">
                        {foto ? <Image src={foto} alt="" fill sizes="96px" unoptimized className="object-cover object-top" /> :
                          <span aria-hidden="true" className="flex h-full items-center justify-center text-xl font-medium text-[#7863bd]">{iniciales}</span>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase leading-5 tracking-[0.1em] text-[#7863bd]">{m.nombre}</p>
                        <h3 className="mt-2 text-lg font-semibold leading-6 tracking-[-0.02em] transition group-hover:text-[#5574ff]">{nombre}</h3>
                        {responsable?.cargo && <p className="mt-2 text-xs leading-5 text-slate-600">{responsable.cargo}</p>}
                        {!responsable && <p className="mt-2 text-xs text-slate-500">Responsable no registrado.</p>}
                        {m.descripcion && <p className="mt-2 line-clamp-2 text-xs leading-6 text-slate-600">{m.descripcion}</p>}
                        <span className="mt-3 inline-flex items-center gap-2 border-b border-[#5574ff]/35 pb-1 text-xs text-[#5574ff]">Consultar ministerio y seguimiento<ArrowUpRight aria-hidden="true" className="h-3 w-3" /></span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {articulos.length > 0 && (
          <section
            id="lecturas"
            aria-labelledby="lecturas-title"
            className={`${candidatos.length || gobierno.length || ministerios.length ? "mt-12" : ""} scroll-mt-24 rounded-[28px] bg-[#f2f5ff] px-5 py-7 sm:px-8 sm:py-8`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7863bd]">
              Contexto y análisis
            </p>

            <h2
              id="lecturas-title"
              className="mt-2 text-2xl font-semibold tracking-[-0.03em]"
            >
              Lecturas para profundizar.
            </h2>

            <ul className="mt-5 divide-y divide-[#dce3f5]">
              {articulos.map((articulo) => {
                const fechaPublicacion = fecha(articulo.created_at);
                const fotoArticulo = imagenSegura(articulo.foto);

                return (
                  <li key={articulo.id}>
                    <Link
                      href={`/articulos/${articulo.id}`}
                      className={`group grid items-start gap-5 py-6 sm:gap-7 ${fotoArticulo ? "sm:grid-cols-[190px_minmax(0,1fr)] lg:grid-cols-[230px_minmax(0,1fr)]" : ""} ${foco}`}
                    >
                      {fotoArticulo && (
                        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[#e2e9f8]">
                          <Image
                            src={fotoArticulo}
                            alt=""
                            fill
                            sizes="(max-width: 640px) calc(100vw - 88px), (max-width: 1024px) 190px, 230px"
                            unoptimized
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500">
                        {articulo.categoria && (
                          <span className="text-[#7863bd]">
                            {articulo.categoria}
                          </span>
                        )}
                        {fechaPublicacion && <span>{fechaPublicacion}</span>}
                      </div>

                      <h3 className="mt-2 max-w-3xl text-lg font-semibold leading-7 tracking-[-0.02em] transition group-hover:text-[#5574ff]">
                        {articulo.titulo || "Artículo"}
                      </h3>

                      {articulo.resumen && (
                        <p className="mt-2 max-w-3xl line-clamp-2 text-sm leading-7 text-slate-600">
                          {articulo.resumen}
                        </p>
                      )}

                      <span className="mt-3 inline-flex items-center gap-2 border-b border-[#5574ff]/35 pb-1 text-xs text-[#5574ff]">
                        Leer artículo
                        <ArrowUpRight aria-hidden="true" className="h-3 w-3" />
                      </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {query && total === 0 && !hayError && (
          <section className="rounded-[28px] bg-[#f5f0fc] px-6 py-9 sm:px-8">
            <h2 className="text-xl font-semibold tracking-[-0.03em]">
              Probemos con otras palabras.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-7 text-slate-600">
              No encontramos coincidencias. Usa un apellido o una palabra
              más general, como educación, empleo o tecnología.
            </p>
          </section>
        )}

        {!query && (
          <div className="flex flex-wrap gap-6 text-sm text-[#5574ff]">
            <Link href="/candidatos" className={`underline underline-offset-4 ${foco}`}>
              Explorar candidatos
            </Link>
            <Link href="/seguimiento/ministerios" className={`underline underline-offset-4 ${foco}`}>Explorar ministerios</Link>
            <Link href="/articulos" className={`underline underline-offset-4 ${foco}`}>
              Explorar artículos
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

export default function BuscarPage({ searchParams }: PageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#111b3f]">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<Navbar user={null} />}>
          <NavbarWithUser />
        </Suspense>
      </div>

      <main className="flex-1">
        <Suspense fallback={<Cargando />}>
          <Resultados searchParams={searchParams} />
        </Suspense>
      </main>

      <Suspense
        fallback={
          <p className="px-6 py-6 text-xs text-slate-500">
            Cargando pie de página…
          </p>
        }
      >
        <Footer />
      </Suspense>
    </div>
  );
}