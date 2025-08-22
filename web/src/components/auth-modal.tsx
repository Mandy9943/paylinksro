"use client";

import { requestMagicLink } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    requestMagicLink(email)
      .then(() => {
        toast("Verifică emailul", {
          description:
            "Ți-am trimis un link de autentificare. Dă click pe el pentru a continua.",
        });
        onClose();
      })
      .catch((error: unknown) => {
        const description =
          error instanceof Error
            ? error.message
            : typeof error === "string"
            ? error
            : "A apărut o eroare";
        toast("Eroare", { description });
      })
      .finally(() => setSubmitting(false));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? "Conectează-te la PayLink" : "Creează cont PayLink"}
            </h2>
            <p className="text-gray-600">
              {isLogin
                ? "Introdu datele tale pentru a continua"
                : "Completează formularul pentru a începe"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplu@email.ro"
                required
                className="mt-2"
              />
            </div>

            {/* Password removed: magic link flow only needs email */}

            <Button
              type="submit"
              className="w-full paylink-button-primary"
              disabled={submitting}
            >
              {submitting
                ? "Se procesează..."
                : isLogin
                ? "Conectează-te"
                : "Creează cont"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "Nu ai cont?" : "Ai deja cont?"}{" "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 font-medium hover:underline"
              >
                {isLogin ? "Înregistrează-te" : "Conectează-te"}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
