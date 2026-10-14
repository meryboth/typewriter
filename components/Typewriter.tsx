"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const STORAGE_KEY = "typewriter:draft";
const THEME_KEY = "typewriter:theme";

const MACHINE_KEY = "typewriter:machine";
const MACHINE_OFF_KEY = "typewriter:machine-off";

type Theme = "dark" | "light";

const MACHINE_STYLES = ["negra", "crema", "menta", "roja", "celeste"] as const;
type MachineStyle = (typeof MACHINE_STYLES)[number];

function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}
// Gap between the line being typed and the paper bail.
const TYPE_LINE_GAP = 10;

function buildFilename(text: string) {
  const firstLine = text.split("\n").find((l) => l.trim() !== "") ?? "";
  const slug = firstLine
    .replace(/^#+\s*/, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const date = new Date().toISOString().slice(0, 10);
  return `${slug || `texto-${date}`}.md`;
}

export default function Typewriter() {
  const [text, setText] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [machineStyle, setMachineStyle] = useState<MachineStyle>("negra");
  const [machineOff, setMachineOff] = useState(false);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const machineRef = useRef<HTMLDivElement>(null);

  // Keep the line with the caret right above the paper bail, like a real carriage.
  const alignCaret = useCallback((smooth: boolean) => {
    const textarea = textareaRef.current;
    const mirror = mirrorRef.current;
    const scroller = scrollerRef.current;
    const machine = machineRef.current;
    if (!textarea || !mirror || !scroller || !machine) return;

    mirror.textContent = textarea.value.slice(0, textarea.selectionEnd);
    const marker = document.createElement("span");
    marker.textContent = "​";
    mirror.appendChild(marker);
    const caretTop = marker.offsetTop;
    const lineHeight = marker.offsetHeight;

    const caretViewportY = textarea.getBoundingClientRect().top + caretTop;
    const targetY = machine.getBoundingClientRect().top - lineHeight - TYPE_LINE_GAP;
    const delta = caretViewportY - targetY;
    if (Math.abs(delta) < 1) return;
    scroller.scrollBy({ top: delta, behavior: smooth ? "smooth" : "auto" });
  }, []);

  // Load the saved draft once on mount.
  useEffect(() => {
    try {
      setText(localStorage.getItem(STORAGE_KEY) ?? "");
      if (localStorage.getItem(THEME_KEY) === "light") setTheme("light");
      const savedStyle = localStorage.getItem(MACHINE_KEY);
      if (MACHINE_STYLES.includes(savedStyle as MachineStyle)) setMachineStyle(savedStyle as MachineStyle);
      setMachineOff(localStorage.getItem(MACHINE_OFF_KEY) === "1");
    } catch {}
    setLoaded(true);
    // Resume writing where the draft left off.
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      alignCaret(false);
    });
  }, [alignCaret]);

  // Autosave (debounced).
  useEffect(() => {
    if (!loaded) return;
    const id = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, text);
      } catch {}
    }, 300);
    return () => clearTimeout(id);
  }, [text, loaded]);

  // Grow the textarea with its content, then re-align.
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
    alignCaret(loaded);
  }, [text, loaded, alignCaret]);

  // Re-align when the caret moves (arrows, clicks) or the window changes size.
  useEffect(() => {
    const onSelection = () => {
      if (document.activeElement === textareaRef.current) alignCaret(true);
    };
    const onResize = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
      alignCaret(false);
    };
    document.addEventListener("selectionchange", onSelection);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("selectionchange", onSelection);
      window.removeEventListener("resize", onResize);
    };
  }, [alignCaret]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const exportMarkdown = useCallback(() => {
    const value = textareaRef.current?.value ?? "";
    const blob = new Blob([value], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = buildFilename(value);
    a.click();
    URL.revokeObjectURL(url);
    textareaRef.current?.focus();
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {}
    textareaRef.current?.focus();
  }, []);

  const newSheet = useCallback(() => {
    if (text.trim() && !window.confirm("¿Empezar una hoja nueva? El texto actual se borrará (exportalo antes si querés guardarlo).")) {
      textareaRef.current?.focus();
      return;
    }
    setText("");
    scrollerRef.current?.scrollTo({ top: 0 });
    textareaRef.current?.focus();
  }, [text]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      save(THEME_KEY, next);
      return next;
    });
    textareaRef.current?.focus();
  }, []);

  const nextMachineStyle = useCallback(() => {
    setMachineStyle((current) => {
      const next = MACHINE_STYLES[(MACHINE_STYLES.indexOf(current) + 1) % MACHINE_STYLES.length];
      save(MACHINE_KEY, next);
      return next;
    });
    textareaRef.current?.focus();
  }, []);

  const toggleMachine = useCallback(() => {
    setMachineOff((current) => {
      save(MACHINE_OFF_KEY, current ? "0" : "1");
      return !current;
    });
    textareaRef.current?.focus();
  }, []);

  // Keyboard shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        exportMarkdown();
      } else if (mod && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exportMarkdown, toggleFullscreen]);

  // Controls fade away while typing and come back when the mouse moves.
  useEffect(() => {
    const show = () => setTyping(false);
    window.addEventListener("mousemove", show);
    return () => window.removeEventListener("mousemove", show);
  }, []);

  return (
    <main
      className={`desk${typing ? " is-typing" : ""}${machineOff ? " machine-off" : ""}`}
      data-theme={theme}
      data-machine={machineStyle}
    >
      <div className="platen" aria-hidden>
        <span className="knob knob-left" />
        <span className="knob knob-right" />
      </div>

      <div
        className="scroller"
        ref={scrollerRef}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            e.preventDefault();
            textareaRef.current?.focus();
          }
        }}
      >
        <div className="paper">
          <div className="type-area">
            <div className="type-text mirror" ref={mirrorRef} aria-hidden />
            <textarea
              ref={textareaRef}
              className="type-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.altKey) setTyping(true);
              }}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="sentences"
              placeholder="Empezá a escribir..."
              aria-label="Texto"
              rows={1}
            />
          </div>
        </div>
      </div>

      <div className="machine" ref={machineRef}>
        <div className="bail" aria-hidden>
          <span className="bail-roller" />
          <span className="bail-roller" />
        </div>
        <div className="controls">
          <button className="key" onClick={newSheet} title="Hoja nueva" aria-label="Hoja nueva">
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <button className="key" onClick={exportMarkdown} title="Descargar .md (Ctrl+S)" aria-label="Descargar .md">
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
            </svg>
          </button>
          <button
            className="key"
            onClick={toggleFullscreen}
            title="Pantalla completa (Ctrl+Shift+F)"
            aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              {isFullscreen ? (
                <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
              ) : (
                <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
              )}
            </svg>
          </button>
          <button
            className="key"
            onClick={toggleTheme}
            title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
            aria-label={theme === "dark" ? "Modo claro" : "Modo oscuro"}
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              {theme === "dark" ? (
                <>
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
                </>
              ) : (
                <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
              )}
            </svg>
          </button>
          {!machineOff && (
            <button
              className="key"
              onClick={nextMachineStyle}
              title={`Estilo de máquina: ${machineStyle}`}
              aria-label={`Cambiar estilo de máquina (actual: ${machineStyle})`}
            >
              <span className="swatch" />
            </button>
          )}
          <button
            className="key"
            onClick={toggleMachine}
            title={machineOff ? "Mostrar la máquina" : "Ocultar la máquina"}
            aria-label={machineOff ? "Mostrar la máquina" : "Ocultar la máquina"}
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              {machineOff ? (
                <>
                  <rect x="3" y="7" width="18" height="11" rx="2" />
                  <path d="M7 11h.01M11 11h.01M15 11h.01M8 14.5h8" />
                </>
              ) : (
                <>
                  <path d="M6 3h9l4 4v14H6z" />
                  <path d="M9 11h7M9 15h7" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
}
