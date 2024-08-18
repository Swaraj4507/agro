import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { db } from "../../lib/fire"; // Ensure you have the Firebase config here
import { doc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";
import { useLocalSearchParams } from "expo-router";
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from "react-native-responsive-screen";

const ChatScreen = () => {
  const { cropId } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const cropRef = doc(db, "crops", cropId);
    const unsubscribe = onSnapshot(cropRef, (doc) => {
      if (doc.exists()) {
        setMessages(doc.data().messages || []);
      }
    });

    return () => unsubscribe();
  }, [cropId]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      const messageData = {
        text: message,
        timestamp: new Date(),
        sender: "app", // or "web" depending on who is sending
      };

      try {
        setMessage("");
        const cropRef = doc(db, "crops", cropId);
        await updateDoc(cropRef, {
          messages: arrayUnion(messageData),
        });
      } catch (error) {
        console.error("Error sending message: ", error);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.container}>
        <FlatList
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageContainer,
                item.sender === "app" ? styles.appMessage : styles.webMessage,
              ]}
            >
              <Text style={styles.messageText}>
                {item.sender}: {item.text}
              </Text>
              <Text style={styles.timestamp}>
                {new Date(item.timestamp.seconds * 1000).toLocaleString()}
              </Text>
            </View>
          )}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message"
            value={message}
            onChangeText={setMessage}
          />
          <Button title="Send" onPress={handleSendMessage} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: heightPercentageToDP("3%"),
    backgroundColor: "#fff",
  },
  messageContainer: { marginBottom: 10, padding: 10, borderRadius: 5 },
  appMessage: { backgroundColor: "#d1e7dd" },
  webMessage: { backgroundColor: "#cfe2ff" },
  messageText: { fontSize: 16 },
  timestamp: { fontSize: 10, color: "gray", marginTop: 5 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 1,
    marginBottom: heightPercentageToDP("2%"),
    marginHorizontal: widthPercentageToDP("3%"),
  },
  input: {
    flex: 1,
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginRight: 10,
  },
});

export default ChatScreen;
