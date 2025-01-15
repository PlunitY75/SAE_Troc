import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { firestore, auth } from '../Firebase';  // Assurez-vous d'importer Firebase et auth correctement
import { getDatabase, ref, get, update } from 'firebase/database';  // Importer les méthodes de Realtime Database

export default function ConvTestScreen({ route }) {
    const { conversationId } = route.params;  // Récupérer l'ID de la conversation
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sellerInfo, setSellerInfo] = useState(null);  // Informations du vendeur
    const [user, setUser] = useState(null);
    const [annonceId, setAnnonceId] = useState(null);  // Pour stocker l'ID de l'annonce
    const [sellerName, setSellerName] = useState(''); // Nom du vendeur
    const [isBuyer, setIsBuyer] = useState(false);  // Identifier si l'utilisateur est l'acheteur
    const [isSeller, setIsSeller] = useState(false); // Identifier si l'utilisateur est le vendeur
    const [readyToBuy, setReadyToBuy] = useState(false); // Indicateur si l'acheteur a accepté l'offre
    const [saleCompleted, setSaleCompleted] = useState(false); // Indicateur pour la vente effectuée

    useEffect(() => {
        // Vérification de l'utilisateur authentifié
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                fetchSellerInfo(currentUser.uid);
            }
        });

        // Nettoyage à la fermeture du composant
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user && conversationId) {
            // Récupérer les messages de la conversation
            const unsubscribe = firestore
                .collection('conversations')
                .doc(conversationId)
                .collection('messages')
                .orderBy('createdAt')
                .onSnapshot(snapshot => {
                    const msgs = snapshot.docs.map(doc => doc.data());
                    setMessages(msgs);
                });

            // Récupérer l'ID de l'annonce de la conversation et vérifier le statut de "readyToBuy"
            const getAnnonceId = async () => {
                const conversationDoc = await firestore.collection('conversations').doc(conversationId).get();
                const annonceId = conversationDoc.data()?.annonceId;
                setAnnonceId(annonceId);

                // Vérifier si l'utilisateur est l'acheteur ou le vendeur
                const participants = conversationDoc.data()?.participants || [];
                if (participants[0] === user?.uid) {
                    setIsSeller(true);  // Utilisateur est le vendeur
                } else {
                    setIsBuyer(true);  // Utilisateur est l'acheteur
                }

                // Vérifier si "readyToBuy" est true
                const readyToBuyStatus = conversationDoc.data()?.readyToBuy;
                setReadyToBuy(readyToBuyStatus || false);
            };

            getAnnonceId();

            return () => unsubscribe();
        }
    }, [user, conversationId]);

    const fetchSellerInfo = async (userId) => {
        // Récupérer les informations du vendeur à partir de la conversation
        const conversationDoc = await firestore.collection('conversations').doc(conversationId).get();
        const participants = conversationDoc.data()?.participants || [];
        const sellerId = participants.find(id => id !== userId);  // Trouver l'ID du vendeur

        if (sellerId) {
            // Récupérer le nom du vendeur depuis Realtime Database
            const db = getDatabase();
            const sellerRef = ref(db, `users/${sellerId}/name`);
            const sellerSnapshot = await get(sellerRef);

            if (sellerSnapshot.exists()) {
                setSellerName(sellerSnapshot.val());
            }
        }
    };

    const sendMessage = async () => {
        if (user && newMessage.trim()) {
            await firestore.collection('conversations')
                .doc(conversationId)
                .collection('messages')
                .add({
                    senderId: user.uid,  // Utilise l'ID de l'utilisateur courant
                    message: newMessage,
                    createdAt: new Date(),
                });
            setNewMessage('');
        }
    };

    const handlePay = async () => {
        if (isBuyer) {
            // Mettre à jour "readyToBuy" dans la conversation
            await firestore.collection('conversations')
                .doc(conversationId)
                .update({
                    readyToBuy: true,  // Marquer comme prêt à acheter
                });

            // Ajouter un message dans la conversation
            await firestore.collection('conversations')
                .doc(conversationId)
                .collection('messages')
                .add({
                    senderId: user.uid,
                    message: 'Le client accepte l\'offre',
                    createdAt: new Date(),
                });
        }
    };

    const handleAccept = async () => {
        if (isSeller) {
            // Ajouter un message indiquant que le vendeur accepte l'offre
            await firestore.collection('conversations')
                .doc(conversationId)
                .collection('messages')
                .add({
                    senderId: user.uid,
                    message: 'Le vendeur accepte l\'offre',
                    createdAt: new Date(),
                });

            // Une fois le vendeur accepte, on marque la vente comme effectuée
            setSaleCompleted(true);

            // Ajouter un message pour la vente effectuée
            await firestore.collection('conversations')
                .doc(conversationId)
                .collection('messages')
                .add({
                    senderId: user.uid,
                    message: 'Vente effectuée',
                    createdAt: new Date(),
                });

            // Mettre à jour "notAvailable" dans Realtime Database pour marquer l'annonce comme non disponible
            const db = getDatabase();
            const annonceRef = ref(db, `annonces/${annonceId}`);

            // Nous récupérons d'abord les données existantes de l'annonce, puis nous mettons à jour l'attribut "notAvailable"
            const annonceSnapshot = await get(annonceRef);
            if (annonceSnapshot.exists()) {
                // Ajouter ou mettre à jour l'attribut notAvailable sans supprimer les autres données
                await update(annonceRef, {
                    notAvailable: true,
                });
            }
        }
    };

    return (
        <View style={styles.container}>
            {/* Affichage des informations du vendeur */}
            {sellerInfo && (
                <View style={styles.sellerInfoContainer}>
                    <Text style={styles.sellerInfoText}>Vendeur : {sellerName || "Nom introuvable"}</Text>
                </View>
            )}

            {/* Affichage des messages */}
            <ScrollView style={styles.messageContainer}>
                {messages.map((msg, index) => (
                    <View key={index} style={msg.senderId === user?.uid ? styles.userMessage : styles.sellerMessage}>
                        <Text style={[msg.senderId === user?.uid ? styles.userText : styles.sellerText, msg.message.includes("Le client accepte l'offre") || msg.message.includes("Le vendeur accepte l'offre") ? styles.italicText : null]}>
                            {msg.senderId === user?.uid ? 'Vous' : sellerName || 'Vendeur'}: {msg.message}
                        </Text>
                    </View>
                ))}

                {/* Message "Vente effectuée" centré et en gros si la vente est complétée */}
                {saleCompleted && (
                    <View style={styles.saleMessageContainer}>
                        <Text style={styles.saleMessageText}>Vente effectuée</Text>
                    </View>
                )}
            </ScrollView>

            {/* Zone de saisie de message */}
            <TextInput 
                value={newMessage} 
                onChangeText={setNewMessage} 
                placeholder="Écrivez un message..." 
                style={styles.textInput} 
            />

            {/* Bouton envoyer */}
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                <Text style={styles.sendButtonText}>Envoyer</Text>
            </TouchableOpacity>

            {/* Bouton "Payer" uniquement pour l'acheteur */}
            {isBuyer && !readyToBuy && (
                <TouchableOpacity onPress={handlePay} style={styles.payButton}>
                    <Text style={styles.payButtonText}>Payer</Text>
                </TouchableOpacity>
            )}

            {/* Bouton "Accepter" uniquement pour le vendeur */}
            {isSeller && readyToBuy && (
                <TouchableOpacity onPress={handleAccept} style={styles.acceptButton}>
                    <Text style={styles.acceptButtonText}>Accepter</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7',
        padding: 20,
    },
    sellerInfoContainer: {
        marginBottom: 20,
    },
    sellerInfoText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2e7d32',  // Vert pour le vendeur
    },
    messageContainer: {
        flex: 1,
        marginBottom: 20,
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#4CAF50',  // Vert pour l'utilisateur
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        maxWidth: '70%',
    },
    sellerMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#e0e0e0',  // Gris clair pour le vendeur
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        maxWidth: '70%',
    },
    userText: {
        color: '#fff',
        fontSize: 16,
    },
    sellerText: {
        color: '#333',
        fontSize: 16,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#4CAF50',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 10,
        fontSize: 16,
    },
    sendButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        borderRadius: 30,
        alignItems: 'center',
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    payButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        borderRadius: 30,
        marginTop: 10,
        alignItems: 'center',
    },
    payButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    acceptButton: {
        backgroundColor: '#8bc34a',
        paddingVertical: 12,
        borderRadius: 30,
        marginTop: 10,
        alignItems: 'center',
    },
    acceptButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    italicText: {
        fontStyle: 'italic',
    },
    saleMessageContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    saleMessageText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
});
