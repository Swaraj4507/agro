import api from "../api/axiosInstance";
import {
  ApiResponse,
  PaginatedResponse,
  MarketplaceStockProjection,
  StockFilterParams,
} from "../types/marketplace";

export const fetchStocks = async (
  params: StockFilterParams = {}
): Promise<ApiResponse<PaginatedResponse<MarketplaceStockProjection>>> => {
  try {
    const response = await api.get("marketplace/stocks", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching stocks:", error);
    throw error;
  }
};
