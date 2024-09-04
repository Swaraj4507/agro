import React, { useState, useRef } from "react";
import {
  Animated,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Button,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { FadeIn } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { useGlobalContext } from "../context/GlobalProvider";
import { getAuth, signOut as firebaseSignOut } from "firebase/auth";
import { app } from "../lib/fire";
const UnverifiedAccountScreenWithVideoPlayer = () => {
  const { user, logout } = useGlobalContext();
  const auth = getAuth(app);
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <Animated.View
          entering={FadeIn.delay(200)}
          className="flex justify-center items-center mt-6"
        >
          <Text className="text-4xl text-[#65B741] font-bold pt-4">
            {t("appName")}
          </Text>
        </Animated.View>

        <SafeAreaView className="bg-primary h-full flex items-center justify-center">
          <View className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <Text className="text-2xl font-bold mb-4">
              Hello {user?.fullname} Your Account is Not Verified
            </Text>
            <Text className="text-gray-600 mb-6">
              Your account is not verified yet. Please look into our app
              features while we process your verification.
            </Text>
            <Video
              ref={videoRef}
              style={styles.video}
              source={{
                uri: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
              }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping
              onPlaybackStatusUpdate={(status) => setStatus(() => status)}
            />
            <View style={styles.buttons}>
              <Button
                title={status.isPlaying ? "Pause" : "Play"}
                onPress={() =>
                  status.isPlaying
                    ? videoRef.current.pauseAsync()
                    : videoRef.current.playAsync()
                }
              />
            </View>
          </View>
        </SafeAreaView>

        <TouchableOpacity
          className="bg-secondary p-4 rounded-md flex items-center justify-center mx-4 mt-4"
          onPress={async () => {
            await firebaseSignOut(auth);

            await logout();
          }}
        >
          <Text className="font-bold text-black">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  video: {
    alignSelf: "center",
    width: 320,
    height: 200,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
});

export default UnverifiedAccountScreenWithVideoPlayer;
