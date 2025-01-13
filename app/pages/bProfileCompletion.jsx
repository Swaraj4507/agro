import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";
import CircularProgress from "react-native-circular-progress-indicator";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { storage, db } from "../../lib/fire";
import { useGlobalContext } from "../../context/GlobalProvider";
import SelectFormField from "../../components/SelectFormField";
import CustomButton from "../../components/CustomButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const bProfileCompletionStep = () => {
  // { initialUserData, onComplete }
  const { t } = useTranslation();
  const { setUser, storeUser, user: initialUserData } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    IdType: initialUserData.IdType || "",
    IdImage: initialUserData.IdImage || null,
    OrgImage: initialUserData.OrgImage || null,
    profileImage: initialUserData.profileImage || null,
  });
  const [uploadProgress, setUploadProgress] = useState({
    IdImage: 0,
    OrgImage: 0,
    profileImage: 0,
  });
  const [uploadStatus, setUploadStatus] = useState({
    IdImage: initialUserData.IdImage ? "success" : null,
    OrgImage: initialUserData.OrgImage ? "success" : null,
    profileImage: initialUserData.profileImage ? "success" : null,
  });
  const [selectedID, setSelectedID] = useState(initialUserData.IdType || "");
  const [submitted, setSubmitted] = useState(false);

  const ID = [
    { label: t("selectID"), value: "" },
    { label: t("aadharCard"), value: "Aadhar Card" },
    { label: t("panCard"), value: "Pan Card" },
  ];

  const handleIdChange = (value) => {
    setSelectedID(value);
    setForm({ ...form, IdType: value });
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
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setForm((prev) => ({ ...prev, [type]: downloadURL }));
        setUploadStatus((prev) => ({ ...prev, [type]: "success" }));
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
      console.log("Camera permission denied");
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
    }
  }, []);

  const submit = async () => {
    if (
      form.IdType === "" ||
      !form.IdImage ||
      !form.OrgImage ||
      !form.profileImage
    ) {
      setSubmitted(true);
      showToast(t("fillAllFields"), "error");

      return;
    }
    if (
      uploadStatus.IdImage !== "success" ||
      uploadStatus.OrgImage !== "success" ||
      uploadStatus.profileImage !== "success"
    ) {
      showToast(t("waitForUploads"), "error");
      return;
    }

    setSubmitting(true);

    try {
      const updatedUserData = {
        ...initialUserData,
        ...form,
        idProofUrl: form.IdImage,
        profileCompletion: true,
        profileCompletionPercentage: 100,
      };

      await updateDoc(doc(db, "users", initialUserData.uid), updatedUserData);
      await storeUser(updatedUserData);
      setUser(updatedUserData);
      router.replace("/");

      // onComplete(updatedUserData);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderUploadSection = (type, title) => (
    <View style={styles.uploadSection}>
      <View className="flex-row items-center">
        <Text className="text-base text-black font-pmedium">{title}</Text>
        {submitted && !form[type] && (
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
    <SafeAreaView className="bg-primary">
      {/* <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      > */}
      <ScrollView>
        <View style={styles.container} className="">
          <View className="flex justify-center items-center mt-3 mb-5">
            <Text className="text-3xl text-secondary font-psemibold pt-2">
              {t("appName")}
            </Text>
            <Text className="text-xm text-black font-psemibold mt-5">
              {t("buyersWaiting")}
            </Text>
            <Text className="text-xm text-black font-psemibold mt-5">
              {t("completeYourProfile")}
            </Text>
          </View>
          <View style={styles.profilePhotoSection}>
            <View className="flex-row items-center">
              <Text className="text-base text-black font-pmedium">
                {t("profilePhoto")}
              </Text>
              {submitted && !form.profileImage && (
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
              leftEmpty={!form.IdType}
              submitted={submitted}
            />
            {renderUploadSection("IdImage", t("idProofImage"))}
          </View>

          {renderUploadSection("OrgImage", t("OrgImage"))}

          <CustomButton
            title={isSubmitting ? t("submitting") : t("completeProfile")}
            handlePress={submit}
            disabled={isSubmitting}
            containerStyles={"w-full mt-4"}
          />
        </View>
      </ScrollView>
      {/* </KeyboardAvoidingView> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: wp("5%"),
  },
  profilePhotoSection: {
    alignItems: "center",
    marginBottom: hp("3%"),
  },
  profileImage: {
    width: wp("30%"),
    height: wp("30%"),
    borderRadius: wp("15%"),
    marginVertical: hp("2%"),
  },
  profileImagePlaceholder: {
    width: wp("30%"),
    height: wp("30%"),
    borderRadius: wp("15%"),
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: hp("2%"),
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
  sectionTitle: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    marginBottom: hp("2%"),
    color: "#333",
  },
  selectField: {
    marginBottom: hp("2%"),
  },
  uploadSection: {
    marginBottom: hp("2%"),
  },
  uploadContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: hp("1%"),
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

export default bProfileCompletionStep;
