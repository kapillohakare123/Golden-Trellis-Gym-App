import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const user = await AsyncStorage.getItem("user");
        setTimeout(() => {
          if (user) {
            router.replace("/home"); // already logged in → go to Home
          } else {
            router.replace("/login"); // not logged in → go to Login
          }
        }, 2000); // 2s splash delay
      } catch (error) {
        console.log("Error checking login:", error);
        router.replace("/login");
      }
    };
    checkLogin();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: "https://img.icons8.com/color/96/dumbbell.png" }}
        style={{ width: 100, height: 100, marginBottom: 20 }}
      />
      <Text style={styles.title}>🏋️ Society Gym</Text>
      <Text style={styles.subtitle}>Get fit, stay strong 💪</Text>
      <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 30 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
});