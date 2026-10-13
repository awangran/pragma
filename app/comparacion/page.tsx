import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Users, SlidersHorizontal, MessagesSquare, ArrowRight } from "lucide-react";

import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import ComparacionClient from "@/components/comparacion-client";
import { createClient } from "@/lib/supabase/server";

async function NavbarWithUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user ?? null;
  const avatarUrl = user?.user_metadata?.avatar_url ?? null;

  return <Navbar user={user ? { avatarUrl } : null} />;
}

export default function ComparacionPage() {
  return (
    <div className="w-full bg-white text-[#111b3f]">
      <main className="flex w-full flex-col items-center">
        <Suspense fallback={<Navbar user={null} />}>
          <NavbarWithUser />
        </Suspense>

        {/* PORTADA — EL PROPÓSITO DE COMPARAR */}
        <section
          aria-labelledby="comparacion-title"
          className="mt-5 w-full"
        >
          <div className="relative isolate overflow-hidden bg-[#111b3f]">
            <Image
              src="/ramison-boat-2459169.jpg"
              alt="Canoas de madera de distintos colores vistas desde arriba"
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
                  "linear-gradient(90deg, rgba(17,27,63,0.92) 0%, rgba(17,27,63,0.70) 40%, rgba(17,27,63,0.20) 75%, rgba(17,27,63,0.06) 100%)",
              }}
            />

            <div className="relative z-10 mx-auto flex min-h-[480px] w-full max-w-6xl items-end px-6 py-10 sm:min-h-[540px] lg:min-h-[580px] lg:py-14">
              <div className="max-w-3xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-sky-300"
                  />
                  Pragma Radar · Comparar candidatos
                </p>

                <h1
                  id="comparacion-title"
                  className="mt-6 text-[42px] font-semibold leading-[0.98] tracking-[-0.045em] text-white sm:text-6xl lg:text-[72px]"
                >
                  Un mismo país.
                  <br />
                  Distintas formas
                  <br />
                  de pensarlo.
                </h1>

                <p className="mt-6 max-w-xl text-sm leading-7 text-white/90 sm:text-base">
                  Conoce cómo responden las candidaturas a las mismas preguntas y qué lugar dan a los asuntos que afectan tu vida.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* GUÍA — EL MISMO LENGUAJE VISUAL DE CANDIDATOS Y SEGUIMIENTO */}
        <section aria-labelledby="guia-comparacion-title" className="w-full max-w-6xl px-6 py-12 md:py-14">
          <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5574ff]">
  Guía de comparación
</p>

<h2
  id="guia-comparacion-title"
  className="mt-3 text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-[#111b3f] sm:text-4xl"
>
  Cómo empezar
