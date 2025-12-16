"use client";

import React, { useEffect, useRef, useState } from "react";
import { SKILL_CATEGORIES, FLAT_SKILLS } from "@/constants/skill-categories";
import { X as XIcon } from "lucide-react";

interface SkillTagInputProps {
    name?: string; // hidden input name for form submission
    initialValue?: string[] | string;
    placeholder?: string;
}

export default function SkillTagInput({ name = "skills", initialValue, placeholder = "Add skills..." }: SkillTagInputProps) {
    const parseInitial = (): string[] => {
        if (!initialValue) return [];
        if (Array.isArray(initialValue)) return initialValue;
        if (typeof initialValue === "string") return initialValue.split(",").map(s => s.trim()).filter(Boolean);
        return [];
    };

    const [tags, setTags] = useState<string[]>(parseInitial);
    const [query, setQuery] = useState("");
    const [filtered, setFiltered] = useState<string[]>([]);
    const [activeIdx, setActiveIdx] = useState(0);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const listRef = useRef<HTMLUListElement | null>(null);

    useEffect(() => {
        const q = query.trim().toLowerCase();
        const results = FLAT_SKILLS.filter(s => s.toLowerCase().includes(q) && !tags.includes(s));
        setFiltered(results.slice(0, 10));
        setActiveIdx(0);
    }, [query, tags]);

    useEffect(() => {
        // update hidden input when tags change
        const hidden = document.querySelector<HTMLInputElement>(`input[name="${name}"]`);
        if (hidden) hidden.value = tags.join(",");
    }, [tags, name]);

    const addTag = (value: string) => {
        if (!value) return;
        if (tags.includes(value)) return;
        setTags(prev => [...prev, value]);
        setQuery("");
    };

    const removeTag = (idx: number) => {
        setTags(prev => prev.filter((_, i) => i !== idx));
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (filtered.length > 0 && query.trim().length > 0) {
                addTag(filtered[activeIdx] || query.trim());
            } else if (query.trim().length > 0) {
                addTag(query.trim());
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIdx(i => Math.min(i + 1, filtered.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIdx(i => Math.max(i - 1, 0));
        } else if (e.key === "Escape") {
            setQuery("");
        }
    };

    return (
        <div>
            <input type="hidden" name={name} value={tags.join(",")} />
            <div className="border rounded p-2">
                <div className="flex flex-wrap gap-2">
                    {tags.map((t, i) => (
                        <span key={t} className="inline-flex items-center gap-2 px-2 py-1 bg-muted rounded text-sm">
                            <span>{t}</span>
                            <button type="button" aria-label={`Remove ${t}`} onClick={() => removeTag(i)} className="opacity-70 hover:opacity-100">
                                <XIcon className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                    <input
                        ref={inputRef}
                        className="flex-1 min-w-[140px] outline-none bg-transparent"
                        placeholder={placeholder}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={onKeyDown}
                    />
                </div>
            </div>

            {query.trim().length > 0 && filtered.length > 0 && (
                <ul ref={listRef} className="border rounded mt-1 max-h-48 overflow-auto bg-popover z-10">
                    {filtered.map((s, idx) => (
                        <li key={s} className={`p-2 cursor-pointer ${idx === activeIdx ? 'bg-accent text-accent-foreground' : ''}`} onMouseDown={(e) => { e.preventDefault(); addTag(s); }}>
                            <div className="flex justify-between">
                                <span>{s}</span>
                                <small className="text-muted-foreground">{SKILL_CATEGORIES.find(g => g.skills.includes(s))?.category}</small>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
