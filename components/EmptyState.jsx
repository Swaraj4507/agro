import { router } from "expo-router";
import { View, Text, Image } from "react-native";

import { images } from "../constants";
import CustomButton from "./CustomButton";

const EmptyState = ({
  title,
  subtitle,
  showButton = false,
  btnText,
  handlePress,
}) => {
  return (
    <View className="flex justify-center items-center px-4">
      <Image
        source={images.empty}
        resizeMode="contain"
        className="w-[270px] h-[216px]"
      />

      <Text className="text-sm font-pmedium text-black">{title}</Text>
      <Text className="text-xl text-center font-psemibold text-black mt-2">
        {subtitle}
      </Text>
      {showButton && (
        <CustomButton
          title={btnText}
          handlePress={handlePress}
          containerStyles="w-full my-5"
        />
      )}
    </View>
  );
};

export default EmptyState;
