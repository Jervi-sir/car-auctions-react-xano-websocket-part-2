// src/routes/create-edit-auction-page.tsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuctionService } from "@/api";

interface AuctionFormData {
  title: string;
  subtitle: string;
  year: string;
  // make: string;
  // model: string;
  mileageKm: string;
  fuel: string;
  transmission: string;
  location: string;
  startingPrice: string;
  reservePrice: string;
  currency: string;
  auctionStartDate: string;
  auctionStartTime: string;
  auctionEndDate: string;
  auctionEndTime: string;
  description: string;
  conditionReport: string;
  features: string;
  imageUrl: any;
  vin: string;
  engine: string;
  powerHp: string;
  color: string;
  previousOwners: string;
}

const initialFormData: AuctionFormData = {
  title: "",
  subtitle: "",
  year: "",
  // make: "",
  // model: "",
  mileageKm: "",
  fuel: "Gasoline",
  transmission: "Automatic",
  location: "",
  startingPrice: "",
  reservePrice: "",
  currency: "EUR",
  auctionStartDate: "",
  auctionStartTime: "",
  auctionEndDate: "",
  auctionEndTime: "",
  description: "",
  conditionReport: "",
  features: "",
  imageUrl: "",
  vin: "",
  engine: "",
  powerHp: "",
  color: "",
  previousOwners: "",
};

