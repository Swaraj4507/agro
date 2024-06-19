import {
  View,
  ActivityIndicator,
  Dimensions,
  Platform,
  Text,
} from "react-native";
import LottieView from "lottie-react-native";
// import {} from "../assets/Tree.json"
const Loader = ({ isLoading, content }) => {
  const osName = Platform.OS;
  const screenHeight = Dimensions.get("screen").height;

  if (!isLoading) return null;

  return (
    <View
      className="absolute flex justify-center items-center w-full h-full bg-white z-10"
      style={{
        height: screenHeight,
      }}
    >
      <LottieView
        style={{ width: 200, height: 200 }}
        source={require("../assets/Tree.json")}
        autoPlay
        loop
      />
      {content ? (
        <Text className="font-pbold">{content}</Text>
      ) : (
        <Text className="font-pbold">Loading</Text>
      )}
    </View>
  );
};

export default Loader;
