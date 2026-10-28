import { useRef, type CSSProperties, type ReactNode } from "react";
import "./SpotlightCard.css";

type SpotlightCardProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export default function SpotlightCard({ children, className = "", style }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const updateSpotlight = (event: React.PointerEvent<HTMLDivElement>) => {
    const element = ref.current;
    if (!element || event.pointerType === "touch") return;
    const rect = element.getBoundingClientRect();
    element.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
    element.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
  };

  return (
    <div ref={ref} className={`spotlight-card ${className}`.trim()} style={style} onPointerMove={updateSpotlight}>
      <span className="spotlight-card__light" aria-hidden="true" />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
