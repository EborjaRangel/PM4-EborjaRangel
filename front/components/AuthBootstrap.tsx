"use client";

import { useEffect } from "react";
import { ensureBuiltInAdminAccount, ensureDemoClientUsers } from "@/lib/authStorage";

export default function AuthBootstrap() {
  useEffect(() => {
    ensureBuiltInAdminAccount();
    ensureDemoClientUsers();
  }, []);
  return null;
}
