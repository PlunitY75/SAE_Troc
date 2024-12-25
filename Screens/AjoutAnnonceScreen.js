import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image } from "react-native";
import { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { auth } from "../Firebase";
import { getDatabase, ref, push, set } from "firebase/database";
import * as ImagePicker from "expo-image-picker";

export default function AjoutAnnonceScreen() {
    const [photos, setPhotos] = useState([]);
    const [objet, setObjet] = useState("");
    const [description, setDescription] = useState("");
    const [prix, setPrix] = useState("");
    const [categorie, setCategorie] = useState(""); // État pour la catégorie
    const [uploading, setUploading] = useState(false);

    const categories = [
        "Instruments de musique",
        "Équipements électroniques",
        "Meubles et décoration",
        "Loisirs et sports",
        "Livres, films et jeux vidéo",
        "Vêtements et accessoires",
        "Outils et bricolage",
        "Équipements pour enfants",
        "Véhicules et pièces détachées",
        "Cuisine et électroménager",
        "Jardinage et extérieur",
        "Santé et bien-être",
        "Art et artisanat",
        "Animaux et accessoires",
        "Autres",
    ];

    const ajouterPhoto = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== "granted") {
            alert("Permission d'accéder à la galerie refusée !");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            base64: true,
            quality: 0, // Réduction de la qualité pour optimiser le stockage
        });

        if (!result.canceled) {
            const newPhotos = result.assets.map((asset) => asset.base64);
            setPhotos([...photos, ...newPhotos]);
        }
    };

    const publierAnnonce = async () => {
        if (!auth.currentUser) {
            alert("Vous devez être connecté pour publier une annonce !");
            return;
        }

        if (!objet || !description || !prix || !categorie || photos.length === 0) {
            alert("Veuillez remplir tous les champs, sélectionner une catégorie et ajouter au moins une photo !");
            return;
        }

        setUploading(true);

        try {
            const db = getDatabase();
            const userId = auth.currentUser.uid;

            const newAnnonceRef = push(ref(db, "annonces"));
            await set(newAnnonceRef, {
                userId,
                photos,
                objet,
                description,
                prix,
                categorie, // Inclure la catégorie
                dateAjout: new Date().toISOString(),
            });

            alert("Annonce publiée avec succès !");
            setPhotos([]);
            setObjet("");
            setDescription("");
            setPrix("");
            setCategorie("");
        } catch (error) {
            console.error("Erreur lors de la publication de l'annonce :", error);
            alert("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Ajouter une annonce</Text>

            {/* Afficher les photos ajoutées */}
            <ScrollView horizontal style={styles.photoContainer}>
                {photos.map((photo, index) => (
                    <Image
                        key={index}
                        source={{ uri: `data:image/png;base64,${photo}` }}
                        style={styles.photo}
                    />
                ))}
            </ScrollView>

            {/* Bouton pour ajouter des photos */}
            <TouchableOpacity style={styles.addButton} onPress={ajouterPhoto}>
                <Text style={styles.addButtonText}>Ajouter des photos</Text>
            </TouchableOpacity>

            {/* Champs de formulaire */}
            <TextInput
                style={styles.input}
                placeholder="Nom de l'objet"
                value={objet}
                onChangeText={setObjet}
            />
            <TextInput
                style={styles.textArea}
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                multiline
            />
            <TextInput
                style={styles.input}
                placeholder="Prix à la journée (€)"
                value={prix}
                onChangeText={setPrix}
                keyboardType="numeric"
            />

            {/* Menu déroulant pour sélectionner une catégorie */}
            <Text style={styles.label}>Catégorie</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={categorie}
                    onValueChange={(itemValue) => setCategorie(itemValue)}
                >
                    <Picker.Item label="-- Sélectionnez une catégorie --" value="" />
                    {categories.map((cat, index) => (
                        <Picker.Item key={index} label={cat} value={cat} />
                    ))}
                </Picker>
            </View>

            {/* Bouton pour publier l'annonce */}
            <TouchableOpacity
                style={styles.publishButton}
                onPress={publierAnnonce}
                disabled={uploading}
            >
                <Text style={styles.publishButtonText}>
                    {uploading ? "Publication en cours..." : "Publier l'annonce"}
                </Text>
            </TouchableOpacity>

            <StatusBar style="auto" />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: "#fff",
        padding: 20,
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#333",
    },
    photoContainer: {
        flexDirection: "row",
        marginBottom: 20,
    },
    photo: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 10,
    },
    addButton: {
        backgroundColor: "#007BFF",
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        width: "100%",
        alignItems: "center",
    },
    addButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    input: {
        width: "100%",
        height: 50,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 15,
    },
    textArea: {
        width: "100%",
        height: 100,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 15,
        textAlignVertical: "top",
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
        alignSelf: "flex-start",
    },
    pickerContainer: {
        width: "100%",
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
    },
    publishButton: {
        backgroundColor: "#28A745",
        padding: 15,
        borderRadius: 8,
        width: "100%",
        alignItems: "center",
    },
    publishButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
