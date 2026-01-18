"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface CandidateCardProps {
  id: number;
  name: string;
  party: string;
  profileLink: string;
  subtitle?: string;
  avatarUrl?: string;
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

const isValidImageUrl = (url: string) => {
  const sanitized = url.split("?")[0].trim().toLowerCase();
  return !!sanitized && /\.(png|jpe?g|gif|bmp|webp|avif|svg)$/.test(sanitized);
};

const CandidateCard: React.FC<CandidateCardProps> = ({ name, party, profileLink, subtitle, avatarUrl }) => {
  const theme = getPartyTheme(party);
  const [imageError, setImageError] = useState(false);

  useEffect(() => setImageError(false), [avatarUrl]);

  const hasValidAvatar = !!(avatarUrl && isValidImageUrl(avatarUrl));
  const showAvatar = hasValidAvatar && !imageError;

  const badgeClasses = `inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${theme.badgeBg} ${theme.badgeBorder} ${theme.badgeText}`;
  const errorCircleClasses = `h-12 w-12 shrink-0 rounded-full ${theme.circle}`;
  const placeholderCircleClasses = "h-12 w-12 shrink-0 rounded-full bg-gray-200";

  return (
    <Link
      href={profileLink}
      className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:shadow-md"
    >
      {showAvatar ? (
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-slate-200">
          <Image
            src={avatarUrl as string}
            alt={`${name} profile photo`}
            width={48}
            height={48}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      ) : hasValidAvatar ? (
        <div className={errorCircleClasses} aria-hidden />
      ) : (
        <div className={placeholderCircleClasses} aria-hidden />
      )}
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-pblack">{name}</span>
          {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
        </div>
        <span className={badgeClasses}>{party}</span>
      </div>
    </Link>
  );
};

export default CandidateCard;
