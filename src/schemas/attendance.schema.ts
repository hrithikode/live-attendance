import { z } from "zod";

export const startAttendanceSchema = z.object({
  classId: z.string()
});
