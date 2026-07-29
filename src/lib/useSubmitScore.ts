"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/client";
import { useToast } from "@/components/Toast";
import { useUser } from "@/components/UserContext";

export type ScorePayload = {
  score: number;
  lines?: number;
  combo?: number;
  mode: string;
};

export function useSubmitScore() {
  const { push } = useToast();
  const { refresh } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const submit = useCallback(
    async (payload: ScorePayload) => {
      setSubmitting(true);
      try {
        const res = await api<{ gainedXp: number; gainedCoins: number; newHighScore: boolean }>(
          "/api/scores",
          {
            method: "POST",
            body: JSON.stringify({
              score: Math.max(0, Math.round(payload.score)),
              lines: payload.lines ?? 0,
              combo: payload.combo ?? 0,
              mode: payload.mode,
            }),
          }
        );
        push(
          `+${res.gainedXp} XP · +${res.gainedCoins} 🪙${
            res.newHighScore ? " · New High Score! 🎉" : ""
          }`,
          "success"
        );
        setSaved(true);
        refresh();
        return res;
      } catch {
        push("Could not save score", "error");
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [push, refresh]
  );

  const reset = useCallback(() => setSaved(false), []);

  return { submit, submitting, saved, reset };
}
