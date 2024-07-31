import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  updateDoc,
  doc,
  arrayUnion,
  addDoc,
  collection,
} from "firebase/firestore";
// import { SharedElement } from "react-native-shared-element";
import { db } from "../../lib/fire";
import CustomButton from "../../components/CustomButton";
import { FormField } from "../../components";
import { useGlobalContext } from "../../context/GlobalProvider";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
const RequestStock = () => {
  const { user } = useGlobalContext();
  const { t } = useTranslation();
  const { item: itemString, photoURL } = useLocalSearchParams();
  const stockItem = JSON.parse(itemString);
  const [requestedQuantity, setRequestedQuantity] = useState(
    stockItem.availableQuantity
  );
  const [quotedPrice, setQuotedPrice] = useState(stockItem.price);
  const [deliveryDetails, setDeliveryDetails] = useState(
    user?.address + " " + user?.pincode
  );
  const [isSubmitting, setSubmitting] = useState(false);

  const handleRequest = async () => {
    setSubmitting(true);
    if (
      !isNaN(requestedQuantity) &&
      requestedQuantity >= 1 &&
      requestedQuantity <= stockItem.quantity
    ) {
      // Alert.alert("Error", "Check Requested Quantity");
    }
    try {
      // Add order to orders collection first
      const orderDetails = {
        buyerId: user.uid,
        buyerName: user.fullname,
        buyerMobile: user.mobile,
        stockId: stockItem.id,
        cropName: stockItem.cropName,
        deliveryLocation: deliveryDetails, // Replace with actual delivery location
        quantity: requestedQuantity,
        quotedPrice,
        status: "requested",
        timestamp: new Date(),
        unit: stockItem.unit,
        photoURL: photoURL,
      };
      const orderRef = await addOrder(orderDetails);
      const orderId = orderRef.id;

      // Prepare request details with the order ID
      const requestDetails = {
        orderId,
        quantity: requestedQuantity,
        quotedPrice,
        deliveryDetails,
        requestStatus: "requested",
        buyerId: user.uid,
        buyerName: user.fullname,
        buyerMobile: user.mobile,
        unit: stockItem.unit,
      };

      // Update stock item with buyer request including the order ID
      await updateDoc(doc(db, "stock", stockItem.id), {
        buyerRequests: arrayUnion(requestDetails),
      });

      console.log("Request submitted successfully:", requestDetails);
      // Reset state
      setRequestedQuantity(stockItem.quantity);
      setQuotedPrice("");
      setDeliveryDetails("");
      router.push("/bhome");
    } catch (error) {
      console.error("Error submitting request:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const addOrder = async (orderDetails) => {
    // Add order to Firestore orders collection
    try {
      const orderRef = await addDoc(collection(db, "orders"), orderDetails);
      console.log("Order added with ID: ", orderRef.id);
      return orderRef;
    } catch (error) {
      console.error("Error adding order: ", error);
      throw error;
    }
  };

  return (
    <SafeAreaView
      className="bg-primary h-full flex-1"
      style={{
        flexGrow: 1,
        paddingTop: 30,
      }}
    >
      <ScrollView className="">
        <Animated.View className="p-4">
          <Text className="text-4xl text-secondary font-pbold mb-1">
            {t(`${stockItem.cropName}`)}
          </Text>
          {/* <SharedElement id={photoURL}> */}
          <Image
            source={{ uri: photoURL }}
            className="w-full h-40 rounded-lg mb-4"
          />
          {/* </SharedElement> */}
          <Text className="text-base text-black font-pmedium">
            {t("available_quantity_label")}: {stockItem.availableQuantity}{" "}
            {stockItem.unit}
          </Text>

          <FormField
            title={t("quotedPrice")}
            value={quotedPrice}
            handleChangeText={(text) => setQuotedPrice(text)}
            keyboardType="numeric"
            otherStyles=" mt-1 "
            readOnly={true}
          />
          <FormField
            title={t("requestedQuantity")}
            value={requestedQuantity.toString()}
            handleChangeText={(text) => {
              // const newValue = parseInt(text);

              setRequestedQuantity(text);
            }}
            keyboardType="numeric"
            otherStyles="mt-1"
          />
          <FormField
            title={t("deliveryDetails")}
            value={deliveryDetails}
            handleChangeText={(text) => setDeliveryDetails(text)}
            otherStyles="mt-1"
          />
          <CustomButton
            title={t("placeOrder")}
            handlePress={handleRequest}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RequestStock;
