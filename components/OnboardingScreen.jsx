// components/OnboardingScreen.js
import React from "react";
import { Image } from "react-native";
import Onboarding from "react-native-onboarding-swiper";
import { router } from "expo-router";
import { View } from "react-native-animatable";
import LottieView from "lottie-react-native";
const OnboardingScreen = ({ navigation }) => {
  return (
    <Onboarding
      onDone={() => router.replace("/")}
      pages={[
        {
          backgroundColor: "#CDCDE0",
          image: (
            <LottieView
              source={require("../assets/Butterfly.json")}
              autoPlay
              loop
              style={{ height: 300, width: 300 }}
            />
          ),
          title: "Welcome to Agro Tech",
          subtitle: "Connecting farmers and buyers seamlessly.",
        },
        {
          backgroundColor: "#FF8E01",
          image: (
            <LottieView
              source={require("../assets/StockSubmit.json")}
              autoPlay
              loop
              style={{ height: 300, width: 300 }}
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
              style={{ height: 300, width: 300 }}
            />
          ),
          title: "Quality Check",
          subtitle: "We verify the stock quality and finalize the price.",
        },
        {
          backgroundColor: "#D7E4C0",
          image: (
            <LottieView
              source={require("../assets/HShake.json")}
              autoPlay
              loop
              style={{ height: 300, width: 300 }}
            />
          ),
          title: "Make the Deal",
          subtitle: "Buyers can view verified stocks and make deals with us.",
        },
        {
          backgroundColor: "#D8EFD3", // Different background color for variety
          image: (
            <LottieView
              source={require("../assets/Delivery.json")}
              autoPlay
              loop
              style={{ height: 300, width: 300 }}
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
