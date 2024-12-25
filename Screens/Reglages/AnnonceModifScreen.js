import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useState } from "react";
import { getDatabase, ref, update } from "firebase/database";
import * as ImagePicker from "expo-image-picker";

export default function AnnonceModifScreen() {
    const route = useRoute();
    const { annonce } = route.params;

    const [objet, setObjet] = useState(annonce.objet);
    const [description, setDescription] = useState(annonce.description);
    const [prix, setPrix] = useState(annonce.prix.toString());
    const [photos, setPhotos] = useState(annonce.photos);

    const handleSave = () => {
        if (!annonce.id) {
            alert("Erreur : l'ID de l'annonce est introuvable !");
            return;
        }

        const db = getDatabase();
        const annonceRef = ref(db, `annonces/${annonce.id}`);

        update(annonceRef, {
            objet,
            description,
            prix: parseFloat(prix),
            photos,
        })
            .then(() => alert("Annonce mise à jour avec succès !"))
            .catch((error) => alert("Erreur lors de la mise à jour : " + error.message));
    };

    const ajouterPhoto = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== "granted") {
            alert("Permission d'accéder à la galerie refusée !");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            base64: true,
            quality: 0.7, // Réduction de la qualité pour optimiser le stockage
        });

        if (!result.canceled) {
            // Ajouter la photo sélectionnée à la liste
            const newPhotos = result.assets.map((asset) => asset.base64);
            setPhotos([...photos, ...newPhotos]);
        }
    };

    const supprimerPhoto = (index) => {
        Alert.alert(
            "Supprimer la photo",
            "Êtes-vous sûr de vouloir supprimer cette photo ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    onPress: () => {
                        const updatedPhotos = photos.filter((_, i) => i !== index);
                        setPhotos(updatedPhotos);
                    },
                },
            ],
            { cancelable: true }
        );
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Modifier l'annonce</Text>
            <TextInput
                style={styles.input}
                placeholder="Objet"
                value={objet}
                onChangeText={setObjet}
            />
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                multiline
            />
            <TextInput
                style={styles.input}
                placeholder="Prix par semaine"
                value={prix}
                onChangeText={setPrix}
                keyboardType="numeric"
            />
            <Text style={styles.subtitle}>Photos</Text>
            <ScrollView horizontal style={styles.photosContainer}>
                {photos.map((photo, index) => (
                    <View key={index} style={styles.photoWrapper}>
                        <Image
                            source={{ uri: `data:image/png;base64,${photo}` }}
                            style={styles.photo}
                        />
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => supprimerPhoto(index)}
                        >
                            <Text style={styles.deleteButtonText}>X</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
            <TouchableOpacity style={styles.addPhotoButton} onPress={ajouterPhoto}>
                <Text style={styles.addPhotoButtonText}>Ajouter une photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Enregistrer</Text>
            </TouchableOpacity>
            <StatusBar style="auto" />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f8f9fa",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        backgroundColor: "#fff",
    },
    textArea: {
        height: 100,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    photosContainer: {
        flexDirection: "row",
        marginBottom: 20,
    },
    photoWrapper: {
        position: "relative",
        marginRight: 10,
    },
    photo: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    deleteButton: {
        position: "absolute",
        top: -5,
        right: -5,
        backgroundColor: "red",
        borderRadius: 15,
        width: 20,
        height: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    deleteButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },
    addPhotoButton: {
        backgroundColor: "#6c757d",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 20,
    },
    addPhotoButtonText: {
        color: "#fff",
        fontSize: 16,
    },
    button: {
        backgroundColor: "#007bff",
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
