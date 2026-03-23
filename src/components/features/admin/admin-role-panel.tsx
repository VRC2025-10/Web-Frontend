"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import {
  createAdminRoleAction,
  deleteAdminRoleAction,
  updateAdminSystemRolePolicyAction,
  updateAdminRoleAction,
} from "@/actions/admin";
import type { AdminManagedRole, AdminRolePayload, AdminSystemRolePolicy, AdminSystemRolePolicyPayload, UserRole } from "@/lib/api/types";

interface AdminRolePanelProps {
  roles: AdminManagedRole[];
  systemRoles: AdminSystemRolePolicy[];
}

const emptyForm: AdminRolePayload = {
  discord_role_id: "",
  display_name: "",
  description: "",
  can_view_dashboard: false,
  can_manage_users: false,
  can_manage_roles: false,
  can_manage_events: false,
  can_manage_tags: false,
  can_manage_reports: false,
  can_manage_galleries: false,
  can_manage_clubs: false,
};

const permissionFieldKeys = [
  "can_view_dashboard",
  "can_manage_users",
  "can_manage_roles",
  "can_manage_events",
  "can_manage_tags",
  "can_manage_reports",
  "can_manage_galleries",
  "can_manage_clubs",
] as const;

type AdminPermissionFieldKey = typeof permissionFieldKeys[number];

const systemRoleOrder: UserRole[] = ["member", "staff", "admin"];

