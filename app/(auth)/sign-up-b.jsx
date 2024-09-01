import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-root-toast";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTranslation } from "react-i18next";
import { app, db, storage } from "../../lib/fire";
import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  getAuth,
} from "firebase/auth";
import {
  setDoc,
  doc,
  query,
  where,
  getDocs,
  collection,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import SelectFormField from "../../components/SelectFormField";
import { icons } from "../../constants";
import { Image } from "expo-image";

const SignUp = () => {
  const { t } = useTranslation();
  const [isSubmitting, setSubmitting] = useState(false);
  const [isKYCModalVisible, setKYCModalVisible] = useState(false);
  const [showKYCFields, setShowKYCFields] = useState(false);
  const [isKYCStarted, setKYCStarted] = useState(false);
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
    profileCompletion: false,
    profileCompletionPercentage: 50,
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
      Toast.show("No Image Picked", {
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
    }
  };

  const submit = async (isKYCComplete) => {
    console.log(form);

    // Check if mandatory fields are filled based on KYC completion
    if (
      form.fullname === "" ||
      form.mobile === "" ||
      form.password === "" ||
      form.email === "" ||
      form.orgname === "" ||
      form.address === "" ||
      form.state === "" ||
      form.pincode === "" ||
      (isKYCComplete &&
        (form.IdType === "" || form.IdImage === null || form.OrgImage === null)) // Validate only if KYC is complete
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
          marginTop: hp("5%"),
          borderRadius: 20,
          paddingHorizontal: 20,
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

      const uid = userCredential.user.uid;

      let idProofUrl = null;
      let orgUrl = null;

      if (form.IdImage) {
        const idProofRef = ref(storage, `IDProofs/${uid}`);
        await uploadBytes(idProofRef, form.IdImage);
        idProofUrl = await getDownloadURL(idProofRef);
      }

      if (form.OrgImage) {
        const OrgImageRef = ref(storage, `OrganizationImages/${uid}`);
        await uploadBytes(OrgImageRef, form.OrgImage);
        orgUrl = await getDownloadURL(OrgImageRef);
      }

      await setDoc(doc(db, "users", uid), {
        uid: uid,
        fullname: form.fullname,
        role: "buyer",
        mobile: form.mobile,
        email: form.email,
        address: form.address,
        state: form.state,
        pincode: form.pincode,
        orgName: form.orgname,
        // ...(isKYCComplete && {

        idProofUrl: idProofUrl,
        OrgImage: orgUrl,
        idType: form.IdType,

        profileCompletion: form.profileCompletion,
        profileCompletionPercentage: form.profileCompletionPercentage,
        // }),
        verified: false,
        registrationDate: new Date(),
      });

      await firebaseSignOut(auth);
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

  const handleKYCModalChoice = (choice) => {
    setKYCModalVisible(false);
    if (choice === "yes") {
      setShowKYCFields(true);
      setKYCStarted(true); // Set KYC started flag
      setForm({
        ...form,
        profileCompletion: true,
        profileCompletionPercentage: 100,
      });
    } else {
      submit(false); // Pass false to indicate KYC not complete
    }
  };

  const handleSubmit = () => {
    if (!isKYCStarted) {
      // Show modal only if KYC process hasn't started
      setKYCModalVisible(true);
    } else {
      submit(true); // Pass true to indicate KYC complete
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
              className="text-lg font-pbold text-secondary"
            >
              {t("signIn")}
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
            title={t("password")}
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
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
          {showKYCFields && (
            <>
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
            </>
          )}

          <CustomButton
            title={isSubmitting ? t("submitting") : t("register")}
            handlePress={handleSubmit}
            disabled={isSubmitting}
          />
        </View>
      </ScrollView>

      <Modal
        visible={isKYCModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setKYCModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-secondary-1 bg-opacity-50">
          <View className="bg-white p-6 rounded-lg w-4/5">
            <Text className="text-xl font-bold mb-4">
              {t("completeKYCQuestion")}
            </Text>
            <Text className="mb-4">{t("completeKYCMessage")}</Text>
            <View className="flex flex-row justify-around mt-4">
              <CustomButton
                title={t("yes")}
                handlePress={() => handleKYCModalChoice("yes")}
              />
              <CustomButton
                title={t("later")}
                handlePress={() => handleKYCModalChoice("later")}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SignUp;
