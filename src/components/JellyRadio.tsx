import { forwardRef, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { animate, motion, motionValue, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import "./JellyRadio.css";

const DEFAULT_ITEMS = ["Off", "Low", "Medium", "High", "Max"];
const SIZES = { sm: [28, 12, 12], md: [36, 13, 16], lg: [44, 14, 20] } as const;

type JellyItem = string | {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
};

type ChipMotion = {
  x: MotionValue<number>;
  sx: MotionValue<number>;
  sy: MotionValue<number>;
};

type JellyRadioProps = {
  items?: JellyItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, index: number) => void;
  chipColor?: string;
  activeColor?: string;
  textColor?: string;
  activeTextColor?: string;
  size?: "sm" | "md" | "lg";
  gap?: number;
  radius?: number;
  swell?: number;
  barge?: number;
  shrink?: number;
  jelly?: number;
  bounce?: number;
  stagger?: number;
  stiffness?: number;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
};

const spring = (stiffness: number, mass: number, bounce: number) => ({
  type: "spring" as const,
  stiffness,
  damping: 2 * Math.sqrt(stiffness * mass) * (1 - bounce),
  mass,
});

const Chip = forwardRef<HTMLButtonElement, { mv: ChipMotion; edge: MotionValue<number>; children: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>>(function Chip({ mv, edge, children, ...rest }, ref) {
  const transform = useTransform(() => `translateX(${mv.x.get() + edge.get()}px) scale(${mv.sx.get()}, ${mv.sy.get()})`);
  return <motion.button ref={ref} style={{ transform }} {...rest}>{children}</motion.button>;
});

export default function JellyRadio({
  items = DEFAULT_ITEMS,
  value,
  defaultValue,
  onChange,
  chipColor = "#27272a",
  activeColor = "#f5f5f5",
  textColor = "#f5f5f5",
  activeTextColor = "#18181b",
  size = "md",
  gap = 8,
  radius = 18,
  swell = 0.2,
  barge = 6,
  shrink = 0.05,
  jelly = 1,
  bounce = 0.25,
  stagger = 22,
  stiffness = 580,
  disabled = false,
  ariaLabel = "Options",
  className = "",
}: JellyRadioProps) {
  const list = items.map(item => (typeof item === "string" ? { value: item, label: item } : item));
  const [inner, setInner] = useState(() => defaultValue ?? list[0]?.value);
  const current = value ?? inner;
  const at = Math.max(0, list.findIndex(item => item.value === current));
  const reduce = useReducedMotion();
  const groupRef = useRef<HTMLDivElement | null>(null);
  const chipRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const widths = useRef<number[]>([]);
  const positions = useRef<number[]>([]);
  const mvs = useRef<ChipMotion[]>([]);
  const [edgeOffset] = useState(() => motionValue(0));
  const applied = useRef(at);
  const cfg = useRef({ swell, barge, shrink, jelly, bounce, stagger, stiffness, reduce, count: list.length });
  cfg.current = { swell, barge, shrink, jelly, bounce, stagger, stiffness, reduce, count: list.length };
  const [height, font, horizontalPadding] = SIZES[size] ?? SIZES.md;
  const itemsKey = list.map(item => item.value).join("|");

  const motionFor = (index: number) => {
    let motionState = mvs.current[index];
    if (!motionState) {
      motionState = { x: motionValue(0), sx: motionValue(1), sy: motionValue(1) };
      mvs.current[index] = motionState;
    }
    return motionState;
  };

  const apply = (selected: number, instant: boolean) => {
    const config = cfg.current;
    const group = groupRef.current;
    const rtl = group ? getComputedStyle(group).direction === "rtl" : false;
    const push = ((widths.current[selected] ?? 0) * config.swell) / 2 + config.barge;
    const lastIndex = Math.max(0, config.count - 1);
    const xFor = (index: number) => Math.sign(index - selected) * (rtl ? -1 : 1) * push;
    const scaleFor = (index: number) => index === selected ? 1 + config.swell : 1 - config.shrink;

    if (group && config.count > 0) {
      const groupRect = group.getBoundingClientRect();
      const leftIndex = rtl ? lastIndex : 0;
      const rightIndex = rtl ? 0 : lastIndex;
      const leftChip = chipRefs.current[leftIndex];
      const rightChip = chipRefs.current[rightIndex];
      const leftLayout = positions.current[leftIndex] ?? ((leftChip?.offsetLeft ?? 0) - groupRect.left);
      const rightLayout = (positions.current[rightIndex] ?? ((rightChip?.offsetLeft ?? 0) - groupRect.left)) + (widths.current[rightIndex] ?? rightChip?.offsetWidth ?? 0);
      const leftGap = leftLayout + xFor(leftIndex) - ((widths.current[leftIndex] ?? 0) * (scaleFor(leftIndex) - 1)) / 2;
      const rightGap = groupRect.width - rightLayout - xFor(rightIndex) - ((widths.current[rightIndex] ?? 0) * (scaleFor(rightIndex) - 1)) / 2;
      const edgeTarget = (rightGap - leftGap) / 2;
      if (instant || config.reduce) edgeOffset.jump(edgeTarget);
      else animate(edgeOffset, edgeTarget, { ...spring(config.stiffness, 0.9, config.bounce) });
    }

    for (let index = 0; index < config.count; index += 1) {
      const motionState = motionFor(index);
      const selectedChip = index === selected;
      const distance = Math.abs(index - selected);
      const x = xFor(index);
      const scale = selectedChip ? 1 + config.swell : 1 - config.shrink;

      if (instant || config.reduce) {
        motionState.x.jump(x);
        motionState.sx.jump(scale);
        motionState.sy.jump(scale);
        continue;
      }

      const stiffnessForChip = config.stiffness * (1 - 0.12 * Math.min(distance, 3));
      const inFlight = motionState.x.isAnimating() || motionState.sx.isAnimating() || motionState.sy.isAnimating();
      const delay = inFlight ? 0 : (distance * config.stagger) / 1000;
      animate(motionState.x, x, { ...spring(stiffnessForChip, 0.9, config.bounce), delay });
      animate(motionState.sx, scale, { ...spring(stiffnessForChip * (1 + 0.24 * config.jelly), 0.9 - 0.1 * config.jelly, Math.min(0.85, config.bounce + 0.3 * config.jelly)), delay });
      animate(motionState.sy, scale, { ...spring(stiffnessForChip * (1 - 0.14 * config.jelly), 0.9 + 0.05 * config.jelly, config.bounce), delay: delay + 0.05 * config.jelly });
    }
  };

  const measure = () => {
    const group = groupRef.current;
    if (!group) return;
    const groupLeft = group.getBoundingClientRect().left;
    widths.current = chipRefs.current.map((element, index) => {
      if (!element) {
        positions.current[index] = 0;
        return 0;
      }
      const motionState = motionFor(index);
      const scale = motionState.sx.get() || 1;
      const rect = element.getBoundingClientRect();
      const width = rect.width / scale;
      positions.current[index] = rect.left - groupLeft - motionState.x.get() - edgeOffset.get() + (width * (scale - 1)) / 2;
      return width;
    });
    const chipHeight = chipRefs.current[0]?.offsetHeight ?? 0;
    const maxWidth = Math.max(0, ...widths.current);
    group.style.setProperty("--jr-pad-x", `${Math.ceil((maxWidth * swell * 1.3) / 2 + barge) + 2}px`);
    group.style.setProperty("--jr-pad-y", `${Math.ceil((chipHeight * swell) / 2) + 2}px`);
  };

  useLayoutEffect(() => {
    const settle = () => {
      measure();
      apply(applied.current, true);
    };
    settle();
    const observer = new ResizeObserver(settle);
    if (groupRef.current) observer.observe(groupRef.current);
    document.fonts?.ready.then(settle);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey, size, gap, swell, barge, shrink]);

  useEffect(() => {
    if (applied.current === at) return;
    applied.current = at;
    apply(at, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [at]);

  useEffect(() => () => {
    mvs.current.forEach(motionState => {
      motionState.x.destroy();
      motionState.sx.destroy();
      motionState.sy.destroy();
    });
    edgeOffset.destroy();
  }, []);

  const commit = (index: number, instant: boolean) => {
    if (disabled || index === at || !list[index] || list[index].disabled) return;
    measure();
    applied.current = index;
    apply(index, instant);
    if (value === undefined) setInner(list[index].value);
    onChange?.(list[index].value, index);
  };

  const stepFrom = (index: number, direction: number) => {
    const count = list.length;
    let next = index;
    for (let tries = 0; tries < count; tries += 1) {
      next = (next + direction + count) % count;
      if (!list[next].disabled) return next;
    }
    return index;
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = stepFrom(index, 1);
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = stepFrom(index, -1);
    else if (event.key === "Home") next = stepFrom(-1, 1);
    else if (event.key === "End") next = stepFrom(list.length, -1);
    else if (event.key === " " || event.key === "Enter") next = index;
    if (next === null) return;
    event.preventDefault();
    commit(next, true);
    chipRefs.current[next]?.focus();
  };

  const style = {
    "--jr-chip": chipColor,
    "--jr-active": activeColor,
    "--jr-text": textColor,
    "--jr-active-text": activeTextColor,
    "--jr-gap": `${gap}px`,
    "--jr-radius": `${radius}px`,
    "--jr-h": `${height}px`,
    "--jr-font": `${font}px`,
    "--jr-px": `${horizontalPadding}px`,
  } as CSSProperties;

  return (
    <div ref={groupRef} role="radiogroup" aria-label={ariaLabel} data-disabled={disabled ? "" : undefined} className={`jelly-radio${className ? ` ${className}` : ""}`} style={style}>
      {list.map((item, index) => (
        <Chip
          key={item.value}
          mv={motionFor(index)}
          edge={edgeOffset}
          ref={element => { chipRefs.current[index] = element; }}
          type="button"
          role="radio"
          aria-checked={index === at}
          tabIndex={index === at ? 0 : -1}
          disabled={disabled || !!item.disabled}
          className="jelly-radio__chip"
          data-on={index === at ? "true" : "false"}
          onClick={event => commit(index, event.detail === 0)}
          onKeyDown={event => onKeyDown(event, index)}
        >
          <span className="jelly-radio__skin">
            {item.icon ? <span className="jelly-radio__icon">{item.icon}</span> : null}
            <span className="jelly-radio__label">{item.label}</span>
          </span>
        </Chip>
      ))}
    </div>
  );
}
