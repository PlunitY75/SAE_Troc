import React, { useContext } from 'react';
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import { ConversationsContext } from '../App';
import moment from 'moment';
import 'moment/locale/fr';

moment.locale('fr'); // Définit la langue en français

export default function MessagerieScreen({ navigation }) {
  const { conversations } = useContext(ConversationsContext);

  const renderConversation = ({ item }) => {
    const lastMessage = item.messages[item.messages.length - 1];
    const relativeTime = moment(lastMessage?.createdAt).fromNow();
    return (
      <TouchableOpacity
        style={styles.conversation}
        onPress={() => navigation.navigate('Conversation', { conversationId: item.id })}
      >
        <View style={styles.conversationHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{relativeTime || 'Aucun message'}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {lastMessage?.text || 'Aucun message'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messagerie</Text>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversation}
        style={styles.list}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f8',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
    color: '#333',
  },
  list: {
    marginTop: 10,
  },
  conversation: {
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'column',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0078fe',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  lastMessage: {
    fontSize: 15,
    color: '#555',
    marginTop: 5,
    fontStyle: 'italic',
  },
});
