import type { ElementType, ReactNode } from "react";

/** Heading whose words (or characters / lines) animate in when it scrolls into view. SplitText keeps it accessible. */
export function SplitHeading({ as: Tag = "h2", mode = "words", ...props }: {
  as?: ElementType; mode?: "words" | "chars" | "lines"; id?: string; className?: string; children: ReactNode;
}) {
  return <Tag {...props} data-split={mode} />;
}
