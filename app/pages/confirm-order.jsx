import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  TextInput,
  FlatList,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  MaterialIcons,
  Ionicons,
  FontAwesome,
  Feather,
  AntDesign,
} from "@expo/vector-icons";
import { format } from "date-fns";
import LottieView from "lottie-react-native";
import { Loader } from "../../components";
import { fetchStockDetails } from "../../api/marketplace";
import { useAddressStore } from "../../stores/addressStore";
import { useAuthStore } from "../../stores/authStore";

const ConfirmOrderScreen = () => {
  const router = useRouter();
  const { stockId } = useLocalSearchParams();
  const { addresses, fetchAddresses, addAddress, updateAddress, deleteAddress } = useAddressStore();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [stock, setStock] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState("upi");
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState("standard");
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [quantity, setQuantity] = useState(20);

  // Simulated backend fees and payment methods
  const [platformFee, setPlatformFee] = useState(0);
  const [deliveryFees, setDeliveryFees] = useState({ standard: 0, express: 0 });
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    // Fetch stock details
    const loadStockDetails = async () => {
      try {
        setLoading(true);
        const response = await fetchStockDetails(stockId);
        setStock(response.data);
        setQuantity(20);
      } catch (err) {
        Alert.alert("Error", "Failed to load stock details");
      } finally {
        setLoading(false);
      }
    };
    loadStockDetails();
  }, [stockId]);

  useEffect(() => {
    // Fetch addresses
    if (!addresses || addresses.length === 0) {
      fetchAddresses(user.id);
    }
  }, [addresses, fetchAddresses, user.id]);

  useEffect(() => {
    // Set default address
    if (addresses && addresses.length > 0 && !deliveryAddress) {
      setDeliveryAddress(addresses.find(a => a.isDefault) || addresses[0]);
    }
  }, [addresses]);

  useEffect(() => {
    // Simulate backend fee and payment method fetch
    setTimeout(() => {
      setPlatformFee(0); // fetched from backend
      setDeliveryFees({ standard: 0, express:100 }); // fetched from backend
      setPaymentMethods([
        { id: "upi", name: "UPI / QR", icon: "qrcode" },
        // { id: "card", name: "Credit / Debit Card", icon: "credit-card" },
        // { id: "wallet", name: "Digital Wallet", icon: "wallet" },
        { id: "cod", name: "Cash on Delivery", icon: "money" },
      ]);
    }, 800);
  }, []);

  const deliveryOptions = [
    {
      id: "standard",
      name: "Standard Delivery",
      price: deliveryFees.standard,
      time: "2-3 days",
      icon: "truck",
    },
    {
      id: "express",
      name: "Express Delivery",
      price: deliveryFees.express,
      time: "Same day",
      icon: "rocket",
    },
  ];

  // Price calculations
  const itemTotal = stock ? parseFloat(quantity) * stock.finalPricePerKg : 0;
  const deliveryFee = selectedDeliveryOption === "standard" ? deliveryFees.standard : deliveryFees.express;
  const grandTotal = itemTotal + deliveryFee + platformFee;

  // Address management
  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddressDialog(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowAddressDialog(true);
  };

  const handleDeleteAddress = (id) => {
    Alert.alert("Delete Address", "Are you sure you want to delete this address?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteAddress(id),
      },
    ]);
  };

  const handleSaveAddress = (address) => {
    if (editingAddress) {
      updateAddress(address);
    } else {
      addAddress(address);
    }
    setShowAddressDialog(false);
  };

  const handleConfirmOrder = () => {
    if (!deliveryAddress) {
      Alert.alert("Select Address", "Please select a delivery address.");
      return;
    }
    if (!quantity || quantity < 1) {
      Alert.alert("Invalid Quantity", "Please enter a valid quantity.");
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setOrderConfirmed(true);
      setTimeout(() => { 
        router.dismissTo("/marketplace"); 
      }, 3000);
    }, 2000);
  };

  if (orderConfirmed) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" />
        <View className="flex-1 justify-center items-center px-5">
          <LottieView
            source={require("../../assets/Order.json")}
            autoPlay
            loop={false}
            style={{ width: 200, height: 200 }}
          />
          <Text className="text-2xl font-bold text-secondary mt-5">Order Confirmed!</Text>
          <Text className="text-base text-gray-600 text-center mt-2">
            Your order has been placed successfully. You will receive a confirmation shortly.
          </Text>
          <Text className="text-sm text-gray-400 mt-5">
            Order ID: ORD{Math.floor(Math.random() * 1000000)}
          </Text>
          {/* <TouchableOpacity
            className="bg-secondary py-3 px-6 rounded-lg mt-8"
            onPress={() => router.replace("/marketplace")}
          >
            <Text className="text-white font-semibold">Continue Shopping</Text>
          </TouchableOpacity> */}
        </View>
      </SafeAreaView>
    );
  }

  if (loading || !stock) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Loader isLoading={true} content="Preparing your order..." />
      </SafeAreaView>
    );
  }

  // Address Card for modal
  const renderAddressItem = ({ item }) => (
    <TouchableOpacity
      className={`p-4 border mb-2 rounded-xl ${
        deliveryAddress?.id === item.id ? "border-secondary" : "border-gray-100"
      }`}
      onPress={() => {
        setDeliveryAddress(item);
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
        <View className="flex-row space-x-2">
          <TouchableOpacity onPress={() => handleEditAddress(item)}>
            <Feather name="edit" size={18} color="#65B741" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteAddress(item.id)}>
            <Feather name="trash-2" size={18} color="#FF4D4F" />
          </TouchableOpacity>
        </View>
      </View>
      <Text className="font-pregular text-black-100">{item.addressLine}</Text>
      <Text className="font-pregular text-black-100">
        {item.city}, {item.state}, {item.pincode}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F7F9FC]" edges={['right', 'left', 'top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-[#F7F9FC]">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-800">Review Order</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Order Summary */}
        <View className="bg-white rounded-2xl p-4 mx-4 mt-3 shadow-sm">
          <Text className="text-base font-semibold text-gray-800 mb-3">Order Summary</Text>
          <View className="flex-row items-center">
            <Image
              source={{ uri: stock.stockImage }}
              className="w-20 h-20 rounded-lg"
              resizeMode="cover"
            />
            <View className="flex-1 ml-3">
              <Text className="text-base font-semibold text-gray-800">{stock.cropName}</Text>
              <View className="flex-row items-center mt-1">
                <View className="bg-[#E8F5E9] px-2 py-0.5 rounded-xl mr-2">
                  <Text className="text-xs font-medium text-secondary">{stock.category}</Text>
                </View>
                <Text className="text-xs text-gray-600 flex-row items-center">
                  <MaterialIcons name="location-on" size={14} color="#65B741" /> {stock.city}
                </Text>
              </View>
              <View className="flex-row items-baseline mt-2">
                <Text className="text-base font-bold text-gray-800">₹{stock.finalPricePerKg}</Text>
                <Text className="text-xs text-gray-600 ml-1">/kg</Text>
                <Text className="text-sm text-gray-600 ml-3">× {quantity} kg</Text>
              </View>
            </View>
          </View>
          <View className="h-px bg-gray-200 my-3" />
          <View className="flex-row items-center bg-[#F8FFF5] p-2 rounded-lg">
            <Feather name="user" size={16} color="#65B741" />
            <Text className="ml-2 text-gray-700 text-sm">
              Sourced from <Text className="font-semibold">Farmer</Text>
            </Text>
          </View>
          <View className="flex-row justify-between mt-3">
            <View className="items-center">
              <Text className="text-xs text-gray-400">Harvested On</Text>
              <Text className="text-sm font-medium text-gray-800 mt-1">
                {format(new Date(stock.harvestedAt), "dd MMM yyyy")}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-xs text-gray-400">Fresh Until</Text>
              <Text className="text-sm font-medium text-gray-800 mt-1">
                {format(new Date(stock.expiryDate), "dd MMM yyyy")}
              </Text>
            </View>
          </View>
        </View>

        {/* Quantity Selection */}
        <View className="bg-white rounded-2xl p-4 mx-4 mt-3 shadow-sm">
          <Text className="text-base font-semibold text-gray-800 mb-3">Order Quantity</Text>
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
            <Text className="font-psemibold text-black ml-4">
              Total: ₹{itemTotal.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View className="bg-white rounded-2xl p-4 mx-4 mt-3 shadow-sm">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-semibold text-gray-800">Delivery Address</Text>
            <TouchableOpacity onPress={() => setShowAddressModal(true)}>
              <Text className="text-secondary font-medium text-sm">Change</Text>
            </TouchableOpacity>
          </View>
          {deliveryAddress ? (
            <View className="flex-row items-start">
              <View className="w-9 h-9 rounded-full bg-secondary justify-center items-center mr-3">
                <MaterialIcons name="location-on" size={24} color="#fff" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="text-base font-semibold text-gray-800 mr-2">{deliveryAddress.landmark}</Text>
                  {deliveryAddress.isDefault && (
                    <View className="bg-[#E8F5E9] px-2 py-0.5 rounded-xl">
                      <Text className="text-xs text-secondary font-medium">Default</Text>
                    </View>
                  )}
                </View>
                <Text className="text-sm text-gray-600">{deliveryAddress.addressLine}</Text>
                <Text className="text-sm text-gray-600">
                  {deliveryAddress.city}, {deliveryAddress.state}, {deliveryAddress.pincode}
                </Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              className="border border-dashed border-gray-100 rounded-xl p-4 items-center justify-center py-6"
              onPress={handleAddAddress}
            >
              <Feather name="plus" size={24} color="#65B741" />
              <Text className="text-secondary font-pmedium mt-2">
                Add Delivery Address
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Address Modal */}
        {showAddressModal && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#FFFFFF",
              zIndex: 20,
            }}
          >
            <View className="flex-row justify-between items-center border-b border-gray-100 pb-4 px-4 mt-4">
              <Text className="text-xl font-pbold text-black">
                Select Address
              </Text>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                <AntDesign name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <FlatList
                data={addresses || []}
                renderItem={renderAddressItem}
                keyExtractor={(item) => item.id}
                ListFooterComponent={
                  <TouchableOpacity
                    className="mt-4 bg-secondary py-3 px-6 rounded-lg items-center"
                    onPress={handleAddAddress}
                  >
                    <Text className="text-white font-semibold">Add New Address</Text>
                  </TouchableOpacity>
                }
              />
            </ScrollView>
          </View>
        )}

        {/* Delivery Options */}
        <View className="bg-white rounded-2xl p-4 mx-4 mt-3 shadow-sm">
          <Text className="text-base font-semibold text-gray-800 mb-3">Delivery Options</Text>
          {deliveryOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              className={`flex-row justify-between items-center p-3 rounded-xl mb-2 ${
                selectedDeliveryOption === option.id ? "bg-[#F0F9EA] border border-[#E1F1D8]" : "bg-[#F8F8F8]"
              }`}
              onPress={() => setSelectedDeliveryOption(option.id)}
            >
              <View className="flex-row items-center">
                <View className={`w-9 h-9 rounded-full justify-center items-center mr-3 ${
                  selectedDeliveryOption === option.id ? "bg-secondary" : "bg-[#F0F9EA]"
                }`}>
                  <FontAwesome name={option.icon} size={16} color={selectedDeliveryOption === option.id ? "#fff" : "#65B741"} />
                </View>
                <View>
                  <Text className="text-base font-semibold text-gray-800">{option.name}</Text>
                  <Text className="text-xs text-gray-500 mt-1">Estimated delivery: {option.time}</Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <Text className="text-base font-semibold text-gray-800 mr-2">
                  {option.price === 0 ? "Free" : `₹${option.price}`}
                </Text>
                {selectedDeliveryOption === option.id && (
                  <Ionicons name="checkmark-circle" size={20} color="#65B741" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Methods */}
        <View className="bg-white rounded-2xl p-4 mx-4 mt-3 shadow-sm">
          <Text className="text-base font-semibold text-gray-800 mb-3">Payment Method</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              className={`flex-row justify-between items-center p-3 rounded-xl mb-2 ${
                selectedPayment === method.id ? "bg-[#F0F9EA] border border-[#E1F1D8]" : "bg-[#F8F8F8]"
              }`}
              onPress={() => setSelectedPayment(method.id)}
            >
              <View className="flex-row items-center">
                <View className={`w-9 h-9 rounded-full justify-center items-center mr-3 ${
                  selectedPayment === method.id ? "bg-secondary" : "bg-[#F0F9EA]"
                }`}>
                  <FontAwesome name={method.icon} size={16} color={selectedPayment === method.id ? "#fff" : "#65B741"} />
                </View>
                <Text className="text-base font-medium text-gray-800">{method.name}</Text>
              </View>
              {selectedPayment === method.id ? (
                <View className="w-5 h-5 rounded-full border-2 border-secondary items-center justify-center">
                  <View className="w-2.5 h-2.5 rounded-full bg-secondary" />
                </View>
              ) : (
                <View className="w-5 h-5 rounded-full border-2 border-gray-300" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Price Details */}
        <View className="bg-white rounded-2xl p-4 mx-4 mt-3 shadow-sm mb-6">
          <Text className="text-base font-semibold text-gray-800 mb-3">Price Details</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-600">Item Total</Text>
            <Text className="text-sm font-medium text-gray-800">₹{itemTotal.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-600">Delivery Fee</Text>
            <Text className="text-sm font-medium text-gray-800">
              {deliveryFee === 0 ? "Free (₹0)" : `₹${deliveryFee.toFixed(2)}`}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-600">Platform Fee</Text>
            <Text className="text-sm font-medium text-gray-800">
              {platformFee === 0 ? "Free (₹0)" : `₹${platformFee.toFixed(2)}`}
            </Text>
          </View>
          <View className="h-px bg-gray-200 my-3" />
          <View className="flex-row justify-between items-center">
            <Text className="text-base font-semibold text-gray-800">Total Amount</Text>
            <Text className="text-lg font-bold text-secondary">₹{grandTotal.toFixed(2)}</Text>
          </View>
        </View>
        <View className="h-24" />
      </ScrollView>

      {/* Place Order Button - Fixed at bottom */}
      <View className="absolute bottom-0 left-0 right-0 bg-white flex-row items-center justify-between px-4 py-4 border-t border-gray-100 shadow-lg">
        <View>
          <Text className="text-xs text-gray-400">Total:</Text>
          <Text className="text-lg font-bold text-gray-800">₹{grandTotal.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          className="bg-secondary py-3 px-8 rounded-xl min-w-[140px] items-center"
          onPress={handleConfirmOrder}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">Place Order</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ConfirmOrderScreen;