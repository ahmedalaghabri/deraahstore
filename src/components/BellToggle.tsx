import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Notification03Icon } from "@hugeicons/core-free-icons";
import SwipeToast from "./SwipeToast";
import "./BellToggle.css";

const SIZES = {
  sm: [36, 12.5, 14, 15, 8],
  md: [44, 13.5, 16, 19, 9],
  lg: [52, 15, 18, 23, 10],
} as const;

const ringKeyframes = (amplitude: number, passes: number, decay: number) => {
  const frames: Keyframe[] = [{ transform: "rotate(0deg)", offset: 0 }];
  for (let index = 0; index < passes; index += 1) {
    const angle = amplitude * Math.pow(1 - index / passes, decay) * (index % 2 ? 1 : -1);
    frames.push({ transform: `rotate(${angle.toFixed(2)}deg)`, offset: (index + 1) / (passes + 2) });
  }
  frames.push({ transform: "rotate(0deg)", offset: 1 });
  return frames;
};

type BellToggleProps = {
  offLabel?: string;
  onLabel?: string;
  icon?: ReactNode;
  label?: string;
  color?: string;
  background?: string;
  onColor?: string;
  onBackground?: string;
  size?: "sm" | "md" | "lg";
  radius?: number;
  ringAmplitude?: number;
  ringPasses?: number;
  ringDecay?: number;
  ringDuration?: number;
  ringPivot?: number;
  crossfadeMs?: number;
  revealBounce?: number;
  count?: number;
  badge?: boolean;
  badgeColor?: string;
  badgeTextColor?: string;
  waves?: boolean;
  clapper?: boolean;
  pressed?: boolean;
  defaultPressed?: boolean;
  onChange?: (pressed: boolean) => void;
  disabled?: boolean;
  className?: string;
};

