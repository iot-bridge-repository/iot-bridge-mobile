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
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Organization {
  id: string;
  name?: string | null;
  status?: string | null;
  organization_picture?: string | null;
}

interface Device {
  id: string;
  name: string;
  auth_code: string;
}

export default function DeviceScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [addDeviceVisible, setAddDeviceVisible] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("jwtToken");
      const url = `${process.env.EXPO_PUBLIC_API_URL}/organizations/list`;

      const response = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const data = Array.isArray(response.data?.data) ? response.data.data : [];

      const filteredData = data.filter(
        (org: Organization) =>
          org.status && org.status.toLowerCase() === "verified"
      );

      setOrganizations(filteredData);

      if (filteredData.length > 0) {
        setSelectedOrg(filteredData[0]);
        fetchDevices(filteredData[0].id);
        fetchCurrentUserRole(filteredData[0].id);
      }
    } catch (error: any) {
      console.log("fetchOrganizations error:", error?.response ?? error);
      Alert.alert("Error", "Gagal memuat daftar organisasi.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDevices = async (orgId: string) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("jwtToken");
      const url = `${process.env.EXPO_PUBLIC_API_URL}/organizations/${orgId}/devices/search`;

      const response = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      console.log("Devices dari backend:", data);
      setDevices(data);
    } catch (error: any) {
      console.log("fetchDevices error:", error.response?.data || error.message);
      Alert.alert("Error", "Gagal memuat perangkat");
    } finally {
      setLoading(false);
    }
  };
  const fetchCurrentUserRole = async (orgId: string) => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      const userId = await AsyncStorage.getItem("userId");

      if (!orgId || !token || !userId) return;

      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/organizations/${orgId}/member-list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const currentUser = res.data.data.find(
        (member: any) => member.user_id === userId
      );

      if (currentUser) {
        setUserRole(currentUser.role); // "Admin", "Operator", atau "Viewer"
      }
    } catch (err) {
      console.log("❌ fetchCurrentUserRole error:", err);
    }
  };

  const handleSelectOrg = (org: Organization) => {
    setSelectedOrg(org);
    setModalVisible(false);
    fetchDevices(org.id);
    fetchCurrentUserRole(org.id); // ✅ ambil role user di organisasi itu
  };

  const handleAddDevice = async () => {
    if (!selectedOrg) return;

    if (!deviceName.trim()) {
      Alert.alert("Error", "Nama perangkat tidak boleh kosong");
      return;
    }

    if (deviceName.length < 5 || deviceName.length > 100) {
      Alert.alert("Error", "Nama perangkat harus 5–100 karakter");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("jwtToken");
      const url = `${process.env.EXPO_PUBLIC_API_URL}/organizations/${selectedOrg.id}/devices`;

      await axios.post(
        url,
        { name: deviceName },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );

      setDeviceName("");
      setAddDeviceVisible(false);
      await fetchDevices(selectedOrg.id);
    } catch (error: any) {
      console.log(
        "handleAddDevice error:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Error",
        error.response?.data?.message?.[0] || "Gagal menambahkan perangkat"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    if (!selectedOrg) return;

    if (userRole !== "Admin" && userRole !== "Operator") {
      Alert.alert(
        "Akses ditolak",
        "Hanya Admin atau Operator yang bisa menghapus perangkat."
      );
      return;
    }

    Alert.alert("Konfirmasi", "Hapus perangkat ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("jwtToken");
            const url = `${process.env.EXPO_PUBLIC_API_URL}/organizations/${selectedOrg.id}/devices/${deviceId}`;
            await axios.delete(url, {
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            await fetchDevices(selectedOrg.id);
          } catch (error: any) {
            console.log(
              "handleDeleteDevice error:",
              error.response?.data || error.message
            );
            Alert.alert("Error", "Gagal menghapus perangkat");
          }
        },
      },
    ]);
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
        <Text style={styles.title}>Perangkat</Text>
        <TouchableOpacity onPress={() => router.push("/pengguna")}>
          <Image
            source={{ uri: "https://via.placeholder.com/100" }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Dropdown Organisasi */}
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.dropdownText}>
          {selectedOrg?.name ?? "Pilih Organisasi"}
        </Text>
        <Ionicons name="chevron-down" size={18} color="black" />
      </TouchableOpacity>

      {/* Modal Tambah Device */}
      <Modal
        visible={addDeviceVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddDeviceVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tambah Perangkat</Text>

            <TextInput
              placeholder="Nama perangkat"
              value={deviceName}
              onChangeText={setDeviceName}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 10,
                borderRadius: 5,
                marginBottom: 15,
              }}
            />

            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                style={[
                  styles.closeModalButton,
                  { backgroundColor: "gray", marginRight: 10 },
                ]}
                onPress={() => setAddDeviceVisible(false)}
              >
                <Text style={styles.closeModalText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={handleAddDevice}
              >
                <Text style={styles.closeModalText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Pilih Organisasi */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih Organisasi</Text>
            {organizations.map((org) => (
              <TouchableOpacity
                key={org.id}
                style={styles.modalItem}
                onPress={() => handleSelectOrg(org)}
              >
                <Text style={styles.modalText}>{org.name}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeModalText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* List Devices (pakai card) */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="blue"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>Auth Code:</Text>
              <Text style={styles.cardAuth}>{item.auth_code}</Text>

              <View style={styles.cardActions}>
                {/* Tombol ke widget */}
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/widget",
                      params: {
                        deviceId: item.id,
                        deviceName: item.name,
                        organizationId: selectedOrg?.id,
                        from: "perangkat",
                      },
                    })
                  }
                  style={[styles.actionBtn, { backgroundColor: "#E3F2FD" }]}
                >
                  <Ionicons name="speedometer-outline" size={20} color="blue" />
                </TouchableOpacity>

                {/* Tombol Report */}
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/statistika",
                      params: {
                        deviceId: item.id,
                        deviceName: item.name,
                        organizationId: selectedOrg?.id,
                      },
                    })
                  }
                  style={[styles.actionBtn, { backgroundColor: "#E8F5E9" }]}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color="green"
                  />
                </TouchableOpacity>

                {/* Tombol Delete */}
                {userRole === "Admin" || userRole === "Operator" ? (
                  <TouchableOpacity
                    onPress={() => handleDeleteDevice(item.id)}
                    style={[styles.actionBtn, { backgroundColor: "#FFEBEE" }]}
                  >
                    <Ionicons name="trash-outline" size={20} color="red" />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20, color: "gray" }}>
              Belum ada perangkat
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}

      {/* Tombol menuju halaman Notifikasi Event */}
      <TouchableOpacity
        style={[styles.addButton, { bottom: 100, backgroundColor: "orange" }]}
        onPress={() => {
          if (!selectedOrg || devices.length === 0) {
            Alert.alert(
              "Error",
              "Pilih organisasi dan perangkat terlebih dahulu"
            );
            return;
          }

          router.push({
            pathname: "/notifikasievent",
            params: {
              organizationId: selectedOrg.id,
              deviceId: devices[0].id,
            },
          });
        }}
      >
        <Ionicons name="notifications-outline" size={24} color="white" />
      </TouchableOpacity>

      {/* Tombol tambah perangkat */}
      {userRole !== "Viewer" && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setAddDeviceVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
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
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0A2342",
  },
  profileImage: {
    width: 35,
    height: 35,
    borderRadius: 35 / 2,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    padding: 10,
    margin: 16,
    borderRadius: 5,
    justifyContent: "space-between",
  },
  dropdownText: { fontSize: 16 },

  // card style
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0A2342",
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "gray",
  },
  cardAuth: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionBtn: {
    marginHorizontal: 4,
    padding: 8,
    borderRadius: 6,
  },

  addButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "blue",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalItem: {
    paddingVertical: 10,
  },
  modalText: {
    fontSize: 16,
  },
  closeModalButton: {
    marginTop: 20,
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  closeModalText: {
    color: "white",
    fontWeight: "bold",
  },
});
