import { z } from "zod";

export const stepTopicsSchema = z.object({
  topics: z.array(z.string()).min(1, "Select at least one topic"),
});

export const stepCreateSpaceSchema = z.object({
  communityName: z.string().min(1, "Please select a community"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(275, "Description must be 275 characters or less"),
});

export const stepDueDateSchema = z
  .object({
    startDate: z
      .string()
      .or(z.date())
      .refine((val) => val, "Start date is required"),
    endDate: z
      .string()
      .or(z.date())
      .refine((val) => val, "End date is required"),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    { message: "End date must be after start date", path: ["endDate"] },
  );

export const stepInviteUsersSchema = z.object({
  inviteEmails: z.array(z.string().email()).optional(),
});

export const stepAssignMentorSchema = z.object({
  mentorEmails: z.array(z.string().email()).optional(),
});
