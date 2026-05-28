import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Shield, MapPin, CheckCircle2,
  ChevronRight, ChevronLeft, Clock, AlertCircle,
} from "lucide-react";
import { useGetKyc, useSubmitKyc, getGetKycQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { label: "Personal Info", icon: User },
  { label: "Identity", icon: Shield },
  { label: "Address", icon: MapPin },
  { label: "Review", icon: CheckCircle2 },
];

const STATES = [
  "Gujarat", "Maharashtra", "Rajasthan", "Madhya Pradesh",
  "Uttar Pradesh", "Delhi", "Karnataka", "Tamil Nadu", "Other",
];

const statusConfig = {
  pending: {
    label: "Under Review",
    color: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
    icon: Clock,
    message: "Your KYC documents are being reviewed. This usually takes 1-2 business days.",
  },
  under_review: {
    label: "Under Review",
    color: "bg-blue-500/20 text-blue-600 border-blue-500/30",
    icon: Clock,
    message: "Our team is verifying your identity documents.",
  },
  approved: {
    label: "Verified",
    color: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
    icon: CheckCircle2,
    message: "Your KYC is approved. You can now create active listings.",
  },
  rejected: {
    label: "Action Required",
    color: "bg-destructive/20 text-destructive border-destructive/30",
    icon: AlertCircle,
    message: "Your KYC was not approved. Please resubmit with correct documents.",
  },
};

