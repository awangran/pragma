import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import CandidateCard from "../../../components/candidate-card";
import type { Candidate } from "../../../types/candidates";
import { createClient } from "@/lib/supabase/server";
import CandidateProfileClient from "../../../components/candidate-profile-client";
import { MapPin } from "lucide-react";

interface CandidateProfilePageProps {
  params: Promise<{ slug: string }>;
}

export default async function CandidateProfilePage({ params }: CandidateProfilePageProps) {
  const supabase = await createClient();
  const { data: candidatos } = await supabase.from("candidates").select();
  console.log("Candidatos desde Supabase:", candidatos);
  const { slug } = await params;
  console.log(slug)

  const candidate = candidatos?.find((c) => c.profileLink === "candidatos/"+ slug);

  if (!candidate) {
    return <div className="p-8 text-center">Candidato no encontrado.</div>;
  }


  const isValidImageUrl = (url: string) => {
    const sanitized = url.split("?")[0].trim().toLowerCase();
    return !!sanitized && /\.(png|jpe?g|gif|bmp|webp|avif|svg)$/.test(sanitized);
  };

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
            <span className="text-slate-600 truncate">{candidate.name}</span>
          </nav>

          {/* Header */}
          <div
            className="relative mb-6 sm:mb-8 rounded-2xl p-4 sm:p-6 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/soft-gradient.svg')" }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              {/* Avatar */}
              {candidate.avatarUrl ? (
                <div className="h-20 sm:h-24 w-20 sm:w-24 shrink-0 overflow-hidden rounded-full shadow-lg">
                  <Image
                    src={candidate.avatarUrl as string}
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
              <div className="flex flex-1 flex-col justify-start gap-2 sm:gap-3">
                <div className="flex flex-col">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{candidate.name}</h1>
                  {candidate.subtitle && (
                    <p className="text-sm sm:text-base text-slate-600 mt-1">{candidate.subtitle}</p>
                  )}
                  <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex w-max items-center justify-center rounded-full border border-blue-300 bg-blue-50 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-blue-700">
                      {candidate.party}
                    </span>
                    {candidate.ubicacion && (
                      <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-slate-700">
                        <MapPin className="h-3 sm:h-4 w-3 sm:w-4 text-slate-500" aria-hidden />
                        {candidate.ubicacion}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions 
                <div className="flex flex-col gap-3 pt-2">
                  <CandidateProfileClient 
                    candidateId={candidate.id} 
                    initialLikes={candidate.likes || 0}
                    candidateName={candidate.name}
                  />
                </div>
                */}
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
                    {candidate.bio || "No hay biografía disponible."}
                  </p>
                </section>

                {/* Propuestas */}
                <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                  <h2 className="mb-1 text-sm sm:text-base font-semibold text-slate-900">Propuestas</h2>
                  <p className="mb-4 text-xs sm:text-sm text-slate-600">
                    Resumen general de las propuestas del candidato
                  </p>

                  <div className="flex flex-col gap-3 sm:gap-4">
                    {(candidate.propuestas ?? []).map(
                      (
                        p: { id: string; title: string; topic?: string; summary?: string },
                        idx: number,
                      ) => (
                      <div key={p.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
                        <h3 className="text-xs sm:text-sm font-semibold text-slate-900 break-words">
                          {idx + 1}. {p.title}
                        </h3>
                        {p.topic && (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              {p.topic}
                            </span>
                          </div>
                        )}
                        {p.summary && (
                          <p className="mt-2 text-xs sm:text-sm text-slate-700 break-words">{p.summary}</p>
                        )}
                      </div>
                      ),
                    )}
                    {(!candidate.propuestas || candidate.propuestas.length === 0) && (
                      <p className="text-xs sm:text-sm text-slate-600">Sin propuestas registradas.</p>
                    )}
                  </div>
                </section>
              </div>

              {/* Right column */}
              <aside className="col-span-12 lg:col-span-4 space-y-4 sm:space-y-6">
                {/* Últimos Posts 
                <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">Últimos Posts</h3>
                </div>*/}

                {/* Links relacionados */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">Links relacionados</h3>
                  <ul className="flex flex-col gap-2">
                    {(candidate.links ?? []).map((href: string, i: number) => (
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
                    {(!candidate.links || candidate.links.length === 0) && (
                      <li className="text-xs sm:text-sm text-slate-600">Sin enlaces relacionados.</li>
                    )}
                  </ul>
                </div>

                {/* Filtrar por tema */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">Filtrar por tema</h3>
                  <div className="flex flex-wrap gap-2">
                    {(candidate.propuestas ?? []).map(
                      (p: { id: string; title: string; topic?: string; summary?: string }) => (
                      p.topic && (
                        <span
                          key={p.topic}
                          className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700"
                        >
                          {p.topic}
                        </span>
                      )
                      ),
                    )}
                    {(!candidate.propuestas || candidate.propuestas.length === 0) && (
                      <span className="text-sm text-slate-600">Sin temas disponibles.</span>
                    )}
                  </div>
                </div>
                
              </aside>

            </div>
          </div> 
        </div>
      </Suspense>
    );
  }