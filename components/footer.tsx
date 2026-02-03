"use client";

import Image from "next/image";
import Link from "next/link";
import { FaInstagram, FaLinkedinIn, FaEnvelope } from "react-icons/fa";
import { Button } from "@/components/ui/button";

const primaryLinks = [
  { href: "/", label: "Inicio" },
  { href: "/candidatos", label: "Candidatos" },
  { href: "/eventos", label: "Eventos" },
];

const secondaryLinks = [
  { href: "/semaforos", label: "Semáforos" },
  { href: "/articulos", label: "Artículos" },
  { href: "/nosotros", label: "Nosotros" },
];

const socialLinks = [
  { href: "https://instagram.com", label: "Instagram", Icon: FaInstagram },
  { href: "https://linkedin.com", label: "LinkedIn", Icon: FaLinkedinIn },
  { href: "mailto:hola@pragma.com", label: "Email", Icon: FaEnvelope },
];

const Footer = () => (
  <footer className="w-full overflow-x-hidden">
    <div className="relative w-full overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image src="/footer-ext.svg" alt="" fill priority className="object-cover" />
      </div>
      
        <section className="py-16 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">¿Tienes una encuesta o tema que compartir?</h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Pragma facilita la participación ciudadana mediante encuestas rápidas y visuales sobre temas coyunturales.
            </p>
            <Button size="lg" className="bg-white text-pdarkblue hover:bg-pskyblue/40">
              Participar en encuestas
            </Button>
          </div>
        </section>
      
      <div className="relative flex w-full flex-col gap-10 px-32 py-12 text-pdarkblue md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Image src="/pragma-logo.svg" alt="Pragma Logo" width={52} height={52} />
            <div className="flex flex-col">
              <span className="text-2xl font-semibold text-pblack">Pragma</span>
              <span className="text-base text-pblack"></span>
            </div>
          </div>
          <div className="flex gap-4 text-xl">
            {socialLinks.map(({ href, label, Icon }) => (
              <Link key={label} href={href} aria-label={label} target={href.startsWith("http") ? "_blank" : undefined}>
                <Icon />
              </Link>
            ))}
          </div>
        </div>
        <nav className="grid gap-8 text-lg font-medium md:grid-cols-2">
          <ul className="flex flex-col gap-2">
            {primaryLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
          <ul className="flex flex-col gap-2">
            {secondaryLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
    <div className="flex w-full flex-col gap-2 bg-pdarkblue px-8 py-3 text-sm text-pblue md:flex-row md:items-center md:justify-between">
      <span>@2026 Pragma</span>
      <div className="flex items-center gap-4">
        <Link href="/politica-de-privacidad">Política de Privacidad</Link>
        <Link href="/terminos">Terms</Link>
      </div>
    </div>
  </footer>
);

export default Footer;
