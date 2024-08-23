import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
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
  const [crop, setCrop] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const cropRef = doc(db, "crops", cropId);
    const unsubscribe = onSnapshot(cropRef, (doc) => {
      if (doc.exists()) {
        setMessages(doc.data().messages || []);
        setCrop(doc.data());
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
      setMessage("");
      try {
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
      <View style={styles.headerContainer}>
        <Text style={styles.heading}>Chat About Your Crop</Text>
        <Text style={styles.cropName}>{crop.cropName}</Text>
        <Text style={styles.cropDetails}>{crop.area} Acres</Text>
      </View>

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
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.timestamp.seconds * 1000).toLocaleTimeString()}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.messagesList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="#888"
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  headerContainer: {
    paddingTop: heightPercentageToDP("8%"),
    paddingBottom: heightPercentageToDP("2%"),
    paddingHorizontal: widthPercentageToDP("5%"),
    backgroundColor: "#65B741",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: heightPercentageToDP("2%"),
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
    marginBottom: heightPercentageToDP("2%"),
  },
  cropName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  cropDetails: {
    fontSize: 16,
    color: "#FFFBE6",
  },
  messagesList: {
    paddingHorizontal: widthPercentageToDP("4%"),
  },
  messageContainer: {
    marginBottom: 12,
    padding: 15,
    borderRadius: 10,
    maxWidth: "80%",
  },
  appMessage: {
    backgroundColor: "#65B741",
    alignSelf: "flex-end",
    borderBottomRightRadius: 0,
  },
  webMessage: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#65B741",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
    color: "#333",
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#DDD",
    backgroundColor: "#FFF",
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#DDD",
    backgroundColor: "#F9F9F9",
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#65B741",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  sendButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ChatScreen;
