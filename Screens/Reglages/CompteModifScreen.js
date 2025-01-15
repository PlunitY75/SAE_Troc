import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image } from "react-native";
import { useState, useEffect } from "react";
import { auth } from "../../Firebase";
import { getDatabase, ref, onValue, update } from "firebase/database";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";

export default function CompteModifScreen() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [adressePostal, setAdressePostal] = useState("");
    const [photo, setPhoto] = useState(null);
    const [photoBase64, setPhotoBase64] = useState(null);
    const [uploading, setUploading] = useState(false);
    

    const navigation = useNavigation();

    const currentUser = auth.currentUser;

    useEffect(() => {
        if (currentUser) {
            const db = getDatabase();
            const userRef = ref(db, `users/${currentUser.uid}`);

            onValue(userRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setName(data.name || "");
                    setEmail(data.email || "");
                    setAdressePostal(data.adressePostal || "");
                    if (data.imageBase64 && data.imageBase64.photoBase64) {
                        setPhoto(`data:image/jpeg;base64,${data.imageBase64.photoBase64}`);
                        setPhotoBase64(data.imageBase64.photoBase64);
                    }
                }
            });
        }
    }, [currentUser]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            alert("Permission d'accéder à la galerie refusée !");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            setPhoto(result.assets[0].uri);
            setPhotoBase64(result.assets[0].base64);
        }
    };

    const modifierCompte = async () => {
        if (!currentUser) {
            alert("Utilisateur non connecté !");
            return;
        }

        setUploading(true);

        try {
            const db = getDatabase();
            const updates = {
                name: name,
                email: email,
                adressePostal: adressePostal,
            };

            if (photoBase64) {
                updates.imageBase64 = { photoBase64: photoBase64 };
            }

            await update(ref(db, `users/${currentUser.uid}`), updates);

            alert("Compte mis à jour avec succès !");
            navigation.navigate("Home");
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la mise à jour. Veuillez réessayer.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Modifier votre compte</Text>

            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {photo ? (
                    <Image source={{ uri: photo }} style={styles.profileImage} />
                ) : (
                    <Text style={styles.imagePickerText}>Changer la photo de profil</Text>
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

            <TouchableOpacity style={styles.button} onPress={modifierCompte} disabled={uploading}>
                <Text style={styles.buttonText}>{uploading ? "Mise à jour..." : "Mettre à jour"}</Text>
            </TouchableOpacity>

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
});
