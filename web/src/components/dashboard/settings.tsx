"use client";
import EmbeddedManagement from "@/app/dashboard/settings/embedded-management";
import EmbeddedOnboarding from "@/app/dashboard/settings/embedded-onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useStripeAccount } from "@/hooks/useStripeAccount";

export default function Settings() {
  const { isOnboarded } = useStripeAccount();
  return (
    <div className="max-w-4xl space-y-6">
      {!isOnboarded && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          Trebuie să-ți configurezi contul de plăți pentru a accesa toate
          funcționalitățile. Poți începe de aici sau din pagina dedicată de
          configurare.
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Setări cont</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">Nume companie</Label>
              <Input
                id="companyName"
                defaultValue="Exemplu SRL"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue="user@example.ro"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="cui">CUI</Label>
              <Input id="cui" placeholder="RO12345678" className="mt-2" />
            </div>

            <Button className="w-full paylink-button-primary">
              Actualizează profilul
            </Button>
          </CardContent>
        </Card>

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

            <div>
              <Label htmlFor="commission">Comision personalizat (%)</Label>
              <Input
                id="commission"
                type="number"
                defaultValue="2.0"
                step="0.1"
                min="0"
                max="5"
                className="mt-2"
              />
            </div>

            <Button
              variant="outline"
              className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
            >
              Salvează setările
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Securitate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Schimbă parola</h4>
              <div className="space-y-3">
                <Input type="password" placeholder="Parola curentă" />
                <Input type="password" placeholder="Parola nouă" />
                <Input type="password" placeholder="Confirmă parola nouă" />
                <Button className="w-full paylink-button-primary">
                  Actualizează parola
                </Button>
              </div>
            </div>

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
      {/* Stripe embedded components */}
      {/* <CreateProduct /> */}
      <EmbeddedOnboarding />
      <EmbeddedManagement />
    </div>
  );
}
