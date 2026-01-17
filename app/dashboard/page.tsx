import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import Link from "next/link";

async function UserAuthCheck() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return null;
}

// Placeholder data
const news = [
  {
    id: 1,
    title: "Candidato a la presidencia anuncia por la red X que ....",
    date: "2 de Enero 2026",
    href: "/articulos/1",
    featured: true,
  },
  {
    id: 2,
    title: "5 cosas que debes saber antes de votar",
    date: "2 de Enero 2026",
    href: "/articulos/2",
  },
  {
    id: 3,
    title: "Fechas de elecciones a la camara",
    date: "24 de Enero 2026",
    href: "/articulos/3",
  },
  {
    id: 4,
    title: "Identifica las diferencias entre partidos",
    date: "2 de Febrero 2026",
    href: "/articulos/4",
  },
];

const elections = [
  {
    id: 1,
    label: "Fechas de Votación",
    icon: "📅",
    href: "/articulos/fechas-votacion",
  },
  {
    id: 2,
    label: "Dónde tengo que votar",
    icon: "📍",
    href: "/articulos/donde-votar",
  },
  {
    id: 3,
    label: "Otra cosa aquí....",
    icon: "❓",
    href: "/articulos/otra-cosa-1",
  },
  {
    id: 4,
    label: "Otra cosa aquí....",
    icon: "💡",
    href: "/articulos/otra-cosa-2",
  },
];

export default function DashboardPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <Navbar />
      <Suspense>
        <UserAuthCheck />
      </Suspense>
      <main className="px-12 py-4">
        {/* Noticias */}
        <h2 className="text-2xl font-bold mb-4">Noticias</h2>
        <div className="flex flex-col md:flex-row gap-6 w-full">
          {/* Main news */}
          <Link
            href={news[0].href}
            className="w-full md:flex-1 rounded-xl bg-gradient-to-br from-blue-200 to-blue-400 p-8 min-h-[260px] flex flex-col justify-end shadow-md transition hover:scale-[1.01]"
            style={{ minWidth: 0 }}
          >
            <div className="text-white text-2xl font-semibold mb-2">
              {news[0].title}
            </div>
            <div className="text-white text-sm">{news[0].date}</div>
          </Link>
          {/* Side news */}
          <div className="flex flex-col gap-4 w-full md:max-w-xs">
            {news.slice(1).map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="w-full rounded-xl bg-gradient-to-br from-blue-200 to-blue-400 p-4 min-h-[70px] flex flex-col justify-between shadow-md transition hover:scale-[1.01]"
              >
                <div className="text-white font-medium">{item.title}</div>
                <div className="text-white text-xs mt-2">{item.date}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Próximas Elecciones */}
        <h2 className="text-2xl font-semibold mt-10 mb-4">Próximas Elecciones</h2>
        <div className="flex gap-12 flex-wrap max-w-5xl mx-auto justify-between">
          {elections.map((el) => (
            <Link
              key={el.id}
              href={el.href}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-36 h-36 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center text-5xl shadow-md mb-2">
                {el.icon}
              </div>
              <span className="text-blue-700 font-medium text-center">{el.label}</span>
            </Link>
          ))}
        </div>
        <div className="flex justify-center mt-8">
          <Link
            href="/articulos"
            className="border-2 border-blue-400 text-blue-500 font-medium rounded-full px-8 py-2 hover:bg-blue-50 transition"
          >
            Ver más artículos
          </Link>
        </div>
      </main>
    </div>
  );
}