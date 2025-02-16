import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { ConversationsContext } from '../App';

export default function ConversationScreen({ route }) {
  const { conversationId } = route.params;
  const { conversations, setConversations } = useContext(ConversationsContext);
  const conversation = conversations.find((c) => c.id === conversationId);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (newMessage.trim() === '') return;
    const updatedConversations = conversations.map((c) => {
      if (c.id === conversationId) {
        return {
          ...c,
          messages: [
            { id: Date.now().toString(), text: newMessage, sender: 'me', createdAt: new Date() },
            ...c.messages,
          ],
        };
      }
      return c;
    });
    setConversations(updatedConversations);
    setNewMessage('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90} // Ajustez selon la hauteur de votre header
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>{conversation.name}</Text>
      </View>
      <FlatList
        data={conversation.messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.message,
              item.sender === 'me' ? styles.myMessage : styles.otherMessage,
            ]}
          >
            <Text style={item.sender === 'me' ? styles.myMessageText : styles.otherMessageText}>
              {item.text}
            </Text>
          </View>
        )}
        style={styles.messageList}
        inverted
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Écrire un message..."
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  header: {
    backgroundColor: '#47b089',
    padding: 15,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  message: {
    padding: 15,
    marginVertical: 8,
    borderRadius: 20,
    maxWidth: '75%',
    alignSelf: 'flex-start',
  },
  myMessage: {
    backgroundColor: '#47b089',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#e4e6eb',
  },
  myMessageText: {
    color: '#fff',
    fontSize: 16,
  },
  otherMessageText: {
    color: '#000',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
    backgroundColor: '#f9f9f9',
    width: Platform.OS === 'web' ? '20%' : '100%',
  },
  sendButton: {
    backgroundColor: '#47b089',
    marginLeft: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    justifyContent: 'center',
    width: Platform.OS === 'web' ? '20%' : '100%',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
