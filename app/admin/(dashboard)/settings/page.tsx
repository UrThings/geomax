import type { Metadata } from "next";
import { SettingsForm, PasswordForm } from "@/components/admin/settings-form";
import { getSettings } from "@/lib/site";
import {
  changeAdminPasswordAction,
  updateSettingsAction,
} from "@/lib/actions/admin";

export const metadata: Metadata = {
  title: "Тохиргоо — Админ",
};

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Тохиргоо</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Сайтын ерөнхий мэдээлэл, холбоо барих, нууц үг
        </p>
      </div>

      <SettingsForm
        defaultValues={{
          ownerName: settings.ownerName,
          siteTitle: settings.siteTitle ?? "",
          siteTagline: settings.siteTagline ?? "",
          phone: settings.phone ?? "",
          facebookUrl: settings.facebookUrl ?? "",
          messengerUrl: settings.messengerUrl ?? "",
          instagramUrl: settings.instagramUrl ?? "",
          email: settings.email ?? "",
          location: settings.location ?? "",
          bio: settings.bio ?? "",
        }}
        action={updateSettingsAction}
      />

      <PasswordForm action={changeAdminPasswordAction} />
    </div>
  );
}