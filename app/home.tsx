import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Linking, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Calendar } from "react-native-calendars";

const workouts = {
  Monday: "Chest",
  Tuesday: "Back",
  Wednesday: "Shoulders",
  Thursday: "Arms",
  Friday: "Legs",
  Saturday: "Abs",
  Sunday: "Rest Day 💤",
};

const today = new Date();
const todayName = today.toLocaleDateString("en-US", { weekday: "long" });
const todayDate = today.toISOString().split("T")[0]; // YYYY-MM-DD

export default function Home() {
  const router = useRouter();
  const [attendance, setAttendance] = useState<{ [key: string]: boolean }>({});
  const [markedDates, setMarkedDates] = useState<any>({});
  const [selectedDay, setSelectedDay] = useState<{ date: string; workout: string; attended: boolean } | null>(null);

  // Load attendance
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("attendance");
      if (saved) {
        const parsed = JSON.parse(saved);
        setAttendance(parsed);
        updateCalendar(parsed);
      }
    })();
  }, []);

  // Save & update calendar
  useEffect(() => {
    AsyncStorage.setItem("attendance", JSON.stringify(attendance));
    updateCalendar(attendance);
  }, [attendance]);

  const updateCalendar = (data: { [key: string]: boolean }) => {
    const marked: any = {};
    Object.keys(data).forEach((date) => {
      if (data[date]) {
        marked[date] = {
          marked: true,
          dotColor: "green",
          selected: true,
          selectedColor: "#28a745",
        };
      }
    });
    setMarkedDates(marked);
  };

  const handleAttendance = () => {
    if (workouts[todayName as keyof typeof workouts] === "Rest Day 💤") {
      Alert.alert("❌ Today is rest day, no attendance required!");
      return;
    }
    setAttendance((prev) => ({ ...prev, [todayDate]: true }));
    Alert.alert("✅ Attendance marked for today!");
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    router.replace("/login");
  };

  // Weekly progress
  const workoutDays = Object.values(workouts).filter((w) => w !== "Rest Day 💤").length;
  const completedDays = Object.keys(attendance).length;
  const progressPercent = Math.round((completedDays / workoutDays) * 100);

  // Handle day tap on calendar
  const onDayPress = (day: any) => {
    const date = new Date(day.dateString);
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
    const workout = workouts[weekday as keyof typeof workouts];
    const attended = !!attendance[day.dateString];
    setSelectedDay({ date: day.dateString, workout, attended });
  };
// 📊 Monthly summary calculation
const getMonthlySummary = (month: number, year: number) => {
  let totalWorkoutDays = 0;
  let attendedDays = 0;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
    const dateStr = date.toISOString().split("T")[0];

    if (workouts[weekday as keyof typeof workouts] !== "Rest Day 💤") {
      totalWorkoutDays++;
      if (attendance[dateStr]) attendedDays++;
    }
  }

  return { attendedDays, totalWorkoutDays };
};

const currentMonth = today.getMonth();
const currentYear = today.getFullYear();

// Current month
const { attendedDays, totalWorkoutDays } = getMonthlySummary(currentMonth, currentYear);
const monthlyPercent = totalWorkoutDays ? Math.round((attendedDays / totalWorkoutDays) * 100) : 0;

// Last month
const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
const { attendedDays: lastAttended, totalWorkoutDays: lastTotal } = getMonthlySummary(lastMonth, lastMonthYear);
const lastPercent = lastTotal ? Math.round((lastAttended / lastTotal) * 100) : 0;
const getBadge = (percent: number) => {
  if (percent >= 80) return "🏆";
  if (percent >= 50) return "👍";
  return "😓";
};


let progressColor = "#dc3545"; // red
if (monthlyPercent >= 80) {
  progressColor = "#28a745"; // green
} else if (monthlyPercent >= 50) {
  progressColor = "#fd7e14"; // orange
}
let progressBadge = "😓";
if (monthlyPercent >= 80) {
  progressBadge = "🏆";
} else if (monthlyPercent >= 50) {
  progressBadge = "👍";
}
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Greeting */}
        <Text style={styles.greeting}>👋 Welcome Back!</Text>
        <Text style={styles.today}>
          Today is <Text style={styles.bold}>{todayName}</Text> –{" "}
          <Text style={{ color: "#007bff" }}>{workouts[todayName as keyof typeof workouts]}</Text>
        </Text>

        {/* Attendance */}
        <TouchableOpacity
          style={[
            styles.attendanceButton,
            attendance[todayDate] && { backgroundColor: "#28a745" },
          ]}
          onPress={handleAttendance}
          disabled={attendance[todayDate]}
        >
          <Ionicons
            name={attendance[todayDate] ? "checkmark-done-outline" : "checkmark-circle-outline"}
            size={24}
            color="#fff"
          />
          <Text style={styles.attendanceText}>
            {attendance[todayDate] ? "Attendance Marked" : "Mark Attendance"}
          </Text>
        </TouchableOpacity>

        {/* Weekly Plan */}
        <Text style={styles.sectionTitle}>Weekly Workout Plan</Text>
        <View style={styles.card}>
          {Object.entries(workouts).map(([day, workout]) => (
            <View key={day} style={styles.row}>
              <Text style={styles.rowDay}>{day}</Text>
              <Text
                style={[
                  styles.rowWorkout,
                  workout === "Rest Day 💤" && { color: "red" },
                ]}
              >
                {workout}
              </Text>
            </View>
          ))}
        </View>

        {/* Progress Tracker */}
        <Text style={styles.sectionTitle}>Your Weekly Progress 🏆</Text>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {completedDays} / {workoutDays} workouts completed ({progressPercent}%)
        </Text>

  {/* 📅 Monthly Attendance */}
