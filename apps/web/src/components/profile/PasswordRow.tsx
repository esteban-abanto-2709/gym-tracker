"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { KeyRound, Pencil } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/base/button";
import { Spinner } from "@/components/base/spinner";
import {
  SettingsRowContent,
  settingsRowClass,
} from "@/components/profile/SettingsRow";

const MIN_LENGTH = 8;

export function PasswordRow() {
  const t = useTranslations();
  const { changePassword } = useAuth();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleOpenChange(value: boolean) {
    if (saving) return;
    if (!value) {
      setCurrent("");
      setNext("");
      setError(null);
    }
    setOpen(value);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (next.length < MIN_LENGTH) {
      setError(t("profile.password.tooShort", { min: MIN_LENGTH }));
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await changePassword(current, next);
      setSaving(false);
      handleOpenChange(false);
      toast.success(t("profile.password.changed"));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("auth.errors.changePasswordFailed"),
      );
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={settingsRowClass}
      >
        <SettingsRowContent
          Icon={KeyRound}
          label={t("profile.password.label")}
          value={t("profile.password.change")}
          Trailing={Pencil}
        />
      </button>

      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent className="rounded-2xl">
          <form onSubmit={onSubmit} className="grid gap-4">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display uppercase tracking-tight text-2xl">
                {t("profile.password.title")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("profile.password.message")}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-1.5">
              <Label htmlFor="current-password">
                {t("profile.password.current")}
              </Label>
              <PasswordInput
                id="current-password"
                autoComplete="current-password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-password">{t("profile.password.new")}</Label>
              <PasswordInput
                id="new-password"
                autoComplete="new-password"
                maxLength={72}
                value={next}
                onChange={(e) => setNext(e.target.value)}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl" disabled={saving}>
                {t("common.cancel")}
              </AlertDialogCancel>
              <Button
                size="md"
                type="submit"
                disabled={saving || !current || !next}
                className="py-2 flex disabled:opacity-60"
              >
                {saving && <Spinner className="size-4" />}
                {t("profile.password.save")}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
