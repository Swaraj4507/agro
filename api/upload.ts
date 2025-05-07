import api from "./axiosInstance";

export const uploadFile = async (file, folder) => {
  const formData = new FormData();
  formData.append("file", file);
  const cleanFolder = folder.startsWith('/') ? folder.substring(1) : folder;
  console.log("Uploading file:", file, "to folder:", cleanFolder);
  try {
    const response = await api.post(`/storage/upload?folder=${cleanFolder}`, formData, {
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
