import { Redirect } from "expo-router";

export default function Index() {
  // Saat app pertama kali dibuka, langsung arahkan ke halaman dashboard di Drawer
  return <Redirect href="/(tabs)/dashboard" />;
}
