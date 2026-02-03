"use client";

import { useState } from "react";
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
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      if (!isLiked) {
        // Agregar like
        const { error } = await supabase
          .from("candidates")
          .update({ likes: likes + 1 })
          .eq("id", candidateId);

        if (error) {
          console.error("Error al agregar like:", error);
          return;
        }

        setLikes(likes + 1);
        setIsLiked(true);
      } else {
        // Remover like
        const { error } = await supabase
          .from("candidates")
          .update({ likes: Math.max(0, likes - 1) })
          .eq("id", candidateId);

        if (error) {
          console.error("Error al remover like:", error);
          return;
        }

        setLikes(Math.max(0, likes - 1));
        setIsLiked(false);
      }
    } catch (error) {
      console.error("Error en handleLike:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    // Aquí puedes agregar lógica para guardar a una lista personal
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Me gusta button */}
      <button
        onClick={handleLike}
        disabled={isLoading}
        className={`inline-flex items-center gap-2 bg-transparent px-2 py-1 font-medium transition-colors duration-200 ${
          isLiked
            ? "text-[#5D6DFF] hover:text-[#BCB6FE]"
            : "text-[#4E8FF5] hover:text-[#5D6DFF]"
        } disabled:opacity-50`}
      >
        {isLiked ? (
          <FaHeart className="text-lg" />
        ) : (
          <FaRegHeart className="text-lg" />
        )}
        <span className="font-semibold">{likes}</span>
      </button>

      {/* Guardar button */}
      <button
        onClick={handleSave}
        className={`inline-flex items-center gap-2 bg-transparent px-2 py-1 font-medium transition-colors duration-200 ${
          isSaved
            ? "text-[#5D6DFF] hover:text-[#BCB6FE]"
            : "text-[#888D91] hover:text-[#4E8FF5]"
        }`}
      >
        {isSaved ? (
          <MdBookmark className="text-lg" />
        ) : (
          <MdBookmarkBorder className="text-2xl" />
        )}
        <span className="text-md">Guardar candidato</span>
      </button>
    </div>
  );
}
