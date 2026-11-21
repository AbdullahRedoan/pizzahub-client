"use client";

import { Lock, Save } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { MenuImage } from "@/components/menu/menu-image";
import { useAuthSession, type UserRole } from "@/context/auth-context";
import { apiFetch } from "@/lib/api-client";

type ProfileData = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  image?: string | null;
  role: UserRole;
  businessName?: string | null;
  subscriptionPlan: string;
  isBlocked?: boolean;
};

type ProfileResult = {
  key: string;
  profile: ProfileData | null;
  error: string;
};

function initialsFor(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function ProfileSettingsView() {
  const { user, refetch } = useAuthSession();
  const [result, setResult] = useState<ProfileResult | null>(null);
  const [saving, setSaving] = useState(false);

  const key = user?.email ?? "";
  const isLoading = result?.key !== key;
  const profile = result?.key === key ? result.profile : null;
  const error = result?.key === key ? result.error : "";

  useEffect(() => {
    if (!key) return;

    const controller = new AbortController();
    let active = true;

    apiFetch<{ user: ProfileData }>("/api/profile", {
      email: key,
      signal: controller.signal,
    })
      .then((data) => {
        if (active) setResult({ key, profile: data.user, error: "" });
      })
      .catch((fetchError: unknown) => {
        if (!active) return;
        const name = fetchError instanceof Error ? fetchError.name : "";
        if (name === "AbortError") return;
        setResult({
          key,
          profile: null,
          error:
            fetchError instanceof Error
              ? fetchError.message
              : "We could not load your profile right now.",
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [key]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || !profile) return;

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const image = String(formData.get("image") || "").trim();
    const businessName = String(formData.get("businessName") || "").trim();
    const payload = {
      name,
      image,
      ...(profile.role === "vendor" ? { businessName } : {}),
    };

    setSaving(true);

    try {
      const data = await apiFetch<{ user: ProfileData }>("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        email: key,
      });

      setResult({ key, profile: data.user, error: "" });
      await refetch();
      toast.success("Profile updated");
    } catch (updateError) {
      toast.error(
        updateError instanceof Error
          ? updateError.message
          : "We could not update your profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="h-4 w-32 rounded-full bg-foreground/10" />
        <div className="h-10 w-2/3 rounded-full bg-foreground/10" />
        <div className="h-24 w-full rounded-3xl bg-foreground/10" />
        <div className="h-11 w-full rounded-full bg-foreground/10" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="rounded-3xl border border-border bg-card p-10 text-center font-sans">
        <p className="font-script text-2xl text-accent">A little kitchen trouble</p>
        <h1 className="mt-2 font-serif text-2xl font-bold italic text-foreground">
          We could not load your profile
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-foreground/70">
          {error || "Please try again in a moment."}
        </p>
      </div>
    );
  }

  const formKey = [
    key,
    profile.name,
    profile.image ?? "",
    profile.businessName ?? "",
  ].join(":");

  const fieldClass =
    "w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/50 focus:border-accent";

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <p className="font-script text-2xl text-accent">Make it yours</p>
        <h1 className="mt-1 font-serif text-3xl font-bold italic text-foreground sm:text-4xl">
          Profile Settings
        </h1>
        <p className="mt-2 text-sm text-foreground/70">
          Update how your name and kitchen appear across PizzaHub.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-3xl border border-border bg-background p-4">
          {profile.image ? (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border">
              <MenuImage
                src={profile.image}
                alt={profile.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-border font-serif text-lg font-bold italic text-accent">
              {initialsFor(profile.name) || "PH"}
            </div>
          )}
          <div>
            <p className="font-serif text-xl font-bold italic text-foreground">
              {profile.name}
            </p>
            <p className="text-sm text-foreground/70">{profile.email}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium capitalize text-foreground/70">
            <Lock className="h-3 w-3" />
            Role: {profile.role}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium capitalize text-foreground/70">
            <Lock className="h-3 w-3" />
            Plan: {profile.subscriptionPlan}
          </span>
        </div>
        <p className="mt-2 text-xs text-foreground/60">
          Role and subscription plan are managed by PizzaHub administrators and
          billing — they cannot be changed here.
        </p>
      </div>

      <form
        key={formKey}
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-border bg-card p-6 font-sans sm:p-8"
      >
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-foreground/70">
            Full Name
          </span>
          <input
            name="name"
            type="text"
            required
            defaultValue={profile.name}
            className={fieldClass}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-foreground/70">
            Avatar URL{" "}
            <span className="normal-case tracking-normal text-foreground/50">
              (optional)
            </span>
          </span>
          <input
            name="image"
            type="text"
            defaultValue={profile.image ?? ""}
            placeholder="https://example.com/avatar.png"
            className={fieldClass}
          />
        </label>

        {profile.role === "vendor" && (
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-foreground/70">
              Business Name
            </span>
            <input
              name="businessName"
              type="text"
              required
              defaultValue={profile.businessName ?? ""}
              placeholder="Your kitchen name"
              className={fieldClass}
            />
          </label>
        )}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
