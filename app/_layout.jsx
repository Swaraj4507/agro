import { StyleSheet, Text, View } from "react-native";
import { router, SplashScreen, Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { I18nextProvider } from "react-i18next";
import GlobalProvider from "../context/GlobalProvider";
import i18n from "../i18n/i18n";
import { CopilotProvider } from "react-native-copilot";
import OnboardingScreen from "../components/OnboardingScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootSiblingParent } from "react-native-root-siblings";
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
const RootLayout = () => {
  const router = useRouter();
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });
  useEffect(() => {
    if (error) throw error;

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  // useEffect(() => {
  //   AsyncStorage.getItem("alreadyLaunched").then((value) => {
  //     if (value == null) {
  //       console.log("NotLaunched");
  //       AsyncStorage.setItem("alreadyLaunched", "true"); // No need to await here
  //       setIsFirstLaunch(true);
  //     } else {
  //       console.log("alreadyLaunched");
  //       setIsFirstLaunch(false);
  //     }
  //   });
  // }, []);

  if (!fontsLoaded) {
    return null;
  }

  if (!fontsLoaded && !error && isFirstLaunch === null) {
    return null;
  }

  return (
    <GlobalProvider>
      <I18nextProvider i18n={i18n}>
        <RootSiblingParent>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(btabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="(crops)"
              options={{ headerShown: false, presentation: "modal" }}
            />
            <Stack.Screen
              name="search/[query]"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="diseases/[crop]"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="pages/editstock"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="pages/requestStock"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="pages/viewStockPage"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="pages/chatScreen"
              options={{ headerShown: false }}
            />
          </Stack>
        </RootSiblingParent>
      </I18nextProvider>
    </GlobalProvider>
  );
};

export default RootLayout;
