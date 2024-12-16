import { View } from "react-native";  // Import View component from React Native for layout
import { getAuth, signOut } from "firebase/auth";  // Import Firebase authentication functions for signing out
import { Button, Text } from "react-native-paper";  // Import Button and Text components from React Native Paper for UI elements

export default function SettingsScreen() {
  const auth = getAuth();  // Get the Firebase authentication instance

  // Function to handle user sign out
  const logoutUser = () => {
    signOut(auth);  // Call Firebase's signOut method to log the user out
  };

  return (
    <View
      style={{
        flex: 1,  // Make the view take up the full screen
        alignItems: "center",  // Center the content horizontally
        justifyContent: "center",  // Center the content vertically
      }}
    >
      {/* Display the title "Your Account" */}
      <Text
        style={{ fontWeight: "bold", paddingBottom: 20 }}  // Style the title with bold text and some padding
        variant="titleLarge"  // Use a large text style variant
      >
        Your Account
      </Text>

      {/* Display the current user's email */}
      <Text>{auth.currentUser?.email}</Text>  // Dynamically display the logged-in user's email

      {/* Button to sign out the user */}
      <Button
        mode="contained"  // The button has a filled appearance
        style={{ marginTop: 20 }}  // Add margin at the top of the button for spacing
        onPress={logoutUser}  // Call logoutUser function when the button is pressed
      >
        Sign Out  {/* Button label */}
      </Button>
    </View>
  );
}
