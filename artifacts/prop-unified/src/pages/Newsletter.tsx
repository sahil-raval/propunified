import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Send, Clock, CheckCircle2, Edit2, Trash2, Plus, Calendar,
  Users, ChevronDown, ChevronUp, FileText
} from "lucide-react";
import {
  useListNewsletters,
  useCreateNewsletter,
  useUpdateNewsletter,
  useDeleteNewsletter,
  useSendNewsletter,
  getListNewslettersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

type Newsletter = {
  id: number;
  subject: string;
  body: string;
  status: string;
  scheduledAt?: string | null;
  sentAt?: string | null;
  recipientCount: number;
  createdAt: string;
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground border-border", icon: Edit2 },
  scheduled: { label: "Scheduled", color: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30", icon: Clock },
  sent: { label: "Sent", color: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30", icon: CheckCircle2 },
};

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

const defaultForm = { subject: "", body: "", scheduledAt: "" };

export default function Newsletter() {
  const { data: newsletters, isLoading } = useListNewsletters();
  const createNewsletter = useCreateNewsletter();
  const updateNewsletter = useUpdateNewsletter();
  const deleteNewsletter = useDeleteNewsletter();
  const sendNewsletter = useSendNewsletter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [showCompose, setShowCompose] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: getListNewslettersQueryKey() });
  }

  function startCompose() {
    setEditingId(null);
    setForm(defaultForm);
    setShowCompose(true);
  }

  function startEdit(n: Newsletter) {
    setEditingId(n.id);
    setForm({
      subject: n.subject,
      body: n.body,
      scheduledAt: n.scheduledAt ? n.scheduledAt.slice(0, 16) : "",
    });
    setShowCompose(true);
  }

  async function handleSubmit() {
    if (!form.subject.trim() || !form.body.trim()) {
      toast({ title: "Subject and body are required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        subject: form.subject,
        body: form.body,
        scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined,
      };
      if (editingId != null) {
        await updateNewsletter.mutateAsync({ id: editingId, data: payload });
        toast({ title: "Newsletter updated" });
      } else {
        await createNewsletter.mutateAsync({ data: payload });
        toast({ title: form.scheduledAt ? "Newsletter scheduled!" : "Draft saved!" });
      }
      invalidate();
      setShowCompose(false);
      setForm(defaultForm);
      setEditingId(null);
    } catch {
      toast({ title: "Failed to save newsletter", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  function handleSend(id: number) {
    setSendingId(id);
    sendNewsletter.mutate(
      { id },
      {
        onSuccess: () => {
          invalidate();
          toast({ title: "Newsletter sent!", description: "Delivered to all subscribers." });
          setSendingId(null);
        },
        onError: () => {
          toast({ title: "Failed to send newsletter", variant: "destructive" });
          setSendingId(null);
        },
      }
    );
  }

  function handleDelete(id: number) {
    setDeletingId(id);
    deleteNewsletter.mutate(
      { id },
      {
        onSuccess: () => {
          invalidate();
          toast({ title: "Newsletter deleted" });
          setDeletingId(null);
        },
        onError: () => {
          toast({ title: "Failed to delete", variant: "destructive" });
          setDeletingId(null);
        },
      }
    );
  }

  const inputCls = "bg-input border-border focus:border-primary/50";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-serif mb-1">Newsletter</h1>
              <p className="text-muted-foreground">Compose, schedule, and send updates to your subscribers</p>
            </div>
            <Button
              onClick={startCompose}
              className="bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-black font-semibold gap-2 hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Compose
            </Button>
          </motion.div>

          {/* Stats row */}
          {newsletters && newsletters.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Total", value: newsletters.length, icon: FileText },
                { label: "Scheduled", value: newsletters.filter(n => n.status === "scheduled").length, icon: Clock },
                { label: "Sent", value: newsletters.filter(n => n.status === "sent").length, icon: CheckCircle2 },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-serif font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Compose / Edit panel */}
          <AnimatePresence>
            {showCompose && (
              <motion.div
                key="compose"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="bg-card border border-primary/30 rounded-2xl p-6 mb-6 shadow-sm"
              >
                <h2 className="text-lg font-serif mb-5 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  {editingId != null ? "Edit Newsletter" : "New Newsletter"}
                </h2>

                <div className="space-y-4">
                  <div>
                    <Label className="text-foreground/80 mb-2 block">Subject *</Label>
                    <Input
                      value={form.subject}
                      onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                      placeholder="e.g. New Properties in Dholera Smart City"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <Label className="text-foreground/80 mb-2 block">Body *</Label>
                    <Textarea
                      value={form.body}
                      onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                      placeholder="Write your newsletter content here..."
                      className={`${inputCls} resize-none`}
                      rows={8}
                    />
                  </div>

                  <div>
                    <Label className="text-foreground/80 mb-2 block flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" /> Schedule Date & Time
                      <span className="text-xs text-muted-foreground font-normal">(leave blank to save as draft)</span>
                    </Label>
                    <Input
                      type="datetime-local"
                      value={form.scheduledAt}
                      onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                      className={inputCls}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-black font-semibold gap-2 hover:opacity-90"
                    >
                      {submitting ? "Saving..." : form.scheduledAt ? "Schedule" : "Save Draft"}
                      {form.scheduledAt ? <Clock className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" onClick={() => { setShowCompose(false); setEditingId(null); setForm(defaultForm); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Newsletter list */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
            </div>
          ) : newsletters && newsletters.length > 0 ? (
            <div className="space-y-4">
              {(newsletters as Newsletter[]).map((n, i) => {
                const cfg = statusConfig[n.status] ?? statusConfig.draft;
                const StatusIcon = cfg.icon;
                const isExpanded = expandedId === n.id;
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/20 transition-all hover:shadow-sm"
                  >
                    <div className="p-5 flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0 mt-0.5">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <h3 className="font-semibold text-foreground truncate">{n.subject}</h3>
                          <Badge className={`text-xs border flex-shrink-0 ${cfg.color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {cfg.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          {n.status === "scheduled" && n.scheduledAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" /> {fmtDate(n.scheduledAt)}
                            </span>
                          )}
                          {n.status === "sent" && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" /> {n.recipientCount.toLocaleString()} recipients
                            </span>
                          )}
                          {n.status === "sent" && n.sentAt && (
                            <span className="flex items-center gap-1">
                              <Send className="h-3.5 w-3.5" /> {fmtDate(n.sentAt)}
                            </span>
                          )}
                          {n.status === "draft" && (
                            <span>Created {fmtDate(n.createdAt)}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : n.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>

                        {n.status !== "sent" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEdit(n)}
                              className="text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSend(n.id)}
                              disabled={sendingId === n.id}
                              className="text-muted-foreground hover:text-primary hover:bg-primary/10 gap-1 text-xs px-2"
                            >
                              <Send className="h-3.5 w-3.5" />
                              {sendingId === n.id ? "Sending..." : "Send Now"}
                            </Button>
                          </>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(n.id)}
                          disabled={deletingId === n.id}
                          className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Expanded body preview */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-0 border-t border-border/50">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Content Preview</p>
                            <div className="bg-muted/50 rounded-xl p-4 text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                              {n.body}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-card border border-border rounded-2xl">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-serif text-muted-foreground mb-2">No newsletters yet</h2>
              <p className="text-muted-foreground text-sm mb-6">Compose your first newsletter to engage subscribers</p>
              <Button onClick={startCompose} className="bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-black font-semibold gap-2">
                <Plus className="h-4 w-4" /> Compose First Newsletter
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
