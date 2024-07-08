// components/OnboardingScreen.js
import React from "react";
import { Image } from "react-native";
import Onboarding from "react-native-onboarding-swiper";
import { router } from "expo-router";
import { View } from "react-native-animatable";
import LottieView from "lottie-react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
const OnboardingScreen = ({ navigation }) => {
  return (
    <Onboarding
      onDone={() => router.replace("/")}
      containerStyles={{ paddingHorizontal: hp("5%") }}
      pages={[
        {
          backgroundColor: "#CDCDE0",
          image: (
            <LottieView
              source={require("../assets/Butterfly.json")}
              autoPlay
              loop
              style={{ height: wp("60%"), width: wp("60%") }}
            />
          ),
          title: "Welcome to Agro Tech",
          subtitle: "Connecting farmers and buyers seamlessly.",
        },
        {
          backgroundColor: "#D6EFD8",
          image: (
            <LottieView
              source={require("../assets/StockSub.json")}
              autoPlay
              loop
              style={{ height: wp("60%"), width: wp("60%") }}
            />
          ),
          title: "Submit Your Stock",
          subtitle:
            "Farmers can submit their stock details and quote their prices.",
        },
        {
          backgroundColor: "#65B741",
          image: (
            <LottieView
              source={require("../assets/Done.json")}
              autoPlay
              loop
              style={{ height: wp("60%"), width: wp("60%") }}
            />
          ),
          title: "Quality Check",
          subtitle: "We verify the stock quality and finalize the price.",
        },
        {
          backgroundColor: "#50B498",
          image: (
            <LottieView
              source={require("../assets/HShake.json")}
              autoPlay
              loop
              style={{ height: wp("60%"), width: wp("60%") }}
            />
          ),
          title: "Make the Deal",
          subtitle: "Buyers can view verified stocks and make deals with us.",
        },
        {
          backgroundColor: "#468585", // Different background color for variety
          image: (
            <LottieView
              source={require("../assets/deli.json")}
              autoPlay
              loop
              style={{ height: wp("60%"), width: wp("60%") }}
            />
          ),
          title: "Acting as Suppliers",
          subtitle:
            "We act as trusted suppliers, ensuring quality and reliability.",
        },
      ]}
    />
  );
};

export default OnboardingScreen;
