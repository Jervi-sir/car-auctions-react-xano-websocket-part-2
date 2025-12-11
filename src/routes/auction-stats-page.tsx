// src/routes/auction-stats-page.tsx
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuctionService } from "@/api";

export interface AuctionStats {
  auction: {
    id: number;
    slug: string;
    title: string;
    subtitle: string | null;
    image_url: {
      access: string;
      path: string;
      name: string;
      type: string;
      size: number;
      mime: string;
      meta: {
        width: number;
        height: number;
      };
      url: string;
    } | null;
    starting_price: number;
    current_price: number;
    currency: string;
    is_active: boolean;
    auction_end: number;
    created_at: number;
  };

  metrics: {
    total_bids: number;
    total_views: number;
    price_increase: number;
    price_increase_percent: number;
  };

  top_bidders: {
    name: string;
    bid_amount: number;
    bid_time: number | string;
  }[];
}

export function AuctionStatsPage() {
  const { id } = useParams<{ id: string }>();
  const [stats, setStats] = useState<AuctionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await AuctionService.getAuctionStats(parseInt(id, 10));
        // @ts-ignore
        setStats(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch auction stats"
        );
        console.error("Error fetching auction stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-destructive font-semibold">
            {error || "Auction not found"}
          </p>
          <Button asChild className="mt-4">
            <Link to="/auctions/posted">Back to Auctions</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { auction, metrics, top_bidders } = stats;

  const timeRemaining = Math.max(0, auction.auction_end - Date.now());
  const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor(
    (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );

  // image_url can be a string or an object with .url
  const imageUrl =
    typeof auction.image_url === "string"
      ? auction.image_url
      : auction.image_url?.url ?? "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Auction Statistics
            </h1>
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

            <Badge
              variant={auction.is_active ? "default" : "secondary"}
              className="bg-orange-600 hover:bg-orange-700"
            >
              in beta
            </Badge>

          </div>
          <p className="text-sm text-muted-foreground sm:text-base">
            {auction.title}
          </p>
          {auction.subtitle && (
            <p className="text-xs text-muted-foreground">{auction.subtitle}</p>
          )}
        </div>
        <Button asChild variant="outline">
          <Link to="/auctions/posted">
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Auctions
          </Link>
        </Button>
      </div>

      {/* Auction Preview */}
      <Card className="overflow-hidden">
        <div className="aspect-[21/9] w-full overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={auction.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              No image available
            </div>
          )}
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Current Price */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auction.currency}
              {auction.current_price.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{auction.currency}
              {metrics.price_increase.toLocaleString()} (
              {metrics.price_increase_percent}
              %)
            </p>
          </CardContent>
        </Card>

        {/* Total Bids */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bids
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.total_bids.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {top_bidders.length} bidder
              {top_bidders.length === 1 ? "" : "s"} in leaderboard
            </p>
          </CardContent>
        </Card>

        {/* Total Views */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.total_views.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total impressions on this auction
            </p>
          </CardContent>
        </Card>

        {/* Starting Price */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Starting Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auction.currency}
              {auction.starting_price.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Auction created on{" "}
              {new Date(auction.created_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Time Remaining */}
      {auction.is_active && (
        <Card>
          <CardHeader>
            <CardTitle>Time Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-3xl font-bold">
                  {daysRemaining}d {hoursRemaining}h
                </div>
                <p className="text-sm text-muted-foreground">
                  Until auction ends (
                  {new Date(auction.auction_end).toLocaleString()})
                </p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <svg
                  className="h-8 w-8 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Bidders */}
      <Card>
        <CardHeader>
          <CardTitle>Top Bidders</CardTitle>
        </CardHeader>
        <CardContent>
          {top_bidders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No bids have been placed yet.
            </p>
          ) : (
            <div className="space-y-3">
              {top_bidders.map((bidder, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${index === 0
                        ? "bg-yellow-500/20 text-yellow-600"
                        : index === 1
                          ? "bg-gray-400/20 text-gray-600"
                          : "bg-orange-500/20 text-orange-600"
                        }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{bidder.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(bidder.bid_time).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="font-semibold">
                    {auction.currency}
                    {(bidder.bid_amount ?? 0).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
