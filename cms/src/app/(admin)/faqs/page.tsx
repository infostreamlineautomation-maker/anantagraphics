"use client";

import { useState } from "react";

import { type ItemFormProps, ListManager, saveItem } from "@/components/modules/ListManager";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Toggle } from "@/components/ui/Form";
import { useToast } from "@/components/ui/Toast";
import { errorMessage } from "@/lib/hooks";
import type { Faq } from "@/lib/types";

export default function FaqsPage() {
  return (
    <ListManager<Faq>
      title="FAQs"
      description="Questions in the FAQ block on the About page. Drag to reorder."
      path="/faqs"
      noun="FAQ"
      label={(f) => f.question}
      emptyText="Add common questions, e.g. “Do you provide samples?”"
      Form={FaqForm}
      summary={(f) => (
        <>
          <p className="font-medium">{f.question}</p>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{f.answer}</p>
        </>
      )}
    />
  );
}

function FaqForm({ item, onCancel, onSaved }: ItemFormProps<Faq>) {
  const [question, setQuestion] = useState(item?.question ?? "");
  const [answer, setAnswer] = useState(item?.answer ?? "");
  const [isActive, setIsActive] = useState(item?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  async function save() {
    if (question.trim().length < 3 || !answer.trim()) return toast.error("Enter a question and an answer");
    setSaving(true);
    try {
      const saved = await saveItem("/faqs", item, { question: question.trim(), answer: answer.trim(), is_active: isActive });
      toast.success(item ? "FAQ saved" : "FAQ added");
      onSaved(saved);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Field label="Question">
        <Input value={question} maxLength={300} onChange={(e) => setQuestion(e.target.value)} autoFocus />
      </Field>
      <Field label="Answer">
        <Textarea rows={3} value={answer} maxLength={5000} onChange={(e) => setAnswer(e.target.value)} />
      </Field>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Toggle checked={isActive} onChange={setIsActive} label={isActive ? "Shown on website" : "Hidden"} />
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving}>
            {item ? "Save" : "Add FAQ"}
          </Button>
        </div>
      </div>
    </div>
  );
}
