"use client";
import { useEffect, useRef } from "react";
import { countsLandingView } from "./landing-view-beacon";

/** Aggregate sources only: no referrer, share token, identity, cookie or calculator input leaves this page. */
export function AcquisitionBeacon({ source }: { source: string }) {
  const counted = useRef<string | null>(null);
  useEffect(() => {
    if (counted.current === source || !countsLandingView(navigator)) return;
    counted.current = source;
    navigator.sendBeacon(`/api/analytics/visit?source=${encodeURIComponent(source)}`);
  }, [source]);
  return null;
}
