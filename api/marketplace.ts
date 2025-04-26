import api from "../api/axiosInstance";
import {
  ApiResponse,
  PaginatedResponse,
  MarketplaceStockProjection,
  StockFilterParams,
  StockResponseDTO,
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
export const fetchStockDetails = async (
  stockId: string
): Promise<ApiResponse<StockResponseDTO>> => {
  try {
    const response = await api.get(`/stocks/${stockId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching stock details:", error);
    throw error;
  }
};
