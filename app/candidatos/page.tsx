import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { History, ListChecks, Users, Ear } from "lucide-react";

import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import CandidatesFilterClient, { type ElectoralCandidate } from "@/components/candidates-filter-client";
import { createClient } from "@/lib/supabase/server";

import type { Tema } from "@/types/tema";

const GUIA_PROPUESTAS = [
  {
    titulo: "¿Qué está pasando?",
    texto:
      "El problema que identifica el candidato y cómo describe la situación.",
    icon: History,
    gradient: "from-[#d6e5ff] via-[#aee8ff] to-[#4776ff]",
  },
  {
    titulo: "¿Qué propone?",
    texto: "Las acciones que plantea para abordar ese problema.",
    icon: ListChecks,
    gradient: "from-[#dfe8ff] via-[#b5d9ff] to-[#7768ff]",
  },
  {
    titulo: "¿Qué espera cambiar?",
    texto: "Los resultados que busca lograr con su propuesta.",
    icon: Users,
    gradient: "from-[#eee2ff] via-[#b9e7ff] to-[#4278ff]",
  },
];

async function NavbarWithUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  const user = data?.user ?? null;
  const avatarUrl = user?.user_metadata?.avatar_url ?? null;

  return <Navbar user={user ? { avatarUrl } : null} />;
}

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
      <path
        d="M4 12h15M13 6l6 6-6 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CandidatesSkeleton() {
  return (
    <div
      role="status"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      <span className="sr-only">Cargando candidatos…</span>

      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="rounded-[24px] border border-slate-100 bg-white p-5"
        >
          <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />

          <div className="mt-5 space-y-2">
            <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function CandidatesPage() {
  const supabase = await createClient();

  const { data: candidatesData } = await supabase
    .from("candidatos")
    .select()
    .in("anio_eleccion", [2026, 2027])
    .in("tipo", ["Candidato Presidencial", "Excandidato Presidencial", "Candidato Alcaldía"])
    .order("created_at", { ascending: false });

  const candidates = (candidatesData ?? []) as ElectoralCandidate[];
  const locales = candidates.filter(c => c.anio_eleccion === 2027 && c.tipo === "Candidato Alcaldía");
  const presidenciales = candidates.filter(c => c.anio_eleccion === 2026 && ["Candidato Presidencial", "Excandidato Presidencial"].includes(c.tipo ?? ""));

  const { data: temasData } = await supabase.from("tema").select();
  const temas = (temasData ?? []) as Tema[];

  return (
    <div className="w-full bg-white text-[#111b3f]">
      <main className="flex w-full flex-col items-center">
        <Suspense fallback={<Navbar user={null} />}>
          <NavbarWithUser />
        </Suspense>

        {/* =====================================================
            HERO — POR QUÉ CONOCER A LOS CANDIDATOS
        ====================================================== */}

        <section
          aria-labelledby="candidatos-hero-title"
          className="mt-5 w-full"
        >
          <div className="relative isolate overflow-hidden bg-[#111b3f]">
            <Image
              src="/catamejia18-photography-5070284.jpg"
              alt="Fotografía de contexto colombiano"
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
                  "linear-gradient(90deg, rgba(16,26,61,0.91) 0%, rgba(22,34,74,0.74) 38%, rgba(21,35,72,0.18) 76%, rgba(21,35,72,0.08) 100%)",
              }}
            />

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#10162d]/40 via-transparent to-transparent max-sm:bg-[#111b3f]/30"
            />

            <div className="relative z-10 mx-auto flex min-h-[500px] w-full max-w-6xl items-end px-6 py-10 sm:min-h-[540px] sm:py-12 lg:min-h-[580px] lg:py-14">
              <div className="max-w-3xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d4ccff]">
                  Elecciones
                </p>

                <h1
                  id="candidatos-hero-title"
                  className="mt-6 text-[42px] font-semibold leading-[0.98] tracking-[-0.045em] text-white sm:text-6xl lg:text-[72px]"
                >
                  Conoce antes
                  <br />
                  de elegir.
                </h1>

                <p className="mt-6 max-w-xl text-sm leading-7 text-white/90 sm:text-base">
                  Las decisiones públicas influyen en tu trabajo, tu economía, tu educación y tu seguridad. Conoce quiénes aspiran a gobernar y qué proponen.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ELECCIONES LOCALES — una composición completa, incluso sin perfiles */}
        <section id="locales" aria-labelledby="candidatos-title" className="w-full max-w-6xl scroll-mt-24 px-6 py-12 md:py-16">
          <div className="grid overflow-hidden rounded-[28px] bg-[#f2f5ff] md:grid-cols-[1.05fr_0.95fr]">
            <div className="relative flex min-h-[280px] items-end overflow-hidden bg-[#111b3f] p-6 sm:min-h-[330px] sm:p-8">
              <Image src="/candidatos-bogota.jpg" alt="Calle y arquitectura urbana en Colombia" fill sizes="(max-width: 768px) 100vw, 580px" className="object-cover object-center" />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#111b3f]/80 via-[#111b3f]/10 to-transparent" />
              <span aria-hidden="true" className="relative text-[100px] font-semibold leading-none tracking-[-0.065em] text-white sm:text-[130px]">2027</span>
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5574ff]">Las elecciones locales 2027</p>
              <h2 id="candidatos-title" className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-4xl">
                Quiénes son.<br />Qué ciudad plantean.
              </h2>
              <div className="mt-7 flex items-baseline gap-3 border-t border-[#d9e2fb] pt-5">
                <span className="text-4xl font-semibold tracking-[-0.045em] text-[#7863bd]">{locales.length}</span>
                <span className="text-xs text-slate-600">{locales.length === 1 ? "candidato" : "candidatos"}</span>
              </div>
            </div>
          </div>
          <div className="mt-7 grid gap-6 border-t border-[#e2e9f8] pt-6 md:grid-cols-[1.15fr_0.85fr] md:gap-10">
            <div>
              <h3 className="text-sm font-semibold text-[#111b3f]">¿Qué elegimos en 2027?</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                En las elecciones territoriales elegimos alcaldes, gobernadores, concejales, diputados de las asambleas departamentales y ediles de las juntas administradoras locales.
              </p>
              <a href="https://www.registraduria.gov.co/-Historico-de-resultados-electorales-.html" target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs text-[#5574ff] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff]">Sobre las elecciones territoriales · Registraduría<span className="sr-only"> (abre en una pestaña nueva)</span></a>
            </div>
            {locales.length === 0 && (
              <div className="border-l-2 border-[#b5a0e3] pl-5">
                <h3 className="text-sm font-semibold text-[#7863bd]">¿Por qué aún no aparecen candidatos?</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  En Pragma Radar, incorporaremos los perfiles a medida que contemos con información verificable sobre las candidaturas y sus propuestas.
                </p>
              </div>
            )}
          </div>
          {locales.length > 0 && (
            <div className="mt-8">
              <Suspense fallback={<CandidatesSkeleton />}>
                <CandidatesFilterClient candidates={locales} electionMode="local" temas={temas} />
              </Suspense>
            </div>
          )}
        </section>

        {/* ARCHIVO 2026 — encabezado compacto y perfiles desplegables dentro de la misma tarjeta */}
        <section id="presidencial" aria-labelledby="presidenciales-title" className="w-full scroll-mt-24 border-y border-[#e2e9f8] bg-gradient-to-b from-[#f7f8ff] to-white">
          <div className="mx-auto w-full max-w-6xl px-6 py-8 md:py-10">
            <div className="overflow-hidden rounded-[24px] bg-[#eef2ff]">
              <div className="grid items-center gap-4 sm:grid-cols-[1fr_0.75fr] sm:gap-6">
                <div className="px-6 pb-0 pt-6 sm:py-6 lg:px-8">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7863bd]">Archivo electoral</p>
                  <h2 id="presidenciales-title" className="mt-3 text-2xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-3xl">Elecciones presidenciales <span className="text-[#5574ff]">2026</span></h2>
                  <p className="mt-3 text-xs leading-5 text-slate-600">Consulta los {presidenciales.length} perfiles y sus propuestas.</p>
                </div>
                <div className="px-6 pb-5 sm:py-5 sm:pl-0 sm:pr-6">
                  <Image src="/elecciones_2026.jpeg" alt="Imagen de las elecciones presidenciales de 2026" width={1600} height={900} sizes="(max-width: 640px) 100vw, 440px" className="mx-auto block h-auto w-full max-w-[440px] rounded-[16px]" />
                </div>
              </div>

              <details className="group border-t border-[#dfe5f4]">
                <summary className="flex cursor-pointer list-none items-center px-6 py-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff] [&::-webkit-details-marker]:hidden">
                  <span className="group/link inline-flex items-center gap-2.5 border-b border-[#5574ff]/30 pb-1.5 text-sm font-normal text-[#5574ff] transition hover:border-[#5574ff]">
                    <span className="group-open:hidden">Ver candidatos y propuestas</span>
                    <span className="hidden group-open:inline">Ocultar candidatos y propuestas</span>
                    <span className="inline-flex transition-transform duration-300 group-open:rotate-90 motion-reduce:transition-none">
                      <ArrowIcon />
                    </span>
                  </span>
                </summary>

                <div className="px-6 pb-6">
                  <Suspense fallback={<CandidatesSkeleton />}>
                    <CandidatesFilterClient candidates={presidenciales} temas={temas} />
                  </Suspense>
                </div>
              </details>
            </div>
          </div>
        </section>

        {/* =====================================================
            GUÍA — CÓMO LEER CADA PERFIL
        ====================================================== */}

        <section
          aria-labelledby="conocer-title"
          className="w-full border-t border-[#e2e9f8]"
        >
          <div className="mx-auto w-full max-w-6xl px-6 py-12 md:py-16">
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5574ff]">
                Cómo leer cada perfil
              </p>
              <h2
                id="conocer-title"
                className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-[#111b3f] sm:text-4xl"
              >
                Así puedes explorar
                <br />
                cada candidatura.
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-7 text-slate-600">
                Entra a un perfil para conocer su trayectoria y explorar sus propuestas por tema. Para facilitar la lectura, cada propuesta se presenta en las tres partes que verás a continuación.
              </p>
            </div>

            <ol className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8 md:mt-14">
              {GUIA_PROPUESTAS.map((pregunta) => {
                const Icon = pregunta.icon;

                return (
                  <li
                    key={pregunta.titulo}
                    className="flex flex-col items-center text-center"
                  >
                    <div
                      aria-hidden="true"
                      className={`flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${pregunta.gradient} shadow-[0_12px_32px_rgba(70,105,255,0.14)] sm:h-28 sm:w-28`}
                    >
                      <div className="flex h-[74%] w-[74%] items-center justify-center rounded-full border border-white/45 bg-white/10">
                        <Icon
                          className="h-8 w-8 text-white"
                          strokeWidth={1.8}
                        />
                      </div>
                    </div>

                    <h3 className="mt-5 text-lg font-semibold leading-6 tracking-[-0.02em] text-[#4774ff]">
                      {pregunta.titulo}
                    </h3>

                    <p className="mt-3 max-w-[270px] text-sm leading-6 text-slate-600">
                      {pregunta.texto}
                    </p>
                  </li>
                );
              })}
            </ol>

            {/* GUÍA PARA INTERPRETAR LAS PROPUESTAS */}
            <aside
              aria-labelledby="guia-oido-title"
              className="mt-14 grid overflow-hidden rounded-[28px] border border-[#e2e9f8] bg-[#f2f5ff] md:mt-16 md:grid-cols-2 md:items-center"
            >
              <div className="flex flex-col justify-center p-6 lg:p-8">
                <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5574ff]">
                  <Ear
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0"
                  />
                  Lee con atención
                </p>

                <h3
                  id="guia-oido-title"
                  className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-[#111b3f] lg:text-4xl"
                >
                  No te dejes
                  <br />
                  endulzar el oído.
                </h3>

                <p className="mt-4 text-sm leading-6 text-slate-700">
                  Una promesa puede sonar bien y dejar muchas preguntas por responder. Encuentra claves para revisar si se apoya en datos, propone acciones concretas o aclara recursos y plazos.
                </p>

                <div className="mt-5 border-t border-[#d9e2fb] pt-4">
                  <p className="text-xs font-semibold text-[#3458d8]">
                    Cómo usar esta ayuda
                  </p>

                  <p className="mt-2 text-xs leading-6 text-slate-600">
                    En cada perfil, abre un tema y encontrarás el botón “No te dejes endulzar el oído” encima de las propuestas. Los consejos de cada tema son los mismos para todas las candidaturas. Así podrás evaluarlas con un criterio uniforme y de manera más objetiva.
                  </p>
                </div>
              </div>

              <div className="w-full">
                <Image
                  src="/noendulzar.jpg"
                  alt="Tres ranitas de peluche que se cubren la boca, los ojos y los oídos"
                  width={1849}
                  height={1343}
                  sizes="(max-width: 768px) 100vw, 576px"
                  className="block h-auto w-full"
                />
              </div>
            </aside>
          </div>
        </section>

        {/* =====================================================
            COMPARAR — PONER LAS POSICIONES EN PERSPECTIVA
        ====================================================== */}

        <section
          aria-labelledby="comparacion-title"
          className="relative isolate w-full overflow-hidden bg-[#111b3f] text-white"
        >
          <Image
            src="/tumisu-pros-5201376.jpg"
            alt="Fotografía de contexto colombiano"
            fill
            sizes="100vw"
            className="object-cover object-center"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(17,27,63,0.92) 0%, rgba(17,27,63,0.78) 38%, rgba(17,27,63,0.25) 75%, rgba(17,27,63,0.08) 100%)",
            }}
          />

          <div className="relative z-10 mx-auto flex min-h-[380px] w-full max-w-6xl items-center px-6 py-12 md:min-h-[430px] md:py-14">
            <div className="max-w-lg">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-100">
                Pon sus posiciones en perspectiva
              </p>

              <h2
                id="comparacion-title"
                className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-4xl"
              >
                Las mismas preguntas.
                <br />
                Distintas posiciones.
              </h2>

              <p className="mt-5 text-sm leading-7 text-white/90">
                En el comparador puedes revisar las respuestas
                disponibles de varias candidaturas a una misma
                pregunta. Mira dónde coinciden y qué las distingue.
              </p>

              <Link
                href="/comparacion"
                className="group mt-7 inline-flex items-center gap-2.5 border-b border-white/40 pb-1.5 text-sm font-normal tracking-wide text-white transition hover:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Abrir comparador
                <span className="inline-flex transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none">
                  <ArrowIcon />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* =====================================================
            SEGUIMIENTO — LO QUE OCURRE DESPUÉS
        ====================================================== */}

        <section
          aria-labelledby="seguimiento-title"
          className="relative isolate w-full overflow-hidden border-t border-white/15 bg-[#111b3f] text-white"
        >
          <Image
            src="/congreso.jpg"
            alt="Congreso de Colombia"
            fill
            sizes="100vw"
            className="object-cover object-center"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(270deg, rgba(17,27,63,0.95) 0%, rgba(17,27,63,0.78) 38%, rgba(17,27,63,0.25) 75%, rgba(17,27,63,0.08) 100%)",
            }}
          />

          <div aria-hidden="true" className="absolute inset-0 bg-[#111b3f]/55 md:hidden" />
          <div className="relative z-10 mx-auto flex min-h-[380px] w-full max-w-6xl items-center justify-end px-6 py-12 md:min-h-[430px] md:py-14">
            <div className="w-full max-w-lg">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-100">
                Después de las urnas
              </p>

              <h2
                id="seguimiento-title"
                className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-4xl"
              >
                Del compromiso
                <br />
                a los hechos.
              </h2>

              <p className="mt-5 text-sm leading-7 text-white/90">
                Elegir abre una nueva etapa de responsabilidad pública.
                En Pragma Radar puedes consultar los compromisos
                disponibles, sus actualizaciones y la evidencia
                registrada para conocer su estado.
              </p>

              <Link
                href="/seguimiento"
                className="group mt-7 inline-flex items-center gap-2.5 border-b border-white/40 pb-1.5 text-sm font-normal tracking-wide text-white transition hover:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Consultar seguimiento
                <span className="inline-flex transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none">
                  <ArrowIcon />
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <Suspense
          fallback={
            <div className="px-8 py-6 text-sm text-slate-500">
              Cargando pie de página…
            </div>
          }
        >
          <Footer />
        </Suspense>
      </footer>
    </div>
  );
}