</h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600">El comparador reúne las posturas de las candidaturas ante preguntas comunes. Sigue estos pasos:</p>
          </div>
          <ol className="mt-9 grid gap-8 sm:grid-cols-3 sm:gap-10">
            {[
              { titulo: "Elige candidatos", texto: "Selecciona dos o más candidaturas para ver sus respuestas frente a frente.", icon: Users, gradient: "from-[#d6e5ff] via-[#aee8ff] to-[#4776ff]" },
              { titulo: "Encuentra un tema", texto: "Usa los filtros para centrar la lectura en un asunto.", icon: SlidersHorizontal, gradient: "from-[#dfe8ff] via-[#b5d9ff] to-[#7768ff]" },
              { titulo: "Contrasta sus respuestas", texto: "Observa qué priorizan, dónde coinciden y qué los distingue.", icon: MessagesSquare, gradient: "from-[#eee2ff] via-[#b9e7ff] to-[#4278ff]" },
            ].map((paso, index) => {
              const Icon = paso.icon;
              return (
                <li key={paso.titulo} className="flex flex-col items-center text-center">
                  <div aria-hidden="true" className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${paso.gradient} shadow-[0_12px_32px_rgba(70,105,255,0.14)] sm:h-24 sm:w-24`}>
                    <div className="flex h-[74%] w-[74%] items-center justify-center rounded-full border border-white/45 bg-white/10"><Icon className="h-7 w-7 text-white" strokeWidth={1.8} /></div>
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-[#4774ff]"><span className="sr-only">Paso {index + 1}: </span>{paso.titulo}</h3>
                  <p className="mt-2 max-w-[270px] text-sm leading-6 text-slate-600">{paso.texto}</p>
                </li>
              );
            })}
          </ol>
        </section>

       {/* COMPARADOR */}
<section
  id="comparador"
  aria-labelledby="herramienta-title"
  className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-10 sm:px-6 md:py-12"
>
  <div className="overflow-hidden rounded-[30px] border border-[#e1e5f4] bg-white shadow-[0_8px_35px_rgba(17,27,63,0.04)]">
    {/* ENCABEZADO CON IMAGEN */}
<div className="relative isolate overflow-hidden border-b border-[#e5e8f4] bg-[#f0ebfc]">
  <Image
    src="/tumisu-pros-5201376.jpg"
    alt=""
    fill
    sizes="(max-width: 1152px) 100vw, 1152px"
    className="pointer-events-none object-cover object-right"
  />

  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0"
    style={{
      background:
        "linear-gradient(90deg, rgba(243,239,252,0.98) 0%, rgba(243,239,252,0.92) 32%, rgba(243,239,252,0.50) 58%, rgba(243,239,252,0.06) 82%, transparent 100%)",
    }}
  />

  <div className="relative z-10 flex min-h-[220px] items-center gap-4 px-6 py-7 sm:min-h-[200px] sm:px-8">
    <span
      aria-hidden="true"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/65 text-[#7863bd]"
    >
      <Users className="h-5 w-5" strokeWidth={1.7} />
    </span>

    <div>
      <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#7863bd]">
        Tu comparación
      </p>

      <h2
        id="herramienta-title"
        className="mt-3 text-2xl font-semibold leading-[1.12] tracking-[-0.035em] text-[#111b3f] sm:text-3xl"
      >
        Compara sus posturas.
      </h2>
    </div>
  </div>
</div>

    {/* CONTROLES Y RESULTADOS */}
    <div className="min-w-0 p-5 sm:p-8">
      <Suspense
        fallback={
          <div
            role="status"
            className="flex min-h-48 items-center justify-center text-xs text-slate-500"
          >
            Cargando el comparador…
          </div>
        }
      >
        <ComparacionClient />
      </Suspense>
    </div>
  </div>
</section>

       {/* POLÍTICA EXTERIOR */}
<section
  aria-labelledby="exterior-title"
  className="w-full bg-[#111b3f] text-white"
>
  <div className="relative isolate overflow-hidden">
    <div
      aria-hidden="true"
      className="absolute inset-0 grid md:grid-cols-[1.15fr_0.85fr]"
    >
      <div className="relative">
        <Image
          src="/desilia-mountain-2483311_1920.jpg"
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 58vw"
          className="object-cover object-center"
        />
      </div>

      <div className="relative hidden md:block">
        <Image
          src="/andyurias-boat-4492954_1920.jpg"
          alt=""
          fill
          sizes="42vw"
          className="object-cover object-center"
        />
      </div>
    </div>

    <div
      aria-hidden="true"
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(90deg, rgba(17,27,63,0.94) 0%, rgba(17,27,63,0.82) 35%, rgba(17,27,63,0.28) 65%, rgba(17,27,63,0.06) 100%)",
      }}
    />

    <div className="relative z-10 mx-auto flex min-h-[380px] w-full max-w-6xl items-center px-6 py-10 md:min-h-[420px] md:py-12">
      <div className="max-w-lg">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-200">
          Colombia y el mundo
        </p>

        <h2
          id="exterior-title"
          className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-4xl"
        >
          Nuestro país no termina
          <br />
          en la frontera
        </h2>

        <p className="mt-5 max-w-md text-sm leading-7 text-white/85">
          El comercio, la cooperación y las relaciones con otros
          países conectan la política exterior con nuestra vida.
          Compara qué lugar quiere dar cada candidatura a Colombia
          en el mundo.
        </p>

        <p className="mt-6 max-w-md border-l-2 border-blue-200/60 pl-4 text-xs leading-6 text-white/90">
          ¿Qué relaciones busca fortalecer y qué prioridades
          plantea defender?
        </p>
      </div>
    </div>
  </div>

  <div className="md:hidden">
    <Image
      src="/desilia-mountain-2483311_1920.jpg"
      alt="Monumento del Monte Rushmore en Estados Unidos"
      width={1920}
      height={1280}
      sizes="100vw"
      className="block h-auto w-full"
    />
  </div>
</section>

        {/* AMBIENTE — MISMO RITMO, TEXTO AL LADO OPUESTO */}
        <section aria-labelledby="naturaleza-title" className="w-full bg-[#111b3f] text-white">
          <div className="relative isolate overflow-hidden">
            <div aria-hidden="true" className="absolute inset-0 grid md:grid-cols-[0.8fr_1.2fr]">
              <div className="relative hidden md:block">
                <Image src="/gkmjerry-bird-7014135.jpg" alt="" fill sizes="40vw" className="object-cover object-[50%_40%]" />
              </div>
              <div className="relative">
                <Image src="/north4th-monkey-1249559.jpg" alt="" fill sizes="(max-width: 768px) 100vw, 60vw" className="object-cover object-[50%_68%]" />
              </div>
            </div>
            <div aria-hidden="true" className="absolute inset-0 bg-[#111b3f]/65 md:hidden" />
            <div aria-hidden="true" className="absolute inset-0" style={{ background: "linear-gradient(270deg, rgba(17,27,63,0.94) 0%, rgba(17,27,63,0.80) 32%, rgba(17,27,63,0.32) 58%, rgba(17,27,63,0.04) 100%)" }} />
            <div className="relative z-10 mx-auto flex min-h-[400px] w-full max-w-6xl items-center justify-end px-6 py-12 md:min-h-[440px] md:py-14">
              <div className="w-full max-w-lg">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-100">El futuro que compartimos</p>
                <h2 id="naturaleza-title" className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-4xl lg:text-5xl">No hay país próspero sobre un territorio destruido.</h2>
                <p className="mt-5 max-w-md text-sm leading-7 text-white/90">El agua, los ecosistemas y las comunidades que viven de ellos también tienen lugar en el debate. Revisa cómo se relacionan las posiciones sobre ambiente y desarrollo.</p>
                <p className="mt-6 max-w-md border-l-2 border-blue-200/60 pl-4 text-xs leading-6 text-white/90">¿Qué propone proteger cada candidatura y cómo plantea hacerlo?</p>
              </div>
            </div>
          </div>
          <div className="md:hidden">
            <Image src="/north4th-monkey-1249559.jpg" alt="Mono de rostro claro entre la vegetación" width={2048} height={1365} sizes="100vw" className="block h-auto w-full" />
          </div>
        </section>

        {/* EXPLORAR CANDIDATURAS */}
        <div className="w-full px-6 py-12 md:py-16">
          <section
            aria-labelledby="candidaturas-title"
            className="mx-auto w-full max-w-6xl overflow-hidden rounded-[24px] border border-[#e2e9f8] bg-[#f2f5ff]"
          >
            <div className="grid md:grid-cols-[1.15fr_0.85fr]">
              <div className="flex items-center px-6 py-9 sm:px-10 lg:px-14">
                <div className="max-w-lg">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5574ff]">
                    Las personas detrás de las propuestas
                  </p>

                  <h2
                    id="candidaturas-title"
                    className="mt-3 text-3xl font-semibold leading-[1.05] tracking-[-0.035em]"
                  >
                    Conoce quiénes quieren
                    <br />
                    representar al país.
                  </h2>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    Cada propuesta tiene una trayectoria detrás. Explora quiénes
                    son las candidaturas, qué han hecho y qué plantean para Colombia.
                  </p>

                  <Link
                    href="/candidatos"
                    className="mt-5 inline-flex items-center gap-2 border-b border-[#243d9b]/40 pb-2 text-sm font-medium tracking-[-0.01em] text-[#243d9b] transition-colors hover:border-[#111b3f] hover:text-[#111b3f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff]"
                  >
                    Conocer las candidaturas
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="relative" style={{ minHeight: 260 }}>
                <Image
                  src="/candidatos.png"
                  alt="Retratos de candidaturas"
                  fill
                  sizes="(max-width: 768px) 100vw, 544px"
                  className="object-cover object-[center_85%]"
                />
              </div>
            </div>
          </section>
        </div>
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
