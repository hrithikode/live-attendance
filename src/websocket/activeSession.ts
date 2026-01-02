export interface ActiveSession {
  classId: string;
  startedAt: string;
  attendance: Record<string, "present" | "absent">;
}

export let activeSession: ActiveSession | null = null;
