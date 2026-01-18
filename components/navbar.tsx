"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";

export function Navbar({ user }: { user?: { avatarUrl?: string } | null }) {
  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-white border-b">
      <div className="flex items-center gap-4">
        <Image src="/pragma-logo.svg" alt="Pragma Logo" width={48} height={48} />
        <span className="text-2xl font-semibold text-[#181C32]">Pragma</span>
      </div>
      <div className="flex items-center gap-10">
        <Link
          href="/"
          className="relative text-lg font-medium text-[#181C32] hover:text-blue-600 transition-colors"
        >
          Inicio
          <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-blue-400 rounded-full"></span>
        </Link>
        <Link
          href="/candidatos"
          className="text-lg font-medium text-[#181C32] hover:text-blue-600 transition-colors"
        >
          Candidatos
        </Link>
        <Link
          href="/eventos"
          className="text-lg font-medium text-[#181C32] hover:text-blue-600 transition-colors"
        >
          Eventos
        </Link>
        <Link
          href="/semaforo"
          className="text-lg font-medium text-[#181C32] hover:text-blue-600 transition-colors"
        >
          Semáforo
        </Link>
        <Link
          href="/articulos"
          className="text-lg font-medium text-[#181C32] hover:text-blue-600 transition-colors"
        >
          Artículos
        </Link>
      </div>
      <div className="flex items-center gap-6">
        {!user ? (
          <Button
            variant="outline"
            className="border-2 border-blue-400 text-blue-500 font-medium rounded-full px-8 py-2 hover:bg-blue-50"
          >
            Regístrate
          </Button>
        ) : (
          <div
            className="h-10 w-10 rounded-full bg-pblue ring-2 ring-white"
            title="Perfil"
            aria-hidden
          />
        )}
      </div>
    </nav>
  );
}