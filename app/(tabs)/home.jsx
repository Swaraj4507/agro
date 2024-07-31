import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Image,
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
import CropCard from "../../components/CropCard";
import StockCard from "../../components/StockCard";
import { router } from "expo-router";
import { images } from "../../constants";
import { CustomButton, EmptyState, SearchInput } from "../../components";
// import { Home } from "../../assets/Home.json";
import Loader from "../../components/Loader";
import LottieView from "lottie-react-native";
import { useTranslation } from "react-i18next";
// import Animated, {
//   LightSpeedInRight,
//   LightSpeedOutLeft,
// } from "react-native-reanimated";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
const Home = () => {
  const { user } = useGlobalContext();
  const { t } = useTranslation();
  const [crops, setCrops] = useState([]);
  const [stock, setStock] = useState([]);
  const [showCrops, setShowCrops] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (user && user?.uid) {
      const cropsQuery = query(
        collection(db, "crops"),
        where("uid", "==", user.uid),
        orderBy("timestamp", "desc") // Order crops by timestamp in descending order
      );
      const stockQuery = query(
        collection(db, "stock"),
        where("uid", "==", user.uid),
        orderBy("timestamp", "desc") // Order stock by timestamp in descending order
      );

      const unsubscribeCrops = onSnapshot(cropsQuery, (querySnapshot) => {
        const userCropsData = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setCrops(userCropsData);
        setLoading(false);
        // console.log(userCropsData);
      });

      const unsubscribeStock = onSnapshot(stockQuery, (querySnapshot) => {
        const userStockData = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setStock(userStockData);
        setLoading(false);
        // console.log(userStockData);
      });

      return () => {
        unsubscribeCrops();
        unsubscribeStock();
      };
    } else {
      // console.log("login first");
    }
  }, [user]);
  const onRefresh = async () => {
    setRefreshing(true);
    // Real-time listeners already handle updates, so no need to refetch
    setRefreshing(false);
  };

  return (
    <SafeAreaView className=" bg-primary h-full w-full">
      <Loader isLoading={loading} />
      <FlatList
        className="bg-primary w-full h-full"
        data={showCrops ? crops : stock}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          showCrops ? (
            <CropCard item={item} className="px-4" />
          ) : (
            <StockCard item={item} className="px-4" />
          )
        }
        // contentContainerStyle={{ paddingBottom: hp("10%") }}
        ListEmptyComponent={() => (
          <EmptyState
            title={t("nothing_found_title")}
            subtitle={t("nothing_found_subtitle")}
          />
        )}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={() => (
          <View className="flex my-6 px-4 space-y-3 bg-white mt-0">
            <View className="flex justify-between items-start flex-row ">
              <View>
                <Text className="font-psemibold text-2xl mt-1 text-black">
                  {t("welcome")}
                </Text>
                <Text className="text-2xl font-psemibold text-secondary">
                  {user?.fullname}
                </Text>
              </View>
              {/* <LottieView
                style={{ width: 100, height: 80, marginTop: 1 }}
                source={require("../../assets/Home2.json")}
                autoPlay
                // loop
              /> */}
              <View className="w-16 h-16 border border-secondary rounded-lg flex justify-center items-center">
                <Image
                  source={images.farmer}
                  className="w-[90%] h-[90%] rounded-lg"
                  resizeMode="cover"
                />
              </View>
            </View>

            <View className="flex ">
              <CustomButton
                title={t("check_crops")}
                handlePress={() => router.push("cropsListing")}
                containerStyles="w-full mb-2"
              />
              {/* <SearchInput className="" /> */}
            </View>
            <View className="flex flex-row justify-between mt-1 pb-2">
              <View></View>
              <TouchableOpacity
                onPress={() => setShowCrops(true)}
                className={`flex-1 flex-row mr-2 py-2 rounded-lg items-center justify-evenly border-2 bg-white ${
                  showCrops ? "border-[#65B741]" : "border-black"
                }`}
              >
                <LottieView
                  style={{ width: 50, height: 50 }}
                  source={require("../../assets/World.json")}
                  // autoPlay={showCrops ? true : false}
                  autoPlay
                  // loop
                />
                <Text className="text-center font-psemibold text-black ">
                  {t("my_crops")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowCrops(false)}
                className={`flex-1 flex-row ml-2 py-2 rounded-lg items-center justify-evenly  border-2 bg-white ${
                  !showCrops ? "border-[#65B741]" : "border-black"
                } `}
              >
                <LottieView
                  style={{ width: 50, height: 50 }}
                  source={require("../../assets/purse.json")}
                  // autoPlay={!showCrops ? true : false}
                  autoPlay
                  // loop
                />
                <Text className="text-center font-psemibold text-black">
                  {t("my_stock")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          // marginBottom: 10,
          // backgroundColor: "#000",
          paddingBottom: hp("12%"),
        }}
      />
    </SafeAreaView>
  );
};

export default Home;
