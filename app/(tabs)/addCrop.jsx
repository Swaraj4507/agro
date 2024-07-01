import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Alert,
  Image,
  TouchableOpacity,
  Button,
} from "react-native";
import("@react-native-community/datetimepicker").DateTimePickerEvent;
import { Dropdown } from "react-native-element-dropdown";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { useGlobalContext } from "../../context/GlobalProvider";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { db } from "../../lib/fire";

import { addDoc, collection } from "firebase/firestore";
import { useTranslation } from "react-i18next";
const addCrop = () => {
  const { t } = useTranslation();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullname: "",
    mobile: "",
    address: "",
    state: "",
    pincode: "",
    IdType: "",
    IdImage: null,
    password: "",
    cropName: "",
    dateOfSow: new Date(),
    area: "",
  });
  const { user, cropsList } = useGlobalContext();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const submit = async () => {
    if (form.cropName === "" || form.area === "") {
      console.log(form);
      Alert.alert("Error", "Please fill in all fields");
    }
    setSubmitting(true);
    try {
      const uid = user.uid;

      await addDoc(collection(db, "crops"), {
        uid: uid, // Linking to user's UID
        cropName: form.cropName,
        timestamp: form.dateOfSow,
        area: form.area,
      });
      Alert.alert("Success", "Crops added successfully");
      // setUser(userCredential.user);
      // setIsLogged(true);
      // setUserType("farmer");
      // router.replace("/");
    } catch (error) {
      Alert.alert("Error", error.message);
      console.log(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const setDate = (event: DateTimePickerEvent, date: Date | undefined) => {
    if (event.type === "set" && date) {
      setForm({
        ...form,
        dateOfSow: date,
      });
    }
    setShowDatePicker(false);
    console.log(form.dateOfSow);
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="flex justify-center items-center  mt-3">
          <Text className="text-4xl text-secondary font-bold pt-2">
            {t("appName")}
          </Text>
          {/* <Text className="text-4xl text-black font-bold mt-5">Register</Text> */}
          <Text className="text-xm text-black font-bold mt-5">
            {t("slogan")}
          </Text>
        </View>

        <View
          className="w-full flex justify-start mt-4 h-full px-4 "
          style={{
            minHeight: Dimensions.get("window").height - 100,
          }}
        >
          {/* <Image
            source={images.logo}
            resizeMode="contain"
            className="w-[115px] h-[34px]"
          /> */}

          <View className="flex justify-center items-center pt-5 flex-col gap-2">
            <Text className="text-xl  text-black font-pbold">
              {t("addYourCrops")}
            </Text>
          </View>

          <Dropdown
            // className="text-base text-black font-pmedium h-16 px-4 bg-secondary-1 rounded-2xl border-2 border-secondary-1 focus:border-secondary flex flex-row "
            data={cropsList.map((crop) => ({ label: t(crop), value: crop }))}
            labelField="label"
            valueField="value"
            placeholder={t("selectCrop")}
            search
            searchPlaceholder="Search..."
            value={form.cropName}
            onChange={(item) => setForm({ ...form, cropName: item.value })}
            style={{
              marginBottom: 4,
              backgroundColor: "#A0C334",
              height: 64,
              borderRadius: 12,
              padding: 4,
            }}
          />
          {/* <FormField
            title="Date of Sowing"
            value={form.dateOfSow}
            handleChangeText={(e) => setForm({ ...form, dateOfSow: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
          /> */}
          {/* <FormField
            title="Date of Sowing"
            value={form.dateOfSow}
            handleChangeText={(e) => setForm({ ...form, dateOfSow: e })}
            otherStyles="mt-7"
            date
          /> */}
          <View className="space-y-2 mt-7">
            <Text className="text-base text-black font-pmedium">
              {t("dateOfSowing")}
            </Text>

            <TouchableOpacity
              className="w-full h-16 px-4 bg-secondary-1 rounded-2xl border-2 border-secondary-1 focus:border-secondary flex flex-row items-center justify-center"
              onPress={() => setShowDatePicker(true)}
            >
              <Text className="text-black">
                {form.dateOfSow.toDateString()}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <RNDateTimePicker
                value={form.dateOfSow}
                onChange={setDate}
                mode="date"
                display="default"
              />
            )}
          </View>

          <FormField
            title={t("areaInAcres")}
            value={form.area}
            handleChangeText={(e) => setForm({ ...form, area: e })}
            otherStyles="mt-7"
            keyboardType="numeric"
          />
          <CustomButton
            title={t("addCrop")}
            handlePress={submit}
            containerStyles="mt-7 "
            isLoading={isSubmitting}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default addCrop;
