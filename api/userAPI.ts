import { Address, ApiResponse } from "../types/marketplace";
import api from "./axiosInstance";

export const fetchUserAddresses = async (userId: string) => {
  const response = await api.get<ApiResponse<Address[]>>(
    `/users/${userId}/addresses`
  );
  return response.data.data; // returns the addresses array
};
export const addUserAddress = async (
  userId: string,
  address: Omit<Address, "id">
) => {
  const response = await api.post(`/users/${userId}/addresses`, address);
  return response.data.data;
};

export const updateUserAddress = async (userId: string, address: Address) => {
  const response = await api.put(
    `/users/${userId}/addresses/${address.id}`,
    address
  );
  return response.data.data;
};
