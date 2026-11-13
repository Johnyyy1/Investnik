import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const widths = {
  reading: "max-w-reading",
  focused: "max-w-focused",
  standard: "max-w-standard",
  wide: "max-w-wide",
  data: "max-w-data",
} as const;

export type PageFrameWidth = keyof typeof widths;

/** Consistent authenticated-page gutters and vertical rhythm, with intentional content widths. */
export function PageFrame({ width = "standard", className, ...props }: ComponentProps<"main"> & { width?: PageFrameWidth }) {
  return <main {...props} className={cn("mx-auto w-full min-w-0 px-4 py-8 min-[375px]:px-5 sm:px-8 sm:py-10 lg:px-10 lg:py-14", widths[width], className)} />;
}
