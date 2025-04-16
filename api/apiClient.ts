import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://172.20.10.5:8080/api",
  headers: { "Content-Type": "application/json" },
});

export default apiClient;
