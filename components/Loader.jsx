import {
  View,
  ActivityIndicator,
  Dimensions,
  Platform,
  Text,
} from "react-native";
import LottieView from "lottie-react-native";
import { useTranslation } from "react-i18next";
// import {} from "../assets/Tree.json"
const Loader = ({ isLoading, content }) => {
  const { t } = useTranslation();
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
        <Text className="font-pbold">{t("loading")}</Text>
      )}
    </View>
  );
};

export default Loader;
