import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import { useGlobalContext } from "../../context/GlobalProvider";
import { db } from "../../lib/fire";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import BStockCard from "../../components/BstockCard";
import OrderCard from "../../components/OrderCard";
import { router } from "expo-router";
import { CustomButton, EmptyState, SearchInput } from "../../components";
import Loader from "../../components/Loader";
import LottieView from "lottie-react-native";
import { useTranslation } from "react-i18next";
const bhome = () => {
  const { user } = useGlobalContext();
  const [stock, setStock] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const [showEmptyState, setShowEmptyState] = useState(false);
  useEffect(() => {
    if (user && user?.uid) {
      const stockQuery = query(
        collection(db, "stock"),
        where("isVerified", "==", true),
        orderBy("timestamp", "desc")
      );

      const ordersQuery = query(
        collection(db, "orders"),
        where("buyerId", "==", user.uid),
        orderBy("timestamp", "desc")
      );

      const unsubscribeStock = onSnapshot(stockQuery, (querySnapshot) => {
        const userStockData = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        stockData = userStockData.sort((a, b) => b.dateOfEntry - a.dateOfEntry);
        setStock(userStockData);
        setLoading(false);
        // console.log(userStockData);
      });

      const unsubscribeOrders = onSnapshot(ordersQuery, (querySnapshot) => {
        const userOrdersData = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setOrders(userOrdersData);
        setLoading(false);
        // console.log(userOrdersData);
      });

      return () => {
        unsubscribeStock();
        unsubscribeOrders();
      };
    } else {
      // console.log("login first");
    }
  }, [user]);
  useEffect(() => {
    if (loading) {
      const timeoutId = setTimeout(() => {
        setShowEmptyState(true);
      }, 2000);

      return () => clearTimeout(timeoutId); // Clear the timeout if the component unmounts
    } else {
      setShowEmptyState(false);
    }
  }, [loading]);
  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshing(false);
  };

  const handleRequestPress = (item) => {
    router.push({
      pathname: "/pages/requestStock",
      params: { stockItem: item },
    });
  };
  const MemoizedOrderCard = React.memo(OrderCard, (prevProps, nextProps) => {
    return prevProps.item.id === nextProps.item.id; // Avoid re-render if the item ID is the same
  });

  const MemoizedBStockCard = React.memo(BStockCard, (prevProps, nextProps) => {
    return prevProps.item.id === nextProps.item.id; // Avoid re-render if the item ID is the same
  });
  const renderItem = useCallback(
    ({ item }) => {
      return showOrders ? (
        <MemoizedOrderCard
          item={item}
          photoURL={encodeURI(item.photoURL)}
          className="px-4"
        />
      ) : (
        <MemoizedBStockCard
          item={item}
          onRequestPress={() => handleRequestPress(item)}
          className="px-4"
        />
      );
    },
    [showOrders] // Dependencies for useCallback
  );
  // console.log(loading);
  if (loading) {
    return <Loader isLoading={true} />;
  }
  return (
    <SafeAreaView className="h-full w-full">
      {/* <Loader isLoading={loading} /> */}
      <FlatList
        className="bg-primary w-full h-full"
        data={showOrders ? orders : stock}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          () =>
            showEmptyState ? (
              <EmptyState
                title={t("nothing_found_title")}
                subtitle={t("nothing_found_subtitle")}
              />
            ) : showOrders ? (
              <EmptyState
                title={t("nothing_found_title")}
                subtitle={t("nothing_found_subtitle")}
              />
            ) : (
              <Loader isLoading={true} />
            )
          // Show a loader during the delay
        }
        stickyHeaderIndices={[0]}
        ListHeaderComponent={() => (
          <View className="flex my-6 px-4 space-y-6 bg-white mt-0">
            <View className="flex justify-between items-start flex-row">
              <View>
                <Text className="font-psemibold text-2xl mt-1 text-black">
                  {t("welcome")}
                </Text>
                <Text className="text-2xl font-psemibold  text-secondary">
                  {user?.fullname}
                </Text>
              </View>
            </View>
            <View className="flex mt-1">
              <CustomButton
                title={t("check_crops")}
                handlePress={() => router.push("cropsListing")}
                containerStyles="w-full mb-2"
              />
              {/* <SearchInput className="" /> */}
            </View>
            <View className="flex flex-row justify-between mt-1 pb-2">
              <TouchableOpacity
                onPress={() => setShowOrders(false)}
                className={`flex-1 flex-row  mr-2 py-2 rounded-lg items-center justify-evenly border-2 bg-white ${
                  !showOrders ? "border-[#65B741]" : "border-black"
                }`}
              >
                <LottieView
                  style={{ width: 50, height: 50 }}
                  source={require("../../assets/AvailStock.json")}
                  // autoPlay={showCrops ? true : false}
                  autoPlay
                  // loop
                />
                <Text className="text-center font-psemibold text-black ">
                  {t("stock_label")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowOrders(true)}
                className={`flex-1 flex-row ml-2 py-2 rounded-lg items-center justify-evenly  border-2 bg-white ${
                  showOrders ? "border-[#65B741]" : "border-black"
                }`}
              >
                <LottieView
                  style={{ width: 50, height: 50 }}
                  source={require("../../assets/Order1.json")}
                  // autoPlay={!showCrops ? true : false}
                  autoPlay
                  // loop
                />
                <Text className="text-center font-psemibold text-black">
                  {t("my_orders_label")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        getItemLayout={(item, index) => ({
          length: 100, // Assuming fixed height of 100 for items
          offset: 100 * index,
          index,
        })}
        initialNumToRender={30} // Adjust based on performance
        maxToRenderPerBatch={30} // Adjust based on performance
        windowSize={30} // Adjust based on performance
        contentContainerStyle={{ paddingBottom: hp("12%") }}
      />
    </SafeAreaView>
  );
};

export default bhome;
