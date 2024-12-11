import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';


export default function CompteScreen() {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <Text>Page du comppte</Text>
            <StatusBar style="auto" />
            <TouchableOpacity
                //style={styles.button}
                onPress={() => navigation.navigate('RegisterScreen')}
            >
                <Text>Nouveau Compte</Text>
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
    title: {
        fontSize: 24,
        marginBottom: 20,
        fontWeight: 'bold',
    }
});
