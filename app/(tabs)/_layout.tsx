// app/(tabs)/_layout.tsx
import { Drawer } from "expo-router/drawer";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomDrawer from "../../components/CustomDrawer";

export default function TabsLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawer {...props} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: "#1D4263",
            width: 240,
          },
        }}
      >
        <Drawer.Screen
          name="dashboard"
          options={{ drawerLabel: "Dashboard" }}
        />
        <Drawer.Screen name="explore" options={{ drawerLabel: "Explore" }} />
        <Drawer.Screen
          name="organisasi"
          options={{ drawerLabel: "Organisasi" }}
        />
        <Drawer.Screen name="pengguna" options={{ drawerLabel: "Pengguna" }} />
        <Drawer.Screen
          name="perangkat"
          options={{ drawerLabel: "Perangkat" }}
        />
        <Drawer.Screen
          name="statistika"
          options={{ drawerLabel: "Statistika" }}
        />
        <Drawer.Screen
          name="pengaturan"
          options={{ drawerLabel: "Pengaturan" }}
        />
        <Drawer.Screen
          name="notifikasievent"
          options={{ drawerLabel: "Notifikasi Event" }}
        />
      </Drawer>
    </SafeAreaView>
  );
}
