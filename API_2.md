# API Requirements for New Pages

This document outlines all the API endpoints required for the newly created pages in the car auction application.

---

## 1. My Posted Auctions Page

**Page:** `src/routes/my-posted-auctions-page.tsx`  
**Route:** `/auctions/posted`

### 1.1 Get User's Posted Auctions

**Endpoint:** `GET /api/auctions/my-posted`

**Description:** Retrieves all auctions created by the authenticated user.

**Authentication:** Required (Bearer Token)

**Query Parameters:**
```typescript
{
  page?: number;        // Page number (default: 1)
  per_page?: number;    // Items per page (default: 20)
  status?: 'active' | 'ended' | 'all';  // Filter by status (default: 'all')
}
```

**Response:**
```typescript
{
  auctions: [
    {
      id: number;
      slug: string;
      title: string;
      subtitle: string;
      image_url: {
        url: string;
        name: string;
        type: string;
        size: number;
      };
      year: number;
      mileage_km: number;
      fuel: string;
      transmission: string;
      location: string;
      starting_price: number;
      current_price: number;
      currency: string;
      auction_end: number;        // Unix timestamp
      is_active: boolean;
      is_sold: boolean;
      total_bids: number;         // Count of bids
      total_views: number;        // Count of views
      created_at: number;         // Unix timestamp
    }
  ];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
```

**Example Request:**
```javascript
const response = await fetch('/api/auctions/my-posted?page=1&per_page=20', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  }
});
```

---

### 1.2 Delete Auction

**Endpoint:** `DELETE /api/auctions/{auction_id}`

**Description:** Deletes an auction created by the authenticated user.

**Authentication:** Required (Bearer Token)

**Path Parameters:**
- `auction_id` (number): The ID of the auction to delete

**Response:**
```typescript
{
  success: boolean;
  message: string;
  deleted_auction_id: number;
}
```

