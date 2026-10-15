import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { RiskLevel } from "@/lib/prediction";
import { useAuth } from "@/contexts/AuthContext";

export interface HealthRecord {
  _id: string;
  name?: string | null;
  age: number;
  asthma: boolean;
  allergies?: boolean;
  diabetes?: boolean;
  heartDisease?: boolean;
  maskType?: string;
  exerciseIntensity?: string;
  hoursOutside: number;
  aqi: number;
  predictedRisk: RiskLevel;
  score: number;
  reasons: string[];
  location?: string;
  createdAt: string;
}

interface RecordsContextValue {
  records: HealthRecord[];
  add: (r: Omit<HealthRecord, "_id" | "createdAt" | "score" | "reasons" | "predictedRisk">) => Promise<void>;
  update: (id: string, patch: Partial<HealthRecord>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
  loading: boolean;
}

const RecordsContext = createContext<RecordsContextValue | null>(null);

export function RecordsProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  /** Auth headers for every request */
  const headers = useMemo(
    () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` }),
    [token]
  );

  const fetchRecords = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch("/api/records", { headers });
      if (res.status === 401) return; // handled by AuthGuard
      const data = await res.json();
      if (data.success) setRecords(data.data);
    } catch (e) {
      console.error("Failed to fetch records", e);
    } finally {
      setLoading(false);
    }
  }, [token, headers]);

  // Reload records whenever the token changes (user logs in/out)
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const add: RecordsContextValue["add"] = useCallback(
    async (r) => {
      const res = await fetch("/api/records", { method: "POST", headers, body: JSON.stringify(r) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      if (data.success) setRecords((prev) => [data.data, ...prev]);
    },
    [headers]
  );

  const update: RecordsContextValue["update"] = useCallback(
    async (id, patch) => {
      const res = await fetch(`/api/records/${id}`, { method: "PUT", headers, body: JSON.stringify(patch) });
      const data = await res.json();
      if (data.success) setRecords((prev) => prev.map((r) => (r._id === id ? data.data : r)));
    },
    [headers]
  );

  const remove: RecordsContextValue["remove"] = useCallback(
    async (id) => {
      await fetch(`/api/records/${id}`, { method: "DELETE", headers });
      setRecords((prev) => prev.filter((r) => r._id !== id));
    },
    [headers]
  );

  const clear: RecordsContextValue["clear"] = useCallback(async () => {
    // Delete all records for this user one by one
    await Promise.all(records.map((r) => fetch(`/api/records/${r._id}`, { method: "DELETE", headers })));
    setRecords([]);
  }, [records, headers]);

  const value = useMemo(
    () => ({ records, add, update, remove, clear, loading }),
    [records, add, update, remove, clear, loading]
  );

  return <RecordsContext.Provider value={value}>{children}</RecordsContext.Provider>;
}

export function useRecords() {
  const ctx = useContext(RecordsContext);
  if (!ctx) throw new Error("useRecords must be used inside RecordsProvider");
  return ctx;
}
