import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../../lib/fire";
import Animated, { FadeInDown } from "react-native-reanimated";
import Loader from "../../components/Loader";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
// import { ScrollView } from "react-native-reanimated/lib/typescript/Animated";

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
        photoURL: encodeURI(stock.photoURL),
        item: JSON.stringify(stock),
      },
    });
  };

  const confirmedRequests = stock.buyerRequests?.filter(
    (request) =>
      request.requestStatus === "confirmed" ||
      request.requestStatus === "delivered"
  );

  const renderRequest = ({ item, index }) => (
    <View
      key={index}
      className="p-3 mb-2 border border-secondary rounded bg-white/80 bg-secondary"
    >
      <Text className="font-pmedium">
        {t("order_label")}: {index + 1}
      </Text>
      <Text className="font-pmedium">
        {t("requested_quantity_label")}: {item.quantity} {t(`${item.unit}`)}
      </Text>
      <Text className="font-pmedium">
        {t("status_label")}: {t(`${item.requestStatus}`)}
      </Text>
      <Text className="font-pmedium">
        {t("bill_amount")}: {stock.amount * item.quantity} /-
      </Text>
    </View>
  );

  return (
    <View className="flex-1  bg-white" style={{ paddingTop: hp("5%") }}>
      <View className=" pl-4 pr-4 pt-4 mb-2  bg-white shadow-md rounded-lg">
        <Image
          source={{ uri: stock.photoURL }}
          className="w-full h-40 rounded-lg mb-4"
          contentFit="cover"
        />
        <Text className="text-lg font-psemibold mb-1">
          {t(`${stock.cropName}`)}
        </Text>
        <Text className="text-sm text-gray-600 mb-1 font-pmedium">
          {t("location_label")}: {stock.locationString}
        </Text>
        <Text className="text-sm text-gray-600 mb-1 font-pmedium">
          {t("price")}: {stock.amount} / {t(`${stock.unit}`)}
        </Text>
        <Text className="text-sm text-gray-600 mb-1 font-pmedium">
          {t("quantity_label")}: {stock.quantity} {t(`${stock.unit}`)}
        </Text>
        <Text className="text-sm text-gray-600 mb-1 font-pmedium">
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
      </View>

      <Text className="text-lg font-psemibold mb-2 p-4">
        {t("buyer_requests_label")}
      </Text>

      {confirmedRequests && confirmedRequests.length > 0 ? (
        <FlatList
          data={confirmedRequests}
          renderItem={renderRequest}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{
            paddingHorizontal: wp("3%"),
            paddingBottom: hp("10%"),
            backgroundColor: "#fff",
          }}
        />
      ) : (
        <Text className="text-sm text-gray-600 mb-4 font-pmedium p-4">
          {t("no_requests_message")}
        </Text>
      )}
    </View>
  );
};

export default ViewStockRequests;
