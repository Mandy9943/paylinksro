"use client";
import { requestPayoutAllWithDetails } from "@/api/affiliates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAffiliateSummary } from "@/hooks/use-affiliates";
import {
  Copy,
  DollarSign,
  ExternalLink,
  Eye,
  Mail,
  MessageCircle,
  Share2,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

function formatRON(minor: number | undefined | null) {
  const v = (minor ?? 0) / 100;
  return `RON ${v.toFixed(2)}`;
}

// simple mapping helper
const statusBadge = (s: string) =>
  s === "AVAILABLE" || s === "PAID"
    ? "Activ"
    : s === "PENDING"
    ? "În așteptare"
    : s;

const promotionalMaterials = [
  {
    type: "Banner 728x90",
    description: "Header banner pentru website-uri",
    downloadUrl: "#",
    preview: "🖼️",
  },
  {
    type: "Banner 300x250",
    description: "Banner pătrățos pentru sidebar",
    downloadUrl: "#",
    preview: "🖼️",
  },
  {
    type: "Email Template",
    description: "Template pentru email marketing",
    downloadUrl: "#",
    preview: "📧",
  },
  {
    type: "Social Media Kit",
    description: "Postări pentru Facebook, Instagram",
    downloadUrl: "#",
    preview: "📱",
  },
];

export default function AffiliateProgram() {
  const { data, refresh } = useAffiliateSummary();
  const referralLink = useMemo(() => {
    const code = data?.code || "";
    // Using ref param in URL per backend contract
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://paylink.ro";
    return code ? `${origin}/?ref=${encodeURIComponent(code)}` : `${origin}/`;
  }, [data?.code]);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Link-ul de afiliere a fost copiat în clipboard.");
  };

  const shareLink = (platform: string) => {
    const text =
      "Descoperă PayLink - cea mai simplă modalitate de a primi plăți online! Încearcă acum:";
    const urls = {
      facebook: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        referralLink
      )}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(referralLink)}`,
      linkedin: `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        referralLink
      )}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(
        text + " " + referralLink
      )}`,
    };

    window.open(
      urls[platform as keyof typeof urls],
      "_blank",
      "width=600,height=400"
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}

      {/* Hero Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Transformă rețeaua ta în venit
                  </h3>
                  <p className="text-slate-600">
                    Câștigă 0.5% din fiecare tranzacție a prietenilor tăi,
                    pentru totdeauna!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 max-w-md">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-2 mx-auto">
                    <Target className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">
                    Promovează
                  </p>
                  <p className="text-xs text-slate-600">Distribuie link-ul</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2 mx-auto">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">
                    Conectează
                  </p>
                  <p className="text-xs text-slate-600">Prietenii se înscriu</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-2 mx-auto">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">Câștigi</p>
                  <p className="text-xs text-slate-600">0.5% pe viață</p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-emerald-600 mb-1">
                  {formatRON(data?.totals?.lifetimeEarned)}
                </div>
                <p className="text-sm text-slate-600 mb-3">Câștiguri totale</p>
                <div className="text-lg font-semibold text-slate-900">
                  {formatRON(data?.totals?.available)}
                </div>
                <p className="text-xs text-slate-500 mb-3">Disponibil</p>
                <BankWithdraw
                  available={data?.totals?.available ?? 0}
                  onDone={async () => {
                    await refresh();
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">Referrals Totale</p>
                <div className="text-2xl font-bold text-slate-900">
                  {data?.totals?.referrals ?? 0}
                </div>
                <p className="text-xs text-emerald-600 font-medium">
                  +5 luna aceasta
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">Rata de Conversie</p>
                <div className="text-2xl font-bold text-slate-900">—</div>
                <p className="text-xs text-slate-600">În curând</p>
              </div>
              <div className="p-2 bg-emerald-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">
                  Click-Through Rate
                </p>
                <div className="text-2xl font-bold text-slate-900">—</div>
                <p className="text-xs text-emerald-600 font-medium">
                  Performanță excelentă
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">Referrals Active</p>
                <div className="text-2xl font-bold text-slate-900">—</div>
                <p className="text-xs text-slate-600">Utilizatori activi</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Zap className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link Section */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
            <Share2 className="w-5 h-5 mr-2 text-blue-600" />
            Link-ul tău de afiliere
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Input
                value={referralLink}
                readOnly
                className="flex-1 bg-slate-50 border-slate-200 text-sm"
              />
              <Button
                onClick={copyReferralLink}
                variant="outline"
                size="sm"
                className="gap-1.5 h-9 px-4 text-xs border-slate-200 hover:bg-slate-50"
              >
                <Copy className="w-3.5 h-3.5" />
                Copiază
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">Distribuie pe:</span>
              <Button
                onClick={() => shareLink("facebook")}
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
              >
                Facebook
              </Button>
              <Button
                onClick={() => shareLink("twitter")}
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs border-slate-200 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-700"
              >
                Twitter
              </Button>
              <Button
                onClick={() => shareLink("linkedin")}
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700"
              >
                LinkedIn
              </Button>
              <Button
                onClick={() => shareLink("whatsapp")}
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs border-slate-200 hover:bg-green-50 hover:border-green-200 hover:text-green-700"
              >
                WhatsApp
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Referrals */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900">
              Referrals Recente
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-b border-slate-200/60">
                  <TableHead className="text-xs font-medium text-slate-600 py-2 px-3">
                    Client
                  </TableHead>
                  <TableHead className="text-xs font-medium text-slate-600 py-2 px-3">
                    Prima Achiziție
                  </TableHead>
                  <TableHead className="text-xs font-medium text-slate-600 py-2 px-3">
                    Comision
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.recent?.commissions || []).map((c, index) => (
                  <TableRow
                    key={c.id}
                    className={`border-b border-slate-100 hover:bg-slate-50/30 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50/20"
                    }`}
                  >
                    <TableCell className="py-2 px-3">
                      <div>
                        <p className="font-medium text-slate-900 text-sm">
                          {c.referred?.email || "—"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(c.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 px-3">
                      <div className="text-xs font-medium text-slate-900">
                        —
                      </div>
                    </TableCell>
                    <TableCell className="py-2 px-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-emerald-600">
                          {formatRON(c.amount)}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-xs px-2 py-0.5 border-0 ${
                            c.status === "AVAILABLE" || c.status === "PAID"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {statusBadge(c.status)}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Promotional Materials */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900">
              Materiale Promoționale
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {promotionalMaterials.map((material, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg border border-slate-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{material.preview}</div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">
                        {material.type}
                      </p>
                      <p className="text-xs text-slate-600">
                        {material.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-8 px-3 text-xs border-slate-200 hover:bg-slate-50"
                    onClick={() => {
                      if (material.downloadUrl) {
                        window.open(material.downloadUrl, "_blank");
                      }
                    }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Descarcă
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900 text-sm mb-1">
                    Ai nevoie de suport personalizat?
                  </h4>
                  <p className="text-xs text-slate-600 mb-3">
                    Echipa noastră te poate ajuta să creezi materiale custom
                    pentru audiența ta.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs border-blue-200 hover:bg-blue-50"
                  >
                    <Mail className="w-3.5 h-3.5 mr-1" />
                    Contactează-ne
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BankWithdraw({
  available,
  onDone,
}: {
  available: number;
  onDone: () => Promise<void> | void;
}) {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState("");
  const minThreshold = 5000; // 50 RON in minor units
  const canWithdraw = available >= minThreshold;
  return (
    <div className="space-y-2">
      <Input
        placeholder="Detalii bancare (IBAN, nume, bancă) — necesare pentru retragere"
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        disabled={loading}
      />
      <Button
        onClick={async () => {
          if (!canWithdraw || details.trim().length === 0) return;
          try {
            setLoading(true);
            await requestPayoutAllWithDetails(details.trim());
            toast.success("Cerere de retragere trimisă.");
            await onDone();
            setDetails("");
          } catch (err: unknown) {
            let msg = "Eroare la retragere";
            if (
              typeof err === "object" &&
              err !== null &&
              "response" in err &&
              typeof (err as { response?: unknown }).response === "object" &&
              (err as { response?: { data?: unknown } }).response?.data &&
              typeof (
                err as {
                  response: {
                    data?: { error?: { message?: string } };
                  };
                }
              ).response.data === "object"
            ) {
              const data = (
                err as {
                  response: {
                    data: { error?: { message?: string } };
                  };
                }
              ).response.data as { error?: { message?: string } };
              msg = data?.error?.message ?? msg;
            }
            toast.error(msg);
          } finally {
            setLoading(false);
          }
        }}
        disabled={!canWithdraw || loading || details.trim().length === 0}
        className="w-full paylink-button-primary"
      >
        {loading
          ? "Se procesează..."
          : canWithdraw
          ? "Cere retragerea"
          : "Minim 50 RON pentru retragere"}
      </Button>
    </div>
  );
}
