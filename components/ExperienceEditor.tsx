"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ExperienceEntry {
  company?: string;
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD or 'Present'
  currently?: boolean;
}

interface ExperienceEditorProps {
  name?: string; // name of hidden input, defaults to 'experience'
  initialValue?: ExperienceEntry[] | null;
}

export default function ExperienceEditor({ name = "experience", initialValue = null }: ExperienceEditorProps) {
  const [entries, setEntries] = useState<ExperienceEntry[]>(() => initialValue ? initialValue : []);

  useEffect(() => {
    if (!Array.isArray(entries)) setEntries([]);
  }, []);

  const updateEntry = (index: number, partial: Partial<ExperienceEntry>) => {
    setEntries(prev => {
      const next = [...prev];
      next[index] = { ...(next[index] || {}), ...partial };
      return next;
    });
  };

  const addEntry = () => setEntries(prev => [...prev, { company: "", start_date: "", end_date: "", currently: false }]);
  const removeEntry = (index: number) => setEntries(prev => prev.filter((_, i) => i !== index));

  const toggleCurrently = (index: number, checked: boolean) => {
    updateEntry(index, { currently: checked, end_date: checked ? "Present" : "" });
  };

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={JSON.stringify(entries)} />

      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium">Experience</h4>
        <Button type="button" onClick={addEntry} size="sm">+ Add Experience</Button>
      </div>

      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground">No experience entries yet. Click Add Experience to begin.</p>
      )}

      <div className="space-y-3">
        {entries.map((entry, idx) => (
          <div key={idx} className="p-3 border rounded-md space-y-2">
            <div className="flex justify-between items-start">
              <div className="space-y-2 w-full">
                <div>
                  <Label htmlFor={`exp_company_${idx}`}>Company / Institution</Label>
                  <Input id={`exp_company_${idx}`} value={entry.company || ""} onChange={(e) => updateEntry(idx, { company: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`exp_start_${idx}`}>Start Date</Label>
                    <Input id={`exp_start_${idx}`} type="date" value={entry.start_date || ""} onChange={(e) => updateEntry(idx, { start_date: e.target.value })} />
                  </div>

                  <div>
                    <Label htmlFor={`exp_end_${idx}`}>End Date</Label>
                    <Input id={`exp_end_${idx}`} type="date" value={entry.end_date && entry.end_date !== "Present" ? entry.end_date : ""} onChange={(e) => updateEntry(idx, { end_date: e.target.value, currently: false })} disabled={!!entry.currently} />
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <input id={`exp_current_${idx}`} type="checkbox" checked={!!entry.currently} onChange={(e) => toggleCurrently(idx, e.target.checked)} />
                  <Label htmlFor={`exp_current_${idx}`}>I currently work here</Label>
                </div>
              </div>

              <div className="ml-4 pt-2">
                <Button type="button" variant="destructive" onClick={() => removeEntry(idx)}>Remove</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
