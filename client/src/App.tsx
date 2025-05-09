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
import Career from "@/pages/Career";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import { AdminAuthProvider, withAdminAuth } from "@/contexts/AdminAuthContext";

// Wrap the admin dashboard with the auth protection HOC
const ProtectedAdminDashboard = withAdminAuth(AdminDashboard);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AdminAuthProvider>
          <Router>
            <Switch>
              {/* Public routes */}
              <Route path="/" component={SrichakraHome} />
              <Route path="/code-editor" component={CodeEditor} />
              <Route path="/srichakra-demo" component={SrichakraDemo} />
              <Route path="/srichakra-showcase" component={SrichakraShowcase} />
              <Route path="/login" component={Login} />
              <Route path="/signup" component={SignUp} />
              <Route path="/career" component={Career} />
              <Route path="/about" component={About} />
              <Route path="/contact" component={Contact} />
              
              {/* Admin routes */}
              <Route path="/admin/login" component={AdminLogin} />
              <Route path="/admin/dashboard" component={ProtectedAdminDashboard} />
              
              {/* 404 page */}
              <Route component={NotFound} />
            </Switch>
          </Router>
          <Toaster />
        </AdminAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
