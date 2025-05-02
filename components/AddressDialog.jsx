import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import CustomButton from "./CustomButton";
import { useAddressStore } from "../stores/addressStore";
import { useAuthStore } from "../stores/authStore";

const AddressDialog = ({ visible, onClose, address = null }) => {
  const { user } = useAuthStore();
  const { addAddress, updateAddress } = useAddressStore();
  const [formData, setFormData] = useState({
    addressLine: address?.addressLine || "",
    landmark: address?.landmark || "",
    city: address?.city || "",
    state: address?.state || "",
    pincode: address?.pincode || "",
    latitude: address?.latitude || 0,
    longitude: address?.longitude || 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      if (
        !formData.addressLine ||
        !formData.city ||
        !formData.state ||
        !formData.pincode
      ) {
        throw new Error("Please fill all required fields");
      }

      if (address?.id) {
        await updateAddress(user.id, { ...formData, id: address.id });
      } else {
        await addAddress(user.id, formData);
      }

      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"} // Adjust based on platform
        className="flex-1 justify-center"
      >
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="w-11/12 bg-white rounded-2xl p-5 shadow-lg">
            <Text className="text-lg font-bold mb-5">
              {address ? "Edit Address" : "Add New Address"}
            </Text>

            <TextInput
              className="border border-secondary-1 rounded-lg p-3 mb-4"
              placeholder="Address Line *"
              placeholderTextColor="gray"
              value={formData.addressLine}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, addressLine: text }))
              }
            />

            <TextInput
              className="border border-secondary-1 rounded-lg p-3 mb-4"
              placeholder="Landmark"
              placeholderTextColor="gray"
              value={formData.landmark}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, landmark: text }))
              }
            />

            <View className="flex-row justify-between">
              <TextInput
                className="border border-secondary-1 rounded-lg p-3 w-[48%]"
                placeholder="City *"
                placeholderTextColor="gray"
                value={formData.city}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, city: text }))
                }
              />
              <TextInput
                className="border border-secondary-1 rounded-lg p-3 w-[48%]"
                placeholder="State *"
                placeholderTextColor="gray"
                value={formData.state}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, state: text }))
                }
              />
            </View>

            <TextInput
              className="border border-secondary-1 rounded-lg p-3 mt-4 mb-2"
              placeholder="Pincode *"
              placeholderTextColor="gray"
              value={formData.pincode}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, pincode: text }))
              }
              keyboardType="numeric"
            />

            {error ? <Text className="text-red-500 mb-2">{error}</Text> : null}

            <View className="flex-row justify-between mt-4">
              <CustomButton
                title="Cancel"
                handlePress={onClose}
                containerStyles="bg-gray-300 w-[45%]"
              />
              <CustomButton
                title={loading ? "Saving..." : "Save"}
                handlePress={handleSubmit}
                containerStyles="bg-green-600 w-[45%]"
                disabled={loading}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddressDialog;
