"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

type SelectOption = {
  label: string;
  value: string;
};

type SelectFieldProps = {
  className?: string;
  defaultValue?: string;
  name: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  value?: string;
};

export function SelectField({
  className = "",
  defaultValue,
  name,
  onValueChange,
  options,
  value,
}: SelectFieldProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const fallbackValue = defaultValue ?? options[0]?.value ?? "";
  const [internalValue, setInternalValue] = useState(fallbackValue);
  const [isOpen, setIsOpen] = useState(false);
  const selectedValue = value ?? internalValue;
  const selectedOption =
    options.find((option) => option.value === selectedValue) ?? options[0];

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (
        rootRef.current &&
        event.target instanceof Node &&
        !rootRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  function choose(nextValue: string) {
    setInternalValue(nextValue);
    onValueChange?.(nextValue);
    setIsOpen(false);
  }

  return (
    <div className={`relative ${className}`} ref={rootRef}>
      <input name={name} type="hidden" value={selectedValue} />
      <button
        aria-controls={id}
        aria-expanded={isOpen}
        className="select-input flex items-center justify-between gap-3 text-left"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown
          aria-hidden="true"
          className={`size-4 shrink-0 text-slate-500 transition ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+0.45rem)] z-40 overflow-hidden rounded-2xl border border-[#BFE7D1] bg-white p-1 shadow-2xl shadow-slate-300/50"
          id={id}
          role="listbox"
        >
          {options.map((option) => {
            const isSelected = option.value === selectedValue;

            return (
              <button
                aria-selected={isSelected}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm font-extrabold transition ${
                  isSelected
                    ? "bg-[#DFF3E8] text-[#2F7D57]"
                    : "text-slate-700 hover:bg-[#F6F8F7]"
                }`}
                key={option.value}
                onClick={() => choose(option.value)}
                role="option"
                type="button"
              >
                <span>{option.label}</span>
                {isSelected && <Check aria-hidden="true" className="size-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
