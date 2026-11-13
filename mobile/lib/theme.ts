// Native values mirrored from the DESIGN.md frontmatter (source: src/styles/tokens.css). Never import web CSS here.
// shortcut: copied by hand and light only (the web has no dark palette yet); generate from DESIGN.md once screens use more tokens.
export const colors = {
  background: "#f7f2e8",
  foreground: "#171717",
  muted: "#55594f",
  surface: "#fffcf7",
  border: "#d5d2c8",
  primary: "#236f66",
  danger: "#a63d28",
} as const;

export const spacing = { xs: 8, sm: 12, md: 16, gutter: 20, lg: 24, xl: 32 } as const;

export const radius = { control: 8, surface: 12 } as const;
