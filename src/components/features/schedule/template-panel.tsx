"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import type { ScheduleTemplate, ScheduleTemplatePayload } from "@/lib/api/types";

interface TemplatePanelProps {
  templates: ScheduleTemplate[];
  pending: boolean;
  onSave: (payload: ScheduleTemplatePayload, templateId?: string) => Promise<void>;
  onDelete: (templateId: string) => Promise<void>;
}

const emptyForm: ScheduleTemplatePayload = {
  name: "",
  title: "",
  description: "",
  is_default: false,
};

export function TemplatePanel({ templates, pending, onSave, onDelete }: TemplatePanelProps) {
  const t = useTranslations("schedule.templates");
  const tCommon = useTranslations("common");
  const [editingTemplateId, setEditingTemplateId] = useState<string | undefined>();
  const [formState, setFormState] = useState<ScheduleTemplatePayload>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editingTemplateId) {
      setFormState(emptyForm);
      return;
    }

    const template = templates.find((entry) => entry.id === editingTemplateId);
    if (!template) {
      setEditingTemplateId(undefined);
      setFormState(emptyForm);
      return;
    }

    setFormState({
      name: template.name,
      title: template.title,
      description: template.description,
      is_default: template.is_default,
    });
  }, [editingTemplateId, templates]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await onSave(formState, editingTemplateId);
      setEditingTemplateId(undefined);
      setFormState(emptyForm);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("errors.save"));
    }
  }

  async function handleDelete(templateId: string) {
    if (!window.confirm(t("confirmDelete"))) {
      return;
    }

    setError(null);
    try {
      await onDelete(templateId);
      if (editingTemplateId === templateId) {
        setEditingTemplateId(undefined);
        setFormState(emptyForm);
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : t("errors.delete"));
    }
  }

  return (
    <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{t("eyebrow")}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{t("title")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("description")}</p>
        </div>
        {editingTemplateId ? (
          <button
            type="button"
            onClick={() => {
              setEditingTemplateId(undefined);
              setFormState(emptyForm);
            }}
            className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
          >
            {t("createNew")}
          </button>
        ) : null}
      </div>

      <form className="mt-5 grid gap-3" onSubmit={handleSubmit}>
        <input
          value={formState.name}
          onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
          placeholder={t("placeholders.name")}
          className="rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary"
        />
        <input
          value={formState.title}
          onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))}
          placeholder={t("placeholders.title")}
          className="rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary"
        />
        <textarea
          rows={4}
          value={formState.description}
          onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
          placeholder={t("placeholders.description")}
          className="rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary"
        />

        <label className="flex items-center gap-3 rounded-[1.5rem] border border-border bg-background/70 p-4 text-sm text-foreground">
          <input
            type="checkbox"
            checked={formState.is_default}
            onChange={(event) => setFormState((current) => ({ ...current, is_default: event.target.checked }))}
          />
          <span>{t("defaultLabel")}</span>
        </label>

        {error ? <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? t("actions.saving") : editingTemplateId ? t("actions.save") : t("actions.add")}
        </button>
      </form>

      <div className="mt-6 grid gap-3">
        {templates.map((template) => (
          <article key={template.id} className="rounded-[1.5rem] border border-border bg-background/80 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{template.name}</h3>
                  {template.is_default ? <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{t("defaultBadge")}</span> : null}
                </div>
                <p className="mt-2 text-sm font-semibold text-foreground/80">{t("titleLabel")}: {template.title}</p>
                {template.description ? <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{template.description}</p> : null}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTemplateId(template.id)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
                >
                  {tCommon("edit")}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(template.id)}
                  className="rounded-full border border-destructive/30 px-3 py-1.5 text-xs text-destructive transition hover:bg-destructive/5"
                >
                  {tCommon("delete")}
                </button>
              </div>
            </div>
          </article>
        ))}
        {templates.length === 0 ? <p className="text-sm text-muted-foreground">{t("empty")}</p> : null}
      </div>
    </section>
  );
}