import { SafeAreaView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TextInput, Button, Text } from "react-native-paper";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { router } from "expo-router";
import { useState } from "react";

export default function LoginScreen() {
  const { top } = useSafeAreaInsets();  // Get the top safe area inset for adjusting the layout on devices with notches or other screen features
  const [email, setEmail] = useState<string>("");  // Define state variables to store email and password inputs
  const [password, setPassword] = useState<string>("");
  const auth = getAuth();

  // Function to handle user login
  const loginUser = async () => {
    if (!email && !password)
      return alert("Please enter an email and password.");
    if (!email) return alert("Please enter an email.");
    if (!password) return alert("Please enter a password.");

    signInWithEmailAndPassword(auth, email, password)  // Attempt to sign in with email and password using Firebase authentication
      .then((userCredential) => {
        router.replace("/(app)/(tabs)/");  // On success, navigate to the app's main page
      })
      .catch((error) => {
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
        Sign Into Your Account
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
          onPress={loginUser}
        >
          Login
        </Button>
      </View>
    </SafeAreaView>
  );
}
