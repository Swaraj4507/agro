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
} from "react-native";
import { icons } from "../../constants";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import * as ImagePicker from "expo-image-picker";
import SelectFormField from "../../components/SelectFormField";
import { app, db, storage } from "../../lib/fire";
import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { getAuth } from "firebase/auth";
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
  uploadBytes,
} from "firebase/storage";
import {
  setDoc,
  doc,
  query,
  where,
  getDocs,
  collection,
} from "firebase/firestore"; // Import setDoc and doc
import { useTranslation } from "react-i18next";

import Toast from "react-native-root-toast";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
const SignUp = () => {
  const { t } = useTranslation();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullname: "",
    orgname: "",
    mobile: "",
    address: "",
    state: "",
    pincode: "",
    IdType: "",
    IdImage: null,
    OrgImage: null,
    password: "",
    email: "",
  });
  const auth = getAuth(app);
  const [selectedID, setSelectedID] = useState("");
  const [ID, setID] = useState([
    { label: t("selectID"), value: "" },
    { label: t("aadharCard"), value: "Aadhar Card" },
    { label: t("panCard"), value: "Pan Card" },
  ]);
  const handleIdChange = (value) => {
    setSelectedID(value);
    setForm({
      ...form,
      IdType: value,
    });
  };
  const openPicker = async (selectType) => {
    // console.log(selectType);
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
      } else if (selectType === "org") {
        setForm({
          ...form,
          OrgImage: blob,
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
    console.log(form);
    if (
      form.fullname === "" ||
      form.orgname === "" ||
      form.mobile === "" ||
      form.address === "" ||
      form.state === "" ||
      form.pincode === "" ||
      form.IdType === "" ||
      form.IdImage === null ||
      form.OrgImage === null ||
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

      // Extract UID from userCredential
      const uid = userCredential.user.uid;

      const idProofRef = ref(storage, `IDProofs/${uid}`);
      await uploadBytes(idProofRef, form.IdImage);
      const OrgImageRef = ref(storage, `OrganizationImages/${uid}`);
      await uploadBytes(OrgImageRef, form.OrgImage);
      // Get the download URL of the uploaded image
      const idProofUrl = await getDownloadURL(idProofRef);
      const orgUrl = await getDownloadURL(OrgImageRef);
      console.log("done uploads");
      await setDoc(doc(db, "users", uid), {
        uid: uid,
        fullname: form.fullname,
        role: "buyer",
        mobile: form.mobile,
        email: form.email,
        address: form.address,
        state: form.state,
        pincode: form.pincode,
        idProofUrl: idProofUrl,
        OrgImage: orgUrl,
        idType: form.IdType,
        orgName: form.orgname,
        verified: false,
        registrationDate: new Date(),
      });
      console.log("done profile");
      await firebaseSignOut(auth);
      // await storeUser({
      //   uid: uid,
      //   fullname: form.fullname,
      //   role: "buyer",
      //   mobile: form.mobile,
      //   address: form.address,
      //   state: form.state,
      //   pincode: form.pincode,
      //   idProofUrl: idProofUrl,
      //   idType: form.IdType,
      //   orgName: form.orgname,
      // });
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
      // setIsLogged(true);
      // setUserType("buyer");
      router.replace("/");
    } catch (error) {
      const errorMessage = error.message || "Something went wrong";
      console.log(errorMessage);
      Toast.show(errorMessage, {
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
        <View className="flex justify-center items-center  mt-3">
          <Text className="text-4xl text-secondary font-psemibold pt-2">
            {t("appName")}
          </Text>
          <Text className="text-xm text-black font-psemibold mt-5">
            {t("buyersWaiting")}
          </Text>
        </View>

        <View
          className="w-full flex justify-start mt-4 h-full px-4 "
          style={{
            minHeight: Dimensions.get("window").height - 100,
          }}
        >
          <Text className="text-3xl font-semibold text-black mt-10 font-psemibold pt-2">
            {t("register")}
          </Text>
          <View className="flex justify-start  pt-5 flex-row gap-2 w-3/4">
            <Text className="text-lg text-gray-500 font-pregular">
              {t("haveAccount")}
            </Text>
            <Link
              href="/sign-in-b"
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
            title={t("storeOrgName")}
            value={form.orgname}
            handleChangeText={(e) => setForm({ ...form, orgname: e })}
            otherStyles="mt-7"
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
            keyboardType="email"
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
          <TouchableOpacity onPress={() => openPicker("org")}>
            <View className="mt-7 space-y-2">
              <Text className="text-base text-black font-pmedium">
                {t("OrgImage")}
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
                  {t("upload")}
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

          <CustomButton
            title={t("signUp")}
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
