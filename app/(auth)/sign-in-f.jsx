import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";

import { images } from "../../constants";
import { useTranslation } from "react-i18next";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { useGlobalContext } from "../../context/GlobalProvider";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app, db } from "../../lib/fire";
import Toast from "react-native-root-toast";
// import { app } from "../../lib/fire";
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
const SignIn = () => {
  const auth = getAuth(app);
  const { setIsLogged, setUserType, storeUser } = useGlobalContext();
  const { t } = useTranslation();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    mobile: "",
    password: "",
  });
  const submit = async () => {
    if (form.email === "" || form.password === "") {
      // Alert.alert("Error", "Please fill in all fields");
      Toast.show("Please fill in all fields", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.TOP,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
        backgroundColor: "red", // Custom background color
        textColor: "white", // Custom text color
        opacity: 1, // Custom opacity
        textStyle: {
          fontSize: 16, // Custom text size
          fontWeight: "bold", // Custom text weight
        },
        containerStyle: {
          marginTop: hp("5%"),
          borderRadius: 20, // Custom border radius
          paddingHorizontal: 20, // Custom padding
        },
      });
      return;
    }
    setSubmitting(true);
    try {
      console.log(form.mobile + "@gmail.com");
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.mobile + "@gmail.com",
        form.password
      );

      // Extract UID from userCredential
      console.log(form);
      const uid = userCredential.user.uid;

      // Fetch user details from Firestore based on UID
      const userData = await fetchUserByUID(uid);

      // Check if user document exists
      if (userData) {
        // Update user details in global context
        await storeUser({
          uid: userData.uid,
          fullname: userData.fullname,
          role: userData.role,
          mobile: userData.mobile,
          address: userData.address,
          state: userData.state,
          pincode: userData.pincode,
          idProofUrl: userData.idProofUrl,
          idType: userData.idType,
          // orgName: userData.orgName,
        });

        setIsLogged(true);
        setUserType(userData.role);
        // Alert.alert("Success", "User signed in successfully");
        Toast.show("User signed in successfully", {
          duration: Toast.durations.SHORT,
          position: Toast.positions.TOP,
          shadow: true,
          animation: true,
          hideOnPress: true,
          delay: 0,
          backgroundColor: "green", // Custom background color
          textColor: "white", // Custom text color
          opacity: 1, // Custom opacity
          textStyle: {
            fontSize: 16, // Custom text size
            fontWeight: "bold", // Custom text weight
          },
          containerStyle: {
            marginTop: hp("5%"),
            borderRadius: 20, // Custom border radius
            paddingHorizontal: 20, // Custom padding
          },
        });
        router.replace("/");
      } else {
        // Alert.alert("Error", "User document not found");
        Toast.show("Invalid Credentials", {
          duration: Toast.durations.SHORT,
          position: Toast.positions.TOP,
          shadow: true,
          animation: true,
          hideOnPress: true,
          delay: 0,
          backgroundColor: "red", // Custom background color
          textColor: "white", // Custom text color
          opacity: 1, // Custom opacity
          textStyle: {
            fontSize: 16, // Custom text size
            fontWeight: "bold", // Custom text weight
          },
          containerStyle: {
            marginTop: hp("5%"),
            borderRadius: 20, // Custom border radius
            paddingHorizontal: 20, // Custom padding
          },
        });
      }
    } catch (error) {
      Toast.show("Something went wrong", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.TOP,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
        backgroundColor: "red", // Custom background color
        textColor: "white", // Custom text color
        opacity: 1, // Custom opacity
        textStyle: {
          fontSize: 16, // Custom text size
          fontWeight: "bold", // Custom text weight
        },
        containerStyle: {
          marginTop: hp("5%"),
          borderRadius: 20, // Custom border radius
          paddingHorizontal: 20, // Custom padding
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const fetchUserByUID = async (uid) => {
    try {
      // Create a reference to the users collection
      const usersRef = collection(db, "users");

      // Create a query to get the user document where the uid field matches the provided uid
      const q = query(usersRef, where("uid", "==", uid));

      // Execute the query
      const querySnapshot = await getDocs(q);

      // Check if any documents match the query
      if (!querySnapshot.empty) {
        // Since there should be only one document matching the query, get the first document
        const userDoc = querySnapshot.docs[0];

        // Return the user data
        return userDoc.data();
      } else {
        // If no document matches the query, return null
        return null;
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="">
        <View className="flex justify-center items-center mt-3">
          <Text className="text-3xl text-secondary font-psemibold pt-2">
            {t("appName")}
          </Text>
          <Text className="text-xm text-black font-psemibold mt-5">
            {t("slogan")}
          </Text>
        </View>
        <View
          className="w-full flex justify-start h-full px-4  my-6 "
          style={{
            minHeight: Dimensions.get("window").height - 100,
            // minWidth: Dimensions.get("window").width - 100,
          }}
        >
          <Text className="text-3xl font-semibold text-black mt-10 font-psemibold pt-2">
            {t("loginAsFarmer")}
          </Text>
          <View className="flex  pt-5 flex-row gap-2 w-3/4 justify-start">
            <Text className="text-lg text-gray-500 font-pregular">
              {t("noAccount")}
            </Text>
            <Link
              href="/sign-up-f"
              className="text-lg font-psemibold text-secondary"
            >
              {t("register")}
            </Link>
          </View>

          <FormField
            title={t("mobileNumber")}
            value={form.mobile}
            handleChangeText={(e) => setForm({ ...form, mobile: e })}
            otherStyles="mt-7"
            keyboardType="numeric"
          />

          <FormField
            title={t("password")}
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
          />

          <CustomButton
            title={t("signIn")}
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
