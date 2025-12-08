// src/App.tsx
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MainLayout } from "./components/layout/main-layout";
import { AuctionListPage } from "./routes/auction-list-page";
import { EndedAuctionsPage } from "./routes/ended-auctions-page";
import { MyAuctionsPage } from "./routes/my-auctions-page";
import { CarAuctionSessionPage } from "./routes/car-auction-session-page";
import { LoginPage } from "./routes/login-page";
import { SignupPage } from "./routes/signup-page";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute, PublicRoute } from "./components/auth/protected-route";
import { ThemeProvider } from "./components/theme-provider";
import { ModeToggle } from "./components/mode-toggle";
import { AppFooter } from "./components/layout/footer";

function TopNav() {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const pathname = location.pathname;

  const isLiveAuctions =
    pathname === "/" || pathname === "/auctions";
  const isEndedAuctions = pathname.startsWith("/auctions/ended");
  const isMyWins = pathname.startsWith("/auctions/mine");

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div
        className="
          mx-auto flex max-w-5xl flex-wrap items-center
          gap-2 px-3 py-2
          sm:gap-3 sm:px-4 sm:py-3
        "
      >
        {/* Logo / Brand */}
        <Link
          to="/auctions"
          className="mr-auto flex items-center gap-2"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            CA
          </span>
          <span
            className="
              font-semibold tracking-tight
              text-base
              sm:text-lg
            "
          >
            CarAuction.live
          </span>
        </Link>

        {/* Authenticated nav */}
        {isAuthenticated ? (
          <div
            className="
              flex w-full flex-wrap items-center justify-end gap-2
              sm:w-auto
            "
          >
            <span className="mr-auto text-xs font-medium sm:inline-block md:text-sm">
              Hi, {user?.name || "User"}
            </span>

            <div className="flex flex-wrap items-center justify-end gap-2">
              {/* Live auctions tab */}
              <Button
                asChild
                variant={isLiveAuctions ? "default" : "outline"}
                size="sm"
                className="flex-1 min-[420px]:flex-none"
                aria-current={isLiveAuctions ? "page" : undefined}
              >
                <Link to="/auctions">Live auctions</Link>
              </Button>

              {/* Ended tab */}
              <Button
                asChild
                variant={isEndedAuctions ? "default" : "outline"}
                size="sm"
                aria-current={isEndedAuctions ? "page" : undefined}
              >
                <Link to="/auctions/ended">Ended</Link>
              </Button>

              {/* My Wins tab */}
              <Button
                asChild
                variant={isMyWins ? "default" : "outline"}
                size="sm"
                aria-current={isMyWins ? "page" : undefined}
              >
                <Link to="/auctions/mine">My Wins</Link>
              </Button>

              <ModeToggle />

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
              >
                Logout
              </Button>
            </div>
          </div>
        ) : (
          // Public nav
          <div
            className="
              flex w-full flex-wrap items-center justify-end gap-2
              sm:w-auto
            "
          >
            <ModeToggle />

            <Button
              asChild
              variant="ghost"
              size="sm"
              className="flex-1 min-[420px]:flex-none sm:flex-none"
            >
              <Link to="/login">Sign in</Link>
            </Button>

            <Button
              asChild
              size="sm"
              className="flex-1 min-[420px]:flex-none sm:flex-none"
            >
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

function AboutPage() {
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">About this demo</h1>
        <p className="text-muted-foreground">
          This is a front-end-only demo of a real-time style car auction app
          built with React, Vite, React Router, and shadcn/ui.
        </p>
      </div>
    </MainLayout>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <TopNav />
      <div className="flex-1 min-h-[80vh]">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            }
          />
          <Route path="/about" element={<AboutPage />} />

          {/* Protected Routes */}
          <Route path="/" element={<Navigate to="/auctions" replace />} />

          <Route
            path="/auctions"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AuctionListPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/auctions/mine"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MyAuctionsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/auctions/ended"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <EndedAuctionsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/auctions/:slug"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CarAuctionSessionPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/auctions" replace />} />
        </Routes>
      </div>
      <AppFooter />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
