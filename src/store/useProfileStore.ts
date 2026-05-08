import { create } from 'zustand';
import { Profile } from '../hooks/useProfile';

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfileLocally: (profileUpdates: Partial<Profile>) => void;
}

let fetchPromise: Promise<void> | null = null;

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  loading: true,
  error: null,
  fetchProfile: async () => {
    const { profile } = get();
    if (profile) {
      set({ loading: false });
      return;
    }
    if (fetchPromise) return fetchPromise;
    
    set({ loading: true, error: null });
    fetchPromise = (async () => {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        set({ profile: data, loading: false });
      } catch (err) {
        console.error('Failed to fetch profile', err);
        set({ error: (err as Error).message, loading: false });
      } finally {
        fetchPromise = null;
      }
    })();
    return fetchPromise;
  },
  updateProfileLocally: (profileUpdates) => {
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...profileUpdates } : null,
    }));
  },
}));
