import { useState, useRef, useEffect } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { useAuthStore } from "../../stores/authStore";
import Toast from "react-native-root-toast";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import * as Animatable from "react-native-animatable";
import { getUserRole } from "../../api/authAPI";

const SignIn = () => {
  const { login } = useAuthStore();
  const [submitted, setSubmitted] = useState(false);
  const { t } = useTranslation();
  const [isSubmitting, setSubmitting] = useState(false);
  const [checkingRole, setCheckingRole] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [step, setStep] = useState(1); // 1: Enter mobile, 2: Enter password
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const modalScaleAnim = useRef(new Animated.Value(0.9)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;

  const [form, setForm] = useState({
    mobile: "",
    password: "",
  });

  useEffect(() => {
    // Animate form appearance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Animation for transitioning between steps
  const animateTransition = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(2);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const openRegisterModal = () => {
    setShowRegisterModal(true);
    Animated.parallel([
      Animated.timing(modalScaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeRegisterModal = () => {
    Animated.parallel([
      Animated.timing(modalScaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowRegisterModal(false);
    });
  };

  const navigateToRegistration = (role) => {
    closeRegisterModal();
    // Short delay to allow modal closing animation to complete
    setTimeout(() => {
      // const route = role === "farmer" ? "/sign-up-f" : "/sign-up-b";
      // router.push(route);

      router.push({
        pathname: "/sign-up",
        params: { userType: role }
      });
    }, 200);
  };

  const checkRole = async () => {
    if (!form.mobile || form.mobile.length < 10) {
      Toast.show(t("enterValidMobile"), {
        duration: Toast.durations.SHORT,
        position: Toast.positions.TOP,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
        backgroundColor: "red",
        textColor: "white",
        opacity: 1,
        textStyle: {
          fontSize: 16,
          fontWeight: "bold",
        },
        containerStyle: {
          marginTop: hp("5%"),
          borderRadius: 20,
          paddingHorizontal: 20,
        },
      });
      return;
    }

    setCheckingRole(true);
    try {
      const response = await getUserRole(form.mobile);

      if (response.success && response.data.role) {
        setUserRole(response.data.role);
        animateTransition();
      } else {
        Toast.show(response.message || t("userNotFound"), {
          duration: Toast.durations.SHORT,
          position: Toast.positions.TOP,
          shadow: true,
          animation: true,
          hideOnPress: true,
          delay: 0,
          backgroundColor: "orange",
          textColor: "white",
          opacity: 1,
          textStyle: {
            fontSize: 16,
            fontWeight: "bold",
          },
          containerStyle: {
            marginTop: hp("5%"),
            borderRadius: 20,
            paddingHorizontal: 20,
          },
        });
      }
    } catch (error) {
      Toast.show(t("errorCheckingRole"), {
        duration: Toast.durations.SHORT,
        position: Toast.positions.TOP,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
        backgroundColor: "red",
        textColor: "white",
        opacity: 1,
        textStyle: {
          fontSize: 16,
          fontWeight: "bold",
        },
        containerStyle: {
          marginTop: hp("5%"),
          borderRadius: 20,
          paddingHorizontal: 20,
        },
      });
    } finally {
      setCheckingRole(false);
    }
  };

  const submit = async () => {
    setSubmitted(true);
    if (form.mobile === "" || form.password === "") {
      Toast.show(t("fillAllFields"), {
        duration: Toast.durations.SHORT,
        position: Toast.positions.TOP,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
        backgroundColor: "red",
        textColor: "white",
        opacity: 1,
        textStyle: {
          fontSize: 16,
          fontWeight: "bold",
        },
        containerStyle: {
          marginTop: hp("5%"),
          borderRadius: 20,
          paddingHorizontal: 20,
        },
      });
      return;
    }

    setSubmitting(true);
    try {
      const success = await login(form.mobile, form.password);
      if (success) {
        Toast.show(t("userSignedIn"), {
          duration: Toast.durations.SHORT,
          position: Toast.positions.TOP,
          shadow: true,
          animation: true,
          hideOnPress: true,
          delay: 0,
          backgroundColor: "green",
          textColor: "white",
          opacity: 1,
          textStyle: {
            fontSize: 16,
            fontWeight: "bold",
          },
          containerStyle: {
            marginTop: hp("5%"),
            borderRadius: 20,
            paddingHorizontal: 20,
          },
        });
        console.log("User signed in successfully:", success);
        router.replace("/");
        router.dismissAll();
      } else {
        // Error toast with server-provided message.
        Toast.show(response.error || t("errorInvalidCredentials"), {
          duration: Toast.durations.SHORT,
          position: Toast.positions.TOP,
          shadow: true,
          animation: true,
          hideOnPress: true,
          delay: 0,
          backgroundColor: "red",
          textColor: "white",
          opacity: 1,
          textStyle: {
            fontSize: 16,
            fontWeight: "bold",
          },
          containerStyle: {
            marginTop: hp("5%"),
            borderRadius: 20,
            paddingHorizontal: 20,
          },
        });
      }
    } catch (error) {
      Toast.show(t("errorInvalidCredentials"), {
        duration: Toast.durations.SHORT,
        position: Toast.positions.TOP,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
        backgroundColor: "red",
        textColor: "white",
        opacity: 1,
        textStyle: {
          fontSize: 16,
          fontWeight: "bold",
        },
        containerStyle: {
          marginTop: hp("5%"),
          borderRadius: 20,
          paddingHorizontal: 20,
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isFieldEmpty = (field) => {
    return !form[field];
  };

  // Get role icon based on role type
  const getRoleIcon = () => {
    switch (userRole?.toUpperCase()) {
      case "FARMER":
        return require("../../assets/images/farmer-icon.png");
      case "BUYER":
        return require("../../assets/images/buyer-icon.png");
      case "ADMIN":
        return require("../../assets/images/farmer-icon.png");
      default:
        return require("../../assets/images/farmer-icon.png");
    }
  };

  // Get welcome message based on role
  const getWelcomeMessage = () => {
    switch (userRole?.toUpperCase()) {
      case "FARMER":
        return t("welcomeBackFarmer");
      case "BUYER":
        return t("welcomeBackBuyer");
      case "ADMIN":
        return t("welcomeBackAdmin");
      default:
        return t("welcomeBack");
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Role selection modal
  const RoleSelectionModal = () => (
    <Modal
      transparent={true}
      visible={showRegisterModal}
      animationType="none"
      onRequestClose={closeRegisterModal}
    >
      <TouchableWithoutFeedback onPress={closeRegisterModal}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <TouchableWithoutFeedback>
            <Animated.View
              className="bg-white rounded-2xl p-6 w-4/5 items-center"
              style={{
                transform: [{ scale: modalScaleAnim }],
                opacity: modalOpacityAnim,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <Text className="text-2xl font-psemibold text-center text-secondary mb-6">
                {t("chooseAccountType")}
              </Text>

              <View className="w-full flex-row justify-between mb-4">
                <Animatable.View
                  animation="fadeInLeft"
                  duration={500}
                  delay={100}
                  className="w-5/12"
                >
                  <TouchableOpacity
                    className="bg-primary border-2 border-secondary rounded-xl p-4 items-center"
                    onPress={() => navigateToRegistration("farmer")}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={require("../../assets/images/farmer-icon.png")}
                      style={{ width: 70, height: 70 }}
                      className="mb-3"
                    />
                    <Text className="text-lg font-psemibold text-secondary">
                      {t("farmer")}
                    </Text>
                  </TouchableOpacity>
                </Animatable.View>

                <Animatable.View
                  animation="fadeInRight"
                  duration={500}
                  delay={100}
                  className="w-5/12"
                >
                  <TouchableOpacity
                    className="bg-primary border-2 border-secondary rounded-xl p-4 items-center"
                    onPress={() => navigateToRegistration("buyer")}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={require("../../assets/images/buyer-icon.png")}
                      style={{ width: 70, height: 70 }}
                      className="mb-3"
                    />
                    <Text className="text-lg font-psemibold text-secondary">
                      {t("buyer")}
                    </Text>
                  </TouchableOpacity>
                </Animatable.View>
              </View>

              <Animatable.View
                animation="fadeInUp"
                duration={400}
                delay={300}
                className="w-full"
              >
                <CustomButton
                  title={t("cancel")}
                  handlePress={closeRegisterModal}
                  containerStyles="mt-2"
                  buttonColor="gray"
                />
              </Animatable.View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView className="bg-primary h-full">
        <ScrollView className="">
          <View className="flex justify-center items-center mt-3">
            <Text className="text-3xl text-secondary font-psemibold pt-2">
              {t("appName")}
            </Text>
            <Text className="text-xm text-black font-psemibold mt-5">
              {t("slogan")}
            </Text>
          </View>

          <Animated.View
            className="w-full flex justify-start h-full px-4 my-6"
            style={{
              minHeight: Dimensions.get("window").height - 100,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {step === 1 ? (
              <>
                <Text className="text-3xl font-semibold text-black mt-10 font-psemibold pt-2">
                  {t("signIn")}
                </Text>
                <View className="flex pt-5 flex-row gap-2 w-3/4 justify-start">
                  <Text className="text-lg text-gray-500 font-pregular">
                    {t("noAccount")}
                  </Text>
                  <TouchableOpacity onPress={openRegisterModal}>
                    <Text className="text-lg font-psemibold text-secondary">
                      {t("register")}
                    </Text>
                  </TouchableOpacity>
                </View>

                <FormField
                  title={t("mobileNumber")}
                  value={form.mobile}
                  handleChangeText={(e) => setForm({ ...form, mobile: e })}
                  otherStyles="mt-7"
                  keyboardType="numeric"
                  leftEmpty={isFieldEmpty("mobile")}
                  submitted={submitted}
                  maxLength={10}
                />

                <CustomButton
                  title={checkingRole ? t("checking") : t("continue")}
                  handlePress={checkRole}
                  containerStyles="mt-7"
                  isLoading={checkingRole}
                />
              </>
            ) : (
              <>
                <Animatable.View
                  animation="fadeIn"
                  duration={800}
                  className="items-center justify-center mt-4"
                >
                  <Image
                    source={getRoleIcon()}
                    style={{ width: 80, height: 80 }}
                    className="rounded-full"
                  />
                  <Text className="text-xl font-psemibold text-secondary mt-3">
                    {getWelcomeMessage()}
                  </Text>
                </Animatable.View>

                <FormField
                  title={t("mobileNumber")}
                  value={form.mobile}
                  handleChangeText={(e) => setForm({ ...form, mobile: e })}
                  otherStyles="mt-7"
                  keyboardType="numeric"
                  leftEmpty={isFieldEmpty("mobile")}
                  submitted={submitted}
                  editable={false}
                />

                <Animatable.View animation="fadeIn" duration={500} delay={300}>
                  <FormField
                    title={t("password")}
                    value={form.password}
                    handleChangeText={(e) => setForm({ ...form, password: e })}
                    otherStyles="mt-7"
                    leftEmpty={isFieldEmpty("password")}
                    submitted={submitted}
                    secureTextEntry={true}
                  />
                </Animatable.View>

                <Animatable.View animation="fadeIn" duration={500} delay={400}>
                  <CustomButton
                    title={t("signIn")}
                    handlePress={submit}
                    containerStyles="mt-7"
                    isLoading={isSubmitting}
                  />
                </Animatable.View>

                <View className="flex pt-5 flex-row gap-2 w-3/4 justify-start">
                  <Text className="text-lg text-gray-500 font-pregular">
                    {t("forgotPassword")}
                  </Text>
                  <Link
                    href="/forgotPassword"
                    className="text-lg font-psemibold text-secondary"
                  >
                    {t("click here")}
                  </Link>
                </View>

                <TouchableWithoutFeedback
                  onPress={() => {
                    setStep(1);
                    setUserRole(null);
                    animateTransition();
                  }}
                >
                  <Animatable.View
                    animation="fadeIn"
                    duration={500}
                    delay={500}
                    className="items-center mt-5"
                  >
                    <Text className="text-secondary font-psemibold">
                      {t("useAnotherNumber")}
                    </Text>
                  </Animatable.View>
                </TouchableWithoutFeedback>
              </>
            )}

            <View className="h-10" />
          </Animated.View>
        </ScrollView>

        {/* Role Selection Modal */}
        <RoleSelectionModal />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default SignIn;
