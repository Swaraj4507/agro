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
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Feather,
  MaterialIcons,
  Ionicons,
  AntDesign,
} from "@expo/vector-icons";
import { format } from "date-fns";
import { fetchStockDetails } from "../../api/marketplace";
import { useAddressStore } from "../../stores/addressStore";
import { useAuthStore } from "../../stores/authStore";

export default function StockDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const scrollViewRef = useRef(null);
  const { addresses, fetchAddresses } = useAddressStore();
  const { user } = useAuthStore();
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [error, setError] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);
  
  // Use window dimensions for responsive layout
  const { width, height } = useWindowDimensions();
  const imageHeight = height * 0.4; // 40% of screen height for images
  
  useEffect(() => {
    const loadStockDetails = async () => {
      try {
        setLoading(true);
        const response = await fetchStockDetails(id);
        console.log("Stock details response:", response.data);
        setStock(response.data);
      } catch (err) {
        setError("Failed to load stock details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadStockDetails();
  }, [id]);
  
  useEffect(() => {
    if (!addresses) {
      setAddressLoading(true);
      fetchAddresses(user.id)
        .catch((err) => {
          setError("Failed to load addresses");
          console.error(err);
        })
        .finally(() => setAddressLoading(false));
    }
  }, [addresses, fetchAddresses]);
  
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddress) {
      setSelectedAddress(addresses[0]);
    }
  }, [addresses]);
  
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

  const renderImageItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => setActiveImageIndex(index)}
      style={{ width }}
    >
      <Image
        source={{ uri: item }}
        style={{ height: imageHeight, width }}
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
          <Text className="font-psemibold text-black mr-2">
            {item.landmark}
          </Text>
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
      <Text className="font-pregular text-black-100">{item.addressLine}</Text>
      <Text className="font-pregular text-black-100">
        {item.city}, {item.state}, {item.pincode}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }} edges={['right', 'left']}>
        <StatusBar barStyle="dark-content" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#65B741" />
          <Text className="mt-2 font-pmedium text-secondary">
            Loading product details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !stock) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }} edges={['right', 'left']}>
        <StatusBar barStyle="dark-content" />
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
  const images =
    stock.images && Array.isArray(stock.images)
      ? stock.images
      : stock.stockImage
      ? [stock.stockImage]
      : [];

  const hasVideo = !!stock.videoUrl;
  const imageIndicators = hasVideo ? [...images, stock.videoUrl] : images;
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      {/* Use edges prop to control which edges get safe area insets */}
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }} edges={['right', 'left']}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        
        {/* Back Button - Absolute positioned over the image */}
        <View className="absolute top-12 left-4 z-10">
          <TouchableOpacity
            className="bg-black bg-opacity-30 w-10 h-10 rounded-full items-center justify-center"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          bounces={false}
          style={{ flex: 1 }}
        >
          {/* Image Gallery */}
          <View style={{ height: imageHeight }}>
            <FlatList
              data={images}
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

            {/* Semi-transparent gradient overlay at the top for status bar */}
            <View 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 60,
                backgroundColor: 'rgba(0,0,0,0.3)',
                zIndex: 5,
              }}
            />

            {/* Image Indicators */}
            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
              {imageIndicators.map((_, index) => (
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
            {activeImageIndex === stock.images?.length && (
              <View className="absolute top-16 right-4 bg-black bg-opacity-70 rounded-lg py-1 px-2 flex-row items-center">
                <Feather name="video" size={14} color="#fff" />
                <Text className="text-white font-pmedium text-xs ml-1">
                  Video
                </Text>
              </View>
            )}
          </View>

          {/* Product Details - with enhanced styling and responsiveness */}
          <View className="bg-white -mt-6 rounded-t-3xl px-4 py-6">
            <View className="flex-row justify-between items-start">
              <View className="flex-1 mr-2">
                <Text style={{ fontSize: Math.min(width * 0.06, 24) }} className="font-pbold text-black">
                  {stock.cropName}
                </Text>
                <View className="flex-row items-center mt-1">
                  <MaterialIcons name="location-on" size={16} color="#65B741" />
                  <Text className="text-sm font-pregular text-black ml-1">
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

            {/* Price - With improved layout */}
            <View className="mt-5 bg-secondary bg-opacity-10 p-4 rounded-xl">
              <View className="flex-row justify-between items-center flex-wrap">
                <View className="flex-row items-baseline">
                  <Text style={{ fontSize: Math.min(width * 0.06, 24) }} className="font-pbold text-black">
                    ₹{stock.finalPricePerKg}
                  </Text>
                  <Text className="text-base font-pregular text-black ml-1">
                    /kg
                  </Text>
                </View>
                <TouchableOpacity
                  className="bg-secondary rounded-lg py-2 px-4 mt-2"
                  onPress={handleNegotiate}
                >
                  <Text className="text-white font-pmedium">Negotiate Price</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Important Dates with responsive grid layout */}
            <View className="mt-6 border-b border-gray-100 pb-4">
              <View style={{ 
                flexDirection: width > 380 ? 'row' : 'column',
                justifyContent: 'space-between'
              }}>
                <View className={`items-start ${width <= 380 ? 'mb-4' : ''}`}>
                  <Text className="font-plight text-secondary-200">
                    Harvested On
                  </Text>
                  <Text className="font-pmedium text-black text-base mt-1">
                    {format(new Date(stock.harvestedAt), "dd MMM yyyy")}
                  </Text>
                </View>

                <View className={`items-start ${width <= 380 ? 'mb-4' : ''}`}>
                  <Text className="font-plight text-secondary-200">
                    Available Until
                  </Text>
                  <Text className="font-pmedium text-black text-base mt-1">
                    {format(new Date(stock.expiryDate), "dd MMM yyyy")}
                  </Text>
                </View>

                <View className="items-start">
                  <Text className="font-plight text-secondary-200">
                    Available Qty
                  </Text>
                  <Text className="font-pmedium text-black text-base mt-1">
                    {stock.availableQuantity} kg
                  </Text>
                </View>
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
                      {selectedAddress.landmark}
                    </Text>
                    <Text className="text-secondary font-pmedium">Change</Text>
                  </View>
                  <Text className="font-pregular text-black-100">
                    {selectedAddress.addressLine}
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

            {/* Quantity Selection - Improved for better touch targets */}
            <View className="mt-6">
              <Text className="text-lg font-psemibold text-black mb-2">
                Order Quantity
              </Text>
              <View style={{ 
                flexDirection: width > 380 ? 'row' : 'column',
                alignItems: width > 380 ? 'center' : 'stretch',
                justifyContent: 'space-between'
              }}>
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
                <Text className={`font-psemibold text-black ${width <= 380 ? 'mt-4' : ''}`}>
                  Total: ₹{totalPrice}
                </Text>
              </View>
            </View>

            {/* Address Modal */}
            {showAddressModal && (
              <ScrollView 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: '#FFFFFF',
                  paddingTop: 16,
                  zIndex: 20,
                }}
              >
                <View className="flex-row justify-between items-center border-b border-gray-100 pb-4 px-4">
                  <Text className="text-xl font-pbold text-black">
                    Select Address
                  </Text>
                  <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                    <AntDesign name="close" size={24} color="#000" />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={addresses || []}
                  renderItem={renderAddressItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ padding: 16 }}
                />
              </ScrollView>
            )}

            {/* Space at the bottom for fixed button */}
            <View style={{ height: 100 }} />
          </View>
        </ScrollView>

        {/* Place Order Button - Fixed at bottom with shadow */}
        <View 
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#FFFFFF',
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: '#F5F5F5',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.1,
            shadowRadius: 5,
            elevation: 10,
          }}
        >
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