export type Candidate = {
  id: number;
  name: string;
  party: string;
  profileLink: string;
  slug: string;
  subtitle?: string;
  avatarUrl?: string;
  retirado?: boolean;
  like?: number;
  saved?: number;
  bio?: string;
  twitter?: string;
  propuestas?: Array<{ id: string; title: string; topic?: string; summary?: string }>;
  links?: string[];
}