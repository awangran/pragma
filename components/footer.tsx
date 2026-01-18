"use client";

import Image from "next/image";
import Link from "next/link";
import { FaInstagram, FaLinkedinIn, FaEnvelope } from "react-icons/fa";

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
  <footer className="mt-16">
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image src="/footer-bg.svg" alt="" fill priority className="object-cover" />
      </div>
      <div className="relative flex flex-col gap-10 px-32 py-12 text-pdarkblue md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Image src="/pragma-logo.svg" alt="Pragma Logo" width={52} height={52} />
            <div className="flex flex-col">
              <span className="text-2xl font-semibold text-pblack">Pragma</span>
              <span className="text-base text-pblack">Pragma catchline aqui</span>
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
    <div className="flex flex-col gap-2 bg-pdarkblue px-8 py-3 text-sm text-pblue md:flex-row md:items-center md:justify-between">
      <span>@2026 Pragma</span>
      <div className="flex items-center gap-4">
        <Link href="/politica-de-privacidad">Política de Privacidad</Link>
        <Link href="/terminos">Terms</Link>
      </div>
    </div>
  </footer>
);

export default Footer;
