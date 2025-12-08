import { apiClient } from './config';

// Types for Bid API
export interface Bid {
  id: number;
  auction_car_id: number;
  bidder_id: number;
  amount: number;
  currency: string;
  is_winning: boolean;
  is_auto_bid: boolean;
  max_auto_bid_amount?: number;
  is_valid: boolean;
  ip_address: string;
  user_agent: string;
  bid_source: string;
  created_at: string;
}

export interface PlaceBidParams {
  auction_car_id: number;
  bidder_id: number;
  amount: number;
  is_auto_bid?: boolean;
  max_auto_bid_amount?: number;
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

export interface GetAuctionBidsParams {
  auction_car_id: number;
  page?: number;
  per_page?: number;
  valid_only?: boolean;
}

export interface BidWithBidder extends Bid {
  bidder_name: string;
  bidder_avatar?: string;
}

export interface GetAuctionBidsResponse {
  auction_car_id: number;
  auction_title: string;
  bids: BidWithBidder[];
  total: number;
  page: number;
  per_page: number;
}

export interface GetUserBidsParams {
  user_id: number;
  page?: number;
  per_page?: number;
  winning_only?: boolean;
}

export interface UserBidWithAuction {
  bid_id: number;
  amount: number;
  currency: string;
  is_winning: boolean;
  is_auto_bid: boolean;
  bid_placed_at: string;
  auction: {
    id: number;
    title: string;
    slug: string;
    auction_end: string;
  };
}

export interface GetUserBidsResponse {
  user: {
    id: number;
    name: string;
    total_bids: number;
    total_wins: number;
  };
  bids: UserBidWithAuction[];
  total: number;
  page: number;
  per_page: number;
}

/**
 * Bid API Service
 */
export const bidApi = {
  /**
   * Place a bid on an auction
   * @param params Bid parameters
   * @returns Bid result
   */
  place: async (params: PlaceBidParams): Promise<PlaceBidResponse> => {
    const response = await apiClient.post('/bids/place', params);
    return response.data;
  },

  /**
   * Get bid history for a specific auction
   * @param params Auction bid parameters
   * @returns Auction bids
   */
  getAuctionBids: async (params: GetAuctionBidsParams): Promise<GetAuctionBidsResponse> => {
    const response = await apiClient.get('/bids/this-auction', { params });
    return response.data;
  },

  /**
   * Get all bids placed by a specific user
   * @param params User bid parameters
   * @returns User bids
   */
  getUserBids: async (params: GetUserBidsParams): Promise<GetUserBidsResponse> => {
    const response = await apiClient.get('/bids/user-bids', { params });
    return response.data;
  },
};
