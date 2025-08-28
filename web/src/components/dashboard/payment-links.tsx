"use client";

import {
  deletePayLink as apiDelete,
  updatePayLink as apiUpdate,
  type PayLink,
} from "@/api/paylinks";
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
import { usePayLinks } from "@/hooks/usePayLinks";
import useUiStore from "@/store/ui-store";
import { Copy, Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function PaymentLinks() {
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const { toggleCreatePaymentLinkModal } = useUiStore();
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renamePending, setRenamePending] = useState(false);

  const { items: data, isLoading, mutate, refresh } = usePayLinks();

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
      const updated = await apiUpdate(renameId, { name: renameValue });
      await mutate(
        (prev) =>
          (prev ?? []).map((p) =>
            p.id === renameId ? { ...p, name: updated.name } : p
          ),
        { revalidate: false }
      );
      setRenameOpen(false);
      toast.success("Nume actualizat");
    } finally {
      setRenamePending(false);
    }
  };

  const onDuplicate = async () => {};

  const onToggleActive = async (link: PayLink) => {
    try {
      const updated = await apiUpdate(link.id, { active: !link.active });
      await mutate(
        (prev) =>
          (prev ?? []).map((p) =>
            p.id === link.id ? { ...p, active: updated.active } : p
          ),
        { revalidate: false }
      );
    } catch {
      toast.error("Nu s-a putut actualiza statusul");
    }
  };

  const onDelete = async (link: PayLink) => {
    try {
      await apiDelete(link.id);
      await mutate((prev) => (prev ?? []).filter((p) => p.id !== link.id), {
        revalidate: false,
      });
      toast.success("Șters");
    } catch {
      toast.error("Nu s-a putut șterge");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">Creează și gestionează</p>
          <h2 className="text-xl font-semibold text-slate-900">
            Link-uri de plată
          </h2>
        </div>
        <Button
          onClick={() => toggleCreatePaymentLinkModal()}
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
                    Tip
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
                          {link.name}
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
                      <span className="inline-flex items-center gap-1">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400" />
                        {link.serviceType === "SERVICE"
                          ? "Serviciu"
                          : link.serviceType === "DIGITAL_PRODUCT"
                          ? "Produs digital"
                          : link.serviceType === "DONATION"
                          ? "Donație"
                          : "Fundraising"}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-xs text-slate-600">
                      {link.priceType === "FIXED"
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
                            onSelect={() => startRename(link.id, link.name)}
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
                            onSelect={() => onToggleActive(link)}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            {link.active ? "Dezactivează" : "Activează"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center text-red-600 text-xs py-2"
                            onSelect={() => onDelete(link)}
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
