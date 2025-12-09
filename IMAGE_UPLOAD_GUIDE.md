# Image Upload Implementation - Updated

## ✅ Current Implementation
The create/edit auction form now sends the **image file directly** with the auction data in a single request using `multipart/form-data`.

## How It Works

### Frontend (Already Implemented)
1. **User selects image** via drag-and-drop or file browser
2. **Image preview** is shown immediately
3. **On form submit**, all auction data + image file are sent together as `FormData`

### Backend Requirements

Your Xano backend needs to accept `multipart/form-data` on these endpoints:

#### 1. Create Auction
**Endpoint**: `POST /my-auctions/create`  
**Content-Type**: `multipart/form-data`

**Form Fields**:
```
title: string (required)
subtitle: string (optional)
year: string (required)
make: string (required)
model: string (required)
mileage_km: string (required)
fuel: string (required)
transmission: string (required)
location: string (required)
starting_price: string (required)
currency: string (required)
auction_end: string (ISO date, required)
vin: string (required)
description: string (optional)
engine: string (optional)
power_hp: string (optional)
color: string (optional)
previous_owners: string (optional)
image: File (required) - The actual image file
image_url: string (optional) - Only sent if no new image file
```

**Response**:
```json
{
  "success": true,
  "auction": {
    "id": 123,
    "title": "2020 BMW M3",
    "image_url": "https://your-cdn.com/uploads/auction-123.jpg",
    ...
  }
}
```

#### 2. Update Auction
**Endpoint**: `PUT /my-auctions/:auction_id`  
**Content-Type**: `multipart/form-data`

Same fields as create, but all are optional except when updating the image.

### Backend Implementation Example (Xano)

In your Xano function:

1. **Accept the file input**:
   - Add an input of type `file` named `image`
   - Set it as optional (for updates without image change)

2. **Process the image**:
   ```
   If image exists:
     - Validate file type (image/jpeg, image/png, etc.)
     - Validate file size (max 5MB)
     - Upload to your storage (Xano file storage or external CDN)
     - Get the uploaded file URL
   Else if image_url exists:
     - Use the existing image_url
   ```

3. **Save auction data**:
   - Convert string fields to appropriate types (year, mileage_km, etc. to integers)
   - Save to database with the image URL

### Example Xano Function Logic

```
// Input validation
If image is provided:
  - Check file.mime_type starts with "image/"
  - Check file.size <= 5242880 (5MB)
  - Upload file to storage
  - Set image_url = uploaded_file.url
Else if image_url is provided:
  - Use existing image_url
Else:
  - Return error "Image is required"

// Create auction record
auction = db.car_auction.create({
  title: input.title,
  year: to_number(input.year),
  mileage_km: to_number(input.mileage_km),
  starting_price: to_number(input.starting_price),
  image_url: image_url,
  // ... other fields
})

Return {
  success: true,
  auction: auction
}
```

## What Changed from Previous Implementation

### Before:
- ❌ Separate image upload endpoint
- ❌ Two API calls (upload image, then create auction)
- ❌ More complex error handling

### Now:
- ✅ Single API call with everything
- ✅ Image sent as file in FormData
- ✅ Simpler, more atomic operation
- ✅ Better error handling (all or nothing)

## Testing

### Test Create Auction:
1. Fill out the form
2. Upload an image via drag-and-drop
3. Submit the form
4. Check browser Network tab:
   - Request should be `multipart/form-data`
   - Should see the image file in the request payload
   - All form fields should be present

### Test Update Auction:
1. Edit an existing auction
2. Change some fields but keep the same image → should send `image_url`
3. Upload a new image → should send new `image` file
4. Submit and verify

## Frontend Code Summary

The form now:
1. Creates a `FormData` object
2. Appends all auction fields as strings
3. Appends the image file (if selected) or image_url (if existing)
4. Sends to backend with `Content-Type: multipart/form-data`

The API service automatically detects `FormData` and sets the correct headers.

## Benefits

✅ **Atomic operation**: Image and auction data created together  
✅ **Simpler flow**: One request instead of two  
✅ **Better UX**: Faster, single loading state  
✅ **Easier rollback**: If auction creation fails, no orphaned images  
✅ **Standard approach**: Common pattern for file uploads with form data
