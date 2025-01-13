import React, { useState, useCallback, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity,
  StyleSheet,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { images, icons } from "../../constants";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { useGlobalContext } from "../../context/GlobalProvider";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
import { app, db } from "../../lib/fire";
import { router } from "expo-router";
import { Loader } from "../../components";
import { Dropdown } from "react-native-element-dropdown";
import { useTranslation } from "react-i18next";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
  heightPercentageToDP,
} from "react-native-responsive-screen";
import Toast from "react-native-root-toast";
import { Ionicons } from "@expo/vector-icons";
import useLocationEffect from "../../hooks/useLocationEffect.js";

const Create = () => {
  const { t } = useTranslation();
  const [isSubmitting, setSubmitting] = useState(false);
  const { user, cropsList } = useGlobalContext();

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    cropName: "",
    varient: "",
    dateOfEntry: new Date().getTime(),
    photo: null,
    amount: "",
    unit: "kg",
    quantity: "",
    locationCoords: null,
    locationString: user?.address,
    useCurrentLocation: false,
    state: user?.state,
    pincode: user?.pincode,
  });

  const {
    locationState,
    loading: locationLoading,
    getCurrentLocation,
  } = useLocationEffect(user?.address, user?.state, user?.pincode);

  useEffect(() => {
    if (form.useCurrentLocation) {
      getCurrentLocation();
    }
  }, [form.useCurrentLocation, getCurrentLocation]);

  useEffect(() => {
    setForm((prevForm) => ({
      ...prevForm,
      locationCoords: locationState.locationCoords,
      locationString: form.useCurrentLocation
        ? locationState.locationString
        : user?.address,
      pincode: form.useCurrentLocation
        ? locationState.pincodeString
        : user?.pincode,
      state: form.useCurrentLocation ? locationState.stateString : user?.state,
    }));
  }, [locationState, form.useCurrentLocation, user?.address]);

  const submit = async () => {
    setSubmitted(true);
    if (
      !form.cropName ||
      !form.photo ||
      !form.amount ||
      !form.quantity ||
      !form.state ||
      !form.pincode
    ) {
      Toast.show(t("fillAllFields"), {
        duration: Toast.durations.SHORT,
        position: Toast.positions.CENTER,
        backgroundColor: "red",
      });
      // setSubmitted(false);
      return;
    }
    setSubmitting(true);
    console.log(form);
    try {
      const uid = user.uid;
      const photoUri = form.photo;

      const response = await fetch(photoUri);
      const blob = await response.blob();
      const storageRef = ref(getStorage(), `photos/${uid}/${Date.now()}`);
      await uploadBytes(storageRef, blob);
      const photoURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, "stock"), {
        uid: uid,
        cropName: form.cropName,
        dateOfEntry: form.dateOfEntry,
        status: "unchecked",
        photoURL: photoURL,
        amount: form.amount,
        unit: form.unit,
        quantity: form.quantity,
        availableQuantity: form.quantity,
        locationCoords: form.locationCoords,
        locationString: form.locationString,
        isVerified: false,
        match: false,
        mobile: user.mobile,
        timestamp: new Date(),
        sellerName: user?.fullname,
        state: form.state,
        pincode: form.pincode,
      });

      Toast.show(t("stockAdded"), {
        duration: Toast.durations.SHORT,
        position: Toast.positions.CENTER,
        backgroundColor: "green",
      });

      setForm({
        cropName: "",
        varient: "",
        photo: null,
        amount: "",
        quantity: "",
        dateOfEntry: new Date().getTime(),
        unit: "kg",
        locationCoords: null,
        locationString: user?.address,
        useCurrentLocation: false,
        state: user?.state,
        pincode: user?.pincode,
      });
      setSubmitted(false);
      router.replace("/home");
    } catch (error) {
      console.log(error);
      Toast.show(t("errorMessage"), {
        duration: Toast.durations.SHORT,
        position: Toast.positions.TOP,
        backgroundColor: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 1,
    });

    handleImagePickerResult(result);
  };

  const openCamera = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 1,
    });

    handleImagePickerResult(result);
  };

  const handleImagePickerResult = (result) => {
    if (!result.canceled) {
      setForm((prevForm) => ({
        ...prevForm,
        photo: result.assets[0].uri,
      }));
    } else {
      Toast.show(t("noImagePicked"), {
        duration: Toast.durations.SHORT,
        position: Toast.positions.TOP,
        backgroundColor: "red",
      });
    }
  };
  const deleteImage = () => {
    setForm((prevForm) => ({
      ...prevForm,
      photo: null,
    }));
    Toast.show(t("imageDeleted"), {
      duration: Toast.durations.SHORT,
      position: Toast.positions.CENTER,
      backgroundColor: "red",
    });
  };
  const isFieldEmpty = (field) => {
    // return form[field] === "";
    return !form[field];
  };
  return (
    <SafeAreaView className="bg-primary h-full">
      <Loader isLoading={locationLoading} content={t("loactionLoading")} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="h-full"
          contentContainerStyle={{ paddingBottom: hp("13%") }}
        >
          <View className="flex justify-center items-center mt-3">
            <Text className="text-4xl text-secondary font-psemibold pt-2">
              {t("appName")}
            </Text>
            <Text className="text-xm text-black font-pbold mt-5">
              {t("slogan")}
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
                {t("addYourStock")}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-base text-black font-pmedium mt-4">
                {t("cropName")}
              </Text>

              {submitted && isFieldEmpty("cropName") && (
                <Ionicons
                  name="alert-circle"
                  size={20}
                  color="red"
                  style={{ marginLeft: 8 }} // Adds some spacing
                />
              )}
            </View>
            <Dropdown
              data={cropsList.map((crop) => ({ label: t(crop), value: crop }))}
              labelField="label"
              valueField="value"
              placeholder={t("selectCrop")}
              search
              searchPlaceholder={t("search")}
              value={form.cropName}
              onChange={(item) => setForm({ ...form, cropName: item.value })}
              style={styles.dropdown}
            />

            <FormField
              title={t("variant")}
              value={form.varient}
              handleChangeText={(e) => setForm({ ...form, varient: e })}
              otherStyles="mt-7"
            />

            <View className="mt-7 space-y-2">
              <View className="flex-row items-center">
                <Text className="text-base text-black font-pmedium">
                  {t("cropImage")}
                </Text>
                {submitted && isFieldEmpty("photo") && (
                  <Ionicons
                    name="alert-circle"
                    size={24}
                    color="red"
                    style={{ marginLeft: 8 }}
                  />
                )}
              </View>
              {!form.photo ? (
                <View className="flex-row justify-between">
                  <CustomButton
                    title={t("chooseFromGallery")}
                    handlePress={openGallery}
                    containerStyles="flex-1 mr-2 bg-secondary-1 "
                    textStyles="text-sm text-black"
                  />
                  <CustomButton
                    title={t("takePhoto")}
                    handlePress={openCamera}
                    containerStyles="flex-1 ml-2 bg-secondary-1"
                    textStyles="text-sm text-black"
                  />
                </View>
              ) : (
                <View className="mt-4 relative">
                  <Image
                    source={{ uri: form.photo }}
                    style={{ width: "100%", height: 200, borderRadius: 10 }}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={deleteImage}
                  >
                    <Ionicons name="close-circle" size={30} color="white" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <FormField
              title={t("sellingAmount")}
              value={form.amount}
              handleChangeText={(e) => setForm({ ...form, amount: e })}
              otherStyles="mt-7"
              keyboardType="numeric"
              leftEmpty={isFieldEmpty("amount")}
              submitted={submitted}
            />

            <FormField
              title={t("quantity_label")}
              value={form.quantity}
              handleChangeText={(e) => setForm({ ...form, quantity: e })}
              otherStyles="mt-7"
              keyboardType="numeric"
              leftEmpty={isFieldEmpty("quantity")}
              submitted={submitted}
            />

            <View className="mt-7 flex flex-row">
              {["kg", "quintal", "ton", "crate"].map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={[
                    styles.optionButton,
                    form.unit === unit && styles.selectedOption,
                  ]}
                  onPress={() => setForm({ ...form, unit })}
                >
                  <Text style={styles.optionText}>{t(unit)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* <View className="space-y-2 mt-7">
              <Text className="text-base text-black font-pmedium">
                {t("address")}
              </Text>
              <Text className="text-base text-black">
                {form.locationString}
              </Text>
            </View> */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>{t("useCurrentLocation")}: </Text>
              <Switch
                value={form.useCurrentLocation}
                onValueChange={(value) =>
                  setForm((prevForm) => ({
                    ...prevForm,
                    useCurrentLocation: value,
                  }))
                }
              />
            </View>

            <FormField
              title={t("address")}
              value={form.locationString}
              handleChangeText={(e) => setForm({ ...form, locationString: e })}
              otherStyles=""
            />
            <View className="flex justify-start  flex-row mb-6 ">
              <FormField
                title={t("state")}
                value={form.state}
                handleChangeText={(e) => setForm({ ...form, state: e })}
                otherStyles="mt-7 flex-1 mr-1"
                formwidith="w-full"
                leftEmpty={isFieldEmpty("state")}
                submitted={submitted}
              />

              <FormField
                title={t("pincode")}
                value={form.pincode}
                handleChangeText={(e) => setForm({ ...form, pincode: e })}
                otherStyles="mt-7 flex-1 "
                keyboardType="numeric"
                formwidith="w-full"
                leftEmpty={isFieldEmpty("pincode")}
                submitted={submitted}
              />
            </View>

            <CustomButton
              title={t("addStock")}
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

const styles = StyleSheet.create({
  dropdown: {
    marginBottom: 4,
    backgroundColor: "#A0C334",
    height: 64,
    borderRadius: 12,
    padding: 4,
  },
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
    marginVertical: heightPercentageToDP("2%"),
  },
  toggleText: {
    fontSize: 16,
    marginRight: 5,
  },
  deleteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 15,
  },
});

export default Create;
