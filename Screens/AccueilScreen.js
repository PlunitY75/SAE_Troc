import { StatusBar } from "expo-status-bar";
import { View, TextInput, StyleSheet, ScrollView, Text, TouchableOpacity, FlatList } from 'react-native';
import Card from '../composants/Card.js';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from 'react';
import { getDatabase, onValue, ref } from "firebase/database";

export default function App() {
    const navigation = useNavigation();
    const [annonces, setAnnonces] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const connexionRedirection = () => {
        navigation.navigate("CompteScreen");
    };

    const handleAnnoncePress = (annonce) => {
        navigation.navigate('AnnonceModifScreen', { annonce });
    };

    const handleSearch = () => {
        navigation.navigate('ResultatsRechercheScreen', { query: searchQuery });
    };

    const fetchTendancesAnnonces = () => {
        const db = getDatabase();
        const annoncesRef = ref(db, `annonces`);

        onValue(annoncesRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                // Transforme les données Firebase en tableau
                const allAnnonces = Object.keys(data).map((id) => ({
                    id, // Ajoute l'ID unique
                    ...data[id],
                }));

                // Trie les annonces par date décroissante
                const sortedAnnonces = allAnnonces.sort((a, b) =>
                    new Date(b.dateAjout) - new Date(a.dateAjout)
                );

                // Ne prend que les 10 premières annonces
                const recentAnnonces = sortedAnnonces.slice(0, 10);

                setAnnonces(recentAnnonces);
            } else {
                setAnnonces([]);
            }
        });
    };


    useEffect(() => {
        fetchTendancesAnnonces();
    }, []);

    return (
        <View style={styles.container}>
            {/* Barre de recherche */}
           <View style={styles.topNavBarContainer}>
                <TouchableOpacity style={styles.navBarButton} onPress={connexionRedirection}>
                    <MaterialCommunityIcons name="account" size={35} color="#687a86" />
                </TouchableOpacity>

                <TextInput
                    placeholder="Rechercher des articles"
                    style={styles.input}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                />

                <TouchableOpacity style={styles.navBarButton} onPress={handleSearch}>
                    <FontAwesome5 name="search" size={24} color="#687a86" />
                </TouchableOpacity>
            </View>

            {/* Contenu défilant */}
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.tendanceContainer}>
                    <Text style={styles.tendanceTitle}>Les tendances du moment !</Text>
                    <FlatList
                        data={annonces}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => handleAnnoncePress(item)} style={{ flex: 1 }}>
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

                                    tempsLocation={item.transactionType === "Location" ? item.locationDuration : null }
                                />
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item.id}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.carrousel}
                    />
                </View>

                {/* Articles supplémentaires */}
                {Array.from({ length: 20 }, (_, i) => (
                    <Text key={i} style={styles.item}>
                        Article {i + 1}
                    </Text>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ddd'
    },
    topNavBarContainer: {
        backgroundColor: '#f5f5f5',
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        zIndex: 1,
    },
    navBarButton: {
        backgroundColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 50,
        borderRadius: 15,
    },
    input: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 15,
        borderWidth: 1,
        flex: 1,
        marginRight: 10,
        marginLeft: 10,
        borderColor: '#ddd',
    },
    tendanceContainer: {
        width: '100%',
        flexDirection: 'column',
        paddingTop: 30,
        paddingBottom: 20,
        backgroundColor: '#f5f5f5',
    },
    tendanceTitle: {
        fontSize: 20,
        fontWeight: '500',
        marginLeft: 10,
        marginBottom: 15
    },
    carrousel: {
        paddingLeft: 10,
        paddingRight: 10,
    },
    scrollViewContent: {},
    item: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
});
