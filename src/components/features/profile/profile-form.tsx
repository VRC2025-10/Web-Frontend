"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence, useAnimate } from "framer-motion";

import {
  Card,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { MarkdownPreview } from "./markdown-preview";
import { ProfileFormSchema } from "@/lib/validations/profile";
import { updateProfileAction } from "@/actions/profile";
import { z } from "zod";

type FormInput = z.input<typeof ProfileFormSchema>;

function ShakeOnError({
  hasError,
  children,
}: {
  hasError: boolean;
  children: React.ReactNode;
}) {
  const [scope, animate] = useAnimate();
  const prevErrorRef = useRef(false);

  useEffect(() => {
    if (hasError && !prevErrorRef.current) {
      animate(scope.current, { x: [0, -4, 4, -4, 4, 0] }, { duration: 0.3 });
    }
    prevErrorRef.current = hasError;
  }, [hasError, animate, scope]);

  return <div ref={scope}>{children}</div>;
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface ProfileFormProps {
  defaultValues: {
    vrc_id?: string | null;
    short_bio?: string | null;
    x_id?: string | null;
    bio_markdown: string;
    is_public: boolean;
  };
  username: string;
}

export function ProfileForm({ defaultValues, username }: ProfileFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setFocus,
    formState: { errors },
  } = useForm<FormInput>({
    mode: "onBlur",
    resolver: zodResolver(ProfileFormSchema) as never,
    defaultValues: {
      vrc_id: defaultValues.vrc_id ?? "",
      short_bio: defaultValues.short_bio ?? "",
      x_id: defaultValues.x_id ?? "",
      bio_markdown: defaultValues.bio_markdown,
      is_public: defaultValues.is_public,
    },
  });

  const bioValue = watch("bio_markdown");
  const isPublic = watch("is_public");

  async function onSubmit(data: FormInput) {
    setServerError(null);
    setSubmitting(true);
    try {
      const result = await updateProfileAction(data);
      if (result.error) {
        setServerError(result.error);
        // Focus the error alert for screen readers
        requestAnimationFrame(() => alertRef.current?.focus());
      } else {
        toast.success("Profile saved");
      }
    } catch {
      setServerError("Failed to update profile");
      requestAnimationFrame(() => alertRef.current?.focus());
    } finally {
      setSubmitting(false);
    }
  }

  function onInvalid() {
    // Focus the first invalid field
    const firstErrorField = Object.keys(errors)[0] as
      | keyof FormInput
      | undefined;
    if (firstErrorField) {
      setFocus(firstErrorField);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="rounded-2xl p-4 md:rounded-[2rem] md:p-8">
        <CardHeader className="px-0 pt-0">
          <h1 className="text-2xl font-bold leading-none tracking-tight">
            Edit Profile
          </h1>
          <CardDescription>
            Update your public profile information
          </CardDescription>
        </CardHeader>

        <form
          ref={formRef}
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className="space-y-8"
          aria-label="Edit profile"
          noValidate
        >
          {/* Server error alert */}
          <AnimatePresence>
            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Alert
                  variant="destructive"
                  className="rounded-xl"
                  ref={alertRef}
                  tabIndex={-1}
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Display name (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="username">Name</Label>
            <Input
              id="username"
              value={username}
              disabled
              aria-disabled="true"
              aria-readonly="true"
              className="rounded-xl opacity-70"
            />
            <p className="text-xs text-muted-foreground" id="username-desc">
              Synced from Discord
            </p>
          </div>

          {/* VRC ID */}
          <ShakeOnError hasError={!!errors.vrc_id}>
            <div className="space-y-2">
              <Label htmlFor="vrc_id">VRC ID</Label>
              <div className="relative">
                <span
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                  aria-hidden="true"
                >
                  usr_
                </span>
                <Input
                  id="vrc_id"
                  className="rounded-xl pl-12"
                  aria-invalid={!!errors.vrc_id}
                  aria-describedby={
                    errors.vrc_id ? "vrc_id-error" : undefined
                  }
                  {...register("vrc_id")}
                />
              </div>
              <AnimatePresence>
                {errors.vrc_id && (
                  <motion.p
                    id="vrc_id-error"
                    role="alert"
                    className="text-xs text-destructive"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {errors.vrc_id.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </ShakeOnError>

          {/* Short Bio */}
          <ShakeOnError hasError={!!errors.short_bio}>
            <div className="space-y-2">
              <Label htmlFor="short_bio">Short Bio</Label>
              <Input
                id="short_bio"
                className="rounded-xl"
                placeholder="Nice to meet you!"
                aria-invalid={!!errors.short_bio}
                aria-describedby={
                  errors.short_bio ? "short_bio-error" : undefined
                }
                {...register("short_bio")}
              />
              <AnimatePresence>
                {errors.short_bio && (
                  <motion.p
                    id="short_bio-error"
                    role="alert"
                    className="text-xs text-destructive"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {errors.short_bio.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </ShakeOnError>

          {/* Bio (Markdown) */}
          <ShakeOnError hasError={!!errors.bio_markdown}>
            <div className="space-y-2">
              <Label htmlFor="bio_markdown">
                Bio <span className="sr-only">(required)</span>
                <span aria-hidden="true" className="text-destructive">
                  {" "}
                  *
                </span>
              </Label>
              <MarkdownPreview
                id="bio_markdown"
                value={bioValue}
                onChange={(val) => setValue("bio_markdown", val, { shouldValidate: true })}
                rows={8}
                placeholder="Write something about yourself… (Markdown supported)"
                aria-required="true"
                aria-invalid={!!errors.bio_markdown}
                aria-describedby={
                  errors.bio_markdown ? "bio_markdown-error" : undefined
                }
              />
              <AnimatePresence>
                {errors.bio_markdown && (
                  <motion.p
                    id="bio_markdown-error"
                    role="alert"
                    className="text-xs text-destructive"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {errors.bio_markdown.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </ShakeOnError>

          {/* Public toggle */}
          <div className="flex items-center justify-between rounded-xl border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="is_public">Public Profile</Label>
              <p
                className="text-xs text-muted-foreground"
                id="is_public-desc"
              >
                Show your profile in the members list
              </p>
            </div>
            <Switch
              id="is_public"
              checked={isPublic}
              onCheckedChange={(checked: boolean) =>
                setValue("is_public", checked)
              }
              aria-describedby="is_public-desc"
            />
          </div>

          {/* X (Twitter) ID */}
          <ShakeOnError hasError={!!errors.x_id}>
            <div className="space-y-2">
              <Label htmlFor="x_id">X (Twitter)</Label>
              <div className="relative">
                <XIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="x_id"
                  className="rounded-xl pl-10"
                  placeholder="@username"
                  aria-invalid={!!errors.x_id}
                  aria-describedby={errors.x_id ? "x_id-error" : undefined}
                  {...register("x_id")}
                />
              </div>
              <AnimatePresence>
                {errors.x_id && (
                  <motion.p
                    id="x_id-error"
                    role="alert"
                    className="text-xs text-destructive"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {errors.x_id.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </ShakeOnError>

          {/* Submit */}
          <div className="flex justify-end border-t pt-6 max-md:justify-stretch">
            <Button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className="rounded-full px-8 py-3 max-md:w-full"
            >
              <AnimatePresence mode="wait" initial={false}>
                {submitting ? (
                  <motion.span
                    key="loading"
                    className="flex items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span aria-live="polite">
                      Saving…
                      <span className="sr-only">Saving profile…</span>
                    </span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Save Profile
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}
