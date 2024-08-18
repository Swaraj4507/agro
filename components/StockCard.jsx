import React from "react";
import { View, Text, TouchableOpacity, Pressable } from "react-native";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
const StockCard = ({ item }) => {
  const {
    cropName,
    locationString,
    photoURL,
    unit,
    isVerified,
    buyerRequests,
    quantity,
    availableQuantity,
    amount,
    id,
  } = item;
  const { t } = useTranslation();
  const handleEditPress = () => {
    router.push({
      pathname: "/pages/editstock",

      params: {
        photoURL: encodeURI(item.photoURL),
        item: JSON.stringify(item),
      },
    });
  };
  const limitedRequests = buyerRequests ? buyerRequests.slice(-3) : [];
  const confirmedRequests = limitedRequests.filter(
    (request) =>
      request.requestStatus === "confirmed" ||
      request.requestStatus === "delivered"
  );
  // const confirmedRequests = buyerRequests?.filter(
  //   (request) =>
  //     request.requestStatus === "confirmed" ||
  //     request.requestStatus === "delivered"
  // );
  const handleExplore = () => {
    router.push({
      pathname: "/pages/viewStockPage",
      params: {
        stockId: id,
      },
    });
  };
  return (
    <Animated.View
      entering={FadeInDown}
      className={`shadow-md rounded-lg p-4 mb-10 ml-2 mr-2  border border-secondary ${
        isVerified ? "bg-white" : "bg-white"
      }`}
    >
      <Image
        source={{ uri: photoURL }}
        className="w-full h-40 rounded-lg mb-4"
        resizeMode="cover"
      />
      <Text className="text-lg font-psemibold mb-2">{t(`${cropName}`)}</Text>
      <Text className="text-sm text-gray-600 mb-2 font-pmedium">
        {t("location_label")}: {locationString}
      </Text>
      <Text className="text-sm text-gray-600 mb-2 font-pmedium">
        {t("price")}: {amount} / {t(`${unit}`)}
      </Text>
      <Text className="text-sm text-gray-600 mb-2 font-pmedium">
        {t("quantity_label")}: {quantity} {t(`${unit}`)}
      </Text>
      <Text className="text-sm text-gray-600 mb-2 font-pmedium">
        {t("assignedQuantity")}: {quantity - availableQuantity} {unit}
      </Text>
      <Text className="text-sm text-gray-600 mb-2 font-pmedium">
        {t("available_quantity_label")}: {availableQuantity} {t(`${unit}`)}
      </Text>
      {isVerified && confirmedRequests && confirmedRequests.length > 0 ? (
        <View>
          <Text className="text-sm text-blue-700 mb-2 font-pmedium">
            {t("match_found_message")}
          </Text>
          {confirmedRequests.map((request, index) => (
            <View
              key={index}
              className="p-3 mb-2 border border-secondary  rounded bg-white/80 bg-secondary "
            >
              <Text className="font-pmedium">
                {t("order_label")} :{index + 1}
              </Text>
              <Text className="font-pmedium">
                {t("requested_quantity_label")}: {request.quantity}{" "}
                {t(`${request.unit}`)}
              </Text>
              <Text className="font-pmedium">
                {t("status_label")}: {t(`${request.requestStatus}`)}
              </Text>
              <Text className="font-pmedium">
                {t("bill_amount")}: {amount * request.quantity} /-
              </Text>
            </View>
          ))}
        </View>
      ) : isVerified ? (
        <Text className="text-sm text-green-700 mb-2 font-pmedium">
          {t("verified_message")}
        </Text>
      ) : (
        <Text className="text-sm text-red-700 mb-2 font-pmedium">
          {t("not_verified_message")}
        </Text>
      )}

      <View className="flex flex-row">
        {!isVerified && (
          <TouchableOpacity
            className="bg-secondary py-2 px-4 rounded-md"
            onPress={handleEditPress}
          >
            <Text className="text-white font-psemibold">
              {t("edit_button_label")}
            </Text>
          </TouchableOpacity>
        )}
        {/* {isVerified && (
          <Text className="text-sm text-gray-600 mb-2 font-pmedium">
            Editing is disabled for verified stock.
          </Text>
        )} */}
        <TouchableOpacity
          className={`bg-secondary py-2 px-4 rounded-md  ${
            isVerified ? "" : "ml-4"
          } `}
          onPress={handleExplore}
        >
          <Text className="text-white font-psemibold">
            {t("explore_button_label")}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default StockCard;
