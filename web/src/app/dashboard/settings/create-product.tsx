"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

export default function CreateProduct() {
  const [accountId, setAccountId] = useState<string>("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("10.00");
  const [currency, setCurrency] = useState("usd");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/v1/stripe/accounts/me`);
        setAccountId(data.id as string);
      } catch {}
    })();
  }, []);

  const submit = async () => {
    setMsg(null);
    const { data } = await api.post(`/v1/stripe/products`, {
      accountId,
      name,
      description,
      price: Number(price),
      currency,
    });
    setMsg(`Created product ${data.product.id}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create product (connected)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Connected account is resolved automatically from your user mapping */}
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>Description</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Price</Label>
            <Input value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div>
            <Label>Currency</Label>
            <Input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={submit}>Create product</Button>
        {msg && <div className="text-sm text-green-600">{msg}</div>}
      </CardContent>
    </Card>
  );
}
