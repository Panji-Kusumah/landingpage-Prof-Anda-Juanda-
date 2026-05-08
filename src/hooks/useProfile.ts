import { useEffect } from 'react';
import { useProfileStore } from '../store/useProfileStore';

export interface Profile {
  id?: number;
  name: string;
  title: string;
  bio: string;
  email: string;
  scholar_url: string;
  photo_url: string;
  logo_url?: string;
  researchgate_url?: string;
  scopus_url?: string;
  orcid_url?: string;
  research_interests?: string;
}

export function useProfile() {
  const { profile, loading, fetchProfile } = useProfileStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading };
}
