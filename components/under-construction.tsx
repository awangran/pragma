import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Hammer } from "lucide-react";

export function UnderConstruction() {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/auth-bg.svg')" }}
    >
      <div className="z-10 flex max-w-md flex-col items-center text-center text-white px-6">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 ">
          <Hammer className="h-10 w-10 text-white" aria-hidden />
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold">Página en construcción</h1>
        <p className="mt-3 text-base">Estamos trabajando para traerte esta sección.</p>
        <div className="mt-8">
           <Button size="lg" className="rounded-full bg-pdarkblue text-white hover:bg-white" asChild>
            <Link href="/">Regresa al inicio</Link>
          </Button>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0b3ca6]/20" aria-hidden />
    </main>
  );
}
