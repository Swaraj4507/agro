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
  FlatList,
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
import { Loader } from "../../components";

export default function StockDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const scrollViewRef = useRef(null);
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [error, setError] = useState(null);

  const { width, height } = useWindowDimensions();
  const imageHeight = height * 0.4;

  useEffect(() => {
    const loadStockDetails = async () => {
      try {
        setLoading(true);
        const response = await fetchStockDetails(id);
        setStock(response.data);
      } catch (err) {
        setError("Failed to load stock details");
      } finally {
        setLoading(false);
      }
    };
    loadStockDetails();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }} edges={['right', 'left']}>
        <Loader isLoading={loading} content="Loading Product !!!"/>
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
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }} edges={['right', 'left']}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
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
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={{ height: imageHeight, width }}
                  resizeMode="cover"
                />
              )}
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
            {activeImageIndex === stock.images?.length && (
              <View className="absolute top-16 right-4 bg-black bg-opacity-70 rounded-lg py-1 px-2 flex-row items-center">
                <Feather name="video" size={14} color="#fff" />
                <Text className="text-white font-pmedium text-xs ml-1">
                  Video
                </Text>
              </View>
            )}
          </View>
          {/* Product Details */}
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
                  onPress={() => Alert.alert("Negotiation", "Negotiation feature coming soon!")}
                >
                  <Text className="text-white font-pmedium">Negotiate Price</Text>
                </TouchableOpacity>
              </View>
            </View>
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
            <View className="mt-4">
              <Text className="text-lg font-psemibold text-black">
                About this Product
              </Text>
              <Text className="mt-2 font-pregular text-black-100 leading-5">
                {stock.description}
              </Text>
            </View>
            <View style={{ height: 100 }} />
          </View>
        </ScrollView>
        {/* Place Order Button */}
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
            onPress={() => router.push({ pathname: "/pages/confirm-order", params: { stockId: id } })}
          >
            <Text className="font-pbold text-white text-lg">
              Place Order
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}