import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ================== Interfaces ==================
interface Member {
  user_id: string;
  username: string;
  role: string;
  status: string;
}

interface SearchUser {
  id: string;
  username: string;
  email: string;
  phone_number: string;
}

// ================== Component ==================
export default function MemberListScreen() {
  const { organizationId } = useLocalSearchParams();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 🔍 state untuk modal cari pengguna
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // 🔄 state untuk pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (organizationId) fetchMembers(organizationId as string);
    else Alert.alert("Error", "organizationId tidak ditemukan.");
  }, [organizationId]);

  const fetchMembers = async (orgId: string) => {
    try {
      if (!refreshing) setLoading(true);
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) {
        return Alert.alert(
          "Unauthorized",
          "Token tidak ditemukan. Silakan login ulang."
        );
      }

      const url = `${process.env.EXPO_PUBLIC_API_URL}/organizations/${orgId}/member-list`;
      console.log("🔗 fetchMembers url:", url);

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      setMembers(data);
    } catch (error: any) {
      console.log("❌ fetchMembers error:", error?.response?.data ?? error);
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          "Gagal memuat daftar member organisasi."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 🔄 pull-to-refresh
  const onRefresh = async () => {
    if (!organizationId) return;
    setRefreshing(true);
    await fetchMembers(organizationId as string);
  };

  // ================== Tambahan State ==================
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberModalVisible, setMemberModalVisible] = useState(false);

  // modal untuk create local member
  const [localModalVisible, setLocalModalVisible] = useState(false);
  const [localUsername, setLocalUsername] = useState("");
  const [localPassword, setLocalPassword] = useState("");
  const [roleLoading, setRoleLoading] = useState(false);

  // ================== Ubah Role Member ==================
  const handleChangeRole = async (
    userId: string,
    newRole: "Admin" | "Operator" | "Viewer"
  ) => {
    if (!organizationId) return;

    try {
      const currentUserId = await AsyncStorage.getItem("userId"); // ✅ ambil userId dari login
      console.log("🧩 currentUserId:", currentUserId);
      console.log("🧩 targetUserId:", userId);

      if (userId === currentUserId) {
        Alert.alert(
          "Aksi ditolak",
          "Kamu tidak bisa mengubah role diri sendiri."
        );
        return;
      }

      const memberRole = selectedMember?.role;
      if (memberRole === "Admin" && newRole !== "Admin") {
        const totalAdmin = members.filter((m) => m.role === "Admin").length;

        if (totalAdmin <= 1) {
          Alert.alert(
            "Tidak bisa",
            "Minimal harus ada 1 Admin. Angkat anggota lain menjadi Admin terlebih dahulu."
          );
          return;
        }
      }

      setRoleLoading(true);
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) {
        return Alert.alert(
          "Unauthorized",
          "Token tidak ditemukan. Silakan login ulang."
        );
      }

      const url = `${process.env.EXPO_PUBLIC_API_URL}/organizations/${organizationId}/member-roles`;

      await axios.patch(
        url,
        { user_id: userId, new_role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Sukses", `Role berhasil diubah ke ${newRole}.`);
      await fetchMembers(organizationId as string);
      setMemberModalVisible(false);
    } catch (err: any) {
      console.log("❌ change role error:", err?.response?.data || err);
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Gagal mengubah role member."
      );
    } finally {
      setRoleLoading(false);
    }
  };

  // ================== Buat Local Member ==================
  const handleCreateLocalMember = async () => {
    if (!organizationId) return;
    if (!localUsername || !localPassword)
      return Alert.alert("Error", "Username & Password harus diisi.");

    try {
      const token = await AsyncStorage.getItem("jwtToken");
      const url = `${process.env.EXPO_PUBLIC_API_URL}/organizations/${organizationId}/local-member`;

      await axios.post(
        url,
        { username: localUsername, password: localPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Sukses", "Local member berhasil dibuat.");
      setLocalModalVisible(false);
      setLocalUsername("");
      setLocalPassword("");
      fetchMembers(organizationId as string);
    } catch (err: any) {
      console.log("❌ create local member error:", err?.response?.data || err);
      Alert.alert("Error", "Gagal membuat local member.");
    }
  };

  // ================== Remove Member ==================
  const handleRemoveMember = async (userId: string) => {
    if (!organizationId) return;
    try {
      Alert.alert(
        "Konfirmasi",
        "Apakah kamu yakin ingin menghapus member ini?",
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Hapus",
            style: "destructive",
            onPress: async () => {
              const token = await AsyncStorage.getItem("jwtToken");
              if (!token) {
                return Alert.alert("Unauthorized", "Token tidak ditemukan.");
              }

              const url = `${process.env.EXPO_PUBLIC_API_URL}/organizations/${organizationId}/member/${userId}`;
              console.log("🗑 delete url:", url);

              await axios.delete(url, {
                headers: { Authorization: `Bearer ${token}` },
              });

              Alert.alert("Sukses", "Member berhasil dihapus.");
              // ✅ refresh member list
              fetchMembers(organizationId as string);
            },
          },
        ]
      );
    } catch (err: any) {
      console.log("❌ remove member error:", err?.response?.data || err);
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Gagal menghapus member."
      );
    }
  };

  // 🔍 fungsi search user
  const handleSearchUser = async () => {
    if (!organizationId) {
      return Alert.alert("Error", "organizationId tidak ditemukan.");
    }
    if (!searchQuery.trim()) return;

    try {
      setSearchLoading(true);
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) return Alert.alert("Unauthorized", "Token tidak ditemukan");

      const url = `${process.env.EXPO_PUBLIC_API_URL}/organizations/${organizationId}/search-members?identity=${searchQuery}`;
      console.log("🔎 search url:", url);

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      setSearchResults(data);
    } catch (error: any) {
      console.log("❌ search error:", error?.response?.data ?? error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Gagal mencari pengguna."
      );
    } finally {
      setSearchLoading(false);
    }
  };

  // ================== Invite User ==================
  const handleInvite = async (userId: string) => {
    if (!organizationId) return;
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      const url = `${process.env.EXPO_PUBLIC_API_URL}/organizations/${organizationId}/member-invitation`;

      const res = await axios.post(
        url,
        { user_id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Sukses", "Undangan berhasil dikirim.");
      console.log("✅ invite response:", res.data);

      // ✅ refresh member list setelah undangan dikirim
      fetchMembers(organizationId as string);
    } catch (err: any) {
      console.log("❌ invite error:", err?.response?.data || err);
      Alert.alert("Error", "Gagal mengirim undangan.");
    }
  };

  const renderItem = ({ item }: { item: Member }) => (
    <TouchableOpacity
      onPress={async () => {
        const currentUserId = await AsyncStorage.getItem("userId");

        // Cari data user yang sedang login
        const currentUser = members.find((m) => m.user_id === currentUserId);
        const currentUserRole = currentUser?.role || "Viewer";

        // Hitung jumlah admin
        const adminCount = members.filter((m) => m.role === "Admin").length;

        // Jika user bukan admin
        if (currentUserRole !== "Admin") {
          Alert.alert("", "Akses ditolak.");
          return;
        }

        // Jika user menekan dirinya sendiri dan hanya ada 1 admin
        if (item.user_id === currentUserId && adminCount === 1) {
          Alert.alert(
            "Aksi ditolak",
            "Kamu adalah satu-satunya admin, jadi tidak bisa mengubah role diri sendiri."
          );
          return;
        }

        // ✅ Jika bukan kondisi di atas, lanjut seperti biasa
        setSelectedMember(item);
        setMemberModalVisible(true);
      }}
    >
      <View style={styles.card}>
        <View>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.role}>Role: {item.role}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={[
              styles.statusBadge,
              item.status.toLowerCase() === "accepted"
                ? { backgroundColor: "#28a745" }
                : { backgroundColor: "#F44336" },
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Tombol Back */}
        <TouchableOpacity
          onPress={() =>
            router.push(
              `/(tabs)/listorganisasi?organizationId=${organizationId}`
            )
          }
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        {/* Judul */}
        <Text style={styles.headerTitle}>Member Organisasi</Text>

        {/* Spacer untuk keseimbangan layout */}
        <View style={{ width: 24 }} />
      </View>

      {/* 🔍 Tombol Cari Pengguna */}
      <TouchableOpacity
        style={styles.searchButton}
        onPress={() => setSearchModalVisible(true)}
      >
        <Ionicons name="search" size={18} color="#fff" />
        <Text style={styles.searchButtonText}>Cari Pengguna</Text>
      </TouchableOpacity>

      {/* 👤 Tombol Buat Local Member (dipindahkan ke bawah) */}
      <TouchableOpacity
        style={styles.searchButton}
        onPress={() => setLocalModalVisible(true)}
      >
        <Ionicons name="person-add" size={18} color="#fff" />
        <Text style={styles.searchButtonText}>Buat Local Member</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#002244"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.user_id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
              Belum ada member.
            </Text>
          }
        />
      )}

      {/* Modal Action Member */}
      <Modal
        visible={memberModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMemberModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Aksi untuk {selectedMember?.username}
            </Text>

            {/* Ubah Role ke Admin */}
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => handleChangeRole(selectedMember!.user_id, "Admin")}
            >
              <Text style={styles.searchButtonText}>Ubah Role ke Admin</Text>
            </TouchableOpacity>

            {/* Ubah Role ke Operator */}
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() =>
                handleChangeRole(selectedMember!.user_id, "Operator")
              }
            >
              <Text style={styles.searchButtonText}>Ubah Role ke Operator</Text>
            </TouchableOpacity>

            {/* Ubah Role ke Viewer */}
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() =>
                handleChangeRole(selectedMember!.user_id, "Viewer")
              }
            >
              <Text style={styles.searchButtonText}>Ubah Role ke Viewer</Text>
            </TouchableOpacity>

            {/* Hapus Member */}
            <TouchableOpacity
              style={[styles.searchButton, { backgroundColor: "red" }]}
              onPress={() => handleRemoveMember(selectedMember!.user_id)}
            >
              <Text style={styles.searchButtonText}>Hapus/Keluarkan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.searchButton, { backgroundColor: "#999" }]}
              onPress={() => setMemberModalVisible(false)}
            >
              <Text style={styles.searchButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Create Local Member */}
      <Modal
        visible={localModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLocalModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Buat Local Member</Text>

            <TextInput
              style={styles.input}
              placeholder="Username"
              value={localUsername}
              onChangeText={setLocalUsername}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={localPassword}
              onChangeText={setLocalPassword}
            />

            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleCreateLocalMember}
            >
              <Text style={styles.searchButtonText}>Buat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.searchButton, { backgroundColor: "#999" }]}
              onPress={() => setLocalModalVisible(false)}
            >
              <Text style={styles.searchButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 🔍 Modal Search */}
      <Modal
        visible={searchModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSearchModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Cari Pengguna</Text>

            <TextInput
              style={styles.input}
              placeholder="Masukkan email / username / phone"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearchUser}
            >
              <Ionicons name="search" size={18} color="#fff" />
              <Text style={styles.searchButtonText}>Cari</Text>
            </TouchableOpacity>

            {searchLoading ? (
              <ActivityIndicator size="small" color="#002244" />
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.card}>
                    <View>
                      <Text style={styles.username}>{item.username}</Text>
                      <Text style={styles.role}>{item.email}</Text>
                      <Text style={styles.role}>{item.phone_number}</Text>
                    </View>

                    {/* 🔘 Tombol Invite */}
                    <TouchableOpacity
                      style={styles.inviteButton}
                      onPress={() => handleInvite(item.id)}
                    >
                      <Text style={styles.inviteButtonText}>Invite</Text>
                    </TouchableOpacity>
                  </View>
                )}
                ListEmptyComponent={
                  <Text
                    style={{
                      textAlign: "center",
                      marginTop: 10,
                      color: "#666",
                    }}
                  >
                    Tidak ada hasil
                  </Text>
                }
              />
            )}

            <TouchableOpacity
              style={[
                styles.searchButton,
                { backgroundColor: "#999", marginTop: 10 },
              ]}
              onPress={() => setSearchModalVisible(false)}
            >
              <Text style={styles.searchButtonText}>Tutup</Text>
            </TouchableOpacity>
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
    marginBottom: 12,
  },
  headerTitle: { fontSize: 16, fontWeight: "bold", color: "#002244" },
  list: { paddingVertical: 8 },
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
  username: { fontSize: 14, fontWeight: "600", color: "#002244" },
  role: { fontSize: 12, color: "#666", marginTop: 2 },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "bold" },

  // 🔍 modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    maxHeight: "80%",
  },
  modalTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#002244",
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
  },

  inviteButton: {
    backgroundColor: "#28a745",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  inviteButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
});
