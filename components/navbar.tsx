"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { User, Menu, X, Plus, Bookmark, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function AccountMenu({ avatarUrl }: { avatarUrl?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function logout() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const { error: authError } = await createClient().auth.signOut();
      if (authError) { setError("No pudimos cerrar la sesión."); return; }
      router.push("/auth/login"); router.refresh();
    } catch { setError("No pudimos cerrar la sesión."); }
    finally { setBusy(false); }
  }
  return <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button type="button" aria-label="Abrir menú de cuenta"
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#181C32] text-white ring-1 ring-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff]">
        {avatarUrl ? <Image src={avatarUrl} alt="" width={36} height={36} unoptimized className="h-9 w-9 object-cover" /> : <User aria-hidden className="h-4 w-4" />}
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-48 rounded-xl border-[#e2e9f8] bg-white p-1.5 text-[#111b3f] shadow-lg">
      <DropdownMenuItem asChild><Link href="/perfil?seccion=guardados" className="flex items-center gap-2"><Bookmark aria-hidden className="h-4 w-4" />Ver favoritos</Link></DropdownMenuItem>
      <DropdownMenuItem asChild><Link href="/perfil?seccion=cuenta" className="flex items-center gap-2"><User aria-hidden className="h-4 w-4" />Ver mi perfil</Link></DropdownMenuItem>
      <DropdownMenuItem disabled={busy} onSelect={(event) => { event.preventDefault(); void logout(); }} className="mt-1 flex items-center gap-2 border-t border-[#e2e9f8] text-rose-700">
        <LogOut aria-hidden className="h-4 w-4" />{busy ? "Cerrando sesión…" : "Cerrar sesión"}
      </DropdownMenuItem>
      {error && <p role="alert" className="px-2 py-2 text-xs text-rose-700">{error}</p>}
    </DropdownMenuContent>
  </DropdownMenu>;
}

export function Navbar({
  user,
}: {
  user?: { avatarUrl?: string } | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const supabase = createClient();

      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData?.user) {
        setIsAdmin(false);
        setIsCheckingRole(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profileError) {
        setIsAdmin(false);
        setIsCheckingRole(false);
        return;
      }

      setIsAdmin(profileData?.role === "admin");
      setIsCheckingRole(false);
    };

    void checkRole();
  }, []);

  const navLinks = [
    { href: "/dashboard", label: "Inicio" },
    { href: "/candidatos", label: "Candidatos" },
    { href: "/seguimiento", label: "Seguimiento" },
    { href: "/comparacion", label: "Comparar" },
    { href: "/eventos", label: "Eventos" },
    { href: "/articulos", label: "Artículos" },
  ];

  return (
    <nav className="w-full border-b border-slate-100 bg-white">
      <div className="flex w-full items-center justify-between px-4 py-3 sm:px-6 md:px-8">
        {/* =====================================================
            LOGO PRAGMA RADAR
        ====================================================== */}

        <Link
          href="/dashboard"
          className="flex shrink-0 items-center"
          aria-label="Pragma Radar - Inicio"
        >
          <Image
            src="/pragma-radar-logo2.jpeg"
            alt="Pragma Radar"
            width={190}
            height={48}
            priority
            className="h-8 w-auto object-contain sm:h-9"
          />
        </Link>

        {/* =====================================================
            DESKTOP NAVIGATION
        ====================================================== */}

        <div className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#181C32] transition-colors hover:text-violet-600"
            >
              {link.label}
            </Link>
          ))}

          {!isCheckingRole && isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 w-9 rounded-full border border-slate-200 p-0 text-[#181C32] transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                  title="Agregar contenido"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/admin/add-candidato">
                    Agregar candidato
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/admin/add-articulo">
                    Agregar artículo
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/admin/add-evento">
                    Agregar evento
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* =====================================================
            DESKTOP AUTH
        ====================================================== */}

        <div className="hidden items-center gap-4 md:flex">
          {!user ? (
            <Button
              variant="outline"
              className="rounded-full border border-sky-200 px-5 text-sm font-medium text-[#181C32] transition hover:border-sky-300 hover:bg-sky-50"
              asChild
            >
              <Link href="/auth/sign-up">Regístrate</Link>
            </Button>
          ) : (
            <AccountMenu avatarUrl={user.avatarUrl} />
          )}
        </div>

        {/* =====================================================
            MOBILE MENU BUTTON
        ====================================================== */}

        <div className="flex items-center gap-3 md:hidden">
          {user && <AccountMenu avatarUrl={user.avatarUrl} />}
        <button
          className="rounded-full p-2 transition-colors hover:bg-slate-100 md:hidden"
          onClick={() => setIsOpen((current) => !current)}
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <X className="h-5 w-5 text-[#181C32]" />
          ) : (
            <Menu className="h-5 w-5 text-[#181C32]" />
          )}
        </button>
        </div>
      </div>

      {/* =====================================================
          MOBILE NAVIGATION
      ====================================================== */}

      {isOpen && (
        <div className="border-t border-slate-100 bg-white md:hidden">
          <div className="space-y-1 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-xl px-4 py-2.5 text-sm font-medium text-[#181C32] transition-colors hover:bg-violet-50 hover:text-violet-700"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* ADMIN */}

            {!isCheckingRole && isAdmin && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="flex items-center gap-1.5 px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  <Plus className="h-3.5 w-3.5" />
                  Agregar contenido
                </p>

                <div className="mt-2 space-y-1">
                  <Link
                    href="/admin/add-candidato"
                    onClick={() => setIsOpen(false)}
                    className="block rounded-xl px-4 py-2 text-sm font-medium text-[#181C32] transition hover:bg-slate-50"
                  >
                    Candidato
                  </Link>

                  <Link
                    href="/admin/add-articulo"
                    onClick={() => setIsOpen(false)}
                    className="block rounded-xl px-4 py-2 text-sm font-medium text-[#181C32] transition hover:bg-slate-50"
                  >
                    Artículo
                  </Link>

                  <Link
                    href="/admin/add-evento"
                    onClick={() => setIsOpen(false)}
                    className="block rounded-xl px-4 py-2 text-sm font-medium text-[#181C32] transition hover:bg-slate-50"
                  >
                    Evento
                  </Link>
                </div>
              </div>
            )}

            {/* AUTH */}

            <div className="mt-4 border-t border-slate-100 pt-4">
              {!user ? (
                <Button
                  variant="outline"
                  className="w-full rounded-full border border-sky-200 font-medium text-[#181C32] hover:bg-sky-50"
                  asChild
                >
                  <Link
                    href="/auth/sign-up"
                    onClick={() => setIsOpen(false)}
                  >
                    Regístrate
                  </Link>
                </Button>
              ) : (
                null
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}