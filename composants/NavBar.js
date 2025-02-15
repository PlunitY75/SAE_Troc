import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { useNavigation } from '@react-navigation/native';  // Import de useNavigation

const NavBar = () => {
    const navigation = useNavigation();  // Pour la navigation

    return (
        <View style={styles.navbar}>
            <View style={styles.navLinks}>
                {/* On utilise TouchableOpacity pour naviguer entre les pages */}
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Accueil')}>
                    <Text style={{color:'#47b089'}}>Accueil</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('AjoutAnnonce')}>
                    <Text style={{color:'#47b089'}}>Ajouter une annonce</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Messagerie')}>
                    <Text style={{color:'#47b089'}}>Messagerie</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('CompteScreen')}>
                    <Text style={{color:'#47b089'}}>Mon Compte</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    navbar: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    navLogo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#47b089',
        textAlign: 'center',
        marginBottom: 10,
    },
    navLinks: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    navItem: {
        padding: 10,

    },
});

export default NavBar;
