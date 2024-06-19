import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { icons } from "../constants";

const SelectFormField = ({
  title,
  value,
  options,
  handleChange,
  otherStyles,
  formwidth,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const formWidth = formwidth ? formwidth : "100%";

  return (
    <View style={otherStyles}>
      <Text style={{ fontSize: 16, color: "black", fontWeight: "500" }}>
        {title}
      </Text>

      <View
        style={{
          width: formWidth,
          height: 50,
          paddingHorizontal: 15,
          backgroundColor: "#CDE990",
          borderRadius: 10,
          borderWidth: 2,
          borderColor: "#CDE990",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 8,
        }}
      >
        <Picker
          selectedValue={value}
          style={{ flex: 1, color: "black" }}
          onValueChange={(itemValue, itemIndex) => handleChange(itemValue)}
          {...props}
        >
          {options.map((option, index) => (
            <Picker.Item
              key={index}
              label={option.label}
              value={option.value}
            />
          ))}
        </Picker>
        {/* <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Image
            source={!showPassword ? icons.downArrow : icons.upArrow}
            style={{ width: 20, height: 20 }}
            resizeMode="contain"
          />
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

export default SelectFormField;
