"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function SearchBar() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = inputRef.current?.value.trim();
    if (q) {
      router.push(`/buscar?q=${encodeURIComponent(q)}`);
    }
  }

  return (
    <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70" />
          <Input
            ref={inputRef}
            type="search"
            placeholder="Busca candidatos, propuestas o temas..."
            className="pl-12 h-14 text-base bg-white text-pblack border-0 shadow-xl focus-visible:ring-2 focus-visible:ring-white/50"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-14 px-8 bg-white text-pdarkblue hover:bg-pskyblue/40 shadow-xl"
        >
          Buscar
        </Button>
      </div>
    </form>
  );
}
