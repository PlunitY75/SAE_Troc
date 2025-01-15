import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import Card from '../composants/Card.js';
import { useEffect, useState } from 'react';
import { getDatabase, onValue, ref } from "firebase/database";

export default function ResultatsRechercheScreen({ route, navigation }) {
    const { query } = route.params;
    const [results, setResults] = useState([]);

    useEffect(() => {
        const db = getDatabase();
        const annoncesRef = ref(db, `annonces`);

        onValue(annoncesRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const allAnnonces = Object.keys(data).map((id) => ({
                    id,
                    ...data[id],
                }));

                const filteredAnnonces = allAnnonces.filter((annonce) =>
                    annonce.objet?.toLowerCase().includes(query.toLowerCase()) ||
                    (annonce.hashtags && annonce.hashtags.some((hashtag) => hashtag.toLowerCase().includes(query.toLowerCase())))
                );

                setResults(filteredAnnonces);
            } else {
                setResults([]);
            }
        });
    }, [query]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Résultats pour "{query}"</Text>
            {results.length === 0 ? (
                <Text style={styles.noResults}>Aucune annonce disponible</Text>
            ) : (
                <FlatList
                    data={results}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('AffichageProduitScreen', { annonce: item })}
                            style={styles.cardWrapper}
                        >
                            <Card
                                imageSource={{ uri: `data:image/png;base64,${item.photos[0]}` }}
                                title={item.objet || 'Titre indisponible'}
                                description={item.description || 'Pas de description'}
                                price={["Achat", "Location"].includes(item.transactionType) ? `${item.prix}€` : "Troc"}
                                date={
                                    item.dateAjout
                                        ? new Date(item.dateAjout).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                        : 'Date inconnue'
                                }
                                tempsLocation={item.transactionType === "Location" ? item.locationDuration : null}
                            />
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    numColumns={2} // Deux colonnes pour afficher deux annonces par ligne
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 10,
        paddingTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    noResults: {
        textAlign: 'center',
        fontSize: 18,
        color: '#aaa',
        marginTop: 30,
    },
    listContent: {
        paddingBottom: 20,
    },
    cardWrapper: {
        flex: 1,
        margin: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
    },
});
