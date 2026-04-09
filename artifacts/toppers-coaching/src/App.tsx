import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";

// Pages
import Home from "@/pages/home";
import About from "@/pages/about";
import Faculty from "@/pages/faculty";
import Results from "@/pages/results";
import StudentSuccess from "@/pages/student-success";
import Testimonials from "@/pages/testimonials";
import Programs from "@/pages/programs";
import Contact from "@/pages/contact";
import NotFound from "@/pages/not-found";
import FacultyAamera from "@/pages/faculty-aamera";
import FacultyAbdullah from "@/pages/faculty-abdullah";
import FacultyTayyaba from "@/pages/faculty-tayyaba";

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
        <Route path="/testimonials" component={Testimonials} />
        <Route path="/programs" component={Programs} />
        <Route path="/contact" component={Contact} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
