"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/lib/actions/admin";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(
    (_previousState: { error?: string } | null, formData: FormData) =>
      loginAction(formData),
    null
  );

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <div className="p-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Сайт руу буцах
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="mt-5 text-center text-xl font-bold">Админ руу нэвтрэх</h1>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              Бараа, категори, тохиргоог удирдах бол энд нэвтэрнэ үү.
            </p>

            <form action={formAction} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="login-email">Имэйл хаяг</Label>
                <Input
                  id="login-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  required
                  placeholder="admin@example.com"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="login-password">Нууц үг</Label>
                <Input
                  id="login-password"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  placeholder="Нууц үг"
                  className="mt-2"
                />
              </div>

              {state?.error ? (
                <p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {state.error}
                </p>
              ) : null}

              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Нэвтэрч байна...
                  </>
                ) : (
                  "Нэвтрэх"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}