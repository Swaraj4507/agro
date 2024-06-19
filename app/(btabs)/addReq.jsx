import { View, Text } from "react-native";
import React from "react";
import { Loader } from "../../components";

const addReq = () => {
  return (
    <View>
      <Text>addReq</Text>
      <Loader isLoading={true} content={"Coming soon..."} />
    </View>
  );
};

export default addReq;
