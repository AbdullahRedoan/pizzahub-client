"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, type OrderRecord } from "@/lib/api-client";

type OrdersResult = {
  key: string;
  orders: OrderRecord[];
  error: string;
};

/** Loads the signed-in customer's orders and exposes a simple refresh(). */
export function useCustomerOrders(email: string) {
  const [result, setResult] = useState<OrdersResult | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const key = `${email}:${reloadToken}`;
  const isLoading = result?.key !== key;
  const orders = result?.key === key ? result.orders : [];
  const error = result?.key === key ? result.error : "";

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    apiFetch<{ orders: OrderRecord[] }>("/api/customer/orders", {
      email,
      signal: controller.signal,
    })
      .then((data) => {
        if (!active) return;
        setResult({
          key,
          orders: Array.isArray(data.orders) ? data.orders : [],
          error: "",
        });
      })
      .catch((fetchError: unknown) => {
        if (!active) return;
        const name = fetchError instanceof Error ? fetchError.name : "";
        if (name === "AbortError") return;
        setResult({
          key,
          orders: [],
          error:
            fetchError instanceof Error
              ? fetchError.message
              : "We could not load your orders right now.",
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [email, key]);

  const refresh = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  return { orders, isLoading, error, refresh };
}
