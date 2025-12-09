// src/routes/auction-stats-page.tsx
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuctionService } from "@/api";
import type { AuctionStats } from "@/api";

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
        const data = await AuctionService.getAuctionStats(parseInt(id));
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch auction stats');
        console.error('Error fetching auction stats:', err);
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
          <p className="text-destructive font-semibold">{error || 'Auction not found'}</p>
          <Button asChild className="mt-4">
            <Link to="/auctions/posted">Back to Auctions</Link>
          </Button>
        </div>
      </div>
    );
  }

  const timeRemaining = Math.max(0, stats.auction_end - Date.now());
  const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor(
    (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );

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
              variant={stats.is_active ? "default" : "secondary"}
              className={
                stats.is_active
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-600"
              }
            >
              {stats.is_active ? "ACTIVE" : "ENDED"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground sm:text-base">
            {stats.title}
          </p>
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
        <div className="aspect-[21/9] w-full overflow-hidden">
          <img
            src={stats.image_url}
            alt={stats.title}
            className="h-full w-full object-cover"
          />
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.currency}
              {stats.current_price.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{stats.currency}
              {stats.price_increase.toLocaleString()} ({stats.price_increase_percent}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bids
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_bids}</div>
            <p className="text-xs text-muted-foreground">
              From {stats.top_bidders.length} unique bidders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_views}</div>
            <p className="text-xs text-muted-foreground">
              {stats.unique_viewers} unique viewers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Watchlist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.watchlist_count}</div>
            <p className="text-xs text-muted-foreground">
              Users watching this auction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Time Remaining */}
      {stats.is_active && (
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
                  Until auction ends
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
          <div className="space-y-3">
            {stats.top_bidders.map((bidder, index) => (
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
                  {stats.currency}
                  {bidder.bid_amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Views Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Views Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.views_over_time.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.date}</span>
                  <span className="font-medium">{item.views} views</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${(item.views / Math.max(...stats.views_over_time.map((v) => v.views))) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bids Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Bids Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.bids_over_time.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.date}</span>
                  <span className="font-medium">{item.bids} bids</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-green-600 transition-all"
                    style={{
                      width: `${(item.bids / Math.max(...stats.bids_over_time.map((b) => b.bids))) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