export default function KYC() {
  const { data: kycRecord, isLoading } = useGetKyc();
  const submitKyc = useSubmitKyc();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    fullName: "", phone: "", email: "",
    panNumber: "", aadhaarNumber: "",
    address: "", city: "", state: "Gujarat", pincode: "",
  });

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    try {
      await submitKyc.mutateAsync({
        data: {
          fullName: form.fullName,
          panNumber: form.panNumber,
          aadhaarNumber: form.aadhaarNumber,
          phone: form.phone,
          email: form.email || undefined,
          address: form.address || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          pincode: form.pincode || undefined,
        },
      });
      queryClient.invalidateQueries({ queryKey: getGetKycQueryKey() });
      toast({ title: "KYC Submitted!", description: "Your documents are under review. We'll notify you within 1-2 business days." });
    } catch {
      toast({ title: "Error", description: "Failed to submit KYC. Please try again.", variant: "destructive" });
    }
  }

  const inputCls = "bg-input border-border focus:border-primary/50";
  const selectTriggerCls = "bg-input border-border";
  const selectContentCls = "bg-popover border-border";

  if (!isLoading && kycRecord && kycRecord.status !== "rejected") {
    const cfg = statusConfig[kycRecord.status as keyof typeof statusConfig] ?? statusConfig.pending;
    const Icon = cfg.icon;
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-24 pb-20">
          <div className="container mx-auto px-6 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-10 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="h-10 w-10 text-primary" />
              </div>
              <Badge className={`text-sm border px-4 py-1 mb-4 ${cfg.color}`}>{cfg.label}</Badge>
              <h1 className="text-2xl font-serif mb-3">
                KYC {kycRecord.status === "approved" ? "Verified" : "Submitted"}
              </h1>
              <p className="text-muted-foreground mb-8">{cfg.message}</p>
              <div className="text-left space-y-3 bg-muted/40 rounded-xl p-6">
                {[
                  { label: "Full Name", value: kycRecord.fullName },
                  { label: "PAN Number", value: kycRecord.panNumber },
                  { label: "Phone", value: kycRecord.phone },
                  { label: "City", value: kycRecord.city },
                ].map(
                  ({ label, value }) =>
                    value && (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    )
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-serif mb-1">KYC Verification</h1>
            <p className="text-muted-foreground">
              Complete identity verification to list and sell properties
            </p>
          </motion.div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const done = i < step;
              const active = i === step;
              return (
                <div key={s.label} className="flex items-center gap-1 flex-shrink-0">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      active
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : done
                          ? "text-primary/70"
                          : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {s.label}
                  </div>
                  {i < steps.length - 1 && <ChevronRight className="h-3 w-3 text-border" />}
                </div>
              );
            })}
          </div>

          <div className="bg-card border border-border rounded-2xl p-8">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="s0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <h2 className="text-xl font-serif mb-5">Personal Information</h2>
                  <div>
                    <Label className="text-foreground/80 mb-2 block">
                      Full Name (as per Aadhaar) *
                    </Label>
                    <Input
                      value={form.fullName}
                      onChange={(e) => update("fullName", e.target.value)}
                      placeholder="Rajesh Kumar Mehta"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <Label className="text-foreground/80 mb-2 block">Phone Number *</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <Label className="text-foreground/80 mb-2 block">Email Address</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="rajesh@example.com"
                      className={inputCls}
                    />
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="s1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <h2 className="text-xl font-serif mb-5">Identity Documents</h2>
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-4">
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                      For demo purposes, enter any valid format. In production, document uploads
                      would be required.
                    </p>
                  </div>
                  <div>
                    <Label className="text-foreground/80 mb-2 block">PAN Number *</Label>
                    <Input
                      value={form.panNumber}
                      onChange={(e) => update("panNumber", e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      className={`${inputCls} uppercase`}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Format: 5 letters + 4 digits + 1 letter
                    </p>
                  </div>
                  <div>
                    <Label className="text-foreground/80 mb-2 block">Aadhaar Number *</Label>
                    <Input
                      value={form.aadhaarNumber}
                      onChange={(e) => update("aadhaarNumber", e.target.value)}
                      placeholder="1234 5678 9012"
                      maxLength={14}
                      className={inputCls}
                    />
                    <p className="text-xs text-muted-foreground mt-1">12-digit Aadhaar number</p>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="s2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <h2 className="text-xl font-serif mb-5">Residential Address</h2>
                  <div>
                    <Label className="text-foreground/80 mb-2 block">Address</Label>
                    <Textarea
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                      placeholder="Plot No., Building, Street, Landmark..."
                      className={`${inputCls} resize-none`}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-foreground/80 mb-2 block">City</Label>
                      <Input
                        value={form.city}
                        onChange={(e) => update("city", e.target.value)}
                        placeholder="Ahmedabad"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <Label className="text-foreground/80 mb-2 block">State</Label>
                      <Select value={form.state} onValueChange={(v) => update("state", v)}>
                        <SelectTrigger className={selectTriggerCls}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className={selectContentCls}>
                          {STATES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-foreground/80 mb-2 block">Pincode</Label>
                      <Input
                        value={form.pincode}
                        onChange={(e) => update("pincode", e.target.value)}
                        placeholder="380015"
                        maxLength={6}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="s3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-xl font-serif mb-5">Review & Submit</h2>
                  <div className="space-y-3">
                    {[
                      { label: "Full Name", value: form.fullName },
                      { label: "Phone", value: form.phone },
                      { label: "Email", value: form.email || "-" },
                      { label: "PAN Number", value: form.panNumber },
                      {
                        label: "Aadhaar",
                        value: form.aadhaarNumber
                          ? `XXXX XXXX ${form.aadhaarNumber.slice(-4)}`
                          : "-",
                      },
                      { label: "City", value: form.city || "-" },
                      { label: "State", value: form.state },
                      { label: "Pincode", value: form.pincode || "-" },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex justify-between py-2 border-b border-border/50 text-sm"
                      >
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                    <p className="text-xs text-primary/80">
                      I declare that the information provided is true and accurate. I consent to
                      PROP UNIFIED verifying these details for KYC compliance.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 0}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              {step < steps.length - 1 ? (
                <Button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={step === 0 && (!form.fullName || !form.phone)}
                  className="bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-black font-semibold gap-2 hover:opacity-90"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={
                    submitKyc.isPending ||
                    !form.fullName ||
                    !form.phone ||
                    !form.panNumber ||
                    !form.aadhaarNumber
                  }
                  className="bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-black font-semibold gap-2 hover:opacity-90"
                >
                  {submitKyc.isPending ? "Submitting..." : "Submit KYC"}
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
