import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation hook
import { useGlobalContext } from "../../context/GlobalProvider";
import CropListItem from "../../components/CropListItem";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
const cropsListing = () => {
  const { diseasesData, cropsList, fetchDiseasesForCrop } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);
  // const crops = Object.keys(diseasesData);

  // console.log(crops);
  // const navigation = useNavigation(); // Initialize navigation hook

  const handleSelectCrop = async (crop) => {
    if (!diseasesData[crop]) {
      await fetchDiseasesForCrop(crop);
    }
    // navigation.navigate("CropDiseases", { crop }); // Navigate to CropDiseases screen with the selected crop
    // router.replace(`/diseases/${item}`);
  };

  return (
    <SafeAreaView className=" ">
      <View className="flex justify-center items-center ">
        <Text className="text-xl text-black font-pbold mb-5">
          Select a Crop
        </Text>
      </View>
      <FlatList
        data={cropsList}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <CropListItem
            title={item}
            onPress={() => {
              // console.log("hhh");
              // router.replace("upload");
              // router.replace(`/diseases/${item}`);
              // Modal.dismiss();
              setSubmitting(true);
              handleSelectCrop(item);
              setSubmitting(false);
              router.replace(`/diseases/${item}`);
            }}
            isSubmitting={isSubmitting}
            className="px-4"
          />
        )}
        contentContainerStyle={{ paddingBottom: hp("10%") }}
      />
    </SafeAreaView>
  );
};

export default cropsListing;
