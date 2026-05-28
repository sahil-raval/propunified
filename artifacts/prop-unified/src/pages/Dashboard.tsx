import { motion } from "framer-motion";
import { Building2, FileText, Users, MessageSquare, TrendingUp, ArrowUpRight, Mail } from "lucide-react";
import { useGetDashboardStats, useGetPipeline, useListInquiries } from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

function StatCard({
  label,
  value,
  icon: Icon,
  change,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  change?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-6 hover:border-primary/20 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-primary/10 rounded-xl">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {change && (
          <span className="text-xs text-emerald-500 flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" />
            {change}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold mb-1">{value.toLocaleString()}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </motion.div>
  );
}

function PipelineBar({
  stage,
  count,
  value,
  color,
}: {
  stage: string;
  count: number;
  value: number;
  color: string;
}) {
  const formatted =
    value >= 10000000
      ? `₹${(value / 10000000).toFixed(1)}Cr`
      : value >= 100000
        ? `₹${(value / 100000).toFixed(1)}L`
        : `₹${value.toLocaleString()}`;
  return (
    <div className="relative flex items-center group">
      <div
        className="h-16 flex items-center justify-between px-6 text-white font-medium text-sm transition-all group-hover:brightness-110 cursor-default"
        style={{
          backgroundColor: color,
          clipPath:
            "polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%, 20px 50%)",
          minWidth: 160,
          paddingLeft: 32,
        }}
      >
        <div>
          <div className="font-bold text-lg leading-none">{count}</div>
          <div className="text-xs opacity-80 mt-1">{stage}</div>
        </div>
        <div className="text-right">
          <div className="text-xs opacity-80">Value</div>
          <div className="font-semibold">{formatted}</div>
        </div>
      </div>
    </div>
  );
}

const statusColors: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  contacted: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
  scheduled: "bg-purple-500/20 text-purple-500 border-purple-500/30",
  closed: "bg-green-500/20 text-green-500 border-green-500/30",
};

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: pipeline, isLoading: pipelineLoading } = useGetPipeline();
  const { data: inquiries, isLoading: inquiriesLoading } = useListInquiries();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-serif mb-1">Command Center</h1>
            <p className="text-muted-foreground">Your real estate pipeline at a glance</p>
          </motion.div>

          {/* Stats Grid */}
          {statsLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-2xl" />
              ))}
            </div>
          ) : (
            stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total Properties" value={stats.totalProperties} icon={Building2} change="+12%" />
                <StatCard label="Active Listings" value={stats.activeListings} icon={FileText} change="+5%" />
                <StatCard label="Total Inquiries" value={stats.totalInquiries} icon={MessageSquare} change="+18%" />
                <StatCard label="Registered Users" value={stats.totalUsers} icon={Users} change="+8%" />
              </div>
            )
          )}

          {/* Pipeline */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-serif">Sales Pipeline</h2>
            </div>
            {pipelineLoading ? (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-48 rounded flex-shrink-0" />
                ))}
              </div>
            ) : (
              <div className="flex gap-1 overflow-x-auto pb-2">
                {pipeline?.map((stage) => (
                  <PipelineBar
                    key={stage.stage}
                    stage={stage.stage}
                    count={stage.count}
                    value={stage.value}
                    color={stage.color ?? "#888"}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { label: "New Listing", href: "/listings/new", icon: Building2, desc: "Add a property" },
              { label: "Newsletter", href: "/newsletter", icon: Mail, desc: "Send updates" },
              { label: "KYC Verify", href: "/kyc", icon: FileText, desc: "Complete KYC" },
              { label: "All Listings", href: "/listings", icon: Users, desc: "Manage listings" },
            ].map(({ label, href, icon: Icon, desc }) => (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all cursor-pointer group"
                >
                  <div className="p-2 bg-primary/10 rounded-lg mb-3 w-fit group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </motion.div>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Properties by Type */}
            {stats && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-lg font-serif mb-4">Properties by Type</h2>
                <div className="space-y-3">
                  {stats.propertiesByType.map((item) => {
                    const pct =
                      stats.totalProperties > 0
                        ? Math.round((item.count / stats.totalProperties) * 100)
                        : 0;
                    return (
                      <div key={item.label} className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-24 capitalize">
                          {item.label}
                        </span>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-[#C9A84C] to-[#E8C97A]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Inquiries */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-serif">Recent Inquiries</h2>
                <Link href="/listings" className="text-xs text-primary hover:underline">
                  View All
                </Link>
              </div>
              {inquiriesLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-14 rounded-xl" />
                  ))}
                </div>
              ) : inquiries && inquiries.length > 0 ? (
                <div className="space-y-3">
                  {inquiries.slice(0, 5).map((inq) => (
                    <div
                      key={inq.id}
                      data-testid={`row-inquiry-${inq.id}`}
                      className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border/50"
                    >
                      <div>
                        <div className="text-sm font-medium">{inq.name}</div>
                        <div className="text-xs text-muted-foreground">{inq.phone}</div>
                      </div>
                      <Badge
                        className={`text-xs border ${statusColors[inq.status] ?? ""}`}
                      >
                        {inq.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No inquiries yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
