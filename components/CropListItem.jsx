import React from "react";

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
const CropListItem = ({ title, onPress, isSubmitting }) => {
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
  return (
    <TouchableWithoutFeedback>
      <View
        className="flex flex-col items-center px-4 mb-5  bg-white rounded-xl ml-1 mr-1 pb-2"
        style={styles.shadow}
      >
        <View className="flex flex-row gap-3 items-start">
          <View className="flex justify-center items-center flex-row flex-1">
            <View className="flex justify-center flex-1 ml-3 gap-y-1">
              <Text
                className="font-psemibold text-lg text-[#65B741]"
                numberOfLines={1}
              >
                {title}
              </Text>
            </View>
            <CustomButton
              title="Explore"
              handlePress={onPress}
              containerStyles="mt-1 pl-5 pr-5"
              isLoading={isSubmitting}
            />
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default CropListItem;
