"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Copy, Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import CreatePaymentLinkModal from "./create-payment-link-modal";

export default function PaymentLinks() {
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renamePending, setRenamePending] = useState(false);
  // Removed react-query usage

  type Link = {
    id: string;
    productName: string;
    active: boolean;
    priceType: "fixed" | "flexible";
    amount?: number;
    createdAt: string;
    slug: string;
  };
  const data: Link[] = [
    {
      id: "pl_1",
      productName: "Logo Design Basic",
      active: true,
      priceType: "fixed",
      amount: 199.99,
      createdAt: "2025-08-01T12:30:00.000Z",
      slug: "logo-design-basic",
    },
    {
      id: "pl_2",
      productName: "Consultanță 1h",
      active: true,
      priceType: "flexible",
      createdAt: "2025-07-28T09:10:00.000Z",
      slug: "consultanta-1h",
    },
    {
      id: "pl_3",
      productName: "Website Landing Page",
      active: false,
      priceType: "fixed",
      amount: 1499,
      createdAt: "2025-07-15T16:45:00.000Z",
      slug: "website-landing",
    },
    {
      id: "pl_4",
      productName: "Ebook: Ghid Freelancing",
      active: true,
      priceType: "fixed",
      amount: 49.9,
      createdAt: "2025-07-10T08:00:00.000Z",
      slug: "ebook-ghid-freelancing",
    },
    {
      id: "pl_5",
      productName: "Donație proiect",
      active: true,
      priceType: "flexible",
      createdAt: "2025-06-30T10:20:00.000Z",
      slug: "donatie-proiect",
    },
  ];
  const isLoading = false;

  const copyUrl = async (slug: string) => {
    const url = `${window.location.origin}/p/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copiat");
    } catch {
      toast.error("Copiere eșuată");
    }
  };

  const previewUrl = (slug: string) => {
    const url = `${window.location.origin}/p/${slug}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const startRename = (id: string, current: string) => {
    setRenameId(id);
    setRenameValue(current);
    setRenameOpen(true);
  };

  const submitRename = async () => {
    if (!renameId) return;
    try {
      setRenamePending(true);
      // TODO: call API to rename
      setRenameOpen(false);
    } finally {
      setRenamePending(false);
    }
  };

  const onDuplicate = async () => {};

  const onToggleActive = async () => {};

  const onDelete = async () => {};

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">Creează și gestionează</p>
          <h2 className="text-xl font-semibold text-slate-900">
            Link-uri de plată
          </h2>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Creează link
        </Button>
      </div>

      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-sm text-slate-600">Se încarcă...</div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-b border-slate-200/60">
                  <TableHead className="text-xs font-medium text-slate-600 py-3 px-4">
                    Nume
                  </TableHead>
                  <TableHead className="text-xs font-medium text-slate-600 py-3 px-4">
                    Preț
                  </TableHead>
                  <TableHead className="text-xs font-medium text-slate-600 py-3 px-4">
                    Creat
                  </TableHead>
                  <TableHead className="w-12 py-3 px-4"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((link, index) => (
                  <TableRow
                    key={link.id}
                    className={`border-b border-slate-100 hover:bg-slate-50/30 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50/20"
                    }`}
                  >
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-slate-900 text-sm">
                          {link.productName}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`${
                            link.active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          } text-xs font-medium px-2 py-0.5 border-0`}
                        >
                          {link.active ? "Activ" : "Inactiv"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-xs text-slate-600">
                      {link.priceType === "fixed"
                        ? `RON ${Number(link.amount ?? 0).toFixed(2)}`
                        : "Clientul alege"}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-xs text-slate-600">
                      {new Date(link.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <DropdownMenu
                        open={showDropdown === link.id}
                        onOpenChange={(open) =>
                          setShowDropdown(open ? link.id : null)
                        }
                      >
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-slate-100/70"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem
                            className="flex items-center text-xs py-2"
                            onSelect={() => copyUrl(link.slug)}
                          >
                            <Copy className="mr-2 h-3.5 w-3.5" />
                            Copiază URL
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center text-xs py-2"
                            onSelect={() => previewUrl(link.slug)}
                          >
                            <Eye className="mr-2 h-3.5 w-3.5" />
                            Previzualizează link-ul de plată
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center text-xs py-2"
                            onSelect={() =>
                              startRename(link.id, link.productName)
                            }
                          >
                            <Edit className="mr-2 h-3.5 w-3.5" />
                            Schimbă numele
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center text-xs py-2"
                            onSelect={() => onDuplicate()}
                          >
                            <Copy className="mr-2 h-3.5 w-3.5" />
                            Duplică
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center text-xs py-2"
                            onSelect={() => onToggleActive()}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            {link.active ? "Dezactivează" : "Activează"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center text-red-600 text-xs py-2"
                            onSelect={() => onDelete()}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Șterge definitiv
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreatePaymentLinkModal
        isOpen={showCreateModal}
        onClose={async () => {
          setShowCreateModal(false);
        }}
      />

      {/* Rename Dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schimbă numele</DialogTitle>
            <DialogDescription>
              Setează un nume clar și ușor de recunoscut pentru link-ul de
              plată.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <label className="text-xs text-slate-600">Nume</label>
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Ex. Logo Design Basic"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameOpen(false)}
              disabled={renamePending}
            >
              Anulează
            </Button>
            <Button
              onClick={submitRename}
              disabled={renamePending || !renameValue.trim()}
            >
              {renamePending ? "Se salvează..." : "Salvează"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
