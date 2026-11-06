import type { Page } from "playwright";
import { parseSelection, type QuestionBlock } from "../src/features/lessons/question-evaluation";

type Control = { radio: string; value: string } | { label: string; fill: string } | { label: string; select: string } | { checkbox: string; checked: boolean };
/** How the player takes an answer from `answer-keys`. A new graded kind in a published lesson needs a driver here. */
function controls(block: QuestionBlock, answers: Record<string, string>): Control[] {
  switch (block.type) {
    case "multipleChoiceQuestion": case "findErrorQuestion": return [{ radio: block.id, value: answers.answer }];
    case "numericQuestion": return [{ label: "Tvoje odpověď", fill: answers.answer }];
    case "multiNumericQuestion": return block.answers.map((field) => ({ label: field.label, fill: answers[field.id] }));
    case "fadedExample": return block.blank.input === "choice" ? [{ radio: block.id, value: answers.answer }] : [{ label: "Tvoje doplnění", fill: answers.answer }];
    case "documentSearchQuestion": return block.target.type === "region" ? [{ radio: block.id, value: answers.answer }] : [{ label: "Hodnota z dokumentu", fill: answers.answer }];
    case "categorizeQuestion": return block.items.map((item) => ({ label: item.label, select: answers[item.id] }));
    case "orderQuestion": return block.items.map((_, index) => ({ label: `${index + 1}. místo`, select: answers[String(index)] }));
    case "documentTap": return block.document.rows.filter((row) => row.selectable !== false).map((row) => ({ checkbox: `Označit řádek: ${block.document.columns.map((column) => row.cells[column.id]).filter(Boolean).join(", ")}`, checked: parseSelection(answers.selected).includes(row.id) }));
    default: throw new Error(`No walkthrough driver for ${block.type} (${block.id})`);
  }
}

/** Enters `answers` into the rendered question (lesson or mixed checkpoint) without checking it. */
export async function fillAnswer(page: Page, question: QuestionBlock, answers: Record<string, string>) {
  const card = page.locator(`section[aria-labelledby^="${question.id}-"]`);
  for (const control of controls(question, answers)) {
    if ("radio" in control) await page.locator(`input[type="radio"][name="${control.radio}"][value="${control.value}"]`).check();
    else if ("fill" in control) await card.getByLabel(control.label, { exact: true }).fill(control.fill);
    // getByRole skips the hidden copy: the document renders a table from 1280 px and row cards below.
    else if ("checkbox" in control) await page.getByRole("checkbox", { name: control.checkbox, exact: true }).setChecked(control.checked);
    else await card.locator("label", { has: page.getByText(control.label, { exact: true }) }).locator("select").selectOption(control.select);
  }
}
