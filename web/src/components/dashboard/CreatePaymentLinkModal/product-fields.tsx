"use client";
import { uploadFileDirect } from "@/api/uploads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Image as ImageIcon,
  Info,
  Loader2,
  Plus,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import type { CreatePaymentLinkFormValues } from "./types";

export function ProductFields() {
  const { control, setValue } = useFormContext<CreatePaymentLinkFormValues>();
  const type = useWatch({ control, name: "type" });
  const productAssetUrls =
    useWatch({ control, name: "productAssetUrls" }) || [];
  const productCoverImageUrl = useWatch({
    control,
    name: "productCoverImageUrl",
  });
  const fundraisingCoverImageUrl = useWatch({
    control,
    name: "fundraisingCoverImageUrl",
  });

  // Dropzone state/refs for multi-file uploads
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACCEPT_MIME = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    "application/pdf",
    "application/zip",
    "application/x-zip-compressed",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "audio/mpeg",
    "audio/wav",
    "video/mp4",
  ].join(",");

  const uploadAssets = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    try {
      const results = await Promise.allSettled(
        files
          .filter((f) => !!f.type)
          .map(async (file) => {
            const { key } = await uploadFileDirect("digital-asset", file);
            return key;
          })
      );
      const uploadedKeys = results
        .filter(
          (r): r is PromiseFulfilledResult<string> => r.status === "fulfilled"
        )
        .map((r) => r.value);
      if (uploadedKeys.length) {
        setValue("productAssetUrls", [...productAssetUrls, ...uploadedKeys]);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = async (e) => {
    e.preventDefault();
    setDragActive(false);
    if (uploading) return;
    const files = Array.from(e.dataTransfer.files || []);
    if (!files.length) return;
    await uploadAssets(files);
  };

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    if (!dragActive) setDragActive(true);
  };

  const onDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    // Only reset when leaving the dropzone area
    setDragActive(false);
  };

  const pickFile = async (accept: string): Promise<File | null> => {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = accept;
      input.onchange = () => {
        const f = input.files?.[0] ?? null;
        resolve(f);
      };
      input.click();
    });
  };

  const handleUploadCover = async (kind: "paylink-image" | "digital-asset") => {
    const file = await pickFile("image/*");
    if (!file) return;
    const { publicUrl } = await uploadFileDirect(kind, file);
    if (type === "fundraising") setValue("fundraisingCoverImageUrl", publicUrl);
    else setValue("productCoverImageUrl", publicUrl);
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {type === "servicii"
          ? "Serviciu"
          : type === "produse-digitale"
          ? "Produs Digital"
          : type === "donatii"
          ? "Donație"
          : "Fundraising"}
      </h3>

      {type === "servicii" && (
        <div className="space-y-4">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
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
                  className="w-full mt-1"
                  {...field}
                />
              </div>
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
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
                  rows={3}
                  className="w-full mt-1"
                  {...field}
                />
              </div>
            )}
          />
          <div>
            <Label htmlFor="logo" className="text-sm font-medium text-gray-700">
              Logo
            </Label>
            <div className="mt-1 flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUploadCover("paylink-image")}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Încarcă logo
              </Button>
              <span className="text-xs text-gray-500">
                PNG, JPG până la 5MB
              </span>
            </div>
          </div>
        </div>
      )}

      {type === "produse-digitale" && (
        <div className="space-y-4">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
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
                  className="w-full mt-1"
                  {...field}
                />
              </div>
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
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
                  rows={3}
                  className="w-full mt-1"
                  {...field}
                />
              </div>
            )}
          />

          <div>
            <Label className="text-sm font-medium text-gray-700">
              Fișiere digitale
            </Label>
            <div
              className={`mt-1 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              } ${uploading ? "opacity-70 cursor-wait" : ""}`}
              onDragOver={onDragOver}
              onDragEnter={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              aria-busy={uploading}
            >
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                Trage și plasează fișierele aici sau
                <Button
                  variant="link"
                  className="p-0 h-auto text-blue-600 ml-1"
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  navighează
                </Button>
              </p>
              <p className="text-xs text-gray-500">
                Acceptă: imagini, PDF, ZIP, DOC/DOCX, MP3/WAV, MP4 · poți
                selecta multiple fișiere (max ~50MB fiecare)
              </p>

              {uploading && (
                <div className="mt-3 flex items-center justify-center text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Se încarcă
                  fișierele...
                </div>
              )}

              {/* Hidden multi-file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPT_MIME}
                className="hidden"
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (!files.length) return;
                  if (!uploading) {
                    await uploadAssets(files);
                  }
                  // reset the input to allow re-uploading the same file names
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              />

              {productAssetUrls.length > 0 && (
                <div className="mt-4 space-y-2">
                  {productAssetUrls.map((key: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm break-all">{key}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setValue(
                            "productAssetUrls",
                            productAssetUrls.filter((_, i) => i !== index)
                          )
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {type === "donatii" && (
        <div className="space-y-4">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                placeholder="Găsește sau adaugă o donație..."
                className="w-full"
                {...field}
              />
            )}
          />
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

      {type === "fundraising" && (
        <div className="space-y-4">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <div>
                <Label
                  htmlFor="campaign-title"
                  className="text-sm font-medium text-gray-700"
                >
                  Campaign Title
                </Label>
                <Input
                  id="campaign-title"
                  placeholder="Enter campaign title..."
                  className="w-full mt-1"
                  {...field}
                />
              </div>
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <div>
                <Label
                  htmlFor="campaign-description"
                  className="text-sm font-medium text-gray-700"
                >
                  Campaign Description
                </Label>
                <Textarea
                  id="campaign-description"
                  placeholder="Describe your fundraising campaign..."
                  rows={3}
                  className="w-full mt-1"
                  {...field}
                />
              </div>
            )}
          />
          <Controller
            name="targetAmount"
            control={control}
            render={({ field }) => (
              <div>
                <Label
                  htmlFor="target-amount"
                  className="text-sm font-medium text-gray-700"
                >
                  Target Amount (RON)
                </Label>
                <Input
                  id="target-amount"
                  type="number"
                  placeholder="1000.00"
                  className="w-full mt-1"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                />
              </div>
            )}
          />
          <div>
            <Label
              htmlFor="campaign-logo"
              className="text-sm font-medium text-gray-700"
            >
              Campaign Image
            </Label>
            <div className="mt-1 flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUploadCover("paylink-image")}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
              <span className="text-xs text-gray-500">PNG, JPG up to 5MB</span>
            </div>
            {fundraisingCoverImageUrl && (
              <div className="mt-2">
                <Image
                  src={fundraisingCoverImageUrl}
                  alt="Campaign"
                  width={320}
                  height={180}
                  className="w-full max-w-xs rounded object-cover"
                />
              </div>
            )}
          </div>
        </div>
      )}
      {type === "produse-digitale" && (
        <div className="space-y-2 mt-4">
          <Label className="text-sm font-medium text-gray-700">
            Cover Image
          </Label>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUploadCover("paylink-image")}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
            {productCoverImageUrl && (
              <Image
                src={productCoverImageUrl}
                alt="Cover"
                width={64}
                height={48}
                className="h-12 w-auto rounded object-cover"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
