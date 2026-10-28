import { motion, useReducedMotion } from "motion/react";

type BlurTextProps = {
  text: string;
  className?: string;
  delay?: number;
};

export default function BlurText({ text, className = "", delay = 0 }: BlurTextProps) {
  const reduced = useReducedMotion();

  return (
    <span className={`blur-text ${className}`.trim()} aria-label={text}>
      {text.split(" ").map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          aria-hidden="true"
          initial={reduced ? false : { opacity: 0, filter: "blur(10px)", y: 14 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: .7, delay: delay + index * .055, ease: [.22, 1, .36, 1] }}
          className="inline-block"
        >
          {word}{index < text.split(" ").length - 1 ? "\u00a0" : ""}
        </motion.span>
      ))}
    </span>
  );
}
