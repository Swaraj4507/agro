import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useTranslation } from "react-i18next";
import { useGlobalContext } from "../../context/GlobalProvider";
import { db, storage } from "../../lib/fire";
import { getDownloadURL, ref } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
import Toast from "react-native-root-toast";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { heightPercentageToDP } from "react-native-responsive-screen";

const addReq = () => {
  const { t } = useTranslation();
  const { cropsList, user } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    buyerId: user?.uid,
    buyerMobile: user?.mobile,
    buyerName: user?.fullname,
    cropName: "",
    deliveryDetails: "",
    quantity: "",
    remainingQuantity: "",
    status: "assigned",
    unit: "kg",
    cropImage: "",
  });
  const [cropImageUrl, setCropImageUrl] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchCropImage = async () => {
      if (form.cropName) {
        try {
          const cropImageRef = ref(storage, `cropImages/${form.cropName}.jpg`);
          const url = await getDownloadURL(cropImageRef);
          setForm({ ...form, cropImage: url });
          setCropImageUrl(url);
        } catch (error) {
          console.error("Error fetching crop image:", error);
        }
      }
    };

    fetchCropImage();
  }, [form.cropName]);

  const submit = async () => {
    if (
      form.cropName === "" ||
      form.quantity === "" ||
      form.deliveryDetails === ""
    ) {
      Toast.show(t("fillAllFields"), {
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
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "req"), form);
      setForm({
        buyerId: user?.uid,
        buyerMobile: user?.mobile,
        buyerName: user?.fullname,
        cropName: "",
        deliveryDetails: "",
        quantity: "",
        remainingQuantity: "",
        status: "assigned",
        unit: "kg",
        cropImage: "",
      });
      Toast.show(t("requirementAddedSuccess"), {
        duration: Toast.durations.SHORT,
        position: Toast.positions.CENTER,
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
          borderRadius: 20,
          paddingHorizontal: 20,
        },
      });
      router.replace("/bhome");
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
      // console.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView
        contentContainerStyle={{ paddingBottom: heightPercentageToDP("10%") }}
      >
        <View className="flex justify-center items-center mt-3">
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
          <View className="flex justify-center items-center pt-5 flex-col gap-2">
            <Text className="text-xl text-black font-pbold">
              {t("addRequirement")}
            </Text>
          </View>

          <Dropdown
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

          {cropImageUrl ? (
            <Image
              source={{ uri: cropImageUrl }}
              className="w-full h-40 rounded-lg mb-4 mt-7"
            />
          ) : null}

          <FormField
            title={t("mobile")}
            value={form.buyerMobile}
            handleChangeText={(e) => setForm({ ...form, buyerMobile: e })}
            otherStyles="mt-7"
          />

          <FormField
            title={t("fullname")}
            value={form.buyerName}
            handleChangeText={(e) => setForm({ ...form, buyerName: e })}
            otherStyles="mt-7"
          />

          <FormField
            title={t("deliveryDetails")}
            value={form.deliveryDetails}
            handleChangeText={(e) => setForm({ ...form, deliveryDetails: e })}
            otherStyles="mt-7"
          />

          <FormField
            title={t("quantity")}
            value={form.quantity}
            handleChangeText={(e) =>
              setForm({ ...form, quantity: e, remainingQuantity: e })
            }
            otherStyles="mt-7"
            keyboardType="numeric"
          />
          <View className="mt-7 flex flex-row">
            <TouchableOpacity
              style={[
                styles.optionButton,
                form.unit === "kg" && styles.selectedOption,
              ]}
              onPress={() => setForm({ ...form, unit: "kg" })}
            >
              <Text style={styles.optionText}>{t("kg")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                form.unit === "quintal" && styles.selectedOption,
              ]}
              onPress={() => setForm({ ...form, unit: "quintal" })}
            >
              <Text style={styles.optionText}>{t("quintal")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                form.unit === "ton" && styles.selectedOption,
              ]}
              onPress={() => setForm({ ...form, unit: "ton" })}
            >
              <Text style={styles.optionText}>{t("ton")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                form.unit === "crate" && styles.selectedOption,
              ]}
              onPress={() => setForm({ ...form, unit: "crate" })}
            >
              <Text style={styles.optionText}>{t("crate")}</Text>
            </TouchableOpacity>
          </View>
          <CustomButton
            title={t("addRequirement")}
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#CDE990",
    borderRadius: 10,
    marginHorizontal: 4,
  },
  optionText: {
    color: "black",
    fontSize: 16,
    fontWeight: "500",
  },
  selectedOption: {
    backgroundColor: "#4CAF50",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  toggleText: {
    fontSize: 16,
    marginRight: 5,
  },
});
export default addReq;
