import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ================== Interfaces ==================
interface Organization {
  id: string;
  name?: string | null;
  status?: string | null;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  profileImage?: string | null;
  organization_picture?: string | null;
}

// ================== Main Component ==================
export default function ListOrganisasiScreen() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [editedOrg, setEditedOrg] = useState<Organization | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrganizations();
    setRefreshing(false);
  };

  // ================== Effects ==================
  useEffect(() => {
    fetchOrganizations();
  }, []);

  // ================== Helpers & Actions ==================

  const handleLeaveOrganization = async (organizationId: string) => {
    Alert.alert(
      "Konfirmasi",
      "Apakah Anda yakin ingin keluar dari organisasi ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Keluar",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("jwtToken");
              if (!token) {
                return Alert.alert(
                  "Unauthorized",
                  "Token tidak ditemukan. Silakan login ulang."
                );
              }

              const leaveUrl = `${process.env.EXPO_PUBLIC_API_URL}/organizations/${organizationId}/leave`;

              await axios.delete(leaveUrl, {
                headers: { Authorization: `Bearer ${token}` },
              });

              Alert.alert("Sukses", "Anda berhasil keluar dari organisasi.");
              setModalVisible(false);

              // refresh daftar organisasi
              await fetchOrganizations();
            } catch (error: any) {
              console.log(
                "❌ handleLeaveOrganization error:",
                error?.response?.data || error
              );
              Alert.alert(
                "Error",
                error?.response?.data?.message ||
                  "Gagal keluar dari organisasi."
              );
            }
          },
        },
      ]
    );
  };

  // Ambil daftar organisasi
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
        (org: Organization) => org.status && org.status.trim() !== ""
      );

      const sortedData = filteredData.sort(
        (a: Organization, b: Organization) => {
          if (
            a.status?.toLowerCase() === "verified" &&
            b.status?.toLowerCase() !== "verified"
          )
            return -1;
          if (
            a.status?.toLowerCase() !== "verified" &&
            b.status?.toLowerCase() === "verified"
          )
            return 1;
          return 0;
        }
      );

      setOrganizations(sortedData);
    } catch (error: any) {
      console.log("fetchOrganizations error:", error?.response ?? error);
      Alert.alert("Error", "Gagal memuat daftar organisasi.");
    } finally {
      setLoading(false);
    }
  };

  // Ambil detail organisasi & buka modal
  const handlePress = async (org: Organization) => {
    if (org.status?.toLowerCase() !== "verified") {
      Alert.alert(
        "Info",
        "Detail hanya tersedia untuk organisasi yang terverifikasi."
      );
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token)
        return Alert.alert(
          "Unauthorized",
          "Token tidak ditemukan. Silakan login ulang."
        );

      const detailUrl = `${process.env.EXPO_PUBLIC_API_URL}/organizations/${org.id}/profile`;
      const response = await axios.get(detailUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const detailData = response.data?.data || org;
      setSelectedOrg(detailData);
      setEditedOrg({ ...detailData });
      setModalVisible(true);
    } catch (error: any) {
      console.log("handlePress error:", error?.response ?? error);
      Alert.alert("Error", "Gagal memuat detail organisasi.");
    } finally {
      setLoading(false);
    }
  };

  // Pilih foto dari galeri
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== "granted") {
      Alert.alert("Izin ditolak", "Akses galeri dibutuhkan untuk memilih foto");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setEditedOrg((prev) =>
        prev ? { ...prev, organization_picture: result.assets[0].uri } : prev
      );
    }
  };

  // Simpan perubahan
  const handleSave = async (organizationId: string) => {
    if (!editedOrg)
      return Alert.alert("Error", "Tidak ada data untuk disimpan.");

    try {
      setSaving(true);
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token)
        return Alert.alert(
          "Unauthorized",
          "Token tidak ditemukan. Silakan login ulang."
        );

      // === 1️⃣ Update teks (name, description, location) ===
      const updateUrl = `${process.env.EXPO_PUBLIC_API_URL}/organizations/${organizationId}/profile`;
      const textData = {
        name: editedOrg.name,
        description: editedOrg.description,
        location: editedOrg.location,
      };

      await axios.patch(updateUrl, textData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // === 2️⃣ Upload gambar jika ada file baru ===
      if (
        editedOrg.organization_picture &&
        editedOrg.organization_picture.startsWith("file")
      ) {
        const formData = new FormData();
        formData.append("organization_picture", {
          uri: editedOrg.organization_picture,
          type: "image/jpeg",
          name: "organization_picture.jpg",
        } as any);

        const uploadUrl = `${process.env.EXPO_PUBLIC_API_URL}/organizations/${organizationId}/upload-picture`;

        await axios.post(uploadUrl, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // === 3️⃣ Refresh dan tutup modal ===
      await fetchOrganizations();

      Alert.alert("Sukses", "Data organisasi berhasil diperbarui");
      setModalVisible(false);
      setSelectedOrg(null);
      setEditedOrg(null);
    } catch (error: any) {
      console.log("handleSave error:", error?.response ?? error);
      const msg = error?.response?.data?.message;
      Alert.alert(
        "Error",
        Array.isArray(msg)
          ? msg.join("\n")
          : msg || "Gagal menyimpan perubahan."
      );
    } finally {
      setSaving(false);
    }
  };

  // Render item list → card dengan nama + deskripsi
  const renderItem = ({ item }: { item: Organization }) => (
    <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.name ?? "-"}</Text>
        <Text style={styles.cardDescription}>
          {item.description ?? "Deskripsi tidak tersedia"}
        </Text>
      </View>

      {item.status && (
        <View
          style={[
            styles.statusBadge,
            item.status.toLowerCase() === "verified"
              ? { backgroundColor: "#28a745" }
              : item.status.toLowerCase() === "pending"
              ? { backgroundColor: "#FFC107" }
              : { backgroundColor: "#F44336" },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // ================== UI ==================
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/organisasi")}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>List Organisasi</Text>
        <Image
          source={{ uri: "https://via.placeholder.com/40" }}
          style={styles.profileImage}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#002244"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={organizations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Modal Detail Organisasi */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Organisasi</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{
                alignItems: "center",
                paddingBottom: 20,
              }}
            >
              {/* Foto Profil */}
              <TouchableOpacity
                style={styles.profileCircle}
                onPress={pickImage}
              >
                {editedOrg?.organization_picture ? (
                  <Image
                    source={{ uri: editedOrg.organization_picture }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={{ color: "#999" }}>Pilih Foto</Text>
                )}
              </TouchableOpacity>

              <Text
                style={{
                  fontSize: 12,
                  color: "#555",
                  marginTop: 8,
                  marginBottom: 10,
                }}
              >
                Ketuk foto untuk mengganti
              </Text>

              {/* Input Fields */}
              <TextInput
                style={[styles.input, { backgroundColor: "#eaeaea" }]}
                placeholder="Nama Organisasi"
                value={editedOrg?.name ?? ""}
                editable={false} // ❌ tidak bisa diubah
                selectTextOnFocus={false} // ❌ teks tidak bisa diseleksi
              />

              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Deskripsi"
                multiline
                value={editedOrg?.description ?? ""}
                onChangeText={(text) =>
                  setEditedOrg((prev) =>
                    prev ? { ...prev, description: text } : prev
                  )
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Lokasi"
                value={editedOrg?.location ?? ""}
                onChangeText={(text) =>
                  setEditedOrg((prev) =>
                    prev ? { ...prev, location: text } : prev
                  )
                }
              />

              <TextInput
                style={[styles.input, { backgroundColor: "#eaeaea" }]}
                placeholder="Status"
                value={editedOrg?.status ?? ""}
                editable={false}
              />

              {/* Tombol Simpan */}
              <TouchableOpacity
                style={[styles.saveButton, saving && { opacity: 0.8 }]}
                onPress={() => handleSave(editedOrg?.id ?? "")}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Simpan</Text>
                )}
              </TouchableOpacity>
              {/* Tombol ke List Member */}
              <TouchableOpacity
                style={styles.memberButton}
                onPress={() =>
                  router.push({
                    pathname: "/listmember",
                    params: { organizationId: selectedOrg?.id },
                  })
                }
              >
                <Text style={styles.memberButtonText}>Lihat Anggota</Text>
              </TouchableOpacity>
              {/* Tombol Keluar dari Organisasi */}
              <TouchableOpacity
                style={styles.leaveButton}
                onPress={() => handleLeaveOrganization(selectedOrg?.id ?? "")}
              >
                <Text style={styles.leaveButtonText}>
                  Keluar dari Organisasi
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ================== Styles ==================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 16, fontWeight: "bold", color: "#002244" },
  profileImage: { width: 35, height: 35, borderRadius: 20 },
  list: { paddingVertical: 16 },
  card: {
    borderWidth: 1,
    borderColor: "#002244",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#002244",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: "#555",
  },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    maxHeight: "90%",
    width: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#002244" },
  profileCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    width: "100%",
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  saveButton: {
    backgroundColor: "#002244",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  memberButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  memberButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  leaveButton: {
    backgroundColor: "#dc3545", // merah
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  leaveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
