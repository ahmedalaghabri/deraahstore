import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEventHandler, type TouchEventHandler } from "react";

export type MobileSheetDragHandlers = {
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  onPointerMove: PointerEventHandler<HTMLDivElement>;
  onPointerUp: PointerEventHandler<HTMLDivElement>;
  onPointerCancel: PointerEventHandler<HTMLDivElement>;
  onTouchStart: TouchEventHandler<HTMLDivElement>;
  onTouchMove: TouchEventHandler<HTMLDivElement>;
  onTouchEnd: TouchEventHandler<HTMLDivElement>;
  onTouchCancel: TouchEventHandler<HTMLDivElement>;
};

type MobileSheetDragOptions = {
  enabled?: boolean;
  threshold?: number;
  maxOffset?: number;
};

export function useMobileSheetDrag(onClose: () => void, { enabled = true, threshold = 90, maxOffset = 220 }: MobileSheetDragOptions = {}) {
  const startYRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const inputRef = useRef<"pointer" | "touch" | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isSettling, setIsSettling] = useState(false);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    startYRef.current = null;
    offsetRef.current = 0;
    inputRef.current = null;
    setDragOffset(0);
    setIsSettling(false);
  }, []);

  useEffect(() => {
    if (!enabled) {
      clearCloseTimer();
      reset();
    }
    return clearCloseTimer;
  }, [clearCloseTimer, enabled, reset]);

  const beginDrag = useCallback((clientY: number, input: "pointer" | "touch") => {
    if (!enabled || inputRef.current) return;
    clearCloseTimer();
    setIsSettling(false);
    inputRef.current = input;
    startYRef.current = clientY;
    offsetRef.current = 0;
  }, [clearCloseTimer, enabled]);

  const moveDrag = useCallback((clientY: number, preventDefault: () => void) => {
    if (startYRef.current === null) return;
    const delta = clientY - startYRef.current;
    if (delta <= 0) {
      offsetRef.current = 0;
      setDragOffset(0);
      return;
    }
    const nextOffset = Math.min(delta, maxOffset);
    offsetRef.current = nextOffset;
    setDragOffset(nextOffset);
    if (delta > 6) preventDefault();
  }, [maxOffset]);

  const endDrag = useCallback((input: "pointer" | "touch", releasePointer?: () => void) => {
    if (startYRef.current === null || inputRef.current !== input) return;
    const shouldClose = offsetRef.current > threshold;
    startYRef.current = null;
    offsetRef.current = 0;
    inputRef.current = null;
    releasePointer?.();

    setIsSettling(true);
    setDragOffset(shouldClose ? Math.max(window.innerHeight, maxOffset * 3) : 0);
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setIsSettling(false);
      setDragOffset(0);
      if (shouldClose) onClose();
    }, 280);
  }, [clearCloseTimer, maxOffset, onClose, threshold]);

  const onPointerDown: PointerEventHandler<HTMLDivElement> = useCallback(event => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    beginDrag(event.clientY, "pointer");
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    } catch {
      // Pointer capture is optional on older embedded browsers.
    }
  }, [beginDrag]);
  const onPointerMove: PointerEventHandler<HTMLDivElement> = useCallback(event => moveDrag(event.clientY, event.preventDefault), [moveDrag]);
  const onPointerEnd: PointerEventHandler<HTMLDivElement> = useCallback(event => endDrag("pointer", () => {
    try {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    } catch {
      // The pointer may already have been released by the browser.
    }
  }), [endDrag]);
  const onTouchStart: TouchEventHandler<HTMLDivElement> = useCallback(event => {
    const touch = event.touches[0];
    if (touch) beginDrag(touch.clientY, "touch");
  }, [beginDrag]);
  const onTouchMove: TouchEventHandler<HTMLDivElement> = useCallback(event => {
    const touch = event.touches[0];
    if (touch) moveDrag(touch.clientY, event.preventDefault.bind(event));
  }, [moveDrag]);
  const onTouchEnd: TouchEventHandler<HTMLDivElement> = useCallback(() => endDrag("touch"), [endDrag]);

  const dragHandlers: MobileSheetDragHandlers = {
    onPointerDown,
    onPointerMove,
    onPointerUp: onPointerEnd,
    onPointerCancel: onPointerEnd,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel: onTouchEnd,
  };
  const dragStyle: CSSProperties | undefined = dragOffset > 0 || isSettling
    ? { animation: "none", transform: `translateY(${dragOffset}px)`, transition: isSettling ? "transform 280ms cubic-bezier(.22, 1, .36, 1)" : "none", willChange: "transform" }
    : undefined;

  return { dragOffset, dragHandlers, dragStyle };
}

export function MobileSheetHandle({ dragHandlers, className = "" }: { dragHandlers?: MobileSheetDragHandlers; className?: string }) {
  return <div aria-hidden="true" {...dragHandlers} className={`store-mobile-sheet-handle mx-auto flex h-7 w-16 items-center justify-center md:hidden ${className}`}><span className="block h-1 w-10 rounded-full bg-[#d8dde2]" /></div>;
}
