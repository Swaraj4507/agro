import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../../lib/fire";
import Animated, { FadeInDown } from "react-native-reanimated";
import Loader from "../../components/Loader";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
const ViewStockRequests = () => {
  const { t } = useTranslation();
  const { stockId } = useLocalSearchParams();
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStock = async () => {
      console.log("fetching stock");
      console.log(stockId);
      const stockRef = doc(db, "stock", stockId);
      const stockDoc = await getDoc(stockRef);
      if (stockDoc.exists()) {
        setStock({ id: stockDoc.id, ...stockDoc.data() });
      }
      setLoading(false);
    };
    fetchStock();
  }, [stockId]);

  if (loading) {
    return <Loader isLoading={loading} />;
  }
  const handleEditPress = () => {
    router.push({
      pathname: "/pages/editstock",

      params: {
        photoURL: encodeURI(item.photoURL),
        item: JSON.stringify(item),
      },
    });
  };
  const confirmedRequests = stock.buyerRequests?.filter(
    (request) =>
      request.requestStatus === "confirmed" ||
      request.requestStatus === "delivered"
  );
  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, marginTop: hp("12%") }}
      className="bg-primary"
    >
      {stock && (
        <Animated.View
          entering={FadeInDown}
          className="shadow-md rounded-lg p-4 mb-10 border border-secondary bg-white"
        >
          <Image
            source={{ uri: stock.photoURL }}
            className="w-full h-40 rounded-lg mb-4"
            resizeMode="cover"
          />
          <Text className="text-lg font-psemibold mb-2">
            {t(`${stock.cropName}`)}
          </Text>
          <Text className="text-sm text-gray-600 mb-2 font-pmedium">
            {t("location_label")}: {stock.locationString}
          </Text>
          <Text className="text-sm text-gray-600 mb-4 font-pmedium">
            {t("quantity_label")}: {stock.quantity} {t(`${stock.unit}`)}
          </Text>
          <Text className="text-sm text-gray-600 mb-4 font-pmedium">
            {t("available_quantity_label")}: {stock.availableQuantity}{" "}
            {t(`${stock.unit}`)}
          </Text>

          {stock.isVerified ? (
            <Text className="text-sm text-green-700 mb-2 font-pmedium">
              {t("verified_message")}
            </Text>
          ) : (
            <Text className="text-sm text-red-700 mb-2 font-pmedium">
              {t("not_verified_message")}
            </Text>
          )}

          <Text className="text-lg font-psemibold mb-4">
            {t("buyer_requests_label")}
          </Text>
          {confirmedRequests && confirmedRequests.length > 0 ? (
            confirmedRequests.map((request, index) => (
              <View
                key={index}
                className="p-3 mb-2 border border-secondary rounded bg-white/80 bg-secondary"
              >
                <Text className="font-pmedium">
                  {t("order_label")}: {index + 1}
                </Text>
                <Text className="font-pmedium">
                  {t("requested_quantity_label")}: {request.quantity}{" "}
                  {t(`${request.unit}`)}
                </Text>
                <Text className="font-pmedium">
                  {t("status_label")}: {t(`${request.requestStatus}`)}
                </Text>
                <Text className="font-pmedium">
                  {t("bill_amount")}: {stock.amount * request.quantity} /-
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-sm text-gray-600 mb-4 font-pmedium">
              {t("no_requests_message")}
            </Text>
          )}

          {!stock.isVerified && (
            <TouchableOpacity
              className="bg-secondary py-2 px-4 rounded-md mt-4"
              onPress={handleEditPress}
            >
              <Text className="text-white font-psemibold">
                {t("edit_button_label")}
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}
    </ScrollView>
  );
};

export default ViewStockRequests;
