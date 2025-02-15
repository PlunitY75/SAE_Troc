import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const Footer = () => {
    return (
        <View style={styles.footer}>


            {/* Informations supplémentaires dans le footer */}
            <View style={styles.footerLinks}>
                <TouchableOpacity>
                    <Text style={styles.footerLink}>Contact</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Text style={styles.footerLink}>À propos</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Text style={styles.footerLink}>Mentions légales</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.socialTitle}>Suivez-nous</Text>
            <View style={styles.socialLinks}>
                <TouchableOpacity>
                    <Text style={styles.socialLink}>Facebook</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Text style={styles.socialLink}>Instagram</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Text style={styles.socialLink}>Twitter</Text>
                </TouchableOpacity>

            </View>
            <Text style={styles.footerText}>© 2025 Troc&Co. Tous droits réservés</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        backgroundColor: '#47b089',
        paddingVertical: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent:'center',
        height: 250
    },
    footerText: {
        color: '#fff',
        fontSize: 23,
        marginTop: 35,

    },
    footerLinks: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    footerLink: {
        color: '#fff',
        fontSize: 14,
        marginHorizontal: 15,
    },
    socialTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    socialLinks: {
        flexDirection: 'row',
    },
    socialLink: {
        color: '#fff',
        fontSize: 14,
        marginHorizontal: 15,
    },
});

export default Footer;
