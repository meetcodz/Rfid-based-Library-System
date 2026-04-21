import { Link } from "react-router-dom";
import { Radio } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
        <Radio className="w-8 h-8 text-muted-foreground/50" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
        <p className="text-sm text-muted-foreground mt-1">That route doesn't exist.</p>
      </div>
      <Link
        to="/"
        className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
      >
        Back to Sessions
      </Link>
    </div>
  );
}
