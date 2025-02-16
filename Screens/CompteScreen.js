import { StatusBar } from "expo-status-bar";
import {StyleSheet, Text, View, TouchableOpacity, Image, FlatList, Platform} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from "react";
import { auth } from "../Firebase";
import { getDatabase, ref, onValue } from "firebase/database";

export default function CompteScreen() {
    const navigation = useNavigation();
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [annonces, setAnnonces] = useState([]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                fetchUserData(currentUser.uid);
                fetchUserAnnonces(currentUser.uid);
            }
        });

        return unsubscribe;
    }, []);

    const fetchUserData = (userId) => {
        const db = getDatabase();
        const userRef = ref(db, `users/${userId}`);
    
        onValue(userRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const photoBase64 = data.imageBase64?.photoBase64 || null;
                setUserData({ ...data, photoBase64 });
            }
        });
    };

    const fetchUserAnnonces = (userId) => {
        const db = getDatabase();
        const annoncesRef = ref(db, `annonces`);
    
        onValue(annoncesRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const userAnnonces = Object.keys(data)
                    .filter((id) => data[id].userId === userId)
                    .map((id) => ({ ...data[id], id })); // Ajoute l'ID de l'annonce
                setAnnonces(userAnnonces);
            } else {
                setAnnonces([]);
            }
        });
    };
    

    const handleAnnoncePress = (annonce) => {
        navigation.navigate('AnnonceModifScreen', { annonce });
    };
    

    const handleLogout = () => {
        auth.signOut()
            .then(() => {
                alert("Vous êtes déconnecté.");
                navigation.navigate('LoginScreen');
            })
            .catch((error) => {
                console.error(error);
                alert("Erreur lors de la déconnexion.");
            });
    };

    if (!user) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Veuillez vous connecter</Text>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('LoginScreen')}>
                    <Text style={styles.buttonText}>Se connecter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={() => navigation.navigate('RegisterScreen')}>
                    <Text style={[styles.buttonText, styles.registerButtonText]}>S'enregistrer</Text>
                </TouchableOpacity>
                <StatusBar style="auto" />
            </View>
        );
    }

    return (
        <View style={styles.profileContainer}>
            <View style={styles.profileHeader}>
                <Image
                    source={{ uri: userData?.photoBase64 ? `data:image/png;base64,${userData.photoBase64}` : "https://via.placeholder.com/100" }}
                    style={styles.profileImage}
                />
                <Text style={styles.profileName}>{userData?.name || user.email}</Text>
                {/* <Text style={styles.profileDescription}>
                    {userData?.adressePostal || "Adresse non renseignée"}
                </Text> */}
            </View>

            <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('CompteModifScreen')}>
                    <Text style={styles.actionText}>Modifier le profil</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
                    <Text style={styles.actionText}>Se déconnecter</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Mes annonces</Text>
            <FlatList
                data={annonces}
                keyExtractor={(item) => item.id} // Utiliser l'ID comme clé
                numColumns={2}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleAnnoncePress(item)}>
                        <View style={styles.annonceCard}>
                            <Image
                                source={{ uri: `data:image/png;base64,${item.photos[0]}` }}
                                style={styles.annonceImage}
                            />
                            <Text style={styles.annonceTitle}>{item.objet}</Text>
                            {item.transactionType !== "Troc" && (
                                <Text style={styles.annoncePrice}>
                                    {item.prix}€{item.locationDuration ? ' / ' + item.locationDuration : ''}
                                </Text>
                            )}
                            {item.transactionType === "Troc" && (
                                <Text style={styles.annoncePrice}>Troc</Text>
                            )}
                        </View>
                    </TouchableOpacity>
                )}
            />
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 24,
        marginBottom: 30,
        fontWeight: 'bold',
        color: "#343a40",
    },
    button: {
        backgroundColor: "#47b089",
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginBottom: 20,
        width: Platform.OS === 'web' ? '20%' : '80%',
        alignItems: 'center',
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    registerButton: {
        backgroundColor: "#6c757d",
    },
    registerButtonText: {
        color: "#fff",
    },
    profileContainer: {
        flex: 1,
        backgroundColor: "#f8f9fa",
        padding: 20,
    },
    profileHeader: {
        alignItems: "center",
        marginBottom: 30,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15,
        borderWidth: 2,
        borderColor: "#47b089",
    },
    profileName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#343a40",
        marginBottom: 10,
    },
    profileDescription: {
        fontSize: 16,
        color: "#6c757d",
        textAlign: "center",
    },
    actionsContainer: {
        marginTop: 20,
        alignItems:Platform.OS === 'web' ? 'center' : 'none',
    },
    actionButton: {
        backgroundColor: "#47b089",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginBottom: 15,
        alignItems: "center",
        width: Platform.OS === 'web' ? '20%' : '100%',
    },
    actionText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#343a40",
        marginBottom: 10,
        marginTop: 20,
    },
    annonceCard: {
        flex: 1,
        margin: 5,
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
    },
    annonceImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    annonceTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
        marginTop: 10,
    },
    annoncePrice: {
        fontSize: 12,
        color: "#666",
    },
});
