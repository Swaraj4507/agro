import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../../lib/fire";
import Animated, { FadeInDown } from "react-native-reanimated";
import Loader from "../../components/Loader";

const ViewStockRequests = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const { stockId } = route.params;
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStock = async () => {
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
    navigation.navigate("EditStock", { stock });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }} className="bg-primary">
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
          {stock.buyerRequests && stock.buyerRequests.length > 0 ? (
            stock.buyerRequests.map((request, index) => (
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
