import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";

import { icons } from "../constants";
import RNDateTimePicker from "@react-native-community/datetimepicker";

const FormField = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  formwidith,
  date,
  readOnly = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const formwid = formwidith ? formwidith : "w-full";
  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className="text-base text-black font-pmedium">{title}</Text>

      <View
        className={`${formwid}  h-16 px-4 bg-secondary-1 rounded-2xl border-2 border-secondary-1 focus:border-secondary flex flex-row items-center`}
      >
        {!date && (
          <TextInput
            className="flex-1  text-black font-psemibold text-base"
            value={value}
            placeholder={placeholder}
            placeholderTextColor="#7B7B8B"
            onChangeText={handleChangeText}
            editable={!readOnly}
            secureTextEntry={
              (title === "Password" || title === "पासवर्ड") && !showPassword
            }
            {...props}
          />
        )}
        {date && (
          <RNDateTimePicker
            value={value}
            onChange={handleChangeText}
            className="bg-secondary-1"
          />
        )}

        {(title === "Password" || title === "पासवर्ड") && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image
              source={!showPassword ? icons.eye : icons.eyeHide}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField;
