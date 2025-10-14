import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function StatistikaScreen() {
  const [profileImage, setProfileImage] = useState("");
  const [reportData, setReportData] = useState<any[]>([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const [selectedPin, setSelectedPin] = useState("");
  const [availablePins, setAvailablePins] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [picking, setPicking] = useState<"start" | "end" | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchPins(); // ambil ulang daftar widget box
      if (selectedPin) {
        await fetchReport(); // jika sudah memilih PIN, sekalian refresh datanya
      }
    } catch (error) {
      console.error("❌ Gagal refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const [tooltipPos, setTooltipPos] = useState<any>({
    x: 0,
    y: 0,
    visible: false,
    value: 0,
    label: "",
    time: "",
  });

  const router = useRouter();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { organizationId, deviceId } = route.params;

  // --- FORMAT DATE ---
  const formatDateTime = (date: Date) => {
    const pad = (n: number) => (n < 10 ? "0" + n : n);
    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      " " +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes()) +
      ":" +
      pad(date.getSeconds())
    );
  };

  // --- FETCH LIST PIN DARI WIDGET BOX ---
  const fetchPins = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) return;
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/organizations/${organizationId}/devices/${deviceId}/widget-boxes/list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Simpan objek lengkap: { name, pin }
      const widgets = (res.data.data || [])
        .filter((w: any) => w.pin && w.name)
        .map((w: any) => ({
          name: w.name,
          pin: w.pin,
        }));

      setAvailablePins(widgets);
    } catch (err) {
      console.error("❌ Gagal fetch widget boxes:", err);
    }
  };

  useEffect(() => {
    fetchPins();
  }, [organizationId, deviceId]);

  // --- FETCH REPORT ---
  const fetchReport = async () => {
    try {
      if (!selectedPin) {
        Alert.alert(
          "⚠️",
          "Pilih PIN terlebih dahulu sebelum menampilkan report!"
        );
        return;
      }

      setLoadingReport(true);
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) return;

      // Ambil semua data report dulu
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/organizations/${organizationId}/devices/${deviceId}/report`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { pin: selectedPin },
        }
      );

      let data = res.data.data || [];

      // 🔹 Tentukan batas waktu 1 jam terakhir jika user tidak pilih tanggal
      let filteredData = data;
      if (!startDate && !endDate) {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        filteredData = data.filter((item: any) => {
          const itemTime = new Date(item.time).getTime();
          return itemTime >= oneHourAgo.getTime() && itemTime <= now.getTime();
        });
      } else if (startDate && endDate) {
        // 🔹 Jika user memilih tanggal, filter sesuai rentang itu
        filteredData = data.filter((item: any) => {
          const itemTime = new Date(item.time).getTime();
          return (
            itemTime >= startDate.getTime() && itemTime <= endDate.getTime()
          );
        });
      }

      // 🔹 Jika data kosong → beri info
      if (filteredData.length === 0) {
        Alert.alert(
          "Info",
          "Tidak ada data report pada rentang waktu yang dipilih."
        );
      }

      setReportData(filteredData);
    } catch (err: any) {
      console.error(
        "❌ Gagal fetch report:",
        err.response?.data || err.message
      );
      Alert.alert(
        "Gagal",
        "Tidak dapat memuat data report, periksa koneksi atau server."
      );
    } finally {
      setLoadingReport(false);
    }
  };

  // --- HANDLER DATE ---
  const handleConfirmDate = (date: Date) => {
    if (picking === "start") setStartDate(date);
    if (picking === "end") setEndDate(date);
    setDatePickerVisible(false);
  };

  const handleCancelDate = () => setDatePickerVisible(false);
  const openDatePicker = (type: "start" | "end") => {
    setPicking(type);
    setDatePickerVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/perangkat")}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Statistika</Text>
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* FILTER REPORT */}
        <View style={{ marginBottom: 15 }}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => openDatePicker("start")}
            >
              <Text style={styles.dateButtonText}>
                {startDate
                  ? `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString()}`
                  : "Dari Tanggal & Jam"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => openDatePicker("end")}
            >
              <Text style={styles.dateButtonText}>
                {endDate
                  ? `${endDate.toLocaleDateString()} ${endDate.toLocaleTimeString()}`
                  : "Sampai Tanggal & Jam"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Dropdown Widget Box */}
          <View style={[styles.input, { marginTop: 10 }]}>
            <Text style={{ color: "#0A2342", fontWeight: "600" }}>
              Pilih Widget Box
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                marginTop: 5,
              }}
            >
              <Picker
                selectedValue={selectedPin}
                onValueChange={(itemValue) => setSelectedPin(itemValue)}
              >
                <Picker.Item label="-- Pilih Widget Box --" value="" />
                {Array.isArray(availablePins) &&
                  availablePins.map((item: any, index) => {
                    const name = item?.name ?? "Tidak diketahui";
                    const pin = item?.pin ?? "";
                    return (
                      <Picker.Item
                        key={index}
                        label={`${name}${pin ? ` (${pin})` : ""}`}
                        value={pin}
                      />
                    );
                  })}
              </Picker>
            </View>
          </View>

          {/* Tombol tampilkan report */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              { marginTop: 10, opacity: selectedPin ? 1 : 0.5 },
            ]}
            disabled={!selectedPin}
            onPress={fetchReport}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              Tampilkan Report
            </Text>
          </TouchableOpacity>
        </View>

        <DateTimePickerModal
          isVisible={datePickerVisible}
          mode="datetime"
          onConfirm={handleConfirmDate}
          onCancel={handleCancelDate}
        />

        {/* LIST REPORT + CHART */}
        {loadingReport ? (
          <Text>Loading report...</Text>
        ) : reportData.length === 0 ? (
          <Text
            style={{ textAlign: "center", color: "#0A2342", marginTop: 20 }}
          >
            Tidak ada data report untuk rentang waktu yang dipilih.
          </Text>
        ) : (
          <View>
            {/* Grafik */}
            <View style={{ marginVertical: 15 }}>
              <Text style={styles.chartTitle}>Grafik Data</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <LineChart
                  data={{
                    labels: reportData.map((item, i) =>
                      i % 10 === 0
                        ? new Date(item.time).toLocaleTimeString()
                        : ""
                    ),
                    datasets: [{ data: reportData.map((item) => item.value) }],
                  }}
                  width={reportData.length * 50}
                  height={220}
                  chartConfig={{
                    backgroundColor: "#0A2342",
                    backgroundGradientFrom: "#0A2342",
                    backgroundGradientTo: "#0A2342",
                    decimalPlaces: 2,
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) =>
                      `rgba(255, 255, 255, ${opacity})`,
                    style: { borderRadius: 16 },
                  }}
                  bezier
                  style={{ borderRadius: 12 }}
                />
              </ScrollView>
            </View>

            {/* Tabel */}
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>
                  Pin
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableHeaderText,
                    { flex: 2 },
                  ]}
                >
                  Tanggal & Jam
                </Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>
                  Value
                </Text>
              </View>
              {reportData.map((item, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.tableRow,
                    { backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "#fff" },
                  ]}
                >
                  <Text style={styles.tableCell}>{item.pin}</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    {new Date(item.time).toLocaleString()}
                  </Text>
                  <Text style={styles.tableCell}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
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
  scrollContent: { paddingBottom: 120 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#0A2342" },
  profileImage: { width: 35, height: 35, borderRadius: 35 / 2 },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#0A2342",
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  dateButtonText: { color: "#0A2342", fontWeight: "600" },
  input: { marginVertical: 5 },
  saveButton: {
    backgroundColor: "#0A2342",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  chartTitle: {
    fontWeight: "bold",
    color: "#0A2342",
    marginBottom: 5,
  },
  tableContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0A2342",
    paddingVertical: 8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableCell: { flex: 1, textAlign: "center", fontSize: 12, color: "#0A2342" },
  tableHeaderText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
});
