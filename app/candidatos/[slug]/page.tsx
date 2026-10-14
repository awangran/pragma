import { FavoriteButton } from "@/components/favorite-button";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MapPin, ArrowRight, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { PropuestasClient } from "@/components/propuestas-client";
import { DeleteCandidateButton } from "@/components/delete-candidate-button";
import { revalidatePath } from "next/cache";
import { redirect, notFound } from "next/navigation";

interface CandidateProfilePageProps {
  params: Promise<{ slug: string }>;
}

export default async function CandidateProfilePage({ params }: CandidateProfilePageProps) {
  const supabase = await createClient();
  const { slug } = await params;
  const candidateId = Number(slug);
  if (!Number.isSafeInteger(candidateId) || candidateId <= 0) notFound();

  if (candidateId === 14) {redirect("/seguimiento");}

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user ?? null;
  const avatarUrl = user?.user_metadata?.avatar_url ?? null;
  
  const { data: candidate } = await supabase
    .from("candidatos")
    .select()
    .eq("id", candidateId)
    .single();

  const { data: propuestasRaw } = await supabase
    .from("propuestas")
    .select("id, titulo, tema_id, que_pasa, que_propone, que_cambia, tema:tema_id (titulo, tituloExtendido)")
    .eq("candidato_id", candidateId);

  const { data: experienciaRaw } = await supabase
    .from("experiencia")
    .select("historial")
    .eq("candidato_id", candidateId);

  // Fetch tips for each tema
  const { data: tipsRaw } = await supabase
    .from("tips")
    .select("tema_id, tema, descripcion");

  const tipsMap = (tipsRaw ?? []).reduce(
    (acc, tip) => {
      if (tip.tema_id) {
        acc[String(tip.tema_id)] = tip.descripcion;
      }
      return acc;
    },
    {} as Record<string, string | null>
  );

  const propuestasConRelacion = (propuestasRaw ?? []) as Array<{
    id: string;
    titulo: string;
    tema_id: string | number | null;
    que_pasa: string | null;
    que_propone: string | null;
    que_cambia: string | null;
    tema?: { titulo?: string | null; tituloExtendido?: string | null } | Array<{ titulo?: string | null; tituloExtendido?: string | null }> | null;
  }>;

  const propuestasArray = propuestasConRelacion.map((propuesta) => ({
    ...propuesta,
    tema: Array.isArray(propuesta.tema) ? propuesta.tema[0] ?? null : propuesta.tema,
  }));

  const experienciaArray: string[] = ((experienciaRaw ?? []) as Array<{ historial: string | null }>)
    .map((item: { historial: string | null }) => {
      const raw = item.historial ?? "";
      return raw
        .replace(/\\r\\n/g, "\n")
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\n")
        .replace(/\r\n?/g, "\n")
        .trim();
    })
    .filter(Boolean);

  const slugifyTema = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const propuestasPorTema = propuestasArray.reduce(
    (acc, propuesta) => {
      const tema = Array.isArray(propuesta.tema) ? propuesta.tema[0] : propuesta.tema;
      const titulo = tema?.titulo ?? "Sin tema";
      if (!acc[titulo]) {
        acc[titulo] = {
          tituloExtendido: tema?.tituloExtendido ?? null,
          temaId: `tema-${slugifyTema(titulo)}`,
          items: [],
        };
      }
      acc[titulo].items.push(propuesta);
      return acc;
    },
    {} as Record<string, { tituloExtendido?: string | null; temaId: string; items: typeof propuestasArray }>,
  );

  // Check if user is admin
  let isAdmin = false;
  if (user?.id) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profileData?.role === "admin";
  }

  if (!candidate || !candidateId) {
    notFound();
  }

  async function deleteCandidateAction() {
    "use server";

    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    const authUser = authData?.user ?? null;

    if (!authUser?.id) {
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authUser.id)
      .single();

    if (profileData?.role !== "admin") {
      return;
    }

    await supabase.from("experiencia").delete().eq("candidato_id", candidateId);
    await supabase.from("propuestas").delete().eq("candidato_id", candidateId);
    await supabase.from("candidatos").delete().eq("id", candidateId);

    revalidatePath("/candidatos");
    revalidatePath(`/candidatos/${candidateId}`);
    redirect("/candidatos");
  }

  // Solo Abelardo (id=14) fue electo
  const esElecto = candidateId === 14;

  const enlaces: URL[] = (typeof candidate.links === "string" ? candidate.links.split(",") : [])
    .map((value: string) => {
      try {
        const url = new URL(value.trim().startsWith("http") ? value.trim() : `https://${value.trim()}`);
        return ["http:", "https:"].includes(url.protocol) ? url : null;
      } catch {
        return null;
      }
    })
    .filter((url: URL | null): url is URL => url !== null);

  return (
    <div className="w-full bg-white text-[#111b3f]">
      <Suspense fallback={<Navbar user={null} />}>
        <Navbar user={user ? { avatarUrl } : null} />
      </Suspense>

      <main>
        <div className="mx-auto w-full max-w-7xl px-4 pt-5 sm:px-6">
          <nav aria-label="Ruta de navegación" className="mb-5 flex min-w-0 items-center gap-2 text-xs text-slate-500">
            <Link href="/candidatos" className="shrink-0 font-medium text-[#4774ff] hover:underline">Candidatos</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="truncate">{candidate.nombre}</span>
          </nav>

          {/* IDENTIDAD — UN ÚNICO ENCABEZADO PARA EL PERFIL */}
          <header className="relative isolate overflow-hidden rounded-[32px] bg-[#eef2ff] sm:rounded-[38px]">
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-[#e1eeff] via-[#eee8ff] to-[#d9f2ff]" />
            <div aria-hidden="true" className="absolute -right-16 -top-24 h-80 w-80 rounded-full border border-white/70" />
            <div aria-hidden="true" className="absolute -right-4 -top-12 h-56 w-56 rounded-full bg-white/30" />
            <div className="relative grid items-center gap-7 p-7 sm:p-10 sm:grid-cols-[auto_1fr] lg:gap-10 lg:p-9">
              <div className="shrink-0 overflow-hidden rounded-[24px] bg-white/70 ring-4 ring-white/70" style={{ width: 144, height: 168 }}>
                {candidate.avatar ? (
                  <Image
                    src={String(candidate.avatar)}
                    alt={`Retrato de ${candidate.nombre}`}
                    width={144}
                    height={168}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-5xl font-semibold text-[#5574ff]">{String(candidate.nombre ?? "").charAt(0)}</div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6555c9]">Trayectoria y propuestas</p>
                <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-[1.04] tracking-[-0.04em] sm:text-4xl lg:text-4xl">{candidate.nombre}</h1>
                {candidate.cargo && <p className="mt-3 text-sm text-slate-600 sm:text-base">{candidate.cargo}</p>}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {candidate.partido && <span className="rounded-full border border-white/80 bg-white/65 px-3 py-1.5 text-xs font-medium text-[#3458ac]">{candidate.partido}</span>}
                  {candidate.ubicacion && <span className="inline-flex items-center gap-1.5 text-xs text-slate-600"><MapPin aria-hidden="true" className="h-3.5 w-3.5" />{candidate.ubicacion}</span>}
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <p className="text-xs text-slate-600">{propuestasArray.length} propuestas · {Object.keys(propuestasPorTema).length} temas</p>
                  <FavoriteButton tipo="candidato" recursoId={candidateId} />
                </div>
              </div>
            </div>
          </header>

          {esElecto && (
            <div className="mt-5 flex flex-col gap-4 border-l-2 border-[#5574ff] bg-[#f5f7ff] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">Seguimiento de gobierno</p>
                <p className="mt-1 text-xs leading-6 text-slate-600">Consulta las actualizaciones de sus compromisos y las instituciones vinculadas.</p>
              </div>
              <Link href="/seguimiento" className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold text-[#3458d8]">Ver seguimiento<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
            </div>
          )}

          {isAdmin && (
            <div className="mt-5 flex flex-wrap items-center gap-3 border-b border-slate-100 pb-5">
              <span className="text-xs text-slate-500">Administración</span>
              <Link href={`/admin/edit-candidato/${candidateId}`} className="rounded-full border border-blue-200 px-4 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50">Editar candidato</Link>
              <DeleteCandidateButton action={deleteCandidateAction} confirmMessage="¿Seguro que quieres eliminar este candidato? Esta acción no se puede deshacer." className="rounded-full border border-red-200 px-4 py-2 text-xs font-medium text-red-700 hover:bg-red-50">Eliminar candidato</DeleteCandidateButton>
            </div>
          )}
        </div>

        {/* NAVEGACIÓN CONTINUA: EL PERFIL Y SUS PROPUESTAS */}
        <nav aria-label="Secciones del perfil" className="sticky top-0 z-10 mt-7 border-y border-[#e2e9f8] bg-white/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-6 py-4 text-sm font-medium sm:gap-9">
            <a href="#perfil" className="shrink-0 text-slate-600 hover:text-[#4774ff]">Perfil y trayectoria</a>
            <a href="#propuestas" className="shrink-0 text-[#3458d8]">Propuestas <span className="ml-1 text-xs text-slate-500">{propuestasArray.length}</span></a>
            <a href="#enlaces" className="shrink-0 text-slate-600 hover:text-[#4774ff]">Enlaces</a>
          </div>
        </nav>

        <div className="mx-auto w-full max-w-6xl px-6">
          {/* BIOGRAFÍA Y TRAYECTORIA: UN SOLO DESTINO EN LA NAVEGACIÓN */}
          <div id="perfil" className="grid scroll-mt-24 items-start gap-7 py-8 lg:grid-cols-[1fr_1.05fr] lg:gap-10">
            <section id="biografia" aria-labelledby="biografia-title" className="min-w-0 scroll-mt-24">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5574ff]">El perfil</p>
              <h2 id="biografia-title" className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Quién es.</h2>
              <p className="mt-4 whitespace-pre-line text-[13px] leading-6 text-slate-600">{candidate.descripcion || "No hay biografía registrada."}</p>
            </section>
            <section id="trayectoria" aria-labelledby="trayectoria-title" className="min-w-0 scroll-mt-24 border-t border-[#e2e9f8] pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5574ff]">Su recorrido</p>
              <h2 id="trayectoria-title" className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Trayectoria.</h2>
              {experienciaArray.length > 0 ? (
                <div className="mt-4">
                  <ul className="space-y-4 border-l border-[#cddaff] pl-4">
                    {experienciaArray.slice(0, 2).map((historial: string, index: number) => <li key={`${historial}-${index}`} className="relative whitespace-pre-line text-[13px] leading-6 text-slate-600"><span aria-hidden="true" className="absolute -left-[21px] top-2 h-2 w-2 rounded-full bg-[#5574ff] ring-4 ring-white" />{historial}</li>)}
                  </ul>
                  {experienciaArray.length > 2 && <details className="group mt-4"><summary className="w-fit cursor-pointer text-xs font-semibold text-[#3458d8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5574ff]"><span className="group-open:hidden">Ver trayectoria completa</span><span className="hidden group-open:inline">Mostrar menos</span></summary><ul className="mt-4 space-y-4 border-l border-[#cddaff] pl-4">{experienciaArray.slice(2).map((historial: string, index: number) => <li key={`${historial}-${index}`} className="relative whitespace-pre-line text-[13px] leading-6 text-slate-600"><span aria-hidden="true" className="absolute -left-[21px] top-2 h-2 w-2 rounded-full bg-[#5574ff] ring-4 ring-white" />{historial}</li>)}</ul></details>}
                </div>
              ) : <p className="mt-4 text-[13px] text-slate-500">No hay experiencia registrada.</p>}
            </section>
          </div>

          {/* PAUSA COMÚN A TODOS LOS PERFILES, SIN ATRIBUIR PROMESAS */}
          <section aria-labelledby="contexto-title" className="relative isolate my-3 overflow-hidden rounded-[28px] bg-[#111b3f] text-white">
            <Image src="/guajira3.jpg" alt="La Guajira" fill sizes="(max-width: 1200px) 100vw, 1104px" className="object-cover object-center" />
            <div aria-hidden="true" className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(17,27,63,0.90) 0%, rgba(17,27,63,0.75) 45%, rgba(17,27,63,0.12) 100%)" }} />
            <div className="relative px-6 py-12 sm:px-9 sm:py-14" style={{ minHeight: 260 }}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-100">Del recorrido a la visión del país</p>
              <h2 id="contexto-title" className="mt-4 max-w-lg text-3xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-4xl">Una propuesta se entiende desde la vida que busca cambiar.</h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/90">Revisa qué problema identifica, qué acción plantea y qué resultado espera.</p>
            </div>
          </section>

          {/* PROPUESTAS: PROTAGONISTAS, A TODO EL ANCHO */}
          <section id="propuestas" aria-labelledby="propuestas-title" className="scroll-mt-24 border-t border-[#e2e9f8] py-10 md:py-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5574ff]">Su visión del país</p>
                <h2 id="propuestas-title" className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Qué propone y qué busca cambiar.</h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">Abre un tema para revisar el problema que identifica, la acción que plantea y el cambio que propone.</p>
              </div>
              <span className="w-fit shrink-0 rounded-full bg-[#edf2ff] px-4 py-2 text-xs font-medium text-[#3458ac]">{propuestasArray.length} propuestas registradas</span>
            </div>
            <div className="mt-7">
              {propuestasArray.length > 0 ? (
                <PropuestasClient propuestasPorTema={propuestasPorTema} propuestasArray={propuestasArray} tipsMap={tipsMap} candidato={{ nombre: String(candidate.nombre ?? ""), avatar: typeof candidate.avatar === "string" ? candidate.avatar : null }} />
              ) : <p className="border-y border-slate-100 py-8 text-sm text-slate-500">Todavía no hay propuestas registradas para este perfil.</p>}
            </div>
          </section>

          <section id="enlaces" aria-labelledby="enlaces-title" className="flex scroll-mt-24 flex-col gap-4 border-t border-[#e2e9f8] py-6 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 id="enlaces-title" className="text-sm font-semibold">Para seguir leyendo</h2><p className="mt-1 text-xs text-slate-500">Sitios relacionados con este perfil.</p></div>
            {enlaces.length > 0 ? <ul className="flex flex-wrap gap-2">{enlaces.map((url: URL, index: number) => <li key={`${url.href}-${index}`}><a href={url.href} title={url.href} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#dbe3f5] bg-[#f7f9ff] px-4 py-2.5 text-xs font-medium text-[#3458ac] transition hover:border-[#9bb6ff] hover:bg-[#edf2ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5574ff]"><span className="break-all">{url.hostname.replace(/^www\./, "")}{enlaces.filter((other: URL) => other.hostname === url.hostname).length > 1 ? ` · ${index + 1}` : ""}</span><ExternalLink aria-hidden="true" className="h-3.5 w-3.5 shrink-0" /><span className="sr-only">{url.pathname} (abre en otra pestaña)</span></a></li>)}</ul> : <p className="text-xs text-slate-500">Sin enlaces registrados.</p>}
          </section>
        </div>

        {/* COMPARADOR: UNA CONVERSACIÓN ENTRE PERSPECTIVAS */}
        <section aria-labelledby="contrastar-title" className="border-y border-[#e2e9f8] bg-[#f2f5ff]">
          <div className="mx-auto grid max-w-7xl md:grid-cols-[1.15fr_0.85fr]">
            <div className="flex items-center px-6 py-9 sm:px-10 lg:px-14">
              <div className="max-w-lg">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5574ff]">Una perspectiva entre varias</p>
                <h2 id="contrastar-title" className="mt-3 text-3xl font-semibold leading-[1.05] tracking-[-0.035em]">Las mismas preguntas.<br />Distintas posiciones.</h2>
                <p className="mt-4 text-sm leading-6 text-slate-600">Contrasta este perfil con otras candidaturas e identifica dónde coinciden y dónde difieren.</p>
                <Link href="/comparacion" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#243d9b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#111b3f]">Abrir comparador<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
              </div>
            </div>
            <div className="relative" style={{ minHeight: 260 }}><Image src="/candidatos.png" alt="Personas conversando e intercambiando perspectivas alrededor de una mesa" fill sizes="(max-width: 768px) 100vw, 544px" className="object-cover object-[center_85%]" /></div>
          </div>
        </section>
      </main>
      <footer><Suspense fallback={<div className="px-8 py-6 text-sm text-slate-500">Cargando pie de página…</div>}><Footer /></Suspense></footer>
    </div>
  );
}
