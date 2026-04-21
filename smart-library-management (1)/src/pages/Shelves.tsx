import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api, Shelf } from "@/api/api-service";
import { Library, BookOpen, Layers, ChevronRight, Radio } from "lucide-react";

function ShelfCard({ shelf }: { shelf: Shelf }) {
  const fillPct =
    shelf.capacity > 0
      ? Math.min(Math.round((shelf.current_book_count / shelf.capacity) * 100), 100)
      : 0;

  const fillColor =
    fillPct >= 90 ? "bg-destructive" : fillPct >= 60 ? "bg-warning" : "bg-success";

  return (
    <div className="glass-card rounded-xl p-4 hover:border-primary/40 transition-all duration-200 hover:shadow-md">
      {/* Shelf code + section */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-lg font-extrabold font-mono text-primary">{shelf.code}</p>
          <p className="text-xs text-muted-foreground">{shelf.section_name}</p>
          {shelf.label && (
            <p className="text-[10px] text-muted-foreground mt-0.5 italic">{shelf.label}</p>
          )}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 rounded-lg px-2 py-1">
          <Layers className="w-3 h-3" />
          Row {shelf.row_number} · Col {shelf.column_number}
        </div>
      </div>

      {/* Occupancy bar */}
      <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
        <span>{shelf.current_book_count} books present</span>
        <span>Capacity: {shelf.capacity}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${fillColor}`}
          style={{ width: `${fillPct}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground mt-1 text-right">{fillPct}% full</p>
    </div>
  );
}

export default function Shelves() {
  const { data: shelves, isLoading } = useQuery({
    queryKey: ["shelves"],
    queryFn: api.getShelves,
    refetchInterval: 10000,
  });

  // Group by section
  const sections = shelves
    ? Array.from(new Set(shelves.map((s) => s.section_name))).sort()
    : [];

  return (
    <div className="space-y-7 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Shelves</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Physical shelf inventory — occupancy from last RFID scan
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-success bg-success/10 px-3 py-1.5 rounded-full">
          <Radio className="w-3.5 h-3.5 rfid-pulse" />
          Live data
        </div>
      </div>

      {/* Summary */}
      {shelves && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Shelves", value: shelves.length, icon: Library },
            {
              label: "Total Books",
              value: shelves.reduce((a, s) => a + s.current_book_count, 0),
              icon: BookOpen,
            },
            {
              label: "Total Capacity",
              value: shelves.reduce((a, s) => a + s.capacity, 0),
              icon: Layers,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="glass-card rounded-xl p-4 text-center">
              <Icon className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-extrabold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="glass-card rounded-xl p-10 text-center text-muted-foreground animate-pulse">
          Loading shelves…
        </div>
      )}

      {/* Shelves grouped by section */}
      {sections.map((section) => (
        <section key={section}>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <Library className="w-3.5 h-3.5" />
            {section}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shelves
              ?.filter((s) => s.section_name === section)
              .sort((a, b) => a.code.localeCompare(b.code))
              .map((shelf) => (
                <ShelfCard key={shelf.id} shelf={shelf} />
              ))}
          </div>
        </section>
      ))}

      {!isLoading && shelves?.length === 0 && (
        <div className="glass-card rounded-xl p-12 text-center">
          <Library className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-medium text-muted-foreground">No shelves found.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add shelves via the Django admin panel.
          </p>
          <a
            href="http://localhost:8000/admin"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 text-xs text-primary hover:underline"
          >
            Open Django Admin <ChevronRight className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}
