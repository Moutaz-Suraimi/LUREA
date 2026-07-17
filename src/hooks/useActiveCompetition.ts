import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Competition = {
  id: string;
  title: string;
  description: string | null;
  prize_image_url: string | null;
  total_numbers: number;
  ends_at: string | null;
  status: "draft" | "open" | "closed" | "announced";
  winner_participant_id: string | null;
};

export type Participant = {
  id: string;
  competition_id: string;
  name: string;
  phone: string;
  number: number;
  created_at: string;
};

async function fetchActive(): Promise<Competition | null> {
  const { data } = await supabase
    .from("competitions")
    .select("*")
    .in("status", ["open", "closed", "announced"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as Competition) ?? null;
}

export function useActiveCompetition() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["active-competition"],
    queryFn: fetchActive,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const ch = supabase
      .channel("competitions-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "competitions" }, () => {
        qc.invalidateQueries({ queryKey: ["active-competition"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  return query;
}

export function useParticipants(competitionId?: string) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["participants", competitionId],
    enabled: !!competitionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("participants")
        .select("*")
        .eq("competition_id", competitionId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Participant[];
    },
  });

  useEffect(() => {
    if (!competitionId) return;
    const ch = supabase
      .channel(`participants-${competitionId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "participants", filter: `competition_id=eq.${competitionId}` },
        () => qc.invalidateQueries({ queryKey: ["participants", competitionId] }),
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [competitionId, qc]);

  return query;
}
