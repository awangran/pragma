import { Suspense, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import MinisteriosDirectorio, { type MinisterioDirectorio } from "./ministerios-directorio";

type Persona = { nombre: string | null; avatar: string | null };
type Funcionario = {
  id: number;
  cargo: string;
  candidato: Persona | Persona[] | null;
};
type MinisterioRaw = {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  funcionarios_ministerio: Funcionario[] | null;
};

async function NavbarConUsuario() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return (
    <Navbar
      user={data.user ? { avatarUrl: data.user.user_metadata?.avatar_url ?? null } : null}
    />
  );
}

function Marco({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-[#111b3f]">
      <div className="px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<Navbar user={null} />}>
          <NavbarConUsuario />
        </Suspense>
      </div>

      {children}

      <footer>
        <Suspense fallback={<div className="p-6 text-xs text-slate-500">Cargando pie de página…</div>}>
          <Footer />
        </Suspense>
      </footer>
    </div>
  );
}

function Cargando() {
  return (
    <div role="status" className="py-8">
      <p className="text-sm text-[#7863bd]">Cargando ministerios…</p>
      <div aria-hidden="true" className="mt-6 grid gap-6 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-36 border-b border-[#dfe7f8] bg-[#f7f9ff] motion-safe:animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

export default function MinisteriosPage() {
  return (
    <Marco>
      <main>
        {/* HERO */}
        <header className="relative isolate mt-5 overflow-hidden bg-[#111b3f] text-white">
          <Image
            src="/ministerios.webp"
            alt=""
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
                "linear-gradient(90deg, rgba(17,27,63,0.92) 0%, rgba(17,27,63,0.75) 38%, rgba(17,27,63,0.22) 76%, rgba(17,27,63,0.08) 100%)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#111b3f]/40 via-transparent to-transparent"
          />

          <div className="relative z-10 mx-auto flex min-h-[440px] max-w-6xl flex-col justify-between px-6 py-8 sm:min-h-[500px] sm:py-12">
            <Link
              href="/seguimiento"
              className="inline-flex w-fit items-center gap-2 text-xs text-white/80 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
              Volver al seguimiento
            </Link>

            <div className="mt-12 max-w-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d5ccff]">
                Pragma Radar · Instituciones
              </p>
              <h1 className="mt-5 text-[42px] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl">
                Ministerios.
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-white/90 sm:text-base">
                Cada sector del Gobierno tiene un responsable. Revisa quién lo dirige y qué ha hecho en el cargo.
              </p>
            </div>
          </div>
        </header>

        {/* LISTADO */}
        <div className="mx-auto max-w-6xl px-6 pb-14 pt-10 md:pt-12">
          <Suspense fallback={<Cargando />}>
            <ListadoMinisterios />
          </Suspense>
        </div>
      </main>
    </Marco>
  );
}

async function ListadoMinisterios() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ministerios")
    .select("id,nombre,slug,descripcion,funcionarios_ministerio(id,cargo,candidato:candidato_id(nombre,avatar))")
    .eq("funcionarios_ministerio.activo", true)
    .order("nombre", { ascending: true })
    .order("id", { referencedTable: "funcionarios_ministerio", ascending: false });

  if (error) {
    console.error("Error de ministerios públicos:", {
      message: error.message,
      code: error.code,
      details: error.details,
    });

    return (
      <div role="alert" className="border-y border-[#dfe7f8] py-10 text-sm leading-7 text-slate-600">
        No pudimos cargar los ministerios. Intenta de nuevo más tarde.
      </div>
    );
  }

  const ministerios: MinisterioDirectorio[] = ((data ?? []) as unknown as MinisterioRaw[]).map((m) => {
    const f = m.funcionarios_ministerio?.[0];
    const persona = f
      ? Array.isArray(f.candidato)
        ? f.candidato[0]
        : f.candidato
      : null;

    return {
      id: m.id,
      nombre: m.nombre,
      slug: m.slug,
      descripcion: m.descripcion,
      responsable: persona?.nombre ?? null,
      avatar: persona?.avatar ?? null,
      cargo: f?.cargo ?? null,
    };
  });

  return <MinisteriosDirectorio ministerios={ministerios} />;
}