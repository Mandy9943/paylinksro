import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Image as ImageIcon,
  Info,
  Monitor,
  Plus,
  Smartphone,
  Upload,
  X,
} from "lucide-react";
import { useState } from "react";

import { createPayLink } from "@/api/paylinks";

interface CreatePaymentLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (id: string) => void;
}

export default function CreatePaymentLinkModal({
  isOpen,
  onClose,
  onCreated,
}: CreatePaymentLinkModalProps) {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("0.00");
  const [selectedType, setSelectedType] = useState("servicii");
  const [collectEmail, setCollectEmail] = useState(true);
  const [requirePhone, setRequirePhone] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [priceType, setPriceType] = useState<"fixed" | "flexible">("fixed");
  const [minAmount, setMinAmount] = useState("0.00");
  const [backgroundColor, setBackgroundColor] = useState("#fbbf24"); // Default yellow
  const [submitting, setSubmitting] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(
      (file) =>
        file.type === "application/pdf" ||
        file.type === "application/msword" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    setUploadedFiles((prev) => {
      const next = [...prev, ...validFiles].slice(0, 20);
      return next;
    });
  };

  // Placeholder for future uploads
  // const uploadAll = async () => {};

  const toSlug = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const onSubmit = async () => {
    try {
      setSubmitting(true);
      const name = productName.trim() || "Produs";
      const slugBase = toSlug(name);
      const slug = slugBase || `link-${Date.now()}`;
      const payload: Parameters<typeof createPayLink>[0] = {
        name,
        slug,
        priceType: priceType === "fixed" ? "FIXED" : "FLEXIBLE",
        amount:
          priceType === "fixed"
            ? Math.max(0, parseFloat(amount || "0"))
            : undefined,
        serviceType:
          selectedType === "servicii"
            ? "SERVICE"
            : selectedType === "produse-digitale"
            ? "DIGITAL_PRODUCT"
            : "DONATION",
        description: description || undefined,
        collectEmail,
        collectPhone: requirePhone,
        mainColor: backgroundColor,
        ...(selectedType === "servicii"
          ? { service: { title: name, description: description || undefined } }
          : {}),
        ...(selectedType === "produse-digitale"
          ? { product: { name, description: description || undefined } }
          : {}),
      };
      const created = await createPayLink(payload);
      onCreated?.(created.id);
      onClose();
    } catch {
      // no-op toast here to keep component lean; parent page can show errors globally
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-medium text-gray-900">
              Creează un link de plată
            </h2>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting ? "Se creează..." : "Creează link"}
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Form */}
          <div className="w-full lg:w-1/2 p-6 overflow-y-auto">
            {/* Select Type */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Selectează tipul
              </h3>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="servicii">Servicii</SelectItem>
                  <SelectItem value="produse-digitale">
                    Produse Digitale
                  </SelectItem>
                  <SelectItem value="donatii">Donații</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Product Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedType === "servicii"
                  ? "Serviciu"
                  : selectedType === "produse-digitale"
                  ? "Produs Digital"
                  : "Donație"}
              </h3>

              {selectedType === "servicii" && (
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="title"
                      className="text-sm font-medium text-gray-700"
                    >
                      Titlu
                    </Label>
                    <Input
                      id="title"
                      placeholder="Numele serviciului..."
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="w-full mt-1"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium text-gray-700"
                    >
                      Descriere
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Descrierea serviciului..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full mt-1"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="logo"
                      className="text-sm font-medium text-gray-700"
                    >
                      Logo
                    </Label>
                    <div className="mt-1 flex items-center space-x-3">
                      <Button variant="outline" size="sm">
                        <ImageIcon
                          className="h-4 w-4 mr-2"
                          aria-hidden
                          role="img"
                        />
                        Încarcă logo
                      </Button>
                      <span className="text-xs text-gray-500">
                        PNG, JPG până la 5MB
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {selectedType === "produse-digitale" && (
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="product-name"
                      className="text-sm font-medium text-gray-700"
                    >
                      Nume produs
                    </Label>
                    <Input
                      id="product-name"
                      placeholder="Numele produsului digital..."
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="w-full mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="product-description"
                      className="text-sm font-medium text-gray-700"
                    >
                      Descriere
                    </Label>
                    <Textarea
                      id="product-description"
                      placeholder="Descrierea produsului digital..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full mt-1"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Fișiere digitale
                    </Label>
                    <div
                      className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
                        Trage și plasează fișierele aici sau
                        <Button
                          variant="link"
                          className="p-0 h-auto text-blue-600 ml-1"
                        >
                          navighează
                        </Button>
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, DOCX până la 50MB fiecare
                      </p>

                      {uploadedFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {uploadedFiles.slice(0, 20).map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-gray-50 p-2 rounded"
                            >
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-sm">{file.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setUploadedFiles((files) =>
                                    files.filter((_, i) => i !== index)
                                  )
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          {uploadedFiles.length > 20 && (
                            <div className="text-xs text-amber-700">
                              Doar primele 20 de fișiere vor fi încărcate
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedType === "donatii" && (
                <div className="space-y-4">
                  <div>
                    <Input
                      placeholder="Găsește sau adaugă o donație..."
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium p-0 h-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adaugă produse recomandate
                    <Info className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Opțiuni
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="collectEmail"
                    checked={collectEmail}
                    onCheckedChange={(checked) =>
                      setCollectEmail(checked === true)
                    }
                  />
                  <Label htmlFor="collectEmail" className="text-sm">
                    Colectează adresele de email ale clienților
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="requirePhone"
                    checked={requirePhone}
                    onCheckedChange={(checked) =>
                      setRequirePhone(checked === true)
                    }
                  />
                  <Label htmlFor="requirePhone" className="text-sm">
                    Solicită clienților să furnizeze un număr de telefon
                  </Label>
                </div>
              </div>
            </div>

            {/* Price Configuration */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Preț</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="fixed-price"
                      name="priceType"
                      value="fixed"
                      checked={priceType === "fixed"}
                      onChange={(e) =>
                        setPriceType(e.target.value as "fixed" | "flexible")
                      }
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="fixed-price" className="text-sm">
                      Preț fix
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="flexible-price"
                      name="priceType"
                      value="flexible"
                      checked={priceType === "flexible"}
                      onChange={(e) =>
                        setPriceType(e.target.value as "fixed" | "flexible")
                      }
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="flexible-price" className="text-sm">
                      Permite clienților să aleagă suma
                    </Label>
                  </div>
                </div>

                {priceType === "fixed" && (
                  <div>
                    <Label
                      htmlFor="amount"
                      className="text-sm font-medium text-gray-700"
                    >
                      Suma (RON)
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full mt-1"
                    />
                  </div>
                )}

                {priceType === "flexible" && (
                  <div>
                    <Label
                      htmlFor="minAmount"
                      className="text-sm font-medium text-gray-700"
                    >
                      Suma minimă (RON) - opțional
                    </Label>
                    <Input
                      id="minAmount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                      className="w-full mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Lasă gol pentru a permite orice sumă
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Background Color Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Culoare de fundal
              </h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { color: "#fbbf24", name: "Galben" },
                  { color: "#3b82f6", name: "Albastru" },
                  { color: "#10b981", name: "Verde" },
                  { color: "#f59e0b", name: "Portocaliu" },
                  { color: "#ef4444", name: "Roșu" },
                  { color: "#8b5cf6", name: "Violet" },
                  { color: "#ec4899", name: "Roz" },
                  { color: "#6b7280", name: "Gri" },
                ].map((colorOption) => (
                  <button
                    key={colorOption.color}
                    onClick={() => setBackgroundColor(colorOption.color)}
                    className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-105 ${
                      backgroundColor === colorOption.color
                        ? "border-gray-900 shadow-md"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: colorOption.color }}
                    title={colorOption.name}
                    type="button"
                  />
                ))}
              </div>
              <div className="mt-3">
                <Label
                  htmlFor="custom-color"
                  className="text-sm font-medium text-gray-700"
                >
                  Sau alege o culoare personalizată
                </Label>
                <div className="flex items-center space-x-3 mt-1">
                  <input
                    id="custom-color"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                  />
                  <Input
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    placeholder="#fbbf24"
                    className="w-32 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="hidden lg:block w-1/2 bg-gray-50 p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Previzualizare
                </h3>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="p-1">
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1">
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-4">
                🔗 paylink.ro/p/demo-link
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border max-w-sm mx-auto">
              <div className="p-6" style={{ backgroundColor }}>
                <div className="text-white font-semibold text-lg">
                  {productName || "Nume produs/serviciu"}
                </div>
                <div className="text-white/90 text-sm mt-1">
                  {description || "Descriere scurtă a ofertei tale"}
                </div>
              </div>
              <div className="p-6">
                <div className="text-sm text-gray-700 mb-2">
                  {priceType === "fixed"
                    ? `Suma: RON ${Number(amount || 0).toFixed(2)}`
                    : "Clientul alege suma"}
                </div>
                <Button className="w-full">Plătește</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
