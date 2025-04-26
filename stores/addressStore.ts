import { create } from "zustand";
import { Address } from "../types/marketplace";
import { fetchUserAddresses } from "../api/userAPI";

interface AddressState {
  addresses: Address[] | null;
  fetchAddresses: (userId: string) => Promise<Address[]>;
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
  clearAddresses: () => set({ addresses: null }),
}));
