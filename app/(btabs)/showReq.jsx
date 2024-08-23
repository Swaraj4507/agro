import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useGlobalContext } from "../../context/GlobalProvider";
import { db } from "../../lib/fire";
import { collection, getDocs, query, where } from "firebase/firestore";
import Toast from "react-native-root-toast";
import { heightPercentageToDP } from "react-native-responsive-screen";
import { Loader } from "../../components";

const ShowReq = () => {
  const { t } = useTranslation();
  const { user } = useGlobalContext();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
          Toast.show(t("errorMessage"), {
            duration: Toast.durations.SHORT,
            position: Toast.positions.TOP,
            shadow: true,
            animation: true,
            hideOnPress: true,
            delay: 0,
            backgroundColor: "red",
            textColor: "white",
            opacity: 1,
            textStyle: {
              fontSize: 16,
              fontWeight: "bold",
            },
            containerStyle: {
              borderRadius: 20,
              paddingHorizontal: 20,
            },
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchRequests();
  }, [user?.uid]);

  if (loading) {
    return <Loader isLoading={true} />;
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: heightPercentageToDP("12%"),
          paddingTop: heightPercentageToDP("3%"),
        }}
      >
        <View className="flex justify-center items-center mt-3" style={{}}>
          <Text className="text-4xl text-secondary font-bold pt-2">
            {t("appName")}
          </Text>
          <Text className="text-xm text-black font-bold mt-5">
            {t("bringingFields")}
          </Text>
        </View>

        <View
          className="w-full flex justify-start mt-4 h-full px-4"
          style={{
            minHeight: Dimensions.get("window").height - 100,
          }}
        >
          <View className="flex justify-center items-center pt-5 flex-col gap-2 mb-2">
            <Text className="text-xl text-black font-pbold">
              {t("myRequests")}
            </Text>
          </View>

          {requests.length === 0 ? (
            <View className="mt-7 flex justify-center items-center">
              <Text className="text-lg text-black">{t("noRequests")}</Text>
            </View>
          ) : (
            requests.map((request) => (
              <View
                key={request.id}
                className="bg-white p-4 rounded-lg mb-4 shadow-md border border-[#65B741]"
              >
                <Text className="text-lg font-bold">{t(request.cropName)}</Text>
                <Text className="text-md">
                  {t("quantity")}: {request.quantity} {request.unit}
                </Text>
                <Text className="text-md">
                  {t("assignedQuantity")}:{" "}
                  {request.quantity - request.remainingQuantity} {request.unit}
                </Text>
                <Text className="text-md">
                  {t("remainingQuantity")}: {request.remainingQuantity}{" "}
                  {request.unit}
                </Text>
                <Text className="text-md">
                  {t("deliveryDetails")}: {request.deliveryDetails}
                </Text>
                <Text className="text-md">
                  {t("status_label")}: {t(request.status)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  requestCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default ShowReq;
