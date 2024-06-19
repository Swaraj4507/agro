import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, Image, View } from "react-native";
import { Redirect, router } from "expo-router";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../constants";
import CustomButton from "../components/CustomButton";
// import { CustomButton } from "../components";
import { useGlobalContext } from "../context/GlobalProvider";
import Loader from "../components/Loader";
import { useState } from "react";
import Animated, { FadeIn } from "react-native-reanimated";
export default function App() {
  const { loading, isLogged, userType } = useGlobalContext();
  // console.log(process.env.EXPO_FIREBASE_API_KEY);
  if (loading) {
    return <Loader isLoading={loading} />;
  }
  return (
    <SafeAreaView className="bg-primary h-full">
      {/* <Loader isLoading={loading} /> */}
      <ScrollView
        contentContainerStyle={{
          height: "100%",
        }}
      >
        <Animated.View
          entering={FadeIn.delay(200)}
          className="flex justify-center items-center  mt-3"
        >
          <Text className="text-4xl text-[#65B741] font-psemibold ">
            Agro tech
          </Text>
        </Animated.View>
        <Animated.View
          entering={FadeIn.delay(400)}
          className="w-full flex justify-center  items-start h-full px-4 "
        >
          <Animated.View className="relative mt-1 ">
            <Text className="text-4xl text-black font-psemibold text-left">
              Welcome to{"\n"}
              <Text className="text-[#65B741]  font-psemibold ">
                JSK AgroTech
              </Text>
              ,{"\n"}
              your agricultural hub.
            </Text>
            <Text className="text-sm font-pbold  text-black-100 mt-7 text-left">
              Bringing the fields to your fingertips
            </Text>
          </Animated.View>

          {!loading && isLogged && userType !== undefined && userType !== "" ? (
            userType === "farmer" ? (
              <>
                <CustomButton
                  title={"Go to farmer section"}
                  handlePress={() => router.push("/home")}
                  containerStyles="w-full mt-20"
                />
              </>
            ) : (
              <CustomButton
                title={"Go to Buyer section"}
                handlePress={() => router.push("/bhome")}
                containerStyles="w-full mt-20"
              />
            )
          ) : (
            <>
              <CustomButton
                title="Continue as farmer"
                handlePress={() => router.push("/sign-in-f")}
                containerStyles="w-full mt-20"
              />
              <CustomButton
                title="Continue as buyer"
                handlePress={() => router.push("/sign-up-b")}
                containerStyles="w-full mt-10"
              />
            </>
          )}
        </Animated.View>
      </ScrollView>

      <StatusBar backgroundColor="#000" style="light" />
    </SafeAreaView>
  );
}
