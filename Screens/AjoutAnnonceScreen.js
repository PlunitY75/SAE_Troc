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
    const [categorie, setCategorie] = useState("");
    const [sousCategorie, setSousCategorie] = useState("");
    const [uploading, setUploading] = useState(false);

    const categories = [
        { label: "Homme", subcategories: ["T-shirts", "Pantalons", "Vestes", "Accessoires"] },
        { label: "Femme", subcategories: ["Robes", "Jupes", "Tops", "Accessoires"] },
        { label: "Enfant", subcategories: ["Pyjamas", "Jeans", "Sweatshirts", "Accessoires"] },
        { label: "Électronique", subcategories: ["Téléphones", "Ordinateurs", "Accessoires", "Autres"] },
        { label: "Maison", subcategories: ["Meubles", "Décoration", "Électroménager", "Autres"] },
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
            quality: 0,
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

        if (!objet || !description || !prix || !categorie || !sousCategorie || photos.length === 0) {
            alert("Veuillez remplir tous les champs et ajouter au moins une photo !");
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
                categorie,
                sousCategorie,
                dateAjout: new Date().toISOString(),
            });

            alert("Annonce publiée avec succès !");
            setPhotos([]);
            setObjet("");
            setDescription("");
            setPrix("");
            setCategorie("");
            setSousCategorie("");
        } catch (error) {
            console.error("Erreur lors de la publication de l'annonce :", error);
            alert("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.title}>Ajouter une annonce</Text>

                <ScrollView horizontal style={styles.photoContainer}>
                    {photos.map((photo, index) => (
                        <Image
                            key={index}
                            source={{ uri: `data:image/png;base64,${photo}` }}
                            style={styles.photo}
                        />
                    ))}
                </ScrollView>

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

                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={categorie}
                        onValueChange={(value) => {
                            setCategorie(value);
                            setSousCategorie(""); // Réinitialiser la sous-catégorie
                        }}
                    >
                        <Picker.Item label="Sélectionner une catégorie" value="" />
                        {categories.map((cat, index) => (
                            <Picker.Item key={index} label={cat.label} value={cat.label} />
                        ))}
                    </Picker>
                </View>

                {categorie && (
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={sousCategorie}
                            onValueChange={(value) => setSousCategorie(value)}
                        >
                            <Picker.Item label="Sélectionner une sous-catégorie" value="" />
                            {categories
                                .find((cat) => cat.label === categorie)
                                ?.subcategories.map((subcat, index) => (
                                    <Picker.Item key={index} label={subcat} value={subcat} />
                                ))}
                        </Picker>
                    </View>
                )}

                <TouchableOpacity style={styles.addButton} onPress={ajouterPhoto}>
                    <Text style={styles.addButtonText}>Ajouter des photos</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.publishButton}
                    onPress={publierAnnonce}
                    disabled={uploading}
                >
                    <Text style={styles.publishButtonText}>
                        {uploading ? "Publication en cours..." : "Publier l'annonce"}
                    </Text>
                </TouchableOpacity>
            </View>

            <StatusBar style="auto" />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flexGrow: 1,
        justifyContent: "flex-start",
        backgroundColor: "#fff",
    },
    formContainer: {
        width: "100%",
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
        flexWrap: "wrap",
    },
    photo: {
        width: 230,
        height: 230,
        borderRadius: 8,
        marginRight: 10,
    },
    pickerContainer: {
        width: "100%",
        height: 50,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        justifyContent: "center",
        //backgroundColor: "#fff",
        overflow: "hidden", // Évite le débordement
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
        backgroundColor: "#fff",
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
        //backgroundColor: "#fff",
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
