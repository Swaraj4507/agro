import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { doc, getDoc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

import { db } from "../../lib/fire";
import Loader from "../../components/Loader";

const ViewStockRequests = () => {
  const { t } = useTranslation();
  const { stockId } = useLocalSearchParams(); // Replace with useLocalSearchParams() in production
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
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.requestCard}
    >
      <LinearGradient
        colors={["#f7f8fa", "#e7e9ec"]}
        style={styles.requestGradient}
      >
        <Text style={styles.requestTitle}>
          {t("order_label")} #{index + 1}
        </Text>
        <View style={styles.requestInfo}>
          <Ionicons name="cube-outline" size={20} color="#4a5568" />
          <Text style={styles.requestText}>
            {item.quantity} {t(`${item.unit}`)}
          </Text>
        </View>
        <View style={styles.requestInfo}>
          <Ionicons name="fitness-outline" size={20} color="#4a5568" />
          <Text style={styles.requestText}>{t(`${item.requestStatus}`)}</Text>
        </View>
        <View style={styles.requestInfo}>
          <Ionicons name="cash-outline" size={20} color="#4a5568" />
          <Text style={styles.requestText}>
            ₹{stock.amount * item.quantity}
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.View entering={FadeIn.delay(200).springify()}>
        <Image
          source={{ uri: stock.photoURL }}
          style={styles.image}
          contentFit="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.gradient}
        />
        <View style={styles.headerContent}>
          <Text style={styles.title}>{t(`${stock.cropName}`)}</Text>
          <Text style={styles.subtitle}>{stock.locationString}</Text>
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(400).springify()}
        style={styles.detailsCard}
      >
        <View style={styles.row}>
          <View style={styles.detailItem}>
            <Ionicons name="pricetag-outline" size={24} color="#4a5568" />
            <Text style={styles.detailTitle}>{t("price")}</Text>
            <Text style={styles.detailValue}>
              ₹{stock.amount}/{t(`${stock.unit}`)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="bar-chart-outline" size={24} color="#4a5568" />
            <Text style={styles.detailTitle}>{t("quantity_label")}</Text>
            <Text style={styles.detailValue}>
              {stock.quantity} {t(`${stock.unit}`)}
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.detailItem}>
            <Ionicons name="refresh-outline" size={24} color="#4a5568" />
            <Text style={styles.detailTitle}>
              {t("available_quantity_label")}
            </Text>
            <Text style={styles.detailValue}>
              {stock.availableQuantity} {t(`${stock.unit}`)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons
              name={
                stock.isVerified
                  ? "checkmark-circle-outline"
                  : "close-circle-outline"
              }
              size={24}
              color={stock.isVerified ? "#48bb78" : "#e53e3e"}
            />
            <Text style={styles.detailTitle}>{t("verification_status")}</Text>
            <Text
              style={[
                styles.detailValue,
                { color: stock.isVerified ? "#48bb78" : "#e53e3e" },
              ]}
            >
              {stock.isVerified
                ? t("verified_message")
                : t("not_verified_message")}
            </Text>
          </View>
        </View>

        {!stock.isVerified && (
          <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
            <Ionicons name="create-outline" size={20} color="#ffffff" />
            <Text style={styles.editButtonText}>{t("edit_button_label")}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      <Text style={styles.sectionTitle}>{t("buyer_requests_label")}</Text>

      {confirmedRequests && confirmedRequests.length > 0 ? (
        <FlatList
          data={confirmedRequests}
          renderItem={renderRequest}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.requestList}
        />
      ) : (
        <Text style={styles.noRequestsText}>{t("no_requests_message")}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7fafc",
  },
  image: {
    width: "100%",
    height: hp("30%"),
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: hp("15%"),
  },
  headerContent: {
    position: "absolute",
    bottom: hp("2%"),
    left: wp("4%"),
  },
  title: {
    fontSize: wp("6%"),
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: hp("0.5%"),
  },
  subtitle: {
    fontSize: wp("3.5%"),
    color: "#e2e8f0",
  },
  detailsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: wp("5%"),
    margin: wp("4%"),
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp("2%"),
  },
  detailItem: {
    alignItems: "center",
    width: "48%",
  },
  detailTitle: {
    fontSize: wp("3%"),
    color: "#718096",
    marginTop: hp("0.5%"),
  },
  detailValue: {
    fontSize: wp("3.5%"),
    fontWeight: "bold",
    color: "#2d3748",
    marginTop: hp("0.5%"),
  },
  editButton: {
    backgroundColor: "#4299e1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp("1.5%"),
    borderRadius: 10,
    marginTop: hp("2%"),
  },
  editButtonText: {
    color: "#ffffff",
    fontSize: wp("3.5%"),
    fontWeight: "bold",
    marginLeft: wp("2%"),
  },
  sectionTitle: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    color: "#2d3748",
    marginHorizontal: wp("4%"),
    marginTop: hp("2%"),
    marginBottom: hp("1%"),
  },
  requestList: {
    paddingHorizontal: wp("4%"),
    paddingBottom: hp("5%"),
  },
  requestCard: {
    marginBottom: hp("2%"),
    borderRadius: 15,
    overflow: "hidden",
  },
  requestGradient: {
    padding: wp("4%"),
  },
  requestTitle: {
    fontSize: wp("4%"),
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: hp("1%"),
  },
  requestInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp("0.5%"),
  },
  requestText: {
    fontSize: wp("3.5%"),
    color: "#4a5568",
    marginLeft: wp("2%"),
  },
  noRequestsText: {
    fontSize: wp("3.5%"),
    color: "#718096",
    textAlign: "center",
    marginTop: hp("2%"),
  },
});

export default ViewStockRequests;
