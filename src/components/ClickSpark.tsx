import { forwardRef, useEffect, useImperativeHandle, useRef, type CSSProperties, type ReactNode } from "react";

type SparkShape = "line" | "streak" | "dot" | "star";
type SparkEasing = "ease-out" | "ease-in-out" | "ease-in" | "linear" | "spring";
type SparkLayer = "front" | "back";

export type ClickSparkHandle = {
  spark: (x?: number, y?: number) => void;
};

type ClickSparkProps = {
  sparkColor?: string | string[];
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  sparkWidth?: number;
  duration?: number;
  easing?: SparkEasing;
  extraScale?: number;
  shape?: SparkShape;
  randomness?: number;
  gravity?: number;
  spread?: number;
  direction?: number;
  glow?: number;
  ring?: boolean;
  layer?: SparkLayer;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

type SparkSettings = {
  colors: string[];
  size: number;
  radius: number;
  count: number;
  width: number;
  duration: number;
  ease: (t: number) => number;
  shape: SparkShape;
  randomness: number;
  gravity: number;
  spread: number;
  direction: number;
  glow: number;
  ring: boolean;
  disabled: boolean;
};

type Spark = {
  angle: number;
  reach: number;
  scale: number;
  life: number;
  spin: number;
  color: string;
  clear: string;
  glow: number;
};

type Burst = {
  x: number;
  y: number;
  start: number;
  sparks: Spark[];
  settings: SparkSettings;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  ratio: number;
  left: number;
  top: number;
};

const EASINGS: Record<SparkEasing, (t: number) => number> = {
  linear: t => t,
  "ease-in": t => t * t,
  "ease-out": t => 1 - Math.pow(1 - t, 3),
  "ease-in-out": t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  spring: t => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2)
};

const MAX_BURSTS = 32;
const GRAVITY = 500;
const REDUCED_MS = 320;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

const starPath = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, rotation: number) => {
  const pinch = radius * 0.16;
  ctx.beginPath();
  ctx.moveTo(x + Math.cos(rotation) * radius, y + Math.sin(rotation) * radius);
  for (let i = 1; i <= 4; i++) {
    const angle = rotation + (i * Math.PI) / 2;
    const mid = angle - Math.PI / 4;
    ctx.quadraticCurveTo(
      x + Math.cos(mid) * pinch,
      y + Math.sin(mid) * pinch,
      x + Math.cos(angle) * radius,
      y + Math.sin(angle) * radius
    );
  }
  ctx.closePath();
};

const getChannels = (ctx: CanvasRenderingContext2D, color: string) => {
  ctx.fillStyle = color;
  const normal = String(ctx.fillStyle);
  const hex = /^#([0-9a-f]{6})$/i.exec(normal);
  if (hex) {
    const value = parseInt(hex[1], 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  }
  const rgb = /^rgba?\(([^)]+)\)$/i.exec(normal);
  if (rgb) return rgb[1].split(",").slice(0, 3).map(part => parseFloat(part));
  return [0, 0, 0];
};

