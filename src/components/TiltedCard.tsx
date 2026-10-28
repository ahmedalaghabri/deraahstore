import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import "./TiltedCard.css";

type TiltedCardProps = {
  children: ReactNode;
  className?: string;
  width?: number | string;
  height?: number | string;
  maxTilt?: number;
  scaleOnHover?: number;
  floating?: boolean;
  ariaLabel?: string;
  style?: CSSProperties;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function TiltedCard({
  children,
  className = "",
  width = 280,
  height = 220,
  maxTilt = 12,
  scaleOnHover = 1.045,
  floating = true,
  ariaLabel = "Interactive membership card",
  style,
}: TiltedCardProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const body = bodyRef.current;
    if (!root || !body) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const state = { x: 0, y: 0, vx: 0, vy: 0, lift: 0, time: Math.random() * 4 };
    const pointer = { x: 0, y: 0, active: false };
    let frame = 0;
    let last = performance.now();

    const wake = () => {
      if (!frame) frame = requestAnimationFrame(animate);
    };

    const animate = (now: number) => {
      frame = 0;
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);
      last = now;
      state.time += dt;

      const autoX = floating && !reduced && !pointer.active ? Math.sin(state.time * 0.72) * 2.2 : 0;
      const autoY = floating && !reduced && !pointer.active ? Math.cos(state.time * 0.88) * 2.8 : 0;
      const targetX = pointer.active ? -pointer.y * maxTilt : autoX;
      const targetY = pointer.active ? pointer.x * maxTilt : autoY;
      const targetLift = pointer.active ? 1 : 0;
      const ease = 1 - Math.exp(-dt * 11);

      state.x += (targetX - state.x) * ease;
      state.y += (targetY - state.y) * ease;
      state.lift += (targetLift - state.lift) * ease;
      body.style.transform = `rotateX(${state.x.toFixed(3)}deg) rotateY(${state.y.toFixed(3)}deg) translateZ(${(state.lift * 8).toFixed(2)}px) scale(${(1 + state.lift * (scaleOnHover - 1)).toFixed(4)})`;
      root.style.setProperty("--tilted-glare-x", `${50 + state.y * 3.2}%`);
      root.style.setProperty("--tilted-glare-y", `${50 - state.x * 3.2}%`);
      root.style.setProperty("--tilted-glare-opacity", `${Math.min(.65, .12 + Math.hypot(state.x, state.y) / Math.max(1, maxTilt) * .5)}`);
      root.style.setProperty("--tilted-shadow", `${.18 + state.lift * .12}`);

      const stillMoving = pointer.active || floating && !reduced || Math.abs(targetX - state.x) > .02 || Math.abs(targetY - state.y) > .02;
      if (stillMoving) frame = requestAnimationFrame(animate);
    };

    const updatePointer = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      pointer.x = clamp((event.clientX - rect.left - rect.width / 2) / Math.max(1, rect.width / 2), -1, 1);
      pointer.y = clamp((event.clientY - rect.top - rect.height / 2) / Math.max(1, rect.height / 2), -1, 1);
      wake();
    };

    const onEnter = (event: PointerEvent) => {
      pointer.active = event.pointerType !== "touch";
      updatePointer(event);
    };
    const onMove = (event: PointerEvent) => updatePointer(event);
    const onLeave = () => {
      pointer.active = false;
      pointer.x = 0;
      pointer.y = 0;
      wake();
    };

    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    wake();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [floating, maxTilt, scaleOnHover]);

  return (
    <figure
      ref={rootRef}
      className={`tilted-card ${className}`.trim()}
      style={{ width, height, perspective: 760, ...style }}
      aria-label={ariaLabel}
    >
      <div ref={bodyRef} className="tilted-card__body">
        <div className="tilted-card__surface">{children}</div>
      </div>
    </figure>
  );
}
