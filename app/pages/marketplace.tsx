// app/marketplace/index.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import RangeSlider from "@react-native-community/slider";
import { format } from "date-fns";

// Mock data for demonstration
const mockStocks = [
  {
    id: "1",
    cropName: "Organic Wheat",
    category: "Grains",
    description:
      "Premium quality organic wheat, harvested from sustainable farms",
    pricePerKg: 45.5,
    finalPricePerKg: 40.0,
    availableQuantity: 500,
    city: "Bangalore",
    harvestedAt: new Date("2025-03-15"),
    expiryDate: new Date("2025-06-15"),
    createdAt: new Date("2025-03-20"),
    farmerId: "101",
    stockImage:
      "https://firebasestorage.googleapis.com/v0/b/agrotech-93561.appspot.com/o/photos%2FWnZ7W0P7nESe4YkHAycyuiKFzqt1%2F1720871934897?alt=media&token=24544c72-6f17-433f-86bc-fe7cefd24e80",
  },
  {
    id: "2",
    cropName: "Fresh Tomatoes",
    category: "Vegetables",
    description: "Juicy red tomatoes, perfect for salads and cooking",
    pricePerKg: 30.0,
    finalPricePerKg: 25.0,
    availableQuantity: 200,
    city: "Mumbai",
    harvestedAt: new Date("2025-04-10"),
    expiryDate: new Date("2025-04-25"),
    createdAt: new Date("2025-04-12"),
    farmerId: "102",
    stockImage:
      "https://firebasestorage.googleapis.com/v0/b/agrotech-93561.appspot.com/o/photos%2FWnZ7W0P7nESe4YkHAycyuiKFzqt1%2F1720871934897?alt=media&token=24544c72-6f17-433f-86bc-fe7cefd24e80",
  },
  {
    id: "3",
    cropName: "Basmati Rice",
    category: "Grains",
    description: "Premium quality basmati rice with aromatic flavor",
    pricePerKg: 85.0,
    finalPricePerKg: 80.0,
    availableQuantity: 1000,
    city: "Delhi",
    harvestedAt: new Date("2025-02-20"),
    expiryDate: new Date("2025-08-20"),
    createdAt: new Date("2025-02-25"),
    farmerId: "103",
    stockImage:
      "https://firebasestorage.googleapis.com/v0/b/agrotech-93561.appspot.com/o/photos%2FWnZ7W0P7nESe4YkHAycyuiKFzqt1%2F1720871934897?alt=media&token=24544c72-6f17-433f-86bc-fe7cefd24e80",
  },
  {
    id: "4",
    cropName: "Fresh Apples",
    category: "Fruits",
    description: "Crisp and sweet apples from the foothills of Himalayas",
    pricePerKg: 120.0,
    finalPricePerKg: 110.0,
    availableQuantity: 300,
    city: "Shimla",
    harvestedAt: new Date("2025-04-05"),
    expiryDate: new Date("2025-05-15"),
    createdAt: new Date("2025-04-07"),
    farmerId: "104",
    stockImage:
      "https://firebasestorage.googleapis.com/v0/b/agrotech-93561.appspot.com/o/photos%2FWnZ7W0P7nESe4YkHAycyuiKFzqt1%2F1720871934897?alt=media&token=24544c72-6f17-433f-86bc-fe7cefd24e80",
  },
  {
    id: "5",
    cropName: "Organic Potatoes",
    category: "Vegetables",
    description: "Farm fresh organic potatoes",
    pricePerKg: 25.0,
    finalPricePerKg: 22.0,
    availableQuantity: 800,
    city: "Chandigarh",
    harvestedAt: new Date("2025-03-28"),
    expiryDate: new Date("2025-06-28"),
    createdAt: new Date("2025-03-30"),
    farmerId: "105",
    stockImage:
      "https://firebasestorage.googleapis.com/v0/b/agrotech-93561.appspot.com/o/photos%2FWnZ7W0P7nESe4YkHAycyuiKFzqt1%2F1720871934897?alt=media&token=24544c72-6f17-433f-86bc-fe7cefd24e80",
  },
  {
    id: "6",
    cropName: "Organic Onions",
    category: "Vegetables",
    description: "Fresh organic onions with rich flavor",
    pricePerKg: 35.0,
    finalPricePerKg: 30.0,
    availableQuantity: 600,
    city: "Pune",
    harvestedAt: new Date("2025-04-02"),
    expiryDate: new Date("2025-06-02"),
    createdAt: new Date("2025-04-05"),
    farmerId: "106",
    stockImage:
      "https://firebasestorage.googleapis.com/v0/b/agrotech-93561.appspot.com/o/photos%2FWnZ7W0P7nESe4YkHAycyuiKFzqt1%2F1720871934897?alt=media&token=24544c72-6f17-433f-86bc-fe7cefd24e80",
  },
];

