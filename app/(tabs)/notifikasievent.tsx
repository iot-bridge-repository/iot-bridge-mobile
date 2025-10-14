import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface NotificationEvent {
  id: string;
  pin: string;
  subject: string;
  comparison_type: string;
  threshold_value: number;
  is_active: boolean;
  created_at: string;
  message?: string;
}

export default function NotificationEventsScreen() {
  const { organizationId, deviceId } = useLocalSearchParams();
  const router = useRouter();

  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // modal add
  const [modalVisible, setModalVisible] = useState(false);

  // modal edit
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<NotificationEvent | null>(
    null
  );

  // form state
  const [pin, setPin] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [comparisonType, setComparisonType] = useState(">");
  const [thresholdValue, setThresholdValue] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (organizationId && deviceId) {
      fetchEvents();
    }
  }, [organizationId, deviceId]);

  const resetForm = () => {
    setPin("");
    setSubject("");
    setMessage("");
    setComparisonType(">");
    setThresholdValue("");
    setIsActive(true);
  };

  const fillFormForEdit = (event: NotificationEvent) => {
    setPin(event.pin);
    setSubject(event.subject);
    setMessage(event.message ?? "");
    setComparisonType(event.comparison_type);
    setThresholdValue(String(event.threshold_value));
    setIsActive(event.is_active);
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("jwtToken");
      const url = `${process.env.EXPO_PUBLIC_API_URL}/organizations/${organizationId}/devices/${deviceId}/notification-events/list`;

      const res = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setEvents(data);
    } catch (err: any) {
      console.log("fetchEvents error:", err.response?.data || err.message);
      Alert.alert("Error", "Gagal memuat notifikasi event");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (
      !pin.trim() ||
      !subject.trim() ||
      !comparisonType.trim() ||
      !thresholdValue.trim()
    ) {
      Alert.alert(
        "Error",
        "Field wajib diisi (PIN, Subject, Comparison, Threshold)"
      );
      return;
    }

    try {
      const token = await AsyncStorage.getItem("jwtToken");
      const url = `${process.env.EXPO_PUBLIC_API_URL}/organizations/${organizationId}/devices/${deviceId}/notification-events`;

      await axios.post(
        url,
        {
          pin,
          subject,
          message,
          comparison_type: comparisonType,
          threshold_value: Number(thresholdValue),
          is_active: isActive,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );

      resetForm();
      setModalVisible(false);
      fetchEvents();
    } catch (err: any) {
      console.log("addEvent error:", err.response?.data || err.message);
      Alert.alert("Error", "Gagal menambahkan event");
    }
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;

    try {
      const token = await AsyncStorage.getItem("jwtToken");
      const url = `${process.env.EXPO_PUBLIC_API_URL}/organizations/${organizationId}/devices/${deviceId}/notification-events/${selectedEvent.id}`;

      const body = {
        pin,
        subject,
        message,
        comparison_type: comparisonType,
        threshold_value: thresholdValue.toString(),
        is_active: isActive,
      };

      console.log("PATCH update event:", url, body);

      await axios.patch(url, body, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      setEditModalVisible(false);
      fetchEvents();
    } catch (err: any) {
      console.log("updateEvent error:", err.response?.data || err.message);
      Alert.alert("Error", "Gagal update event");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    Alert.alert("Konfirmasi", "Hapus event notifikasi ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("jwtToken");
            const url = `${process.env.EXPO_PUBLIC_API_URL}/organizations/${organizationId}/devices/${deviceId}/notification-events/${eventId}`;

            await axios.delete(url, {
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });

            fetchEvents();
          } catch (err: any) {
            console.log(
              "deleteEvent error:",
              err.response?.data || err.message
            );
            Alert.alert("Error", "Gagal menghapus event");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            router.replace({
              pathname: "/widget",
              params: { organizationId, deviceId },
            })
          }
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Notification Events</Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="blue"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setSelectedEvent(item);
                fillFormForEdit(item);
                setEditModalVisible(true);
              }}
            >
              <View style={styles.card}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <Text style={styles.subject}>{item.subject}</Text>
                  <TouchableOpacity onPress={() => handleDeleteEvent(item.id)}>
                    <Ionicons name="trash-outline" size={20} color="red" />
                  </TouchableOpacity>
                </View>

                <View style={styles.cardRow}>
                  <Text style={styles.label}>PIN:</Text>
                  <Text style={styles.value}>{item.pin ?? "-"}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.label}>Condition:</Text>
                  <Text style={styles.value}>
                    {item.comparison_type} {item.threshold_value}
                  </Text>
                </View>
                {item.message ? (
                  <View style={styles.cardRow}>
                    <Text style={styles.label}>Message:</Text>
                    <Text style={styles.value}>{item.message}</Text>
                  </View>
                ) : null}
                <View style={styles.cardRow}>
                  <Text style={styles.label}>Status:</Text>
                  <Text
                    style={[
                      styles.value,
                      {
                        color: item.is_active ? "green" : "red",
                        fontWeight: "600",
                      },
                    ]}
                  >
                    {item.is_active ? "Aktif" : "Nonaktif"}
                  </Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.label}>Created:</Text>
                  <Text style={styles.value}>
                    {new Date(item.created_at).toLocaleString()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20, color: "gray" }}>
              Belum ada event
            </Text>
          }
        />
      )}

      {/* Tombol tambah event */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Modal tambah event */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tambah Event</Text>
            <EventForm
              pin={pin}
              subject={subject}
              message={message}
              comparisonType={comparisonType}
              thresholdValue={thresholdValue}
              setPin={setPin}
              setSubject={setSubject}
              setMessage={setMessage}
              setComparisonType={setComparisonType}
              setThresholdValue={setThresholdValue}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                style={[
                  styles.btn,
                  { backgroundColor: "gray", marginRight: 10 },
                ]}
                onPress={() => {
                  resetForm();
                  setModalVisible(false);
                }}
              >
                <Text style={styles.btnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={handleAddEvent}>
                <Text style={styles.btnText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal edit event */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Event</Text>
            <EventForm
              pin={pin}
              subject={subject}
              message={message}
              comparisonType={comparisonType}
              thresholdValue={thresholdValue}
              setPin={setPin}
              setSubject={setSubject}
              setMessage={setMessage}
              setComparisonType={setComparisonType}
              setThresholdValue={setThresholdValue}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                style={[
                  styles.btn,
                  { backgroundColor: "gray", marginRight: 10 },
                ]}
                onPress={() => {
                  resetForm();
                  setEditModalVisible(false);
                }}
              >
                <Text style={styles.btnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={handleUpdateEvent}>
                <Text style={styles.btnText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// 🔹 Component Form Biar DRY
function EventForm({
  pin,
  subject,
  message,
  comparisonType,
  thresholdValue,
  setPin,
  setSubject,
  setMessage,
  setComparisonType,
  setThresholdValue,
}: any) {
  return (
    <>
      <TextInput
        placeholder="PIN"
        value={pin}
        onChangeText={setPin}
        style={styles.input}
      />
      <TextInput
        placeholder="Subject"
        value={subject}
        onChangeText={setSubject}
        style={styles.input}
      />
      <TextInput
        placeholder="Message (opsional)"
        value={message}
        onChangeText={setMessage}
        style={styles.input}
      />
      <Text style={{ marginBottom: 5 }}>Comparison Type</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={comparisonType}
          onValueChange={(value) => setComparisonType(value)}
        >
          <Picker.Item label=">" value=">" />
          <Picker.Item label="<" value="<" />
          <Picker.Item label="=" value="=" />
        </Picker>
      </View>
      <TextInput
        placeholder="Threshold Value"
        value={thresholdValue}
        onChangeText={setThresholdValue}
        keyboardType="numeric"
        style={styles.input}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 18, fontWeight: "bold", marginLeft: 10 },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subject: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  cardRow: { flexDirection: "row", marginBottom: 4 },
  label: { fontWeight: "600", width: 90, fontSize: 14, color: "#333" },
  value: { fontSize: 14, color: "#555", flexShrink: 1 },
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "blue",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 15,
    overflow: "hidden",
  },
  btn: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  btnText: { color: "white", fontWeight: "bold" },
});
