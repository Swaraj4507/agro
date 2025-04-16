import axios from "axios";

const publicApi = axios.create({
  baseURL: "http://172.20.10.5:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const checkHealth = async () => {
  try {
    const res = await publicApi.get("/health");
    return res.data;
  } catch (error) {
    console.error("Health Check Failed:", error);
    return null;
  }
};
