# Missing Form Fields - Implementation Guide

Based on the correct schema you provided, here are the fields that need to be added to the create/edit auction form:

## ✅ Already Implemented
- title
- subtitle  
- year
- make
- model
- mileage_km
- fuel
- transmission
- location
- starting_price
- currency
- auction_end
- vin
- description
- engine
- power_hp
- color
- previous_owners
- image_url (handled as file upload)

## 🔧 Fields to Add to the Form

### 1. Reserve Price (Optional)
```tsx
{/* Reserve Price */}
<div className="space-y-2">
  <Label htmlFor="reservePrice">Reserve Price (Optional)</Label>
  <Input
    id="reservePrice"
    name="reservePrice"
    type="number"
    placeholder="Minimum price to sell"
    value={formData.reservePrice}
    onChange={handleChange}
  />
  <p className="text-xs text-muted-foreground">
    Minimum price you're willing to accept
  </p>
</div>
```

### 2. Auction Start Date & Time
```tsx
{/* Auction Start Date and Time */}
<div className="grid gap-4 sm:grid-cols-2">
  <div className="space-y-2">
    <Label htmlFor="auctionStartDate">Auction Start Date</Label>
    <Input
      id="auctionStartDate"
      name="auctionStartDate"
      type="date"
      value={formData.auctionStartDate}
      onChange={handleChange}
      required
      min={minDate}
    />
  </div>
  <div className="space-y-2">
    <Label htmlFor="auctionStartTime">Auction Start Time</Label>
    <Input
      id="auctionStartTime"
      name="auctionStartTime"
      type="time"
      value={formData.auctionStartTime}
      onChange={handleChange}
      required
    />
  </div>
</div>
```

### 3. Condition Report (Optional)
```tsx
{/* Condition Report */}
<div className="space-y-2">
  <Label htmlFor="conditionReport">Condition Report (Optional)</Label>
  <textarea
    id="conditionReport"
    name="conditionReport"
    rows={6}
    placeholder="Detailed condition report: damages, repairs, maintenance history..."
    value={formData.conditionReport}
    onChange={handleChange}
    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  />
</div>
```

### 4. Features (Optional)
```tsx
{/* Features */}
<div className="space-y-2">
  <Label htmlFor="features">Features (Optional)</Label>
  <Input
    id="features"
    name="features"
    placeholder="e.g., Leather seats, Navigation, Sunroof, Heated seats"
    value={formData.features}
    onChange={handleChange}
  />
  <p className="text-xs text-muted-foreground">
    Separate multiple features with commas
  </p>
</div>
```

### 5. Gallery Images (Future Enhancement)
This will require a multi-file upload component. For now, we're handling the main image.

## 📝 Form Submission Updates

In the `handleSubmit` function, add these fields to the FormData:

```tsx
// Add auction_start
const auctionStartDateTime = new Date(
  `${formData.auctionStartDate}T${formData.auctionStartTime}`
);
formDataToSend.append("auction_start", auctionStartDateTime.toISOString());

// Add reserve_price (optional)
if (formData.reservePrice) {
  formDataToSend.append("reserve_price", formData.reservePrice);
}

// Add condition_report (optional)
if (formData.conditionReport) {
  formDataToSend.append("condition_report", formData.conditionReport);
}

// Add features (convert comma-separated string to array)
if (formData.features) {
  const featuresArray = formData.features
    .split(",")
    .map(f => f.trim())
    .filter(f => f);
  formDataToSend.append("features", JSON.stringify(featuresArray));
}
```

## 🔄 Data Loading Updates

When fetching auction data for edit mode, add:

```tsx
const auctionStartDate = new Date(data.auction_start);

setFormData({
  // ... existing fields ...
  reservePrice: data.reserve_price?.toString() || "",
  auctionStartDate: auctionStartDate.toISOString().split("T")[0],
  auctionStartTime: auctionStartTime.toTimeString().slice(0, 5),
  conditionReport: data.condition_report || "",
  features: Array.isArray(data.features) ? data.features.join(", ") : "",
});
```

## ✅ TypeScript Types Updated

The `AuctionForEdit` interface in `src/api/types.ts` has been updated with:
- `reserve_price: number`
- `auction_start: number`
- `condition_report: string`
- `features: string[]`

## 📋 Recommended Form Layout Order

1. **Image Upload** (drag & drop)
2. **Basic Info**: Title, Subtitle
3. **Vehicle Details**: Make, Model, Year
4. **Specifications**: Mileage, Fuel, Transmission, Engine, Power HP, Color
5. **Location & VIN**
6. **Pricing**: Starting Price, Reserve Price (optional), Currency
7. **Auction Timing**: Start Date/Time, End Date/Time
8. **Descriptions**: Description, Condition Report (optional)
9. **Features** (optional, comma-separated)
10. **Previous Owners**

## 🎯 Next Steps

1. Add the missing form fields to the UI (reserve_price, auction_start, condition_report, features)
2. Update the form submission to include these fields
3. Test create and edit modes
4. Verify all fields are properly saved and loaded

The form interface and initial data have already been updated to include all these fields!
