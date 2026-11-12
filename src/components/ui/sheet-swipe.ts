"use client";
import { useEffect, type RefObject } from "react";

type Axis = "x" | "y";

/** Release rule: a flick toward the edge, or past 40 % of the sheet unless the finger is flicking back. */
export function shouldDismiss(offset: number, velocity: number, size: number) {
  return velocity > 500 || (offset > size * 0.4 && velocity > -200);
}

/** Pulling away from the edge moves a fifth of the finger, so the sheet resists instead of stopping dead. */
export function resist(offset: number) {
  return offset >= 0 ? offset : offset * 0.2;
}

/** One semi-implicit Euler step of a unit-mass spring (px, px/s, seconds). */
export function springStep(x: number, v: number, target: number, dt: number, stiffness: number, damping: number) {
  const velocity = v + (-stiffness * (x - target) - damping * v) * dt;
  return [x + velocity * dt, velocity] as const;
}

const SKIP = "input, textarea, select, [contenteditable], [data-no-swipe]";

/**
 * Swipe a modal <dialog> sheet back toward the screen edge it is attached to (`y`: bottom, `x`: right).
 * Touch only, and only while the sheet actually touches that edge, so centred desktop dialogs are untouched.
 * Dismissal goes through a cancelable `cancel` event, so each dialog's existing onCancel guard (pending work) still applies.
 */
export function useSheetSwipeDismiss(ref: RefObject<HTMLDialogElement | null>, axis: Axis) {
  useEffect(() => {
    const sheet = ref.current;
    if (!sheet) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let tracking: { origin: number; cross: number; base: number; locked: boolean } | null = null;
    let samples: { t: number; p: number }[] = [];
    let offset = 0;
    let frame = 0;

    const point = (touch: Touch) => axis === "y" ? [touch.clientY, touch.clientX] : [touch.clientX, touch.clientY];
    const size = () => axis === "y" ? sheet.offsetHeight : sheet.offsetWidth;
    function write(value: number) {
      offset = value;
      sheet!.style.transform = value ? `translate${axis.toUpperCase()}(${value}px)` : "";
      // Only ::backdrop reads this; it cannot be styled inline.
      sheet!.style.setProperty("--sheet-swipe-progress", String(Math.min(1, Math.max(0, value / size()))));
    }
    function attached() {
      const rect = sheet!.getBoundingClientRect();
      return axis === "y" ? rect.bottom >= innerHeight - 1 && rect.width >= innerWidth - 1 : rect.right >= innerWidth - 1;
    }
    function scrolled(target: Element | null) {
      for (let el = target; el && el !== sheet!.parentElement; el = el.parentElement) {
        if (axis === "y" ? el.scrollTop > 0 : el.scrollWidth > el.clientWidth && /auto|scroll/.test(getComputedStyle(el).overflowX)) return true;
      }
      return false;
    }
    function settle(target: number, velocity: number, done?: () => void) {
      cancelAnimationFrame(frame);
      if (reduced.matches) { write(target); done?.(); return; }
      const [stiffness, damping] = target ? [400, 40] : [600, 40];
      let x = offset, v = velocity, last = performance.now();
      const tick = (now: number) => {
        [x, v] = springStep(x, v, target, Math.min((now - last) / 1000, 1 / 30), stiffness, damping);
        last = now;
        if (Math.abs(v) < 5 && Math.abs(x - target) < 0.5) { write(target); done?.(); return; }
        write(x);
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }

    function onStart(event: TouchEvent) {
      if (event.touches.length !== 1) { tracking = null; return; }
      const [p, c] = point(event.touches[0]);
      if (offset) { // catch a sheet mid-settle and keep tracking from where it is
        cancelAnimationFrame(frame);
        tracking = { origin: p, cross: c, base: offset, locked: true };
      } else if (attached() && !(event.target as Element).closest(SKIP) && !scrolled(event.target as Element)) {
        tracking = { origin: p, cross: c, base: 0, locked: false };
      } else { tracking = null; return; }
      samples = [{ t: event.timeStamp, p }];
    }
    function onMove(event: TouchEvent) {
      if (!tracking) return;
      const [p, c] = point(event.touches[0]);
      if (!tracking.locked) {
        const main = p - tracking.origin, cross = c - tracking.cross;
        if (Math.abs(main) < 6 && Math.abs(cross) < 6) return;
        // Toward the edge and mostly along the axis: the sheet takes the gesture; otherwise native scrolling does.
        if (main <= 0 || Math.abs(cross) >= main || !event.cancelable) { tracking = null; return; }
        tracking.locked = true; // origin stays at touchdown, so the sheet sits under the finger 1:1
      }
      event.preventDefault();
      write(resist(tracking.base + p - tracking.origin));
      samples = [...samples.filter((sample) => event.timeStamp - sample.t < 100), { t: event.timeStamp, p }];
    }
    function onEnd(event: TouchEvent) {
      if (!tracking?.locked) { tracking = null; return; }
      tracking = null;
      // Only the last 100 ms before lift count: a flick that then holds still releases at rest.
      const recent = samples.filter((sample) => event.timeStamp - sample.t < 100);
      const first = recent[0], last = recent.at(-1);
      const velocity = event.type === "touchend" && first && last && last.t > first.t ? (last.p - first.p) / (last.t - first.t) * 1000 : 0;
      if (event.type === "touchend" && shouldDismiss(offset, velocity, size()) && sheet!.dispatchEvent(new Event("cancel", { cancelable: true }))) {
        settle(size() + 24, Math.max(velocity, 0), () => { sheet!.close(); write(0); });
      } else settle(0, velocity);
    }
    function onClose() { cancelAnimationFrame(frame); tracking = null; write(0); }

    sheet.addEventListener("touchstart", onStart, { passive: true });
    sheet.addEventListener("touchmove", onMove, { passive: false });
    sheet.addEventListener("touchend", onEnd);
    sheet.addEventListener("touchcancel", onEnd);
    sheet.addEventListener("close", onClose);
    return () => {
      cancelAnimationFrame(frame);
      sheet.removeEventListener("touchstart", onStart);
      sheet.removeEventListener("touchmove", onMove);
      sheet.removeEventListener("touchend", onEnd);
      sheet.removeEventListener("touchcancel", onEnd);
      sheet.removeEventListener("close", onClose);
    };
  }, [ref, axis]);
}
