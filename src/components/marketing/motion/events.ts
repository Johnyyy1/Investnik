/** DOM events the motion layer uses to drive the illustrative previews' React state (no GSAP import, safe anywhere). */
export const LESSON_DEMO_EVENT = "investi:lesson-demo";
export type LessonDemoDetail = { answer: "A" | "B" | null; revealed: boolean; hold?: boolean;
  /** Set when dispatched from a React lifecycle (cannot flushSync there); state then applies on the next render. */
  defer?: boolean };


/** Scroll-driven Portfolio Lab demo. The motion layer pins the demo on tall desktops and maps scroll to a step. */
export const PORTFOLIO_STEP_EVENT = "investi:portfolio-step";
export type PortfolioStep = 1 | 2 | 3;
/** `driven` switches the demo into scroll-driven mode (or back); `step` is the step the scroll position shows. */
export type PortfolioStepDetail = { driven?: boolean; step?: PortfolioStep };
/** Sent by the demo while scroll-driven: a tab or button asks the motion layer to scroll to that step. */
export const PORTFOLIO_STEP_REQUEST_EVENT = "investi:portfolio-step-request";
export type PortfolioStepRequestDetail = { step: PortfolioStep };
