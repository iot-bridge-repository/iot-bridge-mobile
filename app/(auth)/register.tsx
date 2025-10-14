// Mengimpor ikon FontAwesome untuk digunakan pada input dan tombol
import { FontAwesome } from "@expo/vector-icons";

// Digunakan untuk navigasi antar halaman di aplikasi menggunakan expo-router
import { useRouter } from "expo-router";

// Mengimpor React dan hook useState untuk mengelola data input pengguna
import React, { useState } from "react";

// Mengimpor komponen-komponen dasar React Native untuk tampilan dan interaksi
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

// Fungsi utama komponen halaman Register
export default function RegisterScreen() {
  // State untuk menyimpan input pengguna
  const [username, setusername] = useState(""); // username untuk memasukan username user
  const [email, setemail] = useState(""); // untuk memasukan email user
  const [phone, setPhone] = useState(""); // digunakan khusus untuk angka nomor telepon
  const [password, setPassword] = useState(""); // untuk mengisi password

  // State untuk menampilkan loading ketika proses registrasi berlangsung
  const [loading, setLoading] = useState(false);

  // URL endpoint API register yang diambil dari variabel lingkungan (env)
  const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/auth/register`;

  // State untuk mengatur visibilitas password (apakah terlihat atau disembunyikan)
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Hook router untuk navigasi ke halaman login setelah register berhasil
  const router = useRouter();

  // Fungsi yang dijalankan ketika tombol "Daftar" ditekan
  const handleRegister = async () => {
    setLoading(true); // mengaktifkan indikator loading
    try {
      // Mengirim data ke API menggunakan method POST
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          email: email,
          phone_number: phone,
          password: password,
        }),
      });

      // Mengubah response API menjadi format JSON
      const data = await response.json();

      setLoading(false); // mematikan loading setelah mendapat respons

      if (response.ok) {
        // Jika registrasi berhasil, tampilkan notifikasi sukses
        Alert.alert("Sukses", "register berhasil!");
        console.log("Data Register:", data);

        // Setelah berhasil, navigasi ke halaman login
        router.push("/login");
      } else {
        // Jika API mengembalikan error
        Alert.alert("register gagal", "gagal mendaftar");
      }
    } catch (error) {
      // Jika terjadi error pada jaringan atau koneksi
      setLoading(false);
      Alert.alert("Error");
      console.error(error);
    }
  };

  // Bagian tampilan utama halaman Register
  return (
    <View style={styles.container}>
      {/* Bagian header dengan latar berwarna biru dan logo aplikasi */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/logo-sign.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Bagian form input untuk data pengguna */}
      <View style={styles.form}>
        {/* Input username */}
        <Text style={styles.label}>Username</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Masukan Username / alias"
            style={styles.input}
            value={username}
            onChangeText={setusername}
          />
          <FontAwesome
            name="phone-square"
            size={20}
            color="#fff"
            style={styles.icon}
          />
        </View>

        {/* Input email */}
        <Text style={styles.label}>Alamat Email</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Masukan email pengguna"
            style={styles.input}
            value={email}
            onChangeText={setemail}
          />
          <FontAwesome
            name="envelope"
            size={20}
            color="#fff"
            style={styles.icon}
          />
        </View>

        {/* Input nomor telepon */}
        <Text style={styles.label}>No. telp</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Masukan nomor telepon pengguna"
            style={styles.input}
            keyboardType="numeric" // menampilkan keyboard angka
            value={phone}
            onChangeText={(text) => {
              // Hanya menerima angka dan membatasi hingga 15 digit
              const filtered = text.replace(/[^0-9]/g, "").slice(0, 15);
              setPhone(filtered);
            }}
          />
          <FontAwesome name="user" size={25} color="#fff" style={styles.icon} />
        </View>

        {/* Input kata sandi */}
        <Text style={styles.label}>Kata sandi</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Masukan kata sandi"
            secureTextEntry={!passwordVisible} // menyembunyikan teks jika false
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
          {/* Tombol ikon untuk menampilkan atau menyembunyikan password */}
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

        {/* Tombol daftar, menampilkan loading jika sedang memproses */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Daftar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Gaya tampilan menggunakan StyleSheet bawaan React Native
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECECEC", // warna latar belakang halaman
  },
  header: {
    backgroundColor: "#19335A", // warna biru tua di bagian atas
    borderBottomLeftRadius: 120,
    borderBottomRightRadius: 120,
    alignItems: "center",
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
    flexDirection: "row", // menempatkan input dan ikon sejajar
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
    width: 40,
    height: 40,
    borderRadius: 8,
    marginLeft: 8,
    paddingTop: 10,
    paddingLeft: 10,
  },

  forgot: {
    alignSelf: "flex-end",
    color: "#19335A",
    marginTop: 10,
    textDecorationLine: "underline",
  },
  button: {
    backgroundColor: "#19335A",
    padding: 15,
    borderRadius: 6,
    marginTop: 100,
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
