"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { logUnexpectedError } from "@/lib/server-errors";
import { nextDiagnosticV2Question } from "./diagnostic-v2";
import { completePersonalization, EntryTestUnavailableError, retakeDiagnostic, saveDiagnosticV2, skipPersonalization, updatePersonalizedPreferences } from "./repository";

async function save(name: string, input: unknown, operation: (userId: string, input: unknown) => Promise<void>) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false as const, message: "Přihlas se znovu a ulož své předvolby.", signIn: true };
    await operation(user.id, input);
    revalidatePath("/", "layout");
    return { ok: true as const };
  } catch (error) {
    if (error instanceof EntryTestUnavailableError) return { ok: false as const, message: error.message };
    // Answers that fail validation are the learner's to fix; anything else is a failure.
    if (!(error instanceof z.ZodError)) logUnexpectedError("personalization", name, error);
    return { ok: false as const, message: "Přizpůsobení se nepodařilo uložit. Zkontroluj odpovědi a zkus to znovu." };
  }
}
export async function completePersonalizationAction(input: unknown) { return save("complete personalization", input, completePersonalization); }
export async function updatePersonalizedPreferencesAction(input: unknown) { return save("update preferences", input, updatePersonalizedPreferences); }
export async function retakeDiagnosticAction(input: unknown) { return save("retake diagnostic", input, retakeDiagnostic); }
export async function skipPersonalizationAction(input: unknown) { return save("skip personalization", input, skipPersonalization); }
export async function submitEntryTestAction(input: unknown) { return save("save entry test", input, saveDiagnosticV2); }
/** Pure replay of the answers so far: returns the next public question, never the answer key or a score. */
export async function nextEntryTestQuestionAction(answers: unknown) {
  try {
    if (!await getCurrentUser()) return { ok: false as const, message: "Přihlas se znovu a pokračuj v testu." };
    return { ok: true as const, ...nextDiagnosticV2Question(answers) };
  } catch (error) {
    if (!(error instanceof z.ZodError)) logUnexpectedError("personalization", "next entry test question", error);
    return { ok: false as const, message: "Další otázku se nepodařilo načíst. Zkus to znovu." };
  }
}
