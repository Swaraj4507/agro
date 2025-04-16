import * as SecureStore from "expo-secure-store";

export const storeToken = async (
  accessToken: string,
  refreshToken: string,
  user: any
) => {
  console.log("[Storage] User object type:", typeof user);
  await SecureStore.setItemAsync("accessToken", accessToken);
  await SecureStore.setItemAsync("refreshToken", refreshToken);
  await SecureStore.setItemAsync("user", JSON.stringify(user));
};

export const storeAccessToken = async (accessToken: string) => {
  await SecureStore.setItemAsync("accessToken", accessToken);
};

export const getTokens = async () => {
  const accessToken = await SecureStore.getItemAsync("accessToken");
  const refreshToken = await SecureStore.getItemAsync("refreshToken");
  const userString = await SecureStore.getItemAsync("user");
  const user = userString ? JSON.parse(userString) : null;
  return { accessToken, refreshToken, user };
};

export const removeToken = async () => {
  await SecureStore.deleteItemAsync("accessToken");
  await SecureStore.deleteItemAsync("refreshToken");
  await SecureStore.deleteItemAsync("user");
};
