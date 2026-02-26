import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { Calendar, ExternalLink } from "lucide-react";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const supabase = await createClient();
  const { slug } = await params;
  const articleId = parseInt(slug, 10);

  const { data: userData } = await supabase.auth.getUser();
  const user = userData && (userData as any).user ? (userData as any).user : null;
  const avatarUrl = user?.user_metadata?.avatar_url ?? null;

  const { data: article } = await supabase
    .from("articulos")
    .select("id, titulo, resumen, categoria, cuerpo, fuentes, foto, created_at")
    .eq("id", articleId)
    .single();

  // Check if user is admin
  let isAdmin = false;
  if (user?.id) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profileData?.role === "admin";
  }

  if (!article) {
    return (
      <div className="w-full flex flex-col min-h-screen">
        <Navbar user={null} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-semibold text-slate-900 mb-2">
              Artículo no encontrado
            </h1>
            <p className="text-slate-600 mb-4">
              El artículo que buscas no existe o ha sido eliminado.
            </p>
            <Link
              href="/articulos"
              className="text-blue-600 hover:underline font-medium"
            >
              Volver a artículos
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedDate = article.created_at
    ? new Date(article.created_at).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const fuentesArray = article.fuentes
    ? article.fuentes.split(",").map((f: string) => f.trim()).filter(Boolean)
    : [];

  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center">
          <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 md:px-8 py-6 sm:py-8">
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mb-6" />
            <div className="rounded-2xl bg-slate-100 animate-pulse aspect-video w-full mb-6" />
            <div className="space-y-3">
              <div className="h-8 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
        </div>
      }
    >
      <div className="w-full flex flex-col min-h-screen">
        <Suspense fallback={<Navbar user={null} />}>
          <Navbar user={user ? { avatarUrl } : null} />
        </Suspense>

        <main className="flex-1 flex flex-col items-center">
          <article className="mx-auto w-full max-w-4xl px-4 sm:px-6 md:px-8 py-6 sm:py-8">
            {/* Breadcrumb */}
            <nav className="mb-4 sm:mb-6 flex items-center gap-2 text-xs sm:text-sm">
              <Link
                href="/articulos"
                className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Artículos
              </Link>
              <span className="text-slate-400">/</span>
              <span className="text-slate-600 truncate">{article.titulo}</span>
            </nav>

            {/* Featured image */}
            {article.foto && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6 sm:mb-8 shadow-sm">
                <Image
                  src={article.foto}
                  alt={article.titulo}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Header */}
            <header className="mb-6 sm:mb-8">
              {/* Category */}
              <span className="inline-block text-xs sm:text-sm font-medium text-blue-600 mb-2">
                {article.categoria}
              </span>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                {article.titulo}
              </h1>

              {/* Summary */}
              {article.resumen && (
                <p className="text-base sm:text-lg text-slate-600 mb-4">
                  {article.resumen}
                </p>
              )}

              {/* Date */}
              {formattedDate && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                  <Calendar className="h-4 w-4" aria-hidden />
                  <time dateTime={article.created_at}>{formattedDate}</time>
                </div>
              )}

              {/* Edit button for admins */}
              {isAdmin && (
                <Link
                  href={`/admin/edit-articulo/${articleId}`}
                  className="mt-4 inline-flex w-max items-center justify-center rounded-lg border border-blue-300 bg-blue-50 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  ✎ Editar artículo
                </Link>
              )}
            </header>

            {/* Article body */}
            <div className="prose prose-slate prose-sm sm:prose-base max-w-none mb-8 sm:mb-12">
              {article.cuerpo?.split("\n\n").map((paragraph: string, idx: number) => (
                <p key={idx} className="text-slate-700 leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* References */}
            {fuentesArray.length > 0 && (
              <aside className="border-t border-slate-200 pt-6 sm:pt-8">
                <h2 className="text-sm sm:text-base font-semibold text-slate-900 mb-3">
                  Fuentes y referencias
                </h2>
                <ul className="space-y-2">
                  {fuentesArray.map((fuente: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <ExternalLink className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" aria-hidden />
                      {fuente.startsWith("http") ? (
                        <a
                          href={fuente}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs sm:text-sm text-blue-600 hover:underline break-all"
                        >
                          {fuente}
                        </a>
                      ) : (
                        <span className="text-xs sm:text-sm text-slate-600">
                          {fuente}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </aside>
            )}

            {/* Back link */}
            <div className="mt-8 sm:mt-12 pt-6 border-t border-slate-200">
              <Link
                href="/articulos"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
              >
                ← Volver a artículos
              </Link>
            </div>
          </article>
        </main>

        <Footer />
      </div>
    </Suspense>
  );
}
