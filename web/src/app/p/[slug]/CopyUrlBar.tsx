"use client";

import { useState } from "react";
import { Lock, Copy, Check } from "lucide-react";

export default function CopyUrlBar({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const url = `paylink.ro/p/${slug}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-5xl mx-auto mb-4 md:mb-6">
      <div className="flex items-center justify-between gap-2 text-xs md:text-sm text-gray-600 bg-white rounded-lg px-3 md:px-4 py-2 shadow-sm border">
        <div className="flex items-center gap-2 min-w-0">
          <Lock className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
          <span className="truncate">{url}</span>
        </div>
        <button
          onClick={copyToClipboard}
          className={`flex-shrink-0 p-1.5 rounded-md transition-colors duration-200 group ${
            copied ? "bg-green-100" : "hover:bg-gray-100"
          }`}
          title={copied ? "Copiat!" : "Copiază URL"}
          aria-label="copy-url"
          type="button"
        >
          {copied ? (
            <Check className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
          ) : (
            <Copy className="w-3 h-3 md:w-4 md:h-4 text-gray-500 group-hover:text-gray-700" />
          )}
        </button>
      </div>
    </div>
  );
}
