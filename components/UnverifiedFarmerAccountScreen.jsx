import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
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

const UnverifiedFarmerAccountScreen = () => {
  const { user, logout } = useGlobalContext();
  const auth = getAuth(app);
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});
  const [videoLoaded, setVideoLoaded] = useState(false);

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
            Your Farmer Account is Being Verified
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
            <Text style={styles.featureItem}>• Post your harvest listings</Text>
            <Text style={styles.featureItem}>• Connect with local buyers</Text>
            <Text style={styles.featureItem}>• Access market insights</Text>
            <Text style={styles.featureItem}>• Manage your farm inventory</Text>
          </View>
        </Animated.View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await firebaseSignOut(auth);
            await logout();
          }}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
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
});

export default UnverifiedFarmerAccountScreen;
