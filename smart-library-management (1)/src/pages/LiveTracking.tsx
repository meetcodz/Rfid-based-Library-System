import { useState } from "react";
import { Search, Radio } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/api/api-service";

export default function LiveTracking() {
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightShelf, setHighlightShelf] = useState<string | null>(null);
  const [highlightBook, setHighlightBook] = useState<string | null>(null);

  const { data: gridData, isLoading: gridLoading } = useQuery({
    queryKey: ['shelfGrid'],
    queryFn: apiService.getShelfGrid
  });

  const { data: bookCopies } = useQuery({
    queryKey: ['copies'],
    queryFn: apiService.getBookCopies
  });

  const handleSearch = () => {
    if (!searchQuery) {
      setHighlightShelf(null);
      setHighlightBook(null);
      return;
    }
    
    const found = bookCopies?.find(
      (b: any) => 
        (b.book_title.toLowerCase().includes(searchQuery.toLowerCase()) || 
         b.rfid_tag.toLowerCase().includes(searchQuery.toLowerCase())) && 
        b.status === "available"
    );

    if (found) {
      setHighlightShelf(found.assigned_shelf_code);
      setHighlightBook(found.book_title);
    } else {
      setHighlightShelf(null);
      setHighlightBook(null);
    }
  };

  if (gridLoading) {
    return <div className="p-10 text-center text-muted-foreground">Loading library map...</div>;
  }

  const rows = 5;
  const cols = 4;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Live Tracking</h1>
        <p className="text-sm text-muted-foreground mt-1">Visual library map with real-time RFID book positions</p>
      </div>

      {/* Search to highlight */}
      <div className="glass-card rounded-xl p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search a book by title or RFID to locate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-10 pr-20 py-2.5 rounded-lg bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90 transition"
          >
            Locate
          </button>
        </div>
        {highlightBook && (
          <p className="text-xs text-success mt-2 font-medium animate-fade-in">
            📍 "{highlightBook}" found on Shelf {highlightShelf}
          </p>
        )}
      </div>

      {/* Library Grid Map */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-foreground">Library Floor Plan</h2>
          <div className="flex items-center gap-1.5 text-xs text-success font-medium">
            <Radio className="w-3.5 h-3.5 rfid-pulse" />
            Live
          </div>
        </div>

        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
          {Array.from({ length: rows * cols }).map((_, idx) => {
            const row = Math.floor(idx / cols);
            const col = idx % cols;
            const shelf = gridData?.find((s: any) => s.row === row && s.col === col);
            
            if (!shelf) {
              return <div key={idx} className="h-24 rounded-lg border border-dashed border-border/30" />;
            }
            
            const isHighlighted = shelf.id === highlightShelf;
            const hasBooks = shelf.books.length > 0;

            return (
              <div
                key={shelf.id}
                className={`h-24 rounded-lg border-2 p-3 flex flex-col justify-between transition-all duration-500 ${
                  isHighlighted
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/20 scale-105"
                    : hasBooks
                    ? "border-border bg-card hover:border-primary/40"
                    : "border-border/50 bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">{shelf.id}</span>
                  {isHighlighted && <span className="status-dot bg-primary rfid-pulse" />}
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground truncate">{shelf.section}</p>
                  {shelf.books.length > 0 && (
                    <p className="text-[9px] font-medium text-foreground truncate mt-0.5">
                      {shelf.books[0]}{shelf.books.length > 1 ? ` +${shelf.books.length - 1}` : ""}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-5 mt-5 pt-4 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <div className="w-3 h-3 rounded bg-card border border-border" /> Occupied
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <div className="w-3 h-3 rounded bg-muted/30 border border-border/50" /> Empty
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <div className="w-3 h-3 rounded bg-primary/10 border-2 border-primary" /> Located
          </div>
        </div>
      </div>
    </div>
  );
}
