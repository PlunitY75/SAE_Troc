import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { getDatabase, ref, get } from 'firebase/database';
import { useNavigation } from "@react-navigation/native";
import Card from '../composants/Card.js';
import { auth } from "../Firebase";

export default function AnnoncesLikeesScreen() {
    const navigation = useNavigation();
    const [annonces, setAnnonces] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = auth.currentUser;

    useEffect(() => {
        if (user) {
            fetchLikedAnnonces();
        }
    }, [user]);

    const fetchLikedAnnonces = async () => {
        const db = getDatabase();
        const likesRef = ref(db, `users/${user.uid}/annoncesLikees`);
        const snapshot = await get(likesRef);

        if (snapshot.exists()) {
            const likedAnnonceIds = Object.keys(snapshot.val());

            const annoncesRef = ref(db, `annonces`);
            const annoncesSnapshot = await get(annoncesRef);

            if (annoncesSnapshot.exists()) {
                const allAnnonces = annoncesSnapshot.val();
                const likedAnnonces = likedAnnonceIds.map(id => ({
                    id,
                    ...allAnnonces[id],
                }));
                setAnnonces(likedAnnonces);
            }
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>❤️ Mes annonces likées</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#47b089" />
            ) : annonces.length > 0 ? (
                <FlatList
                    data={annonces}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.cardWrapper}
                            onPress={() => navigation.navigate('AffichageProduitScreen', { annonce: item })}
                        >
                            <Card
                                imageSource={{ uri: `data:image/png;base64,${item.photos[0]}` }}
                                title={item.objet || 'Titre indisponible'}
                                description={item.description || 'Pas de description'}
                                price={["Achat", "Location"].includes(item.transactionType) ? `${item.prix}€` : "Troc"}
                                date={item.dateAjout
                                    ? new Date(item.dateAjout).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                    : 'Date inconnue'
                                }
                            />
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.id}
                    numColumns={2} // ✅ Affiche les annonces 2 par 2
                    columnWrapperStyle={styles.row} // ✅ Ajoute l'espacement entre les colonnes
                />
            ) : (
                <Text style={styles.emptyMessage}>Vous n'avez liké aucune annonce.</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 10,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#47b089',
        marginBottom: 20,
        textAlign: 'center',
    },
    emptyMessage: {
        fontSize: 18,
        color: '#888',
        textAlign: 'center',
        marginTop: 20,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between", // ✅ Assure un bon espacement horizontal
        marginBottom: 15, // ✅ Ajoute de l'espace entre chaque ligne
        paddingHorizontal: 10,
    },
    cardWrapper: {
        width: "47%", // ✅ Assure que chaque carte occupe environ 47% de la largeur de l'écran
        marginBottom: 10, // ✅ Espacement vertical entre les annonces
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
});
