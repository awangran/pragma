import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";

type ArticlePageProps = { params: Promise<{ slug: string }> };
type Articulo = {
  id: number;
  titulo: string;
  resumen: string | null;
  categoria: string | null;
  cuerpo: string | null;
  fuentes: string | null;
  foto: string | null;
  created_at: string | null;
};

const foco = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff]";

function urlSegura(valor: string) {
  try {
    const url = new URL(valor);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function nombreFuente(url: string) {
  return new URL(url).hostname.replace(/^www\./, "");
}

function nombreFuenteCorto(url: string) {
  const dominio = nombreFuente(url);
  const nombres: Record<string, string> = {
    "coursera.org": "Coursera", "unesco.org": "UNESCO",
    "weforum.org": "Foro Económico Mundial", "sena.edu.co": "SENA",
    "infobae.com": "Infobae", "icetex.gov.co": "Icetex",
    "funcionpublica.gov.co": "Función Pública", "bogota.gov.co": "Alcaldía de Bogotá",
    "mintrabajo.gov.co": "MinTrabajo", "mintic.gov.co": "MinTIC",
    "dane.gov.co": "DANE", "mineducacion.gov.co": "MinEducación",
    "minsalud.gov.co": "MinSalud", "mininterior.gov.co": "MinInterior",
    "banrep.gov.co": "Banco de la República", "worldjusticeproject.org": "World Justice Project",
    "un.org": "ONU", "elpais.com": "El País", "eltiempo.com": "El Tiempo",
    "larepublica.co": "La República", "elespectador.com": "El Espectador",
    "minciencias.gov.co": "MinCiencias",
  };
  const clave = Object.keys(nombres).find(d => dominio === d || dominio.endsWith(`.${d}`));
  return clave ? nombres[clave] : dominio;
}

type Fuente = { titulo: string; url: string };

function separarFuentes(texto: string | null): Fuente[] {
  if (!texto?.trim()) return [];
  const fuentes: Fuente[] = [];
  const vistas = new Set<string>();
  const patron = /\[([^\]]+)\]\((https?:\/\/[^\s]+?)\)|https?:\/\/[^\s<>\]]+/g;
  let finAnterior = 0;
  for (const coincidencia of texto.matchAll(patron)) {
    const prefijo = texto.slice(finAnterior, coincidencia.index ?? 0).replace(/^[\s,;•*-]+/, "").trim();
    const url = urlSegura((coincidencia[2] ?? coincidencia[0]).replace(/[.,;]+$/, ""));
    finAnterior = (coincidencia.index ?? 0) + coincidencia[0].length;
    if (!url || vistas.has(url)) continue;
    const etiqueta = coincidencia[1]?.trim();
    fuentes.push({ titulo: prefijo || (etiqueta && !urlSegura(etiqueta) ? etiqueta : "") || nombreFuente(url), url });
    vistas.add(url);
  }
  return fuentes;
}

function textoConEnfasis(texto: string) {
  return texto.split(/(\*\*[^*]+\*\*)/g).map((parte, index) =>
    parte.startsWith("**") && parte.endsWith("**")
      ? <strong key={index} className="font-semibold text-[#111b3f]">{parte.slice(2, -2)}</strong>
      : parte
  );
}

function CargandoArticulo() {
  return (
    <div role="status" aria-label="Cargando artículo" className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="h-4 w-36 rounded bg-[#edf2ff] motion-safe:animate-pulse" />
      <div className="mt-7 h-80 rounded-[28px] bg-[#edf2ff] motion-safe:animate-pulse" />
      <div className="mx-auto mt-10 max-w-2xl space-y-4">
        <div className="h-5 rounded bg-[#f2f5ff] motion-safe:animate-pulse" />
        <div className="h-5 w-4/5 rounded bg-[#f2f5ff] motion-safe:animate-pulse" />
      </div>
    </div>
  );
}

export default function ArticlePage({ params }: ArticlePageProps) {
  return <Suspense fallback={<CargandoArticulo />}><ContenidoArticulo params={params} /></Suspense>;
}

