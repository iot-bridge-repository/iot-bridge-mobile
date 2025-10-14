import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Pastikan notifikasi diatur agar muncul walau app terbuka
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // Add this line
    shouldShowList: true, // Add this line
  }),
});

interface MenuItem {
  title: string;
  description?: string;
}

export default function PengaturanScreen() {
  const navigation = useNavigation();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notifikasiAktif, setNotifikasiAktif] = useState(false);

  const menuItems: MenuItem[] = [
    {
      title: "Notifikasi Dan Suara",
      description: "Atur izin notifikasi perangkat",
    },
    { title: "Ganti Email", description: "Ubah alamat email akun Anda" },
    { title: "Ganti Password", description: "Perbarui kata sandi akun Anda" },
  ];

  const handleItemPress = async (item: MenuItem) => {
    if (item.title === "Notifikasi Dan Suara") {
      if (!Device.isDevice) {
        Alert.alert("Peringatan", "Notifikasi hanya bisa di perangkat fisik.");
        return;
      }

      try {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") {
          Alert.alert("Ditolak", "Izin notifikasi belum diberikan.");
          return;
        }

        const token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log("📱 Expo Push Token:", token);

        setNotifikasiAktif(true);

        // Kirim contoh notifikasi lokal
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "🔔 Notifikasi Aktif!",
            body: "Kamu sudah berhasil mengaktifkan notifikasi di perangkat ini.",
            sound: true,
          },
          trigger: null, // langsung tampil
        });

        Alert.alert(
          "Berhasil",
          "Notifikasi telah diaktifkan di perangkat kamu!"
        );
      } catch (error) {
        console.error("Gagal meminta izin notifikasi:", error);
        Alert.alert("Error", "Terjadi kesalahan saat mengaktifkan notifikasi.");
      }
    } else if (item.title === "Ganti Email") {
      setShowEmailModal(true);
    } else if (item.title === "Ganti Password") {
      setShowPasswordModal(true);
    }
  };

  const handleSaveEmail = () => {
    Alert.alert("Berhasil", `Email diubah menjadi ${email}`);
    setShowEmailModal(false);
  };

  const handleSavePassword = () => {
    Alert.alert("Berhasil", "Password berhasil diperbarui!");
    setShowPasswordModal(false);
  };

  return (
    <ScrollView style={styles.container}>
      {/* 🔙 Header dengan tombol back */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.header}>Pengaturan</Text>
      </View>

      {/* 📋 Daftar menu */}
      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.menuItem}
          onPress={() => handleItemPress(item)}
        >
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>{item.title}</Text>
            {item.description && (
              <Text style={styles.menuDescription}>{item.description}</Text>
            )}
          </View>

          {item.title === "Notifikasi Dan Suara" && (
            <Switch value={notifikasiAktif} onValueChange={() => {}} disabled />
          )}
        </TouchableOpacity>
      ))}

      {/* Modal Ganti Email */}
      <Modal visible={showEmailModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ganti Email</Text>
            <TextInput
              placeholder="Masukkan email baru"
              style={styles.input}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveEmail}
              >
                <Text style={styles.buttonText}>Simpan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowEmailModal(false)}
              >
                <Text style={styles.buttonText}>Batal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Ganti Password */}
      <Modal visible={showPasswordModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ganti Password</Text>
            <TextInput
              placeholder="Masukkan password baru"
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSavePassword}
              >
                <Text style={styles.buttonText}>Simpan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.buttonText}>Batal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// 🎨 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F9FAFB",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
    padding: 5,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  menuDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    width: "85%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#111827",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  saveButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  cancelButton: {
    backgroundColor: "#9CA3AF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
