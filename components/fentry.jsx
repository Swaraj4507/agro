import React from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomButton } from ".";
import { icons } from "../constants";

const fentry = () => {
  let play = true;
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
  //border border-black
  return (
    <SafeAreaView className="bg-primary w-full h-full">
      <TouchableWithoutFeedback>
        <View
          className="flex flex-col items-center px-4 mb-14  bg-white rounded-xl ml-1 mr-1 pb-2"
          style={styles.shadow}
        >
          <View
            activeOpacity={0.7}
            // onPress={() => setPlay(true)}
            className="w-full h-60 rounded-xl mt-3 relative flex justify-center items-center mb-5"
          >
            <Image
              source={{
                uri: "https://media.istockphoto.com/id/1316992167/photo/red-chili-peppers-in-vegetable-garden.jpg?s=612x612&w=0&k=20&c=9WxPxtBqBegiJtWZ6J-IRr-WqLs8qgS4G_JiSEQk-IQ=",
              }}
              className="w-full h-full rounded-xl "
              resizeMode="cover"
            />
          </View>
          <View className="flex flex-row gap-3 items-start">
            <View className="flex justify-center items-center flex-row flex-1">
              <View className="flex justify-center flex-1 ml-3 gap-y-1">
                <Text
                  className="font-psemibold text-lg text-secondary"
                  numberOfLines={1}
                >
                  Mirchi
                </Text>
                <Text
                  className="text-sm text-black-200 font-pregular"
                  // numberOfLines={1}
                >
                  Date: April 28, 2024
                </Text>
              </View>
              <CustomButton
                title="Explore"
                // handlePress={submit}
                containerStyles="mt-1 pl-5 pr-5"
                // isLoading={isSubmitting}
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
      {/* <TouchableWithoutFeedback>
        <View className=" bg-slate-500 rounded-3xl shadow-lg mt-32 w-96 ml-3 mr-2">
          <Image
            className=" h-36 w-96 rounded-t-3xl border "
            source={{
              uri: "https://media.istockphoto.com/id/1316992167/photo/red-chili-peppers-in-vegetable-garden.jpg?s=612x612&w=0&k=20&c=9WxPxtBqBegiJtWZ6J-IRr-WqLs8qgS4G_JiSEQk-IQ=",
            }}
            alt="Sunset in the mountains"
            // style={{ width: 400, height: 300 }}
            resizeMode="contain"
          />
          <Text>urneogieroigoi</Text>
          <Text>urneogieroigoi</Text>
          <Text>urneogieroigoi</Text>
          <Text>urneogieroigoi</Text>
          <Text>urneogieroigoi</Text>
          <Text>urneogieroigoi</Text>
        </View>
      </TouchableWithoutFeedback> */}
      {/* <View className="max-w-sm rounded overflow-hidden shadow-lg bg-slate-50 ml-5">
        <Image
          className="  "
          source={{
            uri: "https://media.istockphoto.com/id/1316992167/photo/red-chili-peppers-in-vegetable-garden.jpg?s=612x612&w=0&k=20&c=9WxPxtBqBegiJtWZ6J-IRr-WqLs8qgS4G_JiSEQk-IQ=",
          }}
          alt="Sunset in the mountains"
          style={{ width: 400, height: 300 }}
          resizeMode="contain"
        />
        <View className="px-6 py-4">
          <Text className="font-bold text-xl mb-2">Mirchi Crop</Text>
          <Text className="text-gray-700 text-base">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit.
          </Text>
        </View>
        <View className="px-6 pt-4 pb-2 flex-row flex-wrap border">
          <Text className=" bg-secondary rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
            Area : 8 acres
          </Text>
          <Text className="border border-black-100 bg-secondary rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
            Date of Sowing : April 28, 2024
          </Text>
          <Text className=" bg-secondary rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
            Edit
          </Text>
        </View>
        <View className="px-6 pt-4 pb-2 flex-row flex-wrap">
          <CustomButton
            title="Click here to know more"
            // handlePress={submit}
            containerStyles="mt-1 w-full"
            // isLoading={isSubmitting}
          />
        </View>
      </View> */}
      {/* <CustomButton
        title="Click here to know more"
        // handlePress={submit}
        containerStyles="mt-1 w-full"
        // isLoading={isSubmitting}
      /> */}
    </SafeAreaView>
  );
};

export default fentry;
