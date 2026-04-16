import { z } from "zod";
export const formSchema = z.object({
	botname: z.string().min(2, "Bot Name must be at least 2 characters"),
	botAvatarUrl: z.string().min(1, "Bot Avatar Image is required"),
	primaryColor: z.string(),
});
