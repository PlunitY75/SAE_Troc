import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from "react-native";
import { useState } from "react";
import { auth } from "../../Firebase";
import { getDatabase, ref, set } from "firebase/database";
import { useNavigation } from '@react-navigation/native';

function enregistrementDesUtilisateurs(userId, name, email) {
    const db = getDatabase();
    set(ref(db, "users/" + userId), {
        name: name,
        email: email,
    });
}

export default function RegisterScreen() {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");

    const navigation = useNavigation();    

    const connexionRedirection = () => {
        navigation.navigate('LoginScreen');
    };

    const creationCompte = async () => {
        try {
            await auth.createUserWithEmailAndPassword(email, password);
            const user = auth.currentUser;
            enregistrementDesUtilisateurs(user.uid, name, email);
            await user.updateProfile({
                displayName: name,
            });
            

        } catch (error) {
            console.error(error);
            alert("Erreur lors de l'inscription. Veuillez réessayer.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Créer un compte</Text>
            <TextInput
                style={styles.input}
                placeholder="Nom d'utilisateur"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Adresse email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={creationCompte}>
                <Text style={styles.buttonText}>S'inscrire</Text>
            </TouchableOpacity>
            <Text style={styles.footerText}>
                Vous avez déjà un compte ?{" "}
                <Text style={styles.link} onPress={connexionRedirection}>
                    Connectez-vous
                </Text>
            </Text>
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
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#222",
        marginBottom: 30,
    },
    input: {
        width: "100%",
        height: 50,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: "#fff",
        marginBottom: 15,
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
    footerText: {
        fontSize: 14,
        color: "#666",
        marginTop: 20,
    },
    link: {
        color: "#007BFF",
        fontWeight: "bold",
    },
});

