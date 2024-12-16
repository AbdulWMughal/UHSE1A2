import React, { useState } from "react";  // Import React and useState hook
import FontAwesome from "@expo/vector-icons/FontAwesome";  // Import FontAwesome icon library
import { Link, Tabs, router } from "expo-router";  // Import components for routing and navigation
import { Pressable } from "react-native";  // Import Pressable component for touch handling
import { getAuth } from "firebase/auth";  // Import Firebase authentication to handle user state
import { getApp } from "firebase/app";  // Import Firebase app initialization
import { doc, getFirestore, setDoc } from "firebase/firestore";  // Firestore functions for interacting with the database
import { Text } from "react-native-paper";  // Import Text component from React Native Paper for UI text

import Colors from "@/constants/Colors";  // Import color constants for theme-based styling
import { useColorScheme } from "@/components/useColorScheme";  // Custom hook to get the current color scheme (light/dark mode)
import { useClientOnlyValue } from "@/components/useClientOnlyValue";  // Custom hook to handle values that only exist on the client-side

// TabBarIcon component renders a FontAwesome icon with a custom style
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];  // Type the 'name' prop as a FontAwesome icon name
  color: string;  // Color for the icon
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;  // Return the FontAwesome icon with passed props
}

export default function TabLayout() {
  const colorScheme = useColorScheme();  // Get the current color scheme (light or dark mode)
  const [isLoading, setIsLoading] = useState(true);  // State to track if the app is loading the user data
  const app = getApp();  // Initialize the Firebase app
  const db = getFirestore();  // Get Firestore instance for database operations

  // Firebase auth state listener to track authentication changes
  getAuth(app).onAuthStateChanged((user) => {
    setIsLoading(false);  // Set loading state to false when authentication state is determined

    if (user) {
      // If the user is logged in, store user details in Firestore under the 'users' collection
      setDoc(
        doc(db, "users", user.uid),  // Reference to the user's document by their UID
        {
          _id: user.uid,  // Store user's UID
          email: user.email,  // Store user's email
        },
        { merge: true }  // Merge with any existing data
      );
    } else {
      // If no user is logged in, navigate to the "landing" screen
      router.replace("/landing");
    }
  });

  if (isLoading) return <Text style={{ paddingTop: 10 }}>Loading...</Text>;  // Show loading message until auth state is resolved

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,  // Set active tab color based on current color scheme
        // Disable static header rendering on web to avoid hydration issues with React Navigation v6
        headerShown: useClientOnlyValue(false, true),  // Only show header on the client-side
      }}
    >
      {/* "Messages" tab */}
      <Tabs.Screen
        name="index"  // Screen name for routing
        options={{
          title: "Messages",  // Title displayed in the tab
          headerShown: false,  // Hide header for this tab screen
          tabBarIcon: ({ color }) => (  // Define tab icon
            <TabBarIcon name="envelope" color={color} />  // Envelope icon for messages
          ),
        }}
      />
      {/* "Settings" tab */}
      <Tabs.Screen
        name="settings"  // Screen name for routing
        options={{
          title: "Settings",  // Title displayed in the tab
          tabBarIcon: ({ color }) => <TabBarIcon name="gear" color={color} />,  // Gear icon for settings
        }}
      />
    </Tabs>
  );
}
