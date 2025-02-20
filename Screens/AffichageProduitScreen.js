import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { firestore, auth } from '../Firebase';
import { getDatabase, ref, get, set, remove } from 'firebase/database';

export default function AffichageProduitScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { annonce } = route.params;
    const [loading, setLoading] = useState(false);
    const [liked, setLiked] = useState(false);
    const user = auth.currentUser;

    useEffect(() => {
        if (user) {
            checkIfLiked();
        }
    }, [user, annonce]);

    // Vérifier si l'annonce est déjà likée
    const checkIfLiked = async () => {
        const db = getDatabase();
        const likeRef = ref(db, `users/${user.uid}/annoncesLikees/${annonce.id}`);
        const snapshot = await get(likeRef);

        if (snapshot.exists()) {
            setLiked(true);
        } else {
            setLiked(false);
        }
    };

    // Fonction pour liker / unliker une annonce
    const handleLike = async () => {
        const db = getDatabase();
        const likeRef = ref(db, `users/${user.uid}/annoncesLikees/${annonce.id}`);

        if (liked) {
            // Supprimer l'annonce des likes
            await remove(likeRef);
            setLiked(false);
        } else {
            // Ajouter l'annonce aux likes
            await set(likeRef, true);
            setLiked(true);
        }
    };

    const handleContactSeller = async () => {
        setLoading(true);
        try {
            const sellerId = annonce.userId;
            if (!user) {
                alert("Vous devez être connecté pour contacter le vendeur");
                return;
            }

            const existingConversationSnapshot = await firestore
                .collection('conversations')
                .where('annonceId', '==', annonce.id)
                .where('participants', 'array-contains', user.uid)
                .get();

            if (!existingConversationSnapshot.empty) {
                const existingConversationId = existingConversationSnapshot.docs[0].id;
                navigation.navigate('ConvTestScreen', { conversationId: existingConversationId });
            } else {
                const conversationRef = firestore.collection('conversations').doc();
                await conversationRef.set({
                    participants: [sellerId, user.uid],
                    createdAt: new Date(),
                    annonceId: annonce.id,
                });
                navigation.navigate('ConvTestScreen', { conversationId: conversationRef.id });
            }

        } catch (error) {
            console.error("Erreur lors de la création ou de la récupération de la conversation:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image source={{ uri: `data:image/png;base64,${annonce.photos[0]}` }} style={styles.productImage} />

            <View style={styles.detailsContainer}>
                <Text style={styles.productTitle}>{annonce.objet || 'Titre indisponible'}</Text>
                <Text style={styles.productPrice}>
                    {["Achat", "Location"].includes(annonce.transactionType) ? `${annonce.prix}€` : "Troc"}
                </Text>
                <Text style={styles.productDescription}>
                    {annonce.description || 'Pas de description disponible'}
                </Text>
                <Text style={styles.productDate}>
                    {annonce.dateAjout
                        ? new Date(annonce.dateAjout).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                        : 'Date inconnue'}
                </Text>
                {annonce.transactionType === 'Location' && (
                    <Text style={styles.productDuration}>Durée de location: {annonce.locationDuration}</Text>
                )}
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.contactButton}
                    onPress={handleContactSeller}
                    disabled={loading}
                >
                    <Text style={styles.contactButtonText}>
                        {loading ? 'Chargement...' : 'Contacter le vendeur'}
                    </Text>
                </TouchableOpacity>

                {/* Bouton Like */}
                <TouchableOpacity
                    style={[styles.likeButton, liked ? styles.liked : null]}
                    onPress={handleLike}
                >
                    <Text style={styles.likeButtonText}>
                        {liked ? '❤️ Liké' : '🤍 Like'}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    productImage: {
        width: '100%',
        height: 300,
        resizeMode: Platform.OS === 'web' ? "center" : "cover",
        borderRadius: 10,
        marginBottom: 20,
        backgroundColor: '#DDD'
    },
    detailsContainer: {
        marginBottom: 30,
    },
    productTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    productPrice: {
        fontSize: 20,
        color: '#47b089',
        fontWeight: '500',
        marginBottom: 10,
    },
    productDescription: {
        fontSize: 16,
        color: '#555',
        marginBottom: 10,
    },
    productDate: {
        fontSize: 14,
        color: '#888',
        marginBottom: 10,
    },
    productDuration: {
        fontSize: 14,
        color: '#888',
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    contactButton: {
        backgroundColor: '#47b089',
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
        width: '48%',
    },
    contactButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    likeButton: {
        backgroundColor: '#ccc',
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
        width: '48%',
    },
    likeButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    liked: {
        backgroundColor: '#ff4757',  // Rouge pour montrer que l'annonce est likée
    },
});

