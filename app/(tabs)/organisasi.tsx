import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import axios from "axios";
import { RelativePathString, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";

import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function OrganisasiScreen() {
  // --- Hooks utama navigasi dan router ---
  const navigation = useNavigation();
  const router = useRouter();

  // --- State untuk modal form organisasi baru ---
  const [modalVisible, setModalVisible] = useState(false);

  // --- State input nama organisasi ---
  const [namaOrganisasi, setNamaOrganisasi] = useState("");

  // --- State untuk menyimpan foto profil user ---
  const [profileImage, setProfileImage] = useState("");

  // --- State daftar organisasi yang dimiliki user ---
  const [organizations, setOrganizations] = useState<
    { id: string; name: string; status: string }[]
  >([]);

  // --- Fungsi untuk membuat path menuju profil organisasi tertentu ---
  const getOrganizationPath = (orgId: string): string => {
    return `/organizations/${orgId}/profile`;
  };

  // --- Fungsi untuk mengambil daftar organisasi dari backend ---
  const fetchOrganizations = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/organizations/list`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Log respons backend di console (debugging)
      console.log("👉 Respons data /organizations/list:", response.data);
    } catch (error) {
      console.error("Gagal fetch organizations:", error);
    }
  };

  // --- useEffect pertama kali dijalankan saat komponen dimount ---
  useEffect(() => {
    fetchOrganizations(); // ambil daftar organisasi user

    // --- Ambil profil pengguna termasuk foto profil ---
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("jwtToken");
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/auth/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const user = response.data.data.user;

        // Jika user tidak punya foto, tampilkan placeholder
        setProfileImage(
          user.profile_picture || "https://via.placeholder.com/100"
        );
      } catch (error) {
        console.error("Gagal mengambil foto profil:", error);
      }
    };

    fetchProfile(); // jalankan fungsi ambil profil
  }, []);

  // --- Fungsi untuk membuka modal form pembuatan organisasi ---
  const handleCreateOrganization = () => {
    setModalVisible(true);
  };

  // --- Fungsi untuk mengirim data organisasi baru ke backend ---
  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) {
        Alert.alert("Token tidak ditemukan");
        return;
      }

      // Kirim request POST ke endpoint propose organisasi baru
      await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/organizations/propose`,
        { name: namaOrganisasi },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Alert.alert("Berhasil", "Organisasi berhasil diajukan.");
      setNamaOrganisasi("");
      setModalVisible(false);

      // Setelah berhasil, perbarui daftar organisasi
      await fetchOrganizations();
    } catch (error: any) {
      console.error(
        "Gagal mengajukan organisasi:",
        error.response?.data || error.message
      );

      // Pesan error jika nama organisasi sudah ada
      Alert.alert(
        "Error",
        "Gagal mengajukan organisasi. Nama yang diajukan sudah ada. Silakan coba lagi."
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* --- HEADER --- */}
      <View style={styles.header}>
        {/* Tombol menu drawer kiri */}
        <Ionicons
          name="menu"
          size={24}
          color="#000"
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        />

        {/* Judul halaman */}
        <Text style={styles.title}>Organisasi</Text>

        {/* Foto profil pengguna (navigasi ke halaman pengguna) */}
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

      {/* --- KONTEN UTAMA --- */}
      <View style={styles.content}>
        {organizations.length === 0 ? (
          <>
            {/* Jika belum ada organisasi, tampilkan tombol buat dan lihat semua */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleCreateOrganization}
            >
              <Text style={styles.buttonText}>Buat Organisasi</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: "#4CAF50", marginTop: 10 },
              ]}
              onPress={() => router.push("/listorganisasi")}
            >
              <Text style={styles.buttonText}>Lihat Semua Organisasi</Text>
            </TouchableOpacity>
          </>
        ) : (
          // Jika ada organisasi, tampilkan daftar card organisasi
          <View style={{ width: "100%", gap: 15, alignItems: "center" }}>
            {organizations.map((org) => (
              <TouchableOpacity
                key={org.id}
                style={styles.orgCard}
                onPress={() =>
                  router.push(getOrganizationPath(org.id) as RelativePathString)
                }
              >
                <View style={styles.orgCardHeader}>
                  {/* Nama organisasi */}
                  <Text style={styles.orgCardText}>{org.name}</Text>

                  {/* Status organisasi (disetujui, menunggu, ditolak) */}
                  <View
                    style={[
                      styles.statusBadge,
                      org.status === "approved"
                        ? { backgroundColor: "#4CAF50" }
                        : org.status === "pending"
                        ? { backgroundColor: "#FFC107" }
                        : { backgroundColor: "#F44336" },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {org.status === "approved"
                        ? "Disetujui"
                        : org.status === "pending"
                        ? "Menunggu"
                        : "Ditolak"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {/* Tombol navigasi ke daftar organisasi */}
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: "#4CAF50", marginTop: 20 },
              ]}
              onPress={() => router.push("/listorganisasi")}
            >
              <Text style={styles.buttonText}>Lihat Semua Organisasi</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* --- MODAL FORM AJUKAN ORGANISASI --- */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {/* Tombol tutup modal */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>

            {/* Form input nama organisasi */}
            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
              Nama Organisasi<Text style={{ color: "red" }}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan nama organisasi"
              value={namaOrganisasi}
              onChangeText={setNamaOrganisasi}
            />

            {/* Catatan tambahan di bawah input */}
            <Text style={styles.helperText}>
              Organisasi yang anda ajukan harus menunggu persetujuan. Anda
              adalah administrator dalam organisasi ini.
            </Text>

            {/* Tombol kirim pengajuan */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                Ajukan Organisasi
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 30,
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
  content: {
    flex: 1,
    justifyContent: "flex-start", // sebelumnya "center"
    alignItems: "center",
  },
  description: {
    color: "#A0A0A0",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#0A2342",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginTop: 30,
    marginBottom: 10,
  },
  helperText: {
    fontSize: 12,
    color: "#555",
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "#0A2342",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  orgCard: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#0A2342",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    marginVertical: 5,
  },
  orgCardText: {
    color: "#0A2342",
    fontWeight: "600",
    textAlign: "center",
  },
  orgCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
