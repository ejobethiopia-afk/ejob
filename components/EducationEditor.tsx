"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SearchableInstitutionSelect from "@/components/SearchableInstitutionSelect";
import { educationList } from "@/constants/education-list";
import { programsByDegree, DEGREE_LEVELS } from "@/constants/programs-list";

export interface EducationEntry {
  institution?: string;
  institution_manual?: string;
  degree_level?: string;
  field_of_study?: string;
  field_of_study_manual?: string;
  graduation_date?: string; // YYYY-MM-DD or year
}

interface EducationEditorProps {
  name?: string; // name of hidden input, defaults to 'education'
  initialValue?: EducationEntry[] | null;
}

export default function EducationEditor({ name = "education", initialValue = null }: EducationEditorProps) {
  const OTHER_PLACEHOLDER = "Other (Institution Not Listed)";
  const [entries, setEntries] = useState<EducationEntry[]>(() => initialValue ? initialValue : []);

  useEffect(() => {
    // ensure entries is always an array
    if (!Array.isArray(entries)) setEntries([]);
  }, []);

  const updateEntry = (index: number, partial: Partial<EducationEntry>) => {
    setEntries(prev => {
      const next = [...prev];
      next[index] = { ...(next[index] || {}), ...partial };
      return next;
    });
  };

  const addEntry = () => setEntries(prev => [...prev, { institution: "", degree_level: "", field_of_study: "", graduation_date: "" }]);
  const removeEntry = (index: number) => setEntries(prev => prev.filter((_, i) => i !== index));

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={JSON.stringify(entries)} />

      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium">Education</h4>
        <Button type="button" onClick={addEntry} size="sm">+ Add Education</Button>
      </div>

      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground">No education entries yet. Click Add Education to begin.</p>
      )}

      <div className="space-y-3">
        {entries.map((entry, idx) => (
          <div key={idx} className="p-3 border rounded-md space-y-2">
            <div className="flex justify-between items-start">
              <div className="space-y-2 w-full">
                <div>
                  <Label htmlFor={`edu_institution_${idx}`}>Institution</Label>
                  <SearchableInstitutionSelect
                    id={`edu_institution_${idx}`}
                    value={entry.institution || ""}
                    onChange={(v) => updateEntry(idx, { institution: v })}
                    options={educationList}
                    placeholder="Search or type institution or choose Other (Institution Not Listed)"
                  />
                </div>

                {entry.institution === OTHER_PLACEHOLDER && (
                  <div>
                    <Label htmlFor={`edu_institution_other_${idx}`}>Please enter institution name</Label>
                    <Input
                      id={`edu_institution_other_${idx}`}
                      value={entry.institution_manual || ""}
                      onChange={(e) => updateEntry(idx, { institution_manual: e.target.value })}
                      placeholder="Type institution name"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor={`edu_degree_${idx}`}>Degree Level</Label>
                  <select id={`edu_degree_${idx}`} className="block w-full rounded-md border p-2" value={entry.degree_level || ""} onChange={(e) => updateEntry(idx, { degree_level: e.target.value, field_of_study: "", field_of_study_manual: "" })}>
                    <option value="" disabled>-- Select Degree Level --</option>
                    {DEGREE_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor={`edu_field_${idx}`}>Program / Field of Study</Label>
                  <SearchableInstitutionSelect
                    id={`edu_field_${idx}`}
                    value={entry.field_of_study || ""}
                    onChange={(v) => updateEntry(idx, { field_of_study: v })}
                    options={entry.degree_level ? programsByDegree[entry.degree_level] || [] : []}
                    placeholder={entry.degree_level ? "Search or select program" : "Select degree level first"}
                    showInternalOtherInput={false}
                    otherPlaceholder={"Other (Program Not Listed)"}
                  />
                </div>

                {entry.field_of_study === "Other (Program Not Listed)" && (
                  <div>
                    <Label htmlFor={`edu_field_other_${idx}`}>Please specify your Program/Field</Label>
                    <Input
                      id={`edu_field_other_${idx}`}
                      value={entry.field_of_study_manual || ""}
                      onChange={(e) => updateEntry(idx, { field_of_study_manual: e.target.value })}
                      placeholder="Type program/field"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor={`edu_grad_${idx}`}>Graduation Date</Label>
                  <Input id={`edu_grad_${idx}`} type="date" value={entry.graduation_date || ""} onChange={(e) => updateEntry(idx, { graduation_date: e.target.value })} />
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
