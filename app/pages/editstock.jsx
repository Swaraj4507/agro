import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../../lib/fire";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTranslation } from "react-i18next";
const EditStock = () => {
  const { t } = useTranslation();
  const { item: itemString, photoURL } = useLocalSearchParams();
  const item = JSON.parse(itemString);
  console.log("itemString:", itemString);
  const router = useRouter();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    cropName: item.cropName,
    amount: item.amount,
    unit: item.unit,
    locationString: item.locationString,
    photoURL: photoURL,
  });
  // console.log(form);
  const submit = async () => {
    // console.log(form);
    if (!form.cropName || !form.photoURL || !form.amount) {
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
          borderRadius: 20, // Custom border radius
          paddingHorizontal: 20, // Custom padding
        },
      });
      return;
    }
    setSubmitting(true);
    try {
      await updateDoc(doc(db, "stock", item.id), form);
      Toast.show(t("stockUpdated"), {
        duration: Toast.durations.SHORT,
        position: Toast.positions.CENTER,
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
          borderRadius: 20, // Custom border radius
          paddingHorizontal: 20, // Custom padding
        },
      });
      router.back(); // Navigate back after successful update
    } catch (error) {
      Toast.show(t("errorMessage"), {
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
          borderRadius: 20, // Custom border radius
          paddingHorizontal: 20, // Custom padding
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openPicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const photoUri = result.assets[0].uri;
      const response = await fetch(photoUri);
      const blob = await response.blob();
      const storageRef = ref(getStorage(), `photos/${item.uid}/${Date.now()}`);
      await uploadBytes(storageRef, blob);
      const photoURL = await getDownloadURL(storageRef);
      setForm({ ...form, photoURL });
    } else {
      Alert.alert(
        "Notice",
        "Image selection was cancelled, keeping existing image."
      );
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={{ paddingBottom: hp("5%") }}>
          <View className="flex justify-center items-center mt-3">
            <Text className="text-4xl text-secondary font-pbold">
              {t("editStock")}
            </Text>
          </View>

          <View
            className="w-full flex justify-start mt-4 h-full px-4"
            style={{ minHeight: Dimensions.get("window").height - 100 }}
          >
            <FormField
              title={t("cropName")}
              value={form.cropName}
              handleChangeText={(e) => setForm({ ...form, cropName: e })}
              otherStyles="mt-7"
            />

            <TouchableOpacity onPress={openPicker}>
              <View className="mt-7 space-y-2">
                <Text className="text-base text-black font-pmedium">
                  {t("cropImage")}
                </Text>
                <Image
                  source={{ uri: form.photoURL }}
                  className="w-full h-40 rounded-lg mb-4"
                />
                <View className="w-full h-16 px-4 bg-secondary-1 rounded-2xl border-2 border-secondary-1 flex justify-center items-center flex-row space-x-2">
                  <Text className="text-sm text-black font-pmedium">
                    {t("changeImage")}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <FormField
              title={t("sellingAmount")}
              value={form.amount}
              handleChangeText={(e) => setForm({ ...form, amount: e })}
              otherStyles="mt-7"
              keyboardType="numeric"
            />

            <View className="mt-7 flex flex-row">
              <TouchableOpacity
                className={`py-2 px-4 rounded-md ${
                  form.unit === "kg" ? "bg-secondary" : "bg-gray-400"
                }`}
                onPress={() => setForm({ ...form, unit: "kg" })}
              >
                <Text className="text-white font-semibold">{t("kg")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`py-2 px-4 rounded-md ml-2 ${
                  form.unit === "quintal" ? "bg-secondary" : "bg-gray-400"
                }`}
                onPress={() => setForm({ ...form, unit: "quintal" })}
              >
                <Text className="text-white font-semibold">{t("quintal")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`py-2 px-4 rounded-md ml-2 ${
                  form.unit === "ton" ? "bg-secondary" : "bg-gray-400"
                }`}
                onPress={() => setForm({ ...form, unit: "ton" })}
              >
                <Text className="text-white font-semibold">{t("ton")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`py-2 px-4 rounded-md ml-2 ${
                  form.unit === "crate" ? "bg-secondary" : "bg-gray-400"
                }`}
                onPress={() => setForm({ ...form, unit: "crate" })}
              >
                <Text className="text-white font-semibold">{t("crate")}</Text>
              </TouchableOpacity>
            </View>

            <View className="space-y-2 mt-7">
              <Text className="text-base text-black font-pmedium">
                {t("location_label")}
              </Text>
              <Text className="text-base text-black">
                {form.locationString}
              </Text>
            </View>
            <CustomButton
              title={t("updateStock")}
              handlePress={submit}
              containerStyles="mt-7"
              isLoading={isSubmitting}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditStock;
