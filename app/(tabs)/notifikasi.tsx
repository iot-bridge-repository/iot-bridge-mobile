import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Notification {
  id: string;
  title?: string;
  message: string;
  subject?: string;
  type?: string;
}

export default function NotifikasiScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  const [profileImage, setProfileImage] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Ambil token
  const getToken = async () => {
    return await AsyncStorage.getItem("jwtToken");
  };

  // Ambil data notifikasi
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Response Notifikasi:", res.data);

      if (Array.isArray(res.data)) {
        setNotifications(res.data);
      } else if (Array.isArray(res.data.data)) {
        setNotifications(res.data.data);
      } else {
        setNotifications([]);
      }
    } catch (error: any) {
      console.error(
        "Fetch notif error:",
        error.response?.data || error.message
      );
      Alert.alert("Error", "Gagal mengambil notifikasi");
    } finally {
      setLoading(false);
    }
  };

  // Parse organizationId dari type string
  const extractOrganizationId = (type: string): string | null => {
    const match = type.match(/id:\s?([a-f0-9-]+)/i);
    return match ? match[1] : null;
  };

  // Hapus satu notifikasi
  const deleteNotification = async (id: string) => {
    try {
      const token = await getToken();
      await axios.delete(
        `${process.env.EXPO_PUBLIC_API_URL}/notifications/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Gagal menghapus notifikasi");
    }
  };

  // Hapus semua notifikasi
  const deleteAllNotifications = async () => {
    try {
      const token = await getToken();
      await axios.delete(`${process.env.EXPO_PUBLIC_API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Gagal menghapus semua notifikasi");
    }
  };

  // Ambil data profil user
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("jwtToken");
        if (!token) return;

        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/auth/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const user = response.data.data.user;
        setProfileImage(
          user.profile_picture || "https://via.placeholder.com/100"
        );
      } catch (error) {
        console.error("Gagal mengambil foto profil:", error);
      }
    };

    fetchProfile();
    fetchNotifications();
  }, []);

  // Fungsi respon undangan
  const respondInvitation = async (
    organizationId: string,
    isAccepted: boolean,
    notifId: string
  ) => {
    try {
      const token = await getToken();
      await axios.patch(
        `${process.env.EXPO_PUBLIC_API_URL}/organizations/${organizationId}/member-invitation-response`,
        { is_accepted: isAccepted },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Hapus notifikasi dari list setelah respon
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));

      Alert.alert(
        "Berhasil",
        isAccepted ? "Undangan diterima" : "Undangan ditolak"
      );
    } catch (error: any) {
      console.error(
        "Invitation response error:",
        error.response?.data || error
      );
      Alert.alert("Error", "Gagal merespon undangan");
    }
  };

  // Render item notifikasi
  const renderItem = ({ item }: { item: Notification }) => {
    const organizationId =
      (item.type && extractOrganizationId(item.type || "")) || null;

    return (
      <View style={styles.card}>
        <Ionicons name="alert-circle-outline" size={28} color="orange" />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title || item.subject}</Text>
          <Text style={styles.message}>{item.message}</Text>
        </View>

        {item.type?.includes("organization_member_invitation") &&
        organizationId ? (
          <>
            {/* Tombol Accept */}
            <TouchableOpacity
              onPress={() => respondInvitation(organizationId, true, item.id)}
              style={{ marginRight: 10 }}
            >
              <Ionicons name="checkmark" size={24} color="green" />
            </TouchableOpacity>

            {/* Tombol Reject */}
            <TouchableOpacity
              onPress={() => respondInvitation(organizationId, false, item.id)}
            >
              <Ionicons name="close-outline" size={26} color="red" />
            </TouchableOpacity>
          </>
        ) : (
          // Default tombol hapus
          <TouchableOpacity onPress={() => deleteNotification(item.id)}>
            <Ionicons name="trash-outline" size={24} color="red" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons
          name="menu"
          size={24}
          color="#000"
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        />
        <Text style={styles.titleHeader}>Notifikasi</Text>

        <TouchableOpacity onPress={() => router.push("/pengguna")}>
          <Image
            source={
              profileImage
                ? { uri: profileImage }
                : require("../../assets/icon/profil.png")
            }
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Tombol Hapus Semua */}
      {notifications.length > 0 && (
        <TouchableOpacity
          style={styles.deleteAllBtn}
          onPress={deleteAllNotifications}
        >
          <Text style={styles.deleteAllText}>Hapus Semua</Text>
        </TouchableOpacity>
      )}

      {/* List Notifikasi */}
      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : notifications.length === 0 ? (
        <View style={{ alignItems: "center", marginTop: 50 }}>
          <Ionicons name="notifications-off-outline" size={40} color="gray" />
          <Text style={{ color: "gray", marginTop: 10 }}>
            Tidak ada notifikasi
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
    paddingTop: 50,
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  titleHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0A2342",
  },
  profileImage: {
    width: 35,
    height: 35,
    borderRadius: 35 / 2,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  message: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
  deleteAllBtn: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: "flex-end",
  },
  deleteAllText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
