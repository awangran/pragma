import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import CandidateCard from "../../components/candidate-card";
import SearchBar from "@/components/search-bar";
import {
  ArrowRight,
  CalendarDays,
  GitCompareArrows,
  ScanSearch,
  Search,
} from "lucide-react";
export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user ?? null;
  const avatarUrl = user?.user_metadata?.avatar_url ?? null;
  const [
    { data: candidatesData },
    { data: latestArticlesData },
    { count: propuestasCount },
    { count: ministeriosCount },
    { count: temasCount },
  ] = await Promise.all([
    supabase
      .from("candidatos")
      .select()
      .eq("eleccion_historica", false)
      .eq("tipo", "Candidato Presidencial")
      .order("created_at", { ascending: false }),
    supabase
      .from("articulos")
      .select("id, titulo, resumen, categoria, foto, created_at")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase.from("propuestas").select("*", { count: "exact", head: true }),
    supabase.from("ministerios").select("*", { count: "exact", head: true }),
    supabase.from("tema").select("*", { count: "exact", head: true }),
  ]);
  const candidates = candidatesData ?? [];
  const latestArticles = latestArticlesData ?? [];
  const featuredArticle = latestArticles[0] ?? null;
  const secondaryArticles = latestArticles.slice(1, 4);
  const formatDate = (value?: string | null) => {
    if (!value) return null;
    return new Intl.DateTimeFormat("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(value));
  };
  return (
    <div className="w-full flex flex-col bg-white" suppressHydrationWarning>
      <Suspense fallback={<Navbar user={null} />}>
        <Navbar user={user ? { avatarUrl } : null} />
      </Suspense>
      <main className="overflow-hidden">
        {/* PORTADA */}
        <section className="relative mt-5 w-full overflow-hidden bg-[#101b52] text-white">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/landing-banner.png')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#101b52]/95 via-[#172a76]/78 to-[#3f73ff]/28" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_25%,rgba(132,199,255,0.38),transparent_30%),radial-gradient(circle_at_68%_80%,rgba(181,156,255,0.25),transparent_27%)]" />
          <div className="relative mx-auto grid min-h-[610px] w-full max-w-[1500px] items-end gap-10 px-6 pb-10 pt-28 sm:px-10 md:px-14 md:pb-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-16">
            <div className="max-w-3xl">
              <h1 className="max-w-3xl text-5xl font-semibold leading-[0.96] tracking-[-0.045em] sm:text-6xl lg:text-[76px]">
                Tu radar ciudadano para decisiones informadas.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/75 sm:text-lg">
                Un espacio para comprender lo público, construir tu propia
                opinión y participar en las decisiones que nos afectan.
              </p>
            </div>
            <div className="lg:flex lg:justify-end">
            <div className="w-full max-w-xl rounded-[1.75rem] border border-white/20 bg-[#111b3f]/35 p-3 sm:p-4">
              <div className="rounded-2xl bg-white p-1.5">
                <SearchBar />
              </div>
            </div>
          </div>
          </div>
        </section>

        {/* EXPLORA */}
        <section
  aria-labelledby="explora-title"
  className="mx-auto w-full max-w-6xl px-6 pb-7 pt-11 md:pb-8 md:pt-12"
>
  <div className="mb-8 max-w-2xl">
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5574ff]">
      Explora Pragma Radar
    </p>
    <h2
      id="explora-title"
      className="mt-2 text-2xl font-semibold tracking-tight text-pblack sm:text-3xl"
    >
      Cuatro formas de empezar.
    </h2>
  </div>
  <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-4 sm:gap-x-6">
    {[
      {
        href: "/candidatos",
        label: "Conoce a los candidatos",
        description:
          "Consulta sus trayectorias y explora sus propuestas por tema.",
        icon: Search,
        gradient: "from-[#e8e1ff] via-[#aee8ff] to-[#4776ff]",
      },
      {
        href: "/comparacion",
        label: "Compara sus posiciones",
        description:
          "Compara cómo responden a las mismas preguntas.",
        icon: GitCompareArrows,
        gradient: "from-[#dfe8ff] via-[#b5d9ff] to-[#7768ff]",
      },
      {
        href: "/seguimiento",
        label: "Sigue los compromisos",
        description:
          "Consulta qué pasó con lo prometido.",
        icon: ScanSearch,
        gradient: "from-[#eee2ff] via-[#b9e7ff] to-[#4278ff]",
      },
      {
        href: "/eventos",
        label: "Participa en encuentros",
        description:
          "Encuentra espacios para conversar sobre el país.",
        icon: CalendarDays,
        gradient: "from-[#dff7ff] via-[#b8ddff] to-[#6570ff]",
      },
    ].map((item) => {
      const Icon = item.icon;
      return (
        <Link
          key={item.href}
          href={item.href}
          className="group rounded-2xl text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff]"
        >
          <div
            className={`mx-auto flex aspect-square w-full max-w-[142px] items-center justify-center rounded-full bg-gradient-to-br ${item.gradient} shadow-[0_18px_45px_rgba(70,105,255,0.18)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_22px_55px_rgba(70,105,255,0.26)] motion-reduce:transform-none motion-reduce:transition-none`}
          >
            <div className="flex h-[74%] w-[74%] items-center justify-center rounded-full border border-white/45 bg-white/10 backdrop-blur-sm">
              <Icon
                aria-hidden="true"
                className="h-9 w-9 text-white drop-shadow-sm"
                strokeWidth={1.8}
              />
            </div>
          </div>
          <h3 className="mx-auto mt-5 max-w-[210px] text-sm font-semibold leading-5 text-[#4774ff] sm:min-h-[40px]">
            {item.label}
          </h3>
          <p className="mx-auto mt-2 max-w-[230px] text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
            {item.description}
          </p>
        </Link>
      );
    })}
  </div>
</section>

        {/* ACTUALIDAD */}
        <section className="mx-auto w-full max-w-6xl px-6 py-10 md:py-12">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5574ff]">
                Actualidad
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-pblack">
                Últimas novedades
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                Explora temas de coyuntura y artículos para entender qué está cambiando en Colombia y cómo se conecta con tu vida.
              </p>
            </div>
            <Link
              href="/articulos"
              className="hidden items-center gap-2 text-sm font-semibold text-[#4774ff] sm:inline-flex"
            >
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {featuredArticle ? (
            <div className="grid gap-5 lg:grid-cols-[1.7fr_0.85fr]">
              <Link
                href={`/articulos/${featuredArticle.id}`}
                className="group relative min-h-[370px] overflow-hidden rounded-[1.7rem] bg-gradient-to-br from-[#8edcff] via-[#d6ccff] to-[#4777ff]"
              >
                {featuredArticle.foto && (
                  <div
                    className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-[1.02]"
                    style={{
                      backgroundImage: `url("${featuredArticle.foto}")`,
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#173378]/85 via-[#315ac7]/15 to-white/5" />
                <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-9">
                  {featuredArticle.categoria && (
                    <span className="mb-3 inline-flex rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-semibold backdrop-blur">
                      {featuredArticle.categoria}
                    </span>
                  )}
                  <h3 className="max-w-2xl text-2xl font-semibold leading-tight sm:text-3xl">
                    {featuredArticle.titulo}
                  </h3>
                  {formatDate(featuredArticle.created_at) && (
                    <p className="mt-3 text-xs text-white/70">
                      {formatDate(featuredArticle.created_at)}
                    </p>
                  )}
                </div>
              </Link>
              <div className="grid gap-4">
                {secondaryArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/articulos/${article.id}`}
                    className="group relative min-h-[112px] overflow-hidden rounded-[1.35rem] bg-gradient-to-r from-[#cbd7ff] via-[#dcd1ff] to-[#83d8ff] p-5"
                  >
                    {article.foto && (
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-30 transition duration-500 group-hover:scale-[1.03]"
                        style={{
                          backgroundImage: `url("${article.foto}")`,
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#eef2ff]/95 via-[#edf0ff]/85 to-[#d9f3ff]/80" />
                    <div className="relative flex h-full flex-col justify-between text-[#111b3f]">
                      <div className="flex justify-end">
                        <span className="text-[10px] font-medium text-slate-600">
                          {formatDate(article.created_at)}
                        </span>
                      </div>
                      <div>
                        <p className="line-clamp-2 max-w-[90%] text-base font-semibold leading-5">
                          {article.titulo}
                        </p>
                        <span className="mt-2 inline-flex text-xs text-[#4774ff]">
                          Leer artículo
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-[1.75rem] bg-gradient-to-br from-[#dfeaff] via-[#e7dcff] to-[#b5e7ff] p-10 text-sm text-[#53658f]">
              Próximamente encontrarás nuevas publicaciones aquí.
            </div>
          )}
        </section>

        {/* PROPÓSITO */}
        <section
  aria-labelledby="proposito-title"
  className="relative isolate my-8 w-full overflow-hidden bg-[#111b3f] text-white md:my-10"
>
  <Image
    src="/seguimiento-pescadores.png"
    alt="Pescadores en Colombia"
    fill
    sizes="100vw"
    className="object-cover object-center"
  />

  <div
    aria-hidden="true"
    className="absolute inset-0"
    style={{
      background:
        "linear-gradient(90deg, rgba(17,27,63,0.92) 0%, rgba(17,27,63,0.78) 42%, rgba(17,27,63,0.22) 78%, rgba(17,27,63,0.06) 100%)",
    }}
  />

  <div className="relative mx-auto flex min-h-[420px] w-full max-w-6xl items-center px-6 py-10 md:min-h-[460px] md:py-12">
    <div className="w-full max-w-xl">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b9d8ff]">
        La democracia también se construye contigo
      </p>

      <h2
        id="proposito-title"
        className="mt-4 text-3xl font-semibold leading-[1.04] tracking-[-0.035em] sm:text-4xl"
      >
        Entender para participar.
      </h2>
      <p className="mt-4 max-w-lg text-sm leading-6 text-white/90">
        Colombia ocupa el puesto 95 de 143 países en el Índice de Estado de Derecho 2025 del World Justice Project. Detrás de esa cifra hay preguntas que nos conciernen: ¿se respetan nuestros derechos?, ¿quién vigila al poder?, ¿cómo exigimos que cumpla?
      </p>

      <p className="mt-6 max-w-lg border-l-2 border-[#c7b5f5]/70 pl-5 text-sm leading-6 text-white">
        Pragma Radar te ayuda a explorar esas preguntas con información clara y confiable. Aquí puedes entender qué le corresponde hacer a cada gobernante, comparar propuestas y seguir si cumplen lo que prometieron</p>

      <div className="mt-5 max-w-lg border-t border-[#b9d8ff]/25 pt-3">
        <p className="text-[0.7rem] leading-5 text-white/70">
          Fuentes
        </p>
        <a
          href="https://worldjusticeproject.org/sites/default/files/documents/Colombia_ES_1.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block text-[0.7rem] leading-5 text-white/70 underline underline-offset-4 hover:text-white"
        >
          World Justice Project
        </a>
      </div>
    </div>
  </div>
</section>

        {/* TERRITORIOS */}
        <section className="mx-auto w-full max-w-6xl px-6 py-9 md:py-8">
          <div className="grid overflow-hidden rounded-[2.5rem] bg-[#f2f5ff] lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-[260px] sm:min-h-[300px] lg:min-h-[340px]">
              <Image
                src="/pragma-choco.jpg"
                alt="Territorio colombiano"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 650px"
              />
            </div>
            <div className="flex items-center p-6 sm:p-7 lg:p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5574ff]">
                  Territorios
                </p>
                <h2 className="mt-4 text-3xl font-semibold leading-[1.04] tracking-[-0.035em] text-[#111936] sm:text-4xl">
                  La política no termina en Bogotá
                </h2>
                <p className="mt-4 text-sm leading-6 text-slate-500">
                En Pragma Radar llevamos la alfabetización política más allá de la capital, con herramientas para que más jóvenes en los territorios puedan informarse, cuestionar y participar en las decisiones que afectan sus comunidades.</p>
              </div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { src: "/guajira3.jpg", alt: "Persona defendiendo derechos laborales", position: "object-left" },
              { src: "/seguimiento-sombrero.jpg", alt: "Persona con sombrero tejido de patrones negros y claros", position: "object-center" },
              { src: "/imagen-san-andres.avif", alt: "Vista aérea de las islas del Caribe colombiano", position: "object-center" },
            ].map((foto) => (
              <div key={foto.src} className="relative h-[120px] overflow-hidden rounded-[1.25rem] sm:h-[180px] md:h-[220px]">
                <Image src={foto.src} alt={foto.alt} fill sizes="(max-width: 1200px) 33vw, 370px" className={`object-cover ${foto.position}`} />
              </div>
            ))}
          </div>
        </section>

        {/* VOCES */}
        <section
          aria-labelledby="voces-title"
          className="mx-auto w-full max-w-6xl px-6 pb-8 pt-2 md:pb-10"
        >
          <h2
            id="voces-title"
            className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5574ff]"
          >
            Quiénes lo impulsan
          </h2>

          <div className="mt-5 grid gap-6 rounded-[22px] bg-gradient-to-r from-[#f5f1fc] to-[#f0f5ff] p-6 sm:p-7 md:grid-cols-2 md:gap-8">
            <figure>
              <blockquote className="text-sm leading-7 text-[#111b3f]">
                “Tener derechos hoy no garantiza que los tendremos mañana. Por eso creo que hay que conocerlos, ejercerlos y defenderlos.”
              </blockquote>
              <figcaption className="mt-4 text-xs">
                <span className="font-semibold text-[#7863bd]">Isabela Archbold</span>
                <span className="ml-2 text-slate-500">Cofundadora</span>
              </figcaption>
            </figure>

            <figure className="border-t border-[#dddff0] pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
              <blockquote className="text-sm leading-7 text-[#111b3f]">
                “Pragma Radar no busca darte respuestas prefabricadas.
                Busca enseñarte a hacer mejores preguntas sobre las
                decisiones que moldean tu vida.”
              </blockquote>
              <figcaption className="mt-4 text-xs">
                <span className="font-semibold text-[#5574ff]">Daniel Ramos</span>
                <span className="ml-2 text-slate-500">Cofundador</span>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* DEL CONTEXTO A LAS PROPUESTAS */}
        <section className="my-9 w-full md:my-10">
  <div className="relative isolate w-full overflow-hidden bg-[#17245b] text-white">
    <Image
      src="/bolsas-pragma2.jpeg"
      alt="Mochilas artesanales colombianas"
      fill
      className="object-cover object-center"
      sizes="100vw"
    />

    <div
      aria-hidden="true"
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(180deg, rgba(17,27,63,0.03) 0%, rgba(17,27,63,0.12) 30%, rgba(17,27,63,0.68) 65%, rgba(17,27,63,0.92) 100%)",
      }}
    />
<div className="relative z-10 mx-auto grid min-h-[370px] w-full max-w-6xl items-end gap-8 px-6 py-7 sm:py-10 md:min-h-[410px] lg:grid-cols-[1fr_1.15fr] lg:gap-12 lg:py-14">      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
          En Pragma Radar
        </p>
        <h2 className="mt-3 max-w-md text-3xl font-semibold leading-[1.06] tracking-[-0.035em] md:text-4xl">
          Del contexto a las propuestas.
        </h2>
        <p className="mt-4 max-w-md text-sm leading-6 text-white/90">
          Lo que pasa en tu comunidad también merece respuestas en la agenda nacional. Explora los temas, contrasta las propuestas y conoce a las instituciones responsables de actuar.
        </p>
      </div>
      <dl className="grid grid-cols-3 border-t border-white/35 pt-6 lg:mb-1">
  {[
    { label: "Propuestas registradas", count: propuestasCount },
    { label: "Temas de veeduría", count: temasCount },
    { label: "Ministerios en seguimiento", count: ministeriosCount },
  ].map((item, index) => (
    <div
      key={item.label}
      className={`flex min-w-0 flex-col ${
        index === 0 ? "pr-3" : "border-l border-white/25 px-3 sm:px-5"
      }`}
    >
      <dt className="order-2 mt-3 text-xs font-medium leading-5 text-white/90 sm:text-sm">
        {item.label}
      </dt>
      <dd className="order-1 text-4xl font-semibold tracking-tight sm:text-5xl">
        {item.count == null ? "—" : item.count.toLocaleString("es-CO")}
      </dd>
    </div>
  ))}
</dl>
    </div>
  </div>
</section>

        {/* CANDIDATOS */}
        <section className="mx-auto w-full max-w-6xl px-6 py-10 md:py-12">
          <div className="mb-8 flex items-end justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5574ff]">
                Elecciones 2026
              </p>
              <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-pblack md:text-4xl">
                Quiénes son y qué plantean
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                Conoce sus trayectorias y revisa cómo sus propuestas responden a los temas que te importan.
              </p>
            </div>
            <Link
              href="/candidatos"
              className="hidden items-center gap-2 border-b border-[#5574ff]/40 pb-1 text-sm font-medium text-[#5574ff] transition hover:border-[#5574ff] sm:inline-flex"
            >
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {candidates.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {candidates.slice(0, 6).map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  id={candidate.id}
                  nombre={candidate.nombre}
                  cargo={candidate.cargo}
                  partido={candidate.partido}
                  avatar={candidate.avatar}
                  ubicacion={candidate.ubicacion}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No hay candidatos disponibles.
            </p>
          )}
          <Link
            href="/candidatos"
            className="mt-7 inline-flex items-center gap-2 border-b border-[#5574ff]/40 pb-1 text-sm font-medium text-[#5574ff] sm:hidden"
          >
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* SEGUIMIENTO */}
        <section
  aria-labelledby="seguimiento-final-title"
  className="relative isolate my-10 w-full overflow-hidden bg-[#111b3f] text-white md:my-14"
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
        "linear-gradient(270deg, rgba(17,27,63,0.94) 0%, rgba(17,27,63,0.82) 35%, rgba(17,27,63,0.32) 70%, rgba(17,27,63,0.10) 100%)",
    }}
  />

  <div className="relative z-10 mx-auto flex min-h-[440px] w-full max-w-6xl items-center justify-end px-6 py-12 md:min-h-[500px] md:py-16">
    <div className="w-full max-w-lg">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-100">
        Participar también es hacer seguimiento
      </p>

      <h2
        id="seguimiento-final-title"
        className="mt-4 text-3xl font-semibold leading-[1.04] tracking-[-0.035em] sm:text-4xl md:text-5xl"
      >
        Elegir es solo
        <br />
        el comienzo.
      </h2>

      <p className="mt-5 max-w-md text-sm leading-7 text-white/90 sm:text-base">
        La participación continúa cuando preguntamos qué pasó con
        lo prometido. Consulta los compromisos, revisa la evidencia
        y conoce las instituciones responsables.
      </p>

      <Link
        href="/seguimiento"
        className="mt-7 inline-flex items-center gap-2 border-b border-white/60 pb-2 text-sm font-medium text-white transition hover:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        Abrir seguimiento
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  </div>
</section>

        {/* JUVENTUD */}
        <section aria-labelledby="juventud-title" className="mx-auto w-full max-w-6xl px-6 pb-4 pt-9 md:pt-10">
          <div className="grid items-center gap-8 border-t border-[#e2e9f8] pt-10 md:grid-cols-[1.05fr_0.95fr] md:gap-12">
            <div className="relative min-h-[300px] overflow-hidden rounded-[1.5rem] sm:min-h-[370px] md:order-2">
              <Image
                src="/septima-papeleta.jpeg"
                alt="Imagen de la Séptima Papeleta"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
            <div className="py-2 md:order-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5574ff]">
                La juventud en la vida pública
              </p>
              <h2 id="juventud-title" className="mt-4 text-3xl font-semibold leading-[1.04] tracking-[-0.035em] text-pblack sm:text-4xl">
                Participar también puede cambiar la historia.
              </h2>
              <p className="mt-5 text-sm leading-7 text-slate-600">
                En 1990, estudiantes de distintas universidades impulsaron la Séptima Papeleta
                y ayudaron a abrir el camino hacia la Constitución de 1991. Su historia demuestra
                que informarse, organizarse y hacer preguntas puede abrir nuevas posibilidades
                para el país.
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Hoy, participar también es entender lo que está en juego
                  y exigir respuestas sobre las decisiones que nos afectan.
              </p>
            </div>
          </div>
        </section>

        {/* ENCUENTROS */}
        <section aria-labelledby="encuentros-title" className="relative isolate mt-8 w-full overflow-hidden bg-[#111b3f] text-white md:mt-10">
        <Image
          src="/jovenes_hablando.jpeg"
          alt="Personas conversando alrededor de una mesa"
          fill
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: "center 85%" }}
        />

  <div
    aria-hidden="true"
    className="absolute inset-0"
    style={{
      background:
  "linear-gradient(270deg, rgba(17,27,63,0.92) 0%, rgba(17,27,63,0.80) 35%, rgba(17,27,63,0.30) 70%, rgba(17,27,63,0.08) 100%)",
    }}
  />

  <div className="relative z-10 mx-auto flex min-h-[440px] w-full max-w-6xl items-center px-6 py-12 md:min-h-[500px] md:justify-end md:py-16">
    <div className="max-w-lg">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-100">
        Encuentros Pragma Radar
      </p>

      <h2
        id="encuentros-title"
        className="mt-4 text-3xl font-semibold leading-[1.06] tracking-[-0.035em] sm:text-4xl md:text-5xl"
      >
        Un lugar para poner nuestras preguntas sobre la mesa.
      </h2>

      <p className="mt-5 max-w-md text-sm leading-7 text-white/90 sm:text-base">
        Espacios para conversar, hacer preguntas y acercar las
        decisiones públicas a nuestra vida cotidiana.
      </p>

      <Link
        href="/eventos"
        className="mt-7 inline-flex items-center gap-2 border-b border-white/60 pb-2 text-sm font-medium text-white transition hover:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        Ver encuentros
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  </div>
</section>
      </main>
      {/* =====================================================
          FOOTER — NO TOCAR EL WRAPPER
      ====================================================== */}
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
