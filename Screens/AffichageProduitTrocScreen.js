import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { firestore, auth } from '../Firebase';  

export default function AffichageProduitTrocScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { annonce } = route.params;
    const [loading, setLoading] = useState(false);

    const handleContactUser = async () => {
        setLoading(true);
        try {
            const ownerId = annonce.userId;
            const user = auth.currentUser;
    
            if (!user) {
                alert("Vous devez être connecté pour discuter avec cet utilisateur.");
                return;
            }

            const existingConversationSnapshot = await firestore
                .collection('conversations')
                .where('annonceId', '==', annonce.id)
                .where('participants', 'array-contains', user.uid)
                .get();
    
            let conversationId;
    
            if (!existingConversationSnapshot.empty) {
                conversationId = existingConversationSnapshot.docs[0].id;
            } else {
                const conversationRef = firestore.collection('conversations').doc();
                await conversationRef.set({
                    participants: [ownerId, user.uid],
                    createdAt: new Date(),
                    annonceId: annonce.id,
                    transactionType: annonce.transactionType,
                });
                conversationId = conversationRef.id;
            }
    
            navigation.navigate('ConvTestScreen', { conversationId });
    
        } catch (error) {
            console.error("Erreur lors de la création ou récupération de la conversation:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image
                source={{ uri: `data:image/png;base64,${annonce.photos[0]}` }}
                style={styles.productImage}
            />

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
                        : 'Date inconnue'
                    }
                </Text>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        alignItems: 'center',
    },
    productImage: {
        width: '100%',
        height: 300,
        resizeMode: 'cover',
        borderRadius: 10,
        marginBottom: 20,
    },
    detailsContainer: {
        marginBottom: 30,
        width: '100%',
        alignItems: 'center',
    },
    productTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
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
        textAlign: 'center',
        marginBottom: 10,
    },
    productDate: {
        fontSize: 14,
        color: '#888',
        marginBottom: 10,
    },
    contactButton: {
        backgroundColor: '#47b089',
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
        width: '80%',
    },
    contactButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
