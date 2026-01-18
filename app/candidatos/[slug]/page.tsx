import CandidateCard from "../../../components/candidate-card";
import { candidates } from "../../../data/candidates";
import type { Candidate } from "../../../types/candidates";

interface CandidateProfilePageProps {
  params: { slug: string };
}

export default function CandidateProfilePage({ params }: CandidateProfilePageProps) {
  const { slug } = params;
  const candidate = candidates.find(
    (c) => c.profileLink.split("/").pop() === slug
  );

  if (!candidate) {
    return <div className="p-8 text-center">Candidato no encontrado.</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <CandidateCard
        id={candidate.id}
        name={candidate.name}
        party={candidate.party}
        profileLink={candidate.profileLink}
      />
    </div>
  );
}