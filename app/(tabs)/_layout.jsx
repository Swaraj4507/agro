import { Image, View, Text } from "react-native";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { icons } from "../../constants";
import { StatusBar } from "expo-status-bar";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTranslation } from "react-i18next";
const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View className="flex items-center justify-center gap-2">
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={color}
        className="w-6 h-6"
      />
      <Text
        className={`${focused ? "font-psemibold" : "font-pregular"} text-xs`}
        style={{ color: color }}
      >
        {name}
      </Text>
    </View>
  );
};
const TabsLayout = () => {
  const { t } = useTranslation();
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#65B741",
          tabBarInactiveTintColor: "#222831",
          tabBarShowLabel: false,
          tabBarStyle: {
            position: "absolute",
            backgroundColor: "#fff",
            borderTopWidth: 0,
            borderTopColor: "#222831",
            height: hp("10%"),
            marginHorizontal: hp("2%"),
            marginBottom: hp("2%"),
            paddingVertical: hp("2.5%"),
            borderRadius: 25,
            borderCurve: "continuous",
            shadowColor: "black",
            shadowOffset: { width: 0, height: 10 },
            shadowRadius: 10,
            shadowOpacity: 0.1,
            // paddingTop: 10,
            // paddingBottom: 3,
            // marginBottom: hp("10%"),
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.home}
                color={color}
                name={t("nhome")}
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="create"
          options={{
            title: "Create",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.store}
                color={color}
                name={t("create_com")}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="addCrop"
          options={{
            title: "Add Crop",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.crop}
                color={color}
                name={t("addCropT")}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.profile}
                color={color}
                name={t("profile")}
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>
      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default TabsLayout;
