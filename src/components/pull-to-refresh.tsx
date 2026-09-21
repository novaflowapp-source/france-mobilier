"use client";

import { useEffect, useState } from "react";

const ARM_PX = 68;
const MAX_PX = 92;

function pageLocked() {
  return document.documentElement.style.overflow === "hidden" || document.body.style.overflow === "hidden";
}

export function PullToRefresh() {
  const [offset, setOffset] = useState(0);
  const [armed, setArmed] = useState(false);
  const [reloading, setReloading] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: coarse)").matches) return;

    let startX = 0;
    let startY = 0;
    let pulling = false;
    let ready = false;

    function reset() {
      pulling = false;
      ready = false;
      setArmed(false);
      setOffset(0);
    }

    function onStart(event: TouchEvent) {
      if (reloading || pageLocked() || window.scrollY > 2) return;
      const touch = event.touches[0];
      if (!touch) return;
      startX = touch.clientX;
      startY = touch.clientY;
      pulling = true;
      ready = false;
    }

    function onMove(event: TouchEvent) {
      if (!pulling || reloading || pageLocked()) return;
      const touch = event.touches[0];
      if (!touch) return;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (dy <= 8 || dy <= Math.abs(dx) || window.scrollY > 2) {
        if (ready) {
          ready = false;
          setArmed(false);
          setOffset(0);
        }
        return;
      }
      if (event.cancelable) event.preventDefault();
      const next = Math.min(dy * 0.42, MAX_PX);
      ready = next >= ARM_PX;
      setArmed(ready);
      setOffset(next);
    }

    function onEnd() {
      if (!pulling) return;
      if (ready && !reloading) {
        setReloading(true);
        setOffset(56);
        window.location.reload();
        return;
      }
      reset();
    }

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", reset);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", reset);
    };
  }, [reloading]);

  const visible = offset > 4 || reloading;
  if (!visible) return null;

  return (
    <div
      className={`pull-to-refresh${armed || reloading ? " is-armed" : ""}`}
      style={{ transform: `translate(-50%, ${offset}px)` }}
      aria-hidden
    >
      <span className="pull-to-refresh-spinner" />
    </div>
  );
}
