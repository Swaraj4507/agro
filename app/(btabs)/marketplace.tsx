// app/marketplace.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import RangeSlider from "@react-native-community/slider";
import { format } from "date-fns";
import { Loader } from "../../components";
import { fetchStocks } from "../../api/marketplace";
import { MarketplaceStockProjection } from "../../types/marketplace";

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
  "NARASANNAPETA",
  "BANGALORE",
  "MUMBAI",
  "DELHI",
  "SHIMLA",
  "CHANDIGARH",
  "PUNE",
];

export default function MarketplaceScreen() {
  const router = useRouter();
  const [stocks, setStocks] = useState<MarketplaceStockProjection[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Filter states
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 200]);

  const loadStocks = async (reset = false) => {
    try {
      const currentPage = reset ? 0 : page;
      const params = {
        page: currentPage,
        size: 10,
        ...(selectedCity !== "All" && { city: selectedCity }),
        ...(selectedCategory !== "All" && { category: selectedCategory }),
        ...(searchQuery && { cropName: searchQuery }),
      };

      if (reset) {
        setLoading(true);
      } else if (currentPage > 0) {
        setLoadingMore(true);
      }

      const response = await fetchStocks(params);
      const newStocks = response.data.content;

      if (reset) {
        setStocks(newStocks);
      } else {
        setStocks((prev) => [...prev, ...newStocks]);
      }

      setHasMore(!response.data.last);
      setPage(currentPage + 1);
    } catch (error) {
      console.error("Error loading stocks:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      loadStocks();
    }
  };

  const handleSearch = () => {
    setPage(0);
    loadStocks(true);
  };

  const handleFilterApply = () => {
    setShowFilters(false);
    setPage(0);
    loadStocks(true);
  };

  useFocusEffect(
    useCallback(() => {
      loadStocks(true);
    }, [])
  );

  const resetFilters = () => {
    setSelectedCity("All");
    setSelectedCategory("All");
    setPriceRange([0, 200]);
    setSearchQuery("");
    setPage(0);
    loadStocks(true);
  };

  const navigateToStockDetail = (stock: MarketplaceStockProjection) => {
    router.push({
      pathname: `/stock/${stock.id}`,
      params: { stockId: stock.id },
    });
  };

  const renderStock = ({ item }: { item: MarketplaceStockProjection }) => (
    <TouchableOpacity
      className="mb-4 rounded-xl overflow-hidden bg-white shadow-md"
      onPress={() => navigateToStockDetail(item)}
    >
      <View className="h-40 w-full">
        <Image
          source={{ uri: item.stockImage }}
          className="h-full w-full"
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

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#65B741" />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-1">
      
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
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                handleSearch();
              }}
            >
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
                onPress={handleFilterApply}
              >
                <Text className="font-pmedium text-white">Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Stocks List */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <Loader isLoading={true} content="stocks being loaded" />
          </View>
        ) : stocks.length === 0 ? (
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
            data={stocks}
            renderItem={renderStock}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
