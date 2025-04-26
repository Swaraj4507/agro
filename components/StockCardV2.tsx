import { View, Text, Image, Pressable } from "react-native";
import { Link } from "expo-router";
import { Stock } from "../services/mockDataService";
import { formatDistanceToNow } from "date-fns";

interface StockCardProps {
  stock: Stock;
}

const StockCard = ({ stock }: StockCardProps) => {
  return (
    <Link href={`/stock/${stock.id}`} asChild>
      <Pressable className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
        <Image
          src={stock.imageUrl}
          className="w-full h-48"
          resizeMode="cover"
        />
        <View className="p-4">
          <View className="flex-row justify-between items-start">
            <Text className="text-lg font-semibold">{stock.cropName}</Text>
            <View className="bg-gray-100 px-2 py-1 rounded">
              <Text className="text-sm text-gray-600">{stock.category}</Text>
            </View>
          </View>

          <View className="flex-row items-center mt-2">
            <Text className="text-gray-600 text-sm">📍 {stock.city}</Text>
          </View>

          <Text className="text-sm mt-2 text-gray-500 line-clamp-2">
            {stock.description}
          </Text>

          <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100">
            <Text className="text-base font-medium">
              ₹{stock.finalPricePerKg}/kg
            </Text>
            <Text className="text-sm text-gray-500">
              {stock.availableQuantity} kg available
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
};

export default StockCard;
