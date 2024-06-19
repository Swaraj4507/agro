import React from "react";
import { View, Text, Image, TouchableOpacity, Pressable } from "react-native";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScrollView } from "react-native";
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
  } = item;

  const handleEditPress = () => {
    router.push({
      pathname: "/pages/editstock",

      params: {
        photoURL: encodeURI(item.photoURL),
        item: JSON.stringify(item),
      },
    });
  };
  const confirmedRequests = buyerRequests?.filter(
    (request) =>
      request.requestStatus === "confirmed" ||
      request.requestStatus === "delivered"
  );
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
      <Text className="text-lg font-psemibold mb-2">{cropName}</Text>
      <Text className="text-sm text-gray-600 mb-2 font-pmedium">
        Location: {locationString}
      </Text>
      <Text className="text-sm text-gray-600 mb-4 font-pmedium">
        Quantity: {quantity} {unit}
      </Text>
      <Text className="text-sm text-gray-600 mb-4 font-pmedium">
        Available Quantity: {availableQuantity} {unit}
      </Text>
      {isVerified && confirmedRequests && confirmedRequests.length > 0 ? (
        <View>
          <Text className="text-sm text-blue-700 mb-2 font-pmedium">
            A match has been found for your stock! Our team will contact you
            shortly.
          </Text>
          {confirmedRequests.map((request, index) => (
            <View
              key={index}
              className="p-3 mb-2 border border-secondary  rounded bg-white/80 bg-secondary "
            >
              <Text className="font-pmedium">Order :{index + 1}</Text>
              <Text className="font-pmedium">
                Requested Quantity: {request.quantity}
              </Text>
              <Text className="font-pmedium">
                Status: {request.requestStatus}
              </Text>
            </View>
          ))}
        </View>
      ) : isVerified ? (
        <Text className="text-sm text-green-700 mb-2 font-pmedium">
          Your stock is verified. Our team will contact you once a buyer comes.
        </Text>
      ) : (
        <Text className="text-sm text-red-700 mb-2 font-pmedium">
          Your stock is not verified yet
        </Text>
      )}

      <View className="flex flex-row">
        {!isVerified && (
          <TouchableOpacity
            className="bg-secondary py-2 px-4 rounded-md"
            onPress={handleEditPress}
          >
            <Text className="text-white font-psemibold">Edit</Text>
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
          onPress={() => console.log("Explore button pressed")}
        >
          <Text className="text-white font-psemibold">Explore</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default StockCard;
