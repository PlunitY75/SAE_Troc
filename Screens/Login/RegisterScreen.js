import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image } from "react-native";
import { useState } from "react";
import { auth } from "../../Firebase";
import { getDatabase, ref, set } from "firebase/database";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";

function enregistrementDesUtilisateurs(userId, name, email, adressePostal, photoBase64) {
    const db = getDatabase();
    set(ref(db, "users/" + userId), {
        name: name,
        email: email,
        adressePostal: adressePostal,
        
    });

    set(ref(db, "users/"+userId+"/imageBase64"), {
        photoBase64: photoBase64,
    })
}

export default function RegisterScreen() {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [adressePostal, setAdressePostal] = useState("");
    const [photo, setPhoto] = useState(null);
    const [photoBase64, setPhotoBase64] = useState(null);
    const [uploading, setUploading] = useState(false);

    const navigation = useNavigation();

    const connexionRedirection = () => {
        navigation.navigate("LoginScreen");
    };

    const pickImage = async () => {
        // Demande d'autorisation d'accès à la galerie
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            alert("Permission d'accéder à la galerie refusée !");
            return;
        }

        // Ouvre la galerie pour sélectionner une image
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1], // Rendre l'image carrée
            quality: 0, // Réduire la qualité à 50%
            base64: true, // Encode directement en base64
        });
        

        if (!result.canceled) {
            setPhoto(result.assets[0].uri); // URI de l'image pour l'affichage
            setPhotoBase64(result.assets[0].base64); // Base64 pour le stockage
        }
    };

    const creationCompte = async () => {
        if (!name || !email || !password || !adressePostal || !photoBase64) {
            alert("Veuillez remplir tous les champs et ajouter une photo de profil avant de créer votre compte.");
            return;
        }
    
        try {
            // Création de l'utilisateur
            await auth.createUserWithEmailAndPassword(email, password);
            const user = auth.currentUser;
    
            // Enregistrement dans la base de données
            enregistrementDesUtilisateurs(user.uid, name, email, adressePostal, photoBase64);
    
            // Redirection après l'inscription
            navigation.navigate("Home");
        } catch (error) {
            console.error(error);
            alert("Erreur lors de l'inscription. Veuillez réessayer.");
        }
    };
    

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Créer un compte</Text>

            {/* Sélection et affichage de l'image */}
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {photo ? (
                    <Image source={{ uri: photo }} style={styles.profileImage} />
                ) : (
                    <Text style={styles.imagePickerText}>Ajouter une photo de profil</Text>
                )}
            </TouchableOpacity>

            <TextInput
                style={styles.input}
                placeholder="Nom d'utilisateur"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Adresse Postal"
                value={adressePostal}
                onChangeText={setAdressePostal}
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

            {/* Bouton d'inscription */}
            <TouchableOpacity style={styles.button} onPress={creationCompte} disabled={uploading}>
                <Text style={styles.buttonText}>{uploading ? "Téléversement en cours..." : "S'inscrire"}</Text>
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
    imagePicker: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#ddd",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        overflow: "hidden",
    },
    imagePickerText: {
        fontSize: 14,
        color: "#888",
    },
    profileImage: {
        width: "100%",
        height: "100%",
    },
    button: {
        width: "100%",
        height: 50,
        backgroundColor: "#47b089",
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
        color: "#47b089",
        fontWeight: "bold",
    },
});
