"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { educationList } from "@/constants/education-list";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  id?: string;
  value?: string | null;
  onChange?: (v: string) => void;
  placeholder?: string;
  options?: string[];
  // If true, the select will render its own free-text input when the Other placeholder is chosen.
  showInternalOtherInput?: boolean;
  // Placeholder text to use for the 'Other' option (allows reuse for programs)
  otherPlaceholder?: string;
}

export default function SearchableInstitutionSelect({ id, value, onChange, placeholder = "Search institution...", options, showInternalOtherInput = false, otherPlaceholder = "Other (Institution Not Listed)" }: Props) {
  const OTHER_PLACEHOLDER = otherPlaceholder;
  const baseOpts = options ?? educationList;
  const opts = baseOpts.includes(OTHER_PLACEHOLDER) ? baseOpts : [...baseOpts, OTHER_PLACEHOLDER];
  const [inputValue, setInputValue] = useState(value ?? "");
  const [open, setOpen] = useState(false);
  const [manualOther, setManualOther] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setInputValue(value ?? "");
  }, [value]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const filtered = useMemo(() => {
    const q = (inputValue || "").toLowerCase().trim();
    if (!q) return opts.slice(0, 50);
    return opts.filter(o => o.toLowerCase().includes(q)).slice(0, 50);
  }, [inputValue, opts]);

  const handleSelect = (v: string) => {
    setInputValue(v);
    setOpen(false);
    onChange?.(v);
  };

  const handleManualChange = (v: string) => {
    setManualOther(v);
    // When user types a manual institution, propagate that value up as the current value
    onChange?.(v);
  };

  return (
    <div className="relative" ref={ref}>
      <Input
        id={id}
        value={inputValue}
        onChange={(e) => { setInputValue(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
      />

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border bg-card p-1">
          {filtered.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">No results</div>
          ) : (
            filtered.map((opt, i) => (
              <button
                type="button"
                key={i}
                className="w-full text-left p-2 text-sm hover:bg-muted rounded"
                onClick={() => handleSelect(opt)}
              >
                {opt}
              </button>
            ))
          )}
        </div>
      )}

      {/* small clear button when value present */}
      {inputValue && (
        <div className="absolute right-2 top-2">
          <Button size="sm" variant="ghost" type="button" onClick={() => { setInputValue(""); onChange?.(""); setOpen(false); }}>
            Clear
          </Button>
        </div>
      )}

      {/* internal other input (optional) */}
      {showInternalOtherInput && inputValue === OTHER_PLACEHOLDER && (
        <div className="mt-2">
          <Input
            value={manualOther}
            onChange={(e) => handleManualChange(e.target.value)}
            placeholder="Please enter institution name"
          />
        </div>
      )}
    </div>
  );
}
