import { create } from "zustand";
import { Address } from "../types/marketplace";
import {
  addUserAddress,
  fetchUserAddresses,
  updateUserAddress,
} from "../api/userAPI";

interface AddressState {
  addresses: Address[] | null;
  fetchAddresses: (userId: string) => Promise<Address[]>;
  addAddress: (userId: string, address: Omit<Address, "id">) => Promise<void>;
  updateAddress: (userId: string, address: Address) => Promise<void>;
  clearAddresses: () => void;
}

export const useAddressStore = create<AddressState>((set, get) => ({
  addresses: null,
  fetchAddresses: async (userId: string) => {
    if (get().addresses) return get().addresses!;
    const addresses = await fetchUserAddresses(userId);
    set({ addresses });
    return addresses;
  },
  addAddress: async (userId: string, address: Omit<Address, "id">) => {
    const newAddress = await addUserAddress(userId, address);
    console.log("New address added:", newAddress);
    set({ addresses: [...(get().addresses || []), newAddress] });
  },
  updateAddress: async (userId: string, address: Address) => {
    const updatedAddress = await updateUserAddress(userId, address);
    set({
      addresses:
        get().addresses?.map((addr) =>
          addr.id === address.id ? updatedAddress : addr
        ) || [],
    });
  },
  clearAddresses: () => set({ addresses: null }),
}));
