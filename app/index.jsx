import { StatusBar } from "expo-status-bar";
import {
  ScrollView,
  Text,
  Image,
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";
import { Redirect, router } from "expo-router";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
// import { images, icons } from "../constants";
import { icons } from "../constants";

import CustomButton from "../components/CustomButton";
import UnverifiedAccountScreenWithVideo from "../components/UnverifiedAccountScreenWithVideo";
// import { CustomButton } from "../components";
import { useGlobalContext } from "../context/GlobalProvider";
import Loader from "../components/Loader";
import { useEffect, useState } from "react";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import { Trending, OnboardingScreen } from "../components";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Video } from "expo-av";

// import { useCopilot, CopilotStep } from "react-native-copilot";
export default function App() {
  // const { start } = useCopilot();
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const { loading, isLogged, userType, posts, fetchPosts, isVerified } =
    useGlobalContext();
  const { t, i18n } = useTranslation();
  // console.log(process.env.EXPO_FIREBASE_API_KEY);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en"); // Default language is English
  useEffect(() => {
    AsyncStorage.getItem("alreadyLaunched").then((value) => {
      if (value === null) {
        console.log("NotLaunched");
        AsyncStorage.setItem("alreadyLaunched", "true"); // No need to await here
        setIsFirstLaunch(true);
      } else {
        console.log("alreadyLaunched");
        setIsFirstLaunch(false);
      }
    });
    fetchPosts();
    // console.log("index");
    // console.log(userType);
    // console.log(isVerified);
  }, []);
  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    i18n.changeLanguage(language);
    setModalVisible(false);
  };
  const clearAsyncStorage = async () => {
    try {
      await AsyncStorage.removeItem("alreadyLaunched");
      console.log("AsyncStorage cleared successfully.");
    } catch (error) {
      console.error("Error clearing AsyncStorage:", error);
    }
  };
  if (loading) {
    return <Loader isLoading={loading} />;
  }

  if (isFirstLaunch) {
    return <OnboardingScreen />;
  }

  if (userType === "farmer") {
    // console.log("yesss");
    if (isVerified) {
      return (
        <SafeAreaView className="bg-primary h-full">
          <Animated.View
            entering={FadeIn.delay(200)}
            className="flex justify-center items-center  mt-3"
          >
            <Text className="text-3xl text-[#65B741] font-psemibold pt-2 ">
              {t("appName")}
            </Text>
          </Animated.View>
          <ScrollView>
            <Animated.View
              entering={FadeIn.delay(400)}
              className="w-full flex justify-center  items-start h-full px-4  "
            >
              <Animated.View className="relative mt-10 ">
                <Text className="text-3xl text-black font-psemibold text-left">
                  Welcome to{"\n"}
                  <Text className="text-[#65B741]  font-psemibold ">
                    JSK AgroTech
                  </Text>
                  ,{"\n"}
                  your agricultural hub.
                  {/* {t("welcomeMessage")} */}
                </Text>
                <Text className="text-sm font-pbold  text-black-100 mt-7 text-left">
                  {t("bringingFields")}
                </Text>
              </Animated.View>
              <View className="flex-row justify-between w-full mt-10 ">
                {/* <CopilotStep
                  text="This is the home button"
                  order={1}
                  name="homeButton"
                > */}
                <TouchableOpacity
                  className="bg-secondary p-4 rounded-md flex items-center justify-center mx-2"
                  onPress={() => router.push("/home")}
                >
                  <Text className="font-psemibold text-black">{t("home")}</Text>
                </TouchableOpacity>
                {/* </CopilotStep> */}
                <TouchableOpacity
                  className="bg-secondary p-4 rounded-md flex items-center justify-center mx-2"
                  onPress={() => router.push("/profile")}
                >
                  <Text className="font-psemibold text-black text-center">
                    {t("profile")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-secondary p-4 rounded-md flex-1 items-center justify-center mx-2 "
                  onPress={() => setModalVisible(true)}
                >
                  <Text className="font-psemibold text-black">
                    {t("change_language")}
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                className="bg-secondary p-4 rounded-xl mt-4 w-full items-center justify-evenly flex-row"
                onPress={() => router.push("/create")}
              >
                <Image
                  source={icons.store}
                  className="w-12 h-12  "
                  resizeMode="contain"
                  tintColor="#000"
                />
                <Text className="font-psemibold text-black">
                  {t("add_commodity")}
                </Text>
              </TouchableOpacity>
              <Trending posts={posts ?? []} />
            </Animated.View>
          </ScrollView>
          <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text className="font-psemibold text-lg mb-4">
                  Select Language
                </Text>
                <TouchableOpacity
                  onPress={() => handleLanguageChange("en")}
                  className="mb-2"
                >
                  <Text
                    className={selectedLanguage === "en" ? "font-bold" : ""}
                  >
                    English
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleLanguageChange("hi")}
                  className="mb-2"
                >
                  <Text
                    className={selectedLanguage === "hi" ? "font-bold" : ""}
                  >
                    हिन्दी
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="mt-4"
                >
                  <Text className="text-red-500">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <StatusBar backgroundColor="#000" style="light" />
        </SafeAreaView>
      );
    } else {
      // console.log("yupp");
      //
      return (
        <UnverifiedAccountScreenWithVideo />
        // <SafeAreaView className="bg-primary h-full">
        //   <ScrollView>
        //     <Animated.View
        //       entering={FadeIn.delay(200)}
        //       className="flex justify-center items-center mt-6"
        //     >
        //       <Text className="text-4xl text-[#65B741] font-bold pt-4">
        //         {t("appName")}
        //       </Text>
        //     </Animated.View>

        //     <SafeAreaView className="bg-primary h-full flex items-center justify-center">
        //       <View className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        //         <Text className="text-2xl font-bold mb-4">
        //           Account Not Verified
        //         </Text>
        //         <Text className="text-gray-600 mb-6">
        //           Your account is not verified yet. Please look into our app
        //           features while we process your verification.
        //         </Text>
        //         <Video
        //           source={{
        //             uri: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        //           }}
        //           style={{ width: "100%", height: 200 }}
        //           controls
        //         />
        //       </View>
        //     </SafeAreaView>

        //     <TouchableOpacity
        //       className="bg-secondary p-4 rounded-md flex items-center justify-center mx-4 mt-4"
        //       onPress={() => {
        //         /* Logout logic */
        //       }}
        //     >
        //       <Text className="font-bold text-black">Logout</Text>
        //     </TouchableOpacity>
        //   </ScrollView>
        // </SafeAreaView>
      );
    }
  }

  if (userType === "buyer") {
    if (isVerified) {
      return (
        <SafeAreaView className="bg-primary h-full">
          <Animated.View
            entering={FadeIn.delay(200)}
            className="flex justify-center items-center  mt-3"
          >
            <Text className="text-3xl text-[#65B741] font-psemibold pt-2 ">
              {t("appName")}
            </Text>
          </Animated.View>
          <ScrollView>
            <Animated.View
              entering={FadeIn.delay(400)}
              className="w-full flex justify-center  items-start h-full px-4  "
            >
              <Animated.View className="relative mt-10 ">
                <Text className="text-3xl text-black font-psemibold text-left">
                  Welcome to{"\n"}
                  <Text className="text-[#65B741]  font-psemibold ">
                    JSK AgroTech
                  </Text>
                  ,{"\n"}
                  your agricultural hub.
                  {/* {t("welcomeMessage")} */}
                </Text>
                <Text className="text-sm font-pbold  text-black-100 mt-7 text-left">
                  {t("bringingFields")}
                </Text>
              </Animated.View>
              <View className="flex-row justify-between w-full mt-10 ">
                <TouchableOpacity
                  className="bg-secondary p-4 rounded-md flex-1 items-center justify-center mx-2"
                  onPress={() => router.push("/bhome")}
                >
                  {/* <Image
                    source={icons.home}
                    className="w-12 h-12  "
                    resizeMode="contain"
                    tintColor="#000"
                  /> */}
                  <Text className="font-psemibold text-black">{t("home")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-secondary p-4 rounded-md flex-1 items-center justify-center mx-2"
                  onPress={() => setModalVisible(true)}
                >
                  <Text className="font-psemibold text-black">
                    {t("change_language")}
                  </Text>
                </TouchableOpacity>
                {/* <TouchableOpacity
                  className="bg-secondary p-4 rounded-md flex-2 items-center justify-center mx-2 "
                  onPress={() => router.push("/bhome")}
                >
                  <Text className="font-psemibold text-black">Language</Text>
                </TouchableOpacity> */}
              </View>
              <TouchableOpacity
                className="bg-secondary p-4 rounded-xl mt-4 w-full items-center justify-evenly flex-row"
                onPress={() => router.push("/bprofile")}
              >
                <Image
                  source={icons.store}
                  className="w-12 h-12  "
                  resizeMode="contain"
                  tintColor="#000"
                />
                <Text className="font-psemibold text-black">
                  {t("yourOrders")}
                </Text>
              </TouchableOpacity>
              <Trending posts={posts ?? []} />
            </Animated.View>
          </ScrollView>
          <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text className="font-psemibold text-lg mb-4">
                  Select Language
                </Text>
                <TouchableOpacity
                  onPress={() => handleLanguageChange("en")}
                  className="mb-2"
                >
                  <Text
                    className={selectedLanguage === "en" ? "font-bold" : ""}
                  >
                    English
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleLanguageChange("hi")}
                  className="mb-2"
                >
                  <Text
                    className={selectedLanguage === "hi" ? "font-bold" : ""}
                  >
                    हिन्दी
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="mt-4"
                >
                  <Text className="text-red-500">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <StatusBar backgroundColor="#000" style="light" />
        </SafeAreaView>
      );
    } else {
      return (
        <SafeAreaView className="bg-primary h-full">
          <Animated.View
            entering={FadeIn.delay(200)}
            className="flex justify-center items-center  mt-3"
          >
            <Text className="text-3xl text-[#65B741] font-psemibold pt-2 ">
              {t("appName")}
            </Text>
          </Animated.View>
          <Video
            source={{ uri: "buyer-specific-video-url" }}
            style={{ width: "100%", height: 200 }}
            controls
          />
          <TouchableOpacity
            className="bg-secondary p-4 rounded-md flex items-center justify-center mx-2"
            onPress={() => {
              /* Logout logic */
            }}
          >
            <Text className="font-psemibold text-black">Logout</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <Animated.View
        entering={FadeIn.delay(200)}
        className="flex justify-center items-center  mt-3"
      >
        <Text className="text-3xl text-[#65B741] font-psemibold pt-2 ">
          {t("appName")}
        </Text>
      </Animated.View>
      <ScrollView>
        <Animated.View
          entering={FadeIn.delay(400)}
          className="w-full flex justify-center  items-start h-full px-4  "
        >
          <Animated.View className="relative mt-10 ">
            <Text className="text-3xl text-black font-psemibold text-left">
              Welcome to{"\n"}
              <Text className="text-[#65B741]  font-psemibold ">
                JSK AgroTech
              </Text>
              ,{"\n"}
              your agricultural hub.
              {/* {t("welcomeMessage")} */}
            </Text>
            <Text className="text-sm font-pbold  text-black-100 mt-7 text-left">
              {t("bringingFields")}
            </Text>
          </Animated.View>
          <CustomButton
            title={t("continueAsFarmer")}
            handlePress={() => router.push("/sign-in-f")}
            containerStyles="w-full mt-20"
          />
          <CustomButton
            title={t("continueAsBuyer")}
            handlePress={() => router.push("/sign-up-b")}
            containerStyles="w-full mt-10"
          />
          <CustomButton
            title={t("change_language")}
            handlePress={() => setModalVisible(true)}
            containerStyles="w-full mt-10"
          />
          {/* <CustomButton
            title={t("clear storage")}
            handlePress={clearAsyncStorage}
            containerStyles="w-full mt-10"
          /> */}
          <Trending posts={posts ?? []} />
        </Animated.View>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text className="font-psemibold text-lg mb-4">Select Language</Text>
            <TouchableOpacity
              onPress={() => handleLanguageChange("en")}
              className="mb-2"
            >
              <Text className={selectedLanguage === "en" ? "font-bold" : ""}>
                English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleLanguageChange("hi")}
              className="mb-2"
            >
              <Text className={selectedLanguage === "hi" ? "font-bold" : ""}>
                हिन्दी
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="mt-4"
            >
              <Text className="text-red-500">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <StatusBar backgroundColor="#000" style="light" />
    </SafeAreaView>
  );
  return isFirstLaunch ? (
    <OnboardingScreen />
  ) : (
    // <Text>On boarding</Text>
    <SafeAreaView className="bg-primary h-full">
      <Animated.View
        entering={FadeIn.delay(200)}
        className="flex justify-center items-center  mt-3"
      >
        <Text className="text-3xl text-[#65B741] font-psemibold pt-2 ">
          {t("appName")}
        </Text>
      </Animated.View>

      <ScrollView>
        <Animated.View
          entering={FadeIn.delay(400)}
          className="w-full flex justify-center  items-start h-full px-4  "
        >
          <Animated.View className="relative mt-10 ">
            <Text className="text-3xl text-black font-psemibold text-left">
              Welcome to{"\n"}
              <Text className="text-[#65B741]  font-psemibold ">
                JSK AgroTech
              </Text>
              ,{"\n"}
              your agricultural hub.
              {/* {t("welcomeMessage")} */}
            </Text>
            <Text className="text-sm font-pbold  text-black-100 mt-7 text-left">
              {t("bringingFields")}
            </Text>
          </Animated.View>
          {!loading && isLogged && userType !== undefined && userType !== "" ? (
            userType === "farmer" ? (
              <>
                <View className="flex-row justify-between w-full mt-10 ">
                  {/* <CopilotStep
                  text="This is the home button"
                  order={1}
                  name="homeButton"
                > */}
                  <TouchableOpacity
                    className="bg-secondary p-4 rounded-md flex items-center justify-center mx-2"
                    onPress={() => router.push("/home")}
                  >
                    <Text className="font-psemibold text-black">
                      {t("home")}
                    </Text>
                  </TouchableOpacity>
                  {/* </CopilotStep> */}
                  <TouchableOpacity
                    className="bg-secondary p-4 rounded-md flex items-center justify-center mx-2"
                    onPress={() => router.push("/profile")}
                  >
                    <Text className="font-psemibold text-black text-center">
                      {t("profile")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-secondary p-4 rounded-md flex-1 items-center justify-center mx-2 "
                    onPress={() => setModalVisible(true)}
                  >
                    <Text className="font-psemibold text-black">
                      {t("change_language")}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  className="bg-secondary p-4 rounded-xl mt-4 w-full items-center justify-evenly flex-row"
                  onPress={() => router.push("/create")}
                >
                  <Image
                    source={icons.store}
                    className="w-12 h-12  "
                    resizeMode="contain"
                    tintColor="#000"
                  />
                  <Text className="font-psemibold text-black">
                    {t("add_commodity")}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View className="flex-row justify-between w-full mt-10 ">
                  <TouchableOpacity
                    className="bg-secondary p-4 rounded-md flex-1 items-center justify-center mx-2"
                    onPress={() => router.push("/bhome")}
                  >
                    {/* <Image
                    source={icons.home}
                    className="w-12 h-12  "
                    resizeMode="contain"
                    tintColor="#000"
                  /> */}
                    <Text className="font-psemibold text-black">
                      {t("home")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-secondary p-4 rounded-md flex-1 items-center justify-center mx-2"
                    onPress={() => setModalVisible(true)}
                  >
                    <Text className="font-psemibold text-black">
                      {t("change_language")}
                    </Text>
                  </TouchableOpacity>
                  {/* <TouchableOpacity
                  className="bg-secondary p-4 rounded-md flex-2 items-center justify-center mx-2 "
                  onPress={() => router.push("/bhome")}
                >
                  <Text className="font-psemibold text-black">Language</Text>
                </TouchableOpacity> */}
                </View>
                <TouchableOpacity
                  className="bg-secondary p-4 rounded-xl mt-4 w-full items-center justify-evenly flex-row"
                  onPress={() => router.push("/bprofile")}
                >
                  <Image
                    source={icons.store}
                    className="w-12 h-12  "
                    resizeMode="contain"
                    tintColor="#000"
                  />
                  <Text className="font-psemibold text-black">
                    {t("yourOrders")}
                  </Text>
                </TouchableOpacity>
              </>
            )
          ) : (
            <>
              <CustomButton
                title={t("continueAsFarmer")}
                handlePress={() => router.push("/sign-in-f")}
                containerStyles="w-full mt-20"
              />
              <CustomButton
                title={t("continueAsBuyer")}
                handlePress={() => router.push("/sign-up-b")}
                containerStyles="w-full mt-10"
              />
              <CustomButton
                title={t("change_language")}
                handlePress={() => setModalVisible(true)}
                containerStyles="w-full mt-10"
              />
              {/* <CustomButton
                title={t("clear storage")}
                handlePress={clearAsyncStorage}
                containerStyles="w-full mt-10"
              /> */}
            </>
          )}
          <Trending posts={posts ?? []} />
        </Animated.View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text className="font-psemibold text-lg mb-4">Select Language</Text>
            <TouchableOpacity
              onPress={() => handleLanguageChange("en")}
              className="mb-2"
            >
              <Text className={selectedLanguage === "en" ? "font-bold" : ""}>
                English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleLanguageChange("hi")}
              className="mb-2"
            >
              <Text className={selectedLanguage === "hi" ? "font-bold" : ""}>
                हिन्दी
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="mt-4"
            >
              <Text className="text-red-500">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <StatusBar backgroundColor="#000" style="light" />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
