/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import { evaluateQuestion, type GradableQuestion } from "@investnik/contracts";

const explained = { correctExplanation: "Správně.", incorrectExplanation: "Zkus to znovu." };

test("a multiple-choice answer is graded with the web's evaluator", () => {
  const block: GradableQuestion = { type: "multipleChoiceQuestion", options: [{ id: "a" }, { id: "b" }], correctOptionId: "b", ...explained };
  assert.equal(evaluateQuestion(block, { answer: "b" }), true);
  assert.equal(evaluateQuestion(block, { answer: "a" }), false);
  assert.equal(evaluateQuestion(block, { answer: "z" }), undefined);
});

test("a numeric answer accepts a Czech decimal comma", () => {
  const block: GradableQuestion = { type: "numericQuestion", answer: 0.025, tolerance: 0.0005, ...explained };
  assert.equal(evaluateQuestion(block, { answer: "0,025" }), true);
  assert.equal(evaluateQuestion(block, { answer: "0,03" }), false);
  assert.equal(evaluateQuestion(block, { answer: "" }), undefined);
});
