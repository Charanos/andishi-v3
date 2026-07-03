import { z } from "zod";

export const createProjectMessageSchema = z.object({
  body: z.string().trim().min(1),
  attachments: z.array(z.string().trim().min(1)).optional(),
});
