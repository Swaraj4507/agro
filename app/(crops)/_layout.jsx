import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
const crops_layout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen
          name="cropsListing"
          options={{
            headerShown: false,
            presentation: "modal",
          }}
        />
      </Stack>

      {/* <Loader isLoading={loading} /> */}
      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default crops_layout;
