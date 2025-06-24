import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";

export default function DetailKolamScreen() {
  const navigation = useNavigation();

  const dataSensor = [
    { label: "TEMPERATUR", value: 30.0, unit: "°C", max: 50 },
    { label: "TINGKAT KEASAMAN (pH)", value: 6.5, unit: "", max: 14 },
    { label: "KADAR GAS AMONIA", value: 0.01, unit: "PPM", max: 100 },
    { label: "KEKERUHAN AIR", value: 300, unit: "NTU", max: 1500 },
  ];

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
        <Text style={styles.title}>KOLAM A - RAS</Text>
        <TouchableOpacity>
          <Image
            source={{ uri: "https://i.pravatar.cc/100" }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Sensor Data Grid */}
      <ScrollView contentContainerStyle={styles.grid}>
        {dataSensor.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardLabel}>{item.label}</Text>
            <AnimatedCircularProgress
              size={100}
              width={8}
              fill={(item.value / item.max) * 70}
              tintColor="#0A2342"
              backgroundColor="#d9e1ec"
              rotation={-130}
              arcSweepAngle={260}
            >
              {(fill: number) => (
                <Text style={styles.cardValue}>
                  {item.value} {item.unit}
                </Text>
              )}
            </AnimatedCircularProgress>
          </View>
        ))}
      </ScrollView>

      {/* Tombol tambah */}
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 20,
    paddingBottom: 100,
  },
  card: {
    width: "47%",
    backgroundColor: "#f5f7fa",
    borderWidth: 3,
    borderColor: "#1E3E62",
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: "center",
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0A2342",
    marginBottom: 10,
    textAlign: "center",
  },
  cardValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0A2342",
    marginTop: 8,
  },
  addButton: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "#0A2342",
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
});
