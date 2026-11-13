import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("keeps a token text size next to a token text colour", () => {
    expect(cn("text-body text-primary-foreground")).toBe("text-body text-primary-foreground");
    expect(cn("text-small text-secondary", "text-body")).toBe("text-secondary text-body");
  });

  it("lets later token radius and elevation classes win", () => {
    expect(cn("rounded-button", "rounded-control")).toBe("rounded-control");
    expect(cn("shadow-elevation-1", "shadow-none")).toBe("shadow-none");
    expect(cn("text-secondary", "text-danger-ink")).toBe("text-danger-ink");
  });

  it("merges the control, icon, width and tracking tokens like built-in scales", () => {
    expect(cn("min-h-control-lg", "min-h-0")).toBe("min-h-0");
    expect(cn("size-control", "size-icon-sm")).toBe("size-icon-sm");
    expect(cn("max-w-wide", "max-w-data")).toBe("max-w-data");
    expect(cn("text-label tracking-label text-primary")).toBe("text-label tracking-label text-primary");
    expect(cn("tracking-heading", "tracking-normal")).toBe("tracking-normal");
  });
});
