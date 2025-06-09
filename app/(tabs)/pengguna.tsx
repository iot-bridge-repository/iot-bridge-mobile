import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import axios from "axios"; // jika pakai axios
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";

import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ProfileScreen = () => {
  const navigation = useNavigation();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  // Temp states
  const [tempUsername, setTempUsername] = useState(username);
  const [tempEmail, setTempEmail] = useState(email);
  const [tempPhone, setTempPhone] = useState(phone);
  const [tempImage, setTempImage] = useState(profileImage);

  useEffect(() => {
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

        setUsername(user.username || "");
        setEmail(user.email || "");
        setPhone(user.phone_number || "");
        setProfileImage(user.profile_picture || "");
      } catch (error) {
        console.error("Gagal mengambil data profil:", error);
        alert("Gagal mengambil data profil.");
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = () => {
    setTempUsername(username);
    setTempEmail(email);
    setTempPhone(phone);
    setTempImage(profileImage);
    setModalVisible(true);
  };

  const handleSave = async () => {
    let response;
    try {
      const token = await AsyncStorage.getItem("jwtToken");

      const formData = new FormData();
      formData.append("username", tempUsername);
      formData.append("phone_number", tempPhone);

      // Cek apakah user memilih gambar baru
      if (tempImage && tempImage !== profileImage) {
        const fileName = tempImage.split("/").pop();
        if (fileName) {
          // add null check here
          const fileType = fileName.split(".").pop();
          if (fileType) {
            // add null check here
            formData.append("profile_picture", {
              uri: tempImage,
              name: fileName,
              type: `image/${fileType}`,
            } as any); // atau gunakan as unknown as Blob
          } else {
            console.error("Error: unable to determine file type");
          }
        } else {
          console.error("Error: unable to determine file name");
        }
      }

      response = await axios.patch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update state jika berhasil
      setUsername(tempUsername);
      setPhone(tempPhone);
      setProfileImage(response.data.data.user.profile_picture); // pakai dari response
      setModalVisible(false);
      alert("Profil berhasil diperbarui");
    } catch (error) {
      console.error("Gagal memperbarui profil:", error);
      console.log("Error response:", response);
      alert("Gagal memperbarui profil.");
    }
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Izin akses galeri diperlukan!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setTempImage(result.assets[0].uri);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={{ marginBottom: 20 }}
        >
          <Ionicons name="menu" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Profil</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Foto Profil */}
      <TouchableOpacity onPress={() => setImageModalVisible(true)}>
        <Image source={{ uri: profileImage }} style={styles.profileImage} />
      </TouchableOpacity>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nama Pengguna*</Text>
        <TextInput style={styles.input} value={username} editable={false} />
        <Text style={styles.label}>Alamat Email*</Text>
        <TextInput style={styles.input} value={email} editable={false} />
        <Text style={styles.label}>Nomor Handphone</Text>
        <TextInput style={styles.input} value={phone} editable={false} />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Perbarui</Text>
      </TouchableOpacity>

      {/* Modal Zoom Foto */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={() => setImageModalVisible(false)}
          activeOpacity={1}
        >
          {/* Background gelap */}
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(0,0,0,0.7)" },
            ]}
          />

          {/* Foto zoom */}
          <Image
            source={{ uri: profileImage }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Modal>

      {/* Modal Edit Profil */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Ubah Profil</Text>

            <TouchableOpacity onPress={pickImage}>
              <Image
                source={{ uri: tempImage }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  alignSelf: "center",
                  marginBottom: 20,
                }}
              />
              <Text style={{ textAlign: "center", color: "#1d3557" }}>
                Ubah Foto
              </Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Nama Pengguna"
              value={tempUsername}
              onChangeText={setTempUsername}
            />

            <TextInput
              style={styles.input}
              placeholder="Nomor HP"
              value={tempPhone}
              onChangeText={setTempPhone}
              keyboardType="phone-pad"
            />

            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <TouchableOpacity
                style={[styles.button, { flex: 1, marginRight: 10 }]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>Simpan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { flex: 1, backgroundColor: "#aaa" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Batal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingBottom: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 30,
  },
  inputGroup: {
    width: "100%",
  },
  label: {
    marginBottom: 4,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "#1d3557",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
});

export default ProfileScreen;
