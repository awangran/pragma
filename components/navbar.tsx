"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { User, Menu, X, Plus } from "lucide-react";
import { LogoutButton } from "./logout-button";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function Navbar({ user }: { user?: { avatarUrl?: string } | null }) {
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
    { href: "/eventos", label: "Eventos" },
    { href: "/articulos", label: "Artículos" },
  ];

  return (
    <nav className="w-full bg-white border-b">
      <div className="w-full flex items-center justify-between px-4 sm:px-6 md:px-8 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <Image src="/pragma-logo.svg" alt="Pragma Logo" width={48} height={48} />
          <span className="hidden sm:inline text-xl sm:text-2xl font-semibold text-[#181C32]">Pragma</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base font-medium text-[#181C32] hover:text-blue-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {!isCheckingRole && isAdmin && (
            <Button
              variant="outline"
              className="border-2 border-primary text-primary font-medium rounded-full p-2 hover:bg-primary/10"
              asChild
            >
              <Link href="/admin/add-candidato" title="Agregar contenido">
                <Plus className="h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-6">
          {!user ? (
            <Button
              variant="outline"
              className="border-2 border-pskyblue text-pblue font-medium rounded-full px-6 py-2 hover:bg-pskyblue/30"
              asChild
            >
              <Link href="/auth/sign-up">Regístrate</Link>
            </Button>
          ) : (
            <>
              {user?.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt="Perfil"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full ring-2 ring-white object-cover"
                />
              ) : (
                <div
                  className="h-10 w-10 rounded-full bg-pblue ring-2 ring-white flex items-center justify-center"
                  title="Perfil"
                >
                  <User className="h-5 w-5 text-white" aria-hidden />
                </div>
              )}
              <LogoutButton />
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-[#181C32]" />
          ) : (
            <Menu className="h-6 w-6 text-[#181C32]" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-base font-medium text-[#181C32] hover:text-blue-600 hover:bg-slate-50 rounded transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {!isCheckingRole && isAdmin && (
              <Button
                variant="outline"
                className="w-full border-2 border-primary text-primary font-medium rounded-full flex items-center justify-center gap-2"
                asChild
              >
                <Link href="/admin/add-candidato" onClick={() => setIsOpen(false)}>
                  <Plus className="h-5 w-5" />
                  Agregar contenido
                </Link>
              </Button>
            )}

            {/* Mobile Auth */}
            <div className="border-t pt-3 mt-3">
              {!user ? (
                <Button
                  variant="outline"
                  className="w-full border-2 border-pskyblue text-pblue font-medium rounded-full hover:bg-pskyblue/30"
                  asChild
                >
                  <Link href="/auth/sign-up">Regístrate</Link>
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-4">
                    {user?.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt="Perfil"
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full ring-2 ring-white object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-pblue ring-2 ring-white flex items-center justify-center">
                        <User className="h-5 w-5 text-white" aria-hidden />
                      </div>
                    )}
                    <span className="text-sm text-slate-600">Mi perfil</span>
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