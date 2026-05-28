import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit, Building2, CheckCircle2, Clock, XCircle, Crown, FileText, ChevronDown, ChevronUp } from "lucide-react";
import {
  useListListings,
  useDeleteListing,
  useUpdateListing,
  getListListingsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

type DocEntry = { name: string; type: string; size: number; data?: string };

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground border-border", icon: Edit },
  pending_kyc: { label: "Pending KYC", color: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30", icon: Clock },
  active: { label: "Active", color: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30", icon: CheckCircle2 },
  sold: { label: "Sold", color: "bg-blue-500/20 text-blue-600 border-blue-500/30", icon: CheckCircle2 },
  rented: { label: "Rented", color: "bg-purple-500/20 text-purple-600 border-purple-500/30", icon: CheckCircle2 },
  inactive: { label: "Inactive", color: "bg-destructive/20 text-destructive border-destructive/30", icon: XCircle },
};

function fmtBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function isPremiumActive(premiumUntil: string | null | undefined): boolean {
  if (!premiumUntil) return false;
  return new Date(premiumUntil) > new Date();
}

function daysRemaining(premiumUntil: string | null | undefined): number {
  if (!premiumUntil) return 0;
  return Math.max(0, Math.ceil((new Date(premiumUntil).getTime() - Date.now()) / 86400000));
}

export default function Listings() {
  const { data: listings, isLoading } = useListListings();
  const deleteListing = useDeleteListing();
  const updateListing = useUpdateListing();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [premiumTogglingId, setPremiumTogglingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  function handleDelete(id: number) {
    setDeletingId(id);
    deleteListing.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListListingsQueryKey() });
          toast({ title: "Listing deleted successfully" });
          setDeletingId(null);
        },
        onError: () => {
          toast({ title: "Failed to delete listing", variant: "destructive" });
          setDeletingId(null);
        },
      }
    );
  }

  function handlePremiumToggle(id: number, currentlyPremium: boolean) {
    setPremiumTogglingId(id);
    updateListing.mutate(
      { id, data: { isPremium: !currentlyPremium } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListListingsQueryKey() });
          toast({
            title: !currentlyPremium ? "Premium Activated!" : "Premium Removed",
            description: !currentlyPremium
              ? "Your listing will appear at the top for 15 days."
              : "Listing returned to standard placement.",
          });
          setPremiumTogglingId(null);
        },
        onError: () => {
          toast({ title: "Failed to update listing", variant: "destructive" });
          setPremiumTogglingId(null);
        },
      }
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-serif mb-1">My Listings</h1>
              <p className="text-muted-foreground">Manage your property listings</p>
            </div>
            <Link href="/listings/new">
              <Button className="bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-black font-semibold gap-2 hover:opacity-90">
                <Plus className="h-4 w-4" /> New Listing
              </Button>
            </Link>
          </motion.div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
            </div>
          ) : listings && listings.length > 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {listings.map((listing, i) => {
                const cfg = statusConfig[listing.status] ?? statusConfig.draft;
                const StatusIcon = cfg.icon;
                const active = isPremiumActive(listing.premiumUntil);
                const days = daysRemaining(listing.premiumUntil);
                const isExpanded = expandedId === listing.id;

                // Parse documents
                let docs: DocEntry[] = [];
                try { if (listing.documents) docs = JSON.parse(listing.documents); } catch {}

                return (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`bg-card border rounded-2xl transition-all hover:shadow-sm ${
                      active ? "border-primary/40 shadow-[0_0_0_1px] shadow-primary/10" : "border-border hover:border-primary/20"
                    }`}
                  >
                    <div className="p-5 flex items-center gap-4">
                      {/* Icon with premium glow */}
                      <div className={`p-3 rounded-xl flex-shrink-0 relative ${active ? "bg-primary/20" : "bg-primary/10"}`}>
                        <Building2 className="h-6 w-6 text-primary" />
                        {active && (
                          <Crown className="h-3.5 w-3.5 text-primary absolute -top-1.5 -right-1.5" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold truncate text-foreground">
                            {listing.property?.title ?? `Listing #${listing.id}`}
                          </h3>
                          <Badge className={`text-xs border flex-shrink-0 ${cfg.color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {cfg.label}
                          </Badge>
                          {active && (
                            <Badge className="text-xs border flex-shrink-0 bg-primary/20 text-primary border-primary/30 gap-1">
                              <Crown className="h-3 w-3" /> Premium · {days}d left
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="capitalize">{listing.listingType}</span>
                          {listing.askingPrice && (
                            <span className="text-primary font-medium">
                              ₹{listing.askingPrice >= 10000000
                                ? `${(listing.askingPrice / 10000000).toFixed(1)}Cr`
                                : listing.askingPrice >= 100000
                                  ? `${(listing.askingPrice / 100000).toFixed(1)}L`
                                  : listing.askingPrice.toLocaleString()}
                            </span>
                          )}
                          {listing.property && <span>{listing.property.city}</span>}
                          {docs.length > 0 && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <FileText className="h-3.5 w-3.5" /> {docs.length} doc{docs.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Premium toggle */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePremiumToggle(listing.id, listing.isPremium ?? false)}
                          disabled={premiumTogglingId === listing.id}
                          title={listing.isPremium && active ? "Remove premium" : "Activate premium (15 days)"}
                          className={`gap-1 text-xs ${
                            listing.isPremium && active
                              ? "text-primary hover:text-primary/70"
                              : "text-muted-foreground hover:text-primary"
                          }`}
                        >
                          <Crown className="h-4 w-4" />
                        </Button>

                        {/* Expand docs */}
                        {docs.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedId(isExpanded ? null : listing.id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        )}

                        <Link href={`/listings/${listing.id}/edit`}>
                          <Button variant="ghost" size="sm" className="hover:bg-foreground/5 text-muted-foreground hover:text-foreground">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(listing.id)}
                          disabled={deletingId === listing.id}
                          className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Expanded documents panel */}
                    {isExpanded && docs.length > 0 && (
                      <div className="px-5 pb-5 pt-0 border-t border-border/50">
                        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Attached Documents</p>
                        <div className="space-y-2">
                          {docs.map((doc, j) => (
                            <div key={j} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                              <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm truncate">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">{fmtBytes(doc.size)}</p>
                              </div>
                              {doc.data && (
                                <a
                                  href={doc.data}
                                  download={doc.name}
                                  className="text-xs text-primary hover:underline flex-shrink-0"
                                >
                                  Download
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-card border border-border rounded-2xl">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-serif text-muted-foreground mb-2">No listings yet</h2>
              <p className="text-muted-foreground text-sm mb-6">Create your first property listing to get started</p>
              <Link href="/listings/new">
                <Button className="bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-black font-semibold gap-2">
                  <Plus className="h-4 w-4" /> Create First Listing
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
