import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

import Home from "@/pages/Home";
import Properties from "@/pages/Properties";
import PropertyDetail from "@/pages/PropertyDetail";
import Dashboard from "@/pages/Dashboard";
import Listings from "@/pages/Listings";
import NewListing from "@/pages/NewListing";
import KYC from "@/pages/KYC";
import Profile from "@/pages/Profile";
import Newsletter from "@/pages/Newsletter";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL as string | undefined;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function AppRoutes() {
  const [, setLocation] = useLocation();
  const { theme } = useTheme();

  const clerkAppearance = {
    cssLayerName: "clerk",
    variables:
      theme === "dark"
        ? {
            colorPrimary: "hsl(44 55% 54%)",
            colorBackground: "hsl(220 10% 6%)",
            colorText: "white",
            colorInputBackground: "hsl(220 10% 12%)",
            colorInputText: "white",
            fontFamily: "Inter, sans-serif",
          }
        : {
            colorPrimary: "hsl(44 65% 40%)",
            colorBackground: "hsl(40 30% 97%)",
            colorText: "hsl(220 15% 10%)",
            colorInputBackground: "hsl(220 10% 93%)",
            colorInputText: "hsl(220 15% 10%)",
            fontFamily: "Inter, sans-serif",
          },
  };

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/properties" component={Properties} />
            <Route path="/properties/:id" component={PropertyDetail} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/listings" component={Listings} />
            <Route path="/listings/new" component={NewListing} />
            <Route path="/kyc" component={KYC} />
            <Route path="/profile" component={Profile} />
            <Route path="/newsletter" component={Newsletter} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <WouterRouter base={basePath}>
        <AppRoutes />
      </WouterRouter>
    </ThemeProvider>
  );
}

export default App;