async function ContenidoArticulo({ params }: ArticlePageProps) {
  const { slug } = await params;
  if (!/^\d+$/.test(slug)) notFound();
  const articleId = Number(slug);
  if (!Number.isSafeInteger(articleId) || articleId < 1) notFound();

  const supabase = await createClient();
  const [{ data: userData }, { data: articleData, error }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("articulos")
      .select("id, titulo, resumen, categoria, cuerpo, fuentes, foto, created_at")
      .eq("id", articleId).maybeSingle(),
  ]);
  if (error) {
    console.error("Error cargando el artículo:", error);
    throw new Error("No se pudo cargar el artículo.");
  }
  if (!articleData) notFound();
  const article = articleData as Articulo;
  const user = userData?.user ?? null;
  const avatarUrl = user?.user_metadata?.avatar_url ?? null;

  let isAdmin = false;
  if (user?.id) {
    const { data: profileData } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    isAdmin = profileData?.role === "admin";
  }

  const cuerpo = article.cuerpo?.trim() ?? "";
  const parrafos = cuerpo.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const palabras = cuerpo.split(/\s+/).filter(Boolean).length;
  const minutos = Math.max(1, Math.ceil(palabras / 200));
  const fecha = article.created_at ? new Date(article.created_at) : null;
  const fechaValida = fecha && !Number.isNaN(fecha.getTime());
  const formattedDate = fechaValida ? new Intl.DateTimeFormat("es-CO", { year: "numeric", month: "long", day: "numeric", timeZone: "America/Bogota" }).format(fecha) : null;
  const fuentes = separarFuentes(article.fuentes);
  const categoria = article.categoria?.trim();
  const mostrarCategoria = categoria && categoria.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() !== "articulos";
  const foto = article.foto && (article.foto.startsWith("/") && !article.foto.startsWith("//") || urlSegura(article.foto)) ? article.foto : null;

  return (
    <div className="flex min-h-screen w-full flex-col bg-white text-[#111b3f]">
      <Navbar user={user ? { avatarUrl } : null} />
      <main className="flex-1">
        <article>
          <nav aria-label="Navegación del artículo" className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-5">
            <Link href="/articulos" className={`inline-flex items-center gap-2 text-xs font-medium text-[#5574ff] ${foco}`}>
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />Todas las lecturas
            </Link>
            {isAdmin && <Link href={`/admin/edit-articulo/${articleId}`} className={`inline-flex items-center gap-2 border-b border-[#a5b8ff] pb-1 text-xs text-[#7863bd] ${foco}`}><Pencil aria-hidden="true" className="h-3.5 w-3.5" />Editar</Link>}
          </nav>

          <header className="relative isolate overflow-hidden bg-[#111b3f] text-white">
            {foto && <Image src={foto} alt="" fill priority unoptimized sizes="100vw" className="object-cover object-center" />}
            <div aria-hidden="true" className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(17,27,63,0.94) 0%, rgba(17,27,63,0.82) 42%, rgba(17,27,63,0.36) 78%, rgba(17,27,63,0.14) 100%)" }} />
            <div className="relative mx-auto flex min-h-[400px] w-full max-w-6xl items-end px-6 py-10 sm:min-h-[470px] sm:py-14">
              <div className="max-w-3xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c7b5f5]">{mostrarCategoria ? categoria : "Pragma Radar · Contexto y análisis"}</p>
                <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-4xl lg:text-5xl">{article.titulo}</h1>
                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-[11px] text-white/85">
                  {formattedDate && <time dateTime={article.created_at ?? undefined}>{formattedDate}</time>}
                  {palabras > 0 && <span className="inline-flex items-center gap-1.5"><Clock3 aria-hidden="true" className="h-3.5 w-3.5" />{minutos} min de lectura aprox.</span>}
                  {fuentes.length > 0 && <a href="#fuentes" className="border-b border-white/40 pb-0.5 transition hover:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Consultar fuentes</a>}
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-14">
            <div className="mx-auto max-w-[720px]">
              {article.resumen && article.resumen.trim() !== article.titulo.trim() && (
              <p className="mb-9 rounded-[20px] bg-[#eee7fa] px-6 py-6 text-base font-normal leading-7 tracking-normal text-[#655184] sm:px-8 sm:py-7 sm:text-[17px] sm:leading-8">
                {article.resumen}
              </p>              )}
              <div className="text-[15px] font-normal leading-7 tracking-normal text-[#4b5568] sm:text-base sm:leading-8">
                {parrafos.map((parrafo, index) => {
                  const heading = parrafo.match(/^(#{1,3})\s+([^\n]+)$/);
                  const tituloEnNegrita = parrafo.match(/^\*\*([^\n]+)\*\*$/);
                  const subtitulo = heading?.[2] ?? tituloEnNegrita?.[1];
                  if (subtitulo) return <h2 key={index} className="mb-5 mt-12 max-w-xl text-2xl font-semibold leading-tight tracking-[-0.03em] text-[#7863bd] first:mt-0 sm:mt-14 sm:text-3xl">{subtitulo}</h2>;
                  if (/^>\s?/.test(parrafo)) return <blockquote key={index} className="my-9 rounded-[24px] bg-[#f0ebfa] px-6 py-7 sm:px-8"><p
  key={index}
  className="mb-5 whitespace-pre-line last:mb-0"
>
  {textoConEnfasis(parrafo)}
</p></blockquote>;
                  const lineas = parrafo.split("\n");
                  if (lineas.every((linea) => /^\s*[-*]\s+/.test(linea))) return <ul key={index} className="my-7 space-y-4 rounded-[24px] bg-[#f2f5ff] px-6 py-6 sm:px-8">{lineas.map((linea, i) => <li key={i} className="flex items-start gap-3"><span aria-hidden="true" className="mt-[13px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#5574ff]" /><span>{textoConEnfasis(linea.replace(/^\s*[-*]\s+/, ""))}</span></li>)}</ul>;
                  return <p key={index} className="mb-6 whitespace-pre-line last:mb-0">{textoConEnfasis(parrafo)}</p>;
                })}
              </div>
            </div>

            {fuentes.length > 0 && (
              <aside id="fuentes" aria-labelledby="fuentes-title" className="mx-auto mt-12 max-w-[820px] scroll-mt-24 rounded-[28px] border border-[#e0e6f5] bg-gradient-to-br from-[#f4f0fc] to-[#f0f5ff] p-6 sm:mt-12 sm:p-6">
                <h2 id="fuentes-title" className="text-sm font-normal tracking-wide text-[#7863bd]">Fuentes de esta lectura</h2>
                <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                  {fuentes.map((fuente) => {
                    const nombre = nombreFuenteCorto(fuente.url);
                    const relacionadas = fuentes.filter(f => nombreFuenteCorto(f.url) === nombre);
                    const numero = relacionadas.findIndex(f => f.url === fuente.url) + 1;
                    const etiqueta = relacionadas.length > 1 ? `${nombre} · ${numero}` : nombre;
                    return (
                      <li key={fuente.url}>
                        <a href={fuente.url} title={fuente.titulo} target="_blank" rel="noopener noreferrer" className={`text-xs font-normal leading-6 text-[#5574ff] underline decoration-[#a5b8ff]/60 underline-offset-4 transition hover:decoration-[#5574ff] ${foco}`}>
                          {etiqueta}
                          <span className="sr-only"> — {fuente.titulo} (abre en otra pestaña)</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </aside>
            )}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
