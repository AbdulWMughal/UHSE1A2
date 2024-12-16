import {
  SafeAreaView,  // SafeAreaView to ensure proper padding for devices with notches or edges
  useSafeAreaInsets,  // Hook to get the safe area insets (top, bottom, etc.)
} from "react-native-safe-area-context";
import { getAuth } from "firebase/auth";  // Firebase function to get the current authenticated user
import {
  collection,  // Firestore function to get a reference to a collection
  getDocs,  // Firestore function to retrieve documents from a collection
  getFirestore,  // Firebase function to get Firestore instance
  query,  // Firestore function to create a query
  where,  // Firestore function to apply filtering conditions
} from "firebase/firestore";
import { useEffect, useState } from "react";  // React hooks for state and side effects
import { TextInput, Text } from "react-native-paper";  // Material UI components for input and text
import {
  FlatList,  // React Native component to render a list of items
  Keyboard,  // React Native API to manage the keyboard
  Pressable,  // Touchable component to handle user presses
  TouchableWithoutFeedback,  // Component to dismiss the keyboard when pressing outside
  View,  // Basic React Native component for layout
} from "react-native";
import { router } from "expo-router";  // Expo router to manage navigation between screens
import { FontAwesome } from "@expo/vector-icons";  // FontAwesome icons for UI elements

// SearchScreen component to allow users to search for other users by email
export default function SearchScreen() {
  const auth = getAuth();  // Get Firebase authentication instance
  const db = getFirestore();  // Get Firestore instance
  const { top } = useSafeAreaInsets();  // Get top safe area inset to adjust for device notches or status bars
  const [searchQuery, setSearchQuery] = useState("");  // State to hold the search query text
  const [users, setUsers] = useState<any[]>([]);  // State to hold the list of users fetched from Firestore

  // Function to fetch search results from Firestore based on search query
  const getSearchResults = async (text: string) => {
    text = text.toLowerCase();  // Normalize the query text to lowercase for case-insensitive search

    const usersRef = collection(db, "users");  // Get reference to the "users" collection in Firestore
    const q = query(
      usersRef,
      where("email", ">=", text),  // Filter users whose email starts with the search text
      where("email", "<=", text + "\uf8ff"),  // Ensure that emails are within the range of the search query
      where("email", "!=", auth.currentUser?.email)  // Exclude the current user's email from search results
    );
    const res = await getDocs(q);  // Execute the query to retrieve matching users from Firestore
    if (res) {
      let users: any[] = [];
      res.docs.forEach((doc) => users.push(doc.data()));  // Push the user data from the query results
      return users;  // Return the array of users
    }

    return [];  // Return an empty array if no users are found
  };

  // Effect hook to fetch users whenever the search query changes
  useEffect(() => {
    async function fetchUsers() {
      setUsers(await getSearchResults(searchQuery));  // Update the users state with the new search results
    }

    fetchUsers();  // Call the function to fetch users based on the current search query
  }, [searchQuery]);  // This effect runs every time the search query changes

  // Function to handle the submission of the search input when the user presses the return key
  const handleSubmit = async (text: string) => {
    setUsers(await getSearchResults(text));  // Update the users state with the search results for the submitted text
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: top }}>  {/* SafeAreaView ensures proper padding for notches */}
      <View
        style={{
          flexDirection: "row",  // Layout items horizontally
          alignItems: "center",  // Vertically align items in the center
          marginHorizontal: 10,  // Add horizontal margin for spacing
        }}
      >
        {/* Back button to navigate to the previous screen */}
        <Pressable
          style={{ paddingLeft: 10, marginRight: 15 }}
          onPress={() => router.back()}  // Go back to the previous screen when pressed
        >
          {({ pressed }) => (
            <FontAwesome
              name="chevron-left"  // FontAwesome left-chevron icon for navigation
              size={25}
              color={"white"}  // White color for the icon
              style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}  // Reduce opacity when pressed
            />
          )}
        </Pressable>

        {/* TextInput for the search query */}
        <TextInput
          mode={"outlined"}  // Outlined input field style
          returnKeyType="search"  // Show the "search" button on the keyboard
          placeholder="Search Users ..."  // Placeholder text for the search input
          autoFocus  // Focus the input field automatically when the screen loads
          dense  // Use a more compact version of the input field
          style={{ width: "75%" }}  // Set width of the input field
          onChangeText={setSearchQuery}  // Update the search query state when the text changes
          onSubmitEditing={async (e) => {
            await handleSubmit(e.nativeEvent.text);  // Handle the submission of the search query
          }}
        />
      </View>

      {/* Dismiss the keyboard when pressing outside */}
      <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        {/* Conditionally render based on whether there is a search query */}
        {searchQuery ? (
          <>
            {/* If there are no users matching the search query */}
            {users.length === 0 ? (
              <View
                style={{
                  flex: 0.75,  // Use 75% of the available vertical space
                  justifyContent: "center",  // Center the content vertically
                  alignItems: "center",  // Center the content horizontally
                }}
              >
                <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
                  No Users Found  {/* Display message when no users are found */}
                </Text>
              </View>
            ) : (
              <FlatList
                style={{ marginTop: 10 }}  // Add margin on top of the list
                data={users}  // Pass the list of users as data to the FlatList
                keyExtractor={(item) => item._id}  // Unique key for each list item (user)
                renderItem={({ item }) => (
                  <Pressable
                    style={{
                      flexDirection: "row",  // Layout items horizontally
                      justifyContent: "space-between",  // Space out the items
                      paddingVertical: 20,  // Add vertical padding to each list item
                      paddingHorizontal: 10,  // Add horizontal padding
                      borderBottomColor: "gray",  // Add a bottom border for visual separation
                      borderBottomWidth: 1,  // Set bottom border width
                    }}
                    onPress={() =>
                      router.navigate({
                        pathname: "/chat/[id]",  // Navigate to the chat screen
                        params: {
                          id: item._id,  // Pass the user ID to the chat screen
                          email: item.email,  // Pass the user's email to the chat screen
                        },
                      })
                    }
                  >
                    {/* Display the user's email in the list */}
                    <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
                      {item.email}
                    </Text>
                  </Pressable>
                )}
              />
            )}
          </>
        ) : (
          // Display a prompt if no search query has been entered
          <View
            style={{
              flex: 0.75,  // Use 75% of the vertical space
              justifyContent: "center",  // Center the content vertically
              alignItems: "center",  // Center the content horizontally
            }}
          >
            <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
              Search Users by Email  {/* Instructions to search for users */}
            </Text>
          </View>
        )}
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
