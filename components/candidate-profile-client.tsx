"use client";

import { useRef, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { MdBookmark, MdBookmarkBorder } from "react-icons/md";
import { createClient } from "@/lib/supabase/client";

interface CandidateProfileClientProps {
  candidateId: string;
  initialLikes: number;
  candidateName: string;
}

export default function CandidateProfileClient({
  candidateId,
  initialLikes,
  candidateName,
}: CandidateProfileClientProps) {
  const [likes, setLikes] = useState(
    Number.isFinite(initialLikes) ? Math.max(0, initialLikes) : 0
  );
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestInProgress = useRef(false);

  async function handleLike() {
    if (requestInProgress.current) return;

    requestInProgress.current = true;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const nextLikes = Math.max(0, likes + (isLiked ? -1 : 1));

      const { data, error } = await supabase
        .from("candidatos")
        .update({ likes: nextLikes })
        .eq("id", candidateId)
        .select("id, likes")
        .single();

      if (error || !data) {
        setErrorMessage("No pudimos registrar tu reacción. Intenta de nuevo.");
        return;
      }

      setLikes(data.likes ?? nextLikes);
      setIsLiked((previous) => !previous);
    } catch {
      setErrorMessage("No pudimos conectar. Intenta de nuevo.");
    } finally {
      requestInProgress.current = false;
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <button
          type="button"
          onClick={handleLike}
          disabled={isLoading}
          aria-pressed={isLiked}
          aria-label={
            isLiked
              ? `Quitar me gusta de ${candidateName}`
              : `Dar me gusta a ${candidateName}`
          }
          className={`inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff] disabled:cursor-wait disabled:opacity-50 ${
            isLiked
              ? "text-[#7863bd] hover:text-[#5574ff]"
              : "text-[#5574ff] hover:text-[#7863bd]"
          }`}
        >
          {isLiked ? (
            <FaHeart aria-hidden="true" className="h-4 w-4" />
          ) : (
            <FaRegHeart aria-hidden="true" className="h-4 w-4" />
          )}

          <span className="tabular-nums">
            {likes.toLocaleString("es-CO")}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsSaved((previous) => !previous)}
          aria-pressed={isSaved}
          aria-label={
            isSaved
              ? `Quitar ${candidateName} de la selección temporal`
              : `Guardar ${candidateName} en la selección temporal`
          }
          title="Esta selección se conserva mientras permanezcas en esta página."
          className={`inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm font-normal transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff] ${
            isSaved
              ? "text-[#7863bd] hover:text-[#5574ff]"
              : "text-slate-500 hover:text-[#7863bd]"
          }`}
        >
          {isSaved ? (
            <MdBookmark aria-hidden="true" className="h-5 w-5" />
          ) : (
            <MdBookmarkBorder aria-hidden="true" className="h-5 w-5" />
          )}

          <span>{isSaved ? "Guardado temporalmente" : "Guardar candidato"}</span>
        </button>
      </div>

      {errorMessage && (
        <p role="alert" className="max-w-xs text-xs leading-5 text-red-700">
          {errorMessage}
        </p>
      )}
    </div>
  );
}