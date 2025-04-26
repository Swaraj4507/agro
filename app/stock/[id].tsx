// app/marketplace/[id].jsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  FlatList,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Feather,
  MaterialIcons,
  Ionicons,
  AntDesign,
} from "@expo/vector-icons";
import NumericInput from "react-native-numeric-input";
import { format } from "date-fns";

const { width } = Dimensions.get("window");

// Mock data with multiple images for each stock
const mockStocks = [
  {
    id: "1",
    cropName: "Organic Wheat",
    category: "Grains",
    description:
      "Premium quality organic wheat, harvested from sustainable farms. Grown without pesticides and chemical fertilizers, this wheat is perfect for making chapatis, bread, and other wheat-based products. Our farmers follow traditional farming methods to ensure the best quality.",
    pricePerKg: 45.5,
    finalPricePerKg: 40.0,
    availableQuantity: 500,
    city: "Bangalore",
    harvestedAt: new Date("2025-03-15"),
    expiryDate: new Date("2025-06-15"),
    createdAt: new Date("2025-03-20"),
    farmerId: "101",
    images: [
      "https://firebasestorage.googleapis.com/v0/b/agrotech-93561.appspot.com/o/photos%2FWnZ7W0P7nESe4YkHAycyuiKFzqt1%2F1720871934897?alt=media&token=24544c72-6f17-433f-86bc-fe7cefd24e80",
      "https://firebasestorage.googleapis.com/v0/b/agrotech-93561.appspot.com/o/photos%2FWnZ7W0P7nESe4YkHAycyuiKFzqt1%2F1720871934897?alt=media&token=24544c72-6f17-433f-86bc-fe7cefd24e80",
      "https://firebasestorage.googleapis.com/v0/b/agrotech-93561.appspot.com/o/photos%2FWnZ7W0P7nESe4YkHAycyuiKFzqt1%2F1720871934897?alt=media&token=24544c72-6f17-433f-86bc-fe7cefd24e80",
    ],
    videoUrl: "https://via.placeholder.com/500/65B741/FFFFFF?text=Video",
  },
  {
    id: "2",
    cropName: "Fresh Tomatoes",
    category: "Vegetables",
    description:
      "Juicy red tomatoes, perfect for salads and cooking. These tomatoes are grown in our farms using organic methods. They are harvested at the peak of ripeness to ensure the best flavor and nutritional value.",
    pricePerKg: 30.0,
    finalPricePerKg: 25.0,
    availableQuantity: 200,
    city: "Mumbai",
    harvestedAt: new Date("2025-04-10"),
    expiryDate: new Date("2025-04-25"),
    createdAt: new Date("2025-04-12"),
    farmerId: "102",
    images: [
      "https://via.placeholder.com/500/FF8E01/FFFFFF?text=Tomatoes+1",
      "https://via.placeholder.com/500/FF8E01/FFFFFF?text=Tomatoes+2",
      "https://via.placeholder.com/500/FF8E01/FFFFFF?text=Tomatoes+3",
    ],
    videoUrl: "https://via.placeholder.com/500/FF8E01/FFFFFF?text=Video",
  },
  // Other stock items...
];

// Mock user addresses
const mockAddresses = [
  {
    id: "1",
    name: "Home",
    addressLine1: "123 Green Valley",
    addressLine2: "Koramangala",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560034",
    isDefault: true,
  },
  {
    id: "2",
    name: "Office",
    addressLine1: "Tech Park, Building B",
    addressLine2: "Whitefield",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560066",
    isDefault: false,
  },
  {
    id: "3",
    name: "Parents Home",
    addressLine1: "45 Sunshine Colony",
    addressLine2: "Jayanagar",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560041",
    isDefault: false,
  },
];

