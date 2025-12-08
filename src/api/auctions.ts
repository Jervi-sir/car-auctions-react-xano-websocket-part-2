import { carClient, handleAPIError } from './client';
import type { AuctionDetail, AuctionListResponse, BidsListResponse, PlaceBidResponse, ToggleWatchlistResponse, WatchlistResponse, FinalizeAuctionResponse } from './types';

export const AuctionService = {
  async getAuctions(page = 1, perPage = 20): Promise<AuctionListResponse> {
    try {
      const response = await carClient.get<AuctionListResponse>('/auctions/list', {
        params: { page, per_page: perPage }
      });
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  async getAuctionBySlug(slug: string, userId?: number): Promise<AuctionDetail> {
    try {
      const params: any = { slug };
      if (userId) params.user_id = userId;

      const response = await carClient.get<AuctionDetail>('/auctions/slug', { params });
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  async getAuctionBids(carAuctionId: number, page = 1, perPage = 50): Promise<BidsListResponse> {
    try {
      const response = await carClient.get<BidsListResponse>('/auctions/bids', {
        params: {
          car_auction_id: carAuctionId,
          page,
          per_page: perPage,
          valid_only: true
        }
      });
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  async placeBid(
    carAuctionId: number,
    bidderId: number,
    amount: number,
    isAutoBid = false,
    maxAutoBidAmount?: number
  ): Promise<PlaceBidResponse> {
    try {
      const payload: any = {
        car_auction_id: carAuctionId,
        bidder_id: bidderId,
        amount,
        is_auto_bid: isAutoBid
      };
      if (maxAutoBidAmount) payload.max_auto_bid_amount = maxAutoBidAmount;

      const response = await carClient.post<PlaceBidResponse>('/bids/place', payload);
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  async toggleWatchlist(
    userId: number,
    auctionId: number,
    notifications: { newBid?: boolean; priceDrop?: boolean; endingSoon?: boolean } = {}
  ): Promise<ToggleWatchlistResponse> {
    try {
      const payload = {
        user_id: userId,
        auction_car_id: auctionId,
        notify_on_new_bid: notifications.newBid ?? true,
        notify_on_price_drop: notifications.priceDrop ?? true,
        notify_on_ending_soon: notifications.endingSoon ?? true
      };
      const response = await carClient.post<ToggleWatchlistResponse>('/watchlist/toggle', payload);
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  async getWatchlist(
    userId: number,
    page = 1,
    perPage = 20,
    activeOnly = true
  ): Promise<WatchlistResponse> {
    try {
      const response = await carClient.get<WatchlistResponse>('/watchlist/list', {
        params: {
          user_id: userId,
          page,
          per_page: perPage,
          active_only: activeOnly
        }
      });
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  async finalizeAuction(carAuctionId: number): Promise<FinalizeAuctionResponse> {
    try {
      const response = await carClient.post<FinalizeAuctionResponse>('/auctions/finalize', {
        car_auction_id: carAuctionId
      });
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  async getEndedAuctions(page = 1, perPage = 20): Promise<AuctionListResponse> {
    try {
      const response = await carClient.get<AuctionListResponse>('/auctions/list-ended', {
        params: { page, per_page: perPage }
      });
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  async restoreAuction(carAuctionId: number): Promise<any> {
    try {
      const response = await carClient.post('/auctions/restore', {
        car_auction_id: carAuctionId
      });
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  async updateAuctionEndDate(carAuctionId: number): Promise<any> {
    try {
      // The user mentioned specifically setting it to 60s, but we can make it a parameter easily properly, 
      // though the user said "payload is car_auction_id" for the update-end-date endpoint. 
      // Wait, if the payload ONLY takes car_auction_id, then the backend likely sets it to a fixed time or takes an optional param.
      // The user said: "just add a button that make the auction 60 second far from ending ... payload is car_auction_id"
      // So I will assume the endpoint hardcodes the "60 seconds" logic or just extends it.
      // However, usually updates need a value. Let's assume it just needs ID based on prompt description "payload is car_auction_id".
      const response = await carClient.post('/auctions/update-end-date', {
        car_auction_id: carAuctionId
      });
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  async getWonAuctions(userId: number, page = 1, perPage = 20): Promise<AuctionListResponse> {
    try {
      const response = await carClient.get<AuctionListResponse>('/auctions/mine', {
        params: { user_id: userId, page, per_page: perPage }
      });
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  }
};
