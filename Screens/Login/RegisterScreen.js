import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View , TouchableOpacity} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useState } from "react";
import { TextInput } from "react-native-gesture-handler";
import { auth } from '../../Firebase'
import { getDatabase, ref, set } from "firebase/database";

function enregistrementDesUtilisateurs(userId, name, email){
    const db = getDatabase();
    set(ref(db, 'users/'+ userId), {
        name : name, 
        email : email, 
        age : age,
    })
}

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    const creationCompte = async () => {
        try{
            await auth.createUserWithEmailAndPassword(email, password);
            const user = auth.currentUser;
            enregistrementDesUtilisateurs(user.uid, name, email);
            await user.updateProfile({
                displayName: name,
            })
        } catch(error){
            console.error(error);
            alert("Erreur lors de l'inscription. Veuillez réessayer")
        };
    }

    return (
        <View style={styles.container}>
            <Text>Page d'inscription</Text>
            <StatusBar style="auto" />
            <TextInput placeholder="Votre nom d'utilisateur" value={name} onChangeText={setName}/>
            <TextInput placeholder="Votre mot de passe" value={password} onChangeText={setPassword}/>
            <TextInput placeholder="Votre email" value={email} onChangeText={setEmail}/>
        
            <TouchableOpacity onPress={creationCompte}>
                <Text>S'inscrire</Text>
            </TouchableOpacity>
        </View>
 

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
});
