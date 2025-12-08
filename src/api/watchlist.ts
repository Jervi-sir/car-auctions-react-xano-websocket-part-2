import { apiClient } from './config';

// Types for Watchlist API
export interface Watchlist {
  id: number;
  user_id: number;
  auction_car_id: number;
  notify_on_new_bid: boolean;
  notify_on_price_drop: boolean;
  notify_on_ending_soon: boolean;
  created_at: string;
}

export interface ToggleWatchlistParams {
  user_id: number;
  auction_car_id: number;
  notify_on_new_bid?: boolean;
  notify_on_price_drop?: boolean;
  notify_on_ending_soon?: boolean;
}

export interface ToggleWatchlistResponse {
  success: boolean;
  action: 'added' | 'removed';
  user_id: number;
  auction_car_id: number;
  auction_title: string;
}

export interface GetWatchlistParams {
  user_id: number;
  page?: number;
  per_page?: number;
  active_only?: boolean;
}

export interface WatchlistItem {
  watchlist_id: number;
  auction: {
    id: number;
    title: string;
    current_price: number;
    auction_end: string;
  };
  notifications: {
    notify_on_new_bid: boolean;
    notify_on_price_drop: boolean;
    notify_on_ending_soon: boolean;
  };
  added_at: string;
}

export interface GetWatchlistResponse {
  user_id: number;
  watchlist: WatchlistItem[];
  total: number;
  page: number;
  per_page: number;
}

/**
 * Watchlist API Service
 */
export const watchlistApi = {
  /**
   * Add or remove an auction from user's watchlist
   * @param params Watchlist toggle parameters
   * @returns Toggle result
   */
  toggle: async (params: ToggleWatchlistParams): Promise<ToggleWatchlistResponse> => {
    const response = await apiClient.post('/watchlist/toggle', params);
    return response.data;
  },

  /**
   * Get user's watchlist with auction details
   * @param params Watchlist parameters
   * @returns User's watchlist
   */
  getList: async (params: GetWatchlistParams): Promise<GetWatchlistResponse> => {
    const response = await apiClient.get('/watchlist/list', { params });
    return response.data;
  },
};
