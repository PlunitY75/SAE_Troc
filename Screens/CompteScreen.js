import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { auth } from "../Firebase";
import { signOut } from "firebase/auth";

export default function CompteScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true); // Indicateur de chargement
    const [user, setUser] = useState(null); // État de l'utilisateur connecté

    useEffect(() => {
        // Vérifiez si un utilisateur est connecté
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser(currentUser); // Stockez les informations utilisateur
            } else {
                navigation.replace("RegisterScreen"); // Redirigez si aucun utilisateur
            }
            setLoading(false); // Arrêtez le chargement
        });

        // Nettoyage de l'écouteur pour éviter les fuites mémoire
        return () => unsubscribe();
    }, [navigation]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            alert("Déconnexion réussie !");
            navigation.replace("RegisterScreen");
        } catch (error) {
            console.error("Erreur lors de la déconnexion :", error);
            alert("Erreur lors de la déconnexion. Veuillez réessayer.");
        }
    };

    if (loading) {
        // Affichez un écran de chargement pendant la vérification de l'utilisateur
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007BFF" />
                <Text style={styles.loadingText}>Chargement...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bienvenue, {user?.displayName || "Utilisateur"} !</Text>
            <Text style={styles.email}>Email : {user?.email}</Text>
            <TouchableOpacity style={styles.button} onPress={handleLogout}>
                <Text style={styles.buttonText}>Se déconnecter</Text>
            </TouchableOpacity>
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#222",
        marginBottom: 10,
    },
    email: {
        fontSize: 16,
        color: "#555",
        marginBottom: 20,
    },
    button: {
        width: "100%",
        height: 50,
        backgroundColor: "#007BFF",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "600",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#666",
    },
});
