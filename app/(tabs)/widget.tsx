import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";

// 🔹 Komponen modal form widget
const WidgetFormModal = ({
  visible,
  onClose,
  onSubmit,
  onDelete,
  pins,
  initialData,
  canEdit, // ✅ Tambahan prop untuk kontrol akses
}: any) => {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [unit, setUnit] = useState("");
  const [minVal, setMinVal] = useState("");
  const [maxVal, setMaxVal] = useState("");
  const [defVal, setDefVal] = useState("");

  useEffect(() => {
    setName(initialData?.name || "");
    setPin(initialData?.pin || "");
    setUnit(initialData?.unit || "");
    setMinVal(initialData?.min_value?.toString() || "");
    setMaxVal(initialData?.max_value?.toString() || "");
    setDefVal(initialData?.default_value?.toString() || "");
  }, [initialData]);

  const handleSave = () => {
    if (!name || !pin || !unit || !minVal || !maxVal || !defVal) {
      Alert.alert("Peringatan", "Semua field wajib diisi");
      return;
    }
    onSubmit({
      id: initialData?.id,
      name,
      pin,
      unit,
      min_value: String(minVal),
      max_value: String(maxVal),
      default_value: String(defVal),
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {initialData ? "Detail Widget" : "Tambah Widget"}
          </Text>

          <TextInput
            placeholder="Nama Widget"
            value={name}
            onChangeText={setName}
            editable={canEdit}
            style={[styles.input, !canEdit && styles.disabledInput]}
          />
          <TextInput
            placeholder="Pin"
            value={pin}
            onChangeText={setPin}
            editable={canEdit}
            style={[styles.input, !canEdit && styles.disabledInput]}
          />
          <TextInput
            placeholder="Satuan"
            value={unit}
            onChangeText={setUnit}
            editable={canEdit}
            style={[styles.input, !canEdit && styles.disabledInput]}
          />
          <TextInput
            placeholder="Min Value"
            value={minVal}
            onChangeText={setMinVal}
            editable={canEdit}
            keyboardType="numeric"
            style={[styles.input, !canEdit && styles.disabledInput]}
          />
          <TextInput
            placeholder="Max Value"
            value={maxVal}
            onChangeText={setMaxVal}
            editable={canEdit}
            keyboardType="numeric"
            style={[styles.input, !canEdit && styles.disabledInput]}
          />
          <TextInput
            placeholder="Default Value"
            value={defVal}
            onChangeText={setDefVal}
            editable={canEdit}
            keyboardType="numeric"
            style={[styles.input, !canEdit && styles.disabledInput]}
          />

          <View style={styles.modalButtons}>
            {initialData && canEdit && (
              <TouchableOpacity
                style={styles.deleteBtnModal}
                onPress={onDelete}
              >
                <Ionicons name="trash" size={20} color="#fff" />
                <Text style={{ color: "#fff", marginLeft: 5 }}>Hapus</Text>
              </TouchableOpacity>
            )}

            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Tutup</Text>
              </TouchableOpacity>
              {canEdit && (
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveText}>
                    {initialData ? "Update" : "Tambah"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function WidgetScreen() {
  const route = useRoute<any>();
  const router = useRouter();
  const { organizationId, deviceId, from } = route.params;

  const [profileImage, setProfileImage] = useState("");
  const [widgets, setWidgets] = useState<any[]>([]);
  const [pins, setPins] = useState<string[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null); // ✅ Role user

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("jwtToken");
        const res = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/auth/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProfileImage(
          res.data.data.user.profile_picture ||
            "https://via.placeholder.com/100"
        );
      } catch (err) {
        console.error("❌ Gagal ambil profil:", err);
      }
    };
    fetchProfile();
  }, []);

  // 🔹 Ambil role user
  const fetchUserRole = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      const userId = await AsyncStorage.getItem("userId");
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/organizations/${organizationId}/member-list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const currentUser = res.data.data.find((m: any) => m.user_id === userId);
      setUserRole(currentUser?.role || null);
    } catch (err) {
      console.error("❌ Gagal ambil role user:", err);
    }
  };

  useEffect(() => {
    fetchUserRole();
  }, [organizationId]);

  const fetchPins = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) return;
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/organizations/${organizationId}/devices/${deviceId}/pin-list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPins(res.data.data || []);
    } catch (err) {
      console.error("❌ Gagal fetch pins:", err);
    }
  };

  const fetchWidgets = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/organizations/${organizationId}/devices/${deviceId}/widget-boxes/list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWidgets(res.data.data || []);
    } catch (err) {
      console.error("❌ Gagal fetch widgets:", err);
    }
  };

  useEffect(() => {
    fetchPins();
    fetchWidgets();
  }, [organizationId, deviceId]);

  const handleSaveWidget = async (widgetData: any) => {
    if (userRole === "Viewer") {
      Alert.alert("Akses Ditolak", "Viewer tidak dapat mengubah widget.");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/organizations/${organizationId}/devices/${deviceId}/widget-boxes`,
        widgetData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert(
        "Berhasil",
        widgetData.id ? "Widget diperbarui" : "Widget ditambahkan"
      );
      fetchWidgets();
      setFormVisible(false);
      setSelectedWidget(null);
    } catch (err) {
      console.error("❌ Gagal simpan widget:", err);
    }
  };

  const handleDeleteWidget = async () => {
    if (userRole === "Viewer") {
      Alert.alert("Akses Ditolak", "Viewer tidak dapat menghapus widget.");
      return;
    }
    if (!selectedWidget) return;
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      await axios.delete(
        `${process.env.EXPO_PUBLIC_API_URL}/organizations/${organizationId}/devices/${deviceId}/widget-boxes/${selectedWidget.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Berhasil", "Widget dihapus");
      fetchWidgets();
      setFormVisible(false);
      setSelectedWidget(null);
    } catch (err) {
      console.error("❌ Gagal hapus widget:", err);
    }
  };

  const handleBack = () => {
    if (from === "dashboard") router.replace("/dashboard");
    else if (from === "perangkat") router.replace("/perangkat");
    else router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Widget Box</Text>
        <TouchableOpacity>
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {widgets.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => {
                setSelectedWidget(item);
                setFormVisible(true);
              }}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardLabel}>{item.name}</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <AnimatedCircularProgress
                  size={100}
                  width={8}
                  fill={
                    item.default_value && item.max_value
                      ? (parseFloat(item.default_value) /
                          parseFloat(item.max_value)) *
                        100
                      : 0
                  }
                  tintColor="#0A2342"
                  backgroundColor="#d9e1ec"
                  rotation={-130}
                  arcSweepAngle={260}
                >
                  {() => (
                    <Text style={styles.cardValue}>
                      {item.default_value ?? "-"}
                      {item.unit ?? ""}
                    </Text>
                  )}
                </AnimatedCircularProgress>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* ✅ Tombol tambah hanya muncul untuk Admin & Operator */}
      {(userRole === "Admin" || userRole === "Operator") && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setSelectedWidget(null);
            setFormVisible(true);
          }}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      )}

      <WidgetFormModal
        visible={formVisible}
        onClose={() => {
          setFormVisible(false);
          setSelectedWidget(null);
        }}
        onSubmit={handleSaveWidget}
        onDelete={handleDeleteWidget}
        pins={pins}
        initialData={selectedWidget}
        canEdit={userRole === "Admin" || userRole === "Operator"} // ✅ Kontrol akses modal
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    justifyContent: "space-between",
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#000" },
  profileImage: { width: 36, height: 36, borderRadius: 18 },
  scrollContent: { padding: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: {
    width: "47%",
    backgroundColor: "#f7f9fc",
    padding: 12,
    borderRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardLabel: { fontWeight: "bold", color: "#0A2342" },
  cardValue: { fontSize: 16, fontWeight: "bold", color: "#0A2342" },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#0A2342",
    padding: 16,
    borderRadius: 50,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: { backgroundColor: "#fff", borderRadius: 10, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  disabledInput: {
    backgroundColor: "#f2f2f2",
    color: "#888",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  cancelBtn: { marginRight: 15, alignSelf: "center" },
  cancelText: { color: "#666" },
  saveBtn: { backgroundColor: "#0A2342", padding: 10, borderRadius: 8 },
  saveText: { color: "#fff" },
  deleteBtnModal: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "red",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
});
