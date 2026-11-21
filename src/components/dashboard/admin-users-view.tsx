"use client";

import { Search, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useApiList } from "@/hooks/use-api-list";
import { apiFetch, type UserRecord, type UserRole } from "@/lib/api-client";

type AdminUsersViewProps = {
  email: string;
  currentUserId: string;
  currentUserEmail: string;
};

type RoleFilter = "all" | UserRole;

const ROLE_FILTERS: RoleFilter[] = ["all", "customer", "vendor", "admin"];

function formatDate(value?: string) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
}

export function AdminUsersView({
  email,
  currentUserId,
  currentUserEmail,
}: AdminUsersViewProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const query = new URLSearchParams();
  if (debouncedSearch) query.set("search", debouncedSearch);
  if (role !== "all") query.set("role", role);
  const queryString = query.toString();
  const path = `/api/admin/users${queryString ? `?${queryString}` : ""}`;

  const { items: users, isLoading, error, setItems } = useApiList<UserRecord>(
    email,
    path,
    "users",
  );

  async function handleBlock(user: UserRecord) {
    if (busyId) return;
    setBusyId(user._id);

    try {
      const data = await apiFetch<{ user: UserRecord }>(
        `/api/admin/users/${user._id}/block`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isBlocked: !user.isBlocked }),
          email,
        },
      );
      setItems(
        users.map((entry) =>
          entry._id === data.user._id ? data.user : entry,
        ),
      );
      toast.success(data.user.isBlocked ? "User blocked" : "User unblocked");
    } catch (blockError) {
      toast.error(
        blockError instanceof Error
          ? blockError.message
          : "We could not update this user.",
      );
    } finally {
      setBusyId(null);
    }
  }

  const fieldClass =
    "w-full rounded-full border border-border bg-background px-4 py-2.5 pl-10 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/50 focus:border-accent";

  return (
    <div className="space-y-6 font-sans">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <p className="font-script text-2xl text-accent">Know your guests</p>
        <h1 className="mt-1 font-serif text-3xl font-bold italic text-foreground sm:text-4xl">
          Manage Users
        </h1>
        <p className="mt-2 text-sm text-foreground/70">
          Search every account and block or restore access when needed.
        </p>
      </div>

      <div className="space-y-4 rounded-3xl border border-border bg-card p-5 sm:p-6">
        <label className="relative block">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email"
            className={fieldClass}
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {ROLE_FILTERS.map((filter) => {
            const active = role === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setRole(filter)}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium capitalize transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-foreground/70 hover:text-accent"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-24 rounded-3xl border border-border bg-card p-5"
            >
              <div className="h-4 w-1/3 rounded-full bg-foreground/10" />
              <div className="mt-4 h-3 w-1/2 rounded-full bg-foreground/10" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-border bg-card p-10 text-center">
          <p className="font-script text-2xl text-accent">A little kitchen trouble</p>
          <h2 className="mt-2 font-serif text-2xl font-bold italic text-foreground">
            We could not load the users
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-foreground/70">
            {error}
          </p>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-10 text-center">
          <p className="font-script text-2xl text-accent">No one at this table</p>
          <h2 className="mt-2 font-serif text-2xl font-bold italic text-foreground">
            No users match your filters
          </h2>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => {
            const isSelf =
              user._id === currentUserId ||
              user.email.toLowerCase() === currentUserEmail.toLowerCase();

            return (
              <article
                key={user._id}
                className="rounded-3xl border border-border bg-card p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-xl font-bold italic text-foreground">
                      {user.name}
                    </h2>
                    <p className="mt-1 break-all text-sm text-foreground/70">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-border px-3 py-1 text-xs font-medium capitalize text-foreground/70">
                      {user.role}
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${
                        user.isBlocked
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-primary text-primary"
                      }`}
                    >
                      {user.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                  <p className="text-xs text-foreground/60">
                    <span className="capitalize">{user.role}</span> · Joined{" "}
                    {formatDate(user.createdAt)}
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleBlock(user)}
                    disabled={isSelf || busyId === user._id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShieldAlert className="h-3 w-3" />
                    {isSelf
                      ? "Your Account"
                      : busyId === user._id
                        ? "Updating…"
                        : user.isBlocked
                          ? "Unblock"
                          : "Block"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
