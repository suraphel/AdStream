import { Switch, Route } from "wouter";
import SimpleLanding from "@/pages/SimpleLanding";

export default function SimpleApp() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Switch>
        <Route path="/" component={SimpleLanding} />
        <Route path="*">
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
            <a href="/" className="text-blue-600 underline">Go Home</a>
          </div>
        </Route>
      </Switch>
    </div>
  );
}