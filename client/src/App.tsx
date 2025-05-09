import { Route, Switch, Router } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import SrichakraDemo from "@/pages/SrichakraDemo";
import SrichakraHome from "@/pages/SrichakraHome";
import SrichakraShowcase from "@/pages/SrichakraShowcase";
import NotFound from "@/pages/not-found";
import CodeEditor from "@/pages/CodeEditor";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <Switch>
            <Route path="/" component={SrichakraHome} />
            <Route path="/code-editor" component={CodeEditor} />
            <Route path="/srichakra-demo" component={SrichakraDemo} />
            <Route path="/srichakra-showcase" component={SrichakraShowcase} />
            <Route path="/login" component={Login} />
            <Route path="/signup" component={SignUp} />
            <Route component={NotFound} />
          </Switch>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
