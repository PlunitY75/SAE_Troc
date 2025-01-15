import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { firestore, auth } from '../Firebase';  // Assurez-vous d'importer Firebase et auth correctement

export default function AffichageProduitScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { annonce } = route.params; // Récupère l'annonce passée depuis la page précédente
    const [loading, setLoading] = useState(false);

    const handleContactSeller = async () => {
        setLoading(true);

        try {
            // Récupérer l'ID du vendeur depuis l'annonce
            const sellerId = annonce.userId;
            const user = auth.currentUser; // Utilisation correcte de auth
            if (!user) {
                alert("Vous devez être connecté pour contacter le vendeur");
                return;
            }

            // Vérifier si une conversation existe déjà avec le même annonceId et les deux participants
            const existingConversationSnapshot = await firestore
                .collection('conversations')
                .where('annonceId', '==', annonce.id)
                .where('participants', 'array-contains', user.uid)
                .get();

            if (!existingConversationSnapshot.empty) {
                // Si une conversation existe, ouvrir la conversation existante
                const existingConversationId = existingConversationSnapshot.docs[0].id;
                navigation.navigate('ConvTestScreen', { conversationId: existingConversationId });
            } else {
                // Sinon, créer une nouvelle conversation
                const conversationRef = firestore.collection('conversations').doc();
                await conversationRef.set({
                    participants: [sellerId, user.uid], // Remplacer 'currentUserId' par l'ID de l'utilisateur connecté
                    createdAt: new Date(),
                    annonceId: annonce.id, // Ajouter l'ID de l'annonce à la conversation
                });

                // Une fois la conversation créée, naviguer vers la page de chat avec l'ID de la conversation
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
            {/* Affichage de l'image du produit */}
            <Image
                source={{ uri: `data:image/png;base64,${annonce.photos[0]}` }}
                style={styles.productImage}
            />

            {/* Informations sur le produit */}
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
                {annonce.transactionType === 'Location' && (
                    <Text style={styles.productDuration}>Durée de location: {annonce.locationDuration}</Text>
                )}
            </View>

            {/* Bouton pour contacter le vendeur */}
            <TouchableOpacity 
                style={styles.contactButton} 
                onPress={handleContactSeller}
                disabled={loading} // Désactiver le bouton en cas de chargement
            >
                <Text style={styles.contactButtonText}>
                    {loading ? 'Chargement...' : 'Contacter le vendeur'}
                </Text>
            </TouchableOpacity>
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
        resizeMode: 'contain',
        borderRadius: 10,
        marginBottom: 20,
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
        color: '#e91e63',
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
    contactButton: {
        backgroundColor: '#47b089',
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    contactButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
