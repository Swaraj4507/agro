export interface Stock {
  id: string;
  cropName: string;
  category: string;
  description: string;
  pricePerKg: number;
  finalPricePerKg: number;
  availableQuantity: number;
  city: string;
  harvestedAt: string;
  expiryDate: string;
  createdAt: string;
  farmerId: string;
  imageUrl: string;
}

export interface StockFilters {
  city?: string;
  cropName?: string;
  category?: string;
  harvestedAfter?: string;
  harvestedBefore?: string;
  expiryAfter?: string;
  expiryBefore?: string;
  minPrice?: number;
  maxPrice?: number;
}

const mockStocks: Stock[] = [
  {
    id: "1",
    cropName: "Wheat",
    category: "Grain",
    description: "Premium quality wheat from local farms",
    pricePerKg: 25.5,
    finalPricePerKg: 24.0,
    availableQuantity: 500,
    city: "Indore",
    harvestedAt: "2025-03-15T10:00:00Z",
    expiryDate: "2025-09-15T10:00:00Z",
    createdAt: "2025-04-01T12:30:00Z",
    farmerId: "f1",
    imageUrl: require("../assets/icon.png"),
  },
  {
    id: "2",
    cropName: "Rice",
    category: "Grain",
    description: "Premium basmati rice with excellent aroma",
    pricePerKg: 60.0,
    finalPricePerKg: 58.5,
    availableQuantity: 300,
    city: "Bhopal",
    harvestedAt: "2025-04-01T08:00:00Z",
    expiryDate: "2025-08-01T08:00:00Z",
    createdAt: "2025-04-10T09:15:00Z",
    farmerId: "f2",
    imageUrl: require("../assets/icon.png"),
  },
];

export const getStocks = (filters: StockFilters = {}) => {
  return mockStocks.filter((stock) => {
    if (filters.city && stock.city !== filters.city) return false;
    if (filters.category && stock.category !== filters.category) return false;
    if (
      filters.cropName &&
      !stock.cropName.toLowerCase().includes(filters.cropName.toLowerCase())
    )
      return false;
    if (filters.minPrice && stock.finalPricePerKg < filters.minPrice)
      return false;
    if (filters.maxPrice && stock.finalPricePerKg > filters.maxPrice)
      return false;
    return true;
  });
};

export const getStockById = (id: string) => {
  return mockStocks.find((stock) => stock.id === id);
};

export const getUniqueCategories = () => {
  return Array.from(new Set(mockStocks.map((stock) => stock.category)));
};

export const getUniqueCities = () => {
  return Array.from(new Set(mockStocks.map((stock) => stock.city)));
};