export function AdminRolePanel({ roles, systemRoles }: AdminRolePanelProps) {
  const t = useTranslations("admin.roles");
  const router = useRouter();
  const [editingRoleId, setEditingRoleId] = useState<string | undefined>();
  const [editingSystemRole, setEditingSystemRole] = useState<UserRole | undefined>();
  const [formState, setFormState] = useState<AdminRolePayload>(emptyForm);
  const [systemFormState, setSystemFormState] = useState<AdminSystemRolePolicyPayload>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const permissionFields: Array<{
  key: keyof Omit<AdminRolePayload, "discord_role_id" | "display_name" | "description">;
  label: string;
  hint: string;
  }> = permissionFieldKeys.map((key) => ({
    key,
    label: t(`permissions.${key}.label`),
    hint: t(`permissions.${key}.hint`),
  }));

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
      can_view_dashboard: role.can_view_dashboard,
      can_manage_users: role.can_manage_users,
      can_manage_roles: role.can_manage_roles,
      can_manage_events: role.can_manage_events,
      can_manage_tags: role.can_manage_tags,
      can_manage_reports: role.can_manage_reports,
      can_manage_galleries: role.can_manage_galleries,
      can_manage_clubs: role.can_manage_clubs,
    });
  }, [editingRoleId, roles]);

  useEffect(() => {
    if (!editingSystemRole) {
      setSystemFormState(emptyForm);
      return;
    }

    const role = systemRoles.find((entry) => entry.role === editingSystemRole);
    if (!role) {
      setEditingSystemRole(undefined);
      setSystemFormState(emptyForm);
      return;
    }

    setSystemFormState({
      can_view_dashboard: role.can_view_dashboard,
      can_manage_users: role.can_manage_users,
      can_manage_roles: role.can_manage_roles,
      can_manage_events: role.can_manage_events,
      can_manage_tags: role.can_manage_tags,
      can_manage_reports: role.can_manage_reports,
      can_manage_galleries: role.can_manage_galleries,
      can_manage_clubs: role.can_manage_clubs,
    });
  }, [editingSystemRole, systemRoles]);

  function resetForm() {
    setEditingRoleId(undefined);
    setFormState(emptyForm);
    setError(null);
  }

  function resetSystemForm() {
    setEditingSystemRole(undefined);
    setSystemFormState(emptyForm);
    setError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(() => {
      void (async () => {
        const result = editingRoleId
          ? await updateAdminRoleAction(editingRoleId, formState)
          : await createAdminRoleAction(formState);

        if (result?.error) {
          setError(result.error);
          return;
        }

        resetForm();
        router.refresh();
      })();
    });
  }

  function handleDelete(roleId: string) {
    setError(null);

    startTransition(() => {
      void (async () => {
        const result = await deleteAdminRoleAction(roleId);
        if (result?.error) {
          setError(result.error);
          return;
        }

        if (editingRoleId === roleId) {
          resetForm();
        }

        router.refresh();
      })();
    });
  }

  function handleSystemRoleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingSystemRole) {
      return;
    }

    setError(null);
    startTransition(() => {
      void (async () => {
        const result = await updateAdminSystemRolePolicyAction(editingSystemRole, systemFormState);
        if (result?.error) {
          setError(result.error);
          return;
        }

        resetSystemForm();
        router.refresh();
      })();
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{t("system.eyebrow")}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{t("system.title")}</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t("system.description")}</p>
          </div>
          {editingSystemRole ? (
            <button
              type="button"
              onClick={resetSystemForm}
              className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
            >
              {t("system.cancel")}
            </button>
          ) : null}
        </div>

        <div className="mt-6 grid gap-3">
          {systemRoleOrder.map((roleName) => {
            const role = systemRoles.find((entry) => entry.role === roleName);
            if (!role) {
              return null;
            }

            const activeValues = permissionFields.filter((field) => role[field.key]);
            return (
              <article key={role.role} className="rounded-[1.5rem] border border-border bg-background/80 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{t(`roleNames.${role.role}`)}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{t(`roleDescriptions.${role.role}`)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingSystemRole(role.role)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
                  >
                    {t("actions.editSystem")}
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {activeValues.map((field) => (
                    <span key={field.key} className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                      {field.label}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>

        {editingSystemRole ? (
          <form className="mt-6 grid gap-3" onSubmit={handleSystemRoleSubmit}>
            <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{t("system.editingLabel")}</span>{" "}
              {t(`roleNames.${editingSystemRole}`)}
            </div>
            <div className="grid gap-2 rounded-[1.5rem] border border-border bg-background/70 p-4 text-sm text-foreground">
              {permissionFields.map((field) => (
                <label key={field.key} className="flex items-start gap-3 rounded-xl px-1 py-1.5">
                  <input
                    type="checkbox"
                    checked={systemFormState[field.key]}
                    onChange={(event) => setSystemFormState((current) => ({ ...current, [field.key]: event.target.checked }))}
                  />
                  <span>
                    <span className="block font-medium text-foreground">{field.label}</span>
                    <span className="block text-xs text-muted-foreground">{field.hint}</span>
                  </span>
                </label>
              ))}
            </div>
            {error ? <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
            >
              {isPending ? t("actions.saving") : t("actions.saveSystem")}
            </button>
          </form>
        ) : null}
      </section>

      <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{t("managed.eyebrow")}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{t("managed.title")}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {t("managed.description")}
          </p>
        </div>
        {editingRoleId ? (
          <button
            type="button"
            onClick={resetForm}
            className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
          >
            {t("actions.createNew")}
          </button>
        ) : null}
      </div>

      <form className="mt-6 grid gap-3" onSubmit={handleSubmit}>
        <input
          value={formState.display_name}
          onChange={(event) => setFormState((current) => ({ ...current, display_name: event.target.value }))}
          placeholder={t("managed.placeholders.displayName")}
          className="rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary"
        />
        <input
          value={formState.discord_role_id}
          onChange={(event) => setFormState((current) => ({ ...current, discord_role_id: event.target.value }))}
          placeholder={t("managed.placeholders.discordRoleId")}
          className="rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary"
        />
        <textarea
          rows={3}
          value={formState.description}
          onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
          placeholder={t("managed.placeholders.description")}
          className="rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary"
        />

        <div className="grid gap-2 rounded-[1.5rem] border border-border bg-background/70 p-4 text-sm text-foreground">
          {permissionFields.map((field) => (
            <label key={field.key} className="flex items-start gap-3 rounded-xl px-1 py-1.5">
              <input
                type="checkbox"
                checked={formState[field.key]}
                onChange={(event) => setFormState((current) => ({ ...current, [field.key]: event.target.checked }))}
              />
              <span>
                <span className="block font-medium text-foreground">{field.label}</span>
                <span className="block text-xs text-muted-foreground">{field.hint}</span>
              </span>
            </label>
          ))}
        </div>

        {error ? <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        >
          {isPending ? t("actions.saving") : editingRoleId ? t("actions.saveManaged") : t("actions.addManaged")}
        </button>
      </form>

      <div className="mt-6 grid gap-3">
        {roles.map((role) => (
          <article key={role.id} className="rounded-[1.5rem] border border-border bg-background/80 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
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
                  {t("actions.editManaged")}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(role.id)}
                  className="rounded-full border border-destructive/30 px-3 py-1.5 text-xs text-destructive transition hover:bg-destructive/5"
                >
                  {t("actions.deleteManaged")}
                </button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {permissionFields
                .filter((field) => role[field.key])
                .map((field) => (
                  <span key={field.key} className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                    {field.label}
                  </span>
                ))}
            </div>
          </article>
        ))}
        {roles.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("managed.empty")}</p>
        ) : null}
      </div>
      </section>
    </div>
  );
}