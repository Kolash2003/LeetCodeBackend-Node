import z from "zod";

export const ProblemSubmissionSchema = z.object({
    problemId: z.string().min(1, "Problem ID is required"),
    code: z.string().min(1, "Code is required"),
    language: z.enum(["cpp", "python"]),
});