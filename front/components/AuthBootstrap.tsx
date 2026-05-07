"use client";

import { useEffect } from "react";
import {
  migrateLegacyAuthStorage,
  refreshSessionProfile,
} from "@/lib/authStorage";

export default function AuthBootstrap() {
  useEffect(() => {
    migrateLegacyAuthStorage();
    void refreshSessionProfile();
  }, []);
  return null;
}
