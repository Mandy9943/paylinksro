"use client";

import { requestMagicLink } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Mail, X } from "lucide-react";
import { useEffect, useState } from "react";
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0); // seconds remaining to allow resend

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    requestMagicLink(email)
      .then(() => {
        // Show an in-modal success screen instead of a toast
        setSent(true);
        setCooldown(30);
      })
      .catch((error: unknown) => {
        const description =
          error instanceof Error
            ? error.message
            : typeof error === "string"
            ? error
            : "A apărut o eroare";
        setErrorMsg(description);
      })
      .finally(() => setSubmitting(false));
  };

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => {
      setCooldown((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  // Optional: when the modal closes, reset success state and cooldown
  useEffect(() => {
    if (!isOpen) {
      setSent(false);
      setCooldown(0);
      setSubmitting(false);
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
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

          {sent ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-green-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verifică-ți emailul
              </h2>
              <p className="text-gray-600 mb-6">
                Ți-am trimis un link de autentificare{" "}
                {email ? `pe ${email}` : ""}.<br />
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="paylink-button-primary">
                  <a
                    href="https://mail.google.com/mail/?tab=rm&authuser=0&ogbl"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Open Email
                  </a>
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Nu găsești emailul? Verifică și folderul Spam/Promoții.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {isLogin
                    ? "Conectează-te la PayLink"
                    : "Creează cont PayLink"}
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

                {errorMsg ? (
                  <p className="text-sm text-red-600" role="alert">
                    {errorMsg}
                  </p>
                ) : null}

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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
