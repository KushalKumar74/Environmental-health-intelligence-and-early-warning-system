import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface Profile {
  _id: string;
  name: string;
  age?: number | null;
  asthma?: boolean;
  allergies?: boolean;
  diabetes?: boolean;
  heartDisease?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ProfilesContextValue {
  profiles: Profile[];
  loading: boolean;
  addProfile: (p: Omit<Profile, "_id" | "createdAt" | "updatedAt">) => Promise<Profile>;
  updateProfile: (id: string, patch: Partial<Profile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  refetchProfiles: () => Promise<void>;
}

const ProfilesContext = createContext<ProfilesContextValue | null>(null);

export function ProfilesProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const headers = useMemo(
    () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` }),
    [token]
  );

  const fetchProfiles = useCallback(async () => {
    if (!token || !user) {
      setProfiles([]);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/profiles", { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setProfiles(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch profiles", e);
    } finally {
      setLoading(false);
    }
  }, [token, user, headers]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const addProfile: ProfilesContextValue["addProfile"] = useCallback(
    async (p) => {
      const res = await fetch("/api/profiles", { method: "POST", headers, body: JSON.stringify(p) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create profile");
      if (data.success) {
        setProfiles((prev) => [...prev, data.data].sort((a, b) => a.name.localeCompare(b.name)));
        return data.data;
      }
      throw new Error("Failed to create profile");
    },
    [headers]
  );

  const updateProfile: ProfilesContextValue["updateProfile"] = useCallback(
    async (id, patch) => {
      const res = await fetch(`/api/profiles/${id}`, { method: "PUT", headers, body: JSON.stringify(patch) });
      const data = await res.json();
      if (data.success) {
        setProfiles((prev) =>
          prev
            .map((p) => (p._id === id ? data.data : p))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      }
    },
    [headers]
  );

  const deleteProfile: ProfilesContextValue["deleteProfile"] = useCallback(
    async (id) => {
      await fetch(`/api/profiles/${id}`, { method: "DELETE", headers });
      setProfiles((prev) => prev.filter((p) => p._id !== id));
    },
    [headers]
  );

  const value = useMemo(
    () => ({ profiles, loading, addProfile, updateProfile, deleteProfile, refetchProfiles: fetchProfiles }),
    [profiles, loading, addProfile, updateProfile, deleteProfile, fetchProfiles]
  );

  return <ProfilesContext.Provider value={value}>{children}</ProfilesContext.Provider>;
}

export function useProfiles() {
  const ctx = useContext(ProfilesContext);
  if (!ctx) throw new Error("useProfiles must be used inside ProfilesProvider");
  return ctx;
}
