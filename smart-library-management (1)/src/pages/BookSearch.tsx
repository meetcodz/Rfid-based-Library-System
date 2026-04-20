import { useState } from "react";
import { Search, Filter, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/api/api-service";

const statusStyles: Record<string, string> = {
  available: "bg-success/10 text-success",
  issued: "bg-warning/10 text-warning",
  missing: "bg-destructive/10 text-destructive",
};

export default function BookSearch() {
  const [query, setQuery] = useState("");
  const [filterGenre, setFilterGenre] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const { data: books, isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: apiService.getBooks
  });

  const { data: copies } = useQuery({
    queryKey: ['copies'],
    queryFn: apiService.getBookCopies
  });

  if (isLoading) {
    return <div className="p-10 text-center text-muted-foreground">Loading library catalog...</div>;
  }

  // Consolidating metadata (Book) and physical copies (BookCopy) for the UI
  const displayBooks = copies?.map((copy: any) => ({
    id: copy.id,
    title: copy.book_title,
    author: "Library Catalog", // Backend Book model has authors M2M, for simplicity in search title
    genre: "General", // Placeholder if genre not mapped
    isbn: copy.book_isbn,
    rfidTag: copy.rfid_tag,
    status: copy.status,
    shelf: copy.assigned_shelf_code || "Unknown",
    section: "Main Library",
    coverColor: "from-blue-500 to-blue-700", // Static color for now
  })) || [];

  const genres = [...new Set(displayBooks.map((b: any) => b.genre))];

  const filtered = displayBooks.filter((b: any) => {
    const matchQuery = !query || b.title.toLowerCase().includes(query.toLowerCase()) || b.isbn.toLowerCase().includes(query.toLowerCase());
    const matchGenre = !filterGenre || b.genre === filterGenre;
    const matchStatus = !filterStatus || b.status === filterStatus;
    return matchQuery && matchGenre && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Book Search</h1>
        <p className="text-sm text-muted-foreground mt-1">Find books by title, author, or genre with real-time location data</p>
      </div>

      {/* Search & Filters */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title or ISBN..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition"
          />
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={filterGenre}
            onChange={(e) => setFilterGenre(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border text-xs text-foreground focus:outline-none"
          >
            <option value="">All Categories</option>
            {genres.map((g: any) => <option key={g} value={g}>{g}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border text-xs text-foreground focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="issued">Issued</option>
            <option value="missing">Missing</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((book: any, i: number) => (
          <div key={book.id} className="glass-card rounded-xl overflow-hidden animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            {/* Cover */}
            <div className={`h-32 bg-gradient-to-br ${book.coverColor} flex items-end p-4`}>
              <div className="text-[10px] font-mono tracking-wider uppercase text-primary-foreground/70">{book.rfidTag}</div>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground leading-tight">{book.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">ISBN: {book.isbn}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${statusStyles[book.status] || "bg-muted text-muted-foreground"}`}>
                  {book.status}
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Shelf {book.shelf}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/50">
                <span>{book.genre}</span>
                <span>{book.section}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No books found</p>
          <p className="text-xs mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
