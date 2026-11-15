import { describe, expectTypeOf, it } from "vitest";
import type { GradableQuestion } from "@investnik/contracts";
import type { QuestionBlock } from "./question-evaluation";
import type { LessonBlock } from "./types";

type Authored<T> = Extract<LessonBlock, { type: T }>;
type Graded<T> = Extract<GradableQuestion, { type: T }>;
/** Question types whose authored block no longer fits the shape the shared evaluators read. */
type Drift = { [T in GradableQuestion["type"]]: [Authored<T>] extends [never] ? T : [Authored<T>] extends [Graded<T>] ? never : T }[GradableQuestion["type"]];

describe("authored questions and shared grading", () => {
  // Checked by `npm run typecheck`; a renamed or retyped field fails there instead of grading silently wrong.
  it("every gradable type is authored and assignable to its structural type", () => {
    expectTypeOf<Drift>().toBeNever();
    expectTypeOf<QuestionBlock["type"]>().toEqualTypeOf<GradableQuestion["type"]>();
  });
});
