import api from "./axiosInstance";

export const uploadFile = async (file, folder) => {
  const formData = new FormData();
  formData.append("file", file);
  console.log("Uploading file:", file, "to folder:", folder);
  try {
    const response = await api.post(`/storage/upload?folder=images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};
