import "react-native-gesture-handler";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../lib/auth-context";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerTintColor: "#0f6b5c" }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="listing/[id]" options={{ title: "Property" }} />
            <Stack.Screen name="post-property" options={{ title: "Post a Property" }} />
            <Stack.Screen name="post-request" options={{ title: "Looking For" }} />
            <Stack.Screen name="sign-in" options={{ title: "Sign In", presentation: "modal" }} />
            <Stack.Screen name="admin/index" options={{ title: "Admin" }} />
            <Stack.Screen name="admin/inquiries" options={{ title: "Inquiries" }} />
            <Stack.Screen name="admin/properties/[id]" options={{ title: "Review Property" }} />
            <Stack.Screen name="admin/requests/[id]" options={{ title: "Review Request" }} />
          </Stack>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
