// app/(tabs)/dashboard.tsx
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Text, TouchableOpacity, View } from "react-native";

export default function DashboardScreen() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {/* Tombol tiga strip */}
      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        style={{ marginBottom: 20 }}
      >
        <Ionicons name="menu" size={28} color="black" />
      </TouchableOpacity>

      {/* Konten dashboard */}
      <Text style={{ fontSize: 20 }}>Perangkat</Text>
    </View>
  );
}
