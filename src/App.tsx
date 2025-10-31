import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Portfolio from "./pages/Portfolio";
import Case from "./pages/Case";
import Orcamento from "./pages/Orcamento";
import Arquitetos from "./pages/Arquitetos";
import Materiais from "./pages/Materiais";
import Briefing from "./pages/Briefing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/portfolio/:slug" element={<Case />} />
          <Route path="/projeto/:slug" element={<Case />} />
          <Route path="/orcamento" element={<Orcamento />} />
          <Route path="/arquitetos" element={<Arquitetos />} />
          <Route path="/materiais" element={<Materiais />} />
          <Route path="/briefing" element={<Briefing />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
