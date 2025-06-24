import AsyncStorage from "@react-native-async-storage/async-storage";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { usePathname, useRouter } from "expo-router";
import { Image, View } from "react-native";

import {
  Entypo,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";

export default function CustomDrawer(props: any) {
  // isi komponen

  const router = useRouter();
  const pathname = usePathname();
  const isActive = (route: string) => pathname === route;

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1, backgroundColor: "#1D4263" }}
    >
      <View style={{ padding: 0 }}>
        <Image style={{ width: 100, height: 40, resizeMode: "contain" }} />
      </View>

      <View style={{ padding: 10, alignItems: "center" }}>
        <Image
          source={require("../assets/images/logo-sign2.png")} // pastikan path-nya sesuai
          style={{ width: 420, height: 100, resizeMode: "contain" }}
        />
      </View>

      <DrawerItem
        label="Dashboard"
        icon={() => (
          <Ionicons
            name="home"
            size={20}
            color={isActive("/dashboard") ? "white" : "orange"}
          />
        )}
        labelStyle={{
          color: isActive("/dashboard") ? "white" : "orange",
          marginLeft: -4,
        }}
        onPress={() => router.push("/dashboard")}
      />
      <DrawerItem
        label="Perangkat"
        icon={() => (
          <MaterialIcons
            name="devices"
            size={20}
            color={isActive("/perangkat") ? "white" : "orange"}
          />
        )}
        labelStyle={{
          color: isActive("/perangkat") ? "white" : "orange",
          marginLeft: -4,
        }}
        style={{
          backgroundColor: isActive("/perangkat") ? "#2E5C87" : "transparent",
        }}
        onPress={() => router.push("/perangkat")}
      />

      <DrawerItem
        label="Organisasi"
        icon={() => (
          <FontAwesome5
            name="sitemap"
            size={20}
            color={isActive("/organisasi") ? "white" : "orange"}
          />
        )}
        labelStyle={{
          color: isActive("/organisasi") ? "white" : "orange",
          marginLeft: -4,
        }}
        style={{
          backgroundColor: isActive("/organisasi") ? "#2E5C87" : "transparent",
        }}
        onPress={() => router.push("/organisasi")}
      />

      <DrawerItem
        label="Statistika"
        icon={() => (
          <Ionicons
            name="stats-chart"
            size={20}
            color={isActive("/statistika") ? "white" : "orange"}
          />
        )}
        labelStyle={{
          color: isActive("/statistika") ? "white" : "orange",
          marginLeft: -4,
        }}
        style={{
          backgroundColor: isActive("/statistika") ? "#2E5C87" : "transparent",
        }}
        onPress={() => router.push("/statistika")}
      />

      <DrawerItem
        label="Pengaturan"
        icon={() => (
          <Entypo
            name="cog"
            size={20}
            color={isActive("/pengaturan") ? "white" : "orange"}
          />
        )}
        labelStyle={{
          color: isActive("/pengaturan") ? "white" : "orange",
          marginLeft: -4,
        }}
        style={{
          backgroundColor: isActive("/pengaturan") ? "#2E5C87" : "transparent",
        }}
        onPress={() => router.push("/pengaturan")}
      />
      <DrawerItem
        label="Pengguna"
        icon={() => (
          <Ionicons
            name="person"
            size={20}
            color={isActive("/pengguna") ? "white" : "orange"}
          />
        )}
        labelStyle={{
          color: isActive("/pengguna") ? "white" : "orange",
          marginLeft: -4,
        }}
        style={{
          backgroundColor: isActive("/pengguna") ? "#2E5C87" : "transparent",
        }}
        onPress={() => router.push("/pengguna")}
      />
      <DrawerItem
        label="Keluar akun"
        icon={() => (
          <Ionicons name="log-out-outline" size={20} color={"orange"} />
        )}
        labelStyle={{
          color: "orange",
          marginLeft: -4,
        }}
        style={{
          backgroundColor: "transparent",
        }}
        onPress={() => {
          AsyncStorage.removeItem("jwtToken");
          router.replace("/(auth)/login");
        }}
      />
    </DrawerContentScrollView>
  );
}