// Categories for filter
const categories = [
  "All",
  "Grains",
  "Vegetables",
  "Fruits",
  "Pulses",
  "Spices",
];

// Cities for filter
const cities = [
  "All",
  "Bangalore",
  "Mumbai",
  "Delhi",
  "Shimla",
  "Chandigarh",
  "Pune",
];

export default function MarketplaceScreen() {
  const router = useRouter();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter states
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [harvestedAfter, setHarvestedAfter] = useState(null);
  const [harvestedBefore, setHarvestedBefore] = useState(null);
  const [expiryAfter, setExpiryAfter] = useState(null);
  const [expiryBefore, setExpiryBefore] = useState(null);

  // Date picker states
  const [showHarvestedAfterPicker, setShowHarvestedAfterPicker] =
    useState(false);
  const [showHarvestedBeforePicker, setShowHarvestedBeforePicker] =
    useState(false);
  const [showExpiryAfterPicker, setShowExpiryAfterPicker] = useState(false);
  const [showExpiryBeforePicker, setShowExpiryBeforePicker] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStocks(mockStocks);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredStocks = stocks.filter((stock) => {
    // Filter by search query
    if (
      searchQuery &&
      !stock.cropName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Filter by city
    if (selectedCity !== "All" && stock.city !== selectedCity) {
      return false;
    }

    // Filter by category
    if (selectedCategory !== "All" && stock.category !== selectedCategory) {
      return false;
    }

    // Filter by price range
    if (
      stock.finalPricePerKg < priceRange[0] ||
      stock.finalPricePerKg > priceRange[1]
    ) {
      return false;
    }

    // Filter by harvested date
    if (harvestedAfter && new Date(stock.harvestedAt) < harvestedAfter) {
      return false;
    }

    if (harvestedBefore && new Date(stock.harvestedAt) > harvestedBefore) {
      return false;
    }

    // Filter by expiry date
    if (expiryAfter && new Date(stock.expiryDate) < expiryAfter) {
      return false;
    }

    if (expiryBefore && new Date(stock.expiryDate) > expiryBefore) {
      return false;
    }

    return true;
  });

  const handleDateChange = (event, selectedDate, setter, setShowPicker) => {
    setShowPicker(false);
    if (selectedDate) {
      setter(selectedDate);
    }
  };

  const resetFilters = () => {
    setSelectedCity("All");
    setSelectedCategory("All");
    setPriceRange([0, 200]);
    setHarvestedAfter(null);
    setHarvestedBefore(null);
    setExpiryAfter(null);
    setExpiryBefore(null);
    setSearchQuery("");
  };

  const navigateToStockDetail = (stock) => {
    router.push({
      pathname: `/stock/${stock.id}`,
      params: { stockId: stock.id },
    });
  };

  const renderStock = ({ item }) => (
    <TouchableOpacity
      className="mb-4 rounded-xl overflow-hidden bg-white shadow-md"
      onPress={() => navigateToStockDetail(item)}
    >
      <View className="h-40 w-full">
        <Image
          source={{ uri: item.stockImage }}
          className="h-full w-full"
          resizeMode="cover"
        />
      </View>
      <View className="p-3">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-psemibold text-black">
            {item.cropName}
          </Text>
          <View className="bg-secondary p-1 px-2 rounded-full">
            <Text className="text-white font-pmedium text-xs">
              {item.category}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center mt-1">
          <MaterialIcons name="location-on" size={16} color="#65B741" />
          <Text className="text-sm font-pregular text-gray-100 ml-1">
            {item.city}
          </Text>
        </View>

        <View className="flex-row items-center justify-between mt-2">
          <View>
            <Text className="text-sm font-plight text-gray-100">Price</Text>
            <View className="flex-row items-center">
              <Text className="text-lg font-psemibold text-secondary">
                ₹{item.finalPricePerKg}
              </Text>
              {item.finalPricePerKg < item.pricePerKg && (
                <Text className="text-sm font-plight text-gray-100 line-through ml-2">
                  ₹{item.pricePerKg}
                </Text>
              )}
              <Text className="text-sm font-plight text-gray-100 ml-1">
                /kg
              </Text>
            </View>
          </View>
          <View>
            <Text className="text-sm font-plight text-gray-100">Available</Text>
            <Text className="text-base font-pmedium text-black">
              {item.availableQuantity} kg
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-1 p-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-pbold text-black-100">
            Marketplace
          </Text>
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => setShowFilters(!showFilters)}
          >
            <Feather name="filter" size={20} color="#65B741" />
            <Text className="text-secondary ml-1 font-pmedium">Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-white rounded-lg shadow-sm mb-4 border border-gray-100 p-2">
          <Feather name="search" size={20} color="#CDCDE0" />
          <TextInput
            className="flex-1 pl-2 font-pregular text-black"
            placeholder="Search crops..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Feather name="x" size={20} color="#CDCDE0" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Section */}
        {showFilters && (
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
            <Text className="text-lg font-psemibold text-black-100 mb-2">
              Filters
            </Text>

            {/* City Filter */}
            <Text className="text-sm font-pmedium text-black-100 mb-1">
              City
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-3"
            >
              {cities.map((city, index) => (
                <TouchableOpacity
                  key={index}
                  className={`py-1 px-3 mr-2 rounded-full ${
                    selectedCity === city ? "bg-secondary" : "bg-gray-100"
                  }`}
                  onPress={() => setSelectedCity(city)}
                >
                  <Text
                    className={`font-pmedium ${
                      selectedCity === city ? "text-white" : "text-black"
                    }`}
                  >
                    {city}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Category Filter */}
            <Text className="text-sm font-pmedium text-black-100 mb-1">
              Category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-3"
            >
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  className={`py-1 px-3 mr-2 rounded-full ${
                    selectedCategory === category
                      ? "bg-secondary"
                      : "bg-gray-100"
                  }`}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    className={`font-pmedium ${
                      selectedCategory === category
                        ? "text-white"
                        : "text-black"
                    }`}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Price Range */}
            <Text className="text-sm font-pmedium text-black-100 mb-1">
              Price Range (₹{priceRange[0]} - ₹{priceRange[1]})
            </Text>
            <RangeSlider
              style={{ width: "100%", height: 40 }}
              minimumValue={0}
              maximumValue={200}
              value={priceRange[1]}
              onValueChange={(value) => setPriceRange([priceRange[0], value])}
              minimumTrackTintColor="#65B741"
              maximumTrackTintColor="#CDCDE0"
            />

            {/* Date Filters */}
            <View className="flex-row justify-between">
              <View className="w-40p">
                <Text className="text-sm font-pmedium text-black-100 mb-1">
                  Harvested After
                </Text>
                <TouchableOpacity
                  className="border border-gray-100 p-2 rounded-lg"
                  onPress={() => setShowHarvestedAfterPicker(true)}
                >
                  <Text className="font-pregular">
                    {harvestedAfter
                      ? format(harvestedAfter, "dd/MM/yyyy")
                      : "Select date"}
                  </Text>
                </TouchableOpacity>
                {showHarvestedAfterPicker && (
                  <DateTimePicker
                    value={harvestedAfter || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) =>
                      handleDateChange(
                        event,
                        date,
                        setHarvestedAfter,
                        setShowHarvestedAfterPicker
                      )
                    }
                  />
                )}
              </View>

              <View className="w-40p">
                <Text className="text-sm font-pmedium text-black-100 mb-1">
                  Harvested Before
                </Text>
                <TouchableOpacity
                  className="border border-gray-100 p-2 rounded-lg"
                  onPress={() => setShowHarvestedBeforePicker(true)}
                >
                  <Text className="font-pregular">
                    {harvestedBefore
                      ? format(harvestedBefore, "dd/MM/yyyy")
                      : "Select date"}
                  </Text>
                </TouchableOpacity>
                {showHarvestedBeforePicker && (
                  <DateTimePicker
                    value={harvestedBefore || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) =>
                      handleDateChange(
                        event,
                        date,
                        setHarvestedBefore,
                        setShowHarvestedBeforePicker
                      )
                    }
                  />
                )}
              </View>
            </View>

            <View className="flex-row justify-between mt-3">
              <View className="w-40p">
                <Text className="text-sm font-pmedium text-black-100 mb-1">
                  Expiry After
                </Text>
                <TouchableOpacity
                  className="border border-gray-100 p-2 rounded-lg"
                  onPress={() => setShowExpiryAfterPicker(true)}
                >
                  <Text className="font-pregular">
                    {expiryAfter
                      ? format(expiryAfter, "dd/MM/yyyy")
                      : "Select date"}
                  </Text>
                </TouchableOpacity>
                {showExpiryAfterPicker && (
                  <DateTimePicker
                    value={expiryAfter || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) =>
                      handleDateChange(
                        event,
                        date,
                        setExpiryAfter,
                        setShowExpiryAfterPicker
                      )
                    }
                  />
                )}
              </View>

              <View className="w-40p">
                <Text className="text-sm font-pmedium text-black-100 mb-1">
                  Expiry Before
                </Text>
                <TouchableOpacity
                  className="border border-gray-100 p-2 rounded-lg"
                  onPress={() => setShowExpiryBeforePicker(true)}
                >
                  <Text className="font-pregular">
                    {expiryBefore
                      ? format(expiryBefore, "dd/MM/yyyy")
                      : "Select date"}
                  </Text>
                </TouchableOpacity>
                {showExpiryBeforePicker && (
                  <DateTimePicker
                    value={expiryBefore || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) =>
                      handleDateChange(
                        event,
                        date,
                        setExpiryBefore,
                        setShowExpiryBeforePicker
                      )
                    }
                  />
                )}
              </View>
            </View>

            {/* Filter Actions */}
            <View className="flex-row justify-between mt-4">
              <TouchableOpacity
                className="bg-gray-100 py-2 px-4 rounded-lg"
                onPress={resetFilters}
              >
                <Text className="font-pmedium text-black-100">Reset All</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-secondary py-2 px-4 rounded-lg"
                onPress={() => setShowFilters(false)}
              >
                <Text className="font-pmedium text-white">Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Stocks List */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#65B741" />
            <Text className="mt-2 font-pmedium text-secondary">
              Loading stocks...
            </Text>
          </View>
        ) : filteredStocks.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Feather name="package" size={60} color="#CDCDE0" />
            <Text className="mt-4 font-pmedium text-black-100 text-lg">
              No stocks found
            </Text>
            <Text className="mt-1 font-pregular text-gray-100 text-center">
              Try adjusting your filters or search query
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredStocks}
            renderItem={renderStock}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
