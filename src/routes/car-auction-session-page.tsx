import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuctionService } from "@/api/auctions";
import { useAuth } from "@/context/AuthContext";
import { type AuctionCar, type Bid as LocalBid } from "@/data/cars";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { xanoClient } from "@/api/xano";
import type { Bid } from "@/data/cars";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RefreshCcw, Timer } from "lucide-react";


function formatPrice(amount: number, currency: string) {
  return `${currency}${amount.toLocaleString("en-US")}`;
}

function formatCountdown(ms: number) {
  if (ms <= 0) return "Auction ended";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

export function CarAuctionSessionPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [car, setCar] = useState<AuctionCar | undefined>(undefined);
  const [bids, setBids] = useState<LocalBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [endTime, setEndTime] = useState<number>(0);
  const [remainingMs, setRemainingMs] = useState<number>(0);

  const [bidStep, setBidStep] = useState<number>(500);
  const [customBid, setCustomBid] = useState<string>("");
  const [placingBid, setPlacingBid] = useState(false);
  const [finalizationResult, setFinalizationResult] = useState<any>(null);
  const finalizeAttempted = useRef(false);

  const channelRef = useRef<any>(null);

  // Fetch bids helper
  const fetchBids = useCallback(async (auctionId: number) => {
    try {
      const response = await AuctionService.getAuctionBids(auctionId);

      const mappedBids: LocalBid[] = response.bids.map((b) => ({
        id: b.id,
        bidderName: b.bidder_name || `User ${b.bidder_id}`,
        amount: b.amount,
        time: new Date(b.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      }));
      setBids(mappedBids);
    } catch (error) {
      console.error("Failed to fetch bids", error);
    }
  }, []);

  // Fetch car details
  useEffect(() => {
    if (!slug) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const data = await AuctionService.getAuctionBySlug(slug);

        const now = Date.now();
        const endsInMs = data.auction_end - now;
        const endsInMinutes = Math.max(0, endsInMs / 60000);

        const mappedCar: AuctionCar = {
          id: String(data.id),
          title: data.title,
          subtitle: data.subtitle,
          imageUrl: data.image_url?.url ?? '',
          year: data.year,
          mileageKm: data.mileage_km,
          fuel: data.fuel,
          transmission: data.transmission,
          location: data.location,
          startingPrice: data.starting_price,
          currentPrice: data.current_price,
          currency: data.currency === "USD" ? "$" : data.currency === "EUR" ? "€" : data.currency,
          endsInMinutes,
          specs: {
            engine: data.specs?.engine ?? "N/A",
            powerHp: data.specs?.power_hp ?? 0,
            color: data.specs?.color ?? "N/A",
            vin: data.specs?.vin ?? "N/A",
            owners: data.specs?.previous_owners ?? 0,
          },
          initialBids: [],
          upcomingBids: [],
          isActive: data.is_active,
          isSold: data.is_sold,
        };

        setCar(mappedCar);
        setEndTime(data.auction_end);

        if (!data.is_active) {
          setFinalizationResult({
            status: data.is_sold ? 'sold' : 'no_bids',
            final_price: data.current_price,
            // We don't have full winner info from the basic get call yet, 
            // but this ensures the UI shows "SOLD"/"ENDED" instead of a timer.
            winner: null
          });
          setRemainingMs(0); // Ensure timer shows 0 or "Ended"
        }

        // Initial fetch of bids
        await fetchBids(data.id);

      } catch (err) {
        console.error(err);
        setCar(undefined);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug, fetchBids]);


  // Realtime WebSocket effect
  useEffect(() => {
    if (!car) return;

    const channelName = `auctionSession/${car.id}`;
    console.log("Connecting to Xano channel:", channelName);

    const channel = xanoClient.channel(channelName);
    channelRef.current = channel;

    const handleMessage = (msg: any) => {
      console.log("Received WS action:", msg);

      if (msg.action === "connection_status") {
        console.log("Realtime status:", msg.payload?.status);
        return;
      }

      if (msg.action !== "event" && msg.action !== "message") {
        return;
      }

      const socketMessage = msg?.payload?.data;
      if (!socketMessage) return;

      if (socketMessage.action === "new_bid" && socketMessage.payload) {
        const newBidRaw = socketMessage.payload;

        const newBid: LocalBid = {
          id: newBidRaw.id,
          bidderName: newBidRaw.bidder_name || `User ${newBidRaw.bidder_id}`,
          amount: newBidRaw.amount,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        };

        setBids(prev => {
          if (prev.some(b => b.id === newBid.id)) return prev;
          return [...prev, newBid];
        });

        setCar(prev => {
          if (!prev) return undefined;
          if (newBid.amount > prev.currentPrice) {
            return { ...prev, currentPrice: newBid.amount };
          }
          return prev;
        });
      }
    };

    channel.on(handleMessage);

    return () => {
      console.log("Cleaning up Xano channel:", channelName);

      try {
        // If channel.on returns an unsubscribe function in your version, call it here too
        // unsubscribe?.();

        channelRef.current?.destroy();
        channelRef.current = null;
      } catch (err) {
        console.error("Error destroying Xano channel:", err);
      }
    };
  }, [car?.id]);


  // Timer countdown
  useEffect(() => {
    if (!endTime) return;
    const interval = window.setInterval(() => {
      setRemainingMs(Math.max(0, endTime - Date.now()));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [endTime]);

  // Handle auction finalization
  useEffect(() => {
    if (remainingMs <= 0 && endTime > 0 && !finalizeAttempted.current && car?.id) {
      const now = Date.now();
      if (now >= endTime) {
        finalizeAttempted.current = true;
        console.log("Auction ended, finalizing...");

        AuctionService.finalizeAuction(Number(car.id))
          .then(result => {
            console.log("Finalization result:", result);
            setFinalizationResult(result);
          })
          .catch(err => {
            console.error("Failed to finalize auction:", err);
            // Reset attempt if it was a network error? 
            // Maybe better to leave it to avoid infinite loops on persistent errors.
          });
      }
    }
  }, [remainingMs, endTime, car?.id]);


  const getHighestBid = () => {
    if (bids.length === 0) return car?.currentPrice ?? 0;
    return Math.max(...bids.map(b => b.amount), car?.currentPrice ?? 0);
  };

  const highestBid = getHighestBid();
  const biddingDisabled = remainingMs <= 0 || loading;

  const handlePlaceBid = async (amount: number) => {
    if (!car || !user) {
      alert("Please login to place a bid");
      return;
    }

    try {
      setPlacingBid(true);
      const response = await AuctionService.placeBid(Number(car.id), user.id, amount);
      setCustomBid("");

      if (response.auction.current_price) {
        setCar(prev => prev ? { ...prev, currentPrice: response.auction.current_price } : undefined);
      }

      // We rely on WS, but fall back to fetch if needed.
    } catch (error: any) {
      alert(error.message || "Failed to place bid");
    } finally {
      setPlacingBid(false);
    }
  };

  const handleQuickBid = () => {
    if (biddingDisabled) return;
    const newAmount = highestBid + bidStep;
    handlePlaceBid(newAmount);
  };

  const handleCustomBid = () => {
    if (biddingDisabled) return;
    const value = parseFloat(customBid);
    if (!value || isNaN(value)) return;
    if (value <= highestBid) {
      alert("Bid must be higher than current price");
      return;
    }
    handlePlaceBid(value);
  };

  const handleRestoreAuction = async () => {
    if (!car) return;
    try {
      setLoading(true);
      await AuctionService.restoreAuction(Number(car.id));
      alert("Auction restored! Reloading...");
      window.location.reload();
    } catch (error: any) {
      alert("Failed to restore: " + error.message);
      setLoading(false);
    }
  };

  const handleSetEndingSoon = async () => {
    if (!car) return;
    try {
      if (!confirm("This will set the auction to end in 60 seconds. Continue?")) return;
      await AuctionService.updateAuctionEndDate(Number(car.id));
      alert("Auction updated to end in 60s! Reloading...");
      window.location.reload();
    } catch (error: any) {
      alert("Failed to update time: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Auction not found.{" "}
          <Link to="/auctions" className="underline">
            Back to all auctions
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              to="/auctions"
              className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground"
            >
              ← Back to auctions
            </Link>
            <Badge
              variant="outline"
              className="border-emerald-500 text-emerald-600"
            >
              LIVE
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {car.title}
          </h1>
          <p className="text-sm text-muted-foreground">{car.subtitle}</p>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {finalizationResult ? "Status" : "Time remaining"}
          </div>
          {finalizationResult ? (
            <div className={`rounded-full px-4 py-1.5 text-sm font-semibold text-white ${finalizationResult.status === 'sold' ? 'bg-emerald-600' : 'bg-red-600'
              }`}>
              {finalizationResult.status === 'sold' ? 'SOLD' : 'ENDED'}
            </div>
          ) : (
            <div className="rounded-full bg-black px-4 py-1.5 text-sm font-semibold text-white">
              {formatCountdown(remainingMs)}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
        {/* Left side: image + main info */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="relative aspect-[16/9] w-full">
              <img
                src={car.imageUrl}
                alt={car.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-3 left-3 flex gap-2">
                <Badge className="bg-black/70 text-xs text-white">
                  {car.year} • {(car.mileageKm / 1000).toFixed(1)}k km
                </Badge>
                <Badge className="bg-black/70 text-xs text-white">
                  {car.location}
                </Badge>
              </div>

              {/* Winner Overlay */}
              {finalizationResult?.status === 'sold' && finalizationResult.winner && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
                  <div className="text-center p-6 bg-white/10 rounded-xl border border-white/20 shadow-2xl backdrop-blur-md">
                    <div className="text-emerald-400 font-bold text-lg mb-1 tracking-wider uppercase">Auction Won By</div>
                    <div className="flex flex-col items-center gap-2">
                      <Avatar className="h-16 w-16 border-2 border-emerald-500">
                        <AvatarFallback className="bg-emerald-900 text-emerald-100 text-xl font-bold">
                          {finalizationResult.winner.bidder_name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-2xl font-bold text-white">{finalizationResult.winner.bidder_name}</div>
                      <div className="text-emerald-300 font-mono font-bold text-xl">
                        {formatPrice(finalizationResult.winner.winning_amount, finalizationResult.winner.currency)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {finalizationResult?.status === 'no_bids' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
                  <div className="text-center p-6 bg-white/10 rounded-xl border border-white/20 shadow-2xl backdrop-blur-md">
                    <div className="text-white font-bold text-2xl">Auction Ended</div>
                    <div className="text-gray-300 mt-2">Reserve not met or no bids</div>
                  </div>
                </div>
              )}
            </div>

            <CardContent className="flex flex-col gap-4 pt-3 pb-4 sm:flex-row sm:items-start sm:justify-between">
              {/* Current price block */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {finalizationResult?.status === 'sold' ? "Sold Price" : "Current bid"}
                </div>
                <div className="text-2xl font-bold">
                  {formatPrice(finalizationResult ? finalizationResult.final_price : highestBid, car.currency)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Starting from {formatPrice(car.startingPrice, car.currency)}
                </div>
              </div>

              {/* Bidding controls */}
              <div className="flex w-full flex-col gap-2 sm:w-72">
                {/* Quick increment selector */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Quick increment
                    </span>
                    <div className="flex gap-1">
                      {[250, 500, 1000].map((step) => (
                        <Button
                          key={step}
                          type="button"
                          size="sm"
                          variant={bidStep === step ? "default" : "outline"}
                          className="h-7 px-2 text-xs"
                          onClick={() => setBidStep(step)}
                          disabled={biddingDisabled}
                        >
                          +{step.toLocaleString("en-US")} {car.currency}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button
                    type="button"
                    className="w-full"
                    onClick={handleQuickBid}
                    disabled={biddingDisabled || placingBid}
                  >
                    {placingBid ? "Placing..." : `Add ${bidStep.toLocaleString("en-US")} ${car.currency}`}
                  </Button>
                </div>

                {/* Custom bid */}
                <div className="space-y-1">
                  <Label
                    htmlFor="custom-bid"
                    className="text-xs text-muted-foreground"
                  >
                    Or place a custom bid
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="custom-bid"
                      type="number"
                      min={highestBid + 1}
                      placeholder={`Min ${highestBid + 1}`}
                      value={customBid}
                      onChange={(e) => setCustomBid(e.target.value)}
                      className="h-9"
                      disabled={biddingDisabled || placingBid}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCustomBid}
                      disabled={biddingDisabled || placingBid}
                    >
                      Bid
                    </Button>
                  </div>
                </div>

                {!user && (
                  <div className="text-xs text-center text-red-500">
                    Log in to place a bid
                  </div>
                )}

                {/* Helper + Quit */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-muted-foreground">
                    Live updates active
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/auctions")}
                  >
                    Quit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin / Test Controls - Keeping it simple for demo */}
          {(finalizationResult || car.isSold) && (
            <Card>
              <CardHeader>Dev test</CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleRestoreAuction}
                >
                  <RefreshCcw className="h-4 w-4" />
                  Restore Auction (Test)
                </Button>
              </CardContent>
            </Card>
          )}

          {(!finalizationResult && !car.isSold && car.isActive) && (
            <Card>
              <CardHeader>Dev test</CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
                  onClick={handleSetEndingSoon}
                >
                  <Timer className="h-4 w-4" />
                  Set Ending in 60s (Test)
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Auction details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                This is a demo description. In a real app, this section would
                include a full write-up of the car&apos;s history, maintenance
                records, and seller notes.
              </p>
              <Separator />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <div className="text-xs font-medium text-muted-foreground">
                    Fuel
                  </div>
                  <div className="font-medium">{car.fuel}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">
                    Transmission
                  </div>
                  <div className="font-medium">{car.transmission}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">
                    Location
                  </div>
                  <div className="font-medium">{car.location}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">
                    Currency
                  </div>
                  <div className="font-medium">{car.currency}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <CarSpecs car={car} />
        </div>

        {/* Right side: bidder list */}
        <BidderList auctionId={car.id} bids={bids} currency={car.currency} />
      </div >
    </div >
  );
}


type BidderListProps = {
  auctionId: any;
  bids: Bid[];
  currency: string;
};

function BidderList({ bids, currency }: BidderListProps) {
  const sorted = [...bids].sort((a, b) => b.amount - a.amount);

  return (
    <Card className="h-full">
      <CardHeader className="">
        <CardTitle className="text-base">Live bidders </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <ScrollArea className="h-auto pr-3">
          <div className="space-y-2">
            {sorted.map((bid, index) => {
              const initials = bid.bidderName
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              const isTop = index === 0;

              return (
                <div
                  key={bid.id}
                  className="flex items-center justify-between rounded-md border bg-background/70 px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7 border">
                      <AvatarFallback className="text-[10px]">
                        {initials || "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{bid.bidderName}</span>
                        {isTop && (
                          <span className="rounded-full bg-emerald-500/10 px-2 text-[10px] font-semibold text-emerald-700">
                            TOP BID
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {bid.time}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {formatPrice(bid.amount, currency)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}


type CarSpecsProps = {
  car: AuctionCar;
};

export function CarSpecs({ car }: CarSpecsProps) {
  const { specs } = car;

  const rows: Array<[string, string | number]> = [
    ["Engine", specs.engine],
    ["Power", `${specs.powerHp} hp`],
    ["Fuel", car.fuel],
    ["Transmission", car.transmission],
    ["Color", specs.color],
    ["Mileage", `${car.mileageKm.toLocaleString("en-US")} km`],
    ["Owners", specs.owners],
    ["VIN", specs.vin],
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Vehicle specs</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-2 rounded-md border bg-muted/40 px-3 py-2"
          >
            <span className="text-xs font-medium text-muted-foreground">
              {label}
            </span>
            <span className="text-right font-medium">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