export default function BellToggle({
  offLabel = "Notify me",
  onLabel = "You'll be notified",
  icon,
  label,
  color = "#f5f5f5",
  background = "#27272a",
  onColor = "#18181b",
  onBackground = "#f5f5f5",
  size = "md",
  radius = 22,
  ringAmplitude = 17,
  ringPasses = 5,
  ringDecay = 1,
  ringDuration = 820,
  ringPivot = 16,
  crossfadeMs = 200,
  revealBounce = 0,
  count = 0,
  badge = true,
  badgeColor = "#ef4444",
  badgeTextColor = "#ffffff",
  waves = true,
  clapper = false,
  pressed,
  defaultPressed = false,
  onChange,
  disabled = false,
  className = "",
}: BellToggleProps) {
  const [inner, setInner] = useState(defaultPressed);
  const displayOnLabel = className.includes("product-notify-toggle") ? "Notified" : onLabel;
  const animatedBell = clapper || className.includes("product-notify-toggle");
  const productNotify = className.includes("product-notify-toggle");
  const productIconSize = productNotify ? 24 : iconSize;
  const [notificationToastOpen, setNotificationToastOpen] = useState(false);
  const on = pressed ?? inner;
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLSpanElement>(null);
  const glyphRef = useRef<HTMLSpanElement>(null);
  const pendingInput = useRef<"pointer" | "keyboard">("pointer");
  const previousCount = useRef(count);
  const transition = useMotionValue(on ? 1 : 0);
  const [height, fontSize, iconSize, horizontalPadding, gap] = SIZES[size] ?? SIZES.md;

  useLayoutEffect(() => {
    const target = on ? 1 : 0;
    if (pendingInput.current === "pointer" && !reduce) {
      animate(transition, target, { type: "spring", duration: 0.3, bounce: revealBounce });
    } else {
      transition.jump(target);
    }
    pendingInput.current = "pointer";
    if (on && !reduce && glyphRef.current) {
      glyphRef.current.animate(ringKeyframes(ringAmplitude, ringPasses, ringDecay), {
        duration: ringDuration,
        easing: "ease-in-out",
      });
    }
  }, [on, reduce, revealBounce, ringAmplitude, ringDecay, ringDuration, ringPasses, transition]);

  useEffect(() => {
    const previous = previousCount.current;
    previousCount.current = count;
    if (on && count > previous && !reduce && glyphRef.current) {
      glyphRef.current.animate(ringKeyframes(ringAmplitude * 0.4, 3, ringDecay), { duration: 420, easing: "ease-in-out" });
    }
  }, [count, on, reduce, ringAmplitude, ringDecay]);

  const toggle = () => {
    const next = !on;
    if (pressed === undefined) setInner(next);
    if (productNotify && next) setNotificationToastOpen(true);
    onChange?.(next);
  };

  const showBadge = badge && on && count > 0;

  return <>
    <motion.span
      ref={rootRef}
      className={`bell-toggle${className ? ` ${className}` : ""}`}
      data-on={on ? "true" : "false"}
      data-disabled={disabled ? "" : undefined}
      style={{
        "--bt-color": color,
        "--bt-bg": background,
        "--bt-on-color": onColor,
        "--bt-on-bg": onBackground,
        "--bt-badge": badgeColor,
        "--bt-badge-ink": badgeTextColor,
        "--bt-radius": `${radius}px`,
        "--bt-fade": `${crossfadeMs}ms`,
        "--bt-pivot": `${ringPivot}%`,
        "--bt-h": `${height}px`,
        "--bt-fs": `${fontSize}px`,
        "--bt-icon": `${productNotify ? productIconSize : iconSize}px`,
        "--bt-px": `${horizontalPadding}px`,
        "--bt-gap": `${gap}px`,
      } as CSSProperties}
    >
      <button
        type="button"
        className="bell-toggle__button"
        aria-pressed={on}
        aria-label={label ?? (on ? displayOnLabel : offLabel)}
        disabled={disabled}
        onPointerDown={event => {
          pendingInput.current = "pointer";
          if (event.button === 0) rootRef.current?.setAttribute("data-pressed", "");
        }}
        onPointerUp={() => rootRef.current?.removeAttribute("data-pressed")}
        onPointerCancel={() => rootRef.current?.removeAttribute("data-pressed")}
        onPointerLeave={() => rootRef.current?.removeAttribute("data-pressed")}
        onKeyDown={event => {
          if (event.key === "Enter" || event.key === " ") pendingInput.current = "keyboard";
        }}
        onClick={toggle}
      >
        <span className="bell-toggle__bell" aria-hidden="true">
          <span ref={glyphRef} className="bell-toggle__glyph">
            {productNotify ? (
              <HugeiconsIcon icon={Notification03Icon} size={productIconSize} strokeWidth={1.7} />
            ) : animatedBell ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 16.5V10a6 6 0 0 1 12 0v6.5l1.6 2.3H4.4L6 16.5z" />
                <path d="M12 2.5V4" />
                <circle cx="12" cy="20.4" r="1.7" fill="currentColor" stroke="none" />
              </svg>
            ) : (icon ?? <HugeiconsIcon icon={Notification03Icon} size={iconSize} strokeWidth={2} />)}
          </span>
          {waves && (!productNotify || on) && <span className="bell-toggle__waves" aria-hidden="true"><i /><i /></span>}
          {badge && <span className="bell-toggle__badge" data-show={showBadge ? "" : undefined}><span>{count > 9 ? "9+" : count}</span></span>}
        </span>
        <span className="bell-toggle__say" aria-hidden="true">
          <span className="bell-toggle__face bell-toggle__face--off">{offLabel}</span>
          <span className="bell-toggle__face bell-toggle__face--on">{displayOnLabel}</span>
        </span>
      </button>
    </motion.span>
    {productNotify && notificationToastOpen ? <SwipeToast
      open
      onClose={() => setNotificationToastOpen(false)}
      title="We'll notify you"
      description="You will be notified when this product is available."
      background="#171717"
      color="#ffffff"
      fuseColor="#d50000"
      width={356}
      radius={12}
      duration={4200}
      fuse="bottom"
      pauseOnHover
      closeButton
      className="product-notify-toast"
    /> : null}
  </>;
}
