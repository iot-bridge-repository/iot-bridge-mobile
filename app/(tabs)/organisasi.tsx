import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
  const navigation = useNavigation();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [namaOrganisasi, setNamaOrganisasi] = useState("");

  const handleCreateOrganization = () => {
    setModalVisible(true);
  };

  const handleSubmit = () => {
    console.log("Nama Organisasi:", namaOrganisasi);
    setModalVisible(false);
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
        <Text style={styles.title}>Organisasi</Text>
        <TouchableOpacity onPress={() => router.push("/pengguna")}>
          <Image
            source={{ uri: "https://i.pravatar.cc/100" }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Konten Tengah */}
      <View style={styles.content}>
        <Text style={styles.description}>
          Anda belum memiliki Organisasi. Buat organisasi terlebih dahulu
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleCreateOrganization}
        >
          <Text style={styles.buttonText}>Buat Organisasi</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Form */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {/* Tombol Close */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>

            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
              Nama Organisasi<Text style={{ color: "red" }}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan nama organisasi"
              value={namaOrganisasi}
              onChangeText={setNamaOrganisasi}
            />
            <Text style={styles.helperText}>
              Organisasi yang anda ajukan harus menunggu persetujuan. Anda
              adalah administrator dalam organisasi ini.
            </Text>
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
    justifyContent: "center",
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
});
