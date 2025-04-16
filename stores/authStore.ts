import { create } from "zustand";
import {
  storeToken,
  removeToken,
  getTokens,
  storeAccessToken,
} from "../utils/tokenStorage";
import {
  login as loginAPI,
  logoutAPI,
  refreshAccessToken,
} from "../api/authAPI";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userType: string | null;
  login: (phoneNumber: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setAuth: (accessToken: string, refreshToken: string, user: any) => void;
  initializeAuth: () => Promise<void>;
  refreshAuthToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  userType: null,

  login: async (phoneNumber, password) => {
    try {
      const res = await loginAPI(phoneNumber, password);
      if (res.success) {
        const { accessToken, refreshToken, user } = res.data;
        console.log("[Auth] Extracted tokens:", {
          accessToken: accessToken,
          refreshToken: refreshToken,
          userType: user,
        });
        await storeToken(accessToken, refreshToken, user);
        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
          userType: user.userType,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  },

  logout: async () => {
    try {
      await logoutAPI();
      await removeToken();
      set({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  setAuth: (accessToken, refreshToken, user) => {
    set({
      accessToken,
      refreshToken,
      user,
      isAuthenticated: true,
      userType: user.userType,
    });
  },

  initializeAuth: async () => {
    try {
      const { accessToken, refreshToken, user } = await getTokens();
      console.log("[Auth] Initial tokens:", {
        accessToken,
        refreshToken,
        user,
      });

      if (accessToken && refreshToken && user) {
        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
          isLoading: false,
          userType: user.userType,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      set({ isLoading: false });
    }
  },

  refreshAuthToken: async () => {
    const { refreshToken: currentRefreshToken } = get();
    if (!currentRefreshToken) return false;

    try {
      const res = await refreshAccessToken(currentRefreshToken);
      if (res.success) {
        const { accessToken } = res.data;
        await storeAccessToken(accessToken);
        set({
          accessToken,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    }
  },
}));
