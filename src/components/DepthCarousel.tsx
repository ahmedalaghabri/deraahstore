import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import "./DepthCarousel.css";

export type DepthCarouselItem = string | {
  image: string;
  alt?: string;
  productImage?: string;
  eyebrow?: string;
};

type DepthCarouselProps = {
  items?: DepthCarouselItem[];
  cardWidth?: number;
  cardHeight?: number;
  radius?: number;
  tint?: string;
  depth?: number;
  spread?: number;
  tilt?: number;
  tiltDirection?: "left" | "right";
  perspective?: number;
  visibleCards?: number;
  falloff?: number;
  blur?: number;
  duration?: number;
  ease?: string;
  mobileScale?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  loop?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
  onChange?: (index: number, item: { image: string; alt?: string }) => void;
  className?: string;
};

const DEFAULT_ITEMS: DepthCarouselItem[] = [
  { image: "/product-assets/real-products/link-white.png", alt: "Link White Limited Edition" },
  { image: "/product-assets/real-products/green-woods.png", alt: "Green Woods Eau de Parfum" },
  { image: "/product-assets/real-products/black-woods.png", alt: "Black Woods Eau de Toilette" },
  { image: "/product-assets/real-products/maroon.png", alt: "Maroon Perfume by Link" },
  { image: "/product-assets/real-products/silver-woods.png", alt: "Silver Woods Eau de Parfum" },
];

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const normalizeItem = (item: DepthCarouselItem) => (typeof item === "string" ? { image: item, alt: "" } : item);

