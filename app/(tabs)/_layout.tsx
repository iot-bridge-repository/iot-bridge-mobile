// app/(tabs)/_layout.tsx
import { Drawer } from "expo-router/drawer";
import CustomDrawer from "../../components/CustomDrawer";

export default function DrawerLayout() {
  return (
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
      <Drawer.Screen name="dashboard" options={{ drawerLabel: "Dashboard" }} />
      <Drawer.Screen name="explore" />
      <Drawer.Screen name="organisasi" />
      <Drawer.Screen name="pengguna" />
      <Drawer.Screen name="perangkat" />
      <Drawer.Screen name="statistika" />
      <Drawer.Screen name="pengaturan" />
    </Drawer>
  );
}
