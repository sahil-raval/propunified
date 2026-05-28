import { motion } from "framer-motion";
import { User, Shield, Building2, Phone, Mail, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useGetMe, useGetKyc, useListListings } from "@workspace/api-client-react";
import { useUser } from "@clerk/react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

const kycStatusConfig = {
  pending: {
    label: "Pending Review",
    color: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
    icon: Clock,
  },
  under_review: {
    label: "Under Review",
    color: "bg-blue-500/20 text-blue-600 border-blue-500/30",
    icon: Clock,
  },
  approved: {
    label: "KYC Verified",
    color: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Action Required",
    color: "bg-destructive/20 text-destructive border-destructive/30",
    icon: AlertCircle,
  },
};

export default function Profile() {
  const { user: clerkUser } = useUser();
  const { data: profile, isLoading } = useGetMe();
  const { data: kycRecord } = useGetKyc();
  const { data: listings } = useListListings();

  const kycStatus = kycRecord?.status as keyof typeof kycStatusConfig | undefined;
  const kycCfg = kycStatus ? kycStatusConfig[kycStatus] : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-serif mb-1">My Profile</h1>
            <p className="text-muted-foreground">Manage your account and verification status</p>
          </motion.div>

          {/* Profile Card */}
          {isLoading ? (
            <Skeleton className="h-48 rounded-2xl mb-6" />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-8 mb-6"
            >
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {clerkUser?.imageUrl ? (
                    <img
                      src={clerkUser.imageUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h2 className="text-2xl font-serif">
                      {profile?.fullName ?? clerkUser?.fullName ?? "Your Name"}
                    </h2>
                    {kycCfg && (
                      <Badge className={`text-xs border ${kycCfg.color}`}>
                        <kycCfg.icon className="h-3 w-3 mr-1" />
                        {kycCfg.label}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                    {(profile?.email ?? clerkUser?.primaryEmailAddress?.emailAddress) && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary/60" />
                        {profile?.email ?? clerkUser?.primaryEmailAddress?.emailAddress}
                      </div>
                    )}
                    {profile?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary/60" />
                        {profile.phone}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge
                      variant="outline"
                      className="border-border text-foreground/70 capitalize text-xs"
                    >
                      {profile?.role ?? "buyer"}
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              {
                label: "Listings",
                value: listings?.length ?? 0,
                icon: Building2,
                link: "/listings",
              },
              {
                label: "KYC Status",
                value: kycStatus ? kycStatusConfig[kycStatus]?.label : "Not Started",
                icon: Shield,
                link: "/kyc",
              },
              { label: "Account", value: "Active", icon: CheckCircle2, link: null },
            ].map(({ label, value, icon: Icon, link }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-2xl p-5 text-center hover:border-primary/20 transition-all hover:shadow-sm"
              >
                <Icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="font-bold text-lg leading-tight">{value}</div>
                <div className="text-xs text-muted-foreground mt-1">{label}</div>
                {link && (
                  <Link href={link} className="text-xs text-primary hover:underline block mt-2">
                    Manage
                  </Link>
                )}
              </motion.div>
            ))}
          </div>

          {/* KYC CTA */}
          {!kycRecord && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-primary/10 border border-primary/20 rounded-2xl p-6 flex items-center justify-between gap-4"
            >
              <div>
                <h3 className="font-semibold mb-1">Complete KYC Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Required to activate listings and sell properties
                </p>
              </div>
              <Link href="/kyc">
                <Button className="bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-black font-semibold hover:opacity-90 flex-shrink-0">
                  Start KYC
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
