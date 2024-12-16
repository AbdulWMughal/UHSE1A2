import { Pressable, View } from "react-native";
import { useEffect, useState } from "react";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { Text } from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { getAuth } from "firebase/auth";
import {
  and,
  arrayUnion,
  collection,
  doc,
  getFirestore,
  onSnapshot,
  or,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { FontAwesome } from "@expo/vector-icons";

// Handles 
export default function ChatMessageScreen() {
  // State hooks to manage messages and conversation ID
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [conversationId, setConversationId] = useState<string>("");

   // Safe area insets for padding the UI correctly
  const { bottom, top } = useSafeAreaInsets();

  // Extract user ID and email from route parameters
  const { id, email } = useLocalSearchParams();
  
  // Get the current authenticated user
  const { currentUser } = getAuth();
  const db = getFirestore();

  // useEffect to listen for changes to the conversation in Firestore
  useEffect(() => {
     // Create a Firestore query to find conversations between the current user and the selected user (by ID)
    const q = query(
      // Check for conversations between the current user and the selected user (id)
      collection(db, "conversations"),
      or(
        and(where("u1._id", "==", currentUser?.uid), where("u2._id", "==", id)),
        and(where("u2._id", "==", currentUser?.uid), where("u1._id", "==", id))
      )
    );

    // Subscribe to changes in the conversation data from Firestore
    const unsubscribe = onSnapshot(q, (snap) => { // Subscribe to changes in the conversation data in Firestore
      if (snap?.docs && snap?.docs.length > 0) {
        // If conversation exists, set the conversation ID and update messages
        if (!conversationId) setConversationId(snap.docs[0].data()._id);
        setMessages([...snap.docs[0].data().messages]);
      }
    });

    // Cleanup subscription when the component is unmounted
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // Function to handle sending messages
  const onSend = async (messages: IMessage[]) => {
    // Backup previous messages before sending new ones
    const previousMessages = [...messages];

    try {
      // Get the conversation reference, create new one if none exists
      const conversationRef = conversationId
        ? doc(db, "conversations", conversationId)
        : doc(collection(db, "conversations"));

      // Get the first message in the array
      let message = messages[0];
      message.user = {
        _id: currentUser?.uid as string, // Set current user's ID
        name: currentUser?.email as string, // Set current user's email
      };

      const createdAt = Date.now(); // Timestamp for message creation

      message._id = message._id; // Assign message ID
      message.createdAt = createdAt;  // Assign creation timestamp

      // Update the chat UI with the new message
      setMessages((previousMessages: IMessage[]) =>
        GiftedChat.append(previousMessages, [message], false) // Update chat UI with the new message
      );

      // If no conversation ID exists, create a new conversation document
      if (!conversationId) {
        // create the conversation
        await setDoc(conversationRef, {
          u1: { _id: currentUser?.uid, email: currentUser?.email },
          u2: { _id: id, email },
          _id: conversationRef.id,
          messages: [message],
          createdAt,
          updatedAt: createdAt,
        });
        setConversationId(conversationRef.id); // Set the new conversation ID
      } else {
        // If conversation exists, update the existing document with the new message
        await updateDoc(conversationRef, {
          updatedAt: createdAt,
          messages: arrayUnion(message), // Add the new message to the array
        });
      }
    } catch (error) {
      alert("Unable to send message");
      setMessages(previousMessages);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: top }}>
      <View
        style={{
          flexDirection: "row", // Align items horizontally
          alignItems: "center",
          marginHorizontal: 10,
        }}
      >
        <Pressable
          style={{ paddingLeft: 10, marginRight: 15 }}
          onPress={() => router.back()} // Navigate back when back button is pressed
        >
          {({ pressed }) => (
            <FontAwesome
              name="chevron-left" // Left arrow icon for the back button
              size={25}
              color={"white"}
              style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
            />
          )}
        </Pressable>

        <Text
          style={{ marginLeft: 20 }}
          variant="titleMedium"
          ellipsizeMode="tail" // Display email with ellipsis if too long
        >
          {email} // Display the email of the selected user
        </Text>
      </View>

      <GiftedChat
        user={{
          _id: currentUser?.uid as string, // Set current user's ID
          name: currentUser?.email as string, // Set current user's email
        }}
        inverted={false} // Do not invert the message order
        messages={messages} // Display the current messages
        keyboardShouldPersistTaps={"handled"} // Ensure tapping outside the keyboard dismisses it
        alwaysShowSend // Always show the send button
        bottomOffset={bottom} // Ensure messages don't overlap with the keyboard
        renderAvatar={null} // Disable rendering user avatars
        onSend={onSend} // Attach the onSend function to handle sending messages
      />
    </SafeAreaView>
  );
}
