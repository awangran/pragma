import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/candidatos", label: "Candidatos" },
  { href: "/comparacion", label: "Comparar" },
  { href: "/seguimiento", label: "Seguimiento" },
  { href: "/eventos", label: "Eventos" },
  { href: "/articulos", label: "Artículos" },
  { href: "/nosotros", label: "Nosotros" },
];

export default function Footer() {
  return (
    <div className="w-full border-t border-[#e0e6f4] bg-[#f5f6fc] text-[#111b3f]">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="flex flex-col gap-6 py-7 md:flex-row md:items-center md:justify-between md:gap-10 md:py-8">
          <Link href="/" aria-label="Pragma Radar, inicio" className="inline-flex w-fit shrink-0 items-center gap-3 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff]">
            <Image src="/pragma-logo.svg" alt="" width={40} height={40} className="h-10 w-10" />
            <span className="text-lg font-semibold tracking-[-0.025em]">Pragma Radar</span>
          </Link>
          <nav aria-label="Navegación del pie de página">
            <ul className="flex flex-wrap gap-x-5 gap-y-3 md:justify-end">
              {links.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="rounded-sm text-xs font-medium text-slate-600 transition hover:text-[#3458d8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff]">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex flex-col gap-3 border-t border-[#e0e6f4] py-4 text-[11px] leading-5 text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Pragma Radar</span>
          <nav aria-label="Información legal">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              <li><Link href="/politica-de-privacidad" className="rounded-sm transition hover:text-[#3458d8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff]">Política de privacidad</Link></li>
              <li><Link href="/terminos" className="rounded-sm transition hover:text-[#3458d8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff]">Términos y condiciones</Link></li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