export default function DepthCarousel({
  items = DEFAULT_ITEMS,
  cardWidth = 300,
  cardHeight = 380,
  radius = 18,
  tint = "#05060a",
  depth = 220,
  spread = 90,
  tilt = 22,
  tiltDirection = "right",
  perspective = 1400,
  visibleCards = 4,
  falloff = 0.2,
  blur = 6,
  duration = 700,
  ease = "power3.out",
  mobileScale = 1,
  autoplay = false,
  autoplayDelay = 3200,
  loop = true,
  showControls = true,
  showIndicators = true,
  onChange,
  className = "",
}: DepthCarouselProps) {
  const data = useMemo(() => (Array.isArray(items) ? items : []).map(normalizeItem), [items]);
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const overlayRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const positionRef = useRef(0);
  const focusRef = useRef(0);
  const scaleRef = useRef(1);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const dragRef = useRef<{ x: number; start: number; lastX: number; lastTime: number; velocity: number; moved: boolean; pointerId: number } | null>(null);
  const wheelTimerRef = useRef<number | null>(null);
  const autoTimerRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const [active, setActive] = useState(0);

  onChangeRef.current = onChange;

  const configRef = useRef({ count: data.length, depth, spread, tilt, tiltDirection, visibleCards, falloff, blur, duration, ease, loop, cardWidth, autoplayDelay, mobileScale });
  configRef.current = { count: data.length, depth, spread, tilt, tiltDirection, visibleCards, falloff, blur, duration, ease, loop, cardWidth, autoplayDelay, mobileScale };

  const layout = useCallback((position: number) => {
    const config = configRef.current;
    if (!config.count) return;
    const direction = config.tiltDirection === "left" ? -1 : 1;
    const scale = scaleRef.current;

    for (let index = 0; index < config.count; index += 1) {
      const card = cardRefs.current[index];
      if (!card) continue;
      let distance = index - position;
      if (config.loop && config.count > 1) {
        distance = ((distance % config.count) + config.count) % config.count;
        if (distance > config.count / 2) distance -= config.count;
      }

      const back = Math.max(0, distance);
      const shown = Math.abs(distance) <= config.visibleCards + 0.5;
      const translateZ = -config.depth * distance;
      const translateX = direction * config.spread * distance;
      const rotateY = direction * config.tilt * clamp(distance, 0, 1);
      const opacity = distance < 0 ? Math.max(0, 1 + distance) : shown ? 1 : 0;
      const brightness = Math.max(0.15, 1 - back * config.falloff);
      const blurAmount = config.blur > 0 ? Math.min(config.blur, (back / Math.max(1, config.visibleCards)) * config.blur) : 0;

      card.style.transform = `translate(-50%, -50%) scale(${scale}) translateX(${translateX.toFixed(2)}px) translateZ(${translateZ.toFixed(2)}px) rotateY(${rotateY.toFixed(3)}deg)`;
      card.style.opacity = opacity.toFixed(3);
      card.style.filter = brightness === 1 && blurAmount === 0
        ? "none"
        : `brightness(${brightness.toFixed(3)}) blur(${blurAmount.toFixed(2)}px)`;
      card.style.zIndex = String(Math.round(2000 - distance * 20));
      card.style.pointerEvents = shown && opacity > 0.05 ? "auto" : "none";

      const overlay = overlayRefs.current[index];
      if (overlay) overlay.style.opacity = clamp(back * config.falloff * 1.25, 0, 0.86).toFixed(3);
    }
  }, []);

  const animateTo = useCallback((target: number, animateTransition: boolean) => {
    tweenRef.current?.kill();
    const config = configRef.current;
    const proxy = { position: positionRef.current };
    tweenRef.current = gsap.to(proxy, {
      position: target,
      duration: animateTransition && !reducedMotionRef.current ? config.duration / 1000 : 0,
      ease: config.ease,
      onUpdate: () => {
        positionRef.current = proxy.position;
        layout(proxy.position);
      },
      onComplete: () => {
        if (config.count > 0) positionRef.current = ((positionRef.current % config.count) + config.count) % config.count;
        layout(positionRef.current);
      },
    });
  }, [layout]);

  const setFocus = useCallback((rawIndex: number, animateTransition = true) => {
    const config = configRef.current;
    if (!config.count) return;
    const index = config.loop ? ((rawIndex % config.count) + config.count) % config.count : clamp(rawIndex, 0, config.count - 1);
    let delta = index - positionRef.current;
    if (config.loop && config.count > 1) {
      delta = ((delta % config.count) + config.count) % config.count;
      if (delta > config.count / 2) delta -= config.count;
    }
    animateTo(positionRef.current + delta, animateTransition);
    if (index !== focusRef.current) {
      focusRef.current = index;
      setActive(index);
      onChangeRef.current?.(index, data[index]);
    }
  }, [animateTo, data]);

  const navigateBy = useCallback((step: number) => setFocus(focusRef.current + step), [setFocus]);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = rootRef.current;
    if (!root) return;
    const resizeObserver = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width ?? 0;
      const needed = configRef.current.cardWidth + Math.abs(configRef.current.spread) * 2 + 120;
      const mobileMultiplier = window.matchMedia("(max-width: 639px)").matches ? configRef.current.mobileScale : 1;
      scaleRef.current = clamp(width / needed, 0.4, 1) * mobileMultiplier;
      layout(positionRef.current);
    });
    resizeObserver.observe(root);
    const width = root.getBoundingClientRect().width;
    const needed = configRef.current.cardWidth + Math.abs(configRef.current.spread) * 2 + 120;
    const mobileMultiplier = window.matchMedia("(max-width: 639px)").matches ? configRef.current.mobileScale : 1;
    scaleRef.current = clamp(width / needed, 0.4, 1) * mobileMultiplier;
    layout(positionRef.current);
    return () => resizeObserver.disconnect();
  }, [layout, mobileScale]);

  useEffect(() => {
    layout(positionRef.current);
  }, [layout, cardWidth, cardHeight, depth, spread, tilt, tiltDirection, visibleCards, falloff, blur, data.length]);

  useEffect(() => {
    if (!autoplay || reducedMotionRef.current || data.length < 2) return;
    const root = rootRef.current;
    let hovered = false;
    let focused = false;
    const stop = () => {
      if (autoTimerRef.current !== null) window.clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    };
    const start = () => {
      stop();
      autoTimerRef.current = window.setInterval(() => {
        if (!hovered && !focused) navigateBy(1);
      }, Math.max(autoplayDelay, 600));
    };
    const onEnter = () => { hovered = true; };
    const onLeave = () => { hovered = false; };
    const onFocusIn = () => { focused = true; };
    const onFocusOut = () => { focused = false; };
    root?.addEventListener("mouseenter", onEnter);
    root?.addEventListener("mouseleave", onLeave);
    root?.addEventListener("focusin", onFocusIn);
    root?.addEventListener("focusout", onFocusOut);
    start();
    return () => {
      stop();
      root?.removeEventListener("mouseenter", onEnter);
      root?.removeEventListener("mouseleave", onLeave);
      root?.removeEventListener("focusin", onFocusIn);
      root?.removeEventListener("focusout", onFocusOut);
    };
  }, [autoplay, autoplayDelay, data.length, navigateBy]);

  useEffect(() => () => {
    tweenRef.current?.kill();
    if (wheelTimerRef.current !== null) window.clearTimeout(wheelTimerRef.current);
    if (autoTimerRef.current !== null) window.clearInterval(autoTimerRef.current);
  }, []);

  const onWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    if (data.length < 2) return;
    event.preventDefault();
    const raw = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    const step = clamp(raw / (configRef.current.cardWidth * 0.9), -0.6, 0.6);
    positionRef.current += step;
    layout(positionRef.current);
    if (wheelTimerRef.current !== null) window.clearTimeout(wheelTimerRef.current);
    wheelTimerRef.current = window.setTimeout(() => setFocus(Math.round(positionRef.current)), 130);
  }, [data.length, layout, setFocus]);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (data.length < 2) return;
    tweenRef.current?.kill();
    dragRef.current = { x: event.clientX, start: positionRef.current, lastX: event.clientX, lastTime: performance.now(), velocity: 0, moved: false, pointerId: event.pointerId };
  }, [data.length]);

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const stepPixels = Math.max(configRef.current.cardWidth * 0.55 * scaleRef.current, 40);
    const distance = event.clientX - drag.x;
    if (!drag.moved && Math.abs(distance) > 4) {
      drag.moved = true;
      event.currentTarget.setPointerCapture(drag.pointerId);
    }
    if (!drag.moved) return;
    const now = performance.now();
    drag.velocity = (event.clientX - drag.lastX) / Math.max(now - drag.lastTime, 1);
    drag.lastX = event.clientX;
    drag.lastTime = now;
    positionRef.current = drag.start - distance / stepPixels;
    layout(positionRef.current);
  }, [layout]);

  const onPointerEnd = useCallback(() => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    if (!drag.moved) return;
    const stepPixels = Math.max(configRef.current.cardWidth * 0.55 * scaleRef.current, 40);
    setFocus(Math.round(positionRef.current - (drag.velocity * 180) / stepPixels));
  }, [setFocus]);

  const onKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      navigateBy(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      navigateBy(1);
    }
  }, [navigateBy]);

  return (
    <div
      ref={rootRef}
      className={`depth-carousel ${className}`.trim()}
      style={{ "--dc-perspective": `${perspective}px` } as React.CSSProperties}
      role="group"
      aria-roledescription="carousel"
      aria-label="Fragrance carousel"
      tabIndex={0}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onKeyDown={onKeyDown}
    >
      <div className="depth-carousel__stage">
        {data.map((item, index) => (
          <div
            key={`${item.image}-${index}`}
            ref={element => { cardRefs.current[index] = element; }}
            className="depth-carousel__card"
            style={{ width: cardWidth, height: cardHeight, borderRadius: radius }}
            role="tabpanel"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${data.length}: ${item.alt || "Fragrance"}`}
            aria-hidden={active !== index}
            onClick={() => { if (!dragRef.current?.moved) setFocus(index); }}
          >
            <img className="depth-carousel__img" src={item.image} alt="" draggable={false} />
            <span ref={element => { overlayRefs.current[index] = element; }} className="depth-carousel__tint" style={{ background: tint }} />
            {item.productImage && <img className="depth-carousel__product" src={item.productImage} alt={item.alt || ""} draggable={false} />}
            {item.eyebrow && <span className="depth-carousel__badge">{item.eyebrow}</span>}
          </div>
        ))}
      </div>

      {showControls && data.length > 1 && <>
        <button type="button" className="depth-carousel__arrow depth-carousel__arrow--prev" aria-label="Previous fragrance" onClick={() => navigateBy(-1)}>‹</button>
        <button type="button" className="depth-carousel__arrow depth-carousel__arrow--next" aria-label="Next fragrance" onClick={() => navigateBy(1)}>›</button>
      </>}

      {showIndicators && data.length > 1 && <div className="depth-carousel__dots" role="tablist" aria-label="Fragrance slides">
        {data.map((item, index) => <button key={`${item.image}-dot`} type="button" role="tab" aria-label={`Go to fragrance ${index + 1}`} aria-selected={active === index} className={`depth-carousel__dot${active === index ? " is-active" : ""}`} onClick={() => setFocus(index)} />)}
      </div>}
    </div>
  );
}
