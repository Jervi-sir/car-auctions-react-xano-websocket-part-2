// src/routes/my-posted-auctions-page.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AuctionService } from "@/api";
import type { MyPostedAuction } from "@/api";

export function MyPostedAuctionsPage() {
  const [auctions, setAuctions] = useState<MyPostedAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);            // 👈 fix name
  const [totalPages, setTotalPages] = useState(1);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AuctionService.getMyPostedAuctions(page, 20, "all");
      setAuctions(response.auctions);
      setTotalPages(response.total_pages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch auctions");
      console.error("Error fetching auctions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]); // 👈 refetch when page changes

  const handleDelete = async (id: number) => {
    try {
      await AuctionService.deleteAuction(id);
      // Remove from local state
      setAuctions((prev) => prev.filter((auction) => auction.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete auction");
      console.error("Error deleting auction:", err);
    }
  };

  const goToPrevPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-destructive font-semibold">{error}</p>
          <Button onClick={fetchAuctions} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            My Posted Auctions
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Manage your car auction listings
          </p>
        </div>
        <Button asChild>
          <Link to="/auctions/create">
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Auction
          </Link>
        </Button>
      </div>

      {auctions.length === 0 ? (
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
              <p className="font-semibold">No auctions posted yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first auction to get started
              </p>
              <Button asChild className="mt-4">
                <Link to="/auctions/create">Create Auction</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {auctions.map((auction) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* 👇 Pagination controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between gap-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={goToPrevPage}
              >
                Previous
              </Button>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Page <span className="font-semibold">{page}</span> of{" "}
                  <span className="font-semibold">{totalPages}</span>
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={goToNextPage}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function formatPrice(amount: number, currency: string) {
  return `${currency}${amount.toLocaleString("en-US")}`;
}

function AuctionCard({
  auction,
  onDelete,
}: {
  auction: MyPostedAuction;
  onDelete: (id: number) => void;
}) {
  const isEnded = auction.auction_end < Date.now();
  const timeRemaining = Math.max(0, auction.auction_end - Date.now());
  const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor(
    (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <img
          src={auction.image_url?.url}
          alt={auction.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute left-3 top-3">
          <Badge
            variant={auction.is_active ? "default" : "secondary"}
            className={
              auction.is_active
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-600"
            }
          >
            {auction.is_active ? "ACTIVE" : "ENDED"}
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
          {isEnded ? "Ended" : `${daysRemaining}d ${hoursRemaining}h remaining`}
        </div>
      </div>

      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="flex items-center justify-between gap-2 text-base sm:text-lg">
          <span className="truncate">{auction.title}</span>
          <span className="whitespace-nowrap text-sm font-semibold text-primary">
            {formatPrice(auction.current_price, auction.currency)}
          </span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{auction.subtitle}</p>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground sm:text-sm">
          <div className="flex gap-3">
            <span>{auction.year}</span>
            <span>• {(auction.mileage_km / 1000).toFixed(1)}k km</span>
            <span>• {auction.transmission}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span className="text-muted-foreground">{auction.total_views}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            <span className="text-muted-foreground">{auction.total_bids} bids</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link to={`/auctions/${auction.id}/stats`}>
              <svg
                className="mr-1 h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Stats
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link to={`/auctions/${auction.id}/edit`}>
              <svg
                className="mr-1 h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive">
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Auction</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this auction? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(auction.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
