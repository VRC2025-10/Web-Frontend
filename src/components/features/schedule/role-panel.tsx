"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import type { ScheduleManagedRole, ScheduleRolePayload } from "@/lib/api/types";

interface RolePanelProps {
  roles: ScheduleManagedRole[];
  pending: boolean;
  onSave: (payload: ScheduleRolePayload, roleId?: string) => Promise<void>;
  onDelete: (roleId: string) => Promise<void>;
}

const emptyForm: ScheduleRolePayload = {
  discord_role_id: "",
  display_name: "",
  description: "",
  can_manage_roles: false,
  can_manage_events: false,
  can_manage_templates: false,
  can_manage_notifications: false,
  can_view_restricted_events: true,
};

export function RolePanel({ roles, pending, onSave, onDelete }: RolePanelProps) {
  const t = useTranslations("schedule.roles");
  const tCommon = useTranslations("common");
  const [editingRoleId, setEditingRoleId] = useState<string | undefined>();
  const [formState, setFormState] = useState<ScheduleRolePayload>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editingRoleId) {
      setFormState(emptyForm);
      return;
    }

    const role = roles.find((entry) => entry.id === editingRoleId);
    if (!role) {
      setEditingRoleId(undefined);
      setFormState(emptyForm);
      return;
    }

    setFormState({
      discord_role_id: role.discord_role_id,
      display_name: role.display_name,
      description: role.description,
      can_manage_roles: role.can_manage_roles,
      can_manage_events: role.can_manage_events,
      can_manage_templates: role.can_manage_templates,
      can_manage_notifications: role.can_manage_notifications,
      can_view_restricted_events: role.can_view_restricted_events,
    });
  }, [editingRoleId, roles]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await onSave(formState, editingRoleId);
      setEditingRoleId(undefined);
      setFormState(emptyForm);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("errors.save"));
    }
  }

  async function handleDelete(roleId: string) {
    if (!window.confirm(t("confirmDelete"))) {
      return;
    }

    setError(null);
    try {
      await onDelete(roleId);
      if (editingRoleId === roleId) {
        setEditingRoleId(undefined);
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
        {editingRoleId ? (
          <button
            type="button"
            onClick={() => {
              setEditingRoleId(undefined);
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
          value={formState.display_name}
          onChange={(event) => setFormState((current) => ({ ...current, display_name: event.target.value }))}
          placeholder={t("placeholders.displayName")}
          className="rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary"
        />
        <input
          value={formState.discord_role_id}
          onChange={(event) => setFormState((current) => ({ ...current, discord_role_id: event.target.value }))}
          placeholder={t("placeholders.discordRoleId")}
          className="rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary"
        />
        <textarea
          rows={3}
          value={formState.description}
          onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
          placeholder={t("placeholders.description")}
          className="rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary"
        />

        <div className="grid gap-2 rounded-[1.5rem] border border-border bg-background/70 p-4 text-sm text-foreground">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formState.can_view_restricted_events}
              onChange={(event) => setFormState((current) => ({ ...current, can_view_restricted_events: event.target.checked }))}
            />
            <span>{t("permissions.restricted")}</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formState.can_manage_events}
              onChange={(event) => setFormState((current) => ({ ...current, can_manage_events: event.target.checked }))}
            />
            <span>{t("permissions.events")}</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formState.can_manage_templates}
              onChange={(event) => setFormState((current) => ({ ...current, can_manage_templates: event.target.checked }))}
            />
            <span>{t("permissions.templates")}</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formState.can_manage_notifications}
              onChange={(event) => setFormState((current) => ({ ...current, can_manage_notifications: event.target.checked }))}
            />
            <span>{t("permissions.notifications")}</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formState.can_manage_roles}
              onChange={(event) => setFormState((current) => ({ ...current, can_manage_roles: event.target.checked }))}
            />
            <span>{t("permissions.roles")}</span>
          </label>
        </div>

        {error ? <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? t("actions.saving") : editingRoleId ? t("actions.save") : t("actions.add")}
        </button>
      </form>

      <div className="mt-6 grid gap-3">
        {roles.map((role) => (
          <article key={role.id} className="rounded-[1.5rem] border border-border bg-background/80 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground">{role.display_name}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">{role.discord_role_id}</p>
                {role.description ? <p className="mt-2 text-sm text-muted-foreground">{role.description}</p> : null}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRoleId(role.id)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
                >
                  {tCommon("edit")}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(role.id)}
                  className="rounded-full border border-destructive/30 px-3 py-1.5 text-xs text-destructive transition hover:bg-destructive/5"
                >
                  {tCommon("delete")}
                </button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {role.can_view_restricted_events ? <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{t("badges.restricted")}</span> : null}
              {role.can_manage_events ? <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-cyan-700 dark:text-cyan-300">{t("badges.events")}</span> : null}
              {role.can_manage_templates ? <span className="rounded-full bg-amber-500/10 px-3 py-1 text-amber-700 dark:text-amber-300">{t("badges.templates")}</span> : null}
              {role.can_manage_notifications ? <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-300">{t("badges.notifications")}</span> : null}
              {role.can_manage_roles ? <span className="rounded-full bg-foreground/10 px-3 py-1 text-foreground">{t("badges.roles")}</span> : null}
            </div>
          </article>
        ))}
        {roles.length === 0 ? <p className="text-sm text-muted-foreground">{t("empty")}</p> : null}
      </div>
    </section>
  );
}