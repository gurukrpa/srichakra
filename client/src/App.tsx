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
import CareerAssessment from "@/pages/CareerAssessment";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import TeamMembers from "@/pages/admin/TeamMembers";
import Settings from "@/pages/admin/Settings";
import UserActivity from "@/pages/admin/UserActivity";
import RegisteredUsers from "@/pages/admin/RegisteredUsers";
import AdminLanding from "@/pages/admin/AdminLanding";
import AdminRedirect from "@/pages/admin/AdminRedirect";
import Schools from "@/pages/admin/Schools";
import SchoolLogin from "@/pages/school/SchoolLogin";
import SchoolDashboard from "@/pages/school/SchoolDashboard";
import SchoolStudents from "@/pages/school/SchoolStudents";
import { AdminAuthProvider, withAdminAuth } from "@/contexts/AdminAuthContext";
import DevAuthBypass from "@/pages/DevAuthBypass";
import { isDevBypassEnabled } from "@/config/featureFlags";

// Wrap admin components with the auth protection HOC
const ProtectedAdminDashboard = withAdminAuth(AdminDashboard);
const ProtectedTeamMembers = withAdminAuth(TeamMembers);
const ProtectedSettings = withAdminAuth(Settings);
const ProtectedUserActivity = withAdminAuth(UserActivity);
const ProtectedRegisteredUsers = withAdminAuth(RegisteredUsers);
const ProtectedSchools = withAdminAuth(Schools);

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
              {/* Login and Signup routes */}
              <Route path="/login" component={Login} />
              <Route path="/signup" component={SignUp} />
              <Route path="/career" component={Career} />
              <Route path="/career-assessment" component={CareerAssessment} />
              <Route path="/about" component={About} />
              <Route path="/contact" component={Contact} />
              
              {/* School routes */}
              <Route path="/school/login" component={SchoolLogin} />
              <Route path="/school/dashboard" component={SchoolDashboard} />
              <Route path="/school/students" component={SchoolStudents} />
              
              {/* Admin routes */}
              <Route path="/admin/login" component={AdminLogin} />
              <Route path="/admin/redirect" component={AdminRedirect} />
              <Route path="/admin/team-members" component={ProtectedTeamMembers} />
              <Route path="/admin/registered-users" component={ProtectedRegisteredUsers} />
              <Route path="/admin/user-activity" component={ProtectedUserActivity} />
              <Route path="/admin/settings" component={ProtectedSettings} />
              <Route path="/admin/schools" component={ProtectedSchools} />
              {/* Make sure dashboard routes are clear and well-defined */}
              <Route path="/admin/dashboard" component={ProtectedAdminDashboard} />
              {/* Catch-all for /admin base path - secure landing page that checks auth */}
              <Route path="/admin" component={AdminLanding} />
              
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
