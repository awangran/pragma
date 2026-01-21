export interface Candidate {
  id: number;
  name: string;
  party: string;
  profileLink: string;
  slug: string;
  subtitle?: string;
  avatarUrl?: string;
  retirado?: boolean;
}