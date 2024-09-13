import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import CircularProgress from "react-native-circular-progress-indicator";

const ProfileCompletionComponent = ({ user }) => {
  const router = useRouter();
  const percentage = user?.profileCompletionPercentage || 0;

  if (user?.profileCompletion !== false && percentage === 100) {
    return null;
  }

  const handlePress = () => {
    router.push({
      pathname: "/pages/bProfileCompletion",
      params: {},
    });
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="items-center justify-center p-4 bg-secondary rounded-lg shadow-md w-full"
      // style={{ width: wp("90%"), marginVertical: hp("2%") }}
      style={{ marginVertical: hp("2%") }}
    >
      <View className="flex-row items-center justify-between w-full">
        <View className="flex-1">
          <Text className="text-lg font-bold text-black mb-2">
            Complete Your Profile
          </Text>
          <Text className="text-sm text-gray-600">
            Finish setting up your account to access all features
          </Text>
        </View>
        <CircularProgress
          value={percentage}
          radius={wp("8%")}
          duration={1000}
          progressValueColor={"#000"}
          maxValue={100}
          title={"%"}
          titleColor={"#000"}
          titleStyle={{ fontWeight: "bold" }}
          activeStrokeColor={"#FF8E01"}
          inActiveStrokeColor={"#e6e6e6"}
          inActiveStrokeOpacity={0.5}
          inActiveStrokeWidth={6}
          activeStrokeWidth={12}
        />
      </View>
    </TouchableOpacity>
  );
};

export default ProfileCompletionComponent;
