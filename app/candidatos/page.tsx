import { Suspense } from "react";

import CandidateCard from "@/components/candidate-card";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import Footer from "@/components/footer";
import CandidatesFilterClient from "@/components/candidates-filter-client";

// how to fix the the suspense error aside from using this func? ifkkk
async function NavbarWithUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = (data && (data as any).user) ? (data as any).user : null;
  const avatarUrl = user?.user_metadata?.avatar_url ?? null;

  return <Navbar user={user ? { avatarUrl } : null} />;
}

const filterLinks = [
  {
    label: "Presidencial",
    href: "#presidencial",
    gradient: "from-sky-300 to-cyan-400",
  },
  {
    label: "Cámara",
    href: "#camara",
    gradient: "from-indigo-200 to-purple-300",
  },
  {
    label: "Congreso",
    href: "#congreso",
    gradient: "from-indigo-400 to-blue-500",
  },
];

export default async function CandidatesPage() {
  const supabase = await createClient();
  const { data: candidatesData } = await supabase.from("candidatos").select();
  const candidates = (candidatesData ?? []) as any[];
  const { data: temasData } = await supabase.from("temas").select();
  const temas = (temasData ?? []) as any[];



  /* const activeCandidates = candidates.filter((c) => c?.retirado !== true);
  const retiredCandidates = candidates.filter((c) => c?.retirado === true); */
  return (
    <div className=" w-full flex flex-col gap-12">
      <main className="flex flex-col items-center p-4"> 
      <Suspense fallback={<Navbar user={null} />}>
        <NavbarWithUser />
      </Suspense>

      <h1 className="text-4xl font-semibold mt-12 mb-6">Candidatos</h1>
      <p className="max-w-3xl text-center mx-12"> Explora perfiles, propuestas y seguimiento de cumplimiento

      </p>

      {/* 
      <div className="mt-8 mb-10 flex flex-wrap items-center justify-center gap-4">
        {filterLinks.map((filter) => (
          <Button
            key={filter.label}
            size="lg"
            className={`rounded-full bg-gradient-to-r ${filter.gradient} px-5 py-2 text-white shadow-[0_6px_14px_rgba(0,0,0,0.18)] transition-transform duration-150 hover:scale-105 hover:shadow-[0_10px_20px_rgba(0,0,0,0.18)]`}
            asChild
            type="button"
          >
            <a href={filter.href}>{filter.label}</a>
          </Button>
        ))}
      </div> */}

      <section
        id="presidencial"
        className="mt-6 w-full max-w-5xl space-y-8"
      >
        <div className="rounded-2xl bg-gradient-to-r from-sky-100 via-blue-100 to-sky-200 p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-pblack">Candidatos Presidenciales 2026</h2>
          <p className="mt-2 max-w-3xl text-sm text-pblack">
            Aquí se encontrará una descripción de la convocatoria donde se da un poco de contexto sobre esta, los partidos involucrados, quienes pueden votar etc...
          </p>
        </div>

        <div className="space-y-4">
          <Suspense
            fallback={
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-2xl px-5 py-4 shadow-sm">
                    <div className="h-12 w-12 rounded-full bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 bg-slate-200 rounded" />
                      <div className="h-3 w-1/4 bg-slate-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            }
          >
            <CandidatesFilterClient candidates={candidates as any} temas={temas as any}/>
          </Suspense>

        </div>

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
