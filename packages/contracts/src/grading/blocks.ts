/**
 * Structural types for the gradable lesson blocks: only the fields that evaluateQuestion and feedbackFor read.
 * The web's LessonBlock variants must stay assignable to these (src/features/lessons/gradable-blocks.test.ts).
 */
type Explained = { correctExplanation: string; incorrectExplanation: string };
type Id = { id: string };
export type GradableOption = { id: string; explanation?: string; misconception?: string };

export type GradableExercise = Explained & Id & (
  | { type: "categorizeQuestion"; categories: readonly Id[]; items: readonly (Id & { categoryId: string })[] }
  | { type: "orderQuestion"; items: readonly Id[]; correctOrder: readonly string[] }
  | { type: "documentSearchQuestion"; document: { regions: readonly Id[] }; target: { type: "region"; regionId: string } | { type: "numeric"; answer: number; tolerance: number } }
  | { type: "findErrorQuestion"; steps: readonly Id[]; incorrectStepId: string }
);

export type GradableQuestion = GradableExercise | (Explained & (
  | { type: "multipleChoiceQuestion"; options: readonly GradableOption[]; correctOptionId: string }
  | { type: "numericQuestion"; answer: number; tolerance: number }
  | { type: "multiNumericQuestion"; answers: readonly (Id & { answer: number; tolerance: number })[] }
  | { type: "fadedExample"; misconception?: string; blank: { input: "choice"; options: readonly GradableOption[]; correctOptionId: string } | { input: "number"; answer: number; tolerance: number } }
  | { type: "documentTap"; document: { rows: readonly (Id & { selectable?: boolean })[] }; correctRowIds: readonly string[] }
  | { type: "findError"; rows: readonly Id[]; errorRowId: string; fixes: readonly GradableOption[]; correctFixId: string }
));
