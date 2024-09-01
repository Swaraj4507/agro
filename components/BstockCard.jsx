import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.9;

const VendorStockCard = ({ item }) => {
  const { t } = useTranslation();
  const {
    cropName,
    locationString,
    price,
    photoURL,
    unit,
    isVerified,
    availableQuantity,
  } = item;

  const handleRequestPress = () => {
    router.push({
      pathname: "/pages/requestStock",
      params: {
        photoURL: encodeURI(item.photoURL),
        item: JSON.stringify(item),
      },
    });
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: photoURL }} style={styles.image} />
        {isVerified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓</Text>
          </View>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.cropName}>{t(`${cropName}`)}</Text>
        <Text style={styles.locationText}>{locationString}</Text>
        <Text style={styles.quantityText}>
          {t("available_label")}: {availableQuantity} {unit}
        </Text>
        <Text style={styles.priceText}>
          {t("price_label")}: {price}/{unit}
        </Text>
      </View>
      <TouchableOpacity
        style={[
          styles.requestButton,
          availableQuantity === 0 && styles.disabledButton,
        ]}
        onPress={handleRequestPress}
        disabled={availableQuantity === 0}
      >
        <Text style={styles.requestButtonText}>
          {availableQuantity === 0 ? t("sold_out_label") : t("request_button")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    marginVertical: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignSelf: "center",
    borderColor: "#65B741",
  },
  imageContainer: {
    width: "100%",
    height: 150,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  verifiedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  infoContainer: {
    padding: 15,
  },
  cropName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 5,
  },
  locationText: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 3,
  },
  quantityText: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 3,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 5,
  },
  requestButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  requestButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default VendorStockCard;
