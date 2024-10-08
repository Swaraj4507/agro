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
  orderBy,
} from "firebase/firestore";
import CustomButton from "../../components/CustomButton";
import VideoCard from "../../components/VideoCard";
import InfoBox from "../../components/InfoBox";
import EmptyState from "../../components/EmptyState";
import { router } from "expo-router";
import { app } from "../../lib/fire";
import OrderCard from "../../components/OrderCard";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Loader } from "../../components";
import { useTranslation } from "react-i18next";
// import { profile } from "../../assets/images/profile.png";
const Profile = () => {
  const { user, logout } = useGlobalContext();
  const { t } = useTranslation();
  const [userInfo, setUserInfo] = useState(user);
  const [orders, setOrders] = useState([]);
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
      //       // Since we're querying by UID, there should be at most one matching document
      //       const userData = querySnapshot.docs[0].data();
      //       // Do something with userData, such as setting it to state
      //       setUserInfo(userData);
      //       // console.log(userData);
      //       // console.log("temo");
      //       // console.log(user);
      //     } else {
      //       console.log("No matching document found for UID:", uid);
      //     }
      //   } catch (error) {
      //     console.error("Error fetching user profile:", error);
      //   }
      // };

      // Fetch user's orders from Firestore
      const fetchUserOrders = () => {
        const ordersQuery = query(
          collection(db, "orders"),
          where("buyerId", "==", user.uid),
          orderBy("timestamp", "desc")
        );

        const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
          const ordersList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setOrders(ordersList);
          setLoading(false);
        });

        return unsubscribe;
      };
      // fetchUserProfile(user.uid);
      const unsubscribeOrders = fetchUserOrders();

      return () => {
        unsubscribeOrders();
      };
    }
  }, [user]);

  const signout = async () => {
    await firebaseSignOut(auth);

    await logout();
    router.replace("/sign-in-b");
  };

  if (loading) {
    return <Loader isLoading={true} />;
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <OrderCard item={item} />}
        ListEmptyComponent={() => (
          <EmptyState
            title={t("nothing_found_title")}
            subtitle={t("nothing_found_subtitle")}
          />
        )}
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
                // source={{ uri: userInfo.idProofUrl }}
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
                title={orders.length || 0}
                subtitle={t("orders")}
                titleStyles="text-xl"
                containerStyles="mr-10"
              />
              <InfoBox
                title={userInfo.orgName || "N/A"}
                subtitle={t("store")}
                titleStyles="text-xl"
              />
            </View>
            <View>
              <Text className="font-pbold text-lg text-black mt-5">
                {t("yourOrders")}
              </Text>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: hp("12%") }}
      />
    </SafeAreaView>
  );
};

export default Profile;
