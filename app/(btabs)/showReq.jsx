import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useGlobalContext } from "../../context/GlobalProvider";
import { db } from "../../lib/fire";
import { collection, getDocs, query, where } from "firebase/firestore";
import Toast from "react-native-root-toast";
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from "react-native-responsive-screen";
import { Loader } from "../../components";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const ShowReq = () => {
  const { t } = useTranslation();
  const { user } = useGlobalContext();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async () => {
    if (user?.uid) {
      try {
        const reqQuery = query(
          collection(db, "req"),
          where("buyerId", "==", user.uid)
        );
        const querySnapshot = await getDocs(reqQuery);
        const fetchedRequests = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRequests(fetchedRequests);
      } catch (error) {
        showToast(t("errorMessage"), "error");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user?.uid]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchRequests();
  }, []);

  const showToast = (message, type = "default") => {
    Toast.show(message, {
      duration: Toast.durations.LONG,
      position: Toast.positions.TOP,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0,
      backgroundColor: type === "error" ? "#FF6B6B" : "#4ECDC4",
      textColor: "white",
      opacity: 1,
      textStyle: {
        fontSize: 16,
        fontWeight: "bold",
      },
      containerStyle: {
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 10,
      },
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#FFA500";
      case "approved":
        return "#4CAF50";
      case "rejected":
        return "#FF6B6B";
      default:
        return "#808080";
    }
  };

  if (loading) {
    return <Loader isLoading={true} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#65B741", "#65B741"]} style={styles.gradient}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.header}>
            <Text style={styles.title} cropName="font-psemibold">
              {t("appName")}
            </Text>
            <Text style={styles.subtitle} cropName="font-psemibold">
              {t("bringingFields")}
            </Text>
          </View>

          <View style={styles.requestsContainer}>
            <View style={styles.requestsHeader}>
              <Ionicons name="list" size={24} color="#333" />
              <Text style={styles.requestsTitle}>{t("myRequests")}</Text>
            </View>

            {requests.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="leaf-outline" size={48} color="#65B741" />
                <Text style={styles.emptyStateText}>{t("noRequests")}</Text>
              </View>
            ) : (
              requests.map((request) => (
                <TouchableOpacity
                  key={request.id}
                  style={styles.requestCard}
                  onPress={() => {
                    /* Navigate to request details */
                  }}
                >
                  <View style={styles.requestHeader}>
                    <Text style={styles.cropName}>{t(request.cropName)}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(request.status) },
                      ]}
                    >
                      <Text style={styles.statusText}>{t(request.status)}</Text>
                    </View>
                  </View>
                  <View style={styles.requestDetails}>
                    <RequestInfoItem
                      label={t("quantity")}
                      value={`${request.quantity} ${request.unit}`}
                    />
                    <RequestInfoItem
                      label={t("assignedQuantity")}
                      value={`${request.quantity - request.remainingQuantity} ${
                        request.unit
                      }`}
                    />
                    <RequestInfoItem
                      label={t("remainingQuantity")}
                      value={`${request.remainingQuantity} ${request.unit}`}
                    />
                    <RequestInfoItem
                      label={t("deliveryDetails")}
                      value={`${request.deliveryDetails}, ${request.pincode}, ${request.state} `}
                    />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const RequestInfoItem = ({ label, value }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue} numberOfLines={3}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  gradient: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: heightPercentageToDP("12%"),
    paddingTop: heightPercentageToDP("3%"),
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: 5,
  },
  requestsContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    minHeight: Dimensions.get("window").height - 200,
  },
  requestsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  requestsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#333",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  emptyStateText: {
    fontSize: 18,
    color: "#666",
    marginTop: 10,
  },
  requestCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginBottom: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cropName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  requestDetails: {
    marginTop: 10,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    alignItems: "flex-start",
  },
  infoLabel: {
    color: "#666",
    fontSize: 14,
    width: "40%",
  },
  infoValue: {
    color: "#333",
    fontSize: 14,
    fontWeight: "500",
    width: "60%", // Allow this part to take up more space and wrap
    flexShrink: 1,
    flexWrap: "wrap",
  },
});

export default ShowReq;
