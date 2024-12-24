import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from "react";
import { auth } from "../Firebase";
import { getDatabase, ref, onValue } from "firebase/database";

export default function CompteScreen() {
    const navigation = useNavigation();
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null); // Stocker les données utilisateur

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);

            // Si un utilisateur est connecté, récupérer les données depuis la DB
            if (currentUser) {
                fetchUserData(currentUser.uid);
            }
        });

        return unsubscribe;
    }, []);

    const fetchUserData = (userId) => {
        const db = getDatabase();
        const userRef = ref(db, `users/${userId}`);

        // Écouter les changements dans la base de données
        onValue(userRef, (snapshot) => {
            if (snapshot.exists()) {
                setUserData(snapshot.val());
            } else {
                console.log("Aucune donnée utilisateur trouvée.");
            }
        });
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
            {/* Section Profil */}
            <View style={styles.profileHeader}>
                <Image
                    source={{ uri: userData?.photoBase64 ? `data:image/png;base64,${userData.photoBase64}` : "https://via.placeholder.com/100" }}
                    style={styles.profileImage}
                />
                <Text style={styles.profileName}>{userData?.name || user.email}</Text>
                <Text style={styles.profileDescription}>
                    {userData?.adressePostal || "Adresse non renseignée"}
                </Text>
            </View>

            {/* Section Actions */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionText}>Modifier le profil</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
                    <Text style={styles.actionText}>Se déconnecter</Text>
                </TouchableOpacity>
            </View>

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
        backgroundColor: "#007bff",
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginBottom: 20,
        width: '80%',
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
        borderColor: "#007bff",
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
    },
    actionButton: {
        backgroundColor: "#007bff",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginBottom: 15,
        alignItems: "center",
    },
    actionText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
