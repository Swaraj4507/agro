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
      error: error.response?.data?.data?.message || "Login error",
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
export const getUserRole = async (mobile: string) => {
  try {
    const response = await api.get("/users/role", {
      params: { mobile },
      headers: {
        accept: "*/*",
      },
    });
    console.log("User role response:", response.data);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      // Extract and return the error message from the response body.
      console.error("Error fetching user role:", error.response.data);
      return error.response.data; // Return the entire error response to be handled by the caller.
    } else {
      console.error("Unexpected error:", error.message);
      throw new Error("An unexpected error occurred while fetching user role.");
    }
  }
};
