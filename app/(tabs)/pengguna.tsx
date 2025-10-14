import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ProfileScreen = () => {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState<string>("");

  const navigation = useNavigation(); // 🔹 ambil navigator

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
        setUsername(user.username || "");
        setPhone(user.phone_number || "");

        if (user.profile_picture) {
          const fullUrl = user.profile_picture.startsWith("http")
            ? user.profile_picture
            : `${process.env.EXPO_PUBLIC_API_URL}/${user.profile_picture}`;
          setProfileImage(fullUrl);
        }
      } catch (error) {
        console.error("Gagal mengambil profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) return;

      const formData = new FormData();
      formData.append("username", username);
      formData.append("phone_number", phone);

      if (profileImage) {
        const fileName = profileImage.split("/").pop() || "profile.jpg";
        const match = /\.(\w+)$/.exec(fileName);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append("profile_picture", {
          uri: profileImage,
          name: fileName,
          type,
        } as any);
      }

      await axios.patch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        }
      );

      Alert.alert("Sukses", "Profil berhasil diperbarui");
    } catch (error: any) {
      console.error(
        "Gagal memperbarui profil:",
        error.response?.data || error.message
      );
      Alert.alert("Error", "Gagal memperbarui profil.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Ionicons name="menu" size={26} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Profil</Text>

        <Image
          source={
            profileImage
              ? { uri: profileImage }
              : require("@/assets/icon/profil.png")
          }
          style={styles.headerAvatar}
        />
      </View>

      {/* Foto Profil */}
      <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
        <Image
          source={
            profileImage
              ? { uri: profileImage }
              : require("@/assets/icon/profil.png")
          }
          style={styles.profileImage}
        />
      </TouchableOpacity>

      {/* Input Username */}
      <Text style={styles.label}>Nama Pengguna*</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />

      {/* Input Nomor HP */}
      <Text style={styles.label}>Nomor Handphone</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      {/* Tombol Perbarui */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Perbarui</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 150,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerAvatar: {
    width: 35,
    height: 35,
    borderRadius: 18,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 15,
    backgroundColor: "#f9f9f9",
  },
  saveButton: {
    backgroundColor: "#1E3A8A",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
