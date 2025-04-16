import api from "../api/axiosInstance";

export const login = async (phoneNumber: string, password: string) => {
  try {
    const res = await api.post(
      "/auth/login",
      {},
      {
        headers: {
          phoneNumber,
          password,
        },
      }
    );
    return { success: true, data: res.data.data };
  } catch (error) {
    console.error("Login failed:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Login error",
    };
  }
};

// Logout API
export const logoutAPI = async () => {
  try {
    await api.post("/auth/logout");
    return { success: true };
  } catch (error) {
    console.error("Logout failed:", error);
    return { success: false };
  }
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const res = await api.post("/auth/refresh", { refreshToken });
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Token refresh failed:", error);
    return { success: false };
  }
};
