"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ADMIN_AUTH_EVENT, ADMIN_AUTH_STORAGE_KEY } from "@/lib/admin-client";

function readAdminHash() {
  if (typeof window === "undefined") {
    return "";
  }

  return sessionStorage.getItem(ADMIN_AUTH_STORAGE_KEY) ?? "";
}

export function useAdminAuth() {
  const [adminHash, setAdminHashState] = useState("");

  useEffect(() => {
    setAdminHashState(readAdminHash());

    const syncAdminHash = () => {
      setAdminHashState(readAdminHash());
    };

    window.addEventListener("storage", syncAdminHash);
    window.addEventListener(ADMIN_AUTH_EVENT, syncAdminHash);

    return () => {
      window.removeEventListener("storage", syncAdminHash);
      window.removeEventListener(ADMIN_AUTH_EVENT, syncAdminHash);
    };
  }, []);

  const setAdminHash = useCallback((value: string) => {
    const normalizedValue = value.trim().toLowerCase();

    if (!normalizedValue) {
      sessionStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
      setAdminHashState("");
      window.dispatchEvent(new Event(ADMIN_AUTH_EVENT));
      return;
    }

    sessionStorage.setItem(ADMIN_AUTH_STORAGE_KEY, normalizedValue);
    setAdminHashState(normalizedValue);
    window.dispatchEvent(new Event(ADMIN_AUTH_EVENT));
  }, []);

  const isAdmin = useMemo(() => Boolean(adminHash), [adminHash]);

  return { adminHash, isAdmin, setAdminHash };
}
