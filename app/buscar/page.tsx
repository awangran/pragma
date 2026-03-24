import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, ArrowRight } from "lucide-react";

async function NavbarWithUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user ?? null;
  const avatarUrl = user?.user_metadata?.avatar_url ?? null;
  return <Navbar user={user ? { avatarUrl } : null} />;
}

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const supabase = await createClient();

  const [{ data: candidatosData }, { data: articulosData }] = await Promise.all(
    [
      query
        ? supabase
            .from("candidatos")
            .select("id, nombre, cargo, partido, ubicacion, avatar")
            .textSearch("nombre", query, { type: "websearch", config: "spanish" })
        : supabase
            .from("candidatos")
            .select("id, nombre, cargo, partido, ubicacion, avatar")
            .limit(0),
      query
        ? supabase
            .from("articulos")
            .select("id, titulo, resumen, categoria, created_at")
            .textSearch("titulo", query, { type: "websearch", config: "spanish" })
        : supabase
            .from("articulos")
            .select("id, titulo, resumen, categoria, created_at")
            .limit(0),
    ]
  );

  const candidatos = (candidatosData ?? []) as any[];
  const articulos = (articulosData ?? []) as any[];
  const total = candidatos.length + articulos.length;

  return (
    <div className="w-full flex flex-col min-h-screen">
      <Suspense fallback={<Navbar user={null} />}>
        <NavbarWithUser />
      </Suspense>

      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 md:px-8 py-10">
        <div className="w-full max-w-4xl">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
              Resultados para &ldquo;{query}&rdquo;
            </h1>
            <p className="text-slate-500 text-sm">
              {total} resultado{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Candidatos */}
          {candidatos.length > 0 && (
            <section className="mb-10">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-700 mb-4">
                <Users className="h-5 w-5" /> Candidatos
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {candidatos.map((c) => (
                  <Link key={c.id} href={`/candidatos/${c.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                      <CardContent className="pt-5 flex items-center gap-4">
                        {c.avatar && (
                          <img
                            src={c.avatar}
                            alt={c.nombre}
                            className="h-12 w-12 rounded-full object-cover shrink-0"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">{c.nombre}</p>
                          {c.cargo && (
                            <p className="text-sm text-slate-500">{c.cargo}</p>
                          )}
                          {c.partido && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {c.partido}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Artículos */}
          {articulos.length > 0 && (
            <section className="mb-10">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-700 mb-4">
                <FileText className="h-5 w-5" /> Artículos
              </h2>
              <div className="flex flex-col gap-4">
                {articulos.map((a) => (
                  <Link key={a.id} href={`/articulos/${a.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 mb-1">
                          {a.categoria && (
                            <Badge variant="secondary" className="text-xs">
                              {a.categoria}
                            </Badge>
                          )}
                          {a.created_at && (
                            <span className="text-xs text-slate-400">
                              {new Date(a.created_at).toLocaleDateString("es-PR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-base leading-snug">
                          {a.titulo}
                        </CardTitle>
                      </CardHeader>
                      {a.resumen && (
                        <CardContent className="pt-0">
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {a.resumen}
                          </p>
                          <span className="inline-flex items-center text-pblue text-sm mt-2">
                            Leer más <ArrowRight className="ml-1 h-3 w-3" />
                          </span>
                        </CardContent>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Empty state */}
          {query && total === 0 && (
            <div className="text-center py-20 text-slate-500">
              <p className="text-lg font-medium mb-2">Sin resultados</p>
              <p className="text-sm">
                No encontramos candidatos ni artículos para &ldquo;{query}&rdquo;.
                Intenta con otras palabras.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
