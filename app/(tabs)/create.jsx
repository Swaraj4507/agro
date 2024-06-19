import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Alert,
  Image,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from "react-native";
import { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { images, icons } from "../../constants";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { useGlobalContext } from "../../context/GlobalProvider";
import * as ImagePicker from "expo-image-picker";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  addDoc,
  collection,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { app, db } from "../../lib/fire";
import { router } from "expo-router";
import { Loader } from "../../components";
import { Dropdown } from "react-native-element-dropdown";
const Create = () => {
  const [isSubmitting, setSubmitting] = useState(false);
  const { user } = useGlobalContext();
  const [loading, setLoading] = useState(false);
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
  });
  const { cropsList } = useGlobalContext();
  useEffect(() => {
    if (form.useCurrentLocation) {
      setLoading(true);
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission to access location was denied");
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        const geocodeResponse = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        const address = geocodeResponse[0];
        const locationString = `${address.name}, ${address.city}, ${address.region}, ${address.country}`;

        setForm((prevForm) => ({
          ...prevForm,
          locationCoords: { latitude, longitude },
          locationString,
        }));
        setLoading(false);
      })();
    } else {
      setForm((prevForm) => ({
        ...prevForm,
        locationCoords: null,
        locationString: user.address,
      }));
    }
  }, [form.useCurrentLocation]);

  const submit = async () => {
    if (!form.cropName || !form.photo || !form.amount || !form.quantity) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      const uid = user.uid;

      const photoUri = form.photo;

      const response = await fetch(photoUri);
      const blob = await response.blob();
      const storageRef = ref(getStorage(), `photos/${uid}/${Date.now()}`);
      await uploadBytes(storageRef, blob);
      const photoURL = await getDownloadURL(storageRef);
      // const timestamp = app.firestore.FieldValue.serverTimestamp();
      // console.log(timestamp);
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
        // timestamp: timestamp,
      });

      Alert.alert("Success", "Stock added successfully");

      setForm({
        cropName: "",
        photo: "",
        amount: "",
        quantity: "",
        dateOfEntry: "",
        unit: "",
        locationCoords: "",
        locationString: "",
      });
      router.replace("/home");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const setDate = (event: DateTimePickerEvent, date: Date) => {
    setForm((prevForm) => ({
      ...prevForm,
      dateOfSow: date,
    }));
  };

  const openPicker = async (selectType) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      if (selectType === "image") {
        setForm((prevForm) => ({
          ...prevForm,
          photo: result.assets[0].uri,
        }));
      }
    } else {
      setTimeout(() => {
        Alert.alert("Document picked", JSON.stringify(result, null, 2));
      }, 100);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <Loader
        isLoading={loading}
        content={"Fetching your Location Please Wait"}
      />
      <ScrollView className="mb-10">
        <View className="flex justify-center items-center mt-3">
          <Text className="text-4xl text-secondary font-pbold">Agro tech</Text>
          <Text className="text-xm text-black font-pbold mt-5">
            Say Bye to Middle Man’s 👋
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
              Add Your Stock
            </Text>
          </View>
          <Text className="text-base text-black font-pmedium mt-4">
            Crop Name
          </Text>
          <Dropdown
            // className="text-base text-black font-pmedium h-16 px-4 bg-secondary-1 rounded-2xl border-2 border-secondary-1 focus:border-secondary flex flex-row "
            data={cropsList.map((crop) => ({ label: crop, value: crop }))}
            labelField="label"
            valueField="value"
            placeholder="Select Crop"
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

          <FormField
            title="Varient"
            value={form.varient}
            handleChangeText={(e) => setForm({ ...form, varient: e })}
            otherStyles="mt-7"
          />

          <TouchableOpacity onPress={() => openPicker("image")}>
            <View className="mt-7 space-y-2">
              <Text className="text-base text-black font-pmedium">
                Crop Image
              </Text>
              <View className="w-full h-16 px-4 bg-secondary-1 rounded-2xl border-2 border-secondary-1 flex justify-center items-center flex-row space-x-2">
                <Image
                  source={icons.upload}
                  resizeMode="contain"
                  alt="upload"
                  className="w-5 h-5"
                />
                <Text className="text-sm text-black font-pmedium">
                  Upload image
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <FormField
            title="Selling Amount"
            value={form.amount}
            handleChangeText={(e) => setForm({ ...form, amount: e })}
            otherStyles="mt-7"
            keyboardType="numeric"
          />

          <FormField
            title="Quantity"
            value={form.quantity}
            handleChangeText={(e) => setForm({ ...form, quantity: e })}
            otherStyles="mt-7"
            keyboardType="numeric"
          />

          <View className="mt-7 flex flex-row">
            <TouchableOpacity
              style={[
                styles.optionButton,
                form.unit === "kg" && styles.selectedOption,
              ]}
              onPress={() => setForm({ ...form, unit: "kg" })}
            >
              <Text style={styles.optionText}>kg</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                form.unit === "quintal" && styles.selectedOption,
              ]}
              onPress={() => setForm({ ...form, unit: "quintal" })}
            >
              <Text style={styles.optionText}>quintal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                form.unit === "ton" && styles.selectedOption,
              ]}
              onPress={() => setForm({ ...form, unit: "ton" })}
            >
              <Text style={styles.optionText}>ton</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                form.unit === "crate" && styles.selectedOption,
              ]}
              onPress={() => setForm({ ...form, unit: "crate" })}
            >
              <Text style={styles.optionText}>crate</Text>
            </TouchableOpacity>
          </View>
          <View className="space-y-2 mt-7">
            <Text className="text-base text-black font-pmedium">Address</Text>
            <Text className="text-base text-black">{form.locationString}</Text>
          </View>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>Use Current Location: </Text>
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
          {/* Display address field if not using current location */}
          {!form.useCurrentLocation && (
            <FormField
              title="Address"
              value={form.locationString}
              handleChangeText={(e) => setForm({ ...form, locationString: e })}
              otherStyles="mt-7"
            />
          )}
          <CustomButton
            title="Add crop"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    marginVertical: 10,
  },
  toggleText: {
    fontSize: 16,
    marginRight: 5,
  },
});

export default Create;
