import { useEffect, useState } from "react";
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
} from "react-native";
import { images, icons } from "../../constants";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { useGlobalContext } from "../../context/GlobalProvider";
import * as ImagePicker from "expo-image-picker";
import SelectFormField from "../../components/SelectFormField";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { app, db, storage } from "../../lib/fire";
import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { getAuth } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  setDoc,
  doc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { Dropdown } from "react-native-element-dropdown";
import { useTranslation } from "react-i18next";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Toast from "react-native-root-toast";
const SignUpF = () => {
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
    email: "",
  });
  const cropsList = [
    "Apple",
    "Banana",
    "Beans",
    "Beetroot",
    "Betel",
    "Bhendi",
    "Brinjal",
    "Cabbage",
    "Carrot",
    "Cauliflower",
    "Chilli",
    "Citrus",
    "Coconut",
    "Coffee",
    "Cucumber",
    "Garlic",
    "Gourds",
    "Grapes",
    "Guava",
    "Mango",
    "Mulberry",
    "Muskmelon",
    "OilPalm",
    "Onion",
    "Papaya",
    "Pomegranate",
    "Potato",
    "Radish",
    "Rose",
    "Sapota",
    "Satawar",
    "Squash",
    "Tea",
    "Tomato",
    "Turnip",
    "Watermelon",
  ];
  const auth = getAuth(app);
  const [selectedID, setSelectedID] = useState("");
  const [ID, setID] = useState([
    { label: t("selectID"), value: "" },
    { label: t("aadharCard"), value: "Aadhar Card" },
    { label: t("panCard"), value: "Pan Card" },
  ]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleIdChange = (value) => {
    setSelectedID(value);
    setForm({
      ...form,
      IdType: value,
    });
  };
  const openPicker = async (selectType) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 1,
    });

    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function () {
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", result.assets[0].uri, true);
      xhr.send(null);
    });
    if (!result.canceled) {
      if (selectType === "image") {
        setForm({
          ...form,
          IdImage: blob,
        });
      }
    } else {
      // setTimeout(() => {
      //   Alert.alert("Document picked", JSON.stringify(result, null, 2));
      // }, 100);
      Toast.show("No Image Picked", {
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
  };

  const submit = async () => {
    // console.log(form);
    if (
      form.fullname === "" ||
      form.orgname === "" ||
      form.mobile === "" ||
      form.address === "" ||
      form.state === "" ||
      form.pincode === "" ||
      form.IdType === "" ||
      form.IdImage === null ||
      form.password === "" ||
      form.email === ""
    ) {
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
      const mobileQuery = query(
        collection(db, "users"),
        where("mobile", "==", form.mobile)
      );
      const mobileSnapshot = await getDocs(mobileQuery);
      // console.log(mobileSnapshot);
      if (!mobileSnapshot.empty) {
        Toast.show(t("mobileNumberExists"), {
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
        setSubmitting(false);
        return;
      }
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const uid = userCredential.user.uid;

      const idProofRef = ref(storage, `IDProofs/${uid}`);
      await uploadBytes(idProofRef, form.IdImage);

      const idProofUrl = await getDownloadURL(idProofRef);

      // Create user profile document with UID as document ID
      await setDoc(doc(db, "users", uid), {
        uid: uid,
        fullname: form.fullname,
        role: "farmer", // Assigning the role here
        mobile: form.mobile,
        email: form.email,
        address: form.address,
        state: form.state,
        pincode: form.pincode,
        idProofUrl: idProofUrl,
        idType: form.IdType,
        verified: false,
        registrationDate: new Date(),
      });
      // Create crops data document
      const cropImageRef = ref(storage, `cropImages/${form.cropName}.jpg`);
      const cropImageUrl = await getDownloadURL(cropImageRef);

      await addDoc(collection(db, "crops"), {
        uid: uid, // Linking to user's UID
        cropName: form.cropName,
        timestamp: form.dateOfSow,
        area: form.area,
        cropImage: cropImageUrl,
      });

      await firebaseSignOut(auth);
      Toast.show(t("registrationPendingVerification"), {
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
    } catch (error) {
      console.log(error);
      const errorMessage = error.message || "Something went wrong";
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
          marginTop: hp("5%"),
          borderRadius: 20, // Custom border radius
          paddingHorizontal: 20, // Custom padding
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const setDate = (event: DateTimePickerEvent, date: Date) => {
    if (event.type === "set" && date) {
      setForm({
        ...form,
        dateOfSow: date,
      });
    }
    setShowDatePicker(false);
    // setShowDatePicker(false);
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="">
        <View className="flex justify-center items-center  mt-3">
          <Text className="text-4xl text-secondary font-psemibold pt-2">
            {t("appName")}
          </Text>
          {/* <Text className="text-4xl text-black font-bold mt-5">Register</Text> */}
          <Text className="text-xm text-black font-psemibold mt-5">
            {t("slogan")}
          </Text>
        </View>

        <View
          className="w-full flex justify-start mt-4 h-full px-4 py-4 "
          style={{
            minHeight: Dimensions.get("window").height - 100,
          }}
        >
          {/* <Image
            source={images.logo}
            resizeMode="contain"
            className="w-[115px] h-[34px]"
          /> */}
          <Text className="text-3xl font-semibold text-black mt-10 font-psemibold pt-2">
            {t("register")}
          </Text>
          <View
            className="flex justify-start pt-5 flex-row gap-2  w-3/4"
            // style={{ width: wp("90%") }}
          >
            <Text className="text-lg text-gray-500 font-pregular ">
              {t("haveAccount")}
            </Text>
            <Link
              href="/sign-in-f"
              className="text-lg font-psemibold text-secondary"
            >
              {t("login")}
            </Link>
          </View>
          <FormField
            title={t("fullname")}
            value={form.fullname}
            handleChangeText={(e) => setForm({ ...form, fullname: e })}
            otherStyles="mt-10 w-[]"
          />
          <FormField
            title={t("mobile")}
            value={form.mobile}
            handleChangeText={(e) => setForm({ ...form, mobile: e })}
            otherStyles="mt-7"
            keyboardType="numeric"
          />
          <FormField
            title={t("email")}
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="mail"
          />

          <FormField
            title={t("address")}
            value={form.address}
            handleChangeText={(e) => setForm({ ...form, address: e })}
            otherStyles="mt-7"
          />
          <View className="flex justify-start  flex-row mb-6 ">
            <FormField
              title={t("state")}
              value={form.state}
              handleChangeText={(e) => setForm({ ...form, state: e })}
              otherStyles="mt-7 flex-1 mr-1"
              formwidith="w-full"
            />

            <FormField
              title={t("pincode")}
              value={form.pincode}
              handleChangeText={(e) => setForm({ ...form, pincode: e })}
              otherStyles="mt-7 flex-1 "
              keyboardType="numeric"
              formwidith="w-full"
            />
          </View>
          <SelectFormField
            title={t("idProof")}
            value={selectedID}
            options={ID}
            handleChange={handleIdChange}
            otherStyles={{ marginBottom: 20 }}
          />
          <TouchableOpacity onPress={() => openPicker("image")}>
            <View className="mt-7 space-y-2">
              <Text className="text-base text-black font-pmedium">
                {t("idProofImage")}
              </Text>
              <View
                className="w-full 
           h-16 px-4 bg-secondary-1 rounded-2xl border-2 border-secondary-1 flex justify-center items-center flex-row space-x-2"
              >
                <Image
                  source={icons.upload}
                  resizeMode="contain"
                  alt="upload"
                  className="w-5 h-5"
                />
                <Text className="text-sm text-black font-pmedium">
                  {t("upload")} {selectedID}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          <FormField
            title={t("password")}
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
          />
          <View className="flex justify-center items-center pt-5 flex-col gap-2">
            <Text className="text-xl  text-black font-pbold">
              {t("firstCrop")}
            </Text>
          </View>

          <Text className="text-base text-black font-pmedium mt-4">
            {t("cropName")}
          </Text>
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
          <View className="space-y-2 mt-7">
            <Text className="text-base text-black font-pmedium">
              {t("dateOfSowing")}
            </Text>

            <TouchableOpacity
              className="w-full h-16 px-4 bg-secondary-1 rounded-2xl border-2 border-secondary-1 focus:border-secondary flex flex-row items-center justify-center"
              onPress={() => setShowDatePicker(true)}
            >
              <Text className="text-black font-pmedium">
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
            title={t("signUp")}
            handlePress={submit}
            containerStyles="mt-7 "
            isLoading={isSubmitting}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUpF;