const ClickSpark = forwardRef<ClickSparkHandle, ClickSparkProps>(function ClickSpark(
  {
    sparkColor = "#fff",
    sparkSize = 14,
    sparkRadius = 30,
    sparkCount = 8,
    sparkWidth = 2,
    duration = 500,
    easing = "ease-out",
    extraScale = 1,
    shape = "line",
    randomness = 0.2,
    gravity = 0,
    spread = 360,
    direction = 0,
    glow = 0,
    ring = false,
    layer = "front",
    disabled = false,
    className = "",
    style,
    children
  },
  ref
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLSpanElement>(null);
  const engineRef = useRef<ClickSparkHandle | null>(null);
  const settings: SparkSettings = {
    colors: (Array.isArray(sparkColor) ? sparkColor : [sparkColor]).filter(Boolean),
    size: Math.max(0, sparkSize),
    radius: Math.max(0, sparkRadius) * Math.max(0, extraScale),
    count: clamp(Math.round(sparkCount), 1, 64),
    width: Math.max(0.5, sparkWidth),
    duration: Math.max(60, duration),
    ease: EASINGS[easing],
    shape,
    randomness: clamp(randomness, 0, 1),
    gravity: Math.max(0, gravity),
    spread: clamp(spread, 0, 360),
    direction,
    glow: clamp(glow, 0, 1),
    ring,
    disabled
  };
  if (!settings.colors.length) settings.colors = ["#ffffff"];
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    const root = rootRef.current;
    const canvasLayer = layerRef.current;
    if (!root || !canvasLayer) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bursts: Burst[] = [];
    let raf = 0;
    let lastPress = { time: -1e9, x: 0, y: 0 };
    const drop = (current: SparkSettings, seconds: number) => 0.5 * current.gravity * GRAVITY * seconds * seconds;
    const position = (burst: Burst, spark: Spark, distance: number, seconds: number): [number, number] => [
      burst.x + Math.cos(spark.angle) * distance,
      burst.y + Math.sin(spark.angle) * distance + drop(burst.settings, seconds)
    ];

    const drawSpark = (ctx: CanvasRenderingContext2D, burst: Burst, spark: Spark, elapsed: number) => {
      const current = burst.settings;
      const life = reduced ? REDUCED_MS : current.duration * spark.life;
      const progress = elapsed / life;
      if (progress >= 1) return false;
      const eased = reduced ? 0.55 : current.ease(clamp(progress, 0, 1));
      const seconds = reduced ? 0 : elapsed / 1000;
      const distance = current.radius * spark.reach * eased;
      const width = current.width * spark.scale;
      const fade = reduced ? 1 - progress : 1 - smoothstep(current.shape === "line" ? 0.55 : 0.7, 1, progress);
      if (fade <= 0) return true;
      ctx.strokeStyle = spark.color;
      ctx.fillStyle = spark.color;

      if (current.shape === "line") {
        const length = current.size * spark.scale * (reduced ? 0.5 : Math.pow(1 - progress, 1.6));
        const [x1, y1] = position(burst, spark, distance, seconds);
        const [x2, y2] = position(burst, spark, distance + Math.max(0.01, length), seconds);
        ctx.lineCap = "round";
        if (spark.glow > 0) {
          ctx.globalAlpha = fade * 0.14 * spark.glow;
          ctx.lineWidth = width * 4.5;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        ctx.globalAlpha = fade;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        return true;
      }

      if (current.shape === "streak") {
        const lag = reduced ? 0 : Math.min(elapsed, 70 + current.size * 4 * spark.scale);
        const back = reduced ? 0.4 : current.ease(clamp((elapsed - lag) / life, 0, 1));
        const [hx, hy] = position(burst, spark, distance, seconds);
        const [tx, ty] = position(burst, spark, current.radius * spark.reach * back, Math.max(0, seconds - lag / 1000));
        const dx = hx - tx;
        const dy = hy - ty;
        const length = Math.hypot(dx, dy) || 1;
        const nx = (-dy / length) * width * 0.5;
        const ny = (dx / length) * width * 0.5;
        const paint = (spreadWidth: number, alpha: number) => {
          const gradient = ctx.createLinearGradient(tx, ty, hx, hy);
          gradient.addColorStop(0, spark.clear);
          gradient.addColorStop(1, spark.color);
          ctx.globalAlpha = alpha;
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(hx + nx * spreadWidth, hy + ny * spreadWidth);
          ctx.lineTo(hx - nx * spreadWidth, hy - ny * spreadWidth);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = spark.color;
          ctx.beginPath();
          ctx.arc(hx, hy, (width * 0.5) * spreadWidth, 0, Math.PI * 2);
          ctx.fill();
        };
        if (spark.glow > 0) paint(3.2, fade * 0.16 * spark.glow);
        paint(1, fade);
        return true;
      }

      if (current.shape === "dot") {
        const [x, y] = position(burst, spark, distance, seconds);
        const radius = width * 1.25 * (1 - 0.5 * eased);
        if (spark.glow > 0) {
          ctx.globalAlpha = fade * 0.18 * spark.glow;
          ctx.beginPath();
          ctx.arc(x, y, radius * 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = fade;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        return true;
      }

      const [x, y] = position(burst, spark, distance, seconds);
      const twinkle = reduced ? 1 - progress : Math.pow(Math.sin(Math.PI * clamp(progress * 1.1, 0, 1)), 0.7);
      const radius = current.size * 0.6 * spark.scale * twinkle;
      const rotation = spark.angle + spark.spin * progress * Math.PI * 0.5;
      if (radius <= 0.05) return true;
      if (spark.glow > 0) {
        ctx.globalAlpha = fade * 0.2 * spark.glow;
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = fade;
      starPath(ctx, x, y, radius, rotation);
      ctx.fill();
      return true;
    };

    const drawRing = (ctx: CanvasRenderingContext2D, burst: Burst, elapsed: number) => {
      const life = reduced ? REDUCED_MS : burst.settings.duration * 0.8;
      const progress = elapsed / life;
      if (progress >= 1) return false;
      const radius = 2 + burst.settings.radius * 0.6 * (reduced ? 0.6 : EASINGS["ease-out"](progress));
      ctx.globalAlpha = Math.pow(1 - progress, 2) * 0.7;
      ctx.strokeStyle = burst.sparks[0]?.color ?? burst.settings.colors[0];
      ctx.lineWidth = Math.max(0.5, burst.settings.width * (1 - progress) * 0.9);
      ctx.beginPath();
      ctx.arc(burst.x, burst.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      return true;
    };

    const remove = (burst: Burst) => {
      burst.canvas.remove();
      const index = bursts.indexOf(burst);
      if (index >= 0) bursts.splice(index, 1);
    };

    const frame = (now: number) => {
      raf = 0;
      for (const burst of [...bursts]) {
        const elapsed = now - burst.start;
        const ctx = burst.ctx;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, burst.canvas.width, burst.canvas.height);
        ctx.setTransform(burst.ratio, 0, 0, burst.ratio, -burst.left * burst.ratio, -burst.top * burst.ratio);
        let alive = false;
        if (burst.settings.ring && drawRing(ctx, burst, elapsed)) alive = true;
        for (const spark of burst.sparks) if (drawSpark(ctx, burst, spark, elapsed)) alive = true;
        ctx.globalAlpha = 1;
        if (!alive) remove(burst);
      }
      if (bursts.length) raf = requestAnimationFrame(frame);
    };

    const spawn = (clientX: number, clientY: number) => {
      const current = settingsRef.current;
      if (current.disabled) return;
      const rect = root.getBoundingClientRect();
      const colorOffset = Math.floor(Math.random() * current.colors.length);
      const full = current.spread >= 359.5;
      const arc = (current.spread * Math.PI) / 180;
      const heading = ((current.direction - 90) * Math.PI) / 180;
      const step = full ? (Math.PI * 2) / current.count : current.count > 1 ? arc / (current.count - 1) : 0;
      const sparks: Spark[] = Array.from({ length: current.count }, (_, i) => {
        const base = full ? heading + step * i : current.count > 1 ? heading - arc / 2 + step * i : heading;
        const jitter = (Math.random() - 0.5) * current.randomness;
        return {
          angle: base + jitter * (step || arc || 1) * 0.9,
          reach: 1 + (Math.random() - 0.5) * 0.7 * current.randomness,
          scale: 1 + (Math.random() - 0.5) * 0.8 * current.randomness,
          life: 1 + (Math.random() - 0.5) * 0.5 * current.randomness,
          spin: Math.random() - 0.5,
          color: current.colors[(i + colorOffset) % current.colors.length],
          clear: "",
          glow: 0
        };
      });
      const longest = current.duration * (1 + 0.25 * current.randomness);
      const fall = drop(current, longest / 1000);
      const reach =
        current.radius * (1 + 0.35 * current.randomness) * (current.ease === EASINGS.spring ? 1.15 : 1) +
        current.size * (1 + 0.4 * current.randomness) +
        current.width * (current.glow > 0 ? 6 : 2) +
        6;
      const box = {
        left: Math.max(clientX - reach, 0),
        top: Math.max(clientY - reach, 0),
        right: Math.min(clientX + reach, window.innerWidth),
        bottom: Math.min(clientY + reach + fall, window.innerHeight)
      };
      if (box.right - box.left < 1 || box.bottom - box.top < 1) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil((box.right - box.left) * ratio);
      canvas.height = Math.ceil((box.bottom - box.top) * ratio);
      Object.assign(canvas.style, {
        position: "absolute",
        left: `${box.left - rect.left}px`,
        top: `${box.top - rect.top}px`,
        width: `${box.right - box.left}px`,
        height: `${box.bottom - box.top}px`,
        display: "block",
        pointerEvents: "none"
      });
      canvas.setAttribute("aria-hidden", "true");
      canvasLayer.appendChild(canvas);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        canvas.remove();
        return;
      }
      for (const spark of sparks) {
        const [r, g, b] = getChannels(ctx, spark.color);
        spark.clear = `rgba(${r}, ${g}, ${b}, 0)`;
        spark.glow = current.glow * (0.35 + 0.65 * ((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255));
      }
      bursts.push({ x: clientX, y: clientY, start: performance.now(), sparks, settings: { ...current }, canvas, ctx, ratio, left: box.left, top: box.top });
      while (bursts.length > MAX_BURSTS) remove(bursts[0]);
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      lastPress = { time: performance.now(), x: event.clientX, y: event.clientY };
      spawn(event.clientX, event.clientY);
    };
    const onClick = (event: MouseEvent) => {
      const pointerType = (event as MouseEvent & { pointerType?: string }).pointerType;
      if (pointerType === "mouse") return;
      if (event.detail === 0) {
        const target = event.target instanceof Element ? event.target : root;
        const rect = target.getBoundingClientRect();
        spawn(rect.left + rect.width / 2, rect.top + rect.height / 2);
        return;
      }
      const recent = performance.now() - lastPress.time < 700 && Math.hypot(event.clientX - lastPress.x, event.clientY - lastPress.y) < 12;
      if (!recent) spawn(event.clientX, event.clientY);
    };

    root.addEventListener("pointerdown", onPointerDown);
    // Capture phase lets the spark run before a child button stops click bubbling.
    root.addEventListener("click", onClick, true);
    engineRef.current = {
      spark: (x, y) => {
        const rect = root.getBoundingClientRect();
        spawn(rect.left + (x ?? rect.width / 2), rect.top + (y ?? rect.height / 2));
      }
    };

    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("click", onClick, true);
      for (const burst of [...bursts]) remove(burst);
      engineRef.current = null;
    };
  }, []);

  useImperativeHandle(ref, () => ({ spark: (x, y) => engineRef.current?.spark(x, y) }), []);

  return (
    <div
      ref={rootRef}
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "visible", isolation: "isolate", ...style }}
    >
      {children}
      <span
        ref={layerRef}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, zIndex: layer === "back" ? -1 : 1, overflow: "visible", pointerEvents: "none" }}
      />
    </div>
  );
});

export default ClickSpark;
