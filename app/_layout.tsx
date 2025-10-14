import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as Device from "expo-device";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// 🔧 Atur bagaimana notifikasi ditampilkan di foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // Add this line
    shouldShowList: true, // Add this line
  }),
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  // 🔥 Fungsi registrasi notifikasi
  async function registerForPushNotificationsAsync() {
    try {
      let token;

      if (Device.isDevice) {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") {
          alert("Izin notifikasi ditolak.");
          return;
        }

        // Ambil Expo Push Token
        token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log("📱 FCM Token perangkat:", token);

        // Kirim ke backend jika ingin disimpan
        // await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/save-fcm-token`, { token });
      } else {
        alert("Harus dijalankan di perangkat fisik (bukan emulator).");
      }

      return token;
    } catch (error) {
      console.error("Gagal registrasi notifikasi:", error);
    }
  }

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              animation: "slide_from_right",
              headerShown: false,
            }}
          >
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </SafeAreaView>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
