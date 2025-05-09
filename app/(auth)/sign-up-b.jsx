import React, { useState, useCallback, useRef, useEffect } from "react";
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
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Switch,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-root-toast";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTranslation } from "react-i18next";
import { app, db, storage } from "../../lib/fire";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
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
import { Loader } from "../../components";
import CircularProgress from "react-native-circular-progress-indicator";
import { Ionicons } from "@expo/vector-icons";

import useLocationEffect from "../../hooks/useLocationEffect";
const SignUp = () => {
  const { t } = useTranslation();
  const { setUser, setIsLogged, setUserType, storeUser, setIsVerified } =
    useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [isKYCModalVisible, setKYCModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const scrollViewRef = useRef(null);
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
    profileImage: null,
    password: "",
    email: "",
    profileCompletion: false,
    profileCompletionPercentage: 50,
    useCurrentLocation: false,
  });
  const {
    locationState,
    loading: locationLoading,
    getCurrentLocation,
  } = useLocationEffect(form.address, form.state, form.pincode);
  const [uploadProgress, setUploadProgress] = useState({
    IdImage: 0,
    OrgImage: 0,
    profileImage: 0,
  });
  const [uploadStatus, setUploadStatus] = useState({
    IdImage: null,
    OrgImage: null,
    profileImage: null,
  });
  const auth = getAuth(app);
  const [selectedID, setSelectedID] = useState("");
  const [ID, setID] = useState([
    { label: t("selectID"), value: "" },
    { label: t("aadharCard"), value: "Aadhar Card" },
    { label: t("panCard"), value: "Pan Card" },
  ]);
  const [submitted, setSubmitted] = useState(false);
  const handleIdChange = (value) => {
    setSelectedID(value);
    setForm({
      ...form,
      IdType: value,
    });
  };
  useEffect(() => {
    if (form.useCurrentLocation) {
      getCurrentLocation();
    }
  }, [form.useCurrentLocation, getCurrentLocation]);

  useEffect(() => {
    setForm((prevForm) => ({
      ...prevForm,
      locationCoords: locationState.locationCoords,
      address: form.useCurrentLocation
        ? locationState.locationString
        : form.address,
      pincode: form.useCurrentLocation
        ? locationState.pincodeString
        : form.pincode,
      state: form.useCurrentLocation ? locationState.stateString : form.state,
    }));
  }, [locationState, form.useCurrentLocation]);
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };
  const uploadImage = useCallback(async (blob, type) => {
    const storageRef = ref(storage, `${type}/${Date.now()}`);
    const uploadTask = uploadBytesResumable(storageRef, blob);
    // setUploadStatus((prev) => ({ ...prev, [type]: "Uploading" }));
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
  }, []);

  const openPicker = useCallback(async (selectType) => {
    setForm((prev) => ({
      ...prev,
      [selectType]: null,
    }));
    setUploadStatus((prev) => ({ ...prev, [selectType]: null }));
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setForm((prev) => ({
        ...prev,
        [selectType]: result.assets[0].uri, // Update with the local image URI
      }));
      setUploadStatus((prev) => ({ ...prev, [selectType]: "selected" }));
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

      uploadImage(blob, selectType);
    } else {
      showToast(t("noImagePicked"), "error");
    }
  }, []);

  const openCamera = useCallback(async (selectType) => {
    setForm((prev) => ({
      ...prev,
      [selectType]: null,
    }));
    setUploadStatus((prev) => ({ ...prev, [selectType]: null }));
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      showToast(t("cameraPermissionDenied"), "error");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setForm((prev) => ({
        ...prev,
        [selectType]: result.assets[0].uri, // Update with the local image URI
      }));
      setUploadStatus((prev) => ({ ...prev, [selectType]: "selected" }));
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

      uploadImage(blob, selectType);
    } else {
      showToast(t("noPhotoTaken"), "error");
    }
  }, []);

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

  const submit = async () => {
    if (currentStep === 3 && (form.IdType === "" || !form.IdImage)) {
      setSubmitted(true);
    }

    if (
      form.fullname === "" ||
      form.mobile === "" ||
      form.password === "" ||
      form.email === "" ||
      form.address === "" ||
      form.state === "" ||
      form.pincode === "" ||
      (currentStep === 3 && (form.IdType === "" || !form.IdImage))
    ) {
      showToast(t("fillAllFields"), "error");
      return;
    }

    if (
      currentStep === 3 &&
      (uploadStatus.IdImage !== "success" ||
        uploadStatus.profileImage !== "success")
    ) {
      showToast(t("waitForUploads"), "error");
      return;
    }
    if (
      currentStep === 3 &&
      uploadStatus.IdImage === "success" &&
      uploadStatus.OrgImage === "success" &&
      uploadStatus.profileImage === "success"
    ) {
      const updatedForm = {
        ...form,
        profileCompletion: true,
        profileCompletionPercentage: 100,
      };

      // Save to Firestore after state is updated
      saveToFirestore(updatedForm);
    } else {
      saveToFirestore(form); // If no profile completion change, save current form state
    }
  };

  const saveToFirestore = async (updatedForm) => {
    setSubmitting(true);

    try {
      const mobileQuery = query(
        collection(db, "users"),
        where("mobile", "==", updatedForm.mobile)
      );
      const mobileSnapshot = await getDocs(mobileQuery);

      if (!mobileSnapshot.empty) {
        showToast(t("mobileNumberExists"), "error");
        setSubmitting(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        updatedForm.email,
        updatedForm.password
      );

      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        uid: uid,
        fullname: updatedForm.fullname,
        role: "buyer",
        mobile: updatedForm.mobile,
        email: updatedForm.email,
        address: updatedForm.address,
        state: updatedForm.state,
        pincode: updatedForm.pincode,
        orgName: updatedForm.orgname,
        idProofUrl: updatedForm.IdImage,
        OrgImage: updatedForm.OrgImage,
        profileImage: updatedForm.profileImage,
        idType: updatedForm.IdType,
        profileCompletion: updatedForm.profileCompletion,
        profileCompletionPercentage: updatedForm.profileCompletionPercentage,
        verified: false,
        registrationDate: new Date(),
      });
      await storeUser({
        uid: uid,
        fullname: updatedForm.fullname,
        role: "buyer",
        mobile: updatedForm.mobile,
        address: updatedForm.address,
        email: updatedForm.email,
        state: updatedForm.state,
        pincode: updatedForm.pincode,
        idProofUrl: updatedForm.IdImage,
        idType: updatedForm.IdType,
        orgName: updatedForm.orgname,
        profileImage: updatedForm.profileImage,
        profileCompletion: updatedForm.profileCompletion,
        profileCompletionPercentage: updatedForm.profileCompletionPercentage,
        verified: false,
      });

      setIsLogged(true);
      setUserType("buyer");
      setIsVerified(false);

      router.replace("/");
      router.dismissAll();
    } catch (error) {
      const errorMessage = error.message || "Something went wrong";
      console.log(errorMessage);
      showToast(errorMessage, "error");
      setCurrentStep(1);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKYCModalChoice = (choice) => {
    setKYCModalVisible(false);
    if (choice === "yes") {
      setCurrentStep(3);
      // setForm({
      //   ...form,
      //   profileCompletion: true,
      //   profileCompletionPercentage: 100,
      // });
      scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
    } else {
      submit();
    }
  };
  const isFieldEmpty = (field) => {
    // return form[field] === "";
    return !form[field];
  };

  const handleNextStep = () => {
    setSubmitted(true);

    if (currentStep === 1) {
      if (
        form.fullname === "" ||
        form.orgname === "" ||
        form.mobile === "" ||
        form.email === "" ||
        form.password === ""
      ) {
        showToast(t("fillAllFields"), "error");
        return;
      }
      setSubmitted(false);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (form.address === "" || form.state === "" || form.pincode === "") {
        showToast(t("fillAllFields"), "error");
        return;
      }
      if (
        form.IdType === "" &&
        form.IdImage === null &&
        form.OrgImage === null &&
        form.profileImage === null
      ) {
        setKYCModalVisible(true);
      } else {
        setCurrentStep(3);
      }

      setSubmitted(false);
    }
    scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
    }
  };

  const renderStep1 = () => (
    <>
      <FormField
        title={t("fullname")}
        value={form.fullname}
        handleChangeText={(e) => setForm({ ...form, fullname: e })}
        leftEmpty={isFieldEmpty("fullname")}
        submitted={submitted}
        otherStyles={styles.formField}
      />

      <FormField
        title={t("storeOrgName")}
        value={form.orgname}
        handleChangeText={(e) => setForm({ ...form, orgname: e })}
        leftEmpty={isFieldEmpty("orgname")}
        submitted={submitted}
        otherStyles={styles.formField}
      />

      <FormField
        title={t("mobile")}
        value={form.mobile}
        handleChangeText={(e) => setForm({ ...form, mobile: e })}
        otherStyles={styles.formField}
        keyboardType="numeric"
        leftEmpty={isFieldEmpty("mobile")}
        submitted={submitted}
      />

      <FormField
        title={t("email")}
        value={form.email}
        handleChangeText={(e) => setForm({ ...form, email: e })}
        otherStyles={styles.formField}
        keyboardType="email-address"
        leftEmpty={isFieldEmpty("email")}
        submitted={submitted}
      />

      <FormField
        title={t("password")}
        value={form.password}
        handleChangeText={(e) => setForm({ ...form, password: e })}
        otherStyles={styles.formField}
        leftEmpty={isFieldEmpty("password")}
        submitted={submitted}
      />
    </>
  );

  const renderStep2 = () => (
    <>
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
        value={form.address}
        handleChangeText={(e) => setForm({ ...form, address: e })}
        otherStyles={styles.formField}
        leftEmpty={isFieldEmpty("address")}
        submitted={submitted}
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
    </>
  );

  const renderStep3 = () => {
    const renderUploadSection = (type, title) => (
      <View style={styles.uploadSection}>
        {/* <Text style={styles.uploadTitle}>{title}</Text> */}
        <View className="flex-row items-center">
          <Text className="text-base text-black font-pmedium">{title}</Text>

          {submitted && isFieldEmpty(type) && (
            <Ionicons
              name="alert-circle"
              size={24}
              color="red"
              style={{ marginLeft: 8 }} // Adds some spacing
            />
          )}
        </View>
        <View style={styles.uploadContent}>
          {form[type] && uploadStatus[type] === "selected" ? (
            // Show a preview of the selected image if available
            <>
              <Image
                source={{ uri: form[type] }} // Show the local image URI
                style={styles.previewImage}
              />
              <CircularProgress
                value={uploadProgress[type]}
                radius={30}
                duration={1000}
                progressValueColor={"#333"}
                maxValue={100}
                title={"%"}
                titleColor={"#333"}
                titleStyle={{ fontWeight: "bold" }}
              />
            </>
          ) : (
            <CircularProgress
              value={uploadProgress[type]}
              radius={30}
              duration={1000}
              progressValueColor={"#333"}
              maxValue={100}
              title={"%"}
              titleColor={"#333"}
              titleStyle={{ fontWeight: "bold" }}
            />
          )}
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => openPicker(type)}
          >
            <Ionicons
              name={
                uploadStatus[type] === "success"
                  ? "checkmark-circle"
                  : "cloud-upload"
              }
              size={24}
              color="#fff"
            />
            <Text style={styles.uploadButtonText}>
              {uploadStatus[type] === "success" ? t("uploaded") : t("upload")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );

    return (
      <View style={styles.step3Container}>
        <View style={styles.profilePhotoSection}>
          {/* <Text style={styles.sectionTitle}>{t("profilePhoto")}</Text> */}
          <View className="flex-row items-center">
            <Text className="text-base text-black font-pmedium">
              {t("profilePhoto")}
            </Text>

            {/* Conditionally render the alert icon beside the title if the field is empty */}
            {submitted && isFieldEmpty("profileImage") && (
              <Ionicons
                name="alert-circle"
                size={24}
                color="red"
                style={{ marginLeft: 8 }} // Adds some spacing
              />
            )}
          </View>
          {form.profileImage ? (
            <Image
              source={{ uri: form.profileImage }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImagePlaceholderText}>
                {t("noPhotoYet")}
              </Text>
            </View>
          )}
          <View style={styles.photoButtons}>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={() => openCamera("profileImage")}
            >
              <Ionicons name="camera" size={24} color="#fff" />
              <Text style={styles.photoButtonText}>{t("takePhoto")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={() => openPicker("profileImage")}
            >
              <Ionicons name="images" size={24} color="#fff" />
              <Text style={styles.photoButtonText}>
                {t("chooseFromGallery")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.idSection}>
          <SelectFormField
            title={t("idProof")}
            value={selectedID}
            options={ID}
            handleChange={handleIdChange}
            otherStyles={styles.selectField}
            leftEmpty={isFieldEmpty("IdType")}
            submitted={submitted}
          />
          {renderUploadSection("IdImage", t("idProofImage"))}
        </View>

        {renderUploadSection("OrgImage", t("OrgImage"))}
      </View>
    );
  };
  if (locationLoading) {
    return <Loader isLoading={true} content={t("loactionLoading")} />;
  }
  if (isSubmitting) {
    return <Loader isLoading={true} />;
  }
  return (
    <SafeAreaView style={styles.container}>
      {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.appName} className="font-psemibold">
              {t("appName")}
            </Text>
            <Text style={styles.subheader} className="font-psemibold">
              {t("buyersWaiting")}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title} className="font-psemibold">
              {t("register")}
            </Text>
            <View style={styles.loginPrompt} className="mb-5">
              <Text style={styles.loginPromptText} className="font-pregular">
                {t("haveAccount")}
              </Text>
              <Link href="/sign-in-b" style={styles.loginLink}>
                {t("signIn")}
              </Link>
            </View>

            <View style={styles.stepIndicator} className="mb-1">
              <View
                style={[styles.step, currentStep >= 1 && styles.activeStep]}
              />
              <View
                style={[styles.step, currentStep >= 2 && styles.activeStep]}
              />
              <View
                style={[styles.step, currentStep >= 3 && styles.activeStep]}
              />
            </View>

            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            <View style={styles.buttonContainer}>
              {currentStep > 1 && (
                <CustomButton
                  title={t("previous")}
                  handlePress={handlePrevStep}
                  containerStyles={"w-40p"}
                />
              )}
              {currentStep < 3 ? (
                <CustomButton
                  title={t("next")}
                  handlePress={handleNextStep}
                  containerStyles={"w-40p"}
                />
              ) : (
                <CustomButton
                  title={t("register")}
                  handlePress={submit}
                  disabled={isSubmitting}
                  containerStyles={"w-40p"}
                  isLoading={isSubmitting}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {/* </TouchableWithoutFeedback> */}

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
                containerStyles={"w-30p"}
              />
              <CustomButton
                title={t("later")}
                handlePress={() => handleKYCModalChoice("later")}
                containerStyles={"w-30p"}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

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
    marginTop: hp("2%"),
    // marginBottom: hp("4%"),
  },
  appName: {
    fontSize: wp("8%"),
    color: "#65B741",
    fontWeight: "600",
  },
  subheader: {
    fontSize: wp("3%"),
    color: "#333",
    marginTop: hp("2%"),
  },
  formContainer: {
    paddingHorizontal: wp("5%"),
    marginTop: hp("5%"),
  },
  title: {
    fontSize: wp("6%"),
    fontWeight: "600",
    color: "#333",
    // marginBottom: hp("2%"),
  },
  loginPrompt: {
    flexDirection: "row",
    alignItems: "center",
    // marginBottom: hp("%"),
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
  modalButton: {
    width: wp("30%"),
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: hp("3%"),
  },
  step: {
    width: wp("10%"),
    height: hp("1%"),
    backgroundColor: "#ddd",
    marginHorizontal: wp("1%"),
    borderRadius: 5,
  },
  activeStep: {
    backgroundColor: "#65B741",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: hp("3%"),
  },
  navigationButton: {
    width: wp("40%"),
  },
  photoUploadContainer: {
    marginBottom: hp("2%"),
  },
  photoUploadTitle: {
    fontSize: wp("4%"),
    fontWeight: "500",
    color: "#333",
    marginBottom: hp("1%"),
  },
  photoUploadButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  photoButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#A0C334",
    borderRadius: 10,
    padding: hp("2%"),
    marginHorizontal: wp("1%"),
  },
  photoButtonIcon: {
    width: wp("8%"),
    height: wp("8%"),
    marginBottom: hp("1%"),
  },
  photoButtonText: {
    fontSize: wp("3%"),
    color: "#fff",
    fontWeight: "500",
    textAlign: "center",
  },
  profileImageContainer: {
    alignItems: "center",
    marginTop: hp("2%"),
  },
  profileImage: {
    width: wp("30%"),
    height: wp("30%"),
    borderRadius: wp("15%"),
  },
  step3Container: {
    marginBottom: hp("3%"),
  },
  sectionTitle: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    marginBottom: hp("2%"),
    color: "#333",
  },
  profilePhotoSection: {
    alignItems: "center",
    marginBottom: hp("3%"),
  },
  profileImage: {
    width: wp("30%"),
    height: wp("30%"),
    borderRadius: wp("15%"),
    marginBottom: hp("2%"),
  },
  profileImagePlaceholder: {
    width: wp("30%"),
    height: wp("30%"),
    borderRadius: wp("15%"),
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp("2%"),
  },
  profileImagePlaceholderText: {
    color: "#999",
    textAlign: "center",
  },
  photoButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  photoButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#A0C334",
    borderRadius: 10,
    padding: hp("1.5%"),
    width: "45%",
  },
  photoButtonIcon: {
    marginBottom: hp("1%"),
  },
  photoButtonText: {
    fontSize: wp("3%"),
    color: "#fff",
    fontWeight: "500",
  },
  idSection: {
    marginBottom: hp("3%"),
  },
  selectField: {
    marginBottom: hp("2%"),
  },
  uploadSection: {
    marginBottom: hp("2%"),
  },
  uploadTitle: {
    fontSize: wp("4%"),
    fontWeight: "500",
    color: "#333",
    marginBottom: hp("1%"),
  },
  uploadContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#A0C334",
    borderRadius: 10,
    padding: hp("2%"),
    flex: 1,
    marginLeft: wp("3%"),
  },
  uploadButtonText: {
    fontSize: wp("4%"),
    color: "#fff",
    fontWeight: "500",
    marginLeft: wp("2%"),
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
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

export default SignUp;
