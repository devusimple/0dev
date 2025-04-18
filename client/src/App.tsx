import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Home from "@/pages/home";
import PostsPage from "@/pages/posts";
import PostDetail from "@/pages/posts/[slug]";
import TagPosts from "@/pages/tags/[tag]";

function AppRoutes() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/posts" component={PostsPage} />
        <Route path="/posts/:slug" component={PostDetail} />
        <Route path="/tags/:tag" component={TagPosts} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="blog-theme">
        <TooltipProvider>
          <Navbar />
          <AppRoutes />
          <Footer />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
