export interface MarketplaceStockProjection {
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
  stockImage: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface StockFilterParams {
  city?: string;
  cropName?: string;
  category?: string;
  page?: number;
  size?: number;
}
