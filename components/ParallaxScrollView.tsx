// components/ParallaxScrollView.tsx
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

interface ParallaxScrollViewProps {
  headerBackgroundColor?: { light: string; dark: string };
  headerImage?: React.ReactNode;
  children: React.ReactNode;
}

export default function ParallaxScrollView(props: ParallaxScrollViewProps) {
  const { headerBackgroundColor, headerImage, children } = props;

  // Aman untuk Drawer atau Bottom Tabs
  let tabBarHeight = 0;
  try {
    tabBarHeight = useBottomTabBarHeight();
  } catch (e) {
    tabBarHeight = 0; // kalau tidak ada Bottom Tab, set 0
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingBottom: tabBarHeight },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {headerImage && (
        <View
          style={[
            styles.header,
            { backgroundColor: headerBackgroundColor?.light || "#fff" },
          ]}
        >
          {headerImage}
        </View>
      )}
      <View style={styles.content}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  header: {
    width: "100%",
    height: 200,
    position: "relative",
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
