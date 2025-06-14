// Import UI components for notifications and tooltips
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Import React Query for data fetching and state management
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import React Router components for navigation
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import page components
import Index from "./pages/Index";
import FlashcardViewer from "./pages/FlashcardViewer";
import NotFound from "./pages/NotFound";

// Initialize React Query client for managing server state
const queryClient = new QueryClient();

/**
 * Root component of the application
 * Sets up the application's providers and routing structure
 */
const App = () => (
  // Wrap the app with React Query provider for data fetching
  <QueryClientProvider client={queryClient}>
    {/* Provide tooltip context for all tooltips in the app */}
    <TooltipProvider>
      {/* Toast notifications for user feedback */}
      <Toaster />
      {/* Alternative toast notification system */}
      <Sonner />
      {/* Set up routing for the application */}
      <BrowserRouter>
        <Routes>
          {/* Home page route */}
          <Route path="/" element={<Index />} />
          {/* Flashcard viewer route */}
          <Route path="/flashcards" element={<FlashcardViewer />} />
          {/* Catch-all route for 404 pages */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
