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
    const [transactionType, setTransactionType] = useState(""); // Type de transaction
    const [locationDuration, setLocationDuration] = useState(""); // Durée de location
    const [uploading, setUploading] = useState(false);
    const [hashtags, setHashtags] = useState([]);
    const [currentHashtag, setCurrentHashtag] = useState("");
    

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

    const ajouterHashtag = () => {
        if (currentHashtag.trim() && !hashtags.includes(currentHashtag.trim())) {
            setHashtags([...hashtags, currentHashtag.trim()]);
            setCurrentHashtag(""); // Réinitialiser l'entrée
        }
    };
    
    const supprimerHashtag = (index) => {
        setHashtags(hashtags.filter((_, i) => i !== index));
    };
    

    const publierAnnonce = async () => {
        if (!auth.currentUser) {
            alert("Vous devez être connecté pour publier une annonce !");
            return;
        }

        // Validation des champs selon le type de transaction
        if (
            !objet ||
            !description ||
            !categorie ||
            !sousCategorie ||
            photos.length === 0 ||
            !transactionType
        ) {
            alert("Veuillez remplir tous les champs et ajouter au moins une photo !");
            return;
        }

        // Validation spécifique pour "Location"
        if (transactionType === "Location" && !locationDuration) {
            alert("Veuillez sélectionner une durée de location !");
            return;
        }

        // Validation spécifique pour "Achat"
        if (transactionType === "Achat" && !prix) {
            alert("Veuillez indiquer un prix !");
            return;
        }

        // Pas de validation supplémentaire pour "Troc" si aucun champ additionnel n'est requis

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
                prix: transactionType === "Achat" || "Location" ? prix : null,
                categorie,
                sousCategorie,
                transactionType,
                locationDuration: transactionType === "Location" ? locationDuration : null,
                dateAjout: new Date().toISOString(),
                hashtags, // Ajout des hashtags ici
            });
            

            alert("Annonce publiée avec succès !");
            setPhotos([]);
            setObjet("");
            setDescription("");
            setPrix("");
            setCategorie("");
            setSousCategorie("");
            setTransactionType("");
            setLocationDuration("");
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
                <View style={styles.hashtagContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Ajouter un hashtag (#)"
                        value={currentHashtag}
                        onChangeText={setCurrentHashtag}
                        onSubmitEditing={ajouterHashtag} // Ajouter le hashtag avec "Enter"
                    />
                    <TouchableOpacity style={styles.addButton} onPress={ajouterHashtag}>
                        <Text style={styles.addButtonText}>Ajouter</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.hashtagList}>
                        {hashtags.map((hashtag, index) => (
                            <View key={index} style={styles.hashtagItem}>
                                <Text style={styles.hashtagText}>{hashtag}</Text>
                                <TouchableOpacity onPress={() => supprimerHashtag(index)}>
                                    <Text style={styles.hashtagRemove}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>

                {transactionType !== "Troc" && (
                    <TextInput
                        style={styles.input}
                        placeholder="Prix (€)"
                        value={prix}
                        onChangeText={setPrix}
                        keyboardType="numeric"
                    />
                )}

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

                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={transactionType}
                        onValueChange={(value) => setTransactionType(value)}
                    >
                        <Picker.Item label="Sélectionner le type de transaction" value="" />
                        <Picker.Item label="Troc" value="Troc" />
                        <Picker.Item label="Achat" value="Achat" />
                        <Picker.Item label="Location" value="Location" />
                    </Picker>
                </View>

                {transactionType === "Location" && (
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={locationDuration}
                            onValueChange={(value) => setLocationDuration(value)}
                        >
                            <Picker.Item label="Sélectionner la durée de location" value="" />
                            <Picker.Item label="Par jour" value="Jour" />
                            <Picker.Item label="Par semaine" value="Semaine" />
                            <Picker.Item label="Par mois" value="Mois" />
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
        overflow: "hidden",
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
    },
    addButton: {
        backgroundColor: "#47b089",
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
        backgroundColor: "#47b089",
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
    hashtagContainer: {
    marginBottom: 20,
    width: "100%",
},
hashtagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
},
hashtagItem: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    marginBottom: 10,
},
hashtagText: {
    fontSize: 14,
    color: "#333",
},
hashtagRemove: {
    marginLeft: 5,
    color: "#ff0000",
    fontWeight: "bold",
},

});
