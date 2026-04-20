import { useState } from "react";
import { Bell, AlertTriangle, Clock, ShieldAlert, CheckCircle2, BookOpen } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/api/api-service";
import { toast } from "sonner";

const severityStyles = {
  low: "border-l-warning bg-warning/5",
  medium: "border-l-primary bg-primary/5",
  high: "border-l-destructive bg-destructive/5",
};

const typeIcons = {
  misplaced: AlertTriangle,
  unauthorized: ShieldAlert,
  "late-return": Clock,
  missing: BookOpen,
};

export default function Alerts() {
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("all");
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: apiService.getAlerts
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) => fetch(`http://localhost:8000/api/scanner/missing-reports/${id}/resolve/`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success("Alert resolved successfully");
    }
  });

  if (isLoading) {
    return <div className="p-10 text-center text-muted-foreground">Loading alerts...</div>;
  }

  // Mapping backend MissingReport to frontend Alert shape
  const displayAlerts = alerts?.map((a: any) => ({
    id: a.id.toString(),
    type: "missing", // Mostly missing reports from the scanner
    message: a.notes || `Book "${a.book_title}" missing from shelf ${a.shelf_code}`,
    timestamp: a.created_at,
    severity: "high" as const,
    resolved: !!a.resolved_at,
    bookTitle: a.book_title
  })) || [];

  const filtered = displayAlerts.filter((a: any) => {
    if (filter === "active") return !a.resolved;
    if (filter === "resolved") return a.resolved;
    return true;
  });

  const resolveAlert = (id: string) => {
    resolveMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Alerts & Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">Misplaced books, unauthorized movement, and return reminders</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(["all", "active", "resolved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {f} {f === "active" ? `(${displayAlerts.filter((a: any) => !a.resolved).length})` : ""}
          </button>
        ))}
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filtered.map((alert: any, i: number) => {
          const Icon = (typeIcons as any)[alert.type] || Bell;
          return (
            <div
              key={alert.id}
              className={`glass-card rounded-xl p-4 border-l-4 animate-fade-in ${severityStyles[alert.severity]} ${alert.resolved ? "opacity-60" : ""}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Icon className={`w-4.5 h-4.5 ${alert.severity === "high" ? "text-destructive" : alert.severity === "medium" ? "text-primary" : "text-warning"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{alert.type.replace("-", " ")}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold uppercase ${
                      alert.severity === "high" ? "bg-destructive/10 text-destructive" : alert.severity === "medium" ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{alert.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
                {!alert.resolved ? (
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    disabled={resolveMutation.isPending}
                    className="text-[10px] px-3 py-1 rounded-md bg-muted text-muted-foreground hover:text-foreground font-medium transition whitespace-nowrap"
                  >
                    {resolveMutation.isPending ? "Resolving..." : "Resolve"}
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] text-success font-medium whitespace-nowrap">
                    <CheckCircle2 className="w-3 h-3" /> Resolved
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No alerts</p>
        </div>
      )}
    </div>
  );
}
