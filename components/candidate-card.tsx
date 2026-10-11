"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

interface CandidateCardProps {
  id: number;
  nombre: string;
  cargo: string;
  partido: string;
  ubicacion?: string;
  avatar?: string;
}

const DEFAULT_THEME = {
  badgeBg: "bg-blue-50",
  badgeBorder: "border-blue-200",
  badgeText: "text-blue-600",
  circle: "bg-blue-200",
};

const PARTY_THEME: Record<string, typeof DEFAULT_THEME> = {
  "Partido Liberal": {
    badgeBg: "bg-red-50",
    badgeBorder: "border-red-200",
    badgeText: "text-red-600",
    circle: "bg-red-200",
  },
  "Partido Conservador": {
    badgeBg: "bg-blue-50",
    badgeBorder: "border-blue-200",
    badgeText: "text-blue-600",
    circle: "bg-blue-200",
  },
  "Partido Verde": {
    badgeBg: "bg-emerald-50",
    badgeBorder: "border-emerald-200",
    badgeText: "text-emerald-600",
    circle: "bg-emerald-200",
  },
  "Partido Independiente": {
    badgeBg: "bg-violet-50",
    badgeBorder: "border-violet-200",
    badgeText: "text-violet-600",
    circle: "bg-violet-200",
  },
};

const getPartyTheme = (party: string) => PARTY_THEME[party] ?? DEFAULT_THEME;



const CandidateCard: React.FC<CandidateCardProps> = ({ id, nombre, cargo, partido, avatar, ubicacion }) => {
  const theme = getPartyTheme(partido);
  const [imageError, setImageError] = useState(false);

  const slug = `/candidatos/${id}`;

  useEffect(() => setImageError(false), [avatar]);

  const showAvatar = !!avatar && !imageError;

  const badgeClasses = `inline-flex items-center justify-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${theme.badgeBg} ${theme.badgeBorder} ${theme.badgeText}`;
  const placeholderCircleClasses = "h-12 w-12 shrink-0 rounded-full bg-gray-200";

  return (
    <Link
      href={slug}
      className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 shadow-sm transition hover:shadow-md"
    >
      {showAvatar ? (
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-slate-200">
          <Image
            src={avatar as string}
            alt={`${nombre} profile photo`}
            width={48}
            height={48}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <div className={placeholderCircleClasses} aria-hidden />
      )}

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex flex-col">
          <span className="text-md font-semibold text-slate-900">{nombre}</span>
          {cargo && <span className="text-sm text-slate-500">{cargo}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className={badgeClasses}>{partido}</span>
          {ubicacion && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-600">
              <MapPin className="h-3.5 w-3.5 text-slate-500" aria-hidden />
              {ubicacion}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CandidateCard;
