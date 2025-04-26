import { Address, ApiResponse } from "../types/marketplace";
import api from "./axiosInstance";

export const fetchUserAddresses = async (userId: string) => {
  const response = await api.get<ApiResponse<Address[]>>(
    `/users/${userId}/addresses`
  );
  return response.data.data; // returns the addresses array
};
