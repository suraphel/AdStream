import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { FeatureProvider } from "@/contexts/FeatureContext";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import ListingDetail from "@/pages/ListingDetail";
import PostListing from "@/pages/PostListing";
import Profile from "@/pages/Profile";
import Category from "@/pages/Category";
import CategorySelect from "@/pages/CategorySelect";
import Register from "@/pages/Register";
import ExternalListings from "@/pages/ExternalListings";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminListings from "@/pages/admin/Listings";
import errorTracker, { ErrorBoundary } from "./lib/errorTracking";
import { useEffect } from "react";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Initialize error tracking with user context
  useEffect(() => {
    if (user && typeof user === 'object' && 'id' in user) {
      errorTracker.initialize(user.id as string, 'en'); // Default to English, can be configured
    }
  }, [user]);

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/listing/:id" component={ListingDetail} />
          <Route path="/category/:slug" component={Category} />
          <Route path="/register" component={Register} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/listing/:id" component={ListingDetail} />
          <Route path="/post" component={PostListing} />
          <Route path="/select-category" component={CategorySelect} />
          <Route path="/profile" component={Profile} />
          <Route path="/my-ads" component={Profile} />
          <Route path="/favorites" component={Profile} />
          <Route path="/category/:slug" component={Category} />
          <Route path="/categories" component={Category} />
          <Route path="/external" component={ExternalListings} />
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/admin/users" component={AdminUsers} />
          <Route path="/admin/listings" component={AdminListings} />
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
        <FeatureProvider>
          <TooltipProvider>
            <ErrorBoundary>
              <Router />
              <Toaster />
            </ErrorBoundary>
          </TooltipProvider>
        </FeatureProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
