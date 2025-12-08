// src/data/cars.ts
export type Bid = {
  id: number;
  bidderName: string;
  bidderAvatar?: string;
  amount: number;
  time: string; // human readable
};

export type AuctionCar = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  year: number;
  mileageKm: number;
  fuel: string;
  transmission: string;
  location: string;
  startingPrice: number;
  currentPrice: number;
  currency: string;
  endsInMinutes: number; // for demo countdown
  specs: {
    engine: string;
    powerHp: number;
    color: string;
    vin: string;
    owners: number;
  };
  initialBids: Bid[];
  upcomingBids: Array<{
    bidderName: string;
    amount: number;
  }>;
  isActive?: boolean;
  isSold?: boolean;
};

const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export const cars: AuctionCar[] = [
  {
    id: "audi-rs5-2022",
    title: "Audi RS5 Sportback",
    subtitle: "Quattro Performance Package",
    imageUrl:
      "https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&w=1200",
    year: 2022,
    mileageKm: 18000,
    fuel: "Petrol",
    transmission: "Automatic",
    location: "Algiers, Algeria",
    startingPrice: 65000,
    currentPrice: 70250,
    currency: "€",
    endsInMinutes: 7,
    specs: {
      engine: "2.9L V6 Twin-Turbo",
      powerHp: 450,
      color: "Nardo Grey",
      vin: "WAUZZZF5XN9001234",
      owners: 1,
    },
    initialBids: [
      { id: 1, bidderName: "Speedster_21", amount: 66500, time: now() },
      { id: 2, bidderName: "RSFan", amount: 68000, time: now() },
      { id: 3, bidderName: "BoostedAli", amount: 70250, time: now() },
    ],
    upcomingBids: [
      { bidderName: "QuattroKing", amount: 71000 },
      { bidderName: "TrackReady", amount: 72000 },
      { bidderName: "TorqueMaster", amount: 73100 },
    ],
  },
  {
    id: "golf-gti-2019",
    title: "Volkswagen Golf GTI",
    subtitle: "Performance Edition",
    imageUrl:
      "https://images.pexels.com/photos/129105/pexels-photo-129105.jpeg?auto=compress&w=1200",
    year: 2019,
    mileageKm: 52000,
    fuel: "Petrol",
    transmission: "Manual",
    location: "Oran, Algeria",
    startingPrice: 23000,
    currentPrice: 24800,
    currency: "€",
    endsInMinutes: 15,
    specs: {
      engine: "2.0L TSI",
      powerHp: 245,
      color: "Pure White",
      vin: "WVWZZZAUZKP012345",
      owners: 2,
    },
    initialBids: [
      { id: 1, bidderName: "HotHatchDZ", amount: 23500, time: now() },
      { id: 2, bidderName: "ClutchKick", amount: 24200, time: now() },
      { id: 3, bidderName: "GTILover", amount: 24800, time: now() },
    ],
    upcomingBids: [
      { bidderName: "RedStripe", amount: 25200 },
      { bidderName: "Golf_Addict", amount: 25550 },
    ],
  },
];
