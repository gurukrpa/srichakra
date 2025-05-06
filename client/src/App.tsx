import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import CodeEditor from "@/pages/CodeEditor";
import UnicefHome from "@/pages/UnicefHome";

function Router() {
  return (
    <Switch>
      <Route path="/" component={UnicefHome} />
      <Route path="/code-editor" component={CodeEditor} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
