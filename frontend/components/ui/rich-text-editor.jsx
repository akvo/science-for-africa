"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Check,
  ChevronDown,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Block-level text styles exposed by the toolbar dropdown. `value` is the
 * HTML tag passed to `document.execCommand("formatBlock", ...)`.
 */
const TEXT_STYLES = [
  { value: "P", label: "Normal text" },
  { value: "H1", label: "Heading 1" },
  { value: "H2", label: "Heading 2" },
  { value: "H3", label: "Heading 3" },
  { value: "BLOCKQUOTE", label: "Quote" },
  { value: "PRE", label: "Code" },
];

function runCommand(cmd, value) {
  if (typeof document === "undefined") return;
  document.execCommand(cmd, false, value);
}

/**
 * RichTextEditor — reusable contentEditable-based editor with a toolbar
 * for bold / italic / link / list / block-style formatting.
 *
 * Emits HTML via `onChange`. Pair with `sanitizeHtml` (see
 * `@/lib/sanitize-html`) when rendering the stored value back to users.
 *
 * Props:
 *   value            — current HTML string (controlled)
 *   onChange(html)   — fired on every input
 *   onKeyDown        — forwarded to the editor surface (for submit hotkeys)
 *   placeholder      — shown when the editor is empty
 *   minHeight        — CSS min-height (number = px, or string)
 *   className        — wrapper classes
 *   editorClassName  — classes for the editable surface
 *   toolbarExtras    — additional nodes rendered at the end of the toolbar
 */
export function RichTextEditor({
  value = "",
  onChange,
  onKeyDown,
  placeholder = "Write a message...",
  minHeight = 96,
  className,
  editorClassName,
  toolbarExtras,
}) {
  const editorRef = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [activeBlock, setActiveBlock] = useState("P");

  // Sync the editor DOM with the controlled `value` when the parent resets
  // it (e.g. after submitting). We avoid rewriting the DOM while the user
  // is typing because that collapses the caret.
  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== (value || "")) {
      editorRef.current.innerHTML = value || "";
    }
    // We update the placeholder state when the value changes from outside
    // using a simple frame defer to avoid the ESLint warning while ensuring
    // the UI stays in sync.
    requestAnimationFrame(() => {
      if (!editorRef.current) return;
      const text = editorRef.current.innerText || "";
      setIsEmpty(text.trim().length === 0);
    });
  }, [value]);

  const emit = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    setIsEmpty((el.innerText || "").trim().length === 0);
    onChange?.(el.innerHTML);
  }, [onChange]);

  const focusEditor = () => editorRef.current?.focus();

  const handleBold = () => {
    focusEditor();
    runCommand("bold");
    emit();
  };

  const handleItalic = () => {
    focusEditor();
    runCommand("italic");
    emit();
  };

  const handleBulletList = () => {
    focusEditor();
    runCommand("insertUnorderedList");
    emit();
  };

  const handleOrderedList = () => {
    focusEditor();
    runCommand("insertOrderedList");
    emit();
  };

  const handleBlock = (tag) => {
    focusEditor();
    runCommand("formatBlock", `<${tag.toLowerCase()}>`);
    setActiveBlock(tag);
    emit();
  };

  const handleLink = () => {
    focusEditor();
    const url = window.prompt("Enter URL");
    if (!url) return;
    runCommand("createLink", url);
    // Ensure the newly created anchor opens safely in a new tab.
    const anchors = editorRef.current?.querySelectorAll("a") || [];
    anchors.forEach((a) => {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer nofollow");
    });
    emit();
  };

  // Strip formatting when pasting so users don't smuggle in disallowed
  // markup (styles, scripts, fonts from Word, etc.).
  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData?.getData("text/plain") || "";
    runCommand("insertText", text);
    emit();
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-brand-gray-100 bg-white",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-brand-gray-100 px-3 py-2">
        <TextStyleDropdown value={activeBlock} onChange={handleBlock} />
        <ToolbarButton icon={Bold} label="Bold" onClick={handleBold} />
        <ToolbarButton icon={Italic} label="Italic" onClick={handleItalic} />
        <ToolbarButton icon={LinkIcon} label="Link" onClick={handleLink} />
        <ToolbarButton
          icon={List}
          label="Bullet list"
          onClick={handleBulletList}
        />
        <ToolbarButton
          icon={ListOrdered}
          label="Numbered list"
          onClick={handleOrderedList}
        />
        {toolbarExtras}
      </div>

      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          role="textbox"
          aria-multiline="true"
          onInput={emit}
          onKeyDown={onKeyDown}
          onPaste={handlePaste}
          suppressContentEditableWarning
          style={{
            minHeight:
              typeof minHeight === "number" ? `${minHeight}px` : minHeight,
          }}
          className={cn(
            "prose-sm max-w-none break-words px-4 py-3 text-sm text-brand-gray-900 outline-none",
            "[&_a]:text-primary-500 [&_a]:underline",
            "[&_ul]:ml-5 [&_ul]:list-disc [&_ol]:ml-5 [&_ol]:list-decimal",
            "[&_h1]:text-lg [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold",
            "[&_blockquote]:border-l-2 [&_blockquote]:border-brand-gray-200 [&_blockquote]:pl-3 [&_blockquote]:text-brand-gray-600",
            "[&_pre]:rounded-md [&_pre]:bg-brand-gray-50 [&_pre]:p-2 [&_pre]:font-mono [&_pre]:text-xs",
            editorClassName,
          )}
        />
        {isEmpty ? (
          <div className="pointer-events-none absolute left-4 top-3 text-sm text-brand-gray-400">
            {placeholder}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ToolbarButton({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      onMouseDown={(e) => e.preventDefault()} // keep editor selection alive
      onClick={onClick}
      className="inline-flex size-7 items-center justify-center rounded-md text-brand-gray-500 hover:bg-brand-gray-50"
    >
      <Icon className="size-4" />
    </button>
  );
}

function TextStyleDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const active = TEXT_STYLES.find((s) => s.value === value) || TEXT_STYLES[0];

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-brand-gray-600 hover:bg-brand-gray-50"
      >
        {active.label}
        <ChevronDown
          className={cn(
            "size-3 transition-transform",
            open ? "rotate-180" : "",
          )}
        />
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-lg border border-brand-gray-100 bg-white py-1 shadow-lg">
          {TEXT_STYLES.map((s) => {
            const isActive = s.value === value;
            return (
              <button
                key={s.value}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(s.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-brand-gray-50",
                  isActive
                    ? "font-medium text-primary-500"
                    : "text-brand-gray-700",
                )}
              >
                <span>{s.label}</span>
                {isActive ? <Check className="size-4" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
