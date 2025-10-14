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
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ================== Interfaces ==================
interface Organization {
  id: string;
  name: string;
  status?: string;
}

interface Device {
  id: string;
  name: string;
}

// ================== Main Component ==================
export default function DashboardScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);

  // foto profil user
  const [profileImage, setProfileImage] = useState("");

  // dropdown state
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // notifikasi (fetch dari backend)
  const [notifVisible, setNotifVisible] = useState(false);
  const [notifikasi, setNotifikasi] = useState([
    { id: "1", text: "Update sistem monitoring berhasil dipasang" },
  ]);

  // ================== Notifikasi (dari backend) ==================
  interface Notification {
    id: string;
    title?: string;
    message: string;
    subject?: string;
    type?: string;
  }

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  // Ambil token
  const getToken = async () => {
    return await AsyncStorage.getItem("jwtToken");
  };

  // Ambil data notifikasi
  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
    } finally {
      setNotifLoading(false);
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

  // Respon undangan
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

  // Jalankan fetch notifikasi saat pertama kali
  useEffect(() => {
    fetchNotifications();
  }, []);

  // ================== Ambil profil user ==================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("jwtToken");
        if (!token) return;

        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/auth/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const user = response.data.data.user;
        setProfileImage(
          user.profile_picture || "https://via.placeholder.com/100"
        );
      } catch (error) {
        console.log("Gagal ambil profil:", error);
      }
    };
    fetchProfile();
  }, []);

  // ================== Ambil list organisasi ==================
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("jwtToken");
        const url = `${process.env.EXPO_PUBLIC_API_URL}/organizations/list`;

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Filter hanya organisasi terverifikasi (misal status = "approved" atau "verified")
        const orgs = (res.data?.data || []).filter(
          (org: Organization) =>
            org.status?.toLowerCase() === "approved" ||
            org.status?.toLowerCase() === "verified"
        );
        setOrganizations(orgs);

        // pilih default organisasi pertama
        if (orgs.length > 0) {
          setSelectedOrg(orgs[0]);
        }
      } catch (err) {
        console.log("fetchOrganizations error:", err);
        Alert.alert("Error", "Gagal memuat organisasi");
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizations();
  }, []);

  // ================== Ambil devices saat organisasi berubah ==================
  useEffect(() => {
    const fetchDevices = async () => {
      if (!selectedOrg) return;
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("jwtToken");
        const url = `${process.env.EXPO_PUBLIC_API_URL}/organizations/${selectedOrg.id}/devices/search`;

        const res = await axios.get(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setDevices(data);
      } catch (err: any) {
        console.log("fetchDevices error:", err.response?.data || err.message);
        Alert.alert("Error", "Gagal memuat perangkat");
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, [selectedOrg]);

  // ================== Render ==================
  const renderItem = ({ item }: { item: Device }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/widget",
          params: {
            deviceId: item.id,
            organizationId: selectedOrg?.id, // pastikan selectedOrg ada
            from: "dashboard",
          },
        })
      }
    >
      <Image
        source={require("../../assets/icon/iot_6134840.png")}
        style={styles.cardImage}
        resizeMode="contain"
      />
      <Text style={styles.cardTitle}>{item.name}</Text>
    </TouchableOpacity>
  );

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
        <Text style={styles.title}>Dashboard</Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
          <TouchableOpacity onPress={() => setNotifVisible(true)}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </TouchableOpacity>

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
      </View>

      {/* Dropdown header */}
      {organizations.length > 0 && (
        <TouchableOpacity
          onPress={() => setDropdownVisible(true)}
          style={styles.dropdownHeader}
        >
          <Text style={styles.dropdownText}>{selectedOrg?.name}</Text>
          <Ionicons name="chevron-down" size={20} color="#000" />
        </TouchableOpacity>
      )}

      {/* Dropdown Modal */}
      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setDropdownVisible(false)}
        >
          <View style={styles.dropdownContainer}>
            {organizations.map((org) => (
              <TouchableOpacity
                key={org.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedOrg(org);
                  setDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{org.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal Notifikasi */}
      <Modal
        visible={notifVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNotifVisible(false)}
      >
        <View style={styles.notifOverlay}>
          <View style={styles.notifContainer}>
            <Text style={styles.notifTitle}>Notifikasi</Text>
            {notifLoading ? (
              <ActivityIndicator
                size="large"
                color="#0A2342"
                style={{ marginTop: 20 }}
              />
            ) : notifications.length === 0 ? (
              <View style={{ alignItems: "center", marginTop: 20 }}>
                <Ionicons
                  name="notifications-off-outline"
                  size={30}
                  color="gray"
                />
                <Text style={{ color: "gray", marginTop: 10 }}>
                  Tidak ada notifikasi
                </Text>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 300 }}>
                {notifications.map((n) => {
                  const organizationId =
                    (n.type && extractOrganizationId(n.type || "")) || null;

                  return (
                    <View key={n.id} style={styles.notifItem}>
                      <Ionicons
                        name="notifications"
                        size={18}
                        color="#0A2342"
                        style={{ marginRight: 8 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: "600", color: "#0A2342" }}>
                          {n.title || n.subject || "Notifikasi"}
                        </Text>
                        <Text style={styles.notifText}>{n.message}</Text>
                      </View>

                      {n.type?.includes("organization_member_invitation") &&
                      organizationId ? (
                        <>
                          <TouchableOpacity
                            onPress={() =>
                              respondInvitation(organizationId, true, n.id)
                            }
                            style={{ marginRight: 10 }}
                          >
                            <Ionicons
                              name="checkmark"
                              size={22}
                              color="green"
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() =>
                              respondInvitation(organizationId, false, n.id)
                            }
                          >
                            <Ionicons
                              name="close-outline"
                              size={24}
                              color="red"
                            />
                          </TouchableOpacity>
                        </>
                      ) : (
                        <TouchableOpacity
                          onPress={() => deleteNotification(n.id)}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={20}
                            color="red"
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            )}

            {/* Tombol hapus semua */}
            {notifications.length > 0 && (
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  { backgroundColor: "red", marginTop: 10 },
                ]}
                onPress={deleteAllNotifications}
              >
                <Text style={styles.closeButtonText}>Hapus Semua</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setNotifVisible(false)}
            >
              <Text style={styles.closeButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Grid perangkat */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0A2342"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={devices}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#0A2342" },
  profileImage: { width: 35, height: 35, borderRadius: 35 / 2 },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 5,
  },
  dropdownText: { fontSize: 16, fontWeight: "500", color: "#0A2342" },
  grid: { gap: 15, justifyContent: "center" },
  card: {
    backgroundColor: "#0A2342",
    borderRadius: 12,
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    margin: 5,
    minHeight: 150,
  },
  cardImage: { width: 60, height: 60, marginBottom: 10, tintColor: "#fff" },
  cardTitle: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 130,
    paddingHorizontal: 20,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  dropdownContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 10,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  dropdownItemText: { fontSize: 14, color: "#000" },
  notifOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  notifContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },
  notifTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#0A2342",
  },
  notifItem: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  notifText: { fontSize: 14, color: "#333" },
  closeButton: {
    marginTop: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#0A2342",
    alignItems: "center",
  },
  closeButtonText: { color: "#fff", fontWeight: "bold" },
});
