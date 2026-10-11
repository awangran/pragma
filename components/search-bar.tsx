"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function SearchBar() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = inputRef.current?.value.trim();
    if (!query) {
      inputRef.current?.focus();
      return;
    }
    router.push(`/buscar?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={handleSearch} role="search" aria-label="Buscar en Pragma Radar" className="mx-auto w-full max-w-2xl">
      <label htmlFor={inputId} className="sr-only">Buscar en Pragma Radar</label>
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 sm:left-4" />
          <Input
            id={inputId}
            name="q"
            ref={inputRef}
            type="search"
            enterKeyHint="search"
            placeholder="¿Qué quieres buscar?"
            className="h-14 w-full border-0 bg-white pl-10 pr-3 text-base text-pblack shadow-none placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-[#5574ff] sm:pl-12"
          />
        </div>
        <Button type="submit" size="lg" className="h-14 shrink-0 rounded-xl bg-pdarkblue px-4 text-white shadow-none transition hover:bg-[#243d9b] focus-visible:ring-2 focus-visible:ring-[#5574ff] focus-visible:ring-offset-2 sm:px-6">
          Buscar
        </Button>
      </div>
    </form>
  );
}
