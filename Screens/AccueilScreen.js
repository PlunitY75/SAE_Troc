import { StatusBar } from "expo-status-bar";
import { View, TextInput, StyleSheet, ScrollView, Text, TouchableOpacity, FlatList, RefreshControl  } from 'react-native';
import Card from '../composants/Card.js';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from 'react';
import { getDatabase, onValue, ref } from "firebase/database";

export default function App() {
    const navigation = useNavigation();
    const [annonces, setAnnonces] = useState([]);
    const [searchQuery, setSearchQuery] = useState([]);
    const [electronicAnnonces, setElectronicAnnonces] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
        setRefreshing(true); // Active l'état de rafraîchissement
        fetchAnnonces(); // Rafraîchit les données
        setTimeout(() => setRefreshing(false), 1000); // Désactive après 1 seconde (ou lorsque le fetch est terminé)
    };

    const connexionRedirection = () => {
        navigation.navigate("CompteScreen");
    };

    const handleAnnoncePress = (annonce) => {
        navigation.navigate('AffichageProduitScreen', { annonce });
    };

    const handleSearch = () => {
        navigation.navigate('ResultatsRechercheScreen', { query: searchQuery });
    };

    const fetchAnnonces = () => {
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

                // Filtrer les annonces pour exclure celles avec notAvailable === true
                const filteredAnnonces = allAnnonces.filter((annonce) => !annonce.notAvailable);

                // Trie les annonces par date décroissante
                const sortedAnnonces = filteredAnnonces.sort((a, b) =>
                    new Date(b.dateAjout) - new Date(a.dateAjout)
                );

                // Ne prend que les 10 premières annonces
                const recentAnnonces = sortedAnnonces.slice(0, 10);

                setAnnonces(recentAnnonces);

                // Filtrer les annonces de la catégorie Electronique
                const electronic = allAnnonces.filter(annonce => annonce.categorie === "Électronique");

                setElectronicAnnonces(electronic);
            } else {
                setAnnonces([]);
                setElectronicAnnonces([]);
            }
        });
    };

    useEffect(() => {
        fetchAnnonces();
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
            <ScrollView contentContainerStyle={styles.scrollViewContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
            >
                {/* Section "Les tendances du moment" */}
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
                                    date={item.dateAjout
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


                {/* Section "Appareil électronique" */}
                <View style={styles.appareilContainer}>
                    <Text style={styles.appareilTitle}>Appareil électronique :</Text>
                    <FlatList style={styles.appareilContainer}
                        data={electronicAnnonces}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => handleAnnoncePress(item)} style={styles.cardWrapper}>
                                <Card
                                    imageSource={{ uri: `data:image/png;base64,${item.photos[0]}` }}
                                    title={item.objet || 'Titre indisponible'}
                                    description={item.description || 'Pas de description'}
                                    price={["Achat", "Location"].includes(item.transactionType) ? `${item.prix}€` : "Troc"}
                                    date={item.dateAjout
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
                {/* Section "Toutes les annonces" */}
                <View style={styles.appareilContainer}>
                    <Text style={styles.annonceTitle}>Toutes les annonces :</Text>
                    <FlatList
                        data={annonces}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => handleAnnoncePress(item)} style={styles.cardWrapper}>
                                <Card
                                    imageSource={{ uri: `data:image/png;base64,${item.photos[0]}` }}
                                    title={item.objet || 'Titre indisponible'}
                                    description={item.description || 'Pas de description'}
                                    price={["Achat", "Location"].includes(item.transactionType) ? `${item.prix}€` : "Troc"}
                                    date={item.dateAjout
                                        ? new Date(item.dateAjout).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                        : 'Date inconnue'
                                    }
                                    tempsLocation={item.transactionType === "Location" ? item.locationDuration : null }
                                />
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item.id}
                        horizontal={true}  // Afficher les annonces en carrousel horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.carrousel}
                    />
                </View>
            </ScrollView>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    topNavBarContainer: {
        backgroundColor: '#47b089',
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    navBarButton: {
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 50,
        borderRadius: 15,
    },
    input: {
        backgroundColor: '#fff',
        padding: 10,
        height:50,
        borderRadius: 15,
        borderWidth: 1,
        flex: 1,
        marginRight: 15,
        marginLeft: 10,
        borderColor: '#ddd',
        fontSize: 16,
    },
    tendanceContainer: {
        width: '100%',
        flexDirection: 'column',
        paddingTop: 20,
        paddingBottom: 15,
        backgroundColor:'white'
    },
    tendanceTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginTop:0,
        marginLeft: 15,
        marginBottom: 15,
        color: '#47b089',  // Vert pour attirer l'attention
    },
    carrousel: {
        paddingLeft: 10,
        paddingRight: 10,
    },

    appareilContainer: {
        backgroundColor:'white',
        marginTop:20,
    },
    appareilTitle:{
        fontSize: 24,
        fontWeight: '700',
        marginTop:20,
        marginLeft: 15,
        color: '#47b089',  // Vert pour attirer l'attention
    },

    annonceTitle:{
        fontSize: 24,
        fontWeight: '700',
        marginTop:20,
        marginLeft: 15,
        color: '#47b089',  // Vert pour attirer l'attention
        marginBottom:15,
    },
    flatListContent: {
        paddingBottom: 20,
        paddingHorizontal: 10,
    },
    cardWrapper: {
        flex: 1,
        marginRight: 10,
    },
});
