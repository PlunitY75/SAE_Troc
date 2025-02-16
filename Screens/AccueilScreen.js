import { StatusBar } from "expo-status-bar";
import {
    View,
    TextInput,
    StyleSheet,
    ScrollView,
    Text,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    Platform,
    Image, ImageBackground
} from 'react-native';
import Card from '../composants/Card.js';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from 'react';
import { getDatabase, onValue, ref } from "firebase/database";
import { useFonts } from 'expo-font';
import Footer from "../composants/Footer";
import NavBar from "../composants/NavBar";
import {auth} from "../Firebase";


export default function App() {
    const navigation = useNavigation();
    const [annonces, setAnnonces] = useState([]);
    const [searchQuery, setSearchQuery] = useState([]);
    const [electronicAnnonces, setElectronicAnnonces] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const isWeb = Platform.OS === 'web';
    const [user, setUser] = useState(null);

    const [fontsLoaded] = useFonts({
        'AnotherShabby': require('../assets/anothershabby.ttf'),
    });

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });
        return unsubscribe;
    }, []);

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
                {isWeb && (
                    <Text onPress={() => navigation.navigate('PageAccueil')}>
                        <Text style={styles.appName}>Troc.Co</Text>
                    </Text>
                )}
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

                {/* Boutons "S'inscrire" et "Se connecter" */}
                {!user && (
                    <View style={{flexDirection:'row'}}>
                        <TouchableOpacity style={styles.authButton} onPress={() => navigation.navigate('RegisterScreen')}>
                            <Text style={[styles.authButtonText, {color: 'black'}]}>S'inscrire</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.authButton, {backgroundColor: '#47b089'}]} onPress={() => navigation.navigate('LoginScreen')}>
                            <Text style={[styles.authButtonText, {color: 'white'}]}>Se connecter</Text>
                        </TouchableOpacity>
                    </View>
                )}

            </View>
            {isWeb && (
                <NavBar/>
            )}

            {/* Contenu défilant */}

            <ScrollView contentContainerStyle={styles.scrollViewContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
            >
                {isWeb && (
                    <ImageBackground
                        source={require('../assets/img4.jpg')}
                        style={styles.backgroundImage}
                    >
                        <View style={{ backgroundColor: 'white',marginLeft: 100,padding:20 ,justifyContent: 'center', alignItems: 'flex-start', paddingLeft: 20, borderRadius: 7}}>
                            <Text style={styles.textOnBackground}>
                                <Text style={{color: 'black', fontWeight: 500}}>Sur </Text>
                                <Text style={{color: "#47b089", fontWeight: 700}}>Troc&Co</Text>
                                <Text style={{color: 'black', fontWeight: 500}}> vous pouvez{'\n'}Vendre{'\n'}Louer{'\n'}et </Text>
                                <Text style={{color: "#47b089", fontWeight: 700}}>Troquer !</Text>
                            </Text>

                        </View>
                    </ImageBackground>


                )}
                {/* Section "Les tendances du moment" */}
                <View style={styles.restContainer}>
                    {!isWeb && (
                        <View>
                            <View style={styles.tendanceContainer}>
                                <Text style={styles.tendanceTitle}>Les tendances du moment !</Text>
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
                            <View style={[styles.appareilContainer, {paddingBottom: 20}]}>
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
                        </View>
                    )}
                    {isWeb && (
                        <View style={{alignItems:'center', width:'70%'}}>
                            <View style={styles.tendanceContainer}>
                                <Text style={styles.tendanceTitle}>Les tendances du moment !</Text>
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
                                    numColumns={5}

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
                                          numColumns={5}
                                          showsHorizontalScrollIndicator={false}

                                          contentContainerStyle={styles.carrousel}
                                />
                            </View>
                            {/* Section "Toutes les annonces" */}
                            <View style={[styles.appareilContainer, {paddingBottom: 20}]}>
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

                                    numColumns={5}
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.carrousel}
                                />
                            </View>
                        </View>
                    )}
                </View>
                {isWeb && (
                    <Footer />
                )}
            </ScrollView>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Platform.OS === 'web' ? 'white' : '#F5F5F5',
    },
    topNavBarContainer: {
        backgroundColor: Platform.OS === 'web' ? 'white' : '#47b089',
        padding: 15,
        flexDirection: 'row',
        justifyContent: Platform.OS === 'web' ? 'center' : 'space-between',
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
        display: Platform.OS === 'web' ? 'none' : 'flex'
    },
    authButton: {
        height: 35,
        borderRadius: 5,
        padding: 10,
        marginLeft: 10,
        alignItems: 'center',
        justifyContent: 'center',
        display: Platform.OS === 'web' ? 'flex' : 'none',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    appName: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#47b089',
        marginRight: 10,
        fontFamily: 'AnotherShabby',
    },
    authButtonText: {
        fontSize: 16,
        color: '#687a86',
    },
    input: {
        backgroundColor: Platform.OS === 'web' ? '#e4ecf1' : '#fff',
        padding: 10,
        height:50,
        maxWidth: Platform.OS === 'web' ? '40%' : 'none',
        maxHeight: Platform.OS === 'web' ? 40 : 'none',
        borderRadius: Platform.OS === 'web' ? 10: 15,
        borderWidth: 1,
        flex: 1,
        marginRight: 15,
        marginLeft: 10,
        borderColor: '#ddd',
        fontSize: 16,
    },
    backgroundImage: {
        width: '100%',
        height: 500,
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingLeft: 20,
        resizeMode: 'contain',
    },
    textOnBackground: {
        color: '#47b089',
        fontSize: 22,
    },
    restContainer:{
        flexDirection:'column',
        alignItems: Platform.OS === 'web' ? 'center' : "none"
    },
    tendanceContainer: {
        width: '100%',
        flexDirection: 'column',
        paddingBottom: Platform.OS === 'web' ? 20 : 0,
        backgroundColor:'white'
    },
    tendanceTitle: {
        fontSize: 24,
        fontWeight: '700',
        margin: 15,
        color: '#47b089',
    },
    carrousel: {
        paddingLeft: 10,
        paddingRight: 10,
        flexDirection: Platform.OS === 'web' ? 'column' : 'row',
    },

    appareilContainer: {
        backgroundColor:'white',
        marginTop:20,
        width: '100%',
        paddingBottom: Platform.OS === 'web' ? 10 : 0,
    },
    appareilTitle:{
        fontSize: 24,
        fontWeight: '700',
        marginTop:20,
        marginLeft: 15,
        marginBottom:0,
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
        margin: 10, // Ajout d'espace entre les cartes
        width: '100%',
    },
});
