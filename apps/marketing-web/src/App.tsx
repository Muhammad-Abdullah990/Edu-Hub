import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@toppers/ui";
import { TooltipProvider } from "@toppers/ui";
import { HelmetProvider } from "react-helmet-async";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { AUTH_PORTAL_ROLES } from "@/auth/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { MetaPixelPageTracker } from "@/components/MetaPixelPageTracker";
import { GoogleAnalyticsPageTracker } from "@/components/GoogleAnalyticsPageTracker";

// Pages
import Home from "@/pages/home";
import About from "@/pages/about";
import Faculty from "@/pages/faculty";
import Results from "@/pages/results";
import StudentSuccess from "@/pages/student-success";
import Testimonials from "@/pages/testimonials";
import Programs from "@/pages/programs";
import Contact from "@/pages/contact";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import NotFound from "@/pages/not-found";
import FacultyAamera from "@/pages/faculty-aamera";
import FacultyAbdullah from "@/pages/faculty-abdullah";
import FacultyTayyaba from "@/pages/faculty-tayyaba";
import CurrentStudents from "@/pages/current-students";
import StudentProfile from "@/pages/student-profile";
import LoginPage from "@/pages/login";
import AdminPortalPage from "@/pages/admin-portal";
import TeacherPortalPage from "@/pages/teacher-portal";
import StudentPortalPage from "@/pages/student-portal";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/faculty" component={Faculty} />
        <Route path="/faculty/aamera-ishaque" component={FacultyAamera} />
        <Route path="/faculty/muhammad-abdullah" component={FacultyAbdullah} />
        <Route path="/faculty/tayyaba-gul" component={FacultyTayyaba} />
        <Route path="/results" component={Results} />
        <Route path="/student-success" component={StudentSuccess} />
        <Route path="/current-students" component={CurrentStudents} />
        <Route path="/login" component={LoginPage} />
        <Route path="/admin">
          {() => (
            <ProtectedRoute roles={AUTH_PORTAL_ROLES.admin}>
              <AdminPortalPage />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/teacher">
          {() => (
            <ProtectedRoute roles={AUTH_PORTAL_ROLES.teacher}>
              <TeacherPortalPage />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/student">
          {() => (
            <ProtectedRoute roles={AUTH_PORTAL_ROLES.student}>
              <StudentPortalPage />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/student/:slug">
          {(params) => <StudentProfile slug={params.slug} />}
        </Route>
        <Route path="/testimonials" component={Testimonials} />
        <Route path="/programs" component={Programs} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/terms-of-service" component={TermsOfService} />
        <Route path="/contact" component={Contact} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  const routerBase = import.meta.env.BASE_URL === "./"
    ? ""
    : import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={routerBase}>
            <GoogleAnalyticsPageTracker />
            <MetaPixelPageTracker />
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;

