"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bold, Italic, Undo2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const COLOR_OPTIONS = [
  { value: "#9E3333", label: "Tyr" },
  { value: "#9E4FE3", label: "Sonya" },
  { value: "#FF5F15", label: "Jeshaay" },
  { value: "#3BB3B5", label: "Jeshaay (Zoan)" },
  { value: "#DEB887", label: "Lem" },
  { value: "#990099", label: "Nico Eliza" },
  { value: "#BD0202", label: "Velvet" },
  { value: "#EB635C", label: "Loreleï" },
  { value: "#DBA029", label: "PNJ - Civil" },
  { value: "#EB2F2F", label: "PNJ - Pirate" },
  { value: "#3774ED", label: "PNJ - Marine" },
  { value: "#24C6E3", label: "PNJ - Cipher Pol" },
  { value: "#9E4FE3", label: "PNJ - Corsaire" },
  { value: "#2ABD53", label: "PNJ - Chasseur de primes" },
  { value: "#754D70", label: "PNJ - Atout révolutionnaire" },
  { value: "#998997", label: "PNJ - Révolutionnaire" },
];

interface TextColorEditorProps {
  value: string;
  onChange: (value: string) => void;
  withoutColor?: boolean;
}

export default function TextColorEditor({
  value,
  onChange,
  withoutColor = false,
}: TextColorEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const originalValueRef = useRef(value);
  const isInternalUpdate = useRef(false);
  const [selectKey, setSelectKey] = useState(0);
  const [history, setHistory] = useState<string[]>([]);

  // Set initial content
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
      originalValueRef.current = value;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync external value changes (e.g. loading a save)
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (
      sel &&
      sel.rangeCount > 0 &&
      !sel.isCollapsed &&
      editorRef.current?.contains(sel.getRangeAt(0).commonAncestorContainer)
    ) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const emitChange = useCallback(() => {
    if (!editorRef.current) return;
    isInternalUpdate.current = true;
    onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const handleInput = useCallback(() => {
    emitChange();
  }, [emitChange]);

  const undo = useCallback(() => {
    const prev = history;
    const restored =
      prev.length > 0 ? prev[prev.length - 1] : originalValueRef.current;
    if (editorRef.current) {
      editorRef.current.innerHTML = restored;
      isInternalUpdate.current = true;
      onChange(restored);
    }
    setHistory(prev.length > 0 ? prev.slice(0, -1) : []);
  }, [onChange, history]);

  const getActiveRange = useCallback((): Range | null => {
    const sel = window.getSelection();
    if (
      sel &&
      sel.rangeCount > 0 &&
      !sel.isCollapsed &&
      editorRef.current?.contains(sel.getRangeAt(0).commonAncestorContainer)
    ) {
      return sel.getRangeAt(0);
    }
    return savedRangeRef.current;
  }, []);

  const applyStyle = useCallback(
    (styleProps: Record<string, string>) => {
      const editor = editorRef.current;
      if (!editor) return;

      const range = getActiveRange();
      if (!range || range.collapsed) return;

      // Save state for undo
      setHistory((prev) => [...prev, editor.innerHTML]);

      // Restore selection if needed
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }

      const selectedText = range.toString();
      const parentEl = range.commonAncestorContainer.parentElement;

      // If the entire content of a styled span is selected, merge styles
      if (
        parentEl &&
        parentEl !== editor &&
        parentEl.tagName === "SPAN" &&
        parentEl.hasAttribute("style") &&
        selectedText === parentEl.textContent
      ) {
        for (const [prop, val] of Object.entries(styleProps)) {
          parentEl.style.setProperty(prop, val);
        }
      } else {
        // Wrap in a new span
        const span = document.createElement("span");
        for (const [prop, val] of Object.entries(styleProps)) {
          span.style.setProperty(prop, val);
        }
        try {
          range.surroundContents(span);
        } catch {
          // Selection crosses element boundaries
          const fragment = range.extractContents();
          span.appendChild(fragment);
          range.insertNode(span);
        }
      }

      if (sel) sel.removeAllRanges();
      savedRangeRef.current = null;
      emitChange();
    },
    [getActiveRange, emitChange],
  );

  const toggleStyle = useCallback(
    (prop: string, val: string) => {
      const editor = editorRef.current;
      if (!editor) return;

      const range = getActiveRange();
      if (!range || range.collapsed) return;

      const selectedText = range.toString();
      const parentEl = range.commonAncestorContainer.parentElement;

      // Check if the parent span already has this style
      if (
        parentEl &&
        parentEl !== editor &&
        parentEl.tagName === "SPAN" &&
        parentEl.hasAttribute("style") &&
        selectedText === parentEl.textContent &&
        parentEl.style.getPropertyValue(prop) === val
      ) {
        // Remove the style
        setHistory((prev) => [...prev, editor.innerHTML]);
        parentEl.style.removeProperty(prop);
        // If no styles left, unwrap the span
        if (!parentEl.getAttribute("style")?.trim()) {
          parentEl.replaceWith(...Array.from(parentEl.childNodes));
        }
        const sel = window.getSelection();
        if (sel) sel.removeAllRanges();
        savedRangeRef.current = null;
        emitChange();
      } else {
        applyStyle({ [prop]: val });
      }
    },
    [getActiveRange, applyStyle, emitChange],
  );

  const removeAllStyles = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const range = getActiveRange();
    if (!range || range.collapsed) return;

    const selectedText = range.toString();
    const parentEl = range.commonAncestorContainer.parentElement;

    if (
      parentEl &&
      parentEl !== editor &&
      parentEl.tagName === "SPAN" &&
      selectedText === parentEl.textContent
    ) {
      setHistory((prev) => [...prev, editor.innerHTML]);
      parentEl.replaceWith(...Array.from(parentEl.childNodes));
      const sel = window.getSelection();
      if (sel) sel.removeAllRanges();
      savedRangeRef.current = null;
      emitChange();
    }
  }, [getActiveRange, emitChange]);

  const applyBold = useCallback(() => {
    toggleStyle("font-weight", "bold");
  }, [toggleStyle]);

  const applyItalic = useCallback(() => {
    toggleStyle("font-style", "italic");
  }, [toggleStyle]);

  const applyColor = useCallback(
    (color: string) => {
      applyStyle({ color, "font-weight": "bold" });
      setSelectKey((k) => k + 1);
    },
    [applyStyle],
  );

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1.5 items-center flex-wrap">
        {!withoutColor && (
          <>
            <Select key={selectKey} onValueChange={applyColor}>
              <SelectTrigger className="h-8 text-xs flex-1 min-w-32">
                <SelectValue placeholder="Couleur" />
              </SelectTrigger>
              <SelectContent>
                {COLOR_OPTIONS.map((opt) => (
                  <SelectItem key={opt.label} value={opt.value}>
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: opt.value }}
                      />
                      {opt.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              type="color"
              className="h-8 w-8 rounded border p-0.5 cursor-pointer shrink-0"
              onChange={(e) => applyColor(e.target.value)}
            />
          </>
        )}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={applyBold}
          className="h-8 w-8 flex items-center justify-center rounded border hover:bg-muted transition-colors cursor-pointer shrink-0"
          title="Gras"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={applyItalic}
          className="h-8 w-8 flex items-center justify-center rounded border hover:bg-muted transition-colors cursor-pointer shrink-0"
          title="Italique"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={removeAllStyles}
          className="h-8 w-8 flex items-center justify-center rounded border hover:bg-muted transition-colors cursor-pointer shrink-0"
          title="Retirer le style"
        >
          <X className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={undo}
          className="h-8 w-8 flex items-center justify-center rounded border hover:bg-muted transition-colors cursor-pointer shrink-0"
          title="Annuler"
        >
          <Undo2 className="h-4 w-4" />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        className="min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
    </div>
  );
}
