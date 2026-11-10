import { diagnosticQuestions, FOUNDATIONS_DIAGNOSTIC_V1, type DiagnosticSubmission } from "./diagnostic";
import { DIAGNOSTIC_V2, diagnosticV2Probes, nextDiagnosticV2Question } from "./diagnostic-v2";

export function diagnosticWithCorrectCount(count: number): DiagnosticSubmission {
  return { version: FOUNDATIONS_DIAGNOSTIC_V1, answers: Object.fromEntries(diagnosticQuestions.map((question, index) => [question.id, index < count ? question.correctAnswer : question.options.find((option) => option.id !== question.correctAnswer)!.id])) as DiagnosticSubmission["answers"] };
}

/** Walks the adaptive V2 test, answering correctly for lessons the learner `knows` and wrongly otherwise. */
export function diagnosticV2Submission(knows: (lessonId: string) => boolean = () => true) {
  const answers: { itemId: string; optionId: string }[] = [];
  for (let next = nextDiagnosticV2Question(answers).question; next; next = nextDiagnosticV2Question(answers).question) {
    const id = next.id;
    const probe = diagnosticV2Probes.find((entry) => entry.items.some((item) => item.id === id))!;
    const item = probe.items.find((entry) => entry.id === id)!;
    answers.push({ itemId: id, optionId: knows(probe.lessonId) ? item.correctAnswer : item.options.find((option) => option.id !== item.correctAnswer)!.id });
  }
  return { version: DIAGNOSTIC_V2, answers };
}
