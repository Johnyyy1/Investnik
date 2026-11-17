import type { GradableQuestion } from "@investnik/contracts";
import type { LessonBlock } from "./types";

// Moved to packages/contracts so the app grades with the same code.
export { evaluateQuestion, feedbackFor, isQuestion, parseNumericAnswer, parseSelection, serializeSelection } from "@investnik/contracts";
export type QuestionBlock = Extract<LessonBlock, { type: GradableQuestion["type"] }>;
