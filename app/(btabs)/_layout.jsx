import { Image, View, Text } from "react-native";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { icons } from "../../constants";
import { StatusBar } from "expo-status-bar";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
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
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#65B741",
          tabBarInactiveTintColor: "#222831",
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopWidth: 0,
            borderTopColor: "#222831",
            height: hp("10%"),
            marginTop: hp("-5%"),
            // paddingBottom: hp("3%"),
          },
        }}
      >
        <Tabs.Screen
          name="bhome"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.home}
                color={color}
                name="Home"
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="addReq"
          options={{
            title: "Add Requirements",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.plus}
                color={color}
                name="Add Requirement"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="bprofile"
          options={{
            title: "Profile",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.profile}
                color={color}
                name="Profile"
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
