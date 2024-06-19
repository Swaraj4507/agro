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
import * as DocumentPicker from "expo-document-picker";
import { icons, images } from "../../constants";
// import { createUser } from "../../lib/appwrite";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
// import { createUser } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import * as ImagePicker from "expo-image-picker";
import SelectFormField from "../../components/SelectFormField";
import { app, db, storage } from "../../lib/fire";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getAuth } from "firebase/auth";
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
  uploadBytes,
} from "firebase/storage";
import { setDoc, doc } from "firebase/firestore"; // Import setDoc and doc
const SignUp = () => {
  const { setUser, setIsLogged, setUserType } = useGlobalContext();

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
    password: "",
  });
  const auth = getAuth(app);
  const [selectedID, setSelectedID] = useState("");
  const [ID, setID] = useState([
    { label: "Select ID", value: "" },
    { label: "Aadhar Card", value: "Aadhar Card" },
    { label: "Pan Card", value: "Pan Card" },
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
      }
    } else {
      setTimeout(() => {
        Alert.alert("Document picked", JSON.stringify(result, null, 2));
      }, 100);
    }
  };

  const submit = async () => {
    if (form.fullname === "" || form.mobile === "" || form.password === "") {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.mobile + "@gmail.com",
        form.password
      );

      // Extract UID from userCredential
      const uid = userCredential.user.uid;

      const idProofRef = ref(storage, `IDProofs/${uid}`);
      await uploadBytes(idProofRef, form.IdImage);

      // Get the download URL of the uploaded image
      const idProofUrl = await getDownloadURL(idProofRef);

      // Create user profile document with UID as document ID
      await setDoc(doc(db, "users", uid), {
        uid: uid,
        fullname: form.fullname,
        role: "buyer", // Assigning the role here
        mobile: form.mobile,
        address: form.address,
        state: form.state,
        pincode: form.pincode,
        idProofUrl: idProofUrl,
        idType: form.IdType,
        orgName: form.orgname,
      });

      Alert.alert("Success", "User registered successfully");
      setUser({
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
      });
      setIsLogged(true);
      setUserType("buyer");
      router.replace("/");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="flex justify-center items-center  mt-3">
          <Text className="text-4xl text-secondary font-psemibold">
            Agro tech
          </Text>
          <Text className="text-xm text-black font-psemibold mt-5">
            Farmers are waiting for you !!!!!
          </Text>
        </View>

        <View
          className="w-full flex justify-start mt-4 h-full px-4 "
          style={{
            minHeight: Dimensions.get("window").height - 100,
          }}
        >
          <Text className="text-3xl font-semibold text-black mt-10 font-psemibold">
            Register
          </Text>
          <View className="flex justify-start pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-500 font-pregular">
              Have an account already?
            </Text>
            <Link
              href="/sign-in-b"
              className="text-lg font-psemibold text-secondary"
            >
              Login
            </Link>
          </View>

          <FormField
            title="Fullname"
            value={form.fullname}
            handleChangeText={(e) => setForm({ ...form, fullname: e })}
            otherStyles="mt-10 w-[]"
          />

          <FormField
            title="Store / Organization Name"
            value={form.orgname}
            handleChangeText={(e) => setForm({ ...form, orgname: e })}
            otherStyles="mt-7"
          />
          <FormField
            title="Mobile number"
            value={form.mobile}
            handleChangeText={(e) => setForm({ ...form, mobile: e })}
            otherStyles="mt-7"
            keyboardType="numeric"
          />

          <FormField
            title="Address"
            value={form.address}
            handleChangeText={(e) => setForm({ ...form, address: e })}
            otherStyles="mt-7"
          />
          <View className="flex justify-start  flex-row mb-6 ">
            <FormField
              title="State"
              value={form.state}
              handleChangeText={(e) => setForm({ ...form, state: e })}
              otherStyles="mt-7 flex-1 mr-1"
              formwidith="w-full"
            />

            <FormField
              title="Pincode"
              value={form.pincode}
              handleChangeText={(e) => setForm({ ...form, pincode: e })}
              otherStyles="mt-7 flex-1 "
              keyboardType="numeric"
              formwidith="w-full"
            />
          </View>

          <SelectFormField
            title="ID Proof"
            value={selectedID}
            options={ID}
            handleChange={handleIdChange}
            otherStyles={{ marginBottom: 20 }}
          />
          <TouchableOpacity onPress={() => openPicker("image")}>
            <View className="mt-7 space-y-2">
              <Text className="text-base text-black font-pmedium">
                ID Proof Image
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
                  Upload {selectedID}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
          />

          <CustomButton
            title="Sign Up"
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
