import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, MissingReport } from "@/api/api-service";
import {
  ArrowLeft,
  Radio,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BookOpen,
  ScanLine,
  ShieldCheck,
  Clock,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

// ─── Status badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; pulse?: boolean }> = {
    in_progress: { label: "Scanning…", className: "bg-primary/15 text-primary border-primary/30", pulse: true },
    completed:   { label: "Completed",  className: "bg-success/15 text-success border-success/30" },
    failed:      { label: "Failed",     className: "bg-destructive/15 text-destructive border-destructive/30" },
    cancelled:   { label: "Cancelled",  className: "bg-muted/50 text-muted-foreground border-border" },
  };
  const cfg = map[status] ?? map.cancelled;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.className}`}>
      {cfg.pulse && <span className="status-dot bg-primary rfid-pulse" />}
      {cfg.label}
    </span>
  );
}

// ─── Book row in comparison table ────────────────────────────────────────────

type BookRowState = "found" | "missing" | "unexpected";

interface BookRowProps {
  title: string;
  accession: string;
  rfid: string;
  state: BookRowState;
  report?: MissingReport;
  onResolve?: (reportId: number) => void;
  resolving?: boolean;
}

function BookRow({ title, accession, rfid, state, report, onResolve, resolving }: BookRowProps) {
  const stateMap = {
    found: {
      icon: CheckCircle2,
      label: "Found",
      rowClass: "border-success/20 bg-success/5",
      iconClass: "text-success",
      badge: "bg-success/15 text-success",
    },
    missing: {
      icon: AlertTriangle,
      label: "Missing",
      rowClass: "border-destructive/20 bg-destructive/5",
      iconClass: "text-destructive",
      badge: "bg-destructive/15 text-destructive",
    },
    unexpected: {
      icon: ScanLine,
      label: "Extra (unexpected)",
      rowClass: "border-warning/20 bg-warning/5",
      iconClass: "text-warning",
      badge: "bg-warning/15 text-warning",
    },
  };

  const cfg = stateMap[state];
  const Icon = cfg.icon;

  return (
    <div className={`flex items-center gap-4 px-4 py-3 rounded-lg border ${cfg.rowClass} transition-all`}>
      <Icon className={`w-4 h-4 shrink-0 ${cfg.iconClass}`} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{title}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-[10px] text-muted-foreground font-mono">ACC: {accession}</span>
          <span className="text-[10px] text-muted-foreground font-mono">RFID: {rfid}</span>
        </div>
      </div>

      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${cfg.badge}`}>
        {cfg.label}
      </span>

      {state === "missing" && report && !report.resolved_at && onResolve && (
        <button
          onClick={() => onResolve(report.id)}
          disabled={resolving}
          className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-muted hover:bg-muted/70 text-foreground transition-colors shrink-0 disabled:opacity-50"
        >
          {resolving ? "…" : "Resolve"}
        </button>
      )}
      {state === "missing" && report?.resolved_at && (
        <ShieldCheck className="w-4 h-4 text-success shrink-0" />
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const sessionId = Number(id);
  const queryClient = useQueryClient();

  const { data: session, isLoading: sessionLoading, refetch } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => api.getSession(sessionId),
    refetchInterval: (data) => (data?.status === "in_progress" ? 3000 : false),
  });

  // Expected books on this shelf
  const { data: expectedCopies, isLoading: copiesLoading } = useQuery({
    queryKey: ["shelfCopies", session?.shelf],
    queryFn: () => api.getShelfCopies(session!.shelf),
    enabled: !!session?.shelf,
  });

  // Missing reports for this session
  const { data: allMissing } = useQuery({
    queryKey: ["missingReports"],
    queryFn: api.getMissingReports,
    refetchInterval: 5000,
  });

  const sessionMissing = allMissing?.filter((r) => r.session === sessionId) ?? [];

  const resolveMutation = useMutation({
    mutationFn: ({ reportId, notes }: { reportId: number; notes: string }) =>
      api.resolveMissing(reportId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missingReports"] });
      toast.success("Report marked as resolved.");
    },
    onError: () => toast.error("Failed to resolve report."),
  });

  if (sessionLoading || copiesLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-60 gap-3 text-muted-foreground">
        <Radio className="w-8 h-8 rfid-pulse text-primary" />
        <p>Loading session data…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive font-semibold">Session not found.</p>
        <Link to="/" className="text-sm text-primary mt-2 inline-block">← Back to sessions</Link>
      </div>
    );
  }

  // Build comparison sets
  // expected: all book copies assigned to this shelf
  const expectedRfids = new Set(expectedCopies?.map((c) => c.rfid_tag) ?? []);
  // missing: rfid tags that have a missing report in this session (not resolved)
  const missingRfids = new Set(sessionMissing.filter((r) => !r.resolved_at).map((r) => r.rfid_tag));

  // Books expected that are NOT missing = found during scan
  const foundCopies = expectedCopies?.filter((c) => !missingRfids.has(c.rfid_tag)) ?? [];
  const missingCopies = expectedCopies?.filter((c) => missingRfids.has(c.rfid_tag)) ?? [];

  const totalExpected = expectedCopies?.length ?? 0;
  const totalFound = foundCopies.length;
  const totalMissing = missingCopies.length;
  const pct = totalExpected > 0 ? Math.round((totalFound / totalExpected) * 100) : 100;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back nav */}
      <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" />
        All Sessions
      </Link>

      {/* Session header card */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Radio className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Session #{session.id}</p>
                <h1 className="text-2xl font-extrabold text-foreground font-mono tracking-tight">
                  {session.shelf_code || `Shelf #${session.shelf}`}
                </h1>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Device: <span className="text-foreground font-medium">{session.device_name || `#${session.device}`}</span>
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Started {new Date(session.started_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              {session.ended_at && (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Ended {new Date(session.ended_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={session.status} />
            {session.status === "in_progress" && (
              <button
                onClick={() => refetch()}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            )}
          </div>
        </div>

        {/* Progress summary */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { label: "Expected", value: totalExpected, color: "text-foreground" },
            { label: "Found",    value: totalFound,    color: "text-success" },
            { label: "Missing",  value: totalMissing,  color: totalMissing > 0 ? "text-destructive" : "text-success" },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center p-3 rounded-xl bg-muted/30">
              <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Reconciliation progress</span>
            <span className="font-semibold">{pct}% accounted for</span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                totalMissing === 0 ? "bg-success" : pct > 70 ? "bg-warning" : "bg-destructive"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {totalMissing === 0 && totalExpected > 0 && (
          <div className="mt-4 flex items-center gap-2 text-success font-semibold text-sm">
            <ShieldCheck className="w-4 h-4" />
            All {totalExpected} books are accounted for on this shelf.
          </div>
        )}
      </div>

      {/* Book Comparison Table */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Book Reconciliation
          </h2>
          <div className="flex items-center gap-4 text-[10px] font-semibold text-muted-foreground">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-success"/>Found</span>
            <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-destructive"/>Missing</span>
          </div>
        </div>

        {totalExpected === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No books assigned to this shelf yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Missing books first (most important) */}
            {missingCopies.map((copy) => {
              const report = sessionMissing.find((r) => r.rfid_tag === copy.rfid_tag);
              return (
                <BookRow
                  key={copy.id}
                  title={copy.book_title}
                  accession={copy.accession_number}
                  rfid={copy.rfid_tag}
                  state="missing"
                  report={report}
                  resolving={resolveMutation.isPending}
                  onResolve={(rid) =>
                    resolveMutation.mutate({ reportId: rid, notes: "Resolved via dashboard." })
                  }
                />
              );
            })}

            {/* Found books */}
            {foundCopies.map((copy) => (
              <BookRow
                key={copy.id}
                title={copy.book_title}
                accession={copy.accession_number}
                rfid={copy.rfid_tag}
                state="found"
              />
            ))}
          </div>
        )}
      </div>

      {/* Scanned tag count vs session data */}
      {session.total_tags_scanned > 0 && (
        <div className="glass-card rounded-xl p-4 flex items-center gap-4 text-sm">
          <ScanLine className="w-5 h-5 text-primary shrink-0" />
          <p className="text-muted-foreground">
            Scanner read{" "}
            <span className="font-bold text-foreground">{session.total_tags_scanned}</span> RFID tag
            {session.total_tags_scanned !== 1 ? "s" : ""} in this session.
            {session.total_expected > 0 && (
              <>
                {" "}
                Expected{" "}
                <span className="font-bold text-foreground">{session.total_expected}</span>.
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
