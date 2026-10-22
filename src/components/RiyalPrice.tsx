const RIYAL_SYMBOL_ASSET = "/fonts/saudi-riyal-symbol.png";

export function RiyalPrice({
  value,
  className = "",
  valueClassName = "",
  light = false,
}: {
  value: number | string;
  className?: string;
  valueClassName?: string;
  light?: boolean;
}) {
  const amount = String(value).replace(/^⃁\s*/, "");

  return (
    <span dir="ltr" className={`inline-flex items-baseline gap-1 whitespace-nowrap ${className}`}>
      <img
        src={RIYAL_SYMBOL_ASSET}
        alt=""
        aria-hidden="true"
        className={`inline-block h-[.8em] w-auto object-contain align-[-.08em] ${light ? "brightness-0 invert" : ""}`}
      />
      <span className={valueClassName}>{amount}</span>
    </span>
  );
}
