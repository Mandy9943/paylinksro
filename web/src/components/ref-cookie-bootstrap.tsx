"use client";

import { rememberRefFromUrl } from "@/lib/referral";
import { useEffect } from "react";

export default function RefCookieBootstrap() {
  useEffect(() => {
    rememberRefFromUrl();
  }, []);
  return null;
}
