"use client";

import { ImagePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  isFreePlan,
  useFreePlanRedirect,
} from "@/hooks/use-free-plan-redirect";
import { useApiList } from "@/hooks/use-api-list";
import { apiFetch, type MenuItem } from "@/lib/api-client";
import { CATEGORY_OPTIONS } from "@/lib/menu-filters";

type VendorAddItemViewProps = {
  email: string;
  subscriptionPlan: string;
};

const EDITORIAL_CATEGORIES = CATEGORY_OPTIONS.filter(
  (option) => option !== "All Categories",
);

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",")[1] ?? "" : "");
    };
    reader.onerror = () => {
      reject(new Error("We could not read that image file."));
    };

    reader.readAsDataURL(file);
  });
}

export function VendorAddItemView({
  email,
  subscriptionPlan,
}: VendorAddItemViewProps) {
  const router = useRouter();
  const redirectToSubscription = useFreePlanRedirect();
  const { items } = useApiList<MenuItem>(
    email,
    "/api/vendor/menu-items",
    "items",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [directUrl, setDirectUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fieldClass =
    "w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/50 focus:border-accent";

  const freePlanIsFull =
    isFreePlan(subscriptionPlan) &&
    items.filter((item) => item.active).length >= 3;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || uploading) return;

    if (freePlanIsFull) {
      redirectToSubscription();
      return;
    }

    const formData = new FormData(event.currentTarget);
    const itemName = String(formData.get("itemName") || "").trim();
    const category = String(formData.get("category") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const price = Number(formData.get("price"));
    const location = String(formData.get("location") || "").trim();

    if (
      !itemName ||
      !category ||
      !description ||
      !location ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      toast.error("Please complete every field with a positive price");
      return;
    }

    let imageUrl = directUrl.trim();

    if (imageFile) {
      const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

      if (!apiKey) {
        toast.error("Please configure NEXT_PUBLIC_IMGBB_API_KEY to upload images");
        if (!imageUrl) return;
      } else {
        setUploading(true);

        try {
          const base64Image = await readFileAsBase64(imageFile);
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

          imageUrl = data.data.url;
        } catch (uploadError) {
          toast.error(
            uploadError instanceof Error
              ? uploadError.message
              : "We could not upload that image.",
          );
          return;
        } finally {
          setUploading(false);
        }
      }
    }

    if (!imageUrl) {
      toast.error("Please choose an image or provide a direct image URL");
      return;
    }

    setSubmitting(true);

    try {
      await apiFetch<{ item: MenuItem }>("/api/vendor/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemName,
          category,
          description,
          price,
          location,
          images: [imageUrl],
        }),
        email,
      });

      toast.success("Menu item submitted! Status: Pending admin approval");
      router.push("/dashboard/vendor/my-items");
    } catch (submitError) {
      if (redirectToSubscription(submitError)) return;
      toast.error(
        submitError instanceof Error
          ? submitError.message
          : "We could not submit this menu item.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <p className="font-script text-2xl text-accent">Add to the menu</p>
        <h1 className="mt-1 font-serif text-3xl font-bold italic text-foreground sm:text-4xl">
          New Menu Item
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-foreground/70">
          Share a new creation with the neighborhood. Every item is reviewed by
          an admin before it goes live.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-border bg-card p-6 sm:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-foreground/70">
              Item Name
            </span>
            <input
              name="itemName"
              type="text"
              required
              placeholder="Truffle Mushroom Pizza"
              className={fieldClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-foreground/70">
              Category
            </span>
            <select name="category" required defaultValue="" className={fieldClass}>
              <option value="" disabled>
                Choose a category
              </option>
              {EDITORIAL_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-foreground/70">
              Price
            </span>
            <input
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              required
              placeholder="12.00"
              className={fieldClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-foreground/70">
              Location
            </span>
            <input
              name="location"
              type="text"
              required
              placeholder="Dhanmondi, Dhaka"
              className={fieldClass}
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-foreground/70">
            Description
          </span>
          <textarea
            name="description"
            required
            rows={4}
            placeholder="Tell customers what makes this pie special..."
            className="w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/50 focus:border-accent"
          />
        </label>

        <div className="grid gap-5 rounded-3xl border border-border bg-background p-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-foreground/70">
              Item Image
            </span>
            <input
              type="file"
              accept="image/*"
              required={!directUrl.trim()}
              onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
              className="w-full rounded-full border border-border bg-card px-4 py-2.5 text-xs text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-1.5 file:text-primary-foreground"
            />
            {imageFile ? (
              <span className="mt-2 block truncate text-xs text-foreground/60">
                Selected: {imageFile.name}
              </span>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-foreground/70">
              Direct Image URL
            </span>
            <input
              type="text"
              value={directUrl}
              onChange={(event) => setDirectUrl(event.target.value)}
              placeholder="https://example.com/pizza.jpg"
              className={fieldClass}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting || uploading}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-70"
        >
          <ImagePlus className="h-4 w-4" />
          {uploading
            ? "Uploading image…"
            : submitting
              ? "Submitting…"
              : "Submit Menu Item"}
        </button>
      </form>
    </div>
  );
}
