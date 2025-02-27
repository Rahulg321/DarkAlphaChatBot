// 2. Define single-item schemas

import { z } from "zod";

// -- Single team-member shape:
export const singleTeamMemberSchema = z.object({
  type: z.literal("team"),
  firstName: z.string(),
  lastName: z.string(),
  designation: z.string().optional(),
  linkedInUrl: z.string().optional(),
  detailPageUrl: z.string().optional(),
});

export const multipleTeamMemberSchema = z.array(singleTeamMemberSchema);

// -- Single listing shape:
export const singleListingSchema = z.object({
  type: z.literal("listing"),
  title: z.string(),
  description: z.string(),
  state: z.string(),
  category: z.string(),
  revenue: z.string(),
  listingCode: z.string(),
  underContract: z.string(),
  askingPrice: z.string(),
  minimumEbitda: z.string(),
  maximumEbitda: z.string(),
  ebitda: z.string(),
  price: z.string(),
});

export const multipleListingSchema = z.array(singleListingSchema);

// 3. Create a union for a single item
export const singleItemUnionSchema = z.union([
  singleTeamMemberSchema,
  singleListingSchema,
]);

// 4. Expect an array of those items (all team objects or all listing objects):
export const DataUnionSchema = z.array(singleItemUnionSchema);
