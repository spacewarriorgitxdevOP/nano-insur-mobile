/**
 * P2 - Root App Component
 * Navigation setup + WebSocket connection in App-level
 * 4 screens: Uninsured → Protected → Claim → Approved
 */

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, StatusBar, StyleSheet, Text, View } from "react-native";

// Screens
import ApprovedScreen from "./screens/ApprovedScreen";
import ClaimScreen from "./screens/ClaimScreen";
import ProtectedScreen from "./screens/ProtectedScreen";
import UninsuredScreen from "./screens/UninsuredScreen";

// WebSocket
import CONFIG from "./config";
import wsService from "./services/websocket";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize WebSocket connection at app level
    console.log(`🚀 ${CONFIG.APP_NAME} v${CONFIG.VERSION}`);
    console.log(`📡 API: ${CONFIG.API_URL}`);
    console.log(`🔌 WS:  ${CONFIG.WS_URL}`);

    // Connect WebSocket
    wsService.connect();

    // Listen for connection status
    const unsubConnection = wsService.on("connection", (data) => {
      setIsConnected(data.status === "connected");
      setIsLoading(false);
    });

    // Log all events (for demo/debugging)
    const unsubAll = wsService.on("*", (message) => {
      console.log("📨 [App] WS:", message.event, message.data);
    });

    // Set loading to false after timeout even if WS fails
    const timeout = setTimeout(() => setIsLoading(false), 3000);

    return () => {
      clearTimeout(timeout);
      unsubConnection();
      unsubAll();
      wsService.disconnect();
    };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Connecting to server...</Text>
        <Text style={styles.loadingUrl}>{CONFIG.BASE_URL}</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Uninsured"
          screenOptions={{
            headerStyle: {
              backgroundColor: "#F9FAFB",
            },
            headerTintColor: "#111827",
            headerTitleStyle: {
              fontWeight: "700",
              fontSize: 18,
            },
            headerShadowVisible: false,
            headerRight: () => (
              <View
                style={[
                  styles.headerDot,
                  isConnected ? styles.connected : styles.disconnected,
                ]}
              />
            ),
          }}
        >
          <Stack.Screen
            name="Uninsured"
            component={UninsuredScreen}
            options={{
              title: "New Claim",
              headerLeft: () => <Text style={styles.headerEmoji}>🚨</Text>,
            }}
          />
          <Stack.Screen
            name="Protected"
            component={ProtectedScreen}
            options={{
              title: "Protected",
              headerLeft: () => <Text style={styles.headerEmoji}>🛡️</Text>,
            }}
          />
          <Stack.Screen
            name="Claim"
            component={ClaimScreen}
            options={{
              title: "Claim Status",
              headerLeft: () => <Text style={styles.headerEmoji}>📋</Text>,
            }}
          />
          <Stack.Screen
            name="Approved"
            component={ApprovedScreen}
            options={{
              title: "Result",
              headerLeft: () => <Text style={styles.headerEmoji}>🎉</Text>,
              headerBackVisible: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#374151",
    fontWeight: "600",
  },
  loadingUrl: {
    marginTop: 4,
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "monospace",
  },
  headerEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  headerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  connected: {
    backgroundColor: "#10B981",
  },
  disconnected: {
    backgroundColor: "#EF4444",
  },
});