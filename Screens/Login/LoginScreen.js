import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from "react-native";
import { useState } from "react";
import { auth } from "../../Firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigation = useNavigation(); 

    const registerRedirection = () => {
        navigation.navigate('RegisterScreen');
    };


    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);

            // Redirigez ou effectuez une action après la connexion
            navigation.navigate('Home');
            

        } catch (error) {
            console.error(error);
            alert("Erreur de connexion. Vérifiez vos identifiants.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Connexion</Text>
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
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Se connecter</Text>
            </TouchableOpacity>
            <Text style={styles.footerText}>
                Vous n'avez pas encore de compte ?{" "}
                <Text style={styles.link} onPress={() => registerRedirection}>
                    Inscrivez-vous
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
