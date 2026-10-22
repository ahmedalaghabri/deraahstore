// React Bits SwipeToast adapted for the shared quick-cart confirmation.
// @ts-nocheck

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import "./SwipeToast.css";

const EASE_OUT = [0.23, 1, 0.32, 1];
const FLICK = 0.11;
const DEAD_ZONE = 3;
const RESIST_PX = 24;
const COLLAPSE_MS = 200;
const EXIT = 0.7;
const BURN = [{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }];
const HAS_STARTING_STYLE = typeof window !== "undefined" && "CSSStartingStyleRule" in window;

const rubberband = (over, dim, c = 0.55) => (over * dim * c) / (dim + c * Math.abs(over));
const velocityOf = history => {
  if (history.length < 2) return 0;
  const [t0, y0] = history[0];
  const [t1, y1] = history[history.length - 1];
  return performance.now() - t1 > 100 ? 0 : (y1 - y0) / Math.max(1, t1 - t0);
};

export default function SwipeToast({
  title = "File archived",
  description = "",
  icon,
  actionLabel = "",
  onAction,
  open = true,
  onClose,
  background = "#27272a",
  color = "#f5f5f5",
  fuseColor = "#f5a524",
  width = 356,
  radius = 12,
  slideMs = 400,
  settleBounce = 0.2,
  swipeDistance = 40,
  duration = 4000,
  fuse = "bottom",
  pauseOnHover = true,
  closeButton = false,
  inline = false,
  dismissible = true,
  className = "",
}) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState("open");
  const [instant, setInstant] = useState(false);
  const [mounted, setMounted] = useState(HAS_STARTING_STYLE);
  const cardRef = useRef(null);
  const fuseRef = useRef(null);
  const anim = useRef(null);
  const drag = useRef(null);
  const flags = useRef({ hover: false, interacting: false, focus: false, hidden: false });
  const lastInput = useRef("pointer");
  const pendingClose = useRef(null);
  const closeTimer = useRef(undefined);
  const phaseRef = useRef(phase);
  const leaving = useRef(false);
  const latest = useRef({});
  phaseRef.current = phase;
  latest.current = { onClose, onAction, slideMs, inline };

  const y = useMotionValue(0);
  const fade = useMotionValue(1);
  const transform = useTransform(y, value => `translateY(${value}px)`);

  const syncFuse = () => {
    const animation = anim.current;
    if (!animation) return;
    const state = flags.current;
    if (state.hover || state.interacting || state.focus || state.hidden) animation.pause();
    else if (animation.playState === "paused") animation.play();
  };

  const finish = why => {
    setPhase("gone");
    leaving.current = false;
    if (latest.current.inline) closeTimer.current = setTimeout(() => latest.current.onClose?.(why), COLLAPSE_MS);
    else latest.current.onClose?.(why);
  };

  const close = why => {
    if (phaseRef.current !== "open" || leaving.current) return;
    if (drag.current) {
      pendingClose.current = why;
      return;
    }
    anim.current?.pause();
    lastInput.current = lastInput.current || "pointer";
    setInstant(why === "escape" || ((why === "action" || why === "close") && lastInput.current === "keyboard"));
    setPhase("closing");
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => finish(why), why === "escape" ? 0 : latest.current.slideMs * EXIT + 60);
  };

  const rescue = () => {
    clearTimeout(closeTimer.current);
    setInstant(false);
    y.set(0);
    fade.set(1);
    setPhase("open");
  };

  useEffect(() => {
    if (!open) close("programmatic");
    else if (phaseRef.current !== "open") rescue();
  }, [open]);

  useEffect(() => {
    if (!HAS_STARTING_STYLE) requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (phase !== "open" || duration <= 0 || !fuseRef.current) return undefined;
    anim.current?.cancel();
    const animation = fuseRef.current.animate(BURN, { duration, easing: "linear", fill: "forwards" });
    animation.onfinish = () => close("timeout");
    anim.current = animation;
    syncFuse();
    return () => {
      animation.onfinish = null;
      animation.pause();
    };
  }, [phase, duration]);

  useEffect(() => {
    const onVisibility = () => {
      flags.current.hidden = document.hidden;
      syncFuse();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      clearTimeout(closeTimer.current);
      anim.current?.cancel();
    };
  }, []);

  const swipeOut = (distance, velocity) => {
    anim.current?.pause();
    leaving.current = true;
    pendingClose.current = null;
    if (!reduce && cardRef.current) animate(y, distance + cardRef.current.offsetHeight, { type: "spring", duration: 0.3, bounce: 0, velocity: velocity * 1000 });
    animate(fade, 0, { duration: 0.2, ease: EASE_OUT }).then(() => finish("swipe"));
  };

  const onPointerDown = event => {
    lastInput.current = "pointer";
    if (event.button !== 0 || !dismissible || drag.current || leaving.current || event.target.closest("button")) return;
    if (phaseRef.current === "closing") rescue();
    try { cardRef.current?.setPointerCapture(event.pointerId); } catch {}
    y.stop();
    drag.current = { id: event.pointerId, startY: event.clientY, grab: null, moved: false, hist: [[performance.now(), y.get()]] };
    flags.current.interacting = true;
    syncFuse();
  };

  const onPointerMove = event => {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    if (current.grab === null) {
      if (Math.abs(event.clientY - current.startY) < DEAD_ZONE) return;
      current.grab = event.clientY - y.get();
      if (cardRef.current) cardRef.current.dataset.swiping = "";
    }
    const raw = event.clientY - current.grab;
    const next = raw >= 0 ? raw : rubberband(raw, RESIST_PX);
    y.set(next);
    current.moved = true;
    current.hist.push([performance.now(), next]);
    if (current.hist.length > 4) current.hist.shift();
  };

  const onPointerUp = event => {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    drag.current = null;
    if (cardRef.current) delete cardRef.current.dataset.swiping;
    try { cardRef.current?.releasePointerCapture(event.pointerId); } catch {}
    flags.current.interacting = false;
    const distance = y.get();
    const velocity = velocityOf(current.hist);
    if (distance > 0 && (velocity > FLICK || (distance >= swipeDistance && velocity >= 0))) {
      swipeOut(distance, velocity);
      return;
    }
    if (current.moved) animate(y, 0, reduce ? { duration: 0.2, ease: EASE_OUT } : { type: "spring", duration: 0.5, bounce: settleBounce, velocity: velocity * 1000 });
    const queued = pendingClose.current;
    pendingClose.current = null;
    if (queued) close(queued);
    else syncFuse();
  };

  return <div className={`swipe-toast${className ? ` ${className}` : ""}`} data-phase={phase} data-inline={inline ? "true" : "false"} data-fuse={duration > 0 ? fuse : "none"} data-dismissible={dismissible ? "true" : "false"} data-instant={instant ? "" : undefined} data-mounted={mounted ? "true" : "false"} style={{ "--st-bg": background, "--st-ink": color, "--st-fuse": fuseColor, "--st-w": `${width}px`, "--st-radius": `${radius}px`, "--st-slide": `${slideMs}ms` }}>
    <div className="swipe-toast__gate"><div className="swipe-toast__lift"><motion.div ref={cardRef} className="swipe-toast__card" role="status" aria-live="polite" aria-atomic="true" tabIndex={0} style={{ transform, opacity: fade }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onPointerEnter={event => { if (pauseOnHover && event.pointerType === "mouse") { flags.current.hover = true; syncFuse(); } }} onPointerLeave={event => { if (event.pointerType === "mouse") { flags.current.hover = false; syncFuse(); } }} onFocus={() => { flags.current.focus = true; syncFuse(); }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) { flags.current.focus = false; syncFuse(); } }} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") lastInput.current = "keyboard"; if (event.key === "Escape" && dismissible) { event.stopPropagation(); close("escape"); } }}>
      {icon ? <span className="swipe-toast__icon" aria-hidden="true">{icon}</span> : null}
      <div className="swipe-toast__body"><span className="swipe-toast__title">{title}</span>{description ? <div className="swipe-toast__desc">{description}</div> : null}</div>
      {actionLabel ? <button type="button" className="swipe-toast__action" onClick={() => { latest.current.onAction?.(); close("action"); }}>{actionLabel}</button> : null}
      {closeButton ? <button type="button" className="swipe-toast__close" aria-label="Close" onClick={() => close("close")}><HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2.5} /></button> : null}
      <i ref={fuseRef} className="swipe-toast__fuse" aria-hidden="true" />
    </motion.div></div></div>
  </div>;
}
