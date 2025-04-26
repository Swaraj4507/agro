import { View, Text, Pressable } from "react-native";
import {
  StockFilters,
  getUniqueCategories,
  getUniqueCities,
} from "../services/mockDataService";
import BottomSheet from "@gorhom/bottom-sheet";
import { useEffect, useRef } from "react";
import SelectFormField from "./SelectFormField";

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: StockFilters;
  onApplyFilters: (filters: StockFilters) => void;
}

export const FilterSheet = ({
  visible,
  onClose,
  filters,
  onApplyFilters,
}: FilterSheetProps) => {
  const cities = getUniqueCities();
  const categories = getUniqueCategories();
  const bottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={["50%", "75%"]}
      onClose={onClose}
    >
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 16 }}>
          Filters
        </Text>

        <View style={{ gap: 16 }}>
          <View>
            <Text style={{ marginBottom: 8 }}>City</Text>
            <SelectFormField
              title=""
              value={filters.city}
              options={cities.map((city) => ({ label: city, value: city }))}
              handleChange={(value) =>
                onApplyFilters({ ...filters, city: value })
              }
              formwidth="100%"
              otherStyles={{ marginBottom: 16 }}
            />
          </View>

          <View>
            <Text style={{ marginBottom: 8 }}>Category</Text>
            <SelectFormField
              title=""
              value={filters.category}
              options={categories.map((category) => ({
                label: category,
                value: category,
              }))}
              handleChange={(value) =>
                onApplyFilters({ ...filters, category: value })
              }
              formwidth="100%"
              otherStyles={{ marginBottom: 16 }}
            />
          </View>

          <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
            <Pressable
              style={{
                flex: 1,
                padding: 12,
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 8,
              }}
              onPress={() => onApplyFilters({})}
            >
              <Text style={{ textAlign: "center" }}>Reset</Text>
            </Pressable>

            <Pressable
              style={{
                flex: 1,
                padding: 12,
                backgroundColor: "#9b87f5",
                borderRadius: 8,
              }}
              onPress={onClose}
            >
              <Text style={{ textAlign: "center", color: "white" }}>Apply</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </BottomSheet>
  );
};
