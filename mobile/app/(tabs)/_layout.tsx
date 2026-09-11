import { Tabs } from "expo-router";
import { Text } from "react-native";
import { colors } from "../../lib/theme";

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 18 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.brand,
        headerTintColor: colors.brand,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Browse", tabBarIcon: () => <TabIcon emoji="🏠" /> }}
      />
      <Tabs.Screen
        name="requests"
        options={{ title: "Looking For", tabBarIcon: () => <TabIcon emoji="🔎" /> }}
      />
      <Tabs.Screen
        name="chat"
        options={{ title: "Assistant", tabBarIcon: () => <TabIcon emoji="💬" /> }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: "Account", tabBarIcon: () => <TabIcon emoji="👤" /> }}
      />
    </Tabs>
  );
}
