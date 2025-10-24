// Import library dan dependensi yang digunakan
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router"; // untuk navigasi antar halaman
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Komponen utama halaman login
export default function LoginScreen() {
  // State untuk menyimpan input pengguna dan status aplikasi
  const [identity, setIdentity] = useState(""); // menyimpan email/username/no telp
  const [password, setPassword] = useState(""); // menyimpan kata sandi
  const [loading, setLoading] = useState(false); // indikator loading ketika login
  const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/auth/login`; // alamat API login
  const [passwordVisible, setPasswordVisible] = useState(false); // menampilkan/menyembunyikan password
  const router = useRouter(); // inisialisasi router untuk navigasi

  // Fungsi untuk menangani proses login
  const handleLogin = async () => {
    if (!identity || !password) {
      Alert.alert("Error", "Email dan password harus diisi!");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("https://iotbridge.click/auth/login", {
        identity,
        password,
      });

      const data = response.data;
      setLoading(false);

      Alert.alert("Sukses", "Login berhasil!");
      console.log("Data login:", data);

      await AsyncStorage.setItem("jwtToken", data.data.token);
      await AsyncStorage.setItem("userId", data.data.user.id);

      router.push("/(tabs)/dashboard");
    } catch (error: any) {
      setLoading(false);

      console.log("🧩 Detail error:", JSON.stringify(error, null, 2));

      if (error.response && error.response.status) {
        // Server merespons dengan error (misalnya 400, 401, dll)
        console.log("Response Error:", error.response.data);

        if (error.response.status === 400) {
          Alert.alert("Error", "Email atau password salah!");
        } else {
          Alert.alert("Error", "Terjadi kesalahan di server!");
        }
      } else if (error.request) {
        // Permintaan dikirim tapi tidak ada respon dari server
        Alert.alert(
          "Error",
          "Tidak ada respon dari server. Periksa koneksi internet Anda."
        );
      } else {
        // Error lain (misalnya kesalahan di kode sendiri)
        Alert.alert("Error", "Terjadi kesalahan internal.");
      }
    }
  };

  // useEffect untuk memeriksa apakah token sudah tersimpan
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("jwtToken");
      // Jika token sudah ada, langsung arahkan ke dashboard
      if (token) {
        router.replace("/(tabs)/dashboard");
      }
    };

    checkToken(); // jalankan saat komponen pertama kali dimuat
  }, []);

  // Tampilan utama halaman login
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

      {/* Bagian form login */}
      <View style={styles.form}>
        {/* Input untuk email/username/no telp */}
        <Text style={styles.label}>Alamat Email, username, no telp</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Masukan email, username, no telp pengguna"
            placeholderTextColor="#999"
            style={[styles.input, { color: "#000" }]}
            value={identity}
            onChangeText={setIdentity}
          />
          <FontAwesome name="user" size={20} color="#fff" style={styles.icon} />
        </View>

        {/* Input untuk kata sandi */}
        <Text style={styles.label}>Kata sandi</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Masukan kata sandi"
            placeholderTextColor="#999" // tambahkan warna placeholder abu-abu
            secureTextEntry={!passwordVisible}
            style={[styles.input, { color: "#000" }]} // pastikan teks berwarna hitam
            value={password}
            onChangeText={setPassword}
          />

          {/* Tombol untuk melihat/menyembunyikan kata sandi */}
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <FontAwesome
              name={passwordVisible ? "eye" : "eye-slash"}
              size={20}
              color="#fff"
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>

        {/* Tautan lupa kata sandi */}
        <TouchableOpacity onPress={() => router.push("/forgetpassword")}>
          <Text style={styles.forgot}>Lupa kata sandi?</Text>
        </TouchableOpacity>

        {/* Tombol login */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" /> // tampilkan loading spinner
          ) : (
            <Text style={styles.buttonText}>Masuk</Text>
          )}
        </TouchableOpacity>

        {/* Tautan ke halaman registrasi */}
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

// Gaya tampilan (styling) untuk setiap elemen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECECEC", // warna latar belakang halaman
  },
  header: {
    backgroundColor: "#19335A", // warna latar header
    borderBottomLeftRadius: 120, // sudut melengkung bawah kiri
    borderBottomRightRadius: 120, // sudut melengkung bawah kanan
    alignItems: "center",
    paddingVertical: 10,
  },
  logo: {
    height: 200,
    width: 200,
    marginBottom: 20,
  },
  form: {
    padding: 20, // jarak isi form dari tepi
  },
  label: {
    marginTop: 20,
    marginBottom: 5,
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row", // susun ikon dan input sejajar
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
  forgot: {
    alignSelf: "flex-end",
    color: "#19335A",
    marginTop: 10,
    textDecorationLine: "underline", // garis bawah teks
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
    elevation: 5, // efek bayangan tombol
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
