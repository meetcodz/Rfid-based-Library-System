import { useState } from "react";
import { Scan, CheckCircle, BookOpen, User, ArrowLeftRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/api/api-service";
import { toast } from "sonner";

type Mode = "issue" | "return";

export default function IssueReturn() {
  const [mode, setMode] = useState<Mode>("issue");
  const [rfidInput, setRfidInput] = useState("");
  const [scannedBook, setScannedBook] = useState<any>(null);
  const [scannedStudent, setScannedStudent] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const { data: bookCopies } = useQuery({
    queryKey: ['copies'],
    queryFn: apiService.getBookCopies
  });

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: apiService.getStudents
  });

  const { data: activeIssues } = useQuery({
    queryKey: ['activeIssues'],
    queryFn: apiService.getIssueRecords
  });

  const issueMutation = useMutation({
    mutationFn: apiService.issueBook,
    onSuccess: () => {
      handleSuccess();
      queryClient.invalidateQueries({ queryKey: ['activeIssues', 'copies', 'analytics'] });
    },
    onError: (err: any) => setError(err.message || "Failed to issue book")
  });

  const returnMutation = useMutation({
    mutationFn: apiService.returnBook,
    onSuccess: () => {
      handleSuccess();
      queryClient.invalidateQueries({ queryKey: ['activeIssues', 'copies', 'analytics'] });
    },
    onError: (err: any) => setError(err.message || "Failed to return book")
  });

  const handleScan = () => {
    setError("");
    setShowSuccess(false);
    const tag = rfidInput.trim().toUpperCase();
    
    const copy = bookCopies?.find((b: any) => b.rfid_tag === tag || b.book_title.toLowerCase().includes(rfidInput.toLowerCase()));
    
    if (!copy) {
      setError("No book found with that RFID tag or title");
      setScannedBook(null);
      return;
    }

    setScannedBook(copy);

    if (mode === "return") {
      // Find the active issue for this copy
      const issue = activeIssues?.find((i: any) => i.copy === copy.id && i.status === 'active');
      if (issue) {
        setScannedStudent({ name: issue.member_name, id: issue.member });
      } else {
        setError("This book is not currently issued according to records.");
      }
    } else {
      // For demo/simplicity, just pick the first student if not scanning a student card
      if (students && students.length > 0) {
        setScannedStudent(students[0]);
      }
    }
  };

  const handleSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setScannedBook(null);
      setScannedStudent(null);
      setRfidInput("");
    }, 2500);
  };

  const handleConfirm = () => {
    if (mode === "issue") {
      if (!scannedBook || !scannedStudent) return;
      issueMutation.mutate({
        copy: scannedBook.id,
        member: scannedStudent.id,
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days from now
      });
    } else {
      const issue = activeIssues?.find((i: any) => i.copy === scannedBook.id && i.status === 'active');
      if (issue) {
        returnMutation.mutate(issue.id);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Issue & Return</h1>
        <p className="text-sm text-muted-foreground mt-1">Scan RFID tags to issue or return books instantly</p>
      </div>

      {/* Mode Toggle */}
      <div className="glass-card rounded-xl p-1.5 inline-flex gap-1">
        <button
          onClick={() => { setMode("issue"); setScannedBook(null); setShowSuccess(false); setError(""); }}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${mode === "issue" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
        >
          Issue Book
        </button>
        <button
          onClick={() => { setMode("return"); setScannedBook(null); setShowSuccess(false); setError(""); }}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${mode === "return" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
        >
          Return Book
        </button>
      </div>

      {/* Scan Area */}
      <div className="glass-card rounded-xl p-6 max-w-lg">
        <div className="flex items-center gap-2 mb-4">
          <Scan className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            {mode === "issue" ? "Scan Book to Issue" : "Scan Book to Return"}
          </h2>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Enter RFID tag or book title..."
            value={rfidInput}
            onChange={(e) => setRfidInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
            className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
          <button
            onClick={handleScan}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90 transition"
          >
            Scan
          </button>
        </div>
        {error && <p className="text-xs text-destructive mt-2">{error}</p>}
      </div>

      {/* Success Animation */}
      {showSuccess && (
        <div className="glass-card rounded-xl p-8 max-w-lg text-center animate-scale-in">
          <div className="w-20 h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            {mode === "issue" ? "Book Issued Successfully!" : "Book Returned Successfully!"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">RFID transaction recorded</p>
        </div>
      )}

      {/* Scanned Result */}
      {scannedBook && !showSuccess && (
        <div className="glass-card rounded-xl p-6 max-w-lg space-y-5 animate-fade-in">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-primary" /> Scan Result
          </h2>

          <div className="flex gap-4 items-start">
            <div className={`w-16 h-20 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center`}>
              <BookOpen className="w-6 h-6 text-primary-foreground/80" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{scannedBook.book_title}</h3>
              <p className="text-xs text-muted-foreground">RFID: {scannedBook.rfid_tag}</p>
              <p className="text-[10px] text-muted-foreground mt-1 font-mono">Shelf {scannedBook.assigned_shelf_code}</p>
            </div>
          </div>

          {scannedStudent && (
            <div className="flex gap-3 items-center p-3 rounded-lg bg-muted/50">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{scannedStudent.name || scannedStudent.user?.username}</p>
                <p className="text-[10px] text-muted-foreground">{scannedStudent.member_id || "Student ID"}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleConfirm}
            disabled={issueMutation.isPending || returnMutation.isPending}
            className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition"
          >
            {issueMutation.isPending || returnMutation.isPending ? "Processing..." : `Confirm ${mode === "issue" ? "Issue" : "Return"}`}
          </button>
        </div>
      )}
    </div>
  );
}