**Example Request:**
```javascript
const response = await fetch(`/api/auctions/${auctionId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  }
});
```

**Error Responses:**
- `403 Forbidden`: User doesn't own this auction
- `404 Not Found`: Auction doesn't exist
- `409 Conflict`: Cannot delete auction with active bids

---

## 2. Create/Edit Auction Page

**Page:** `src/routes/create-edit-auction-page.tsx`  
**Routes:** `/auctions/create`, `/auctions/:id/edit`

### 2.1 Create New Auction

**Endpoint:** `POST /api/auctions`

**Description:** Creates a new auction listing.

**Authentication:** Required (Bearer Token)

**Request Body:**
```typescript
{
  title: string;              // Required
  subtitle?: string;
  year: number;               // Required
  make: string;               // Required
  model: string;              // Required
  mileage_km: number;         // Required
  fuel: string;               // Required (Gasoline, Diesel, Electric, Hybrid)
  transmission: string;       // Required (Automatic, Manual, Semi-Automatic)
  location: string;           // Required
  starting_price: number;     // Required
  currency: string;           // Required (USD, EUR, GBP)
  auction_end: number;        // Required, Unix timestamp
  description?: string;
  image_url: string;          // Required, URL to image
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  auction: {
    id: number;
    slug: string;
    title: string;
    subtitle: string;
    image_url: {
      url: string;
      name: string;
      type: string;
      size: number;
    };
    year: number;
    make: string;
    model: string;
    mileage_km: number;
    fuel: string;
    transmission: string;
    location: string;
    starting_price: number;
    current_price: number;
    currency: string;
    auction_end: number;
    description: string;
    is_active: boolean;
    created_at: number;
    created_by: number;        // User ID
  };
}
```

**Example Request:**
```javascript
const response = await fetch('/api/auctions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: "2020 BMW M3 Competition",
    subtitle: "Twin-Turbo Inline-6, 503 HP",
    year: 2020,
    make: "BMW",
    model: "M3 Competition",
    mileage_km: 15000,
    fuel: "Gasoline",
    transmission: "Automatic",
    location: "Munich, Germany",
    starting_price: 65000,
    currency: "EUR",
    auction_end: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days from now
    description: "Pristine condition BMW M3 Competition...",
    image_url: "https://example.com/image.jpg"
  })
});
```

---

### 2.2 Get Auction Details for Editing

**Endpoint:** `GET /api/auctions/{auction_id}/edit`

**Description:** Retrieves full auction details for editing (only for auction owner).

**Authentication:** Required (Bearer Token)

**Path Parameters:**
- `auction_id` (number): The ID of the auction

**Response:**
```typescript
{
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  image_url: {
    url: string;
    name: string;
    type: string;
    size: number;
  };
  year: number;
  make: string;
  model: string;
  mileage_km: number;
  fuel: string;
  transmission: string;
  location: string;
  starting_price: number;
  current_price: number;
  currency: string;
  auction_end: number;
  description: string;
  is_active: boolean;
  created_at: number;
  created_by: number;
}
```

**Example Request:**
```javascript
const response = await fetch(`/api/auctions/${auctionId}/edit`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  }
});
```

**Error Responses:**
- `403 Forbidden`: User doesn't own this auction
- `404 Not Found`: Auction doesn't exist

---

### 2.3 Update Auction

**Endpoint:** `PUT /api/auctions/{auction_id}`

**Description:** Updates an existing auction (only for auction owner).

**Authentication:** Required (Bearer Token)

**Path Parameters:**
- `auction_id` (number): The ID of the auction

**Request Body:**
```typescript
{
  title?: string;
  subtitle?: string;
  year?: number;
  make?: string;
  model?: string;
  mileage_km?: number;
  fuel?: string;
  transmission?: string;
  location?: string;
  starting_price?: number;      // Only if no bids yet
  currency?: string;             // Only if no bids yet
  auction_end?: number;          // Can extend, not shorten
  description?: string;
  image_url?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  auction: {
    // Same structure as create response
  };
}
```

**Example Request:**
```javascript
const response = await fetch(`/api/auctions/${auctionId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: "Updated Title",
    description: "Updated description...",
    auction_end: newEndTimestamp
  })
});
```

**Business Rules:**
- Cannot change `starting_price` or `currency` if bids exist
- Can only extend `auction_end`, not shorten it
- Cannot edit if auction has ended

**Error Responses:**
- `403 Forbidden`: User doesn't own this auction or auction has ended
- `404 Not Found`: Auction doesn't exist
- `409 Conflict`: Trying to modify restricted fields with existing bids

---

## 3. Auction Statistics Page

**Page:** `src/routes/auction-stats-page.tsx`  
**Route:** `/auctions/:id/stats`

### 3.1 Get Auction Statistics

**Endpoint:** `GET /api/auctions/{auction_id}/stats`

**Description:** Retrieves comprehensive statistics for an auction (only for auction owner).

**Authentication:** Required (Bearer Token)

**Path Parameters:**
- `auction_id` (number): The ID of the auction

**Response:**
```typescript
{
  auction: {
    id: number;
    slug: string;
    title: string;
    subtitle: string;
    image_url: {
      url: string;
      name: string;
      type: string;
      size: number;
    };
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
    unique_viewers: number;
    watchlist_count: number;
    price_increase: number;
    price_increase_percent: number;
  };
  
  top_bidders: [
    {
      user_id: number;
      name: string;              // Anonymized (e.g., "John D.")
      bid_amount: number;
      bid_time: number;          // Unix timestamp
      rank: number;
    }
  ];
  
  views_over_time: [
    {
      date: string;              // Format: "YYYY-MM-DD"
      views: number;
    }
  ];
  
  bids_over_time: [
    {
      date: string;              // Format: "YYYY-MM-DD"
      bids: number;
    }
  ];
}
```

**Example Request:**
```javascript
const response = await fetch(`/api/auctions/${auctionId}/stats`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  }
});
```

**Error Responses:**
- `403 Forbidden`: User doesn't own this auction
- `404 Not Found`: Auction doesn't exist

---

## 4. Edit Profile Page

**Page:** `src/routes/edit-profile-page.tsx`  
**Route:** `/profile/edit`

### 4.1 Get Current User Profile

**Endpoint:** `GET /api/user/profile`

**Description:** Retrieves the authenticated user's profile information.

**Authentication:** Required (Bearer Token)

**Response:**
```typescript
{
  id: number;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar_url?: string;
  created_at: number;
  
  statistics: {
    auctions_posted: number;
    auctions_won: number;
    total_bids: number;
  };
}
```

**Example Request:**
```javascript
const response = await fetch('/api/user/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  }
});
```

---

### 4.2 Update User Profile

**Endpoint:** `PUT /api/user/profile`

**Description:** Updates the authenticated user's profile information.

**Authentication:** Required (Bearer Token)

**Request Body:**
```typescript
{
  name?: string;
  email?: string;              // May require email verification
  phone?: string;
  location?: string;
  bio?: string;
  avatar_url?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    location: string;
    bio: string;
    avatar_url: string;
    updated_at: number;
  };
}
```

**Example Request:**
```javascript
const response = await fetch('/api/user/profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "John Doe",
    phone: "+49 123 456 7890",
    location: "Munich, Germany",
    bio: "Car enthusiast and collector...",
    avatar_url: "https://example.com/avatar.jpg"
  })
});
```

**Business Rules:**
- Email changes may require verification
- Name must be at least 2 characters
- Phone number should be validated

**Error Responses:**
- `400 Bad Request`: Invalid data format
- `409 Conflict`: Email already in use

---

### 4.3 Change Password

**Endpoint:** `PUT /api/user/password`

**Description:** Changes the authenticated user's password.

**Authentication:** Required (Bearer Token)

**Request Body:**
```typescript
{
  current_password: string;    // Required
  new_password: string;        // Required, min 8 characters
  confirm_password: string;    // Required, must match new_password
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Example Request:**
```javascript
const response = await fetch('/api/user/password', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    current_password: "oldPassword123",
    new_password: "newSecurePassword456",
    confirm_password: "newSecurePassword456"
  })
});
```

**Business Rules:**
- Current password must be correct
- New password must be at least 8 characters
- New password must be different from current password
- Passwords must match

**Error Responses:**
- `400 Bad Request`: Passwords don't match or invalid format
- `401 Unauthorized`: Current password is incorrect

---

### 4.4 Delete Account

**Endpoint:** `DELETE /api/user/account`

**Description:** Permanently deletes the authenticated user's account and all associated data.

**Authentication:** Required (Bearer Token)

**Request Body:**
```typescript
{
  password: string;            // Required for confirmation
  confirmation: string;        // Required, must be "DELETE"
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Example Request:**
```javascript
const response = await fetch('/api/user/account', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    password: "userPassword123",
    confirmation: "DELETE"
  })
});
```

**Business Rules:**
- Password must be correct
- Confirmation must be exactly "DELETE"
- All user's auctions will be ended/cancelled
- All user's bids will be removed
- Action is irreversible

**Error Responses:**
- `400 Bad Request`: Invalid confirmation
- `401 Unauthorized`: Incorrect password
- `409 Conflict`: User has active auctions with bids

---

## Common Error Responses

All endpoints may return these common errors:

### 401 Unauthorized
```typescript
{
  error: "Unauthorized",
  message: "Invalid or expired authentication token"
}
```

### 500 Internal Server Error
```typescript
{
  error: "Internal Server Error",
  message: "An unexpected error occurred"
}
```

---

## Implementation Notes

### Frontend Integration

1. **Create API Service Files:**
   ```typescript
   // src/api/my-auctions.ts
   export const MyAuctionsService = {
     getPostedAuctions: async (page: number, perPage: number) => { ... },
     deleteAuction: async (auctionId: number) => { ... }
   };
   
   // src/api/auction-management.ts
   export const AuctionManagementService = {
     createAuction: async (data: AuctionFormData) => { ... },
     getAuctionForEdit: async (auctionId: number) => { ... },
     updateAuction: async (auctionId: number, data: AuctionFormData) => { ... }
   };
   
   // src/api/auction-stats.ts
   export const AuctionStatsService = {
     getAuctionStats: async (auctionId: number) => { ... }
   };
   
   // src/api/profile.ts
   export const ProfileService = {
     getProfile: async () => { ... },
     updateProfile: async (data: ProfileFormData) => { ... },
     changePassword: async (data: PasswordChangeData) => { ... },
     deleteAccount: async (password: string) => { ... }
   };
   ```

2. **Error Handling:**
   - Implement consistent error handling across all API calls
   - Show user-friendly error messages
   - Handle network errors gracefully

3. **Loading States:**
   - Show loading indicators during API calls
   - Disable form submissions while processing
   - Provide feedback on successful operations

4. **Data Validation:**
   - Validate form data before sending to API
   - Match backend validation rules
   - Show field-level error messages

---

## Testing Checklist

- [ ] Test creating a new auction
- [ ] Test editing an existing auction
- [ ] Test deleting an auction (with and without bids)
- [ ] Test viewing auction statistics
- [ ] Test updating profile information
- [ ] Test changing password
- [ ] Test pagination on posted auctions list
- [ ] Test error handling for all endpoints
- [ ] Test authentication token expiration
- [ ] Test permission checks (accessing other users' data)

---

## Security Considerations

1. **Authentication:** All endpoints require valid Bearer token
2. **Authorization:** Users can only access/modify their own data
3. **Input Validation:** Validate all user inputs on backend
4. **Rate Limiting:** Implement rate limiting on all endpoints
5. **Password Security:** Hash passwords, enforce strong password policies
6. **Data Privacy:** Anonymize bidder information in statistics
7. **CORS:** Configure appropriate CORS policies
8. **SQL Injection:** Use parameterized queries
9. **XSS Protection:** Sanitize user-generated content

---

**Last Updated:** December 9, 2025  
**Version:** 1.0
