import {
  SafeAreaView,  // SafeAreaView to ensure proper padding based on device's safe areas
  useSafeAreaInsets,  // Hook to access the safe area insets (top, bottom, left, right)
} from "react-native-safe-area-context";
import { router } from "expo-router";  // Router to navigate between screens
import {
  collection,  // Firestore function to get a collection reference
  getFirestore,  // Function to get Firestore database instance
  onSnapshot,  // Function to subscribe to real-time updates from Firestore
  or,  // Logical OR function used in Firestore queries
  query,  // Function to create Firestore queries
  where,  // Function to apply conditional filters in Firestore queries
} from "firebase/firestore";
import { FlatList, Pressable, View } from "react-native";  // Basic React Native components
import { useState, useEffect } from "react";  // React hooks for state and side effects
import { Text, Button } from "react-native-paper";  // Material UI components for styling
import { FontAwesome } from "@expo/vector-icons";  // FontAwesome icons for UI
import { getAuth } from "firebase/auth";  // Firebase Auth to get the current authenticated user

// HomeScreen component to display the user's conversations and manage navigation
export default function HomeScreen() {
  const db = getFirestore();  // Get Firestore instance to interact with the database
  const { top } = useSafeAreaInsets();  // Get the top safe area inset for padding
  const { currentUser } = getAuth();  // Get the current authenticated user

  // State to store the list of conversations fetched from Firestore
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {  // useEffect hook to fetch conversations when the component mounts
    if (!currentUser) return;  // If no user is authenticated, exit early

    // Firestore query to fetch conversations where the current user is either u1 or u2
    const q = query(
      collection(db, "conversations"),
      or(
        where("u1._id", "==", currentUser?.uid),  // Check if the current user is u1
        where("u2._id", "==", currentUser?.uid)   // Check if the current user is u2
      )
    );

    // Subscribe to real-time updates for the conversation data from Firestore
    const unsubscribe = onSnapshot(q, (snap) => {
      const convos: any[] = [];
      snap.forEach((doc) => convos.push(doc.data()));  // Push each document's data into the convos array
      setConversations(convos);  // Update the state with the fetched conversations
    });

    return () => unsubscribe();  // Cleanup the listener when the component unmounts
  }, []);  // Empty dependency array ensures this effect runs only once

  // Function to navigate to the chat search screen for starting a new chat
  const createChat = () => router.push("/chat/search");

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: top }}>  {/* SafeAreaView ensures proper padding on top */}
      <View style={{ alignItems: "flex-end" }}>  {/* Align the new chat button to the right */}
        <Pressable
          onPress={createChat}  // Navigate to the chat search screen on press
          style={{
            flexDirection: "row",  // Layout items in a row
            padding: 10,  // Add padding around the icon
          }}
        >
          <FontAwesome name="pencil-square-o" size={26} color={"white"} />  {/* Pencil icon for creating a new chat */}
        </Pressable>
      </View>
      <Text
        variant="headlineLarge"
        style={{ fontWeight: "bold", marginLeft: 10 }}
      >
        Messages  {/* Title for the message list */}
      </Text>

      {/* Conditional rendering: Display conversations if there are any, otherwise show the empty state */}
      {conversations.length > 0 ? (
        <View style={{ marginTop: 10, flex: 1 }}>
          <FlatList
            keyExtractor={(item: any) => item._id}  {/* Unique key for each conversation */}
            data={conversations}  {/* Pass the conversations data */}
            renderItem={({ item }) => {  {/* Render each conversation item */}
              const oppositeUser =
                item.u1._id === currentUser?.uid ? item.u2 : item.u1;  // Determine the opposite user
              return (
                <Pressable
                  onPress={() =>
                    router.navigate({  // Navigate to the chat with the selected user
                      pathname: "/chat/[id]",
                      params: {
                        id: oppositeUser._id,  // Pass the opposite user's ID
                        email: oppositeUser.email,  // Pass the opposite user's email
                      },
                    })
                  }
                  style={{
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                    borderTopColor: "gray",  // Border styling
                    borderBottomColor: "gray",
                    borderBottomWidth: 1,
                    borderTopWidth: 1,
                    height: 100,  // Set the height of each conversation item
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",  // Layout items horizontally
                      alignItems: "center",  // Vertically center align
                      justifyContent: "space-between",  // Space out elements evenly
                    }}
                  >
                    <Text
                      ellipsizeMode="tail"  // Truncate text if too long
                      variant="titleLarge"
                      style={{ fontWeight: "bold" }}
                    >
                      {oppositeUser.email}  {/* Display the email of the opposite user */}
                    </Text>
                    <Text variant="titleMedium">
                      {new Date(
                        item.messages[item.messages.length - 1].createdAt  // Display the last message's date
                      ).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text
                    variant="bodySmall"
                    style={{ paddingTop: 10 }}
                    numberOfLines={2}  // Limit the preview of the message to 2 lines
                    ellipsizeMode="tail"  // Truncate text if it overflows
                  >
                    {item.messages[item.messages.length - 1].text}  {/* Display the last message text */}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}  // Center align the empty state
        >
          <Text
            variant="titleMedium"
            style={{ fontWeight: "bold", paddingBottom: 20 }}
          >
            You have no messages
          </Text>
          <Button mode="elevated" onPress={createChat}>
            Send Message
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}
