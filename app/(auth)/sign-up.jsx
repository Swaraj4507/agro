import React, { useState, useCallback, useRef, useEffect } from "react";
import { Link, router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  Modal,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-root-toast";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTranslation } from "react-i18next";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import SelectFormField from "../../components/SelectFormField";
import { Loader } from "../../components";
import CircularProgress from "react-native-circular-progress-indicator";
import { Ionicons } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import useLocationEffect from "../../hooks/useLocationEffect";
import axios from "axios";
import { uploadFile } from "../../api/upload";
import apiClient from "../../api/axiosInstance";

const SignUp = () => {
    const { userType } = useLocalSearchParams();
  const { t } = useTranslation();
  const [isSubmitting, setSubmitting] = useState(false);
  const [isKYCModalVisible, setKYCModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const scrollViewRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
    password: "",
    email: "",
    userType: userType,
    orgName: "",
    orgImage: null,
    profileImage: null,
    idType: "",
    idProofUrl: null,
    addressLine: "",
    landmark: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    latitude: 0,
    longitude: 0,
    profileCompletion: false,
    profileCompletionPercentage: 50,
    useCurrentLocation: false,
  });

  const {
    locationState,
    loading: locationLoading,
    getCurrentLocation,
  } = useLocationEffect(
    form.addressLine,
    form.state,
    form.pincode,
    form.city,
    form.district
  );

  const [uploadProgress, setUploadProgress] = useState({
    idProofUrl: 0,
    orgImage: 0,
    profileImage: 0,
  });

  const [uploadStatus, setUploadStatus] = useState({
    idProofUrl: null,
    orgImage: null,
    profileImage: null,
  });

  const [selectedID, setSelectedID] = useState("");
  const [ID, setID] = useState([
    { label: t("selectID"), value: "" },
    { label: t("aadharCard"), value: "Aadhar Card" },
    { label: t("panCard"), value: "Pan Card" },
  ]);

  const [submitted, setSubmitted] = useState(false);

  // Add handleIdChange function
  const handleIdChange = (value) => {
    setSelectedID(value);
    setForm(prev => ({
      ...prev,
      idType: value,
    }));
  };

  // Update uploadImage function
  const uploadImage = useCallback(async (uri, type) => {
    try {
      setUploadStatus((prev) => ({ ...prev, [type]: "uploading" }));

      // Create a file object from the URI
      const filename = uri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const ext = match?.[1] || "jpg";
      const fileType = `image/${ext}`;

      const file = {
        uri,
        name: filename,
        type: fileType,
      };

      // Use a proper folder structure based on the type
      const folder = type === "profileImage" ? "profiles" : 
                    type === "idProofUrl" ? "id-proofs" : 
                    "organization";
                    
      const response = await uploadFile(file, folder);
      console.log("Upload response:", response);
      setForm((prev) => ({ ...prev, [type]: response }));
      setUploadStatus((prev) => ({ ...prev, [type]: "success" }));
      setUploadProgress((prev) => ({ ...prev, [type]: 100 }));
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus((prev) => ({ ...prev, [type]: "error" }));
    }
  }, []);

  // Add API error handler
  const handleApiError = (error) => {
    console.error('API Error:', error);
    const errorMessage = error.response?.data || error.message || t("uploadError");
    showToast(errorMessage, "error");
  };

  // Handle image picker
  const openPicker = useCallback(async (selectType) => {
    try {
      setForm(prev => ({ ...prev, [selectType]: null }));
      setUploadStatus(prev => ({ ...prev, [selectType]: null }));
      
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast(t("galleryPermissionDenied"), "error");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setForm(prev => ({ ...prev, [selectType]: result.assets[0].uri }));
        setUploadStatus(prev => ({ ...prev, [selectType]: "selected" }));
        uploadImage(result.assets[0].uri, selectType);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      showToast(t("imagePickerError"), "error");
    }
  }, []);

  // Handle camera capture
  const openCamera = useCallback(async (selectType) => {
    try {
      setForm(prev => ({ ...prev, [selectType]: null }));
      setUploadStatus(prev => ({ ...prev, [selectType]: null }));
      
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        showToast(t("cameraPermissionDenied"), "error");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setForm(prev => ({ ...prev, [selectType]: result.assets[0].uri }));
        setUploadStatus(prev => ({ ...prev, [selectType]: "selected" }));
        uploadImage(result.assets[0].uri, selectType);
      }
    } catch (error) {
      console.error("Camera error:", error);
      showToast(t("cameraError"), "error");
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
      backgroundColor: type === "error" ? "red" : type === "success" ? "#65B741" : "#333",
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

  const handleSubmit = async () => {
    if (currentStep === 3 && (form.idType === "" || !form.idProofUrl)) {
      setSubmitted(true);
      return;
    }

    if (
      form.name === "" ||
      form.phoneNumber === "" ||
      form.password === "" ||
      form.email === "" ||
      form.addressLine === "" ||
      form.state === "" ||
      form.pincode === "" ||
      form.city === "" ||
      form.district === "" ||
      (currentStep === 3 && (form.idType === "" || !form.idProofUrl))
    ) {
      showToast(t("fillAllFields"), "error");
      return;
    }

    if (
      currentStep === 3 &&
      (uploadStatus.idProofUrl !== "success" ||
        uploadStatus.profileImage !== "success" ||
        (userType === "buyer" && uploadStatus.orgImage !== "success"))
    ) {
      showToast(t("waitForUploads"), "error");
      return;
    }

    setSubmitting(true);
    try {
      // Prepare registration data according to the API requirements
      const registrationData = {
        name: form.name,
        phoneNumber: form.phoneNumber,
        password: form.password,
        email: form.email,
        userType: form.userType.toUpperCase(),
        orgName: form.orgName || "",
        orgImage: form.orgImage || "",
        profileImage: form.profileImage || "",
        idType: form.idType,
        idProofUrl: form.idProofUrl || "",
        address: {
          contactName: form.name, // Using name from step 1
          contactMobile: form.phoneNumber, // Using phone number from step 1
          addressLine: form.addressLine,
          landmark: form.landmark,
          city: form.city,
          district: form.district,
          state: form.state,
          pincode: form.pincode,
          latitude: locationState.locationCoords?.latitude || 0,
          longitude: locationState.locationCoords?.longitude || 0
        },
        profileCompletion: true,
        profileCompletionPercentage: 100
      };

      // Remove organization fields for farmers
      if (userType === "farmer") {
        delete registrationData.orgName;
        delete registrationData.orgImage;
      }

      console.log("Registration Data:", registrationData);

      // Make the API call
      const response = await apiClient.post(`/users/register`, registrationData);
      console.log("Registration Response:", response.data);

      showToast(t("registrationSuccess"), "success");
      router.replace("/");
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.message || error.message || t("registrationError");
      showToast(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };
  useEffect(() => {
    if (form.useCurrentLocation) {
      getCurrentLocation().then((locationData) => {
        if (locationData) {
          setForm(prev => ({
            ...prev,
            addressLine: locationData.locationString,
            state: locationData.stateString,
            pincode: locationData.pincodeString,
            city: locationData.cityString,
            district: locationData.districtString,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
          }));
        }
      });
    }
  }, [form.useCurrentLocation, getCurrentLocation]);
  
  const renderStep1 = () => (
    <>
      <FormField
        title={t("fullname")}
        value={form.name}
        handleChangeText={(e) => setForm({ ...form, name: e })}
        leftEmpty={isFieldEmpty("name")}
        submitted={submitted}
        otherStyles={styles.formField}
      />

      {userType === "buyer" && (
        <FormField
          title={t("storeOrgName")}
          value={form.orgName}
          handleChangeText={(e) => setForm({ ...form, orgName: e })}
          leftEmpty={isFieldEmpty("orgName")}
          submitted={submitted}
          otherStyles={styles.formField}
        />
      )}

      <FormField
        title={t("mobile")}
        value={form.phoneNumber}
        handleChangeText={(e) => setForm({ ...form, phoneNumber: e })}
        otherStyles={styles.formField}
        keyboardType="numeric"
        leftEmpty={isFieldEmpty("phoneNumber")}
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
          onValueChange={(value) => {
            setForm(prev => ({
              ...prev,
              useCurrentLocation: value,
              ...(value ? {} : {
                addressLine: "",
                state: "",
                pincode: "",
                city: "",
                district: "",
                latitude: 0,
                longitude: 0,
              }),
            }));
          }}
        />
      </View>

      <FormField
        title={t("address")}
        value={form.addressLine}
        handleChangeText={(e) => setForm({ ...form, addressLine: e })}
        otherStyles={styles.formField}
        leftEmpty={isFieldEmpty("addressLine")}
        submitted={submitted}
      />

      <FormField
        title={t("landmark")}
        value={form.landmark}
        handleChangeText={(e) => setForm({ ...form, landmark: e })}
        otherStyles={styles.formField}
        leftEmpty={isFieldEmpty("landmark")}
        submitted={submitted}
      />

      <View className="flex justify-start flex-row mb-6">
        <FormField
          title={t("city")}
          value={form.city}
          handleChangeText={(e) => setForm({ ...form, city: e })}
          otherStyles="mt-7 flex-1 mr-1"
          formwidith="w-full"
          leftEmpty={isFieldEmpty("city")}
          submitted={submitted}
        />

        <FormField
          title={t("district")}
          value={form.district}
          handleChangeText={(e) => setForm({ ...form, district: e })}
          otherStyles="mt-7 flex-1"
          formwidith="w-full"
          leftEmpty={isFieldEmpty("district")}
          submitted={submitted}
        />
      </View>

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
    </>
  );

  const renderStep3 = () => {
    const renderUploadSection = (type, title) => (
      <View style={styles.uploadSection}>
        <View className="flex-row items-center">
          <Text className="text-base text-black font-pmedium">{title}</Text>
          {submitted && isFieldEmpty(type) && (
            <Ionicons
              name="alert-circle"
              size={24}
              color="red"
              style={{ marginLeft: 8 }}
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
          <View className="flex-row items-center">
            <Text className="text-base text-black font-pmedium">
              {t("profilePhoto")}
            </Text>
            {submitted && isFieldEmpty("profileImage") && (
              <Ionicons
                name="alert-circle"
                size={24}
                color="red"
                style={{ marginLeft: 8 }}
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
            leftEmpty={isFieldEmpty("idType")}
            submitted={submitted}
          />
          {renderUploadSection("idProofUrl", t("idProofImage"))}
        </View>

        {userType === "buyer" && renderUploadSection("orgImage", t("OrgImage"))}
      </View>
    );
  };

  const isFieldEmpty = (field) => {
    return !form[field];
  };

  const handleNextStep = () => {
    setSubmitted(true);

    if (currentStep === 1) {
      if (
        form.name === "" ||
        form.phoneNumber === "" ||
        form.email === "" ||
        form.password === "" ||
        (userType === "buyer" && form.orgName === "")
      ) {
        showToast(t("fillAllFields"), "error");
        return;
      }
      setSubmitted(false);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (
        form.addressLine === "" ||
        form.state === "" ||
        form.pincode === "" ||
        form.city === "" ||
        form.landmark === ""
      ) {
        showToast(t("fillAllFields"), "error");
        return;
      }
      if (
        form.idType === "" &&
        form.idProofUrl === null &&
        form.profileImage === null &&
        (userType === "buyer" ? form.orgImage === null : true)
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

  if (locationLoading) {
    return <Loader isLoading={true} content={t("loactionLoading")} />;
  }
  if (isSubmitting) {
    return <Loader isLoading={true} />;
  }

  return (
    <SafeAreaView style={styles.container}>
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
              {t(userType === "farmer" ? "slogan" : "buyersWaiting")}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title} className="font-psemibold">
              {t("register")} as {userType === "farmer" ? "Farmer" : "Buyer"}
            </Text>
            <View style={styles.loginPrompt} className="mb-5">
              <Text style={styles.loginPromptText} className="font-pregular">
                {t("haveAccount")}
              </Text>
              <Link href={`/sign-in-${userType === "farmer" ? "f" : "b"}`} style={styles.loginLink}>
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
                  handlePress={handleSubmit}
                  containerStyles={"w-40p"}
                  isLoading={isSubmitting}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
                handlePress={() => {
                  setKYCModalVisible(false);
                  setCurrentStep(3);
                  scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
                }}
                containerStyles={"w-30p"}
              />
              <CustomButton
                title={t("later")}
                handlePress={() => {
                  setKYCModalVisible(false);
                  handleSubmit();
                }}
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
  },
  loginPrompt: {
    flexDirection: "row",
    alignItems: "center",
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
  uploadSection: {
    marginBottom: hp("2%"),
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