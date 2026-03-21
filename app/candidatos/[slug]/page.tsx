import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MapPin } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { PropuestasClient } from "@/components/propuestas-client";

interface CandidateProfilePageProps {
  params: Promise<{ slug: string }>;
}

export default async function CandidateProfilePage({ params }: CandidateProfilePageProps) {
  const supabase = await createClient();
  const { slug } = await params;
  const candidateId = parseInt(slug, 10);

  const { data: userData } = await supabase.auth.getUser();
  const user = (userData && (userData as any).user) ? (userData as any).user : null;
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

  const propuestasArray = (propuestasRaw ?? []) as Array<{
    id: string;
    titulo: string;
    tema_id: string | number | null;
    que_pasa: string | null;
    que_propone: string | null;
    que_cambia: string | null;
    tema?: { titulo?: string | null; tituloExtendido?: string | null } | null;
  }>;

  const slugifyTema = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const propuestasPorTema = propuestasArray.reduce(
    (acc, propuesta) => {
      const titulo = propuesta.tema?.titulo ?? "Sin tema";
      if (!acc[titulo]) {
        acc[titulo] = {
          tituloExtendido: propuesta.tema?.tituloExtendido ?? null,
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
    return <div className="p-8 text-center">Candidato no encontrado.</div>;
  }


  return (
    <Suspense fallback={
      <div className="flex flex-col items-center">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 py-6 sm:py-8">
          <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mb-6" />
          <div className="rounded-2xl p-4 sm:p-6 bg-slate-100 animate-pulse">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="h-20 sm:h-24 w-20 sm:w-24 rounded-full bg-slate-300" />
              <div className="flex-1 space-y-2 w-full">
                <div className="h-6 bg-slate-300 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    }>

     <Suspense fallback={<Navbar user={null} />}>
        <Navbar user={user ? { avatarUrl } : null} />
      </Suspense>

      <div className="flex flex-col items-center">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 py-6 sm:py-8">
          {/* Breadcrumb */}
          <nav className="mb-4 sm:mb-6 flex items-center gap-2 text-xs sm:text-sm">
            <Link 
              href="/candidatos" 
              className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              Candidatos
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-600 truncate">{candidate.nombre}</span>
          </nav>

          {/* Header */}
          <div
            className="relative mb-6 sm:mb-8 rounded-2xl p-4 sm:p-6 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/soft-gradient.svg')" }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              {/* Avatar */}
              {candidate.avatar ? (
                <div className="h-20 sm:h-24 w-20 sm:w-24 shrink-0 overflow-hidden rounded-full shadow-lg">
                  <Image
                    src={candidate.avatar as string}
                    alt={`profile photo`}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-20 sm:h-24 w-20 sm:w-24 shrink-0 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 border-4 border-white shadow-lg" />
              )}

              {/* Main identity */}
              <div className="flex flex-1 flex-col justify-between gap-2 sm:gap-3">
                <div className="flex flex-col">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{candidate.nombre}</h1>
                  {candidate.cargo && (
                    <p className="text-sm sm:text-base text-slate-600 mt-1">{candidate.cargo}</p>
                  )}
                  <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex w-max items-center justify-center rounded-full border border-blue-300 bg-blue-50 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-blue-700">
                      {candidate.partido}
                    </span>
                    {candidate.ubicacion && (
                      <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-slate-700">
                        <MapPin className="h-3 sm:h-4 w-3 sm:w-4 text-slate-500" aria-hidden />
                        {candidate.ubicacion}
                      </span>
                    )}
                  </div>
                </div>

                {isAdmin && (
                  <Link
                    href={`/admin/edit-candidato/${candidateId}`}
                    className="inline-flex w-max items-center justify-center rounded-lg border border-blue-300 bg-blue-50 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    ✎ Editar candidato
                  </Link>
                )}
              </div>
            </div>
          </div>

              {/* Main content */}
            <div className="grid grid-cols-12 gap-4 sm:gap-6">
              {/* Left column */}
              <div className="col-span-12 lg:col-span-8">
                {/* Biografía */}
                <section className="mb-4 sm:mb-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                  <h2 className="mb-2 text-sm sm:text-base font-semibold text-slate-900">Biografía</h2>
                  <p className="text-xs sm:text-sm text-slate-700">
                    {candidate.descripcion || "No hay biografía disponible."}
                  </p>
                </section>

                {/* Propuestas */}
                <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm sm:text-base font-semibold text-slate-900">Propuestas</h2>
                    <span className="hidden sm:inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 text-xs">
                      {propuestasArray.length} en total
                    </span>
                  </div>
                  <p className="mb-4 text-xs sm:text-sm text-slate-600">
                    Vista organizada por tema. Haz clic para expandir cada sección.
                  </p>
                  <PropuestasClient
                    propuestasPorTema={propuestasPorTema}
                    propuestasArray={propuestasArray}
                    tipsMap={tipsMap}
                  />
                </section>
              </div>

              {/* Right column */}
              <aside className="col-span-12 lg:col-span-4 space-y-4 sm:space-y-6">
    

                {/* Links relacionados */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">Links relacionados</h3>
                  <ul className="flex flex-col gap-2">
                    {(candidate.links
                      ? candidate.links.split(",").map((link: string) => link.trim()).filter(Boolean)
                      : []
                    ).map((href: string, i: number) => (
                      <li key={`${href}-${i}`}>
                        <a
                          href={href.startsWith("http") ? href : `https://${href}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs sm:text-sm text-blue-700 hover:underline break-all"
                        >
                          {href}
                        </a>
                      </li>
                    ))}
                    {(!candidate.links || candidate.links.trim().length === 0) && (
                      <li className="text-xs sm:text-sm text-slate-600">Sin enlaces relacionados.</li>
                    )}
                  </ul>
                </div>

                {/* Filtrar por tema */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">Filtrar por tema</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(propuestasPorTema).map(([temaTitulo, data]) => {
                      const temaId = `tema-${slugifyTema(temaTitulo)}`;
                      return (
                        <a
                          key={temaTitulo}
                          href={`#${temaId}`}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          {temaTitulo}
                          <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 text-[10px]">
                            {data.items.length}
                          </span>
                        </a>
                      );
                    })}
                    {propuestasArray.length === 0 && (
                      <span className="text-sm text-slate-600">Sin temas disponibles.</span>
                    )}
                  </div>
                </div>
                
              </aside>

            </div>
          </div> 
        </div>

        <Footer />
      </Suspense>
    );
  }