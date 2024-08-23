import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";

import { useTranslation } from "react-i18next";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { useGlobalContext } from "../../context/GlobalProvider";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app, db } from "../../lib/fire";
import { collection, getDocs, query, where } from "firebase/firestore";
import Toast from "react-native-root-toast";
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
      Toast.show(t("fillAllFields"), {
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
      const usersRef = collection(db, "users"); // Assuming 'users' is the collection name
      const q = query(usersRef, where("mobile", "==", form.mobile));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        Toast.show(t("noUserFound"), {
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
        return;
      }
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      // console.log(userData);
      // Check if the user's ID is verified
      if (userData.verified) {
        // If verified, proceed with login
        const email = userData.email;
        // console.log(email);
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          form.password
        );

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
          orgName: userData.orgName,
        });

        setIsLogged(true);
        setUserType(userData.role);
        // Alert.alert("Success", "User signed in successfully");
        Toast.show(t("userSignedIn"), {
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
        Toast.show(t("idVerificationPending"), {
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
      Toast.show(t("errorInvalidCredentials"), {
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

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="flex justify-center items-center mt-3">
          <Text className="text-4xl text-secondary font-psemibold pt-2">
            {t("appName")}
          </Text>
          <Text className="text-xm text-black font-psemibold mt-5">
            {t("buyersWaiting")}
          </Text>
        </View>
        <View
          className="w-full flex justify-start h-full px-4 my-6"
          style={{
            minHeight: Dimensions.get("window").height - 100,
          }}
        >
          <Text className="text-3xl font-semibold text-black mt-10 font-psemibold pt-2">
            {t("loginAsBuyer")}
          </Text>
          <View className="flex justify-start pt-5 flex-row gap-2 w-3/4">
            <Text className="text-lg text-gray-500 font-pregular">
              {t("noAccount")}
            </Text>
            <Link
              href="/sign-up-b"
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
          <View className="flex  pt-5 flex-row gap-2 w-3/4 justify-start">
            <Text className="text-lg text-gray-500 font-pregular">
              {t("forgotPassword")}
            </Text>
            <Link
              href="/forgotPassword"
              className="text-lg font-psemibold text-secondary"
            >
              {t("click here")}
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
