import type { FieldValues } from "react-hook-form";
import type { z } from "zod";

type AnyZodObject = z.ZodTypeAny;

function issueCode(issue: unknown) {
  if (!issue || typeof issue !== "object") return "validation";
  const val = (issue as any).code;
  return typeof val === "string" ? val : "validation";
}

function issuePath(issue: unknown): string {
  if (!issue || typeof issue !== "object") return "root";
  const p = (issue as any).path;
  if (Array.isArray(p) && p.length) return String(p[0]);
  return "root";
}

function issueMessage(issue: unknown): string {
  if (!issue || typeof issue !== "object") return "Invalid value";
  const m = (issue as any).message;
  return typeof m === "string" ? m : "Invalid value";
}


export function safeZodResolver<T extends FieldValues>(schema: AnyZodObject) {
  return async (values: T) => {
    const parsed = schema.safeParse(values);
    if (parsed.success) {
      return { values: parsed.data as T, errors: {} as Record<string, never> };
    }

    const errors: Record<string, any> = {};
    for (const issue of parsed.error.issues) {
      const key = issuePath(issue);
      if (!errors[key]) {
        errors[key] = {
          type: issueCode(issue),
          message: issueMessage(issue),
        };
      }
    }
    return { values: {} as T, errors: errors as any };
  };
}
