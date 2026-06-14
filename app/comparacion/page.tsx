import { Suspense } from "react";
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
    <div className="w-full flex flex-col gap-12">
      <main className="flex flex-col items-center p-4">
        <Suspense fallback={<Navbar user={null} />}>
          <NavbarWithUser />
        </Suspense>

        <h1 className="text-4xl font-semibold mt-12 mb-6">Comparar Candidatos</h1>
        <p className="max-w-3xl text-center mx-12 mb-8">
          Compara las posiciones de los candidatos presidenciales 2026 sobre los temas más importantes del país.
        </p>

        <section className="w-full max-w-5xl space-y-6">
          <div className="rounded-2xl bg-gradient-to-r from-sky-100 via-blue-100 to-sky-200 p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-pblack">Comparación de posiciones</h2>
            <p className="mt-2 max-w-3xl text-sm text-pblack">
              Selecciona 2 o más candidatos y filtra por categoría para ver sus posiciones tema a tema. El indicador de coincidencia muestra qué tanto están de acuerdo.
            </p>
          </div>

          <ComparacionClient />
        </section>
      </main>

      <footer>
        <Suspense fallback={<div className="px-8 py-6 text-sm text-slate-500">Cargando pie de página…</div>}>
          <Footer />
        </Suspense>
      </footer>
    </div>
  );
}
