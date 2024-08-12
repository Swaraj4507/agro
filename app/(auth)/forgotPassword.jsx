import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions } from "react-native";
import { useTranslation } from "react-i18next";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { app, db } from "../../lib/fire";
import Toast from "react-native-root-toast";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const ForgotPassword = () => {
  const auth = getAuth(app);
  const { t } = useTranslation();
  const [isSubmitting, setSubmitting] = useState(false);
  const [mobile, setMobile] = useState("");

  const submit = async () => {
    if (mobile === "") {
      Toast.show("Please enter your mobile number", {
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
          marginTop: hp("5%"),
          borderRadius: 20,
          paddingHorizontal: 20,
        },
      });
      return;
    }
    setSubmitting(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("mobile", "==", mobile));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Toast.show("No user found with this mobile number", {
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
            marginTop: hp("5%"),
            borderRadius: 20,
            paddingHorizontal: 20,
          },
        });
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const email = userData.email;

      await sendPasswordResetEmail(auth, email);
      Toast.show(`Password reset email sent to ${email} successfully`, {
        duration: Toast.durations.SHORT,
        position: Toast.positions.TOP,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
        backgroundColor: "green",
        textColor: "white",
        opacity: 1,
        textStyle: {
          fontSize: 16,
          fontWeight: "bold",
        },
        containerStyle: {
          marginTop: hp("5%"),
          borderRadius: 20,
          paddingHorizontal: 20,
        },
      });
    } catch (error) {
      Toast.show("Something went wrong. Please try again", {
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
          marginTop: hp("5%"),
          borderRadius: 20,
          paddingHorizontal: 20,
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
          <Text className="text-3xl text-secondary font-psemibold pt-2">
            {t("appName")}
          </Text>
          <Text className="text-xm text-black font-psemibold mt-5">
            {t("slogan")}
          </Text>
        </View>
        <View
          className="w-full flex justify-start h-full px-4 my-6"
          style={{
            minHeight: Dimensions.get("window").height - 100,
          }}
        >
          <Text className="text-3xl font-semibold text-black mt-10 font-psemibold pt-2">
            {t("forgotPassword")}
          </Text>
          <FormField
            title={t("mobileNumber")}
            value={mobile}
            handleChangeText={(e) => setMobile(e)}
            otherStyles="mt-7"
            keyboardType="numeric"
          />
          <CustomButton
            title={t("resetPassword")}
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ForgotPassword;
