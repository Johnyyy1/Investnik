"use client";

import { ListTree, X } from "lucide-react";
import { useRef } from "react";
import { Button, IconButton } from "@/components/ui/button";

/** Phones and tablets: the curriculum rail opens as a native modal sheet (Escape and focus return are native). */
export function CurriculumSheet({ children }: { children: React.ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return <>
    <Button variant="secondary" size="compact" className="lg:hidden" onClick={() => dialog.current?.showModal()}><ListTree className="size-icon-sm" aria-hidden="true" />Kurikulum</Button>
    <dialog ref={dialog} aria-labelledby="b-sheet-title" className="m-0 mt-auto max-h-[85dvh] w-full max-w-none overflow-y-auto overscroll-contain rounded-t-surface bg-background p-0 text-foreground backdrop:bg-backdrop" onClick={(event) => { if (event.target === dialog.current) dialog.current.close(); }}>
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-divider bg-background px-4 py-2">
        <h2 id="b-sheet-title" className="text-card-title">Kurikulum</h2>
        <IconButton aria-label="Zavřít kurikulum" variant="ghost" onClick={() => dialog.current?.close()}><X className="size-icon-lg" aria-hidden="true" /></IconButton>
      </div>
      {/* Choosing a lesson closes the sheet; the page itself stays mounted. */}
      <div className="px-2 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]" onClick={(event) => { if ((event.target as HTMLElement).closest("a")) dialog.current?.close(); }}>{children}</div>
    </dialog>
  </>;
}