export function CreateEditAuctionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<AuctionFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditMode && id) {
      const fetchAuctionData = async () => {
        try {
          setFetchingData(true);
          const data = await AuctionService.getAuctionForEdit(parseInt(id, 10));

          // These can be either timestamps (number) or ISO strings
          const rawAuctionStart = data.auction_start ?? null;
          const rawAuctionEnd = data.auction_end ?? null;
          const rawImage = data.image_url?.url ?? null;

          // Safely build Date objects
          const auctionStartDate =
            rawAuctionStart != null
              ? new Date(rawAuctionStart)
              : null;

          const auctionEndDate =
            rawAuctionEnd != null
              ? new Date(rawAuctionEnd)
              : null;

          setFormData({
            title: data.title,
            subtitle: data.subtitle || "",
            year: data.year.toString(),
            // make: data.make,
            // model: data.model,
            mileageKm: data.mileage_km.toString(),
            fuel: data.fuel,
            transmission: data.transmission,
            location: data.location,
            startingPrice: data.starting_price.toString(),
            reservePrice: data.reserve_price?.toString() || "",
            currency: data.currency,

            // ✅ Only format if we have a valid Date
            auctionStartDate: auctionStartDate
              ? auctionStartDate.toISOString().split("T")[0]
              : "",
            auctionStartTime: auctionStartDate
              ? auctionStartDate.toTimeString().slice(0, 5)
              : "",

            auctionEndDate: auctionEndDate
              ? auctionEndDate.toISOString().split("T")[0]
              : "",
            auctionEndTime: auctionEndDate
              ? auctionEndDate.toTimeString().slice(0, 5)
              : "",

            description: data.description || "",
            conditionReport: data.condition_report || "",
            features: Array.isArray(data.features)
              ? data.features.join(", ")
              : "",
            imageUrl: rawImage || "",
            vin: data.vin || "",
            engine: data.engine || "",
            powerHp: data.power_hp?.toString() || "",
            color: data.color || "",
            previousOwners: data.previous_owners?.toString() || "",
          });

          // @ts-ignore
          const previewUrl = typeof rawImage === "string" ? rawImage : rawImage?.url || "";
          setImagePreview(previewUrl);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch auction data"
          );
          console.error("Error fetching auction:", err);
        } finally {
          setFetchingData(false);
        }
      };

      fetchAuctionData();
    }
  }, [isEditMode, id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setError(null);
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // ⬅️ ADD THIS: build start & end timestamps
      const auctionStartDateTime = new Date(
        `${formData.auctionStartDate}T${formData.auctionStartTime}`
      );
      const auctionEndDateTime = new Date(
        `${formData.auctionEndDate}T${formData.auctionEndTime}`
      );

      const formDataToSend = new FormData();

      // Shared fields
      formDataToSend.append("title", formData.title);
      if (formData.subtitle) formDataToSend.append("subtitle", formData.subtitle);
      formDataToSend.append("year", formData.year);
      // formDataToSend.append("make", formData.make);
      // formDataToSend.append("model", formData.model);
      formDataToSend.append("mileage_km", formData.mileageKm);
      formDataToSend.append("fuel", formData.fuel);
      formDataToSend.append("transmission", formData.transmission);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("starting_price", formData.startingPrice);
      formDataToSend.append("currency", formData.currency);

      // ✅ now auction_start is a real ISO date from the form
      formDataToSend.append("auction_start", auctionStartDateTime.toISOString());
      formDataToSend.append("auction_end", auctionEndDateTime.toISOString());

      formDataToSend.append("vin", formData.vin);

      if (formData.description)
        formDataToSend.append("description", formData.description);
      if (formData.reservePrice)
        formDataToSend.append("reserve_price", formData.reservePrice);
      if (formData.conditionReport)
        formDataToSend.append("condition_report", formData.conditionReport);

      if (formData.features) {
        const featuresArray = formData.features
          .split(",")
          .map((f) => f.trim())
          .filter((f) => f !== "");
        // Send as JSON array string
        formDataToSend.append("features", JSON.stringify(featuresArray));
      }

      if (formData.engine) formDataToSend.append("engine", formData.engine);
      if (formData.powerHp) formDataToSend.append("power_hp", formData.powerHp);
      if (formData.color) formDataToSend.append("color", formData.color);
      if (formData.previousOwners)
        formDataToSend.append("previous_owners", formData.previousOwners);

      if (isEditMode && id) {
        // EDIT MODE

        // 1) If user picked a new file, send it as `image_url` (Xano input name for update)
        if (imageFile) {
          formDataToSend.append("image", imageFile);
        }
        // 3) If imageUrl is just a string URL → DO NOT send anything
        //    → backend keeps existing image

        await AuctionService.updateAuction(parseInt(id, 10), formDataToSend as any);
      } else {
        // CREATE MODE

        // For create, we require a main image
        if (!imageFile) {
          setLoading(false);
          setError("Please upload a main image for the auction.");
          return;
        }

        // Xano create route expects `file image`
        formDataToSend.append("image", imageFile);

        await AuctionService.createAuction(formDataToSend as any);
      }

      // navigate("/auctions/posted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save auction");
      console.error("Error saving auction:", err);
    } finally {
      setLoading(false);
    }
  };


  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const minDate = tomorrow.toISOString().split("T")[0];

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {isEditMode ? "Edit Auction" : "Create New Auction"}
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {isEditMode
            ? "Update your auction details"
            : "List your car for auction"}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive font-semibold">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Auction Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image Upload - Drag and Drop */}
            <div className="space-y-2">
              <Label>Auction Image</Label>

              {imagePreview ? (
                <div className="relative overflow-hidden rounded-lg border">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="aspect-[16/9] w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change Image
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveImage}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                    transition-colors
                    ${isDragging
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      className="h-12 w-12 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium">
                        {isDragging
                          ? "Drop image here"
                          : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., 2020 BMW M3 Competition"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                name="subtitle"
                placeholder="e.g., Twin-Turbo Inline-6, 503 HP"
                value={formData.subtitle}
                onChange={handleChange}
              />
            </div>

            {/* Make and Model */}
            {/* <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  name="make"
                  placeholder="e.g., BMW"
                  value={formData.make}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  name="model"
                  placeholder="e.g., M3 Competition"
                  value={formData.model}
                  onChange={handleChange}
                  required
                />
              </div>
            </div> */}

            {/* Year and Mileage */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  placeholder="2020"
                  value={formData.year}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileageKm">Mileage (km)</Label>
                <Input
                  id="mileageKm"
                  name="mileageKm"
                  type="number"
                  placeholder="15000"
                  value={formData.mileageKm}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Fuel and Transmission */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fuel">Fuel Type</Label>
                <select
                  id="fuel"
                  name="fuel"
                  value={formData.fuel}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="Gasoline">Gasoline</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Plug-in Hybrid">Plug-in Hybrid</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transmission">Transmission</Label>
                <select
                  id="transmission"
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                  <option value="Semi-Automatic">Semi-Automatic</option>
                  <option value="CVT">CVT</option>
                  <option value="DCT">DCT (Dual Clutch)</option>
                </select>
              </div>
            </div>

            {/* Engine and Power */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="engine">Engine</Label>
                <select
                  id="engine"
                  name="engine"
                  value={formData.engine}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select engine type</option>
                  <option value="Inline-4">Inline-4</option>
                  <option value="Inline-6">Inline-6</option>
                  <option value="V6">V6</option>
                  <option value="V8">V8</option>
                  <option value="V10">V10</option>
                  <option value="V12">V12</option>
                  <option value="Flat-4">Flat-4 (Boxer)</option>
                  <option value="Flat-6">Flat-6 (Boxer)</option>
                  <option value="W12">W12</option>
                  <option value="Electric Motor">Electric Motor</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Rotary">Rotary</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="powerHp">Power (HP)</Label>
                <Input
                  id="powerHp"
                  name="powerHp"
                  type="number"
                  placeholder="e.g., 503"
                  value={formData.powerHp}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Color and Previous Owners */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  name="color"
                  type="text"
                  placeholder="e.g., white"
                  value={formData.color}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="previousOwners">Previous Owners</Label>
                <Input
                  id="previousOwners"
                  name="previousOwners"
                  type="number"
                  placeholder="e.g., 1"
                  value={formData.previousOwners}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g., Munich, Germany"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            {/* VIN */}
            <div className="space-y-2">
              <Label htmlFor="vin">VIN (Vehicle Identification Number)</Label>
              <Input
                id="vin"
                name="vin"
                placeholder="e.g., WBS8M9C5XJ5K12345"
                value={formData.vin}
                onChange={handleChange}
                maxLength={17}
                required
              />
              <p className="text-xs text-muted-foreground">
                17-character unique vehicle identifier
              </p>
            </div>

            {/* Starting Price and Currency */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="startingPrice">Starting Price</Label>
                <Input
                  id="startingPrice"
                  name="startingPrice"
                  type="number"
                  placeholder="65000"
                  value={formData.startingPrice}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            {/* Reserve Price (Optional) */}
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

            {/* Auction End Date and Time */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="auctionEndDate">Auction End Date</Label>
                <Input
                  id="auctionEndDate"
                  name="auctionEndDate"
                  type="date"
                  value={formData.auctionEndDate}
                  onChange={handleChange}
                  required
                  min={minDate}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auctionEndTime">Auction End Time</Label>
                <Input
                  id="auctionEndTime"
                  name="auctionEndTime"
                  type="time"
                  value={formData.auctionEndTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Provide detailed information about the vehicle..."
                value={formData.description}
                onChange={handleChange}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Condition Report */}
            <div className="space-y-2">
              <Label htmlFor="conditionReport">Condition Report</Label>
              <select
                id="conditionReport"
                name="conditionReport"
                value={formData.conditionReport}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select condition</option>
                <option value="Excellent">Excellent - Like new, no visible wear</option>
                <option value="Very Good">Very Good - Minor wear, well maintained</option>
                <option value="Good">Good - Normal wear, good working condition</option>
                <option value="Fair">Fair - Noticeable wear, may need minor repairs</option>
                <option value="Poor">Poor - Significant wear, needs repairs</option>
              </select>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <Label>Features (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-3 rounded-md border border-input bg-background p-4 sm:grid-cols-3">
                {[
                  "Leather Seats",
                  "Navigation System",
                  "Sunroof",
                  "Heated Seats",
                  "Backup Camera",
                  "Parking Sensors",
                  "Cruise Control",
                  "Bluetooth",
                  "Apple CarPlay",
                  "Android Auto",
                  "Keyless Entry",
                  "Push Start",
                  "Premium Sound",
                  "Adaptive Cruise",
                  "Lane Assist",
                  "Blind Spot Monitor",
                  "360 Camera",
                  "Ventilated Seats",
                  "Massage Seats",
                  "Heads-Up Display",
                  "Wireless Charging",
                  "Tow Package",
                ].map((feature) => (
                  <label key={feature} className="flex items-center space-x-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.features.split(", ").filter(f => f).includes(feature)}
                      onChange={(e) => {
                        const currentFeatures = formData.features.split(", ").filter(f => f);
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            features: [...currentFeatures, feature].join(", ")
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            features: currentFeatures.filter(f => f !== feature).join(", ")
                          }));
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span>{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/auctions/posted")}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </>
                ) : isEditMode ? (
                  "Update Auction"
                ) : (
                  "Create Auction"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
