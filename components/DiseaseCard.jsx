import { useState } from "react";
import { ResizeMode, Video } from "expo-av";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
} from "react-native";

import { icons } from "../constants";
import { useGlobalContext } from "../context/GlobalProvider";

const DiseaseCard = ({ cropName }) => {
  // const [play, setPlay] = useState(false);
  // const cropName = "Mango";
  const { diseasesData, diseasesLoading } = useGlobalContext();

  if (diseasesLoading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }
  const diseases = diseasesData[cropName] || [];
  console.log(diseases);
  const renderSolutionItem = ({ item }) => (
    <View
      className="mr-3 bg-secondary w-80 rounded-lg shadow-xl"
      // style={{
      //   shadowColor: "#000",
      // }}
    >
      <View className="mb-10 ml-3">
        <Text className="text-black font-pbold text-sm mb-1 mt-2 ">
          {item.chemical_name}
        </Text>
        <Text className="text-black font-pregular text-xs">
          {item.how_to_use_it}
        </Text>
      </View>
    </View>
  );
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
    <View style={styles.shadow}>
      {diseases.map((disease, index) => (
        <View
          key={index}
          className="flex flex-col items-center px-4 mb-14 bg-white rounded-2xl ml-1 mr-2"
        >
          <View className="flex flex-row gap-3 items-start">
            <View className="flex justify-center items-center flex-row flex-1">
              <View className="flex justify-center flex-1 ml-1 gap-y-1">
                <Text
                  className="font-psemibold text-sm text-Black"
                  numberOfLines={1}
                >
                  {disease.name}
                </Text>
                <Text
                  className="text-xs text-gray-100 font-pregular"
                  numberOfLines={1}
                >
                  Details about {disease.name}
                </Text>
              </View>
              <View className="w-[196px] h-[96px] rounded-lg border border-secondary flex justify-center items-center p-0.5 mt-1">
                <Image
                  source={{
                    uri: "https://media.istockphoto.com/id/1316992167/photo/red-chili-peppers-in-vegetable-garden.jpg?s=612x612&w=0&k=20&c=9WxPxtBqBegiJtWZ6J-IRr-WqLs8qgS4G_JiSEQk-IQ=",
                  }}
                  className="w-full h-full rounded-lg"
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* <View className="pt-2">
          <Image source={icons.menu} className="w-5 h-5" resizeMode="contain" />
        </View> */}
          </View>

          <FlatList
            data={disease.solutions}
            renderItem={renderSolutionItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{
              marginTop: 10,
              marginBottom: 10,
              // marginLeft: 10,
            }}
            horizontal
          />
        </View>
      ))}
    </View>
  );
};

export default DiseaseCard;
