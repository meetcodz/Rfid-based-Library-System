import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api, ScanSession } from "@/api/api-service";
import {
  Radio,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import { StartScanDialog } from "@/components/StartScanDialog";

const statusConfig = {
  in_progress: {
    label: "Scanning…",
    icon: Radio,
    className: "text-primary bg-primary/10",
    dot: "bg-primary rfid-pulse",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "text-success bg-success/10",
    dot: "bg-success",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className: "text-destructive bg-destructive/10",
    dot: "bg-destructive",
  },
  cancelled: {
    label: "Cancelled",
    icon: Clock,
    className: "text-muted-foreground bg-muted/50",
    dot: "bg-muted-foreground",
  },
};

function SessionCard({ session }: { session: ScanSession }) {
  const cfg = statusConfig[session.status] ?? statusConfig.cancelled;
  const Icon = cfg.icon;
  const scanned = session.total_tags_scanned;
  const expected = session.total_expected;
  const missing = expected > 0 ? Math.max(0, expected - scanned) : null;
  const pct = expected > 0 ? Math.round((scanned / expected) * 100) : null;

  return (
    <Link
      to={`/sessions/${session.id}`}
      className="glass-card rounded-xl p-5 flex items-start gap-4 hover:border-primary/40 transition-all duration-200 hover:shadow-md group"
    >
      {/* Status icon */}
      <div className={`mt-0.5 p-2.5 rounded-lg shrink-0 ${cfg.className}`}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`status-dot ${cfg.dot}`} />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {cfg.label}
          </span>
        </div>

        <p className="text-base font-bold text-foreground">
          Shelf&nbsp;
          <span className="text-primary font-mono">{session.shelf_code || `#${session.shelf}`}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Device: {session.device_name || `Device #${session.device}`}
        </p>

        {/* Progress bar */}
        {expected > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>{scanned} scanned</span>
              <span>{expected} expected · {pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  session.status === "in_progress" ? "bg-primary" : missing === 0 ? "bg-success" : "bg-warning"
                }`}
                style={{ width: `${Math.min(pct ?? 0, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Missing badge */}
        {missing !== null && missing > 0 && (
          <div className="flex items-center gap-1.5 mt-2.5 text-destructive text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            {missing} book{missing > 1 ? "s" : ""} missing
          </div>
        )}
        {missing === 0 && session.status === "completed" && (
          <p className="mt-2 text-xs text-success font-semibold">✓ All books accounted for</p>
        )}
      </div>

      {/* Time + arrow */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className="text-[10px] text-muted-foreground">
          {new Date(session.started_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { data: sessions, isLoading, isError, refetch } = useQuery({
    queryKey: ["sessions"],
    queryFn: api.getSessions,
    refetchInterval: 4000,
  });

  const { data: missing } = useQuery({
    queryKey: ["missingReports"],
    queryFn: api.getMissingReports,
  });

  const { data: copies } = useQuery({
    queryKey: ["copies"],
    queryFn: api.getCopies,
    refetchInterval: 4000,
  });

  const active = sessions?.filter((s) => s.status === "in_progress") ?? [];
  const completed = sessions?.filter((s) => s.status === "completed") ?? [];
  const unresolved = missing?.filter((m) => !m.resolved_at) ?? [];

  return (
    <div className="space-y-7 max-w-3xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Scan Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live RFID shelf scans — auto-refreshes
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-xs font-medium text-muted-foreground transition-colors"
          >
            Refresh
          </button>
          <StartScanDialog />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active Scans", value: active.length, color: "text-primary", bg: "bg-primary/10" },
          { label: "Completed Today", value: completed.length, color: "text-success", bg: "bg-success/10" },
          { label: "Missing Books", value: unresolved.length, color: "text-destructive", bg: "bg-destructive/10" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`glass-card rounded-xl p-4 flex flex-col items-center text-center ${bg}`}>
            <span className={`text-3xl font-extrabold ${color}`}>{value}</span>
            <span className="text-xs text-muted-foreground mt-1 font-medium">{label}</span>
          </div>
        ))}
      </div>

      {/* Loading / error */}
      {isLoading && (
        <div className="glass-card rounded-xl p-10 text-center text-muted-foreground animate-pulse">
          <Radio className="w-8 h-8 mx-auto mb-3 rfid-pulse text-primary" />
          Loading sessions…
        </div>
      )}
      {isError && (
        <div className="glass-card rounded-xl p-6 text-center border-destructive/20 border">
          <p className="text-destructive font-semibold">Could not reach the backend.</p>
          <p className="text-xs text-muted-foreground mt-1">Make sure Django is running on port 5000.</p>
        </div>
      )}

      {/* Active scans */}
      {active.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <span className="status-dot bg-primary rfid-pulse" />
            Active Scans
          </h2>
          <div className="space-y-3">
            {active.map((s) => <SessionCard key={s.id} session={s} />)}
          </div>
        </section>
      )}

      {/* Recent sessions */}
      {sessions && sessions.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Session History
          </h2>
          <div className="space-y-3">
            {[...sessions]
              .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
              .slice(0, 5)
              .map((s) => <SessionCard key={s.id} session={s} />)}
          </div>
        </section>
      )}

      {/* Live Activity Feed */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          Live Activity (Last 5 scans)
        </h2>
        <div className="glass-card rounded-xl overflow-hidden divide-y divide-border">
          {copies?.slice(0, 5).map((copy) => (
            <div key={copy.id} className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">{copy.book_title}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 font-mono">{copy.rfid_tag}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  {copy.assigned_shelf_code || "Unknown"}
                </span>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  {copy.last_scanned_at ? new Date(copy.last_scanned_at).toLocaleTimeString() : "New Scan"}
                </p>
              </div>
            </div>
          ))}
          {(!copies || copies.length === 0) && (
            <div className="p-8 text-center text-xs text-muted-foreground italic">
              No recent shelf activity detected.
            </div>
          )}
        </div>
      </section>

      {!isLoading && !isError && sessions?.length === 0 && (
        <div className="glass-card rounded-xl p-12 text-center">
          <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">No scan sessions yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Click "Start New Scan" to begin auditing a shelf.</p>
        </div>
      )}
    </div>
  );
}
