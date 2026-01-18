import CandidateCard from "../../components/candidate-card";
import { candidates } from "../../data/candidates";

export default function CandidatesPage() {
  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold mb-6">Candidatos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate) => (
          <CandidateCard key={candidate.id}
                id={candidate.id}
                name={candidate.name}
                party={candidate.party}
                profileLink={candidate.profileLink} />
        ))}
      </div>
    </div>
  );
}