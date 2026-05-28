import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, MapPin, DollarSign, Image, CheckCircle2,
  ChevronRight, ChevronLeft, Upload, X, Crown, FileText, Link2
} from "lucide-react";
import { useCreateProperty, useCreateListing, getListListingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type PhotoEntry = { url: string; name: string };
type DocEntry = { name: string; type: string; size: number; data: string };

const steps = [
  { label: "Details", icon: Building2 },
  { label: "Location", icon: MapPin },
  { label: "Pricing", icon: DollarSign },
  { label: "Media", icon: Image },
  { label: "Review", icon: CheckCircle2 },
];

const CITIES = ["Ahmedabad", "Dholera", "Surat", "Gandhinagar", "Rajkot", "Vadodara"];
const PROPERTY_TYPES = ["sale", "rent", "commercial", "plot", "pg"] as const;
const FURNISHING_OPTIONS = ["Fully Furnished", "Semi Furnished", "Unfurnished", "Bare Shell"];

const MAX_PHOTO_BYTES = 3 * 1024 * 1024; // 3 MB
const MAX_DOC_BYTES = 10 * 1024 * 1024; // 10 MB

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function fmtBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function NewListing() {
  const [step, setStep] = useState(0);
  const createProperty = useCreateProperty();
  const createListing = useCreateListing();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "sale" as (typeof PROPERTY_TYPES)[number],
    propertyCategory: "Apartment",
    city: "Ahmedabad",
    locality: "",
    address: "",
    area: "",
    areaUnit: "sqft",
    bedrooms: "",
    bathrooms: "",
    furnishing: "Semi Furnished",
    price: "",
    askingPrice: "",
    listingType: "sale" as (typeof PROPERTY_TYPES)[number],
    isPremium: false,
  });

  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [documents, setDocuments] = useState<DocEntry[]>([]);
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handlePhotoFiles(files: FileList | null) {
    if (!files) return;
    setUploadingPhoto(true);
    for (const file of Array.from(files)) {
      if (file.size > MAX_PHOTO_BYTES) {
        toast({ title: `${file.name} is too large (max 3 MB)`, variant: "destructive" });
        continue;
      }
      try {
        const url = await readFileAsDataUrl(file);
        setPhotos((prev) => [...prev, { url, name: file.name }]);
      } catch {
        toast({ title: `Failed to read ${file.name}`, variant: "destructive" });
      }
    }
    setUploadingPhoto(false);
  }

  function addPhotoUrl() {
    const url = photoUrl.trim();
    if (!url) return;
    setPhotos((prev) => [...prev, { url, name: url.split("/").pop() ?? "photo" }]);
    setPhotoUrl("");
  }

  async function handleDocFiles(files: FileList | null) {
    if (!files) return;
    setUploadingDoc(true);
    for (const file of Array.from(files)) {
      if (file.size > MAX_DOC_BYTES) {
        toast({ title: `${file.name} is too large (max 10 MB)`, variant: "destructive" });
        continue;
      }
      try {
        const data = await readFileAsDataUrl(file);
        setDocuments((prev) => [...prev, { name: file.name, type: file.type, size: file.size, data }]);
      } catch {
        toast({ title: `Failed to read ${file.name}`, variant: "destructive" });
      }
    }
    setUploadingDoc(false);
  }

  async function handleSubmit() {
    try {
      const property = await createProperty.mutateAsync({
        data: {
          title: form.title,
          description: form.description || undefined,
          type: form.type,
          propertyCategory: form.propertyCategory || undefined,
          price: Number(form.price),
          priceUnit: "INR",
          city: form.city,
          locality: form.locality || undefined,
          address: form.address || undefined,
          area: Number(form.area),
          areaUnit: form.areaUnit,
          bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
          bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
          furnishing: form.furnishing || undefined,
          photos: photos.length > 0 ? JSON.stringify(photos) : undefined,
        },
      });
      await createListing.mutateAsync({
        data: {
          propertyId: property.id,
          listingType: form.listingType,
          askingPrice: form.askingPrice ? Number(form.askingPrice) : undefined,
          documents: documents.length > 0 ? JSON.stringify(documents) : undefined,
          isPremium: form.isPremium || undefined,
        },
      });
      queryClient.invalidateQueries({ queryKey: getListListingsQueryKey() });
      toast({ title: "Listing Created!", description: "Your property listing has been submitted successfully." });
      setLocation("/listings");
    } catch {
      toast({ title: "Error", description: "Failed to create listing. Please try again.", variant: "destructive" });
    }
  }

  const isLoading = createProperty.isPending || createListing.isPending;
  const inputCls = "bg-input border-border focus:border-primary/50";
  const selectTriggerCls = "bg-input border-border";
  const selectContentCls = "bg-popover border-border";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <h1 className="text-3xl font-serif mb-1">Add New Listing</h1>
            <p className="text-muted-foreground">Complete the steps below to list your property</p>
          </motion.div>

          {/* Step Indicator */}
          <div className="flex items-center gap-1 mb-10 overflow-x-auto pb-2">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const active = i === step;
              const done = i < step;
              return (
                <div key={s.label} className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => i < step && setStep(i)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all ${
                      active
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : done
                          ? "text-primary/70 cursor-pointer hover:text-primary"
                          : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {s.label}
                  </button>
                  {i < steps.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-border flex-shrink-0" />}
                </div>
              );
            })}
          </div>

          <div className="bg-card border border-border rounded-2xl p-8">
            <AnimatePresence mode="wait">

              {/* ── Step 0: Property Details ─────────────────────── */}
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <h2 className="text-xl font-serif mb-6">Property Details</h2>
                  <div>
                    <Label className="text-foreground/80 mb-2 block">Property Title *</Label>
                    <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. 3BHK Luxury Apartment in Prahlad Nagar" className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-foreground/80 mb-2 block">Listing Type *</Label>
                      <Select value={form.type} onValueChange={(v) => update("type", v as typeof form.type)}>
                        <SelectTrigger className={selectTriggerCls}><SelectValue /></SelectTrigger>
                        <SelectContent className={selectContentCls}>
                          {PROPERTY_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-foreground/80 mb-2 block">Category</Label>
                      <Input value={form.propertyCategory} onChange={(e) => update("propertyCategory", e.target.value)} placeholder="e.g. Apartment, Villa, Plot" className={inputCls} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-foreground/80 mb-2 block">Bedrooms</Label>
                      <Input type="number" value={form.bedrooms} onChange={(e) => update("bedrooms", e.target.value)} placeholder="3" className={inputCls} />
                    </div>
                    <div>
                      <Label className="text-foreground/80 mb-2 block">Bathrooms</Label>
                      <Input type="number" value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} placeholder="2" className={inputCls} />
                    </div>
                    <div>
                      <Label className="text-foreground/80 mb-2 block">Furnishing</Label>
                      <Select value={form.furnishing} onValueChange={(v) => update("furnishing", v)}>
                        <SelectTrigger className={selectTriggerCls}><SelectValue /></SelectTrigger>
                        <SelectContent className={selectContentCls}>
                          {FURNISHING_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-foreground/80 mb-2 block">Description</Label>
                    <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe your property..." className={`${inputCls} resize-none`} rows={4} />
                  </div>
                </motion.div>
              )}

              {/* ── Step 1: Location ─────────────────────────────── */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <h2 className="text-xl font-serif mb-6">Location Details</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-foreground/80 mb-2 block">City *</Label>
                      <Select value={form.city} onValueChange={(v) => update("city", v)}>
                        <SelectTrigger className={selectTriggerCls}><SelectValue /></SelectTrigger>
                        <SelectContent className={selectContentCls}>
                          {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-foreground/80 mb-2 block">Locality / Area</Label>
                      <Input value={form.locality} onChange={(e) => update("locality", e.target.value)} placeholder="e.g. Prahlad Nagar" className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-foreground/80 mb-2 block">Full Address</Label>
                    <Textarea value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Plot No., Street Name, Landmark..." className={`${inputCls} resize-none`} rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-foreground/80 mb-2 block">Area Size *</Label>
                      <Input type="number" value={form.area} onChange={(e) => update("area", e.target.value)} placeholder="1500" className={inputCls} />
                    </div>
                    <div>
                      <Label className="text-foreground/80 mb-2 block">Unit</Label>
                      <Select value={form.areaUnit} onValueChange={(v) => update("areaUnit", v)}>
                        <SelectTrigger className={selectTriggerCls}><SelectValue /></SelectTrigger>
                        <SelectContent className={selectContentCls}>
                          <SelectItem value="sqft">sq. ft.</SelectItem>
                          <SelectItem value="sqm">sq. m.</SelectItem>
                          <SelectItem value="sqyd">sq. yd.</SelectItem>
                          <SelectItem value="acres">Acres</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Step 2: Pricing ──────────────────────────────── */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <h2 className="text-xl font-serif mb-6">Pricing Details</h2>
                  <div>
                    <Label className="text-foreground/80 mb-2 block">Market Price (₹) *</Label>
                    <Input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="e.g. 9800000" className={inputCls} />
                    {form.price && (
                      <p className="text-xs text-primary mt-2">
                        {Number(form.price) >= 10000000
                          ? `₹${(Number(form.price) / 10000000).toFixed(2)} Crores`
                          : Number(form.price) >= 100000
                            ? `₹${(Number(form.price) / 100000).toFixed(2)} Lakhs`
                            : ""}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-foreground/80 mb-2 block">Asking Price (₹) — for listing</Label>
                    <Input type="number" value={form.askingPrice} onChange={(e) => update("askingPrice", e.target.value)} placeholder="Leave blank to use market price" className={inputCls} />
                  </div>
                  <div>
                    <Label className="text-foreground/80 mb-2 block">Listing Type</Label>
                    <Select value={form.listingType} onValueChange={(v) => update("listingType", v as typeof form.listingType)}>
                      <SelectTrigger className={selectTriggerCls}><SelectValue /></SelectTrigger>
                      <SelectContent className={selectContentCls}>
                        {PROPERTY_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Premium Upgrade */}
                  <div
                    onClick={() => update("isPremium", !form.isPremium)}
                    className={`cursor-pointer rounded-xl border-2 p-5 transition-all ${
                      form.isPremium
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <Crown className={`h-5 w-5 mt-0.5 flex-shrink-0 ${form.isPremium ? "text-primary" : "text-muted-foreground"}`} />
                        <div>
                          <p className="font-semibold text-foreground">Premium Listing</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            Pin your listing to the top of search results for 15 days — maximum visibility for serious buyers.
                          </p>
                        </div>
                      </div>
                      <div className={`flex-shrink-0 w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${form.isPremium ? "bg-primary" : "bg-muted"}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isPremium ? "translate-x-5" : "translate-x-0"}`} />
                      </div>
                    </div>
                    {form.isPremium && (
                      <div className="mt-3 pt-3 border-t border-primary/20 flex items-center gap-2 text-sm text-primary">
                        <CheckCircle2 className="h-4 w-4" />
                        Active for 15 days from publish date
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: Media — Photos & Documents ───────────── */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <h2 className="text-xl font-serif mb-2">Photos & Documents</h2>

                  {/* Photos */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-foreground/80">Property Photos</Label>
                      <span className="text-xs text-muted-foreground">{photos.length} added · max 3 MB each</span>
                    </div>

                    {/* Photo grid */}
                    {photos.length > 0 && (
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {photos.map((p, i) => (
                          <div key={i} className="relative group rounded-xl overflow-hidden aspect-video bg-muted">
                            <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                            {i === 0 && (
                              <span className="absolute top-1 left-1 bg-primary text-black text-[10px] font-bold px-1.5 py-0.5 rounded">COVER</span>
                            )}
                            <button
                              onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload from device */}
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handlePhotoFiles(e.target.files)}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => photoInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        className="gap-2 border-dashed border-border"
                      >
                        <Upload className="h-4 w-4" />
                        {uploadingPhoto ? "Uploading..." : "Upload from device"}
                      </Button>
                    </div>

                    {/* URL input */}
                    <div className="flex gap-2 mt-3">
                      <Input
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        placeholder="Or paste an image URL..."
                        className={`${inputCls} flex-1`}
                        onKeyDown={(e) => e.key === "Enter" && addPhotoUrl()}
                      />
                      <Button type="button" variant="outline" onClick={addPhotoUrl} className="gap-1.5">
                        <Link2 className="h-4 w-4" /> Add URL
                      </Button>
                    </div>
                  </div>

                  {/* Documents */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-foreground/80">Supporting Documents</Label>
                      <span className="text-xs text-muted-foreground">{documents.length} uploaded · max 10 MB each</span>
                    </div>

                    {documents.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {documents.map((doc, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                            <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">{doc.type || "Unknown type"} · {fmtBytes(doc.size)}</p>
                            </div>
                            <button
                              onClick={() => setDocuments((prev) => prev.filter((_, j) => j !== i))}
                              className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <input
                      ref={docInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                      className="hidden"
                      onChange={(e) => handleDocFiles(e.target.files)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => docInputRef.current?.click()}
                      disabled={uploadingDoc}
                      className="gap-2 border-dashed border-border"
                    >
                      <Upload className="h-4 w-4" />
                      {uploadingDoc ? "Uploading..." : "Upload documents"}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Accepted: PDF, Word, Excel, images. Ownership docs, floor plans, NOC, etc.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ── Step 4: Review & Submit ───────────────────────── */}
              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <h2 className="text-xl font-serif mb-6">Review & Submit</h2>
                  <div className="space-y-3">
                    {[
                      { label: "Title", value: form.title },
                      { label: "Type", value: form.type },
                      { label: "Category", value: form.propertyCategory },
                      { label: "City", value: form.city },
                      { label: "Locality", value: form.locality },
                      { label: "Area", value: `${form.area} ${form.areaUnit}` },
                      { label: "Bedrooms", value: form.bedrooms },
                      { label: "Market Price", value: form.price ? `₹${Number(form.price).toLocaleString("en-IN")}` : "-" },
                      { label: "Asking Price", value: form.askingPrice ? `₹${Number(form.askingPrice).toLocaleString("en-IN")}` : "Same as market" },
                      { label: "Photos", value: `${photos.length} added` },
                      { label: "Documents", value: `${documents.length} uploaded` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between py-2 border-b border-border/50">
                        <span className="text-sm text-muted-foreground">{label}</span>
                        <span className="text-sm font-medium capitalize">{value || "-"}</span>
                      </div>
                    ))}
                    {form.isPremium && (
                      <div className="flex items-center gap-2 py-2 border-b border-border/50">
                        <span className="text-sm text-muted-foreground flex-1">Premium Listing</span>
                        <span className="text-sm font-semibold text-primary flex items-center gap-1">
                          <Crown className="h-4 w-4" /> Active · 15 days
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                    <p className="text-sm text-primary/80">
                      By submitting, you confirm this listing information is accurate. KYC verification may be required to activate your listing.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0} className="gap-2 text-muted-foreground hover:text-foreground">
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              {step < steps.length - 1 ? (
                <Button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={step === 0 && !form.title}
                  className="bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-black font-semibold gap-2 hover:opacity-90"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !form.title || !form.price || !form.area}
                  className="bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-black font-semibold gap-2 hover:opacity-90"
                >
                  {isLoading ? "Creating..." : "Create Listing"}
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
