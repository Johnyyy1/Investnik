"use client";

import { useEffect } from "react";
import styles from "./pen-landing.module.css";

/**
 * Prototype liquid-glass layer for the landing: the ambient colour field the glass refracts, the SVG lens
 * filter, and a pointer-tracked specular highlight. Purely decorative; content never depends on it.
 */
export function LiquidGlass() {
  useEffect(() => {
    const html = document.documentElement;
    // shortcut: SVG filters inside backdrop-filter only render in Chromium; userAgentData is Chromium-only. Upgrade to a real feature test if Safari/Firefox ship it.
    if ("userAgentData" in navigator) html.dataset.refract = "";
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return () => { delete html.dataset.refract; };
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = (event.target as Element | null)?.closest<HTMLElement>("[data-glass]");
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${((event.clientX - r.left) / r.width) * 100}%`);
        el.style.setProperty("--my", `${((event.clientY - r.top) / r.height) * 100}%`);
      });
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => { document.removeEventListener("pointermove", onMove); cancelAnimationFrame(frame); delete html.dataset.refract; };
  }, []);

  return <>
    <div className={styles.ambient} aria-hidden="true"><span/><span/><span/><span/></div>
    {/* Low-frequency noise bends what passes under the lens; it averages to "no shift", so nothing drifts. */}
    <svg className={styles.visuallyHidden} aria-hidden="true" focusable="false">
      <filter id="lg-lens" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.004 0.02" numOctaves="1" seed="7" result="noise"/>
        <feGaussianBlur in="noise" stdDeviation="3" result="map"/>
        <feDisplacementMap in="SourceGraphic" in2="map" scale="22" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </svg>
  </>;
}
