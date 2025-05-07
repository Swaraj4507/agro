import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";
import { icons, images } from "../../constants";
import CustomButton from "../../components/CustomButton";
import InfoBox from "../../components/InfoBox";
import EmptyState from "../../components/EmptyState";
import { router } from "expo-router";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Loader } from "../../components";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../stores/authStore";
import ProfileCompletionComponent from "../../components/ProfileCompletionComponent";
import AddressDialog from "../../components/AddressDialog";
import { useAddressStore } from "../../stores/addressStore";
// Address Card Component
const AddressCard = ({
  address,
  isDefault,
  onEdit,
  onSetDefault,
  onDelete,
}) => (
  <View className="w-full bg-white p-4 rounded-lg my-2 shadow-sm border border-gray-100">
    {isDefault && (
      <View className="absolute top-2 right-2 bg-green-100 px-2 py-1 rounded-md">
        <Text className="text-xs text-green-700 font-psemibold">Default</Text>
      </View>
    )}
    <Text className="font-pbold text-black">{address.addressLine}</Text>
    <Text className="text-gray-600">{address.landmark}</Text>
    <Text className="text-gray-600">
      {address.city}, {address.state}, {address.pincode}
    </Text>

    <View className="flex-row mt-3 justify-end">
      <TouchableOpacity onPress={() => onEdit(address)} className="mr-4">
        <Image source={icons.edit} className="w-5 h-5" />
      </TouchableOpacity>

      {!isDefault && (
        <TouchableOpacity
          onPress={() => onSetDefault(address.id)}
          className="mr-4"
        >
          <Image source={icons.plus} className="w-5 h-5" />
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => onDelete(address.id)}>
        <Image source={icons.eye} className="w-5 h-5" tintColor="red" />
      </TouchableOpacity>
    </View>
  </View>
);

const Profile = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const { addresses, fetchAddresses } = useAddressStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [editingAddress, setEditingAddress] = useState(null);
  const [showAddressDialog, setShowAddressDialog] = useState(false);

  const [defaultAddressId, setDefaultAddressId] = useState("1");

  const handleSignOut = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
    router.replace("/");
  };

  const handleEditProfile = () => {
    router.push("/pages/edit-profile");
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddressDialog(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowAddressDialog(true);
  };

  const handleSetDefaultAddress = (id) => {
    setDefaultAddressId(id);
  };

  const handleDeleteAddress = (id) => {};

  if (loading) {
    return <Loader isLoading={true} />;
  }
  useEffect(() => {
    fetchAddresses(user.id);
  }, []);
  return (
    <SafeAreaView
      className="bg-primary h-full "
      style={{ paddingBottom: hp("10%") }}
    >
      <ScrollView>
        <View className="w-full flex justify-center items-center mt-6 mb-4 px-4">
          <View className="w-full flex-row justify-between items-center">
            <TouchableOpacity onPress={() => router.back()}>
              <Image
                source={icons.back}
                resizeMode="contain"
                className="w-6 h-6"
              />
            </TouchableOpacity>
            <Text className="text-xl font-pbold text-black">My Profile</Text>
            <TouchableOpacity onPress={handleSignOut}>
              <Image
                source={icons.logout}
                resizeMode="contain"
                className="w-6 h-6"
              />
            </TouchableOpacity>
          </View>

          <View className="w-full flex items-center mt-6">
            <View className="w-20 h-20 border border-secondary rounded-full flex justify-center items-center bg-gray-100">
              <Image
                source={
                  user?.profileImage
                    ? { uri: user.profileImage }
                    : images.farmer
                }
                className="w-[90%] h-[90%] rounded-full"
                resizeMode="cover"
              />
            </View>

            <Text className="mt-3 text-lg font-pbold text-black">
              {user?.name || "Buyer Name"}
            </Text>
            <Text className="text-gray-600">
              {user?.phoneNumber || "9876543210"}
            </Text>

            <CustomButton
              title="Edit Profile"
              handlePress={handleEditProfile}
              containerStyles="mt-4 w-[40%] bg-secondary"
            />
          </View>

          <ProfileCompletionComponent
            user={user}
            handlePress={() => router.push("/pages/bProfileCompletion")}
          />

          {/* Tab Navigation */}
          <View className="flex-row w-full justify-around mt-8 border-b border-gray-200">
            <TouchableOpacity
              onPress={() => setActiveTab("profile")}
              className={`pb-2 px-4 ${
                activeTab === "profile" ? "border-b-2 border-green-600" : ""
              }`}
            >
              <Text
                className={`font-psemibold ${
                  activeTab === "profile" ? "text-green-600" : "text-gray-600"
                }`}
              >
                Profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("addresses")}
              className={`pb-2 px-4 ${
                activeTab === "addresses" ? "border-b-2 border-green-600" : ""
              }`}
            >
              <Text
                className={`font-psemibold ${
                  activeTab === "addresses" ? "text-green-600" : "text-gray-600"
                }`}
              >
                Addresses
              </Text>
            </TouchableOpacity>
          </View>

          {/* Profile Information */}
          {activeTab === "profile" && (
            <View className="w-full mt-6">
              <View className="bg-white p-4 rounded-lg shadow-sm mb-4">
                <Text className="font-pbold text-lg mb-4">
                  Company Information
                </Text>
                <InfoBox
                  title="Organization"
                  subtitle={user?.orgName || "AgroTech Ltd"}
                  containerStyles="mb-3"
                />
                <InfoBox
                  title="Account Type"
                  subtitle={user?.userType || "BUYER"}
                  containerStyles="mb-3"
                />
                <InfoBox
                  title="Member Since"
                  subtitle={new Date(
                    user?.createdAt || Date.now()
                  ).toLocaleDateString()}
                />
              </View>

              <View className="flex-row justify-between w-full">
                <TouchableOpacity
                  className="bg-white p-4 rounded-lg shadow-sm w-[48%] items-center"
                  onPress={() => router.push("/pages/ordersListing")}
                >
                  <Image
                    source={icons.booking}
                    resizeMode="contain"
                    className="w-8 h-8 mb-2"
                  />
                  <Text className="font-psemibold">My Orders</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-white p-4 rounded-lg shadow-sm w-[48%] items-center"
                  onPress={() => router.push("/pages/negotiations")}
                >
                  <Image
                    source={icons.handshake}
                    resizeMode="contain"
                    className="w-8 h-8 mb-2"
                  />
                  <Text className="font-psemibold">Negotiations</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                className="bg-white p-4 rounded-lg shadow-sm w-full items-center flex-row justify-center mt-4"
                onPress={() => router.push("/pages/add-requirement")}
              >
                <Image
                  source={icons.add}
                  resizeMode="contain"
                  className="w-6 h-6 mr-2"
                />
                <Text className="font-psemibold">Add New Requirement</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Addresses */}
          {activeTab === "addresses" && (
            <View className="w-full mt-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="font-pbold text-lg">Saved Addresses</Text>
                <TouchableOpacity
                  onPress={handleAddAddress}
                  className="bg-green-600 px-3 py-1 rounded-md flex-row items-center"
                >
                  <Image
                    source={icons.add}
                    resizeMode="contain"
                    className="w-4 h-4 mr-1"
                    tintColor="white"
                  />
                  <Text className="text-white font-psemibold">Add New</Text>
                </TouchableOpacity>
              </View>

              {addresses?.length > 0 ? (
                addresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    isDefault={address.id === defaultAddressId}
                    onEdit={handleEditAddress}
                    onSetDefault={handleSetDefaultAddress}
                    onDelete={handleDeleteAddress}
                  />
                ))
              ) : (
                <EmptyState
                  title="No Addresses Found"
                  subtitle="Add your first address to get started"
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <AddressDialog
        visible={showAddressDialog}
        onClose={() => setShowAddressDialog(false)}
        address={editingAddress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    width: wp("90%"),
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default Profile;
