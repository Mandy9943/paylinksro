"use client";
import { captureTokenFromHash } from "@/lib/api";
import React from "react";

const LayoutClient = ({ children }: { children: React.ReactNode }) => {
  // capture token once on mount
  React.useEffect(() => {
    captureTokenFromHash();
  }, []);
  return <>{children}</>;
};

export default LayoutClient;
