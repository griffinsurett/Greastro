// src/content/iconSchema.ts
import { z } from "astro:content";

// Icon schema that can handle multiple icon types
export const iconSchema = ({ image }: { image: Function }) => z.union([
  // String reference (for icon libraries like "lucide:phone" or emoji "📞")
  z.string(),
  
  // Image using Zod's image handler
  image(),
  
  // Object with explicit type for more complex cases
  z.object({
    type: z.literal('astro-icon'),
    name: z.string(), // e.g., "lucide:phone"
  }),
  
  z.object({
    type: z.literal('svg'),
    content: z.string(), // Raw SVG string
  }),
  
  z.object({
    type: z.literal('emoji'),
    content: z.string(), // e.g., "📞"
  }),
  
  z.object({
    type: z.literal('text'),
    content: z.string(), // Fallback text
  }),
]);

export type IconType = z.infer<ReturnType<typeof iconSchema>>;