"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";

type ListState<T> = {
  key: string;
  items: T[];
  error: string;
};

/**
 * Shared API-backed list state for dashboard views. Changing the email or path
 * starts a fresh request; refresh() re-runs the current one.
 */
export function useApiList<T>(email: string, path: string, rootKey: string) {
  const [state, setState] = useState<ListState<T> | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const key = `${email}:${path}:${reloadToken}`;
  const isLoading = state?.key !== key;
  const items = state?.key === key ? state.items : [];
  const error = state?.key === key ? state.error : "";

  useEffect(() => {
    if (!email) return;

    const controller = new AbortController();
    let active = true;

    apiFetch<Record<string, unknown>>(path, {
      email,
      signal: controller.signal,
    })
      .then((data) => {
        if (!active) return;
        const value = data[rootKey];
        setState({
          key,
          items: Array.isArray(value) ? (value as T[]) : [],
          error: "",
        });
      })
      .catch((fetchError: unknown) => {
        if (!active) return;
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          return;
        }
        setState({
          key,
          items: [],
          error:
            fetchError instanceof Error
              ? fetchError.message
              : "We could not load this data right now.",
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [email, key, path, rootKey]);

  const refresh = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  const setItems = useCallback(
    (next: T[]) => {
      setState({ key, items: next, error: "" });
    },
    [key],
  );

  return { items, isLoading, error, refresh, setItems };
}
