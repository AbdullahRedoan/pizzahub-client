"use client";

import { Receipt } from "lucide-react";
import { useApiList } from "@/hooks/use-api-list";
import type { TransactionRecord } from "@/lib/api-client";

type AdminTransactionsViewProps = {
  email: string;
};

function formatDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

export function AdminTransactionsView({ email }: AdminTransactionsViewProps) {
  const { items: transactions, isLoading, error } = useApiList<TransactionRecord>(
    email,
    "/api/admin/transactions",
    "transactions",
  );

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4 font-sans">
        <div className="h-28 rounded-3xl border border-border bg-card p-6" />
        <div className="h-72 rounded-3xl border border-border bg-card p-6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-border bg-card p-10 text-center font-sans">
        <p className="font-script text-2xl text-accent">A little kitchen trouble</p>
        <h2 className="mt-2 font-serif text-2xl font-bold italic text-foreground">
          We could not load the transactions
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-foreground/70">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <p className="font-script text-2xl text-accent">The ledger</p>
        <h1 className="mt-1 font-serif text-3xl font-bold italic text-foreground sm:text-4xl">
          Transactions
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-foreground/70">
          A read-only record of confirmed Premium upgrades across PizzaHub.
        </p>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-10 text-center">
          <Receipt className="mx-auto h-6 w-6 text-accent" />
          <p className="mt-3 font-script text-2xl text-accent">No entries yet</p>
          <h2 className="mt-1 font-serif text-2xl font-bold italic text-foreground">
            The ledger is empty
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-foreground/70">
            Confirmed payments will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-foreground/60">
              <tr>
                <th className="px-5 py-4 font-medium">Vendor Name</th>
                <th className="px-5 py-4 font-medium">Plan</th>
                <th className="px-5 py-4 font-medium">Amount</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Stripe Session ID</th>
                <th className="px-5 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction._id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-5 py-4 font-serif font-semibold italic text-foreground">
                    {transaction.vendorName || "—"}
                  </td>
                  <td className="px-5 py-4 capitalize text-foreground/80">
                    {transaction.plan}
                  </td>
                  <td className="px-5 py-4 font-serif font-semibold italic text-primary">
                    {transaction.currency} {transaction.amount.toFixed(2)}
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full border border-primary bg-primary px-3 py-1 text-xs font-medium capitalize text-primary-foreground">
                      {transaction.status}
                    </span>
                  </td>
                  <td className="max-w-[200px] truncate px-5 py-4 font-mono text-xs text-foreground/70">
                    {transaction.stripeSessionId}
                  </td>
                  <td className="px-5 py-4 text-xs text-foreground/70">
                    {formatDate(transaction.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-foreground/60">
        This ledger is view-only. Payment records are managed by the Stripe
        webhook and cannot be edited here.
      </p>
    </div>
  );
}
