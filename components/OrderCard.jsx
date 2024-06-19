import React from "react";
import { View, Text, Image } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import StepIndicator from "react-native-step-indicator";

const OrderStatusIndicator = ({ status }) => {
  const stepLabels = ["requested", "confirmed", "delivered"];
  const stepIndex = stepLabels.indexOf(status);

  const customStyles = {
    stepIndicatorSize: 20,
    currentStepIndicatorSize: 25,
    separatorStrokeWidth: 2,
    currentStepStrokeWidth: 3,
    stepStrokeCurrentColor: "#4aae4f",
    stepStrokeWidth: 3,
    stepStrokeFinishedColor: "#4aae4f",
    stepStrokeUnFinishedColor: "#aaaaaa",
    separatorFinishedColor: "#4aae4f",
    separatorUnFinishedColor: "#aaaaaa",
    stepIndicatorFinishedColor: "#4aae4f",
    stepIndicatorUnFinishedColor: "#ffffff",
    stepIndicatorCurrentColor: "#4aae4f",
    stepIndicatorLabelFontSize: 13,
    currentStepIndicatorLabelFontSize: 13,
    stepIndicatorLabelCurrentColor: "#ffff",
    stepIndicatorLabelFinishedColor: "#ffffff",
    stepIndicatorLabelUnFinishedColor: "#aaaaaa",
    labelColor: "#999999",
    labelSize: 13,
    currentStepLabelColor: "#4aae4f",
  };

  return (
    <StepIndicator
      customStyles={customStyles}
      currentPosition={stepIndex}
      labels={stepLabels}
      stepCount={3}
    />
  );
};

const OrderCard = ({ item }) => {
  const {
    cropName,
    deliveryLocation,
    quotedPrice,
    quantity,
    unit,
    status,
    photoURL,
  } = item;

  return (
    <Animated.View
      entering={FadeInDown.duration(500).springify().damping()}
      className="shadow-md rounded-lg p-4 mb-4 ml-2 mr-2 bg-white border border-secondary"
    >
      <Image
        source={{ uri: photoURL }}
        className="w-full h-40 rounded-lg mb-4"
        resizeMode="cover"
      />
      <Text className="text-lg font-psemibold mb-2">{cropName}</Text>
      <Text className="text-sm text-gray-600 mb-2 font-psemibold">
        Location: {deliveryLocation}
      </Text>
      <Text className="text-sm text-gray-600 mb-4 font-psemibold">
        Quantity: {quantity} {unit}
      </Text>
      <Text className="text-sm text-gray-600 mb-4 font-psemibold">
        Quoted Price: {quotedPrice} / {unit}
      </Text>
      <Text className="text-sm text-gray-600 mb-4 font-psemibold">
        Status: {status}
      </Text>
      <OrderStatusIndicator status={status} />
    </Animated.View>
  );
};

export default OrderCard;
