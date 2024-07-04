import { View, Text } from "react-native";
import React from "react";
import { Loader } from "../../components";
import { useTranslation } from "react-i18next";
const addReq = () => {
  const { t } = useTranslation();
  return (
    <View>
      {/* <Text>addReq</Text> */}
      <Loader isLoading={true} content={t("comingSoon")} />
    </View>
  );
};

export default addReq;
