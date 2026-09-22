"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { useEditing } from "@/lib/editing/context";

/**
 * Editable text primitives that render as text in read mode and as inputs in
 * edit mode. Updates flow up through the parent's onChange; the parent then
 * calls updateEngine(...) from the editing context, which handles debounced
 * save.
 */

type BaseProps = {
  value?: string;
  onChange?: (next: string) => void;
  placeholder?: string;
  className?: string;
  /** When empty and readonly, render this instead of a blank space. */
  emptyLabel?: string;
};

/**
 * One-line editable text — used for headings, item names, short labels, table
 * cells. Renders inline as-text; on edit-mode focus becomes a bordered input.
 */
export function Editable({
  value,
  onChange,
  placeholder,
  className,
  emptyLabel = "",
  as = "span",
}: BaseProps & { as?: "span" | "p" | "h3" | "h4" }) {
  const { editMode } = useEditing();
  const [local, setLocal] = useState(value ?? "");

  // Track upstream changes (e.g., streamed deltas landing while the field is
  // not focused).
  useEffect(() => {
    setLocal(value ?? "");
  }, [value]);

  if (!editMode) {
    const displayed = value ?? "";
    if (as === "p") {
      return (
        <p className={className}>
          {displayed || emptyLabel}
        </p>
      );
    }
    if (as === "h3") {
      return (
        <h3 className={className}>
          {displayed || emptyLabel}
        </h3>
      );
    }
    if (as === "h4") {
      return (
        <h4 className={className}>
          {displayed || emptyLabel}
        </h4>
      );
    }
    return <span className={className}>{displayed || emptyLabel}</span>;
  }

  return (
    <input
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        if (local !== (value ?? "")) onChange?.(local);
      }}
      placeholder={placeholder}
      className={cn(
        // Match the look of the surrounding text — no chrome unless focused.
        "w-full bg-transparent outline-none",
        "border border-dashed border-verdigris/40 rounded px-1 -mx-1",
        "focus:border-solid focus:border-aberdeen-blue focus:ring-1 focus:ring-verdigris/50",
        className,
      )}
    />
  );
}

/**
 * Multi-line auto-growing textarea for paragraph-length fields (executive
 * summary, why-aberdeen, workstream objectives, etc.).
 */
export function EditableParagraph({
  value,
  onChange,
  placeholder,
  className,
  emptyLabel = "",
  minRows = 3,
}: BaseProps & { minRows?: number }) {
  const { editMode } = useEditing();
  const [local, setLocal] = useState(value ?? "");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocal(value ?? "");
  }, [value]);

  // Auto-grow to content height.
  useLayoutEffect(() => {
    if (editMode && ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [editMode, local]);

  if (!editMode) {
    return (
      <p className={cn("whitespace-pre-line", className)}>
        {value || emptyLabel}
      </p>
    );
  }

  return (
    <textarea
      ref={ref}
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        if (local !== (value ?? "")) onChange?.(local);
      }}
      placeholder={placeholder}
      rows={minRows}
      className={cn(
        "w-full resize-none bg-transparent outline-none whitespace-pre-line",
        "border border-dashed border-verdigris/40 rounded p-2",
        "focus:border-solid focus:border-aberdeen-blue focus:ring-1 focus:ring-verdigris/50",
        className,
      )}
    />
  );
}

/**
 * Renders a list of strings where each item is individually editable in-place.
 * In edit mode adds an "add item" affordance at the bottom; empty items on
 * blur get removed.
 */
export function EditableList({
  items,
  onChange,
  itemPlaceholder = "Add an item",
  className,
  itemClassName,
  bulletClassName,
  wrapper: Wrapper = "ul",
}: {
  items: string[] | undefined;
  onChange: (next: string[]) => void;
  itemPlaceholder?: string;
  className?: string;
  itemClassName?: string;
  bulletClassName?: string;
  wrapper?: "ul" | "ol";
}) {
  const { editMode } = useEditing();
  const list = items ?? [];

  const updateItem = (i: number, next: string) => {
    const trimmed = next.trim();
    const cleaned = [...list];
    if (trimmed === "") {
      cleaned.splice(i, 1);
    } else {
      cleaned[i] = next;
    }
    onChange(cleaned);
  };

  const addItem = () => {
    onChange([...list, ""]);
  };

  return (
    <Wrapper className={cn("flex flex-col gap-1.5", className)}>
      {list.map((item, i) => (
        <li key={i} className={cn("flex items-start gap-2", itemClassName)}>
          <span
            className={cn(
              "mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-verdigris/70",
              bulletClassName,
            )}
          />
          <span className="flex-1">
            <Editable
              value={item}
              onChange={(next) => updateItem(i, next)}
              placeholder={itemPlaceholder}
            />
          </span>
        </li>
      ))}
      {editMode && (
        <li>
          <button
            type="button"
            onClick={addItem}
            className="text-xs font-medium text-verdigris hover:text-aberdeen-blue"
          >
            + add
          </button>
        </li>
      )}
    </Wrapper>
  );
}

/**
 * Passthrough content that only shows in edit mode — useful for "delete this
 * row" buttons on structured items.
 */
export function EditOnly({ children }: { children: ReactNode }) {
  const { editMode } = useEditing();
  if (!editMode) return null;
  return <>{children}</>;
}
