import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { Activity, TrendingUp, BookOpen, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/api/api-service";

const logTypeLabels: Record<string, string> = {
  "active": "Issued",
  "returned": "Returned",
  "overdue": "Overdue",
  "lost": "Lost",
};

const PIE_COLORS = ["hsl(210, 80%, 55%)", "hsl(160, 50%, 48%)", "hsl(38, 92%, 55%)", "hsl(280, 60%, 55%)", "hsl(215, 15%, 50%)"];

export default function Analytics() {
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: apiService.getAnalytics
  });

  const { data: issueRecords, isLoading: logsLoading } = useQuery({
    queryKey: ['activeIssues'],
    queryFn: apiService.getIssueRecords
  });

  if (analyticsLoading || logsLoading) {
    return <div className="p-10 text-center text-muted-foreground">Loading analytics...</div>;
  }

  const genreDist = analytics?.genre_distribution?.map((g: any, i: number) => ({
    name: g.name,
    value: g.book_count,
    fill: PIE_COLORS[i % PIE_COLORS.length]
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Book usage trends and RFID scan activity</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Books", value: analytics?.total_books || 0, icon: BookOpen },
          { label: "Active Issues", value: analytics?.active_issues || 0, icon: TrendingUp },
          { label: "Total Members", value: analytics?.total_members || 0, icon: Activity },
          { label: "Avg. Duration", value: "14 days", icon: Clock },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Trends */}
        <div className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Monthly Usage Trends</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analytics?.usage_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="checkouts" stroke="hsl(210, 80%, 55%)" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="returns" stroke="hsl(160, 50%, 48%)" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="searches" stroke="hsl(38, 92%, 55%)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Genre Distribution */}
        <div className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Genre Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie 
                data={genreDist} 
                cx="50%" 
                cy="50%" 
                innerRadius={55} 
                outerRadius={90} 
                paddingAngle={3} 
                dataKey="value" 
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} 
                labelLine={false} 
                fontSize={10}
              >
                {genreDist.map((entry: any, i: number) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Log */}
      <div className="glass-card rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Library Transaction Log</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Time</th>
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Book</th>
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Member</th>
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {issueRecords?.map((log: any) => (
                <tr key={log.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-3 text-xs text-muted-foreground">{new Date(log.issued_at).toLocaleDateString()}</td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      log.status === "returned" ? "bg-success/10 text-success" :
                      log.status === "active" ? "bg-primary/10 text-primary" :
                      log.status === "overdue" ? "bg-warning/10 text-warning" :
                      "bg-destructive/10 text-destructive"
                    }`}>
                      {logTypeLabels[log.status] || log.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-xs font-medium text-foreground">{log.book_title}</td>
                  <td className="py-2.5 px-3 text-xs text-muted-foreground">{log.member_name}</td>
                  <td className="py-2.5 px-3 text-xs text-muted-foreground">{new Date(log.due_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
