import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import CataloguePage from "./pages/CataloguePage";
import SystemDetailPage from "./pages/SystemDetailPage";
import AssistantPage from "./pages/AssistantPage";
import VisualizationPage from "./pages/VisualizationPage";
import SpecDatabasePage from "./pages/SpecDatabasePage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/catalogue" component={CataloguePage} />
      <Route path="/catalogue/:category" component={CataloguePage} />
      <Route path="/system/:id" component={SystemDetailPage} />
      <Route path="/assistant" component={AssistantPage} />
      <Route path="/visualization" component={VisualizationPage} />
      <Route path="/database" component={SpecDatabasePage} />
      <Route path="/spec-database" component={SpecDatabasePage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
