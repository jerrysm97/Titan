import React from 'react';
import { StyleSheet, View } from 'react-native';
import ChatScreen from './src/screens/ChatScreen';

export default function App() {
  // Ideally you would have an Auth stack here (Login/Signup)
  // For now, we are directly rendering ChatScreen for demonstration of the core request.
  // Note: Firebase Auth needs to be signed in for the security rules mentioned to work.
  // You might want to add a temporary anonymous sign-in or a simple Login screen.

  return (
    <View style={styles.container}>
      <ChatScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
