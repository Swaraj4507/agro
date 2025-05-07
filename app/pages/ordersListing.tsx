import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import { useRouter } from "expo-router";

const MOCK_ORDERS = [
  {
    id: "bb5e04cf-a126-48d7-badd-5f3794b92e54",
    status: "CONFIRMED",
    createdAt: "2025-05-06T13:50:39.530435",
    expectedDeliveryDate: "2025-05-09T08:20:37.032",
    buyerMobileNumber: "9876543210",
    orderQuantity: 20,
    stockId: "4785ee17-0065-45fb-a2b1-b520a2ab515f",
    deliveryAddress: {
      addressLine: "Kameshwari Nagar",
      landmark: "Near Sai Baba Temple",
      city: "Narasannapeta",
      state: "Andhra Pradesh",
      pincode: "532421",
    },
    referenceId: "ORD-1008",
    buyerPrice: 700,
    cropImage:
      "https://firebasestorage.googleapis.com/v0/b/agrotech-93561.appspot.com/o/cropImages%2FBrinjal.jpg?alt=media&token=f4e1d54d-259c-45e0-98cb-afeb5db3d079",
  },
  {
    id: "241342c3-ed29-4103-94fe-b28340e616d1",
    status: "FULFILLED",
    createdAt: "2025-04-28T19:45:52.060386",
    expectedDeliveryDate: "2025-04-28T13:56:34.173",
    buyerMobileNumber: "9876543210",
    orderQuantity: 10,
    stockId: "c54bdbac-73bf-4ce6-83af-dae32de08b88",
    deliveryAddress: {
      addressLine: "Indra Nagar",
      landmark: "Near Temple",
      city: "Srikakulam",
      state: "Andhra Pradesh",
      pincode: "532421",
    },
    referenceId: "ORD-1001",
    buyerPrice: 1400,
    cropImage:
      "https://firebasestorage.googleapis.com/v0/b/agrotech-93561.appspot.com/o/cropImages%2FApple.jpg?alt=media&token=9540812e-3691-4410-a2e0-31b2e7f9c03b",
  },
  // ...add more mock orders as needed
];

const statusColors = {
  CONFIRMED: "bg-[#E8F5E9] text-[#388E3C]",
  FULFILLED: "bg-[#E3F2FD] text-[#1976D2]",
  CANCELLED: "bg-[#FFEBEE] text-[#D32F2F]",
  PENDING: "bg-[#FFF8E1] text-[#F9A825]",
};

const OrdersScreen = () => {
  const router = useRouter();
  const [orders] = useState(MOCK_ORDERS);

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-4 mx-4 shadow-sm"
      activeOpacity={0.9}
      onPress={() => router.push({ pathname: "/pages/order-details", params: { orderId: item.id } })}
    >
      <View className="flex-row items-center">
        <Image
          source={{ uri: item.cropImage }}
          className="w-16 h-16 rounded-lg"
          resizeMode="cover"
        />
        <View className="flex-1 ml-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-psemibold text-black text-base" numberOfLines={1}>
              {item.deliveryAddress.landmark}
            </Text>
            <View className={`px-2 py-0.5 rounded-xl ml-2 ${statusColors[item.status] || "bg-gray-100 text-gray-700"}`}>
              <Text className={`text-xs font-pmedium ${statusColors[item.status]?.split(" ")[1] || "text-gray-700"}`}>
                {item.status}
              </Text>
            </View>
          </View>
          <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>
            {item.deliveryAddress.addressLine}, {item.deliveryAddress.city}
          </Text>
          <View className="flex-row items-center mt-2">
            <Text className="text-sm font-pbold text-secondary">
              ₹{item.buyerPrice}
            </Text>
            <Text className="text-xs text-gray-500 ml-2">
              {item.orderQuantity} kg
            </Text>
            <Text className="text-xs text-gray-400 ml-2">
              Ref: {item.referenceId}
            </Text>
          </View>
        </View>
      </View>
      <View className="flex-row justify-between items-center mt-4">
        <View>
          <Text className="text-xs text-gray-400">Ordered On</Text>
          <Text className="text-sm font-pmedium text-gray-800 mt-0.5">
            {format(new Date(item.createdAt), "dd MMM yyyy, hh:mm a")}
          </Text>
        </View>
        <View>
          <Text className="text-xs text-gray-400">Delivery By</Text>
          <Text className="text-sm font-pmedium text-gray-800 mt-0.5">
            {format(new Date(item.expectedDeliveryDate), "dd MMM yyyy")}
          </Text>
        </View>
        <Feather name="chevron-right" size={22} color="#BDBDBD" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F7F9FC]" edges={["right", "left", "top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />
      <View className="flex-row items-center justify-between px-4 py-4 bg-[#F7F9FC]">
        <Text className="text-xl font-bold text-black">My Orders</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={26} color="#333" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center mt-32">
            <Feather name="package" size={60} color="#BDBDBD" />
            <Text className="text-lg font-psemibold text-gray-400 mt-4">
              No orders yet
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default OrdersScreen;