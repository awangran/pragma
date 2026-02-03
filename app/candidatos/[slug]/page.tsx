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
  const candidate = candidatos?.find((c) => c.slug === slug);

  if (!candidate) {
    return <div className="p-8 text-center">Candidato no encontrado.</div>;
  }


  const isValidImageUrl = (url: string) => {
    const sanitized = url.split("?")[0].trim().toLowerCase();
    return !!sanitized && /\.(png|jpe?g|gif|bmp|webp|avif|svg)$/.test(sanitized);
  };

  return (
    <Suspense fallback={<div>Loading users...</div>}>
      <div className="flex flex-col items-center">
        <div className="mx-auto w-full max-w-6xl px-6 py-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm">
            <Link 
              href="/candidatos" 
              className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              Candidatos
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-600">{candidate.name}</span>
          </nav>

          {/* Header */}
          <div
            className="relative mb-6 rounded-2xl p-6 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/soft-gradient.svg')" }}
          >
            <div className="flex items-center gap-6">
              {/* Avatar */}
              {candidate.avatarUrl ? (
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full shadow-lg">
                  <Image
                    src={candidate.avatarUrl as string}
                    alt={`profile photo`}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-24 w-24 shrink-0 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 border-4 border-white shadow-lg" />
              )}

              {/* Main identity */}
              <div className="flex flex-1 items-start justify-between gap-4 py-6">
                <div className="flex flex-col">
                  <h1 className="text-3xl font-bold text-slate-900">{candidate.name}</h1>
                  {candidate.subtitle && (
                    <p className="text-base text-slate-600 mt-1">{candidate.subtitle}</p>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="inline-flex w-max items-center justify-center rounded-full border border-blue-300 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
                      {candidate.party}
                    </span>
                    {candidate.ubicacion && (
                      <span className="inline-flex items-center gap-1 text-sm text-slate-700">
                        <MapPin className="h-4 w-4 text-slate-500" aria-hidden />
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
            <div className="grid grid-cols-12 gap-6">
              {/* Left column */}
              <div className="col-span-12 lg:col-span-8">
                {/* Biografía */}
                <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-2 text-base font-semibold text-slate-900">Biografía</h2>
                  <p className="text-sm text-slate-700">
                    {candidate.bio || "No hay biografía disponible."}
                  </p>
                </section>

                {/* Propuestas */}
                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-1 text-base font-semibold text-slate-900">Propuestas</h2>
                  <p className="mb-4 text-sm text-slate-600">
                    Resumen general de las propuestas del candidato
                  </p>

                  <div className="flex flex-col gap-4">
                    {(candidate.propuestas ?? []).map(
                      (
                        p: { id: string; title: string; topic?: string; summary?: string },
                        idx: number,
                      ) => (
                      <div key={p.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <h3 className="text-sm font-semibold text-slate-900">
                          {idx + 1}. {p.title}
                          {p.topic && (
                            <span className="ml-2 inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              {p.topic}
                            </span>
                          )}
                        </h3>
                        {p.summary && (
                          <p className="mt-1 text-sm text-slate-700">{p.summary}</p>
                        )}
                      </div>
                      ),
                    )}
                    {(!candidate.propuestas || candidate.propuestas.length === 0) && (
                      <p className="text-sm text-slate-600">Sin propuestas registradas.</p>
                    )}
                  </div>
                </section>
              </div>

              {/* Right column */}
              <aside className="col-span-12 lg:col-span-4">
                {/* Últimos Posts 
                <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">Últimos Posts</h3>
                </div>*/}

                {/* Links relacionados */}
                <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">Links relacionados</h3>
                  <ul className="flex flex-col gap-2">
                    {(candidate.links ?? []).map((href: string, i: number) => (
                      <li key={`${href}-${i}`}>
                        <a
                          href={href.startsWith("http") ? href : `https://${href}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-700 hover:underline"
                        >
                          {href}
                        </a>
                      </li>
                    ))}
                    {(!candidate.links || candidate.links.length === 0) && (
                      <li className="text-sm text-slate-600">Sin enlaces relacionados.</li>
                    )}
                  </ul>
                </div>

                {/* Filtrar por tema */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
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