import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
// import { SharedElement } from "react-native-shared-element";
const BStockCard = ({ item, onRequestPress }) => {
  const {
    cropName,
    locationString,
    price,
    photoURL,
    unit,
    isVerified,
    match,
    quantity,
    availableQuantity,
  } = item;

  const handleRequestPress = () => {
    router.push({
      pathname: "/pages/requestStock",
      params: {
        photoURL: encodeURI(item.photoURL),
        item: JSON.stringify(item),
      },
    });
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(500).springify().damping()}
      className={`shadow-md rounded-lg p-4 mb-4 ml-2 mr-2 ${
        match ? "bg-white" : "bg-white"
      } border border-secondary`}
    >
      {/* <SharedElement id={photoURL}> */}
      <Image
        source={{ uri: photoURL }}
        className="w-full h-40 rounded-lg mb-4"
        resizeMode="cover"
      />
      {/* </SharedElement> */}
      <Text className="text-lg font-psemibold mb-2">{cropName}</Text>
      <Text className="text-sm text-gray-600 mb-2 font-pmedium">
        Location: {locationString}
      </Text>
      <Text className="text-sm text-gray-600 mb-4 font-pmedium">
        Quantity: {availableQuantity} {unit}
      </Text>
      <Text className="text-sm text-gray-600 mb-4 font-pmedium">
        Price: {price}/ {unit}
      </Text>

      {availableQuantity === 0 && (
        <Text className="text-sm text-red-700 mb-4 font-pmedium">Sold Out</Text>
      )}

      <View className="flex flex-row">
        {/* <TouchableOpacity
          className="bg-[#65B741] py-2 px-4 rounded-md"
          onPress={() => console.log("Explore button pressed")}
        >
          <Text className="text-white font-semibold">Explore</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          className={`py-2 px-4 rounded-md  ${
            availableQuantity === 0 ? "bg-gray-400" : "bg-[#65B741]"
          }`}
          onPress={handleRequestPress}
          disabled={availableQuantity === 0}
        >
          <Text className="text-white font-psemibold">Request</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default BStockCard;