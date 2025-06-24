import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DashboardScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  const daftarFarm = [
    "Pokdakkan Bintang Rosela Jaya",
    "Laboratorium Teknik Digital Unila",
    "Laboratorium Komputer Unila",
  ];

  const dataPerOrganisasi: { [key: string]: { id: string; title: string }[] } =
    {
      "Pokdakkan Bintang Rosela Jaya": [
        { id: "1", title: "KOLAM A - RAS" },
        { id: "2", title: "KOLAM B - RAS" },
        { id: "3", title: "KOLAM C - Non RAS" },
        { id: "4", title: "KOLAM D - Non RAS" },
      ],
      "Laboratorium Teknik Digital Unila": [
        { id: "1", title: "Kolam Eksperimen Sensor pH" },
        { id: "2", title: "Kolam Uji Kalibrasi Suhu" },
      ],
      "Laboratorium Komputer Unila": [
        { id: "1", title: "Simulasi IoT Air Monitoring" },
        { id: "2", title: "Pengujian MQTT Gateway" },
        { id: "3", title: "Dashboard Development Kolam" },
      ],
    };

  const [selectedFarm, setSelectedFarm] = useState(
    "Pokdakkan Bintang Rosela Jaya"
  );
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const renderItem = ({ item }: { item: { id: string; title: string } }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        if (item.title === "KOLAM A - RAS") {
          router.push("/statistika");
        }
      }}
    >
      <Image
        source={require("../../assets/icon/iot_6134840.png")}
        style={styles.cardImage}
        resizeMode="contain"
      />
      <Text style={styles.cardTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

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
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity onPress={() => router.push("/pengguna")}>
          <Image
            source={{ uri: "https://i.pravatar.cc/100" }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Dropdown header */}
      <TouchableOpacity
        onPress={() => setDropdownVisible(true)}
        style={styles.dropdownHeader}
      >
        <Text style={styles.dropdownText}>{selectedFarm}</Text>
        <Ionicons name="chevron-down" size={20} color="#000" />
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setDropdownVisible(false)}
        >
          <View style={styles.dropdownContainer}>
            {daftarFarm.map((farm, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedFarm(farm);
                  setDropdownVisible(false);
                }}
              >
                <Image
                  source={require("../../assets/icon/iot_6134840.png")}
                  style={styles.dropdownIcon}
                />
                <Text style={styles.dropdownItemText}>{farm}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Grid Kolam berdasarkan organisasi */}
      <FlatList
        data={dataPerOrganisasi[selectedFarm]}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
      />
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
    marginBottom: 20,
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
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 5,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0A2342",
  },
  grid: {
    gap: 15,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#0A2342",
    borderRadius: 12,
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    margin: 5,
    minHeight: 150,
  },
  cardImage: {
    width: 60,
    height: 60,
    marginBottom: 10,
    tintColor: "#fff",
  },
  cardTitle: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 130,
    paddingHorizontal: 20,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  dropdownContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 10,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  dropdownIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    resizeMode: "contain",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#000",
  },
});
