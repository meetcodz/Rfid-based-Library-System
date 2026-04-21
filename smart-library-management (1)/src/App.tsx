import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNav } from "@/components/MobileNav";
import Dashboard from "./pages/Dashboard";
import SessionDetail from "./pages/SessionDetail";
import MissingReports from "./pages/MissingReports";
import Shelves from "./pages/Shelves";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 5000, // poll every 5s for live updates
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <div className="flex min-h-screen bg-background">
            <AppSidebar />
            <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 overflow-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/sessions/:id" element={<SessionDetail />} />
                <Route path="/missing" element={<MissingReports />} />
                <Route path="/shelves" element={<Shelves />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <MobileNav />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
