import React, { useEffect, useRef } from "react";
import { View, Animated, Easing } from "react-native";
import Svg, { Path } from "react-native-svg";

const AnimatedCharacter = () => {
  const translateY = useRef(new Animated.Value(100)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.7)),
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.quad),
          }),
          Animated.timing(rotation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.quad),
          }),
        ])
      ),
    ]).start();
  }, []);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "20deg"],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 20,
        right: 20,
        transform: [{ translateY }, { rotate: spin }],
      }}
    >
      <Svg width="50" height="50" viewBox="0 0 50 50">
        <Path
          d="M25 5 A20 20 0 0 1 25 45 A20 20 0 0 1 25 5 M25 15 L25 35 M15 25 L35 25"
          stroke="#65B741"
          strokeWidth="2"
          fill="none"
        />
      </Svg>
    </Animated.View>
  );
};

export default AnimatedCharacter;
