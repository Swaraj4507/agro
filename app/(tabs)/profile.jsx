import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useGlobalContext } from "../../context/GlobalProvider";
import { icons, images } from "../../constants";
import { db } from "../../lib/fire";
import { getAuth, signOut as firebaseSignOut } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import InfoBox from "../../components/InfoBox";
import EmptyState from "../../components/EmptyState";
import { router } from "expo-router";
import { app } from "../../lib/fire";
import StockCard from "../../components/StockCard";
import { Loader } from "../../components";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useTranslation } from "react-i18next";
const Profile = () => {
  const { user, logout } = useGlobalContext();
  const { t } = useTranslation();
  const [userInfo, setUserInfo] = useState(user);
  const [stock, setStock] = useState([]);
  const auth = getAuth(app);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // console.log(user);
    if (user) {
      // Fetch user profile information from Firestore
      // const fetchUserProfile = async (uid) => {
      //   try {
      //     // Get a reference to the 'users' collection
      //     const usersRef = collection(db, "users");

      //     // Create a query to find the document with the matching UID
      //     const q = query(usersRef, where("uid", "==", uid));

      //     // Execute the query
      //     const querySnapshot = await getDocs(q);

      //     // Check if there's a matching document
      //     if (!querySnapshot.empty) {
      //       const userData = querySnapshot.docs[0].data();

      //       setUserInfo(userData);
      //     } else {
      //       console.log("No matching document found for UID:", uid);
      //     }
      //   } catch (error) {
      //     console.error("Error fetching user profile:", error);
      //   }
      // };

      // Fetch user's orders from Firestore
      const fetchUserStock = () => {
        const stockQuery = query(
          collection(db, "stock"),
          where("uid", "==", user?.uid)
        );

        const unsubscribe = onSnapshot(stockQuery, (snapshot) => {
          const stockList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setStock(stockList);
          setLoading(false);
        });

        return unsubscribe;
      };

      // fetchUserProfile(user.uid);
      const unsubscribeOrders = fetchUserStock();

      return () => {
        unsubscribeOrders();
      };
    } else {
      setLoading(false); // User is not present, end loading state
    }
  }, [user]);

  const signout = async () => {
    await firebaseSignOut(auth);

    await logout();
    router.replace("/sign-in-f");
  };

  if (loading) {
    return <Loader isLoading={true} />;
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={stock}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <StockCard item={item} />}
        ListEmptyComponent={() => (
          <EmptyState
            title={t("nothing_found_title")}
            subtitle={t("nothing_found_subtitle")}
          />
        )}
        contentContainerStyle={{ paddingBottom: hp("12%") }}
        // stickyHeaderIndices={[0]}
        ListHeaderComponent={() => (
          <View className="w-full flex justify-center items-center mt-6 mb-4 px-4 text-black">
            <TouchableOpacity
              onPress={signout}
              className="flex w-full items-end mb-10"
            >
              <Image
                source={icons.logout}
                resizeMode="contain"
                className="w-6 h-6"
              />
            </TouchableOpacity>

            <View className="w-16 h-16 border border-secondary rounded-lg flex justify-center items-center">
              <Image
                source={images.farmer}
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
              />
            </View>

            <InfoBox
              title={userInfo.fullname}
              containerStyles="mt-5"
              titleStyles="text-lg"
            />

            <View className="mt-5 flex flex-row">
              <InfoBox
                title={stock.length || 0}
                subtitle={t("stock")}
                titleStyles="text-xl"
                containerStyles="mr-10"
              />
              <InfoBox
                title={userInfo.mobile || "N/A"}
                subtitle={t("mobile")}
                titleStyles="text-xl"
              />
            </View>
            <View>
              <Text className="font-pbold text-lg text-black mt-5">
                {t("yourStock")}
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default Profile;
