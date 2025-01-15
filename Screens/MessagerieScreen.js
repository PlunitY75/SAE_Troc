import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { firestore, auth } from '../Firebase';  // Assurez-vous d'importer Firebase et auth correctement
import { getDatabase, ref, get } from 'firebase/database';  // Importer Realtime Database

export default function MessagerieScreen() {
    const navigation = useNavigation();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            alert("Vous devez être connecté pour accéder à vos conversations.");
            return;
        }

        const fetchConversations = async () => {
            try {
                const snapshot = await firestore.collection('conversations').where('participants', 'array-contains', user.uid).get();
                const fetchedConversations = await Promise.all(snapshot.docs.map(async (doc) => {
                    const conversationData = doc.data();
                    const annonceId = conversationData.annonceId; // Assurez-vous que le champ 'annonceId' existe dans vos conversations

                    // Récupérer les informations de l'annonce depuis la Realtime Database
                    const db = getDatabase();
                    const annonceRef = ref(db, `annonces/${annonceId}`);
                    const annonceSnapshot = await get(annonceRef);
                    
                    // Vérifier si l'annonce existe et récupérer son objet
                    const annonce = annonceSnapshot.exists() ? annonceSnapshot.val() : null;

                    return {
                        id: doc.id,
                        annonceId,
                        annonceObjet: annonce ? annonce.objet || "Objet inconnu" : "Objet inconnu", // Récupérer l'objet de l'annonce
                    };
                }));

                setConversations(fetchedConversations);
            } catch (error) {
                console.error("Erreur lors de la récupération des conversations :", error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, []);

    const handleConversationPress = (conversationId) => {
        navigation.navigate('ConvTestScreen', { conversationId });
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <Text style={styles.loadingText}>Chargement des conversations...</Text>
            ) : (
                <FlatList
                    data={conversations}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleConversationPress(item.id)} style={styles.conversationItem}>
                            <Text style={styles.conversationText}>
                                {item.annonceObjet || "Objet inconnu"}  {/* Affichage de l'objet de l'annonce */}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    loadingText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
    },
    conversationItem: {
        padding: 15,
        marginBottom: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    conversationText: {
        fontSize: 16,
        color: '#333',
    },
});
