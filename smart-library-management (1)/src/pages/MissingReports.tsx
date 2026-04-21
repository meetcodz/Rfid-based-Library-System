import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api, MissingReport } from "@/api/api-service";
import {
  AlertTriangle,
  ShieldCheck,
  BookOpen,
  ChevronRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

function MissingCard({
  report,
  onResolve,
  resolving,
}: {
  report: MissingReport;
  onResolve: (id: number) => void;
  resolving: boolean;
}) {
  const isResolved = !!report.resolved_at;

  return (
    <div
      className={`glass-card rounded-xl p-4 flex items-start gap-4 transition-all duration-300 ${
        isResolved ? "opacity-50" : "border-destructive/20"
      }`}
    >
      <div
        className={`mt-0.5 p-2 rounded-lg shrink-0 ${
          isResolved ? "bg-success/10" : "bg-destructive/10"
        }`}
      >
        {isResolved ? (
          <ShieldCheck className="w-4 h-4 text-success" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-destructive" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground truncate">{report.book_title}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
          <span className="text-[10px] font-mono text-muted-foreground">
            RFID: {report.rfid_tag}
          </span>
          <span className="text-[10px] text-muted-foreground">
            Shelf:{" "}
            <Link
              to={`/sessions/${report.session}`}
              className="font-semibold text-primary hover:underline"
            >
              {report.shelf_code}
            </Link>
          </span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isResolved
                ? "bg-success/15 text-success"
                : "bg-destructive/15 text-destructive"
            }`}
          >
            {isResolved ? "Resolved" : "Unresolved"}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="w-3 h-3" />
            {new Date(report.created_at).toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {report.notes && (
          <p className="mt-1.5 text-[10px] text-muted-foreground italic truncate">
            {report.notes}
          </p>
        )}
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <Link
          to={`/sessions/${report.session}`}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
        >
          Session #{report.session}
          <ChevronRight className="w-3 h-3" />
        </Link>

        {!isResolved && (
          <button
            onClick={() => onResolve(report.id)}
            disabled={resolving}
            className="px-3 py-1 rounded-md text-xs font-semibold bg-success text-white hover:bg-success/80 transition-colors disabled:opacity-50"
          >
            {resolving ? "…" : "Resolve"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function MissingReports() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unresolved" | "resolved">(
    "unresolved"
  );

  const { data: reports, isLoading } = useQuery({
    queryKey: ["missingReports"],
    queryFn: api.getMissingReports,
    refetchInterval: 6000,
  });

  const resolveMutation = useMutation({
    mutationFn: (id: number) => api.resolveMissing(id, "Resolved via dashboard."),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missingReports"] });
      toast.success("Book marked as resolved.");
    },
    onError: () => toast.error("Failed to resolve report."),
  });

  const unresolved = reports?.filter((r) => !r.resolved_at) ?? [];
  const resolved = reports?.filter((r) => r.resolved_at) ?? [];

  const displayed =
    filter === "all"
      ? reports ?? []
      : filter === "unresolved"
      ? unresolved
      : resolved;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Missing Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Books that were expected on a shelf but not detected during a scan.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-4 flex items-center gap-4 bg-destructive/5 border-destructive/20">
          <AlertTriangle className="w-8 h-8 text-destructive" />
          <div>
            <p className="text-2xl font-extrabold text-destructive">{unresolved.length}</p>
            <p className="text-xs text-muted-foreground">Unresolved</p>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 flex items-center gap-4 bg-success/5 border-success/20">
          <CheckCircle2 className="w-8 h-8 text-success" />
          <div>
            <p className="text-2xl font-extrabold text-success">{resolved.length}</p>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="glass-card rounded-xl p-1.5 inline-flex gap-1">
        {(["unresolved", "all", "resolved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              filter === f
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="glass-card rounded-xl p-10 text-center text-muted-foreground animate-pulse">
          Loading reports…
        </div>
      ) : displayed.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-medium text-muted-foreground">
            {filter === "unresolved"
              ? "No unresolved missing books 🎉"
              : "No reports in this category."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...displayed]
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
            .map((r) => (
              <MissingCard
                key={r.id}
                report={r}
                onResolve={(id) => resolveMutation.mutate(id)}
                resolving={resolveMutation.isPending}
              />
            ))}
        </div>
      )}
    </div>
  );
}
