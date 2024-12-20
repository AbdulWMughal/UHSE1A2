import { SafeAreaView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TextInput, Button, Text } from "react-native-paper";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { router } from "expo-router";
import { useState } from "react";

export default function RegisterScreen() {
  const { top } = useSafeAreaInsets();
  const [email, setEmail] = useState<string>("");  // Declare state variables for storing user input (email and password)
  const [password, setPassword] = useState<string>("");
  const auth = getAuth();  // Initialize Firebase authentication

  const registerUser = async () => {
    if (!email && !password)  // Validate email and password fields before proceeding
      return alert("Please enter an email and password.");
    if (!email) return alert("Please enter an email.");
    if (!password) return alert("Please enter a password.");

    createUserWithEmailAndPassword(auth, email, password) // Attempt to create a new user with email and password via Firebase authentication
      .then((userCredential) => {
        router.replace("/(app)/(tabs)/");
      })
      .catch((error) => {  // On failure, display the error message
        const errorMessage = error.message;
        alert(errorMessage);
      });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, paddingTop: top, justifyContent: "center" }}
    >
      <Text
        style={{ textAlign: "center", fontWeight: "bold", paddingBottom: 20 }}
        variant="titleLarge"
      >
        Create an Account
      </Text>

      <View style={{ marginHorizontal: 10 }}>
        <TextInput
          style={{ marginVertical: 5 }}
          mode="outlined"
          label={"Email"}
          autoComplete="email"
          placeholder="Email"
          keyboardType="email-address"
          textContentType="emailAddress"
          onChangeText={(text: string) => {
            setEmail(text);
          }}
        />
        <TextInput
          style={{ marginVertical: 5 }}
          mode="outlined"
          autoComplete="password"
          label={"Password"}
          placeholder="Password"
          secureTextEntry
          textContentType="password"
          onChangeText={(text: string) => {
            setPassword(text);
          }}
        />
        <Button
          mode="elevated"
          style={{ marginVertical: 40 }}
          onPress={registerUser}
        >
          Register
        </Button>
      </View>
    </SafeAreaView>
  );
}
