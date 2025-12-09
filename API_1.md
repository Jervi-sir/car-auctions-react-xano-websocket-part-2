# Car Auction API Documentation

Complete API documentation for the Car Auction platform with React + Axios integration examples.

## Table of Contents

- [Authentication](#authentication)
- [User API Endpoints](#user-api-endpoints)
- [Car Auction API Endpoints](#car-auction-api-endpoints)
- [React + Axios Setup](#react--axios-setup)
- [Error Handling](#error-handling)

---

## Authentication

All authenticated endpoints require a bearer token in the Authorization header.

### Base URLs

- **User API**: `https://your-xano-instance.com/api:4aZ5gqlM`
- **Car API**: `https://your-xano-instance.com/api:FnuTavOE`

---

## User API Endpoints

### 1. Sign Up (Register)

Create a new user account and receive an authentication token.

**Endpoint**: `POST /auth/signup`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+1234567890",
  "city": "New York",
  "country": "USA"
}
```

**Response**:
```json
{
  "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**React + Axios Example**:
```javascript
import axios from 'axios';

const signup = async (userData) => {
  try {
    const response = await axios.post(
      'https://your-xano-instance.com/api:4aZ5gqlM/auth/signup',
      {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        city: userData.city,
        country: userData.country
      }
    );
    
    // Store auth token
    localStorage.setItem('authToken', response.data.authToken);
    
    return response.data;
  } catch (error) {
    console.error('Signup error:', error.response?.data);
    throw error;
  }
};
```

---

### 2. Login

Authenticate an existing user and receive an authentication token.

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**React + Axios Example**:
```javascript
const login = async (email, password) => {
  try {
    const response = await axios.post(
      'https://your-xano-instance.com/api:4aZ5gqlM/auth/login',
      {
        email,
        password
      }
    );
    
    // Store auth token
    localStorage.setItem('authToken', response.data.authToken);
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error('Invalid credentials');
    }
    throw error;
  }
};
```

---

### 3. Get Current User (Me)

Retrieve the authenticated user's information.

**Endpoint**: `GET /auth/me`

**Headers**:
```
Authorization: Bearer {authToken}
```

**Response**:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": 1701234567890
}
```

**React + Axios Example**:
```javascript
const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.get(
      'https://your-xano-instance.com/api:4aZ5gqlM/auth/me',
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      throw new Error('Session expired. Please login again.');
    }
    throw error;
  }
};
```

---

## Car Auction API Endpoints

### 1. List Auctions

Get a paginated list of active car auctions.

**Endpoint**: `GET /auctions/list`

**Query Parameters**:
- `page` (optional, default: 1) - Page number
- `per_page` (optional, default: 20, max: 100) - Items per page

**Example Request**:
```
GET /auctions/list?page=1&per_page=20
```

**Response**:
```json
{
  "auctions": [
    {
      "id": 1,
      "title": "1967 Ford Mustang Fastback",
      "subtitle": "Classic American Muscle",
      "slug": "1967-ford-mustang-fastback",
      "image_url": "https://...",
      "year": 1967,
      "mileage_km": 85000,
      "fuel": "Gasoline",
      "transmission": "Manual",
      "location": "California, USA",
      "starting_price": 45000,
      "current_price": 52000,
      "currency": "USD",
      "auction_start": 1701234567890,
      "auction_end": 1701320967890,
      "is_active": true,
      "is_sold": false,
      "total_bids": 12,
      "total_views": 456,
      "total_watchers": 23
    }
  ],
  "page": 1,
  "per_page": 20,
  "total": 150,
  "total_pages": 8
}
```

**React + Axios Example**:
```javascript
const getAuctions = async (page = 1, perPage = 20) => {
  try {
    const response = await axios.get(
      'https://your-xano-instance.com/api:FnuTavOE/auctions/list',
      {
        params: {
          page,
          per_page: perPage
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching auctions:', error);
    throw error;
  }
};
```

---

### 2. Get Auction by Slug

Get detailed information about a specific auction car.

**Endpoint**: `GET /auctions/slug`

**Query Parameters**:
- `slug` (required) - Unique slug identifier for the auction
- `user_id` (optional) - User ID for view tracking

**Example Request**:
```
GET /auctions/slug?slug=1967-ford-mustang-fastback&user_id=1
```

**Response**:
```json
{
  "id": 1,
  "title": "1967 Ford Mustang Fastback",
  "subtitle": "Classic American Muscle",
  "slug": "1967-ford-mustang-fastback",
  "image_url": "https://...",
  "gallery_images": ["https://...", "https://..."],
  "year": 1967,
  "mileage_km": 85000,
  "fuel": "Gasoline",
  "transmission": "Manual",
  "location": "California, USA",
  "starting_price": 45000,
  "current_price": 52000,
  "reserve_price": 55000,
  "currency": "USD",
  "auction_start": 1701234567890,
  "auction_end": 1701320967890,
  "is_active": true,
  "is_sold": false,
  "specs": {
    "engine": "V8 4.7L",
    "power_hp": 271,
    "color": "Highland Green",
    "vin": "7R02C123456",
    "previous_owners": 2
  },
  "description": "Stunning example of the iconic...",
  "condition_report": "Excellent condition with...",
  "features": ["Air Conditioning", "Power Steering", "Disc Brakes"],
  "total_bids": 12,
  "total_views": 457,
  "total_watchers": 23,
  "bids": [
    {
      "id": 45,
      "bidder_id": 5,
      "amount": 52000,
      "currency": "USD",
      "is_winning": true,
      "created_at": 1701318000000
    }
  ],
  "created_at": 1701000000000
}
```

**React + Axios Example**:
```javascript
const getAuctionBySlug = async (slug, userId = null) => {
  try {
    const response = await axios.get(
      'https://your-xano-instance.com/api:FnuTavOE/auctions/slug',
      {
        params: {
          slug,
          ...(userId && { user_id: userId })
        }
      }
    );
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Auction not found');
    }
    throw error;
  }
};
```

---

### 3. Get Auction Bids

Get bid history for a specific auction.

**Endpoint**: `GET /auctions/bids`

**Query Parameters**:
- `car_auction_id` (required) - Auction ID
- `page` (optional, default: 1) - Page number
- `per_page` (optional, default: 50, max: 100) - Items per page
- `valid_only` (optional, default: true) - Show only valid bids

**Example Request**:
```
GET /auctions/bids?car_auction_id=1&page=1&per_page=50&valid_only=true
```

**Response**:
```json
{
  "car_auction_id": 1,
  "auction_title": "1967 Ford Mustang Fastback",
  "bids": [
    {
      "id": 45,
      "bidder_id": 5,
      "bidder_name": "Jane Smith",
      "bidder_avatar": "https://...",
      "amount": 52000,
      "currency": "USD",
      "is_winning": true,
      "is_auto_bid": false,
      "created_at": 1701318000000
    }
  ],
  "total": 12,
  "page": 1,
  "per_page": 50
}
```

**React + Axios Example**:
```javascript
const getAuctionBids = async (auctionId, page = 1, perPage = 50) => {
  try {
    const response = await axios.get(
      'https://your-xano-instance.com/api:FnuTavOE/auctions/bids',
      {
        params: {
          car_auction_id: auctionId,
          page,
          per_page: perPage,
          valid_only: true
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching bids:', error);
    throw error;
  }
};
```

---

### 4. Place Bid

Place a bid on an auction car.

**Endpoint**: `POST /bids/place`

**Headers**:
```
Authorization: Bearer {authToken}
```

**Request Body**:
```json
{
  "car_auction_id": 1,
  "bidder_id": 5,
  "amount": 53000,
  "is_auto_bid": false,
  "max_auto_bid_amount": 55000
}
```

**Response**:
```json
{
  "success": true,
  "bid": {
    "id": 46,
    "car_auction": 1,
    "bidder_id": 5,
    "amount": 53000,
    "currency": "USD",
    "is_winning": true,
    "created_at": 1701319000000
  },
  "auction": {
    "id": 1,
    "title": "1967 Ford Mustang Fastback",
    "current_price": 53000,
    "total_bids": 13
  }
}
```

**React + Axios Example**:
```javascript
const placeBid = async (auctionId, bidderId, amount, isAutoBid = false, maxAutoBid = null) => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.post(
      'https://your-xano-instance.com/api:FnuTavOE/bids/place',
      {
        car_auction_id: auctionId,
        bidder_id: bidderId,
        amount: amount,
        is_auto_bid: isAutoBid,
        ...(maxAutoBid && { max_auto_bid_amount: maxAutoBid })
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
};
```

---

### 5. Toggle Watchlist

Add or remove an auction from the user's watchlist.

**Endpoint**: `POST /watchlist/toggle`

**Headers**:
```
Authorization: Bearer {authToken}
```

**Request Body**:
```json
{
  "user_id": 5,
  "auction_car_id": 1,
  "notify_on_new_bid": true,
  "notify_on_price_drop": true,
  "notify_on_ending_soon": true
}
```

**Response**:
```json
{
  "success": true,
  "action": "added",
  "user_id": 5,
  "auction_car_id": 1,
  "auction_title": "1967 Ford Mustang Fastback"
}
```

**React + Axios Example**:
```javascript
const toggleWatchlist = async (userId, auctionId, notifications = {}) => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.post(
      'https://your-xano-instance.com/api:FnuTavOE/watchlist/toggle',
      {
        user_id: userId,
        auction_car_id: auctionId,
        notify_on_new_bid: notifications.newBid ?? true,
        notify_on_price_drop: notifications.priceDrop ?? true,
        notify_on_ending_soon: notifications.endingSoon ?? true
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error toggling watchlist:', error);
    throw error;
  }
};
```

---

### 6. Get Watchlist

Get the user's watchlist of auctions.

**Endpoint**: `GET /watchlist/list`

**Query Parameters**:
- `user_id` (required) - User ID
- `page` (optional, default: 1) - Page number
- `per_page` (optional, default: 20, max: 100) - Items per page
- `active_only` (optional, default: true) - Show only active auctions

**Example Request**:
```
GET /watchlist/list?user_id=5&page=1&per_page=20&active_only=true
```

**Response**:
```json
{
  "user_id": 5,
  "watchlist": [
    {
      "watchlist_id": 12,
      "auction": {
        "id": 1,
        "title": "1967 Ford Mustang Fastback",
        "current_price": 53000,
        "auction_end": 1701320967890
      },
      "notifications": {
        "notify_on_new_bid": true,
        "notify_on_price_drop": true,
        "notify_on_ending_soon": true
      },
      "added_at": 1701200000000
    }
  ],
  "total": 5,
  "page": 1,
  "per_page": 20
}
```

**React + Axios Example**:
```javascript
const getWatchlist = async (userId, page = 1, perPage = 20, activeOnly = true) => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.get(
      'https://your-xano-instance.com/api:FnuTavOE/watchlist/list',
      {
        params: {
          user_id: userId,
          page,
          per_page: perPage,
          active_only: activeOnly
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    throw error;
  }
};
```

---

## React + Axios Setup

### 1. Install Dependencies

```bash
npm install axios
```

### 2. Create API Configuration

Create a file `src/config/api.js`:

```javascript
import axios from 'axios';

// Base URLs
export const USER_API_BASE = 'https://your-xano-instance.com/api:4aZ5gqlM';
export const CAR_API_BASE = 'https://your-xano-instance.com/api:FnuTavOE';

// Create axios instances
export const userAPI = axios.create({
  baseURL: USER_API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const carAPI = axios.create({
  baseURL: CAR_API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
const addAuthInterceptor = (apiInstance) => {
  apiInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

// Add response interceptor for error handling
const addResponseInterceptor = (apiInstance) => {
  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

// Apply interceptors
addAuthInterceptor(userAPI);
addAuthInterceptor(carAPI);
addResponseInterceptor(userAPI);
addResponseInterceptor(carAPI);
```

### 3. Create Auth Service

Create a file `src/services/authService.js`:

```javascript
import { userAPI } from '../config/api';

class AuthService {
  // Sign up
  async signup(userData) {
    try {
      const response = await userAPI.post('/auth/signup', userData);
      this.setAuthToken(response.data.authToken);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Login
  async login(email, password) {
    try {
      const response = await userAPI.post('/auth/login', { email, password });
      this.setAuthToken(response.data.authToken);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const response = await userAPI.get('/auth/me');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Logout
  logout() {
    this.removeAuthToken();
    window.location.href = '/login';
  }

  // Token management
  setAuthToken(token) {
    localStorage.setItem('authToken', token);
  }

  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  removeAuthToken() {
    localStorage.removeItem('authToken');
  }

  isAuthenticated() {
    return !!this.getAuthToken();
  }

  // Error handling
  handleError(error) {
    if (error.response?.data?.error) {
      return new Error(error.response.data.error);
    }
    return error;
  }
}

export default new AuthService();
```

### 4. Create Auction Service

Create a file `src/services/auctionService.js`:

```javascript
import { carAPI } from '../config/api';

class AuctionService {
  // Get auctions list
  async getAuctions(page = 1, perPage = 20) {
    try {
      const response = await carAPI.get('/auctions/list', {
        params: { page, per_page: perPage }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get auction by slug
  async getAuctionBySlug(slug, userId = null) {
    try {
      const response = await carAPI.get('/auctions/slug', {
        params: { slug, ...(userId && { user_id: userId }) }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get auction bids
  async getAuctionBids(auctionId, page = 1, perPage = 50) {
    try {
      const response = await carAPI.get('/auctions/bids', {
        params: {
          car_auction_id: auctionId,
          page,
          per_page: perPage,
          valid_only: true
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Place bid
  async placeBid(auctionId, bidderId, amount, isAutoBid = false, maxAutoBid = null) {
    try {
      const response = await carAPI.post('/bids/place', {
        car_auction_id: auctionId,
        bidder_id: bidderId,
        amount,
        is_auto_bid: isAutoBid,
        ...(maxAutoBid && { max_auto_bid_amount: maxAutoBid })
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Toggle watchlist
  async toggleWatchlist(userId, auctionId, notifications = {}) {
    try {
      const response = await carAPI.post('/watchlist/toggle', {
        user_id: userId,
        auction_car_id: auctionId,
        notify_on_new_bid: notifications.newBid ?? true,
        notify_on_price_drop: notifications.priceDrop ?? true,
        notify_on_ending_soon: notifications.endingSoon ?? true
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get watchlist
  async getWatchlist(userId, page = 1, perPage = 20, activeOnly = true) {
    try {
      const response = await carAPI.get('/watchlist/list', {
        params: {
          user_id: userId,
          page,
          per_page: perPage,
          active_only: activeOnly
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handling
  handleError(error) {
    if (error.response?.data?.error) {
      return new Error(error.response.data.error);
    }
    return error;
  }
}

export default new AuctionService();
```

### 5. Usage in React Components

#### Login Component Example

```javascript
import React, { useState } from 'react';
import authService from '../services/authService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(email, password);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

export default Login;
```

#### Auction List Component Example

```javascript
import React, { useState, useEffect } from 'react';
import auctionService from '../services/auctionService';

function AuctionList() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAuctions();
  }, [page]);

  const fetchAuctions = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await auctionService.getAuctions(page, 20);
      setAuctions(data.auctions);
      setTotalPages(data.total_pages);
    } catch (err) {
      setError(err.message || 'Failed to load auctions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Car Auctions</h1>
      <div className="auction-grid">
        {auctions.map((auction) => (
          <div key={auction.id} className="auction-card">
            <img src={auction.image_url} alt={auction.title} />
            <h3>{auction.title}</h3>
            <p>{auction.subtitle}</p>
            <p>Current Price: ${auction.current_price.toLocaleString()}</p>
            <p>Bids: {auction.total_bids}</p>
          </div>
        ))}
      </div>
      <div className="pagination">
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button 
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default AuctionList;
```

#### Place Bid Component Example

```javascript
import React, { useState } from 'react';
import auctionService from '../services/auctionService';

function BidForm({ auctionId, currentPrice, userId }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const bidAmount = parseFloat(amount);
      
      if (bidAmount <= currentPrice) {
        throw new Error('Bid must be higher than current price');
      }

      await auctionService.placeBid(auctionId, userId, bidAmount);
      setSuccess(true);
      setAmount('');
    } catch (err) {
      setError(err.message || 'Failed to place bid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Place Your Bid</h3>
      <p>Current Price: ${currentPrice.toLocaleString()}</p>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter bid amount"
        min={currentPrice + 1}
        step="100"
        required
      />
      {error && <p className="error">{error}</p>}
      {success && <p className="success">Bid placed successfully!</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Placing Bid...' : 'Place Bid'}
      </button>
    </form>
  );
}

export default BidForm;
```

---

## Error Handling

### Common Error Responses

#### 400 - Input Error
```json
{
  "error_type": "inputerror",
  "error": "Bid amount must be higher than current price"
}
```

#### 401 - Unauthorized
```json
{
  "error_type": "unauthorized",
  "error": "Authentication required"
}
```

#### 403 - Access Denied
```json
{
  "error_type": "accessdenied",
  "error": "Invalid credentials"
}
```

#### 404 - Not Found
```json
{
  "error_type": "notfound",
  "error": "Auction car not found"
}
```

### Global Error Handler

```javascript
// src/utils/errorHandler.js
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.error || 'Invalid request';
      case 401:
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        return 'Session expired. Please login again.';
      case 403:
        return data.error || 'Access denied';
      case 404:
        return data.error || 'Resource not found';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return data.error || 'An error occurred';
    }
  } else if (error.request) {
    // Request made but no response
    return 'Network error. Please check your connection.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};
```

---

## Best Practices

### 1. Token Storage

**Recommended**: Use `localStorage` for web apps (as shown in examples)

```javascript
// Store token
localStorage.setItem('authToken', token);

// Retrieve token
const token = localStorage.getItem('authToken');

// Remove token
localStorage.removeItem('authToken');
```

**Alternative**: Use `sessionStorage` for more security (token expires when browser closes)

```javascript
sessionStorage.setItem('authToken', token);
```

### 2. Token Expiration

Tokens expire after 24 hours (86400 seconds). Implement token refresh or re-authentication:

```javascript
const checkTokenExpiration = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return false;
  
  // Decode JWT to check expiration (requires jwt-decode library)
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    if (decoded.exp < currentTime) {
      localStorage.removeItem('authToken');
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};
```

### 3. Protected Routes

```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

function ProtectedRoute({ children }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default ProtectedRoute;
```

### 4. Request Cancellation

For components that unmount before requests complete:

```javascript
useEffect(() => {
  const controller = new AbortController();
  
  const fetchData = async () => {
    try {
      const response = await axios.get('/api/data', {
        signal: controller.signal
      });
      setData(response.data);
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request cancelled');
      }
    }
  };
  
  fetchData();
  
  return () => controller.abort();
}, []);
```

---

## Rate Limiting

Currently, there are no explicit rate limits documented. However, implement client-side throttling for frequent operations:

```javascript
import { debounce } from 'lodash';

// Debounce search requests
const debouncedSearch = debounce(async (query) => {
  const results = await searchAuctions(query);
  setSearchResults(results);
}, 300);
```

---

## Support

For API issues or questions:
- Check error messages in responses
- Verify authentication tokens are valid
- Ensure request parameters match documentation
- Check network connectivity

---

**Last Updated**: December 2025  
**API Version**: 1.0
