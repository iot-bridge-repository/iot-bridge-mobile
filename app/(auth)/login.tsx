import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router"; //untuk pindah halaman
import React, { useState } from "react";
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

export default function LoginScreen() {
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState(""); //
  const [loading, setLoading] = useState(false); //untuk loading jika kondisi true
  const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/auth/login`; // Ganti dengan URL backend-mu
  const [passwordVisible, setPasswordVisible] = useState(false); // untuk melihat password dan menyembunyikannya
  const router = useRouter();

  const handleLogin = async () => {
    if (!identity || !password) {
      Alert.alert("Error", "Email dan password harus diisi!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identity: identity,
          password: password,
        }),
      });

      const data = await response.json();

      setLoading(false);

      if (response.ok) {
        // Login berhasil, data biasanya token atau info user
        Alert.alert("Sukses", "Login berhasil!");
        console.log("Data login:", data);
        // Navigasi ke halaman utama atau simpan token
      } else {
        // Jika API mengembalikan error
        Alert.alert("Login gagal", data.message || "Periksa kembali data Anda");
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Gagal terhubung ke server");
      console.error(error);
    }
  };
  return (
    <View style={styles.container}>
      {/* Header Background Curve */}
      <View style={styles.header}>
        {/* Ganti dengan logo SVG / PNG-mu */}
        <Image
          source={require("../../assets/images/logo-sign.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Form Login */}
      <View style={styles.form}>
        <Text style={styles.label}>Alamat Email, username, no telp</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Masukan email, username, no telp pengguna"
            style={styles.input}
            value={identity}
            onChangeText={setIdentity}
          />
          <FontAwesome name="user" size={20} color="#fff" style={styles.icon} />
        </View>

        <Text style={styles.label}>Kata sandi</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Masukan kata sandi"
            secureTextEntry={!passwordVisible}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
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

        <TouchableOpacity onPress={() => router.push("/forgetpassword")}>
          <Text style={styles.forgot}>Lupa kata sandi?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Masuk</Text>
          )}
        </TouchableOpacity>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECECEC",
  },
  header: {
    backgroundColor: "#19335A",
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
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
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
