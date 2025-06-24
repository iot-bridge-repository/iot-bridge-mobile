import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface MenuItem {
  id: string;
  title: string;
}

const data: MenuItem[] = [
  { id: "1", title: "Notifikasi Dan Suara" },
  { id: "2", title: "Ganti Email" },
  { id: "3", title: "Ganti Password" },
  { id: "4", title: "asdsadsa" },
];

export default function PengaturanScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [oldEmail, setOldEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleItemPress = (item: MenuItem) => {
    if (item.title === "Ganti Email") {
      setShowEmailModal(true);
    } else if (item.title === "Ganti Password") {
      setShowPasswordModal(true);
    }
  };

  const renderItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => handleItemPress(item)}
    >
      <Text style={styles.menuText}>{item.title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#fff" />
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
        <Text style={styles.title}>Pengaturan</Text>
        <TouchableOpacity onPress={() => router.push("/pengguna")}>
          <Image
            source={{ uri: "https://i.pravatar.cc/100" }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Menu */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.menuContainer}
      />

      {/* Modal Ganti Email */}
      <Modal visible={showEmailModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowEmailModal(false)}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Ganti Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Email lama"
              value={oldEmail}
              onChangeText={setOldEmail}
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Email baru"
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => {
                setShowEmailModal(false);
                alert("Email berhasil diperbarui.");
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Simpan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Ganti Password */}
      <Modal visible={showPasswordModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPasswordModal(false)}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Ganti Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Password lama"
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Password baru"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => {
                setShowPasswordModal(false);
                alert("Password berhasil diperbarui.");
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Simpan</Text>
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
  menuContainer: {
    paddingBottom: 20,
  },
  menuItem: {
    backgroundColor: "#0A2342",
    padding: 15,
    borderRadius: 6,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    width: "85%",
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
  modalTitle: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginTop: 15,
  },
  submitButton: {
    backgroundColor: "#0A2342",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 20,
  },
});
