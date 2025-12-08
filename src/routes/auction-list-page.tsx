// src/routes/AuctionListPage.tsx
import { useState, useEffect } from "react";
import { AuctionService, type Auction } from "@/api";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Local view model for the UI
interface AuctionCar {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  year: number;
  mileageKm: number;
  fuel: string;
  transmission: string;
  location: string;
  startingPrice: number;
  currentPrice: number;
  currency: string;
  endsInMinutes: number;
}

// Helper function to calculate time remaining in minutes
function calculateMinutesRemaining(auctionEnd: number): number {
  const now = Date.now();
  const diffMs = auctionEnd - now;
  return Math.max(0, Math.floor(diffMs / 1000 / 60));
}

// Map API response to match CarCard component structure
function mapApiCarToLocal(apiCar: Auction): AuctionCar {
  return {
    id: apiCar.slug || apiCar.id.toString(),
    title: apiCar.title,
    subtitle: apiCar.subtitle || "",
    imageUrl: apiCar?.image_url?.url ?? '',
    year: apiCar.year,
    mileageKm: apiCar.mileage_km,
    fuel: apiCar.fuel,
    transmission: apiCar.transmission,
    location: apiCar.location,
    startingPrice: apiCar.starting_price,
    currentPrice: apiCar.current_price,
    currency: apiCar.currency === "USD" ? "$" : apiCar.currency === "EUR" ? "€" : apiCar.currency,
    endsInMinutes: calculateMinutesRemaining(apiCar.auction_end),
  };
}

export function AuctionListPage() {
  const [cars, setCars] = useState<AuctionCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function fetchAuctions() {
      try {
        setLoading(true);
        setError(null);

        const response = await AuctionService.getAuctions(page, 20);

        const mappedCars = response.auctions.map(mapApiCarToLocal);
        setCars(mappedCars);
        setTotalPages(response.total_pages || 1);
        setTotal(response.total);
      } catch (err: any) {
        console.error("Failed to fetch auctions:", err);
        setError(
          err.message ||
          "Failed to load auctions. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAuctions();
  }, [page]);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Live car auctions
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Browse cars currently in auction and join a session to follow live
            bids in real time.
          </p>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading auctions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Live car auctions
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Browse cars currently in auction and join a session to follow live
            bids in real time.
          </p>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <svg
                className="h-6 w-6 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold">Failed to load auctions</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="space-y-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Live car auctions
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Browse cars currently in auction and join a session to follow live
            bids in real time.
          </p>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full bg-muted p-3">
              <svg
                className="h-6 w-6 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold">No active auctions</p>
              <p className="text-sm text-muted-foreground">
                Check back later for new listings
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Live car auctions
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Browse cars currently in auction and join a session to follow live
          bids in real time. {total > 0 && `(${total} active auctions)`}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-md border bg-background px-4 py-2 text-sm font-medium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-md border bg-background px-4 py-2 text-sm font-medium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}


/* ----------------------- Card ----------------------- */

function formatPrice(amount: number, currency: string) {
  return `${currency}${amount.toLocaleString("en-US")}`;
}

export function CarCard({ car }: { car: AuctionCar }) {
  return (
    <Link to={`/auctions/${car.id}`} className="block">
      <Card className="flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <img
            src={car.imageUrl}
            alt={car.title}
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
          />
          <div className="absolute left-3 top-3">
            <Badge variant="secondary" className="bg-black/70 text-xs text-white">
              LIVE AUCTION
            </Badge>
          </div>
          <div className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
            Ends in ~{car.endsInMinutes} min
          </div>
        </div>

        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="flex items-center justify-between gap-2 text-base sm:text-lg">
            <span className="truncate">{car.title}</span>
            <span className="whitespace-nowrap text-sm font-semibold">
              {formatPrice(car.currentPrice, car.currency)}
            </span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">{car.subtitle}</p>
        </CardHeader>

        <CardContent className="flex items-center justify-between gap-3 pb-4 text-xs text-muted-foreground sm:text-sm">
          <div className="flex gap-3">
            <span>{car.year}</span>
            <span>• {(car.mileageKm / 1000).toFixed(1)}k km</span>
            <span>• {car.transmission}</span>
          </div>
          <span className="truncate">{car.location}</span>
        </CardContent>
      </Card>
    </Link>
  );
}
