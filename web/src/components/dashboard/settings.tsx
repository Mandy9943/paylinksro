"use client";
import EmbeddedManagement from "@/app/dashboard/settings/embedded-management";
import EmbeddedOnboarding from "@/app/dashboard/settings/embedded-onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useStripeAccount } from "@/hooks/useStripeAccount";

export default function Settings() {
  const { isOnboarded } = useStripeAccount();
  return (
    <div className="max-w-4xl space-y-6">
      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Setări plăți</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Transferuri automate</div>
              <div className="text-sm text-gray-500">
                Transfer zilnic automat
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Notificări email</div>
              <div className="text-sm text-gray-500">
                Pentru fiecare tranzacție
              </div>
            </div>
            <Switch />
          </div>

          <Button
            variant="outline"
            className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
          >
            Salvează setările
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Securitate</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <div>
              <h4 className="font-medium mb-3">Autentificare în doi pași</h4>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Protejează-ți contul cu un nivel suplimentar de securitate
                </p>
                <Button
                  variant="outline"
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                >
                  Activează 2FA
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {isOnboarded ? <EmbeddedManagement /> : <EmbeddedOnboarding />}
    </div>
  );
}
