// Import berbagai komponen dan library yang dibutuhkan
import { FontAwesome } from "@expo/vector-icons"; // untuk ikon fontawesome
import { useRouter } from "expo-router"; // untuk navigasi antar halaman
import React, { useState } from "react"; // untuk membuat komponen dan state
import {
  ActivityIndicator, // indikator loading
  Alert, // untuk menampilkan pesan alert
  Image, // menampilkan gambar
  StyleSheet, // styling komponen
  Text, // menampilkan teks
  TextInput, // input teks
  TouchableOpacity, // tombol yang bisa ditekan
  View, // wadah utama elemen UI
} from "react-native";

// Komponen utama halaman lupa password
export default function LoginScreen() {
  // State untuk menyimpan input email
  const [email, setEmail] = useState("");
  // State untuk menandai loading saat proses kirim email
  const [loading, setLoading] = useState(false);
  // URL API (belum digunakan untuk tampilan saja)
  const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/auth/forgot-password`;
  const router = useRouter(); // untuk navigasi halaman

  // Fungsi untuk menangani tombol lupa password
  const handleForgetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Email harus diisi!");
      return;
    }

    // Aktifkan indikator loading
    setLoading(true);
    try {
      // Kirim data ke API backend (tidak termasuk tampilan)
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        Alert.alert("Sukses", "cek email untuk mengganti Password!");
        console.log("Data login:", data);
      } else {
        Alert.alert(
          "ganti password gagal",
          data.message || "Periksa kembali email Anda"
        );
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Gagal terhubung ke server");
      console.error(error);
    }
  };

  // Bagian tampilan antarmuka pengguna (UI)
  return (
    <View style={styles.container}>
      {/* Bagian header dengan logo */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/logo-sign.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Bagian form input */}
      <View style={styles.form}>
        <Text style={styles.label}>Alamat Email</Text>

        {/* Input email */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Masukan email pengguna"
            style={styles.input}
            value={email}
            onChangeText={setEmail} // simpan nilai input ke state email
          />
          {/* Ikon amplop di kanan input */}
          <FontAwesome
            name="envelope"
            size={20}
            color="#fff"
            style={styles.icon}
          />
        </View>

        {/* Tombol Kirim */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleForgetPassword}
          disabled={loading} // tidak bisa ditekan saat loading
        >
          {/* Tampilkan loading atau teks Kirim */}
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Kirim</Text>
          )}
        </TouchableOpacity>

        {/* Teks untuk daftar akun baru */}
        <Text style={styles.registerText}>
          Belum punya akun?
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={styles.registerLink}> Daftar</Text>
          </TouchableOpacity>
        </Text>
      </View>
    </View>
  );
}

// Bagian style untuk mengatur tampilan komponen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECECEC", // warna latar belakang utama
  },
  header: {
    backgroundColor: "#19335A", // warna biru tua
    borderBottomLeftRadius: 120, // membuat sisi bawah melengkung
    borderBottomRightRadius: 120,
    alignItems: "center", // posisi tengah
    paddingVertical: 10,
  },
  logo: {
    height: 200,
    width: 200,
    marginBottom: 20,
  },
  form: {
    padding: 20,
  },
  label: {
    marginTop: 20,
    marginBottom: 5,
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F7FA",
    borderRadius: 8,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
  },
  icon: {
    backgroundColor: "#19335A",
    padding: 10,
    borderRadius: 7,
    marginLeft: 8,
  },
  button: {
    backgroundColor: "#19335A",
    padding: 15,
    borderRadius: 6,
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5, // efek bayangan di Android
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  registerText: {
    textAlign: "center",
    marginTop: 20,
  },
  registerLink: {
    color: "#19335A",
    fontWeight: "bold",
  },
});
