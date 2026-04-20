import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNav } from "@/components/MobileNav";
import Dashboard from "./pages/Dashboard";
import BookSearch from "./pages/BookSearch";
import LiveTracking from "./pages/LiveTracking";
import IssueReturn from "./pages/IssueReturn";
import Alerts from "./pages/Alerts";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
                <Route path="/search" element={<BookSearch />} />
                <Route path="/tracking" element={<LiveTracking />} />
                <Route path="/issue-return" element={<IssueReturn />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/analytics" element={<Analytics />} />
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
