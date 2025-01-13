// hooks/useLocationEffect.js
import { useState, useCallback } from "react";
import * as Location from "expo-location";
import Toast from "react-native-root-toast";
import { useTranslation } from "react-i18next";

const useLocationEffect = (initialAddress, initialState, initialPincode) => {
  const [locationState, setLocationState] = useState({
    locationCoords: null,
    locationString: initialAddress,
    stateString: initialState,
    pincodeString: initialPincode,
  });
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const getCurrentLocation = useCallback(async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Toast.show(t("locationPermissionDenied"), {
          duration: Toast.durations.LONG,
          position: Toast.positions.CENTER,
          backgroundColor: "red",
        });
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const geocodeResponse = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const address = geocodeResponse[0];
      // console.log(address);
      const locationString = `${address.name}, ${address.city}, ${address.district}`;
      const stateString = address.region;
      const pincodeString = address.postalCode;
      setLocationState({
        locationCoords: { latitude, longitude },
        locationString,
        stateString,
        pincodeString,
      });
    } catch (error) {
      Toast.show(t("errorGettingLocation"), {
        duration: Toast.durations.LONG,
        position: Toast.positions.CENTER,
        backgroundColor: "red",
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  return { locationState, loading, getCurrentLocation };
};

export default useLocationEffect;
