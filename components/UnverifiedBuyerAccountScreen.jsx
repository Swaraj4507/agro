import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  Modal,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { useGlobalContext } from "../context/GlobalProvider";
import { getAuth, signOut as firebaseSignOut } from "firebase/auth";
import { app } from "../lib/fire";
import { AntDesign } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const UnverifiedBuyerAccountScreen = () => {
  const { user, logout } = useGlobalContext();
  const auth = getAuth(app);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const { t, i18n } = useTranslation();
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const fadeAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(1);
  const translateY = useSharedValue(50);

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 1000 });
    translateY.value = withTiming(0, {
      duration: 1000,
      easing: Easing.out(Easing.exp),
    });
  }, []);

  const pulseAnim = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleAnim.value }],
    };
  });

  useEffect(() => {
    scaleAnim.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, []);
  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    i18n.changeLanguage(language);
    setModalVisible(false);
  };
  const fadeAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.header, fadeAnimStyle]}>
          <Text style={styles.appName}>{t("appName")}</Text>
        </Animated.View>

        <Animated.View style={[styles.card, fadeAnimStyle]}>
          <Animated.Text style={[styles.title, pulseAnim]}>
            Welcome, {user?.fullname}!
          </Animated.Text>
          <Text style={styles.subtitle}>
            Your Buyer Account is Being Verified
          </Text>

          <View style={styles.videoContainer}>
            {!videoLoaded && (
              <View style={styles.placeholderContainer}>
                <AntDesign name="videocamera" size={48} color="#4CAF50" />
                <Text style={styles.placeholderText}>Loading video...</Text>
              </View>
            )}
            <Video
              ref={videoRef}
              style={styles.video}
              source={{
                uri: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
              }}
              useNativeControls
              resizeMode={ResizeMode.COVER}
              isLooping
              onPlaybackStatusUpdate={(status) => setStatus(() => status)}
              onLoad={() => setVideoLoaded(true)}
            />
          </View>

          <Text style={styles.description}>
            While we verify your account, explore how our app can help you
            manage your farm and connect with buyers:
          </Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>
              • Browse local harvest listings
            </Text>
            <Text style={styles.featureItem}>
              • Connect directly with farmers
            </Text>
            <Text style={styles.featureItem}>
              • Access real-time market prices
            </Text>
            <Text style={styles.featureItem}>
              • Manage your purchase orders
            </Text>
          </View>
        </Animated.View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.logoutButtonText}> {t("change_language")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await firebaseSignOut(auth);
            await logout();
          }}
        >
          <Text style={styles.logoutButtonText}>{t("logout")}</Text>
        </TouchableOpacity>
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 20,
  },
  header: {
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    width: width * 0.9,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333333",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 20,
    color: "#666666",
  },
  videoContainer: {
    width: "100%",
    aspectRatio: 9 / 16,
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  video: {
    flex: 1,
  },
  placeholderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4CAF50",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
    color: "#333333",
  },
  featureList: {
    alignSelf: "stretch",
  },
  featureItem: {
    fontSize: 16,
    marginBottom: 10,
    color: "#666666",
  },
  logoutButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  logoutButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "bold",
  },
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
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
});

export default UnverifiedBuyerAccountScreen;
