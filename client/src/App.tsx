import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import ListingDetail from "@/pages/ListingDetail";
import PostListing from "@/pages/PostListing";
import Profile from "@/pages/Profile";
import Category from "@/pages/Category";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/listing/:id" component={ListingDetail} />
          <Route path="/category/:slug" component={Category} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/listing/:id" component={ListingDetail} />
          <Route path="/post" component={PostListing} />
          <Route path="/profile" component={Profile} />
          <Route path="/my-ads" component={Profile} />
          <Route path="/favorites" component={Profile} />
          <Route path="/category/:slug" component={Category} />
          <Route path="/categories" component={Category} />
        </>
      )}
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
