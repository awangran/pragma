import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat px-6"
      style={{ backgroundImage: "url('/landing-bg.svg')" }}
    >
      <div
        className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-[#7cc6ff]/10"
        aria-hidden
      />
      <section className="relative z-10 flex w-full max-w-lg flex-col items-center gap-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/pragma-logo.svg"
            alt="Pragma"
            width={160}
            height={120}
            priority
          />
          <h1 className="text-5xl font-bold tracking-tight text-pdarkblue">
            Pragma
          </h1>
        </div>

        <p className="text-lg font-medium text-pdarkblue/90">
          Por jóvenes más interesados en su país
        </p>

        <div className="flex w-full flex-col gap-4 max-w-sm">
          <Link
            href="/dashboard"
            className="group inline-flex items-center justify-center gap-2 rounded-full border-2 border-pblue bg-transparent px-6 py-3 text-base font-semibold text-pblue shadow-[0_10px_30px_rgba(47,113,240,0.28)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(47,113,240,0.32)]"
          >
            Continua como invitado
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>

          <Link
            href="/auth/sign-up"
            className="group inline-flex items-center justify-center gap-2 rounded-full border-2 border-white bg-transparent px-6 py-3 text-base font-semibold text-white shadow-[0_10px_30px_rgba(47,113,240,0.28)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(47,113,240,0.32)]"
          >
            Regístrate
            
          </Link>

          
        </div>
      </section>
    </main>
  );
}


