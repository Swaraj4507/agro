import React, { useState, useCallback } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
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
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import SelectFormField from "../../components/SelectFormField";
import { icons } from "../../constants";
import { Image } from "expo-image";
import { useGlobalContext } from "../../context/GlobalProvider";

const SignUp = () => {
  const { t } = useTranslation();
  const { setUser, setIsLogged, setUserType, storeUser } = useGlobalContext();
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
  const [uploadProgress, setUploadProgress] = useState({
    IdImage: 0,
    OrgImage: 0,
  });
  const [uploadStatus, setUploadStatus] = useState({
    IdImage: null,
    OrgImage: null,
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

  const uploadImage = useCallback(
    async (blob, type) => {
      const storageRef = ref(storage, `${type}/${Date.now()}`);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress((prev) => ({ ...prev, [type]: progress }));
        },
        (error) => {
          console.error("Upload error:", error);
          setUploadStatus((prev) => ({ ...prev, [type]: "error" }));
          showToast(t("uploadError"), "error");
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setForm((prev) => ({ ...prev, [type]: downloadURL }));
          setUploadStatus((prev) => ({ ...prev, [type]: "success" }));
          showToast(t("uploadSuccess"), "success");
        }
      );
    },
    [t]
  );

  const openPicker = useCallback(
    async (selectType) => {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
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

        if (selectType === "IdImage" || selectType === "OrgImage") {
          uploadImage(blob, selectType);
        }
      } else {
        showToast(t("noImagePicked"), "error");
      }
    },
    [uploadImage, t]
  );

  const showToast = (message, type = "default") => {
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      position: Toast.positions.TOP,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0,
      backgroundColor:
        type === "error" ? "red" : type === "success" ? "#65B741" : "#333",
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
  };

  const submit = async (isKYCComplete) => {
    if (
      form.fullname === "" ||
      form.mobile === "" ||
      form.password === "" ||
      form.email === "" ||
      form.orgname === "" ||
      form.address === "" ||
      form.state === "" ||
      form.pincode === "" ||
      (isKYCComplete && (form.IdType === "" || !form.IdImage || !form.OrgImage))
    ) {
      showToast(t("fillAllFields"), "error");
      return;
    }

    if (
      isKYCComplete &&
      (uploadStatus.IdImage !== "success" ||
        uploadStatus.OrgImage !== "success")
    ) {
      showToast(t("waitForUploads"), "error");
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
        showToast(t("mobileNumberExists"), "error");
        setSubmitting(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const uid = userCredential.user.uid;

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
        idProofUrl: form.IdImage,
        OrgImage: form.OrgImage,
        idType: form.IdType,
        profileCompletion: form.profileCompletion,
        profileCompletionPercentage: form.profileCompletionPercentage,
        verified: false,
        registrationDate: new Date(),
      });
      await storeUser({
        uid: uid,
        fullname: form.fullname,
        role: "buyer",
        mobile: form.mobile,
        address: form.address,
        state: form.state,
        pincode: form.pincode,
        idProofUrl: idProofUrl,
        idType: form.IdType,
        orgName: form.orgname,
        profileCompletion: form.profileCompletion,
        profileCompletionPercentage: form.profileCompletionPercentage,
        verified: false,
      });
      setIsLogged(true);
      setUserType("buyer");
      // await firebaseSignOut(auth);
      router.replace("/");
    } catch (error) {
      const errorMessage = error.message || "Something went wrong";
      console.log(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKYCModalChoice = (choice) => {
    setKYCModalVisible(false);
    if (choice === "yes") {
      setShowKYCFields(true);
      setKYCStarted(true);
      setForm({
        ...form,
        profileCompletion: true,
        profileCompletionPercentage: 100,
      });
    } else {
      submit(false);
    }
  };

  const handleSubmit = () => {
    if (!isKYCStarted) {
      setKYCModalVisible(true);
    } else {
      submit(true);
    }
  };

  const renderUploadButton = (type) => (
    <TouchableOpacity
      onPress={() => openPicker(type)}
      style={styles.uploadButton}
    >
      <Text style={styles.uploadButtonText}>
        {t(type === "IdImage" ? "idProofImage" : "OrgImage")}
      </Text>
      <View style={styles.uploadButtonInner}>
        {uploadStatus[type] === "success" ? (
          <Image
            source={icons.checkmark}
            style={styles.uploadIcon}
            contentFit="contain"
          />
        ) : uploadProgress[type] > 0 && uploadProgress[type] < 100 ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Image
            source={icons.upload}
            style={styles.uploadIcon}
            contentFit="contain"
          />
        )}
        <Text style={styles.uploadText}>
          {uploadStatus[type] === "success"
            ? t("uploaded")
            : uploadProgress[type] > 0 && uploadProgress[type] < 100
            ? `${Math.round(uploadProgress[type])}%`
            : t("upload")}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          <Text style={styles.appName}>{t("appName")}</Text>
          <Text style={styles.subheader}>{t("buyersWaiting")}</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>{t("register")}</Text>
          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>{t("haveAccount")}</Text>
            <Link href="/sign-in-b" style={styles.loginLink}>
              {t("signIn")}
            </Link>
          </View>

          <FormField
            title={t("fullname")}
            value={form.fullname}
            handleChangeText={(e) => setForm({ ...form, fullname: e })}
            otherStyles={styles.formField}
          />

          <FormField
            title={t("storeOrgName")}
            value={form.orgname}
            handleChangeText={(e) => setForm({ ...form, orgname: e })}
            otherStyles={styles.formField}
          />

          <FormField
            title={t("mobile")}
            value={form.mobile}
            handleChangeText={(e) => setForm({ ...form, mobile: e })}
            otherStyles={styles.formField}
            keyboardType="numeric"
          />

          <FormField
            title={t("email")}
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles={styles.formField}
            keyboardType="email-address"
          />

          <FormField
            title={t("password")}
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles={styles.formField}
            secureTextEntry
          />

          <FormField
            title={t("address")}
            value={form.address}
            handleChangeText={(e) => setForm({ ...form, address: e })}
            otherStyles={styles.formField}
            // otherStyles={`formField mt-[${hp('10%')}]`}
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
                otherStyles={styles.selectField}
              />

              {renderUploadButton("IdImage")}
              {renderUploadButton("OrgImage")}
            </>
          )}

          <CustomButton
            title={isSubmitting ? t("submitting") : t("register")}
            handlePress={handleSubmit}
            disabled={
              isSubmitting ||
              (showKYCFields &&
                (uploadStatus.IdImage !== "success" ||
                  uploadStatus.OrgImage !== "success"))
            }
          />
        </View>
      </ScrollView>

      <Modal
        visible={isKYCModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setKYCModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("completeKYCQuestion")}</Text>
            <Text style={styles.modalMessage}>{t("completeKYCMessage")}</Text>
            <View style={styles.modalButtons}>
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
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    marginTop: hp("3%"),
  },
  appName: {
    fontSize: wp("8%"),
    color: "#65B741",
    fontWeight: "600",
  },
  subheader: {
    fontSize: wp("4%"),
    color: "#333",
    marginTop: hp("2%"),
  },
  formContainer: {
    paddingHorizontal: wp("5%"),
    marginTop: hp("5%"),
  },
  title: {
    fontSize: wp("8%"),
    fontWeight: "600",
    color: "#333",
    marginBottom: hp("2%"),
  },
  loginPrompt: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("3%"),
  },
  loginPromptText: {
    fontSize: wp("4%"),
    color: "#666",
  },
  loginLink: {
    fontSize: wp("4%"),
    fontWeight: "bold",
    color: "#65B741",
    marginLeft: wp("2%"),
  },
  formField: {
    marginBottom: hp("2%"),
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  selectField: {
    marginBottom: hp("2%"),
  },
  uploadButton: {
    marginBottom: hp("2%"),
  },
  uploadButtonText: {
    fontSize: wp("4%"),
    fontWeight: "500",
    color: "#333",
    marginBottom: hp("1%"),
  },
  uploadButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#A0C334",
    borderRadius: 10,
    padding: hp("2%"),
  },
  uploadIcon: {
    width: wp("5%"),
    height: wp("5%"),
    marginRight: wp("2%"),
  },
  uploadText: {
    fontSize: wp("4%"),
    color: "#fff",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: wp("5%"),
    width: wp("80%"),
    alignItems: "center",
  },
  modalTitle: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    marginBottom: hp("2%"),
    textAlign: "center",
  },
  modalMessage: {
    fontSize: wp("4%"),
    textAlign: "center",
    marginBottom: hp("3%"),
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  uploadButton: {
    marginBottom: hp("2%"),
  },
  uploadButtonText: {
    fontSize: wp("4%"),
    fontWeight: "500",
    color: "#333",
    marginBottom: hp("1%"),
  },
  uploadButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#A0C334",
    borderRadius: 10,
    padding: hp("2%"),
  },
  uploadIcon: {
    width: wp("5%"),
    height: wp("5%"),
    marginRight: wp("2%"),
  },
  uploadText: {
    fontSize: wp("4%"),
    color: "#fff",
    fontWeight: "500",
  },
});