export default function StockDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const scrollViewRef = useRef(null);

  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(
    mockAddresses.find((addr) => addr.isDefault) || mockAddresses[0]
  );

  useEffect(() => {
    // Simulate API call to fetch stock details
    setTimeout(() => {
      const foundStock = mockStocks.find((item) => item.id === id);
      setStock(foundStock);
      setLoading(false);
    }, 800);
  }, [id]);

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      Alert.alert(
        "Address Required",
        "Please select a delivery address first."
      );
      return;
    }

    Alert.alert(
      "Confirm Order",
      `Are you sure you want to place an order for ${quantity} kg of ${stock.cropName}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => {
            Alert.alert("Success", "Your order has been placed successfully!");
            router.back();
          },
        },
      ]
    );
  };

  const handleNegotiate = () => {
    Alert.alert(
      "Start Negotiation",
      `You are about to start price negotiation for ${stock.cropName}.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Start Negotiation",
          onPress: () => {
            Alert.alert(
              "Negotiation Started",
              "You can now chat with the farmer to negotiate the price."
            );
          },
        },
      ]
    );
  };

  const renderImageItem = ({ item, index }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => setActiveImageIndex(index)}
      style={{ width: width }}
    >
      <Image
        source={{ uri: item }}
        className="h-full w-full"
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const renderAddressItem = ({ item }) => (
    <TouchableOpacity
      className={`p-4 border mb-2 rounded-xl ${
        selectedAddress?.id === item.id ? "border-secondary" : "border-gray-100"
      }`}
      onPress={() => {
        setSelectedAddress(item);
        setShowAddressModal(false);
      }}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-row items-center">
          <Text className="font-psemibold text-black mr-2">{item.name}</Text>
          {item.isDefault && (
            <View className="bg-secondary rounded-full px-2 py-1">
              <Text className="text-white text-xs font-pmedium">Default</Text>
            </View>
          )}
        </View>
        <View
          className={`h-5 w-5 rounded-full border-2 items-center justify-center ${
            selectedAddress?.id === item.id
              ? "border-secondary"
              : "border-gray-100"
          }`}
        >
          {selectedAddress?.id === item.id && (
            <View className="h-2 w-2 rounded-full bg-secondary" />
          )}
        </View>
      </View>
      <Text className="font-pregular text-black-100 mt-1">
        {item.addressLine1}
      </Text>
      <Text className="font-pregular text-black-100">{item.addressLine2}</Text>
      <Text className="font-pregular text-black-100">
        {item.city}, {item.state}, {item.pincode}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#65B741" />
          <Text className="mt-2 font-pmedium text-secondary">
            Loading product details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!stock) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <View className="flex-1 justify-center items-center p-4">
          <Feather name="alert-circle" size={60} color="#FF8E01" />
          <Text className="mt-4 font-pmedium text-black-100 text-lg">
            Product not found
          </Text>
          <Text className="mt-1 font-pregular text-gray-100 text-center">
            The product you're looking for doesn't exist or has been removed.
          </Text>
          <TouchableOpacity
            className="mt-6 bg-secondary py-3 px-6 rounded-lg"
            onPress={() => router.back()}
          >
            <Text className="font-psemibold text-white">
              Back to Marketplace
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const totalPrice = (stock.finalPricePerKg * quantity).toFixed(2);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <SafeAreaView className="flex-1 bg-primary">
        {/* Back Button */}
        <View className="absolute top-2 left-2 z-10">
          <TouchableOpacity
            className="bg-white w-10 h-10 rounded-full items-center justify-center shadow-md"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#65B741" />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          showsVerticalScrollIndicator={false}
        >
          {/* Image Gallery */}
          <View className="relative">
            <View className="h-72 w-full">
              <FlatList
                data={[...stock.images, stock.videoUrl]}
                renderItem={renderImageItem}
                keyExtractor={(_, index) => `image-${index}`}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const newIndex = Math.round(
                    e.nativeEvent.contentOffset.x / width
                  );
                  setActiveImageIndex(newIndex);
                }}
              />
            </View>

            {/* Image Indicators */}
            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
              {[...stock.images, stock.videoUrl].map((_, index) => (
                <View
                  key={index}
                  className={`h-2 w-2 rounded-full mx-1 ${
                    activeImageIndex === index
                      ? "bg-secondary"
                      : "bg-white opacity-60"
                  }`}
                />
              ))}
            </View>

            {/* Badge for Video */}
            {activeImageIndex === stock.images.length && (
              <View className="absolute top-4 right-4 bg-black bg-opacity-70 rounded-lg py-1 px-2 flex-row items-center">
                <Feather name="video" size={14} color="#fff" />
                <Text className="text-white font-pmedium text-xs ml-1">
                  Video
                </Text>
              </View>
            )}
          </View>

          {/* Product Details */}
          <View className="bg-white -mt-6 rounded-t-3xl p-6">
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="text-2xl font-pbold text-black">
                  {stock.cropName}
                </Text>
                <View className="flex-row items-center mt-1">
                  <MaterialIcons name="location-on" size={16} color="#65B741" />
                  <Text className="text-sm font-pregular text-gray-100 ml-1">
                    {stock.city}
                  </Text>
                </View>
              </View>
              <View className="bg-secondary py-1 px-3 rounded-full">
                <Text className="text-white font-pmedium">
                  {stock.category}
                </Text>
              </View>
            </View>

            {/* Price */}
            <View className="flex-row items-end mt-5 bg-secondary bg-opacity-10 p-4 rounded-xl">
              <Text className="text-2xl font-pbold text-black">
                ₹{stock.finalPricePerKg}
              </Text>
              <Text className="text-base font-pregular text-black ml-1">
                /kg
              </Text>
              <TouchableOpacity
                className="ml-auto bg-secondary rounded-lg py-2 px-4"
                onPress={handleNegotiate}
              >
                <Text className="text-white font-pmedium">Negotiate Price</Text>
              </TouchableOpacity>
            </View>

            {/* Important Dates with Improved Styling */}
            <View className="mt-6 flex-row justify-between border-b border-gray-100 pb-4">
              <View className="items-start">
                <Text className="font-plight text-gray-100">Harvested On</Text>
                <Text className="font-pmedium text-black text-base mt-1">
                  {format(new Date(stock.harvestedAt), "dd MMM yyyy")}
                </Text>
              </View>

              <View className="items-start">
                <Text className="font-plight text-gray-100">
                  Available Until
                </Text>
                <Text className="font-pmedium text-black text-base mt-1">
                  {format(new Date(stock.expiryDate), "dd MMM yyyy")}
                </Text>
              </View>

              <View className="items-start">
                <Text className="font-plight text-gray-100">Available Qty</Text>
                <Text className="font-pmedium text-black text-base mt-1">
                  {stock.availableQuantity} kg
                </Text>
              </View>
            </View>

            {/* Product Description */}
            <View className="mt-4">
              <Text className="text-lg font-psemibold text-black">
                About this Product
              </Text>
              <Text className="mt-2 font-pregular text-black-100 leading-5">
                {stock.description}
              </Text>
            </View>

            {/* Delivery Address */}
            <View className="mt-6">
              <Text className="text-lg font-psemibold text-black mb-2">
                Delivery Address
              </Text>

              {selectedAddress ? (
                <TouchableOpacity
                  className="border border-gray-100 rounded-xl p-4"
                  onPress={() => setShowAddressModal(true)}
                >
                  <View className="flex-row justify-between">
                    <Text className="font-psemibold text-black">
                      {selectedAddress.name}
                    </Text>
                    <Text className="text-secondary font-pmedium">Change</Text>
                  </View>
                  <Text className="font-pregular text-black-100 mt-1">
                    {selectedAddress.addressLine1}
                  </Text>
                  <Text className="font-pregular text-black-100">
                    {selectedAddress.addressLine2}
                  </Text>
                  <Text className="font-pregular text-black-100">
                    {selectedAddress.city}, {selectedAddress.state},{" "}
                    {selectedAddress.pincode}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="border border-dashed border-gray-100 rounded-xl p-4 items-center justify-center py-6"
                  onPress={() => setShowAddressModal(true)}
                >
                  <Feather name="plus" size={24} color="#65B741" />
                  <Text className="text-secondary font-pmedium mt-2">
                    Select Delivery Address
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Quantity Selection */}
            <View className="mt-6">
              <Text className="text-lg font-psemibold text-black mb-2">
                Order Quantity
              </Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center space-x-2">
                  <TouchableOpacity
                    className="bg-secondary rounded-lg px-4 py-2"
                    onPress={() => setQuantity((prev) => Math.max(1, prev - 5))}
                  >
                    <Text className="text-white font-pbold text-lg">-5</Text>
                  </TouchableOpacity>
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: "#CDCDE0",
                      borderRadius: 8,
                      width: 80,
                      height: 45,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#fff",
                    }}
                  >
                    <TextInput
                      value={quantity.toString()}
                      onChangeText={(text) => {
                        let val = parseInt(text.replace(/[^0-9]/g, ""), 10);
                        if (isNaN(val)) val = 1;
                        if (val < 1) val = 1;
                        if (val > stock.availableQuantity)
                          val = stock.availableQuantity;
                        setQuantity(val);
                      }}
                      keyboardType="numeric"
                      style={{
                        fontSize: 18,
                        textAlign: "center",
                        color: "#000",
                        width: "100%",
                      }}
                      maxLength={5}
                    />
                  </View>
                  <TouchableOpacity
                    className="bg-secondary rounded-lg px-4 py-2"
                    onPress={() =>
                      setQuantity((prev) =>
                        Math.min(stock.availableQuantity, prev + 10)
                      )
                    }
                  >
                    <Text className="text-white font-pbold text-lg">+10</Text>
                  </TouchableOpacity>
                </View>
                <Text className="font-psemibold text-black">
                  Total: ₹{totalPrice}
                </Text>
              </View>
            </View>

            {/* Address Modal */}
            {showAddressModal && (
              <View className="absolute top-0 left-0 right-0 bottom-0 bg-white pt-4 z-20">
                <View className="flex-row justify-between items-center border-b border-gray-100 pb-4 px-4">
                  <Text className="text-xl font-pbold text-black">
                    Select Address
                  </Text>
                  <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                    <AntDesign name="close" size={24} color="#000" />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={mockAddresses}
                  renderItem={renderAddressItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ padding: 16 }}
                />
              </View>
            )}

            {/* Space at the bottom for fixed button */}
            <View className="h-24" />
          </View>
        </ScrollView>

        {/* Place Order Button */}
        <View className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100 shadow-sm">
          <TouchableOpacity
            className="bg-secondary rounded-xl py-4 items-center"
            onPress={handlePlaceOrder}
          >
            <Text className="font-pbold text-white text-lg">
              Place Order • ₹{totalPrice}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
