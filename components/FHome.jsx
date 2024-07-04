import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";

const FHome = () => {
  return (
    <View
      // contentContainerStyle={{ flexGrow: 1 }}
      className="bg-beige flex-1 items-center justify-center"
    >
      <View className="mt-10 mb-4">
        <Text className="text-xl font-bold">AGROTECH</Text>
      </View>
      <View className="flex-row justify-between w-3/4 mt-4">
        <TouchableOpacity className="bg-secondary p-4 rounded-md flex-1 items-center justify-center mx-2">
          <Text>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-secondary p-4 rounded-md flex-1 items-center justify-center mx-2">
          <Text>Crops</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-secondary p-4 rounded-md flex-1 items-center justify-center mx-2">
          <Text>Language</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity className="bg-secondary p-4 rounded-md mt-4 w-3/4 items-center justify-center">
        <Text>Add A Commodity</Text>
      </TouchableOpacity>
      <View className="mt-4 w-3/4">
        <View className="flex-row justify-between">
          <TouchableOpacity className="bg-green-500 p-2 rounded-full">
            <Text>←</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-green-500 p-2 rounded-full">
            <Text>→</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row justify-center mt-2">
          <View className="bg-green-500 h-2 w-2 rounded-full mx-1"></View>
          <View className="bg-gray-300 h-2 w-2 rounded-full mx-1"></View>
          <View className="bg-gray-300 h-2 w-2 rounded-full mx-1"></View>
        </View>
      </View>
    </View>
  );
};

export default FHome;

const styles = StyleSheet.create({});
