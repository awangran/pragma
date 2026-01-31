import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/auth-bg.svg')" }}
    >
      <div className="z-10 flex max-w-md flex-col items-center text-center text-white px-6">
        <div className="mb-6 flex h-40 w-40 items-center justify-center rounded-full">
          <AlertCircle className="h-10 w-10 text-white" aria-hidden />
        </div>
        <h1 className="text-5xl font-bold">404</h1>
        <p className="mt-4 text-base">
          La página a la que intentaste ingresar no existe
        </p>
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
