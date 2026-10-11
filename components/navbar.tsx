"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { User, Menu, X, Plus } from "lucide-react";
import { LogoutButton } from "./logout-button";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
            <>
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt="Perfil"
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-100"
                />
              ) : (
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#181C32]"
                  title="Perfil"
                >
                  <User
                    className="h-4 w-4 text-white"
                    aria-hidden="true"
                  />
                </div>
              )}

              <LogoutButton />
            </>
          )}
        </div>

        {/* =====================================================
            MOBILE MENU BUTTON
        ====================================================== */}

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
                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-4">
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt="Perfil"
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#181C32]">
                        <User
                          className="h-5 w-5 text-white"
                          aria-hidden="true"
                        />
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium text-[#181C32]">
                        Mi perfil
                      </p>

                      {isAdmin && (
                        <p className="text-[10px] font-medium text-violet-600">
                          Administrador
                        </p>
                      )}
                    </div>
                  </div>

                  <LogoutButton />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}