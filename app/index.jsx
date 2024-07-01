import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, Image, View, TouchableOpacity } from "react-native";
import { Redirect, router } from "expo-router";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { images, icons } from "../constants";

import CustomButton from "../components/CustomButton";
// import { CustomButton } from "../components";
import { useGlobalContext } from "../context/GlobalProvider";
import Loader from "../components/Loader";
import { useState } from "react";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
export default function App() {
  const { loading, isLogged, userType } = useGlobalContext();
  const { t, i18n } = useTranslation();
  // console.log(process.env.EXPO_FIREBASE_API_KEY);
  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language);
  };
  if (loading) {
    return <Loader isLoading={loading} />;
  }
  return (
    <SafeAreaView className="bg-primary h-full">
      <Animated.View
        entering={FadeIn.delay(200)}
        className="flex justify-center items-center  mt-3"
      >
        <Text className="text-4xl text-[#65B741] font-psemibold pt-2 ">
          {t("appName")}
        </Text>
      </Animated.View>
      <View className="bg-[#b2d6a3]" style={{ height: hp("40%") }}>
        <View className="flex flex-row justify-between items-center">
          <View className=" bg-white flex items-center justify-between w-[48%]">
            <Image
              source={{
                uri: "https://media.istockphoto.com/id/1316992167/photo/red-chili-peppers-in-vegetable-garden.jpg?s=612x612&w=0&k=20&c=9WxPxtBqBegiJtWZ6J-IRr-WqLs8qgS4G_JiSEQk-IQ=",
                // uri: icons.store,
              }}
              className="w-full h-full rounded-xl "
              resizeMode="contain"
            />
            <Text className="text-[#65B741]  font-psemibold ">
              JSK AgroTech
            </Text>
          </View>
          <View className=" bg-slate-300 flex items-center justify-between w-[48%]">
            <Image
              source={{
                uri: "https://media.istockphoto.com/id/1316992167/photo/red-chili-peppers-in-vegetable-garden.jpg?s=612x612&w=0&k=20&c=9WxPxtBqBegiJtWZ6J-IRr-WqLs8qgS4G_JiSEQk-IQ=",
                // uri: icons.store,
              }}
              className="w-full h-full rounded-xl "
              resizeMode="contain"
            />
            <Text className="text-[#65B741]  font-psemibold ">
              JSK AgroTech
            </Text>
          </View>
        </View>
      </View>
      <ScrollView
      // contentContainerStyle={{
      //   height: "100%",
      // }}
      >
        <Animated.View
          entering={FadeIn.delay(400)}
          className="w-full flex justify-center  items-start h-full px-4  "
        >
          <Animated.View className="relative mt-1 ">
            <Text className="text-4xl text-black font-psemibold text-left">
              Welcome to{"\n"}
              <Text className="text-[#65B741]  font-psemibold ">
                JSK AgroTech
              </Text>
              ,{"\n"}
              your agricultural hub.
              {/* {t("welcomeMessage")} */}
            </Text>
            <Text className="text-sm font-pbold  text-black-100 mt-7 text-left">
              {t("bringingFields")}
            </Text>
          </Animated.View>

          {!loading && isLogged && userType !== undefined && userType !== "" ? (
            userType === "farmer" ? (
              <>
                <CustomButton
                  // title={"Go to farmer section"}
                  title={t("goToFarmerSection")}
                  handlePress={() => router.push("/home")}
                  containerStyles="w-full mt-20"
                />
              </>
            ) : (
              <CustomButton
                title={t("goToBuyerSection")}
                handlePress={() => router.push("/bhome")}
                containerStyles="w-full mt-20"
              />
            )
          ) : (
            <>
              <CustomButton
                title={t("continueAsFarmer")}
                handlePress={() => router.push("/sign-in-f")}
                containerStyles="w-full mt-20"
              />
              <CustomButton
                title={t("continueAsBuyer")}
                handlePress={() => router.push("/sign-up-b")}
                containerStyles="w-full mt-10"
              />
            </>
          )}
        </Animated.View>
      </ScrollView>

      <View className="flex flex-row justify-center mt-4">
        <TouchableOpacity
          onPress={() => handleLanguageChange("en")}
          style={{ marginHorizontal: 10 }}
        >
          <Text>English</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleLanguageChange("hi")}
          style={{ marginHorizontal: 10 }}
        >
          <Text>हिन्दी</Text>
        </TouchableOpacity>
      </View>
      <StatusBar backgroundColor="#000" style="light" />
    </SafeAreaView>
  );
}
