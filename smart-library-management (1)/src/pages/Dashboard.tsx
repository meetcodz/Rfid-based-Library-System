import { BookOpen, CheckCircle, AlertTriangle, MapPin, Activity, Bell, ArrowRight } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/api/api-service";

const logTypeStyles = {
  "check-in": "bg-success/10 text-success",
  "check-out": "bg-primary/10 text-primary",
  "movement": "bg-warning/10 text-warning",
  "misplaced": "bg-destructive/10 text-destructive",
};

export default function Dashboard() {
  const { data: analytics, isLoading: statsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: apiService.getAnalytics
  });

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: apiService.getAlerts
  });

  const { data: recentLogs } = useQuery({
    queryKey: ['recentLogs'],
    queryFn: apiService.getIssueRecords, // Using issue records as activity for now
    select: (data) => (Array.isArray(data) ? data.slice(0, 5) : [])
  });

  if (statsLoading || alertsLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading dashboard data...</div>;
  }

  const stats = {
    total: analytics?.total_books || 0,
    available: ((analytics?.total_books || 0) - (analytics?.active_issues || 0)),
    issued: analytics?.active_issues || 0,
    missing: alerts?.length || 0,
  };

  const activeAlerts = alerts?.filter((a: any) => !a.resolved_at) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time library overview powered by RFID</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Books" value={stats.total} icon={BookOpen} accent="primary" />
        <StatCard title="Available" value={stats.available} icon={CheckCircle} accent="secondary" />
        <StatCard title="Issued" value={stats.issued} icon={Activity} accent="warning" />
        <StatCard title="Missing" value={stats.missing} icon={AlertTriangle} accent="destructive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RFID Scanner Status - Static for now but could be wired to /scanner/devices/ */}
        <div className="glass-card rounded-xl p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">RFID Scanner Status</h2>
            <span className="flex items-center gap-1.5 text-xs font-medium text-success">
              <span className="status-dot bg-success rfid-pulse" />
              All Active
            </span>
          </div>
          <div className="space-y-3">
            {["Entrance Gate", "Exit Gate", "Shelf Zone A-C", "Shelf Zone D-F"].map((name, i) => (
              <div key={name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{name}</p>
                    <p className="text-[10px] text-muted-foreground">Reader #{i + 1}</p>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">Active</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card rounded-xl p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Recent RFID Activity</h2>
            <Link to="/analytics" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentLogs?.map((log: any) => (
              <div key={log.id} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                <div className={`p-1.5 rounded-lg bg-primary/10 text-primary`}>
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{log.book_title}</p>
                  <p className="text-[10px] text-muted-foreground">{log.status} • {log.member_name}</p>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {new Date(log.issued_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Alerts Banner */}
      {activeAlerts.length > 0 && (
        <Link to="/alerts" className="glass-card rounded-xl p-4 flex items-center gap-4 border-warning/30 hover:border-warning/60 transition-colors animate-fade-in">
          <div className="p-2.5 rounded-xl bg-warning/10">
            <Bell className="w-5 h-5 text-warning" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{activeAlerts.length} Active Alert{activeAlerts.length > 1 ? "s" : ""}</p>
            <p className="text-xs text-muted-foreground">{activeAlerts[0].notes || activeAlerts[0].book_title}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </Link>
      )}
    </div>
  );
}
