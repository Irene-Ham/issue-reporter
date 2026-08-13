import { z } from "zod";

export const CATEGORIES = ["road", "electricity", "sanitation", "water", "safety", "other"];
export const STATUSES = ["reported", "in_progress", "resolved"];

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
  role: z.enum(["resident", "staff"]).default("resident"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const issueCreateSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000),
  category: z.enum(CATEGORIES),
  location: z.string().trim().min(3, "Location must be at least 3 characters").max(200),
  photo_url: z
    .union([z.string().trim().url("Photo URL must be a valid URL"), z.literal("")])
    .optional()
    .transform((v) => (v ? v : null)),
});

export const statusUpdateSchema = z.object({
  new_status: z.enum(STATUSES),
  note: z.string().trim().max(1000).optional().transform((v) => (v ? v : null)),
});

export function validate(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) {
    const first = result.error.issues[0];
    return { success: false, error: first?.message || "Invalid input" };
  }
  return { success: true, data: result.data };
}
