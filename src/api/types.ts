export interface User {
  id: number;
  name: string;
  email: string;
  created_at: number;
}

export interface AuthResponse {
  authToken: string;
}

export interface Auction {
  id: number;
  title: string;
  subtitle: string;
  slug: string;
  image_url?: {
    mime: string;
    url: string;
  } | null;
  year: number;
  mileage_km: number;
  fuel: string;
  transmission: string;
  location: string;
  starting_price: number;
  current_price: number;
  currency: string;
  auction_start: number;
  auction_end: number;
  is_active: boolean;
  is_sold: boolean;
  total_bids: number;
  total_views: number;
  total_watchers: number;
}

export interface AuctionSpecs {
  engine: string;
  power_hp: number;
  color: string;
  vin: string;
  previous_owners: number;
}

export interface Bid {
  id: number;
  bidder_id: number;
  bidder_name?: string;
  bidder_avatar?: string;
  amount: number;
  currency: string;
  is_winning: boolean;
  is_auto_bid?: boolean;
  created_at: number;
  car_auction?: number; // In placeBid response
}

export interface AuctionDetail extends Auction {
  gallery_images: string[];
  reserve_price: number;
  specs: AuctionSpecs;
  description: string;
  condition_report: string;
  features: string[];
  bids: Bid[];
  // created_at comes from AuctionDetail example but check clashes with Auction?
  // Auction example in list doesn't have created_at, but detail does.
  // We can add optional created_at to Auction or just here.
}

export interface PaginatedResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages?: number;
}

export interface AuctionListResponse extends PaginatedResponse {
  auctions: Auction[];
  // total_pages is in example
}

export interface BidsListResponse extends PaginatedResponse {
  car_auction_id: number;
  auction_title: string;
  bids: Bid[];
}

export interface WatchlistEntry {
  watchlist_id: number;
  auction: {
    id: number;
    title: string;
    current_price: number;
    auction_end: number;
  };
  notifications: {
    notify_on_new_bid: boolean;
    notify_on_price_drop: boolean;
    notify_on_ending_soon: boolean;
  };
  added_at: number;
}

export interface WatchlistResponse extends PaginatedResponse {
  user_id: number;
  watchlist: WatchlistEntry[];
}

export interface ToggleWatchlistResponse {
  success: boolean;
  action: 'added' | 'removed';
  user_id: number;
  auction_car_id: number;
  auction_title: string;
}

export interface PlaceBidResponse {
  success: boolean;
  bid: Bid;
  auction: {
    id: number;
    title: string;
    current_price: number;
    total_bids: number;
  };
}

export interface WinnerInfo {
  bidder_id: number;
  bidder_name: string;
  winning_amount: number;
  currency: string;
}

export interface FinalizeAuctionResponse {
  success: boolean;
  auction_id: number;
  auction_title: string;
  status: 'sold' | 'no_bids' | 'active';
  auction_end: number;
  total_bids: number;
  final_price: number;
  reserve_price: number;
  reserve_met: boolean;
  winner?: WinnerInfo | null;
}

// My Posted Auctions Types
export interface MyPostedAuction {
  id: number;
  title: string;
  subtitle: string;
  slug: string;
  image_url: {
    mime: string;
    url: string;
  } | null;
  year: number;
  mileage_km: number;
  fuel: string;
  transmission: string;
  location: string;
  starting_price: number;
  current_price: number;
  currency: string;
  auction_start: number;
  auction_end: number;
  is_active: boolean;
  is_sold: boolean;
  total_bids: number;
  total_views: number;
  total_watchers: number;
  created_at: number;
}

export interface MyPostedAuctionsResponse extends PaginatedResponse {
  auctions: MyPostedAuction[];
}

export interface DeleteAuctionResponse {
  success: boolean;
  message: string;
  auction_id: number;
}

// Create/Edit Auction Types
export interface CreateAuctionPayload {
  title: string;
  subtitle?: string;
  year: number;
  make: string;
  model: string;
  mileage_km: number;
  fuel: string;
  transmission: string;
  location: string;
  starting_price: number;
  currency: string;
  auction_end: string; // ISO date string
  image_url: string;
  vin: string;
  description?: string;
  engine?: string;
  power_hp?: number;
  color?: string;
  previous_owners?: number;
  condition_report?: string;
  features?: string[];
}

export interface UpdateAuctionPayload extends Partial<CreateAuctionPayload> {
  auction_id: number;
}

export interface AuctionForEdit {
  id: number;
  title: string;
  subtitle: string;
  year: number;
  make: string;
  model: string;
  mileage_km: number;
  fuel: string;
  transmission: string;
  location: string;
  starting_price: number;
  reserve_price: number;
  current_price: number;
  currency: string;
  auction_start: number;
  auction_end: number;
  image_url: {
    mime: string;
    url: string;
  };
  vin: string;
  description: string;
  engine: string;
  power_hp: number;
  color: string;
  previous_owners: number;
  condition_report: string;
  features: string[];
  has_bids: boolean;
}

export interface CreateAuctionResponse {
  success: boolean;
  auction: MyPostedAuction;
}

export interface UpdateAuctionResponse {
  success: boolean;
  auction: MyPostedAuction;
}

// Auction Statistics Types
export interface TopBidder {
  name: string;
  bid_amount: number;
  bid_time: number;
}

export interface ViewsOverTime {
  date: string;
  views: number;
}

export interface BidsOverTime {
  date: string;
  bids: number;
}

export interface AuctionStats {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  current_price: number;
  starting_price: number;
  currency: string;
  total_bids: number;
  total_views: number;
  unique_viewers: number;
  watchlist_count: number;
  is_active: boolean;
  auction_end: number;
  created_at: number;
  price_increase: number;
  price_increase_percent: number;
  top_bidders: TopBidder[];
  views_over_time: ViewsOverTime[];
  bids_over_time: BidsOverTime[];
}

// User Profile Types
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  country?: string;
  avatar_url?: string;
  created_at: number;
  statistics: {
    auctions_posted: number;
    auctions_won: number;
    total_bids: number;
  };
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  avatar_url?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  user: UserProfile;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface DeleteAccountPayload {
  password: string;
  confirmation: string;
}

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
}
