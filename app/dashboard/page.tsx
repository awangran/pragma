import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import CandidateCard from "../../components/candidate-card";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ArticleCard from "@/components/article-card";
import {
  Search,
  Users,
  BarChart3,
  Calendar,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import SearchBar from "@/components/search-bar";

// Quick access items
const quickAccess = [
  {
    id: 1,
    title: "Candidatos",
    desc: "Explora perfiles y propuestas",
    href: "/candidatos",
    Icon: Users,
  },
  {
    id: 2,
    title: "Comparar",
    desc: "Contrasta visiones por temas",
    // Si no existe la ruta de comparar aún, redirigimos a candidatos.
    href: "/candidatos",
    Icon: BarChart3,
  },
  {
    id: 3,
    title: "Eventos",
    desc: "Debates y foros cívicos",
    href: "/eventos",
    Icon: Calendar,
  },
  {
    id: 4,
    title: "Seguimiento",
    desc: "Cumplimiento de promesas",
    href: "/articulos", // placeholder
    Icon: TrendingUp,
  },
];

export default async function DashboardPage() {

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = (userData && (userData as any).user) ? (userData as any).user : null;
  const avatarUrl = user?.user_metadata?.avatar_url ?? null;
  const { data: candidatesData } = await supabase.from("candidatos").select();
  const candidates = (candidatesData ?? []) as any[];

  const { data: latestArticlesData } = await supabase
    .from("articulos")
    .select("id, titulo, resumen, categoria, foto")
    .order("created_at", { ascending: false })
    .limit(3);
  const latestArticles = (latestArticlesData ?? []) as any[];
  
  
  
  return (
    <div className="flex-1 w-full flex flex-col" suppressHydrationWarning>
      <Suspense fallback={<Navbar user={null} />}>
        <Navbar user={user ? { avatarUrl } : null} />
      </Suspense>
      <main className="px-0">
        {/* Hero Section (solid background) */}
        <section className="relative overflow-hidden bg-pdarkblue text-white bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: "url('/landing-banner.png')"}}>
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="container mx-auto px-6 py-16 md:py-24 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-purple-100">
                Tu radar ciudadano para
                <span className="block mt-2 text-purple-100">decisiones informadas</span>
              </h1>
              <p className="text-lg md:text-xl text-pgray mb-8 max-w-2xl mx-auto">
                Consulta propuestas, compara candidatos y haz seguimiento al cumplimiento de promesas electorales con evidencia clara y verificable.
              </p>

              {/* Search Bar */}
              <SearchBar />
            </div>
          </div>
        </section>

        
      
        {/* Quick Access */}
        <section className="py-12 bg-white border-b">
          <div className="container mx-auto px-6">
            <Suspense fallback={<div>Loading users...</div>}> 
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickAccess.map(({ id, title, desc, href, Icon }) => (
                <Link key={id} href={href} className="group">
                  <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-pskyblue h-full">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-pskyblue/30 group-hover:bg-pskyblue/50 transition-colors">
                          <Icon className="h-6 w-6 text-pdarkblue" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-pblack mb-1">{title}</h3>
                          <p className="text-sm text-slate-600">{desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            </Suspense>
          </div>
        </section>

        {/* News/Updates Section */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-pblack mb-2">Últimas novedades</h2>
                <p className="text-slate-600">Mantente informado sobre temas coyunturales y propuestas destacadas</p>
              </div>
              <Button variant="outline" className="hidden md:flex">
                <Link href="/articulos">
                Ver todas
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestArticles.map((a) => (
                <ArticleCard
                  key={a.id}
                  id={a.id}
                  titulo={a.titulo}
                  resumen={a.resumen}
                  categoria={a.categoria}
                  foto={a.foto}
                />
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-pblack mb-4">¿Cómo funciona Pragma?</h2>
              <p className="text-lg text-slate-600">Tres pasos para participar de forma informada</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pskyblue/50 mb-4">
                  <Search className="h-8 w-8 text-pdarkblue" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Explora</h3>
                <p className="text-slate-600">Busca candidatos y consulta sus propuestas organizadas por temas clave</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pskyblue/50 mb-4">
                  <BarChart3 className="h-8 w-8 text-pdarkblue" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Compara</h3>
                <p className="text-slate-600">Contrasta las visiones de diferentes candidatos sobre los temas que te importan</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pskyblue/50 mb-4">
                  <CheckCircle className="h-8 w-8 text-pdarkblue" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Verifica</h3>
                <p className="text-slate-600">Haz seguimiento al cumplimiento con evidencia verificable y actualizada</p>
              </div>
            </div>
          </div>
        </section>

        {/* Candidate Cards Section (mantener componentes existentes) */}

        

        
        <section className="mt-2 px-6 py-8">

          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-pblack mb-4">Perfiles Destacados</h2>
              <p className="text-lg text-slate-600">Explora los perfiles y descubre sus propuestas antes de votar.</p>
            

             
            
            </div>

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
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {candidates.map((candidate) => (
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
          </Suspense>
            </div>
          

         

          <div className="flex justify-center mt-6">
            <Link
              href="/candidatos"
              className="w-md border-2 border-pskyblue text-pblue font-medium rounded-full px-8 py-2 hover:bg-pskyblue/30 transition"
            >
              Ver todos
            </Link>
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