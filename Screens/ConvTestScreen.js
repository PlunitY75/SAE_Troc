import React, { useEffect, useState } from 'react';
import {View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Platform, Modal, FlatList, Image } from 'react-native';
import { firestore, auth } from '../Firebase';
import { getDatabase, ref, get, update } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';

export default function ConvTestScreen({ route }) {
    const { conversationId } = route.params;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sellerInfo, setSellerInfo] = useState(null);
    const [user, setUser] = useState(null);
    const [annonceId, setAnnonceId] = useState(null);
    const [transactionType, setTransactionType] = useState(null);
    const [sellerName, setSellerName] = useState('');
    const [isBuyer, setIsBuyer] = useState(false);
    const [isSeller, setIsSeller] = useState(false);
    const [readyToBuy, setReadyToBuy] = useState(false);
    const [saleCompleted, setSaleCompleted] = useState(false);
    const [userAnnonces, setUserAnnonces] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [tradeOfferReceived, setTradeOfferReceived] = useState(false);
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

                    // Vérifie si un échange a été proposé au vendeur
                    const hasTradeOffer = msgs.some(msg => msg.tradeOffer && msg.senderId !== user.uid);
                    setTradeOfferReceived(hasTradeOffer);
                });

            return () => unsubscribe();
        }
    }, [user, conversationId]);

    const fetchConversationData = async (userId) => {
        const conversationDoc = await firestore.collection('conversations').doc(conversationId).get();
        const data = conversationDoc.data();
        setAnnonceId(data?.annonceId);
        setReadyToBuy(data?.readyToBuy || false);

        const participants = data?.participants || [];
        setIsSeller(participants[0] === userId);
        setIsBuyer(!isSeller);

        const sellerId = participants.find(id => id !== userId);
        if (sellerId) {
            const db = getDatabase();
            const sellerRef = ref(db, `users/${sellerId}/name`);
            const sellerSnapshot = await get(sellerRef);
            if (sellerSnapshot.exists()) {
                setSellerName(sellerSnapshot.val());
            }
        }

        if (data?.annonceId) {
            const db = getDatabase();
            const annonceRef = ref(db, `annonces/${data.annonceId}/transactionType`);
            const annonceSnapshot = await get(annonceRef);
            if (annonceSnapshot.exists()) {
                setTransactionType(annonceSnapshot.val());
            }
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

    const handlePay = async () => {
        if (isBuyer) {
            await firestore.collection('conversations')
                .doc(conversationId)
                .update({ readyToBuy: true });

            await firestore.collection('conversations')
                .doc(conversationId)
                .collection('messages')
                .add({
                    senderId: user.uid,
                    message: "Le client accepte l'offre",
                    createdAt: new Date(),
                });
        }
    };

    const handleAccept = async () => {
        if (isSeller) {
            await firestore.collection('conversations')
                .doc(conversationId)
                .collection('messages')
                .add({
                    senderId: user.uid,
                    message: "Le vendeur accepte l'offre",
                    createdAt: new Date(),
                });

            setSaleCompleted(true);

            await firestore.collection('conversations')
                .doc(conversationId)
                .collection('messages')
                .add({
                    senderId: user.uid,
                    message: "Vente effectuée",
                    createdAt: new Date(),
                });

            const db = getDatabase();
            const annonceRef = ref(db, `annonces/${annonceId}`);
            const annonceSnapshot = await get(annonceRef);
            if (annonceSnapshot.exists()) {
                await update(annonceRef, { notAvailable: true });
            }
        }
    };
    

    const handleAcceptTrade = async () => {
        if (isSeller) {
            await firestore.collection('conversations')
                .doc(conversationId)
                .collection('messages')
                .add({
                    senderId: user.uid,
                    message: "Le vendeur accepte l'échange",
                    createdAt: new Date(),
                });
    
            // Marquer l'annonce comme non disponible après l'échange
            const db = getDatabase();
            const annonceRef = ref(db, `annonces/${annonceId}`);
            const annonceSnapshot = await get(annonceRef);
            if (annonceSnapshot.exists()) {
                await update(annonceRef, { notAvailable: true });
            }
    
            setSaleCompleted(true);
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
            {sellerInfo && (
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

                {saleCompleted && (
                    <View style={styles.saleMessageContainer}>
                        <Text style={styles.saleMessageText}>Vente effectuée</Text>
                    </View>
                )}
            </ScrollView>

            <View style={{alignItems: Platform.OS === 'web' ? 'center' : 'none'}}>
                <TextInput
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Écrivez un message..."
                    style={styles.textInput}
                />
                <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                    <Text style={styles.sendButtonText}>Envoyer</Text>
                </TouchableOpacity>

                {transactionType === "Troc" && (
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
                
                {transactionType === "Troc" && isSeller && tradeOfferReceived && (
                    <TouchableOpacity onPress={handleAcceptTrade} style={styles.acceptTradeButton}>
                        <Text style={styles.acceptTradeButtonText}>Accepter l'échange</Text>
                    </TouchableOpacity>
                )}


                {transactionType !== "Troc" && isBuyer && !readyToBuy && (
                    <TouchableOpacity onPress={handlePay} style={styles.payButton}>
                        <Text style={styles.payButtonText}>Payer</Text>
                    </TouchableOpacity>
                )}

                {transactionType !== "Troc" && isSeller && readyToBuy && (
                    <TouchableOpacity onPress={handleAccept} style={styles.acceptButton}>
                        <Text style={styles.acceptButtonText}>Accepter</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f7f7f7', padding: 20 },
    sellerInfoContainer: { marginBottom: 20 },
    sellerInfoText: { fontSize: 18, fontWeight: 'bold', color: '#2e7d32' },
    messageContainer: { flex: 1, marginBottom: 20 },
    userMessage: { alignSelf: 'flex-end', backgroundColor: '#47b089', borderRadius: 10, padding: 10, marginBottom: 10 },
    sellerMessage: { alignSelf: 'flex-start', backgroundColor: '#e0e0e0', borderRadius: 10, padding: 10, marginBottom: 10 },
    userText: { color: '#fff', fontSize: 16 },
    sellerText: { color: '#333', fontSize: 16 },
    textInput: { borderWidth: 1, borderColor: '#47b089', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginBottom: 10, backgroundColor: '#fff' },
    sendButton: { backgroundColor: '#47b089', paddingVertical: 12, borderRadius: 30, alignItems: 'center' },
    sendButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    tradeButton: { backgroundColor: '#f39c12', paddingVertical: 12, borderRadius: 30, alignItems: 'center', marginTop: 10 },
    tradeButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    payButton: { backgroundColor: '#47b089', paddingVertical: 12, borderRadius: 30, alignItems: 'center', marginTop: 10 },
    payButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    acceptButton: { backgroundColor: '#8bc34a', paddingVertical: 12, borderRadius: 30, alignItems: 'center', marginTop: 10 },
    acceptButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    saleMessageContainer: { alignItems: 'center', marginTop: 20 },
    saleMessageText: { fontSize: 24, fontWeight: 'bold', color: '#4CAF50' },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#fff' },
    annonceItem: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginVertical: 10, alignItems: 'center' },
    annonceText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    tradeImage: { width: 100, height: 100, borderRadius: 10, marginBottom: 10 },
    closeModalButton: { backgroundColor: '#d9534f', padding: 12, borderRadius: 30, alignItems: 'center', marginTop: 10 },
    closeModalButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

