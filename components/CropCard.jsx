import React, { useState } from "react";

// import { CustomButton } from "../../components";
import CustomButton from "./CustomButton";
import {
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableWithoutFeedback,
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useGlobalContext } from "../context/GlobalProvider";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
const CropCard = ({ item }) => {
  const { cropName: title, area, cropImage, id } = item;
  const { t } = useTranslation();
  const [isSubmitting, setSubmitting] = useState(false);
  const styles = StyleSheet.create({
    shadow: {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.5,
      shadowRadius: 4.65,

      elevation: 6,
    },
  });
  const { fetchDiseasesForCrop, diseasesData } = useGlobalContext();
  const handleExplorePress = async () => {
    console.log("explore clicked");
    await fetchDiseasesForCrop(title);
    router.push(`/diseases/${title}`);
  };
  return (
    <TouchableWithoutFeedback key={id}>
      <Animated.View
        entering={FadeInDown}
        className="flex flex-col items-center px-4 mb-14  bg-white rounded-xl ml-1 mr-1 pb-2 border border-secondary"
        style={styles.shadow}
      >
        <View
          activeOpacity={0.7}
          // onPress={() => setPlay(true)}
          className="w-full h-60 rounded-xl mt-3 relative flex justify-center items-center mb-5"
        >
          <Image
            source={{
              // uri: "https://media.istockphoto.com/id/1316992167/photo/red-chili-peppers-in-vegetable-garden.jpg?s=612x612&w=0&k=20&c=9WxPxtBqBegiJtWZ6J-IRr-WqLs8qgS4G_JiSEQk-IQ=",
              uri: cropImage,
            }}
            className="w-full h-full rounded-xl "
            resizeMode="cover"
          />
        </View>
        <View className="flex flex-row gap-3 items-start">
          <View className="flex justify-center items-center flex-row flex-1">
            <View className="flex justify-center flex-1 ml-3 gap-y-1">
              <Text
                className="font-psemibold text-lg text-[#65B741]"
                numberOfLines={1}
              >
                {t(`${title}`)}
              </Text>
              <Text
                className="text-sm text-black-200 font-pregular"
                // numberOfLines={1}
              >
                {area} Acres
              </Text>
            </View>
            <CustomButton
              title={t("explore_button_label")}
              // handlePress={submit}
              handlePress={async () => {
                setSubmitting(true);
                if (!diseasesData[title]) {
                  await fetchDiseasesForCrop(title);
                }
                setSubmitting(false);
                router.push(`/diseases/${title}`);
              }}
              containerStyles="mt-1 pl-5 pr-5"
              isLoading={isSubmitting}
            />
          </View>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export default CropCard;
