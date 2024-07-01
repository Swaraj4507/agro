import React from "react";
import { View, Text, Image } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import StepIndicator from "react-native-step-indicator";
import { useTranslation } from "react-i18next";
const OrderStatusIndicator = ({ status }) => {
  const { t } = useTranslation();
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
      labels={stepLabels.map((label) => t(`${label}`))}
      stepCount={3}
    />
  );
};

const OrderCard = ({ item }) => {
  const { t } = useTranslation();
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
      <Text className="text-lg font-psemibold mb-2">{t(`${cropName}`)}</Text>
      <Text className="text-sm text-gray-600 mb-2 font-psemibold">
        {t("location_label")}: {deliveryLocation}
      </Text>
      <Text className="text-sm text-gray-600 mb-4 font-psemibold">
        {t("quantity")}: {quantity} {unit}
      </Text>
      <Text className="text-sm text-gray-600 mb-4 font-psemibold">
        {t("quoted_price")}: {quotedPrice} / {unit}
      </Text>
      <Text className="text-sm text-gray-600 mb-4 font-psemibold">
        {t("status_label")}: {t(`${status}`)}
        {/* {t("translations.status_label")}: {t(`translations.${status}`)} */}
      </Text>
      <OrderStatusIndicator status={status} />
    </Animated.View>
  );
};

export default OrderCard;
