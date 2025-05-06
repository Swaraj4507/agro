import apiClient from "./axiosInstance";
import { ApiResponse } from "../types/marketplace";

export interface CreateOrderBody {
  stockId: string;
  orderQuantity: number;
  buyerId: string;
  address: {
    id: string;
    addressLine: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
  };
  buyerMobileNumber: string;
  expectedDeliveryDate: string;
}

export const createOrder = async (body: CreateOrderBody) => {
  const res = await apiClient.post<ApiResponse<any>>("/orders", body);
  return res.data;
};