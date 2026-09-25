"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { settingsSchema, type SettingsInput } from "@/lib/validations";

type SettingsFormValues = {
  ownerName: string;
  siteTitle: string;
  siteTagline: string;
  phone: string;
  facebookUrl: string;
  messengerUrl: string;
  instagramUrl: string;
  email: string;
  location: string;
  bio: string;
};

type SettingsFormProps = {
  defaultValues: SettingsFormValues;
  action: (input: SettingsInput) => Promise<{ error?: string } | undefined>;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

export function SettingsForm({ defaultValues, action }: SettingsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema) as unknown as Resolver<SettingsFormValues>,
    defaultValues,
  });

  const [saveStatus, setSaveStatus] = React.useState<
    { ok: boolean; message: string } | null
  >(null);

  async function onSubmit(values: SettingsFormValues) {
    setSaveStatus(null);
    const result = await action(values as unknown as SettingsInput);
    if (result?.error) {
      setSaveStatus({ ok: false, message: result.error });
    } else {
      setSaveStatus({ ok: true, message: "Тохиргоо хадгалагдлаа." });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-4 sm:p-6">
        <h2 className="mb-4 text-base font-semibold">Сайтын ерөнхий мэдээлэл</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="settings-owner">Эзэмшигчийн нэр *</Label>
            <Input
              id="settings-owner"
              {...register("ownerName")}
              placeholder="Жишээ: Бат-Эрдэнэ"
              className="mt-2"
            />
            <FieldError message={errors.ownerName?.message} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="settings-title">Сайтын гарчиг</Label>
              <Input
                id="settings-title"
                {...register("siteTitle")}
                placeholder="Жишээ: Geomax"
                className="mt-2"
              />
              <FieldError message={errors.siteTitle?.message} />
            </div>
            <div>
              <Label htmlFor="settings-location">Байршил</Label>
              <Input
                id="settings-location"
                {...register("location")}
                placeholder="УБ, Сүхбаатар дүүрэг"
                className="mt-2"
              />
              <FieldError message={errors.location?.message} />
            </div>
          </div>
          <div>
            <Label htmlFor="settings-tagline">Уриа үг (слоган)</Label>
            <Input
              id="settings-tagline"
              {...register("siteTagline")}
              placeholder="Сонгож үзээд, шууд холбогдоорой."
              className="mt-2"
            />
            <FieldError message={errors.siteTagline?.message} />
          </div>
          <div>
            <Label htmlFor="settings-bio">Миний тухай</Label>
            <Textarea
              id="settings-bio"
              rows={4}
              {...register("bio")}
              placeholder="Өөрийн танилцуулга..."
              className="mt-2"
            />
            <FieldError message={errors.bio?.message} />
          </div>
        </div>
      </Card>

      <Card className="p-4 sm:p-6">
        <h2 className="mb-4 text-base font-semibold">Холбоо барих</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="settings-phone">Утасны дугаар</Label>
            <Input
              id="settings-phone"
              {...register("phone")}
              placeholder="+976 9911 2233"
              className="mt-2"
            />
            <FieldError message={errors.phone?.message} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="settings-facebook">Facebook холбоос</Label>
              <Input
                id="settings-facebook"
                type="url"
                {...register("facebookUrl")}
                placeholder="https://facebook.com/yourpage"
                className="mt-2"
              />
              <FieldError message={errors.facebookUrl?.message} />
            </div>
            <div>
              <Label htmlFor="settings-messenger">Messenger холбоос</Label>
              <Input
                id="settings-messenger"
                type="url"
                {...register("messengerUrl")}
                placeholder="https://m.me/yourusername"
                className="mt-2"
              />
              <FieldError message={errors.messengerUrl?.message} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="settings-instagram">Instagram холбоос</Label>
              <Input
                id="settings-instagram"
                type="url"
                {...register("instagramUrl")}
                placeholder="https://instagram.com/yourpage"
                className="mt-2"
              />
              <FieldError message={errors.instagramUrl?.message} />
            </div>
            <div>
              <Label htmlFor="settings-email">Имэйл</Label>
              <Input
                id="settings-email"
                type="email"
                {...register("email")}
                placeholder="you@example.com"
                className="mt-2"
              />
              <FieldError message={errors.email?.message} />
            </div>
          </div>
        </div>
      </Card>

      {saveStatus ? (
        <p
          className={
            saveStatus.ok
              ? "rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
              : "rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          }
        >
          {saveStatus.message}
        </p>
      ) : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Хадгалж байна...
          </>
        ) : (
          "Тохиргоог хадгалах"
        )}
      </Button>
    </form>
  );
}

type PasswordFormProps = {
  action: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ error?: string } | undefined>;
};

export function PasswordForm({ action }: PasswordFormProps) {
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (next.length < 8) {
      setError("Нууц үг доод тал нь 8 тэмдэгт байх ёстой.");
      return;
    }
    if (next !== confirm) {
      setError("Нууц үгийн баталгаажуулалт тохирохгүй байна.");
      return;
    }
    setPending(true);
    setError(null);
    action(current, next)
      .then((result) => {
        if (result?.error) setError(result.error);
      })
      .finally(() => setPending(false));
  }

  return (
    <Card className="p-4 sm:p-6">
      <h2 className="text-base font-semibold">Админ нууц үг солих</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Нууц үг сольсноор дахин нэвтрэх шаардлагатай болно.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <Label htmlFor="pw-current">Одоогийн нууц үг</Label>
          <Input
            id="pw-current"
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(event) => setCurrent(event.target.value)}
            className="mt-2"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="pw-new">Шинэ нууц үг</Label>
            <Input
              id="pw-new"
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(event) => setNext(event.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="pw-confirm">Шинэ нууц үг (дахин)</Label>
            <Input
              id="pw-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className="mt-2"
            />
          </div>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Separator />
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Солиж байна...
            </>
          ) : (
            "Нууц үг солих"
          )}
        </Button>
      </form>
    </Card>
  );
}