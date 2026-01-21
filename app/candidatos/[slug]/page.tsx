import CandidateCard from "../../../components/candidate-card";
import { candidates } from "../../../data/candidates";
import type { Candidate } from "../../../types/candidates";

interface CandidateProfilePageProps {
  params: Promise<{ slug: string }>;
}

export default async function CandidateProfilePage({ params }: CandidateProfilePageProps) {
  const { slug } = await params;
  const candidate = candidates.find((c) => c.slug === slug);
  

  if (!candidate) {
    return <div className="p-8 text-center">Candidato no encontrado.</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <CandidateCard
        id={candidate.id}
        name={candidate.name}
        subtitle={candidate.subtitle}
        party={candidate.party}
        profileLink={candidate.profileLink}
        avatarUrl={candidate.avatarUrl}
      />
    </div>
  );
}