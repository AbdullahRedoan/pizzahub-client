"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Eye, EyeOff, Store, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { toast } from "sonner";
import { AuthAmbientBackdrop } from "@/components/auth/auth-ambient-backdrop";
import { useAuthSession } from "@/context/auth-context";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { getDashboardRouteByRole } from "@/lib/role-redirect";

type SocialProvider = "google" | "facebook";
type SignUpRole = "customer" | "vendor";

const SOCIAL_LABEL: Record<SocialProvider, string> = {
  google: "Google",
  facebook: "Facebook",
};

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",")[1] ?? "" : "");
    };
    reader.onerror = () => {
      reject(new Error("We could not read that photo."));
    };

    reader.readAsDataURL(file);
  });
}

export default function SignUpPage() {
  const router = useRouter();
  const { user, isPending, refetch } = useAuthSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<SignUpRole>("customer");
  const [businessName, setBusinessName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(
    null,
  );
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const passwordChecks = {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
  };
  const passwordValid =
    passwordChecks.length && passwordChecks.uppercase && passwordChecks.lowercase;

  useEffect(() => {
    if (!isPending && user) {
      router.replace(getDashboardRouteByRole(user.role));
    }
  }, [isPending, user, router]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setAvatarFile(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : null);
  }

  function clearAvatar() {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  }

  async function uploadAvatar(file: File): Promise<string | undefined> {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

    if (!apiKey) {
      toast.warning(
        "Photo upload is unavailable right now. We'll create your account without a profile photo.",
      );
      return undefined;
    }

    setUploadingPhoto(true);

    try {
      const base64Image = await readFileAsBase64(file);
      const uploadBody = new FormData();
      uploadBody.append("image", base64Image);

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${apiKey}`,
        { method: "POST", body: uploadBody },
      );
      const data = (await response.json()) as {
        data?: { url?: string };
        error?: { message?: string };
      };

      if (!response.ok || !data.data?.url) {
        throw new Error(data.error?.message || "Image upload failed");
      }

      return data.data.url;
    } catch (uploadError) {
      toast.warning(
        uploadError instanceof Error
          ? `${uploadError.message} Continuing without a profile photo.`
          : "We could not upload your photo. Continuing without a profile photo.",
      );
      return undefined;
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    if (name.trim().length < 2) {
      toast.error("Please enter your full name");
      return;
    }

    if (!passwordValid) {
      toast.error(
        "Password must be at least 6 characters with 1 uppercase and 1 lowercase letter",
      );
      return;
    }

    setSubmitting(true);

    try {
      const image = avatarFile ? await uploadAvatar(avatarFile) : undefined;

      const { error } = await authClient.signUp.email({
        name: name.trim(),
        email,
        password,
        image: image || undefined,
        role,
        ...(role === "vendor" && businessName.trim()
          ? { businessName: businessName.trim() }
          : {}),
      });

      if (error) {
        toast.error(error.message || "Could not create account");
        return;
      }

      await refetch();
      toast.success("Account created! Welcome to PizzaHub");
      router.push(getDashboardRouteByRole(role));
    } catch {
      toast.error("Could not create account");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSocial(provider: SocialProvider) {
    if (socialLoading || submitting || uploadingPhoto) return;

    setSocialLoading(provider);

    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });

      if (error) {
        toast.error(error.message || `Could not continue with ${SOCIAL_LABEL[provider]}`);
      }
    } catch {
      toast.error(`Could not continue with ${SOCIAL_LABEL[provider]}`);
    } finally {
      setSocialLoading(null);
    }
  }

  return (
    <main className="relative flex min-h-[calc(100vh-10rem)] items-center justify-center overflow-hidden px-4 py-12">
      <AuthAmbientBackdrop />
      <div className="relative z-10 w-full max-w-lg space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="space-y-2 text-center">
          <Link
            href="/"
            className="font-serif text-2xl font-bold italic tracking-tight text-foreground"
          >
            PizzaHub
          </Link>
          <p className="font-script text-2xl text-accent">
            Join the Neighborhood Table
          </p>
          <h1 className="font-serif text-3xl font-semibold italic text-foreground sm:text-4xl">
            Create Your Account
          </h1>
          <p className="font-sans text-sm text-foreground/70">
            Order from local ovens, or bring your own kitchen to the table.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          <div className="space-y-1.5">
            <label
              htmlFor="sign-up-name"
              className="block text-xs font-medium uppercase tracking-wide text-foreground/70"
            >
              Full Name
            </label>
            <input
              id="sign-up-name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="John Doe"
              className="w-full rounded-full border border-border bg-background px-5 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/50 focus:border-accent"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="sign-up-email"
              className="block text-xs font-medium uppercase tracking-wide text-foreground/70"
            >
              Email Address
            </label>
            <input
              id="sign-up-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-full border border-border bg-background px-5 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/50 focus:border-accent"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="sign-up-avatar"
              className="block text-xs font-medium uppercase tracking-wide text-foreground/70"
            >
              Profile Photo (Optional)
            </label>
            <div className="flex items-center gap-3">
              <input
                ref={avatarInputRef}
                id="sign-up-avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-xs text-foreground outline-none transition-colors file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-primary-foreground focus:border-accent"
              />
              {avatarPreview ? (
                <div className="flex shrink-0 items-center gap-2">
                  <Image
                    src={avatarPreview}
                    alt="Selected profile photo preview"
                    width={40}
                    height={40}
                    unoptimized
                    className="h-10 w-10 rounded-full border border-border object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearAvatar}
                    aria-label="Remove profile photo"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:text-accent"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-xs font-medium uppercase tracking-wide text-foreground/70">
              I&apos;m joining as
            </legend>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                aria-pressed={role === "customer"}
                onClick={() => setRole("customer")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-medium transition-colors",
                  role === "customer"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:text-accent",
                )}
              >
                <User className="h-4 w-4" />
                Customer
              </button>
              <button
                type="button"
                aria-pressed={role === "vendor"}
                onClick={() => setRole("vendor")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-medium transition-colors",
                  role === "vendor"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:text-accent",
                )}
              >
                <Store className="h-4 w-4" />
                Vendor (Restaurant Owner)
              </button>
            </div>
          </fieldset>

          <AnimatePresence initial={false}>
            {role === "vendor" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="space-y-1.5 pt-1">
                  <label
                    htmlFor="sign-up-business"
                    className="block text-xs font-medium uppercase tracking-wide text-foreground/70"
                  >
                    Business / Kitchen Name
                    <span className="ml-1 normal-case tracking-normal text-accent">
                      (recommended)
                    </span>
                  </label>
                  <input
                    id="sign-up-business"
                    type="text"
                    value={businessName}
                    onChange={(event) => setBusinessName(event.target.value)}
                    placeholder="Romano's Pizzeria"
                    className="w-full rounded-full border border-border bg-background px-5 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/50 focus:border-accent"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <label
              htmlFor="sign-up-password"
              className="block text-xs font-medium uppercase tracking-wide text-foreground/70"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="sign-up-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create a password"
                className="w-full rounded-full border border-border bg-background py-3 pl-5 pr-12 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/50 focus:border-accent"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:text-accent"
              >
                {showPassword ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            <ul className="flex flex-wrap gap-2 pt-1">
              {[
                { label: "6+ characters", met: passwordChecks.length },
                { label: "1 uppercase", met: passwordChecks.uppercase },
                { label: "1 lowercase", met: passwordChecks.lowercase },
              ].map((check) => (
                <li
                  key={check.label}
                  className={cn(
                    "flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[0.65rem] transition-colors",
                    check.met
                      ? "border-primary text-primary"
                      : "border-border text-foreground/60",
                  )}
                >
                  <Check className="h-3 w-3" />
                  {check.label}
                </li>
              ))}
            </ul>
          </div>

          <button
            type="submit"
            disabled={submitting || uploadingPhoto}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-primary bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploadingPhoto
              ? "Uploading photo..."
              : submitting
                ? "Creating account..."
                : "Create Account"}
            {!submitting && !uploadingPhoto && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="flex items-center gap-3 font-sans text-xs uppercase tracking-wide text-foreground/60">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="grid gap-3 font-sans sm:grid-cols-2">
          <button
            type="button"
            disabled={socialLoading !== null || submitting || uploadingPhoto}
            onClick={() => handleSocial("google")}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border font-serif text-xs font-bold text-accent">
              G
            </span>
            {socialLoading === "google" ? "Connecting..." : "Sign Up with Google"}
          </button>
          <button
            type="button"
            disabled={socialLoading !== null || submitting || uploadingPhoto}
            onClick={() => handleSocial("facebook")}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border font-serif text-xs font-bold text-accent">
              f
            </span>
            {socialLoading === "facebook"
              ? "Connecting..."
              : "Sign Up with Facebook"}
          </button>
        </div>

        <p className="text-center font-sans text-sm text-foreground/70">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
