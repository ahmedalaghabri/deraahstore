// React Bits PromptBar adapted for the storefront's Ask AI panel.
// @ts-nocheck

import { isValidElement, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  Attachment01Icon,
  Cancel01Icon,
  File02Icon,
  Globe02Icon,
  Mic01Icon,
  PlusSignIcon,
  SparklesIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import "./PromptBar.css";

const ARROW_UP = [12, 4.5, 18.5, 11, 14.25, 11, 14.25, 19.5, 9.75, 19.5, 9.75, 11, 5.5, 11];
const SQUARE = [12, 6, 18, 6, 18, 18, 6, 18, 6, 6, 18, 6, 18, 18];
const EASE_IN_OUT = [0.77, 0, 0.175, 1];

const DEFAULT_SOURCES = [
  { key: "files", name: "Photos & files", description: "Upload from this device", icon: Attachment01Icon, attach: true },
  { key: "web", name: "Web search", description: "Live results", icon: Globe02Icon },
];
const DEFAULT_COMMANDS = [{ key: "summarize", name: "/summarize", description: "Digest the thread so far" }];
const DEFAULT_MODELS = [{ key: "nova-3", name: "Nova 3", tag: "Flagship" }];
const DEFAULT_EFFORTS = ["Low", "Medium", "High", "Max"];

const mix = (a, b, t) => a + (b - a) * t;
const pathAt = (a, b, t) => {
  let path = "";
  for (let index = 0; index < a.length; index += 2) {
    path += `${index ? "L" : "M"}${mix(a[index], b[index], t).toFixed(2)} ${mix(a[index + 1], b[index + 1], t).toFixed(2)}`;
  }
  return `${path}Z`;
};

const parseToken = draft => {
  const match = /(^|\s)([@/])([\w-]*)$/.exec(draft);
  if (!match) return null;
  return { kind: match[2] === "@" ? "at" : "slash", query: match[3].toLowerCase(), start: match.index + match[1].length };
};

const renderIcon = (icon, size) => (isValidElement(icon) ? icon : <HugeiconsIcon icon={icon} size={size} strokeWidth={1.8} />);

function SendGlyph({ busy, morphDuration = 240, squash = 0.12, tilt = 8 }) {
  const reduce = useReducedMotion();
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const t = useMotionValue(busy ? 1 : 0);
  const direction = useRef(busy ? 1 : -1);

  useEffect(() => {
    const target = busy ? 1 : 0;
    direction.current = busy ? 1 : -1;
    if (t.get() === target) return undefined;
    const controls = animate(t, target, reduce ? { duration: 0 } : { duration: morphDuration / 1000, ease: EASE_IN_OUT });
    return () => controls.stop();
  }, [busy, morphDuration, reduce, t]);

  useMotionValueEvent(t, "change", value => {
    pathRef.current?.setAttribute("d", pathAt(ARROW_UP, SQUARE, value));
    const goo = reduce ? 0 : Math.sin(value * Math.PI);
    const scaleX = 1 - squash * goo;
    if (svgRef.current) svgRef.current.style.transform = goo ? `rotate(${direction.current * tilt * goo}deg) scale(${scaleX}, ${1 / scaleX})` : "";
  });

  return <svg ref={svgRef} className="prompt-bar__glyph" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path ref={pathRef} d={pathAt(ARROW_UP, SQUARE, t.get())} /></svg>;
}

export default function PromptBar({
  value,
  onValueChange,
  placeholder = "Ask anything",
  sources = DEFAULT_SOURCES,
  commands = DEFAULT_COMMANDS,
  models = DEFAULT_MODELS,
  defaultModel = "",
  efforts = DEFAULT_EFFORTS,
  defaultEffort = "",
  onEffortChange,
  busy = false,
  onSend,
  onStop,
  onAttach,
  onDictate,
  background = "#27272a",
  color = "#f5f5f5",
  menuBackground = "#323236",
  sparkColor = "#b39dff",
  width = 400,
  radius = 16,
  maxRows = 5,
  morphDuration = 240,
  squash = 0.12,
  tilt = 8,
  pressScale = 0.96,
  className = "",
  ariaLabel = "Prompt",
}) {
  const reduce = useReducedMotion();
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const typing = useRef({ energy: 0, strokes: 0 });
  const sparkRef = useRef(null);
  const [draft, setDraft] = useState(value ?? "");
  const [attachments, setAttachments] = useState([]);
  const [modelKey, setModelKey] = useState(defaultModel);
  const [openMenu, setOpenMenu] = useState(null);
  const [effortIndex, setEffortIndex] = useState(() => {
    const index = efforts.indexOf(defaultEffort);
    return index >= 0 ? index : Math.max(0, Math.floor((efforts.length - 1) / 2));
  });
  const [active, setActive] = useState(0);
  const [listening, setListening] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (value !== undefined && value !== draft) setDraft(value);
  }, [value]);

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "0px";
    const maximum = 22 * maxRows;
    input.style.height = `${Math.min(input.scrollHeight, maximum)}px`;
    input.style.overflowY = input.scrollHeight > maximum ? "auto" : "hidden";
  }, [draft, maxRows]);

  useEffect(() => {
    if (!openMenu) return undefined;
    const close = event => {
      if (!rootRef.current?.contains(event.target)) setOpenMenu(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [openMenu]);

  useEffect(() => {
    const canvas = sparkRef.current;
    if (!canvas || !efforts.length || effortIndex !== efforts.length - 1 || reduce) return undefined;
    const context = canvas.getContext("2d");
    if (!context) return undefined;
    let frame = 0;
    let widthValue = 0;
    let heightValue = 0;
    const particles = [];
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      widthValue = rect.width;
      heightValue = rect.height;
      canvas.width = Math.round(widthValue * dpr);
      canvas.height = Math.round(heightValue * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const spawn = () => particles.push({ x: Math.random() * widthValue, y: heightValue + 2, r: 1 + Math.random(), vy: 7 + Math.random() * 8, phase: Math.random() * 6.28, life: 0, span: 2 + Math.random() * 2 });
    const tick = now => {
      context.clearRect(0, 0, widthValue, heightValue);
      if (particles.length < 24) spawn();
      context.fillStyle = sparkColor;
      context.shadowColor = sparkColor;
      context.shadowBlur = 8;
      particles.forEach((particle, index) => {
        particle.life += 1 / 60;
        particle.y -= particle.vy / 60;
        if (particle.life > particle.span || particle.y < -4) particles.splice(index, 1);
        else {
          context.globalAlpha = Math.sin((particle.life / particle.span) * Math.PI) * 0.7;
          context.beginPath();
          context.arc(particle.x + Math.sin(now / 800 + particle.phase) * 6, particle.y, particle.r, 0, Math.PI * 2);
          context.fill();
        }
      });
      frame = requestAnimationFrame(tick);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); context.clearRect(0, 0, widthValue, heightValue); };
  }, [effortIndex, efforts.length, reduce, sparkColor]);

  const model = models.find(item => item.key === modelKey) ?? models[0];
  const token = parseToken(draft);
  const query = token?.query ?? "";
  const list = useMemo(() => {
    if (openMenu === "at") return sources.filter(item => item.name.toLowerCase().includes(query));
    if (openMenu === "slash") return commands.filter(item => item.name.replace(/^\//, "").toLowerCase().startsWith(query));
    if (openMenu === "model") return models;
    return [];
  }, [commands, models, openMenu, query, sources]);
  const canSend = draft.trim().length > 0 || attachments.length > 0;
  const armed = busy || canSend;
  const effort = efforts[effortIndex] ?? "";

  const updateDraft = next => {
    setDraft(next);
    onValueChange?.(next);
    typing.current.energy = Math.min(1.6, typing.current.energy + 0.22);
    typing.current.strokes += 1;
  };
  const focusInput = () => inputRef.current?.focus({ preventScroll: true });
  const closeMenu = () => setOpenMenu(null);
  const pick = row => {
    if (openMenu === "model") {
      setModelKey(row.key);
      closeMenu();
      focusInput();
      return;
    }
    const head = token ? draft.slice(0, token.start) : draft;
    if (row.attach) {
      updateDraft(head);
      Promise.resolve(onAttach?.()).then(files => {
        if (files) setAttachments(current => [...current, ...(Array.isArray(files) ? files : [files])]);
      });
    } else if (openMenu === "at") updateDraft(`${head}@${row.name} `);
    else updateDraft(`${head}${row.name} `);
    closeMenu();
    focusInput();
  };
  const send = () => {
    if (!canSend || busy) return;
    onSend?.(draft.trim(), { attachments, model, effort });
    updateDraft("");
    setAttachments([]);
    closeMenu();
    focusInput();
  };
  const onKeyDown = event => {
    if (openMenu && list.length && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      event.preventDefault();
      setActive(current => (current + (event.key === "ArrowDown" ? 1 : list.length - 1)) % list.length);
      return;
    }
    if (openMenu && list.length && (event.key === "Enter" || event.key === "Tab")) {
      event.preventDefault();
      pick(list[Math.min(active, list.length - 1)]);
      return;
    }
    if (event.key === "Escape") {
      closeMenu();
      return;
    }
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  };

  return <div ref={rootRef} className={`prompt-bar${className ? ` ${className}` : ""}`} data-busy={busy ? "" : undefined} style={{ "--pb-bg": background, "--pb-ink": color, "--pb-menu": menuBackground, "--pb-w": `${width}px`, "--pb-radius": `${radius}px`, "--pb-spark": sparkColor, "--pb-press": pressScale }}>
    {openMenu && <div className="prompt-bar__menu" data-kind={openMenu} role="listbox">
      {list.map((row, index) => <button key={row.key} type="button" role="option" aria-selected={index === active} className="prompt-bar__row" onMouseDown={event => event.preventDefault()} onPointerEnter={() => setActive(index)} onClick={() => pick(row)}>
        {openMenu === "at" && <span className="prompt-bar__row-icon">{renderIcon(row.icon, 15)}</span>}
        <span className="prompt-bar__row-name">{row.name}</span><span className="prompt-bar__row-desc">{row.description}</span>
        {openMenu === "model" && <><span className="prompt-bar__row-tag">{row.tag}</span><span className="prompt-bar__row-check" data-on={row.key === model?.key ? "" : undefined}><HugeiconsIcon icon={Tick02Icon} size={13} strokeWidth={2.5} /></span></>}
      </button>)}
      {list.length === 0 && <div className="prompt-bar__empty">No matches for “{query}”</div>}
    </div>}
    <div className="prompt-bar__field" onClick={focusInput}>
      <canvas ref={sparkRef} className="prompt-bar__sparks" aria-hidden="true" />
      {attachments.length > 0 && <div className="prompt-bar__chips">{attachments.map((file, index) => <span key={`${file}-${index}`} className="prompt-bar__chip"><HugeiconsIcon icon={File02Icon} size={12} strokeWidth={2} /><span className="prompt-bar__chip-name">{file}</span><button type="button" className="prompt-bar__chip-x" aria-label={`Remove ${file}`} onClick={event => { event.stopPropagation(); setAttachments(current => current.filter((_, itemIndex) => itemIndex !== index)); }}><HugeiconsIcon icon={Cancel01Icon} size={10} strokeWidth={2.5} /></button></span>)}</div>}
      <textarea ref={inputRef} className="prompt-bar__input" rows={1} value={draft} placeholder={listening ? "Listening…" : placeholder} aria-label={ariaLabel} onChange={event => { updateDraft(event.target.value); if (event.target.value.startsWith("@")) { setOpenMenu("at"); setActive(0); } else if (event.target.value.startsWith("/")) { setOpenMenu("slash"); setActive(0); } }} onFocus={closeMenu} onKeyDown={onKeyDown} />
      <div className="prompt-bar__bar">
        {sources.length > 0 && <button type="button" className="prompt-bar__tool" aria-label="Add files and sources" aria-expanded={openMenu === "at"} onMouseDown={event => event.preventDefault()} onClick={() => { setActive(0); setOpenMenu(openMenu === "at" ? null : "at"); focusInput(); }}><HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={2} /></button>}
        {models.length > 0 && <button type="button" className="prompt-bar__pick" aria-label="Choose model" aria-expanded={openMenu === "model"} onMouseDown={event => event.preventDefault()} onClick={() => { setActive(Math.max(0, models.indexOf(model))); setOpenMenu(openMenu === "model" ? null : "model"); focusInput(); }}><span>{model?.name}</span><HugeiconsIcon icon={ArrowDown01Icon} size={12} strokeWidth={2.4} /></button>}
        {efforts.length > 0 && <button type="button" className="prompt-bar__pick" aria-label="Choose effort" onMouseDown={event => event.preventDefault()} onClick={() => { const next = (effortIndex + 1) % efforts.length; setEffortIndex(next); onEffortChange?.(efforts[next]); }}><HugeiconsIcon icon={SparklesIcon} size={13} strokeWidth={2} /><span>{effort}</span></button>}
        <span className="prompt-bar__spacer" />
        {onDictate && <button type="button" className="prompt-bar__tool" aria-label={listening ? "Stop dictation" : "Dictate"} aria-pressed={listening} onMouseDown={event => event.preventDefault()} onClick={() => { if (listening) { setListening(false); return; } setListening(true); Promise.resolve(onDictate()).then(text => { setListening(false); if (text) updateDraft(draft.trim() ? `${draft.trimEnd()} ${text}` : text); }); }}><HugeiconsIcon icon={Mic01Icon} size={15} strokeWidth={2} /></button>}
        <button type="button" className="prompt-bar__send" disabled={!armed} aria-label={busy ? "Stop" : "Send"} data-armed={armed ? "" : undefined} data-pressed={pressed ? "" : undefined} onMouseDown={event => event.preventDefault()} onPointerDown={() => setPressed(true)} onPointerUp={() => setPressed(false)} onPointerCancel={() => setPressed(false)} onPointerLeave={() => setPressed(false)} onClick={() => busy ? onStop?.() : send()}><SendGlyph busy={busy} morphDuration={morphDuration} squash={squash} tilt={tilt} /></button>
      </div>
    </div>
  </div>;
}
