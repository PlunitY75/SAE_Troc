import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList, Image } from 'react-native';
import { firestore, auth } from '../Firebase';
import { getDatabase, ref, get } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';

export default function ConvTestScreen({ route }) {
    const { conversationId } = route.params;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sellerName, setSellerName] = useState('');
    const [user, setUser] = useState(null);
    const [annonce, setAnnonce] = useState(null);
    const [userAnnonces, setUserAnnonces] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [isBuyer, setIsBuyer] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                fetchConversationData(currentUser.uid);
                fetchUserAnnonces(currentUser.uid);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user && conversationId) {
            const unsubscribe = firestore
                .collection('conversations')
                .doc(conversationId)
                .collection('messages')
                .orderBy('createdAt')
                .onSnapshot(snapshot => {
                    const msgs = snapshot.docs.map(doc => doc.data());
                    setMessages(msgs);
                });

            return () => unsubscribe();
        }
    }, [user, conversationId]);

    const fetchConversationData = async (userId) => {
        const conversationDoc = await firestore.collection('conversations').doc(conversationId).get();
        const data = conversationDoc.data();

        setAnnonce({
            id: data.annonceId,
            transactionType: data.transactionType,
        });

        setIsBuyer(data.participants.includes(userId));

        const sellerId = data.participants.find(id => id !== userId);
        if (sellerId) {
            const db = getDatabase();
            const sellerRef = ref(db, `users/${sellerId}/name`);
            const sellerSnapshot = await get(sellerRef);

            if (sellerSnapshot.exists()) {
                setSellerName(sellerSnapshot.val());
            }
        }
    };

    const fetchUserAnnonces = async (userId) => {
        const db = getDatabase();
        const userAnnoncesRef = ref(db, `annonces`);
        const snapshot = await get(userAnnoncesRef);

        if (snapshot.exists()) {
            const allAnnonces = Object.keys(snapshot.val()).map((id) => ({
                id,
                ...snapshot.val()[id],
            }));

            const filteredAnnonces = allAnnonces.filter((a) => a.userId === userId);
            setUserAnnonces(filteredAnnonces);
        }
    };

    const sendMessage = async () => {
        if (user && newMessage.trim()) {
            await firestore.collection('conversations')
                .doc(conversationId)
                .collection('messages')
                .add({
                    senderId: user.uid,
                    message: newMessage,
                    createdAt: new Date(),
                });
            setNewMessage('');
        }
    };

    const handleProposeTrade = () => {
        setModalVisible(true);
    };

    const sendTradeProposal = async (selectedAnnonce) => {
        setModalVisible(false);

        await firestore.collection('conversations')
            .doc(conversationId)
            .collection('messages')
            .add({
                senderId: user.uid,
                message: "Je propose cet article en échange",
                tradeOffer: selectedAnnonce,
                createdAt: new Date(),
            });
    };

    return (
        <View style={styles.container}>
            {sellerName && (
                <View style={styles.sellerInfoContainer}>
                    <Text style={styles.sellerInfoText}>Vendeur : {sellerName || "Nom introuvable"}</Text>
                </View>
            )}

            <ScrollView style={styles.messageContainer}>
                {messages.map((msg, index) => (
                    <View key={index} style={msg.senderId === user?.uid ? styles.userMessage : styles.sellerMessage}>
                        {msg.tradeOffer ? (
                            <TouchableOpacity
                                style={styles.tradeOfferContainer}
                                onPress={() => navigation.navigate('AffichageProduitTrocScreen', { annonce: msg.tradeOffer })}
                            >
                                <Image source={{ uri: `data:image/png;base64,${msg.tradeOffer.photos[0]}` }} style={styles.tradeImage} />
                                <Text style={styles.tradeText}>{msg.tradeOffer.objet}</Text>
                                <Text style={styles.tradePrice}>{msg.tradeOffer.prix ? `${msg.tradeOffer.prix}€` : 'Troc'}</Text>
                            </TouchableOpacity>
                        ) : (
                            <Text style={styles.messageText}>{msg.message}</Text>
                        )}
                    </View>
                ))}
            </ScrollView>

            <TextInput 
                value={newMessage} 
                onChangeText={setNewMessage} 
                placeholder="Écrivez un message..." 
                style={styles.textInput} 
            />

            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                <Text style={styles.sendButtonText}>Envoyer</Text>
            </TouchableOpacity>

            {isBuyer && annonce?.transactionType === "Troc" && (
                <TouchableOpacity onPress={handleProposeTrade} style={styles.tradeButton}>
                    <Text style={styles.tradeButtonText}>💱 Proposer un échange</Text>
                </TouchableOpacity>
            )}

            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Sélectionnez une annonce :</Text>
                    <FlatList
                        data={userAnnonces}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.annonceItem}
                                onPress={() => sendTradeProposal(item)}
                            >
                                <Image source={{ uri: `data:image/png;base64,${item.photos[0]}` }} style={styles.tradeImage} />
                                <Text style={styles.annonceText}>{item.objet}</Text>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item.id}
                    />
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeModalButton}>
                        <Text style={styles.closeModalButtonText}>Fermer</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f7f7f7', padding: 20 },
    sellerInfoContainer: { marginBottom: 10, padding: 10, backgroundColor: '#e1f5fe', borderRadius: 5 },
    sellerInfoText: { fontSize: 18, fontWeight: 'bold', color: '#0077b6' },
    messageContainer: { flex: 1, marginBottom: 20 },
    userMessage: { alignSelf: 'flex-end', backgroundColor: '#47b089', borderRadius: 10, padding: 10, marginBottom: 10, maxWidth: '75%' },
    sellerMessage: { alignSelf: 'flex-start', backgroundColor: '#e0e0e0', borderRadius: 10, padding: 10, marginBottom: 10, maxWidth: '75%' },
    tradeOfferContainer: { backgroundColor: '#f39c12', padding: 10, borderRadius: 10, marginVertical: 5, alignItems: 'center' },
    tradeImage: { width: 80, height: 80, borderRadius: 5, marginBottom: 5 },
    tradeText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
    tradePrice: { fontSize: 14, color: '#ddd' },
    textInput: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginBottom: 10 },
    sendButton: { backgroundColor: '#47b089', padding: 12, borderRadius: 30, alignItems: 'center' },
    sendButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    tradeButton: { backgroundColor: '#f39c12', padding: 12, borderRadius: 30, alignItems: 'center', marginTop: 10 },
    tradeButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