<Text style={styles.sectionTitle}>Monthly Attendance 📅</Text>

{/* Current vs Last Month Comparison */}
<View style={styles.comparisonContainer}>
  {/* Current Month */}
  <View style={styles.comparisonBox}>
    <Text style={styles.comparisonTitle}>This Month</Text>
    <Text style={{ color: progressColor, fontWeight: "600" }}>
      {monthlyPercent}% {progressBadge}
    </Text>
    <Text style={styles.comparisonText}>
      {attendedDays}/{totalWorkoutDays} days
    </Text>
    <View style={styles.monthProgressContainer}>
      <View style={[styles.monthProgressBar, { width: `${monthlyPercent}%`, backgroundColor: progressColor }]} />
    </View>
  </View>

  {/* Last Month */}
  <View style={styles.comparisonBox}>
    <Text style={styles.comparisonTitle}>Last Month</Text>
    <Text style={{ color: "#6c757d", fontWeight: "600" }}>
      {lastPercent}% {getBadge(lastPercent)}
    </Text>
    <Text style={styles.comparisonText}>
      {lastAttended}/{lastTotal} days
    </Text>
    <View style={styles.monthProgressContainer}>
      <View style={[styles.monthProgressBar, { width: `${lastPercent}%`, backgroundColor: "#6c757d" }]} />
    </View>
  </View>
</View>



<View style={styles.card}>
  <Calendar
    markedDates={{
      ...markedDates,
      [todayDate]: {
        selected: true,
        selectedColor: attendance[todayDate] ? "#28a745" : "#007bff",
        marked: !!attendance[todayDate],
        dotColor: attendance[todayDate] ? "green" : "blue",
      },
    }}
    onDayPress={onDayPress}
    theme={{
      todayTextColor: "#007bff",
      arrowColor: "#007bff",
    }}
  />
</View>

        {/* Selected Day Info */}
{selectedDay && (
  <View style={styles.infoCard}>
    <Text style={styles.infoTitle}>📌 {selectedDay.date}</Text>
    <Text style={styles.infoText}>Workout: {selectedDay.workout}</Text>

    {/* If rest day */}
    {selectedDay.workout === "Rest Day 💤" ? (
      <Text style={[styles.infoText, { color: "orange" }]}>
        🚫 Rest Day – No attendance needed
      </Text>
    ) : (
      <>
        {/* If future date */}
        {new Date(selectedDay.date) > new Date(todayDate) ? (
          <Text style={[styles.infoText, { color: "gray" }]}>
            🔒 You cannot mark attendance for future dates
          </Text>
        ) : selectedDay.attended ? (
          <>
            <Text style={[styles.infoText, { color: "green" }]}>
              ✅ Attendance already marked
            </Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => {
                setAttendance((prev) => {
                  const updated = { ...prev };
                  delete updated[selectedDay.date];
                  return updated;
                });
                setSelectedDay({ ...selectedDay, attended: false });
              }}
            >
              <Ionicons name="close-circle-outline" size={20} color="#fff" />
              <Text style={styles.removeButtonText}>Remove Attendance</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.markButton}
            onPress={() => {
              setAttendance((prev) => ({ ...prev, [selectedDay.date]: true }));
              setSelectedDay({ ...selectedDay, attended: true });
            }}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.markButtonText}>Mark Attendance</Text>
          </TouchableOpacity>
        )}
      </>
    )}
  </View>
)}

        {/* YouTube Help */}
        <Text style={styles.sectionTitle}>Workout Help 🎥</Text>
        <View style={{ gap: 12 }}>
          <TouchableOpacity
            style={styles.linkCard}
            onPress={() =>
              Linking.openURL("https://www.youtube.com/results?search_query=chest+workout+gym")
            }
          >
            <Ionicons name="logo-youtube" size={24} color="red" />
            <Text style={styles.linkText}>Chest Workout Videos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkCard}
            onPress={() =>
              Linking.openURL("https://www.youtube.com/results?search_query=leg+workout+gym")
            }
          >
            <Ionicons name="logo-youtube" size={24} color="red" />
            <Text style={styles.linkText}>Leg Workout Videos</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  greeting: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  today: { fontSize: 16, color: "#555", marginBottom: 20 },
  bold: { fontWeight: "600" },
  attendanceButton: {
    backgroundColor: "#007bff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  attendanceText: { color: "#fff", fontWeight: "600" },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  rowDay: { fontWeight: "500" },
  rowWorkout: { color: "#007bff" },
  progressContainer: {
    height: 20,
    backgroundColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#28a745",
  },
  progressText: { fontSize: 14, color: "#555", marginBottom: 24 },
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  linkText: { marginLeft: 8, fontWeight: "500" },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  infoTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  infoText: { fontSize: 14, marginBottom: 2 },
  logoutButton: {
    marginTop: 30,
    backgroundColor: "#dc3545",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  markButton: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  markButtonText: { color: "#fff", fontWeight: "600" },
  logoutText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  removeButton: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  removeButtonText: { color: "#fff", fontWeight: "600" },
  monthSummary: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#555",
  },
  monthProgressContainer: {
    height: 18,
    backgroundColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 6,
  },
  monthProgressBar: {
    height: "100%",
    backgroundColor: "#28a745",
  },
  progressPercent: {
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
    fontWeight: "500",
    textAlign: "right",
  },
  comparisonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },
  comparisonBox: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  comparisonTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  comparisonText: {
    fontSize: 12,
    color: "#555",
    marginBottom: 6,
  },
});