import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function AffichageProduitScreen() {
    const route = useRoute();
    const { annonce } = route.params; // Récupère l'annonce passée depuis la page précédente

    const handleContactSeller = () => {
        alert(`Contactez le vendeur de l'article: ${annonce.objet}`);
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
            <TouchableOpacity style={styles.contactButton} onPress={handleContactSeller}>
                <Text style={styles.contactButtonText}>Contacter le vendeur</Text>
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
        backgroundColor: '#4CAF50',
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
