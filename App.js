cat > App.js << 'EOF'
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ApprovedScreen from "./screens/ApprovedScreen";
import ClaimScreen from "./screens/ClaimScreen";
import ProtectedScreen from "./screens/ProtectedScreen";
import UninsuredScreen from "./screens/UninsuredScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Uninsured"
        screenOptions={{
          headerStyle: { backgroundColor: "#1a73e8" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen
          name="Uninsured"
          component={UninsuredScreen}
          options={{ title: "Upload Documents" }}
        />
        <Stack.Screen
          name="Protected"
          component={ProtectedScreen}
          options={{ title: "Processing Claim" }}
        />
        <Stack.Screen
          name="Claim"
          component={ClaimScreen}
          options={{ title: "Claim Details" }}
        />
        <Stack.Screen
          name="Approved"
          component={ApprovedScreen}
          options={{ title: "Claim Result" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
EOF