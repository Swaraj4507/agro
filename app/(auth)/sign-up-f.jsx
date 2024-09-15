import React, { useState, useCallback, useRef } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  Modal,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { Image } from "expo-image";
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
  addDoc,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import SelectFormField from "../../components/SelectFormField";
import { images, icons } from "../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";
import { Loader } from "../../components";
import CircularProgress from "react-native-circular-progress-indicator";
import { Ionicons } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import RNDateTimePicker from "@react-native-community/datetimepicker";

const SignUpF = () => {
  const { t } = useTranslation();
  const { setUser, setIsLogged, setUserType, storeUser, setIsVerified } =
    useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [isKYCModalVisible, setKYCModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const scrollViewRef = useRef(null);
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
    profileCompletion: false,
    profileCompletionPercentage: 50,
    profileImage: null,
  });
  const [uploadProgress, setUploadProgress] = useState({
    IdImage: 0,
  });
  const [uploadStatus, setUploadStatus] = useState({
    IdImage: null,
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
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  const handleIdChange = (value) => {
    setSelectedID(value);
    setForm({
      ...form,
      IdType: value,
    });
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
  const openCamera = useCallback(async (selectType) => {
    setForm((prev) => ({
      ...prev,
      [selectType]: null, // Update with the local image URI
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
    console.log(uploadStatus);

    if (
      currentStep === 3 &&
      uploadStatus.IdImage === "success" &&
      uploadStatus.profileImage === "success"
    ) {
      setForm((prevForm) => ({
        ...prevForm,
        profileCompletion: true,
        profileCompletionPercentage: 100,
      }));

      // return;
    }
    // console.log(form);
    // return;
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
        setCurrentStep(1);
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
        role: "farmer",
        mobile: form.mobile,
        email: form.email,
        address: form.address,
        state: form.state,
        pincode: form.pincode,
        idProofUrl: form.IdImage,
        idType: form.IdType,
        profileCompletion: form.profileCompletion,
        profileCompletionPercentage: form.profileCompletionPercentage,
        verified: false,
        registrationDate: new Date(),
        profileImage: form.profileImage,
      });

      const cropImageRef = ref(storage, `cropImages/${form.cropName}.jpg`);
      const cropImageUrl = await getDownloadURL(cropImageRef);

      await addDoc(collection(db, "crops"), {
        uid: uid,
        cropName: form.cropName,
        timestamp: form.dateOfSow,
        area: form.area,
        cropImage: cropImageUrl,
      });

      await storeUser({
        uid: uid,
        fullname: form.fullname,
        role: "farmer",
        mobile: form.mobile,
        address: form.address,
        email: form.email,
        state: form.state,
        pincode: form.pincode,
        idProofUrl: form.IdImage,
        idType: form.IdType,
        profileCompletion: form.profileCompletion,
        profileCompletionPercentage: form.profileCompletionPercentage,
        verified: false,
        profileImage: form.profileImage,
      });

      setIsLogged(true);
      setUserType("farmer");
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
    return !form[field];
  };

  const handleNextStep = () => {
    setSubmitted(true);

    if (currentStep === 1) {
      if (
        form.fullname === "" ||
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
      if (
        form.address === "" ||
        form.state === "" ||
        form.pincode === "" ||
        form.cropName === "" ||
        form.dateOfSow === null ||
        form.area === ""
      ) {
        showToast(t("fillAllFields"), "error");
        return;
      }
      // console.log(form);
      if (
        form.IdType === "" &&
        form.IdImage === null &&
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
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
    }
  };

  const setDate = (event, date) => {
    if (event.type === "set" && date) {
      setForm({
        ...form,
        dateOfSow: date,
      });
    }
    setShowDatePicker(false);
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
      <FormField
        title={t("address")}
        value={form.address}
        handleChangeText={(e) => setForm({ ...form, address: e })}
        otherStyles={styles.formField}
        leftEmpty={isFieldEmpty("address")}
        submitted={submitted}
      />
      <View className="flex justify-start flex-row mb-6">
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
          otherStyles="mt-7 flex-1"
          keyboardType="numeric"
          formwidith="w-full"
          leftEmpty={isFieldEmpty("pincode")}
          submitted={submitted}
        />
      </View>
      <View className="flex justify-center items-center pt-2 flex-col gap-2">
        <Text className="text-xl  text-black font-pbold">{t("firstCrop")}</Text>
      </View>
      {/* <Text className="text-base text-black font-pmedium mt-4">
        {t("cropName")}
      </Text> */}
      <View className="flex-row items-center">
        <Text className="text-base text-black font-pmedium mt-4">
          {t("cropName")}
        </Text>

        {submitted && isFieldEmpty("cropName") && (
          <Ionicons
            name="alert-circle"
            size={24}
            color="red"
            style={{ marginLeft: 8 }} // Adds some spacing
          />
        )}
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
        leftEmpty={isFieldEmpty("area")}
        submitted={submitted}
      />
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
            <>
              <Image source={{ uri: form[type] }} style={styles.previewImage} />
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

        {/* {renderUploadSection("OrgImage", t("organizationImage"))} */}
      </View>
    );
  };
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
          // keyboardShouldPersistTaps={currentStep < 3 ? "handled" : false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.appName} className="font-psemibold">
              {t("appName")}
            </Text>
            <Text style={styles.subheader} className="font-psemibold">
              {t("slogan")}
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
    fontSize: wp("6%"),
    fontWeight: "600",
    color: "#333",
    // marginBottom: hp("2%"),
  },
  loginPrompt: {
    flexDirection: "row",
    alignItems: "center",
    // marginBottom: hp("3%"),
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
    // marginBottom: hp("3%"),
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
    marginBottom: hp("1%"),
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
});

export default SignUpF;
